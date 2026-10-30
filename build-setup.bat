@echo off
title ModVault - Windows Setup Builder
echo =======================================================
echo     MODVAULT: Minecraft Mod Installer & Manager
echo           Packaging Windows Setup.exe
echo =======================================================
echo.
set ELECTRON_RUN_AS_NODE=

echo [1/2] Compiling TypeScript and Vite Production Bundles...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build compilation failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Generating Windows NSIS Installer (.exe) and Portable Binary...
call npx electron-builder --win --x64
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Installer packaging failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =======================================================
echo   BUILD COMPLETED SUCCESSFULLY!
echo   Installer location: .\release\ModVault Setup 1.0.0.exe
echo =======================================================
echo.
pause
