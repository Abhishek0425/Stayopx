"""dashboard/views.py — All API endpoints + auth."""
import json
from datetime import date, timedelta

from django.contrib.auth import authenticate, login, logout
from django.http  import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models     import Dish, ScheduledMeal, GeneratedMenu
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
@require_http_methods(['POST'])
def api_add_dish(request):
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
@require_http_methods(['DELETE'])
def api_delete_dish(request, dish_id):
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
@require_http_methods(['POST'])
def api_generate_menu(request):
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
