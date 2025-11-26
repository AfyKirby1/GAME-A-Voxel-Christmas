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
  - **UI Toggle Observer**: Listens to `#ui-toggle` button clicks to show/hide title screen.
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
1. **UI Toggle Button** (`js/ui.js:121-132`)
   - **Element**: `#ui-toggle`
   - **Event**: `click`
   - **Actions**:
     - Toggles `uiVisible` state
     - Updates `#title-screen` opacity and pointer-events
     - Updates button text between "Hide UI" and "Show UI"
   - **Connection**: Direct DOM manipulation of title screen visibility

2. **Fullscreen Button** (`js/ui.js:135-145`)
   - **Element**: `#fullscreen-btn`
   - **Event**: `click`
   - **Actions**:
     - Requests fullscreen mode if not active
     - Exits fullscreen if active
     - Handles errors gracefully
   - **Connection**: Browser Fullscreen API integration

3. **Quit Button** (`js/ui.js:298-308`)
   - **Element**: `#quit-btn`
   - **Event**: `click`
   - **Actions**:
     - Sends "quit" message to C# wrapper via `window.chrome.webview.postMessage('quit')`
     - Falls back to `window.close()` if WebView2 API not available
   - **Connection**: WebView2 message communication to C# (`Program.cs:68-79`), which closes the application form

4. **Tech Panel Toggle** (`js/ui.js:16-26`)
   - **Element**: `#tech-toggle-btn`
   - **Event**: `click`
   - **Actions**:
     - Toggles `panelVisible` state
     - Adds/removes `tech-panel-visible` and `tech-panel-hidden` classes
   - **Connection**: CSS class-based visibility control

5. **Play Button** (`js/ui.js:58-62`)
   - **Element**: `#play-btn`
   - **Event**: `click`
   - **Actions**:
     - Shows world generation panel
     - Removes `world-gen-panel-hidden` class
     - Adds `world-gen-panel-visible` class
   - **Connection**: Triggers world generation UI flow

6. **Close World Gen Panel** (`js/ui.js:66-71`)
   - **Element**: `#close-world-gen`
   - **Event**: `click`
   - **Actions**:
     - Hides world generation panel
     - Removes `world-gen-panel-visible` class
     - Adds `world-gen-panel-hidden` class
   - **Connection**: Closes world generation UI flow

7. **Generate World Button** (`js/ui.js:75-111`)
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
