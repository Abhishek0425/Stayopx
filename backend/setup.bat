@echo off
echo.
echo ============================================================
echo   STAYOPX / UNILIV BACKEND — WINDOWS SETUP
echo ============================================================
echo.

python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found.
    echo         Install from https://www.python.org/downloads/
    echo         Tick "Add Python to PATH" during install.
    pause & exit /b 1
)
echo [1/6] Python OK
echo.

echo [2/6] Creating virtual environment...
python -m venv venv
call venv\Scripts\activate.bat
echo       venv activated
echo.

echo [3/6] Installing dependencies...
pip install --quiet --upgrade pip
pip install -r requirements.txt
echo       All packages installed
echo.

echo [4/6] Running database migrations...
python manage.py makemigrations
python manage.py migrate
echo       Tables created in Supabase / SQLite
echo.

echo [5/6] Seeding dishes + creating user accounts...
python seed_db.py
echo.

echo [6/6] Verifying setup...
python manage.py check
echo.

echo ============================================================
echo   SETUP COMPLETE
echo ============================================================
echo.
echo   LOGIN CREDENTIALS:
echo   admin          / admin123   -^> Both dashboards
echo   property_admin / prop123    -^> Property dashboard only
echo   food_uniliv    / food123    -^> Food dashboard (UNILIV)
echo   food_huddle    / huddle123  -^> Food dashboard (HUDDLE)
echo.
echo   Admin panel:
echo   http://127.0.0.1:8000/admin  (admin / admin123)
echo.
echo   To START the server:
echo     venv\Scripts\activate
echo     python manage.py runserver
echo.
echo   API endpoints:
echo     GET  http://127.0.0.1:8000/api/dishes/
echo     POST http://127.0.0.1:8000/api/auth/login/
echo     POST http://127.0.0.1:8000/api/menu/generate/
echo.
pause
