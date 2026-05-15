# backend/dashboard/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ── Dishes ────────────────────────────────────────────────────
    path('dishes/',               views.api_get_dishes,            name='api_get_dishes'),
    path('add-dish/',             views.api_add_dish,              name='api_add_dish'),
    path('dishes/<int:dish_id>/', views.api_delete_dish,           name='api_delete_dish'),

    # ── Menu ──────────────────────────────────────────────────────
    path('menu/generate/',        views.api_generate_menu,         name='api_generate_menu'),
    path('menu/stats/',           views.api_stats,                 name='api_stats'),

    # ── Food Report PDF ───────────────────────────────────────────
    path('food-report/download/', views.api_download_food_report,  name='api_download_food_report'),

    # ── Food Ordering ── THESE 7 LINES MUST BE PRESENT ────────────
    path('food-ordering/create-order/',         views.fo_create_order,     name='fo_create_order'),
    path('food-ordering/orders/',               views.fo_get_orders,       name='fo_get_orders'),
    path('food-ordering/order/<int:order_id>/', views.fo_get_order_detail, name='fo_order_detail'),
    path('food-ordering/kitchen-summary/',      views.fo_kitchen_summary,  name='fo_kitchen_summary'),
    path('food-ordering/dispatch/',             views.fo_dispatch_order,   name='fo_dispatch_order'),
    path('food-ordering/verify-delivery/',      views.fo_verify_delivery,  name='fo_verify_delivery'),
    path('food-ordering/cancel/',               views.fo_cancel_order,     name='fo_cancel_order'),
]
