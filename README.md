# ❄️ A Voxel Christmas ❄️

<div align="center">

**A procedural winter wonderland built with Three.js**

[![Version](https://img.shields.io/badge/version-0.0.1--ALPHA-red?style=flat-square)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![.NET](https://img.shields.io/badge/.NET-8.0-blue?style=flat-square)](https://dotnet.microsoft.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.181.2-orange?style=flat-square)](https://threejs.org/)

*Experience a magical voxel-based Christmas scene with procedural terrain, particle systems, and beautiful post-processing effects.*

</div>

---

## 🎄 Features

- **❄️ Procedural Terrain**: Instanced mesh rendering for optimal performance
- **🌲 Dynamic World Generation**: Procedurally generated trees, terrain, and structures
- **✨ Particle Systems**: Realistic snow and falling leaves
- **🎨 Post-Processing**: Bloom effects for a magical winter atmosphere
- **🎮 Interactive UI**: Tech info panel, world generation controls, and animated news reel
- **🪟 Windows Executable**: Lightweight WebView2 wrapper (~1-5MB package)

## 🚀 Quick Start

### Web Version

1. **Run the Server**: This project uses ES modules, so it must be served via a local web server.
   ```bash
   npx http-server
   ```
2. **Open the App**: Navigate to `http://127.0.0.1:8080` in your browser.

### 🪟 Windows Executable

1. **Build the application:**
   ```bash
   dotnet build -c Release
   ```

2. **Run the application:**
   ```bash
   dotnet run
   ```
   Or use `run.bat`

3. **Create portable package:**
   ```bash
   portable\package-portable.bat
   ```
   This creates a lightweight (~1-5MB) portable package ready to distribute!

## 📁 Project Structure

```
A_VOXEL_CHRISTMAS/
├── index.html              # Main entry point
├── js/                     # JavaScript modules
│   ├── main.js            # Main orchestration
│   ├── config.js          # Configuration
│   ├── scene-setup.js     # Three.js setup
│   ├── world-gen.js       # Procedural generation
│   ├── particles.js       # Particle systems
│   └── ui.js              # UI controls
├── css/                    # Stylesheets
├── DOCS/                   # Documentation
├── portable/               # Packaging scripts
├── VoxelChristmas.csproj   # .NET project file
└── Program.cs              # C# WebView2 wrapper
```

## 📚 Documentation

- [📖 Snow System Settings](DOCS/snow_system.md) - Configure the snow particle system
- [📦 Packaging Guide](PACKAGING.md) - Build and package Windows executable
- [🏗️ Architecture](DOCS/ARCHITECTURE.md) - Project structure and design
- [📝 Changelog](DOCS/CHANGELOG.md) - Version history

## 🛠️ Tech Stack

- **Three.js** v0.181.2 - 3D graphics library
- **WebGL** - Rendering engine
- **.NET 8.0** - Windows executable wrapper
- **WebView2** - Lightweight browser runtime

## ⚠️ Current Status

**Version 0.0.1 ALPHA** - Early development stage

This is an alpha release. Features may be incomplete or subject to change.

## 📄 License

MIT License - feel free to use this project for your own Christmas creations!

---

<div align="center">

**Made with ❄️ and 🎄 for the holidays**

⭐ Star this repo if you enjoy it!

</div>
