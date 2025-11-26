# 🔄 Update Pipeline Guide

**Simple auto-update system: Check for updates on startup, download, and install.**

---

## 🎯 What You're Building

An update system that:
- ✅ Checks for new version on app startup
- ✅ Shows update prompt if new version available
- ✅ Downloads new version automatically
- ✅ Installs update and restarts app
- ✅ Works with GitHub Releases

---

## 🧠 The Simple Approach (Easiest)

**Why this is easiest:**
- Uses GitHub Releases (free hosting)
- Simple version check (just compare numbers)
- Downloads installer, runs it, restarts
- No complex update servers needed

**How it works:**
1. App starts → Check GitHub for latest version
2. Compare with current version
3. If newer → Show "Update available?" dialog
4. User clicks "Yes" → Download installer
5. Run installer → Restart app
6. Done! ✅

---

## 📋 Step 1: Create Version File

### What is this?
A simple file that stores your current version number.

### Create: `version.json`

In your project root:

```json
{
  "version": "0.0.1",
  "buildDate": "2024-12-20"
}
```

**That's it!** Just two fields.

---

## 📋 Step 2: Host Version File on GitHub

### Option A: Use GitHub Releases (Recommended)

**Why:** GitHub automatically hosts files for free.

**How:**
1. Go to your GitHub repo
2. Click "Releases" → "Create a new release"
3. Tag: `v0.0.1` (must match version.json)
4. Title: "Version 0.0.1"
5. Upload `version.json` as an asset
6. Upload `VoxelChristmas-Setup.exe` as an asset
7. Publish release

**Result:** 
- Version file URL: `https://github.com/yourusername/A_VOXEL_CHRISTMAS/releases/download/v0.0.1/version.json`
- Installer URL: `https://github.com/yourusername/A_VOXEL_CHRISTMAS/releases/download/v0.0.1/VoxelChristmas-Setup.exe`

### Option B: Use GitHub Raw Files (Simpler, but less organized)

**Why:** Easier, but files aren't tied to releases.

**How:**
1. Create `version.json` in your repo root
2. Commit and push
3. URL: `https://raw.githubusercontent.com/yourusername/A_VOXEL_CHRISTMAS/main/version.json`

**Use this if:** You want the absolute simplest setup.

---

## 📋 Step 3: Add Update Check to Your App

### Where to Add Code

Add this to `Program.cs` - right at the start of `Main()` method.

### The Code:

```csharp
using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Text.Json;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace VoxelChristmas
{
    static class Program
    {
        private static string CurrentVersion = "0.0.1"; // Update this when you release
        private static string VersionCheckUrl = "https://raw.githubusercontent.com/yourusername/A_VOXEL_CHRISTMAS/main/version.json";
        private static string InstallerDownloadUrl = "https://github.com/yourusername/A_VOXEL_CHRISTMAS/releases/download/v{0}/VoxelChristmas-Setup.exe";

        [STAThread]
        static void Main()
        {
            // Check for updates BEFORE starting the app
            CheckForUpdates();

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }

        private static async void CheckForUpdates()
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    // Set timeout (don't wait forever)
                    client.Timeout = TimeSpan.FromSeconds(5);
                    
                    // Get version file
                    string versionJson = await client.GetStringAsync(VersionCheckUrl);
                    
                    // Parse version
                    using (JsonDocument doc = JsonDocument.Parse(versionJson))
                    {
                        string latestVersion = doc.RootElement.GetProperty("version").GetString();
                        
                        // Compare versions (simple string compare works for semantic versioning)
                        if (IsNewerVersion(latestVersion, CurrentVersion))
                        {
                            // Show update dialog
                            DialogResult result = MessageBox.Show(
                                $"A new version ({latestVersion}) is available!\n\n" +
                                $"Current version: {CurrentVersion}\n\n" +
                                "Would you like to download and install it now?",
                                "Update Available",
                                MessageBoxButtons.YesNo,
                                MessageBoxIcon.Information
                            );

                            if (result == DialogResult.Yes)
                            {
                                await DownloadAndInstallUpdate(latestVersion);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Silently fail - don't interrupt user if update check fails
                // Optionally log: System.Diagnostics.Debug.WriteLine($"Update check failed: {ex.Message}");
            }
        }

        private static bool IsNewerVersion(string latest, string current)
        {
            // Simple version comparison
            // Works for versions like "0.0.1", "0.0.2", "1.0.0", etc.
            Version latestVersion = new Version(latest);
            Version currentVersion = new Version(current);
            return latestVersion > currentVersion;
        }

        private static async Task DownloadAndInstallUpdate(string version)
        {
            try
            {
                string installerUrl = string.Format(InstallerDownloadUrl, version);
                string tempPath = Path.Combine(Path.GetTempPath(), "VoxelChristmas-Setup.exe");

                using (HttpClient client = new HttpClient())
                {
                    // Show progress (optional - you can make this fancier)
                    MessageBox.Show("Downloading update...", "Update", MessageBoxButtons.OK, MessageBoxIcon.Information);

                    // Download installer
                    byte[] installerData = await client.GetByteArrayAsync(installerUrl);
                    await File.WriteAllBytesAsync(tempPath, installerData);
                }

                // Run installer and exit
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = tempPath,
                    UseShellExecute = true
                });

                // Close current app
                Application.Exit();
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Failed to download update: {ex.Message}\n\n" +
                    "You can download it manually from GitHub.",
                    "Update Failed",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }

    // ... rest of your MainForm class stays the same ...
}
```

### What to Change:

