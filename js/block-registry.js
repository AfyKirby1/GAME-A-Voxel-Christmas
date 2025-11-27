// Block Registry System
// Tracks all blocks in the world for future destructibility functionality

const blockRegistry = new Map(); // Key: "x,y,z" string, Value: block data object

/**
 * Register a block in the registry
 * @param {number} x - Block X position
 * @param {number} y - Block Y position
 * @param {number} z - Block Z position
 * @param {string} type - Block type (dirt, snow, wood, leaves, stone, plank, window)
 * @param {THREE.Mesh|THREE.InstancedMesh} mesh - The mesh object
 * @param {boolean} isInstanced - Whether this is an instanced mesh
 * @param {number} instanceIndex - Instance index (for instanced meshes)
 * @param {THREE.Object3D} container - Container object that holds the block
 */
export function registerBlock(x, y, z, type, mesh, isInstanced = false, instanceIndex = null, container = null) {
    const key = `${x},${y},${z}`;
    blockRegistry.set(key, {
        x,
        y,
        z,
        type,
        mesh,
        isInstanced,
        instanceIndex,
        container
    });
}

/**
 * Get block data at a specific position
 * @param {number} x - Block X position
 * @param {number} y - Block Y position
 * @param {number} z - Block Z position
 * @returns {Object|null} Block data or null if not found
 */
export function getBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    return blockRegistry.get(key) || null;
}

/**
 * Remove a block from the registry (prepared for future destruction)
 * @param {number} x - Block X position
 * @param {number} y - Block Y position
 * @param {number} z - Block Z position
 * @returns {boolean} True if block was found and removed
 */
export function removeBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    return blockRegistry.delete(key);
}

/**
 * Clear all blocks from the registry
 */
export function clearRegistry() {
    blockRegistry.clear();
}

/**
 * Get all blocks in the registry
 * @returns {Array} Array of block data objects
 */
export function getAllBlocks() {
    return Array.from(blockRegistry.values());
}

/**
 * Get block count
 * @returns {number} Number of registered blocks
 */
export function getBlockCount() {
    return blockRegistry.size;
}

