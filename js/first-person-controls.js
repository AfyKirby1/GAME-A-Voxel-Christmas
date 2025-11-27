import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class FirstPersonControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.controls = new PointerLockControls(camera, domElement);
        
        // Setup event listeners for pointer lock changes
        this.setupEventListeners();
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
}

