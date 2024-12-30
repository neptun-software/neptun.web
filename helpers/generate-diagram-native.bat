@echo off
setlocal EnableDelayedExpansion

REM Change to the project root directory
cd /d "%~dp0\.."

REM Check if pg_dump is available
echo Checking for PostgreSQL client tools...
where pg_dump >nul 2>&1
echo PostgreSQL check completed with status: %ERRORLEVEL%
if %ERRORLEVEL% neq 0 (
    echo PostgreSQL client tools not found.
    set /p INSTALL_PG="Would you like to install PostgreSQL client tools now? (Y/N): "
    if /i "!INSTALL_PG!"=="Y" (
        echo Checking for Chocolatey...
        where choco >nul 2>&1
        if !ERRORLEVEL! neq 0 (
            echo Installing Chocolatey...
            powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
        )
        
        echo Installing PostgreSQL client tools...
        choco install postgresql16 -y --force
        
        echo Updating PATH with PostgreSQL bin directory...
        setx PATH "A:\PostgreSQL\16\bin;%PATH%" /M
        set "PATH=A:\PostgreSQL\16\bin;%PATH%"
        
        echo Testing pg_dump installation...
        pg_dump --version
        if !ERRORLEVEL! neq 0 (
            echo Failed to setup PostgreSQL tools.
            pause
            exit /b 1
        )
    ) else (
        echo PostgreSQL tools installation cancelled.
        exit /b 1
    )
)

REM Check if Puppeteer is installed
echo Checking for Puppeteer...
if exist "node_modules\puppeteer" (
    echo Puppeteer found locally.
) else (
    if exist "%APPDATA%\npm\node_modules\puppeteer" (
        echo Puppeteer found globally.
    ) else (
        echo Puppeteer not found.
        set /p INSTALL_PUPPETEER="Would you like to install Puppeteer now? (Y/N): "
        if /i "!INSTALL_PUPPETEER!"=="Y" (
            echo Installing Puppeteer globally...
            npm install -g puppeteer
            
            REM Check if the installation was successful
            if exist "%APPDATA%\npm\node_modules\puppeteer" (
                echo Successfully installed Puppeteer globally.
            ) else (
                echo Failed to install Puppeteer.
                pause
                exit /b 1
            )
        ) else (
            echo Puppeteer installation cancelled.
            exit /b 1
        )
    )
)

REM Check if Chrome for Puppeteer is installed
echo Checking for Puppeteer Chrome...
set "CHROME_PATH="
for /d %%G in ("%USERPROFILE%\.cache\puppeteer\chrome-headless-shell\win64-*") do set "CHROME_PATH=%%G\chrome-headless-shell-win64\chrome-headless-shell.exe"

if not defined CHROME_PATH (
    echo Puppeteer Chrome not found.
    set /p INSTALL_CHROME="Would you like to install Puppeteer Chrome now? (Y/N): "
    if /i "!INSTALL_CHROME!"=="Y" (
        echo Installing Puppeteer Chrome...
        
        REM Remove old installation if exists
        rmdir /s /q "%USERPROFILE%\.cache\puppeteer" 2>nul
        
        REM Install Chrome for Puppeteer
        call npx puppeteer browsers install chrome-headless-shell
        
        REM Add a small delay to ensure file system is updated
        timeout /t 2 >nul
        
        REM Check if installation was successful
        for /d %%G in ("%USERPROFILE%\.cache\puppeteer\chrome-headless-shell\win64-*") do set "CHROME_PATH=%%G\chrome-headless-shell-win64\chrome-headless-shell.exe"
        
        if defined CHROME_PATH (
            if exist "!CHROME_PATH!" (
                echo Successfully installed Puppeteer Chrome.
            ) else (
                echo Failed to install Puppeteer Chrome.
                echo Please try running the script again or install Chrome manually.
                pause
                exit /b 1
            )
        ) else (
            echo Failed to install Puppeteer Chrome.
            echo Please try running the script again or install Chrome manually.
            pause
            exit /b 1
        )
    ) else (
        echo Puppeteer Chrome installation cancelled.
        exit /b 1
    )
) else (
    if exist "!CHROME_PATH!" (
        echo Puppeteer Chrome found.
    ) else (
        echo Puppeteer Chrome installation appears corrupted.
        echo Please try running the script again.
        pause
        exit /b 1
    )
)

echo Generating schema dump...
bun run ./helpers/backup.ts --schema-only

echo Converting schema to Mermaid...
bun run ./helpers/schema-to-mermaid.ts

echo Generating PNG from Mermaid...
bun run ./helpers/mermaid-to-png.ts

echo Done!
pause
