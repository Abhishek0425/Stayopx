/* ===========================================================
   SECTION 1 — GLOBAL STATE & BRAND CONFIG
   =========================================================== */

let CURRENT_BRAND = "uniliv";
let pieChart = null;
let barChart = null;

const BRAND_CONFIG = {
  uniliv: {
    foodCost: 3000,
    laundryCost: 400,
    wifiCost: 179,
    pantryHRA: 1400,
    unitManagerMultiplier: 2,
    salaryMultiplier: 1
  },
  huddle: {
    foodCost: 2500,
    laundryCost: 300,
    wifiCost: 120,
    pantryHRA: 1000,
    unitManagerMultiplier: 1,
    salaryMultiplier: 0.8
  }
};

/* ===========================================================
   SECTION 2 — SHARED UTILITIES
   =========================================================== */

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

function showLoader() {
  const el = document.getElementById("loader");
  if (el) el.classList.add("show");
}

function hideLoader() {
  const el = document.getElementById("loader");
  if (el) el.classList.remove("show");
}

function applyTheme() {
  const accent = CURRENT_BRAND === "huddle" ? "#3182ce" : "#e53e3e";
  document.body.style.setProperty("--brand-accent", accent);
}

/* ===========================================================
   SECTION 3 — TAB SWITCHING
   =========================================================== */

