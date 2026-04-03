// /* ===========================================================
//    SHARED UTILITIES
//    =========================================================== */
// function toggleDarkMode() {
//   document.body.classList.toggle('dark-mode');
// }
// function toggleSidebar() {
//   document.getElementById('sidebar').classList.toggle('open');
// }
// function switchTab(e, tabId) {
//   document.querySelectorAll('.dashboard-content').forEach(t => t.classList.remove('active'));
//   document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
//   document.getElementById(tabId).classList.add('active');
//   e.currentTarget.classList.add('active');
//   // On mobile close sidebar
//   document.getElementById('sidebar').classList.remove('open');
//   // Init food menu if switching to it
//   if (tabId === 'foodMenuTab') fmdRender();
// }

// /* ===========================================================
//    ORGANOGRAM / PROPERTY DASHBOARD
//    =========================================================== */
// function dismissWelcome() {
//   const ws = document.getElementById('welcomeScreen');
//   ws.classList.add('hidden');
//   setTimeout(() => ws.style.display = 'none', 500);
// }
// // Auto-dismiss welcome after 2s
// setTimeout(dismissWelcome, 2000);

// function switchBrand() {
//   const brand = document.getElementById('brandSelect').value;
//   document.body.style.setProperty('--brand-accent', brand === 'huddle' ? '#3182ce' : '#e53e3e');
// }

// function generateCostBreakdown() {
//   const beds       = parseInt(document.getElementById('bedsInput').value)      || 0;
//   const rooms      = parseInt(document.getElementById('roomsInput').value)     || 0;
//   const area       = parseInt(document.getElementById('areaInput').value)      || 0;
//   const entries    = parseInt(document.getElementById('entriesInput').value)   || 0;
//   const properties = parseInt(document.getElementById('propertiesInput').value)|| 0;
//   const includeFood = document.getElementById('foodToggle').checked;
//   const brand      = document.getElementById('brandSelect').value;

//   if (!beds && !rooms && !area) {
//     alert('Please enter at least one value (Beds, Rooms, or Area) to generate analysis.');
//     return;
//   }

//   // Show loader
//   const loader = document.getElementById('loader');
//   loader.classList.add('show');

//   setTimeout(() => {
//     loader.classList.remove('show');
//     renderOrganogramOutput(beds, rooms, area, entries, properties, includeFood, brand);
//   }, 1400);
// }

// function renderOrganogramOutput(beds, rooms, area, entries, properties, includeFood, brand) {
//   // Cost constants
//   const HOUSEKEEPING_PER_BED   = 800;
//   const MAINTENANCE_PER_ROOM   = 1200;
//   const SECURITY_PER_ENTRY     = 15000;
//   const ADMIN_PER_PROPERTY     = 25000;
//   const UTILITIES_PER_SQFT     = 4;
//   const FOOD_PER_BED           = 3000;
//   const BRAND_MULTIPLIER       = brand === 'huddle' ? 1.15 : 1.0;

//   const housekeeping  = beds * HOUSEKEEPING_PER_BED * BRAND_MULTIPLIER;
//   const maintenance   = rooms * MAINTENANCE_PER_ROOM * BRAND_MULTIPLIER;
//   const security      = entries * SECURITY_PER_ENTRY * BRAND_MULTIPLIER;
//   const admin         = properties * ADMIN_PER_PROPERTY * BRAND_MULTIPLIER;
//   const utilities     = area * UTILITIES_PER_SQFT * BRAND_MULTIPLIER;
//   const food          = includeFood ? beds * FOOD_PER_BED * BRAND_MULTIPLIER : 0;
//   const total         = housekeeping + maintenance + security + admin + utilities + food;

//   const fmt = n => '₹' + n.toLocaleString('en-IN');

//   const categories = ['Housekeeping','Maintenance','Security','Admin','Utilities','Food'];
//   const values     = [housekeeping, maintenance, security, admin, utilities, food].filter((_, i) => i < 5 || includeFood);
//   const colors     = ['#e53e3e','#3182ce','#38a169','#805ad5','#dd6b20','#d69e2e'];

//   const canvasId = 'orgChart_' + Date.now();

//   document.getElementById('output').innerHTML = `
//     <div class="row g-3 mb-4">
//       ${[
//         ['Total Beds',       beds,           '#e53e3e'],
//         ['Total Rooms',      rooms,          '#3182ce'],
//         ['Total Area (sqft)',area.toLocaleString(),'#38a169'],
//         ['Total Cost',       fmt(total),     '#805ad5'],
//       ].map(([l,v,c]) => `
//         <div class="col-6 col-md-3">
//           <div class="kpi-card" style="background:${c}">
//             <div class="kpi-label">${l}</div>
//             <div class="kpi-val">${v}</div>
//           </div>
//         </div>`).join('')}
//     </div>

//     <div class="row g-4 mb-4">
//       <div class="col-md-7">
//         <div class="card glass-card p-3">
//           <h6 class="fw-semibold mb-3">Cost Breakdown by Category</h6>
//           <div class="chart-wrapper"><canvas id="${canvasId}"></canvas></div>
//         </div>
//       </div>
//       <div class="col-md-5">
//         <div class="card glass-card p-3 h-100">
//           <h6 class="fw-semibold mb-3">Detailed Breakdown</h6>
//           <table class="table table-sm output-table">
//             <thead><tr><th>Category</th><th class="text-end">Amount</th></tr></thead>
//             <tbody>
//               <tr><td>Housekeeping</td><td class="text-end">${fmt(housekeeping)}</td></tr>
//               <tr><td>Maintenance</td><td class="text-end">${fmt(maintenance)}</td></tr>
//               <tr><td>Security</td><td class="text-end">${fmt(security)}</td></tr>
//               <tr><td>Admin</td><td class="text-end">${fmt(admin)}</td></tr>
//               <tr><td>Utilities</td><td class="text-end">${fmt(utilities)}</td></tr>
//               ${includeFood ? `<tr><td>Food</td><td class="text-end">${fmt(food)}</td></tr>` : ''}
//               <tr class="table-dark fw-bold"><td>TOTAL</td><td class="text-end">${fmt(total)}</td></tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>`;

