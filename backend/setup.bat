@echo off
echo.
echo ============================================
echo   STAYOPX / UNILIV BACKEND - WINDOWS SETUP
echo ============================================
echo.

python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found. Install from https://www.python.org/downloads/
    echo         Check "Add Python to PATH" during install.
    pause & exit /b 1
)
echo [1/6] Python OK
echo.

echo [2/6] Creating virtual environment...
python -m venv venv
call venv\Scripts\activate.bat
echo        venv\Scripts\activate — done
echo.

echo [3/6] Installing dependencies...
pip install --quiet --upgrade pip
pip install -r requirements.txt
echo        Django + corsheaders + openpyxl — done
echo.

echo [4/6] Database migrations...
python manage.py migrate
echo        db.sqlite3 ready
echo.

echo [5/6] Importing dishes from Excel files...
python manage.py import_excel
echo.

echo [6/6] Creating admin user (admin / admin123)...
python manage.py shell -c "from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin','admin@uniliv.com','admin123'); print('  Admin ready')"
echo.

echo ============================================
echo   SETUP COMPLETE
echo ============================================
echo.
echo   IMPORTANT: Mark Star Dishes in Admin Panel
echo   http://127.0.0.1:8000/admin  (admin / admin123)
echo.
echo   To START the server:
echo     venv\Scripts\activate
echo     python manage.py runserver
echo.
echo   API endpoints:
echo     GET  http://127.0.0.1:8000/api/dishes/
echo     POST http://127.0.0.1:8000/api/add-dish/
echo     POST http://127.0.0.1:8000/api/menu/generate/
echo.
pause
