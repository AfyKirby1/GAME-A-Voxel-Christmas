# Architecture Overview

## Distribution

The application can be packaged as a Windows executable using WebView2:
- **Wrapper**: .NET WinForms application (`Program.cs`)
- **Runtime**: WebView2 (lightweight, ~1-5MB package)
- **Packaging**: Scripts in `portable/` folder create distributable packages
- **Output**: Fullscreen application that loads `index.html` in WebView2
- **Communication**: JavaScript-to-C# message passing via `window.chrome.webview.postMessage()` for application control (e.g., quit button)

## Core Components

### 1. Entry Point (`index.html`)
- Loads styles from `css/style.css`.
- Imports `js/main.js` as the module entry point.
- Provides the basic DOM structure for UI overlays.

### 2. Main Logic (`js/main.js`)
- Orchestrates the initialization sequence.
- Manages the main animation loop (`animate`).
- Integrates the Scene, World Generation, Particles, and UI.

### 3. Configuration (`js/config.js`)
- Centralized configuration object `SCENE_OPTS`.
- Allows easy tuning of procedural generation parameters (radius, counts, colors).

### 4. Modules
- **`js/scene-setup.js`**: Boilerplate Three.js setup.
  - **Renderer**: Uses `THREE.WebGLRenderer` (Standard WebGL).
  - **Post-Processing**: Uses `EffectComposer` with `UnrealBloomPass` for bloom effects.
  - **Window Resize Observer**: Listens to `window.resize` event to update camera aspect ratio, renderer size, and composer size.
- **`js/world-gen.js`**: Procedural generation logic for the terrain, house, and trees. Uses InstancedMesh for performance.
- **`js/particles.js`**: Manages `SnowSystem` and `LeafSystem`.
- **`js/ui.js`**: Handles DOM event listeners and UI controls.
  - **News Reel Snowflakes**: Dynamic JavaScript system that spawns snowflakes at random positions with falling animations.
  - **UI State Management**: Shared module-level state (`uiVisible`) and functions (`hideUI()`, `showUI()`) for unified UI visibility control.
  - **Countdown Timer**: 5-second countdown after splash dismissal that auto-hides UI, removing all buttons from layout and disabling interactions.
  - **UI Toggle Observer**: Listens to `#ui-toggle` button clicks to show/hide title screen manually.
  - **Double-Click Wake**: Document-level double-click listener that restores UI when hidden (works after both manual hide and auto-hide).
  - **Interaction Disabling**: When UI is hidden, applies `ui-hidden` class and `pointer-events: none` to all menu buttons, preventing hover effects and clicks.
  - **Fullscreen Observer**: Listens to `#fullscreen-btn` clicks to toggle fullscreen mode.
  - **Quit Button Observer**: Listens to `#quit-btn` clicks and sends "quit" message to C# wrapper via `window.chrome.webview.postMessage()` to close the application.
  - **Tech Panel Observer**: Listens to `#tech-toggle-btn` clicks to toggle tech info panel visibility.
  - **World Gen Panel Observer**: Listens to `#play-btn` clicks to show world generation panel.
  - **Close Panel Observer**: Listens to `#close-world-gen` clicks to hide world generation panel.
  - **Generate Button Observer**: Listens to `#generate-world-btn` clicks to simulate world generation progress.

## Event Observers & Connections

### Window-Level Observers
1. **Resize Observer** (`js/scene-setup.js:65-70`)
   - **Event**: `window.resize`
   - **Actions**:
     - Updates camera aspect ratio
     - Updates camera projection matrix
     - Resizes renderer to match window dimensions
     - Resizes EffectComposer to match window dimensions
   - **Connection**: Direct connection between window events and Three.js rendering pipeline

### UI Button Observers
1. **UI Toggle Button** (`js/ui.js:401-408`)
   - **Element**: `#ui-toggle`
   - **Event**: `click`
   - **Actions**:
     - Calls shared `hideUI()` or `showUI()` functions based on `uiVisible` state
     - Updates button text between "Hide UI" and "Show UI"
     - Updates `#title-screen` opacity, pointer-events, and `ui-hidden` class
     - Disables/enables menu buttons with proper interaction blocking
   - **Connection**: Uses shared UI state management for consistency

2. **Double-Click Wake** (`js/ui.js:410-416`)
   - **Element**: `document` (global listener)
   - **Event**: `dblclick`
   - **Actions**:
     - Checks if UI is hidden (`!uiVisible`)
     - Verifies click is not on UI elements (title-screen, buttons)
     - Calls `showUI()` to restore all UI elements
     - Works after both manual hide and auto-hide scenarios
   - **Connection**: Global event listener that restores UI state

3. **Countdown Timer Auto-Hide** (`js/ui.js:170-248`)
   - **Element**: `#countdown-timer`
   - **Event**: Interval timer (1 second intervals)
   - **Actions**:
     - Counts down from 5 to 0
     - Shows visual feedback (warning/critical states at 3 and 1)
     - When countdown reaches 0:
       - Removes timer from DOM
       - Calls shared `hideUI()` function to maintain state consistency
       - Hides all UI buttons (ui-toggle, fullscreen, tech, quit) with complete layout removal
       - Hides news reel with fade-out transition
   - **Connection**: Auto-hide triggers shared UI state management for unified behavior

4. **Fullscreen Button** (`js/ui.js:419-429`)
   - **Element**: `#fullscreen-btn`
   - **Event**: `click`
   - **Actions**:
     - Requests fullscreen mode if not active
     - Exits fullscreen if active
     - Handles errors gracefully
   - **Connection**: Browser Fullscreen API integration

