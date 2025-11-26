import { SCENE_OPTS } from './config.js';
import { setupScene } from './scene-setup.js';
import { generateTerrainInstanced, generateHouse, generateTrees } from './world-gen.js';
import { ParticleManager } from './particles.js';
import { setupUI } from './ui.js';

let scene, camera, renderer, composer, controls;
let particleManager;

function init() {
    // 1. Setup Scene
    const sceneObjects = setupScene(SCENE_OPTS);
    scene = sceneObjects.scene;
    camera = sceneObjects.camera;
    renderer = sceneObjects.renderer;
    composer = sceneObjects.composer;
    controls = sceneObjects.controls;

    // 2. Generate World
    generateTerrainInstanced(scene, SCENE_OPTS);
    generateHouse(scene);
    generateTrees(scene, SCENE_OPTS);

    // 3. Particles
    particleManager = new ParticleManager(scene, SCENE_OPTS);

    // 4. UI
    setupUI();

    // 5. Hide Loading
    const loading = document.getElementById('loading');
    loading.style.opacity = '0';
    setTimeout(() => {
        loading.style.display = 'none';
    }, 500);

    // 6. Start Loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (particleManager) {
        particleManager.update();
    }

    // Render with post-processing
    composer.render();
}

// Start the app
init();
