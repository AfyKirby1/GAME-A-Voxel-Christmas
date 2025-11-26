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

    // 5. Start Background Music
    setupBackgroundMusic();

    // 6. Hide Loading
    const loading = document.getElementById('loading');
    loading.style.opacity = '0';
    setTimeout(() => {
        loading.style.display = 'none';
    }, 500);

    // 7. Start Loop
    animate();
}

function setupBackgroundMusic() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;

    // Set volume (0.0 to 1.0)
    bgMusic.volume = 0.5;

    // Try to play (may require user interaction due to browser autoplay policies)
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            // Autoplay was prevented - wait for user interaction
            console.log('Autoplay prevented, waiting for user interaction');
            
            // Start music on first user interaction
            const startMusic = () => {
                bgMusic.play().catch(err => console.log('Could not start music:', err));
                document.removeEventListener('click', startMusic);
                document.removeEventListener('keydown', startMusic);
            };
            
            document.addEventListener('click', startMusic, { once: true });
            document.addEventListener('keydown', startMusic, { once: true });
        });
    }
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
