#!/bin/bash
# ================================================================
# Uniliv Dashboard Backend — One-command setup
# Run from inside the /backend folder:
#   cd backend && bash setup.sh
# ================================================================
set -e

echo ""
echo "========================================"
echo "  UNILIV BACKEND — SETUP"
echo "========================================"

# 1. Python virtual environment
echo ""
echo "▶ Creating virtual environment (venv)..."
python3 -m venv venv
source venv/bin/activate
echo "  ✅ venv ready ($(python --version))"

# 2. Dependencies
echo ""
echo "▶ Installing dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo "  ✅ Django + cors-headers installed"

# 3. Database migrations
echo ""
echo "▶ Applying database migrations..."
python manage.py migrate
echo "  ✅ db.sqlite3 ready"

# 4. Create superuser for admin panel
echo ""
echo "▶ Creating admin user..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@uniliv.com', 'admin123')
    print('  ✅ Admin created  → username: admin / password: admin123')
else:
    print('  ℹ  Admin already exists')
"

echo ""
echo "========================================"
echo "  SETUP COMPLETE"
echo "========================================"
echo ""
echo "  Start the backend:"
echo "    source venv/bin/activate"
echo "    python manage.py runserver"
echo ""
echo "  API will be available at:"
echo "    http://127.0.0.1:8000/api/dishes/"
echo "    http://127.0.0.1:8000/api/menu/generate/"
echo ""
echo "  Admin panel:"
echo "    http://127.0.0.1:8000/admin"
echo "    username: admin | password: admin123"
echo ""
