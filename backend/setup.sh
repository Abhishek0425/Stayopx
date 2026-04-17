#!/bin/bash
# ================================================================
# Stayopx / UNILIV Backend — One-command setup (Mac / Linux)
# Run from inside the backend/ folder:
#   cd backend && bash setup.sh
# ================================================================
set -e

echo ""
echo "============================================================"
echo "  STAYOPX / UNILIV BACKEND — SETUP"
echo "============================================================"

# 1. Virtual environment
echo ""
echo "▶ [1/6] Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate
echo "  ✅ venv ready ($(python --version))"

# 2. Dependencies
echo ""
echo "▶ [2/6] Installing dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo "  ✅ All packages installed"

# 3. Migrations
echo ""
echo "▶ [3/6] Running database migrations..."
python manage.py makemigrations
python manage.py migrate
echo "  ✅ Tables ready"

# 4. Seed dishes + users
echo ""
echo "▶ [4/6] Seeding dishes + creating user accounts..."
python seed_db.py

# 5. Verify
echo ""
echo "▶ [5/6] Verifying setup..."
python manage.py check
echo "  ✅ No issues found"

echo ""
echo "============================================================"
echo "  SETUP COMPLETE"
echo "============================================================"
echo ""
echo "  LOGIN CREDENTIALS:"
echo "  admin          / admin123   → Both dashboards"
echo "  property_admin / prop123    → Property dashboard only"
echo "  food_uniliv    / food123    → Food dashboard (UNILIV)"
echo "  food_huddle    / huddle123  → Food dashboard (HUDDLE)"
echo ""
echo "  Admin panel:"
echo "  http://127.0.0.1:8000/admin  (admin / admin123)"
echo ""
echo "  To START the server:"
echo "    source venv/bin/activate"
echo "    python manage.py runserver"
echo ""
echo "  API endpoints:"
echo "    GET  http://127.0.0.1:8000/api/dishes/"
echo "    POST http://127.0.0.1:8000/api/auth/login/"
echo "    POST http://127.0.0.1:8000/api/menu/generate/"
echo ""
