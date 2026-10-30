@echo off
title ModVault - Development Server
echo =======================================================
echo     MODVAULT: Minecraft Mod Installer & Manager
echo               Starting Development Mode
echo =======================================================
echo.
set ELECTRON_RUN_AS_NODE=
call npm run dev
pause
