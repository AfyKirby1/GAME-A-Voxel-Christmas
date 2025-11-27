import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { loadKeybinds } from './config.js';

export class FirstPersonControls {
    constructor(camera, domElement, getGroundHeightCallback = null, sceneOpts = null) {
        this.camera = camera;
        this.domElement = domElement;
        this.controls = new PointerLockControls(camera, domElement);
        this.getGroundHeight = getGroundHeightCallback;
        this.sceneOpts = sceneOpts;
        
        // Movement constants
        this.moveSpeed = 5.0; // units per second
        this.jumpSpeed = 8.0; // initial jump velocity
        this.gravity = 20.0; // gravity acceleration
        this.eyeHeight = 1.6; // player eye height above ground
        
        // Movement state
        this.keys = {}; // Track which keys are currently pressed
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.onGround = true;
        
        // Load keybinds
        this.keybinds = loadKeybinds();
        
        // Setup event listeners
        this.setupEventListeners();
        this.setupKeyboardListeners();
    }
    
    setupEventListeners() {
        // Handle pointer lock change events
        this.controls.addEventListener('lock', () => {
            console.log('Pointer locked - first-person mode active');
        });
        
        this.controls.addEventListener('unlock', () => {
            console.log('Pointer unlocked - first-person mode inactive');
            // Optionally exit first-person mode when pointer is unlocked
            // This will be handled by the main module if needed
        });
    }
    
    setupKeyboardListeners() {
        // Reload keybinds when setting up listeners (in case they changed)
        this.keybinds = loadKeybinds();
        
        // Keydown event
        document.addEventListener('keydown', (event) => {
            // Only process if pointer is locked (in first-person mode)
            if (!this.controls.isLocked) return;
            
            // Reload keybinds to get latest changes
            this.keybinds = loadKeybinds();
            const code = event.code;
            
            // Check if this key is bound to any action
            if (code === this.keybinds.forward) {
                this.keys.forward = true;
                event.preventDefault();
            } else if (code === this.keybinds.backward) {
                this.keys.backward = true;
                event.preventDefault();
            } else if (code === this.keybinds.left) {
                this.keys.left = true;
                event.preventDefault();
            } else if (code === this.keybinds.right) {
                this.keys.right = true;
                event.preventDefault();
            } else if (code === this.keybinds.jump) {
                if (this.onGround) {
                    this.velocity.y = this.jumpSpeed;
                    this.onGround = false;
                }
                event.preventDefault();
            }
        });
        
        // Keyup event
        document.addEventListener('keyup', (event) => {
            // Reload keybinds to get latest changes
            this.keybinds = loadKeybinds();
            const code = event.code;
            
            if (code === this.keybinds.forward) {
                this.keys.forward = false;
            } else if (code === this.keybinds.backward) {
                this.keys.backward = false;
            } else if (code === this.keybinds.left) {
                this.keys.left = false;
            } else if (code === this.keybinds.right) {
                this.keys.right = false;
            }
        });
    }
    
    isLocked() {
        return this.controls.isLocked;
    }
    
    lock() {
        this.controls.lock();
    }
    
    unlock() {
        this.controls.unlock();
    }
    
    dispose() {
        this.controls.dispose();
    }
    
    // Reset camera rotation to neutral
    resetRotation() {
        this.camera.rotation.set(0, 0, 0);
    }
    
    // Get the controls object for direct access if needed
    getControls() {
        return this.controls;
    }
    
    // Update movement based on current key states
    updateMovement(deltaTime) {
        if (!this.controls.isLocked) return;
        
        // Calculate movement direction based on camera rotation
        const direction = new THREE.Vector3();
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        // Get forward direction (camera's local Z axis, negated)
        this.camera.getWorldDirection(forward);
        forward.y = 0; // Keep movement horizontal
        forward.normalize();
        
        // Get right direction (cross product of forward and up)
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        right.normalize();
        
        // Calculate movement vector
        const moveVector = new THREE.Vector3(0, 0, 0);
        
        if (this.keys.forward) {
            moveVector.add(forward);
        }
        if (this.keys.backward) {
            moveVector.sub(forward);
        }
        if (this.keys.left) {
            moveVector.sub(right);
        }
        if (this.keys.right) {
            moveVector.add(right);
        }
        
        // Normalize movement vector to prevent faster diagonal movement
        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.multiplyScalar(this.moveSpeed * deltaTime);
        }
        
        // Apply horizontal movement
        this.camera.position.add(moveVector);
        
        // Apply gravity and vertical movement
        if (!this.onGround) {
            this.velocity.y -= this.gravity * deltaTime;
        } else {
            this.velocity.y = 0;
        }
        
        // Update vertical position
        this.camera.position.y += this.velocity.y * deltaTime;
        
        // Ground collision
        if (this.getGroundHeight && this.sceneOpts) {
            const groundHeight = this.getGroundHeight(
                this.camera.position.x,
                this.camera.position.z,
                this.sceneOpts,
                true // useGameHeight
            );
            
            const targetY = groundHeight + this.eyeHeight;
            
            if (this.camera.position.y <= targetY) {
                this.camera.position.y = targetY;
                this.velocity.y = 0;
                this.onGround = true;
            } else {
                this.onGround = false;
            }
        }
    }
    
    // Reload keybinds (call this when keybinds are changed)
    reloadKeybinds() {
        this.keybinds = loadKeybinds();
    }
}