1. **Line 15:** `CurrentVersion = "0.0.1"` → Update this every release
2. **Line 16:** `VersionCheckUrl = "..."` → Your GitHub raw URL
3. **Line 17:** `InstallerDownloadUrl = "..."` → Your GitHub releases URL pattern

---

## 📋 Step 4: Add Required NuGet Package

### Why?
The code uses `System.Text.Json` which needs a package.

### How:

1. **Open terminal in project folder:**
   ```bash
   cd C:\Users\motor\Desktop\A_VOXEL_CHRISTMAS
   ```

2. **Add package:**
   ```bash
   dotnet add package System.Text.Json
   ```

**Or edit `VoxelChristmas.csproj` manually:**

Add this inside `<ItemGroup>`:
```xml
<PackageReference Include="System.Text.Json" Version="8.0.0" />
```

---

## 📋 Step 5: Update Process (When You Release New Version)

### The Workflow:

**Every time you want to release an update:**

1. **Update version in code:**
   - Edit `Program.cs` line 15: `CurrentVersion = "0.0.2"`

2. **Update version.json:**
   - Edit `version.json`: `"version": "0.0.2"`

3. **Build installer:**
   ```bash
   installer\build-installer.bat
   ```

4. **Create GitHub Release:**
   - Tag: `v0.0.2`
   - Upload `VoxelChristmas-Setup.exe`
   - Upload `version.json` (optional, if using releases)

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "Release v0.0.2"
   git push
   ```

**That's it!** Users will get update prompt on next startup.

---

## 🎨 Making It Better (Optional Enhancements)

### 1. Skip Update Check on First Run

Add a flag file:
```csharp
private static bool ShouldCheckForUpdates()
{
    string flagFile = Path.Combine(Application.StartupPath, ".update-checked");
    if (File.Exists(flagFile))
    {
        // Check if file is older than 24 hours
        var lastCheck = File.GetLastWriteTime(flagFile);
        return DateTime.Now - lastCheck > TimeSpan.FromHours(24);
    }
    File.Create(flagFile).Close();
    return true;
}
```

### 2. Show Download Progress

Use a progress bar dialog instead of simple message box.

### 3. Silent Background Check

Check in background, only show dialog if update found.

### 4. "Check for Updates" Menu Item

Let users manually check:
```csharp
// In your UI
private void CheckForUpdatesMenuItem_Click(object sender, EventArgs e)
{
    CheckForUpdates();
}
```

---

## 🧪 Testing the Update System

### Test Locally:

1. **Set up test:**
   - Current version: `0.0.1`
   - Create `version.json` with `0.0.2` on GitHub
   - Run your app

2. **Expected behavior:**
   - App starts
   - Update dialog appears
   - Click "Yes" → Downloads installer
   - Installer runs
   - App closes

3. **Test "No" option:**
   - Click "No" → App continues normally

### Test Update Flow:

1. Install version 0.0.1
2. Create release for 0.0.2
3. Run installed app
4. Should prompt for update
5. Install update
6. Verify new version runs

---

## ❓ Troubleshooting

### Update Check Never Runs

**Problem:** No dialog appears

**Check:**
- Internet connection
- Version URL is correct
- Version file is accessible (open URL in browser)
- Exception is being caught silently (add logging)

**Fix:** Add logging:
```csharp
catch (Exception ex)
{
    System.Diagnostics.Debug.WriteLine($"Update check: {ex.Message}");
    // Or show in a log file
}
```

### "Version format invalid" Error

**Problem:** Version comparison fails

**Fix:** Make sure versions are in format `X.Y.Z`:
- ✅ Good: `0.0.1`, `1.2.3`, `2.0.0`
- ❌ Bad: `v0.0.1`, `0.0.1-beta`, `1.2`

### Installer Doesn't Run

**Problem:** Download works but installer doesn't start

**Fix:** Check:
- File downloaded completely
- File isn't blocked by Windows
- User has permissions to run installer

### Update Loop

**Problem:** App keeps prompting for same update

**Fix:** Make sure you update `CurrentVersion` in code after releasing!

---

## 📝 Quick Reference

### Update Version:
1. Change `CurrentVersion` in `Program.cs`
2. Change `version` in `version.json`
3. Build installer
4. Create GitHub release

### Version File URL Format:
```
https://raw.githubusercontent.com/USERNAME/REPO/BRANCH/version.json
```

### Installer URL Format (GitHub Releases):
```
https://github.com/USERNAME/REPO/releases/download/vVERSION/VoxelChristmas-Setup.exe
```

### Test Update Check:
1. Set `CurrentVersion` to old version (e.g., `0.0.1`)
2. Put newer version in `version.json` on GitHub (e.g., `0.0.2`)
3. Run app → Should prompt

---

## ✅ Checklist

Before releasing:
- [ ] `version.json` created
- [ ] Update code added to `Program.cs`
- [ ] `System.Text.Json` package added
- [ ] Version URLs updated in code
- [ ] Tested update check locally
- [ ] Tested download and install
- [ ] GitHub release created
- [ ] Version file accessible via URL

---

## 🎯 Summary: The Easiest Path

**For maximum simplicity:**

1. ✅ Use GitHub Raw for version file (no releases needed)
2. ✅ Use GitHub Releases for installer (organized)
3. ✅ Simple version number comparison
4. ✅ Download installer → Run → Restart
5. ✅ No complex update servers

**Time to set up:** ~15 minutes  
**Time per update:** ~2 minutes

---

**That's it!** Your app now checks for updates automatically. 🎉

