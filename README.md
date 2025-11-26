# A Voxel Christmas

A procedural winter wonderland built with Three.js.

## Getting Started

### Web Version
1. **Run the Server**: This project uses ES modules, so it must be served via a local web server (not opened directly as a file).
   ```bash
   npx http-server
   ```
2. **Open the App**: Navigate to `http://127.0.0.1:8080` in your browser.

### Windows Executable
1. **Build the application:**
   ```bash
   dotnet build -c Release
   ```

2. **Run the application:**
   ```bash
   dotnet run
   ```
   Or use `run.bat`

3. **Create portable package for distribution:**
   ```bash
   portable\package-portable.bat
   ```
   This creates a lightweight (~1-5MB) portable package in the `portable\` folder ready to distribute!

## Project Structure

- **`index.html`**: The main entry point.
- **`js/`**: Contains all JavaScript logic (World generation, Particles, UI).
- **`css/`**: Styling.
- **`DOCS/`**: Documentation.
- **`portable/`**: Packaging scripts for Windows executable distribution.
- **`VoxelChristmas.csproj`**: .NET project file for WebView2 wrapper.
- **`Program.cs`**: C# wrapper code for Windows executable.

## Documentation

- [Snow System Settings](DOCS/snow_system.md): How to configure the snow particle system.
- [Packaging Guide](PACKAGING.md): How to build and package the Windows executable.
