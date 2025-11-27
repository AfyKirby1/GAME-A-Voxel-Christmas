// UI Sound Effects System using Tone.js
// Provides hover and click sounds for menu buttons and splash screen

/**
 * Check if master audio is enabled
 * @returns {boolean} True if master audio is enabled
 */
function isMasterAudioEnabled() {
    return localStorage.getItem('masterAudioEnabled') !== 'false';
}

/**
 * Ensure Tone.js audio context is ready
 * @returns {Promise} Resolves when context is ready
 */
async function ensureAudioContext() {
    if (typeof Tone === 'undefined') {
        console.warn('Tone.js not available for UI sounds');
        return false;
    }

    try {
        // Start context if not already started (requires user interaction)
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        
        // Ensure context is running
        if (Tone.context.state !== 'running') {
            await Tone.context.resume();
        }
        
        return true;
    } catch (error) {
        console.warn('Could not start audio context for UI sounds:', error);
        return false;
    }
}

/**
 * Play a hover sound effect
 * Short, gentle tone for button hover interactions
 */
export async function playHoverSound() {
    // Check if master audio is enabled
    if (!isMasterAudioEnabled()) {
        return;
    }

    // Ensure audio context is ready
    const contextReady = await ensureAudioContext();
    if (!contextReady) {
        return;
    }

    try {
        // Create oscillator for hover sound
        const oscillator = new Tone.Oscillator({
            frequency: 900, // Pleasant chime frequency
            type: 'sine'
        });

        // Create envelope for smooth attack and decay
        const envelope = new Tone.AmplitudeEnvelope({
            attack: 0.01,  // Quick attack
            decay: 0.09,   // Short decay
            sustain: 0,    // No sustain
            release: 0     // Instant release
        });

        // Create gain for volume control
        const gain = new Tone.Gain(0.2); // Subtle volume

        // Connect: oscillator -> envelope -> gain -> destination
        oscillator.connect(envelope);
        envelope.connect(gain);
        gain.toDestination();

        // Start the sound
        oscillator.start();
        envelope.triggerAttackRelease(0.1); // 0.1 second duration

        // Clean up after sound completes
        oscillator.stop('+0.1');
        setTimeout(() => {
            oscillator.dispose();
            envelope.dispose();
            gain.dispose();
        }, 150); // Small buffer for cleanup
    } catch (error) {
        // Silently fail - UI sounds are non-critical
        console.debug('Could not play hover sound:', error);
    }
}

/**
 * Play a click sound effect
 * Crisp, defined sound for button click interactions
 */
export async function playClickSound() {
    // Check if master audio is enabled
    if (!isMasterAudioEnabled()) {
        return;
    }

    // Ensure audio context is ready
    const contextReady = await ensureAudioContext();
    if (!contextReady) {
        return;
    }

    try {
        // Create oscillator for click sound
        const oscillator = new Tone.Oscillator({
            frequency: 500, // Lower, more defined frequency
            type: 'sine'
        });

        // Create envelope for crisp attack and quick decay
        const envelope = new Tone.AmplitudeEnvelope({
            attack: 0.01,  // Instant attack
            decay: 0.14,   // Quick decay
            sustain: 0,    // No sustain
            release: 0     // Instant release
        });

        // Create gain for volume control
        const gain = new Tone.Gain(0.3); // Slightly louder than hover

        // Connect: oscillator -> envelope -> gain -> destination
        oscillator.connect(envelope);
        envelope.connect(gain);
        gain.toDestination();

        // Start the sound
        oscillator.start();
        envelope.triggerAttackRelease(0.15); // 0.15 second duration

        // Clean up after sound completes
        oscillator.stop('+0.15');
        setTimeout(() => {
            oscillator.dispose();
            envelope.dispose();
            gain.dispose();
        }, 200); // Small buffer for cleanup
    } catch (error) {
        // Silently fail - UI sounds are non-critical
        console.debug('Could not play click sound:', error);
    }
}

