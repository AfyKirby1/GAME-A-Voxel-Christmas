import { SCENE_OPTS, GAME_WORLD_OPTS } from './config.js';
import { setupScene } from './scene-setup.js';
import { generateTerrainInstanced, generateHouse, generateTrees, clearWorld, getGroundHeight } from './world-gen.js';
import { ParticleManager } from './particles.js';
import { FirstPersonControls } from './first-person-controls.js';
import { initAmbientSound, startAmbientSound, stopAmbientSound, setAmbientVolume } from './ambient-sound.js';
import * as THREE from 'three';

let scene, camera, renderer, composer, orbitControls, firstPersonControls;
let particleManager;
let isFirstPersonMode = false;
let gameWorldContainer = null; // Separate container for game world
let menuWorldObjects = []; // Track menu world objects to keep them separate

function init() {
    // 1. Setup Scene
    const sceneObjects = setupScene(SCENE_OPTS);
    scene = sceneObjects.scene;
    camera = sceneObjects.camera;
    renderer = sceneObjects.renderer;
    composer = sceneObjects.composer;
    orbitControls = sceneObjects.controls;

    // Canvas is hidden initially (behind splash screen) but still rendering
    const canvas = renderer.domElement;
    canvas.style.display = 'none'; // Hidden until splash dismissed

    // 2. Generate Menu World (happens in background while splash is visible)
    // Generate menu world directly in scene (not in a container)
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

    // Load saved audio settings
    const masterAudioEnabled = localStorage.getItem('masterAudioEnabled') !== 'false';
    const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    const masterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
    const musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;

    // Set volume based on settings (master * music)
    if (masterAudioEnabled && musicEnabled) {
        bgMusic.volume = masterVolume * musicVolume;
    } else {
        bgMusic.volume = 0;
    }

    // Music will be started when splash screen is dismissed (if enabled)
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
    
    // Update appropriate controls based on mode
    if (isFirstPersonMode && firstPersonControls) {
        // PointerLockControls handles mouse movement automatically via event listeners
        // No update() call needed
    } else if (orbitControls) {
        orbitControls.update();
    }

    if (particleManager) {
        particleManager.update();
    }

    // Render with post-processing
    composer.render();
}

// Create or get game world container
function getGameWorldContainer() {
    if (!gameWorldContainer) {
        gameWorldContainer = new THREE.Group();
        gameWorldContainer.name = 'GameWorld';
        scene.add(gameWorldContainer);
    }
    return gameWorldContainer;
}

// Regenerate world based on options (creates separate game world)
export async function regenerateWorld(options, progressCallback = null) {
    return new Promise((resolve) => {
        // Helper function to safely call progress callback
        const updateProgress = (percentage, statusText) => {
            if (progressCallback && typeof progressCallback === 'function') {
                progressCallback(percentage, statusText);
            }
        };
        
        // Get or create game world container
        const gameContainer = getGameWorldContainer();
        
        // Clear any existing game world
        updateProgress(0, 'Initializing world generation...');
        clearWorld(gameContainer);
        
        // Use requestAnimationFrame to allow UI updates and smooth generation
        requestAnimationFrame(() => {
            // Generate terrain (0-30%)
            updateProgress(10, 'Generating terrain...');
            generateTerrainInstanced(gameContainer, GAME_WORLD_OPTS, { 
                hills: options.hills,
                useGameHeight: true 
            });
            updateProgress(30, 'Terrain generated');
            
            requestAnimationFrame(() => {
                // Generate house (30-60%)
                updateProgress(40, 'Building structures...');
                generateHouse(gameContainer, { 
                    house: options.house,
                    useGameHeight: true 
                });
                updateProgress(60, 'Structures complete');
                
                requestAnimationFrame(() => {
                    // Generate trees (60-90%)
                    updateProgress(70, 'Placing trees and decorations...');
                    generateTrees(gameContainer, GAME_WORLD_OPTS, { 
                        trees: options.trees, 
                        lights: options.lights 
                    });
                    updateProgress(90, 'Decorations complete');
                    
                    // Calculate and return ground height at center
                    updateProgress(95, 'Finalizing world...');
                    const groundHeight = getGroundHeight(0, 0, GAME_WORLD_OPTS, true);
                    
                    // Complete progress
                    updateProgress(100, 'World generation complete!');
                    
                    // Resolve after a brief delay for smooth transition
                    setTimeout(() => {
                        resolve(groundHeight);
                    }, 300);
                });
            });
        });
    });
}

// Enter first-person mode
export function enterFirstPersonMode(spawnY) {
    if (isFirstPersonMode) return;
    
    isFirstPersonMode = true;
    
    // Stop main menu background music
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0; // Reset to beginning
        console.log('Main menu music stopped');
    }
    
    // Initialize and start ambient wind sound
    // Load audio settings to respect master audio toggle
    const masterAudioEnabled = localStorage.getItem('masterAudioEnabled') !== 'false';
    const masterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
    
    if (masterAudioEnabled) {
        initAmbientSound();
        setAmbientVolume(masterVolume);
        startAmbientSound().catch(err => {
            console.warn('Could not start ambient sound:', err);
        });
    }
    
    // Disable orbit controls
    if (orbitControls) {
        orbitControls.enabled = false;
        orbitControls.autoRotate = false;
    }
    
    // Create first-person controls if they don't exist
    if (!firstPersonControls) {
        firstPersonControls = new FirstPersonControls(camera, renderer.domElement);
    }
    
    // Position camera at spawn location (ground level + eye height)
    const eyeHeight = 1.6; // Standard player eye height
    camera.position.set(0, spawnY + eyeHeight, 0);
    camera.rotation.set(0, 0, 0);
    firstPersonControls.resetRotation();
    
    // Request pointer lock
    firstPersonControls.lock();
    
    console.log('Entered first-person mode');
}

// Exit first-person mode
export function exitFirstPersonMode() {
    if (!isFirstPersonMode) return;
    
    isFirstPersonMode = false;
    
    // Stop ambient wind sound
    stopAmbientSound();
    
    // Unlock pointer
    if (firstPersonControls) {
        firstPersonControls.unlock();
    }
    
    // Re-enable orbit controls
    if (orbitControls) {
        orbitControls.enabled = true;
    }
    
    // Optionally restart main menu music when returning to menu
    // (Uncomment if you want music to resume when exiting game mode)
    // const bgMusic = document.getElementById('bg-music');
    // if (bgMusic) {
    //     bgMusic.play().catch(e => console.log('Could not resume music:', e));
    // }
    
    console.log('Exited first-person mode');
}

// Export scene objects for UI access
export { scene, camera, renderer };

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
