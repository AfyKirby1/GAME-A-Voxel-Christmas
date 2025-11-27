import { SCENE_OPTS, GAME_WORLD_OPTS, PEAK_HEIGHT } from './config.js';
import { setupScene } from './scene-setup.js';
import { generateTerrainInstanced, generateHouse, generateTrees, clearWorld, getGroundHeight } from './world-gen.js';
import { ParticleManager } from './particles.js';
import { FirstPersonControls } from './first-person-controls.js';
import { initAmbientSound, startAmbientSound, stopAmbientSound, setAmbientVolume } from './ambient-sound.js';
import * as THREE from 'three';

let scene, camera, renderer, composer, orbitControls, firstPersonControls;
let particleManager;
let isFirstPersonMode = false;
let isPaused = false; // Pause state
let isHandlingPause = false; // Flag to prevent double-handling of pause requests
let gameWorldContainer = null; // Separate container for game world
let menuWorldObjects = []; // Track menu world objects to keep them separate
let lastTime = performance.now(); // For deltaTime calculation

// Block highlighting system
let blockHighlight = null;
let raycaster = null;
const RAYCAST_DISTANCE = 5; // Maximum distance to highlight blocks

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
    // Disable snow edges for menu to prevent flickering
    generateTerrainInstanced(scene, SCENE_OPTS, { enableSnowEdges: false });
    generateHouse(scene);
    generateTrees(scene, SCENE_OPTS);

    // 3. Particles
    particleManager = new ParticleManager(scene, SCENE_OPTS);
    
    // Apply saved particle settings
    const snowEnabled = localStorage.getItem('snowEnabled') !== 'false';
    const leavesEnabled = localStorage.getItem('leavesEnabled') !== 'false';
    particleManager.setSnowEnabled(snowEnabled);
    particleManager.setLeavesEnabled(leavesEnabled);

    // 4. Initialize block highlighting system
    initBlockHighlighting();

    // 5. Start Background Music
    setupBackgroundMusic();

    // 6. Hide Loading
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }

    // 7. Start Loop (rendering happens even though canvas is hidden)
    animate();
    
    console.log('✅ Scene initialized and world generation complete!');
}

// Initialize block highlighting system
function initBlockHighlighting() {
    // Create raycaster for detecting blocks
    raycaster = new THREE.Raycaster();
    
    // Create highlight box (wireframe outline)
    const highlightGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01); // Slightly larger than blocks
    const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    
    blockHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    blockHighlight.visible = false;
    blockHighlight.renderOrder = 999; // Render on top
    scene.add(blockHighlight);
}

