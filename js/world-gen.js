import * as THREE from 'three';
import { PEAK_HEIGHT, GAME_PEAK_HEIGHT } from './config.js';

// Reusable Geometry
const geometryBox = new THREE.BoxGeometry(1, 1, 1);

// Materials
const mats = {
    dirt: new THREE.MeshStandardMaterial({ color: 0x4e3629, roughness: 1.0 }),
    snowBlock: new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 1.0 }),
    leaves: new THREE.MeshStandardMaterial({ color: 0x1e4d2b, roughness: 0.8 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 }),
    plank: new THREE.MeshStandardMaterial({ color: 0x8f6a4e, roughness: 0.8 }),
    window: new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 2,
        transparent: true, opacity: 0.9
    })
};

// Track generated objects for cleanup
let generatedObjects = {
    terrain: [],
    house: [],
    trees: [],
    lights: []
};

function createVoxel(container, x, y, z, material) {
    const mesh = new THREE.Mesh(geometryBox, material);
    mesh.position.set(x, y, z);
    container.add(mesh);
    return mesh;
}

export function generateTerrainInstanced(container, SCENE_OPTS, options = {}, outputArray = null) {
    const hills = options.hills !== false; // Default to true if not specified
    const useGameHeight = options.useGameHeight || false;
    const peakHeight = useGameHeight ? GAME_PEAK_HEIGHT : PEAK_HEIGHT;
    
    const r = SCENE_OPTS.worldRadius;
    const hillR = SCENE_OPTS.hillRadius;
    const platR = SCENE_OPTS.plateauRadius;

    const dim = r * 2 + 1;
    const maxCount = dim * dim * 5;

    const dirtMesh = new THREE.InstancedMesh(geometryBox, mats.dirt, maxCount);
    const snowMesh = new THREE.InstancedMesh(geometryBox, mats.snowBlock, maxCount);

    const dummy = new THREE.Object3D();
    let dirtIdx = 0;
    let snowIdx = 0;

    for (let x = -r; x <= r; x++) {
        for (let z = -r; z <= r; z++) {
            const dist = Math.sqrt(x * x + z * z);

            if (dist > r) continue;

            let h = 0;

            if (hills) {
                if (dist < platR) {
                    h = peakHeight;
                } else if (dist < hillR) {
                    const slopeFactor = (dist - platR) / (hillR - platR);
                    const eased = (Math.cos(slopeFactor * Math.PI) + 1) / 2;
                    h = Math.round(peakHeight * eased);
                    if (dist > platR + 2 && h > 0 && Math.random() > 0.7) h -= 1;
                } else {
                    const wave1 = Math.sin(x * 0.15);
                    const wave2 = Math.cos(z * 0.15);
                    const wave3 = Math.sin((x + z) * 0.1);
                    const noise = wave1 * wave2 + wave3 * 0.5;
                    if (noise > 0.6) h = 1;
                    if (noise > 1.2) h = 2;
                }
            } else {
                // Flat terrain when hills disabled
                h = 0;
            }

            for (let y = -1; y <= h; y++) {
                dummy.position.set(x, y, z);
                dummy.updateMatrix();
                if (y === h) snowMesh.setMatrixAt(snowIdx++, dummy.matrix);
                else dirtMesh.setMatrixAt(dirtIdx++, dummy.matrix);
            }
        }
    }
    dirtMesh.count = dirtIdx;
    snowMesh.count = snowIdx;
    container.add(dirtMesh);
    container.add(snowMesh);
    
    // Track for cleanup
    generatedObjects.terrain.push(dirtMesh, snowMesh);
    
    // Add to output array if provided
    if (outputArray) {
        outputArray.push(dirtMesh, snowMesh);
    }
}

export function generateHouse(container, options = {}, outputArray = null) {
    const house = options.house !== false; // Default to true if not specified
    if (!house) return;
    
    const useGameHeight = options.useGameHeight || false;
    const peakHeight = useGameHeight ? GAME_PEAK_HEIGHT : PEAK_HEIGHT;
    const floorY = peakHeight;
    const hw = 2;
    const houseObjects = [];
    
    for (let y = 0; y < 4; y++) {
        for (let x = -hw; x <= hw; x++) {
            for (let z = -hw; z <= hw; z++) {
                const vy = floorY + y;
                if (y === 0) {
                    const voxel = createVoxel(container, x, vy, z, mats.plank);
                    houseObjects.push(voxel);
                } else if (Math.abs(x) === hw || Math.abs(z) === hw) {
                    if (z === hw && x === 0 && y < 3) continue;
                    if (y === 2 && ((Math.abs(x) === hw && z === 0) || (z === -hw && x === 0))) {
                        const voxel = createVoxel(container, x, vy, z, mats.window);
                        houseObjects.push(voxel);
                        if (x === -hw && z === 0) {
                            const light = new THREE.PointLight(0xffaa00, 1, 8);
                            light.position.set(x, vy, z);
                            container.add(light);
                            houseObjects.push(light);
                        }
                    } else {
                        const voxel = createVoxel(container, x, vy, z, mats.wood);
                        houseObjects.push(voxel);
                    }
                }
            }
        }
    }
    const roofStart = floorY + 4;
    for (let i = 0; i <= hw + 1; i++) {
        const range = hw + 1 - i;
        for (let x = -range; x <= range; x++) {
            for (let z = -range; z <= range; z++) {
                const voxel1 = createVoxel(container, x, roofStart + i, z, mats.stone);
                const voxel2 = createVoxel(container, x, roofStart + i + 0.6, z, mats.snowBlock);
                voxel2.scale.set(1, 0.2, 1);
                houseObjects.push(voxel1, voxel2);
            }
        }
    }
    const voxel1 = createVoxel(container, 1, roofStart + 2, 1, mats.stone);
    const voxel2 = createVoxel(container, 1, roofStart + 3, 1, mats.stone);
    houseObjects.push(voxel1, voxel2);
    
    // Track for cleanup
    generatedObjects.house.push(...houseObjects);
    
    // Add to output array if provided
    if (outputArray) {
        outputArray.push(...houseObjects);
    }
}

