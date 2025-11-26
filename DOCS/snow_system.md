# Snow System Documentation

This document outlines the configuration and behavior of the snow particle system used in `index.html`.

## Configuration

The primary settings for the snow system are located in `js/config.js` within the `SCENE_OPTS` object.

### Key Settings

- **`snowCount`**: Controls the total number of snow particles in the scene.
  - **Current Value**: `3000`
  - **Location**: `js/config.js`
  - **Impact**: Higher values create a denser snowstorm but may impact performance. Lower values create a light flurry.

## Implementation Details

The snow system is implemented in `js/particles.js` within the `ParticleManager` class.

### Initialization (`initSnow`)
- **Geometry**: Uses a `THREE.BufferGeometry` with `snowCount` vertices.
- **Positioning**: Particles are spawned randomly within a volume defined by `worldRadius * 2.5`.
- **Material**: Uses `THREE.PointsMaterial` with:
  - Color: White (`0xffffff`)
  - Size: `0.25`
  - Opacity: `0.8` (Transparent)

### Animation (`update`)
- **Vertical Movement**: Each particle falls at a random speed between `0.05` and `0.15` units per frame.
- **Horizontal Sway**: Particles sway slightly using a sine wave function based on time and their index.
- **Looping**: When a particle falls below `y = -2`, it is reset to `y = 30` to create a continuous loop.

## How to Adjust

To change the density of the snow:
1. Open `js/config.js`.
2. Modify the `snowCount` value in `SCENE_OPTS`.
3. Save the file and refresh `index.html`.

To change the speed or size:
1. Open `js/particles.js`.
2. Modify `snowVelocities` calculation in `initSnow()` for speed.
3. Modify `size` in the `THREE.PointsMaterial` for particle size.
