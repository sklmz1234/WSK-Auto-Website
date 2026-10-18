@echo off
rem WSK dev environment stopper - double click to run.
rem Options: -Volumes (also delete data volumes); stop frontend terminals with Ctrl+C
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev-down.ps1" %*
echo.
pause
