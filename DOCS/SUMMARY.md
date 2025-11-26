# Project Summary

## Overview
A procedural Voxel Christmas scene rendered with Three.js (WebGL) featuring an interactive UI with world generation controls and technology information display.

## Key Features
- **Procedural Terrain**: Instanced mesh rendering for performance.
- **Particle Systems**: Snow and falling leaves.
- **Post-Processing**: Bloom effect for a magical look.
- **Modular Code**: Organized into ES modules for maintainability.
- **Interactive UI**: 
  - Tech info panel displaying rendering technologies
  - World generation panel with progress tracking
  - Animated RGB LED news reel
  - Enhanced Play button with glowy snowy effects

## UI Components
- **Tech Info Panel**: Toggleable panel (⚙️ Tech button) showing WebGPU/WebGL status, Three.js version, Post-Processing, Instanced Rendering, Particle Systems, and OrbitControls.
- **World Generation Panel**: Accessible via Play button, displays world stats (size, trees, particles) and generation progress.
- **News Reel**: Pill-shaped banner with multiple animated effects:
  - **Outer RGB Glow**: Flowing color spectrum border (6s animation cycle)
  - **Border Lights**: Animated Christmas light bars in black border area (20s cycle with twinkling)
  - **Inner Lights**: Radial gradient Christmas lights along content edge (16s cycle with twinkling)
  - **Dynamic Snowflakes**: JavaScript-generated snowflakes spawning at random positions, falling with rotation (6-8s duration, max 7 active)
  - **Scrolling Text**: Continuous horizontal scroll of latest updates
- **Play Button**: Glowy snowy appearance with animated snowflakes and pulsing glow.
- **Quit Button**: Red-tinted quit button (✕ Quit) in bottom-right corner that closes the application. Uses WebView2 message communication between JavaScript and C# wrapper.

## Distribution

### Windows Executable
The project can be packaged as a lightweight Windows executable using WebView2:
- **Build**: `dotnet build -c Release`
- **Package**: Run `portable\package-portable.bat` to create a distributable package
- **Output**: Creates `portable\` folder with all files ready for distribution
- **Size**: ~1-5MB (very lightweight!)
- **Requirements**: WebView2 Runtime (pre-installed on Windows 11)

See [PACKAGING.md](../PACKAGING.md) for detailed instructions.

## Status
- **Current Version**: 0.0.1 ALPHA
- **Last Update**: WebView2 Windows packaging added. UI enhancements and RGB LED animations.