function switchTab(event, tabId) {
  // Update active state on sidebar buttons
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }

  // Close sidebar on mobile after selection
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.remove("open");

  // Show loader briefly for UX
  showLoader();

  setTimeout(() => {
    // Hide all dashboard panels
    document.querySelectorAll(".dashboard-content").forEach(tab => {
      tab.classList.remove("active");
    });

    // Activate selected tab
    const target = document.getElementById(tabId);
    if (target) target.classList.add("active");

    hideLoader();

    // Initialise food menu chart/state when switching to it
    if (tabId === "foodMenuTab") {
      fmdRender();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 600);
}

/* ===========================================================
   SECTION 4 — WELCOME SCREEN
   =========================================================== */

function dismissWelcome() {
  const ws = document.getElementById("welcomeScreen");
  if (!ws) return;
  ws.style.opacity = "0";
  ws.style.transition = "opacity 0.4s ease";
  setTimeout(() => { ws.style.display = "none"; }, 420);
}

/* ===========================================================
   SECTION 5 — DOMContentLoaded INIT
   =========================================================== */

window.addEventListener("DOMContentLoaded", () => {
  // Show & auto-dismiss welcome screen
  const ws = document.getElementById("welcomeScreen");
  if (ws) {
    ws.style.display = "flex";
    setTimeout(dismissWelcome, 2200);
  }

  // Apply default brand theme
  applyTheme();

  // Close sidebar when clicking outside (mobile)
  document.addEventListener("click", e => {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.querySelector(".btn.btn-outline-light");
    if (
      sidebar &&
      !sidebar.contains(e.target) &&
      toggleBtn &&
      !toggleBtn.contains(e.target)
    ) {
      sidebar.classList.remove("open");
    }
  });

  // Initial food render so stats are ready
  fmdRender();
});

/* ===========================================================
   SECTION 6 — ORGANOGRAM DASHBOARD: BRAND SWITCH
   =========================================================== */

function switchBrand() {
  CURRENT_BRAND = document.getElementById("brandSelect").value;
  applyTheme();
}

/* ===========================================================
   SECTION 7 — ORGANOGRAM DASHBOARD: MAIN GENERATOR
   =========================================================== */

function generateCostBreakdown() {
  const beds       = +document.getElementById("bedsInput").value       || 0;
  const rooms      = +document.getElementById("roomsInput").value      || 0;
  const area       = +document.getElementById("areaInput").value       || 0;
  const entries    = +document.getElementById("entriesInput")?.value   || 1;
  const properties = +document.getElementById("propertiesInput")?.value || 1;
  const includeFood = document.getElementById("foodToggle").checked;

  if (!beds && !rooms && !area) {
    alert("Please enter at least one value (Beds, Rooms, or Area) to generate analysis.");
    return;
  }

  showLoader();

  setTimeout(() => {
    const result = calculateCost(beds, rooms, area, entries, includeFood, properties);

    if (!result) {
      hideLoader();
      alert("Please enter valid positive values for Beds, Rooms, and Area.");
      return;
    }

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
        <div class="col-md-3">
          <div class="card p-3 text-center">
            <h6>Grand Total</h6>
            <h4>₹ ${grandTotal.toLocaleString("en-IN")}</h4>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 text-center">
            <h6>Cost Per Bed</h6>
            <h4>₹ ${costPerBed.toFixed(0)}</h4>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 text-center">
            <h6>Manpower</h6>
            <h4>₹ ${manpowerTotal.toLocaleString("en-IN")}</h4>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 text-center">
            <h6>Operational</h6>
            <h4>₹ ${operational.total.toLocaleString("en-IN")}</h4>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card p-3">
            <h6 class="fw-semibold mb-3">Cost Distribution</h6>
            <div class="chart-wrapper"><canvas id="pieChart"></canvas></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3">
            <h6 class="fw-semibold mb-3">Cost Breakdown</h6>
            <div class="chart-wrapper"><canvas id="barChart"></canvas></div>
          </div>
        </div>
      </div>

      ${generateOperationalTable(operational, beds, area)}
      ${generateManpowerTable(manpowerDetails)}
      ${generateRentalTable(rentalAssets)}
      ${generateBuyingTable(buyingDetails)}
    `;

    renderCharts(manpower, food, laundry, rm, hk, wifi, rental, buying);
    hideLoader();
  }, 600);
}

/* ===========================================================
   SECTION 8 — ORGANOGRAM DASHBOARD: COST ENGINE
   =========================================================== */

function calculateCost(beds, rooms, area, entries = 1, includeFood = true, properties = 1) {
  const config = BRAND_CONFIG[CURRENT_BRAND];
  if (!config) return null;
  if (beds <= 0 || rooms <= 0 || area <= 0) return null;

  /* --- RENTAL ASSETS --- */
  const rentalAssets = [
    { name: "Snack Vending Machine",  rent: 0, perProperty: true },
    { name: "Sanitary Pad Machine",   rent: 0, ratio: 200 },
    { name: "Coffee Machine",         rent: 0, ratio: 200 },
    { name: "RO",                     rent: 0, ratio: 200 }
  ];

  let rentalTotal = 0;
  rentalAssets.forEach(asset => {
    const qty = asset.perProperty ? properties : Math.ceil(beds / asset.ratio);
    asset.qty   = qty;
    asset.total = qty * asset.rent;
    rentalTotal += asset.total;
  });

  /* --- BUYING ASSETS --- */
  const buyingAssets = [
    { name: "Microwave",  ratio: 50, cost: 0 },
    { name: "Toaster",    ratio: 50, cost: 0 },
    { name: "Induction",  ratio: 50, cost: 0 }
  ];

  let buyingTotal = 0;
  buyingAssets.forEach(a => {
    a.qty   = Math.ceil(beds / a.ratio);
    a.total = a.qty * a.cost;
    buyingTotal += a.total;
  });

  /* --- OPERATIONAL COSTS --- */
  const operational = {
    food:                 includeFood ? beds * config.foodCost   : 0,
    laundry:              beds * config.laundryCost,
    rm:                   beds * 98,
    housekeepingMaterial: area * 0.4,
    wifi:                 beds * config.wifiCost
  };
  operational.total = Object.values(operational).reduce((a, b) => a + b, 0);

  /* --- MANPOWER --- */
  const roles = [
    { role: "Zonal Head",               ratio: 5000, salary: 100000, type: "beds"  },
    { role: "City Head",                ratio: 3000, salary: 70000,  type: "beds"  },
    { role: "Cluster Manager",          ratio: 1000, salary: 40000,  type: "beds"  },
    { role: "Deputy Cluster Manager",   ratio: 300,  salary: 35000,  type: "beds"  },
    { role: "Unit Manager",             ratio: 250,  salary: 25000,  type: "beds"  },
    { role: "Care Desk Executive",      ratio: 1000, salary: 20000,  type: "beds"  },
    { role: "R&M Supervisor",           ratio: 2000, salary: 25000,  type: "beds"  },
    { role: "MST Technician",           ratio: 600,  salary: 20000,  type: "beds"  },
    { role: "Pantry Boy",               ratio: 75,   salary: 15000,  type: "beds"  },
    { role: "Security Guard",           perEntry: 2, salary: 16000,  type: "entry" },
    { role: "Housekeeping Staff",       ratio: 25,   salary: 16000,  type: "rooms" }
  ];

  const manpowerDetails = [];
  let   manpowerTotal   = 0;

  roles.forEach(role => {
    let headcount = 0;
    let salary    = role.salary * config.salaryMultiplier;

    if (role.type === "entry") {
      headcount = role.perEntry * entries;
    } else {
      const base = role.type === "rooms" ? rooms : beds;
      if (base < role.ratio) return; // threshold not met

      const fullUnits = Math.floor(base / role.ratio);
      const remainder = base % role.ratio;
      const units     = remainder > 0.25 * role.ratio ? fullUnits + 1 : fullUnits;

      headcount = role.role === "Unit Manager"
        ? units * config.unitManagerMultiplier
        : units;
    }

    // Pantry Boy HRA addition
    if (role.role === "Pantry Boy") salary += config.pantryHRA;

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

  const grandTotal  = manpowerTotal + operational.total + buyingTotal;
  const costPerBed  = grandTotal / beds;

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
      food:     operational.food,
      laundry:  operational.laundry,
      rm:       operational.rm,
      hk:       operational.housekeepingMaterial,
      wifi:     operational.wifi,
      rental:   rentalTotal,
      buying:   buyingTotal
    }
  };
}

/* ===========================================================
   SECTION 9 — ORGANOGRAM DASHBOARD: TABLE GENERATORS
   =========================================================== */

function generateOperationalTable(op, beds, area) {
  return `
    <div class="card p-3 mb-4">
      <h5>Operational Costs</h5>
      <div class="table-container">
        <table class="table table-bordered table-sm">
          <thead class="table-light">
            <tr><th>Component</th><th>Calculation</th><th>Total (₹)</th></tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Component">Food</td>
              <td data-label="Calculation">${beds} × ${op.food / (beds || 1)}</td>
              <td data-label="Total">₹ ${op.food.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td data-label="Component">Laundry</td>
              <td data-label="Calculation">${beds} × ${op.laundry / (beds || 1)}</td>
              <td data-label="Total">₹ ${op.laundry.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td data-label="Component">Repairs &amp; Maintenance</td>
              <td data-label="Calculation">${beds} × 98</td>
              <td data-label="Total">₹ ${op.rm.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td data-label="Component">Housekeeping Material</td>
              <td data-label="Calculation">${area} × 0.4</td>
              <td data-label="Total">₹ ${op.housekeepingMaterial.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td data-label="Component">WiFi</td>
              <td data-label="Calculation">${beds} × ${op.wifi / (beds || 1)}</td>
              <td data-label="Total">₹ ${op.wifi.toLocaleString("en-IN")}</td>
            </tr>
            <tr class="table-dark fw-bold">
              <td colspan="2">Total</td>
              <td>₹ ${op.total.toLocaleString("en-IN")}</td>
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
            <tr><th>Role</th><th>Headcount</th><th>Salary</th><th>Total (₹)</th></tr>
          </thead>
          <tbody>
            ${data.map(d => `
              <tr>
                <td data-label="Role">${d.role}</td>
                <td data-label="Headcount">${d.headcount}</td>
                <td data-label="Salary">₹ ${d.salary.toLocaleString("en-IN")}</td>
                <td data-label="Total">₹ ${d.total.toLocaleString("en-IN")}</td>
              </tr>`).join("")}
            <tr class="table-dark fw-bold">
              <td colspan="3">Total</td>
              <td>₹ ${total.toLocaleString("en-IN")}</td>
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
      <h5>Rental Assets</h5>
      <div class="table-container">
        <table class="table table-bordered table-sm">
          <thead class="table-light">
            <tr><th>Asset</th><th>Qty</th><th>Rent</th><th>Total (₹)</th></tr>
          </thead>
          <tbody>
            ${data.map(d => `
              <tr>
                <td data-label="Asset">${d.name}</td>
                <td data-label="Qty">${d.qty}</td>
                <td data-label="Rent">₹ ${d.rent}</td>
                <td data-label="Total">₹ ${d.total.toLocaleString("en-IN")}</td>
              </tr>`).join("")}
            <tr class="table-dark fw-bold">
              <td colspan="3">Total</td>
              <td>₹ ${total.toLocaleString("en-IN")}</td>
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
      <h5>Buying Assets</h5>
      <div class="table-container">
        <table class="table table-bordered table-sm">
          <thead class="table-light">
            <tr><th>Asset</th><th>Qty</th><th>Unit Cost</th><th>Total (₹)</th></tr>
          </thead>
          <tbody>
            ${data.map(d => `
              <tr>
                <td data-label="Asset">${d.name}</td>
                <td data-label="Qty">${d.qty}</td>
                <td data-label="Unit Cost">₹ ${d.cost}</td>
                <td data-label="Total">₹ ${d.total.toLocaleString("en-IN")}</td>
              </tr>`).join("")}
            <tr class="table-dark fw-bold">
              <td colspan="3">Total</td>
              <td>₹ ${total.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

/* ===========================================================
   SECTION 10 — ORGANOGRAM DASHBOARD: CHART.JS RENDERING
   =========================================================== */

function renderCharts(...values) {
  // Destroy previous instances to prevent memory leaks
  if (pieChart) { pieChart.destroy(); pieChart = null; }
  if (barChart) { barChart.destroy(); barChart = null; }

  const labels = ["Manpower", "Food", "Laundry", "R&M", "HK", "WiFi", "Rental", "Buying"];
  const bgColors = [
    "#e53e3e", "#dd6b20", "#d69e2e", "#38a169",
    "#3182ce", "#805ad5", "#319795", "#ed64a6"
  ];

  const pieCanvas = document.getElementById("pieChart");
  const barCanvas = document.getElementById("barChart");

  if (pieCanvas) {
    pieChart = new Chart(pieCanvas, {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: "#fff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` ₹${ctx.parsed.toLocaleString("en-IN")}`
            }
          }
        }
      }
    });
  }

  if (barCanvas) {
    barChart = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Cost (₹)",
          data: values,
          backgroundColor: bgColors,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ₹${ctx.parsed.y.toLocaleString("en-IN")}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: v => "₹" + (v / 1000).toFixed(0) + "k"
            }
          }
        }
      }
    });
  }
}

