"""dashboard/views.py — All API endpoints + auth."""
import json
from datetime import date, timedelta

from django.contrib.auth import authenticate, login, logout
from django.http  import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models     import Dish, ScheduledMeal, GeneratedMenu, FoodOrder, FoodOrderItem
from .validators import validate_dish, ValidationError

# ── Helpers ───────────────────────────────────────────────────────
def _ok(data=None, status=200, **kw):
    p = {'success': True}
    if data is not None: p['data'] = data
    p.update(kw)
    return JsonResponse(p, status=status)

def _err(msg, status=400):
    return JsonResponse({'success': False, 'error': msg}, status=status)

def _body(req):
    try:    return json.loads(req.body or '{}')
    except: return {}

def _get_profile(user):
    """Return (role, brand) from UserProfile — fallback to admin/uniliv."""
    try:
        return user.userprofile.role, user.userprofile.brand
    except Exception:
        return 'admin', 'uniliv'

# ══════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ══════════════════════════════════════════════════════════════════

# POST /api/auth/login/
@csrf_exempt
def api_login(request):
    if request.method != 'POST':
        return _err('POST required.', 405)

    b        = _body(request)
    username = b.get('username', '').strip()
    password = b.get('password', '').strip()

    if not username or not password:
        return _err('Username and password are required.', 400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse(
            {'success': False, 'error': 'Invalid username or password.'},
            status=401
        )

    login(request, user)
    role, brand = _get_profile(user)

    return JsonResponse({
        'success':  True,
        'username': user.username,
        'email':    user.email,
        'role':     role,
        'brand':    brand,
    })

# POST /api/auth/logout/
@csrf_exempt
def api_logout(request):
    logout(request)
    return _ok({'message': 'Logged out successfully.'})

# GET /api/auth/me/
def api_me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False}, status=401)
    role, brand = _get_profile(request.user)
    return JsonResponse({
        'authenticated': True,
        'username':      request.user.username,
        'email':         request.user.email,
        'role':          role,
        'brand':         brand,
    })

# ══════════════════════════════════════════════════════════════════
#  DISH ENDPOINTS
# ══════════════════════════════════════════════════════════════════

# GET /api/dishes/
@require_http_methods(['GET'])
def api_get_dishes(request):
    brand  = request.GET.get('brand', 'uniliv')
    dishes = Dish.objects.filter(brand=brand)
    return _ok([d.to_dict() for d in dishes])

# POST /api/add-dish/
@csrf_exempt
def api_add_dish(request):
    if request.method != 'POST': return _err('POST required.', 405)
    b           = _body(request)
    dish_name   = (b.get('dish_name')        or '').strip()
    meal_type   = (b.get('meal_type')        or '').strip()
    brand       = (b.get('brand', 'uniliv')  or 'uniliv').strip()
    ingredients = (b.get('ingredients')      or '').strip()
    is_star     = bool(b.get('is_star', False))
    is_dal      = bool(b.get('is_dal',  False))

    if not dish_name:
        return _err('dish_name is required.')
    if meal_type not in ('Breakfast', 'Lunch', 'Dinner', 'Snacks'):
        return _err('meal_type must be Breakfast, Lunch, Dinner, or Snacks.')

    try:
        validate_dish(dish_name, meal_type, brand)
    except ValidationError as e:
        return _err(str(e))

    dish, created = Dish.objects.get_or_create(
        dish_name=dish_name, meal_type=meal_type, brand=brand,
        defaults=dict(ingredients=ingredients or None, is_star=is_star, is_dal=is_dal)
    )
    if not created:
        return _err(f'"{dish_name}" already exists for {brand.upper()}.')

    return _ok(dish.to_dict(), status=201)

# DELETE /api/dishes/<id>/
@csrf_exempt
def api_delete_dish(request, dish_id):
    if request.method != 'DELETE': return _err('DELETE required.', 405)
    try:
        Dish.objects.get(pk=dish_id).delete()
        return _ok({'deleted_id': dish_id})
    except Dish.DoesNotExist:
        return _err('Dish not found.', 404)

# ══════════════════════════════════════════════════════════════════
#  MENU ENDPOINTS
# ══════════════════════════════════════════════════════════════════