//   // Draw chart
//   new Chart(document.getElementById(canvasId), {
//     type: 'bar',
//     data: {
//       labels: includeFood ? categories : categories.slice(0,-1),
//       datasets: [{ label: 'Cost (₹)', data: values, backgroundColor: includeFood ? colors : colors.slice(0,-1), borderRadius: 6 }]
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: { legend: { display: false } },
//       scales: { y: { ticks: { callback: v => '₹' + (v/1000).toFixed(0)+'k' } } }
//     }
//   });
// }

// /* ===========================================================
//    FOOD MENU DASHBOARD
//    =========================================================== */
// const FMD_KEY = 'fmdVegDashV1';
// let fmdFilter = 'All', fmdEditId = null;

// const FMD_NON_VEG = [
//   'chicken','mutton','beef','pork','fish','prawn','shrimp','lamb',
//   'egg','eggs','turkey','bacon','ham','meat','tuna','salmon','crab',
//   'lobster','squid','octopus','anchovies','lard','gelatin','seafood',
//   'pepperoni','sausage','meatball'
// ];
// const FMD_CAT_COLORS = {
//   Breakfast:'#378ADD', Lunch:'#639922', Snacks:'#BA7517', Dinner:'#D85A30'
// };
// const FMD_CAT_CLASS = {
//   Breakfast:'fmd-cat-breakfast', Lunch:'fmd-cat-lunch',
//   Snacks:'fmd-cat-snacks', Dinner:'fmd-cat-dinner'
// };

// function fmdLoad() {
//   try { return JSON.parse(localStorage.getItem(FMD_KEY)) || []; } catch { return []; }
// }
// function fmdSave(d) { localStorage.setItem(FMD_KEY, JSON.stringify(d)); }
// function fmdEsc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
// function fmdFmtDate(ts) {
//   return new Date(ts).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
// }

// function fmdHasNonVeg(text) {
//   const lower = (text || '').toLowerCase();
//   return FMD_NON_VEG.some(nv => new RegExp('\\b' + nv + '\\b').test(lower));
// }
// function fmdCheckNonVeg(warnId, inputId) {
//   const val = document.getElementById(inputId).value;
//   document.getElementById(warnId).style.display = fmdHasNonVeg(val) ? 'block' : 'none';
// }

// function fmdToast(msg, type = 'ok') {
//   const el = document.getElementById('fmd-toast');
//   el.textContent = msg; el.className = 'fmd-toast ' + type; el.style.display = 'block';
//   clearTimeout(el._t);
//   el._t = setTimeout(() => { el.style.display = 'none'; }, 2600);
// }

// function fmdSubmit() {
//   const name = document.getElementById('fmd-inp-name').value.trim();
//   const cat  = document.getElementById('fmd-inp-cat').value;
//   const ing  = document.getElementById('fmd-inp-ing').value.trim();
//   if (!name) { fmdToast('Please enter a dish name.', 'err'); return; }
//   if (!cat)  { fmdToast('Please select a category.', 'err'); return; }
//   if (fmdHasNonVeg(ing)) { fmdToast('Non-veg ingredient detected! Only vegetarian dishes allowed.', 'err'); return; }
//   const dishes = fmdLoad();
//   dishes.unshift({ id: Date.now(), name, cat, ing, ts: Date.now() });
//   fmdSave(dishes);
//   fmdCancelEdit();
//   fmdToast('Vegetarian dish added!');
//   fmdRender();
// }

// function fmdCancelEdit() {
//   fmdEditId = null;
//   document.getElementById('fmd-inp-name').value = '';
//   document.getElementById('fmd-inp-cat').value  = '';
//   document.getElementById('fmd-inp-ing').value  = '';
//   document.getElementById('fmd-nv-warn').style.display = 'none';
//   document.getElementById('fmd-form-title').textContent = 'Add a vegetarian dish';
//   document.getElementById('fmd-btn-submit').textContent = '+ Add Dish';
// }

// function fmdDeleteDish(id) {
//   if (!confirm('Remove this dish?')) return;
//   fmdSave(fmdLoad().filter(d => d.id !== id));
//   fmdRender(); fmdToast('Dish removed.');
// }

// function fmdOpenEdit(id) {
//   const d = fmdLoad().find(x => x.id === id); if (!d) return;
//   document.getElementById('fmd-m-name').value = d.name;
//   document.getElementById('fmd-m-cat').value  = d.cat;
//   document.getElementById('fmd-m-ing').value  = d.ing || '';
//   document.getElementById('fmd-m-nv-warn').style.display = 'none';
//   document.getElementById('fmd-modal-title').textContent = 'Edit: ' + d.name;
//   fmdEditId = id;
//   document.getElementById('fmd-modal-overlay').classList.add('open');
// }
// function fmdCloseModal() {
//   document.getElementById('fmd-modal-overlay').classList.remove('open');
//   fmdEditId = null;
// }
// function fmdSaveEdit() {
//   const name = document.getElementById('fmd-m-name').value.trim();
//   const cat  = document.getElementById('fmd-m-cat').value;
//   const ing  = document.getElementById('fmd-m-ing').value.trim();
//   if (!name || !cat) { alert('Name and category are required.'); return; }
//   if (fmdHasNonVeg(ing)) { alert('Non-veg ingredients detected!'); return; }
//   fmdSave(fmdLoad().map(d => d.id === fmdEditId ? { ...d, name, cat, ing } : d));
//   fmdCloseModal(); fmdRender(); fmdToast('Dish updated!');
// }