/* ===========================================================
   SECTION 11 — FOOD MENU DASHBOARD: CONSTANTS & STATE
   =========================================================== */

const FMD_KEY = "fmdVegDashV1";
let fmdFilter = "All";
let fmdEditId = null;

const FMD_NON_VEG = [
  "chicken", "mutton", "beef", "pork", "fish", "prawn", "shrimp", "lamb",
  "egg", "eggs", "turkey", "bacon", "ham", "meat", "tuna", "salmon", "crab",
  "lobster", "squid", "octopus", "anchovies", "lard", "gelatin", "seafood",
  "pepperoni", "sausage", "meatball"
];

const FMD_CAT_COLORS = {
  Breakfast: "#378ADD",
  Lunch:     "#639922",
  Snacks:    "#BA7517",
  Dinner:    "#D85A30"
};

const FMD_CAT_CLASS = {
  Breakfast: "fmd-cat-breakfast",
  Lunch:     "fmd-cat-lunch",
  Snacks:    "fmd-cat-snacks",
  Dinner:    "fmd-cat-dinner"
};

/* ===========================================================
   SECTION 12 — FOOD MENU DASHBOARD: STORAGE HELPERS
   =========================================================== */

function fmdLoad() {
  try { return JSON.parse(localStorage.getItem(FMD_KEY)) || []; } catch { return []; }
}

