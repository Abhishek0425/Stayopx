"""dashboard/views.py — API endpoints."""
import json
from datetime import date, timedelta
from django.http  import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models     import Dish, ScheduledMeal, GeneratedMenu
from .validators import validate_dish, ValidationError


def _ok(data=None, status=200, **kw):
    p = {'success': True}
    if data is not None: p['data'] = data
    p.update(kw)
    return JsonResponse(p, status=status)

def _err(msg, status=400):
    return JsonResponse({'success': False, 'error': msg}, status=status)

def _body(req):
    try: return json.loads(req.body or '{}')
    except: return {}


# ── GET /api/dishes/ ──────────────────────────────────────────────────────────
@require_http_methods(['GET'])
def api_get_dishes(request):
    brand  = request.GET.get('brand', 'uniliv')
    dishes = Dish.objects.filter(brand=brand)
    return _ok([d.to_dict() for d in dishes])


# ── POST /api/add-dish/ ───────────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(['POST'])
def api_add_dish(request):
    b           = _body(request)
    dish_name   = (b.get('dish_name')   or '').strip()
    meal_type   = (b.get('meal_type')   or '').strip()
    brand       = (b.get('brand','uniliv') or 'uniliv').strip()
    ingredients = (b.get('ingredients') or '').strip()
    is_star     = bool(b.get('is_star', False))
    is_dal      = bool(b.get('is_dal',  False))

    if not dish_name: return _err('dish_name is required.')
    if meal_type not in ('Breakfast','Lunch','Dinner','Snacks'):
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


# ── DELETE /api/dishes/<id>/ ──────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(['DELETE'])
def api_delete_dish(request, dish_id):
    try:
        Dish.objects.get(pk=dish_id).delete()
        return _ok({'deleted_id': dish_id})
    except Dish.DoesNotExist:
        return _err('Dish not found.', 404)


# ── POST /api/menu/generate/ ──────────────────────────────────────────────────
# Serves EXACT schedule from Excel (ScheduledMeal table).
# 15-day menu = Week1 Mon-Sun (days 1-7) + Week2 Mon-Sun (days 8-14) + Week3 Mon (day 15)
@csrf_exempt
@require_http_methods(['POST'])
def api_generate_menu(request):
    b     = _body(request)
    brand = (b.get('brand','uniliv') or 'uniliv').strip()

    if brand not in ('uniliv','huddle'):
        return _err('brand must be uniliv or huddle.')

    # Check schedule exists
    schedule_count = ScheduledMeal.objects.filter(brand=brand).count()
    if schedule_count == 0:
        return _err(
            f'No schedule found for {brand.upper()}. '
            f'Run: python manage.py import_schedule'
        )

    DAYS_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    today      = date.today()
    days_out   = []

    # Generate 15 days by cycling through weeks 1→4 (Mon-Sun each)
    day_num = 0
    for week in range(1, 5):
        for day_name in DAYS_ORDER:
            if day_num >= 15:
                break
            day_num += 1
            date_label = (today + timedelta(days=day_num - 1)).strftime('%a, %d %b')

            try:
                sm = ScheduledMeal.objects.get(brand=brand, week_number=week, day_of_week=day_name)
            except ScheduledMeal.DoesNotExist:
                # Day missing in schedule — skip with placeholder
                sm = None

            def _slot(v):
                return {'name': v.strip()} if v and v.strip() else None

            days_out.append({
                'day_number':   day_num,
                'date_label':   date_label,
                'week_number':  week,
                'day_of_week':  day_name,
                'brand':        brand,
                'breakfast':    _slot(sm.breakfast1)  if sm else None,
                'breakfast2':   _slot(sm.breakfast2)  if sm else None,
                'lunch_dal':    _slot(sm.lunch_dal)   if sm else None,
                'lunch_star':   _slot(sm.lunch_veg1)  if sm else None,   # veg1 = main veg (star)
                'lunch_main':   _slot(sm.lunch_veg2)  if sm else None,   # veg2 = second veg
                'snack':        _slot(sm.snack)       if sm else None,
                'dinner_dal':   _slot(sm.dinner_dal)  if sm else None,
                'dinner_star':  _slot(sm.dinner_veg1) if sm else None,   # veg1 = main dinner veg
                'dinner_main':  _slot(sm.dinner_veg2) if sm else None,   # veg2 = second dinner veg
            })
        if day_num >= 15:
            break

    GeneratedMenu.objects.create(brand=brand)
    return _ok({'brand': brand, 'days': days_out, 'source': 'excel_schedule'})


# ── GET /api/menu/stats/ ──────────────────────────────────────────────────────
@require_http_methods(['GET'])
def api_stats(request):
    brand   = request.GET.get('brand','uniliv')
    dishes  = Dish.objects.filter(brand=brand)
    sched   = ScheduledMeal.objects.filter(brand=brand).count()
    return _ok({
        'total':     dishes.count(),
        'breakfast': dishes.filter(meal_type='Breakfast').count(),
        'lunch':     dishes.filter(meal_type='Lunch').count(),
        'dinner':    dishes.filter(meal_type='Dinner').count(),
        'snacks':    dishes.filter(meal_type='Snacks').count(),
        'dals':      dishes.filter(is_dal=True).count(),
        'stars':     dishes.filter(is_star=True).count(),
        'unique_dals': dishes.filter(is_dal=True).values('dish_name').distinct().count(),
        'schedule_days': sched,
    })
