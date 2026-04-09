from django.urls import path
from . import views

urlpatterns = [
    path('api/dishes/',              views.api_get_dishes,    name='api_get_dishes'),
    path('api/add-dish/',            views.api_add_dish,      name='api_add_dish'),
    path('api/dishes/<int:dish_id>/',views.api_delete_dish,   name='api_delete_dish'),
    path('api/menu/generate/',       views.api_generate_menu, name='api_generate_menu'),
    path('api/menu/stats/',          views.api_stats,         name='api_stats'),
]
