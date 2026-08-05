@echo off
title Omni Media Engine Launcher
echo ===================================================
echo     OMNI MEDIA ENGINE LAUNCHER
echo ===================================================

cd /d "%~dp0omni-media-engine"
start "Omni Media Engine" cmd /k "run_engine.bat"
exit /b 0