5. **Quit Button** (`js/ui.js:431-443`)
   - **Element**: `#quit-btn`
   - **Event**: `click`
   - **Actions**:
     - Sends "quit" message to C# wrapper via `window.chrome.webview.postMessage('quit')`
     - Falls back to `window.close()` if WebView2 API not available
   - **Connection**: WebView2 message communication to C# (`Program.cs:68-79`), which closes the application form

6. **Tech Panel Toggle** (`js/ui.js:1-27`)
   - **Element**: `#tech-toggle-btn`
   - **Event**: `click`
   - **Actions**:
     - Toggles `panelVisible` state
     - Adds/removes `tech-panel-visible` and `tech-panel-hidden` classes
   - **Connection**: CSS class-based visibility control

7. **Play Button** (`js/ui.js:58-62`)
   - **Element**: `#play-btn`
   - **Event**: `click`
   - **Actions**:
     - Shows world generation panel
     - Removes `world-gen-panel-hidden` class
     - Adds `world-gen-panel-visible` class
   - **Connection**: Triggers world generation UI flow

8. **Close World Gen Panel** (`js/ui.js:66-71`)
   - **Element**: `#close-world-gen`
   - **Event**: `click`
   - **Actions**:
     - Hides world generation panel
     - Removes `world-gen-panel-visible` class
     - Adds `world-gen-panel-hidden` class
   - **Connection**: Closes world generation UI flow

9. **Generate World Button** (`js/ui.js:75-111`)
   - **Element**: `#generate-world-btn`
   - **Event**: `click`
   - **Actions**:
     - Resets progress bar to 0%
     - Updates progress text through stages:
       - "Generating terrain..." (0-30%)
       - "Placing trees..." (30-60%)
       - "Adding particles..." (60-90%)
       - "Finalizing..." (90-100%)
       - "World generated!" (100%)
     - Disables button and changes text to "World Ready"
     - Auto-closes panel after 1 second
   - **Connection**: Simulates world generation process with visual feedback

### Data Flow Connections

1. **Config → UI** (`js/ui.js:45-55`)
   - Dynamically imports `SCENE_OPTS` from `config.js`
   - Populates world generation panel with current configuration values:
     - World size (radius)
     - Tree count
     - Snow particle count
     - Leaf count
   - **Connection**: One-way data flow from config to UI display

2. **Main Loop → Particle Manager** (`js/main.js:45-47`)
   - Animation loop calls `particleManager.update()` every frame
   - **Connection**: Continuous update cycle for particle systems

3. **Main Loop → Controls** (`js/main.js:43`)
   - Animation loop calls `controls.update()` every frame
   - **Connection**: Continuous camera control updates (damping, auto-rotate)

4. **Main Loop → Composer** (`js/main.js:50`)
   - Animation loop calls `composer.render()` every frame
   - **Connection**: Post-processing pipeline rendering

## UI State Management

The UI system uses a unified state management approach for consistent behavior across different hide/show scenarios.

### Shared State (`js/ui.js:324-395`)
- **Module-level `uiVisible` variable**: Boolean flag tracking UI visibility state
- **Global `hideUI()` function**: Centralized function to hide UI that:
  - Sets `uiVisible = false`
  - Applies `ui-hidden` class to title screen and menu elements
  - Disables pointer events on all interactive elements
  - Updates UI toggle button text to "Show UI"
- **Global `showUI()` function**: Centralized function to show UI that:
  - Sets `uiVisible = true`
  - Removes `ui-hidden` class from all elements
  - Restores pointer events on interactive elements
  - Restores display, opacity, and positioning of hidden elements
  - Restores news reel, audio warning, and all UI buttons
  - Updates UI toggle button text to "Hide UI"

### CSS Interaction Blocking (`css/style.css:236-263`)
- **`.ui-hidden` class**: Applied to elements when UI is hidden
  - `pointer-events: none !important` - Prevents all mouse interactions
  - `cursor: default !important` - Removes pointer cursor
  - `opacity: 0 !important` - Hides visual elements
- **Hover effect disabling**: CSS rules prevent hover states on hidden elements
- **Nested element blocking**: `ui-hidden *` selector ensures all child elements are also blocked

### Hide/Show Scenarios

1. **Manual Hide** (via UI Toggle Button):
   - User clicks "Hide UI" button
   - Calls `hideUI()` function
   - UI fades out, buttons remain in DOM but disabled

2. **Auto-Hide** (via Countdown Timer):
   - After 5-second countdown completes
   - Calls `hideUI()` function to maintain state consistency
   - Additionally removes UI buttons from layout completely (display: none, positioned off-screen)
   - Hides news reel with fade transition

3. **Wake** (via Double-Click):
   - User double-clicks anywhere on canvas
   - Global double-click listener checks `uiVisible` state
   - If hidden, calls `showUI()` function
   - Restores all UI elements including news reel, audio warning, and button positions
   - Works identically for both manual hide and auto-hide scenarios

### Element Restoration
When `showUI()` is called, it ensures complete restoration:
- Title screen opacity and pointer events
- Menu container and all menu buttons
- News reel display, opacity, and pointer events
- Audio warning positioning and visibility
- All UI control buttons (Hide UI, Fullscreen, Tech, Quit)
- Removes all `ui-hidden` classes
- Resets inline styles to CSS defaults where needed