# POST /api/menu/generate/
@csrf_exempt
def api_generate_menu(request):
    if request.method != 'POST': return _err('POST required.', 405)
    b     = _body(request)
    brand = (b.get('brand', 'uniliv') or 'uniliv').strip()

    if brand not in ('uniliv', 'huddle'):
        return _err('brand must be uniliv or huddle.')

    if not ScheduledMeal.objects.filter(brand=brand).exists():
        return _err(f'No schedule for {brand.upper()}. Run: python manage.py import_schedule')

    DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    today = date.today()
    out   = []
    n     = 0

    for week in range(1, 5):
        for day in DAYS:
            if n >= 15: break
            n += 1
            try:
                sm = ScheduledMeal.objects.get(brand=brand, week_number=week, day_of_week=day)
            except ScheduledMeal.DoesNotExist:
                sm = None

            def _s(v): return {'name': v.strip()} if v and v.strip() else None

            out.append({
                'day_number':  n,
                'date_label':  (today + timedelta(days=n-1)).strftime('%a, %d %b'),
                'week_number': week,
                'day_of_week': day,
                'brand':       brand,
                'breakfast':   _s(sm.breakfast1)  if sm else None,
                'breakfast2':  _s(sm.breakfast2)  if sm else None,
                'lunch_dal':   _s(sm.lunch_dal)   if sm else None,
                'lunch_star':  _s(sm.lunch_veg1)  if sm else None,
                'lunch_main':  _s(sm.lunch_veg2)  if sm else None,
                'snack':       _s(sm.snack)        if sm else None,
                'dinner_dal':  _s(sm.dinner_dal)  if sm else None,
                'dinner_star': _s(sm.dinner_veg1) if sm else None,
                'dinner_main': _s(sm.dinner_veg2) if sm else None,
            })
        if n >= 15: break

    GeneratedMenu.objects.create(brand=brand)
    return _ok({'brand': brand, 'days': out, 'source': 'excel_schedule'})

# GET /api/menu/stats/
@require_http_methods(['GET'])
def api_stats(request):
    brand  = request.GET.get('brand', 'uniliv')
    dishes = Dish.objects.filter(brand=brand)
    return _ok({
        'total':         dishes.count(),
        'breakfast':     dishes.filter(meal_type='Breakfast').count(),
        'lunch':         dishes.filter(meal_type='Lunch').count(),
        'dinner':        dishes.filter(meal_type='Dinner').count(),
        'snacks':        dishes.filter(meal_type='Snacks').count(),
        'dals':          dishes.filter(is_dal=True).count(),
        'stars':         dishes.filter(is_star=True).count(),
        'unique_dals':   dishes.filter(is_dal=True).values('dish_name').distinct().count(),
        'schedule_days': ScheduledMeal.objects.filter(brand=brand).count(),
    })

# ══════════════════════════════════════════════════════════════════
#  STORAGE ENDPOINTS
# ══════════════════════════════════════════════════════════════════

# POST /api/storage/upload/
@csrf_exempt
def api_upload_file(request):
    if request.method != 'POST': return _err('POST required.', 405)
    """
    Upload a file to Supabase Storage.
    Form fields:
        file     — the file to upload
        bucket   — 'media' | 'reports' | 'excel-uploads'
        folder   — optional subfolder (default: 'uploads')
    """
    if 'file' not in request.FILES:
        return _err('No file provided.')

    bucket = request.POST.get('bucket', 'media')
    folder = request.POST.get('folder', 'uploads')

    if bucket not in ('media', 'reports', 'excel-uploads'):
        return _err('bucket must be media, reports, or excel-uploads.')

    try:
        from .storage import SupabaseStorage
        f            = request.FILES['file']
        file_data    = f.read()
        content_type = f.content_type or 'application/octet-stream'
        path         = f'{folder}/{f.name}'

        storage = SupabaseStorage()
        url = storage.upload(bucket, path, file_data, content_type)

        return _ok({
            'url':    url,
            'path':   path,
            'bucket': bucket,
            'name':   f.name,
            'size':   len(file_data),
        }, status=201)

    except ValueError as e:
        return _err(str(e), 500)
    except Exception as e:
        return _err(f'Upload failed: {str(e)}', 500)

# DELETE /api/storage/delete/
@csrf_exempt
def api_delete_file(request):
    if request.method not in ('DELETE', 'POST'): return _err('DELETE or POST required.', 405)
    """
    Delete a file from Supabase Storage.
    JSON body: { "bucket": "media", "path": "uploads/file.png" }
    """
    b      = _body(request)
    bucket = b.get('bucket', '').strip()
    path   = b.get('path',   '').strip()

    if not bucket or not path:
        return _err('bucket and path are required.')

    try:
        from .storage import SupabaseStorage
        storage  = SupabaseStorage()
        deleted  = storage.delete(bucket, path)
        if deleted:
            return _ok({'deleted': True, 'path': path})
        return _err('File not found or could not be deleted.', 404)
    except Exception as e:
        return _err(f'Delete failed: {str(e)}', 500)

