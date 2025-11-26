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

    let musicStarted = false;

    const startMusic = () => {
        if (musicStarted) return;
        musicStarted = true;
        
        bgMusic.play().then(() => {
            console.log('Background music started');
        }).catch(err => {
            console.log('Could not start music:', err);
            musicStarted = false; // Retry on next interaction
        });
    };

    // Try to play immediately
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            musicStarted = true;
            console.log('Background music started automatically');
        }).catch(error => {
            // Autoplay was prevented - wait for ANY user interaction
            console.log('Autoplay prevented, waiting for user interaction');
            
            // Listen to multiple events to catch any user interaction
            const events = ['click', 'keydown', 'mousedown', 'touchstart', 'pointerdown', 'mousemove'];
            
            const startOnInteraction = () => {
                startMusic();
                // Remove all listeners after first successful start
                events.forEach(event => {
                    document.removeEventListener(event, startOnInteraction);
                });
            };
            
            events.forEach(event => {
                document.addEventListener(event, startOnInteraction, { once: true, passive: true });
            });
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
