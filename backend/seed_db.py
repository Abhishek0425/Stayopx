"""
seed_db.py — Wipes all dishes and rebuilds from the EXACT Excel files.
Dishes are 100% brand-isolated: UNILIV dishes ≠ HUDDLE dishes.

Run from backend/ folder:
    venv\Scripts\activate
    python seed_db.py
"""
import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uniliv_project.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from dashboard.models import Dish, GeneratedMenu
from django.contrib.auth.models import User

# ── Step 1: Wipe ─────────────────────────────────────────────────────────────
GeneratedMenu.objects.all().delete()
Dish.objects.all().delete()
print("✅ Cleared all existing dishes\n")

# ══════════════════════════════════════════════════════════════════════════════
# DISH DEFINITIONS
# Format: (dish_name, meal_type, brand, is_dal, is_star)
# Sourced DIRECTLY from each brand's Excel — NO cross-contamination
# ══════════════════════════════════════════════════════════════════════════════

DISHES = [

# ╔══════════════════════════════════════════════════════════════════╗
# ║  UNILIV — Draft_Menu__1_.xlsx                                  ║
# ║  Key diff from HUDDLE:                                         ║
# ║  • TWO breakfast items per day (HOT FOOD + HOT FOOD 2)         ║
# ║  • Premium paneer dishes in Lunch/Dinner                       ║
# ║  • Veg 2 column adds extra star dishes per meal                ║
# ╚══════════════════════════════════════════════════════════════════╝

# ── BREAKFAST — Sheet 1 ───────────────────────────────────────────
('Aloo Pyaz Paratha',       'Breakfast','uniliv',False,False),
('Sabudana Khichdi',        'Breakfast','uniliv',False,False),
('Idli Samber',             'Breakfast','uniliv',False,False),
('Methi Thepla',            'Breakfast','uniliv',False,False),
('Pav',                     'Breakfast','uniliv',False,False),
('Bread Roll',              'Breakfast','uniliv',False,False),
('Veg Uttapam Samber',      'Breakfast','uniliv',False,False),
('Medu Vada',               'Breakfast','uniliv',False,False),
('Plain Paratha',           'Breakfast','uniliv',False,False),
('Vermicelli Upma',         'Breakfast','uniliv',False,False),
('Besan Chilla',            'Breakfast','uniliv',False,False),
('Pyaz Paratha',            'Breakfast','uniliv',False,False),
('Bombay Sandwich',         'Breakfast','uniliv',False,False),
('Batata Poha',             'Breakfast','uniliv',False,False),
# ── BREAKFAST — Sheet 2 ───────────────────────────────────────────
('Dal Paratha',             'Breakfast','uniliv',False,False),
('Rawa Upma',               'Breakfast','uniliv',False,False),
('Vada Samber',             'Breakfast','uniliv',False,False),
('Gujrati Thepla',          'Breakfast','uniliv',False,False),
('Kulcha',                  'Breakfast','uniliv',False,False),
('Vegetable Daliya',        'Breakfast','uniliv',False,False),
('Thepla',                  'Breakfast','uniliv',False,False),
('Moong Dal Chilla',        'Breakfast','uniliv',False,False),
('Poori',                   'Breakfast','uniliv',False,False),
('Sabudana Vada',           'Breakfast','uniliv',False,False),
('Gobhi Paratha',           'Breakfast','uniliv',False,False),
('Veg Roll',                'Breakfast','uniliv',False,False),
('Colslow Sandwich',        'Breakfast','uniliv',False,False),
# ── BREAKFAST — Sheet 3 ───────────────────────────────────────────
('Mix Veg Paratha',         'Breakfast','uniliv',False,False),
('Palak Chilla',            'Breakfast','uniliv',False,False),
('Medu Vada Samber',        'Breakfast','uniliv',False,False),
('Masala Idli',             'Breakfast','uniliv',False,False),
('Mix Veg Thepla',          'Breakfast','uniliv',False,False),
('Falafel Roll',            'Breakfast','uniliv',False,False),
('Bread Upma',              'Breakfast','uniliv',False,False),
('Muli Paratha',            'Breakfast','uniliv',False,False),
('Bread Pakoda',            'Breakfast','uniliv',False,False),
('Corn Capsicum Sandwich',  'Breakfast','uniliv',False,False),
('Indori Poha',             'Breakfast','uniliv',False,False),
# ── BREAKFAST — Sheet 4 ───────────────────────────────────────────
('Palak Poori',             'Breakfast','uniliv',False,False),
('Tadka Idli',              'Breakfast','uniliv',False,False),
('Tomato Uttapam',          'Breakfast','uniliv',False,False),
('Veg Daliya',              'Breakfast','uniliv',False,False),
('Mix Paratha',             'Breakfast','uniliv',False,False),
('Bread Toast',             'Breakfast','uniliv',False,False),
('Masala Dosa Samber',      'Breakfast','uniliv',False,False),
('Khasta Kachori',          'Breakfast','uniliv',False,False),
('Ajwain Paratha',          'Breakfast','uniliv',False,False),
('Cutlet',                  'Breakfast','uniliv',False,False),
('Pesto Sandwich',          'Breakfast','uniliv',False,False),
('Suji Chilla',             'Breakfast','uniliv',False,False),
('Sev Poha',                'Breakfast','uniliv',False,False),

# ── LUNCH DALS — Sheet 1 ─────────────────────────────────────────
('Mix Dal',                 'Lunch','uniliv',True,False),
('Rajma Rashella',          'Lunch','uniliv',True,False),
('Kadhi Pakoda',            'Lunch','uniliv',True,False),
('Chana Dal Tadka',         'Lunch','uniliv',True,False),
('Urad Sabut',              'Lunch','uniliv',True,False),
('Kale Chane',              'Lunch','uniliv',True,False),
('Chooley',                 'Lunch','uniliv',True,False),
# ── LUNCH DALS — Sheet 2 ─────────────────────────────────────────
('Dal Punchmel',            'Lunch','uniliv',True,False),
('Dal Makhani',             'Lunch','uniliv',True,False),
('Punjabi Kadhi Pakoda',    'Lunch','uniliv',True,False),
('Rajma Masala',            'Lunch','uniliv',True,False),
('Moong Masoor',            'Lunch','uniliv',True,False),
# ── LUNCH DALS — Sheet 3 ─────────────────────────────────────────
('Dal Panchmel',            'Lunch','uniliv',True,False),
('Kali Urad Dal',           'Lunch','uniliv',True,False),
('Sindhi Kadhi',            'Lunch','uniliv',True,False),
('Dal Dhaba',               'Lunch','uniliv',True,False),
('Maa Ki Dal',              'Lunch','uniliv',True,False),
('Sambhar',                 'Lunch','uniliv',True,False),
# ── LUNCH DALS — Sheet 4 ─────────────────────────────────────────
('Dal Palak',               'Lunch','uniliv',True,False),
('Arhar Dal',               'Lunch','uniliv',True,False),
('Langer Wali Dal',         'Lunch','uniliv',True,False),
('Boondi Kadhi',            'Lunch','uniliv',True,False),
('Bengali Cholar Dal',      'Lunch','uniliv',True,False),

# ── LUNCH STARS — Sheet 1 (VEG + Veg 2) — UNILIV PREMIUM ────────
('Butter Paneer Masala',    'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Veg Jalfrezi',            'Lunch','uniliv',False,True),
('Beans Poriyal',           'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Masala Tori',             'Lunch','uniliv',False,True),
('Aloo 65',                 'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Cabbage Mutter',          'Lunch','uniliv',False,True),
('Aloo Gobhi Adraki',       'Lunch','uniliv',False,True),
('Stuffed Tomato',          'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Malai Kofta',             'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Baigan Bharta',           'Lunch','uniliv',False,True),
('Dry Aloo',                'Lunch','uniliv',False,True),
('Gatte Ki Sabji',          'Lunch','uniliv',False,True),
('Anari Aloo',              'Lunch','uniliv',False,True),
# ── LUNCH STARS — Sheet 2 ────────────────────────────────────────
('Parwal Masala',           'Lunch','uniliv',False,True),
('Bharwa Shimla',           'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Aloo Masala',             'Lunch','uniliv',False,True),
('Tori Chana Dal',          'Lunch','uniliv',False,True),
('Mix Veg',                 'Lunch','uniliv',False,True),
('Red Bopala',              'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Achari Aloo',             'Lunch','uniliv',False,True),   # ← UNILIV ONLY
# ── LUNCH STARS — Sheet 3 ────────────────────────────────────────
('Kela Ke Kofte',           'Lunch','uniliv',False,True),
('Chilli Mushroom',         'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Handi Veg',               'Lunch','uniliv',False,True),
('Karela Do Pyaza',         'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Chhare Wale Aloo',        'Lunch','uniliv',False,True),
('Bhindi Fry',              'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Dahi Wale Aloo',          'Lunch','uniliv',False,True),
('Kathal Masala',           'Lunch','uniliv',False,True),
('Palak Soya Badi',         'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Aloo Gobhi',              'Lunch','uniliv',False,True),
('Cabbage Beans Porriyal',  'Lunch','uniliv',False,True),
# ── LUNCH STARS — Sheet 4 ────────────────────────────────────────
('Mix Veg Kofta',           'Lunch','uniliv',False,True),
('Aloo Parwal',             'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Paneer Bhurji',           'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Aloo Beans',              'Lunch','uniliv',False,True),
('Aloo Matter',             'Lunch','uniliv',False,True),
('Veg Makhani',             'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Aloo Pyaz Ki Sabji',      'Lunch','uniliv',False,True),
('Bagara Baigan',           'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Aloo Posto',              'Lunch','uniliv',False,True),   # ← UNILIV ONLY
('Kele Ki Sabji',           'Lunch','uniliv',False,True),
('Mirchi Ka Salan',         'Lunch','uniliv',False,True),
('Gawar Fali Bhajji',       'Lunch','uniliv',False,True),

# ── SNACKS ───────────────────────────────────────────────────────
('White Sauce Pasta',       'Snacks','uniliv',False,False),
('Pesto Sandwich Snack',    'Snacks','uniliv',False,False),
('Khasta Kachori Snack',    'Snacks','uniliv',False,False),
('Kathi Roll',              'Snacks','uniliv',False,False),
('Vada Pav',                'Snacks','uniliv',False,False),
('Dal Vada',                'Snacks','uniliv',False,False),
('Veg Noodles',             'Snacks','uniliv',False,False),
('Red Sauce Pasta',         'Snacks','uniliv',False,False),
('Bread Pakoda Snack',      'Snacks','uniliv',False,False),
('Gol Gappe',               'Snacks','uniliv',False,False),
('Hara Bhara Kebab',        'Snacks','uniliv',False,False),
('Aloo Chana Chaat',        'Snacks','uniliv',False,False),
('Dabeli',                  'Snacks','uniliv',False,False),
('Zimikand Ki Tikki',       'Snacks','uniliv',False,False),
('Fruit Chaat',             'Snacks','uniliv',False,False),
('Chilli Potato',           'Snacks','uniliv',False,False),
('Dahi Bhalla',             'Snacks','uniliv',False,False),
('Samosa Chaat',            'Snacks','uniliv',False,False),
('Kanji Vada',              'Snacks','uniliv',False,False),
('Tikki Chaat',             'Snacks','uniliv',False,False),
('Bhel Puri',               'Snacks','uniliv',False,False),
('Mix Sauce Pasta',         'Snacks','uniliv',False,False),
('Aloo Bonda',              'Snacks','uniliv',False,False),
('Patties',                 'Snacks','uniliv',False,False),

# ── DINNER DALS — Sheet 1 ────────────────────────────────────────
('Dal Bukhara',             'Dinner','uniliv',True,False),
('Moong Dal',               'Dinner','uniliv',True,False),
('Green Moong Dal',         'Dinner','uniliv',True,False),
('Black Masoor',            'Dinner','uniliv',True,False),
('Dhaba Dal',               'Dinner','uniliv',True,False),
('Dal Makhani Dinner',      'Dinner','uniliv',True,False),
('Arhar Dal Tadka',         'Dinner','uniliv',True,False),
# ── DINNER DALS — Sheet 2 ────────────────────────────────────────
('Dal Malka',               'Dinner','uniliv',True,False),
('Dal Fry',                 'Dinner','uniliv',True,False),
('Chana Dal',               'Dinner','uniliv',True,False),
('Arhar Dal Dinner',        'Dinner','uniliv',True,False),
('Dal Tadka',               'Dinner','uniliv',True,False),
# ── DINNER DALS — Sheet 3 ────────────────────────────────────────
('Hari Moong Dal',          'Dinner','uniliv',True,False),
('Dhoya Urad Dal',          'Dinner','uniliv',True,False),
('Moong Masoor Dinner',     'Dinner','uniliv',True,False),
('Plain Dal',               'Dinner','uniliv',True,False),
# ── DINNER DALS — Sheet 4 ────────────────────────────────────────
('Moong Dal Tadka',         'Dinner','uniliv',True,False),
('Lobbiya Dal',             'Dinner','uniliv',True,False),
('Mix Dal Dinner',          'Dinner','uniliv',True,False),

# ── DINNER STARS — Sheet 1 (VEG + Veg 2) — UNILIV PREMIUM ───────
('Kadhai Soya',             'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Bhindi Do Pyaza',         'Dinner','uniliv',False,True),
('Mutter Mushroom',         'Dinner','uniliv',False,True),
('Tinda Masala',            'Dinner','uniliv',False,True),
('Pahadi Paneer',           'Dinner','uniliv',False,True),
('Corn Palak',              'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Kathal Ki Sabji',         'Dinner','uniliv',False,True),
('Tawa Fry',                'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Paneer Makhani',          'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Veg Korma',               'Dinner','uniliv',False,True),
('Punch Kathor',            'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Jeera Ghiya',             'Dinner','uniliv',False,True),
('Dum Aloo',                'Dinner','uniliv',False,True),
('Karela Bhujjiya',         'Dinner','uniliv',False,True),
# ── DINNER STARS — Sheet 2 ───────────────────────────────────────
('Soya Chaap Masala',       'Dinner','uniliv',False,True),
('Ghiya Kofta',             'Dinner','uniliv',False,True),
('Paneer Do Pyaza',         'Dinner','uniliv',False,True),
('Dum Aloo Banarsi',        'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Paneer Takatak',          'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Paneer Chilli',           'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Aloo Bhujiya',            'Dinner','uniliv',False,True),
# ── DINNER STARS — Sheet 3 ───────────────────────────────────────
('Aloo Matter Dinner',      'Dinner','uniliv',False,True),
('Soya Matter Kimma',       'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Veg Amritsari',           'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Matter Malai',            'Dinner','uniliv',False,True),
('Matter Paneer',           'Dinner','uniliv',False,True),
('Kathal Masala Dinner',    'Dinner','uniliv',False,True),
('Paneer Kadhai',           'Dinner','uniliv',False,True),
('Masala Parwal',           'Dinner','uniliv',False,True),
('Gatte Ki Sabji Dinner',   'Dinner','uniliv',False,True),
# ── DINNER STARS — Sheet 4 ───────────────────────────────────────
('Bhindi Masala',           'Dinner','uniliv',False,True),
('Veg Crispy',              'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Gajar Beans Matter',      'Dinner','uniliv',False,True),
('Malai Tori',              'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Paneer Hara Pyaz',        'Dinner','uniliv',False,True),
('Corn Capsicum Dinner',    'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Paneer Kali Mirch',       'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Sev Bhajji',              'Dinner','uniliv',False,True),
('Makhana Matter',          'Dinner','uniliv',False,True),  # ← UNILIV ONLY
('Aloo Bhujjiya Dinner',    'Dinner','uniliv',False,True),


# ╔══════════════════════════════════════════════════════════════════╗
# ║  HUDDLE — Huddle_Draft_Menu__1_.xlsx                           ║
# ║  Key diff from UNILIV:                                         ║
# ║  • ONE breakfast item per day (no HOT FOOD 2)                  ║
# ║  • Budget-friendly veg dishes — NO premium paneer              ║
# ║  • ONE veg column in Lunch (no Veg 2)                          ║
# ╚══════════════════════════════════════════════════════════════════╝

# ── BREAKFAST — Sheet 1 ───────────────────────────────────────────
('Aloo Pyaz Paratha',       'Breakfast','huddle',False,False),
('Idli Samber',             'Breakfast','huddle',False,False),
('Pav',                     'Breakfast','huddle',False,False),
('Veg Uttapam',             'Breakfast','huddle',False,False),
('Plain Paratha',           'Breakfast','huddle',False,False),
('Besan Chilla',            'Breakfast','huddle',False,False),
('Bombay Sandwich',         'Breakfast','huddle',False,False),
# ── BREAKFAST — Sheet 2 ───────────────────────────────────────────
('Dal Paratha',             'Breakfast','huddle',False,False),
('Vada Samber',             'Breakfast','huddle',False,False),
('Kulcha',                  'Breakfast','huddle',False,False),
('Moong Dal Chilla',        'Breakfast','huddle',False,False),
('Poori',                   'Breakfast','huddle',False,False),
('Gobhi Paratha',           'Breakfast','huddle',False,False),
('Colslaw Sandwich',        'Breakfast','huddle',False,False),
# ── BREAKFAST — Sheet 3 ───────────────────────────────────────────
('Mix Veg Paratha',         'Breakfast','huddle',False,False),
('Masala Idli',             'Breakfast','huddle',False,False),
('Muli Paratha',            'Breakfast','huddle',False,False),
('Indori Poha',             'Breakfast','huddle',False,False),
('Veg Uttapam Samber',      'Breakfast','huddle',False,False),
# ── BREAKFAST — Sheet 4 ───────────────────────────────────────────
('Palak Poori',             'Breakfast','huddle',False,False),
('Tomato Uttapam',          'Breakfast','huddle',False,False),
('Mix Paratha',             'Breakfast','huddle',False,False),
('Khasta Kachori',          'Breakfast','huddle',False,False),
('Macaroni',                'Breakfast','huddle',False,False),
('Suji Chilla',             'Breakfast','huddle',False,False),
('Pesto Sandwich',          'Breakfast','huddle',False,False),

# ── LUNCH DALS — Sheet 1 ─────────────────────────────────────────
('Mix Dal',                 'Lunch','huddle',True,False),
('Rajma Rashella',          'Lunch','huddle',True,False),
('Kadhi Pakoda',            'Lunch','huddle',True,False),
('Chana Dal Tadka',         'Lunch','huddle',True,False),
('Urad Sabut',              'Lunch','huddle',True,False),
('Kale Chane',              'Lunch','huddle',True,False),
('Choley',                  'Lunch','huddle',True,False),
# ── LUNCH DALS — Sheet 2 ─────────────────────────────────────────
('Dal Punchmel',            'Lunch','huddle',True,False),
('Dal Makhani',             'Lunch','huddle',True,False),
('Punjabi Kadhi Pakoda',    'Lunch','huddle',True,False),
('Rajma Masala',            'Lunch','huddle',True,False),
('Moong Masoor',            'Lunch','huddle',True,False),
# ── LUNCH DALS — Sheet 3 ─────────────────────────────────────────
('Dal Panchmel',            'Lunch','huddle',True,False),
('Kali Urad Dal',           'Lunch','huddle',True,False),
('Sindhi Kadhi',            'Lunch','huddle',True,False),
('Dal Dhaba',               'Lunch','huddle',True,False),
('Maa Ki Dal',              'Lunch','huddle',True,False),
('Chooley',                 'Lunch','huddle',True,False),
('Sambhar',                 'Lunch','huddle',True,False),
# ── LUNCH DALS — Sheet 4 ─────────────────────────────────────────
('Dal Palak',               'Lunch','huddle',True,False),
('Arhar Dal',               'Lunch','huddle',True,False),
('Langer Wali Dal',         'Lunch','huddle',True,False),
('Boondi Kadhi',            'Lunch','huddle',True,False),
('Bengali Cholar Dal',      'Lunch','huddle',True,False),

# ── LUNCH STARS — Sheet 1 (HUDDLE — NO premium paneer) ───────────
('Veg Jalfrezi',            'Lunch','huddle',False,True),
('Masala Tori',             'Lunch','huddle',False,True),
('Cabbage Mutter',          'Lunch','huddle',False,True),
('Aloo Gobhi Adraki',       'Lunch','huddle',False,True),
('Baigan Bharta',           'Lunch','huddle',False,True),
('Dry Aloo',                'Lunch','huddle',False,True),
('Anari Aloo',              'Lunch','huddle',False,True),
# ── LUNCH STARS — Sheet 2 ────────────────────────────────────────
('Parwal Masala',           'Lunch','huddle',False,True),
('Arbi Masala',             'Lunch','huddle',False,True),   # ← HUDDLE ONLY
('Tori Chana Dal',          'Lunch','huddle',False,True),
('Hyderabadi Baigan',       'Lunch','huddle',False,True),   # ← HUDDLE ONLY
('Lauki Bhurji',            'Lunch','huddle',False,True),   # ← HUDDLE ONLY
# ── LUNCH STARS — Sheet 3 ────────────────────────────────────────
('Kela Ke Kofte',           'Lunch','huddle',False,True),
('Handi Veg',               'Lunch','huddle',False,True),
('Chhare Wale Aloo',        'Lunch','huddle',False,True),
('Dahi Wale Aloo',          'Lunch','huddle',False,True),
('Kathal Masala',           'Lunch','huddle',False,True),
('Aloo Gobhi',              'Lunch','huddle',False,True),
('Cabbage Beans Porriyal',  'Lunch','huddle',False,True),
# ── LUNCH STARS — Sheet 4 ────────────────────────────────────────
('Mix Veg Kofta',           'Lunch','huddle',False,True),
('Aloo Beans',              'Lunch','huddle',False,True),
('Aloo Matter',             'Lunch','huddle',False,True),
('Aloo Pyaz Ki Sabji',      'Lunch','huddle',False,True),
('Kele Ki Sabji',           'Lunch','huddle',False,True),
('Mirchi Ka Salan',         'Lunch','huddle',False,True),
('Gawar Fali Bhajji',       'Lunch','huddle',False,True),

# ── SNACKS ───────────────────────────────────────────────────────
('White Sauce Pasta',       'Snacks','huddle',False,False),
('Pesto Sandwich Snack',    'Snacks','huddle',False,False),
('Khasta Kachori Snack',    'Snacks','huddle',False,False),
('Kathi Roll',              'Snacks','huddle',False,False),
('Vada Pav',                'Snacks','huddle',False,False),
('Dal Vada',                'Snacks','huddle',False,False),
('Veg Noodles',             'Snacks','huddle',False,False),
('Red Sauce Pasta',         'Snacks','huddle',False,False),
('Bread Pakoda',            'Snacks','huddle',False,False),
('Gol Gappe',               'Snacks','huddle',False,False),
('Hara Bhara Kebab',        'Snacks','huddle',False,False),
('Aloo Chana Chaat',        'Snacks','huddle',False,False),
('Dabeli',                  'Snacks','huddle',False,False),
('Zimikand Ki Tikki',       'Snacks','huddle',False,False),
('Fruit Chaat',             'Snacks','huddle',False,False),
('Chilli Patato',           'Snacks','huddle',False,False),
('Dahi Bhalla',             'Snacks','huddle',False,False),
('Samosa Chaat',            'Snacks','huddle',False,False),
('Kanji Vada',              'Snacks','huddle',False,False),
('Tikki Chaat',             'Snacks','huddle',False,False),
('Bhel Puri',               'Snacks','huddle',False,False),
('Mix Sauce Pasta',         'Snacks','huddle',False,False),
('Aloo Bonda',              'Snacks','huddle',False,False),
('Patties',                 'Snacks','huddle',False,False),

# ── DINNER DALS — Sheet 1 ────────────────────────────────────────
('Dal Bukhara',             'Dinner','huddle',True,False),
('Moong Dal',               'Dinner','huddle',True,False),
('Green Moong Dal',         'Dinner','huddle',True,False),
('Black Masoor',            'Dinner','huddle',True,False),
('Dhaba Dal',               'Dinner','huddle',True,False),
('Dal Makhani Dinner',      'Dinner','huddle',True,False),
('Arhar Dal Tadka',         'Dinner','huddle',True,False),
# ── DINNER DALS — Sheet 2 ────────────────────────────────────────
('Dal Malka',               'Dinner','huddle',True,False),
('Dal Fry',                 'Dinner','huddle',True,False),
('Chana Dal',               'Dinner','huddle',True,False),
('Arhar Dal Dinner',        'Dinner','huddle',True,False),
('Dal Tadka',               'Dinner','huddle',True,False),
# ── DINNER DALS — Sheet 3 ────────────────────────────────────────
('Hari Moong Dal',          'Dinner','huddle',True,False),
('Dhoya Urad Dal',          'Dinner','huddle',True,False),
('Moong Masoor Dinner',     'Dinner','huddle',True,False),
('Plain Dal',               'Dinner','huddle',True,False),
# ── DINNER DALS — Sheet 4 ────────────────────────────────────────
('Moong Dal Tadka',         'Dinner','huddle',True,False),
('Lobbiya Dal',             'Dinner','huddle',True,False),
('Mix Dal Dinner',          'Dinner','huddle',True,False),

# ── DINNER STARS — Sheet 1 (HUDDLE — no Kadhai Soya, no Paneer Makhani) ──
('Bhindi Do Pyaza',         'Dinner','huddle',False,True),
('Mutter Mushroom',         'Dinner','huddle',False,True),
('Pahadi Paneer',           'Dinner','huddle',False,True),
('Kathal Ki Sabji',         'Dinner','huddle',False,True),
('Veg Korma',               'Dinner','huddle',False,True),
('Jeera Ghiya',             'Dinner','huddle',False,True),
('Karela Bhujjiya',         'Dinner','huddle',False,True),
# ── DINNER STARS — Sheet 2 ───────────────────────────────────────
('Soya Chaap Masala',       'Dinner','huddle',False,True),
('Ghiya Kofta',             'Dinner','huddle',False,True),
('Paneer Do Pyaza',         'Dinner','huddle',False,True),
('Dum Aloo Banarsi',        'Dinner','huddle',False,True),
('Paneer Takatak',          'Dinner','huddle',False,True),
('Paneer Chilli',           'Dinner','huddle',False,True),
('Aloo Bhujiya',            'Dinner','huddle',False,True),
# ── DINNER STARS — Sheet 3 ───────────────────────────────────────
('Soya Matter Keema',       'Dinner','huddle',False,True),   # ← HUDDLE ONLY
('Matter Malai',            'Dinner','huddle',False,True),
('Matter Paneer',           'Dinner','huddle',False,True),
('Paneer Kadhai',           'Dinner','huddle',False,True),
('Masala Parwal',           'Dinner','huddle',False,True),
('Gatte Ki Sabji Dinner',   'Dinner','huddle',False,True),
# ── DINNER STARS — Sheet 4 ───────────────────────────────────────
('Bhindi Masala',           'Dinner','huddle',False,True),
('Gajar Beans Matter',      'Dinner','huddle',False,True),
('Paneer Hara Pyaz',        'Dinner','huddle',False,True),
('Sev Bhajji Dinner',       'Dinner','huddle',False,True),  # ← HUDDLE ONLY
('Makhana Matter',          'Dinner','huddle',False,True),
('Aloo Bhujjiya Dinner',    'Dinner','huddle',False,True),
('Chokka',                  'Dinner','huddle',False,True),  # ← HUDDLE ONLY

]

