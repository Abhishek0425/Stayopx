"""
fix_food_ordering.py
====================
Run this ONCE from your backend folder:

    cd C:\Users\Administrator\Documents\Staylytics\Stayopx\backend
    venv\Scripts\activate
    python fix_food_ordering.py

Then run:
    python manage.py makemigrations dashboard
    python manage.py migrate
    python manage.py runserver

Test: http://127.0.0.1:8000/api/food-ordering/orders/
Should return JSON, not HTML.
"""
import os, sys, re

BASE = os.path.dirname(os.path.abspath(__file__))
print(f"\nWorking in: {BASE}\n")

# ── Find files ────────────────────────────────────────────────────
def find(name, start=BASE):
    for root, dirs, files in os.walk(start):
        dirs[:] = [d for d in dirs if d not in
                   ('venv','env','.venv','__pycache__','.git','node_modules')]
        if name in files:
            return os.path.join(root, name)
    return None

# Prefer dashboard/ subfolder for urls/views/models
DASH = os.path.join(BASE, 'dashboard')

urls_path   = os.path.join(DASH, 'urls.py')   if os.path.exists(os.path.join(DASH,'urls.py'))   else find('urls.py')
views_path  = os.path.join(DASH, 'views.py')  if os.path.exists(os.path.join(DASH,'views.py'))  else find('views.py')
models_path = os.path.join(DASH, 'models.py') if os.path.exists(os.path.join(DASH,'models.py')) else find('models.py')

print(f"urls.py   → {urls_path}")
print(f"views.py  → {views_path}")
print(f"models.py → {models_path}\n")

if not all([urls_path, views_path, models_path]):
    print("ERROR: Could not find all required files.")
    sys.exit(1)

# ════════════════════════════════════════════════════════════════
# 1. PATCH urls.py
# ════════════════════════════════════════════════════════════════
with open(urls_path, 'r', encoding='utf-8') as f:
    urls = f.read()

if 'fo_get_orders' in urls:
    print("✅ urls.py  — food ordering routes already present")
else:
    # Strip trailing ] and whitespace, then append new routes
    urls = urls.rstrip().rstrip(']').rstrip()
    urls += """

    # ── Food Ordering & Receiving ─────────────────────────────────
    path('food-ordering/create-order/',         views.fo_create_order,     name='fo_create_order'),
    path('food-ordering/orders/',               views.fo_get_orders,       name='fo_get_orders'),
    path('food-ordering/order/<int:order_id>/', views.fo_get_order_detail, name='fo_order_detail'),
    path('food-ordering/kitchen-summary/',      views.fo_kitchen_summary,  name='fo_kitchen_summary'),
    path('food-ordering/dispatch/',             views.fo_dispatch_order,   name='fo_dispatch_order'),
    path('food-ordering/verify-delivery/',      views.fo_verify_delivery,  name='fo_verify_delivery'),
    path('food-ordering/cancel/',               views.fo_cancel_order,     name='fo_cancel_order'),
]
"""
    with open(urls_path, 'w', encoding='utf-8') as f:
        f.write(urls)
    print("✅ urls.py  — food ordering routes ADDED")

# Verify
with open(urls_path, 'r', encoding='utf-8') as f:
    check = f.read()
if 'fo_get_orders' in check:
    print("   Verified: fo_get_orders found in urls.py ✓")
else:
    print("   ERROR: fo_get_orders NOT found after patching!")
    sys.exit(1)

# ════════════════════════════════════════════════════════════════
# 2. PATCH models.py
# ════════════════════════════════════════════════════════════════
with open(models_path, 'r', encoding='utf-8') as f:
    models = f.read()

if 'class FoodOrder(' in models:
    print("✅ models.py — FoodOrder already present")
