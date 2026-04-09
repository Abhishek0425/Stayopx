from django.contrib import admin
from .models import Dish, GeneratedMenu

@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display   = ('dish_name', 'meal_type', 'brand', 'is_star', 'is_dal', 'is_aloo', 'created_at')
    list_filter    = ('meal_type', 'brand', 'is_star', 'is_dal', 'is_aloo')
    search_fields  = ('dish_name', 'ingredients')
    list_editable  = ('is_star', 'is_dal')
    readonly_fields = ('created_at',)

@admin.register(GeneratedMenu)
class GeneratedMenuAdmin(admin.ModelAdmin):
    list_display = ('brand', 'created_at')
    list_filter  = ('brand',)
