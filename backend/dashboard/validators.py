"""
dashboard/validators.py
═══════════════════════════════════════════════════════════════
STRICT BRAND-ISOLATED MENU GENERATION ENGINE
═══════════════════════════════════════════════════════════════

CRITICAL RULES (HARD CONSTRAINTS — NEVER VIOLATED):
1. Only dishes belonging to the selected brand are used.
2. UNILIV dishes NEVER appear in HUDDLE menus.
3. HUDDLE dishes NEVER appear in UNILIV menus.
4. Every dish is validated against brand before use.
5. If a category has no valid dish → raise error, never auto-fill.
6. Zero cross-brand contamination enforced at three layers:
   Layer 1 — DB query  : filter(brand=brand) at source
   Layer 2 — Pool build: _validate_pool() checks every dish
   Layer 3 — Pick time : _validate_pick() checks before use
"""
from __future__ import annotations
from datetime import date, timedelta
from .models import Dish


# ── Helpers ───────────────────────────────────────────────────────────────────
def _is_aloo(name: str) -> bool:
    return any(w in (name or '').lower() for w in ['aloo', 'potato', 'alu '])


NON_VEG = [
    'chicken','mutton','beef','pork','fish','prawn','shrimp','lamb',
    'egg','eggs','turkey','bacon','ham','meat','tuna','salmon','crab',
    'lobster','squid','seafood','pepperoni','sausage','meatball',
]

VALID_BRANDS = {'uniliv', 'huddle'}


class ValidationError(Exception):
    """Raised when any rule is violated. Message shown directly to user."""
    pass


class BrandContaminationError(ValidationError):
    """Raised when a dish from the wrong brand is detected."""
    pass


# ── Single dish validation (called on POST /api/add-dish/) ────────────────────
def validate_dish(dish_name: str, meal_type: str, brand: str):
    """Validates a new dish before saving. Raises ValidationError on failure."""
    nl = (dish_name or '').strip().lower()
    if not nl:
        raise ValidationError('Dish name cannot be empty.')
    if brand not in VALID_BRANDS:
        raise ValidationError(f'Invalid brand "{brand}". Must be uniliv or huddle.')
    if any(w in nl for w in NON_VEG):
        raise ValidationError('Only vegetarian meals are allowed.')
    cutoff = date.today() - timedelta(days=15)
    if Dish.objects.filter(
        dish_name__iexact=dish_name.strip(),
        brand=brand,
        created_at__date__gte=cutoff
    ).exists():
        raise ValidationError(f'Dish already used within last 15 days: "{dish_name}".')


