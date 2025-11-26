# Three.js 181.2 Research Database

**Version:** 181.2  
**Last Updated:** Based on Context7 MCP research  
**Purpose:** Comprehensive implementation guide for Three.js 181.2 features

---

## Table of Contents

1. [Version 181.2 Breaking Changes](#version-1812-breaking-changes)
2. [Core Setup: Scene, Camera, Renderer](#core-setup-scene-camera-renderer)
3. [WebGPU Renderer](#webgpu-renderer)
4. [PBR Materials](#pbr-materials)
5. [Node Material System (TSL)](#node-material-system-tsl)
6. [Geometry and Instancing](#geometry-and-instancing)
7. [Textures and Loaders](#textures-and-loaders)
8. [Best Practices](#best-practices)

---

## Version 181.2 Breaking Changes

### WebGPU Renderer Changes

**CRITICAL:** Asynchronous methods have been deprecated. You MUST initialize the renderer before using synchronous methods.

#### Deprecated Methods
- `renderAsync()` → Use `render()` after `await renderer.init()`
- `computeAsync()` → Use `compute()` after `await renderer.init()`
- `clearAsync()` → Use `clear()` after `await renderer.init()`
- `initTextureAsync()` → Use `initTexture()` after `await renderer.init()`
- `hasFeatureAsync()` → Use `hasFeature()` after `await renderer.init()`
- `waitForGPU()` → **REMOVED** - No longer exists

#### Initialization Pattern

```javascript
// CORRECT: Initialize before use
const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
await renderer.init(); // CRITICAL: Must await initialization
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// OR: Automatic initialization in animation loop
renderer.setAnimationLoop(animate); // Initializes automatically
```

### KTX2Loader Changes

```javascript
// OLD (deprecated):
await loader.detectSupportAsync(renderer);

// NEW (correct):
await renderer.init(); // Initialize renderer first
loader.detectSupport(renderer); // Synchronous after init
```

### TSL (Three.js Shading Language) Changes

- `PI2` → **Renamed to** `TWO_PI`

```javascript
// OLD
import { PI2 } from 'three/tsl';

// NEW
import { TWO_PI } from 'three/tsl';
```

### Node Material System Changes

#### GTAONode Optimization
- AO render target now only accessible in `r` channel
- Updated blend formula required:

```javascript
// NEW blend formula for AO
vec4(scenePassColor.rgb.mul(aoPass.r), scenePassColor.a);
```

#### PassNode Method Renaming
- `setResolution()` → `setResolutionScale()`
- `getResolution()` → `getResolutionScale()`

#### AfterImageNode Property Change
- `damp` property is now `Node<float>` type
- Can accept node constants or uniform nodes, not just numbers

```javascript
// OLD
afterImage(damp: 0.9);

// NEW
afterImage(damp: uniform(0.9)); // or float(0.9)
```

### WaterMesh Property Renaming
- `resolution` → `resolutionScale`

### PBR Material Improvements

#### Indirect Specular Light Computation
- Enhanced computation method for indirect specular light
- Results in subtle appearance changes in PBR materials

#### Energy Conservation
- Improved energy conservation, especially for materials with `roughness > 0.5`
- Rough materials appear slightly brighter (more physically accurate)

#### PMREM Reflections
- Enhanced PMREM (Prefiltered Mipmapped Radiance Environment Map) reflections
- Better quality and realism

### Documentation Changes
- New JSDoc-based API documentation
- Improved search functionality
- Better type information
- **Internationalization discontinued** - Documentation now English-only

---

## Core Setup: Scene, Camera, Renderer

### Basic WebGPU Setup

```javascript
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Inspector } from 'three/addons/inspector/Inspector.js';

let camera, scene, renderer, controls;

async function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        45,                                    // FOV
        window.innerWidth / window.innerHeight, // Aspect
        0.1,                                   // Near
        1000                                   // Far
    );
    camera.position.set(0, 0, 10);
    
    // Renderer - CRITICAL: Must await init()
    renderer = new THREE.WebGPURenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    await renderer.init(); // REQUIRED in 181.2
    renderer.setAnimationLoop(animate);
    renderer.inspector = new Inspector(); // Debug tool
    document.body.appendChild(renderer.domElement);
    
    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Resize handler
    window.addEventListener('resize', onWindowResize);
}

function animate() {
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
```

### Renderer Configuration Options

```javascript
const renderer = new THREE.WebGPURenderer({
    antialias: true,              // Enable antialiasing
    forceWebGL: false,            // Force WebGL fallback
    colorBufferType: THREE.UnsignedByteType,
    multiview: false              // For XR
});
```

### Tone Mapping

```javascript
// Available tone mapping modes
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0; // Adjust exposure
```

### Shadow Mapping

```javascript
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

---

## WebGPU Renderer

### Initialization Patterns

#### Pattern 1: Explicit Initialization (Recommended)

```javascript
const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
await renderer.init(); // Explicit initialization
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
```

#### Pattern 2: Automatic Initialization

```javascript
const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate); // Auto-initializes
document.body.appendChild(renderer.domElement);
```

### WebGPU Availability Check

```javascript
import WebGPU from 'three/addons/capabilities/WebGPU.js';

if (WebGPU.isAvailable() === false) {
    document.body.appendChild(WebGPU.getErrorMessage());
    throw new Error('No WebGPU support');
}
```

### Inspector (Debug Tool)

```javascript
renderer.inspector = new Inspector();
const gui = renderer.inspector.createParameters('Settings');
gui.add(api, 'count', 1, 1000, 1);
```

### Renderer Methods (Post-Init)

```javascript
// All these work AFTER await renderer.init()
renderer.render(scene, camera);
renderer.compute(computePass);
renderer.clear();
renderer.setRenderTarget(target);
renderer.setSize(width, height);
renderer.setPixelRatio(ratio);
```

---

## PBR Materials

### MeshStandardMaterial

```javascript
const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.5,
    roughness: 0.5,
    
    // Texture maps
    map: diffuseTexture,
    normalMap: normalTexture,
    normalScale: new THREE.Vector2(1, 1),
    metalnessMap: metalnessTexture,
    roughnessMap: roughnessTexture,
    aoMap: aoTexture,
    aoMapIntensity: 1.0,
    
    // Environment
    envMap: environmentTexture,
    envMapIntensity: 1.0,
    
    // Other properties
    side: THREE.FrontSide,
    flatShading: false,
    wireframe: false,
    transparent: false,
    opacity: 1.0
});
```

### MeshPhysicalMaterial (Extended PBR)

```javascript
const material = new THREE.MeshPhysicalMaterial({
    // Inherits all MeshStandardMaterial properties
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.1,
    
    // Advanced properties
    transmission: 1.0,              // Glass transparency (0-1)
    thickness: 0.5,                 // Refraction depth
    ior: 1.5,                       // Index of refraction
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    
    // Clearcoat (car paint effect)
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    clearcoatNormalMap: clearcoatNormalTexture,
    clearcoatNormalScale: new THREE.Vector2(1, -1),
    
    // Sheen (fabric effect)
    sheen: 0.5,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(0xff0000),
    
    // Iridescence (soap bubble effect)
    iridescence: 1.0,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 400],
    
    // Attenuation (for transmission)
    attenuationColor: new THREE.Color(0xffffff),
    attenuationDistance: 1.0,
    
    envMap: scene.environment,
    envMapIntensity: 1.0
});
```

### Material Property Updates

```javascript
// After creating material, update properties
material.needsUpdate = true; // Force shader recompilation

// Common updates
material.transparent = true;
material.opacity = 0.5;
material.depthWrite = false; // For transparency
```

### Environment Maps

```javascript
// Using PMREMGenerator for environment maps
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envMap = pmremGenerator.fromScene(roomEnvironment).texture;
scene.environment = envMap;
pmremGenerator.dispose(); // Clean up
```

---

## Node Material System (TSL)

### Import TSL

```javascript
import * as THREE from 'three/webgpu';
import {
    color, vec2, vec3, vec4,
    float, uniform, uniformArray,
    texture, uv, time,
    positionLocal, positionWorld,
    normalLocal, normalWorld, normalView,
    mix, add, mul, div, sub,
    Fn, If, Loop,
    PI, TWO_PI, // Note: PI2 renamed to TWO_PI
    screenUV, screenCoordinate, screenSize
} from 'three/tsl';
```

### Basic Node Material

```javascript
const material = new THREE.MeshBasicNodeMaterial();

// Simple color
material.colorNode = color(0x0066ff);

// Texture
material.colorNode = texture(uvTexture, uv());

// Uniform
const myColor = uniform(new THREE.Color(0x0066ff));
material.colorNode = myColor;
```

### Advanced Node Material Examples

#### Animated UV

```javascript
const material = new THREE.MeshBasicNodeMaterial();
const timerScaleNode = time.mul(vec2(-0.5, 0.1));
const animateUV = uv().add(timerScaleNode);
const textureNode = texture(uvTexture, animateUV);
material.colorNode = mix(textureNode, checker(animateUV), 0.5);
```

#### Custom Function Node

```javascript
const customColor = Fn(({ material, geometry, object }) => {
    if (material.userData.customColor !== undefined) {
        return uniform(material.userData.customColor);
    }
    return vec3(0);
});

material.colorNode = customColor();
```

#### Conditional Logic

```javascript
material.colorNode = Fn(() => {
    const index = uint(uv().x.mul(size).floor()).toVar();
    If(index.greaterThanEqual(size), () => {
        index.assign(uint(size).sub(1));
    });
    // ... more logic
    return color;
})();
```

### Node Material Types

```javascript
// Basic
new THREE.MeshBasicNodeMaterial()

// Standard (PBR)
new THREE.MeshStandardNodeMaterial()

// Physical (Extended PBR)
new THREE.MeshPhysicalNodeMaterial()

// Phong
new THREE.MeshPhongNodeMaterial()

// Points
new THREE.PointsNodeMaterial()

// Sprite
new THREE.SpriteNodeMaterial()
```

### TSL Built-in Functions

#### Math Operations
- `add()`, `sub()`, `mul()`, `div()`
- `sin()`, `cos()`, `tan()`, `atan()`, `atan2()`
- `pow()`, `sqrt()`, `exp()`, `log()`
- `abs()`, `floor()`, `ceil()`, `round()`
- `min()`, `max()`, `clamp()`, `saturate()`
- `mix()`, `smoothstep()`, `step()`

#### Texture Functions
- `texture(texture, uv)`
- `cubeTexture(texture, uvw)`
- `triplanarTexture(textureX, textureY, textureZ, scale)`

#### Vector Operations
- `normalize()`, `length()`, `distance()`
- `dot()`, `cross()`
- `reflect()`, `refract()`

#### Noise Functions
- `simplexNoise()`, `perlinNoise()`, `cellularNoise()`

### Instanced Attributes

```javascript
const positionAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(positions), 3
);

const instancePosition = instancedBufferAttribute(positionAttribute);
material.positionNode = instancePosition.add(positionLocal);
```

### Storage Buffers

```javascript
const storageBuffer = new THREE.StorageInstancedBufferAttribute(array, 1);
const storage = storage(storageBuffer, 'uint', size)
    .setPBO(true)
    .setName('Elements');

material.colorNode = storage.element(instanceIndex);
```

---

## Geometry and Instancing

### BufferGeometry Basics

```javascript
const geometry = new THREE.BufferGeometry();

// Position attribute
const positions = new Float32Array([
    -1, -1,  1,  // v0
     1, -1,  1,  // v1
     1,  1,  1,  // v2
    -1,  1,  1   // v3
]);
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Normal attribute
const normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1
]);
geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

// UV attribute
const uvs = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    0, 1
]);
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

