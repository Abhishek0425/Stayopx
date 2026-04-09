"""dashboard/models.py — Updated Dish model with ingredients field."""
from django.db import models


class Dish(models.Model):
    MEAL_CHOICES = [
        ('Breakfast', 'Breakfast'),
        ('Lunch',     'Lunch'),
        ('Dinner',    'Dinner'),
        ('Snacks',    'Snacks'),
    ]
    BRAND_CHOICES = [
        ('uniliv', 'UNILIV'),
        ('huddle', 'HUDDLE'),
    ]

    # ── Required by spec ──────────────────────────────────────
    dish_name   = models.CharField(max_length=200)
    meal_type   = models.CharField(max_length=20, choices=MEAL_CHOICES)
    ingredients = models.TextField(blank=True, null=True,
                                   help_text='Optional — comma-separated ingredients')
    created_at  = models.DateTimeField(auto_now_add=True)

    # ── Extra flags for rule engine ───────────────────────────
    brand   = models.CharField(max_length=20, choices=BRAND_CHOICES, default='uniliv')
    is_dal  = models.BooleanField(default=False)
    is_star = models.BooleanField(default=False)
    is_aloo = models.BooleanField(default=False)

    class Meta:
        ordering            = ['-created_at']
        verbose_name_plural = 'Dishes'
        # Prevent exact duplicates per brand
        unique_together = [('dish_name', 'meal_type', 'brand')]

    def __str__(self):
        return f"{self.dish_name} ({self.meal_type} / {self.brand.upper()})"

    def save(self, *args, **kwargs):
        """Auto-detect aloo & dal flags from dish name."""
        nl = self.dish_name.lower()
        if any(w in nl for w in ['aloo', 'potato', 'alu ']):
            self.is_aloo = True
        if any(w in nl for w in ['dal', 'daal', 'kadhi', 'rajma', 'chana',
                                   'moong', 'arhar', 'toor', 'urad', 'masoor',
                                   'sambhar', 'sambar', 'sambher']):
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


class GeneratedMenu(models.Model):
    brand      = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.brand.upper()} — {self.created_at.strftime('%d %b %Y %H:%M')}"
