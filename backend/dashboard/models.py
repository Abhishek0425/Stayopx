"""dashboard/models.py"""
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


# ══════════════════════════════════════════════════════════════════
#  DISH MODEL
# ══════════════════════════════════════════════════════════════════
class Dish(models.Model):
    MEAL_CHOICES  = [('Breakfast','Breakfast'),('Lunch','Lunch'),
                     ('Dinner','Dinner'),('Snacks','Snacks')]
    BRAND_CHOICES = [('uniliv','UNILIV'),('huddle','HUDDLE')]

    dish_name   = models.CharField(max_length=200)
    meal_type   = models.CharField(max_length=20, choices=MEAL_CHOICES)
    ingredients = models.TextField(blank=True, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    brand       = models.CharField(max_length=20, choices=BRAND_CHOICES, default='uniliv')
    is_dal      = models.BooleanField(default=False)
    is_star     = models.BooleanField(default=False)
    is_aloo     = models.BooleanField(default=False)

    class Meta:
        ordering        = ['-created_at']
        unique_together = [('dish_name', 'meal_type', 'brand')]

    def __str__(self):
        return f"{self.dish_name} ({self.meal_type}/{self.brand.upper()})"

    def save(self, *args, **kwargs):
        nl = self.dish_name.lower()
        if any(w in nl for w in ['aloo', 'potato', 'alu ']):
            self.is_aloo = True
        if any(w in nl for w in ['dal', 'daal', 'kadhi', 'rajma', 'chana', 'moong',
                                   'arhar', 'toor', 'urad', 'masoor', 'sambhar',
                                   'sambar', 'sambher', 'choley', 'chooley']):
            self.is_dal = True
        super().save(*args, **kwargs)

    def to_dict(self):
        return {
            'id':          self.pk,
            'dish_name':   self.dish_name,
            'meal_type':   self.meal_type,
            'ingredients': self.ingredients or '',
            'brand':       self.brand,
            'is_dal':      self.is_dal,
            'is_star':     self.is_star,
            'is_aloo':     self.is_aloo,
            'created_at':  self.created_at.strftime('%d %b %Y'),
        }


# ══════════════════════════════════════════════════════════════════
#  SCHEDULED MEAL MODEL
# ══════════════════════════════════════════════════════════════════
class ScheduledMeal(models.Model):
    """
    Stores the EXACT day-wise menu from the Excel files.
    4 weeks × 7 days = 28 rows per brand (56 total).
    Each row = one day's complete menu for that brand.
    """
    BRAND_CHOICES = [('uniliv', 'UNILIV'), ('huddle', 'HUDDLE')]
    DAY_CHOICES   = [
        ('Monday',    'Monday'),
        ('Tuesday',   'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday',  'Thursday'),
        ('Friday',    'Friday'),
        ('Saturday',  'Saturday'),
        ('Sunday',    'Sunday'),
    ]

    brand       = models.CharField(max_length=20, choices=BRAND_CHOICES)
    week_number = models.PositiveSmallIntegerField(help_text='1–4')
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)

    # Breakfast (UNILIV has 2, HUDDLE has 1)
    breakfast1  = models.CharField(max_length=200, blank=True, null=True)
    breakfast2  = models.CharField(max_length=200, blank=True, null=True)

    # Lunch
    lunch_dal   = models.CharField(max_length=200, blank=True, null=True)
    lunch_veg1  = models.CharField(max_length=200, blank=True, null=True)
    lunch_veg2  = models.CharField(max_length=200, blank=True, null=True)  # UNILIV only

    # Snacks
    snack       = models.CharField(max_length=200, blank=True, null=True)

    # Dinner
    dinner_dal  = models.CharField(max_length=200, blank=True, null=True)
    dinner_veg1 = models.CharField(max_length=200, blank=True, null=True)
    dinner_veg2 = models.CharField(max_length=200, blank=True, null=True)  # UNILIV only

    class Meta:
        ordering        = ['brand', 'week_number', 'day_of_week']
        unique_together = [('brand', 'week_number', 'day_of_week')]

    def __str__(self):
        return f"{self.brand.upper()} Week{self.week_number} {self.day_of_week}"


# ══════════════════════════════════════════════════════════════════
#  GENERATED MENU MODEL
# ══════════════════════════════════════════════════════════════════
class GeneratedMenu(models.Model):
    brand      = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.brand.upper()} — {self.created_at.strftime('%d %b %Y %H:%M')}"


# ══════════════════════════════════════════════════════════════════
#  USER PROFILE MODEL  (NEW — for role-based login access)
# ══════════════════════════════════════════════════════════════════
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('property', 'Property Dashboard'),
        ('food',     'Food Dashboard'),
        ('admin',    'Both Dashboards'),
    ]
    BRAND_CHOICES = [
        ('uniliv', 'UNILIV'),
        ('huddle', 'HUDDLE'),
    ]

    user  = models.OneToOneField(
                User,
                on_delete=models.CASCADE,
                related_name='userprofile'
            )
    role  = models.CharField(max_length=20, choices=ROLE_CHOICES, default='food')
    brand = models.CharField(max_length=20, choices=BRAND_CHOICES, default='uniliv')

    class Meta:
        verbose_name        = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} — {self.get_role_display()} ({self.brand.upper()})"

    def to_dict(self):
        return {
            'username': self.user.username,
            'email':    self.user.email,
            'role':     self.role,
            'brand':    self.brand,
        }

# ════════════════════════════════════════════════════════════════
#  FOOD ORDERING MODELS
# ════════════════════════════════════════════════════════════════

class FoodOrder(models.Model):
    MEAL_CHOICES = [
        ('Breakfast','Breakfast'), ('Lunch','Lunch'),
        ('Evening Snacks','Evening Snacks'), ('Dinner','Dinner'),
    ]
    STATUS_CHOICES = [
        ('Ordered','Ordered'), ('Dispatched','Dispatched'),
        ('Delivered','Delivered'), ('Cancelled','Cancelled'),
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

