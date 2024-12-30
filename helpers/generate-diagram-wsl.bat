@echo off
setlocal EnableDelayedExpansion

REM Check if Hyper-V is enabled
echo Checking Hyper-V status...
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Virtualization" /v HypervisorRunning 2>nul | find "0x1" >nul
echo Hyper-V check completed with status: %ERRORLEVEL%
if %ERRORLEVEL% equ 0 (
    echo WARNING: Hyper-V is currently enabled and may conflict with WSL2.
    set /p DISABLE_HYPERV="Would you like to disable Hyper-V now (recommended, might cause SYSTEM_SERVICE_EXCEPTION if not disabled)? (Y/N): "
    if /i "!DISABLE_HYPERV!"=="Y" (
        echo Disabling Hyper-V...
        dism.exe /online /disable-feature /featurename:Microsoft-Hyper-V-All /norestart
        echo You can also disable it using 'Windows-Features' (Example Setting in B450-A PRO BIOS: Overclocking - Advanced CPU Configuration - SVM Mode)
        echo.
        echo Please restart your computer and run this script again.
        pause
        exit /b 1
    ) else (
        echo WARNING: Continuing with Hyper-V enabled may cause issues.
    )
)

REM Check virtualization first
echo Checking hardware virtualization status...
powershell -Command "if ((Get-CimInstance Win32_Processor).VirtualizationFirmwareEnabled) { exit 0 } else { exit 1 }" >nul 2>nul
echo PowerShell check completed with status: %ERRORLEVEL%
if %ERRORLEVEL% neq 0 (
    echo Virtualization is not enabled in BIOS/UEFI
    echo Please enable it via BIOS/UEFI setup ^(F2, F12, DEL during boot^)
    echo Look for: Virtualization Technology, Intel VT-x, AMD-V, VMX, or SVM Mode
    pause
    exit /b 1
)
echo Hardware virtualization is enabled, continuing...

echo Checking Virtual Machine Platform...
dism.exe /online /get-featureinfo /featurename:VirtualMachinePlatform | findstr "State : Enabled" >nul 2>&1
echo Virtual Machine Platform check completed with status: %ERRORLEVEL%
if %ERRORLEVEL% neq 0 (
    echo Virtual Machine Platform needs to be enabled.
    set /p SETUP_VMP="Would you like to enable Virtual Machine Platform now? (Y/N): "
    if /i "!SETUP_VMP!"=="Y" (
        echo Enabling Virtual Machine Platform...
        dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
        echo.
        echo Please restart your computer and run this script again.
        pause
        exit /b 1
    ) else (
        echo Setup cancelled.
        exit /b 1
    )
)

echo Checking WSL status...
wsl --status >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo WSL needs to be enabled.
    set /p SETUP_WSL="Would you like to enable WSL now? (Y/N): "
    if /i "!SETUP_WSL!"=="Y" (
        echo Enabling WSL...
        dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
        echo.
        echo Please follow these steps:
        echo 1. Restart your computer
        echo 2. Run 'wsl --update' in an admin terminal
        echo 3. Run 'wsl --set-default-version 2'
        echo 4. Run this script again
        pause
        exit /b 1
    ) else (
        echo WSL setup cancelled.
        exit /b 1
    )
)

REM Check WSL version
echo Checking WSL version...
wsl --set-default-version 2 >nul 2>&1
echo WSL version check completed with status: %ERRORLEVEL%

REM Check if Debian is installed
echo Checking for Debian WSL installation...
wsl -l -v | findstr "Debian" >nul 2>&1
echo Debian check completed with status: %ERRORLEVEL%
if %ERRORLEVEL% neq 0 (
    echo No Debian distribution found.
    set /p INSTALL_DEBIAN="Would you like to install Debian now? (Y/N): "
    if /i "!INSTALL_DEBIAN!"=="Y" (
        echo Installing Debian...
        wsl --install -d Debian
        echo Please wait for the Debian installation to complete, set up your username/password,
        echo then run this script again.
        pause
        exit /b 1
    ) else (
        echo Debian installation cancelled.
        exit /b 1
    )
)

echo Checking if PostgreSQL client is installed in WSL...
wsl bash -c "which psql" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    set /p INSTALL_PSQL="PostgreSQL client is not installed. Would you like to install it now? (Y/N): "
    if /i "!INSTALL_PSQL!"=="Y" (
        echo Installing PostgreSQL client in WSL...
        wsl sudo apt-get update
        wsl sudo apt-get install -y postgresql-client-16
    ) else (
        echo PostgreSQL client installation cancelled.
        exit /b 1
    )
)

echo Generating schema dump using WSL...
wsl bun run ./helpers/backup.ts --schema-only

echo Converting schema to Mermaid...
bun run ./helpers/schema-to-mermaid.ts

echo Generating PNG from Mermaid...
bun run ./helpers/mermaid-to-png.ts

echo Done!
