# Scratchpad

## 2025-01-XX: Gallery System Implementation

### Features Added
1. **Gallery Button**:
   - Added to main menu between "Play" and "Settings" buttons
   - Christmas artsy styling with warm pink/red gradient
   - Picture frame emoji (🖼️) on left, sparkles (✨) on right
   - Pulsing glow animation (`galleryGlow` keyframes)
   - Hover effects matching Play and Settings buttons
   - Full interactivity with proper cursor states

2. **Gallery Panel**:
   - Full panel matching Settings panel design pattern
   - Tabbed interface with 4 categories: Entities, Blocks, Structures, Plants
   - Card-based grid layout for gallery items
   - Hover animations with lift effect and glow
   - Responsive grid that adapts to screen size
   - Smooth tab switching with fade transitions

3. **Gallery Content**:
   - **Entities Tab**: Christmas Light, Tree Light
   - **Blocks Tab**: Snow, Dirt, Wood, Leaves, Stone, Plank, Window (7 blocks)
   - **Structures Tab**: House
   - **Plants Tab**: Christmas Tree
   - Each item displays icon, name, and description
   - Sleek, minimal design focused on clarity

### Implementation Details
- Gallery panel uses same visibility pattern as Settings panel (hidden/visible classes)
- Tab navigation system matches Settings panel tab system
- Gallery grid uses CSS Grid with auto-fill for responsive layout
- Mobile-responsive with smaller grid items on narrow screens
- Gallery button styling follows STYLE_GUIDE.md patterns
- Pauses countdown timer when gallery panel opens

### Files Modified
- `index.html` - Added gallery panel HTML structure
- `css/style.css` - Added gallery panel and button styling
- `js/ui.js` - Added `setupGalleryPanel()` and `setupGalleryTabs()` functions

### Design Philosophy
- Kept it simple and sleek as requested
- Only the 4 requested categories (no extras)
- Clean card-based layout
- Consistent with existing UI design language
- Christmas theme maintained throughout

## 2025-01-XX: Loading Screen Bug Fixes

### Issues
1. **Loading Screen Not Hiding Menu**: The loading screen was not properly covering the main menu during world generation. Menu elements were visible behind/around the loading screen.
2. **Menu Flash After Generation**: After world generation completed, the main menu would briefly appear for ~600ms before entering first-person mode, creating a jarring transition.

### Root Causes
1. CSS structure issue: Loading screen base styles (position, size, background) were only in the `.world-loading-screen-hidden` class, causing them to be lost when switching to visible state.
2. Operation order issue: The code was hiding the loading screen *before* entering first-person mode, revealing the menu world during the transition delay.

### Solutions
1. **CSS Refactor** (`css/style.css`):
   - Moved base styles (position: fixed, width: 100%, height: 100%, background, etc.) to `#world-loading-screen` ID selector
   - Visibility classes now only control display, opacity, visibility, and z-index
   - Ensures loading screen always has proper dimensions and background

2. **UI Element Hiding** (`js/loading-screen.js`):
   - `showLoadingScreen()` now uses `!important` inline styles to force hide ALL UI elements
   - Targets: title-screen, menu-container, menu buttons, news-reel, audio-warning, UI buttons, panels, tech panel, countdown timer
   - Prevents any UI from showing through during generation

3. **Operation Order Fix** (`js/ui.js`):
   - Reordered operations: `enterFirstPersonMode()` now called *before* `hideLoadingScreen()`
   - Removed the 600ms delay that was causing the menu flash
   - Result: Game world is activated behind the loading screen, then loading screen fades out revealing game

4. **Smooth Fade-Out** (`js/loading-screen.js`):
   - `hideLoadingScreen()` now maintains `display: flex` during transition
   - Allows CSS opacity transition to work properly (0.5s fade)
   - Sets `display: none` after transition completes for complete removal

### Files Modified
- `css/style.css` - Refactored loading screen CSS structure
- `js/loading-screen.js` - Enhanced UI hiding with !important styles, restored fade-out transition
- `js/ui.js` - Fixed operation order (enter first-person mode before hiding loading screen)

### Result
- Loading screen now completely covers menu during generation
- Seamless transition from loading directly to gameplay
- No menu flash or visible menu world during transition
- Smooth fade-out animation when entering game

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

## 2025-01-XX: WASD Movement and Keybind System

### Implementation
1. **Keybind Configuration System** (`js/config.js`):
   - Default keybind mappings (W, A, S, D, Space)
   - `loadKeybinds()`: Loads from localStorage or returns defaults
   - `saveKeybinds()`: Saves to localStorage
   - `getKeyDisplayName()`: Converts key codes to display names
   - Key display name mapping for common keys (W, A, S, D, Space, Arrow keys, modifiers)

2. **Movement System** (`js/first-person-controls.js`):
   - Movement state tracking (keys currently pressed)
   - Movement constants: speed (5.0), jump speed (8.0), gravity (20.0), eye height (1.6)
   - `updateMovement(deltaTime)`: Calculates movement direction based on camera rotation
   - Ground collision using `getGroundHeight()` callback
   - Keyboard event listeners (keydown/keyup) that reload keybinds dynamically
   - Movement respects camera rotation (forward = camera direction)
   - Horizontal movement normalized to prevent faster diagonal movement
   - Vertical movement with gravity and jump mechanics

3. **Movement Integration** (`js/main.js`):
   - DeltaTime calculation in animation loop (capped at 100ms)
   - `updateMovement(deltaTime)` called in first-person mode
   - Ground collision callback passed to FirstPersonControls constructor
   - Keybinds reloaded when entering first-person mode

4. **Interactive Keybind UI** (`js/ui.js`):
   - `setupControlsPanel()`: Initializes keybind UI
   - Loads and displays current keybinds from localStorage
   - Click-to-change functionality on `.keybind-key` elements
   - "Listening" state with visual feedback (CSS class)
   - One-time keydown listener for keybind capture
   - Duplicate keybind prevention with conflict message
   - Automatic UI update and localStorage save
   - Escape key to cancel keybind change

5. **Visual Feedback** (`css/style.css`):
   - `.keybind-key.listening` class with pulsing animation
   - Orange glow effect (color: #ffaa00) with box-shadow
   - `@keyframes keybindPulse`: 1.5s infinite animation
   - Scale transform (1.05) for emphasis
   - Smooth transitions for state changes
   - Hover effects work with listening state

6. **HTML Structure** (`index.html`):
   - Added `data-keybind` attributes to keybind items
   - Identifies movement actions (forward, backward, left, right, jump)

### Features
- ✅ WASD movement with configurable keybinds
- ✅ Ground collision detection
- ✅ Jump mechanics with gravity
- ✅ Frame-independent movement (deltaTime)
- ✅ Interactive keybind UI with visual feedback
- ✅ localStorage persistence
- ✅ Dynamic keybind reloading (no restart needed)
- ✅ Duplicate keybind prevention
- ✅ Key display name mapping for UI

### Technical Details
- Movement speed: 5.0 units/second
- Jump speed: 8.0 units/second (initial velocity)
- Gravity: 20.0 units/s²
- Player eye height: 1.6 units above ground
- DeltaTime capped at 100ms to prevent large jumps on frame drops
- Keybinds reloaded on each key press for immediate effect
- Movement only active when pointer is locked (first-person mode)