function fmdSave(data) {
  localStorage.setItem(FMD_KEY, JSON.stringify(data));
}

/* ===========================================================
   SECTION 13 — FOOD MENU DASHBOARD: DOM HELPERS
   =========================================================== */

function fmdEsc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function fmdFmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function fmdToast(msg, type = "ok") {
  const el = document.getElementById("fmd-toast");
  if (!el) return;
  el.textContent  = msg;
  el.className    = "fmd-toast " + type;
  el.style.display = "block";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = "none"; }, 2600);
}

/* ===========================================================
   SECTION 14 — FOOD MENU DASHBOARD: VEGETARIAN VALIDATION
   =========================================================== */

function fmdHasNonVeg(text) {
  const lower = (text || "").toLowerCase();
  return FMD_NON_VEG.some(nv => new RegExp("\\b" + nv + "\\b").test(lower));
}

function fmdCheckNonVeg(warnId, inputId) {
  const val = document.getElementById(inputId)?.value || "";
  const warn = document.getElementById(warnId);
  if (warn) warn.style.display = fmdHasNonVeg(val) ? "block" : "none";
}

/* ===========================================================
   SECTION 15 — FOOD MENU DASHBOARD: CRUD OPERATIONS
   =========================================================== */

function fmdSubmit() {
  const name = document.getElementById("fmd-inp-name")?.value.trim() || "";
  const cat  = document.getElementById("fmd-inp-cat")?.value  || "";
  const ing  = document.getElementById("fmd-inp-ing")?.value.trim()  || "";

  if (!name) { fmdToast("Please enter a dish name.", "err"); return; }
  if (!cat)  { fmdToast("Please select a category.", "err"); return; }
  if (fmdHasNonVeg(ing)) {
    fmdToast("Non-veg ingredient detected! Only vegetarian dishes allowed.", "err");
    return;
  }

  const dishes = fmdLoad();
  dishes.unshift({ id: Date.now(), name, cat, ing, ts: Date.now() });
  fmdSave(dishes);
  fmdCancelEdit();
  fmdToast("Vegetarian dish added! 🌿");
  fmdRender();
}

