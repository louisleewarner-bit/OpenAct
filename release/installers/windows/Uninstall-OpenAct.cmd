@echo off
setlocal EnableExtensions
title Uninstall OpenAct
echo.
echo   This removes OpenAct from this computer.
echo.
echo   It also removes the scripts OpenAct kept inside its app window.
echo   Scripts you saved as .openact files, or exported, are not touched.
echo   If you have not saved a script to a file, open OpenAct first and use Save.
echo.
choice /C YN /M "  Remove OpenAct now"
if errorlevel 2 exit /b 0
powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -LiteralPath (Join-Path ([Environment]::GetFolderPath('Desktop')) 'OpenAct.lnk') -ErrorAction SilentlyContinue; Remove-Item -LiteralPath (Join-Path ([Environment]::GetFolderPath('Programs')) 'OpenAct') -Recurse -ErrorAction SilentlyContinue"
echo.
echo   OpenAct has been removed. Thank you for trying it.
rem This file lives in the folder being removed, so a hidden helper deletes the folder a moment after this window closes.
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep 2; Remove-Item -LiteralPath (Join-Path $env:LOCALAPPDATA 'OpenAct') -Recurse -Force -ErrorAction SilentlyContinue"
exit /b 0