// function fmdSetFilter(el) {
//   fmdFilter = el.dataset.f;
//   document.querySelectorAll('.fmd-chip').forEach(c => c.classList.remove('active'));
//   el.classList.add('active');
//   fmdRender();
// }
// function fmdClearAll() {
//   if (!confirm('Delete ALL dishes? This cannot be undone.')) return;
//   fmdSave([]); fmdRender(); fmdToast('All dishes cleared.');
// }

// const FMD_SAMPLES = [
//   { name:'Masala Dosa',          cat:'Breakfast', ing:'rice flour, urad dal, potato, onion, mustard seeds, curry leaves, ghee' },
//   { name:'Poha',                 cat:'Breakfast', ing:'flattened rice, onion, green chilli, turmeric, coriander, lemon' },
//   { name:'Upma',                 cat:'Breakfast', ing:'semolina, onion, mustard seeds, green chilli, curry leaves, cashew' },
//   { name:'Idli Sambar',          cat:'Breakfast', ing:'idli batter, toor dal, tamarind, tomato, onion, drumstick, spices' },
//   { name:'Paneer Butter Masala', cat:'Lunch',     ing:'paneer, tomato, butter, cream, spices, fenugreek leaves' },
//   { name:'Dal Tadka',            cat:'Lunch',     ing:'yellow lentils, onion, tomato, garlic, cumin, ghee, coriander' },
//   { name:'Rajma Chawal',         cat:'Lunch',     ing:'kidney beans, basmati rice, onion, tomato, garam masala, ginger, garlic' },
//   { name:'Chole Bhature',        cat:'Lunch',     ing:'chickpeas, maida, onion, tomato, spices, coriander' },
//   { name:'Samosa',               cat:'Snacks',    ing:'maida, potato, peas, garam masala, ginger, coriander' },
//   { name:'Vada Pav',             cat:'Snacks',    ing:'potato, bread roll, chutney, garlic, green chilli, mustard' },
//   { name:'Pav Bhaji',            cat:'Snacks',    ing:'mixed vegetables, butter, pav bread, spices, lemon, onion' },
//   { name:'Dhokla',               cat:'Snacks',    ing:'besan, yogurt, ginger, green chilli, mustard seeds, curry leaves' },
//   { name:'Palak Paneer',         cat:'Dinner',    ing:'spinach, paneer, onion, tomato, cream, garam masala, garlic' },
//   { name:'Aloo Matar',           cat:'Dinner',    ing:'potato, peas, tomato, cumin, turmeric, coriander, ginger' },
//   { name:'Vegetable Biryani',    cat:'Dinner',    ing:'basmati rice, mixed vegetables, saffron, onion, whole spices, yogurt, ghee' },
//   { name:'Baingan Bharta',       cat:'Dinner',    ing:'brinjal, onion, tomato, garlic, green chilli, mustard oil, spices' },
// ];

// function fmdLoadSamples() {
//   const ex = fmdLoad(), names = new Set(ex.map(d => d.name));
//   const toAdd = FMD_SAMPLES.filter(s => !names.has(s.name));
//   if (!toAdd.length) { fmdToast('Samples already loaded.', 'err'); return; }
//   const added = toAdd.map((s, i) => ({ id: Date.now() + i, ...s, ts: Date.now() + i }));
//   fmdSave([...added, ...ex]);
//   fmdRender();
//   fmdToast(added.length + ' vegetarian dishes added!');
// }

// function fmdRenderChart(dishes) {
//   const cats = ['Breakfast','Lunch','Snacks','Dinner'];
//   const counts = Object.fromEntries(cats.map(c => [c, dishes.filter(d => d.cat === c).length]));
//   const max = Math.max(...Object.values(counts), 1);
//   document.getElementById('fmd-chart').innerHTML = cats.map(c => `
//     <div class="fmd-chart-row">
//       <div class="fmd-chart-label">${c}</div>
//       <div class="fmd-chart-track">
//         <div class="fmd-chart-fill" style="width:${Math.round(counts[c]/max*100)}%;background:${FMD_CAT_COLORS[c]}"></div>
//       </div>
//       <div class="fmd-chart-count" style="color:${FMD_CAT_COLORS[c]}">${counts[c]}</div>
//     </div>`).join('');
// }

// function fmdRender() {
//   const all = fmdLoad();
//   let list = all.slice();
//   if (fmdFilter !== 'All') list = list.filter(d => d.cat === fmdFilter);
//   const q = (document.getElementById('fmd-search')?.value || '').toLowerCase().trim();
//   if (q) list = list.filter(d =>
//     d.name.toLowerCase().includes(q) || (d.ing || '').toLowerCase().includes(q)
//   );
//   const sort = document.getElementById('fmd-sort')?.value || 'newest';
//   if (sort === 'oldest') list.sort((a, b) => a.ts - b.ts);
//   else if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
//   else if (sort === 'za') list.sort((a, b) => b.name.localeCompare(a.name));

//   const cards = document.getElementById('fmd-cards');
//   if (!cards) return;

//   if (!list.length) {
//     cards.innerHTML = `
//       <div class="fmd-empty">
//         <svg viewBox="0 0 24 24"><path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z"/><path d="M12 2v20"/></svg>
//         <p>${all.length ? 'No dishes match your search or filter.' : 'No dishes yet. Add one or click "Load samples"!'}</p>
//       </div>`;
//   } else {
//     cards.innerHTML = list.map(d => {
//       const ingList = (d.ing || '').split(',').map(s => s.trim()).filter(Boolean);
//       const tags = ingList.slice(0, 4).map(t => `<span class="fmd-tag">${fmdEsc(t)}</span>`).join('');
//       const more = ingList.length > 4 ? `<span class="fmd-tag more">+${ingList.length - 4}</span>` : '';
//       return `
//         <div class="fmd-card">
//           <span class="fmd-cat-badge ${FMD_CAT_CLASS[d.cat] || ''}">${d.cat}</span>
//           <div class="fmd-card-name">${fmdEsc(d.name)}</div>
//           <div>${tags}${more}</div>
//           <div class="fmd-card-footer">
//             <span class="fmd-card-date">${fmdFmtDate(d.ts)}</span>
//             <div class="fmd-card-actions">
//               <button class="fmd-icon-btn edit" onclick="fmdOpenEdit(${d.id})" title="Edit">✎</button>
//               <button class="fmd-icon-btn del"  onclick="fmdDeleteDish(${d.id})" title="Delete">✕</button>
//             </div>
//           </div>
//         </div>`;
//     }).join('');
//   }