export function generateTrees(container, SCENE_OPTS, options = {}, outputArray = null) {
    const trees = options.trees !== false; // Default to true if not specified
    const lights = options.lights !== false; // Default to true if not specified
    
    if (!trees) return;
    
    const minRad = SCENE_OPTS.hillRadius + 1;
    const maxRad = SCENE_OPTS.worldRadius - 2;
    const treeObjects = [];

    for (let i = 0; i < SCENE_OPTS.treeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = minRad + Math.random() * (maxRad - minRad);
        const tx = Math.floor(Math.cos(angle) * dist);
        const tz = Math.floor(Math.sin(angle) * dist);

        const distFromCenter = Math.sqrt(tx * tx + tz * tz);
        if (distFromCenter > SCENE_OPTS.worldRadius) continue;

        let ty = 0;
        const wave1 = Math.sin(tx * 0.15);
        const wave2 = Math.cos(tz * 0.15);
        const wave3 = Math.sin((tx + tz) * 0.1);
        const noise = wave1 * wave2 + wave3 * 0.5;
        if (noise > 0.6) ty = 1;
        if (noise > 1.2) ty = 2;

        const treeObjs = buildTree(container, tx, ty + 1, tz, lights);
        if (treeObjs && treeObjs.length > 0) {
            treeObjects.push(...treeObjs);
        }
    }
    
    // Track for cleanup
    generatedObjects.trees.push(...treeObjects);
    
    // Add to output array if provided
    if (outputArray) {
        outputArray.push(...treeObjects);
    }
}

function buildTree(container, x, y, z, lightsEnabled = true) {
    const treeObjects = [];
    const h = 4 + Math.floor(Math.random() * 2);
    for (let i = 0; i < h; i++) {
        const voxel = createVoxel(container, x, y + i, z, mats.wood);
        treeObjects.push(voxel);
    }

    const leafStart = y + h - 2;
    const top = leafStart + 3;

    for (let ly = leafStart; ly <= top; ly++) {
        let rad = 0;
        if (ly === leafStart) rad = 2;
        else if (ly === leafStart + 1) rad = 2;
        else if (ly === leafStart + 2) rad = 1;
        else rad = 0;

        for (let lx = -rad; lx <= rad; lx++) {
            for (let lz = -rad; lz <= rad; lz++) {
                if (Math.abs(lx) === rad && Math.abs(lz) === rad && rad > 0) continue;
                if (lx === 0 && lz === 0 && ly < y + h) continue;

                const vx = x + lx;
                const vz = z + lz;
                const voxel = createVoxel(container, vx, ly, vz, mats.leaves);
                treeObjects.push(voxel);

                // Lights: 4% chance (only if enabled)
                if (lightsEnabled && Math.random() < 0.04) {
                    const lightObj = addLight(container, vx, ly, vz, lx, 0, lz);
                    treeObjects.push(lightObj);
                }
            }
        }
    }
    
    return treeObjects;
}

function addLight(container, x, y, z, lx, ly, lz) {
    const colors = [0xff0000, 0x00ff00, 0x2266ff, 0xffd700];
    const c = colors[Math.floor(Math.random() * colors.length)];
    const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const mat = new THREE.MeshStandardMaterial({
        color: c, emissive: c, emissiveIntensity: 10.0
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x + (lx ? Math.sign(lx) * 0.6 : 0), y, z + (lz ? Math.sign(lz) * 0.6 : 0));
    container.add(mesh);
    return mesh;
}

// Clear all generated world objects from a container
export function clearWorld(container) {
    // Remove terrain
    generatedObjects.terrain.forEach(obj => {
        container.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });
    
    // Remove house objects
    generatedObjects.house.forEach(obj => {
        container.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });
    
    // Remove trees
    generatedObjects.trees.forEach(obj => {
        container.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });
    
    // Clear tracking arrays
    generatedObjects.terrain = [];
    generatedObjects.house = [];
    generatedObjects.trees = [];
    generatedObjects.lights = [];
}

// Calculate ground height at given X/Z position
export function getGroundHeight(x, z, SCENE_OPTS, useGameHeight = false) {
    const r = SCENE_OPTS.worldRadius;
    const hillR = SCENE_OPTS.hillRadius;
    const platR = SCENE_OPTS.plateauRadius;
    const peakHeight = useGameHeight ? GAME_PEAK_HEIGHT : PEAK_HEIGHT;
    
    const dist = Math.sqrt(x * x + z * z);
    
    if (dist > r) return 0;
    
    let h = 0;
    
    if (dist < platR) {
        h = peakHeight;
    } else if (dist < hillR) {
        const slopeFactor = (dist - platR) / (hillR - platR);
        const eased = (Math.cos(slopeFactor * Math.PI) + 1) / 2;
        h = Math.round(peakHeight * eased);
    } else {
        const wave1 = Math.sin(x * 0.15);
        const wave2 = Math.cos(z * 0.15);
        const wave3 = Math.sin((x + z) * 0.1);
        const noise = wave1 * wave2 + wave3 * 0.5;
        if (noise > 0.6) h = 1;
        if (noise > 1.2) h = 2;
    }
    
    return h;
}
