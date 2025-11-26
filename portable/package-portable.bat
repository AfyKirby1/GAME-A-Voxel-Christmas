@echo off
cd /d "%~dp0\.."
echo Packaging Voxel Christmas...
echo.

REM Build
dotnet build -c Release
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

REM Create temp folder for packaging
set TEMP_PACKAGE=%TEMP%\VoxelChristmas-Package
if exist "%TEMP_PACKAGE%" rmdir /S /Q "%TEMP_PACKAGE%"
mkdir "%TEMP_PACKAGE%"

REM Copy only files needed to run
echo Copying files...
REM Copy executable and DLLs
xcopy /Y /I "build\bin\Release\net8.0-windows\*.exe" "%TEMP_PACKAGE%\" >nul
xcopy /Y /I "build\bin\Release\net8.0-windows\*.dll" "%TEMP_PACKAGE%\" >nul
REM Copy runtime config files
xcopy /Y /I "build\bin\Release\net8.0-windows\*.json" "%TEMP_PACKAGE%\" >nul
REM Copy HTML/CSS/JS
xcopy /Y /I "build\bin\Release\net8.0-windows\index.html" "%TEMP_PACKAGE%\" >nul
xcopy /Y /I /E /S "build\bin\Release\net8.0-windows\js" "%TEMP_PACKAGE%\js\" >nul
xcopy /Y /I /E /S "build\bin\Release\net8.0-windows\css" "%TEMP_PACKAGE%\css\" >nul
REM Copy assets folder (audio, etc.)
if exist "build\bin\Release\net8.0-windows\assets" xcopy /Y /I /E /S "build\bin\Release\net8.0-windows\assets" "%TEMP_PACKAGE%\assets\" >nul
REM Copy runtimes folder if it exists (native libraries)
if exist "build\bin\Release\net8.0-windows\runtimes" xcopy /Y /I /E /S "build\bin\Release\net8.0-windows\runtimes" "%TEMP_PACKAGE%\runtimes\" >nul

REM Create ZIP from temp folder
echo Creating ZIP...
if exist "portable\VoxelChristmas-Portable.zip" del "portable\VoxelChristmas-Portable.zip"
powershell -Command "Compress-Archive -Path '%TEMP_PACKAGE%\*' -DestinationPath 'portable\VoxelChristmas-Portable.zip' -Force"

REM Clean up temp folder
if exist "%TEMP_PACKAGE%" rmdir /S /Q "%TEMP_PACKAGE%"

echo.
echo Done! ZIP created: portable\VoxelChristmas-Portable.zip
echo.
pause
