# 📦 Installer Setup Guide

**Simple step-by-step guide to create a professional installer for your app.**

---

## 🎯 What You're Building

An installer that:
- ✅ Prompts user where to install
- ✅ Creates desktop shortcut (optional)
- ✅ Creates Start Menu entry
- ✅ Includes uninstaller
- ✅ Single `.exe` file to distribute

---

## 📋 Step 1: Install Inno Setup (One-Time Setup)

### What is Inno Setup?
Free tool that creates Windows installers. You only install it once.

### How to Install:

1. **Download:**
   - Go to: https://jrsoftware.org/isdl.php
   - Click "Download Inno Setup" (the big button)
   - Save the file (it's called `innosetup-6.x.x.exe`)

2. **Install:**
   - Double-click the downloaded file
   - Click "Next" through the installer
   - Use default settings (just keep clicking Next)
   - Click "Install"
   - Done! ✅

**Time:** ~2 minutes

---

## 📁 Step 2: Create Installer Files

### Create These Folders/Files:

```
A_VOXEL_CHRISTMAS/
├── installer/
│   ├── VoxelChristmas.iss    ← Installer script
│   └── build-installer.bat    ← Build script
```

### File 1: `installer/VoxelChristmas.iss`

This is the installer configuration. Copy this exactly:

```inno
[Setup]
AppName=A Voxel Christmas
AppVersion=0.0.1
AppPublisher=Your Name
AppPublisherURL=https://github.com/yourusername/A_VOXEL_CHRISTMAS
DefaultDirName={autopf}\A Voxel Christmas
DefaultGroupName=A Voxel Christmas
OutputDir=installer\output
OutputBaseFilename=VoxelChristmas-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64
UninstallDisplayIcon={app}\VoxelChristmas.exe

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "bin\Release\net8.0-windows\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\A Voxel Christmas"; Filename: "{app}\VoxelChristmas.exe"
Name: "{group}\{cm:UninstallProgram,A Voxel Christmas}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\A Voxel Christmas"; Filename: "{app}\VoxelChristmas.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\VoxelChristmas.exe"; Description: "{cm:LaunchProgram,A Voxel Christmas}"; Flags: nowait postinstall skipifsilent
```

**What to change:**
- Line 3: `AppPublisher=Your Name` → Put your name/org
- Line 4: `AppPublisherURL=...` → Put your GitHub URL

### File 2: `installer/build-installer.bat`

This builds the installer automatically:

```batch
@echo off
cd /d "%~dp0\.."
echo Building Voxel Christmas Installer...
echo.

REM Build the application first
echo Step 1: Building application...
call build.bat
if %ERRORLEVEL% NEQ 0 (
    echo Application build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Building installer...
echo.

REM Check if Inno Setup is installed
set INNO_PATH=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe
if not exist "%INNO_PATH%" (
    set INNO_PATH=%ProgramFiles%\Inno Setup 6\ISCC.exe
)
if not exist "%INNO_PATH%" (
    echo ERROR: Inno Setup not found!
    echo Please install Inno Setup from https://jrsoftware.org/isdl.php
    pause
    exit /b 1
)

REM Create output directory
if not exist "installer\output" mkdir "installer\output"

REM Compile the installer
"%INNO_PATH%" "installer\VoxelChristmas.iss"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Installer built successfully!
    echo Location: installer\output\VoxelChristmas-Setup.exe
    echo ========================================
) else (
    echo.
    echo Installer build failed!
)

echo.
pause
```

**No changes needed** - this file is ready to use.

---

## 🚀 Step 3: Build Your Installer

### The Process:

1. **Open Command Prompt or PowerShell**
   - Press `Win + R`
   - Type `cmd` and press Enter

2. **Navigate to your project:**
   ```bash
   cd C:\Users\motor\Desktop\A_VOXEL_CHRISTMAS
   ```

3. **Run the build script:**
   ```bash
   installer\build-installer.bat
   ```

### What Happens:

1. ✅ Builds your app in Release mode
2. ✅ Creates installer from the built files
3. ✅ Outputs: `installer\output\VoxelChristmas-Setup.exe`

**Time:** ~30 seconds

---

## 📤 Step 4: Distribute Your Installer

### Where is it?
```
installer\output\VoxelChristmas-Setup.exe
```

### How to Share:

1. **Upload to GitHub Releases** (recommended)
   - Go to your GitHub repo
   - Click "Releases" → "Create a new release"
   - Upload `VoxelChristmas-Setup.exe`
   - Tag it with version (e.g., `v0.0.1`)

2. **Or share directly:**
   - Email the file
   - Upload to Google Drive/Dropbox
   - Put on a website

---

## 🧪 Step 5: Test the Installer

### Test on Your Computer:

1. **Run the installer:**
   - Double-click `VoxelChristmas-Setup.exe`
   - Follow the wizard
   - Choose install location (or use default)
   - Check "Create desktop icon" if you want
   - Click "Install"

2. **Verify it works:**
   - Check Start Menu → "A Voxel Christmas" appears
   - Check Desktop → shortcut appears (if you checked the box)
   - Run the app from Start Menu
   - Test uninstaller: Settings → Apps → "A Voxel Christmas" → Uninstall

---

## 🎨 Customization Options

### Change Installer Appearance:

Edit `VoxelChristmas.iss`:

**Add a license file:**
```inno
LicenseFile=LICENSE.txt
```

**Add welcome/readme text:**
```inno
InfoBeforeFile=README.txt
InfoAfterFile=CHANGELOG.txt
```

**Add an icon:**
```inno
SetupIconFile=icon.ico
```

### Change Default Install Location:

Line 6 in `.iss` file:
```inno
DefaultDirName={autopf}\A Voxel Christmas
```

Options:
- `{autopf}` = Program Files (default)
- `{localappdata}` = User's AppData\Local
- `{userpf}` = User's Program Files
- `C:\MyApp` = Specific folder

---

## ❓ Troubleshooting

### "Inno Setup not found" Error

**Problem:** Build script can't find Inno Setup

**Fix:**
1. Check if Inno Setup is installed
2. If installed in non-standard location, edit `build-installer.bat`
3. Change line 15-16 to your Inno Setup path:
   ```batch
   set INNO_PATH=C:\Your\Path\To\Inno Setup 6\ISCC.exe
   ```

### Installer is Too Big

**Problem:** Installer file is huge

**Fix:**
- Already using compression (`Compression=lzma`)
- If still too big, check what's in `bin\Release\net8.0-windows\`
- Remove unnecessary files before building

### Installer Doesn't Include All Files

**Problem:** Some files missing after install

**Fix:**
- Check line 20 in `.iss` file:
  ```inno
  Source: "bin\Release\net8.0-windows\*"
  ```
- This includes everything. If files are missing, they weren't in the build output.

---

## 📝 Quick Reference

### Build Installer:
```bash
installer\build-installer.bat
```

### Output Location:
```
installer\output\VoxelChristmas-Setup.exe
```

### Update Version:
Edit line 2 in `VoxelChristmas.iss`:
```inno
AppVersion=0.0.1
```

---

## ✅ Checklist

Before distributing:
- [ ] Inno Setup installed
- [ ] `installer/VoxelChristmas.iss` created
- [ ] `installer/build-installer.bat` created
- [ ] Updated publisher name/URL in `.iss` file
- [ ] Built installer successfully
- [ ] Tested installer on your computer
- [ ] Tested uninstaller
- [ ] Uploaded to GitHub Releases (or other location)

---

**That's it!** You now have a professional installer. 🎉