else:
    if 'from django.utils import timezone' not in models:
        models = models.replace(
            'from django.db import models',
            'from django.db import models\nfrom django.utils import timezone'
        )
    models += """

# ════════════════════════════════════════════════════════════════
#  FOOD ORDERING MODELS
# ════════════════════════════════════════════════════════════════

class FoodOrder(models.Model):
    MEAL_CHOICES = [
        ('Breakfast','Breakfast'),('Lunch','Lunch'),
        ('Evening Snacks','Evening Snacks'),('Dinner','Dinner'),
    ]
    STATUS_CHOICES = [
        ('Ordered','Ordered'),('Dispatched','Dispatched'),
        ('Delivered','Delivered'),('Cancelled','Cancelled'),
    ]
    property_name = models.CharField(max_length=200)
    unit_lead     = models.CharField(max_length=200, blank=True, null=True)
    meal_type     = models.CharField(max_length=30, choices=MEAL_CHOICES)
    order_date    = models.DateField()
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Ordered')
    notes         = models.TextField(blank=True, null=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)
    dispatched_at = models.DateTimeField(blank=True, null=True)
    delivered_at  = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'FoodOrder #{self.pk} — {self.property_name}'

    def to_dict(self):
        return {
            'id':            self.pk,
            'property_name': self.property_name,
            'unit_lead':     self.unit_lead or '',
            'meal_type':     self.meal_type,
            'order_date':    str(self.order_date),
            'status':        self.status,
            'notes':         self.notes or '',
            'created_at':    self.created_at.strftime('%d %b %Y %H:%M'),
            'dispatched_at': self.dispatched_at.strftime('%d %b %Y %H:%M') if self.dispatched_at else None,
            'delivered_at':  self.delivered_at.strftime('%d %b %Y %H:%M') if self.delivered_at else None,
            'item_count':    self.fo_items.count(),
        }


class FoodOrderItem(models.Model):
    UNIT_CHOICES = [
        ('kg','Kg'),('grams','Grams'),('litres','Litres'),('ml','ML'),
        ('pieces','Pieces'),('packets','Packets'),('dozen','Dozen'),('boxes','Boxes'),
    ]
    order             = models.ForeignKey(FoodOrder, on_delete=models.CASCADE, related_name='fo_items')
    dish_name         = models.CharField(max_length=200)
    quantity          = models.DecimalField(max_digits=10, decimal_places=2)
    unit              = models.CharField(max_length=20, choices=UNIT_CHOICES, default='kg')
    received_quantity = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f'{self.dish_name} x{self.quantity}'

    def to_dict(self):
        return {
            'id':                self.pk,
            'dish_name':         self.dish_name,
            'quantity':          float(self.quantity),
            'unit':              self.unit,
            'received_quantity': float(self.received_quantity) if self.received_quantity is not None else None,
        }


class FoodDispatch(models.Model):
    order         = models.OneToOneField(FoodOrder, on_delete=models.CASCADE, related_name='dispatch')
    dispatch_otp  = models.CharField(max_length=6)
    dispatched_by = models.CharField(max_length=200, blank=True, null=True)
    dispatched_at = models.DateTimeField(auto_now_add=True)
    otp_verified  = models.BooleanField(default=False)
    verified_at   = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f'Dispatch Order#{self.order_id}'

    def is_expired(self):
        from datetime import timedelta
        return timezone.now() > self.dispatched_at + timedelta(hours=4)
"""
    with open(models_path, 'w', encoding='utf-8') as f:
        f.write(models)
    print("✅ models.py — FoodOrder models ADDED")

# ════════════════════════════════════════════════════════════════
# 3. PATCH views.py
# ════════════════════════════════════════════════════════════════
with open(views_path, 'r', encoding='utf-8') as f:
    views = f.read()

if 'def fo_get_orders' in views:
    print("✅ views.py  — food ordering views already present")
