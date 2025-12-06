import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { StageBuilder } from './stageBuilder.js';
import { LightingSystem } from './lightingSystem.js';
import { LaserController } from './laserController.js';

class PalcoParametrico {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.stageBuilder = null;
        this.lightingSystem = null;
        this.laserController = null;
        this.glbModel = null;
        this.clock = new THREE.Clock();

        // Stats tracking
        this.stats = { fps: 0, triangles: 0 };
        this.lastFrameTime = performance.now();
        this.frameCount = 0;

        // Video elements
        this.videoPreview = document.getElementById('video-preview');

        this.init();
        this.setupEventListeners();
        this.hideLoading();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.defaultBgColor = new THREE.Color(0x4a4a4a);
        this.scene.background = this.defaultBgColor;
        this.scene.fog = new THREE.FogExp2(0x4a4a4a, 0.008);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );
        this.camera.position.set(-1.4717909951771859e-15, 40, 0.10000000000114141);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.target.set(0, 0, 0);

        this.sunsetSkyEnabled = true;
        this.skyDome = this.createSunsetSky();
        this.scene.add(this.skyDome);
        this.scene.background = null;

        // Initialize subsystems
        this.stageBuilder = new StageBuilder(this.scene);
        this.lightingSystem = new LightingSystem(this.scene);
        this.lightingSystem.setupLighting();
        this.laserController = new LaserController(this.scene);

        // Build initial stage
        this.stageBuilder.rebuild();

        // Window resize handler
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }
    }

    setupEventListeners() {
        // Tower configuration
        this.setupSlider('tower-count', 'tower-count-val', (value) => {
            this.stageBuilder.setParam('towerCount', parseInt(value));
        });

        document.getElementById('tower-shape').addEventListener('change', (e) => {
            this.stageBuilder.setParam('towerShape', e.target.value);
        });

        this.setupSlider('tower-levels', 'tower-levels-val', (value) => {
            this.stageBuilder.setParam('towerLevels', parseInt(value));
        });

        this.setupSlider('layout-radius', 'layout-radius-val', (value) => {
            this.stageBuilder.setParam('layoutRadius', parseFloat(value));
        });

        document.getElementById('layout-type').addEventListener('change', (e) => {
            this.stageBuilder.setParam('layoutType', e.target.value);
        });

        this.setupSlider('layout-rows', 'layout-rows-val', (value) => {
            this.stageBuilder.setParam('layoutRows', parseInt(value));
        });

        this.setupSlider('layout-cols', 'layout-cols-val', (value) => {
            this.stageBuilder.setParam('layoutCols', parseInt(value));
        });

        this.setupSlider('layout-spacing-x', 'layout-spacing-x-val', (value) => {
            this.stageBuilder.setParam('layoutSpacingX', parseFloat(value));
        });

        this.setupSlider('layout-spacing-y', 'layout-spacing-y-val', (value) => {
            this.stageBuilder.setParam('layoutSpacingY', parseFloat(value));
        });

        this.setupSlider('tower-width', 'tower-width-val', (value) => {
            this.stageBuilder.setParam('towerWidth', parseFloat(value));
        });

        this.setupSlider('tower-depth', 'tower-depth-val', (value) => {
            this.stageBuilder.setParam('towerDepth', parseFloat(value));
        });

        // Pipe configuration
        this.setupSlider('pipe-diameter', 'pipe-diameter-val', (value) => {
            this.stageBuilder.setParam('pipeDiameter', parseInt(value) / 1000); // Convert mm to m
        });

        document.getElementById('pipe-color').addEventListener('input', (e) => {
            const color = parseInt(e.target.value.replace('#', ''), 16);
            this.stageBuilder.setParam('pipeColor', color);
        });

        document.getElementById('show-diagonal-braces').addEventListener('change', (e) => {
            this.stageBuilder.setParam('showDiagonalBraces', e.target.checked);
        });

        // LED Box Truss Central configuration
        document.getElementById('led-boxtruss-enabled').addEventListener('change', (e) => {
            this.stageBuilder.setParam('ledBoxTrussEnabled', e.target.checked);
        });

        this.setupSlider('boxtruss-panels', 'boxtruss-panels-val', (value) => {
            this.stageBuilder.setParam('ledBoxTrussPanelsPerFace', parseInt(value));
        });

        this.setupSlider('boxtruss-faces', 'boxtruss-faces-val', (value) => {
            this.stageBuilder.setParam('ledBoxTrussFaces', parseInt(value));
        });

        // LED Andaimes Externos configuration
        document.getElementById('led-external-enabled').addEventListener('change', (e) => {
            this.stageBuilder.setParam('ledExternalEnabled', e.target.checked);
        });

        this.setupSlider('external-panels', 'external-panels-val', (value) => {
            this.stageBuilder.setParam('ledExternalPanelsPerFace', parseInt(value));
        });

        this.setupSlider('external-faces', 'external-faces-val', (value) => {
            this.stageBuilder.setParam('ledExternalFaces', parseInt(value));
        });

        this.setupSlider('external-panels-row', 'external-panels-row-val', (value) => {
            this.stageBuilder.setParam('ledExternalPanelsPerRow', parseInt(value));
        });

        // Video controls
        document.getElementById('video-upload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.stageBuilder.setVideoSource(file);
                this.videoPreview.src = URL.createObjectURL(file);
                this.videoPreview.style.display = 'block';
            }
        });

        document.getElementById('apply-video').addEventListener('click', () => {
            const urlInput = document.getElementById('video-url');
            if (urlInput.value) {
                this.stageBuilder.setVideoSource(urlInput.value);
                this.videoPreview.src = urlInput.value;
                this.videoPreview.style.display = 'block';
            }
            this.stageBuilder.applyVideoTexture();
            document.getElementById('led-effect').value = 'video';
        });

        document.getElementById('play-video').addEventListener('click', () => {
            this.stageBuilder.playVideo();
            this.videoPreview.play();
        });

        document.getElementById('pause-video').addEventListener('click', () => {
            this.stageBuilder.pauseVideo();
            this.videoPreview.pause();
        });

        // LED effects
        document.getElementById('led-effect').addEventListener('change', (e) => {
            this.stageBuilder.setParam('ledEffect', e.target.value);
        });

        document.getElementById('led-color').addEventListener('input', (e) => {
            const color = parseInt(e.target.value.replace('#', ''), 16);
            this.stageBuilder.params.ledColor = color;
            this.stageBuilder.updateLedColorForType('all', color);
        });

        document.getElementById('led-color-box').addEventListener('input', (e) => {
            const color = parseInt(e.target.value.replace('#', ''), 16);
            this.stageBuilder.setParam('ledBoxTrussColor', color);
        });

        document.getElementById('led-color-external').addEventListener('input', (e) => {
            const color = parseInt(e.target.value.replace('#', ''), 16);
            this.stageBuilder.setParam('ledExternalColor', color);
        });

        this.setupSlider('led-intensity', 'led-intensity-val', (value) => {
            this.stageBuilder.params.ledIntensity = parseFloat(value);
            this.stageBuilder.updateLedIntensityForType('all', parseFloat(value));
        });

        this.setupSlider('led-intensity-box', 'led-intensity-box-val', (value) => {
            this.stageBuilder.setParam('ledBoxTrussIntensity', parseFloat(value));
        });

        this.setupSlider('led-intensity-external', 'led-intensity-external-val', (value) => {
            this.stageBuilder.setParam('ledExternalIntensity', parseFloat(value));
        });

        this.setupSlider('animation-speed', 'animation-speed-val', (value) => {
            this.stageBuilder.params.animationSpeed = parseFloat(value);
        });

        // Camera controls
        document.getElementById('reset-camera').addEventListener('click', () => {
            this.camera.position.set(-1.4717909951771859e-15, 40, 0.10000000000114141);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        });

        document.getElementById('top-view').addEventListener('click', () => {
            this.camera.position.set(0, 40, 0.1);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        });

        document.getElementById('front-view').addEventListener('click', () => {
            this.camera.position.set(0, 8, 35);
            this.controls.target.set(0, 5, 0);
            this.controls.update();
        });

        document.getElementById('side-view').addEventListener('click', () => {
            this.camera.position.set(35, 8, 0);
            this.controls.target.set(0, 5, 0);
            this.controls.update();
        });

        document.getElementById('auto-rotate').addEventListener('change', (e) => {
            this.controls.autoRotate = e.target.checked;
            this.controls.autoRotateSpeed = 1.0;
        });

        const toggleSky = document.getElementById('enable-sky');
        if (toggleSky) {
            toggleSky.addEventListener('change', (e) => {
                this.sunsetSkyEnabled = e.target.checked;
                if (this.skyDome) this.skyDome.visible = this.sunsetSkyEnabled;
                this.scene.fog = this.sunsetSkyEnabled ? new THREE.FogExp2(0x4a4a4a, 0.008) : null;
                this.scene.background = this.sunsetSkyEnabled ? null : this.defaultBgColor;
            });
        }

        document.getElementById('show-floor').addEventListener('change', (e) => {
            this.stageBuilder.setFloorVisible(e.target.checked);
        });

        const concreteToggle = document.getElementById('concrete-floor');
        if (concreteToggle) {
            concreteToggle.addEventListener('change', (e) => {
                this.stageBuilder.applyConcreteFloor(e.target.checked);
            });
        }

        document.getElementById('show-stage-deck').addEventListener('change', (e) => {
            this.stageBuilder.setParam('stageDeckEnabled', e.target.checked);
        });

        document.getElementById('show-towers').addEventListener('change', (e) => {
            this.stageBuilder.setTowersVisible(e.target.checked);
        });

        document.getElementById('lasers-enabled').addEventListener('change', (e) => {
            this.stageBuilder.setParam('lasersEnabled', e.target.checked);
        });

        document.getElementById('show-dimensions').addEventListener('change', (e) => {
            this.stageBuilder.setParam('showDimensions', e.target.checked);
        });

        // Stage deck sizing
        this.setupSlider('deck-back-left', 'deck-back-left-val', (value) => {
            this.stageBuilder.setParam('backstageLeftWidth', parseFloat(value));
        });
        this.setupSlider('deck-back-center', 'deck-back-center-val', (value) => {
            this.stageBuilder.setParam('backstageCenterWidth', parseFloat(value));
        });
        this.setupSlider('deck-back-right', 'deck-back-right-val', (value) => {
            this.stageBuilder.setParam('backstageRightWidth', parseFloat(value));
        });
        this.setupSlider('deck-back-depth', 'deck-back-depth-val', (value) => {
            this.stageBuilder.setParam('backstageDepth', parseFloat(value));
        });
        this.setupSlider('deck-dj-width', 'deck-dj-width-val', (value) => {
            this.stageBuilder.setParam('djWidth', parseFloat(value));
        });
        this.setupSlider('deck-dj-depth', 'deck-dj-depth-val', (value) => {
            this.stageBuilder.setParam('djDepth', parseFloat(value));
        });
        this.setupSlider('deck-front-width', 'deck-front-width-val', (value) => {
            this.stageBuilder.setParam('frontWidth', parseFloat(value));
        });
        this.setupSlider('deck-front-depth', 'deck-front-depth-val', (value) => {
            this.stageBuilder.setParam('frontDepth', parseFloat(value));
        });
        this.setupSlider('deck-height', 'deck-height-val', (value) => {
            this.stageBuilder.setParam('deckHeight', parseFloat(value));
        });

        document.getElementById('hide-rear-panels').addEventListener('change', (e) => {
            this.stageBuilder.setParam('hideRearPanels', e.target.checked);
        });

        document.getElementById('railings-enabled').addEventListener('change', (e) => {
            this.stageBuilder.setParam('railingsEnabled', e.target.checked);
        });

        document.getElementById('stairs-enabled').addEventListener('change', (e) => {
            this.stageBuilder.setParam('stairsEnabled', e.target.checked);
        });

        document.getElementById('risers-enabled').addEventListener('change', (e) => {
            this.stageBuilder.setParam('risersEnabled', e.target.checked);
        });

        // Laser Party controls
        const laserColor = document.getElementById('laser-color');
        if (laserColor) {
            laserColor.addEventListener('input', (e) => {
                const color = new THREE.Color(e.target.value);
                this.laserController.setHue(color.getHSL({}).h * 360);
            });
        }

        const laserSpeed = document.getElementById('laser-speed');
        if (laserSpeed) {
            laserSpeed.addEventListener('input', (e) => {
                this.laserController.setSpeed(parseFloat(e.target.value));
                const label = document.getElementById('laser-speed-val');
                if (label) label.textContent = e.target.value;
            });
        }

        const laserPattern = document.getElementById('laser-pattern');
        if (laserPattern) {
            laserPattern.addEventListener('change', (e) => {
                this.laserController.setPattern(e.target.value);
            });
        }

        document.getElementById('show-glb-model').addEventListener('change', (e) => {
            if (e.target.checked && !this.glbModel) {
                this.loadGLB();
            } else if (this.glbModel) {
                this.glbModel.visible = e.target.checked;
            }
        });

        // Export
        document.getElementById('export-config').addEventListener('click', () => {
            this.exportConfiguration();
        });
    }

    createSunsetSky() {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Gradient
        const grad = ctx.createLinearGradient(0, size, 0, 0);
        grad.addColorStop(0, '#2a1f1a');
        grad.addColorStop(0.35, '#f47c42');
        grad.addColorStop(0.55, '#344c73');
        grad.addColorStop(1, '#0b1027');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Stars
        ctx.fillStyle = 'white';
        const starCount = 900;
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * (size * 0.7);
            const r = Math.random() * 1.2 + 0.2;
            ctx.globalAlpha = Math.random() * 0.8 + 0.2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            toneMapped: false
        });
        const geo = new THREE.SphereGeometry(500, 32, 32);
        const mesh = new THREE.Mesh(geo, material);
        mesh.name = 'sunsetSkyDome';
        return mesh;
    }

    setupSlider(sliderId, displayId, callback) {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);

        if (slider && display) {
            slider.addEventListener('input', (e) => {
                display.textContent = e.target.value;
                callback(e.target.value);
            });
        }
    }


    loadGLB() {
        const loader = new GLTFLoader();

        loader.load(
            './assets/GANGANBAIAU.glb',
            (gltf) => {
                this.glbModel = gltf.scene;

                // Center and scale the model
                const box = new THREE.Box3().setFromObject(this.glbModel);

                // Encostar no piso em y=0 e alinhar no ponto 0 global
                this.glbModel.position.set(0, -box.min.y, 0);

                // Enable shadows
                this.glbModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.scene.add(this.glbModel);
                console.log('GLB Model loaded successfully');
            },
            (progress) => {
                console.log('Loading GLB:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
            },
            (error) => {
                console.error('Error loading GLB:', error);
            }
        );
    }

    exportConfiguration() {
        const config = {
            timestamp: new Date().toISOString(),
            stage: this.stageBuilder.getConfig(),
            lighting: this.lightingSystem.getConfig(),
            camera: {
                position: this.camera.position.toArray(),
                target: this.controls.target.toArray()
            },
            glbModel: {
                visible: !!(this.glbModel && this.glbModel.visible),
                path: './assets/GANGANBAIAU.glb'
            },
            visual: {
                skyEnabled: this.sunsetSkyEnabled,
                concreteFloor: this.stageBuilder ? this.stageBuilder.params.useConcreteFloor : false
            }
        };

        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'palco-config-' + Date.now() + '.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    updateStats() {
        this.frameCount++;
        const currentTime = performance.now();

        if (currentTime >= this.lastFrameTime + 1000) {
            this.stats.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;

            // Count triangles
            let triangles = 0;
            this.scene.traverse((obj) => {
                if (obj.isMesh && obj.geometry) {
                    if (obj.geometry.index) {
                        triangles += obj.geometry.index.count / 3;
                    } else if (obj.geometry.attributes.position) {
                        triangles += obj.geometry.attributes.position.count / 3;
                    }
                }
            });
            this.stats.triangles = Math.floor(triangles);

            // Update UI
            document.getElementById('fps').textContent = this.stats.fps;
            document.getElementById('tower-stat').textContent = this.stageBuilder.getTowerCount();
            const panelCounts = this.stageBuilder.getPanelCounts();
            document.getElementById('panel-external-stat').textContent = panelCounts.external;
            document.getElementById('panel-boxtruss-stat').textContent = panelCounts.boxTruss;
            document.getElementById('panel-total-stat').textContent = panelCounts.total;
            const panelAreas = this.stageBuilder.getPanelAreas();
            document.getElementById('panel-external-area').textContent = panelAreas.external.toFixed(2);
            document.getElementById('panel-boxtruss-area').textContent = panelAreas.boxTruss.toFixed(2);
            document.getElementById('panel-total-area').textContent = panelAreas.total.toFixed(2);
            document.getElementById('triangles').textContent = this.stats.triangles.toLocaleString();

            const dims = this.stageBuilder.getDimensions();
            document.getElementById('tower-dims').textContent =
                `${dims.towers.width.toFixed(2)}m x ${dims.towers.depth.toFixed(2)}m x ${dims.towers.height.toFixed(2)}m`;
            document.getElementById('stage-dims').textContent =
                `${dims.stage.width.toFixed(2)}m x ${dims.stage.depth.toFixed(2)}m x ${dims.stage.height.toFixed(2)}m`;
            document.getElementById('tower-width-only').textContent = `${dims.towers.width.toFixed(2)} m`;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // Update controls
        this.controls.update();

        // Update stage builder (LED animations)
        this.stageBuilder.update(delta);
        this.laserController.update(this.stageBuilder.towersGroup);

        // Update lighting
        this.lightingSystem.update(delta);

        // Sky visibility (in case it was toggled)
        if (this.skyDome) this.skyDome.visible = this.sunsetSkyEnabled;

        // Render
        this.renderer.render(this.scene, this.camera);

        // Update stats
        this.updateStats();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PalcoParametrico();
});