function fmdCancelEdit() {
  fmdEditId = null;
  const name = document.getElementById("fmd-inp-name");
  const cat  = document.getElementById("fmd-inp-cat");
  const ing  = document.getElementById("fmd-inp-ing");
  const warn = document.getElementById("fmd-nv-warn");
  const title  = document.getElementById("fmd-form-title");
  const btnSub = document.getElementById("fmd-btn-submit");

  if (name)  name.value  = "";
  if (cat)   cat.value   = "";
  if (ing)   ing.value   = "";
  if (warn)  warn.style.display = "none";
  if (title) title.textContent  = "Add a vegetarian dish";
  if (btnSub) btnSub.textContent = "+ Add Dish";
}

function fmdDeleteDish(id) {
  if (!confirm("Remove this dish?")) return;
  fmdSave(fmdLoad().filter(d => d.id !== id));
  fmdRender();
  fmdToast("Dish removed.");
}

/* ===========================================================
   SECTION 16 — FOOD MENU DASHBOARD: EDIT MODAL
   =========================================================== */

function fmdOpenEdit(id) {
  const d = fmdLoad().find(x => x.id === id);
  if (!d) return;

  document.getElementById("fmd-m-name").value = d.name;
  document.getElementById("fmd-m-cat").value  = d.cat;
  document.getElementById("fmd-m-ing").value  = d.ing || "";
  document.getElementById("fmd-m-nv-warn").style.display = "none";
  document.getElementById("fmd-modal-title").textContent = "Edit: " + d.name;

  fmdEditId = id;
  document.getElementById("fmd-modal-overlay").classList.add("open");
}

function fmdCloseModal() {
  document.getElementById("fmd-modal-overlay").classList.remove("open");
  fmdEditId = null;
}

function fmdSaveEdit() {
  const name = document.getElementById("fmd-m-name")?.value.trim() || "";
  const cat  = document.getElementById("fmd-m-cat")?.value  || "";
  const ing  = document.getElementById("fmd-m-ing")?.value.trim()  || "";

  if (!name || !cat) { alert("Name and category are required."); return; }
  if (fmdHasNonVeg(ing)) { alert("Non-veg ingredients detected!"); return; }

  fmdSave(fmdLoad().map(d => d.id === fmdEditId ? { ...d, name, cat, ing } : d));
  fmdCloseModal();
  fmdRender();
  fmdToast("Dish updated! ✓");
}

