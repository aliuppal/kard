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
    get(k, def) { try { const v = localStorage.getItem('dcpk.' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem('dcpk.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- data ---------- */
  const BANK = Object.fromEntries(BANKS.map(b => [b.id, b]));
  const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

  const deals = RAW_DEALS.map((d, i) => {
    let from = addDays(today, -60);
    let until = addDays(today, d.until != null ? d.until : 45);
    if (d.sched.t === 'range') {
      from = addDays(today, d.sched.from);
      until = addDays(today, d.sched.to);
    }
    return Object.assign({}, d, { id: i, from, until, types: d.types || ['credit', 'debit'] });
  });

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

  const saveCards = () => store.set('cards', state.cards);

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
      if (q && !(d.m + ' ' + d.offer + ' ' + CAT[d.c].name).toLowerCase().includes(q)) return false;
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
    const cat = CAT[d.c];
    const mine = matchCards(d);
    const mineBanks = new Set(mine.map(c => c.bank));
    const banks = d.banks.slice().sort((a, b) => (mineBanks.has(b) ? 1 : 0) - (mineBanks.has(a) ? 1 : 0));
    const shown = banks.slice(0, 4);
    const bankChips = shown.map(id => {
      const b = BANK[id], has = mineBanks.has(id);
      return `<span class="bank${has ? ' mine' : ''}" style="--bc:${b.color}"><i></i>${esc(b.short)}${has ? ' ✓' : ''}</span>`;
    }).join('') + (banks.length > shown.length ? `<span class="tag">+${banks.length - shown.length}</span>` : '');

    const cities = d.cities === 'all' ? 'All Pakistan'
      : d.cities.length > 3 ? d.cities.slice(0, 3).join(', ') + ' +' + (d.cities.length - 3)
      : d.cities.join(', ');
    const types = d.types.length === 2 ? 'Credit & Debit' : d.types[0] === 'credit' ? 'Credit' : 'Debit';
    const daysLeft = dayDiff(d.until, today);
    const startsIn = dayDiff(d.from, today);
    const timing = startsIn > 0 ? `<span class="tag">Starts in ${plural(startsIn, 'day')}</span>`
      : daysLeft <= 5 ? `<span class="tag end">${daysLeft === 0 ? 'Ends today' : 'Ends in ' + plural(daysLeft, 'day')}</span>`
      : `<span class="tag">Valid till ${fmt(d.until)}</span>`;
    const limits = [d.max && 'Max ' + d.max, d.min && 'Min spend ' + d.min].filter(Boolean).join(' · ');

    return `<article class="deal${mine.length ? ' match' : ''}">
      <div class="deal-top">
        <div class="avatar" style="--cc:${cat.color}" title="${esc(cat.name)}">${cat.icon}</div>
        <div><h3>${esc(d.m)}</h3><div class="cat">${esc(cat.name)}</div></div>
        <div class="offer">${esc(d.offer)}</div>
      </div>
      <div class="facts">
        <span>🗓 ${esc(schedLabel(d))}</span>
        <span>📍 ${esc(cities)}</span>
        ${limits ? `<span>💰 ${esc(limits)}</span>` : ''}
      </div>
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
        <button class="btn sm" data-act="${prevAct}" aria-label="Previous">‹</button>
        <button class="btn sm" data-act="today">${todayLabel}</button>
        <button class="btn sm" data-act="${nextAct}" aria-label="Next">›</button>
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
  function renderWallet() {
    const w = $('#wallet');
    if (!state.cards.length) {
      w.innerHTML = `<div class="empty-wallet"><span>Add your debit and credit cards to see only the deals you can actually use.</span>
        <button class="btn primary sm" data-act="add-card">＋ Add a card</button>
        <button class="btn sm" data-act="demo-cards">Try with sample cards</button></div>`;
      return;
    }
    w.innerHTML = state.cards.map(c => {
      const b = BANK[c.bank];
      return `<div class="card" style="--bc:${b.color}">
        <button class="x" data-act="del-card" data-id="${c.id}" aria-label="Remove ${esc(b.name)} card">×</button>
        <b>${esc(b.name)}</b>
        <div class="meta"><span>${c.type === 'credit' ? 'Credit' : 'Debit'} · ${esc(c.network || '')}</span><span>${c.last4 ? '•••• ' + esc(c.last4) : ''}</span></div>
        ${c.name ? `<div class="meta"><span>${esc(c.name)}</span></div>` : ''}
      </div>`;
    }).join('');
  }

  function renderFilters() {
    $('#cats').innerHTML = [{ id: 'all', name: 'All categories', icon: '✨' }].concat(CATEGORIES).map(c =>
      `<button class="chip" data-act="cat" data-id="${c.id}" aria-pressed="${state.cat === c.id}">${c.icon} ${esc(c.name)}</button>`).join('');
    const mine = $('#mine');
    mine.checked = useMine();
    mine.disabled = !state.cards.length;
    $('#mine-label').textContent = state.cards.length ? 'Only deals for my cards' : 'Only deals for my cards (add a card first)';
  }

  function renderView() {
    document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === state.view)));
    $('#view').innerHTML = { daily: viewDaily, weekly: viewWeekly, monthly: viewMonthly }[state.view]();
  }

  function render() { renderWallet(); renderFilters(); renderView(); }

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
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const last4 = String(fd.get('last4') || '').trim();
      state.cards.push({
        id: Date.now(),
        bank: fd.get('bank'),
        type: fd.get('type'),
        network: fd.get('network'),
        name: String(fd.get('name') || '').trim().slice(0, 30),
        last4: /^\d{4}$/.test(last4) ? last4 : ''
      });
      saveCards();
      form.reset();
      dlg.close();
      render();
    });

    document.addEventListener('click', e => {
      const t = e.target.closest('[data-act]');
      if (!t) return;
      const a = t.dataset.act;
      const A = state.anchor;
      switch (a) {
        case 'add-card': dlg.showModal(); break;
        case 'cancel-card': form.reset(); dlg.close(); break;
        case 'demo-cards':
          state.cards.push(
            { id: Date.now(), bank: 'hbl', type: 'credit', network: 'Visa', name: 'Platinum', last4: '' },
            { id: Date.now() + 1, bank: 'ubl', type: 'debit', network: 'Mastercard', name: '', last4: '' },
            { id: Date.now() + 2, bank: 'meezan', type: 'debit', network: 'PayPak', name: '', last4: '' });
          saveCards(); render(); break;
        case 'del-card':
          state.cards = state.cards.filter(c => String(c.id) !== t.dataset.id);
          saveCards(); render(); break;
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
  render();
})();
