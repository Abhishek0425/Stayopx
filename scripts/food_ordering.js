/*
 * food_ordering.js
 * JavaScript for the Food Ordering & Delivery Management Module
 * Linked from: index.html
 *
 * APIs used:
 *   POST /api/food-ordering/create-order/
 *   GET  /api/food-ordering/orders/
 *   GET  /api/food-ordering/order/<id>/
 *   GET  /api/food-ordering/kitchen-summary/
 *   POST /api/food-ordering/dispatch/
 *   POST /api/food-ordering/verify-delivery/
 *   POST /api/food-ordering/cancel/
 */

/* ═══════════════════════════════════════════════════════════
   FOOD ORDERING JS v2
   Pre-Order → Kitchen Summary → Dispatch OTP → Delivery Verify
═══════════════════════════════════════════════════════════ */
var _foCurrentOrderId = null;
var _foRowN = 0;
var _foKitData = [];

/* ── Helper: API base ─────────────────────────────────────── */
function _foAPI() {
  return window.UNILIV_API_BASE ||
    ((location.hostname==='localhost'||location.hostname==='127.0.0.1')
      ? 'http://127.0.0.1:8000' : 'https://stayopx.onrender.com');
}

/* ── Helper: show alert ───────────────────────────────────── */
function foMsg(elId, msg, type) {
  var el = document.getElementById(elId);
  if (!el) return;
  var cfg = {
    success: ['#d1e7dd','#0f5132','1px solid #a3cfbb'],
    warning: ['#fff3cd','#664d03','1px solid #ffecb5'],
    error:   ['#f8d7da','#842029','1px solid #f1aeb5'],
  }[type] || ['#f8d7da','#842029','1px solid #f1aeb5'];
  el.style.cssText = 'display:block;padding:10px 14px;border-radius:8px;font-size:13px;' +
    'margin-bottom:12px;background:'+cfg[0]+';color:'+cfg[1]+';border:'+cfg[2]+';';
  el.textContent = msg;
  if (type==='success') setTimeout(function(){el.style.display='none';},4000);
}

/* ── Helper: status badge ─────────────────────────────────── */
function foBadge(s) {
  var m = {
    Ordered:    'background:#cfe2ff;color:#0a58ca;',
    Dispatched: 'background:#fff3cd;color:#856404;',
    Delivered:  'background:#d1e7dd;color:#0f5132;',
    Cancelled:  'background:#f8d7da;color:#842029;',
  };
  return '<span style="padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;'+
    (m[s]||'background:#e2e8f0;color:#4a5568;')+'">'+s+'</span>';
}

/* ── Sub-tab switching ────────────────────────────────────── */
function foSwitch(name) {
  ['orders','place','kitchen','dispatch','deliver'].forEach(function(t) {
    var btn = document.getElementById('fo-stab-'+t);
    var pan = document.getElementById('fo-p-'+t);
    if (btn) btn.classList.toggle('active', t===name);
    if (pan) pan.style.display = (t===name)?'block':'none';
  });
  if (name==='orders')   foLoadOrders();
  if (name==='dispatch') foFillDispatch();
  if (name==='deliver')  foFillDeliver();
}

