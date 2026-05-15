"""uniliv_project/urls.py — COMPLETE FILE — replace backend/uniliv_project/urls.py with this"""
from django.contrib import admin
from django.urls    import path, include
from django.http    import JsonResponse
from dashboard      import views


def homepage(request):
    return JsonResponse({
        'status':  'running',
        'service': 'Stayopx API',
        'endpoints': [
            '/admin/',
            '/api/auth/login/',
            '/api/dishes/',
            '/api/menu/generate/',
            '/api/food-report/download/',
        ]
    })


urlpatterns = [
    path('',                 homepage,             name='home'),
    path('admin/',           admin.site.urls),

    # Auth
    path('api/auth/login/',  views.api_login,      name='login'),
    path('api/auth/logout/', views.api_logout,     name='logout'),
    path('api/auth/me/',     views.api_me,         name='me'),

    # All dashboard API routes
    path('api/',             include('dashboard.urls')),

    # Food Ordering — added directly here so dashboard/urls.py is NOT needed
    path('api/food-ordering/create-order/',         views.fo_create_order,     name='fo_create_order'),
    path('api/food-ordering/orders/',               views.fo_get_orders,       name='fo_get_orders'),
    path('api/food-ordering/order/<int:order_id>/', views.fo_get_order_detail, name='fo_order_detail'),
    path('api/food-ordering/kitchen-summary/',      views.fo_kitchen_summary,  name='fo_kitchen_summary'),
    path('api/food-ordering/dispatch/',             views.fo_dispatch_order,   name='fo_dispatch_order'),
    path('api/food-ordering/verify-delivery/',      views.fo_verify_delivery,  name='fo_verify_delivery'),
    path('api/food-ordering/cancel/',               views.fo_cancel_order,     name='fo_cancel_order'),
]
