# Packaging Guide - WebView2 Windows Application

## Quick Start

### Build the Application

1. **Build in Release mode:**
   ```bash
   dotnet build -c Release
   ```

   Or use the batch file:
   ```bash
   build.bat
   ```

2. **Run the application:**
   ```bash
   dotnet run
   ```

   Or use the batch file:
   ```bash
   run.bat
   ```

### Output Location

The built executable and all files will be in:
```
bin\Release\net8.0-windows\
```

### Creating a Portable Package (For Distribution)

**Quick method - use the packaging script:**
```bash
portable\package-portable.bat
```

This will:
1. Build the application in Release mode
2. Create a `portable\` folder with all files
3. Generate a README.txt with instructions
4. Create a ZIP archive ready for distribution

**Simple method:**
```bash
portable\package-portable-simple.bat
```

This creates the portable folder without the ZIP (you can manually zip it).

**Manual method:**
1. Build: `dotnet build -c Release`
2. Copy the entire `bin\Release\net8.0-windows\` folder
3. Rename it to something like `VoxelChristmas-Portable`
4. Zip it and distribute!

**File size:** The portable package will be approximately 1-5MB (very lightweight!)

**Requirements for end users:**
- Windows 10 or Windows 11
- WebView2 Runtime (pre-installed on Windows 11, available for Windows 10)
- No installation needed - just extract and run `VoxelChristmas.exe`

### Publishing a Self-Contained Application

To create a single folder with all dependencies:

```bash
dotnet publish -c Release -r win-x64 --self-contained true
```

This will create a larger package (~50-100MB) that includes the .NET runtime, but doesn't require .NET to be installed on the target machine.

### Requirements

- **.NET 8.0 SDK** (for building)
- **WebView2 Runtime** (for running - usually pre-installed on Windows 11, available for Windows 10)

## Project Structure

```
A_VOXEL_CHRISTMAS/
├── VoxelChristmas.csproj    # Project file
├── Program.cs                # C# wrapper code
├── index.html               # Main HTML file
├── js/                      # JavaScript files
├── css/                     # CSS files
├── portable/                # Packaging scripts
│   ├── package-portable.bat      # Full packaging with ZIP
│   └── package-portable-simple.bat # Simple packaging
├── build.bat                # Build script
└── run.bat                  # Run script
```

## Notes

- The application runs in fullscreen mode by default
- All HTML/CSS/JS files are automatically copied to the output directory
- The app uses ES modules with CDN imports for Three.js (requires internet connection)