// Update block highlighting (called in animate loop)
function updateBlockHighlight() {
    if (!isFirstPersonMode || !raycaster || !blockHighlight || !firstPersonControls || !firstPersonControls.isLocked()) {
        blockHighlight.visible = false;
        return;
    }
    
    // Cast ray from camera in forward direction
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.far = RAYCAST_DISTANCE;
    
    // Get all meshes in the game world container (blocks)
    const objectsToCheck = [];
    
    // Add game world container if it exists (prioritize game world)
    if (gameWorldContainer) {
        gameWorldContainer.traverse((child) => {
            if (child instanceof THREE.Mesh && child.visible) {
                objectsToCheck.push(child);
            } else if (child instanceof THREE.InstancedMesh && child.visible) {
                objectsToCheck.push(child);
            }
        });
    }
    
    // Also check scene for menu world blocks (only if no game world)
    if (!gameWorldContainer || objectsToCheck.length === 0) {
        scene.traverse((child) => {
            // Skip game world container (already checked)
            if (child === gameWorldContainer) return;
            if (child instanceof THREE.Mesh && child.visible) {
                // Only check blocks, not lights or other objects
                if (child.material && !child.material.emissive) {
                    objectsToCheck.push(child);
                }
            } else if (child instanceof THREE.InstancedMesh && child.visible) {
                objectsToCheck.push(child);
            }
        });
    }
    
    // Find intersections
    const intersects = raycaster.intersectObjects(objectsToCheck, false);
    
    if (intersects.length > 0) {
        const intersection = intersects[0];
        let blockX, blockY, blockZ;
        
        // Calculate block position from intersection point
        // Works for both regular meshes and instanced meshes
        const point = intersection.point.clone();
        const normal = intersection.face.normal.clone();
        
        // Move slightly back along the normal to get inside the block, then round to center
        const offset = normal.multiplyScalar(0.1); // Small offset to get inside block
        const blockCenter = point.sub(offset);
        
        // Round to nearest block position (blocks are at integer coordinates)
        blockX = Math.round(blockCenter.x);
        blockY = Math.round(blockCenter.y);
        blockZ = Math.round(blockCenter.z);
        
        // Position highlight at block center
        blockHighlight.position.set(blockX, blockY, blockZ);
        blockHighlight.visible = true;
    } else {
        blockHighlight.visible = false;
    }
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
    // CRITICAL: Check for null/undefined, not falsy (0 is valid!)
    const masterVolumeStr = localStorage.getItem('masterVolume');
    const masterVolume = masterVolumeStr !== null ? parseFloat(masterVolumeStr) : 1.0;
    const musicVolumeStr = localStorage.getItem('musicVolume');
    const musicVolume = musicVolumeStr !== null ? parseFloat(musicVolumeStr) : 1.0;

    // Clamp volumes to ensure valid values
    const masterVol = Math.max(0, Math.min(1, masterVolume));
    const musicVol = Math.max(0, Math.min(1, musicVolume));
    const finalVolume = masterVol * musicVol;

    // Minimum volume threshold (must match ui.js constant)
    const MIN_AUDIO_VOLUME = 0.001;
    
    // CRITICAL: Must match slider threshold (0.05 = 5%) to ensure consistency
    const isEffectivelyMuted = masterVol <= 0.05 || musicVol <= 0.05 || finalVolume <= MIN_AUDIO_VOLUME;
    const shouldPlay = masterAudioEnabled && musicEnabled && !isEffectivelyMuted;
    
    // CRITICAL: ALWAYS ensure audio is in correct state
    if (shouldPlay) {
        bgMusic.volume = finalVolume;
    } else {
        // MUST pause the audio element if volume is 0 or disabled
        bgMusic.pause();
        bgMusic.currentTime = 0;
        bgMusic.volume = 0;
    }

    // Music will be started when splash screen is dismissed (if enabled)
    // This function just sets up the audio element
    console.log('✅ Background music initialized - settings: masterAudio=' + masterAudioEnabled + ', musicEnabled=' + musicEnabled);
    
    // Log audio errors
    bgMusic.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        console.error('Audio error details:', bgMusic.error);
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    // Calculate deltaTime for frame-independent movement
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms to prevent large jumps
    lastTime = currentTime;
    
    // Update appropriate controls based on mode
    if (isFirstPersonMode && firstPersonControls && !isPaused) {
        // Update movement (WASD controls) - only when not paused
        firstPersonControls.updateMovement(deltaTime);
        // PointerLockControls handles mouse movement automatically via event listeners
        
        // Update block highlighting
        updateBlockHighlight();
    } else if (orbitControls && !isFirstPersonMode) {
        orbitControls.update();
        // Hide highlight when not in first-person mode
        if (blockHighlight) {
            blockHighlight.visible = false;
        }
    } else if (isPaused && blockHighlight) {
        // Hide highlight when paused
        blockHighlight.visible = false;
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
    // CRITICAL: Check for null/undefined, not falsy (0 is valid!)
    const masterVolumeStr = localStorage.getItem('masterVolume');
    const masterVolume = masterVolumeStr !== null ? parseFloat(masterVolumeStr) : 1.0;
    
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
        firstPersonControls = new FirstPersonControls(
            camera, 
            renderer.domElement,
            getGroundHeight, // Ground collision callback
            GAME_WORLD_OPTS  // Scene options for ground height calculation
        );
        
        // Listen for pointer unlock events to auto-pause when pointer is unlocked via escape
        // (handles case where browser unlocks pointer via escape before our handler runs)
        firstPersonControls.getControls().addEventListener('unlock', () => {
            // Auto-pause if we're in first-person mode, not already paused, and not currently handling pause
            // Use a small delay to ensure we're after any synchronous unlock calls
            if (isFirstPersonMode && !isPaused && !isHandlingPause) {
                setTimeout(() => {
                    // Double-check state after delay to avoid race conditions
                    if (isFirstPersonMode && !isPaused && !isHandlingPause && firstPersonControls && !firstPersonControls.isLocked()) {
                        pauseGame();
                    }
                }, 10);
            }
        });
    } else {
        // Reload keybinds in case they were changed
        firstPersonControls.reloadKeybinds();
    }
    
    // Show game world container (hide menu world by making game world visible)
    if (gameWorldContainer) {
        gameWorldContainer.visible = true;
    }
    
    // Position camera at spawn location (ground level + eye height)
    const eyeHeight = 1.6; // Standard player eye height
    camera.position.set(0, spawnY + eyeHeight, 0);
    camera.rotation.set(0, 0, 0);
    firstPersonControls.resetRotation();
    
    // Show crosshair
    const crosshair = document.getElementById('crosshair');
    if (crosshair) {
        crosshair.classList.remove('crosshair-hidden');
        crosshair.classList.add('crosshair-visible');
    }
    
    // Request pointer lock - requires user gesture, so set up click handler
    // Pointer lock must be requested from a user gesture (click, keypress, etc.)
    // Since we're entering first-person mode after async world generation,
    // we need to wait for the next user click
    let pointerLockClickHandler = null;
    
    pointerLockClickHandler = (event) => {
        if (firstPersonControls && isFirstPersonMode && !isPaused) {
            // Only request if pointer is not already locked
            if (!firstPersonControls.isLocked()) {
                try {
                    const lockResult = firstPersonControls.lock();
                    // Check if lock() returns a Promise before calling .catch()
                    if (lockResult && typeof lockResult.catch === 'function') {
                        lockResult.catch(err => {
                            // Silently handle errors - pointer lock might not be available
                            // This is expected if not in a user gesture context
                        });
                    }
                } catch (err) {
                    // Silently handle errors - pointer lock might not be available
                }
            }
        }
    };
    
    // Add click listener to canvas/renderer for pointer lock
    const canvas = renderer.domElement;
    canvas.addEventListener('click', pointerLockClickHandler);
    
    // Store handler reference for cleanup
    canvas._pointerLockHandler = pointerLockClickHandler;
    
    // Also try to request immediately (might work if still in gesture context from button click)
    // This will fail silently if not in a gesture context
    if (firstPersonControls) {
        try {
            const lockResult = firstPersonControls.lock();
            // Check if lock() returns a Promise before calling .catch()
            if (lockResult && typeof lockResult.catch === 'function') {
                lockResult.catch(() => {
                    // Expected to fail if not in gesture context - click handler will handle it
                });
            }
        } catch (err) {
            // Silently handle errors - pointer lock might not be available
        }
    }
    
    console.log('Entered first-person mode - click to enable mouse look');
}

