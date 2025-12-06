import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { StageBuilder } from './stageBuilder.js';
import { LightingSystem } from './lightingSystem.js';
import { LaserController } from './laserController.js';
import { AudioSystem } from './audioSystem.js';

class PalcoParametrico {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.stageBuilder = null;
        this.lightingSystem = null;
        this.laserController = null;
        this.audioSystem = null;
        this.glbModel = null;
        this.clock = new THREE.Clock();

        // Camera auto-rotate
        this.autoRotate = false;
        this.cameraSpeed = 2.0;

        // Current scenes
        this.currentLedScene = 'audio-reactive';
        this.currentLightScene = 'audio-sync';

        // Stats tracking
        this.stats = { fps: 0, triangles: 0 };
        this.lastFrameTime = performance.now();
        this.frameCount = 0;

        this.init();
        this.setupEventListeners();
        this.hideLoading();
    }

    async init() {
        // Scene
        this.scene = new THREE.Scene();
        this.defaultBgColor = new THREE.Color(0x000000);
        this.scene.background = this.defaultBgColor;

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );
        this.camera.position.set(0, 15, 30);

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
        this.controls.target.set(0, 5, 0);

        // Sky dome
        this.skyDome = this.createSunsetSky();
        this.scene.add(this.skyDome);

        // Initialize subsystems
        this.stageBuilder = new StageBuilder(this.scene);
        this.lightingSystem = new LightingSystem(this.scene);
        this.lightingSystem.setupLighting();
        this.laserController = new LaserController(this.scene);

        // Initialize audio system
        this.audioSystem = new AudioSystem();
        await this.audioSystem.init();
        await this.audioSystem.loadMusicLibrary();

        // Build initial stage
        this.stageBuilder.rebuild();

        // Populate music tracks UI
        this.populateMusicTracks();

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
        // Camera controls
        document.getElementById('cam-forward').addEventListener('click', () => {
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();
            this.camera.position.add(forward.multiplyScalar(this.cameraSpeed));
            this.controls.target.add(forward.multiplyScalar(this.cameraSpeed));
        });

        document.getElementById('cam-backward').addEventListener('click', () => {
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();
            this.camera.position.sub(forward.multiplyScalar(this.cameraSpeed));
            this.controls.target.sub(forward.multiplyScalar(this.cameraSpeed));
        });

        document.getElementById('cam-left').addEventListener('click', () => {
            const angle = Math.PI / 8;
            const position = this.camera.position.clone().sub(this.controls.target);
            position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            this.camera.position.copy(position.add(this.controls.target));
        });

        document.getElementById('cam-right').addEventListener('click', () => {
            const angle = -Math.PI / 8;
            const position = this.camera.position.clone().sub(this.controls.target);
            position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            this.camera.position.copy(position.add(this.controls.target));
        });

        document.getElementById('cam-reset').addEventListener('click', () => {
            this.camera.position.set(0, 15, 30);
            this.controls.target.set(0, 5, 0);
            this.controls.update();
        });

        const autoToggleBtn = document.getElementById('cam-auto-toggle');
        autoToggleBtn.addEventListener('click', () => {
            this.autoRotate = !this.autoRotate;
            this.controls.autoRotate = this.autoRotate;
            this.controls.autoRotateSpeed = 1.0;
            autoToggleBtn.classList.toggle('active', this.autoRotate);
            autoToggleBtn.textContent = this.autoRotate ? '⏸ Auto-Rotate' : '▶ Auto-Rotate';
        });

        // LED scenes
        const ledSceneBtns = document.querySelectorAll('#led-scenes .scene-btn');
        ledSceneBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                ledSceneBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentLedScene = btn.dataset.scene;
                this.stageBuilder.setParam('ledEffect', this.currentLedScene);
            });
        });

        // Light/Laser scenes
        const lightSceneBtns = document.querySelectorAll('#light-scenes .scene-btn');
        lightSceneBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                lightSceneBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentLightScene = btn.dataset.scene;
                this.stageBuilder.setParam('laserAnimation', this.currentLightScene);
            });
        });

        // Music controls
        document.getElementById('music-play').addEventListener('click', () => {
            this.audioSystem.play();
            document.getElementById('audio-status').textContent = 'ON';
        });

        document.getElementById('music-pause').addEventListener('click', () => {
            this.audioSystem.pause();
            document.getElementById('audio-status').textContent = 'OFF';
        });
    }

    populateMusicTracks() {
        const trackList = document.getElementById('music-tracks');
        const tracks = this.audioSystem.musicFiles;

        trackList.innerHTML = '';

        tracks.forEach((track, index) => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'music-track';
            trackDiv.textContent = track.name;
            trackDiv.dataset.url = track.url;

            trackDiv.addEventListener('click', () => {
                // Remove active class from all tracks
                document.querySelectorAll('.music-track').forEach(t => t.classList.remove('active'));
                trackDiv.classList.add('active');

                // Load and play track
                this.audioSystem.loadTrack(track.url);
                this.audioSystem.play();
                document.getElementById('audio-status').textContent = 'ON';
            });

            trackList.appendChild(trackDiv);
        });
    }

    createSunsetSky() {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Dark blue night sky gradient
        const grad = ctx.createLinearGradient(0, size, 0, 0);
        grad.addColorStop(0, '#0a0e1a');     // Dark blue-black horizon
        grad.addColorStop(0.4, '#0d1526');   // Deep blue
        grad.addColorStop(0.7, '#0f1a2e');   // Night blue
        grad.addColorStop(1, '#111d33');     // Darker blue at zenith
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Subtle stars
        const starCount = 800;
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * (size * 0.8);
            const r = Math.random() * 0.6 + 0.2;
            const brightness = Math.random() * 0.4 + 0.15;

            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Brighter stars
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * size;
            const y = Math.random() * (size * 0.7);
            const r = Math.random() * 1.0 + 0.5;
            const brightness = Math.random() * 0.3 + 0.4;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${brightness * 0.3})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, r * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            toneMapped: false,
            depthWrite: false
        });
        const geo = new THREE.SphereGeometry(480, 32, 32);
        const mesh = new THREE.Mesh(geo, material);
        mesh.name = 'sunsetSkyDome';
        mesh.renderOrder = -1;
        return mesh;
    }

    updateStats() {
        this.frameCount++;
        const currentTime = performance.now();

        if (currentTime >= this.lastFrameTime + 1000) {
            this.stats.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;

            // Update UI
            document.getElementById('fps').textContent = this.stats.fps;

            // Update beat indicator
            const beatIndicator = document.getElementById('beat-indicator');
            if (this.audioSystem && this.audioSystem.isBeat()) {
                beatIndicator.style.color = '#43e97b';
                beatIndicator.textContent = '●';
            } else {
                beatIndicator.style.color = '#888';
                beatIndicator.textContent = '○';
            }
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

        // Update audio analysis
        if (this.audioSystem) {
            this.audioSystem.update();

            // Pass audio data to stage builder for audio-reactive effects
            const audioData = this.audioSystem.getFrequencyData();
            this.stageBuilder.setAudioData(audioData);
        }

        // Update controls
        this.controls.update();

        // Update stage builder (LED animations)
        this.stageBuilder.update(delta);
        this.laserController.update(this.stageBuilder.towersGroup);

        // Update lighting
        this.lightingSystem.update(delta);

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
