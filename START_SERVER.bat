@echo off
echo ========================================
echo Starting Hospital Management System
echo ========================================
echo.
echo Step 1: Starting Backend Server...
echo.
start "Backend Server" cmd /k "npm run server"
timeout /t 3 /nobreak >nul
echo.
echo Step 2: Starting Frontend Client...
echo.
start "Frontend Client" cmd /k "npm run client"
echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Wait for both to start, then open:
echo http://localhost:3000
echo.
pause

