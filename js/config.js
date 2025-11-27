export const SCENE_OPTS = {
    bgColor: 0x020205,
    snowCount: 3000,      
    leafCount: 1200,      
    worldRadius: 75,      
    hillRadius: 14,       
    plateauRadius: 5,     
    treeCount: 140        
};

// Game world options (larger world for gameplay)
export const GAME_WORLD_OPTS = {
    bgColor: 0x020205,
    snowCount: 6000,      // More particles for larger world
    leafCount: 2400,      // More leaves for more trees
    worldRadius: 150,     // 2x larger world
    hillRadius: 28,       // Scaled proportionally
    plateauRadius: 10,    // Scaled proportionally
    treeCount: 400        // More trees for larger world
};

export const PEAK_HEIGHT = Math.round(SCENE_OPTS.hillRadius * 0.7);
export const GAME_PEAK_HEIGHT = Math.round(GAME_WORLD_OPTS.hillRadius * 0.7);

// Default keybind mappings
export const DEFAULT_KEYBINDS = {
    forward: 'KeyW',
    backward: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    jump: 'Space'
};

// Key display name mapping (for UI display)
const KEY_DISPLAY_NAMES = {
    'KeyW': 'W',
    'KeyA': 'A',
    'KeyS': 'S',
    'KeyD': 'D',
    'KeyQ': 'Q',
    'KeyE': 'E',
    'KeyR': 'R',
    'KeyF': 'F',
    'KeyG': 'G',
    'KeyH': 'H',
    'KeyZ': 'Z',
    'KeyX': 'X',
    'KeyC': 'C',
    'KeyV': 'V',
    'KeyB': 'B',
    'KeyN': 'N',
    'KeyM': 'M',
    'Space': 'Space',
    'ShiftLeft': 'Shift',
    'ShiftRight': 'Shift',
    'ControlLeft': 'Ctrl',
    'ControlRight': 'Ctrl',
    'AltLeft': 'Alt',
    'AltRight': 'Alt',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→'
};

// Load keybinds from localStorage or return defaults
export function loadKeybinds() {
    try {
        const stored = localStorage.getItem('keybinds');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to ensure all keys exist
            return { ...DEFAULT_KEYBINDS, ...parsed };
        }
    } catch (e) {
        console.warn('Failed to load keybinds from localStorage:', e);
    }
    return { ...DEFAULT_KEYBINDS };
}

// Save keybinds to localStorage
export function saveKeybinds(keybinds) {
    try {
        localStorage.setItem('keybinds', JSON.stringify(keybinds));
    } catch (e) {
        console.warn('Failed to save keybinds to localStorage:', e);
    }
}

// Get display name for a key code
export function getKeyDisplayName(keyCode) {
    return KEY_DISPLAY_NAMES[keyCode] || keyCode.replace('Key', '').replace('Arrow', '');
}

// Get keybind for a specific action
export function getKeybind(action) {
    const keybinds = loadKeybinds();
    return keybinds[action] || DEFAULT_KEYBINDS[action];
}