# ── Step 3: Insert ────────────────────────────────────────────────────────────
created = updated = 0
for dish_name, meal_type, brand, is_dal, is_star in DISHES:
    obj, was_created = Dish.objects.get_or_create(
        dish_name=dish_name,
        meal_type=meal_type,
        brand=brand,
        defaults={'ingredients': None, 'is_dal': is_dal, 'is_star': is_star}
    )
    if not was_created:
        obj.is_dal = is_dal; obj.is_star = is_star; obj.save()
        updated += 1
    else:
        created += 1

print(f"✅ Inserted: {created}  |  Updated: {updated}\n")

# ── Step 4: Summary ───────────────────────────────────────────────────────────
for brand in ['uniliv', 'huddle']:
    qs = Dish.objects.filter(brand=brand)
    print(f"  {brand.upper()}:")
    for meal in ['Breakfast','Lunch','Dinner','Snacks']:
        mq = qs.filter(meal_type=meal)
        d  = mq.filter(is_dal=True).count()
        s  = mq.filter(is_star=True).count()
        print(f"    {meal:10s}: {mq.count():3d} dishes | dal={d} | star={s}")
    print()

# ── Step 5: Validate 15-day rule engine ──────────────────────────────────────
print("Testing 15-day rule engine...\n")
import random; random.seed(7)
from dashboard.validators import MenuRuleEngine, ValidationError