/* ═══════════════════════════════════════════════════════════
   ORDERS TABLE
═══════════════════════════════════════════════════════════ */
async function foLoadOrders() {
  var API    = _foAPI();
  var status = (document.getElementById('foFilterStatus')||{}).value||'';
  var date   = (document.getElementById('foFilterDate')||{}).value||'';
  var url    = API+'/api/food-ordering/orders/?status='+status+'&date='+date;
  var tbody  = document.getElementById('foOrdersTbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#a0aec0;">Loading...</td></tr>';
  try {
    var res  = await fetch(url,{credentials:'include'});
    if (!res.ok) throw new Error('HTTP '+res.status);
    var data = await res.json();
    if (!data.success) throw new Error(data.error||'Failed');
    var s = data.data.stats||{};
    ['Total','Ordered','Dispatched','Delivered'].forEach(function(k){
      var el=document.getElementById('foStat'+k);
      if (el) el.textContent = (s[k.toLowerCase()]!==undefined?s[k.toLowerCase()]:'0');
    });
    var orders = data.data.orders||[];
    if (!tbody) return;
    if (!orders.length) {
      tbody.innerHTML='<tr><td colspan="8" style="text-align:center;padding:30px;color:#a0aec0;">No orders found</td></tr>';
      return;
    }
    tbody.innerHTML = orders.map(function(o){
      var act = '';
      if (o.status==='Ordered')
        act='<button onclick="foGoDispatch('+o.id+')" style="padding:4px 10px;background:linear-gradient(135deg,#ed8936,#c05621);color:#fff;border:none;border-radius:6px;font-size:11.5px;cursor:pointer;margin-right:4px;">🚚 Dispatch</button>';
      if (o.status==='Dispatched')
        act='<button onclick="foGoDeliver('+o.id+')" style="padding:4px 10px;background:linear-gradient(135deg,#38a169,#276749);color:#fff;border:none;border-radius:6px;font-size:11.5px;cursor:pointer;margin-right:4px;">✅ Deliver</button>';
      if (o.status==='Ordered'||o.status==='Dispatched')
        act+='<button onclick="foCancelOrder('+o.id+')" style="padding:4px 10px;background:#fff;border:1.5px solid #fed7d7;color:#e53e3e;border-radius:6px;font-size:11.5px;cursor:pointer;">✕</button>';
      return '<tr style="border-bottom:1px solid #f0f0f0;">'+
        '<td style="padding:9px 12px;"><strong>#'+o.id+'</strong></td>'+
        '<td style="padding:9px 12px;">'+o.property_name+'</td>'+
        '<td style="padding:9px 12px;color:#718096;">'+o.unit_lead+'</td>'+
        '<td style="padding:9px 12px;">'+o.meal_type+'</td>'+
        '<td style="padding:9px 12px;">'+o.order_date+'</td>'+
        '<td style="padding:9px 12px;"><span style="background:#edf2f7;color:#4a5568;padding:2px 8px;border-radius:10px;font-size:11px;">'+o.item_count+' items</span></td>'+
        '<td style="padding:9px 12px;">'+foBadge(o.status)+'</td>'+
        '<td style="padding:9px 12px;">'+act+'</td></tr>';
    }).join('');
  } catch(e) {
    if (tbody) tbody.innerHTML='<tr><td colspan="8" style="text-align:center;padding:24px;color:#e53e3e;">⚠ '+e.message+'. Is Django running?</td></tr>';
  }
}

/* ═══════════════════════════════════════════════════════════
   PLACE ORDER
═══════════════════════════════════════════════════════════ */
function foAddRow() {
  _foRowN++;
  var id = 'foRow_'+_foRowN;
  var tr = document.createElement('tr');
  tr.id  = id;
  tr.style.borderBottom = '1px solid #f0f0f0';
  tr.innerHTML =
    '<td style="padding:6px 10px;"><input type="text" placeholder="Dish / ingredient name" '+
    'style="width:100%;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12.5px;"></td>'+
    '<td style="padding:6px 10px;"><input type="number" min="0.1" step="0.1" placeholder="0" '+
    'style="width:100%;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12.5px;"></td>'+
    '<td style="padding:6px 10px;"><select style="width:100%;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12.5px;background:#fff;">'+
    '<option>kg</option><option>grams</option><option>litres</option><option>ml</option>'+
    '<option>pieces</option><option>packets</option><option>dozen</option><option>boxes</option>'+
    '</select></td>'+
    '<td style="padding:6px 10px;text-align:center;">'+
    '<button onclick="document.getElementById(\''+id+'\').remove()" '+
    'style="padding:4px 10px;background:#fff;border:1.5px solid #fed7d7;color:#e53e3e;border-radius:6px;font-size:12px;cursor:pointer;">✕</button></td>';
  document.getElementById('foRowsBody').appendChild(tr);
}

function foReset() {
  ['foProp','foUnitLead','foMeal','foDate','foNotes'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  var b=document.getElementById('foRowsBody'); if(b) b.innerHTML='';
  _foRowN=0;
  var m=document.getElementById('foPlaceMsg'); if(m) m.style.display='none';
}

async function foSubmit() {
  var API  = _foAPI();
  var prop = (document.getElementById('foProp')||{}).value||'';
  var lead = (document.getElementById('foUnitLead')||{}).value||'';
  var meal = (document.getElementById('foMeal')||{}).value||'';
  var date = (document.getElementById('foDate')||{}).value||'';
  var note = (document.getElementById('foNotes')||{}).value||'';
  if (!prop||!meal||!date) { foMsg('foPlaceMsg','⚠ Property, Meal Type and Date are required.','error'); return; }
  var rows = Array.from((document.getElementById('foRowsBody')||{}).querySelectorAll?
    document.getElementById('foRowsBody').querySelectorAll('tr'):[]);
  var items=[];
  rows.forEach(function(r){
    var inp=r.querySelectorAll('input'); var sel=r.querySelector('select');
    var n=inp[0]?inp[0].value.trim():'';
    var q=inp[1]?parseFloat(inp[1].value):0;
    var u=sel?sel.value:'kg';
    if(n&&q>0) items.push({dish_name:n,quantity:q,unit:u});
  });
  if (!items.length) { foMsg('foPlaceMsg','⚠ Add at least one item.','error'); return; }
  try {
    var res = await fetch(API+'/api/food-ordering/create-order/',{
      method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({property_name:prop,unit_lead:lead,meal_type:meal,
                           order_date:date,notes:note,items:items}),
    });
    var data = await res.json();
    if (!data.success) { foMsg('foPlaceMsg',data.error,'error'); return; }
    foMsg('foPlaceMsg','✅ Order #'+data.data.id+' placed successfully!','success');
    foReset(); foAddRow(); foLoadOrders();
  } catch(e) { foMsg('foPlaceMsg','Network error: '+e.message,'error'); }
}

/* ═══════════════════════════════════════════════════════════
   KITCHEN SUMMARY
═══════════════════════════════════════════════════════════ */
async function foLoadKitchen() {
  var API  = _foAPI();
  var date = (document.getElementById('kitDate')||{}).value||'';
  var meal = (document.getElementById('kitMeal')||{}).value||'';
  var url  = API+'/api/food-ordering/kitchen-summary/?date='+date+'&meal_type='+encodeURIComponent(meal);
  var tbody = document.getElementById('kitTbody');
  if (tbody) tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:20px;color:#a0aec0;">Loading...</td></tr>';
  try {
    var res  = await fetch(url,{credentials:'include'});
    var data = await res.json();
    if (!data.success) throw new Error(data.error);
    _foKitData = data.data.summary||[];
    if (!_foKitData.length) {
      if (tbody) tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:20px;color:#a0aec0;">No orders found for selected filters</td></tr>';
      return;
    }
    if (!tbody) return;
    tbody.innerHTML = _foKitData.map(function(r){
      return '<tr style="border-bottom:1px solid #f0f0f0;">'+
        '<td style="padding:9px 12px;color:#718096;">'+r.order_date+'</td>'+
        '<td style="padding:9px 12px;"><span style="background:#edf2f7;color:#4a5568;padding:2px 8px;border-radius:8px;font-size:12px;">'+r.meal_type+'</span></td>'+
        '<td style="padding:9px 12px;font-weight:500;">'+r.dish_name+'</td>'+
        '<td style="padding:9px 12px;text-align:right;font-weight:700;color:#1a1a2e;">'+r.total_qty+'</td>'+
        '<td style="padding:9px 12px;color:#718096;">'+r.unit+'</td></tr>';
    }).join('');
  } catch(e) {
    if (tbody) tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:20px;color:#e53e3e;">Error: '+e.message+'</td></tr>';
  }
}

function foExportKitchen() {
  if (!_foKitData.length) { alert('Load summary data first.'); return; }
  var rows = [['Date','Meal Type','Dish','Total Qty','Unit']];
  _foKitData.forEach(function(r){ rows.push([r.order_date,r.meal_type,r.dish_name,r.total_qty,r.unit]); });
  var csv = rows.map(function(r){ return r.map(function(v){ return '"'+String(v).replace(/"/g,'""')+'"'; }).join(','); }).join('\n');
  var blob = new Blob([csv],{type:'text/csv'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Kitchen_Summary_'+new Date().toISOString().split('T')[0]+'.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

/* ═══════════════════════════════════════════════════════════
   DISPATCH
═══════════════════════════════════════════════════════════ */
async function foFillDispatch() {
  var API = _foAPI();
  try {
    var res  = await fetch(API+'/api/food-ordering/orders/?status=Ordered',{credentials:'include'});
    var data = await res.json();
    var sel  = document.getElementById('foDispSel');
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = '<option value="">— Select Order —</option>';
    (data.data.orders||[]).forEach(function(o){
      var opt=document.createElement('option');
      opt.value=o.id;
      opt.textContent='#'+o.id+' — '+o.property_name+' ('+o.meal_type+', '+o.order_date+')';
      sel.appendChild(opt);
    });
    if (prev) sel.value=prev;
  } catch(e) {}
}

async function foDispatch() {
  var API  = _foAPI();
  var id   = (document.getElementById('foDispSel')||{}).value||'';
  var by   = (document.getElementById('foDispBy')||{}).value||'';
  if (!id) { foMsg('foDispMsg','⚠ Select an order first.','error'); return; }
  try {
    var res  = await fetch(API+'/api/food-ordering/dispatch/',{
      method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({order_id:id,dispatched_by:by}),
    });
    var data = await res.json();
    if (!data.success) { foMsg('foDispMsg',data.error,'error'); return; }
    var r = document.getElementById('foDispResult');
    var o = document.getElementById('foDispOTP');
    if (r) r.style.display='block';
    if (o) o.textContent = data.data.dispatch_otp;
    foMsg('foDispMsg','✅ Order #'+id+' dispatched! Share OTP with Unit Lead.','success');
    foLoadOrders();
  } catch(e) { foMsg('foDispMsg','Error: '+e.message,'error'); }
}

function foGoDispatch(id) {
  document.getElementById('foDispSel').value = String(id);
  foSwitch('dispatch');
}

/* ═══════════════════════════════════════════════════════════
   VERIFY DELIVERY
═══════════════════════════════════════════════════════════ */
async function foFillDeliver() {
  var API = _foAPI();
  try {
    var res  = await fetch(API+'/api/food-ordering/orders/?status=Dispatched',{credentials:'include'});
    var data = await res.json();
    var sel  = document.getElementById('foDelivSel');
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = '<option value="">— Select Dispatched Order —</option>';
    (data.data.orders||[]).forEach(function(o){
      var opt=document.createElement('option');
      opt.value=o.id;
      opt.textContent='#'+o.id+' — '+o.property_name+' ('+o.meal_type+', '+o.order_date+')';
      sel.appendChild(opt);
    });
    if (prev) sel.value=prev;
  } catch(e) {}
}

async function foLoadDeliv() {
  var API = _foAPI();
  var id  = (document.getElementById('foDelivSel')||{}).value||'';
  if (!id) return;
  _foCurrentOrderId = id;
  try {
    var res  = await fetch(API+'/api/food-ordering/order/'+id+'/',{credentials:'include'});
    var data = await res.json();
    if (!data.success) { foMsg('foDelivMsg',data.error,'error'); return; }
    var o = data.data;
    var meta = document.getElementById('foDelivMeta');
    if (meta) meta.innerHTML =
      '<div class="col-auto"><strong>Order #'+o.id+'</strong></div>'+
      '<div class="col-auto" style="color:#718096;">📍 '+o.property_name+'</div>'+
      '<div class="col-auto" style="color:#718096;">🍽️ '+o.meal_type+'</div>'+
      '<div class="col-auto" style="color:#718096;">📅 '+o.order_date+'</div>'+
      '<div class="col-auto">'+foBadge(o.status)+'</div>';
    var ib = document.getElementById('foDelivItemsBody');
    if (ib) ib.innerHTML = (o.items||[]).map(function(item){
      return '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;padding:9px 12px;border-bottom:1px solid #f0f0f0;align-items:center;">'+
        '<div style="font-weight:500;">'+item.dish_name+'</div>'+
        '<div style="color:#718096;">'+item.quantity+' '+item.unit+'</div>'+
        '<div><input type="number" id="foRQ_'+item.id+'" min="0" max="'+item.quantity+'" step="0.1" '+
        'placeholder="0" value="'+(item.received_quantity!==null&&item.received_quantity!==undefined?item.received_quantity:'')+'" '+
        'style="width:80px;padding:6px 8px;border:1.5px solid #e2e8f0;border-radius:6px;font-size:13px;"></div>'+
        '<div style="color:#718096;">'+item.unit+'</div></div>';
    }).join('');
    var det = document.getElementById('foDelivDetails');
    if (det) det.style.display='block';
  } catch(e) { foMsg('foDelivMsg','Error: '+e.message,'error'); }
}

async function foConfirmDeliv() {
  var API  = _foAPI();
  var otp  = (document.getElementById('foDelivOTP')||{}).value||'';
  var err  = document.getElementById('foDelivOTPErr');
  if (otp.length!==6) { if(err) err.textContent='Enter a 6-digit OTP.'; return; }
  if (err) err.textContent='';
  var items=[];
  document.querySelectorAll('[id^="foRQ_"]').forEach(function(el){
    if (el.value!=='') items.push({id:parseInt(el.id.replace('foRQ_','')),received_quantity:parseFloat(el.value)});
  });
  try {
    var res  = await fetch(API+'/api/food-ordering/verify-delivery/',{
      method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({order_id:_foCurrentOrderId,otp_code:otp,received_items:items}),
    });
    var data = await res.json();
    if (!data.success) { if(err) err.textContent=data.error; return; }
    var det=document.getElementById('foDelivDetails');
    if(det) det.style.display='none';
    var sel=document.getElementById('foDelivSel');
    if(sel) sel.value='';
    var otpEl=document.getElementById('foDelivOTP');
    if(otpEl) otpEl.value='';
    var msg='✅ Order #'+_foCurrentOrderId+' delivered and verified!';
    if (data.data.mismatches&&data.data.mismatches.length)
      msg+=' ⚠ Shortages: '+data.data.mismatches.map(function(m){return m.dish_name+' (short '+m.shortage+' '+m.unit+')';}).join(', ');
    foMsg('foDelivMsg',msg,data.data.mismatches&&data.data.mismatches.length?'warning':'success');
    _foCurrentOrderId=null;
    foLoadOrders();
  } catch(e) { if(err) err.textContent='Error: '+e.message; }
}

function foGoDeliver(id) {
  document.getElementById('foDelivSel').value = String(id);
  foSwitch('deliver');
  foLoadDeliv();
}

/* ── Cancel order ─────────────────────────────────────────── */
async function foCancelOrder(id) {
  if (!confirm('Cancel order #'+id+'?')) return;
  var API = _foAPI();
  try {
    var res  = await fetch(API+'/api/food-ordering/cancel/',{
      method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({order_id:id}),
    });
    var data = await res.json();
    if (data.success) foLoadOrders();
    else alert(data.error);
  } catch(e) { alert('Error: '+e.message); }
}

/* ── Auto-init when food ordering tab is opened ───────────── */
(function(){
  var orig = window.switchTab;
  if (typeof orig==='function') {
    window.switchTab = function(ev, name) {
      orig.call(this, ev, name);
      if (name==='foodOrderingTab') {
        setTimeout(function(){
          foSwitch('orders');
          var rb=document.getElementById('foRowsBody');
          if(rb&&!rb.querySelector('tr')){ foAddRow(); }
          var fd=document.getElementById('foDate');
          if(fd&&!fd.value) fd.value=new Date().toISOString().split('T')[0];
        },80);
      }
    };
  }
})();

/* ═══════════════════════════════════════════════════════════
   ORDER TRACKING (added)
   UPS-style horizontal step tracker for every order.
   Step bar: Order Placed → Confirmed → Being Prepared
             → Out for Delivery → Delivered
   Status mapping (status field from backend is capitalised):
     Ordered    → step 3 "Being Prepared"  active
     Dispatched → step 4 "Out for Delivery" active
     Delivered  → step 5 "Delivered"        complete
     Cancelled  → red banner, no step bar
═══════════════════════════════════════════════════════════ */

/* ---- 1. Render tracker HTML for a given order ---- */
function foRenderTracker(order) {
  if (!order) return '';

  if (order.status === 'Cancelled') {
    return ''
      + '<div class="fo-tracker">'
      +   '<h3 class="fo-tracker-status is-cancelled">Order Cancelled</h3>'
      +   '<p class="fo-tracker-expected">This order was cancelled'
      +     (order.cancelled_at ? ' on ' + _foFmtDate(order.cancelled_at) : '')
      +   '</p>'
      + '</div>';
  }

  var activeIdx = { 'Ordered': 2, 'Dispatched': 3, 'Delivered': 4 }[order.status];
  if (activeIdx === undefined) activeIdx = 0;

  var steps = ['Order Placed', 'Confirmed', 'Being Prepared', 'Out for Delivery', 'Delivered'];

  var head = {
    'Ordered':    { text: 'Order Confirmed',  cls: 'is-active'    },
    'Dispatched': { text: 'Out for Delivery', cls: 'is-active'    },
    'Delivered':  { text: 'Delivered',        cls: 'is-delivered' }
  }[order.status] || { text: 'Order', cls: 'is-active' };

  var expected;
  if (order.status === 'Delivered') {
    expected = 'Delivered: <span>' + _foFmtDate(order.delivered_at || order.order_date) + '</span>';
  } else {
    var dateStr = order.order_date ? _foFmtDate(order.order_date) : 'Today';
    expected = 'Expected delivery: <span>' + dateStr + ', ' + _foMealWindow(order.meal_type) + '</span>';
  }

  var lastTs = order.delivered_at || order.dispatched_at || order.updated_at || order.created_at;
  var updated = 'Updated ' + _foRelTime(lastTs);

  var bar = '';
  for (var i = 0; i < steps.length; i++) {
    var done   = i < activeIdx;
    var active = i === activeIdx;
    var cls    = done ? 'is-done' : (active ? 'is-active' : '');
    bar += '<div class="fo-step ' + cls + '">'
        +    '<div class="fo-step-dot"></div>'
        +    '<div class="fo-step-label">' + steps[i] + '</div>'
        +  '</div>';
    if (i < steps.length - 1) {
      bar += '<div class="fo-step-line ' + (done ? 'is-done' : '') + '"></div>';
    }
  }

  var description = '';
  if (order.status === 'Ordered')      description = 'Your order has been confirmed and the kitchen is preparing it.';
  else if (order.status === 'Dispatched') description = 'Your order is out for delivery and will arrive today.';
  else if (order.status === 'Delivered')  description = 'Your order has been delivered successfully.';

  return ''
    + '<div class="fo-tracker" data-order-id="' + order.id + '">'
    +   '<h3 class="fo-tracker-status ' + head.cls + '">' + head.text + '</h3>'
    +   '<p class="fo-tracker-expected">' + expected + '</p>'
    +   '<p class="fo-tracker-updated">' + description + ' (' + updated + ')</p>'
    +   '<div class="fo-tracker-steps">' + bar + '</div>'
    + '</div>';
}

/* ---- 2. Open tracker modal for an order ---- */
async function foOpenTrackerModal(orderId) {
  var API = _foAPI();
  try {
    var res = await fetch(API + '/api/food-ordering/order/' + orderId + '/', {credentials:'include'});
    var data = await res.json();
    if (!data.success) { alert('Could not load order #' + orderId + ': ' + (data.error||'')); return; }
    _foShowTrackerModal(data.data);
  } catch (e) {
    alert('Could not load order #' + orderId + ': ' + e.message);
  }
}

function _foShowTrackerModal(order) {
  var bg = document.getElementById('fo-tracker-modal-bg');
  if (!bg) {
    bg = document.createElement('div');
    bg.id = 'fo-tracker-modal-bg';
    bg.className = 'fo-tracker-modal-bg';
    bg.innerHTML =
      '<div class="fo-tracker-modal">'
    +   '<button class="fo-tracker-modal-close" onclick="_foCloseTrackerModal()">&times;</button>'
    +   '<h4 id="fo-tracker-modal-title"></h4>'
    +   '<div id="fo-tracker-modal-body"></div>'
    + '</div>';
    document.body.appendChild(bg);
    bg.addEventListener('click', function(e){ if (e.target === bg) _foCloseTrackerModal(); });
  }
  document.getElementById('fo-tracker-modal-title').innerHTML =
    'Order <b>#' + order.id + '</b> &mdash; ' + (order.property_name || '') +
    ' &bull; ' + (order.meal_type || '');
  document.getElementById('fo-tracker-modal-body').innerHTML = foRenderTracker(order);
  bg.classList.add('is-open');
}

function _foCloseTrackerModal() {
  var bg = document.getElementById('fo-tracker-modal-bg');
  if (bg) bg.classList.remove('is-open');
}

/* ---- 3. Inject Track button into every orders-table row ----
   Idempotent — safe to call any number of times. Skips loading/empty
   placeholder rows (the ones using <td colspan="8">). */
function foInjectTrackButtons() {
  var rows = document.querySelectorAll('#foOrdersTbody tr');
  rows.forEach(function(tr){
    if (tr.querySelector('.fo-track-btn')) return;
    if (tr.querySelector('td[colspan]'))   return;
    var firstCell  = tr.cells[0];
    var actionCell = tr.cells[tr.cells.length - 1];
    if (!firstCell || !actionCell) return;
    var idMatch = firstCell.textContent.match(/(\d+)/);
    if (!idMatch) return;
    var orderId = idMatch[1];
    var btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'fo-track-btn';
    btn.innerHTML = '📦 Track';
    btn.onclick   = function(){ foOpenTrackerModal(orderId); };
    actionCell.insertBefore(btn, actionCell.firstChild);
  });
}

/* ---- 4. Auto-inject after every orders-table render ----
   Uses MutationObserver so we never touch foLoadOrders directly. */
(function(){
  function startTrackerObserver(){
    var tbody = document.getElementById('foOrdersTbody');
    if (!tbody) { setTimeout(startTrackerObserver, 500); return; }
    foInjectTrackButtons();
    new MutationObserver(function(){ foInjectTrackButtons(); })
      .observe(tbody, {childList:true, subtree:false});
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTrackerObserver);
  } else {
    startTrackerObserver();
  }
})();

/* ---- 5. Helpers ---- */
function _foFmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    weekday:'long', month:'long', day:'numeric', year:'numeric'
  });
}
function _foMealWindow(meal) {
  return {
    'Breakfast':       'by 9:00 AM',
    'Lunch':           'by 1:30 PM',
    'Evening Snacks':  'by 5:30 PM',
    'Snacks':          'by 5:30 PM',
    'Dinner':          'by 8:30 PM'
  }[meal] || 'by end of day';
}
function _foRelTime(iso) {
  if (!iso) return 'just now';
  var ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms) || ms < 0) return 'just now';
  var mins = Math.floor(ms / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return mins + ' minute(s) ago';
  var hrs  = Math.floor(mins / 60);
  if (hrs  < 24) return hrs  + ' hour(s) ago';
  var days = Math.floor(hrs / 24);
  return days + ' day(s) ago';
}
