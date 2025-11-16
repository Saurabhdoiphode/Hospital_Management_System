@echo off
REM A simple helper to commit and push this repository to your GitHub remote.
REM Make sure you set your GitHub credentials (or use Git Credential Manager)

cd /d "%~dp0"

echo Checking git status...
if not exist .git (
  echo Initializing repository...
  git init
) else (
  echo Repository already initialized.
)

echo Adding files...
git add .

set /p COMMITMSG="Enter commit message (default: Initial commit: Hospital Management System): "
if "%COMMITMSG%"=="" (
  set COMMITMSG=Initial commit: Hospital Management System
)

git commit -m "%COMMITMSG%"
REM Set the local commit author to your identity if not set globally
set /p AUTHORNAME="Enter your name for commits (leave blank to use git default): "
set /p AUTHOREMAIL="Enter your email for commits (leave blank to use git default): "
if not "%AUTHORNAME%"=="" (
  git config user.name "%AUTHORNAME%"
)
if not "%AUTHOREMAIL%"=="" (
  git config user.email "%AUTHOREMAIL%"
)

REM Add remote if not already set; if set, update URL
git remote add origin https://github.com/Saurabhdoiphode/Hospital_Management_System.git 2>nul || (
  echo remote exists, updating URL...
  git remote set-url origin https://github.com/Saurabhdoiphode/Hospital_Management_System.git
)

REM Ensure main branch
git branch -M main

REM Push with upstream
git push -u origin main

pause
