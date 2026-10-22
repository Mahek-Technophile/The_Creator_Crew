@echo off
setlocal
cd /d "%~dp0"
set PORT=%1
if "%PORT%"=="" set PORT=8080
title The Creator Crew

where py >nul 2>nul
if %errorlevel%==0 ( py server.py %PORT% & goto :end )

where python >nul 2>nul
if %errorlevel%==0 ( python server.py %PORT% & goto :end )

where node >nul 2>nul
if %errorlevel%==0 ( node server.js %PORT% & goto :end )

echo.
echo  Python or Node.js is required to run this.
echo  Install Python from https://www.python.org/downloads/  (tick "Add Python to PATH")
echo  then double-click start.bat again.
echo.
:end
pause