/* ===========================================================
   SECTION 17 — FOOD MENU DASHBOARD: FILTER & SORT
   =========================================================== */

function fmdSetFilter(el) {
  fmdFilter = el.dataset.f;
  document.querySelectorAll(".fmd-chip").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  fmdRender();
}

function fmdClearAll() {
  if (!confirm("Delete ALL dishes? This cannot be undone.")) return;
  fmdSave([]);
  fmdRender();
  fmdToast("All dishes cleared.");
}

/* ===========================================================
   SECTION 18 — FOOD MENU DASHBOARD: SAMPLE DATA
   =========================================================== */

const FMD_SAMPLES = [
  { name: "Masala Dosa",          cat: "Breakfast", ing: "rice flour, urad dal, potato, onion, mustard seeds, curry leaves, ghee" },
  { name: "Poha",                 cat: "Breakfast", ing: "flattened rice, onion, green chilli, turmeric, coriander, lemon" },
  { name: "Upma",                 cat: "Breakfast", ing: "semolina, onion, mustard seeds, green chilli, curry leaves, cashew" },
  { name: "Idli Sambar",          cat: "Breakfast", ing: "idli batter, toor dal, tamarind, tomato, onion, drumstick, spices" },
  { name: "Paneer Butter Masala", cat: "Lunch",     ing: "paneer, tomato, butter, cream, spices, fenugreek leaves" },
  { name: "Dal Tadka",            cat: "Lunch",     ing: "yellow lentils, onion, tomato, garlic, cumin, ghee, coriander" },
  { name: "Rajma Chawal",         cat: "Lunch",     ing: "kidney beans, basmati rice, onion, tomato, garam masala, ginger, garlic" },
  { name: "Chole Bhature",        cat: "Lunch",     ing: "chickpeas, maida, onion, tomato, spices, coriander" },
  { name: "Samosa",               cat: "Snacks",    ing: "maida, potato, peas, garam masala, ginger, coriander" },
  { name: "Vada Pav",             cat: "Snacks",    ing: "potato, bread roll, chutney, garlic, green chilli, mustard" },
  { name: "Pav Bhaji",            cat: "Snacks",    ing: "mixed vegetables, butter, pav bread, spices, lemon, onion" },
  { name: "Dhokla",               cat: "Snacks",    ing: "besan, yogurt, ginger, green chilli, mustard seeds, curry leaves" },
  { name: "Palak Paneer",         cat: "Dinner",    ing: "spinach, paneer, onion, tomato, cream, garam masala, garlic" },
  { name: "Aloo Matar",           cat: "Dinner",    ing: "potato, peas, tomato, cumin, turmeric, coriander, ginger" },
  { name: "Vegetable Biryani",    cat: "Dinner",    ing: "basmati rice, mixed vegetables, saffron, onion, whole spices, yogurt, ghee" },
  { name: "Baingan Bharta",       cat: "Dinner",    ing: "brinjal, onion, tomato, garlic, green chilli, mustard oil, spices" }
];

function fmdLoadSamples() {
  const existing = fmdLoad();
  const names    = new Set(existing.map(d => d.name));
  const toAdd    = FMD_SAMPLES.filter(s => !names.has(s.name));

  if (!toAdd.length) { fmdToast("Samples already loaded.", "err"); return; }

  const added = toAdd.map((s, i) => ({
    id: Date.now() + i,
    ...s,
    ts: Date.now() + i
  }));

  fmdSave([...added, ...existing]);
  fmdRender();
  fmdToast(added.length + " vegetarian dishes added! 🌿");
}

/* ===========================================================
   SECTION 19 — FOOD MENU DASHBOARD: CHART RENDERER
   =========================================================== */

