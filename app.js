(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MON_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MS_DAY = 86400000;

  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const dayDiff = (a, b) => Math.round((a - b) / MS_DAY);
  const fmt = d => d.getDate() + ' ' + MON[d.getMonth()];
  const fmtLong = d => DAY_FULL[d.getDay()] + ', ' + fmt(d);
  const sameDay = (a, b) => a.getTime() === b.getTime();
  const list = arr => arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' & ' + arr[arr.length - 1];
  const ord = n => { const v = n % 100, s = ['th', 'st', 'nd', 'rd']; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const store = {
    get(k, def) { try { const v = localStorage.getItem('kard.' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem('kard.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- data ---------- */
  const BANK = Object.fromEntries(BANKS.map(b => [b.id, b]));
  const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

  const catOf = id => CAT[id] || { id, name: id, icon: '🏷️', color: '#6b6358' };
  const ICON = (name, size) => window.KARD_ICON ? window.KARD_ICON(name, size) : '';
  const CFG = window.KARD_CONFIG || {};
  const FAR = 36500; // "no start / no end" sentinel, in days
  let deals = [];

  /* ---------- auth & cloud card sync ----------
     Signed out: cards live in localStorage only (this device).
     Signed in (Google): cards live in the `user_cards` table and follow the
     account to any device, including the mobile app. */
  const sb = (window.supabase && CFG.supabaseUrl && CFG.supabaseAnonKey)
    ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey)
    : null;
  let session = null;
  const fromCardRow = r => ({ id: r.id, bank: r.bank, type: r.card_type, network: r.network || '', name: r.nickname || '', last4: r.last4 || '' });
  const toCardRow = c => ({ user_id: session.user.id, bank: c.bank, card_type: c.type, network: c.network || null, nickname: c.name || null, last4: c.last4 || null });

  // Pulls this account's cards from the cloud. The first time an account with
  // no saved cards signs in on a device that already has local guest cards,
  // those are uploaded once so nothing is lost.
  async function syncCardsFromRemote() {
    if (!sb || !session) return;
    const { data, error } = await sb.from('user_cards').select('*').order('id');
    if (error) { console.warn('Kard: could not load your saved cards.', error); return; }
    if (!data.length && state.cards.length) {
      const { data: inserted, error: insErr } = await sb.from('user_cards').insert(state.cards.map(toCardRow)).select();
      if (!insErr && inserted) { state.cards = inserted.map(fromCardRow); return; }
    }
    state.cards = data.map(fromCardRow);
  }

  const parseDate = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };

  // Normalise a built-in sample deal (relative-day schedules) into the shape the UI uses.
  function fromSample(d, i) {
    const range = d.sched.t === 'range';
    return Object.assign({}, d, {
      id: 's' + i,
      from: addDays(today, range ? d.sched.from : -FAR),
      until: addDays(today, range ? d.sched.to : FAR),
      hasEnd: range,
      types: d.types || ['credit', 'debit']
    });
  }

  // Normalise a row from the Supabase `deals` table.
  function fromRow(r) {
    return {
      id: r.id,
      m: r.merchant,
      c: r.category,
      cities: r.all_cities ? 'all' : (r.cities || []),
      banks: (r.banks || []).filter(b => BANK[b]),
      types: r.card_types && r.card_types.length ? r.card_types : ['credit', 'debit'],
      nets: r.networks && r.networks.length ? r.networks : null,
      offer: r.offer,
      pct: Number(r.discount_pct) || 0,
      max: r.max_discount,
      min: r.min_spend,
      sched: { t: r.schedule_type, days: r.weekdays || [], dates: r.month_dates || [] },
      from: r.start_date ? parseDate(r.start_date) : addDays(today, -FAR),
      until: r.end_date ? parseDate(r.end_date) : addDays(today, FAR),
      hasEnd: !!r.end_date,
      terms: r.terms
    };
  }

  // Load deals from Supabase when configured, otherwise (or on failure) use the built-in samples.
  async function loadDeals() {
    const sample = () => (window.RAW_DEALS || []).map(fromSample);
    if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) return { source: 'sample', deals: sample() };
    try {
      const res = await fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/deals?select=*&active=eq.true&order=id', {
        headers: { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const rows = await res.json();
      return { source: 'db', deals: rows.map(fromRow).filter(d => d.banks.length) };
    } catch (err) {
      console.warn('Kard: could not load deals from Supabase, using sample data.', err);
      return { source: 'fallback', deals: sample() };
    }
  }

  function renderNotice(source) {
    const el = $('#notice');
    const msg = {
      sample: '<strong>Sample data.</strong> The database isn\'t connected, so these are built-in placeholder offers, not live bank deals.',
      fallback: '<strong>Couldn\'t reach the database</strong> — showing built-in sample offers instead. Please try again later.',
      db: CFG.sampleNotice ? '<strong>Sample data.</strong> The offers shown are illustrative placeholders, not live bank deals. Always confirm the offer with the bank or merchant before paying.' : ''
    }[source];
    el.innerHTML = msg || '';
    el.hidden = !msg;
  }

  function occursOn(d, date) {
    if (date < d.from || date > d.until) return false;
    const s = d.sched;
    if (s.t === 'weekly') return s.days.includes(date.getDay());
    if (s.t === 'monthly') return s.dates.includes(date.getDate());
    return true; // daily & range
  }

  function schedLabel(d) {
    const s = d.sched;
    if (s.t === 'daily') return 'Every day';
    if (s.t === 'weekly') return 'Every ' + list(s.days.map(x => DAY[x]));
    if (s.t === 'monthly') return list(s.dates.map(ord)) + ' of every month';
    return fmt(d.from) + ' – ' + fmt(d.until);
  }

  /* ---------- state ---------- */
  const state = {
    cards: store.get('cards', []),
    city: store.get('city', 'all'),
    cat: store.get('cat', 'all'),
    view: store.get('view', 'daily'),
    mine: store.get('mine', true),
    type: 'all',
    bank: 'all',
    sort: 'best',
    q: '',
    anchor: today
  };
  if (!['daily', 'weekly', 'monthly'].includes(state.view)) state.view = 'daily';
  if (state.city !== 'all' && !CITIES.includes(state.city)) state.city = 'all';
  if (state.cat !== 'all' && !CAT[state.cat]) state.cat = 'all';
  if (!Array.isArray(state.cards)) state.cards = [];
  state.cards = state.cards.filter(c => c && BANK[c.bank] && (c.type === 'credit' || c.type === 'debit'));

  const saveCards = () => store.set('cards', state.cards); // guest (signed-out) cache only

  /* ---------- filtering ---------- */
  function matchCards(d) {
    return state.cards.filter(c =>
      d.banks.includes(c.bank) && d.types.includes(c.type) && (!d.nets || d.nets.includes(c.network)));
  }

  const useMine = () => state.mine && state.cards.length > 0;

  function filtered() {
    const q = state.q.trim().toLowerCase();
    const mine = useMine();
    return deals.filter(d => {
      if (state.city !== 'all' && d.cities !== 'all' && !d.cities.includes(state.city)) return false;
      if (state.cat !== 'all' && d.c !== state.cat) return false;
      if (state.type !== 'all' && !d.types.includes(state.type)) return false;
      if (state.bank !== 'all' && !d.banks.includes(state.bank)) return false;
      if (q && !(d.m + ' ' + d.offer + ' ' + catOf(d.c).name).toLowerCase().includes(q)) return false;
      if (mine && !matchCards(d).length) return false;
      return true;
    });
  }

  function sortDeals(arr) {
    const a = arr.slice();
    if (state.sort === 'az') a.sort((x, y) => x.m.localeCompare(y.m));
    else if (state.sort === 'ending') a.sort((x, y) => x.until - y.until || y.pct - x.pct);
    else a.sort((x, y) => y.pct - x.pct || x.m.localeCompare(y.m));
    return a;
  }

  /* ---------- rendering: pieces ---------- */
  function dealCard(d) {
    const cat = catOf(d.c);
    const mine = matchCards(d);
    const mineBanks = new Set(mine.map(c => c.bank));
    const banks = d.banks.slice().sort((a, b) => (mineBanks.has(b) ? 1 : 0) - (mineBanks.has(a) ? 1 : 0));
    const shown = banks.slice(0, 4);
    const bankChips = shown.map(id => {
      const b = BANK[id], has = mineBanks.has(id);
      return `<span class="bank${has ? ' mine' : ''}" style="--bc:${b.color}"><i></i>${esc(b.short)}${has ? ICON('check', 13) : ''}</span>`;
    }).join('') + (banks.length > shown.length ? `<span class="tag">+${banks.length - shown.length}</span>` : '');

    const cities = d.cities === 'all' ? 'All Pakistan'
      : d.cities.length > 3 ? d.cities.slice(0, 3).join(', ') + ' +' + (d.cities.length - 3)
      : d.cities.join(', ');
    const types = d.types.length === 2 ? 'Credit & Debit' : d.types[0] === 'credit' ? 'Credit' : 'Debit';
    const daysLeft = dayDiff(d.until, today);
    const startsIn = dayDiff(d.from, today);
    const timing = startsIn > 0 ? `<span class="tag">Starts in ${plural(startsIn, 'day')}</span>`
      : !d.hasEnd ? ''
      : daysLeft < 0 ? '<span class="tag end">Expired</span>'
      : daysLeft <= 5 ? `<span class="tag end">${daysLeft === 0 ? 'Ends today' : 'Ends in ' + plural(daysLeft, 'day')}</span>`
      : `<span class="tag">Valid till ${fmt(d.until)}</span>`;
    const limits = [d.max && 'Max ' + d.max, d.min && 'Min spend ' + d.min].filter(Boolean).join(' · ');

    // "15% off" → big "15%" + "off"; "Rs 4/L off" → "Rs 4/L" + "off"; anything else stays whole.
    const om = /^(\d+(?:\.\d+)?%|Rs\s?[\d,]+(?:\/\w+)?)\s*(.*)$/.exec(d.offer || '');
    const offer = om
      ? `<b>${esc(om[1])}</b>${om[2] ? `<span>${esc(om[2])}</span>` : ''}`
      : `<b class="words">${esc(d.offer)}</b>`;

    return `<article class="deal${mine.length ? ' match' : ''}" style="--cc:${cat.color}">
      <div class="deal-top">
        <div class="offer">${offer}</div>
        <div class="avatar" title="${esc(cat.name)}">${ICON(cat.id, 20)}</div>
      </div>
      <div class="deal-id"><h3>${esc(d.m)}</h3><div class="cat">${esc(cat.name)}</div></div>
      <ul class="facts">
        <li>${ICON('calendar', 15)}${esc(schedLabel(d))}</li>
        <li>${ICON('pin', 15)}${esc(cities)}</li>
        ${limits ? `<li>${ICON('coins', 15)}${esc(limits)}</li>` : ''}
      </ul>
      <div class="tags">${bankChips}<span class="tag">${types}${d.nets ? ' · ' + esc(d.nets.join('/')) + ' only' : ''}</span>${timing}</div>
      <details><summary>Terms</summary><p>${esc(d.terms || 'See merchant for details.')}</p></details>
    </article>`;
  }

  const grid = arr => `<div class="grid">${arr.map(dealCard).join('')}</div>`;

  function emptyState(msg) {
    const hasFilters = state.city !== 'all' || state.cat !== 'all' || state.type !== 'all' || state.bank !== 'all' || state.q || useMine();
    return `<div class="empty"><p>${msg}</p>${hasFilters ? '<button class="btn" data-act="clear">Clear filters</button>' : ''}</div>`;
  }

  function summary(n, label) {
    const where = state.city === 'all' ? 'across Pakistan' : 'in ' + state.city;
    const whom = useMine() ? 'for your cards' : 'from all banks';
    return `${plural(n, 'deal')} ${label} ${where}, ${whom}`;
  }

  function navHead(title, sub, prevAct, nextAct, todayLabel) {
    return `<div class="vhead">
      <div><h2>${title}</h2><div class="sub">${sub}</div></div>
      <div class="nav">
        <button class="btn sm icon" data-act="${prevAct}" aria-label="Previous">${ICON('left', 16)}</button>
        <button class="btn sm" data-act="today">${todayLabel}</button>
        <button class="btn sm icon" data-act="${nextAct}" aria-label="Next">${ICON('right', 16)}</button>
      </div>
    </div>`;
  }

  /* ---------- rendering: views ---------- */
  function viewDaily() {
    const day = state.anchor;
    const all = sortDeals(filtered().filter(d => occursOn(d, day)));
    const special = all.filter(d => d.sched.t !== 'daily');
    const every = all.filter(d => d.sched.t === 'daily');
    const title = sameDay(day, today) ? 'Today · ' + fmtLong(day) : fmtLong(day);
    let html = navHead(title, summary(all.length, 'on'), 'prev-day', 'next-day', 'Today');
    if (!all.length) return html + emptyState('No deals match on this day. Try another day or loosen the filters.');
    if (special.length) html += `<h3 class="section-h">Only ${sameDay(day, today) ? 'today' : 'this day'} <small>${special.length}</small></h3>` + grid(special);
    if (every.length) html += `<h3 class="section-h">Everyday offers <small>${every.length}</small></h3>` + grid(every);
    return html;
  }

  const mondayOf = d => addDays(d, -((d.getDay() + 6) % 7));

  function viewWeekly() {
    const start = mondayOf(state.anchor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const base = sortDeals(filtered());
    const perDay = days.map(d => base.filter(x => x.sched.t !== 'daily' && occursOn(x, d)));
    const every = base.filter(x => x.sched.t === 'daily' && days.some(d => occursOn(x, d)));
    const total = new Set(perDay.flat().concat(every).map(d => d.id)).size;
    const title = `${fmt(days[0])} – ${fmt(days[6])}` + (days.some(d => sameDay(d, today)) ? ' · This week' : '');
    let html = navHead(title, summary(total, 'this week'), 'prev-week', 'next-week', 'This week');
    if (!total) return html + emptyState('No deals match this week. Try another week or loosen the filters.');
    if (every.length) html += `<h3 class="section-h">Every day this week <small>${every.length}</small></h3>` + grid(every);
    html += '<h3 class="section-h">Day by day</h3><div class="week">' + days.map((d, i) => {
      const items = perDay[i];
      return `<section class="day-col${sameDay(d, today) ? ' today' : ''}">
        <h3>${DAY_FULL[d.getDay()]} <small>${fmt(d)} · ${items.length}</small></h3>
        ${items.length ? items.map(dealCard).join('') : '<p class="muted small">No day-specific deals.</p>'}
      </section>`;
    }).join('') + '</div>';
    return html;
  }

  function viewMonthly() {
    const y = state.anchor.getFullYear(), m = state.anchor.getMonth();
    const first = new Date(y, m, 1);
    const count = new Date(y, m + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7;
    const base = sortDeals(filtered());
    const perDay = {};
    for (let n = 1; n <= count; n++) perDay[n] = base.filter(d => occursOn(d, new Date(y, m, n)));

    const monthDeals = base.filter(d => d.from <= new Date(y, m, count) && d.until >= first);
    let html = navHead(`${MON_FULL[m]} ${y}`, summary(monthDeals.length, 'this month'), 'prev-month', 'next-month', 'This month');

    let cells = '<div class="cal-head">' + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div>${d}</div>`).join('') + '</div><div class="cal">';
    for (let i = 0; i < lead; i++) cells += '<div class="cell blank"></div>';
    for (let n = 1; n <= count; n++) {
      const date = new Date(y, m, n);
      const special = perDay[n].filter(d => d.sched.t !== 'daily');
      const cls = ['cell', sameDay(date, today) ? 'today' : '', date < today ? 'past' : ''].join(' ');
      cells += `<button class="${cls}" data-act="pick" data-d="${n}" aria-pressed="${n === state.anchor.getDate()}" aria-label="${fmt(date)}: ${perDay[n].length} deals">
        <span class="n">${n}</span>
        ${special.slice(0, 2).map(d => `<span class="c">${esc(d.m)}</span>`).join('')}
        ${special.length > 2 ? `<span class="c">+${special.length - 2} more</span>` : ''}
        <span class="count">${perDay[n].length || ''}</span>
      </button>`;
    }
    html += cells + '</div>';

    const sel = state.anchor, selDeals = perDay[sel.getDate()];
    const everyN = selDeals.filter(d => d.sched.t === 'daily').length;
    html += `<h3 class="section-h">${fmtLong(sel)} <small>${plural(selDeals.length, 'deal')}${everyN ? ` (${everyN} every-day)` : ''}</small></h3>`;
    html += selDeals.length ? grid(selDeals) : emptyState('No deals on this day.');

    const recurring = monthDeals.filter(d => d.sched.t === 'monthly' || d.sched.t === 'range');
    if (recurring.length) html += `<h3 class="section-h">Monthly &amp; limited-period offers <small>${recurring.length}</small></h3>` + grid(recurring);
    return html;
  }

  /* ---------- rendering: chrome ---------- */
  function renderAuth() {
    const el = $('#auth');
    if (!sb) { el.innerHTML = ''; return; }
    if (session) {
      const u = session.user, name = u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name);
      const avatar = u.user_metadata && u.user_metadata.avatar_url;
      el.innerHTML = `<span class="who">${avatar ? `<img src="${esc(avatar)}" alt="" referrerpolicy="no-referrer">` : ''}Synced as ${esc(name || u.email)}</span>
        <button class="btn sm" data-act="sign-out">Sign out</button>`;
    } else {
      el.innerHTML = `<button class="btn sm" data-act="sign-in-google"><svg viewBox="0 0 18 18" width="15" height="15" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"/></svg>Sign in with Google</button>`;
    }
  }

  function renderWallet() {
    const w = $('#wallet');
    if (!state.cards.length) {
      w.innerHTML = `<div class="empty-wallet"><span>Add your debit and credit cards to see only the deals you can actually use.${sb && !session ? ' Sign in with Google (above) to sync them across devices.' : ''}</span>
        <div class="empty-actions"><button class="btn primary sm" data-act="add-card">Add a card</button>
        <button class="btn sm ghost" data-act="demo-cards">Try with sample cards</button></div></div>`;
      return;
    }
    w.innerHTML = state.cards.map(c => {
      const b = BANK[c.bank];
      return `<div class="card" style="--bc:${b.color}">
        <button class="x" data-act="del-card" data-id="${c.id}" aria-label="Remove ${esc(b.name)} card">${ICON('x', 14)}</button>
        <div class="card-top"><b>${esc(b.name)}</b><span class="type">${c.type === 'credit' ? 'Credit' : 'Debit'}</span></div>
        <span class="chip-ic" aria-hidden="true"></span>
        <div class="meta"><span class="num">${c.last4 ? '•••• ' + esc(c.last4) : esc(c.name || '')}</span><span class="net">${esc(c.network || '')}</span></div>
        ${c.name && c.last4 ? `<span class="nick">${esc(c.name)}</span>` : ''}
      </div>`;
    }).join('') + `<button class="card add" data-act="add-card">${ICON('plus', 22)}<span>Add card</span></button>`;
  }

  function renderFilters() {
    $('#cats').innerHTML = [{ id: 'all', name: 'All' }].concat(CATEGORIES).map(c =>
      `<button class="chip" data-act="cat" data-id="${c.id}" aria-pressed="${state.cat === c.id}">${ICON(c.id, 16)}${esc(c.name)}</button>`).join('');
    const mine = $('#mine');
    mine.checked = useMine();
    mine.disabled = !state.cards.length;
    $('#mine-label').textContent = state.cards.length ? 'Only deals for my cards' : 'Only deals for my cards (add a card first)';
  }

  function renderView() {
    document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === state.view)));
    $('#view').innerHTML = { daily: viewDaily, weekly: viewWeekly, monthly: viewMonthly }[state.view]();
  }

  function render() { renderAuth(); renderWallet(); renderFilters(); renderView(); }

  /* ---------- controls ---------- */
  function initControls() {
    $('#city').innerHTML = '<option value="all">All cities</option>' + CITIES.map(c => `<option>${c}</option>`).join('');
    $('#bank').innerHTML = '<option value="all">All banks</option>' + BANKS.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('');
    $('#f-bank').innerHTML = BANKS.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('');
    $('#city').value = state.city;

    $('#city').addEventListener('change', e => { state.city = e.target.value; store.set('city', state.city); renderView(); });
    $('#bank').addEventListener('change', e => { state.bank = e.target.value; renderView(); });
    $('#ctype').addEventListener('change', e => { state.type = e.target.value; renderView(); });
    $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderView(); });
    $('#q').addEventListener('input', e => { state.q = e.target.value; renderView(); });
    $('#mine').addEventListener('change', e => { state.mine = e.target.checked; store.set('mine', state.mine); renderView(); });

    const dlg = $('#card-dialog'), form = $('#card-form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(form);
      const last4 = String(fd.get('last4') || '').trim();
      const card = {
        id: Date.now(),
        bank: fd.get('bank'),
        type: fd.get('type'),
        network: fd.get('network'),
        name: String(fd.get('name') || '').trim().slice(0, 30),
        last4: /^\d{4}$/.test(last4) ? last4 : ''
      };
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      if (sb && session) {
        const { data, error } = await sb.from('user_cards').insert(toCardRow(card)).select();
        if (error) { alert('Could not save this card: ' + error.message); btn.disabled = false; return; }
        state.cards.push(fromCardRow(data[0]));
      } else {
        state.cards.push(card);
        saveCards();
      }
      btn.disabled = false;
      form.reset();
      dlg.close();
      render();
    });

    document.addEventListener('click', async e => {
      const t = e.target.closest('[data-act]');
      if (!t) return;
      const a = t.dataset.act;
      const A = state.anchor;
      switch (a) {
        case 'add-card': dlg.showModal(); break;
        case 'cancel-card': form.reset(); dlg.close(); break;
        case 'demo-cards': {
          const demo = [
            { id: Date.now(), bank: 'hbl', type: 'credit', network: 'Visa', name: 'Platinum', last4: '' },
            { id: Date.now() + 1, bank: 'ubl', type: 'debit', network: 'Mastercard', name: '', last4: '' },
            { id: Date.now() + 2, bank: 'meezan', type: 'debit', network: 'PayPak', name: '', last4: '' }
          ];
          if (sb && session) {
            const { data, error } = await sb.from('user_cards').insert(demo.map(toCardRow)).select();
            if (error) { alert('Could not add sample cards: ' + error.message); break; }
            state.cards.push(...data.map(fromCardRow));
          } else {
            state.cards.push(...demo);
            saveCards();
          }
          render(); break;
        }
        case 'del-card':
          if (sb && session) {
            const { error } = await sb.from('user_cards').delete().eq('id', t.dataset.id);
            if (error) { alert('Could not remove this card: ' + error.message); break; }
          }
          state.cards = state.cards.filter(c => String(c.id) !== t.dataset.id);
          if (!(sb && session)) saveCards();
          render(); break;
        case 'sign-in-google':
          if (sb) sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } });
          break;
        case 'sign-out':
          if (sb) await sb.auth.signOut();
          break;
        case 'view': state.view = t.dataset.v; store.set('view', state.view); renderView(); break;
        case 'cat': state.cat = t.dataset.id; store.set('cat', state.cat); renderFilters(); renderView(); break;
        case 'clear':
          state.city = 'all'; state.cat = 'all'; state.type = 'all'; state.bank = 'all'; state.q = ''; state.mine = false;
          store.set('city', 'all'); store.set('cat', 'all'); store.set('mine', false);
          $('#city').value = 'all'; $('#bank').value = 'all'; $('#ctype').value = 'all'; $('#q').value = '';
          renderFilters(); renderView(); break;
        case 'prev-day': state.anchor = addDays(A, -1); renderView(); break;
        case 'next-day': state.anchor = addDays(A, 1); renderView(); break;
        case 'prev-week': state.anchor = addDays(A, -7); renderView(); break;
        case 'next-week': state.anchor = addDays(A, 7); renderView(); break;
        case 'prev-month': case 'next-month': {
          const off = a === 'prev-month' ? -1 : 1;
          const last = new Date(A.getFullYear(), A.getMonth() + off + 1, 0).getDate();
          state.anchor = new Date(A.getFullYear(), A.getMonth() + off, Math.min(A.getDate(), last));
          renderView(); break;
        }
        case 'today': state.anchor = today; renderView(); break;
        case 'pick': state.anchor = new Date(A.getFullYear(), A.getMonth(), +t.dataset.d); renderView(); break;
      }
    });
  }

  initControls();
  renderAuth();
  renderWallet();
  renderFilters();
  $('#view').innerHTML = '<div class="empty"><p>Loading deals…</p></div>';
  loadDeals().then(({ source, deals: loaded }) => {
    deals = loaded;
    renderNotice(source);
    renderView();
  });

  if (sb) {
    sb.auth.getSession().then(({ data }) => {
      session = data.session;
      if (!session) { renderAuth(); return; }
      syncCardsFromRemote().then(render);
    });
    sb.auth.onAuthStateChange((event, sess) => {
      if (event === 'INITIAL_SESSION') return; // handled by getSession() above
      session = sess;
      if (event === 'SIGNED_IN') syncCardsFromRemote().then(render);
      else if (event === 'SIGNED_OUT') { state.cards = store.get('cards', []); render(); }
    });
  }
})();