else:
    # Fix import line
    import re
    views = re.sub(
        r'(from \.models\s+import\s+)([^\n]+)',
        lambda m: (m.group(0) if 'FoodOrder' in m.group(2)
                   else m.group(1) + m.group(2).rstrip() + ', FoodOrder, FoodOrderItem, FoodDispatch'),
        views, count=1
    )

    views += """

# ════════════════════════════════════════════════════════════════
#  FOOD ORDERING VIEWS
# ════════════════════════════════════════════════════════════════
import random as _rand
import string as _str
from django.utils import timezone as _tz
from datetime     import timedelta as _td


@csrf_exempt
@require_http_methods(['POST'])
def fo_create_order(request):
    b = _body(request)
    property_name = b.get('property_name', '').strip()
    unit_lead     = b.get('unit_lead', '').strip()
    meal_type     = b.get('meal_type', '').strip()
    order_date    = b.get('order_date', '').strip()
    notes         = b.get('notes', '').strip()
    items         = b.get('items', [])
    if not all([property_name, meal_type, order_date]):
        return _err('property_name, meal_type and order_date are required.')
    if not items:
        return _err('At least one item is required.')
    try:
        order = FoodOrder.objects.create(
            property_name=property_name, unit_lead=unit_lead or None,
            meal_type=meal_type, order_date=order_date,
            status='Ordered', notes=notes or None,
        )
        for item in items:
            d = str(item.get('dish_name', '')).strip()
            q = item.get('quantity', 0)
            u = str(item.get('unit', 'kg')).strip()
            if d and float(q) > 0:
                FoodOrderItem.objects.create(order=order, dish_name=d,
                                              quantity=q, unit=u)
    except Exception as e:
        return _err(f'Failed: {str(e)}', 500)
    return _ok(order.to_dict(), status=201)


@require_http_methods(['GET'])
def fo_get_orders(request):
    qs = FoodOrder.objects.all()
    if request.GET.get('status'):    qs = qs.filter(status=request.GET['status'])
    if request.GET.get('date'):      qs = qs.filter(order_date=request.GET['date'])
    if request.GET.get('meal_type'): qs = qs.filter(meal_type=request.GET['meal_type'])
    a = FoodOrder.objects.all()
    stats = {
        'total': a.count(), 'ordered': a.filter(status='Ordered').count(),
        'dispatched': a.filter(status='Dispatched').count(),
        'delivered': a.filter(status='Delivered').count(),
        'cancelled': a.filter(status='Cancelled').count(),
    }
    return _ok({'orders': [o.to_dict() for o in qs], 'stats': stats})


@require_http_methods(['GET'])
def fo_get_order_detail(request, order_id):
    try:
        order = FoodOrder.objects.get(pk=order_id)
    except FoodOrder.DoesNotExist:
        return _err('Order not found.', 404)
    data = order.to_dict()
    data['items'] = [i.to_dict() for i in order.fo_items.all()]
    try:
        d = order.dispatch
        data['dispatch'] = {
            'otp_verified': d.otp_verified,
            'dispatched_at': d.dispatched_at.strftime('%d %b %Y %H:%M'),
            'dispatched_by': d.dispatched_by or '',
        }
    except FoodDispatch.DoesNotExist:
        data['dispatch'] = None
    return _ok(data)


@require_http_methods(['GET'])
def fo_kitchen_summary(request):
    from django.db.models import Sum
    date      = request.GET.get('date', '')
    meal_type = request.GET.get('meal_type', '')
    qs = FoodOrderItem.objects.filter(order__status__in=['Ordered', 'Dispatched'])
    if date:      qs = qs.filter(order__order_date=date)
    if meal_type: qs = qs.filter(order__meal_type=meal_type)
    summary = (qs.values('dish_name', 'unit', 'order__meal_type', 'order__order_date')
                 .annotate(total_qty=Sum('quantity'))
                 .order_by('order__meal_type', 'dish_name'))
    rows = [{'dish_name': r['dish_name'], 'unit': r['unit'],
              'meal_type': r['order__meal_type'],
              'order_date': str(r['order__order_date']),
              'total_qty': float(r['total_qty'])} for r in summary]
    dates = list(FoodOrder.objects.values_list('order_date', flat=True)
                 .distinct().order_by('-order_date')[:30])
    return _ok({'summary': rows, 'dates': [str(d) for d in dates],
                'meal_types': ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner']})


@csrf_exempt
@require_http_methods(['POST'])
def fo_dispatch_order(request):
    b             = _body(request)
    order_id      = b.get('order_id')
    dispatched_by = b.get('dispatched_by', '').strip()
    if not order_id:
        return _err('order_id is required.')
    try:
        order = FoodOrder.objects.get(pk=order_id)
    except FoodOrder.DoesNotExist:
        return _err('Order not found.', 404)
    if order.status in ('Delivered', 'Cancelled'):
        return _err(f'Cannot dispatch: {order.status}')
    otp_code = ''.join(_rand.choices(_str.digits, k=6))
    FoodDispatch.objects.update_or_create(
        order=order,
        defaults={'dispatch_otp': otp_code, 'dispatched_by': dispatched_by or None,
                  'otp_verified': False, 'verified_at': None}
    )
    order.status        = 'Dispatched'
    order.dispatched_at = _tz.now()
    order.save()
    print(f'\\n{"="*50}\\n  DISPATCH OTP Order #{order_id}: {otp_code}\\n{"="*50}\\n')
    return _ok({'dispatched': True, 'order_id': order_id,
                'dispatch_otp': otp_code, 'status': 'Dispatched'})


@csrf_exempt
@require_http_methods(['POST'])
def fo_verify_delivery(request):
    b          = _body(request)
    order_id   = b.get('order_id')
    otp_code   = str(b.get('otp_code', '')).strip()
    recv_items = b.get('received_items', [])
    if not order_id or not otp_code:
        return _err('order_id and otp_code are required.')
    try:
        order = FoodOrder.objects.get(pk=order_id)
    except FoodOrder.DoesNotExist:
        return _err('Order not found.', 404)
    if order.status == 'Delivered':
        return _err('Already delivered.')
    try:
        dispatch = order.dispatch
    except FoodDispatch.DoesNotExist:
        return _err('Not dispatched yet.')
    if dispatch.otp_verified:
        return _err('OTP already used.')
    if dispatch.is_expired():
        return _err('OTP expired.')
    if dispatch.dispatch_otp != otp_code:
        return _err('Incorrect OTP.')
    mismatches = []
    for item_data in recv_items:
        try:
            item     = FoodOrderItem.objects.get(pk=item_data.get('id'), order=order)
            recv_qty = float(item_data.get('received_quantity', 0))
            if recv_qty > float(item.quantity):
                return _err(f'Qty exceeds ordered for "{item.dish_name}".')
            item.received_quantity = recv_qty
            item.save()
            if recv_qty < float(item.quantity):
                mismatches.append({'dish_name': item.dish_name,
                                    'ordered': float(item.quantity),
                                    'received': recv_qty,
                                    'shortage': float(item.quantity) - recv_qty,
                                    'unit': item.unit})
        except FoodOrderItem.DoesNotExist:
            continue
    dispatch.otp_verified = True
    dispatch.verified_at  = _tz.now()
    dispatch.save()
    order.status       = 'Delivered'
    order.delivered_at = _tz.now()
    order.save()
    return _ok({'delivered': True, 'order_id': order_id,
                'status': 'Delivered', 'mismatches': mismatches})


@csrf_exempt
@require_http_methods(['POST'])
def fo_cancel_order(request):
    b        = _body(request)
    order_id = b.get('order_id')
    if not order_id:
        return _err('order_id is required.')
    try:
        order = FoodOrder.objects.get(pk=order_id)
    except FoodOrder.DoesNotExist:
        return _err('Order not found.', 404)
    if order.status in ('Dispatched', 'Delivered'):
        return _err(f'Cannot cancel: {order.status}')
    order.status = 'Cancelled'
    order.save()
    return _ok({'cancelled': True, 'order_id': order_id})
"""
    with open(views_path, 'w', encoding='utf-8') as f:
        f.write(views)
    print("✅ views.py  — food ordering views ADDED")