//   const ingTotal = all.reduce((n, d) => n + (d.ing ? d.ing.split(',').filter(s => s.trim()).length : 0), 0);
//   const catCounts = ['Breakfast','Lunch','Snacks','Dinner']
//     .map(c => ({ c, n: all.filter(d => d.cat === c).length }))
//     .sort((a, b) => b.n - a.n);

//   document.getElementById('fmd-st-total').textContent = all.length;
//   document.getElementById('fmd-st-ing').textContent   = ingTotal;
//   document.getElementById('fmd-st-top').textContent   = all.length && catCounts[0].n > 0 ? catCounts[0].c : '—';
//   document.getElementById('fmd-st-last').textContent  = all.length ? fmdFmtDate(all[0].ts) : '—';
//   fmdRenderChart(all);
// }

// /* Keyboard shortcut: Enter to add dish */
// document.getElementById('fmd-inp-name')
//   .addEventListener('keydown', e => { if (e.key === 'Enter') fmdSubmit(); });

// /* Close modal on backdrop click */
// document.getElementById('fmd-modal-overlay')
//   .addEventListener('click', e => {
//     if (e.target === document.getElementById('fmd-modal-overlay')) fmdCloseModal();
//   });

// /* Initial render */
// fmdRender();




/* ===========================================================
   GLOBAL CONFIG / STATE
   =========================================================== */
let CURRENT_BRAND = "uniliv";
let pieChart, barChart;

const BRAND_CONFIG = {
  uniliv: {
    foodCost: 3000,
    laundryCost: 400,
    wifiCost: 179,
    pantryHRA: 1400,
    unitManagerMultiplier: 2,

    // Manpower Salary (Premium)
    salaryMultiplier: 1
  },

  huddle: {
    foodCost: 2500,
    laundryCost: 300,
    wifiCost: 120,
    pantryHRA: 1000,
    unitManagerMultiplier: 1,

    // Lower salaries (Budget model)
    salaryMultiplier: 0.8
  }
};

function switchBrand() {
  CURRENT_BRAND = document.getElementById("brandSelect").value;
  applyTheme();
}

// ================= TAB SWITCH =================
function switchTab(eventOrTab, element) {
  const foodNav = document.getElementById('foodSidebarNav');

  let tabName, tabElement;

  // ================================
  // CASE 1: MAIN TAB CLICK
  // ================================
  if (typeof eventOrTab === "object") {
    tabElement = eventOrTab.currentTarget;
    tabName = element;

    // Highlight main buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    tabElement.classList.add('active');

    // Show correct main content
    document.querySelectorAll('.main-tab').forEach(tab => tab.style.display = 'none');
    const activeMain = document.getElementById(tabName);
    if (activeMain) activeMain.style.display = 'block';

    // ✅ Toggle secondary sidebar
    if (tabName === 'foodMenuTab') {
      foodNav.style.display = 'flex';
    } else {
      foodNav.style.display = 'none';
    }

    return; // ⛔ STOP here (important)
  }

  // ================================
  // CASE 2: INNER FOOD TABS
  // ================================
  tabName = eventOrTab;
  tabElement = element;

  // Switch inner content
  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const activeSection = document.getElementById(tabName);
  if (activeSection) activeSection.classList.add('active');

  // Highlight sidebar nav items
  document.querySelectorAll('#foodSidebarNav .nav-item').forEach(nav => {
    nav.classList.remove('active');
  });

  if (tabElement) tabElement.classList.add('active');
}

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("welcomeScreen").style.display = "flex";

  setTimeout(() => {
    document.getElementById("welcomeScreen").style.display = "none";
  }, 2000);

  applyTheme(); // apply default theme
});

// ================= DARK MODE =================
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// ================= Toggle Button =================

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("open");
}

document.addEventListener("click", function (e) {
  const sidebar = document.querySelector(".sidebar");
  const btn = document.querySelector(".btn");

  if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
    sidebar.classList.remove("open");
  }
});

// ================= LOADER =================
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function switchTab(event, tabId) {

    const overlay = document.getElementById("globalOverlay");
    const sidebar = document.getElementById("sidebar");

    // Hide sidebar during loading
    if (sidebar) sidebar.style.display = "none";

    // Remove active classes
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    // Show loader
    if (overlay) overlay.style.display = "flex";

    setTimeout(() => {

        // Hide all dashboards
        document.querySelectorAll(".dashboard-content").forEach(tab => {
            tab.style.display = "none";
        });

        // Show selected tab
        document.getElementById(tabId).style.display = "block";

        // Hide loader
        if (overlay) overlay.style.display = "none";

        // Show sidebar again AFTER loading
        if (sidebar) sidebar.style.display = "block";

        window.scrollTo(0, 0);

    }, 800);
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("welcomeScreen").style.display = "flex";

  setTimeout(() => {
    document.getElementById("welcomeScreen").style.display = "none";
  }, 2000);
});

/* ===========================================================
   UTILITIES
   =========================================================== */
function showLoader() {
  const el = document.getElementById("loader");
  if (el) el.style.display = "flex";
}
function hideLoader() {
  const el = document.getElementById("loader");
  if (el) el.style.display = "none";
}

/* ===========================================================
   MAIN GENERATOR
   =========================================================== */
