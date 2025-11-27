# Project Summary

## Overview
A procedural Voxel Christmas scene rendered with Three.js (WebGL) featuring an interactive UI with world generation controls and technology information display.

## Key Features
- **Dual World System**: Separate menu world and game world that coexist independently
- **Procedural Terrain**: Instanced mesh rendering for performance
- **First-Person Mode**: Full first-person camera with mouse look controls
- **Ambient Sound**: Procedural wind ambient sound using Tone.js (starts automatically in first-person mode)
- **Particle Systems**: Snow and falling leaves
- **Post-Processing**: Bloom effect for a magical look
- **Modular Code**: Organized into ES modules for maintainability
- **Interactive UI**: 
  - Tech info panel displaying rendering technologies
  - World generation panel with progress tracking
  - Animated RGB LED news reel
  - Enhanced Play button with glowy snowy effects

## UI Components
- **Tech Info Panel**: Toggleable panel (⚙️ Tech button) showing WebGPU/WebGL status, Three.js version, Post-Processing, Instanced Rendering, Particle Systems, and OrbitControls.
- **World Generation Panel**: Accessible via Play button, displays world size (64x64) and toggle switches for trees, lights, house, and hills.
- **World Loading Screen**: Full-screen loading overlay (z-index: 9999) with fully opaque background that completely blocks menu and game world view. Features:
  - Animated progress bar with shimmer effect and real-time percentage display (0-100%)
  - Dynamic status messages: "Generating terrain...", "Building structures...", "Placing trees...", "Entering world..."
  - Animated spinner with multiple rotating rings
  - Automatically hides ALL UI elements when shown (title, menu, buttons, news reel, panels)
  - Smooth fade-in/fade-out transitions
  - Progress tracking integrated with world generation callback system
- **Dual World System**: Separate menu world (75 block radius) and game world (150 block radius) that coexist independently.
- **News Reel**: Pill-shaped banner with multiple animated effects:
  - **Outer RGB Glow**: Flowing color spectrum border (6s animation cycle)
  - **Border Lights**: Animated Christmas light bars in black border area (20s cycle with twinkling)
  - **Inner Lights**: Radial gradient Christmas lights along content edge (16s cycle with twinkling)
  - **Dynamic Snowflakes**: JavaScript-generated snowflakes spawning at random positions, falling with rotation (6-8s duration, max 7 active)
  - **Scrolling Text**: Continuous horizontal scroll of latest updates
- **Play Button**: Glowy snowy appearance with animated snowflakes and pulsing glow.
- **Quit Button**: Red-tinted quit button (✕ Quit) in bottom-right corner that closes the application. Uses WebView2 message communication between JavaScript and C# wrapper.
- **UI Auto-Hide System**:
  - **Countdown Timer**: 5-second countdown after splash screen automatically hides UI for immersive viewing
  - **Manual Toggle**: "Hide UI" / "Show UI" button for manual control
  - **Double-Click Wake**: Double-click anywhere on canvas to restore UI after auto-hide
  - **Interaction Blocking**: When hidden, all menu buttons are disabled with no hover effects or click interactions
  - **Complete Restoration**: UI wake properly restores all elements including news reel and audio warning positioning
- **Audio Management**:
  - Background music plays during main menu
  - Music automatically stops when entering first-person game mode
  - Music resets to beginning when stopped (ready for next menu session)
  - Ambient wind sound automatically starts when entering first-person mode
  - Ambient sound respects master audio toggle and volume settings
  - Smooth volume transitions and proper audio context handling

## Distribution

### Windows Executable
The project can be packaged as a lightweight Windows executable using WebView2:
- **Build**: `dotnet build -c Release`
- **Package**: Run `portable\package-portable.bat` to create a distributable package
- **Output**: Creates `portable\` folder with all files ready for distribution
- **Size**: ~1-5MB (very lightweight!)
- **Requirements**: WebView2 Runtime (pre-installed on Windows 11)

See [PACKAGING.md](../PACKAGING.md) for detailed instructions.

## Documentation

- **[STYLE_GUIDE.md](STYLE_GUIDE.md)**: Comprehensive UI style guide for buttons, panels, and UI components
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Technical architecture and component structure
- **[CHANGELOG.md](CHANGELOG.md)**: Version history and feature updates
- **[PACKAGING.md](../PACKAGING.md)**: Distribution and packaging instructions

## Status
- **Current Version**: 0.0.1 ALPHA
- **Last Update**: Full-screen world loading screen with animated progress bar, real-time status updates, and automatic UI blocking. Progress tracking integrated with world generation callback system. Settings panel with tabbed interface (Audio, Controls, Video) featuring draggable volume sliders with percentage display. Dual world system with separate menu and game worlds. First-person camera mode with mouse look controls.