// Index (optional, for indexed drawing)
const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
geometry.setIndex(indices);

// Compute bounding volumes
geometry.computeBoundingBox();
geometry.computeBoundingSphere();
```

### Dynamic Geometry

```javascript
const positionAttribute = new THREE.BufferAttribute(positions, 3);
positionAttribute.setUsage(THREE.DynamicDrawUsage); // Allow updates
geometry.setAttribute('position', positionAttribute);

// Update positions
for (let i = 0; i < positionAttribute.count; i++) {
    positionAttribute.setXYZ(i, x, y, z);
}
positionAttribute.needsUpdate = true;
```

### InstancedMesh

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const mesh = new THREE.InstancedMesh(geometry, material, 10000);

const matrix = new THREE.Matrix4();
const dummy = new THREE.Object3D();

for (let i = 0; i < 10000; i++) {
    dummy.position.set(
        Math.random() * 50 - 25,
        Math.random() * 50 - 25,
        Math.random() * 50 - 25
    );
    dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    dummy.scale.setScalar(Math.random() * 2 + 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
}

mesh.instanceMatrix.needsUpdate = true;
scene.add(mesh);
```

### Instanced Attributes

```javascript
const geometry = new THREE.IcosahedronGeometry(0.1);
const material = new THREE.MeshStandardNodeMaterial();

// Create instanced attributes
const positions = [];
const colors = [];
const times = [];

for (let i = 0; i < count; i++) {
    positions.push(x, y, z);
    colors.push(r, g, b);
    times.push(t);
}

const positionAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(positions), 3
);
const colorAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(colors), 3
);
const timeAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(times), 1
);

// Use in TSL
const instancePosition = instancedBufferAttribute(positionAttribute);
const instanceColor = instancedBufferAttribute(colorAttribute);
const instanceTime = instancedBufferAttribute(timeAttribute);

material.positionNode = instancePosition.add(positionLocal);
material.colorNode = instanceColor;
```

