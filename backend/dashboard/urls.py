"""dashboard/urls.py"""
from django.urls import path
from . import views

urlpatterns = [
    # Dishes
    path('dishes/',               views.api_get_dishes,    name='api_get_dishes'),
    path('add-dish/',             views.api_add_dish,      name='api_add_dish'),
    path('dishes/<int:dish_id>/', views.api_delete_dish,   name='api_delete_dish'),
    # Menu
    path('menu/generate/',        views.api_generate_menu, name='api_generate_menu'),
    path('menu/stats/',           views.api_stats,         name='api_stats'),
]
