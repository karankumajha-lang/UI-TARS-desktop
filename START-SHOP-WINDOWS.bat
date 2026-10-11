@echo off
setlocal
cd /d "%~dp0"
title Doky Dory shop
where node >nul 2>nul
if errorlevel 1 goto nonode
if not exist "node_modules\express\package.json" goto install

:run
node setup.js
if errorlevel 1 goto fail
node server.js --open
echo.
echo Shop band ho gayi.
pause
exit /b 0

:install
echo Pehli baar: shop ke zaroori parts download ho rahe hain. Is step ke liye internet chahiye...
call npm ci --omit=dev --no-audit --no-fund
if errorlevel 1 goto installfail
goto run

:nonode
echo Is computer par Node.js nahi hai.
echo https://nodejs.org se LTS version install karo, phir ye file dobara double-click karo.
pause
exit /b 1

:installfail
echo Download nahi hua. Internet check karo aur ye file dobara double-click karo.
pause
exit /b 1

:fail
pause
exit /b 1