function fmdRenderChart(dishes) {
  const cats   = ["Breakfast", "Lunch", "Snacks", "Dinner"];
  const counts = Object.fromEntries(cats.map(c => [c, dishes.filter(d => d.cat === c).length]));
  const max    = Math.max(...Object.values(counts), 1);
  const chart  = document.getElementById("fmd-chart");
  if (!chart) return;

  chart.innerHTML = cats.map(c => `
    <div class="fmd-chart-row">
      <div class="fmd-chart-label">${c}</div>
      <div class="fmd-chart-track">
        <div class="fmd-chart-fill"
             style="width:${Math.round(counts[c] / max * 100)}%;background:${FMD_CAT_COLORS[c]}">
        </div>
      </div>
      <div class="fmd-chart-count" style="color:${FMD_CAT_COLORS[c]}">${counts[c]}</div>
    </div>`).join("");
}

/* ===========================================================
   SECTION 20 — FOOD MENU DASHBOARD: MAIN RENDER
   =========================================================== */

function fmdRender() {
  const all  = fmdLoad();
  let   list = all.slice();

  // Filter by category
  if (fmdFilter !== "All") list = list.filter(d => d.cat === fmdFilter);

  // Filter by search query
  const q = (document.getElementById("fmd-search")?.value || "").toLowerCase().trim();
  if (q) list = list.filter(d =>
    d.name.toLowerCase().includes(q) || (d.ing || "").toLowerCase().includes(q)
  );

  // Sort
  const sort = document.getElementById("fmd-sort")?.value || "newest";
  if (sort === "oldest")     list.sort((a, b) => a.ts - b.ts);
  else if (sort === "az")    list.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "za")    list.sort((a, b) => b.name.localeCompare(a.name));
  // default: newest — already in insertion order (unshift) in fmdLoad

  const cards = document.getElementById("fmd-cards");
  if (!cards) return;

  // Render cards
  if (!list.length) {
    cards.innerHTML = `
      <div class="fmd-empty">
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z"/>
          <path d="M12 2v20"/>
        </svg>
        <p>${all.length
          ? "No dishes match your search or filter."
          : 'No dishes yet. Add one or click "Load samples"!'}</p>
      </div>`;
  } else {
    cards.innerHTML = list.map(d => {
      const ingList = (d.ing || "").split(",").map(s => s.trim()).filter(Boolean);
      const tags    = ingList.slice(0, 4).map(t => `<span class="fmd-tag">${fmdEsc(t)}</span>`).join("");
      const more    = ingList.length > 4 ? `<span class="fmd-tag more">+${ingList.length - 4}</span>` : "";
      return `
        <div class="fmd-card">
          <span class="fmd-cat-badge ${FMD_CAT_CLASS[d.cat] || ""}">${d.cat}</span>
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
    }).join("");
  }

  // Update stats bar
  const ingTotal  = all.reduce((n, d) => n + (d.ing ? d.ing.split(",").filter(s => s.trim()).length : 0), 0);
  const catCounts = ["Breakfast", "Lunch", "Snacks", "Dinner"]
    .map(c => ({ c, n: all.filter(d => d.cat === c).length }))
    .sort((a, b) => b.n - a.n);

  const stTotal = document.getElementById("fmd-st-total");
  const stIng   = document.getElementById("fmd-st-ing");
  const stTop   = document.getElementById("fmd-st-top");
  const stLast  = document.getElementById("fmd-st-last");

  if (stTotal) stTotal.textContent = all.length;
  if (stIng)   stIng.textContent   = ingTotal;
  if (stTop)   stTop.textContent   = all.length && catCounts[0].n > 0 ? catCounts[0].c : "—";
  if (stLast)  stLast.textContent  = all.length ? fmdFmtDate(all[0].ts) : "—";

  fmdRenderChart(all);
}

/* ===========================================================
   SECTION 21 — FOOD MENU DASHBOARD: EVENT LISTENERS
   =========================================================== */

// Keyboard shortcut: Enter on dish name field to submit
document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("fmd-inp-name");
  if (nameInput) {
    nameInput.addEventListener("keydown", e => {
      if (e.key === "Enter") fmdSubmit();
    });
  }

  // Close modal when clicking outside it
  const modalOverlay = document.getElementById("fmd-modal-overlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", e => {
      if (e.target === modalOverlay) fmdCloseModal();
    });
  }
});