# GET /api/storage/files/?bucket=media&folder=uploads
@require_http_methods(['GET'])
def api_list_files(request):
    """List all files in a bucket folder."""
    bucket = request.GET.get('bucket', 'media')
    folder = request.GET.get('folder', '')

    try:
        from .storage import SupabaseStorage
        storage = SupabaseStorage()
        files   = storage.list_files(bucket, folder)
        return _ok({'bucket': bucket, 'folder': folder, 'files': files})
    except Exception as e:
        return _err(f'List failed: {str(e)}', 500)

# ══════════════════════════════════════════════════════════════════
#  FOOD REPORT — PDF download endpoint
# ══════════════════════════════════════════════════════════════════

# GET /api/food-report/download/?brand=huddle&week=1&property=Huddle+Stays+Nash+B+Tower&code=1100170062AO
@require_http_methods(['GET'])
def api_download_food_report(request):
    """
    Generate and return a weekly food menu PDF.
    Query params:
        brand    — uniliv | huddle
        week     — 1 | 2 | 3 | 4
        property — property display name
        code     — property code
    """
    from django.http import HttpResponse
    from datetime import date

    brand = request.GET.get('brand',    'uniliv')
    week  = request.GET.get('week',     '1')
    prop  = request.GET.get('property', 'Uniliv Property')
    code  = request.GET.get('code',     '')

    try:
        from .food_report import generate_food_pdf
    except ImportError as e:
        return _err(f'food_report.py missing: {e}', 500)

    DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    menu_data = []

    for day in DAYS:
        try:
            sm = ScheduledMeal.objects.get(
                brand=brand, week_number=int(week), day_of_week=day)
            menu_data.append({
                'day':       day,
                'breakfast': ',  '.join(filter(None, [sm.breakfast1, sm.breakfast2])),
                'lunch':     ',  '.join(filter(None, [sm.lunch_dal, sm.lunch_veg1, sm.lunch_veg2])),
                'snacks':    sm.snack or '',
                'dinner':    ',  '.join(filter(None, [sm.dinner_dal, sm.dinner_veg1, sm.dinner_veg2])),
            })
        except ScheduledMeal.DoesNotExist:
            # No schedule in DB — use blank placeholder row
            menu_data.append({
                'day':       day,
                'breakfast': 'Not scheduled',
                'lunch':     'Not scheduled',
                'snacks':    'Not scheduled',
                'dinner':    'Not scheduled',
            })
        except Exception:
            menu_data.append({
                'day': day,
                'breakfast': '', 'lunch': '', 'snacks': '', 'dinner': ''
            })

    try:
        pdf_bytes = generate_food_pdf(
            property_name=prop,
            property_code=code,
            week_label=f'Week {week}  |  {date.today().strftime("%B %Y")}',
            menu_data=menu_data,
        )
    except Exception as e:
        return _err(f'PDF generation failed: {str(e)}', 500)

    filename = f'Food_Report_{brand}_Week{week}.pdf'
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

# ════════════════════════════════════════════════════════════════
#  FOOD ORDERING VIEWS
# ════════════════════════════════════════════════════════════════
from django.utils import timezone as _tz

@csrf_exempt
def fo_create_order(request):
    if request.method != 'POST': return _err('POST required.', 405)
    b = _body(request)
    property_name = b.get('property_name','').strip()
    unit_lead     = b.get('unit_lead','').strip()
    meal_type     = b.get('meal_type','').strip()
    order_date    = b.get('order_date','').strip()
    items         = b.get('items',[])
    if not all([property_name, meal_type, order_date]):
        return _err('property_name, meal_type and order_date are required.')
    if not items:
        return _err('At least one item is required.')
    try:
        order = FoodOrder.objects.create(
            property_name=property_name, unit_lead=unit_lead or None,
            meal_type=meal_type, order_date=order_date, status='Ordered',
        )
        for item in items:
            d = str(item.get('dish_name','')).strip()
            q = item.get('quantity', 0)
            u = str(item.get('unit','kg')).strip()
            if d and float(q) > 0:
                FoodOrderItem.objects.create(order=order, dish_name=d, quantity=q, unit=u)
    except Exception as e:
        return _err(f'Failed: {str(e)}', 500)
    return _ok(order.to_dict(), status=201)