### BatchedMesh (Multiple Geometries)

```javascript
import { BatchedMesh } from 'three/addons/objects/BatchedMesh.js';

const box = new THREE.BoxGeometry(1, 1, 1);
const sphere = new THREE.SphereGeometry(1, 12, 12);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const batchedMesh = new BatchedMesh(10, 5000, 10000, material);

// Add geometries
const boxGeometryId = batchedMesh.addGeometry(box);
const sphereGeometryId = batchedMesh.addGeometry(sphere);

// Create instances
const boxInstance1 = batchedMesh.addInstance(boxGeometryId);
const boxInstance2 = batchedMesh.addInstance(boxGeometryId);
const sphereInstance1 = batchedMesh.addInstance(sphereGeometryId);

// Position instances
const matrix = new THREE.Matrix4();
matrix.setPosition(0, 0, 0);
batchedMesh.setMatrixAt(boxInstance1, matrix);

scene.add(batchedMesh);
```

---

## Textures and Loaders

### TextureLoader

```javascript
const loader = new THREE.TextureLoader();

// Basic load
const texture = loader.load('textures/diffuse.jpg');

// With callbacks
const texture = loader.load(
    'textures/diffuse.jpg',
    (texture) => {
        console.log('Loaded');
        texture.colorSpace = THREE.SRGBColorSpace;
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error:', error);
    }
);

// Async/await
const texture = await loader.loadAsync('textures/diffuse.jpg');
texture.colorSpace = THREE.SRGBColorSpace;
```

