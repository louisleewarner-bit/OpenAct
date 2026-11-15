@echo off
setlocal EnableExtensions
title Install OpenAct
set "HERE=%~dp0"
set "DEST=%LOCALAPPDATA%\OpenAct"
echo.
echo   Installing OpenAct, the free script editor, for you only.
echo   Nothing is sent anywhere and no administrator rights are needed.
echo.
if not exist "%HERE%OpenAct.html" goto nofiles
if not exist "%HERE%installer\make-shortcuts.ps1" goto nofiles
if not exist "%DEST%" mkdir "%DEST%"
copy /Y "%HERE%OpenAct.html" "%DEST%\OpenAct.html" >nul || goto fail
copy /Y "%HERE%installer\OpenAct.ico" "%DEST%\OpenAct.ico" >nul || goto fail
copy /Y "%HERE%installer\Uninstall OpenAct.cmd" "%DEST%\Uninstall OpenAct.cmd" >nul || goto fail
copy /Y "%HERE%LICENSE" "%DEST%\LICENSE" >nul
set "BROWSER=none"
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
echo   Browser used for the app window: %BROWSER%
powershell -NoProfile -ExecutionPolicy Bypass -File "%HERE%installer\make-shortcuts.ps1" -Dest "%DEST%" -Browser "%BROWSER%" || goto fail
echo.
echo   Done. OpenAct is on your Desktop and in the Start menu.
echo   To remove it later: Start menu, OpenAct, Uninstall OpenAct.
echo.
start "" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\OpenAct\OpenAct.lnk"
pause
exit /b 0

:nofiles
echo   The installer can't find OpenAct.html next to it.
echo   Unzip the whole download first (right-click the zip, then Extract All), and run this again from the unzipped folder.
echo.
pause
exit /b 1

:fail
echo.
echo   Something went wrong while installing. Nothing was sent anywhere.
echo   You can still use OpenAct without installing: double-click OpenAct.html in the unzipped folder.
echo.
pause
exit /b 1
