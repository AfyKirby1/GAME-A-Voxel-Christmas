// Ambient Sound System using Tone.js
// Creates procedural wind sounds for in-game atmosphere

let noise = null;
let filter = null;
let lfo = null;
let gain = null;
let isInitialized = false;
let isPlaying = false;

/**
 * Initialize the ambient sound system
 * Sets up Tone.js audio context and creates the wind sound chain
 */
export function initAmbientSound() {
    if (isInitialized) {
        console.log('Ambient sound already initialized');
        return;
    }

    // Check if Tone.js is available
    if (typeof Tone === 'undefined') {
        console.error('Tone.js is not loaded. Please ensure Tone.js script is included before main.js');
        return;
    }

    try {
        // Create noise source (PinkNoise is more natural than WhiteNoise)
        noise = new Tone.Noise('pink');

        // Create low-pass filter to shape wind character
        filter = new Tone.Filter({
            frequency: 400, // Base frequency for wind
            type: 'lowpass',
            Q: 1
        });

        // Create LFO for natural wind variation (gusts)
        lfo = new Tone.LFO({
            frequency: 0.2, // Slow variation (0.2 Hz = 5 second cycle)
            min: 200, // Minimum filter frequency
            max: 800  // Maximum filter frequency
        });

        // Create gain node for volume control
        gain = new Tone.Gain(0.35); // Base volume (35% - subtle)
        gain.gain.value = 0.35; // Set initial gain value

        // Connect the audio chain: noise -> filter -> gain -> destination
        noise.connect(filter);
        filter.connect(gain);
        gain.toDestination();

        // Connect LFO to modulate filter frequency for natural wind gusts
        lfo.connect(filter.frequency);

        isInitialized = true;
        console.log('✅ Ambient sound system initialized');
    } catch (error) {
        console.error('Error initializing ambient sound:', error);
        isInitialized = false;
    }
}

/**
 * Start playing the ambient wind sound
 * Requires user interaction to start Web Audio API context
 */
export async function startAmbientSound() {
    if (!isInitialized) {
        initAmbientSound();
    }

    if (isPlaying) {
        console.log('Ambient sound already playing');
        return;
    }

    try {
        // Start Tone.js context (required for Web Audio API)
        // This must be called after user interaction (which entering first-person mode provides)
        await Tone.start();
        
        // Ensure context is running
        if (Tone.context.state !== 'running') {
            await Tone.context.resume();
        }
        
        // Start the LFO
        if (lfo) {
            lfo.start();
        }
        
        // Start the noise
        if (noise) {
            noise.start();
        }

        isPlaying = true;
        console.log('🌬️ Ambient wind sound started');
    } catch (error) {
        console.error('Error starting ambient sound:', error);
        isPlaying = false;
    }
}

/**
 * Stop playing the ambient wind sound
 */
export function stopAmbientSound() {
    if (!isPlaying) {
        return;
    }

    try {
        // Stop the noise
        if (noise) {
            noise.stop();
        }

        // Stop the LFO
        if (lfo) {
            lfo.stop();
        }

        isPlaying = false;
        console.log('Ambient wind sound stopped');
    } catch (error) {
        console.error('Error stopping ambient sound:', error);
    }
}

/**
 * Set the volume of the ambient sound
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export function setAmbientVolume(volume) {
    if (!gain) {
        return;
    }

    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    // Apply volume with smooth transition (gain is linear, 0-1)
    // Base volume multiplier of 0.35 keeps it subtle
    gain.gain.rampTo(clampedVolume * 0.35, 0.1);
}

/**
 * Check if ambient sound is currently playing
 * @returns {boolean} True if playing, false otherwise
 */
export function isAmbientPlaying() {
    return isPlaying;
}

/**
 * Clean up and dispose of all audio resources
 * Call this when shutting down the application
 */
export function disposeAmbientSound() {
    stopAmbientSound();

    if (noise) {
        noise.dispose();
        noise = null;
    }

    if (filter) {
        filter.dispose();
        filter = null;
    }

    if (lfo) {
        lfo.dispose();
        lfo = null;
    }

    if (gain) {
        gain.dispose();
        gain = null;
    }

    isInitialized = false;
    isPlaying = false;
    console.log('Ambient sound system disposed');
}

