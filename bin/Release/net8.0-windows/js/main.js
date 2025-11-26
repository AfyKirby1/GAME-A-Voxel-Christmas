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
    if (!bgMusic) {
        console.warn('Background music element not found');
        return;
    }

    console.log('Setting up background music...');
    
    // Set volume (0.0 to 1.0)
    bgMusic.volume = 0.5;

    let musicStarted = false;

    // Function to start music - must be called directly from user interaction
    const startMusic = () => {
        if (musicStarted) {
            console.log('Music already started, skipping');
            return;
        }
        
        console.log('Attempting to start music...');
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicStarted = true;
                console.log('✅ Background music started successfully!');
            }).catch(err => {
                console.error('❌ Could not start music:', err);
                musicStarted = false; // Allow retry
            });
        } else {
            // Older browsers
            try {
                bgMusic.play();
                musicStarted = true;
                console.log('✅ Background music started (fallback method)');
            } catch (err) {
                console.error('❌ Could not start music (fallback):', err);
            }
        }
    };

    // Wait for audio to be ready, then try autoplay
    const tryAutoplay = () => {
        if (bgMusic.readyState >= 2) {
            // Audio is already loaded
            console.log('Audio ready, attempting autoplay...');
            startMusic();
        } else {
            // Wait for audio to load
            console.log('Waiting for audio to load...');
            bgMusic.addEventListener('canplaythrough', () => {
                console.log('Audio loaded, attempting autoplay...');
                startMusic();
            }, { once: true });
        }
    };

    tryAutoplay();

    // Set up user interaction handlers - play() must be called directly in the event handler
    const events = ['click', 'keydown', 'mousedown', 'touchstart', 'pointerdown', 'mousemove'];
    
    const startOnInteraction = (event) => {
        if (musicStarted) return;
        
        console.log('User interaction detected:', event.type, '- starting music directly...');
        
        // Call play() directly in the event handler context
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicStarted = true;
                console.log('✅ Background music started from user interaction!');
                // Remove all listeners after successful start
                events.forEach(eventType => {
                    document.removeEventListener(eventType, startOnInteraction);
                });
            }).catch(err => {
                console.error('❌ Could not start music from interaction:', err);
            });
        } else {
            try {
                bgMusic.play();
                musicStarted = true;
                console.log('✅ Background music started (fallback from interaction)');
                events.forEach(eventType => {
                    document.removeEventListener(eventType, startOnInteraction);
                });
            } catch (err) {
                console.error('❌ Could not start music (fallback from interaction):', err);
            }
        }
    };
    
    events.forEach(eventType => {
        document.addEventListener(eventType, startOnInteraction, { once: false, passive: true });
    });

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

// Start the app
init();