all_ok = True
for brand in ['uniliv','huddle']:
    try:
        engine = MenuRuleEngine(brand, Dish.objects.filter(brand=brand))
        days   = engine.generate()
        issues = []
        for ws in range(len(days)-6):
            ld=[days[i]['lunch_dal']['name'].lower() for i in range(ws,ws+7)]
            dd=[days[i]['dinner_dal']['name'].lower() for i in range(ws,ws+7)]
            if len(set(ld))<7: issues.append(f'Lunch dal repeat window {ws+1}')
            if len(set(dd))<7: issues.append(f'Dinner dal repeat window {ws+1}')
        ok = '✅' if not issues else '❌'
        all_ok = all_ok and not issues
        print(f"  {ok} {brand.upper()}: 15 days | {len(issues)} violations")
        if not issues:
            for i in [0,7,14]:
                d=days[i]
                sn=d['snack']['name'] if d.get('snack') else '—'
                print(f"     Day {i+1:2d}: BF={d['breakfast']['name'][:16]} | "
                      f"L-Dal={d['lunch_dal']['name'][:13]} | "
                      f"L-⭐={d['lunch_star']['name'][:15]} | "
                      f"Snack={sn[:13]} | "
                      f"D-⭐={d['dinner_star']['name'][:15]}")
        else:
            for x in issues[:3]: print(f"     {x}")
    except ValidationError as e:
        all_ok = False
        print(f"  ❌ {brand.upper()}: {e}")
    print()

# ── Step 6: Show brand differences ───────────────────────────────────────────
print("Verifying brand isolation (UNILIV exclusive dishes):")
u_stars = set(Dish.objects.filter(brand='uniliv',meal_type='Lunch',is_star=True).values_list('dish_name',flat=True))
h_stars = set(Dish.objects.filter(brand='huddle',meal_type='Lunch',is_star=True).values_list('dish_name',flat=True))
only_u  = u_stars - h_stars
only_h  = h_stars - u_stars
print(f"  UNILIV-only Lunch stars ({len(only_u)}): {sorted(only_u)[:6]}")
print(f"  HUDDLE-only Lunch stars ({len(only_h)}): {sorted(only_h)[:6]}")

# ── Step 7: Admin user ────────────────────────────────────────────────────────
print()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin','admin@uniliv.com','admin123')
    print("✅ Admin created: admin / admin123")
else:
    print("✅ Admin already exists")

print()
print("="*56)
print("  DONE —", "All rules pass!" if all_ok else "Check warnings above")
print("  Run: python manage.py runserver")
print("="*56)
