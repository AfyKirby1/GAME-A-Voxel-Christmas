# Audio System Documentation

## Overview

The Voxel Christmas game features a comprehensive audio system with three main components:
1. **Background Music** - Menu music that plays during the title screen
2. **Ambient Wind Sound** - Procedural in-game atmosphere using Tone.js
3. **UI Sound Effects** - Interactive hover and click sounds for buttons

All audio systems are controlled through a unified settings panel with master audio controls and individual volume sliders.

---

## Table of Contents

1. [Settings System](#settings-system)
2. [Menu Music (Background Music)](#menu-music-background-music)
3. [In-Game Sound (Ambient Wind)](#in-game-sound-ambient-wind)
4. [UI Sound Effects](#ui-sound-effects)
5. [Tone.js Implementation](#tonejs-implementation)
6. [Audio Flow Diagram](#audio-flow-diagram)
7. [Technical Details](#technical-details)

---

## Settings System

### Location
- **UI Panel**: Settings → Audio Tab
- **File**: `js/ui.js` (lines 123-508)
- **HTML**: `index.html` (lines 180-220)

### Components

#### 1. Master Audio Toggle
- **Element ID**: `toggle-master-audio`
- **Storage Key**: `masterAudioEnabled` (localStorage)
- **Default**: `true` (enabled)
- **Function**: Controls all audio output (both music and ambient sound)

#### 2. Background Music Toggle
- **Element ID**: `toggle-music`
- **Storage Key**: `musicEnabled` (localStorage)
- **Default**: `true` (enabled)
- **Function**: Controls only the background music track

#### 3. Volume Sliders
- **Master Volume Slider**: `master-volume-slider`
- **Music Volume Slider**: `music-volume-slider`
- **Storage Keys**: `masterVolume`, `musicVolume` (localStorage)
- **Range**: 0.0 to 1.0 (0% to 100%)
- **Default**: 1.0 (100%)

### Volume Calculation

The final audio volume is calculated using a multiplicative system:

```
Final Volume = Master Volume × Music Volume
```

**Example**:
- Master Volume: 80% (0.8)
- Music Volume: 50% (0.5)
- **Final Music Volume**: 40% (0.8 × 0.5 = 0.4)

### Settings Initialization

```123:147:js/ui.js
function setupAudioPanel() {
    const masterAudioToggle = document.getElementById('toggle-master-audio');
    const musicToggle = document.getElementById('toggle-music');
    const bgMusic = document.getElementById('bg-music');

    if (!masterAudioToggle || !musicToggle || !bgMusic) {
        console.warn('Audio panel elements not found');
        return;
    }

    // Initialize audio state from localStorage or defaults
    const masterAudioEnabled = localStorage.getItem('masterAudioEnabled') !== 'false';
    const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    const masterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
    const musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;

    masterAudioToggle.checked = masterAudioEnabled;
    musicToggle.checked = musicEnabled;

    // Initialize volume sliders
    setupVolumeSlider('master', masterVolume);
    setupVolumeSlider('music', musicVolume);

    // Apply initial state
    applyAudioSettings(masterAudioEnabled, musicEnabled, masterVolume, musicVolume);
```

### Settings Persistence

All audio settings are stored in `localStorage`:
- `masterAudioEnabled`: Boolean (string: "true"/"false")
- `musicEnabled`: Boolean (string: "true"/"false")
- `masterVolume`: Number (0.0 to 1.0)
- `musicVolume`: Number (0.0 to 1.0)

Settings persist across browser sessions and are loaded on application startup.

---

## Menu Music (Background Music)

### Overview
The background music plays during the main menu/title screen and automatically stops when entering first-person game mode.

### Implementation

#### HTML Audio Element
```350:353:index.html
    <!-- Background Music -->
    <audio id="bg-music" loop preload="auto">
        <source src="assets/audio/Frozen Whispers.mp3" type="audio/mpeg">
    </audio>
```

**Properties**:
- **ID**: `bg-music`
- **Loop**: Enabled (continuous playback)
- **Preload**: `auto` (loads immediately)
- **Source**: `assets/audio/Frozen Whispers.mp3`

#### Initialization

```56:85:js/main.js
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
```

#### Music Start Trigger

Music starts when the splash screen is dismissed:

```916:936:js/ui.js
        // Start music when splash is dismissed (if enabled)
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            // Check if music is enabled and apply volume
            const masterAudioEnabled = localStorage.getItem('masterAudioEnabled') !== 'false';
            const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
            const masterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
            const musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;
            
            if (masterAudioEnabled && musicEnabled) {
                bgMusic.volume = masterVolume * musicVolume;
                bgMusic.play().then(() => {
                    console.log('✅ Background music started from splash screen!');
                }).catch(err => {
                    console.error('Could not start music:', err);
                });
            } else {
                bgMusic.volume = 0;
                console.log('Background music disabled in settings');
            }
        }
```

#### Music Stop Trigger

Music stops when entering first-person mode:

```190:196:js/main.js
    // Stop main menu background music
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0; // Reset to beginning
        console.log('Main menu music stopped');
    }
```

#### Volume Control

Volume is controlled through the `applyAudioSettings` function:

```465:508:js/ui.js
function applyAudioSettings(masterEnabled, musicEnabled, masterVolume, musicVolume) {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;

    // Clamp volumes
    const masterVol = Math.max(0, Math.min(1, masterVolume || 1.0));
    const musicVol = Math.max(0, Math.min(1, musicVolume || 1.0));

    // Control ambient sound volume (async, but non-blocking)
    getAmbientSoundModule().then(module => {
        const { stopAmbientSound, setAmbientVolume, isAmbientPlaying } = module;
        
        if (!masterEnabled) {
            // Master audio off - stop ambient sound if playing
            if (isAmbientPlaying()) {
                stopAmbientSound();
            }
        } else {
            // Master on - update ambient sound volume
            setAmbientVolume(masterVol);
        }
    }).catch(err => {
        // Ambient sound module not available yet (not in first-person mode)
        // This is fine, volume will be set when entering first-person mode
    });

    if (!masterEnabled) {
        // Master audio off - mute everything
        bgMusic.volume = 0;
        bgMusic.pause();
    } else if (musicEnabled) {
        // Master on, music on - apply volume (master * music)
        bgMusic.volume = masterVol * musicVol;
        if (bgMusic.paused) {
            bgMusic.play().catch(err => {
                console.warn('Could not play music:', err);
            });
        }
    } else {
        // Master on, music off - mute music but keep master enabled
        bgMusic.volume = 0;
        bgMusic.pause();
    }
}
```

---

## In-Game Sound (Ambient Wind)

### Overview
The ambient wind sound is a procedural audio effect generated using Tone.js. It creates a natural, atmospheric wind sound that plays continuously during first-person gameplay.

### Implementation File
- **File**: `js/ambient-sound.js`
- **Total Lines**: 190

### Audio Chain Architecture

The ambient sound uses a sophisticated audio processing chain:

```
PinkNoise → LowPassFilter → Gain → Destination
                ↑
              LFO (modulates filter frequency)
```

### Components

#### 1. Noise Source
```28:29:js/ambient-sound.js
        // Create noise source (PinkNoise is more natural than WhiteNoise)
        noise = new Tone.Noise('pink');
```

- **Type**: Pink Noise (more natural than white noise)
- **Purpose**: Base sound source for wind effect

#### 2. Low-Pass Filter
```31:36:js/ambient-sound.js
        // Create low-pass filter to shape wind character
        filter = new Tone.Filter({
            frequency: 400, // Base frequency for wind
            type: 'lowpass',
            Q: 1
        });
```

- **Type**: Low-pass filter
- **Base Frequency**: 400 Hz
- **Q Factor**: 1
- **Purpose**: Shapes the noise into a wind-like sound

#### 3. LFO (Low-Frequency Oscillator)
```38:43:js/ambient-sound.js
        // Create LFO for natural wind variation (gusts)
        lfo = new Tone.LFO({
            frequency: 0.2, // Slow variation (0.2 Hz = 5 second cycle)
            min: 200, // Minimum filter frequency
            max: 800  // Maximum filter frequency
        });
```

- **Frequency**: 0.2 Hz (5-second cycle)
- **Range**: 200 Hz to 800 Hz
- **Purpose**: Modulates the filter frequency to create natural wind gusts

#### 4. Gain Node
```45:47:js/ambient-sound.js
        // Create gain node for volume control
        gain = new Tone.Gain(0.35); // Base volume (35% - subtle)
        gain.gain.value = 0.35; // Set initial gain value
```

- **Base Volume**: 0.35 (35%)
- **Purpose**: Volume control with smooth transitions

#### 5. Audio Chain Connection
```49:55:js/ambient-sound.js
        // Connect the audio chain: noise -> filter -> gain -> destination
        noise.connect(filter);
        filter.connect(gain);
        gain.toDestination();

        // Connect LFO to modulate filter frequency for natural wind gusts
        lfo.connect(filter.frequency);
```

### Initialization

```15:63:js/ambient-sound.js
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
```

### Starting the Sound

```69:105:js/ambient-sound.js
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
        console.error('Error starting ambient sound:', err);
        isPlaying = false;
    }
}
```

**Important**: The audio context must be started after user interaction (browser security requirement). This is handled automatically when entering first-person mode.

### Stopping the Sound

```110:131:js/ambient-sound.js
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
```

### Volume Control

```137:148:js/ambient-sound.js
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
```

**Volume Calculation**:
- Input: 0.0 to 1.0 (from master volume slider)
- Base Multiplier: 0.35 (keeps sound subtle)
- Final Volume: `volume × 0.35`
- Transition Time: 0.1 seconds (smooth fade)

### Integration with First-Person Mode

```198:209:js/main.js
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
```

### Cleanup

```162:188:js/ambient-sound.js
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
```

---

## UI Sound Effects

### Overview
The UI sound effects system provides audio feedback for user interactions with buttons and interface elements. It uses Tone.js to generate simple, procedural sounds for hover and click interactions.

### Implementation File
- **File**: `js/ui-sounds.js`
- **Total Lines**: ~150

### Sound Types

#### 1. Hover Sound
- **Function**: `playHoverSound()`
- **Frequency**: 900 Hz (pleasant chime)
- **Duration**: 0.1 seconds
- **Volume**: 0.2 (subtle)
- **Envelope**: Attack 0.01s, Decay 0.09s
- **Type**: Sine wave oscillator

#### 2. Click Sound
- **Function**: `playClickSound()`
- **Frequency**: 500 Hz (lower, more defined)
- **Duration**: 0.15 seconds
- **Volume**: 0.3 (slightly louder than hover)
- **Envelope**: Attack 0.01s, Decay 0.14s
- **Type**: Sine wave oscillator

### Implementation Details

#### Sound Generation

```1:50:js/ui-sounds.js
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
```

#### Hover Sound Implementation

```52:95:js/ui-sounds.js
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
```

#### Click Sound Implementation

```100:150:js/ui-sounds.js
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
```

### Integration Points

#### Menu Buttons

```1205:1220:js/ui.js
// Setup sound effects for menu buttons
function setupMenuButtonSounds() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    menuButtons.forEach(button => {
        // Hover sound
        button.addEventListener('mouseenter', async () => {
            const { playHoverSound } = await getUISoundsModule();
            playHoverSound();
        });
        
        // Click sound
        button.addEventListener('click', async (e) => {
            const { playClickSound } = await getUISoundsModule();
            playClickSound();
        });
    });
}
```

#### Splash Screen

```1020:1035:js/ui.js
    // Dismiss on button click
    if (splashButton) {
        splashButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const { playClickSound } = await getUISoundsModule();
            playClickSound();
            dismissSplash();
        });
    }
    
    // Dismiss on any click on the splash screen background
    splashScreen.addEventListener('click', async (e) => {
        if (e.target === splashScreen || e.target.closest('.splash-content') === null) {
            const { playClickSound } = await getUISoundsModule();
            playClickSound();
            dismissSplash();
        }
    });
```

### Audio Settings Integration

UI sounds respect the master audio toggle:
- **Check**: `localStorage.getItem('masterAudioEnabled')`
- **Behavior**: Sounds only play if master audio is enabled
- **No Volume Control**: UI sounds use fixed volumes (hover: 0.2, click: 0.3) for consistency

### Technical Notes

- **Dynamic Loading**: UI sounds module is loaded on-demand to avoid loading Tone.js dependencies until needed
- **Audio Context**: Reuses existing Tone.js context if available, or initializes new one if needed
- **Error Handling**: Silently fails if sounds cannot play (non-critical feature)
- **Resource Cleanup**: All audio nodes are properly disposed after sound completes
- **Short Duration**: Sounds are very short (0.1-0.15s) to prevent overlap and maintain responsiveness

---

## Tone.js Implementation

### Library Loading

Tone.js is loaded via CDN in the HTML head:

```87:87:index.html
    <script src="https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js"></script>
```

**Version**: 14.7.77

### Console Warning Suppression

The application includes code to suppress expected browser warnings related to AudioContext:

```49:85:index.html
    <script>
        // Suppress expected Tone.js AudioContext warnings BEFORE Tone.js loads
        // 
        // NOTE: Some browser-level warnings may still appear in the console. These are EXPECTED and HARMLESS:
        // - "AudioContext was not allowed to start" - Browser security requires user interaction to start audio
        // - "ScriptProcessorNode is deprecated" - Internal Tone.js deprecation warning (harmless)
        // 
        // These warnings occur because browsers require user interaction to start audio, which is a security feature.
        // We properly handle this by calling Tone.start() after user interaction (when entering first-person mode).
        // The ambient wind sound will work correctly - these are just informational browser messages.
        //
        (function() {
            const originalWarn = console.warn;
            const originalError = console.error;
            
            // Filter AudioContext warnings
            console.warn = function(...args) {
                const message = args.join(' ');
                if (message.includes('AudioContext was not allowed to start') ||
                    message.includes('must be resumed (or created) after a user gesture') ||
                    message.includes('ScriptProcessorNode is deprecated')) {
                    // Suppress expected warnings - we handle audio context properly after user interaction
                    return;
                }
                originalWarn.apply(console, args);
            };
            
            // Also filter errors that are actually just warnings
            console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes('AudioContext was not allowed to start') ||
                    message.includes('must be resumed (or created) after a user gesture')) {
                    // Suppress expected errors that are actually warnings
                    return;
                }
                originalError.apply(console, args);
            };
        })();
    </script>
```

### Audio Context Management

Tone.js requires user interaction to start the audio context (browser security requirement). The application handles this properly:

1. **Initialization**: Audio nodes are created immediately (no user interaction required)
2. **Context Start**: `Tone.start()` is called when entering first-person mode (after user interaction)
3. **Context Resume**: If context is suspended, it's resumed automatically

```79:87:js/ambient-sound.js
        // Start Tone.js context (required for Web Audio API)
        // This must be called after user interaction (which entering first-person mode provides)
        await Tone.start();
        
        // Ensure context is running
        if (Tone.context.state !== 'running') {
            await Tone.context.resume();
        }
```

### Tone.js Classes Used

1. **Tone.Noise**: Pink noise generator (ambient wind)
2. **Tone.Filter**: Low-pass filter for shaping sound (ambient wind)
3. **Tone.LFO**: Low-frequency oscillator for modulation (ambient wind)
4. **Tone.Gain**: Volume control with smooth transitions (ambient wind, UI sounds)
5. **Tone.Oscillator**: Sine wave generator (UI sounds)
6. **Tone.AmplitudeEnvelope**: Envelope for attack/decay control (UI sounds)

### Module Integration

The ambient sound module is loaded dynamically to avoid loading Tone.js dependencies until needed:

```1:8:js/ui.js
// Import ambient sound functions (will be loaded when needed)
let ambientSoundModule = null;
async function getAmbientSoundModule() {
    if (!ambientSoundModule) {
        ambientSoundModule = await import('./ambient-sound.js');
    }
    return ambientSoundModule;
}
```

This allows the settings panel to control ambient sound volume even when not in first-person mode (volume is applied when entering first-person mode).

---

## Audio Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Startup                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Load Audio Settings from localStorage                      │
│  - masterAudioEnabled                                       │
│  - musicEnabled                                             │
│  - masterVolume                                             │
│  - musicVolume                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Initialize Background Music                                │
│  - Setup HTML audio element                                 │
│  - Apply volume settings                                    │
│  - Wait for splash screen dismissal                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Splash Screen Dismissed                                    │
│  - Start background music (if enabled)                      │
│  - Music loops continuously                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  User Enters First-Person Mode                             │
│  - Stop background music                                    │
│  - Initialize Tone.js audio chain                           │
│  - Start Tone.js context (user interaction)                │
│  - Start ambient wind sound                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Settings Panel Changes                                     │
│  - Update volume sliders                                    │
│  - Apply to background music (if playing)                   │
│  - Apply to ambient sound (if playing)                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  UI Interactions (Menu Buttons, Splash Screen)             │
│  - Hover over button → playHoverSound()                    │
│  - Click button → playClickSound()                         │
│  - Check master audio toggle before playing                │
│  - Load ui-sounds module on-demand                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Details

### Volume Calculation Formula

**Background Music**:
```
finalVolume = masterVolume × musicVolume
```

**Ambient Sound**:
```
finalVolume = masterVolume × 0.35
```
(0.35 is the base volume multiplier to keep the sound subtle)

### State Management

#### Background Music States
- **Initialized**: Audio element created and configured
- **Playing**: Music is actively playing
- **Paused**: Music is paused (but ready to resume)
- **Stopped**: Music is stopped and reset to beginning

#### Ambient Sound States
- **Not Initialized**: Tone.js nodes not created
- **Initialized**: Audio chain created but not started
- **Playing**: Sound is actively playing
- **Stopped**: Sound is stopped (but nodes still exist)

#### UI Sound States
- **Not Available**: Module not loaded or Tone.js unavailable
- **Ready**: Module loaded, audio context available
- **Playing**: Sound is currently playing (very short duration)
- **Idle**: No sound playing (default state)

### Browser Compatibility

- **Web Audio API**: Required for Tone.js (all modern browsers)
- **HTML5 Audio**: Required for background music (all modern browsers)
- **localStorage**: Required for settings persistence (all modern browsers)

### Performance Considerations

1. **Lazy Loading**: Ambient sound and UI sounds modules are loaded only when needed
2. **Volume Updates**: Throttled during slider dragging (16ms intervals)
3. **Settings Persistence**: Throttled during slider dragging (50ms intervals)
4. **Audio Context**: Started only after user interaction (browser requirement)
5. **UI Sound Cleanup**: Audio nodes disposed immediately after sound completes (prevents memory leaks)
6. **Short Duration**: UI sounds are very short (0.1-0.15s) to prevent overlap and maintain responsiveness

### Error Handling

- **Missing Audio File**: Error logged, music fails silently
- **Tone.js Not Loaded**: Error logged, ambient sound and UI sounds disabled
- **Audio Context Failure**: Error logged, ambient sound and UI sounds disabled
- **Volume Changes**: Clamped to valid range (0.0 to 1.0)
- **UI Sound Failures**: Silently fail (non-critical feature, logged to debug console only)

---

## File Reference

### Core Files
- `js/ambient-sound.js` - Ambient wind sound implementation
- `js/ui-sounds.js` - UI sound effects (hover and click sounds)
- `js/ui.js` - Settings panel, audio controls, and UI sound integration
- `js/main.js` - Audio initialization and mode switching
- `index.html` - HTML audio element and Tone.js script tag

### Audio Assets
- `assets/audio/Frozen Whispers.mp3` - Background music track

### Documentation
- `DOCS/AUDIO_SYSTEM.md` - This file

---

## Summary

The audio system provides:
- ✅ Unified settings panel with master and individual controls
- ✅ Persistent settings via localStorage
- ✅ Smooth volume transitions
- ✅ Procedural ambient sound using Tone.js
- ✅ UI sound effects for interactive feedback (hover and click)
- ✅ Automatic music management (starts/stops based on game state)
- ✅ Proper browser security compliance (user interaction required)
- ✅ Error handling and graceful degradation
- ✅ Dynamic module loading for optimal performance

The system is designed to be user-friendly, performant, and maintainable.

