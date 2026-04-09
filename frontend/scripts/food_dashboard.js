/* ============================================================
   food_dashboard.js — v7.0  (Production Build)
   ──────────────────────────────────────────────────────────
   ORIGINAL (unchanged): menu generator, dish collector
   UPDATED:  fmpSwitchSubTab, fmdAddDish (+ duplicate check)
   NEW:      Advanced Duplicate Detection
             PMP2 — 15-Day Intelligent Menu Planner
               ├── PMP2_DataManager   (localStorage CRUD)
               ├── PMP2_RuleEngine    (7 strict rules)
               ├── PMP2_UIRenderer    (DOM builder)
               └── PMP2_Exporter      (PDF + Excel)
   ============================================================ */

/* ── GLOBALS & API ──────────────────────────────────────── */
var _apiBase   = (window.UNILIV_API_BASE || 'http://127.0.0.1:8000').replace(/\/$/, '');
var _apiOnline = false;
var _LS_KEY    = 'stayopx_dishes_v1';

function _apiCsrf() {
  var m = document.cookie.match(/(^| )csrftoken=([^;]+)/);
  return m ? decodeURIComponent(m[2]) : '';
}
async function _apiFetch(method, path, body) {
  try {
    var opts = { method: method, credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': _apiCsrf() } };
    if (body) opts.body = JSON.stringify(body);
    var res  = await fetch(_apiBase + path, opts);
    var data = await res.json();
    _apiOnline = true;
    return data;
  } catch (e) {
    _apiOnline = false;
    return { success: false, error: 'Cannot reach Django at ' + _apiBase +
      '. Run: venv\\Scripts\\activate && python manage.py runserver' };
  }
}

function _lsGet()  { try{return JSON.parse(localStorage.getItem(_LS_KEY))||[];}catch(e){return[];} }
function _lsSet(a) { try{localStorage.setItem(_LS_KEY,JSON.stringify(a));}catch(e){} }

var _fmpBrand = 'uniliv';
var _fmpMenu  = null;
var _fmdAll   = [];
var _fmdChip  = 'All';

function _esc(s) { var d=document.createElement('div');d.textContent=String(s||'');return d.innerHTML; }
function _el(id) { return document.getElementById(id); }
function _txt(id,v){ var e=_el(id);if(e)e.textContent=v; }

function _showStatus(online) {
  var b = _el('fmp-backend-status');
  if (!b) return;
  if (online) { b.style.display = 'none'; return; }
  b.style.display = 'block';
  b.innerHTML = '⚠️ <strong>Django backend offline</strong> — ' +
    'Run: <code>venv\\Scripts\\activate && python manage.py runserver</code>';
}

/* ── UPDATED LOGIC: TAB NAVIGATION ─────────────────────── */
function fmpSwitchSubTab(tabId) {
  document.querySelectorAll('.fmp-subtab-content').forEach(function(e){ e.classList.remove('active'); });
  document.querySelectorAll('.fmp-subnav-btn').forEach(function(e){ e.classList.remove('active'); });
  var t = _el(tabId); if (t) t.classList.add('active');
  var b = document.querySelector('[data-subtab="'+tabId+'"]'); if (b) b.classList.add('active');
  if (tabId === 'fmpCollectionTab') _loadDishes();
  if (tabId === 'fmpManualPlannerTab') _pmp2Init(); // NEW FEATURE
}

function fmpSetBrand(brand) {
  _fmpBrand = brand; _fmpMenu = null; _renderGrid(null); _stats();
  var d = _el('fmpDash'); if (d) d.setAttribute('data-brand', brand);
}

/* ── 15-DAY MENU GENERATOR ──────────────────────────────── */
async function _stats() {
  var res = await _apiFetch('GET', '/api/menu/stats/?brand=' + _fmpBrand);
  _showStatus(res.success);
  var dishes = res.success ? (res.data || []) : _lsGet().filter(function(d){ return d.brand === _fmpBrand; });
  var cnt = res.success ? res.data : { total: dishes.length, unique_dals: 0 };
  _txt('fmp-stat-dishes', cnt.total || dishes.length);
  _txt('fmp-stat-dals',   cnt.unique_dals || '—');
  _txt('fmp-stat-days',   _fmpMenu ? _fmpMenu.length : '—');
}

async function fmpGenerate() {
  var btn = _el('fmp-gen-btn'), sp = _el('fmp-spinner');
  var eb  = _el('fmp-error-banner'), vp = _el('fmp-validation');
  if (eb) { eb.style.display = 'none'; eb.innerHTML = ''; }
  if (vp) vp.innerHTML = '';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating…'; }
  if (sp) sp.classList.add('show');
  _txt('fmp-stat-issues', '…');

  var res = await _apiFetch('POST', '/api/menu/generate/', { brand: _fmpBrand });

  if (!res.success) {
    if (eb) { eb.style.display = 'block'; eb.innerHTML = '<strong>❌ ' + _esc(res.error || 'Generation failed') + '</strong>'; }
    _txt('fmp-stat-issues', '❌');
    if (sp) sp.classList.remove('show');
    if (btn) { btn.disabled = false; btn.textContent = '✨ Generate 15-Day Menu'; }
    return;
  }
  try {
    _fmpMenu = res.data.days;
    _renderGrid(_fmpMenu);
    _renderFreq(_fmpMenu);
    if (vp) vp.innerHTML = '<div class="fmp-val-summary fmp-val-pass"><span>✅</span><span>Menu generated from Excel schedule</span></div>';
    _txt('fmp-stat-days', _fmpMenu.length);
    _txt('fmp-stat-issues', '0');
    _stats();
  } catch(renderErr) {
    console.error('[Menu render error]', renderErr);
    if (eb) { eb.style.display = 'block'; eb.innerHTML = '<strong>❌ Render error: ' + renderErr.message + '</strong>'; }
  }
  if (sp) sp.classList.remove('show');
  if (btn) { btn.disabled = false; btn.textContent = '🔄 Regenerate 15-Day Menu'; }
}

function _renderGrid(days) {
  var grid = _el('fmp-menu-grid'), sp = _el('fmp-spinner'), bot = _el('fmp-bottom-grid');
  if (!grid) return;
  if (sp) sp.classList.remove('show');
  if (!days || !days.length) {
    grid.classList.remove('has-menu');
    grid.style.gridTemplateColumns = '';
    grid.innerHTML = '<div class="fmp-empty-state"><div class="fmp-empty-icon">📅</div>' +
      '<h5>Ready to Plan</h5><p>Click <strong>Generate 15-Day Menu</strong> to create your plan.</p></div>';
    if (bot) bot.style.display = 'none';
    return;
  }
  grid.classList.add('has-menu');
  grid.style.gridTemplateColumns = 'repeat(' + days.length + ', minmax(210px, 1fr))';
  grid.innerHTML = days.map(function(day) {
    function _n(slot) { return (slot && slot.name) ? slot.name : null; }
    var bf1 = _n(day.breakfast)   || 'TBD';
    var bf2 = _n(day.breakfast2);
    var lDal= _n(day.lunch_dal)   || 'TBD';
    var lVeg= _n(day.lunch_star)  || 'TBD';
    var lm  = _n(day.lunch_main);
    var sn  = _n(day.snack);
    var dDal= _n(day.dinner_dal)  || 'TBD';
    var dVeg= _n(day.dinner_star) || 'TBD';
    var dm  = _n(day.dinner_main);
    return '<div class="fmc-day-card">' +
      '<div class="fmc-day-hdr"><span class="fmc-day-num">Day ' + day.day_number + '</span>' +
      '<span class="fmc-day-date">' + day.date_label + '</span></div>' +
      '<div class="fmc-section fmc-bf"><div class="fmc-sec-label fmc-bf-label">🌅 BREAKFAST</div>' +
      '<ul class="fmc-items"><li class="fmc-item fmc-item-main">' + _esc(bf1) + '</li>' +
      (bf2 ? '<li class="fmc-item fmc-item-main">' + _esc(bf2) + '</li>' : '') +
      '<li class="fmc-item fmc-item-side">🥛 Curd / Dahi</li>' +
      '<li class="fmc-item fmc-item-fruit">🍎 Fruits</li>' +
      '<li class="fmc-item fmc-item-tea">☕ Tea / Coffee</li></ul></div>' +
      '<div class="fmc-section fmc-ln"><div class="fmc-sec-label fmc-ln-label">☀️ LUNCH</div>' +
      '<ul class="fmc-items"><li class="fmc-item fmc-item-dal">⭐ ' + _esc(lDal) + '</li>' +
      '<li class="fmc-item fmc-item-veg">🥘 ' + _esc(lVeg) + '</li>' +
      (lm ? '<li class="fmc-item fmc-item-veg">🥗 ' + _esc(lm) + '</li>' : '') +
      '<li class="fmc-item fmc-item-side">🍚 Steamed Rice</li>' +
      '<li class="fmc-item fmc-item-side">🫓 Desi Ghee Chapatti</li>' +
      '<li class="fmc-item fmc-item-side">🥗 Green Salad</li>' +
      '<li class="fmc-item fmc-item-side">🧂 Pickle</li></ul></div>' +
      '<div class="fmc-section fmc-sn"><div class="fmc-sec-label fmc-sn-label">🌤 EVENING SNACKS</div>' +
      '<ul class="fmc-items">' +
      (sn ? '<li class="fmc-item fmc-item-main">🍽 ' + _esc(sn) + '</li>' : '<li class="fmc-item fmc-item-side">Snacks</li>') +
      '<li class="fmc-item fmc-item-side">🟢 Chutney</li>' +
      '<li class="fmc-item fmc-item-tea">☕ Tea / Coffee</li></ul></div>' +
      '<div class="fmc-section fmc-dn"><div class="fmc-sec-label fmc-dn-label">🌙 DINNER</div>' +
      '<ul class="fmc-items"><li class="fmc-item fmc-item-dal">⭐ ' + _esc(dDal) + '</li>' +
      '<li class="fmc-item fmc-item-veg">🥘 ' + _esc(dVeg) + '</li>' +
      (dm ? '<li class="fmc-item fmc-item-veg">🥗 ' + _esc(dm) + '</li>' : '') +
      '<li class="fmc-item fmc-item-side">🍚 Rice / Pulao</li>' +
      '<li class="fmc-item fmc-item-side">🫓 Desi Ghee Chapatti</li>' +
      '<li class="fmc-item fmc-item-side">🧂 Pickle</li>' +
      '<li class="fmc-item fmc-item-milk">🥛 Hot Milk</li></ul></div>' +
    '</div>';
  }).join('');
  if (bot) bot.style.display = 'grid';
}

function _renderFreq(days) {
  var tracker = _el('fmp-ing-tracker');
  if (!tracker || !days || !days.length) return;
  var freq = {};
  var slots = ['breakfast','breakfast2','lunch_dal','lunch_star','lunch_main',
               'snack','dinner_dal','dinner_star','dinner_main'];
  days.forEach(function(day) {
    slots.forEach(function(slot) {
      var item = day[slot];
      if (item && item.name) { freq[item.name] = (freq[item.name] || 0) + 1; }
    });
  });
  var sorted = Object.entries(freq).sort(function(a,b){ return b[1]-a[1]; });
  var max = sorted.length ? sorted[0][1] : 1;
  tracker.innerHTML = sorted.map(function(entry) {
    var pct = Math.round(entry[1] / max * 100);
    var color = entry[1] >= 3 ? '#e53e3e' : entry[1] === 2 ? '#d97706' : '#16a34a';
    return '<div class="fmp-ing-row">' +
      '<div class="fmp-ing-name" title="' + _esc(entry[0]) + '">' + _esc(entry[0]) + '</div>' +
      '<div class="fmp-ing-bar-wrap"><div class="fmp-ing-bar" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '<div class="fmp-ing-count" style="color:' + color + '">' + entry[1] + '×</div></div>';
  }).join('');
}

function fmpExportPDF() {
  if (!_fmpMenu || !_fmpMenu.length) { alert('Generate a menu first.'); return; }
  if (!window.jspdf) { alert('jsPDF not loaded.'); return; }
  var doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFillColor(26,26,46); doc.rect(0,0,297,16,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(11); doc.setFont('helvetica','bold');
  doc.text(_fmpBrand.toUpperCase() + ' — 15-Day Menu Plan', 148.5, 10, { align: 'center' });
  doc.setTextColor(0,0,0);
  var cW=18, lW=22, y=24;
  var slots = ['Breakfast','Lunch Dal','Lunch Veg','Snacks','Dinner Dal','Dinner Veg'];
  var keys  = ['breakfast','lunch_dal','lunch_star','snack','dinner_dal','dinner_star'];
  doc.setFontSize(5.5); doc.setFont('helvetica','bold'); doc.setFillColor(240,242,245);
  doc.rect(lW, y-4, cW*_fmpMenu.length, 10, 'F');
  _fmpMenu.forEach(function(d,i) {
    doc.text('D'+d.day_number, lW+cW*i+cW/2, y, { align: 'center' });
    doc.text(d.date_label.slice(0,6), lW+cW*i+cW/2, y+4, { align: 'center' });
  });
  y += 8;
  slots.forEach(function(s, si) {
    doc.setFillColor(248,249,250); doc.rect(0,y,lW-1,15,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(5); doc.setTextColor(80,80,80);
    doc.text(s, lW/2, y+7, { align: 'center' }); doc.setTextColor(40,40,40);
    _fmpMenu.forEach(function(d,i) {
      var v = d[keys[si]] ? d[keys[si]].name : '—';
      doc.setDrawColor(220,220,220); doc.rect(lW+cW*i, y, cW, 15);
      doc.setFont('helvetica','normal'); doc.setFontSize(5);
      var ln = doc.splitTextToSize(v, cW-2);
      doc.text(ln[0]||'', lW+cW*i+1, y+5);
      if (ln[1]) doc.text(ln[1], lW+cW*i+1, y+9);
    });
    y += 15; if (y > 180 && si < slots.length-1) { doc.addPage(); y = 20; }
  });
  doc.save('UNILIV_' + _fmpBrand + '_15Day_Menu.pdf');
}

function fmpExportExcel() {
  if (!_fmpMenu || !_fmpMenu.length) { alert('Generate a menu first.'); return; }
  if (!window.XLSX) { alert('SheetJS not loaded.'); return; }
  var rows = [['Day','Date','Breakfast 1','Breakfast 2','Lunch Dal','Lunch Main',
               'Snacks','Dinner Dal','Dinner Main','BF Extras','Lunch Extras','Dinner Extras']];
  _fmpMenu.forEach(function(d) {
    rows.push([d.day_number, d.date_label,
      d.breakfast  ? d.breakfast.name  : '—',
      d.breakfast2 ? d.breakfast2.name : '—',
      d.lunch_dal  ? d.lunch_dal.name  : '—',
      d.lunch_star ? d.lunch_star.name : '—',
      d.snack      ? d.snack.name      : '—',
      d.dinner_dal ? d.dinner_dal.name : '—',
      d.dinner_star? d.dinner_star.name: '—',
      'Curd/Dahi | Fruits | Tea/Coffee',
      'Steamed Rice | Chapatti | Green Salad | Pickle',
      'Rice/Pulao | Chapatti | Pickle | Hot Milk'
    ]);
  });
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [6,12,22,20,20,20,18,20,20,28,38,35].map(function(w){ return {wch:w}; });
  XLSX.utils.book_append_sheet(wb, ws, '15-Day Menu');
  XLSX.writeFile(wb, 'UNILIV_' + _fmpBrand + '_15Day_Menu.xlsx');
}

/* ── DISH COLLECTOR ─────────────────────────────────────── */
async function _loadDishes() {
  var brand = (_el('fmd-brand-filter') && _el('fmd-brand-filter').value) || 'uniliv';
  var cards = _el('fmd-cards');
  if (cards) cards.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:#64748b;font-size:13px;">⏳ Loading…</div>';
  var res = await _apiFetch('GET', '/api/dishes/?brand=' + brand);
  _showStatus(res.success);
  _fmdAll = res.success ? (res.data || []) : _lsGet().filter(function(d){ return d.brand === brand; });
  _renderCards(_fmdAll);
  _dishStats();
  _dishChart();
}

function _dishStats() {
  _txt('fmd-st-total', _fmdAll.length);
  _txt('fmd-st-bf',    _fmdAll.filter(function(d){ return d.meal_type === 'Breakfast'; }).length);
  _txt('fmd-st-ln',    _fmdAll.filter(function(d){ return d.meal_type === 'Lunch'; }).length);
  _txt('fmd-st-dn',    _fmdAll.filter(function(d){ return d.meal_type === 'Dinner'; }).length);
}

function _dishChart() {
  var CL = { Breakfast: '#378ADD', Lunch: '#639922', Dinner: '#D85A30' };
  var cats = ['Breakfast','Lunch','Dinner'];
  var ct = {};
  cats.forEach(function(c){ ct[c] = _fmdAll.filter(function(d){ return d.meal_type === c; }).length; });
  var mx = Math.max.apply(null, Object.values(ct).concat([1]));
  var ch = _el('fmd-chart'); if (!ch) return;
  ch.innerHTML = cats.map(function(c) {
    return '<div class="fmd-chart-row"><div class="fmd-chart-label">' + c + '</div>' +
      '<div class="fmd-chart-track"><div class="fmd-chart-fill" style="width:' +
      Math.round(ct[c]/mx*100) + '%;background:' + CL[c] + '"></div></div>' +
      '<div class="fmd-chart-count" style="color:' + CL[c] + '">' + ct[c] + '</div></div>';
  }).join('');
}

function fmdSetFilter(el) {
  _fmdChip = el.dataset.f;
  document.querySelectorAll('.fmd-chip').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  _applyFilter();
}
function fmdFilterRender() { _applyFilter(); }

function _applyFilter() {
  var list = _fmdAll.slice();
  if      (_fmdChip === 'Star') list = list.filter(function(d){ return d.is_star; });
  else if (_fmdChip === 'Dal')  list = list.filter(function(d){ return d.is_dal; });
  else if (_fmdChip !== 'All')  list = list.filter(function(d){ return d.meal_type === _fmdChip; });
  var q = (_el('fmd-search') && _el('fmd-search').value || '').toLowerCase().trim();
  if (q) list = list.filter(function(d) {
    return d.dish_name.toLowerCase().includes(q) || (d.ingredients || '').toLowerCase().includes(q);
  });
  var sort = (_el('fmd-sort') && _el('fmd-sort').value) || 'newest';
  if (sort === 'oldest') list.sort(function(a,b){ return new Date(a.created_at) - new Date(b.created_at); });
  else if (sort === 'az') list.sort(function(a,b){ return a.dish_name.localeCompare(b.dish_name); });
  else if (sort === 'za') list.sort(function(a,b){ return b.dish_name.localeCompare(a.dish_name); });
  _renderCards(list);
}

function _renderCards(list) {
  var cards = _el('fmd-cards'); if (!cards) return;
  if (!list.length) {
    cards.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#64748b;font-size:13px;">' +
      (_fmdAll.length ? 'No dishes match your filter.' : 'No dishes. Run <code>python seed_db.py</code> first.') + '</div>';
    return;
  }
  var CC = { Breakfast: 'fmd-cat-breakfast', Lunch: 'fmd-cat-lunch', Dinner: 'fmd-cat-dinner' };
  cards.innerHTML = list.map(function(d) {
    var ing = d.ingredients ? d.ingredients.slice(0,55) + (d.ingredients.length > 55 ? '…' : '') : '';
    return '<div class="fmd-card">' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">' +
        '<span class="fmd-cat-badge ' + (CC[d.meal_type] || '') + '">' + d.meal_type + '</span>' +
        (d.is_star ? '<span class="fmd-cat-badge" style="background:#fef9c3;color:#854d0e;">⭐ Star</span>' : '') +
        (d.is_dal  ? '<span class="fmd-cat-badge" style="background:#f0fdf4;color:#166534;">🫘 Dal</span>' : '') +
        (d.is_aloo ? '<span class="fmd-cat-badge" style="background:#fff7ed;color:#9a3412;">🥔 Aloo</span>' : '') +
      '</div>' +
      '<div class="fmd-card-name">' + _esc(d.dish_name) + '</div>' +
      (ing ? '<div style="font-size:11px;color:#64748b;margin:3px 0;" title="' + _esc(d.ingredients) + '">🥄 ' + _esc(ing) + '</div>' : '') +
      '<div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">' + (d.brand || '').toUpperCase() + '</div>' +
      '<div class="fmd-card-footer"><span class="fmd-card-date">' + (d.created_at || '') + '</span>' +
      '<button class="fmd-icon-btn del" onclick="fmdDeleteDish(' + d.id + ')" title="Delete">✕</button></div>' +
    '</div>';
  }).join('');
}


/* ═══════════════════════════════════════════════════════════
   UPDATED LOGIC: ADD / DELETE DISH  (+ duplicate detection)
   ═══════════════════════════════════════════════════════════ */
/* ── SOP lookup helpers ─────────────────────────────────── */

// NEW FEATURE: normalize dish name for SOP index lookup
function _sopNorm(s) {
  return String(s||'').toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim();
}

// NEW FEATURE: look up a dish in _SOP_DISHES (normalized match)
function _sopLookup(dishName) {
  var k = _sopNorm(dishName);
  if (_SOP_DISHES[k]) return _SOP_DISHES[k];
  // Partial match fallback
  for (var key in _SOP_DISHES) {
    if (key === k || key.indexOf(k) !== -1 || k.indexOf(key) !== -1) return _SOP_DISHES[key];
  }
  return null;
}

// NEW FEATURE: is a dish allowed for the current/given entity?
function _sopEntityOK(dishName, entity) {
  var entry = _sopLookup(dishName);
  if (!entry) return false;  // not in any SOP
  return entry.entities.indexOf(entity.toLowerCase()) !== -1;
}

// NEW FEATURE: get current entity from plan or selector
function _pmp2GetEntity() {
  var sel = _el('pmp2-entity-sel');
  if (sel) _pmp2Entity = sel.value;
  return _pmp2Entity;
}

/* END SOP DATA */
var _NV = ['chicken','mutton','beef','pork','fish','prawn','shrimp','lamb','egg','eggs',
           'turkey','bacon','ham','meat','tuna','salmon','crab','lobster','squid',
           'seafood','pepperoni','sausage','meatball'];

async function fmdAddDish() {
  var name  = (_el('fmd-inp-name')  && _el('fmd-inp-name').value  || '').trim();
  var meal  = (_el('fmd-inp-meal')  && _el('fmd-inp-meal').value  || '');
  var brand = (_el('fmd-inp-brand') && _el('fmd-inp-brand').value) || 'uniliv';
  var ing   = (_el('fmd-inp-ing')   && _el('fmd-inp-ing').value   || '').trim();
  var isStar = !!(_el('fmd-inp-star') && _el('fmd-inp-star').checked);
  var isDal  = !!(_el('fmd-inp-dal')  && _el('fmd-inp-dal').checked);
  var ae = _el('fmd-api-error'), nv = _el('fmd-nv-warn');
  if (ae) ae.style.display = 'none';
  if (nv) nv.style.display = 'none';
  if (!name) { _toast('Please enter a dish name.', 'err'); return; }
  if (!meal) { _toast('Please select a Meal Type.', 'err'); return; }
  var nl = name.toLowerCase();
  if (_NV.some(function(w){ return nl.includes(w); })) { if (nv) nv.style.display = 'block'; return; }

  // UPDATED LOGIC: Advanced duplicate detection
  var dup = _findDuplicate(name, meal, brand);
  if (dup) {
    if (ae) {
      ae.style.display = 'block';
      ae.innerHTML = '❌ Dish already exists (duplicate detected): <strong>"' +
        _esc(dup.dish_name) + '"</strong> already saved as ' + meal + ' for ' + brand.toUpperCase() + '.';
    }
    _toast('Dish already exists (duplicate detected)', 'err');
    return;
  }
  // END UPDATED LOGIC

  var btn = _el('fmd-btn-submit');
  if (btn) { btn.disabled = true; btn.textContent = '💾 Saving…'; }

  var res = await _apiFetch('POST', '/api/add-dish/',
    { dish_name: name, meal_type: meal, brand: brand, ingredients: ing || null, is_star: isStar, is_dal: isDal });

  if (!res.success && !_apiOnline) {
    var ex = _lsGet();
    var nd = { id: Date.now(), dish_name: name, meal_type: meal, brand: brand,
      ingredients: ing || null, is_star: isStar, is_dal: isDal,
      is_aloo: ['aloo','potato'].some(function(w){ return nl.includes(w); }),
      created_at: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) };
    ex.unshift(nd); _lsSet(ex); _fmdAll.unshift(nd);
    _renderCards(_fmdAll); _dishStats(); _dishChart(); _fmdClearForm();
    _toast('💾 Saved locally (backend offline)');
  } else if (!res.success) {
    if (ae) { ae.style.display = 'block'; ae.innerHTML = '❌ ' + _esc(res.error || 'Failed.'); }
    _toast('Could not save.', 'err');
  } else {
    _fmdAll.unshift(res.data);
    _renderCards(_fmdAll); _dishStats(); _dishChart(); _stats(); _fmdClearForm();
    _toast('✅ Saved to database!');
  }
  if (btn) { btn.disabled = false; btn.textContent = '💾 Save to Database'; }
}

async function fmdDeleteDish(id) {
  if (!confirm('Remove this dish?')) return;
  if (!_apiOnline) {
    var upd = _lsGet().filter(function(d){ return d.id !== id; }); _lsSet(upd);
    _fmdAll = _fmdAll.filter(function(d){ return d.id !== id; });
    _renderCards(_fmdAll); _dishStats(); _dishChart(); _toast('Removed.'); return;
  }
  var res = await _apiFetch('DELETE', '/api/dishes/' + id + '/');
  if (res.success) {
    _fmdAll = _fmdAll.filter(function(d){ return d.id !== id; });
    _renderCards(_fmdAll); _dishStats(); _dishChart(); _stats(); _toast('Removed from database.');
  } else { _toast('Delete failed.', 'err'); }
}

function _fmdClearForm() {
  ['fmd-inp-name','fmd-inp-meal','fmd-inp-ing'].forEach(function(id){ var e=_el(id);if(e)e.value=''; });
  var s=_el('fmd-inp-star'),d=_el('fmd-inp-dal'),nv=_el('fmd-nv-warn'),ae=_el('fmd-api-error');
  if(s)s.checked=false; if(d)d.checked=false;
  if(nv)nv.style.display='none'; if(ae)ae.style.display='none';
}
function fmdClearForm() { _fmdClearForm(); }

function _toast(msg, type) {
  type = type || 'ok'; var e = _el('fmd-toast'); if (!e) return;
  e.textContent = msg; e.className = 'fmd-toast ' + type; e.style.display = 'block';
  clearTimeout(e._t); e._t = setTimeout(function(){ e.style.display = 'none'; }, 2800);
}


/* ═══════════════════════════════════════════════════════════
   NEW FEATURE: ADVANCED DUPLICATE DETECTION ENGINE
   ═══════════════════════════════════════════════════════════ */
var _SOP_DISHES = {
  "achari aloo": {"dish_name":"Achari aloo","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["uniliv"]},
  "ajwain paratha": {"dish_name":"Ajwain Paratha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "aloo 65": {"dish_name":"Aloo 65","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["uniliv"]},
  "aloo beans": {"dish_name":"Aloo Beans","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "aloo bhujiya": {"dish_name":"Aloo Bhujiya","meal_type":"Dinner","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "aloo bhujjiya": {"dish_name":"Aloo Bhujjiya","meal_type":"Dinner","is_dal":false,"is_aloo":true,"is_star":false,"entities":["uniliv"]},
  "aloo bonda": {"dish_name":"Aloo Bonda","meal_type":"Snacks","is_dal":false,"is_aloo":true,"is_star":false,"entities":["huddle", "uniliv"]},
  "aloo chana chaat": {"dish_name":"Aloo Chana chaat","meal_type":"Snacks","is_dal":true,"is_aloo":true,"is_star":false,"entities":["huddle", "uniliv"]},
  "aloo gobhi": {"dish_name":"Aloo Gobhi","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "aloo gobhi adraki": {"dish_name":"Aloo Gobhi Adraki","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "aloo masala": {"dish_name":"Aloo Masala","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["uniliv"]},
  "aloo matter": {"dish_name":"Aloo Matter","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "aloo parwal": {"dish_name":"Aloo Parwal","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":false,"entities":["uniliv"]},
  "aloo posto": {"dish_name":"Aloo Posto","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["uniliv"]},
  "aloo pyaz ki sabji": {"dish_name":"Aloo Pyaz ki Sabji","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "aloo pyaz paratha": {"dish_name":"Aloo Pyaz Paratha","meal_type":"Breakfast","is_dal":false,"is_aloo":true,"is_star":false,"entities":["huddle", "uniliv"]},
  "anari aloo": {"dish_name":"Anari Aloo","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "arbi masala": {"dish_name":"Arbi Masala","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle"]},
  "arhar dal": {"dish_name":"Arhar Dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "arhar dal tadka": {"dish_name":"Arhar Dal Tadka","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "bagara baigan": {"dish_name":"Bagara Baigan","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "baigan bharta": {"dish_name":"Baigan Bharta","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "batata poha": {"dish_name":"Batata Poha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "beans poriyal": {"dish_name":"Beans Poriyal","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "beasan chilla": {"dish_name":"Beasan Chilla","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "bengali cholar dal": {"dish_name":"Bengali Cholar Dal","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "bharwa shimla": {"dish_name":"Bharwa shimla","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "bhel puri": {"dish_name":"Bhel Puri","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "bhindi do pyaza": {"dish_name":"Bhindi do Pyaza","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "bhindi fry": {"dish_name":"Bhindi Fry","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "bhindi masala": {"dish_name":"Bhindi Masala","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "black masoor": {"dish_name":"Black Masoor","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "bombay sandwich": {"dish_name":"Bombay Sandwich","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "boondi kadhi": {"dish_name":"Boondi Kadhi","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "bread pakoda": {"dish_name":"Bread Pakoda","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "butter paneer masala": {"dish_name":"Butter Paneer Masala","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "cabbage beans porriyal": {"dish_name":"Cabbage Beans Porriyal","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "cabbage mutter": {"dish_name":"Cabbage Mutter","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "chana dal": {"dish_name":"Chana Dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "chana dal tadka": {"dish_name":"Chana Dal Tadka","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "chhare wale aloo": {"dish_name":"Chhare Wale Aloo","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "chilli mashroom": {"dish_name":"Chilli Mashroom","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "chilli patato": {"dish_name":"Chilli Patato","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle"]},
  "chilli patota": {"dish_name":"Chilli Patota","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "chokka": {"dish_name":"Chokka","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "choley": {"dish_name":"Choley","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle"]},
  "cholley": {"dish_name":"Cholley","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "chooley": {"dish_name":"Chooley","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "churma": {"dish_name":"Churma","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "colslaw sandwich": {"dish_name":"Colslaw Sandwich","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle"]},
  "colslow sandwich": {"dish_name":"Colslow Sandwich","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "corn capcicum sandwich": {"dish_name":"Corn Capcicum Sandwich","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "corn cappcicum": {"dish_name":"Corn Cappcicum","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "corn palak": {"dish_name":"Corn Palak","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "cutlet": {"dish_name":"Cutlet","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "dabeli": {"dish_name":"Dabeli","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dahi bhalla": {"dish_name":"Dahi Bhalla","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dahi wale aloo": {"dish_name":"Dahi Wale Aloo","meal_type":"Lunch","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "dal": {"dish_name":"Dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal bhukara": {"dish_name":"Dal Bhukara","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal bukhara": {"dish_name":"Dal Bukhara","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal dhaba": {"dish_name":"Dal Dhaba","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal fry": {"dish_name":"Dal Fry","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal makhani": {"dish_name":"Dal Makhani","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal malka": {"dish_name":"Dal Malka","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal palak": {"dish_name":"Dal Palak","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal panchmel": {"dish_name":"Dal Panchmel","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal paratha": {"dish_name":"Dal Paratha","meal_type":"Breakfast","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal punchmel": {"dish_name":"Dal Punchmel","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal tadka": {"dish_name":"Dal Tadka","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dal vada": {"dish_name":"Dal Vada","meal_type":"Snacks","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dhaba dal": {"dish_name":"Dhaba Dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dhoya urad dal": {"dish_name":"Dhoya Urad dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "dum aloo": {"dish_name":"Dum Aloo","meal_type":"Dinner","is_dal":false,"is_aloo":true,"is_star":true,"entities":["uniliv"]},
  "dum aloo banarsi": {"dish_name":"Dum Aloo Banarsi","meal_type":"Dinner","is_dal":false,"is_aloo":true,"is_star":true,"entities":["huddle", "uniliv"]},
  "falafal roll": {"dish_name":"Falafal Roll","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "fruit chaat": {"dish_name":"Fruit Chaat","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "gajar beans matter": {"dish_name":"Gajar Beans Matter","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "gatte ki sabji": {"dish_name":"Gatte Ki Sabji","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "gawar fali bhajji": {"dish_name":"Gawar fali Bhajji","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "ghiya chana dal": {"dish_name":"Ghiya Chana dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "ghiya kofta": {"dish_name":"Ghiya kofta","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "gobhi paratha": {"dish_name":"Gobhi Paratha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "gol gappe": {"dish_name":"Gol gappe","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "green moong dal": {"dish_name":"Green Moong Dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "gujrati thepla": {"dish_name":"Gujrati Thepla","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "handi veg": {"dish_name":"Handi Veg","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "hara bhara kebab": {"dish_name":"Hara Bhara kebab","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "hari moong dal": {"dish_name":"Hari Moong Dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "hyderabadi baigan": {"dish_name":"Hyderabadi Baigan","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle"]},
  "idli samber": {"dish_name":"Idli / Samber","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "indori poha": {"dish_name":"Indori Poha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "jeera ghiya": {"dish_name":"Jeera Ghiya","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "kadhai soya": {"dish_name":"Kadhai soya","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "kadhi pakoda": {"dish_name":"Kadhi Pakoda","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "kale chane": {"dish_name":"Kale Chane","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "kali urad dal": {"dish_name":"Kali Urad Dal","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "kanji vada": {"dish_name":"Kanji Vada","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "karela bhujjiya": {"dish_name":"Karela Bhujjiya","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "karela do pyaza": {"dish_name":"Karela Do Pyaza","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "kathal ki sabji": {"dish_name":"Kathal Ki Sabji","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "kathal masala": {"dish_name":"Kathal Masala","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "kathi roll": {"dish_name":"Kathi Roll","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "kela ke kofte": {"dish_name":"Kela Ke Kofte","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "kele ki sabji": {"dish_name":"Kele Ki Sabji","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "khasta kachori": {"dish_name":"Khasta Kachori","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "kulcha": {"dish_name":"Kulcha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "langer wali dal": {"dish_name":"Langer Wali Dal","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "lauki bhurji": {"dish_name":"Lauki Bhurji","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle"]},
  "lobbiya dal": {"dish_name":"Lobbiya Dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "maa ki dal": {"dish_name":"Maa Ki Dal","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "macroni": {"dish_name":"Macroni","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "macrroni": {"dish_name":"Macrroni","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "maggi": {"dish_name":"Maggi","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "makhana matter": {"dish_name":"Makhana Matter","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "malai kofta": {"dish_name":"Malai Kofta","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "malai tori": {"dish_name":"Malai Tori","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "masala dosa samber": {"dish_name":"Masala Dosa/ Samber","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "masala idli": {"dish_name":"Masala Idli","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "masala parwal": {"dish_name":"Masala Parwal","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "masala tori": {"dish_name":"Masala Tori","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "matter malai": {"dish_name":"Matter Malai","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "matter paneer": {"dish_name":"Matter Paneer","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "medu vada": {"dish_name":"Medu Vada","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "medu vada samber": {"dish_name":"Medu Vada/ Samber","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "methi thepla": {"dish_name":"Methi Thepla","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "mirchi ka salan": {"dish_name":"Mirchi Ka Salan","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "mix dal": {"dish_name":"Mix Dal","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "mix paratha": {"dish_name":"Mix Paratha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "mix sauce pasta": {"dish_name":"Mix Sauce Pasta","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "mix veg": {"dish_name":"Mix Veg","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "mix veg kofta": {"dish_name":"Mix Veg Kofta","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "mix veg paratha": {"dish_name":"Mix Veg Paratha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "mix veg thepla": {"dish_name":"Mix Veg Thepla","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "moong dal": {"dish_name":"Moong Dal","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "moong dal chilla": {"dish_name":"Moong Dal Chilla","meal_type":"Breakfast","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "moong dal tadka": {"dish_name":"Moong Dal Tadka","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "moong masoor": {"dish_name":"Moong Masoor","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "muli paratha": {"dish_name":"Muli Paratha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "mutter mushroom": {"dish_name":"Mutter Mushroom","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "paapad ki sabji": {"dish_name":"Paapad ki sabji","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "pahadi paneer": {"dish_name":"Pahadi Paneer","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "palak chilla": {"dish_name":"Palak Chilla","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "palak poori": {"dish_name":"Palak Poori","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "palak soya badi": {"dish_name":"Palak soya Badi","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "paneer bhurji": {"dish_name":"Paneer Bhurji","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "paneer chilli": {"dish_name":"Paneer Chilli","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "paneer do pyaza": {"dish_name":"Paneer Do Pyaza","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "paneer hara pyaz": {"dish_name":"Paneer hara pyaz","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "paneer kadhai": {"dish_name":"Paneer Kadhai","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "paneer kali mirch": {"dish_name":"Paneer Kali Mirch","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "paneer makhani": {"dish_name":"Paneer Makhani","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "paneer takatak": {"dish_name":"Paneer Takatak","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "parwal masala": {"dish_name":"Parwal Masala","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "patties": {"dish_name":"Patties","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "pesto sandwich": {"dish_name":"Pesto Sandwich","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "plain paratha": {"dish_name":"Plain Paratha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "poori": {"dish_name":"Poori","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "punch kathor": {"dish_name":"Punch Kathor","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "punjabi kadhi pakoda": {"dish_name":"Punjabi Kadhi Pakoda","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "pyaz paratha": {"dish_name":"Pyaz Paratha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "rajma masala": {"dish_name":"Rajma Masala","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "rajma rashella": {"dish_name":"Rajma Rashella","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "rawa upma": {"dish_name":"Rawa Upma","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "red bopala": {"dish_name":"Red Bopala","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "red sauce pasta": {"dish_name":"Red Sauce Pasta","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "sabudana khichdi": {"dish_name":"Sabudana khichdi","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "sabudana vada": {"dish_name":"Sabudana Vada","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "salsa sauce": {"dish_name":"Salsa Sauce","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "sambher": {"dish_name":"Sambher","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "samosa chaat": {"dish_name":"Samosa Chaat","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "saute vegetable": {"dish_name":"Saute Vegetable","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "sev bhajji": {"dish_name":"Sev Bhajji","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "sev poha": {"dish_name":"Sev Poha","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "sindhi kadhi": {"dish_name":"Sindhi Kadhi","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "soya chaap masala": {"dish_name":"Soya chaap Masala","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "soya matter keema": {"dish_name":"Soya Matter Keema","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle"]},
  "soya matter kimma": {"dish_name":"Soya Matter Kimma","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "stuffed tomato": {"dish_name":"Stuffed Tomato","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "sujji chilla": {"dish_name":"Sujji Chilla","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "tadka idli": {"dish_name":"Tadka Idli","meal_type":"Breakfast","is_dal":true,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "tawa fry": {"dish_name":"Tawa Fry","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "thepla": {"dish_name":"Thepla","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "tikki chaat": {"dish_name":"Tikki Chaat","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "tinda masala": {"dish_name":"Tinda Masala","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "tomato uttapam": {"dish_name":"Tomato Uttapam","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "tori chana dal": {"dish_name":"Tori Chana dal","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "urad sabut": {"dish_name":"Urad sabut","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "vada pav": {"dish_name":"Vada Pav","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "vada samber": {"dish_name":"Vada / Samber","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "veg amritsari": {"dish_name":"Veg Amritsari","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["uniliv"]},
  "veg crispy": {"dish_name":"Veg Crispy","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "veg daliya": {"dish_name":"Veg Daliya","meal_type":"Breakfast","is_dal":true,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "veg jalfrezi": {"dish_name":"Veg Jalfrezi","meal_type":"Lunch","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "veg korma": {"dish_name":"Veg korma","meal_type":"Dinner","is_dal":false,"is_aloo":false,"is_star":true,"entities":["huddle", "uniliv"]},
  "veg makhani": {"dish_name":"Veg Makhani","meal_type":"Lunch","is_dal":true,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "veg manchurian": {"dish_name":"Veg Manchurian","meal_type":"Dinner","is_dal":true,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "veg noodles": {"dish_name":"Veg Noodles","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "veg roll": {"dish_name":"Veg Roll","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "veg uttapam": {"dish_name":"Veg Uttapam","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle"]},
  "veg uttapam samber": {"dish_name":"Veg Uttapam / Samber","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "vegetable daliya": {"dish_name":"Vegetable daliya","meal_type":"Breakfast","is_dal":true,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "vermcilli upma": {"dish_name":"Vermcilli Upma","meal_type":"Breakfast","is_dal":false,"is_aloo":false,"is_star":false,"entities":["uniliv"]},
  "white sauce pasta": {"dish_name":"White Sauce Pasta","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]},
  "zimikand ki tikki": {"dish_name":"Zimikand Ki Tikki","meal_type":"Snacks","is_dal":false,"is_aloo":false,"is_star":false,"entities":["huddle", "uniliv"]}
};

/* ── SOP lookup helpers ─────────────────────────────────── */

// NEW FEATURE: normalize dish name for SOP index lookup
// NEW FEATURE: look up a dish in _SOP_DISHES (normalized match)
// NEW FEATURE: is a dish allowed for the current/given entity?
// NEW FEATURE: get current entity from plan or selector
/* END SOP DATA */

/** Stage 1 — Normalize: lowercase, strip specials, collapse spaces */
function _normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')   // regex: remove all non-alphanumeric
    .replace(/\s+/g, ' ')           // regex: collapse whitespace
    .trim();
}

/** Stage 2 — Levenshtein edit distance (used per-word for fuzzy matching) */
function _editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  var m = a.length, n = b.length, dp = [];
  for (var i = 0; i <= m; i++) {
    dp[i] = [i];
    for (var j = 1; j <= n; j++) {
      dp[i][j] = (i === 0) ? j :
        (a[i-1] === b[j-1]) ? dp[i-1][j-1] :
        1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

/** Stage 3 — Smart match: exact after normalization OR per-word fuzzy (≤1 edit) */
function _isSimilarDish(name1, name2) {
  var n1 = _normalizeName(name1), n2 = _normalizeName(name2);
  if (n1 === n2) return true;                   // exact match after cleanup
  var w1 = n1.split(' '), w2 = n2.split(' ');
  if (w1.length !== w2.length) return false;    // different word count = different dish
  return w1.every(function(w, i) {
    if (w.length <= 2) return w === w2[i];       // short words require exact match
    return _editDistance(w, w2[i]) <= 1;         // longer words allow 1 typo
  });
}

/** Find existing duplicate in _fmdAll; returns matching dish or null */
function _findDuplicate(name, meal, brand) {
  for (var i = 0; i < _fmdAll.length; i++) {
    var d = _fmdAll[i];
    if (d.brand === brand && d.meal_type === meal && _isSimilarDish(d.dish_name, name)) return d;
  }
  return null;
}

/** Find any dish in collection by name (fuzzy); used by rule engine */
function _pmp2FindDish(name) {
  for (var i = 0; i < _fmdAll.length; i++) {
    if (_isSimilarDish(_fmdAll[i].dish_name, name)) return _fmdAll[i];
  }
  return null;
}

/* END DUPLICATE DETECTION */


/* ═══════════════════════════════════════════════════════════
   NEW FEATURE: PMP2 — 15-DAY INTELLIGENT MENU PLANNER
   ═══════════════════════════════════════════════════════════ */

/* ── SOP lookup helpers ─────────────────────────────────── */

// NEW FEATURE: normalize dish name for SOP index lookup
// NEW FEATURE: look up a dish in _SOP_DISHES (normalized match)
// NEW FEATURE: is a dish allowed for the current/given entity?
// NEW FEATURE: get current entity from plan or selector
/* END SOP DATA */

/* ── Config & constants ────────────────────────────────── */
var _PMP2_LS_KEY     = 'stayopx_plan15_v1';
var _PMP2_MEALS      = ['breakfast', 'lunch', 'snacks', 'dinner'];
var _PMP2_WEEK       = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var _PMP2_TYPE_MAP   = { breakfast:'Breakfast', lunch:'Lunch', snacks:'Snacks', dinner:'Dinner' };
var _PMP2_MEAL_CFG   = {
  breakfast: { label:'🌅 Breakfast',    color:'#2563eb', max: 4 },
  lunch:     { label:'☀️ Lunch',         color:'#16a34a', max: 5 },
  snacks:    { label:'🌤 Evening Snacks',color:'#d97706', max: 3 },
  dinner:    { label:'🌙 Dinner',        color:'#7c3aed', max: 5 }
};
var _pmp2Plan        = null;  // plan in memory
var _pmp2Entity      = 'uniliv'; // NEW FEATURE: active entity (uniliv | huddle)
var _pmp2DropTimers  = {};   // per-slot debounce timers
var _pmp2HideTimers  = {};   // blur-delay timers for dropdown
var _pmp2ChartInst   = null; // NEW FEATURE (Chart): Chart.js instance — reused on update

/* ═══════════════════════════════════════════════════════════
   NEW FEATURE: SOP DISH WHITELIST
   Auto-extracted from UNILIV_Draft_Menu.xlsx + HUDDLE_Draft_Menu.xlsx
   Each entry: {dish_name, meal_type, is_dal, is_aloo, is_star, entities}
   entities = ['uniliv'] | ['huddle'] | ['huddle','uniliv']
   ═══════════════════════════════════════════════════════════ */

/* ── SOP lookup helpers ─────────────────────────────────── */

// NEW FEATURE: normalize dish name for SOP index lookup
// NEW FEATURE: look up a dish in _SOP_DISHES (normalized match)
// NEW FEATURE: is a dish allowed for the current/given entity?
// NEW FEATURE: get current entity from plan or selector
/* END SOP DATA */

/* ── Date utilities ────────────────────────────────────── */
function _pmp2Fmt(d)      { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function _pmp2DayName(d)  { return _PMP2_WEEK[d.getDay()]; }
function _pmp2Display(s)  { try { return new Date(s+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); } catch(e){ return s; } }
function _pmp2TodayStr()  { return _pmp2Fmt(new Date()); }

/* ─────────────────────────────────────────────────────────
   PMP2 DATA MANAGER
   ───────────────────────────────────────────────────────── */
var PMP2_DataManager = {

  load: function() {
    try {
      var raw = localStorage.getItem(_PMP2_LS_KEY);
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (!p || !Array.isArray(p.days) || p.days.length !== 15) return null;
      // Patch any missing meals keys (backward compatibility)
      p.days.forEach(function(day) {
        _PMP2_MEALS.forEach(function(m) {
          if (!Array.isArray(day.meals[m])) day.meals[m] = [];
        });
      });
      return p;
    } catch(e) { return null; }
  },

  save: function(plan) {
    try { localStorage.setItem(_PMP2_LS_KEY, JSON.stringify(plan)); } catch(e) {}
  },

  /** Build a fresh 15-day plan from an ISO start-date string */
  create: function(startDateStr) {
    var start = new Date(startDateStr + 'T00:00:00');
    var days = [];
    for (var i = 0; i < 15; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        date:  _pmp2Fmt(d),
        day:   _pmp2DayName(d),
        meals: { breakfast: [], lunch: [], snacks: [], dinner: [] }
      });
    }
    // NEW FEATURE: store entity with plan
    return { startDate: startDateStr, entity: _pmp2GetEntity(), days: days };
  },

  addDish: function(plan, dayIdx, meal, name) {
    plan.days[dayIdx].meals[meal].push(name);
    return plan;
  },

  removeDish: function(plan, dayIdx, meal, idx) {
    plan.days[dayIdx].meals[meal].splice(idx, 1);
    return plan;
  },

  updateDate: function(plan, dayIdx, dateStr) {
    plan.days[dayIdx].date = dateStr;
    try {
      plan.days[dayIdx].day = _pmp2DayName(new Date(dateStr + 'T00:00:00'));
    } catch(e) {}
    return plan;
  },

  updateDayName: function(plan, dayIdx, name) {
    plan.days[dayIdx].day = name;
    return plan;
  },

  clearDay: function(plan, dayIdx) {
    plan.days[dayIdx].meals = { breakfast: [], lunch: [], snacks: [], dinner: [] };
    return plan;
  },

  clearAll: function(plan) {
    plan.days.forEach(function(d) {
      d.meals = { breakfast: [], lunch: [], snacks: [], dinner: [] };
    });
    return plan;
  }
};

/* ─────────────────────────────────────────────────────────
   PMP2 RULE ENGINE  —  7 strict rules
   ───────────────────────────────────────────────────────── */
var PMP2_RuleEngine = {

  /**
   * UPDATED LOGIC: Main validation — 7 rules, entity-first ordering.
   * Priority: Entity SOP → Veg → Category → 7-day repeats → Aloo → Dal rules
   */
  validate: function(plan, dayIdx, meal, dishName) {
    var entity = plan.entity || _pmp2GetEntity();

    // ── Priority 1: Entity SOP check ───────────────────────
    // NEW FEATURE: block any dish not in the selected entity's SOP
    var sopEntry = _sopLookup(dishName);
    if (!sopEntry) {
      // Not in SOP at all — check if it's in _fmdAll (user-added dish)
      var collectionDish = _pmp2FindDish(dishName);
      if (!collectionDish) {
        return '"' + dishName + '" is not found in the Dish Collection or SOP. ' +
          'Add it via Dish Collector first.';
      }
      // User-added dish: check it has the right brand
      if (collectionDish.brand && collectionDish.brand.toLowerCase() !== entity.toLowerCase()) {
        return '"' + dishName + '" is not allowed for ' + entity.toUpperCase() +
          ' (SOP violation). It belongs to ' + collectionDish.brand.toUpperCase() + '.';
      }
    } else {
      // SOP dish: must belong to selected entity
      if (!_sopEntityOK(dishName, entity)) {
        return '"' + (sopEntry.dish_name || dishName) + '" is not in the ' +
          entity.toUpperCase() + ' SOP. ' +
          'It is only allowed for: ' + sopEntry.entities.map(function(e){ return e.toUpperCase(); }).join(', ') + '.';
      }
    }

    // ── Priority 2: Dish must exist in collection (or SOP) ─
    var dish = _pmp2FindDish(dishName) || sopEntry;
    if (!dish) {
      return '"' + dishName + '" was not found. Add it via Dish Collector first.';
    }

    // ── Priority 3: Meal category must match ──────────────
    var required = _PMP2_TYPE_MAP[meal];
    var dishMealType = dish.meal_type;
    if (dishMealType && dishMealType !== required) {
      return '"' + (dish.dish_name || dishName) + '" is a ' + dishMealType +
        ' dish. Only ' + required + ' category dishes are allowed in ' +
        _PMP2_MEAL_CFG[meal].label + '.';
    }

    // ── Priority 4a: No dish repeated within 7 days ────────
    // UPDATED LOGIC: was 15-day check, now 7-day rolling window
    var repError = this._rule7DayNoRepeat(plan, dayIdx, dishName);
    if (repError) return repError;

    // ── Priority 4b: No same Dal within 7 days ─────────────
    var isDal = (dish.is_dal !== undefined ? dish.is_dal : false) ||
                (sopEntry && sopEntry.is_dal);
    if (isDal && (meal === 'lunch' || meal === 'dinner')) {
      var dalRepErr = this._rule7DayDalRepeat(plan, dayIdx, dishName);
      if (dalRepErr) return dalRepErr;
    }

    // ── Priority 5: Aloo constraints ───────────────────────
    var isAloo = (dish.is_aloo !== undefined ? dish.is_aloo : false) ||
                 (sopEntry && sopEntry.is_aloo);
    if (isAloo) {
      var alooErr = this._ruleAlooConstraints(plan, dayIdx);
      if (alooErr) return alooErr;
    }

    // ── Priority 6: Only 1 Dal per meal slot ───────────────
    if (isDal && (meal === 'lunch' || meal === 'dinner')) {
      var slotDishes = plan.days[dayIdx].meals[meal] || [];
      for (var i = 0; i < slotDishes.length; i++) {
        var existing = _pmp2FindDish(slotDishes[i]) || _sopLookup(slotDishes[i]);
        var existIsDal = existing ? (existing.is_dal || false) : false;
        if (existIsDal) {
          return 'Only one Dal per meal. ' + _PMP2_MEAL_CFG[meal].label +
            ' already has "' + slotDishes[i] + '" as a Dal.';
        }
      }
      // No same dal in both lunch & dinner same day
      var otherMeal = meal === 'lunch' ? 'dinner' : 'lunch';
      var otherItems = plan.days[dayIdx].meals[otherMeal] || [];
      for (var j = 0; j < otherItems.length; j++) {
        if (_isSimilarDish(otherItems[j], dishName)) {
          return 'Same Dal cannot appear in both Lunch and Dinner on the same day.';
        }
      }
    }

    return null; // ✅ All rules passed
  },

  // UPDATED LOGIC: 7-day rolling window repeat check (was full 15-day)
  _rule7DayNoRepeat: function(plan, dayIdx, dishName) {
    var WINDOW = 6; // |diff| ≤ 6 → within 7 days
    var lo = Math.max(0, dayIdx - WINDOW);
    var hi = Math.min(14, dayIdx + WINDOW);
    for (var d = lo; d <= hi; d++) {
      if (d === dayIdx) continue;
      for (var m = 0; m < _PMP2_MEALS.length; m++) {
        var items = plan.days[d].meals[_PMP2_MEALS[m]] || [];
        for (var x = 0; x < items.length; x++) {
          if (_isSimilarDish(items[x], dishName)) {
            return '"' + dishName + '" already used on Day ' + (d+1) +
              ' (' + plan.days[d].day + '). Same dish cannot repeat within 7 days.';
          }
        }
      }
    }
    return null;
  },

  // NEW FEATURE: no same Dal within 7 days (across any meal)
  _rule7DayDalRepeat: function(plan, dayIdx, dishName) {
    var WINDOW = 6;
    var lo = Math.max(0, dayIdx - WINDOW);
    var hi = Math.min(14, dayIdx + WINDOW);
    for (var d = lo; d <= hi; d++) {
      if (d === dayIdx) continue;
      ['lunch','dinner'].forEach(function(m) {
        var items = plan.days[d].meals[m] || [];
        items.forEach(function(n) {
          if (_isSimilarDish(n, dishName)) {
            return '"' + dishName + '" Dal already used on Day ' + (d+1) +
              '. Same Dal cannot repeat within 7 days.';
          }
        });
      });
    }
    return null; // covered by _rule7DayNoRepeat; kept for explicit dal messaging
  },

  // UPDATED LOGIC: Aloo — max once/day + max 5 times in any 7-day window
  _ruleAlooConstraints: function(plan, dayIdx) {
    // Rule: max 1 aloo dish per day
    var dayDishes = _PMP2_MEALS.reduce(function(arr, m) {
      return arr.concat(plan.days[dayIdx].meals[m] || []);
    }, []);
    var alooToday = dayDishes.filter(function(n) {
      var d = _pmp2FindDish(n) || _sopLookup(n);
      return d && d.is_aloo;
    }).length;
    if (alooToday >= 1) {
      return 'Aloo dish already planned for Day ' + (dayIdx+1) + '. Max 1 Aloo dish per day.';
    }
    // Rule: max 5 aloo dishes in any 7-day window
    var WINDOW = 6;
    var lo = Math.max(0, dayIdx - WINDOW);
    var hi = Math.min(14, dayIdx + WINDOW);
    var alooInWindow = 0;
    for (var d = lo; d <= hi; d++) {
      _PMP2_MEALS.forEach(function(m) {
        (plan.days[d].meals[m] || []).forEach(function(n) {
          var dd = _pmp2FindDish(n) || _sopLookup(n);
          if (dd && dd.is_aloo) alooInWindow++;
        });
      });
    }
    if (alooInWindow >= 5) {
      return 'Aloo limit reached: max 5 Aloo dishes allowed within any 7-day window.';
    }
    return null;
  },

  /** Rule 3: Check if a day has at least one star dish (non-blocking warning) */
  hasStarDish: function(plan, dayIdx) {
    return _PMP2_MEALS.some(function(m) {
      return (plan.days[dayIdx].meals[m] || []).some(function(n) {
        var d = _pmp2FindDish(n);
        return d && d.is_star;
      });
    });
  },

  /** UPDATED LOGIC: plan-level warnings — star dish, dal mandatory, entity mismatches */
  getPlanViolations: function(plan) {
    var violations = [];
    var entity = plan.entity || _pmp2GetEntity();

    plan.days.forEach(function(day, idx) {
      var totalDishes = _PMP2_MEALS.reduce(function(acc, m) {
        return acc + (day.meals[m] || []).length;
      }, 0);
      if (totalDishes === 0) return; // empty day — skip

      // Rule 3: Star dish mandatory — Lunch & Dinner
      ['lunch','dinner'].forEach(function(meal) {
        var mealDishes = day.meals[meal] || [];
        if (!mealDishes.length) return;
        var hasStar = mealDishes.some(function(n) {
          var d = _pmp2FindDish(n) || _sopLookup(n);
          return d && d.is_star;
        });
        if (!hasStar) {
          violations.push({ type:'warn', dayIdx:idx,
            msg: 'Day '+(idx+1)+' ('+day.day+'): ⭐ No Star dish in '+
              _PMP2_MEAL_CFG[meal].label+'. At least 1 Star dish required per meal.' });
        }
      });

      // NEW FEATURE: Dal mandatory every Lunch & Dinner
      ['lunch','dinner'].forEach(function(meal) {
        var mealDishes = day.meals[meal] || [];
        if (!mealDishes.length) return;
        var hasDal = mealDishes.some(function(n) {
          var d = _pmp2FindDish(n) || _sopLookup(n);
          return d && d.is_dal;
        });
        if (!hasDal) {
          violations.push({ type:'warn', dayIdx:idx,
            msg: 'Day '+(idx+1)+' ('+day.day+'): 🫘 No Dal in '+
              _PMP2_MEAL_CFG[meal].label+'. Dal is mandatory every Lunch & Dinner.' });
        }
      });

      // NEW FEATURE: flag any dish that doesn't belong to current entity
      _PMP2_MEALS.forEach(function(meal) {
        (day.meals[meal] || []).forEach(function(n) {
          if (!_sopEntityOK(n, entity)) {
            var sopE = _sopLookup(n);
            if (sopE) { // exists in SOP but wrong entity
              violations.push({ type:'error', dayIdx:idx,
                msg: 'Day '+(idx+1)+' ('+day.day+'): ❌ "'+n+'" is not in the '+
                  entity.toUpperCase()+' SOP (belongs to '+
                  sopE.entities.map(function(e){return e.toUpperCase();}).join('/')+').' });
            }
          }
        });
      });
    });

    return violations;
  }
};

/* ─────────────────────────────────────────────────────────
   PMP2 UI RENDERER
   ───────────────────────────────────────────────────────── */

/** Ensure _fmdAll is populated (load silently if empty) */
// UPDATED LOGIC: populate _fmdAll from Django → localStorage → SOP whitelist fallback
// This ensures ALL 206 Excel SOP dishes always appear in dropdowns
async function _pmp2EnsureDishes() {
  var entity = _pmp2GetEntity();

  // 1. Try Django API first (primary source)
  var res = await _apiFetch('GET', '/api/dishes/?brand=' + entity);
  if (res.success && res.data && res.data.length) {
    _fmdAll = res.data;
  } else {
    // 2. Fall back to localStorage cache
    var local = _lsGet();
    if (local.length) _fmdAll = local;
  }

  // 3. ALWAYS seed from _SOP_DISHES (covers offline + fresh install)
  // Dishes from Excel that are not yet in Django DB are added as SOP entries
  // so the dropdown is always fully populated from both sources
  var seen = {};
  _fmdAll.forEach(function(d) { seen[_sopNorm(d.dish_name)] = true; });

  Object.values(_SOP_DISHES).forEach(function(s) {
    var k = _sopNorm(s.dish_name);
    if (!seen[k]) {
      _fmdAll.push({
        id:          'sop_' + k,
        dish_name:   s.dish_name,
        meal_type:   s.meal_type,
        brand:       (s.entities && s.entities[0]) || entity,
        ingredients: null,
        is_star:     s.is_star  || false,
        is_dal:      s.is_dal   || false,
        is_aloo:     s.is_aloo  || false,
        created_at:  'SOP (Excel)',
        _fromSOP:    true
      });
      seen[k] = true;
    }
  });
}

/** Main init — called when Plan Your Menu tab is activated */
async function _pmp2Init() {
  var banner = _el('pmp2-loading-banner');
  if (banner) banner.style.display = 'block';
  await _pmp2EnsureDishes();
  if (banner) banner.style.display = 'none';

  // UPDATED LOGIC: sync entity from selector
  var sel = _el('pmp2-entity-sel');
  if (sel) _pmp2Entity = sel.value;

  _pmp2Plan = PMP2_DataManager.load();

  // Pre-fill start-date input
  var dateInput = _el('pmp2-ctrl-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = _pmp2Plan ? _pmp2Plan.startDate : _pmp2TodayStr();
  }

  // Sync entity selector with saved plan entity
  if (_pmp2Plan && _pmp2Plan.entity && sel) {
    sel.value = _pmp2Plan.entity;
    _pmp2Entity = _pmp2Plan.entity;
  }

  if (!_pmp2Plan) {
    _pmp2RenderSetup();
  } else {
    _pmp2RenderGrid();
    _pmp2RefreshStats();
    _pmp2RefreshViolations();
  }
}

/** Show the "no plan yet" setup screen inside the grid area */
function _pmp2RenderSetup() {
  var outer = _el('pmp2-grid-outer');
  if (!outer) return;
  outer.innerHTML =
    '<div class="pmp2-setup-state">' +
      '<div class="pmp2-setup-icon">📅</div>' +
      '<h5>Build Your 15-Day Menu Plan</h5>' +
      '<p>Set a start date above and click <strong>📅 Generate Plan</strong> to create your planning grid.</p>' +
      '<p style="font-size:12px;opacity:.7;">Rules will be enforced in real time as you add dishes.</p>' +
    '</div>';
  _pmp2RefreshStats();
  var vp = _el('pmp2-violations'); if (vp) vp.style.display = 'none';
}

/** Full grid render — builds all 15 day-card HTML */
function _pmp2RenderGrid() {
  var outer = _el('pmp2-grid-outer');
  if (!outer || !_pmp2Plan) return;

  outer.innerHTML =
    '<div class="pmp2-scroll-hint">← Scroll horizontally →</div>' +
    '<div class="pmp2-grid-scroll">' +
      '<div id="pmp2-grid" class="pmp2-grid"></div>' +
    '</div>';

  var g = _el('pmp2-grid');
  if (!g) return;
  g.innerHTML = _pmp2Plan.days.map(function(_, idx) {
    return _pmp2BuildDayCard(idx);
  }).join('');
}

/** Build one day card as an HTML string */
function _pmp2BuildDayCard(idx) {
  var day     = _pmp2Plan.days[idx];
  var hasStar = PMP2_RuleEngine.hasStarDish(_pmp2Plan, idx);
  var total   = _PMP2_MEALS.reduce(function(s, m){ return s + (day.meals[m]||[]).length; }, 0);
  var noStar  = total > 0 && !hasStar;

  return '<div class="pmp2-day-card' + (noStar ? ' pmp2-warn-star' : '') + '" id="pmp2-card-' + idx + '">' +

    /* ── card header ── */
    '<div class="pmp2-card-hdr">' +
      '<div class="pmp2-day-badge">D' + String(idx+1).padStart(2,'0') + '</div>' +
      '<div class="pmp2-hdr-selectors">' +
        '<input type="date" class="pmp2-date-inp" id="pmp2-dateinp-' + idx + '" value="' + day.date + '" ' +
          'onchange="pmp2UpdateDate(' + idx + ', this.value)">' +
        '<select class="pmp2-day-sel" id="pmp2-daysel-' + idx + '" onchange="pmp2UpdateDayName(' + idx + ', this.value)">' +
          _PMP2_WEEK.slice(1).concat([_PMP2_WEEK[0]]).map(function(dn) {  // Mon-Sun order
            return '<option value="' + dn + '"' + (dn === day.day ? ' selected' : '') + '>' + dn + '</option>';
          }).join('') +
        '</select>' +
      '</div>' +
      '<button class="pmp2-clear-day" onclick="pmp2ClearDay(' + idx + ')" title="Clear this day">🗑</button>' +
    '</div>' +

    /* ── no-star warning badge ── */
    (noStar ? '<div class="pmp2-no-star-warn">⭐ Add a Star dish to this day</div>' : '') +

    /* ── 4 meal sections ── */
    _PMP2_MEALS.map(function(meal) {
      return _pmp2BuildMealSection(idx, meal);
    }).join('') +

  '</div>';
}

/* UPDATED LOGIC: _pmp2BuildMealSection — replaced <datalist> with custom
   searchable dropdown that supports real-time filtering + "Add new dish" */
function _pmp2BuildMealSection(idx, meal) {
  var cfg    = _PMP2_MEAL_CFG[meal];
  var dishes = (_pmp2Plan.days[idx].meals[meal] || []);
  var atMax  = dishes.length >= cfg.max;

  // Dish tags (unchanged)
  var tagsHTML = dishes.length
    ? dishes.map(function(name, di) {
        var info = _pmp2FindDish(name);
        return '<div class="pmp2-dish-tag">' +
          (info && info.is_star ? '<span class="pmp2-tag-star" title="Star dish">⭐</span>' : '') +
          (info && info.is_dal  ? '<span class="pmp2-tag-dal"  title="Dal dish">🫘</span>'  : '') +
          (info && info.is_aloo ? '<span class="pmp2-tag-aloo" title="Aloo dish">🥔</span>' : '') +
          '<span class="pmp2-tag-name">' + _esc(name) + '</span>' +
          '<button class="pmp2-rm" onclick="pmp2Remove(' + idx + ',\'' + meal + '\',' + di + ')" title="Remove">×</button>' +
        '</div>';
      }).join('')
    : '<div class="pmp2-empty-slot">No dishes yet</div>';

  // NEW FEATURE: custom searchable dropdown replaces <datalist>
  var placeholder = atMax ? 'Max ' + cfg.max + ' reached' : 'Search or type ' + _PMP2_TYPE_MAP[meal] + '…';

  return '<div class="pmp2-meal-sec" id="pmp2-ms-' + idx + '-' + meal + '">' +
    '<div class="pmp2-meal-hdr" style="border-color:' + cfg.color + '">' +
      '<span class="pmp2-meal-lbl" style="color:' + cfg.color + '">' + cfg.label + '</span>' +
      '<span class="pmp2-meal-cnt" style="color:' + cfg.color + ';background:' + cfg.color + '18">' +
        dishes.length + '/' + cfg.max +
      '</span>' +
    '</div>' +
    '<div class="pmp2-dish-list">' + tagsHTML + '</div>' +

    /* searchable dropdown wrapper */
    '<div class="pmp2-drop-wrap"' + (atMax ? ' style="opacity:.45;pointer-events:none"' : '') + '>' +
      '<div class="pmp2-add-row">' +
        '<input type="text" class="pmp2-srch" id="pmp2-inp-' + idx + '-' + meal + '" ' +
          'autocomplete="off" spellcheck="false" ' +
          'placeholder="' + placeholder + '" ' +
          (atMax ? 'disabled ' : '') +
          'oninput="_pmp2OnInput(' + idx + ',\'' + meal + '\',this)" ' +
          'onfocus="_pmp2ShowDrop(' + idx + ',\'' + meal + '\')" ' +
          'onblur="_pmp2ScheduleHide(' + idx + ',\'' + meal + '\')" ' +
          'onkeydown="if(event.key===\'Enter\'){event.preventDefault();pmp2Add(' + idx + ',\'' + meal + '\');}' +
            'if(event.key===\'Escape\'){this.blur();_pmp2HideDrop(' + idx + ',\'' + meal + '\');}">' +
        '<button class="pmp2-add-btn" style="background:' + cfg.color + '" ' +
          'onclick="pmp2Add(' + idx + ',\'' + meal + '\')"' + (atMax ? ' disabled' : '') + '>＋</button>' +
      '</div>' +
      /* dropdown panel — rendered dynamically */
      '<div class="pmp2-drop-list" id="pmp2-dl-' + idx + '-' + meal + '" style="display:none"></div>' +
    '</div>' +

    '<div class="pmp2-err" id="pmp2-err-' + idx + '-' + meal + '"></div>' +
  '</div>';
}

/* ─────────────────────────────────────────────────────────
   NEW FEATURE: SEARCHABLE DROPDOWN ENGINE
   ─────────────────────────────────────────────────────────
   _pmp2OnInput       — debounced input handler
   _pmp2ShowDrop      — show dropdown panel (on focus)
   _pmp2ScheduleHide  — blur guard (mousedown fires before blur)
   _pmp2HideDrop      — immediate hide
   _pmp2RenderDrop    — build filtered option list
   pmp2SelectDish     — user clicked an option
   pmp2QuickAddDish   — "Add new dish" option clicked
   ───────────────────────────────────────────────────────── */

/**
 * UPDATED LOGIC: normalize for SEARCH (contains-match, not Levenshtein).
 * Separate from _normalizeName which is used for duplicate detection.
 */
function _pmp2SearchNorm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/** Debounced input handler — fires _pmp2RenderDrop after 160 ms idle */
function _pmp2OnInput(idx, meal, el) {
  var key = idx + '-' + meal;
  clearTimeout(_pmp2DropTimers[key]);
  _pmp2DropTimers[key] = setTimeout(function() {
    _pmp2RenderDrop(idx, meal, el.value);
  }, 160);
}

/** Show dropdown immediately on focus with current query */
function _pmp2ShowDrop(idx, meal) {
  var key = idx + '-' + meal;
  clearTimeout(_pmp2HideTimers[key]);        // cancel any pending hide
  var inp = _el('pmp2-inp-' + idx + '-' + meal);
  _pmp2RenderDrop(idx, meal, inp ? inp.value : '');
}

/**
 * Schedule hide with 220 ms delay so mousedown on a dropdown option
 * fires BEFORE the hide actually happens (mousedown precedes blur).
 */
function _pmp2ScheduleHide(idx, meal) {
  var key = idx + '-' + meal;
  _pmp2HideTimers[key] = setTimeout(function() {
    _pmp2HideDrop(idx, meal);
  }, 220);
}

/** Immediately hide the dropdown panel */
function _pmp2HideDrop(idx, meal) {
  var dl = _el('pmp2-dl-' + idx + '-' + meal);
  if (dl) dl.style.display = 'none';
}

/**
 * UPDATED LOGIC: render filtered options into the dropdown panel.
 * Search uses contains-match on normalized strings.
 * Shows "Add new dish" option when query not found exactly.
 */
function _pmp2RenderDrop(idx, meal, rawQuery) {
  var dl = _el('pmp2-dl-' + idx + '-' + meal);
  if (!dl) return;

  var query  = _pmp2SearchNorm(rawQuery);
  var type   = _PMP2_TYPE_MAP[meal];
  // UPDATED LOGIC: read entity from plan (saved) or live selector
  var entity = (_pmp2Plan && _pmp2Plan.entity) ? _pmp2Plan.entity : _pmp2GetEntity();

  /* ── Build pool: _fmdAll (DB/localStorage/SOP-seeded) filtered by entity + type ── */
  var seen = {};
  var pool = [];

  // Step 1: from _fmdAll — all seeded from Django/localStorage/_SOP_DISHES by _pmp2EnsureDishes
  _fmdAll.forEach(function(d) {
    if (d.meal_type !== type) return;
    var brand = (d.brand || '').toLowerCase();
    // Accept if brand matches entity OR dish comes from SOP and entity is allowed
    if (brand && brand !== entity.toLowerCase()) {
      // cross-check SOP: dish may belong to multiple entities
      var sopE = _sopLookup(d.dish_name);
      if (!sopE || sopE.entities.indexOf(entity.toLowerCase()) === -1) return;
    }
    var k = _sopNorm(d.dish_name);
    if (!seen[k]) { pool.push(d); seen[k] = true; }
  });

  // Step 2: add any SOP dishes not yet in pool (guarantees Excel items always show)
  Object.values(_SOP_DISHES).forEach(function(s) {
    if (s.meal_type !== type) return;
    if (s.entities.indexOf(entity.toLowerCase()) === -1) return;
    var k = _sopNorm(s.dish_name);
    if (!seen[k]) {
      pool.push({ dish_name: s.dish_name, meal_type: s.meal_type,
        is_dal: s.is_dal, is_aloo: s.is_aloo, is_star: s.is_star,
        brand: entity, _fromSOP: true });
      seen[k] = true;
    }
  });

  /* Sort alphabetically for easy scanning */
  pool.sort(function(a, b) { return a.dish_name.localeCompare(b.dish_name); });

  /* Filter: if query is empty show all; else filter by contains */
  var filtered = query
    ? pool.filter(function(d) {
        return _pmp2SearchNorm(d.dish_name).indexOf(query) !== -1;
      })
    : pool;

  /* Cap at 40 items for DOM performance */
  var shown = filtered.slice(0, 50);

  /* Safe single-quote escape for inline onclick attrs */
  var sq = function(s) { return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); };

  // UPDATED LOGIC: meal → CSS class for colour pill
  var typeClass = {
    Breakfast: 'pmp2-dt-breakfast',
    Lunch:     'pmp2-dt-lunch',
    Snacks:    'pmp2-dt-snacks',
    Dinner:    'pmp2-dt-dinner'
  };

  var html = '';

  if (!pool.length) {
    html = '<div class="pmp2-drop-msg pmp2-drop-empty">' +
      'No ' + type + ' dishes available for ' + entity.toUpperCase() + '.</div>';

  } else if (!shown.length) {
    html = '<div class="pmp2-drop-msg pmp2-drop-empty">No match for "<strong>' +
      _esc(rawQuery) + '</strong>"</div>' +
      (rawQuery.trim()
        ? '<div class="pmp2-drop-quickadd" ' +
            'onmousedown="event.preventDefault();pmp2QuickAddDish(' + idx + ',\'' +
            meal + '\',\'' + sq(rawQuery.trim()) + '\')">' +
            '<strong>' + _esc(rawQuery.trim()) + '</strong> — add to collection' +
          '</div>'
        : '');

  } else {
    // Section header showing count
    var countLabel = filtered.length === pool.length
      ? pool.length + ' ' + type + ' dishes'
      : shown.length + ' of ' + filtered.length + ' matches';
    html = '<div class="pmp2-drop-section-hdr">' + countLabel + '</div>';

    html += shown.map(function(d) {
      // Build badge string
      var badges = '';
      if (d.is_star) badges += '<span class="pmp2-dbadge" title="Star dish">⭐</span>';
      if (d.is_dal)  badges += '<span class="pmp2-dbadge" title="Dal dish">🫘</span>';
      if (d.is_aloo) badges += '<span class="pmp2-dbadge" title="Aloo dish">🥔</span>';

      var tc = typeClass[d.meal_type] || '';

      return '<div class="pmp2-drop-item" ' +
        'title="' + _esc(d.dish_name) + '"' +
        'onmousedown="event.preventDefault();pmp2SelectDish(' + idx + ',\'' +
          meal + '\',\'' + sq(d.dish_name) + '\')">' +
        (badges
          ? '<span class="pmp2-drop-badges">' + badges + '</span>'
          : '<span class="pmp2-drop-badges"></span>') +
        '<span class="pmp2-drop-name">' + _esc(d.dish_name) + '</span>' +
        (tc ? '<span class="pmp2-drop-type ' + tc + '">' + d.meal_type + '</span>' : '') +
      '</div>';
    }).join('');

    // Quick-add option when typed text isn't an exact match
    if (rawQuery.trim() && !_sopLookup(rawQuery.trim()) && !_pmp2FindDish(rawQuery.trim())) {
      html += '<div class="pmp2-drop-quickadd" ' +
        'onmousedown="event.preventDefault();pmp2QuickAddDish(' + idx + ',\'' +
          meal + '\',\'' + sq(rawQuery.trim()) + '\')">' +
        '<strong>' + _esc(rawQuery.trim()) + '</strong> — add as new ' + type + ' dish' +
      '</div>';
    }

    if (filtered.length > 50) {
      html += '<div class="pmp2-drop-msg">+ ' + (filtered.length - 50) +
        ' more — type to narrow results</div>';
    }
  }

  dl.innerHTML = html;
  dl.style.display = 'block';
}

/**
 * NEW FEATURE: User clicked an option in the dropdown.
 * Sets the input value and immediately fires pmp2Add.
 */
function pmp2SelectDish(dayIdx, meal, name) {
  /* Cancel any pending hide so we stay open if add fails */
  clearTimeout(_pmp2HideTimers[dayIdx + '-' + meal]);
  var inp = _el('pmp2-inp-' + dayIdx + '-' + meal);
  if (inp) inp.value = name;
  _pmp2HideDrop(dayIdx, meal);
  pmp2Add(dayIdx, meal);
}

/**
 * NEW FEATURE: Quick-add a dish that doesn't exist in the collection yet.
 *
 * Flow:
 *  1. Normalize + duplicate check (regex-based, same as fmdAddDish)
 *  2. Build dish object, push into _fmdAll (single source of truth)
 *  3. Persist to localStorage (merge with existing local data)
 *  4. Attempt background save to Django API (non-blocking)
 *  5. Immediately call pmp2Add so it lands in the plan
 */
function pmp2QuickAddDish(dayIdx, meal, rawName) {
  rawName = rawName.trim();
  if (!rawName) return;

  /* UPDATED LOGIC: strict duplicate check before adding */
  var existing = _pmp2FindDish(rawName);
  if (existing) {
    _pmp2SetErr(dayIdx, meal,
      'Dish already exists in collection as "' + existing.dish_name + '".');
    _pmp2HideDrop(dayIdx, meal);
    return;
  }

  var type  = _PMP2_TYPE_MAP[meal];
  // UPDATED LOGIC: use plan entity for brand assignment
  var brand = (_pmp2Plan && _pmp2Plan.entity) ? _pmp2Plan.entity :
              ((_el('fmd-brand-filter') && _el('fmd-brand-filter').value) || 'uniliv');
  var nl    = rawName.toLowerCase();

  /* Infer flags automatically */
  var isAloo = ['aloo','potato','aaloo'].some(function(w){ return nl.includes(w); });
  var isDal  = ['dal','daal','lentil','chana','rajma','moong','masoor','toor','urad'].some(function(w){ return nl.includes(w); });
  var isStar = false;

  var newDish = {
    id:          Date.now(),
    dish_name:   rawName,
    meal_type:   type,
    brand:       brand,
    ingredients: null,
    is_star:     isStar,
    is_dal:      isDal,
    is_aloo:     isAloo,
    created_at:  new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
  };

  /* Add to in-memory collection (single source of truth) */
  _fmdAll.unshift(newDish);

  /* Persist to localStorage — merge, avoiding duplicates */
  var local = _lsGet().filter(function(d) {
    return !_isSimilarDish(d.dish_name, rawName);
  });
  local.unshift(newDish);
  _lsSet(local);

  /* Non-blocking backend save */
  _apiFetch('POST', '/api/add-dish/', {
    dish_name: rawName, meal_type: type, brand: brand,
    ingredients: null, is_star: isStar, is_dal: isDal
  }).then(function(res) {
    if (res && res.success && res.data && res.data.id) {
      /* Replace temp id with the real one from Django */
      for (var i = 0; i < _fmdAll.length; i++) {
        if (_fmdAll[i].id === newDish.id) { _fmdAll[i] = res.data; break; }
      }
    }
  }).catch(function() {});

  _pmp2Toast('➕ "' + rawName + '" added to Dish Collection as ' + type);

  /* Set input and trigger normal add (which will validate + append to plan) */
  var inp = _el('pmp2-inp-' + dayIdx + '-' + meal);
  if (inp) inp.value = rawName;
  _pmp2HideDrop(dayIdx, meal);
  pmp2Add(dayIdx, meal);
}

/* END SEARCHABLE DROPDOWN ENGINE */


function _pmp2RefreshCard(idx) {
  var old = _el('pmp2-card-' + idx);
  if (!old) { _pmp2RenderGrid(); return; }
  var tmp = document.createElement('div');
  tmp.innerHTML = _pmp2BuildDayCard(idx);
  old.parentNode.replaceChild(tmp.firstElementChild, old);
}

/* ─────────────────────────────────────────────────────────
   NEW FEATURE (Chart): DISH REPETITION ANALYTICS
   ─────────────────────────────────────────────────────────
   _pmp2ComputeFrequency  — count each dish across 15 days
   _pmp2RenderChart       — draw / update Chart.js bar chart
   pmp2ToggleChart        — expand / collapse chart panel
   ───────────────────────────────────────────────────────── */

/**
 * NEW FEATURE (Chart): Traverse all 15 days and count every dish.
 * Returns array sorted by count desc: [{name, count, meal, isDal, isAloo, isStar}]
 */
function _pmp2ComputeFrequency() {
  if (!_pmp2Plan || !_pmp2Plan.days) return [];
  var freq = {};
  _pmp2Plan.days.forEach(function(day) {
    _PMP2_MEALS.forEach(function(meal) {
      (day.meals[meal] || []).forEach(function(name) {
        if (!freq[name]) {
          var info = _pmp2FindDish(name) || _sopLookup(name) || {};
          freq[name] = { count: 0, meal: meal,
            isDal:  !!(info.is_dal),
            isAloo: !!(info.is_aloo),
            isStar: !!(info.is_star) };
        }
        freq[name].count++;
      });
    });
  });
  return Object.keys(freq)
    .map(function(k) { return Object.assign({ name: k }, freq[k]); })
    .sort(function(a, b) { return b.count - a.count; });
}

/** Meal-type colour palette (matches existing meal section colours) */
var _PMP2_CHART_COLORS = {
  breakfast: 'rgba(37,99,235,0.80)',
  lunch:     'rgba(22,163,74,0.80)',
  snacks:    'rgba(217,119,6,0.80)',
  dinner:    'rgba(124,58,237,0.80)'
};
var _PMP2_CHART_BORDERS = {
  breakfast: '#2563eb',
  lunch:     '#16a34a',
  snacks:    '#d97706',
  dinner:    '#7c3aed'
};

/**
 * NEW FEATURE (Chart): Render or update the dish-repetition bar chart.
 * Reuses the existing Chart.js instance to avoid re-creating the canvas.
 * Called automatically after every plan mutation.
 */
function _pmp2RenderChart() {
  var section = _el('pmp2-chart-section');
  var canvas  = _el('pmp2-chart-canvas');
  if (!section || !canvas) return;

  var data = _pmp2ComputeFrequency();

  // Hide section and destroy chart if plan is empty
  if (!data.length) {
    section.style.display = 'none';
    if (_pmp2ChartInst) { _pmp2ChartInst.destroy(); _pmp2ChartInst = null; }
    return;
  }
  section.style.display = 'block';

  var labels  = data.map(function(d) { return d.name; });
  var counts  = data.map(function(d) { return d.count; });
  var bgColors = data.map(function(d) {
    return _PMP2_CHART_COLORS[d.meal]  || 'rgba(100,116,139,0.7)';
  });
  var bdColors = data.map(function(d) {
    return _PMP2_CHART_BORDERS[d.meal] || '#64748b';
  });

  // Dynamic canvas height: 30px per bar + axis padding
  var wrap = _el('pmp2-chart-wrap');
  if (wrap) wrap.style.height = Math.max(220, data.length * 32 + 70) + 'px';

  // ── UPDATE existing chart (fastest — no flicker) ──────────
  if (_pmp2ChartInst) {
    _pmp2ChartInst.data.labels                              = labels;
    _pmp2ChartInst.data.datasets[0].data                   = counts;
    _pmp2ChartInst.data.datasets[0].backgroundColor        = bgColors;
    _pmp2ChartInst.data.datasets[0].borderColor            = bdColors;
    _pmp2ChartInst.update('none'); // 'none' = skip animation on update
    return;
  }

  // ── CREATE chart for the first time ──────────────────────
  var ctx = canvas.getContext('2d');
  _pmp2ChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label:           'Times planned',
        data:            counts,
        backgroundColor: bgColors,
        borderColor:     bdColors,
        borderWidth:     2,
        borderRadius:    5,
        borderSkipped:   false
      }]
    },
    options: {
      indexAxis:           'y',      // horizontal bar — dish names on y-axis
      responsive:          true,
      maintainAspectRatio: false,
      animation:           { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function(items) { return items[0].label; },
            label: function(item) {
              var d = data[item.dataIndex];
              var badges = (d.isStar ? ' ⭐' : '') + (d.isDal ? ' 🫘' : '') + (d.isAloo ? ' 🥔' : '');
              return ' Planned ' + item.raw + ' time' + (item.raw !== 1 ? 's' : '') + badges;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0, font: { size: 11 } },
          grid: { color: 'rgba(0,0,0,.06)' },
          title: {
            display: true,
            text: 'Number of times planned in 15-day menu',
            font: { size: 11 }
          }
        },
        y: {
          ticks: { font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

/** NEW FEATURE (Chart): Toggle chart panel expand / collapse */
function pmp2ToggleChart() {
  var body = _el('pmp2-chart-body');
  var btn  = _el('pmp2-chart-toggle-btn');
  if (!body) return;
  var collapsed = body.style.display === 'none';
  body.style.display  = collapsed ? 'block' : 'none';
  if (btn) btn.textContent = collapsed ? '▲ Hide' : '▼ Show';
}

/* END CHART ENGINE */


function _pmp2RefreshStats() {
  if (!_pmp2Plan) {
    ['pmp2-st-days','pmp2-st-dishes','pmp2-st-nostar','pmp2-st-pct'].forEach(function(id){ _txt(id,'—'); });
    _pmp2RenderChart(); // NEW FEATURE (Chart): clear chart when no plan
    return;
  }
  var activeDays = 0, total = 0, noStar = 0;
  _pmp2Plan.days.forEach(function(day, idx) {
    var cnt = _PMP2_MEALS.reduce(function(s,m){ return s + (day.meals[m]||[]).length; }, 0);
    total += cnt;
    if (cnt > 0) activeDays++;
    if (cnt > 0 && !PMP2_RuleEngine.hasStarDish(_pmp2Plan, idx)) noStar++;
  });
  var pct = Math.min(100, Math.round(total / (15 * 8) * 100)); // 8 dishes/day = 100%
  _txt('pmp2-st-days',   activeDays + '/15');
  _txt('pmp2-st-dishes', total);
  _txt('pmp2-st-nostar', noStar);
  _txt('pmp2-st-pct',    pct + '%');
  _pmp2RenderChart(); // UPDATED LOGIC: refresh chart after every plan change
}

/** Render the violations panel below the grid */
function _pmp2RefreshViolations() {
  var panel = _el('pmp2-violations');
  if (!panel || !_pmp2Plan) return;
  var list = PMP2_RuleEngine.getPlanViolations(_pmp2Plan);
  if (!list.length) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  panel.innerHTML =
    '<div class="pmp2-viol-hdr">⚠️ Plan Warnings (' + list.length + ')</div>' +
    list.map(function(v) {
      return '<div class="pmp2-viol-item">' +
        '<span class="pmp2-viol-icon">⚠️</span>' +
        '<span class="pmp2-viol-msg">' + _esc(v.msg) + '</span>' +
      '</div>';
    }).join('');
}

/** Show inline error in a meal slot */
function _pmp2SetErr(idx, meal, msg) {
  var el = _el('pmp2-err-' + idx + '-' + meal);
  if (!el) return;
  if (msg) { el.textContent = '⚠ ' + msg; el.style.display = 'block'; }
  else { el.textContent = ''; el.style.display = 'none'; }
}

/** Toast notification for PMP2 tab */
function _pmp2Toast(msg, type) {
  var e = _el('pmp2-toast'); if (!e) return;
  type = type || 'ok';
  e.textContent = msg;
  e.className = 'pmp2-toast pmp2-toast-' + type;
  e.style.opacity = '1'; e.style.pointerEvents = 'auto';
  clearTimeout(e._t);
  e._t = setTimeout(function(){ e.style.opacity = '0'; }, 3200);
}

/* ─────────────────────────────────────────────────────────
   PMP2 PUBLIC API  (called directly from HTML)
   ───────────────────────────────────────────────────────── */

/**
 * NEW FEATURE: Entity change handler — updates state, re-validates full plan.
 * Called from the entity selector: onchange="pmp2UpdateEntity(this.value)"
 */
function pmp2UpdateEntity(entity) {
  _pmp2Entity = entity;
  if (_pmp2Plan) {
    _pmp2Plan.entity = entity;
    PMP2_DataManager.save(_pmp2Plan);
    _pmp2RefreshViolations();
  }
  // UPDATED LOGIC: re-seed _fmdAll with new entity's SOP dishes
  // Clear SOP-injected entries so they get re-added for the new entity
  _fmdAll = _fmdAll.filter(function(d) { return !d._fromSOP; });
  _pmp2EnsureDishes().then(function() {
    if (_pmp2Plan) _pmp2RefreshStats();
    _pmp2Toast('🏢 Entity switched to ' + entity.toUpperCase() + '. Dropdown updated.');
  });
}

/** Create (or overwrite) a plan from the date picker */
function pmp2CreatePlan() {
  var inp = _el('pmp2-ctrl-date');
  var startDate = inp ? inp.value : _pmp2TodayStr();
  if (!startDate) { _pmp2Toast('Please select a start date.', 'err'); return; }
  if (_pmp2Plan) {
    var hasData = _pmp2Plan.days.some(function(d) {
      return _PMP2_MEALS.some(function(m){ return (d.meals[m]||[]).length > 0; });
    });
    if (hasData && !confirm('Creating a new plan will clear all current dishes. Continue?')) return;
  }
  _pmp2Plan = PMP2_DataManager.create(startDate);
  PMP2_DataManager.save(_pmp2Plan);
  _pmp2RenderGrid();
  _pmp2RefreshStats();
  _pmp2RefreshViolations();
  _pmp2Toast('✅ 15-day plan created from ' + startDate);
}

/** Clear all dishes (keep dates) */
function pmp2ResetPlan() {
  if (!confirm('Clear all planned dishes? (Plan dates will be preserved)')) return;
  if (_pmp2Plan) {
    _pmp2Plan = PMP2_DataManager.clearAll(_pmp2Plan);
    PMP2_DataManager.save(_pmp2Plan);
    _pmp2RenderGrid();
    _pmp2RefreshStats();
    _pmp2RefreshViolations();
    _pmp2Toast('Plan cleared.');
  }
}

/** Delete plan entirely */
function pmp2DeletePlan() {
  if (!confirm('Delete the entire plan from storage?')) return;
  try { localStorage.removeItem(_PMP2_LS_KEY); } catch(e) {}
  _pmp2Plan = null;
  // NEW FEATURE (Chart): destroy chart when plan is deleted
  if (_pmp2ChartInst) { _pmp2ChartInst.destroy(); _pmp2ChartInst = null; }
  var section = _el('pmp2-chart-section');
  if (section) section.style.display = 'none';
  _pmp2RenderSetup();
  _pmp2Toast('Plan deleted.');
}

/** UPDATED LOGIC: Add a dish — validates 7 rules, then clears input + closes dropdown */
function pmp2Add(dayIdx, meal) {
  if (!_pmp2Plan) return;
  var inp = _el('pmp2-inp-' + dayIdx + '-' + meal);
  if (!inp) return;
  var dishName = inp.value.trim();
  if (!dishName) { _pmp2SetErr(dayIdx, meal, 'Type or select a dish name first.'); return; }
  _pmp2SetErr(dayIdx, meal, '');

  var error = PMP2_RuleEngine.validate(_pmp2Plan, dayIdx, meal, dishName);
  if (error) {
    _pmp2SetErr(dayIdx, meal, error);
    return;
  }

  // Find canonical name from collection
  var match = _pmp2FindDish(dishName);
  var canon = match ? match.dish_name : dishName;

  _pmp2Plan = PMP2_DataManager.addDish(_pmp2Plan, dayIdx, meal, canon);
  PMP2_DataManager.save(_pmp2Plan);

  // NEW FEATURE: clear input + close dropdown on success
  inp.value = '';
  _pmp2HideDrop(dayIdx, meal);

  _pmp2RefreshCard(dayIdx);
  _pmp2RefreshStats();
  _pmp2RefreshViolations();
}

/** Remove a dish from a meal slot */
function pmp2Remove(dayIdx, meal, dishIdx) {
  if (!_pmp2Plan) return;
  _pmp2Plan = PMP2_DataManager.removeDish(_pmp2Plan, dayIdx, meal, dishIdx);
  PMP2_DataManager.save(_pmp2Plan);
  _pmp2RefreshCard(dayIdx);
  _pmp2RefreshStats();
  _pmp2RefreshViolations();
}

/** Clear all meals for one day */
function pmp2ClearDay(dayIdx) {
  if (!_pmp2Plan) return;
  if (!confirm('Clear all meals for Day ' + (dayIdx+1) + '?')) return;
  _pmp2Plan = PMP2_DataManager.clearDay(_pmp2Plan, dayIdx);
  PMP2_DataManager.save(_pmp2Plan);
  _pmp2RefreshCard(dayIdx);
  _pmp2RefreshStats();
  _pmp2RefreshViolations();
}

/** Update date for a day (auto-syncs day name) */
function pmp2UpdateDate(dayIdx, dateStr) {
  if (!_pmp2Plan) return;
  _pmp2Plan = PMP2_DataManager.updateDate(_pmp2Plan, dayIdx, dateStr);
  PMP2_DataManager.save(_pmp2Plan);
  // Update the day-name select to reflect the new day
  var sel = _el('pmp2-daysel-' + dayIdx);
  if (sel && _pmp2Plan.days[dayIdx]) sel.value = _pmp2Plan.days[dayIdx].day;
}

/** Update day name for a day */
function pmp2UpdateDayName(dayIdx, name) {
  if (!_pmp2Plan) return;
  _pmp2Plan = PMP2_DataManager.updateDayName(_pmp2Plan, dayIdx, name);
  PMP2_DataManager.save(_pmp2Plan);
}

/* ─────────────────────────────────────────────────────────
   PMP2 EXPORTER — PDF + Excel
   ───────────────────────────────────────────────────────── */

/**
 * NEW FEATURE: Export to PDF (3 pages, 5 days per page, landscape A4)
 * Uses jsPDF (already loaded in page)
 */
function pmp2ExportPDF() {
  if (!_pmp2Plan || !_pmp2Plan.days.length) { _pmp2Toast('No plan to export.', 'err'); return; }
  if (!window.jspdf) { _pmp2Toast('jsPDF library not loaded.', 'err'); return; }

  var doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  var MARGIN   = 10;
  var PAGE_W   = 277;   // 297 - 2×10 margins
  var PER_PAGE = 5;
  var COL_W    = Math.floor(PAGE_W / PER_PAGE);  // 55 mm per day column
  var TOTAL_PG = Math.ceil(15 / PER_PAGE);        // 3 pages

  var MC = {
    breakfast: [37,99,235],
    lunch:     [22,163,74],
    snacks:    [217,119,6],
    dinner:    [124,58,237]
  };
  var ML = { breakfast:'BREAKFAST', lunch:'LUNCH', snacks:'SNACKS', dinner:'DINNER' };

  for (var p = 0; p < TOTAL_PG; p++) {
    if (p > 0) doc.addPage();

    var startIdx = p * PER_PAGE;
    var pageDays = _pmp2Plan.days.slice(startIdx, startIdx + PER_PAGE);

    // Page header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 297, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('UNILIV — 15-Day Intelligent Menu Plan', MARGIN, 10);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Days ' + (startIdx+1) + '–' + Math.min(startIdx+PER_PAGE,15) + ' of 15  ·  Start: ' + _pmp2Plan.startDate,
      PAGE_W, 10, { align: 'right' }
    );

    // Day columns
    pageDays.forEach(function(day, ci) {
      var cx   = MARGIN + ci * COL_W;
      var cy   = 20;
      var didx = startIdx + ci;
      var noStar = !PMP2_RuleEngine.hasStarDish(_pmp2Plan, didx);

      // Day header background
      doc.setFillColor.apply(doc, noStar ? [245,158,11] : [30,41,59]);
      doc.rect(cx, cy, COL_W - 2, 11, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Day ' + (didx+1), cx + 2, cy + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text(day.day + ' · ' + day.date, cx + 2, cy + 9);
      cy += 13;

      // Meal sections
      _PMP2_MEALS.forEach(function(meal) {
        var mc    = MC[meal];
        var items = day.meals[meal] || [];

        // Meal label bar
        doc.setFillColor(mc[0], mc[1], mc[2]);
        doc.rect(cx, cy, COL_W - 2, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.text(ML[meal], cx + 2, cy + 3.5);
        cy += 5;

        if (!items.length) {
          doc.setTextColor(160, 160, 160);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(5.5);
          doc.text('(empty)', cx + 3, cy + 3.5);
          cy += 5;
        } else {
          items.forEach(function(name) {
            var info   = _pmp2FindDish(name);
            var prefix = (info && info.is_star) ? '★ ' : ((info && info.is_dal) ? '● ' : '· ');
            doc.setTextColor(info && info.is_star ? 161 : 40, info && info.is_star ? 98 : 40, 40);
            doc.setFont('helvetica', info && info.is_star ? 'bold' : 'normal');
            doc.setFontSize(5.5);
            var lines = doc.splitTextToSize(prefix + name, COL_W - 6);
            (lines.slice(0, 2)).forEach(function(line) {
              doc.text(line, cx + 3, cy + 3);
              cy += 4;
            });
          });
        }
        cy += 1; // gap between meals
      });
    });

    // Page footer
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Page ' + (p+1) + ' of ' + TOTAL_PG + '  ·  © UNILIV Food Intelligence  ·  Generated ' + new Date().toLocaleDateString('en-IN'),
      148.5, 208, { align: 'center' }
    );
  }

  doc.save('UNILIV_15Day_Intelligent_Menu.pdf');
  _pmp2Toast('📄 PDF exported!');
}

/**
 * NEW FEATURE: Export to Excel (.xlsx)
 * Columns: Day # | Date | Day Name | Breakfast | Lunch | Snacks | Dinner
 * Plus a "Warnings" sheet if violations exist
 */
function pmp2ExportExcel() {
  if (!_pmp2Plan || !_pmp2Plan.days.length) { _pmp2Toast('No plan to export.', 'err'); return; }
  if (!window.XLSX) { _pmp2Toast('SheetJS not loaded.', 'err'); return; }

  var hasData = _pmp2Plan.days.some(function(d) {
    return _PMP2_MEALS.some(function(m){ return (d.meals[m]||[]).length > 0; });
  });
  if (!hasData) { _pmp2Toast('Plan is empty. Add dishes first.', 'err'); return; }

  // Main plan sheet
  var rows = [['Day #', 'Date', 'Day Name', 'Breakfast', 'Lunch', 'Evening Snacks', 'Dinner']];
  _pmp2Plan.days.forEach(function(day, idx) {
    rows.push([
      'Day ' + (idx+1),
      day.date,
      day.day,
      (day.meals.breakfast || []).join(' | ') || '—',
      (day.meals.lunch     || []).join(' | ') || '—',
      (day.meals.snacks    || []).join(' | ') || '—',
      (day.meals.dinner    || []).join(' | ') || '—'
    ]);
  });

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [8, 14, 12, 32, 32, 28, 32].map(function(w){ return {wch:w}; });
  XLSX.utils.book_append_sheet(wb, ws, '15-Day Menu Plan');

  // Violations sheet
  var violations = PMP2_RuleEngine.getPlanViolations(_pmp2Plan);
  if (violations.length) {
    var vRows = [['Type', 'Day #', 'Warning']];
    violations.forEach(function(v) {
      vRows.push(['⚠ WARNING', 'Day ' + (v.dayIdx+1), v.msg]);
    });
    var vws = XLSX.utils.aoa_to_sheet(vRows);
    vws['!cols'] = [12, 8, 64].map(function(w){ return {wch:w}; });
    XLSX.utils.book_append_sheet(wb, vws, 'Plan Warnings');
  }

  XLSX.writeFile(wb, 'UNILIV_15Day_Intelligent_Menu.xlsx');
  _pmp2Toast('📊 Excel exported!');
}

/* END PMP2 MODULE */


/* ── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  _renderGrid(null);
  _stats();
});