function generateCostBreakdown() {

  showLoader();

  setTimeout(() => {

    const beds = +document.getElementById("bedsInput").value;
    const rooms = +document.getElementById("roomsInput").value;
    const area = +document.getElementById("areaInput").value;
    const entries = +document.getElementById("entriesInput")?.value || 1;   // ✅ FIXED
    const properties = +document.getElementById("propertiesInput")?.value || 1; // ✅ FIXED
    const includeFood = document.getElementById("foodToggle").checked;

    const result = calculateCost(beds, rooms, area, entries, includeFood, properties); // ✅ FIXED

    if (!result) return hideLoader();

    const {
      operational,
      manpowerDetails,
      manpowerTotal,
      rentalAssets,
      rentalTotal,
      buyingDetails,
      buyingTotal,
      grandTotal,
      costPerBed,
      analyticsData
    } = result;

    const { manpower, food, laundry, rm, hk, wifi, rental, buying } = analyticsData;

    document.getElementById("output").innerHTML = `
    <div class="row g-3 mb-4">
      <div class="col-md-3"><div class="card p-3 text-center"><h6>Total</h6><h4>₹ ${grandTotal.toLocaleString()}</h4></div></div>
      <div class="col-md-3"><div class="card p-3 text-center"><h6>Per Bed</h6><h4>₹ ${costPerBed.toFixed(0)}</h4></div></div>
      <div class="col-md-3"><div class="card p-3 text-center"><h6>Manpower</h6><h4>₹ ${manpowerTotal.toLocaleString()}</h4></div></div>
      <div class="col-md-3"><div class="card p-3 text-center"><h6>Operational</h6><h4>₹ ${operational.total.toLocaleString()}</h4></div></div>
    </div>

    <div class="row mb-4">
      <div class="col-md-6"><canvas id="pieChart"></canvas></div>
      <div class="col-md-6"><canvas id="barChart"></canvas></div>
    </div>

    ${generateOperationalTable(operational, beds, area)}
    ${generateManpowerTable(manpowerDetails)}
    ${generateRentalTable(rentalAssets)}
    ${generateBuyingTable(buyingDetails)}
    `;

    renderCharts(manpower, food, laundry, rm, hk, wifi, rental, buying);

    hideLoader();

  }, 500);
}

/* ===========================================================
   COST ENGINE (UNCHANGED LOGIC)
   =========================================================== */
function calculateCost(beds, rooms, area, entries = 1, includeFood = true, properties = 1) {

  const config = BRAND_CONFIG[CURRENT_BRAND];
  if (!config) return null;

  if (beds <= 0 || rooms <= 0 || area <= 0) return null;

  /* RENTAL */
  const rentalAssets = [
    { name: "Snack Vending Machine", rent: 0, perProperty: true },
    { name: "Sanitary Pad Machine", rent: 0, ratio: 200 },
    { name: "Coffee Machine", rent: 0, ratio: 200 },
    { name: "RO", rent: 0, ratio: 200 }
  ];

  let rentalTotal = 0;

  rentalAssets.forEach(asset => {
    const qty = asset.perProperty ? properties : Math.ceil(beds / asset.ratio);
    asset.qty = qty;
    asset.total = qty * asset.rent;
    rentalTotal += asset.total;
  });

  /* BUYING */
  const buyingAssets = [
    { name: "Microwave", ratio: 50, cost: 0 },
    { name: "Toaster", ratio: 50, cost: 0 },
    { name: "Induction", ratio: 50, cost: 0 }
  ];

  let buyingTotal = 0;

  buyingAssets.forEach(a => {
    a.qty = Math.ceil(beds / a.ratio);
    a.total = a.qty * a.cost;
    buyingTotal += a.total;
  });

  /* OPERATIONAL */
  const operational = {
    food: includeFood ? beds * config.foodCost : 0,
    laundry: beds * config.laundryCost,
    rm: beds * 98,
    housekeepingMaterial: area * 0.4,
    wifi: beds * config.wifiCost
  };

  operational.total = Object.values(operational).reduce((a, b) => a + b, 0);

  /* MANPOWER */
  const roles = [
    { role: "Zonal Head", ratio: 5000, salary: 100000, type: "beds" },
    { role: "City Head", ratio: 3000, salary: 70000, type: "beds" },
    { role: "Cluster Manager", ratio: 1000, salary: 40000, type: "beds" },
    { role: "Deputy Cluster Manager", ratio: 300, salary: 35000, type: "beds" },
    { role: "Unit Manager", ratio: 250, salary: 25000, type: "beds" },
    { role: "Care Desk Executive", ratio: 1000, salary: 20000, type: "beds" },
    { role: "R&M Supervisor", ratio: 2000, salary: 25000, type: "beds" },
    { role: "MST Technician", ratio: 600, salary: 20000, type: "beds" },
    { role: "Pantry Boy", ratio: 75, salary: 15000, type: "beds" },
    { role: "Security Guard", perEntry: 2, salary: 16000, type: "entry" },
    { role: "Housekeeping Staff", ratio: 25, salary: 16000, type: "rooms" }
  ];

  let manpowerDetails = [];
  let manpowerTotal = 0;

  roles.forEach(role => {

  let headcount = 0;
 let salary = role.salary * config.salaryMultiplier;

  if (role.type === "entry") {
    headcount = role.perEntry * entries;

  } else {
    const base = role.type === "rooms" ? rooms : beds;

    // ✅ Only activate role if base meets its threshold
    if (base < role.ratio) {
      return;
    }

    const fullUnits = Math.floor(base / role.ratio);
    const remainder = base % role.ratio;

    let units = 0;

    // ✅ 25% buffer logic
    if (remainder > (0.25 * role.ratio)) {
      units = fullUnits + 1;
    } else {
      units = fullUnits;
    }

    // ✅ Special Rule: Unit Manager → 2 per unit
   if (role.role === "Unit Manager") {
  headcount = units * config.unitManagerMultiplier;
}else {
      headcount = units;
    }
  }

  // ✅ Pantry Boy HRA addition
if (role.role === "Pantry Boy") {
  salary += config.pantryHRA;
}

  const total = headcount * salary;

  manpowerDetails.push({
    role: role.role,
    coverage: role.type === "entry"
      ? `${role.perEntry} per entry`
      : role.role === "Unit Manager"
        ? `2 per ${role.ratio} ${role.type}`
        : `1 per ${role.ratio} ${role.type}`,
    headcount,
    salary,
    total
  });

  manpowerTotal += total;
});

  // ================= FINAL CALCULATION =================
  const grandTotal = manpowerTotal + operational.total + buyingTotal;
  const costPerBed = grandTotal / beds;

  return {
    operational,
    manpowerDetails,
    manpowerTotal,
    rentalAssets,
    rentalTotal,
    buyingDetails: buyingAssets,
    buyingTotal,
    grandTotal,
    costPerBed,
    analyticsData: {
      manpower: manpowerTotal,
      food: operational.food,
      laundry: operational.laundry,
      rm: operational.rm,
      hk: operational.housekeepingMaterial,
      wifi: operational.wifi,
      rental: rentalTotal,
      buying: buyingTotal
    }
  };
}

