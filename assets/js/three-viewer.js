import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';


function formattedBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


function loadWithProgress(loader, url, onProgress) {
    return new Promise((resolve, reject) => {
        loader.load(url, resolve, onProgress, reject);
    });
}


async function loadModel(url, onProgress) {
    const extension = new URL(url, window.location.href).pathname.split('.').pop().toLowerCase();
    if (extension === 'stl') {
        const geometry = await loadWithProgress(new STLLoader(), url, onProgress);
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({
            color: 0xd7d9da,
            metalness: 0.05,
            roughness: 0.72,
        });
        const group = new THREE.Group();
        group.add(new THREE.Mesh(geometry, material));
        return group;
    }
    if (extension === 'glb' || extension === 'gltf') {
        const gltf = await loadWithProgress(new GLTFLoader(), url, onProgress);
        return gltf.scene;
    }
    throw new Error(`Unsupported model format: .${extension}`);
}


export async function createModelViewer(container, options) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.autoClear = false;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', options.alt);
    renderer.domElement.tabIndex = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1d1f21);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x60656a, 1.8);
    scene.add(hemisphereLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2, 3, 4);
    keyLight.visible = false;
    scene.add(keyLight);

    const progressPanel = document.createElement('div');
    progressPanel.className = 'model-download-progress';
    progressPanel.setAttribute('role', 'status');
    progressPanel.setAttribute('aria-live', 'polite');
    const progressLabel = document.createElement('span');
    progressLabel.textContent = 'Downloading model…';
    const progressBar = document.createElement('progress');
    progressBar.max = 100;
    progressPanel.append(progressLabel, progressBar);
    container.replaceChildren(renderer.domElement, progressPanel);

    const updateProgress = (event) => {
        if (event.lengthComputable && event.total > 0) {
            const percent = Math.min(100, (event.loaded / event.total) * 100);
            progressBar.value = percent;
            progressLabel.textContent = `Downloading model… ${Math.round(percent)}%`;
        } else {
            progressBar.removeAttribute('value');
            progressLabel.textContent = `Downloading model… ${formattedBytes(event.loaded)}`;
        }
        options.onStatus?.(progressLabel.textContent);
    };

    let model;
    try {
        model = await loadModel(options.src, updateProgress);
    } catch (error) {
        if (!options.fallbackSrc || options.fallbackSrc === options.src) {
            renderer.dispose();
            throw error;
        }
        progressBar.removeAttribute('value');
        progressLabel.textContent = 'GLB unavailable. Downloading STL fallback…';
        options.onStatus?.(progressLabel.textContent);
        try {
            model = await loadModel(options.fallbackSrc, updateProgress);
        } catch (fallbackError) {
            renderer.dispose();
            throw fallbackError;
        }
    }
    progressPanel.remove();

    if (options.upAxis === 'z') model.rotation.x = -Math.PI / 2;
    model.updateMatrixWorld(true);
    scene.add(model);

    const modelMaterials = new Set();
    const edgeOverlays = [];
    const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0x16191b,
        transparent: true,
        opacity: 0.72,
        toneMapped: false,
    });
    model.traverse((child) => {
        if (!child.isMesh) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => modelMaterials.add(material));

        const overlay = new THREE.LineSegments(
            new THREE.WireframeGeometry(child.geometry),
            edgeMaterial,
        );
        overlay.visible = false;
        overlay.raycast = () => {};
        child.add(overlay);
        edgeOverlays.push(overlay);
    });

    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const dimensions = bounds.getSize(new THREE.Vector3());
    const radius = Math.max(dimensions.length() / 2, 0.01);

    const gridSize = Math.max(10, Math.ceil(Math.max(dimensions.x, dimensions.z) / 10) * 20);
    const grid = new THREE.GridHelper(gridSize, 20, 0x51565b, 0x51565b);
    grid.position.y = bounds.min.y - (radius * 0.002);
    grid.material.transparent = true;
    grid.material.opacity = 0.65;
    scene.add(grid);

    const gridAxisGeometry = new THREE.BufferGeometry();
    const halfGrid = gridSize / 2;
    gridAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        -halfGrid, 0, 0, halfGrid, 0, 0,
        0, 0, -halfGrid, 0, 0, halfGrid,
    ], 3));
    gridAxisGeometry.setAttribute('color', new THREE.Float32BufferAttribute([
        1, 0.267, 0.4, 1, 0.267, 0.4,
        0.267, 0.533, 1, 0.267, 0.533, 1,
    ], 3));
    const gridAxes = new THREE.LineSegments(
        gridAxisGeometry,
        new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false }),
    );
    gridAxes.position.y = grid.position.y + (radius * 0.001);
    scene.add(gridAxes);

    controls.target.copy(center);
    const initialDirection = new THREE.Vector3(1.2, 0.9, 1.2).normalize();
    const initialPosition = center.clone().addScaledVector(initialDirection, radius * 2.8);
    camera.position.copy(initialPosition);
    camera.near = Math.max(radius / 100, 0.001);
    camera.far = Math.max(radius * 100, 100);
    camera.updateProjectionMatrix();
    controls.minDistance = radius * 0.15;
    controls.maxDistance = radius * 12;
    controls.update();

    const viewHelper = new ViewHelper(camera, renderer.domElement);
    viewHelper.center.copy(center);
    viewHelper.setLabels('X', 'Y', 'Z');
    viewHelper.setLabelStyle('20px JetBrains Mono', '#1d1f21', 14);
    viewHelper.children.forEach((child) => {
        if (child.userData.type?.startsWith('neg')) child.visible = false;
    });

    renderer.domElement.addEventListener('pointerup', (event) => {
        viewHelper.center.copy(controls.target);
        viewHelper.handleClick(event);
    });

    const resize = () => {
        const width = Math.max(container.clientWidth, 1);
        const height = Math.max(container.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        if (viewHelper.animating) {
            viewHelper.update(delta);
        } else {
            controls.update();
        }
        renderer.clear();
        renderer.render(scene, camera);
        viewHelper.render(renderer);
    });

    const reset = () => {
        camera.position.copy(initialPosition);
        controls.target.copy(center);
        viewHelper.center.copy(center);
        controls.update();
    };

    const setRenderMode = (mode) => {
        const wireframe = mode === 'wireframe';
        modelMaterials.forEach((material) => {
            if ('wireframe' in material) {
                material.wireframe = wireframe;
                material.needsUpdate = true;
            }
        });
        edgeOverlays.forEach((overlay) => {
            overlay.visible = mode === 'edges';
        });
    };

    const setLightingMode = (mode) => {
        const directional = mode === 'directional';
        keyLight.visible = directional;
        hemisphereLight.intensity = directional ? 1.15 : 1.8;
    };

    const dispose = () => {
        renderer.setAnimationLoop(null);
        resizeObserver.disconnect();
        controls.dispose();
        scene.traverse((child) => {
            child.geometry?.dispose();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.filter(Boolean).forEach((material) => material.dispose());
        });
        renderer.dispose();
        renderer.domElement.remove();
    };

    return { dispose, reset, setLightingMode, setRenderMode };
}
