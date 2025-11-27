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
