"""dashboard/admin.py"""
from django.contrib import admin
from .models import Dish, ScheduledMeal, GeneratedMenu, UserProfile


@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display   = ('dish_name', 'meal_type', 'brand', 'is_dal', 'is_star', 'is_aloo', 'created_at')
    list_filter    = ('meal_type', 'brand', 'is_dal', 'is_star', 'is_aloo')
    search_fields  = ('dish_name',)
    ordering       = ('brand', 'meal_type', 'dish_name')


@admin.register(ScheduledMeal)
class ScheduledMealAdmin(admin.ModelAdmin):
    list_display  = ('brand', 'week_number', 'day_of_week',
                     'breakfast1', 'lunch_dal', 'dinner_dal')
    list_filter   = ('brand', 'week_number')
    ordering      = ('brand', 'week_number', 'day_of_week')


@admin.register(GeneratedMenu)
class GeneratedMenuAdmin(admin.ModelAdmin):
    list_display = ('brand', 'created_at')
    list_filter  = ('brand',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'role', 'brand')
    list_filter   = ('role', 'brand')
    search_fields = ('user__username', 'user__email')
