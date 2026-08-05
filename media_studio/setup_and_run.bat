@echo off
setlocal

echo ========================================================
echo KHOI CHAY MEDIA STUDIO (Smart Boot - Disk Saved)
echo ========================================================

:: Kiem tra root venv cua he thong
IF NOT EXIST "G:\AntiGravity\.venv" (
    echo [*] Dang tao moi truong ao root bang uv...
    cd /d "G:\AntiGravity"
    uv venv
    cd /d "%~dp0"
)

echo Dang cai dat thu vien neu thieu...
uv pip install -r requirements.txt

echo [*] He thong san sang! Dang khoi chay Media Studio WebUI...
uv run app.py
pause