/* ===========================================================
   TABLES
   =========================================================== */

/* ===========================================================
   TABLES (FULLY RESPONSIVE + DETAILED)
   =========================================================== */

function generateOperationalTable(op, beds, area) {
  return `
  <div class="card p-3 mb-4">
    <h5>Operational</h5>
    <div class="table-container">
      <table class="table table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th>Component</th>
            <th>Calculation</th>
            <th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Component">Food</td>
            <td data-label="Calculation">${beds} × ${op.food / (beds || 1)}</td>
            <td data-label="Total">₹ ${op.food.toLocaleString()}</td>
          </tr>
          <tr>
            <td data-label="Component">Laundry</td>
            <td data-label="Calculation">${beds} × ${op.laundry / (beds || 1)}</td>
            <td data-label="Total">₹ ${op.laundry.toLocaleString()}</td>
          </tr>
          <tr>
            <td data-label="Component">Repairs & Maintenance</td>
            <td data-label="Calculation">${beds} × 98</td>
            <td data-label="Total">₹ ${op.rm.toLocaleString()}</td>
          </tr>
          <tr>
            <td data-label="Component">Housekeeping Material</td>
            <td data-label="Calculation">${area} × 0.4</td>
            <td data-label="Total">₹ ${op.housekeepingMaterial.toLocaleString()}</td>
          </tr>
          <tr>
            <td data-label="Component">WiFi</td>
            <td data-label="Calculation">${beds} × ${op.wifi / (beds || 1)}</td>
            <td data-label="Total">₹ ${op.wifi.toLocaleString()}</td>
          </tr>
          <tr class="table-dark">
            <td colspan="2"><b>Total</b></td>
            <td><b>₹ ${op.total.toLocaleString()}</b></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`;
}


function generateManpowerTable(data) {

  const total = data.reduce((s, d) => s + d.total, 0);

  return `
  <div class="card p-3 mb-4">
    <h5>Manpower</h5>
    <div class="table-container">
      <table class="table table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th>Role</th>
            <th>Headcount</th>
            <th>Salary</th>
            <th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(d => `
            <tr>
              <td data-label="Role">${d.role}</td>
              <td data-label="Headcount">${d.headcount}</td>
              <td data-label="Salary">₹ ${d.salary.toLocaleString()}</td>
              <td data-label="Total">₹ ${d.total.toLocaleString()}</td>
            </tr>
          `).join("")}
          <tr class="table-dark">
            <td colspan="3"><b>Total</b></td>
            <td><b>₹ ${total.toLocaleString()}</b></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`;
}


function generateRentalTable(data) {

  const total = data.reduce((s, d) => s + d.total, 0);

  return `
  <div class="card p-3 mb-4">
    <h5>Rental</h5>
    <div class="table-container">
      <table class="table table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th>Asset</th>
            <th>Qty</th>
            <th>Rent</th>
            <th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(d => `
            <tr>
              <td data-label="Asset">${d.name}</td>
              <td data-label="Qty">${d.qty}</td>
              <td data-label="Rent">₹ ${d.rent}</td>
              <td data-label="Total">₹ ${d.total.toLocaleString()}</td>
            </tr>
          `).join("")}
          <tr class="table-dark">
            <td colspan="3"><b>Total</b></td>
            <td><b>₹ ${total.toLocaleString()}</b></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`;
}


