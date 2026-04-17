"""
seed_db.py — Seeds ALL dishes + creates default users with roles.

Run from backend/ folder:
    venv\Scripts\activate
    python manage.py makemigrations
    python manage.py migrate
    python seed_db.py
"""
import os, sys, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uniliv_project.settings")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth.models import User
from dashboard.models import Dish, GeneratedMenu, UserProfile

# ── Wipe existing ─────────────────────────────────────────────────
GeneratedMenu.objects.all().delete()
Dish.objects.all().delete()
print("✅ Cleared existing dishes")

# ── Dish data ─────────────────────────────────────────────────────
# Format: (dish_name, meal_type, brand, is_dal, is_star)
DISHES = [

    # =======================================================
    # HUDDLE
    # =======================================================
    # ── Breakfast ACCOMPANIMENTS ──
    ("Aloo Jhol"                               , "Breakfast" , "huddle"  , False , False),  # accompaniment
    ("Colslaw Sandwich"                        , "Breakfast" , "huddle"  , False , False),
    ("Matar"                                   , "Breakfast" , "huddle"  , False , False),  # accompaniment
    ("Missal"                                  , "Breakfast" , "huddle"  , False , False),  # accompaniment
    ("Veg Uttapam"                             , "Breakfast" , "huddle"  , False , False),
    # ── Dinner ACCOMPANIMENTS ──
    ("Hakka Noodles"                           , "Dinner"    , "huddle"  , False , False),  # accompaniment
    ("Soya Matter Keema"                       , "Dinner"    , "huddle"  , False , True ),
    # ── Lunch DISHES ──
    ("Arbi Masala"                             , "Lunch"     , "huddle"  , False , True ),
    ("Chapatti"                                , "Lunch"     , "huddle"  , False , False),  # accompaniment
    ("Choley"                                  , "Lunch"     , "huddle"  , True  , False),
    ("Hyderabadi Baigan"                       , "Lunch"     , "huddle"  , False , True ),
    ("Lauki Bhurji"                            , "Lunch"     , "huddle"  , False , True ),
    # ── Snacks DISHES ──
    ("Chilli Patato"                           , "Snacks"    , "huddle"  , False , False),

    # =======================================================
    # UNILIV
    # =======================================================
    # ── Breakfast DISHES ──
    ("Ajwain Paratha"                          , "Breakfast" , "uniliv"  , False , False),
    ("Aloo Bhaji"                              , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Aloo Pyaz Paratha"                       , "Breakfast" , "uniliv"  , False , False),
    ("Aloo Rassa"                              , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("BBJ"                                     , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Batata Poha"                             , "Breakfast" , "uniliv"  , False , False),
    ("Beasan Chilla"                           , "Breakfast" , "uniliv"  , False , False),
    ("Bhajji/ Chutney"                         , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Bombay Sandwich"                         , "Breakfast" , "uniliv"  , False , False),
    ("Bread Roll"                              , "Breakfast" , "uniliv"  , False , False),
    ("Bread Toast"                             , "Breakfast" , "uniliv"  , False , False),
    ("Bread Upma"                              , "Breakfast" , "uniliv"  , False , False),
    ("Chutney"                                 , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Chutney/ Aloo Jhol"                      , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Colslow Sandwich"                        , "Breakfast" , "uniliv"  , False , False),
    ("Corn Capcicum Sandwich"                  , "Breakfast" , "uniliv"  , False , False),
    ("Curd"                                    , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Curd/Green Chutney"                      , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Curd/Pickle"                             , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Curd/Pickle/ bhaji"                      , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Curd/Pickle/Chutney"                     , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Cutlet"                                  , "Breakfast" , "uniliv"  , False , False),
    ("Dal Paratha"                             , "Breakfast" , "uniliv"  , True  , False),
    ("Dry Aloo"                                , "Breakfast" , "uniliv"  , False , True ),  # accompaniment
    ("Falafal Roll"                            , "Breakfast" , "uniliv"  , False , False),
    ("Fruits"                                  , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Gobhi Paratha"                           , "Breakfast" , "uniliv"  , False , False),
    ("Green Chutney"                           , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Gujrati Thepla"                          , "Breakfast" , "uniliv"  , False , False),
    ("Idli / Samber"                           , "Breakfast" , "uniliv"  , False , False),
    ("Indori Poha"                             , "Breakfast" , "uniliv"  , False , False),
    ("Kulcha"                                  , "Breakfast" , "uniliv"  , False , False),
    ("Macroni"                                 , "Breakfast" , "uniliv"  , False , False),
    ("Masala Dosa/ Samber"                     , "Breakfast" , "uniliv"  , False , False),
    ("Masala Idli"                             , "Breakfast" , "uniliv"  , False , False),
    ("Mattara"                                 , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Medu Vada"                               , "Breakfast" , "uniliv"  , False , False),
    ("Medu Vada/ Samber"                       , "Breakfast" , "uniliv"  , False , False),
    ("Methi Thepla"                            , "Breakfast" , "uniliv"  , False , False),
    ("Missal/ Curd"                            , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Mix Paratha"                             , "Breakfast" , "uniliv"  , False , False),
    ("Mix Veg Paratha"                         , "Breakfast" , "uniliv"  , False , False),
    ("Mix Veg Thepla"                          , "Breakfast" , "uniliv"  , False , False),
    ("Moong Dal Chilla"                        , "Breakfast" , "uniliv"  , True  , False),
    ("Muli Paratha"                            , "Breakfast" , "uniliv"  , False , False),
    ("Palak Chilla"                            , "Breakfast" , "uniliv"  , False , False),
    ("Palak Poori"                             , "Breakfast" , "uniliv"  , False , False),
    ("Pav"                                     , "Breakfast" , "uniliv"  , False , False),
    ("Pesto Sandwich"                          , "Breakfast" , "uniliv"  , False , False),
    ("Plain Paratha"                           , "Breakfast" , "uniliv"  , False , False),
    ("Pyaz Paratha"                            , "Breakfast" , "uniliv"  , False , False),
    ("Rawa Upma"                               , "Breakfast" , "uniliv"  , False , False),
    ("Sabudana Vada"                           , "Breakfast" , "uniliv"  , False , False),
    ("Sabudana khichdi"                        , "Breakfast" , "uniliv"  , False , False),
    ("Sev Poha"                                , "Breakfast" , "uniliv"  , False , False),
    ("Sujji Chilla"                            , "Breakfast" , "uniliv"  , False , False),
    ("Tadka Idli"                              , "Breakfast" , "uniliv"  , True  , False),
    ("Tea"                                     , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Tea/Coffee"                              , "Breakfast" , "uniliv"  , False , False),  # accompaniment
    ("Thepla"                                  , "Breakfast" , "uniliv"  , False , False),
    ("Tomato Uttapam"                          , "Breakfast" , "uniliv"  , False , False),
    ("Vada / Samber"                           , "Breakfast" , "uniliv"  , False , False),
    ("Veg Daliya"                              , "Breakfast" , "uniliv"  , True  , False),
    ("Veg Roll"                                , "Breakfast" , "uniliv"  , False , False),
    ("Veg Uttapam / Samber"                    , "Breakfast" , "uniliv"  , False , False),
    ("Vegetable daliya"                        , "Breakfast" , "uniliv"  , True  , False),
    ("Vermcilli Upma"                          , "Breakfast" , "uniliv"  , False , False),
    # ── Dinner DISHES ──
    ("Aloo Bhujiya"                            , "Dinner"    , "uniliv"  , False , True ),
    ("Aloo Bhujjiya"                           , "Dinner"    , "uniliv"  , False , False),
    ("Aloo matter"                             , "Dinner"    , "uniliv"  , False , True ),
    ("Arhar Dal"                               , "Dinner"    , "uniliv"  , True  , False),
    ("Arhar Dal Tadka"                         , "Dinner"    , "uniliv"  , True  , False),
    ("Balushahi"                               , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Bhajji"                                  , "Dinner"    , "uniliv"  , False , True ),
    ("Bhati"                                   , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Bhindi Masala"                           , "Dinner"    , "uniliv"  , False , True ),
    ("Bhindi do Pyaza"                         , "Dinner"    , "uniliv"  , False , True ),
    ("Black Masoor"                            , "Dinner"    , "uniliv"  , True  , False),
    ("Chana Dal"                               , "Dinner"    , "uniliv"  , True  , False),
    ("Chokka"                                  , "Dinner"    , "uniliv"  , False , True ),
    ("Churma"                                  , "Dinner"    , "uniliv"  , False , False),
    ("Corn Cappcicum"                          , "Dinner"    , "uniliv"  , False , False),
    ("Corn Palak"                              , "Dinner"    , "uniliv"  , False , False),
    ("Corn Pulao"                              , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Dal"                                     , "Dinner"    , "uniliv"  , True  , False),
    ("Dal Bhukara"                             , "Dinner"    , "uniliv"  , True  , False),
    ("Dal Bukhara"                             , "Dinner"    , "uniliv"  , True  , False),
    ("Dal Fry"                                 , "Dinner"    , "uniliv"  , True  , False),
    ("Dal Makhani"                             , "Dinner"    , "uniliv"  , True  , False),
    ("Dal Malka"                               , "Dinner"    , "uniliv"  , True  , False),
    ("Dal Tadka"                               , "Dinner"    , "uniliv"  , True  , False),
    ("Dhaba Dal"                               , "Dinner"    , "uniliv"  , True  , False),
    ("Dhoya Urad dal"                          , "Dinner"    , "uniliv"  , True  , False),
    ("Dum Aloo"                                , "Dinner"    , "uniliv"  , False , True ),
    ("Dum Aloo Banarsi"                        , "Dinner"    , "uniliv"  , False , True ),
    ("Dum Pulao"                               , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Fried Rice"                              , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Fruit Custard"                           , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Fryums"                                  , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Gajar Beans Matter"                      , "Dinner"    , "uniliv"  , False , True ),
    ("Garlic Bread"                            , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Ghiya Chana dal"                         , "Dinner"    , "uniliv"  , True  , False),
    ("Ghiya kofta"                             , "Dinner"    , "uniliv"  , False , True ),
    ("Green Moong Dal"                         , "Dinner"    , "uniliv"  , True  , False),
    ("Gulab Jamun"                             , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Hari Moong Dal"                          , "Dinner"    , "uniliv"  , True  , False),
    ("Herb Rice with Ratatouille"              , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Hot Milk"                                , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Jalebi"                                  , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Jeera Ghiya"                             , "Dinner"    , "uniliv"  , False , True ),
    ("Kadhai soya"                             , "Dinner"    , "uniliv"  , False , True ),
    ("Karela Bhujjiya"                         , "Dinner"    , "uniliv"  , False , True ),
    ("Kathal Ki Sabji"                         , "Dinner"    , "uniliv"  , False , True ),
    ("Litti"                                   , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Lobbiya Dal"                             , "Dinner"    , "uniliv"  , True  , False),
    ("Makhana Matter"                          , "Dinner"    , "uniliv"  , False , True ),
    ("Malai Tori"                              , "Dinner"    , "uniliv"  , False , False),
    ("Masala Parwal"                           , "Dinner"    , "uniliv"  , False , True ),
    ("Matter Malai"                            , "Dinner"    , "uniliv"  , False , True ),
    ("Matter Paneer"                           , "Dinner"    , "uniliv"  , False , True ),
    ("Mix Veg Pulao"                           , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Moong Dal"                               , "Dinner"    , "uniliv"  , True  , False),
    ("Moong Dal Tadka"                         , "Dinner"    , "uniliv"  , True  , False),
    ("Mutter Mushroom"                         , "Dinner"    , "uniliv"  , False , True ),
    ("Paapad ki sabji"                         , "Dinner"    , "uniliv"  , False , False),
    ("Pahadi Paneer"                           , "Dinner"    , "uniliv"  , False , True ),
    ("Paneer Chilli"                           , "Dinner"    , "uniliv"  , False , True ),
    ("Paneer Do Pyaza"                         , "Dinner"    , "uniliv"  , False , True ),
    ("Paneer Kadhai"                           , "Dinner"    , "uniliv"  , False , True ),
    ("Paneer Kali Mirch"                       , "Dinner"    , "uniliv"  , False , True ),
    ("Paneer Makhani"                          , "Dinner"    , "uniliv"  , True  , True ),
    ("Paneer Takatak"                          , "Dinner"    , "uniliv"  , False , True ),
    ("Paneer hara pyaz"                        , "Dinner"    , "uniliv"  , False , True ),
    ("Pasta Salad"                             , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Pea Pulao"                               , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Plain Rice"                              , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Punch Kathor"                            , "Dinner"    , "uniliv"  , False , True ),
    ("Rice Kheer"                              , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Salsa Sauce"                             , "Dinner"    , "uniliv"  , False , False),
    ("Saute Vegetable"                         , "Dinner"    , "uniliv"  , False , True ),
    ("Sev Bhajji"                              , "Dinner"    , "uniliv"  , False , True ),
    ("Shahi Tukda"                             , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    ("Soya Matter Kimma"                       , "Dinner"    , "uniliv"  , False , False),
    ("Soya chaap Masala"                       , "Dinner"    , "uniliv"  , False , True ),
    ("Tawa Fry"                                , "Dinner"    , "uniliv"  , False , False),
    ("Tinda Masala"                            , "Dinner"    , "uniliv"  , False , False),
    ("Veg Amritsari"                           , "Dinner"    , "uniliv"  , False , True ),
    ("Veg Crispy"                              , "Dinner"    , "uniliv"  , False , False),
    ("Veg Manchurian"                          , "Dinner"    , "uniliv"  , False , False),
    ("Veg korma"                               , "Dinner"    , "uniliv"  , False , True ),
    ("Vermcilli Kheer"                         , "Dinner"    , "uniliv"  , False , False),  # accompaniment
    # ── Lunch DISHES ──
    ("Achari aloo"                             , "Lunch"     , "uniliv"  , False , True ),
    ("Aloo 65"                                 , "Lunch"     , "uniliv"  , False , True ),
    ("Aloo Beans"                              , "Lunch"     , "uniliv"  , False , True ),
    ("Aloo Gobhi"                              , "Lunch"     , "uniliv"  , False , True ),
    ("Aloo Gobhi Adraki"                       , "Lunch"     , "uniliv"  , False , True ),
    ("Aloo Masala"                             , "Lunch"     , "uniliv"  , False , True ),
    ("Aloo Parwal"                             , "Lunch"     , "uniliv"  , False , False),
    ("Aloo Posto"                              , "Lunch"     , "uniliv"  , False , True ),
    ("Aloo Pyaz ki Sabji"                      , "Lunch"     , "uniliv"  , False , True ),
    ("Anari Aloo"                              , "Lunch"     , "uniliv"  , False , True ),
    ("Bagara Baigan"                           , "Lunch"     , "uniliv"  , False , False),
    ("Baigan Bharta"                           , "Lunch"     , "uniliv"  , False , True ),
    ("Beans Poriyal"                           , "Lunch"     , "uniliv"  , False , True ),
    ("Bengali Cholar Dal"                      , "Lunch"     , "uniliv"  , True  , False),
    ("Besan Laddu"                             , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Bharwa shimla"                           , "Lunch"     , "uniliv"  , False , True ),
    ("Bhature"                                 , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Bhindi Fry"                              , "Lunch"     , "uniliv"  , False , True ),
    ("Boondi Kadhi"                            , "Lunch"     , "uniliv"  , True  , False),
    ("Butter Paneer Masala"                    , "Lunch"     , "uniliv"  , False , True ),
    ("Cabbage Beans Porriyal"                  , "Lunch"     , "uniliv"  , False , True ),
    ("Cabbage Mutter"                          , "Lunch"     , "uniliv"  , False , True ),
    ("Chana Dal Tadka"                         , "Lunch"     , "uniliv"  , True  , False),
    ("Chhare Wale Aloo"                        , "Lunch"     , "uniliv"  , False , True ),
    ("Chilli Mashroom"                         , "Lunch"     , "uniliv"  , False , False),
    ("Cholley"                                 , "Lunch"     , "uniliv"  , False , False),
    ("Chooley"                                 , "Lunch"     , "uniliv"  , False , False),
    ("Curd rice"                               , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Dahi Wale Aloo"                          , "Lunch"     , "uniliv"  , False , True ),
    ("Dal Dhaba"                               , "Lunch"     , "uniliv"  , True  , False),
    ("Dal Palak"                               , "Lunch"     , "uniliv"  , True  , False),
    ("Dal Panchmel"                            , "Lunch"     , "uniliv"  , True  , False),
    ("Dal Punchmel"                            , "Lunch"     , "uniliv"  , True  , False),
    ("Desi Ghee Chapatti"                      , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Gatte ki Sabji"                          , "Lunch"     , "uniliv"  , False , True ),
    ("Gawar fali Bhajji"                       , "Lunch"     , "uniliv"  , False , True ),
    ("Green Salad"                             , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Guldana"                                 , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Halwa"                                   , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Handi Veg"                               , "Lunch"     , "uniliv"  , False , True ),
    ("Jeera Pulao"                             , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Kadhi Pakoda"                            , "Lunch"     , "uniliv"  , True  , False),
    ("Kale Chane"                              , "Lunch"     , "uniliv"  , True  , False),
    ("Kali Urad Dal"                           , "Lunch"     , "uniliv"  , True  , False),
    ("Karela Do Pyaza"                         , "Lunch"     , "uniliv"  , False , True ),
    ("Kathal Biryani"                          , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Kathal Masala"                           , "Lunch"     , "uniliv"  , False , True ),
    ("Kela Ke Kofte"                           , "Lunch"     , "uniliv"  , False , True ),
    ("Kele Ki Sabji"                           , "Lunch"     , "uniliv"  , False , True ),
    ("Laccha Parataha"                         , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Langer Wali Dal"                         , "Lunch"     , "uniliv"  , True  , False),
    ("Maa Ki Dal"                              , "Lunch"     , "uniliv"  , True  , False),
    ("Malai Kofta"                             , "Lunch"     , "uniliv"  , False , True ),
    ("Masala Tori"                             , "Lunch"     , "uniliv"  , False , True ),
    ("Mirchi Ka Salan"                         , "Lunch"     , "uniliv"  , False , True ),
    ("Mix Dal"                                 , "Lunch"     , "uniliv"  , True  , False),
    ("Mix Veg"                                 , "Lunch"     , "uniliv"  , False , True ),
    ("Mix Veg Kofta"                           , "Lunch"     , "uniliv"  , False , True ),
    ("Moong Masoor"                            , "Lunch"     , "uniliv"  , True  , False),
    ("Nariyal Laddu"                           , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Navratan Rice"                           , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Palak soya Badi"                         , "Lunch"     , "uniliv"  , False , False),
    ("Paneer Bhurji"                           , "Lunch"     , "uniliv"  , False , True ),
    ("Parwal Masala"                           , "Lunch"     , "uniliv"  , False , True ),
    ("Pickle"                                  , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Poori"                                   , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Punjabi Kadhi Pakoda"                    , "Lunch"     , "uniliv"  , True  , False),
    ("Raita"                                   , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Rajma Masala"                            , "Lunch"     , "uniliv"  , True  , False),
    ("Rajma Rashella"                          , "Lunch"     , "uniliv"  , True  , False),
    ("Red Bopala"                              , "Lunch"     , "uniliv"  , False , True ),
    ("Sambher"                                 , "Lunch"     , "uniliv"  , True  , False),
    ("Sindhi Kadhi"                            , "Lunch"     , "uniliv"  , True  , False),
    ("Steamed Rice"                            , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Stuffed Tomato"                          , "Lunch"     , "uniliv"  , False , False),
    ("Tawa Kulcha"                             , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Tori Chana dal"                          , "Lunch"     , "uniliv"  , True  , True ),
    ("Urad sabut"                              , "Lunch"     , "uniliv"  , True  , False),
    ("Veg Biryani"                             , "Lunch"     , "uniliv"  , False , False),  # accompaniment
    ("Veg Jalfrezi"                            , "Lunch"     , "uniliv"  , False , True ),
    ("Veg Makhani"                             , "Lunch"     , "uniliv"  , True  , False),
    # ── Snacks DISHES ──
    ("Aloo Bonda"                              , "Snacks"    , "uniliv"  , False , False),
    ("Aloo Chana chaat"                        , "Snacks"    , "uniliv"  , True  , False),
    ("Bhajjiya"                                , "Snacks"    , "uniliv"  , False , False),
    ("Bhel Puri"                               , "Snacks"    , "uniliv"  , False , False),
    ("Bread Pakoda"                            , "Snacks"    , "uniliv"  , False , False),
    ("Chilli Patota"                           , "Snacks"    , "uniliv"  , False , False),
    ("Dabeli"                                  , "Snacks"    , "uniliv"  , False , False),
    ("Dahi Bhalla"                             , "Snacks"    , "uniliv"  , False , False),
    ("Dal Vada"                                , "Snacks"    , "uniliv"  , True  , False),
    ("Fruit Chaat"                             , "Snacks"    , "uniliv"  , False , False),
    ("Gol gappe"                               , "Snacks"    , "uniliv"  , False , False),
    ("Green /Red Chutney"                      , "Snacks"    , "uniliv"  , False , False),  # accompaniment
    ("Hara Bhara kebab"                        , "Snacks"    , "uniliv"  , False , False),
    ("Kanji Vada"                              , "Snacks"    , "uniliv"  , False , False),
    ("Kathi Roll"                              , "Snacks"    , "uniliv"  , False , False),
    ("Ketchup"                                 , "Snacks"    , "uniliv"  , False , False),  # accompaniment
    ("Khasta Kachori"                          , "Snacks"    , "uniliv"  , False , False),
    ("Khata/Mittha Pani"                       , "Snacks"    , "uniliv"  , False , False),  # accompaniment
    ("Macrroni"                                , "Snacks"    , "uniliv"  , False , False),
    ("Maggi"                                   , "Snacks"    , "uniliv"  , False , False),
    ("Mix Sauce Pasta"                         , "Snacks"    , "uniliv"  , False , False),
    ("Patties"                                 , "Snacks"    , "uniliv"  , False , False),
    ("Pesto S/W"                               , "Snacks"    , "uniliv"  , False , False),
    ("Red Sauce Pasta"                         , "Snacks"    , "uniliv"  , False , False),
    ("Samosa Chaat"                            , "Snacks"    , "uniliv"  , False , False),
    ("Tea/ Coffee"                             , "Snacks"    , "uniliv"  , False , False),  # accompaniment
    ("Tikki Chaat"                             , "Snacks"    , "uniliv"  , False , False),
    ("Vada Pav"                                , "Snacks"    , "uniliv"  , False , False),
    ("Veg Noodles"                             , "Snacks"    , "uniliv"  , False , False),
    ("White Sauce Pasta"                       , "Snacks"    , "uniliv"  , False , False),
    ("Zimikand Ki Tikki"                       , "Snacks"    , "uniliv"  , False , False),
]


# ── Insert dishes ─────────────────────────────────────────────────
created = updated = 0
for dish_name, meal_type, brand, is_dal, is_star in DISHES:
    is_aloo = any(w in dish_name.lower() for w in ['aloo','alu','potato'])
    obj, was_created = Dish.objects.get_or_create(
        dish_name=dish_name, meal_type=meal_type, brand=brand,
        defaults={'ingredients': None, 'is_dal': is_dal,
                  'is_star': is_star, 'is_aloo': is_aloo}
    )
    if not was_created:
        obj.is_dal=is_dal; obj.is_star=is_star; obj.is_aloo=is_aloo; obj.save()
        updated += 1
    else:
        created += 1

print(f"\n✅ Dishes created: {created}  |  updated: {updated}")
print("\nBreakdown:")
for brand in ['uniliv', 'huddle']:
    qs = Dish.objects.filter(brand=brand)
    print(f"  {brand.upper()}: {qs.count()} total")
    for meal in ['Breakfast', 'Lunch', 'Snacks', 'Dinner']:
        print(f"    {meal}: {qs.filter(meal_type=meal).count()}")

# ══════════════════════════════════════════════════════════════════
#  CREATE DEFAULT USERS WITH ROLE-BASED ACCESS
# ══════════════════════════════════════════════════════════════════
print("\n── Creating default users ───────────────────────────────")

DEFAULT_USERS = [
    # (username, password, email, role, brand, is_superuser)
    ('admin',          'admin123',  'admin@uniliv.com',    'admin',    'uniliv', True),
    ('property_admin', 'prop123',   'property@uniliv.com', 'property', 'uniliv', False),
    ('food_uniliv',    'food123',   'food@uniliv.com',     'food',     'uniliv', False),
    ('food_huddle',    'huddle123', 'food@huddle.com',     'food',     'huddle', False),
]

for username, password, email, role, brand, is_super in DEFAULT_USERS:
    if User.objects.filter(username=username).exists():
        print(f"  ℹ  {username} already exists — skipped")
        continue
    if is_super:
        user = User.objects.create_superuser(username, email, password)
    else:
        user = User.objects.create_user(username, email, password)
    UserProfile.objects.create(user=user, role=role, brand=brand)
    print(f"  ✅ {username:20} role={role:10} brand={brand}")

print("\n── Login credentials ────────────────────────────────────")
print("  admin          / admin123   → Both dashboards")
print("  property_admin / prop123    → Property dashboard only")
print("  food_uniliv    / food123    → Food dashboard (UNILIV)")
print("  food_huddle    / huddle123  → Food dashboard (HUDDLE)")
print("\n✅ Done!  Run: python manage.py runserver")
