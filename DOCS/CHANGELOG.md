# Changelog

## [Unreleased]

### Added
- **WebView2 Windows Packaging**: Lightweight Windows executable packaging using .NET and WebView2
  - Portable distribution package (~1-5MB)
  - Fullscreen application wrapper
  - Packaging scripts in `portable/` folder
  - No installation required - just extract and run
- **Tech Info Panel**: Toggleable technology display in top right showing WebGPU/WebGL, Three.js, Post-Processing, Instanced Rendering, Particle Systems, and OrbitControls.
- **World Generation Panel**: Interactive panel accessible via Play button showing world generation stats and progress.
- **RGB LED News Reel**: Pill-shaped news reel with animated RGB LED border that continuously flows around the edges.
  - **Outer RGB Glow**: Animated gradient border (6s cycle) with full color spectrum flowing around pill shape
  - **Border Christmas Lights**: Animated bar lights in black border area (20s cycle) with twinkling effect
  - **Inner Christmas Lights**: Radial gradient lights along inner content edge (16s cycle) with twinkling
  - **Dynamic Snowflakes**: JavaScript-generated snowflakes that spawn at random positions and fall naturally
    - Random horizontal spawn positions
    - 6-8 second fall duration
    - Smooth rotation and drift during fall
    - Maximum 7 active snowflakes
    - Continuous spawning at 0.5-1.5 second intervals
- **Enhanced Play Button**: Glowy snowy appearance with animated snowflakes and pulsing glow effect.

### Changed
- News reel styling updated to pill shape with RGB LED border animation.
- Play button made clickable with enhanced visual feedback.
- RGB animations slowed down for smoother visual effect (outer: 3s→6s, border: 12s→20s, inner: 10s→16s).
- News reel snowflakes system converted from CSS to JavaScript for dynamic random spawning.

## [1.0.0] - 2025-11-25
### Added
- Modular project structure (`js/`, `css/`, `DOCS/`).
- `config.js` for centralized settings.
- `snow_system.md` for snow configuration documentation.

### Changed
- Refactored `ai_studio_code.html` into `index.html` + modules.
- Extracted CSS to `css/style.css`.

### Improved
- **Visuals**: Reduced intensity of snow reflections and bloom for a more natural look.
- **House**: Updated window design to be more realistic (individual windows instead of a strip).