function generateBuyingTable(data) {

  const total = data.reduce((s, d) => s + d.total, 0);

  return `
  <div class="card p-3 mb-4">
    <h5>Buying</h5>
    <div class="table-container">
      <table class="table table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th>Asset</th>
            <th>Qty</th>
            <th>Unit Cost</th>
            <th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(d => `
            <tr>
              <td data-label="Asset">${d.name}</td>
              <td data-label="Qty">${d.qty}</td>
              <td data-label="Unit Cost">₹ ${d.cost}</td>
              <td data-label="Total">₹ ${d.total.toLocaleString()}</td>
            </tr>
          `).join("")}
          <tr class="table-dark">
            <td colspan="3"><b>Total</b></td>
            <td><b>₹ ${total.toLocaleString()}</b></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

/* ===========================================================
   CHARTS
   =========================================================== */
function renderCharts(...values) {

  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();

  const labels = ["Manpower","Food","Laundry","R&M","HK","WiFi","Rental","Buying"];

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: { labels, datasets: [{ data: values }] }
  });

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: { labels, datasets: [{ data: values }] }
  });
}

/* ===========================================================
   WELCOME FIX
   =========================================================== */
function dismissWelcome() {
  const welcome = document.getElementById("welcomeScreen");
  if (welcome) {
    welcome.style.opacity = "0";
    setTimeout(() => {
      welcome.style.display = "none";
    }, 300);
  }
}

/* ===========================================================
   FOOD MENU DASHBOARD
   =========================================================== */
const FMD_KEY = 'fmdVegDashV1';
let fmdFilter = 'All', fmdEditId = null;

const FMD_NON_VEG = [
  'chicken','mutton','beef','pork','fish','prawn','shrimp','lamb',
  'egg','eggs','turkey','bacon','ham','meat','tuna','salmon','crab',
  'lobster','squid','octopus','anchovies','lard','gelatin','seafood',
  'pepperoni','sausage','meatball'
];
const FMD_CAT_COLORS = {
  Breakfast:'#378ADD', Lunch:'#639922', Snacks:'#BA7517', Dinner:'#D85A30'
};
const FMD_CAT_CLASS = {
  Breakfast:'fmd-cat-breakfast', Lunch:'fmd-cat-lunch',
  Snacks:'fmd-cat-snacks', Dinner:'fmd-cat-dinner'
};

function fmdLoad() {
  try { return JSON.parse(localStorage.getItem(FMD_KEY)) || []; } catch { return []; }
}
function fmdSave(d) { localStorage.setItem(FMD_KEY, JSON.stringify(d)); }
function fmdEsc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function fmdFmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function fmdHasNonVeg(text) {
  const lower = (text || '').toLowerCase();
  return FMD_NON_VEG.some(nv => new RegExp('\\b' + nv + '\\b').test(lower));
}
function fmdCheckNonVeg(warnId, inputId) {
  const val = document.getElementById(inputId).value;
  document.getElementById(warnId).style.display = fmdHasNonVeg(val) ? 'block' : 'none';
}

function fmdToast(msg, type = 'ok') {
  const el = document.getElementById('fmd-toast');
  el.textContent = msg; el.className = 'fmd-toast ' + type; el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = 'none'; }, 2600);
}

function fmdSubmit() {
  const name = document.getElementById('fmd-inp-name').value.trim();
  const cat  = document.getElementById('fmd-inp-cat').value;
  const ing  = document.getElementById('fmd-inp-ing').value.trim();
  if (!name) { fmdToast('Please enter a dish name.', 'err'); return; }
  if (!cat)  { fmdToast('Please select a category.', 'err'); return; }
  if (fmdHasNonVeg(ing)) { fmdToast('Non-veg ingredient detected! Only vegetarian dishes allowed.', 'err'); return; }
  const dishes = fmdLoad();
  dishes.unshift({ id: Date.now(), name, cat, ing, ts: Date.now() });
  fmdSave(dishes);
  fmdCancelEdit();
  fmdToast('Vegetarian dish added!');
  fmdRender();
}

function fmdCancelEdit() {
  fmdEditId = null;
  document.getElementById('fmd-inp-name').value = '';
  document.getElementById('fmd-inp-cat').value  = '';
  document.getElementById('fmd-inp-ing').value  = '';
  document.getElementById('fmd-nv-warn').style.display = 'none';
  document.getElementById('fmd-form-title').textContent = 'Add a vegetarian dish';
  document.getElementById('fmd-btn-submit').textContent = '+ Add Dish';
}

function fmdDeleteDish(id) {
  if (!confirm('Remove this dish?')) return;
  fmdSave(fmdLoad().filter(d => d.id !== id));
  fmdRender(); fmdToast('Dish removed.');
}

function fmdOpenEdit(id) {
  const d = fmdLoad().find(x => x.id === id); if (!d) return;
  document.getElementById('fmd-m-name').value = d.name;
  document.getElementById('fmd-m-cat').value  = d.cat;
  document.getElementById('fmd-m-ing').value  = d.ing || '';
  document.getElementById('fmd-m-nv-warn').style.display = 'none';
  document.getElementById('fmd-modal-title').textContent = 'Edit: ' + d.name;
  fmdEditId = id;
  document.getElementById('fmd-modal-overlay').classList.add('open');
}
function fmdCloseModal() {
  document.getElementById('fmd-modal-overlay').classList.remove('open');
  fmdEditId = null;
}
function fmdSaveEdit() {
  const name = document.getElementById('fmd-m-name').value.trim();
  const cat  = document.getElementById('fmd-m-cat').value;
  const ing  = document.getElementById('fmd-m-ing').value.trim();
  if (!name || !cat) { alert('Name and category are required.'); return; }
  if (fmdHasNonVeg(ing)) { alert('Non-veg ingredients detected!'); return; }
  fmdSave(fmdLoad().map(d => d.id === fmdEditId ? { ...d, name, cat, ing } : d));
  fmdCloseModal(); fmdRender(); fmdToast('Dish updated!');
}

function fmdSetFilter(el) {
  fmdFilter = el.dataset.f;
  document.querySelectorAll('.fmd-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  fmdRender();
}
function fmdClearAll() {
  if (!confirm('Delete ALL dishes? This cannot be undone.')) return;
  fmdSave([]); fmdRender(); fmdToast('All dishes cleared.');
}

const FMD_SAMPLES = [
  { name:'Masala Dosa',          cat:'Breakfast', ing:'rice flour, urad dal, potato, onion, mustard seeds, curry leaves, ghee' },
  { name:'Poha',                 cat:'Breakfast', ing:'flattened rice, onion, green chilli, turmeric, coriander, lemon' },
  { name:'Upma',                 cat:'Breakfast', ing:'semolina, onion, mustard seeds, green chilli, curry leaves, cashew' },
  { name:'Idli Sambar',          cat:'Breakfast', ing:'idli batter, toor dal, tamarind, tomato, onion, drumstick, spices' },
  { name:'Paneer Butter Masala', cat:'Lunch',     ing:'paneer, tomato, butter, cream, spices, fenugreek leaves' },
  { name:'Dal Tadka',            cat:'Lunch',     ing:'yellow lentils, onion, tomato, garlic, cumin, ghee, coriander' },
  { name:'Rajma Chawal',         cat:'Lunch',     ing:'kidney beans, basmati rice, onion, tomato, garam masala, ginger, garlic' },
  { name:'Chole Bhature',        cat:'Lunch',     ing:'chickpeas, maida, onion, tomato, spices, coriander' },
  { name:'Samosa',               cat:'Snacks',    ing:'maida, potato, peas, garam masala, ginger, coriander' },
  { name:'Vada Pav',             cat:'Snacks',    ing:'potato, bread roll, chutney, garlic, green chilli, mustard' },
  { name:'Pav Bhaji',            cat:'Snacks',    ing:'mixed vegetables, butter, pav bread, spices, lemon, onion' },
  { name:'Dhokla',               cat:'Snacks',    ing:'besan, yogurt, ginger, green chilli, mustard seeds, curry leaves' },
  { name:'Palak Paneer',         cat:'Dinner',    ing:'spinach, paneer, onion, tomato, cream, garam masala, garlic' },
  { name:'Aloo Matar',           cat:'Dinner',    ing:'potato, peas, tomato, cumin, turmeric, coriander, ginger' },
  { name:'Vegetable Biryani',    cat:'Dinner',    ing:'basmati rice, mixed vegetables, saffron, onion, whole spices, yogurt, ghee' },
  { name:'Baingan Bharta',       cat:'Dinner',    ing:'brinjal, onion, tomato, garlic, green chilli, mustard oil, spices' },
];

function fmdLoadSamples() {
  const ex = fmdLoad(), names = new Set(ex.map(d => d.name));
  const toAdd = FMD_SAMPLES.filter(s => !names.has(s.name));
  if (!toAdd.length) { fmdToast('Samples already loaded.', 'err'); return; }
  const added = toAdd.map((s, i) => ({ id: Date.now() + i, ...s, ts: Date.now() + i }));
  fmdSave([...added, ...ex]);
  fmdRender();
  fmdToast(added.length + ' vegetarian dishes added!');
}

function fmdRenderChart(dishes) {
  const cats = ['Breakfast','Lunch','Snacks','Dinner'];
  const counts = Object.fromEntries(cats.map(c => [c, dishes.filter(d => d.cat === c).length]));
  const max = Math.max(...Object.values(counts), 1);
  document.getElementById('fmd-chart').innerHTML = cats.map(c => `
    <div class="fmd-chart-row">
      <div class="fmd-chart-label">${c}</div>
      <div class="fmd-chart-track">
        <div class="fmd-chart-fill" style="width:${Math.round(counts[c]/max*100)}%;background:${FMD_CAT_COLORS[c]}"></div>
      </div>
      <div class="fmd-chart-count" style="color:${FMD_CAT_COLORS[c]}">${counts[c]}</div>
    </div>`).join('');
}

function fmdRender() {
  const all = fmdLoad();
  let list = all.slice();
  if (fmdFilter !== 'All') list = list.filter(d => d.cat === fmdFilter);
  const q = (document.getElementById('fmd-search')?.value || '').toLowerCase().trim();
  if (q) list = list.filter(d =>
    d.name.toLowerCase().includes(q) || (d.ing || '').toLowerCase().includes(q)
  );
  const sort = document.getElementById('fmd-sort')?.value || 'newest';
  if (sort === 'oldest') list.sort((a, b) => a.ts - b.ts);
  else if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'za') list.sort((a, b) => b.name.localeCompare(a.name));

  const cards = document.getElementById('fmd-cards');
  if (!cards) return;

  if (!list.length) {
    cards.innerHTML = `
      <div class="fmd-empty">
        <svg viewBox="0 0 24 24"><path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z"/><path d="M12 2v20"/></svg>
        <p>${all.length ? 'No dishes match your search or filter.' : 'No dishes yet. Add one or click "Load samples"!'}</p>
      </div>`;
  } else {
    cards.innerHTML = list.map(d => {
      const ingList = (d.ing || '').split(',').map(s => s.trim()).filter(Boolean);
      const tags = ingList.slice(0, 4).map(t => `<span class="fmd-tag">${fmdEsc(t)}</span>`).join('');
      const more = ingList.length > 4 ? `<span class="fmd-tag more">+${ingList.length - 4}</span>` : '';
      return `
        <div class="fmd-card">
          <span class="fmd-cat-badge ${FMD_CAT_CLASS[d.cat] || ''}">${d.cat}</span>
          <div class="fmd-card-name">${fmdEsc(d.name)}</div>
          <div>${tags}${more}</div>
          <div class="fmd-card-footer">
            <span class="fmd-card-date">${fmdFmtDate(d.ts)}</span>
            <div class="fmd-card-actions">
              <button class="fmd-icon-btn edit" onclick="fmdOpenEdit(${d.id})" title="Edit">✎</button>
              <button class="fmd-icon-btn del"  onclick="fmdDeleteDish(${d.id})" title="Delete">✕</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  const ingTotal = all.reduce((n, d) => n + (d.ing ? d.ing.split(',').filter(s => s.trim()).length : 0), 0);
  const catCounts = ['Breakfast','Lunch','Snacks','Dinner']
    .map(c => ({ c, n: all.filter(d => d.cat === c).length }))
    .sort((a, b) => b.n - a.n);

  document.getElementById('fmd-st-total').textContent = all.length;
  document.getElementById('fmd-st-ing').textContent   = ingTotal;
  document.getElementById('fmd-st-top').textContent   = all.length && catCounts[0].n > 0 ? catCounts[0].c : '—';
  document.getElementById('fmd-st-last').textContent  = all.length ? fmdFmtDate(all[0].ts) : '—';
  fmdRenderChart(all);
}

/* Keyboard shortcut: Enter to add dish */
document.getElementById('fmd-inp-name')
  .addEventListener('keydown', e => { if (e.key === 'Enter') fmdSubmit(); });

/* Close modal on backdrop click */
document.getElementById('fmd-modal-overlay')
  .addEventListener('click', e => {
    if (e.target === document.getElementById('fmd-modal-overlay')) fmdCloseModal();
  });

/* Initial render */
fmdRender();