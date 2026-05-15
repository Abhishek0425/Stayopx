@echo off
echo.
echo =====================================================
echo   STAYOPX — Food Ordering Module Fix
echo =====================================================
echo.

SET BASE=C:\Users\Administrator\Documents\Staylytics\Stayopx\backend
SET DASH=%BASE%\dashboard
SET PROJ=%BASE%\uniliv_project

REM ── Step 1: Copy models.py ───────────────────────────────────
echo [1/4] Copying models.py to dashboard\models.py ...
copy /Y "%~dp0models.py" "%DASH%\models.py"
IF %ERRORLEVEL% NEQ 0 (echo ERROR copying models.py & pause & exit /b 1)
echo   OK — dashboard\models.py updated

REM ── Step 2: Copy views.py ────────────────────────────────────
echo [2/4] Copying views.py to dashboard\views.py ...
copy /Y "%~dp0views.py" "%DASH%\views.py"
IF %ERRORLEVEL% NEQ 0 (echo ERROR copying views.py & pause & exit /b 1)
echo   OK — dashboard\views.py updated

REM ── Step 3: Copy dashboard_urls.py → dashboard\urls.py ──────
echo [3/4] Copying dashboard_urls.py to dashboard\urls.py ...
copy /Y "%~dp0dashboard_urls.py" "%DASH%\urls.py"
IF %ERRORLEVEL% NEQ 0 (echo ERROR copying urls.py & pause & exit /b 1)
echo   OK — dashboard\urls.py updated

REM ── Verify routes were copied ────────────────────────────────
echo.
echo Verifying food-ordering routes in dashboard\urls.py:
findstr /C:"food-ordering" "%DASH%\urls.py"
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: food-ordering routes NOT found in urls.py
    echo The file copy may have failed.
    pause & exit /b 1
)
echo   Routes confirmed!

REM ── Step 4: Run migrations ───────────────────────────────────
echo.
echo [4/4] Running migrations...
cd /d %BASE%
call venv\Scripts\activate.bat
python manage.py makemigrations dashboard
python manage.py migrate
IF %ERRORLEVEL% NEQ 0 (echo ERROR during migration & pause & exit /b 1)

echo.
echo =====================================================
echo   SUCCESS! Testing URL registration...
echo =====================================================
echo.
python manage.py shell -c "from django.urls import reverse; print('food-ordering URL OK:', reverse('fo_get_orders'))"
echo.
echo   Server starting...
echo   Test in browser:
echo   http://127.0.0.1:8000/api/food-ordering/orders/
echo   (Should show JSON, not HTML)
echo.
python manage.py runserver