### Texture Configuration

```javascript
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 4);
texture.offset.set(0.5, 0.5);
texture.rotation = Math.PI / 4;
texture.center.set(0.5, 0.5);
texture.colorSpace = THREE.SRGBColorSpace; // For color textures
texture.magFilter = THREE.LinearFilter;
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
texture.generateMipmaps = true;
texture.needsUpdate = true;
```

### CubeTextureLoader

```javascript
const loader = new THREE.CubeTextureLoader()
    .setPath('textures/cubeMaps/');

const cubeTexture = await loader.loadAsync([
    'px.png', 'nx.png',
    'py.png', 'ny.png',
    'pz.png', 'nz.png'
]);

cubeTexture.colorSpace = THREE.SRGBColorSpace;
cubeTexture.mapping = THREE.CubeReflectionMapping;
scene.background = cubeTexture;
scene.environment = cubeTexture;
```

### HDRLoader

```javascript
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

const loader = new HDRLoader();
const texture = await loader.loadAsync('textures/environment.hdr');
texture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = texture;
scene.environment = texture;
```

### KTX2Loader (Compressed Textures)

```javascript
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

const loader = new KTX2Loader()
    .setTranscoderPath('jsm/libs/basis/')
    .setPath('textures/ktx2/');

// CRITICAL: Must initialize renderer first
await renderer.init();
loader.detectSupport(renderer); // Synchronous after init

const texture = await loader.loadAsync('diffuse.ktx2');
texture.colorSpace = THREE.SRGBColorSpace;
```

### EXRLoader

```javascript
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

const loader = new EXRLoader();
const texture = await loader.loadAsync('textures/memorial.exr');
// EXR is HDR, no colorSpace needed
```

