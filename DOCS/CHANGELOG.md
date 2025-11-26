# Changelog

## [Unreleased]

### Added
- **WebView2 Windows Packaging**: Lightweight Windows executable packaging using .NET and WebView2
  - Portable distribution package (~1-5MB)
  - Fullscreen application wrapper
  - Packaging scripts in `portable/` folder
  - No installation required - just extract and run
  - **Quit Button**: In-game quit button that closes the application via WebView2 message communication
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
- **UI Auto-Hide System**: 
  - **Countdown Timer**: 5-second countdown after splash screen dismissal that automatically hides the UI for immersive viewing
  - **Manual Hide Toggle**: "Hide UI" button to manually hide/show the UI
  - **Double-Click to Wake**: Double-click anywhere on the canvas to restore the UI after auto-hide
  - **Interaction Disabling**: When UI is hidden, all buttons (Play, Settings, About) are disabled with no hover effects or click interactions
  - **Complete State Restoration**: UI restoration properly restores all elements including news reel, audio warning, and button positions

### Changed
- News reel styling updated to pill shape with RGB LED border animation.
- Play button made clickable with enhanced visual feedback.
- RGB animations slowed down for smoother visual effect (outer: 3s→6s, border: 12s→20s, inner: 10s→16s).
- News reel snowflakes system converted from CSS to JavaScript for dynamic random spawning.
- UI state management refactored for unified hide/show system used by both manual toggle and auto-hide.

### Fixed
- **UI Interaction Bug**: Fixed issue where menu buttons (Play, Settings, About) remained clickable and showed hover effects when UI was hidden. Buttons now properly disabled with `pointer-events: none` and CSS `ui-hidden` class.
- **News Reel Missing**: Fixed bug where news reel would disappear after double-clicking to wake UI. News reel now properly restored with display, opacity, and pointer-events.
- **Audio Warning Position**: Fixed issue where audio warning box would move incorrectly after UI restoration. Audio warning now maintains proper positioning during hide/show cycles.

## [0.0.1 ALPHA] - 2025-01-27
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
