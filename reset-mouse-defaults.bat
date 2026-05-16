@echo off
setlocal

REM ============================================================
REM  Reset Windows 11 mouse to factory defaults
REM  - Imports HKCU\Control Panel\Mouse defaults
REM  - Refreshes the active session via SystemParametersInfo
REM  - Restarts Explorer so the cursor curve reloads immediately
REM ============================================================

echo.
echo === Mouse Defaults Reset ===
echo This will restore Windows 11 default mouse sensitivity,
echo acceleration curves, and double-click settings.
echo.
pause

REM --- Locate the .reg file next to this script ---
set "REG_FILE=%~dp0reset-mouse-defaults.reg"

if not exist "%REG_FILE%" (
    echo [ERROR] Could not find reset-mouse-defaults.reg next to this script.
    echo Expected at: %REG_FILE%
    echo.
    pause
    exit /b 1
)

echo Importing registry defaults...
reg import "%REG_FILE%"
if errorlevel 1 (
    echo [ERROR] Registry import failed. Try running this .bat as Administrator.
    pause
    exit /b 1
)

echo.
echo Applying mouse speed to the current session (SystemParametersInfo)...

REM SPI_SETMOUSESPEED = 0x0071 ; value 10 = middle notch (default)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Add-Type -MemberDefinition '[DllImport(\"user32.dll\")] public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, uint pvParam, uint fWinIni);' -Name N -Namespace W;" ^
  "[W.N]::SystemParametersInfo(0x0071, 0, 10, 3) | Out-Null;" ^
  "[W.N]::SystemParametersInfo(0x0004, 0, 0, 3) | Out-Null"

REM SPI_SETMOUSE (0x0004) reloads MouseThreshold1/2 + MouseSpeed (acceleration on/off)

echo.
echo Restarting Explorer so the new cursor curves take effect...
taskkill /f /im explorer.exe >nul 2>&1
timeout /t 1 /nobreak >nul
start "" explorer.exe

echo.
echo === Done ===
echo Mouse settings have been reset to Windows defaults.
echo If anything still feels off, sign out and back in (or reboot) for a clean slate.
echo.
pause
endlocal
