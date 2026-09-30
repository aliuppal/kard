(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const NETWORKS = ['Visa', 'Mastercard', 'UnionPay', 'PayPak'];
  const BANK = Object.fromEntries(BANKS.map(b => [b.id, b]));
  const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
  const CFG = window.KARD_CONFIG || {};
  const app = $('#app');
  const dlg = $('#deal-dialog');

  const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const fmtDate = s => { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); return d + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] + ' ' + y; };
  const ord = n => { const v = n % 100, s = ['th', 'st', 'nd', 'rd']; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const join = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' & ' + a[a.length - 1];

  let sb = null, session = null, deals = [];
  const filters = { q: '', cat: 'all', status: 'all' };

  /* ---------- setup guard ---------- */
  if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) {
    app.innerHTML = `<div class="card-box"><h2>Connect Supabase first</h2>
      <p>Set <code>supabaseUrl</code> and <code>supabaseAnonKey</code> in <code>config.js</code>, run <code>supabase/schema.sql</code> in the Supabase SQL editor, then reload.</p></div>`;
    return;
  }
  if (!window.supabase) {
    app.innerHTML = '<div class="card-box"><h2>Couldn\'t load the Supabase library</h2><p>Check your internet connection and reload.</p></div>';
    return;
  }
  sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);

  /* ---------- routing ---------- */
  async function route() {
    const { data } = await sb.auth.getSession();
    session = data.session;
    $('#who').hidden = $('#signout').hidden = !session;
    if (session) $('#who').textContent = session.user.email;
    if (!session) return renderLogin();

    app.innerHTML = '<div class="empty"><p>Checking access…</p></div>';
    const { data: ok, error } = await sb.rpc('is_admin');
    if (error) return renderError('Could not verify admin access. Has supabase/schema.sql been run?', error);
    if (!ok) return renderDenied();
    await refresh();
  }

  function renderError(msg, err) {
    app.innerHTML = `<div class="card-box"><h2>Something went wrong</h2><p>${esc(msg)}</p>${err ? `<pre>${esc(err.message || err)}</pre>` : ''}
      <button class="btn" data-act="retry">Try again</button></div>`;
  }

  function renderLogin(msg) {
    app.innerHTML = `<form id="login" class="card-box login" autocomplete="on">
      <h2>Admin sign in</h2>
      <button type="button" class="btn google-btn" data-act="google">
        <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"/></svg>
        Continue with Google
      </button>
      <div class="or"><span>or</span></div>
      <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="username"></label>
      <label class="field"><span>Password</span><input name="password" type="password" required autocomplete="current-password"></label>
      <p class="form-err" id="login-err" role="alert">${esc(msg || '')}</p>
      <button class="btn primary" type="submit">Sign in</button>
      <p class="muted small">Signing in doesn't grant admin access by itself — an account still needs to be added to <code>public.admins</code> (see <code>supabase/schema.sql</code>).</p>
    </form>`;
    $('[data-act=google]').addEventListener('click', () => {
      sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } });
    });
    $('#login').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const btn = e.target.querySelector('button[type=submit]');
      btn.disabled = true;
      const { error } = await sb.auth.signInWithPassword({ email: String(fd.get('email')).trim(), password: String(fd.get('password')) });
      btn.disabled = false;
      if (error) { $('#login-err').textContent = error.message; return; }
      route();
    });
  }

  function renderDenied() {
    const id = session.user.id;
    app.innerHTML = `<div class="card-box"><h2>Signed in, but not an admin</h2>
      <p><strong>${esc(session.user.email)}</strong> doesn't have admin access. To grant it, run this in the Supabase SQL editor:</p>
      <pre>insert into public.admins (user_id) values ('${esc(id)}')
on conflict do nothing;</pre>
      <p>Then reload this page.</p>
      <button class="btn" data-act="retry">Reload</button></div>`;
  }

  /* ---------- data ---------- */
  async function refresh() {
    const { data, error } = await sb.from('deals').select('*').order('id', { ascending: false });
    if (error) return renderError('Could not load deals.', error);
    deals = data;
    renderDash();
  }

  function schedLabel(d) {
    if (d.schedule_type === 'daily') return 'Every day';
    if (d.schedule_type === 'weekly') return 'Every ' + join(DAY_ORDER.filter(x => d.weekdays.includes(x)).map(x => DAY[x]));
    if (d.schedule_type === 'monthly') return join(d.month_dates.slice().sort((a, b) => a - b).map(ord)) + ' of month';
    return fmtDate(d.start_date) + ' – ' + fmtDate(d.end_date);
  }
  const isExpired = d => d.end_date && d.end_date < todayIso();

  /* ---------- dashboard ---------- */
  function visible() {
    const q = filters.q.trim().toLowerCase();
    return deals.filter(d => {
      if (filters.cat !== 'all' && d.category !== filters.cat) return false;
      if (filters.status === 'active' && !(d.active && !isExpired(d))) return false;
      if (filters.status === 'inactive' && d.active) return false;
      if (filters.status === 'expired' && !isExpired(d)) return false;
      if (q && !(d.merchant + ' ' + d.offer).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function renderDash() {
    const active = deals.filter(d => d.active && !isExpired(d)).length;
    const expired = deals.filter(isExpired).length;
    app.innerHTML = `
      <div class="stats">
        <div><b>${deals.length}</b><span>Total deals</span></div>
        <div><b>${active}</b><span>Live now</span></div>
        <div><b>${deals.filter(d => !d.active).length}</b><span>Hidden</span></div>
        <div><b>${expired}</b><span>Expired</span></div>
      </div>
      <div class="panel toolbar">
        <label class="field grow"><span>Search</span><input id="a-q" type="search" placeholder="Merchant or offer" value="${esc(filters.q)}"></label>
        <label class="field"><span>Category</span><select id="a-cat"><option value="all">All</option>${CATEGORIES.map(c => `<option value="${c.id}"${filters.cat === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Status</span><select id="a-status">${[['all', 'All'], ['active', 'Live'], ['inactive', 'Hidden'], ['expired', 'Expired']].map(([v, l]) => `<option value="${v}"${filters.status === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="toolbar-btns">
          <button class="btn" data-act="export">Export JSON</button>
          <button class="btn primary" data-act="new"><span class="plus" aria-hidden="true"></span>New deal</button>
        </div>
      </div>
      <div id="table-wrap"></div>`;
    $('#a-q').addEventListener('input', e => { filters.q = e.target.value; renderTable(); });
    $('#a-cat').addEventListener('change', e => { filters.cat = e.target.value; renderTable(); });
    $('#a-status').addEventListener('change', e => { filters.status = e.target.value; renderTable(); });
    renderTable();
  }

  function renderTable() {
    const rows = visible();
    if (!rows.length) {
      $('#table-wrap').innerHTML = `<div class="empty"><p>${deals.length ? 'No deals match these filters.' : 'No deals yet. Run supabase/seed.sql for samples, or add your first deal.'}</p></div>`;
      return;
    }
    $('#table-wrap').innerHTML = `<table class="tbl"><thead><tr>
      <th>Merchant</th><th>Offer</th><th>Banks</th><th>Where</th><th>When</th><th>Live</th><th></th></tr></thead><tbody>` +
      rows.map(d => {
        const cat = CAT[d.category] || { icon: '🏷️', name: d.category };
        const banks = d.banks.map(b => (BANK[b] ? BANK[b].short : b)).join(', ');
        const where = d.all_cities ? 'All Pakistan' : d.cities.length > 2 ? d.cities.slice(0, 2).join(', ') + ' +' + (d.cities.length - 2) : d.cities.join(', ');
        return `<tr class="${d.active ? '' : 'off'}">
          <td data-l="Merchant"><b>${esc(d.merchant)}</b><br><span class="muted small cat-cell">${window.KARD_ICON ? KARD_ICON(d.category, 14) : cat.icon} ${esc(cat.name)}</span></td>
          <td data-l="Offer">${esc(d.offer)}${d.discount_pct ? `<br><span class="muted small">${Number(d.discount_pct)}%</span>` : ''}</td>
          <td data-l="Banks">${esc(banks)}<br><span class="muted small">${esc(d.card_types.join(' & '))}${d.networks && d.networks.length ? ' · ' + esc(d.networks.join('/')) : ''}</span></td>
          <td data-l="Where">${esc(where)}</td>
          <td data-l="When">${esc(schedLabel(d))}${isExpired(d) ? ' <span class="tag end">Expired</span>' : ''}${d.schedule_type !== 'range' && d.end_date ? `<br><span class="muted small">until ${esc(fmtDate(d.end_date))}</span>` : ''}</td>
          <td data-l="Live"><label class="switch"><input type="checkbox" data-act="toggle" data-id="${d.id}" ${d.active ? 'checked' : ''} aria-label="Live"><i></i></label></td>
          <td class="acts"><button class="btn sm" data-act="edit" data-id="${d.id}">Edit</button>
            <button class="btn sm" data-act="dup" data-id="${d.id}">Duplicate</button>
            <button class="btn sm danger" data-act="del" data-id="${d.id}">Delete</button></td>
        </tr>`;
      }).join('') + '</tbody></table>';
  }

  /* ---------- deal form ---------- */
  const checks = (name, items, selected, extra = '') => items.map(([v, l]) =>
    `<label class="cb"><input type="checkbox" name="${name}" value="${esc(v)}"${selected.includes(v) ? ' checked' : ''}${extra}><span>${esc(l)}</span></label>`).join('');

  function openForm(deal) {
    const d = Object.assign({
      merchant: '', category: CATEGORIES[0].id, all_cities: false, cities: [], banks: [], card_types: ['credit', 'debit'], networks: [],
      offer: '', discount_pct: 0, max_discount: '', min_spend: '', schedule_type: 'weekly', weekdays: [], month_dates: [],
      start_date: '', end_date: '', terms: '', active: true
    }, deal || {});
    d.networks = d.networks || [];
    const editing = deal && deal.id;
    dlg.innerHTML = `<form id="deal-form" autocomplete="off">
      <h2>${editing ? 'Edit deal' : 'New deal'}</h2>
      <div class="two">
        <label class="field"><span>Merchant *</span><input name="merchant" required maxlength="120" value="${esc(d.merchant)}"></label>
        <label class="field"><span>Category *</span><select name="category">${CATEGORIES.map(c => `<option value="${c.id}"${d.category === c.id ? ' selected' : ''}>${c.icon} ${esc(c.name)}</option>`).join('')}</select></label>
      </div>
      <div class="two">
        <label class="field"><span>Offer headline * <em>(e.g. 20% off)</em></span><input name="offer" required maxlength="60" value="${esc(d.offer)}"></label>
        <label class="field"><span>Discount % <em>(for sorting)</em></span><input name="discount_pct" type="number" min="0" max="100" step="any" value="${esc(d.discount_pct)}"></label>
      </div>
      <div class="two">
        <label class="field"><span>Max discount <em>(optional)</em></span><input name="max_discount" placeholder="Rs 1,500" value="${esc(d.max_discount)}"></label>
        <label class="field"><span>Min spend <em>(optional)</em></span><input name="min_spend" placeholder="Rs 5,000" value="${esc(d.min_spend)}"></label>
      </div>

      <fieldset><legend>Banks *</legend><div class="cbs">${checks('banks', BANKS.map(b => [b.id, b.name]), d.banks)}</div></fieldset>
      <fieldset><legend>Card type *</legend><div class="cbs">${checks('card_types', [['credit', 'Credit'], ['debit', 'Debit']], d.card_types)}</div></fieldset>
      <fieldset><legend>Card network <em>(none ticked = any network)</em></legend><div class="cbs">${checks('networks', NETWORKS.map(n => [n, n]), d.networks)}</div></fieldset>

      <fieldset><legend>Cities *</legend>
        <label class="cb all"><input type="checkbox" name="all_cities"${d.all_cities ? ' checked' : ''}><span>All Pakistan</span></label>
        <div class="cbs" id="city-list">${checks('cities', CITIES.map(c => [c, c]), d.cities)}</div>
      </fieldset>

      <fieldset><legend>Schedule *</legend>
        <label class="field"><span>Repeats</span><select name="schedule_type">
          ${[['daily', 'Every day'], ['weekly', 'Certain days of the week'], ['monthly', 'Certain dates each month'], ['range', 'One-off date range']].map(([v, l]) => `<option value="${v}"${d.schedule_type === v ? ' selected' : ''}>${l}</option>`).join('')}
        </select></label>
        <div data-sched="weekly" class="cbs">${checks('weekdays', DAY_ORDER.map(x => [String(x), DAY[x]]), d.weekdays.map(String))}</div>
        <label class="field" data-sched="monthly"><span>Dates <em>(comma separated, e.g. 1, 15, 25)</em></span><input name="month_dates" value="${esc(d.month_dates.join(', '))}"></label>
        <div class="two">
          <label class="field"><span data-l="start">Valid from <em>(optional)</em></span><input name="start_date" type="date" value="${esc(d.start_date || '')}"></label>
          <label class="field"><span data-l="end">Valid until <em>(optional)</em></span><input name="end_date" type="date" value="${esc(d.end_date || '')}"></label>
        </div>
      </fieldset>

      <label class="field"><span>Terms &amp; conditions</span><textarea name="terms" rows="3" maxlength="600">${esc(d.terms)}</textarea></label>
      <label class="cb"><input type="checkbox" name="active"${d.active ? ' checked' : ''}><span>Live on the site</span></label>

      <p class="form-err" id="form-err" role="alert"></p>
      <div class="dialog-actions">
        <button type="button" class="btn" data-act="close">Cancel</button>
        <button type="submit" class="btn primary">${editing ? 'Save changes' : 'Create deal'}</button>
      </div>
    </form>`;
    const form = $('#deal-form');
    const sync = () => {
      const t = form.schedule_type.value;
      form.querySelectorAll('[data-sched]').forEach(el => { el.hidden = el.dataset.sched !== t; });
      const req = t === 'range';
      form.start_date.required = form.end_date.required = req;
      form.querySelector('[data-l=start]').innerHTML = req ? 'Start date *' : 'Valid from <em>(optional)</em>';
      form.querySelector('[data-l=end]').innerHTML = req ? 'End date *' : 'Valid until <em>(optional)</em>';
      form.querySelectorAll('#city-list input').forEach(i => { i.disabled = form.all_cities.checked; });
    };
    form.schedule_type.addEventListener('change', sync);
    form.all_cities.addEventListener('change', sync);
    sync();
    form.addEventListener('submit', e => { e.preventDefault(); save(form, editing ? deal.id : null); });
    dlg.showModal();
  }

  function readForm(form) {
    const fd = new FormData(form);
    const s = k => String(fd.get(k) || '').trim();
    const type = s('schedule_type');
    const allCities = fd.get('all_cities') === 'on';
    let dates = [];
    if (type === 'monthly') {
      dates = s('month_dates').split(/[\s,]+/).filter(Boolean).map(Number);
      if (!dates.length || dates.some(n => !Number.isInteger(n) || n < 1 || n > 31)) throw new Error('Enter month dates between 1 and 31, e.g. 1, 15, 25.');
      dates = [...new Set(dates)].sort((a, b) => a - b);
    }
    const weekdays = type === 'weekly' ? fd.getAll('weekdays').map(Number) : [];
    const row = {
      merchant: s('merchant'),
      category: s('category'),
      offer: s('offer'),
      discount_pct: Number(s('discount_pct') || 0),
      max_discount: s('max_discount') || null,
      min_spend: s('min_spend') || null,
      all_cities: allCities,
      cities: allCities ? [] : fd.getAll('cities'),
      banks: fd.getAll('banks'),
      card_types: fd.getAll('card_types'),
      networks: fd.getAll('networks').length ? fd.getAll('networks') : null,
      schedule_type: type,
      weekdays,
      month_dates: dates,
      start_date: s('start_date') || null,
      end_date: s('end_date') || null,
      terms: s('terms') || null,
      active: fd.get('active') === 'on'
    };
    if (!row.merchant || !row.offer) throw new Error('Merchant and offer are required.');
    if (!(row.discount_pct >= 0 && row.discount_pct <= 100)) throw new Error('Discount % must be between 0 and 100.');
    if (!row.banks.length) throw new Error('Select at least one bank.');
    if (!row.card_types.length) throw new Error('Select credit, debit or both.');
    if (!row.all_cities && !row.cities.length) throw new Error('Select at least one city, or tick All Pakistan.');
    if (type === 'weekly' && !weekdays.length) throw new Error('Select at least one weekday.');
    if (type === 'range' && (!row.start_date || !row.end_date)) throw new Error('A date range needs both a start and an end date.');
    if (row.start_date && row.end_date && row.end_date < row.start_date) throw new Error('End date must be on or after the start date.');
    return row;
  }

  async function save(form, id) {
    const err = $('#form-err');
    err.textContent = '';
    let row;
    try { row = readForm(form); } catch (e) { err.textContent = e.message; return; }
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    const q = id ? sb.from('deals').update(row).eq('id', id).select() : sb.from('deals').insert(row).select();
    const { data, error } = await q;
    btn.disabled = false;
    if (error) { err.textContent = error.message; return; }
    if (!data || !data.length) { err.textContent = 'Nothing was saved — you may not have permission, or the deal no longer exists.'; return; }
    dlg.close();
    await refresh();
  }

  /* ---------- actions ---------- */
  const byId = id => deals.find(d => String(d.id) === String(id));

  document.addEventListener('click', async e => {
    const t = e.target.closest('[data-act]');
    if (!t || t.dataset.act === 'toggle') return;
    const a = t.dataset.act;
    if (a === 'retry') return route();
    if (a === 'new') return openForm(null);
    if (a === 'close') return dlg.close();
    if (a === 'edit') return openForm(byId(t.dataset.id));
    if (a === 'dup') { const c = Object.assign({}, byId(t.dataset.id)); delete c.id; c.merchant += ' (copy)'; return openForm(c); }
    if (a === 'del') {
      const d = byId(t.dataset.id);
      if (!confirm(`Delete "${d.merchant} — ${d.offer}"? This can't be undone.\n\n(Tip: switch it off with the Live toggle to hide it instead.)`)) return;
      const { data, error } = await sb.from('deals').delete().eq('id', d.id).select();
      if (error || !data || !data.length) return alert('Could not delete: ' + (error ? error.message : 'not permitted'));
      return refresh();
    }
    if (a === 'export') {
      const blob = new Blob([JSON.stringify(deals, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: 'kard-deals-' + todayIso() + '.json' });
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    }
  });

  document.addEventListener('change', async e => {
    const t = e.target.closest('[data-act=toggle]');
    if (!t) return;
    t.disabled = true;
    const { data, error } = await sb.from('deals').update({ active: t.checked }).eq('id', t.dataset.id).select();
    if (error || !data || !data.length) { t.checked = !t.checked; t.disabled = false; return alert('Could not update: ' + (error ? error.message : 'not permitted')); }
    const d = byId(t.dataset.id); if (d) d.active = t.checked;
    renderDash();
  });

  $('#signout').addEventListener('click', async () => { await sb.auth.signOut(); route(); });

  route();
})();
