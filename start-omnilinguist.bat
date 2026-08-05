@echo off
color 0b

echo ===================================================
echo     OMNILINGUIST - SUPER APP INIT
echo ===================================================
echo.

cd /d "%~dp0"

echo [*] Don dep tien trinh cu (Port 5173, 8000)...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| find ":8000" ^| find "LISTENING"') DO taskkill /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| find ":5173" ^| find "LISTENING"') DO taskkill /F /PID %%a >nul 2>&1

echo [INFO] Server Media Engine se duoc khoi dong tu giao dien khi can thiet (UI Start).
:: cd /d "%~dp0omni-media-engine"
:: start "Omni Media Engine" cmd /k "run_engine.bat"

echo.
echo DANG KHOI DONG SERVER REACT (FRONTEND)...
cd /d "%~dp0"

if exist "node_modules" goto SKIP_NPM
echo [INFO] Cai dat thu vien (npm install)...
call npm install
if errorlevel 1 goto ERR_NPM

:SKIP_NPM
start "" "http://localhost:5173"
call npm run dev -- --force
pause
exit /b 0

:ERR_NPM
echo [LOI] npm install that bai!
pause
exit /b 1