# ── Brand-isolated menu rule engine ───────────────────────────────────────────
class MenuRuleEngine:
    """
    Generates a validated 15-day, 4-meal menu.

    BRAND ISOLATION GUARANTEE:
    • Constructor accepts only dishes pre-filtered by brand (Layer 1).
    • _validate_pool() re-checks every dish in every pool (Layer 2).
    • _validate_pick() re-checks every dish before it enters the menu (Layer 3).
    • Any contamination at any layer raises BrandContaminationError immediately.

    MEAL RULES:
    • Vegetarian only
    • Dal mandatory every Lunch & Dinner
    • No Dal repeated within 7 days (separate Lunch/Dinner windows)
    • No Breakfast/Star dish repeated within 15 days
    • Aloo max once per day, max 5× per 7-day week
    • Star Dish mandatory every Lunch & Dinner
    """

    def __init__(self, brand: str, dishes_qs):
        if brand not in VALID_BRANDS:
            raise ValidationError(f'Invalid brand: "{brand}". Must be uniliv or huddle.')

        self.brand = brand

        # Layer 1: DB query already filtered by brand — build pools
        self.bfs     = list(dishes_qs.filter(meal_type='Breakfast'))
        self.snacks  = list(dishes_qs.filter(meal_type='Snacks'))
        self.l_dals  = list(dishes_qs.filter(meal_type='Lunch',  is_dal=True))
        self.l_stars = list(dishes_qs.filter(meal_type='Lunch',  is_star=True, is_dal=False))
        self.l_mains = list(dishes_qs.filter(meal_type='Lunch',  is_dal=False, is_star=False))
        self.d_dals  = list(dishes_qs.filter(meal_type='Dinner', is_dal=True))
        self.d_stars = list(dishes_qs.filter(meal_type='Dinner', is_star=True, is_dal=False))
        self.d_mains = list(dishes_qs.filter(meal_type='Dinner', is_dal=False, is_star=False))

        # Layer 2: Validate every dish in every pool
        for pool_name, pool in [
            ('Breakfast',        self.bfs),
            ('Snacks',           self.snacks),
            ('Lunch Dal',        self.l_dals),
            ('Lunch Star',       self.l_stars),
            ('Lunch Main',       self.l_mains),
            ('Dinner Dal',       self.d_dals),
            ('Dinner Star',      self.d_stars),
            ('Dinner Main',      self.d_mains),
        ]:
            self._validate_pool(pool, pool_name)

        # Rolling state
        self.used_bf    = set()
        self.used_bf2   = set()
        self.used_lstar = set()
        self.used_dstar = set()
        self.used_main  = set()
        self.used_snack = set()
        self.ldal_hist  = []
        self.ddal_hist  = []
        self.aloo_day   = {}
        self.aloo_week  = [0, 0, 0]

    # ── Layer 2: Pool validation ──────────────────────────────────────────────
    def _validate_pool(self, pool: list, pool_name: str):
        """Ensure every dish in pool belongs to self.brand."""
        for dish in pool:
            if dish.brand != self.brand:
                raise BrandContaminationError(
                    f'BRAND ISOLATION VIOLATION: Dish "{dish.dish_name}" '
                    f'belongs to {dish.brand.upper()} but was found in '
                    f'{self.brand.upper()} {pool_name} pool. '
                    f'This dish has been blocked.'
                )

    # ── Layer 3: Pick-time validation ────────────────────────────────────────
    def _validate_pick(self, dish: Dish | None) -> Dish | None:
        """Hard block: if dish brand != self.brand, raise immediately."""
        if dish is None:
            return None
        if dish.brand != self.brand:
            raise BrandContaminationError(
                f'CRITICAL: Dish "{dish.dish_name}" from {dish.brand.upper()} '
                f'attempted to enter {self.brand.upper()} menu. Blocked.'
            )
        return dish

    # ── Pick helpers ──────────────────────────────────────────────────────────
    def _n(self, s: str) -> str:
        return (s or '').strip().lower()

    def _pick(self, pool: list, used: set, day: int) -> Dish | None:
        import random
        cands = [d for d in pool if self._n(d.dish_name) not in used]
        random.shuffle(cands)
        for d in cands:
            if _is_aloo(d.dish_name):
                if self.aloo_day.get(day, 0) >= 1: continue
                if self.aloo_week[(day - 1) // 7] >= 5: continue
            return self._validate_pick(d)   # Layer 3
        return None

    def _pick_dal(self, pool: list, hist: list) -> Dish | None:
        import random
        window = {self._n(d) for d in hist[-7:]}
        cands  = [d for d in pool if self._n(d.dish_name) not in window]
        random.shuffle(cands)
        picked = cands[0] if cands else None
        return self._validate_pick(picked)  # Layer 3

    def _reg(self, dish: Dish | None, day: int,
             used: set | None = None, dal_hist: list | None = None):
        if not dish: return
        if used is not None:     used.add(self._n(dish.dish_name))
        if dal_hist is not None: dal_hist.append(dish.dish_name)
        if _is_aloo(dish.dish_name):
            self.aloo_day[day] = self.aloo_day.get(day, 0) + 1
            self.aloo_week[(day - 1) // 7] += 1

    # ── Preflight ─────────────────────────────────────────────────────────────
    def _preflight(self):
        errs = []
        if len(self.bfs)     < 15:
            errs.append(f'Need ≥15 Breakfast dishes for {self.brand.upper()} (have {len(self.bfs)}). '
                        'Add dishes in Dish Collector → Brand: ' + self.brand.upper())
        if len(self.l_dals)  < 8:
            errs.append(f'Need ≥8 Lunch Dal dishes for {self.brand.upper()} (have {len(self.l_dals)}).')
        if len(self.l_stars) < 15:
            errs.append(f'Need ≥15 ⭐ Star Lunch dishes for {self.brand.upper()} (have {len(self.l_stars)}).')
        if len(self.d_dals)  < 8:
            errs.append(f'Need ≥8 Dinner Dal dishes for {self.brand.upper()} (have {len(self.d_dals)}).')
        if len(self.d_stars) < 15:
            errs.append(f'Need ≥15 ⭐ Star Dinner dishes for {self.brand.upper()} (have {len(self.d_stars)}).')
        if errs:
            raise ValidationError(
                f'Cannot generate {self.brand.upper()} 15-day menu:\n• ' +
                '\n• '.join(errs)
            )

    # ── Main generate ─────────────────────────────────────────────────────────
    def generate(self) -> list[dict]:
        """
        Generate a 15-day, 4-meal menu.
        All dishes are validated against self.brand at three layers.
        Raises ValidationError or BrandContaminationError on any violation.
        """
        self._preflight()
        days  = []
        today = date.today()

        for n in range(1, 16):
            label = (today + timedelta(days=n - 1)).strftime('%a, %d %b')

            # ── Breakfast ───────────────────────────────────────
            bf = self._pick(self.bfs, self.used_bf, n)
            if not bf:
                raise ValidationError(
                    f'[{self.brand.upper()}] Not enough unique Breakfast dishes for Day {n}.')
            self._reg(bf, n, used=self.used_bf)

            bf2 = self._pick(self.bfs, self.used_bf2, n)
            if bf2: self._reg(bf2, n, used=self.used_bf2)

            # ── Lunch Dal ───────────────────────────────────────
            ld = self._pick_dal(self.l_dals, self.ldal_hist)
            if not ld:
                raise ValidationError(
                    f'[{self.brand.upper()}] Dal is mandatory in Lunch — '
                    f'no valid dal for Day {n}. '
                    f'Same Dal cannot be repeated within 7 days. '
                    f'Add more {self.brand.upper()} Lunch Dal dishes.')
            self._reg(ld, n, dal_hist=self.ldal_hist)

            # ── Lunch Star ──────────────────────────────────────
            ls = self._pick(self.l_stars, self.used_lstar, n)
            if not ls:
                raise ValidationError(
                    f'[{self.brand.upper()}] Star Dish required in Lunch — '
                    f'none available for Day {n}. '
                    f'Mark more {self.brand.upper()} Lunch dishes as ⭐ Star.')
            self._reg(ls, n, used=self.used_lstar)

            # ── Lunch Main (optional) ────────────────────────────
            lm = self._pick(self.l_mains, self.used_main, n)
            if lm: self._reg(lm, n, used=self.used_main)

            # ── Snacks ──────────────────────────────────────────
            sn = self._pick(self.snacks, self.used_snack, n) if self.snacks else None
            if sn: self._reg(sn, n, used=self.used_snack)

            # ── Dinner Dal ──────────────────────────────────────
            dd = self._pick_dal(self.d_dals, self.ddal_hist)
            if not dd:
                raise ValidationError(
                    f'[{self.brand.upper()}] Dal is mandatory in Dinner — '
                    f'no valid dal for Day {n}. '
                    f'Same Dal cannot be repeated within 7 days.')
            self._reg(dd, n, dal_hist=self.ddal_hist)

            # ── Dinner Star ─────────────────────────────────────
            ds = self._pick(self.d_stars, self.used_dstar, n)
            if not ds:
                raise ValidationError(
                    f'[{self.brand.upper()}] Star Dish required in Dinner — '
                    f'none available for Day {n}.')
            self._reg(ds, n, used=self.used_dstar)

            # ── Dinner Main (optional) ───────────────────────────
            dm = self._pick(self.d_mains, self.used_main, n)
            if dm: self._reg(dm, n, used=self.used_main)

            # ── Final per-day brand audit ────────────────────────
            day_dishes = [bf, bf2, ld, ls, lm, sn, dd, ds, dm]
            for dish in day_dishes:
                if dish and dish.brand != self.brand:
                    raise BrandContaminationError(
                        f'FINAL AUDIT FAILED on Day {n}: '
                        f'"{dish.dish_name}" ({dish.brand.upper()}) '
                        f'found in {self.brand.upper()} menu.'
                    )

            days.append({
                'day_number':  n,
                'date_label':  label,
                'brand':       self.brand,
                'breakfast':   {'id': bf.pk,  'name': bf.dish_name},
                'breakfast2':  {'id': bf2.pk, 'name': bf2.dish_name} if bf2 else None,
                'lunch_dal':   {'id': ld.pk,  'name': ld.dish_name},
                'lunch_star':  {'id': ls.pk,  'name': ls.dish_name},
                'lunch_main':  {'id': lm.pk,  'name': lm.dish_name} if lm else None,
                'snack':       {'id': sn.pk,  'name': sn.dish_name} if sn else None,
                'dinner_dal':  {'id': dd.pk,  'name': dd.dish_name},
                'dinner_star': {'id': ds.pk,  'name': ds.dish_name},
                'dinner_main': {'id': dm.pk,  'name': dm.dish_name} if dm else None,
            })

        return days
