@echo off
echo Building Voxel Christmas...
echo.

REM Build the project
dotnet build -c Release

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Build successful! Executable is in: bin\Release\net8.0-windows\
echo.
pause