### LoadingManager

```javascript
const manager = new THREE.LoadingManager();

manager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log('Started loading:', url);
};

manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log(`Loading: ${itemsLoaded}/${itemsTotal}`);
};

manager.onLoad = () => {
    console.log('All textures loaded');
};

manager.onError = (url) => {
    console.error('Error loading:', url);
};

const loader = new THREE.TextureLoader(manager);
const texture1 = loader.load('texture1.jpg');
const texture2 = loader.load('texture2.jpg');
```

### Video Texture

```javascript
const video = document.createElement('video');
video.src = 'textures/video.mp4';
video.loop = true;
video.muted = true;
video.play();

const videoTexture = new THREE.VideoTexture(video);
videoTexture.colorSpace = THREE.SRGBColorSpace;
```

### Canvas Texture (Procedural)

```javascript
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ff0000';
ctx.fillRect(0, 0, 512, 512);

const canvasTexture = new THREE.CanvasTexture(canvas);
canvasTexture.needsUpdate = true; // Update when canvas changes
```

---

## Best Practices

### Performance

1. **Use InstancedMesh for many similar objects**
   ```javascript
   const mesh = new THREE.InstancedMesh(geometry, material, count);
   ```

2. **Use BatchedMesh for multiple geometries**
   ```javascript
   const batchedMesh = new BatchedMesh(maxGeometryCount, maxInstanceCount, maxVertexCount, material);
   ```

3. **Set appropriate buffer usage**
   ```javascript
   attribute.setUsage(THREE.StaticDrawUsage); // Static data
   attribute.setUsage(THREE.DynamicDrawUsage); // Frequently updated
   ```

4. **Dispose resources**
   ```javascript
   geometry.dispose();
   material.dispose();
   texture.dispose();
   ```

### Memory Management

```javascript
// Clean up before removing objects
object.traverse((child) => {
    if (child.material) {
        if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
        } else {
            child.material.dispose();
        }
    }
    if (child.geometry) child.geometry.dispose();
});
scene.remove(object);
```

### Error Handling

```javascript
try {
    await renderer.init();
} catch (error) {
    console.error('Renderer initialization failed:', error);
    // Fallback to WebGL
    renderer = new THREE.WebGLRenderer({ antialias: true });
}
```

### Responsive Rendering

```javascript
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function render() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
}
```

### Color Space

```javascript
// Always set colorSpace for color textures
texture.colorSpace = THREE.SRGBColorSpace; // For sRGB images (JPG, PNG)
// No colorSpace for data textures (normal maps, height maps, etc.)
```

### Material Updates

```javascript
// When changing material properties that affect shader compilation
material.transparent = true;
material.needsUpdate = true; // Force shader recompilation
```

---

## Migration Checklist from Older Versions

- [ ] Replace all `renderAsync()` with `render()` after `await renderer.init()`
- [ ] Replace all `computeAsync()` with `compute()` after `await renderer.init()`
- [ ] Remove all `waitForGPU()` calls
- [ ] Update `KTX2Loader.detectSupportAsync()` to `detectSupport()` after renderer init
- [ ] Replace `PI2` with `TWO_PI` in TSL code
- [ ] Update `PassNode.setResolution()` to `setResolutionScale()`
- [ ] Update `PassNode.getResolution()` to `getResolutionScale()`
- [ ] Update `AfterImageNode.damp` to use `Node<float>` type
- [ ] Update `WaterMesh.resolution` to `resolutionScale`
- [ ] Update GTAONode AO blend formula to use only `r` channel
- [ ] Test PBR materials for visual changes (energy conservation improvements)
- [ ] Verify PMREM reflections quality improvements

---

## Resources

- **Official Repository:** https://github.com/mrdoob/three.js
- **Migration Guide:** https://github.com/mrdoob/three.js/wiki/Migration-Guide
- **Documentation:** https://threejs.org/docs/
- **Examples:** https://threejs.org/examples/

---

## Notes

- This research database is based on Context7 MCP documentation retrieval
- Always refer to official Three.js documentation for the most up-to-date information
- Test thoroughly when migrating from older versions
- WebGPU support requires modern browsers (Chrome 113+, Edge 113+, Firefox Nightly)

