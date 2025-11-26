import { SCENE_OPTS } from './config.js';
import { setupScene } from './scene-setup.js';
import { generateTerrainInstanced, generateHouse, generateTrees } from './world-gen.js';
import { ParticleManager } from './particles.js';

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

    // Canvas is hidden initially (behind splash screen) but still rendering
    const canvas = renderer.domElement;
    canvas.style.display = 'none'; // Hidden until splash dismissed

    // 2. Generate World (happens in background while splash is visible)
    generateTerrainInstanced(scene, SCENE_OPTS);
    generateHouse(scene);
    generateTrees(scene, SCENE_OPTS);

    // 3. Particles
    particleManager = new ParticleManager(scene, SCENE_OPTS);

    // 4. Start Background Music
    setupBackgroundMusic();

    // 5. Hide Loading
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }

    // 6. Start Loop (rendering happens even though canvas is hidden)
    animate();
    
    console.log('✅ Scene initialized and world generation complete!');
}

function setupBackgroundMusic() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) {
        console.warn('Background music element not found');
        return;
    }

    // Set volume (0.0 to 1.0)
    bgMusic.volume = 0.5;

    // Music will be started when splash screen is dismissed
    // This function just sets up the audio element
    console.log('Background music initialized - will start when splash screen is dismissed');
    
    // Log audio errors
    bgMusic.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        console.error('Audio error details:', bgMusic.error);
    });
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

// Start the app immediately (world generation happens in background)
// Splash screen stays visible until user clicks, but scene is loading behind it
let appStarted = false;

export function startApp() {
    if (appStarted) return;
    appStarted = true;
    
    console.log('Starting app - world generation begins in background...');
    init();
}

// Start the app immediately (world generation in background)
startApp();

// Set up UI (includes splash screen)
// Splash screen will hide when user clicks, but scene is already loading
import('./ui.js').then(({ setupUI }) => {
    setupUI();
});
