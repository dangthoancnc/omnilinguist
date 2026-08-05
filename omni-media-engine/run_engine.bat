@echo off
title Omni Media Engine - AI Backend
echo =========================================
echo OMNI MEDIA ENGINE INITIALIZATION
echo =========================================

cd /d "%~dp0"

echo [*] Don dep tien trinh cu (Port 8000)...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| find ":8000" ^| find "LISTENING"') DO (
    echo [*] Dang tat tien trinh cu PID %%a de chong trung dia chi...
    taskkill /F /PID %%a >nul 2>&1
)

:: Kiem tra local venv
IF NOT EXIST ".venv" (
    echo [*] Dang tao moi truong ao bang uv...
    uv venv
)

echo [*] Cai dat module vao root venv...
uv pip install -r requirements.txt

echo [*] Starting FastAPI Server...
uv run main.py

pause