# ════════════════════════════════════════════════════════════════
# 4. VERIFY project urls.py doesn't have food_ordering_dashboard
# ════════════════════════════════════════════════════════════════
proj_urls = os.path.join(BASE, 'uniliv_project', 'urls.py')
if os.path.exists(proj_urls):
    with open(proj_urls, 'r', encoding='utf-8') as f:
        pu = f.read()
    if 'food_ordering_dashboard' in pu:
        pu = pu.replace(
            "    path('food-ordering/',   views.food_ordering_dashboard, name='food_ordering'),\n",
            ''
        ).replace(
            "    # Food Ordering dashboard page\n",
            ''
        )
        with open(proj_urls, 'w', encoding='utf-8') as f:
            f.write(pu)
        print("✅ project/urls.py — removed broken food_ordering_dashboard route")
    else:
        print("✅ project/urls.py — OK (no food_ordering_dashboard)")

# ════════════════════════════════════════════════════════════════
# 5. VERIFY settings.py has no food_management
# ════════════════════════════════════════════════════════════════
settings_path = os.path.join(BASE, 'uniliv_project', 'settings.py')
if os.path.exists(settings_path):
    with open(settings_path, 'r', encoding='utf-8') as f:
        st = f.read()
    if 'food_management' in st:
        st = re.sub(r"\s*'food_management'[^\n]*\n", '\n', st)
        with open(settings_path, 'w', encoding='utf-8') as f:
            f.write(st)
        print("✅ settings.py — removed food_management from INSTALLED_APPS")
    else:
        print("✅ settings.py — OK (no food_management)")

# ════════════════════════════════════════════════════════════════
# DONE
# ════════════════════════════════════════════════════════════════
print("""
============================================================
  ALL DONE! Now run:

    python manage.py makemigrations dashboard
    python manage.py migrate
    python manage.py runserver

  Then open in browser:
    http://127.0.0.1:8000/api/food-ordering/orders/

  You should see JSON like:
    {"success": true, "data": {"orders": [], "stats": {...}}}

  If you see HTML instead, the URL is still not registered.
  Share the output of this script and we will debug further.
============================================================
""")
