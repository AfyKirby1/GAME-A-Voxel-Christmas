# Scratchpad

## 2025-01-XX: Volume Slider Bug Fix

### Issue
- Volume slider handle would jump to position 0 when grabbing/dragging
- Caused by delayed position update - code waited for first mousemove event

### Solution
- Updated `startDrag()` function to immediately call `updateFromEvent()` on mousedown
- Prevents incorrect position calculation on first mouse movement
- Handle now stays at current position when grabbed, allowing smooth dragging

### Files Modified
- `js/ui.js` - Fixed `startDrag()` function in `setupVolumeSlider()`

## 2025-11-25: WebGL-Only Implementation

### Decision
- Project uses WebGL renderer exclusively for maximum compatibility
- Removed all WebGPU code and references
- Simplified renderer initialization to WebGL only

### Implementation
1. **Renderer**: Uses `THREE.WebGLRenderer` with antialiasing
2. **Post-Processing**: Uses `EffectComposer` with `UnrealBloomPass` for bloom effects
3. **Compatibility**: Works across all modern browsers with WebGL support

### Files Modified
- `js/scene-setup.js` - Simplified to WebGL-only renderer
- `js/ui.js` - Removed WebGPU checking function
- `js/main.js` - Removed WebGPU references
- `index.html` - Removed WebGPU import maps and UI elements
- `css/style.css` - Removed WebGPU status styling
- `DOCS/` - Removed WebGPU documentation files

### Features
- ✅ WebGL renderer with antialiasing
- ✅ EffectComposer post-processing with bloom
- ✅ Cross-browser compatibility
- ✅ Clean, simplified codebase

## 2025-01-XX: News Reel Enhancements

### RGB LED Border System
- **Outer Glow**: Double-box technique using `::before` pseudo-element with animated linear gradient
- **Border Lights**: `::after` pseudo-element with repeating linear gradient creating bar light effect
- **Animation Speeds**: Optimized for smooth visual flow (6s, 20s, 16s cycles)

### Dynamic Snowflake System
- **Implementation**: JavaScript-based spawning system in `setupNewsReelSnowflakes()`
- **Features**:
  - Random horizontal spawn positions within container bounds
  - Individual animation durations (6-8 seconds)
  - Smooth rotation and horizontal drift during fall
  - Automatic cleanup on animation end
  - Continuous spawning loop with random intervals (0.5-1.5s)
  - Maximum 7 concurrent snowflakes for performance

### CSS Animation Details
- **Snowflake Animation**: Pixel-based `translateY` values (0px to 48px) for precise control
- **Opacity Curve**: High visibility (0.8) maintained until 85% of animation, then gradual fade
- **Rotation**: Continuous 540-degree rotation during fall for natural movement