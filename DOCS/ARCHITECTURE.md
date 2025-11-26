# Architecture Overview

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
  - **Note**: The UI shows a WebGPU check, but the scene currently renders using WebGL for maximum compatibility.
- **`js/world-gen.js`**: Procedural generation logic for the terrain, house, and trees. Uses InstancedMesh for performance.
- **`js/particles.js`**: Manages `SnowSystem` and `LeafSystem`.
- **`js/ui.js`**: Handles DOM event listeners and WebGPU capability checking.
