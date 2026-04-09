# Stayopx Backend — PowerShell Setup
# If blocked: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  STAYOPX BACKEND - WINDOWS SETUP" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

try { python --version | Out-Null }
catch { Write-Host "[ERROR] Python not found. Install from python.org" -ForegroundColor Red; Read-Host; exit 1 }

Write-Host "[1/6] Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv
& "venv\Scripts\Activate.ps1"
Write-Host "       Done`n" -ForegroundColor Green

Write-Host "[2/6] Installing dependencies..." -ForegroundColor Yellow
python -m pip install --quiet --upgrade pip
python -m pip install -r requirements.txt
Write-Host "       Django + corsheaders + openpyxl installed`n" -ForegroundColor Green

Write-Host "[3/6] Running database migrations..." -ForegroundColor Yellow
python manage.py migrate
Write-Host "       db.sqlite3 ready`n" -ForegroundColor Green

Write-Host "[4/6] Importing dishes from Excel files..." -ForegroundColor Yellow
python manage.py import_excel
Write-Host ""

Write-Host "[5/6] Creating admin user..." -ForegroundColor Yellow
python manage.py shell -c @"
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin','admin@uniliv.com','admin123')
    print('  Created: admin / admin123')
else:
    print('  Admin already exists')
"@
Write-Host ""

Write-Host "==========================================`n" -ForegroundColor Green
Write-Host "  SETUP COMPLETE" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Green
Write-Host "  ⚠️  IMPORTANT: Mark Star Dishes in Admin:"
Write-Host "     http://127.0.0.1:8000/admin  (admin / admin123)"
Write-Host "     Set is_star=True for premium/special dishes`n"
Write-Host "  Start server:"
Write-Host "    venv\Scripts\activate"  -ForegroundColor Cyan
Write-Host "    python manage.py runserver`n" -ForegroundColor Cyan
Read-Host "Press Enter to close"
