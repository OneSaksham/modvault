@echo off
setlocal enabledelayedexpansion
title ModVault - Push to GitHub
color 0A

echo ===================================================
echo     ModVault GitHub Push Utility
echo     Architect: Saksham
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Git repository initialization...
if not exist ".git" (
    echo Initializing fresh Git repository...
    git init
    git branch -M main
) else (
    echo Existing Git repository detected.
)

echo.
echo [2/4] Staging clean files (excluding node_modules and binaries)...
git add .

echo.
echo [3/4] Creating initial commit...
git commit -m "feat: initial production release of ModVault v1.0.0"

echo.
echo [4/4] Remote Repository Setup:
set "DEFAULT_REMOTE=https://github.com/saksham-kumar1621/Minecraft-Mod-Installer.git"
echo Default Remote: !DEFAULT_REMOTE!
echo.
set /p "USER_REMOTE=Enter GitHub repository URL (press Enter to use default): "

if "!USER_REMOTE!"=="" (
    set "TARGET_REMOTE=!DEFAULT_REMOTE!"
) else (
    set "TARGET_REMOTE=!USER_REMOTE!"
)

git remote remove origin 2>nul
git remote add origin !TARGET_REMOTE!

echo.
echo Pushing to !TARGET_REMOTE! on branch main...
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ===================================================
    echo  SUCCESS: ModVault repository pushed to GitHub!
    echo ===================================================
) else (
    echo ===================================================
    echo  Push failed or requires credentials / authentication.
    echo  Run 'git push -u origin main' manually if needed.
    echo ===================================================
)

pause

