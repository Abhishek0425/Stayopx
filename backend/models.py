"""dashboard/models.py"""
from django.db import models
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
