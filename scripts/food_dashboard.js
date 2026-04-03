/* ============================================================
   FOOD MENU PLANNER — Modular, Isolated Dashboard Module
   Source of truth: Excel sheets (pre-parsed & embedded)
   Fully independent from Organogram Dashboard
   ============================================================ */

/* ============================================================
   SECTION 1 — EMBEDDED MENU DATABASE
   (Pre-parsed from Excel: Draft_Menu__1_.xlsx & Huddle_Draft_Menu__1_.xlsx)
   ============================================================ */
const MENU_DB_RAW = {"uniliv":{"week1":{"Monday":{"breakfast":{"hot1":"Aloo Pyaz Paratha","hot2":"Sabudana khichdi","chutney":"Curd/Pickle","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Mix Dal","veg1":"Butter Paneer Masala","veg2":"Veg Jalfrezi","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"White Sauce Pasta","chutney":null,"beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Bukhara","veg1":"Kadhai soya","veg2":"Bhindi do Pyaza","rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Tuesday":{"breakfast":{"hot1":"Idli / Samber","hot2":"Methi Thepla","chutney":"Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Rajma Rashella","veg1":"Beans Poriyal","veg2":"Masala Tori","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Pesto S/W","chutney":"Ketchup","beverage":"Tea/Coffee"},"dinner":{"dal":"Moong Dal","veg1":"Mutter Mushroom","veg2":"Tinda Masala","rice":"Corn Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":"Shahi Tukda","pickle":"Pickle","milk":"Hot Milk"}},"Wednesday":{"breakfast":{"hot1":"Pav","hot2":"Bread Roll","chutney":"Bhajji/ Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Kadhi Pakoda","veg1":"Aloo 65","veg2":"Cabbage Mutter","rice":"Jeera Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Khasta Kachori","chutney":"Green /Red Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Green Moong Dal","veg1":"Pahadi Paneer","veg2":"Corn Palak","rice":"Dum Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Thursday":{"breakfast":{"hot1":"Veg Uttapam / Samber","hot2":"Medu Vada","chutney":"Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Chana Dal Tadka","veg1":"Aloo Gobhi Adraki","veg2":"Stuffed Tomato","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Kathi Roll","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Black Masoor","veg1":"Kathal Ki Sabji","veg2":"Tawa Fry","rice":"Plain Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Friday":{"breakfast":{"hot1":"Plain Paratha","hot2":"Vermcilli Upma","chutney":"Dry Aloo","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Urad sabut","veg1":"Malai Kofta","veg2":"Baigan Bharta","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Vada Pav","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Dhaba Dal","veg1":"Paneer Makhani","veg2":"Veg korma","rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Saturday":{"breakfast":{"hot1":"Beasan Chilla","hot2":"Pyaz Paratha","chutney":"Green Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Kale Chane","veg1":"Dry Aloo","veg2":"Gatte ki Sabji","rice":"Steamed Rice","breads":"Poori","salad":"Green Salad","curd":"Raita","desert":"Halwa","pickle":"Pickle"},"snacks":{"snack":"Dal Vada","chutney":"Ketchup","beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Makhani","veg1":"Punch Kathor","veg2":"Jeera Ghiya","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":"Gulab Jamun","pickle":"Pickle","milk":"Hot Milk"}},"Sunday":{"breakfast":{"hot1":"Bombay Sandwich","hot2":"Batata Poha","chutney":"Green Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Chooley","veg1":"Anari Aloo","veg2":null,"rice":"Steamed Rice","breads":"Bhature","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Veg Noodles","chutney":"Ketchup","beverage":"Tea/Coffee"},"dinner":{"dal":"Arhar Dal Tadka","veg1":"Dum Aloo","veg2":"Karela Bhujjiya","rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Fryums","milk":"Hot Milk"}}},"week2":{"Monday":{"breakfast":{"hot1":"Dal Paratha","hot2":"Rawa Upma","chutney":"Curd/Pickle/Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Punchmel","veg1":"Parwal Masala","veg2":null,"rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Red Sauce Pasta","chutney":null,"beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Malka","veg1":"Soya chaap Masala","veg2":null,"rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Tuesday":{"breakfast":{"hot1":"Vada / Samber","hot2":"Gujrati Thepla","chutney":"Curd/Pickle/Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea"},"lunch":{"dal":"Dal Makhani","veg1":"Bharwa shimla","veg2":null,"rice":"Kathal Biryani","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Bread Pakoda","chutney":"Ketchup","beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Fry","veg1":"Ghiya kofta","veg2":null,"rice":"Corn Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":"Rice Kheer","pickle":"Pickle","milk":"Hot Milk"}},"Wednesday":{"breakfast":{"hot1":"Kulcha","hot2":"Vegetable daliya","chutney":"Mattara","fruits":"Fruits","bakery":"BBJ","beverage":"Tea"},"lunch":{"dal":"Punjabi Kadhi Pakoda","veg1":"Aloo Masala","veg2":null,"rice":"Jeera Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Gol gappe","chutney":"Khata/Mittha Pani","beverage":"Tea/Coffee"},"dinner":{"dal":"Chana Dal","veg1":"Paneer Do Pyaza","veg2":null,"rice":"Dum Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Thursday":{"breakfast":{"hot1":"Thepla","hot2":"Moong Dal Chilla","chutney":"Curd","fruits":"Fruits","bakery":"BBJ","beverage":"Tea"},"lunch":{"dal":"Rajma Masala","veg1":"Tori Chana dal","veg2":null,"rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":"Nariyal Laddu","pickle":"Pickle"},"snacks":{"snack":"Hara Bhara kebab","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Arhar Dal","veg1":"Dum Aloo Banarsi","veg2":null,"rice":"Plain Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Friday":{"breakfast":{"hot1":"Poori","hot2":"Sabudana Vada","chutney":"Dry Aloo","fruits":"Fruits","bakery":"BBJ","beverage":"Tea"},"lunch":{"dal":"Moong Masoor","veg1":"Mix Veg","veg2":null,"rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Aloo Chana chaat","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Dhaba Dal","veg1":"Paneer Takatak","veg2":null,"rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Saturday":{"breakfast":{"hot1":"Moong Dal Chilla","hot2":"Gobhi Paratha","chutney":"Curd/Green Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea"},"lunch":{"dal":"Kale Chane","veg1":"Red Bopala","veg2":null,"rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Dabeli","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Veg Manchurian","veg1":"Paneer Chilli","veg2":null,"rice":"Fried Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":"Jalebi","pickle":"Pickle","milk":"Hot Milk"}},"Sunday":{"breakfast":{"hot1":"Colslow Sandwich","hot2":"Veg Roll","chutney":"Green Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea"},"lunch":{"dal":"Chooley","veg1":"Achari aloo","veg2":null,"rice":"Steamed Rice","breads":"Tawa Kulcha","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Maggi","chutney":null,"beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Tadka","veg1":"Aloo Bhujiya","veg2":null,"rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Fryums","milk":"Hot Milk"}}},"week3":{"Monday":{"breakfast":{"hot1":"Mix Veg Paratha","hot2":"Palak Chilla","chutney":"Curd/Pickle","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Panchmel","veg1":"Kela Ke Kofte","veg2":"Chilli Mashroom","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Zimikand Ki Tikki","chutney":"Chutney","beverage":"Tea/ Coffee"},"dinner":{"dal":"Dal Bukhara","veg1":"Aloo matter","veg2":"Soya Matter Kimma","rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Tuesday":{"breakfast":{"hot1":"Medu Vada/ Samber","hot2":"Masala Idli","chutney":"Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Kali Urad Dal","veg1":"Handi Veg","veg2":"Tori Chana dal","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Fruit Chaat","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Dal Tadka","veg1":"Veg Amritsari","veg2":"Matter Malai","rice":"Corn Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":"Vermcilli Kheer","pickle":"Pickle","milk":"Hot Milk"}},"Wednesday":{"breakfast":{"hot1":"Pav","hot2":"Mix Veg Thepla","chutney":"Missal/ Curd","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Sindhi Kadhi","veg1":"Karela Do Pyaza","veg2":"Chhare Wale Aloo","rice":"Jeera Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Macrroni","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Hari Moong Dal","veg1":"Matter Paneer","veg2":"Kathal Masala","rice":"Dum Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Thursday":{"breakfast":{"hot1":"Veg Uttapam / Samber","hot2":"Falafal Roll","chutney":"Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Dhaba","veg1":"Bhindi Fry","veg2":"Dahi Wale Aloo","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":"Besan Laddu","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Chilli Patota","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Salsa Sauce","veg1":null,"veg2":"Saute Vegetable","rice":"Herb Rice with Ratatouille","breads":"Garlic Bread","salad":"Pasta Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Friday":{"breakfast":{"hot1":"Poori","hot2":"Bread Upma","chutney":"Aloo Rassa","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Maa Ki Dal","veg1":"Kathal Masala","veg2":"Palak soya Badi","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Aloo Chana Chaat","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Dhoya Urad dal","veg1":"Paneer Kadhai","veg2":"Ghiya Chana dal","rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Saturday":{"breakfast":{"hot1":"Bread Pakoda","hot2":"Muli Paratha","chutney":"Green Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Chooley","veg1":null,"veg2":"Aloo Gobhi","rice":"Navratan Rice","breads":"Poori","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Dahi Bhalla","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Moong Masoor","veg1":"Masala Parwal","veg2":"Paapad ki sabji","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":"Jalebi","pickle":"Pickle","milk":"Hot Milk"}},"Sunday":{"breakfast":{"hot1":"Corn Capcicum Sandwich","hot2":"Indori Poha","chutney":"Green Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Sambher","veg1":"Cabbage Beans Porriyal","veg2":null,"rice":"Curd rice","breads":"Laccha Parataha","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Samosa Chaat","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Dal","veg1":"Gatte Ki Sabji","veg2":"Churma","rice":"Steamed Rice","breads":"Bhati","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}}},"week4":{"Monday":{"breakfast":{"hot1":"Palak Poori","hot2":"Tadka Idli","chutney":"Curd/Pickle/ bhaji","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Palak","veg1":"Mix Veg Kofta","veg2":"Aloo Parwal","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Kanji Vada","chutney":null,"beverage":"Tea"},"dinner":{"dal":"Moong Dal Tadka","veg1":"Bhindi Masala","veg2":"Veg Crispy","rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Tuesday":{"breakfast":{"hot1":"Tomato Uttapam","hot2":"Veg Daliya","chutney":"Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Arhar Dal","veg1":"Paneer Bhurji","veg2":"Aloo Beans","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Tikki Chaat","chutney":null,"beverage":"Tea"},"dinner":{"dal":"Dal Malka","veg1":"Gajar Beans Matter","veg2":"Malai Tori","rice":"Corn Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":"Fruit Custard","pickle":"Pickle","milk":"Hot Milk"}},"Wednesday":{"breakfast":{"hot1":"Mix Paratha","hot2":"Bread Toast","chutney":"Curd","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Langer Wali Dal","veg1":"Aloo Matter","veg2":"Veg Makhani","rice":"Jeera Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Bhel Puri","chutney":"Green /Red Chutney","beverage":"Tea"},"dinner":{"dal":"Lobbiya Dal","veg1":"Paneer hara pyaz","veg2":"Corn Cappcicum","rice":"Dum Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Thursday":{"breakfast":{"hot1":"Masala Dosa/ Samber","hot2":"Khasta Kachori","chutney":"Chutney/ Aloo Jhol","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Boondi Kadhi","veg1":"Aloo Pyaz ki Sabji","veg2":"Bagara Baigan","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":"Guldana","pickle":"Pickle"},"snacks":{"snack":"Mix Sauce Pasta","chutney":null,"beverage":"Tea"},"dinner":{"dal":"Dal","veg1":"Bhajji","veg2":null,"rice":"Mix Veg Pulao","breads":"Pav","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Friday":{"breakfast":{"hot1":"Ajwain Paratha","hot2":"Macroni","chutney":"Aloo Bhaji","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Bengali Cholar Dal","veg1":"Aloo Posto","veg2":"Kele Ki Sabji","rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Aloo Bonda","chutney":"Green Chutney","beverage":"Tea"},"dinner":{"dal":"Mix Dal","veg1":"Paneer Kali Mirch","veg2":"Sev Bhajji","rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":"Hot Milk"}},"Saturday":{"breakfast":{"hot1":"Cutlet","hot2":"Sujji Chilla","chutney":"Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Makhani","veg1":"Mirchi Ka Salan","veg2":null,"rice":"Veg Biryani","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Bhajjiya","chutney":"Ketchup","beverage":"Tea"},"dinner":{"dal":"Arhar Dal","veg1":"Chokka","veg2":null,"rice":"Steamed Rice","breads":"Litti","salad":"Green Salad","desert":"Balushahi","pickle":"Pickle","milk":"Hot Milk"}},"Sunday":{"breakfast":{"hot1":"Pesto Sandwich","hot2":"Sev Poha","chutney":"Green Chutney","fruits":"Fruits","bakery":"BBJ","beverage":"Tea/Coffee"},"lunch":{"dal":"Cholley","veg1":"Gawar fali Bhajji","veg2":null,"rice":"Steamed Rice","breads":"Bhature","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Patties","chutney":"Ketchup","beverage":"Tea"},"dinner":{"dal":"Dal Bhukara","veg1":"Makhana Matter","veg2":"Aloo Bhujjiya","rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Fryums","milk":"Hot Milk"}}}},"huddle":{"week1":{"Monday":{"breakfast":{"hot1":"Aloo Pyaz Paratha","hot2":null,"chutney":"Curd/Pickle","fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Mix Dal","veg1":"Veg Jalfrezi","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"White Sauce Pasta","chutney":null,"beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Bukhara","veg1":"Bhindi do Pyaza","veg2":null,"rice":"Pea Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Tuesday":{"breakfast":{"hot1":"Idli / Samber","hot2":null,"chutney":"Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Rajma Rashella","veg1":"Masala Tori","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Pesto S/W","chutney":"Ketchup","beverage":"Tea/Coffee"},"dinner":{"dal":"Moong Dal","veg1":"Mutter Mushroom","veg2":null,"rice":"Corn Pulao","breads":"Chapatti","salad":"Green Salad","desert":"Shahi Tukda","pickle":"Pickle","milk":null}},"Wednesday":{"breakfast":{"hot1":"Pav","hot2":null,"chutney":"Bhajji","fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Kadhi Pakoda","veg1":"Cabbage Mutter","veg2":null,"rice":"Jeera Pulao","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Khasta Kachori","chutney":"Green /Red Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Green Moong Dal","veg1":"Pahadi Paneer","veg2":null,"rice":"Dum Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Thursday":{"breakfast":{"hot1":"Veg Uttapam","hot2":null,"chutney":"Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Chana Dal Tadka","veg1":"Aloo Gobhi Adraki","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Kathi Roll","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Black Masoor","veg1":"Kathal Ki Sabji","veg2":null,"rice":"Plain Rice","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Friday":{"breakfast":{"hot1":"Plain Paratha","hot2":null,"chutney":"Dry Aloo","fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Urad sabut","veg1":"Baigan Bharta","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Vada Pav","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Dhaba Dal","veg1":"Veg korma","veg2":null,"rice":"Pea Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Saturday":{"breakfast":{"hot1":"Beasan Chilla","hot2":null,"chutney":"Green Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Kale Chane","veg1":"Dry Aloo","veg2":null,"rice":"Steamed Rice","breads":"Poori","salad":"Green Salad","curd":"Raita","desert":"Halwa","pickle":"Pickle"},"snacks":{"snack":"Dal Vada","chutney":"Ketchup","beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Makhani","veg1":"Jeera Ghiya","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Sunday":{"breakfast":{"hot1":"Bombay Sandwich","hot2":null,"chutney":"Green Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Choley","veg1":"Anari Aloo","veg2":null,"rice":"Steamed Rice","breads":"Bhature","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Veg Noodles","chutney":"Ketchup","beverage":"Tea/Coffee"},"dinner":{"dal":"Arhar Dal Tadka","veg1":"Karela Bhujjiya","veg2":null,"rice":"Pea Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Fryums","milk":null}}},"week2":{"Monday":{"breakfast":{"hot1":"Dal Paratha","hot2":null,"chutney":"Curd/Pickle","fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Punchmel","veg1":"Parwal Masala","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Red Sauce Pasta","chutney":null,"beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Malka","veg1":"Soya chaap Masala","veg2":null,"rice":"Pea Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Tuesday":{"breakfast":{"hot1":"Vada / Samber","hot2":null,"chutney":"Chutney","fruits":null,"bakery":null,"beverage":"Tea"},"lunch":{"dal":"Dal Makhani","veg1":null,"veg2":null,"rice":"Kathal Biryani","breads":"Chapatti","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Bread Pakoda","chutney":"Ketchup","beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Fry","veg1":"Ghiya kofta","veg2":null,"rice":"Corn Pulao","breads":"Chapatti","salad":"Green Salad","desert":"Rice Kheer","pickle":"Pickle","milk":null}},"Wednesday":{"breakfast":{"hot1":"Kulcha","hot2":null,"chutney":"Matar","fruits":"Fruits","bakery":null,"beverage":"Tea"},"lunch":{"dal":"Punjabi Kadhi Pakoda","veg1":"Arbi Masala","veg2":null,"rice":"Jeera Pulao","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Gol gappe","chutney":"Khata/Mittha Pani","beverage":"Tea/Coffee"},"dinner":{"dal":"Chana Dal","veg1":"Paneer Do Pyaza","veg2":null,"rice":"Dum Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Thursday":{"breakfast":{"hot1":"Moong Dal Chilla","hot2":null,"chutney":"Chutney","fruits":null,"bakery":null,"beverage":"Tea"},"lunch":{"dal":"Rajma Masala","veg1":"Tori Chana dal","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":"Nariyal Laddu","pickle":"Pickle"},"snacks":{"snack":"Hara Bhara kebab","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Arhar Dal","veg1":"Dum Aloo Banarsi","veg2":null,"rice":"Plain Rice","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Friday":{"breakfast":{"hot1":"Poori","hot2":null,"chutney":"Dry Aloo","fruits":"Fruits","bakery":null,"beverage":"Tea"},"lunch":{"dal":"Moong Masoor","veg1":"Hyderabadi Baigan","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Aloo Chana chaat","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Dhaba Dal","veg1":"Paneer Takatak","veg2":null,"rice":"Pea Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Saturday":{"breakfast":{"hot1":"Gobhi Paratha","hot2":null,"chutney":"Curd","fruits":null,"bakery":null,"beverage":"Tea"},"lunch":{"dal":"Kale Chane","veg1":"Lauki Bhurji","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Dabeli","chutney":"Green Chutney","beverage":"Tea/Coffee"},"dinner":{"dal":"Veg Manchurian","veg1":"Paneer Chilli","veg2":null,"rice":"Hakka Noodles","breads":"Fried Rice","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Sunday":{"breakfast":{"hot1":"Colslaw Sandwich","hot2":null,"chutney":"Green Chutney","fruits":null,"bakery":null,"beverage":"Tea"},"lunch":{"dal":"Choley","veg1":null,"veg2":null,"rice":"Steamed Rice","breads":"Tawa Kulcha","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Maggi","chutney":null,"beverage":"Tea/Coffee"},"dinner":{"dal":"Dal Tadka","veg1":"Aloo Bhujiya","veg2":null,"rice":"Pea Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Fryums","milk":null}}},"week3":{"Monday":{"breakfast":{"hot1":"Mix Veg Paratha","hot2":null,"chutney":"Curd/Pickle","fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Panchmel","veg1":"Kela Ke Kofte","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Zimikand Ki Tikki","chutney":"Chutney","beverage":"Tea/ Coffee"},"dinner":{"dal":"Dal Bukhara","veg1":"Soya Matter Keema","veg2":null,"rice":"Pea Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Tuesday":{"breakfast":{"hot1":"Masala Idli","hot2":null,"chutney":"Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Kali Urad Dal","veg1":"Handi Veg","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Fruit Chaat","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Dal Tadka","veg1":"Matter Malai","veg2":null,"rice":"Corn Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Wednesday":{"breakfast":{"hot1":"Pav","hot2":null,"chutney":"Missal","fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Sindhi Kadhi","veg1":"Chhare Wale Aloo","veg2":null,"rice":"Jeera Pulao","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Macrroni","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Hari Moong Dal","veg1":"Matter Paneer","veg2":null,"rice":"Dum Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Thursday":{"breakfast":{"hot1":"Veg Uttapam / Samber","hot2":null,"chutney":"Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Dhaba","veg1":"Dahi Wale Aloo","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":"Besan Laddu","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Chilli Patato","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Salsa Sauce","veg1":"Saute Vegetable","veg2":null,"rice":"Herb Rice with Ratatouille","breads":"Chapatti","salad":"Pasta Salad","desert":null,"pickle":"Pickle","milk":null}},"Friday":{"breakfast":{"hot1":"Poori","hot2":null,"chutney":"Aloo Rassa","fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Maa Ki Dal","veg1":"Kathal Masala","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Aloo Chana Chaat","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Dhoya Urad dal","veg1":"Paneer Kadhai","veg2":null,"rice":"Pea Pulao","breads":"Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Saturday":{"breakfast":{"hot1":"Muli Paratha","hot2":null,"chutney":"Green Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Chooley","veg1":"Aloo Gobhi","veg2":null,"rice":"Navratan Rice","breads":"Poori","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Dahi Bhalla","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Moong Masoor","veg1":"Masala Parwal","veg2":null,"rice":"Steamed Rice","breads":"Chapatti","salad":"Green Salad","desert":"Jalebi","pickle":"Pickle","milk":null}},"Sunday":{"breakfast":{"hot1":"Indori Poha","hot2":null,"chutney":"Green Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Sambher","veg1":"Cabbage Beans Porriyal","veg2":null,"rice":"Curd rice","breads":"Laccha Parataha","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Samosa Chaat","chutney":null,"beverage":"Tea/ Coffee"},"dinner":{"dal":"Dal","veg1":"Gatte Ki Sabji","veg2":null,"rice":"Steamed Rice","breads":"Bhati","salad":"Green Salad","desert":"Churma","pickle":"Pickle","milk":null}}},"week4":{"Monday":{"breakfast":{"hot1":"Palak Poori","hot2":null,"chutney":"Bhajji","fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Palak","veg1":"Mix Veg Kofta","veg2":null,"rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Kanji Vada","chutney":null,"beverage":"Tea"},"dinner":{"dal":"Moong Dal Tadka","veg1":"Bhindi Masala","veg2":null,"rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Tuesday":{"breakfast":{"hot1":"Tomato Uttapam","hot2":null,"chutney":"Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Arhar Dal","veg1":"Aloo Beans","veg2":null,"rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Tikki Chaat","chutney":null,"beverage":"Tea"},"dinner":{"dal":"Dal Malka","veg1":"Gajar Beans Matter","veg2":null,"rice":"Corn Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":"Fruit Custard","pickle":"Pickle","milk":null}},"Wednesday":{"breakfast":{"hot1":"Mix Paratha","hot2":null,"chutney":"Curd","fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Langer Wali Dal","veg1":"Aloo Matter","veg2":null,"rice":"Jeera Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Bhel Puri","chutney":"Green /Red Chutney","beverage":"Tea"},"dinner":{"dal":"Lobbiya Dal","veg1":"Paneer hara pyaz","veg2":null,"rice":"Dum Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Thursday":{"breakfast":{"hot1":"Khasta Kachori","hot2":null,"chutney":"Aloo Jhol","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Boondi Kadhi","veg1":"Aloo Pyaz ki Sabji","veg2":null,"rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":"Guldana","pickle":"Pickle"},"snacks":{"snack":"Mix Sauce Pasta","chutney":null,"beverage":"Tea"},"dinner":{"dal":"Dal","veg1":"Bhajji","veg2":null,"rice":"Mix Veg Pulao","breads":"Pav","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Friday":{"breakfast":{"hot1":"Macroni","hot2":null,"chutney":null,"fruits":"Fruits","bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Bengali Cholar Dal","veg1":"Kele Ki Sabji","veg2":null,"rice":"Steamed Rice","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":null,"desert":null,"pickle":"Pickle"},"snacks":{"snack":"Aloo Bonda","chutney":"Green Chutney","beverage":"Tea"},"dinner":{"dal":"Mix Dal","veg1":"Sev Bhajji","veg2":null,"rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Saturday":{"breakfast":{"hot1":"Sujji Chilla","hot2":null,"chutney":"Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Dal Makhani","veg1":"Mirchi Ka Salan","veg2":null,"rice":"Veg Biryani","breads":"Desi Ghee Chapatti","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Bhajjiya","chutney":"Ketchup","beverage":"Tea"},"dinner":{"dal":"Arhar Dal","veg1":"Chokka","veg2":null,"rice":"Steamed Rice","breads":"Litti","salad":"Green Salad","desert":null,"pickle":"Pickle","milk":null}},"Sunday":{"breakfast":{"hot1":"Pesto Sandwich","hot2":null,"chutney":"Green Chutney","fruits":null,"bakery":null,"beverage":"Tea/Coffee"},"lunch":{"dal":"Cholley","veg1":"Gawar fali Bhajji","veg2":null,"rice":"Steamed Rice","breads":"Bhature","salad":"Green Salad","curd":"Raita","desert":null,"pickle":"Pickle"},"snacks":{"snack":"Patties","chutney":"Ketchup","beverage":"Tea"},"dinner":{"dal":"Dal Bhukara","veg1":"Makhana Matter","veg2":null,"rice":"Pea Pulao","breads":"Desi Ghee Chapatti","salad":"Green Salad","desert":null,"pickle":"Fryums","milk":null}}}}};

/* ============================================================
   SECTION 2 — MODULE STATE
   ============================================================ */
let fmpBrand         = 'uniliv';
let fmpCurrentMenu   = null;   // Generated 7-day menu
let fmpDishHistory   = [];     // Rolling 15-day dish history for repetition check
let fmpDalHistory    = [];     // Rolling 7-day dal history
let fmpPoolFlat      = {};     // Flattened pool of all day-menus per brand

/* ============================================================
   SECTION 3 — DATABASE PREPARATION
   Flatten weeks → array of 28 named day-entries per brand
   ============================================================ */
function fmpBuildPool() {
  const DAYS_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  ['uniliv','huddle'].forEach(brand => {
    fmpPoolFlat[brand] = [];
    ['week1','week2','week3','week4'].forEach((wk, wi) => {
      DAYS_ORDER.forEach((day, di) => {
        const entry = MENU_DB_RAW[brand][wk][day];
        if (entry) {
          fmpPoolFlat[brand].push({
            id:    `${brand}_${wk}_${day}`,
            week:  wi + 1,
            day,
            data:  entry
          });
        }
      });
    });
  });
}

/* ============================================================
   SECTION 4 — UTILITY HELPERS
   ============================================================ */
function fmpShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmpNorm(str) {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function fmpGetAllDishes(dayData) {
  const dishes = [];
  const m = dayData;
  [m.breakfast.hot1, m.breakfast.hot2, m.breakfast.chutney,
   m.lunch.dal, m.lunch.veg1, m.lunch.veg2, m.lunch.rice,
   m.snacks.snack,
   m.dinner.dal, m.dinner.veg1, m.dinner.veg2, m.dinner.rice
  ].forEach(d => { if (d) dishes.push(fmpNorm(d)); });
  return dishes;
}

function fmpGetDals(dayData) {
  const d = [];
  if (dayData.lunch.dal)  d.push(fmpNorm(dayData.lunch.dal));
  if (dayData.dinner.dal) d.push(fmpNorm(dayData.dinner.dal));
  return d;
}

/* ============================================================
   SECTION 5 — RULE ENGINE: MENU GENERATION
   Rules enforced:
   ✅ Only vegetarian meals
   ✅ Dal compulsory in Lunch & Dinner
   ❌ No dal repeat within 7 days
   ❌ No main dish repeat within 15 days (checks history + current week)
   ============================================================ */
function fmpGenerateMenu(brand) {
  const pool    = fmpPoolFlat[brand];
  const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  let   chosen  = [];
  let   usedDals    = new Set(fmpDalHistory.map(fmpNorm));
  let   usedDishes  = new Set(fmpDishHistory.map(fmpNorm));
  const attempts = 20;

  for (let attempt = 0; attempt < attempts; attempt++) {
    chosen     = [];
    usedDals   = new Set(fmpDalHistory.map(fmpNorm));
    usedDishes = new Set(fmpDishHistory.map(fmpNorm));
    const shuffled = fmpShuffle(pool);
    let success = true;

    for (let d = 0; d < 7; d++) {
      let found = null;
      for (const entry of shuffled) {
        if (chosen.some(c => c.id === entry.id)) continue;

        const dals    = fmpGetDals(entry.data);
        const dishes  = fmpGetAllDishes(entry.data);
        const dalOk   = dals.every(dl => !usedDals.has(fmpNorm(dl)));
        const dishOk  = dishes.every(ds => !usedDishes.has(fmpNorm(ds)));
        const dalPresent = entry.data.lunch.dal && entry.data.dinner.dal;

        if (dalOk && dishOk && dalPresent) {
          found = entry;
          break;
        }
      }

      // Relax dish-repeat rule if strict passes fail (priority: dal > dish)
      if (!found) {
        for (const entry of shuffled) {
          if (chosen.some(c => c.id === entry.id)) continue;
          const dals    = fmpGetDals(entry.data);
          const dalOk   = dals.every(dl => !usedDals.has(fmpNorm(dl)));
          const dalPresent = entry.data.lunch.dal && entry.data.dinner.dal;
          if (dalOk && dalPresent) { found = entry; break; }
        }
      }

      // Last resort: any unused entry
      if (!found) {
        found = shuffled.find(e => !chosen.some(c => c.id === e.id));
      }

      if (!found) { success = false; break; }

      fmpGetDals(found.data).forEach(dl   => usedDals.add(dl));
      fmpGetAllDishes(found.data).forEach(ds => usedDishes.add(ds));
      chosen.push({ label: DAYS[d], ...found });
    }

    if (success) break;
  }

  // Build structured output
  const menu = chosen.map((entry, i) => ({
    dayLabel: entry.label,
    sourceDay: entry.day,
    sourceWeek: entry.week,
    data: entry.data
  }));

  fmpCurrentMenu = menu;

  // Update history (rolling 15 days = 2 × 7)
  const newDishes = menu.flatMap(d => fmpGetAllDishes(d.data));
  const newDals   = menu.flatMap(d => fmpGetDals(d.data));
  fmpDishHistory  = [...newDishes, ...fmpDishHistory].slice(0, 105); // 15 days × 7 meals
  fmpDalHistory   = [...newDals,   ...fmpDalHistory].slice(0,  98);  // 14 days × 7 dals

  return menu;
}

/* ============================================================
   SECTION 6 — RULE ENGINE: VALIDATION
   Returns structured validation report
   ============================================================ */
function fmpValidateMenu(menu) {
  if (!menu || !menu.length) return null;

  const issues  = [];
  const dalTrack  = {};
  const dishTrack = {};

  menu.forEach((day, di) => {
    const { data, dayLabel } = day;

    // Check dal compulsory
    if (!data.lunch.dal)  issues.push({ type:'warn', rule:'Dal Missing', detail:`${dayLabel} Lunch: No dal assigned` });
    if (!data.dinner.dal) issues.push({ type:'warn', rule:'Dal Missing', detail:`${dayLabel} Dinner: No dal assigned` });

    // Track dal repetition
    [data.lunch.dal, data.dinner.dal].filter(Boolean).forEach(dal => {
      const key = fmpNorm(dal);
      if (dalTrack[key]) {
        issues.push({ type:'error', rule:'Dal Repeated', detail:`"${dal}" used on ${dalTrack[key]} & ${dayLabel}` });
      } else {
        dalTrack[key] = dayLabel;
      }
    });

    // Track dish repetition (main items only)
    const mainDishes = [
      data.breakfast.hot1, data.breakfast.hot2,
      data.lunch.veg1, data.lunch.veg2,
      data.snacks.snack,
      data.dinner.veg1, data.dinner.veg2
    ].filter(Boolean);

    mainDishes.forEach(dish => {
      const key = fmpNorm(dish);
      if (dishTrack[key]) {
        issues.push({ type:'error', rule:'Dish Repeated', detail:`"${dish}" used on ${dishTrack[key]} & ${dayLabel}` });
      } else {
        dishTrack[key] = dayLabel;
      }
    });
  });

  const errors = issues.filter(i => i.type === 'error');
  const warns  = issues.filter(i => i.type === 'warn');

  return {
    pass:    errors.length === 0,
    errors,
    warns,
    totalIssues: issues.length,
    summary: errors.length === 0
      ? warns.length === 0
        ? '✅ All rules passed — No conflicts detected'
        : `⚠️ ${warns.length} warning(s) — Review missing dals`
      : `❌ ${errors.length} conflict(s) detected — ${warns.length} warning(s)`
  };
}

/* ============================================================
   SECTION 7 — INGREDIENT TRACKER
   ============================================================ */
function fmpTrackIngredients(menu) {
  const freq = {};
  menu.forEach(day => {
    const d = day.data;
    const allItems = [
      d.breakfast.hot1, d.breakfast.hot2, d.breakfast.chutney,
      d.lunch.dal, d.lunch.veg1, d.lunch.veg2, d.lunch.rice, d.lunch.breads,
      d.snacks.snack,
      d.dinner.dal, d.dinner.veg1, d.dinner.veg2, d.dinner.rice, d.dinner.breads,
      d.dinner.desert, d.lunch.desert
    ].filter(Boolean);
    allItems.forEach(item => {
      const k = fmpNorm(item);
      freq[k] = (freq[k] || 0) + 1;
    });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
}

/* ============================================================
   SECTION 8 — RENDERING: WEEKLY TABLE
   ============================================================ */
const MEAL_ICON = { breakfast:'🌅', lunch:'☀️', snacks:'🫖', dinner:'🌙' };
const MEAL_COLOR = {
  breakfast: '#2563eb',
  lunch:     '#16a34a',
  snacks:    '#d97706',
  dinner:    '#7c3aed'
};

function fmpRenderMealCard(meal, mealType, data) {
  const c = MEAL_COLOR[mealType];
  const icon = MEAL_ICON[mealType];

  let items = [];
  if (mealType === 'breakfast') {
    if (data.hot1)     items.push({ label:'🍽', val: data.hot1 });
    if (data.hot2)     items.push({ label:'🍽', val: data.hot2 });
    if (data.chutney)  items.push({ label:'🥣', val: data.chutney });
    if (data.fruits)   items.push({ label:'🍎', val: data.fruits });
    if (data.beverage) items.push({ label:'☕', val: data.beverage });
  } else if (mealType === 'lunch' || mealType === 'dinner') {
    if (data.dal)    items.push({ label:'🫘', val: data.dal, highlight: true });
    if (data.veg1)   items.push({ label:'🥘', val: data.veg1 });
    if (data.veg2)   items.push({ label:'🥗', val: data.veg2 });
    if (data.rice)   items.push({ label:'🍚', val: data.rice });
    if (data.breads) items.push({ label:'🫓', val: data.breads });
    if (data.desert) items.push({ label:'🍮', val: data.desert });
  } else if (mealType === 'snacks') {
    if (data.snack)    items.push({ label:'🍟', val: data.snack });
    if (data.chutney)  items.push({ label:'🥣', val: data.chutney });
    if (data.beverage) items.push({ label:'☕', val: data.beverage });
  }

  return `
    <div class="fmp-meal-card fmp-meal-${mealType}">
      <div class="fmp-meal-header" style="color:${c};">
        ${icon} <span>${meal}</span>
      </div>
      <ul class="fmp-meal-items">
        ${items.map(it => `
          <li class="${it.highlight ? 'fmp-dal-item' : ''}">
            <span class="fmp-item-icon">${it.label}</span>
            <span class="fmp-item-text">${it.val}</span>
          </li>`).join('')}
      </ul>
    </div>`;
}

function fmpRenderWeeklyTable(menu) {
  const container  = document.getElementById('fmp-menu-grid');
  const bottomGrid = document.getElementById('fmp-bottom-grid');
  const spinner    = document.getElementById('fmp-spinner');
  if (!container) return;

  // Hide spinner
  if (spinner) spinner.classList.remove('show');

  if (!menu || !menu.length) {
    // Remove grid mode — go back to block layout for empty state
    container.classList.remove('has-menu');
    container.innerHTML = `
      <div class="fmp-empty-state">
        <div class="fmp-empty-icon">📅</div>
        <h5>Ready to Plan</h5>
        <p>Select a brand and click <strong>Generate 7-Day Menu</strong>
           to create a rule-validated weekly meal plan from the Excel database.</p>
      </div>`;
    if (bottomGrid) bottomGrid.style.display = 'none';
    return;
  }

  // Build all 7 day columns
  const html = menu.map(day => `
    <div class="fmp-day-column">
      <div class="fmp-day-header">
        <span class="fmp-day-name">${day.dayLabel}</span>
        <span class="fmp-day-source">Wk ${day.sourceWeek}</span>
      </div>
      ${fmpRenderMealCard('Breakfast', 'breakfast', day.data.breakfast)}
      ${fmpRenderMealCard('Lunch',     'lunch',     day.data.lunch)}
      ${fmpRenderMealCard('Snacks',    'snacks',    day.data.snacks)}
      ${fmpRenderMealCard('Dinner',    'dinner',    day.data.dinner)}
    </div>`).join('');

  // Activate grid layout BEFORE injecting HTML
  container.classList.add('has-menu');
  container.innerHTML = html;

  // Show bottom grid
  if (bottomGrid) bottomGrid.style.display = 'grid';

  // Scroll the grid into view smoothly
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ============================================================
   SECTION 9 — RENDERING: VALIDATION PANEL
   ============================================================ */
function fmpRenderValidation(result) {
  const panel = document.getElementById('fmp-validation');
  if (!panel || !result) return;

  const statusClass = result.pass ? 'fmp-val-pass' : 'fmp-val-fail';
  const issues = [...result.errors, ...result.warns];

  panel.innerHTML = `
    <div class="fmp-val-summary ${statusClass}">
      <span class="fmp-val-icon">${result.pass ? (result.warns.length ? '⚠️' : '✅') : '❌'}</span>
      <span>${result.summary}</span>
    </div>
    ${issues.length ? `
      <div class="fmp-val-issues">
        ${issues.map(iss => `
          <div class="fmp-val-issue fmp-val-${iss.type}">
            <span class="fmp-val-badge">${iss.rule}</span>
            <span>${iss.detail}</span>
          </div>`).join('')}
      </div>` : ''}`;
}

/* ============================================================
   SECTION 10 — RENDERING: STATS BAR
   ============================================================ */
function fmpUpdateStats(menu, validation) {
  const safeSet = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  if (!menu) return;
  const totalDishes = menu.reduce((n, d) => n + fmpGetAllDishes(d.data).length, 0);
  const allDals     = menu.flatMap(d => fmpGetDals(d.data));
  const uniqueDals  = new Set(allDals.map(fmpNorm)).size;
  safeSet('fmp-stat-days',    menu.length);
  safeSet('fmp-stat-dishes',  totalDishes);
  safeSet('fmp-stat-dals',    uniqueDals);
  safeSet('fmp-stat-issues',  validation ? validation.totalIssues : 0);
}

/* ============================================================
   SECTION 11 — RENDERING: INGREDIENT TRACKER
   ============================================================ */
function fmpRenderIngTracker(menu) {
  const container = document.getElementById('fmp-ing-tracker');
  if (!container || !menu) return;

  const freqMap = fmpTrackIngredients(menu);
  const maxFreq = freqMap[0]?.[1] || 1;

  container.innerHTML = freqMap.map(([item, count]) => `
    <div class="fmp-ing-row">
      <div class="fmp-ing-name">${item.replace(/\b\w/g, c => c.toUpperCase())}</div>
      <div class="fmp-ing-bar-wrap">
        <div class="fmp-ing-bar" style="width:${Math.round(count/maxFreq*100)}%"></div>
      </div>
      <div class="fmp-ing-count">${count}×</div>
    </div>`).join('');
}

/* ============================================================
   SECTION 12 — MAIN ORCHESTRATOR: GENERATE & RENDER
   ============================================================ */
function fmpGenerate() {
  const btn = document.getElementById('fmp-gen-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating…'; }

  setTimeout(() => {
    const menu       = fmpGenerateMenu(fmpBrand);
    const validation = fmpValidateMenu(menu);

    fmpRenderWeeklyTable(menu);
    fmpRenderValidation(validation);
    fmpUpdateStats(menu, validation);
    fmpRenderIngTracker(menu);

    if (btn) { btn.disabled = false; btn.textContent = '🔄 Regenerate Menu'; }
  }, 400);
}

function fmpSetBrand(brand) {
  fmpBrand = brand;
  // Reset history on brand switch
  fmpDishHistory = [];
  fmpDalHistory  = [];
  fmpCurrentMenu = null;
  fmpRenderWeeklyTable(null); // resets to empty state, removes has-menu class
  const errBanner = document.getElementById('fmp-error-banner');
  if (errBanner) errBanner.style.display = 'none';
  // Update theme
  const wrap = document.getElementById('fmpDash');
  if (wrap) {
    wrap.setAttribute('data-brand', brand);
  }
}

/* ============================================================
   SECTION 13 — EXPORT: PDF (jsPDF)
   ============================================================ */
function fmpExportPDF() {
  if (!fmpCurrentMenu) { alert('Please generate a menu first.'); return; }
  if (!window.jspdf) { alert('PDF library not loaded. Please check your internet connection.'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const brandName = fmpBrand.toUpperCase();
  const DAYS  = fmpCurrentMenu.map(d => d.dayLabel);
  const meals = ['Breakfast','Lunch','Snacks','Dinner'];

  // Title
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, 297, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${brandName} — 7-Day Weekly Menu Plan`, 148.5, 13, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  let y = 28;
  const colW = 38, rowH = 40, labelW = 24;

  // Header row
  doc.setFillColor(240, 242, 245);
  doc.rect(labelW, y - 6, colW * 7, 10, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  DAYS.forEach((day, i) => {
    doc.text(day, labelW + colW * i + colW / 2, y, { align: 'center' });
  });
  y += 6;

  // Meal rows
  fmpCurrentMenu.forEach((dayEntry, di) => {
    meals.forEach((mealName, mi) => {
      const mx = labelW + colW * di;
      const my = y + rowH * mi;

      if (di === 0) {
        // Meal label
        doc.setFillColor(248, 249, 250);
        doc.rect(0, my, labelW - 1, rowH, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text(mealName, labelW / 2, my + rowH / 2, { align: 'center' });
      }

      const data  = dayEntry.data[mealName.toLowerCase()];
      const lines = [];
      if (mealName === 'Breakfast') {
        if (data.hot1)    lines.push(data.hot1);
        if (data.hot2)    lines.push(data.hot2);
        if (data.beverage) lines.push(data.beverage);
      } else if (mealName === 'Lunch' || mealName === 'Dinner') {
        if (data.dal)    lines.push('🫘 ' + data.dal);
        if (data.veg1)   lines.push(data.veg1);
        if (data.veg2)   lines.push(data.veg2);
        if (data.rice)   lines.push(data.rice);
      } else if (mealName === 'Snacks') {
        if (data.snack)  lines.push(data.snack);
        if (data.beverage) lines.push(data.beverage);
      }

      doc.setDrawColor(220, 220, 220);
      doc.rect(mx, my, colW, rowH);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(40, 40, 40);
      lines.slice(0, 5).forEach((line, li) => {
        const txt = doc.splitTextToSize(line, colW - 3);
        doc.text(txt[0], mx + 1.5, my + 5 + li * 7);
      });
    });
  });

  const validation = fmpValidateMenu(fmpCurrentMenu);
  if (validation) {
    const footerY = y + rowH * 4 + 8;
    doc.setFontSize(8);
    doc.setTextColor(validation.pass ? 22 : 185, validation.pass ? 163 : 28, validation.pass ? 74 : 28);
    doc.text(validation.summary, 148.5, footerY, { align: 'center' });
  }

  doc.save(`${brandName}_Weekly_Menu.pdf`);
}

/* ============================================================
   SECTION 14 — EXPORT: EXCEL (SheetJS)
   ============================================================ */
function fmpExportExcel() {
  if (!fmpCurrentMenu) { alert('Please generate a menu first.'); return; }
  if (!window.XLSX) { alert('Excel library not loaded. Please check your internet connection.'); return; }

  const rows = [['Day', 'Meal', 'Dal', 'Main Veg 1', 'Main Veg 2', 'Rice', 'Breads', 'Extras']];

  fmpCurrentMenu.forEach(day => {
    const d = day.data;

    rows.push([
      day.dayLabel, 'Breakfast',
      '—',
      d.breakfast.hot1 || '—',
      d.breakfast.hot2 || '—',
      '—',
      '—',
      [d.breakfast.chutney, d.breakfast.fruits, d.breakfast.beverage].filter(Boolean).join(' | ')
    ]);

    rows.push([
      day.dayLabel, 'Lunch',
      d.lunch.dal || '—',
      d.lunch.veg1 || '—',
      d.lunch.veg2 || '—',
      d.lunch.rice || '—',
      d.lunch.breads || '—',
      [d.lunch.curd, d.lunch.desert, d.lunch.pickle].filter(Boolean).join(' | ')
    ]);

    rows.push([
      day.dayLabel, 'Snacks',
      '—',
      d.snacks.snack || '—',
      '—', '—', '—',
      [d.snacks.chutney, d.snacks.beverage].filter(Boolean).join(' | ')
    ]);

    rows.push([
      day.dayLabel, 'Dinner',
      d.dinner.dal || '—',
      d.dinner.veg1 || '—',
      d.dinner.veg2 || '—',
      d.dinner.rice || '—',
      d.dinner.breads || '—',
      [d.dinner.desert, d.dinner.pickle, d.dinner.milk].filter(Boolean).join(' | ')
    ]);
  });

  const wb  = XLSX.utils.book_new();
  const ws  = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 11 }, { wch: 22 }, { wch: 24 },
    { wch: 22 }, { wch: 18 }, { wch: 20 }, { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Weekly Menu');

  // Ingredient Summary sheet
  const ingFreq = fmpTrackIngredients(fmpCurrentMenu);
  const ingRows = [['Dish / Item', 'Frequency (days)'], ...ingFreq.map(([k, v]) => [
    k.replace(/\b\w/g, c => c.toUpperCase()), v
  ])];
  const wsIng = XLSX.utils.aoa_to_sheet(ingRows);
  wsIng['!cols'] = [{ wch: 28 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsIng, 'Item Frequency');

  XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  XLSX.writeFile(wb, `${fmpBrand.toUpperCase()}_Weekly_Menu.xlsx`);
}

/* ============================================================
   SECTION 15 — SUB-TAB NAVIGATION (within Food Dashboard)
   ============================================================ */
function fmpSwitchSubTab(tabId) {
  document.querySelectorAll('.fmp-subtab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.fmp-subnav-btn').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  const btn = document.querySelector(`[data-subtab="${tabId}"]`);
  if (btn) btn.classList.add('active');
}

/* ============================================================
   SECTION 16 — INIT
   ============================================================ */
function fmpInit() {
  fmpBuildPool();

  // Brand toggle sync
  const brandSel = document.getElementById('fmp-brand-sel');
  if (brandSel) {
    brandSel.addEventListener('change', () => fmpSetBrand(brandSel.value));
  }

  // Generate button
  const genBtn = document.getElementById('fmp-gen-btn');
  if (genBtn) genBtn.addEventListener('click', fmpGenerate);

  // Export buttons
  const pdfBtn  = document.getElementById('fmp-pdf-btn');
  const xlsxBtn = document.getElementById('fmp-xlsx-btn');
  if (pdfBtn)  pdfBtn.addEventListener('click',  fmpExportPDF);
  if (xlsxBtn) xlsxBtn.addEventListener('click', fmpExportExcel);

  // Initial empty state
  fmpRenderWeeklyTable(null);
}

// Auto-init after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fmpInit);
} else {
  fmpInit();
}
