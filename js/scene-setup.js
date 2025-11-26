import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PEAK_HEIGHT } from './config.js';

async function createRenderer() {
    let renderer;

    // Try WebGPU first (requires three.webgpu.js build for r181)
    if (navigator.gpu) {
        try {
            // Dynamically import the WebGPU build which includes WebGPURenderer
            const WebGPUModule = await import('https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.webgpu.js');
            const WebGPURenderer = WebGPUModule.WebGPURenderer;

            renderer = new WebGPURenderer({
                antialias: true,
                forceWebGL: false
            });
            await renderer.init();
            console.log('✅ WebGPU renderer initialized successfully');
        } catch (error) {
            console.warn('⚠️ WebGPU initialization failed, falling back to WebGL:', error);
            renderer = null;
        }
    } else {
        console.log('ℹ️ WebGPU not available in this browser');
    }

    // Fallback to WebGL
    if (!renderer) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        console.log('🔄 Using WebGL renderer');
    }

    // Apply common settings
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild(renderer.domElement);

    return renderer;
}

export async function setupScene(SCENE_OPTS) {
    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCENE_OPTS.bgColor);
    scene.fog = new THREE.FogExp2(SCENE_OPTS.bgColor, 0.007);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(75, 45, 75);

    // 3. Renderer (async initialization)
    const renderer = await createRenderer();

    // 4. Lighting
    const ambient = new THREE.AmbientLight(0x404070, 0.6);
    scene.add(ambient);

    const moonLight = new THREE.DirectionalLight(0xaaccff, 1.2);
    moonLight.position.set(20, 50, -20);
    scene.add(moonLight);

    // 5. Post Processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
    );
    bloomPass.threshold = 0.4;
    bloomPass.strength = 0.7;
    bloomPass.radius = 0.5;
    composer.addPass(bloomPass);

    composer.addPass(new OutputPass());

    // 6. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.target.set(0, PEAK_HEIGHT / 2, 0);

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, composer, controls };
}