def fo_get_orders(request):
    if request.method != 'GET': return _err('GET required.', 405)
    qs = FoodOrder.objects.all()
    if request.GET.get('status'):    qs = qs.filter(status=request.GET['status'])
    if request.GET.get('date'):      qs = qs.filter(order_date=request.GET['date'])
    if request.GET.get('meal_type'): qs = qs.filter(meal_type=request.GET['meal_type'])
    a = FoodOrder.objects.all()
    stats = {
        'total':      a.count(),
        'ordered':    a.filter(status='Ordered').count(),
        'dispatched': a.filter(status='Dispatched').count(),
        'delivered':  a.filter(status='Delivered').count(),
        'cancelled':  a.filter(status='Cancelled').count(),
    }
    return _ok({'orders': [o.to_dict() for o in qs], 'stats': stats})

def fo_get_order_detail(request, order_id):
    if request.method != 'GET': return _err('GET required.', 405)
    try:
        order = FoodOrder.objects.get(pk=order_id)
    except FoodOrder.DoesNotExist:
        return _err('Order not found.', 404)
    data = order.to_dict()
    data['items'] = [i.to_dict() for i in order.fo_items.all()]
    data['dispatch'] = None
    return _ok(data)

def fo_kitchen_summary(request):
    if request.method != 'GET': return _err('GET required.', 405)
    from django.db.models import Sum
    date      = request.GET.get('date','')
    meal_type = request.GET.get('meal_type','')
    qs = FoodOrderItem.objects.filter(order__status__in=['Ordered','Dispatched'])
    if date:      qs = qs.filter(order__order_date=date)
    if meal_type: qs = qs.filter(order__meal_type=meal_type)
    summary = (qs.values('dish_name','unit','order__meal_type','order__order_date')
                 .annotate(total_qty=Sum('quantity'))
                 .order_by('order__meal_type','dish_name'))
    rows = [{'dish_name':r['dish_name'],'unit':r['unit'],
              'meal_type':r['order__meal_type'],
              'order_date':str(r['order__order_date']),
              'total_qty':float(r['total_qty'])} for r in summary]
    dates = list(FoodOrder.objects.values_list('order_date',flat=True)
                 .distinct().order_by('-order_date')[:30])
    return _ok({'summary':rows,'dates':[str(d) for d in dates],
                'meal_types':['Breakfast','Lunch','Evening Snacks','Dinner']})

@csrf_exempt
def fo_dispatch_order(request):
    if request.method != 'POST': return _err('POST required.', 405)
    b             = _body(request)
    order_id      = b.get('order_id')
    dispatched_by = b.get('dispatched_by','').strip()
    if not order_id: return _err('order_id is required.')
    try:
        order = FoodOrder.objects.get(pk=order_id)
    except FoodOrder.DoesNotExist:
        return _err('Order not found.', 404)
    if order.status in ('Delivered','Cancelled'):
        return _err(f'Cannot dispatch: {order.status}')
    order.status        = 'Dispatched'
    order.dispatched_at = _tz.now()
    if dispatched_by:
        order.notes = (order.notes or '') + f' | Dispatched by: {dispatched_by}'
    order.save()
    return _ok({'dispatched':True,'order_id':order_id,'status':'Dispatched'})

@csrf_exempt
def fo_verify_delivery(request):
    if request.method != 'POST': return _err('POST required.', 405)
    b          = _body(request)
    order_id   = b.get('order_id')
    recv_items = b.get('received_items',[])
    if not order_id:
        return _err('order_id is required.')
    try:
        order = FoodOrder.objects.get(pk=order_id)
    except FoodOrder.DoesNotExist:
        return _err('Order not found.', 404)
    if order.status == 'Delivered':
        return _err('Order already delivered.')
    if order.status != 'Dispatched':
        return _err('Order must be dispatched before confirming delivery.')
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
                mismatches.append({'dish_name':item.dish_name,'ordered':float(item.quantity),
                                    'received':recv_qty,'shortage':float(item.quantity)-recv_qty,
                                    'unit':item.unit})
        except FoodOrderItem.DoesNotExist:
            continue
    order.status       = 'Delivered'
    order.delivered_at = _tz.now()
    order.save()
    return _ok({'delivered':True,'order_id':order_id,
                'status':'Delivered','mismatches':mismatches,
                'message':'Delivery confirmed!'})

@csrf_exempt
def fo_cancel_order(request):
    if request.method != 'POST': return _err('POST required.', 405)
    b        = _body(request)
    order_id = b.get('order_id')
    if not order_id: return _err('order_id is required.')
    try:
        order = FoodOrder.objects.get(pk=order_id)
    except FoodOrder.DoesNotExist:
        return _err('Order not found.', 404)
    if order.status in ('Dispatched','Delivered'):
        return _err(f'Cannot cancel: {order.status}')
    order.status = 'Cancelled'
    order.save()
    return _ok({'cancelled':True,'order_id':order_id})
