@echo off
REM Hospital Management System - Quick Start Script
REM This script will start both server and client with better error handling

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Hospital Management System - Startup
echo ========================================
echo.

REM Get the project root directory
set "projectDir=%~dp0"
echo Project Directory: %projectDir%

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

echo ✓ npm found:
npm --version
echo.

REM Start Backend Server
echo Starting Backend Server...
echo Please WAIT for "Server running on port 5000" message...
echo.
start "Hospital Management - Backend Server" cmd /k "cd /d "%projectDir%" && npm run server"

REM Wait for server to start
timeout /t 5 /nobreak >nul

REM Start Frontend Client
echo Starting Frontend Client...
echo Please WAIT for "Compiled successfully!" message...
echo.
start "Hospital Management - Frontend Client" cmd /k "cd /d "%projectDir%client" && npm start"

REM Wait for client to compile
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Starting Application...
echo ========================================
echo.
echo BACKEND SERVER:  http://localhost:5000
echo FRONTEND CLIENT: http://localhost:3000
echo.
echo Opening browser in 5 seconds...
echo.

REM Wait a bit then open browser
timeout /t 5 /nobreak >nul

REM Try to open browser
start http://localhost:3000

echo.
echo ✓ If you see a login page in your browser, you're good!
echo.
echo IF YOU GET ERROR:
echo 1. Check both terminal windows for error messages
echo 2. Make sure MongoDB connection works
echo 3. Verify ports 3000 and 5000 are not in use
echo.
echo Need help? Check SIGNIN_FIX.md in the project folder
echo.
pause