// Exit first-person mode
export function exitFirstPersonMode() {
    if (!isFirstPersonMode) return;
    
    isFirstPersonMode = false;
    isPaused = false; // Reset pause state when exiting
    isHandlingPause = false; // Reset pause handling flag
    
    // Stop ambient wind sound
    stopAmbientSound();
    
    // Unlock pointer
    if (firstPersonControls) {
        firstPersonControls.unlock();
    }
    
    // Remove click listener for pointer lock
    if (renderer && renderer.domElement) {
        const canvas = renderer.domElement;
        if (canvas._pointerLockHandler) {
            canvas.removeEventListener('click', canvas._pointerLockHandler);
            delete canvas._pointerLockHandler;
        }
    }
    
    // Hide game world container (so only menu world is visible)
    if (gameWorldContainer) {
        gameWorldContainer.visible = false;
    }
    
    // Reset camera to menu view position
    if (camera) {
        camera.position.set(75, 45, 75);
        camera.rotation.set(0, 0, 0);
    }
    
    // Re-enable and reset orbit controls for menu view
    if (orbitControls) {
        orbitControls.enabled = true;
        orbitControls.autoRotate = true;
        orbitControls.target.set(0, PEAK_HEIGHT / 2, 0);
        orbitControls.update(); // Force update to apply changes
    }
    
    // Hide crosshair
    const crosshair = document.getElementById('crosshair');
    if (crosshair) {
        crosshair.classList.remove('crosshair-visible');
        crosshair.classList.add('crosshair-hidden');
    }
    
    // Hide block highlight
    if (blockHighlight) {
        blockHighlight.visible = false;
    }
    
    // Hide pause menu
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.classList.remove('pause-menu-visible');
        pauseMenu.classList.add('pause-menu-hidden');
    }
    
    console.log('Exited first-person mode');
}

