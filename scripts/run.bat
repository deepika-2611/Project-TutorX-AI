@echo off
title TutorX AI Local Launcher
echo ===================================================
echo   TutorX AI - AI-Powered Learning Platform
echo ===================================================
echo.
echo Starting API server on port 8787...
start "TutorX AI API" cmd /k "cd /d %~dp0.. && npm run api"

echo.
echo Starting Vite frontend on port 5173...
echo The Vite dev server proxies /api requests to the API server.
echo.
start "TutorX AI Frontend" cmd /k "cd /d %~dp0.. && npm run dev -- --host 127.0.0.1"

echo.
echo Launching your web browser...
start http://127.0.0.1:5173

pause