// Pause game
export function pauseGame() {
    if (!isFirstPersonMode || isPaused || isHandlingPause) return;
    
    isHandlingPause = true;
    isPaused = true;
    
    // Unlock pointer to allow mouse movement for menu interaction
    if (firstPersonControls) {
        firstPersonControls.unlock();
    }
    
    // Show pause menu immediately
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.classList.remove('pause-menu-hidden');
        pauseMenu.classList.add('pause-menu-visible');
    }
    
    // Reset handling flag after a brief delay
    setTimeout(() => {
        isHandlingPause = false;
    }, 50);
    
    console.log('Game paused');
}

// Resume game
export function resumeGame() {
    if (!isFirstPersonMode || !isPaused) return;
    
    isPaused = false;
    isHandlingPause = false;
    
    // Hide pause menu
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.classList.remove('pause-menu-visible');
        pauseMenu.classList.add('pause-menu-hidden');
    }
    
    // Re-lock pointer for first-person controls
    // Pointer lock requires user gesture, so request it on next canvas click
    if (firstPersonControls && renderer && renderer.domElement) {
        const canvas = renderer.domElement;
        const requestPointerLock = () => {
            if (firstPersonControls && isFirstPersonMode && !isPaused) {
                if (!firstPersonControls.isLocked()) {
                    try {
                        const lockResult = firstPersonControls.lock();
                        // Check if lock() returns a Promise before calling .catch()
                        if (lockResult && typeof lockResult.catch === 'function') {
                            lockResult.catch(err => {
                                console.log('Pointer lock not available:', err.message);
                            });
                        }
                    } catch (err) {
                        // Silently handle errors
                    }
                }
            }
        };
        
        // Small delay to ensure menu is hidden
        setTimeout(() => {
            // Try to lock immediately (might work if user just clicked resume button)
            try {
                const lockResult = firstPersonControls.lock();
                // Check if lock() returns a Promise before calling .catch()
                if (lockResult && typeof lockResult.catch === 'function') {
                    lockResult.catch(() => {
                        // Expected to fail if not in gesture context - canvas click will handle it
                        // Click handler is already set up in enterFirstPersonMode
                    });
                }
            } catch (err) {
                // Silently handle errors
            }
        }, 100);
    }
    
    console.log('Game resumed');
}

// Toggle pause
export function togglePause() {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

// Check if game is paused
export function getIsPaused() {
    return isPaused;
}

// Check if in first-person mode
export function getIsFirstPersonMode() {
    return isFirstPersonMode;
}

// Export scene objects for UI access
// Note: pause functions (pauseGame, resumeGame, togglePause, getIsPaused, getIsFirstPersonMode) are exported above as function declarations
export { scene, camera, renderer, composer, particleManager };

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
