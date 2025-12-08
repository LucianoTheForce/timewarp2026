import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { StageBuilder } from './stageBuilder.js';

import { LightingSystem } from './lightingSystem.js';

import { LaserController } from './laserController.js';

import { AudioSystem } from './audioSystem.js';

import { SyncManager } from './syncManager.js';



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

        this.syncManager = null;

        this.glbModel = null;

        this.clock = new THREE.Clock();



        // Camera auto-rotate

        this.autoRotate = false;

        this.cameraSpeed = 2.0;



        // Current scenes

        this.currentLedScene = 'audio-reactive';

        this.currentLightScene = 'audio-sync';



        // Audio unlock prompt

        this.audioPrompt = null;



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



        // Initialize sync manager for cross-device control

        this.syncManager = new SyncManager();

        await this.syncManager.connect();

        this.setupSyncListeners();



        // Build initial stage

        this.stageBuilder.rebuild();



        // Populate music tracks UI

        this.populateMusicTracks();



        // Generate QR code for remote control page

        this.generateQrCode();



        // Start overlay (desktop unlock)

        this.setupStartOverlay();

        // Attempt early audio start (will prompt if blocked)

        this.attemptAudioStart(false);

        // Ensure first user gesture always tries to start audio
        window.addEventListener('pointerdown', () => this.attemptAudioStart(true), { once: true });

        // Toggle menu sanduiche
        const menuToggle = document.getElementById('menu-toggle');
        const controls = document.getElementById('controls');
        const stats = document.getElementById('stats-panel');
        if (menuToggle && controls) {
            menuToggle.addEventListener('click', () => {
                controls.classList.toggle('collapsed');
            });
        }
        // stats fica sempre visível no canto (já não depende do menu)



        // Window resize handler

        window.addEventListener('resize', () => this.onWindowResize());



        // Fallback bridge para mensagens do /control (postMessage)

        this.setupMessageBridge();



        // Atualiza info do painel inicial

        this.updateInfoPanel();



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



            // Broadcast to other devices

            if (this.syncManager) {

                this.syncManager.sendCameraControl('forward');

            }

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

            autoToggleBtn.textContent = this.autoRotate ? 'Stop Auto-Rotate' : 'Start Auto-Rotate';
        });



        // LED scenes

        const ledSceneBtns = document.querySelectorAll('#led-scenes .scene-btn');

        ledSceneBtns.forEach(btn => {

            btn.addEventListener('click', () => {

                ledSceneBtns.forEach(b => b.classList.remove('active'));

                btn.classList.add('active');

                this.currentLedScene = btn.dataset.scene;

                this.stageBuilder.setParam('ledEffect', this.currentLedScene);



                // Broadcast to other devices

                if (this.syncManager) {

                    this.syncManager.sendLedScene(this.currentLedScene);

                }

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



                // Broadcast to other devices

                if (this.syncManager) {

                    this.syncManager.sendLightScene(this.currentLightScene);

                }

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



        // Desktop slider controls

        this.setupSlider('tower-count', 'tower-count-val', (value) => {

            this.stageBuilder.setParam('towerCount', parseInt(value));

        });



        this.setupSlider('tower-levels', 'tower-levels-val', (value) => {

            this.stageBuilder.setParam('towerLevels', parseInt(value));

        });



        this.setupSlider('layout-radius', 'layout-radius-val', (value) => {

            this.stageBuilder.setParam('layoutRadius', parseFloat(value));

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



        this.setupSlider('pipe-diameter', 'pipe-diameter-val', (value) => {

            this.stageBuilder.setParam('pipeDiameter', parseFloat(value));

        });



        this.setupSlider('boxtruss-panels', 'boxtruss-panels-val', (value) => {

            this.stageBuilder.setParam('ledBoxTrussPanelsPerFace', parseInt(value));

        });



        this.setupSlider('boxtruss-faces', 'boxtruss-faces-val', (value) => {

            this.stageBuilder.setParam('ledBoxTrussFaces', parseInt(value));

        });



        this.setupSlider('led-intensity-box', 'led-intensity-box-val', (value) => {

            this.stageBuilder.setParam('ledBoxTrussIntensity', parseFloat(value));

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



        this.setupSlider('led-intensity-external', 'led-intensity-external-val', (value) => {

            this.stageBuilder.setParam('ledExternalIntensity', parseFloat(value));

        });



        this.setupSlider('led-intensity', 'led-intensity-val', (value) => {

            this.stageBuilder.setParam('ledIntensity', parseFloat(value));

        });

        // set default global intensity to 12
        const ledIntensityInput = document.getElementById('led-intensity');
        if (ledIntensityInput) {
            ledIntensityInput.value = '12';
            this.stageBuilder.setParam('ledIntensity', 12);
            const display = document.getElementById('led-intensity-val');
            if (display) display.textContent = '12';
        }



        this.setupSlider('animation-speed', 'animation-speed-val', (value) => {

            this.stageBuilder.setParam('animationSpeed', parseFloat(value));

        });



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



        // Palco LED (andaime)

        const stageFrontBands = document.getElementById('stage-front-bands');

        if (stageFrontBands) {

            stageFrontBands.checked = this.stageBuilder.params.stageFrontBandsEnabled;

            stageFrontBands.addEventListener('change', (e) => {

                this.stageBuilder.setParam('stageFrontBandsEnabled', e.target.checked);

            });

        }



        const stageRearBands = document.getElementById('stage-rear-bands');

        if (stageRearBands) {

            stageRearBands.checked = this.stageBuilder.params.stageRearBandsEnabled;

            stageRearBands.addEventListener('change', (e) => {

                this.stageBuilder.setParam('stageRearBandsEnabled', e.target.checked);

            });

        }



        this.setupSlider('stage-band-count', 'stage-band-count-val', (value) => {

            this.stageBuilder.setParam('stageBandCount', parseInt(value));

        });



        this.setupSlider('stage-band-height', 'stage-band-height-val', (value) => {

            this.stageBuilder.setParam('stageBandHeight', parseFloat(value));

        });



        this.setupSlider('stage-band-depth', 'stage-band-depth-val', (value) => {

            this.stageBuilder.setParam('stageBandDepth', parseFloat(value));

        });



        this.setupSlider('stage-band-start', 'stage-band-start-val', (value) => {

            this.stageBuilder.setParam('stageBandStartHeight', parseFloat(value));

        });



        this.setupSlider('stage-band-end', 'stage-band-end-val', (value) => {

            this.stageBuilder.setParam('stageBandEndHeight', parseFloat(value));

        });



        this.setupSlider('crowd-density', 'crowd-density-val', (value) => {

            this.stageBuilder.setParam('crowdDensity', parseFloat(value));

        });



        const crowdEnabled = document.getElementById('crowd-enabled');

        if (crowdEnabled) {

            crowdEnabled.checked = this.stageBuilder.params.crowdEnabled;

            crowdEnabled.addEventListener('change', (e) => {

                this.stageBuilder.setParam('crowdEnabled', e.target.checked);

                this.stageBuilder.rebuild();

            });

        }



        // Desktop dropdown controls

        const towerShapeSelect = document.getElementById('tower-shape');

        if (towerShapeSelect) {

            towerShapeSelect.addEventListener('change', (e) => {

                this.stageBuilder.setParam('towerShape', e.target.value);

            });

        }



        const layoutTypeSelect = document.getElementById('layout-type');

        if (layoutTypeSelect) {

            layoutTypeSelect.addEventListener('change', (e) => {

                this.stageBuilder.setParam('layoutType', e.target.value);

            });

        }



        const ledEffectSelect = document.getElementById('led-effect');

        if (ledEffectSelect) {

            ledEffectSelect.addEventListener('change', (e) => {

                this.stageBuilder.setParam('ledEffect', e.target.value);
                // sync lasers hue with led color when effect changes
                const ledColorGlobal = document.getElementById('led-color');
                if (ledColorGlobal) {
                    const hex = parseInt(ledColorGlobal.value.replace('#', '0x'), 16);
                    this.stageBuilder.setParam('laserColor', hex);
                    this.laserController.setHue(this.hexToHue(hex));
                }

            });

        }



        // Color pickers

        const pipeColorInput = document.getElementById('pipe-color');

        if (pipeColorInput) {

            pipeColorInput.addEventListener('input', (e) => {

                const hex = parseInt(e.target.value.replace('#', '0x'), 16);

                this.stageBuilder.setParam('pipeColor', hex);

            });

        }



        const ledColorGlobal = document.getElementById('led-color');

        if (ledColorGlobal) {

            // match lasers to initial led color
            const initialHex = parseInt(ledColorGlobal.value.replace('#', '0x'), 16);
            this.stageBuilder.setParam('laserColor', initialHex);
            this.laserController.setHue(this.hexToHue(initialHex));

            ledColorGlobal.addEventListener('input', (e) => {

                const hex = parseInt(e.target.value.replace('#', '0x'), 16);

                this.stageBuilder.setParam('ledColor', hex);
                this.stageBuilder.setParam('laserColor', hex);
                this.laserController.setHue(this.hexToHue(hex));

            });

        }



        const ledColorBox = document.getElementById('led-color-box');

        if (ledColorBox) {

            ledColorBox.addEventListener('input', (e) => {

                const hex = parseInt(e.target.value.replace('#', '0x'), 16);

                this.stageBuilder.setParam('ledBoxTrussColor', hex);

            });

        }



        const ledColorExternal = document.getElementById('led-color-external');

        if (ledColorExternal) {

            ledColorExternal.addEventListener('input', (e) => {

                const hex = parseInt(e.target.value.replace('#', '0x'), 16);

                this.stageBuilder.setParam('ledExternalColor', hex);

            });

        }



        // Desktop checkbox controls

        const showDiagonalBraces = document.getElementById('show-diagonal-braces');

        if (showDiagonalBraces) {

            showDiagonalBraces.addEventListener('change', (e) => {

                this.stageBuilder.setParam('showDiagonalBraces', e.target.checked);

            });

        }



        const ledBoxtrussEnabled = document.getElementById('led-boxtruss-enabled');

        if (ledBoxtrussEnabled) {

            ledBoxtrussEnabled.addEventListener('change', (e) => {

                this.stageBuilder.setParam('ledBoxTrussEnabled', e.target.checked);

            });

        }



        const ledExternalEnabled = document.getElementById('led-external-enabled');

        if (ledExternalEnabled) {

            ledExternalEnabled.addEventListener('change', (e) => {

                this.stageBuilder.setParam('ledExternalEnabled', e.target.checked);

            });

        }



        const hideRearPanels = document.getElementById('hide-rear-panels');

        if (hideRearPanels) {

            hideRearPanels.addEventListener('change', (e) => {

                this.stageBuilder.setParam('hideRearPanels', e.target.checked);

            });

        }



        const hideFirstLevel = document.getElementById('hide-first-level');

        if (hideFirstLevel) {

            hideFirstLevel.checked = this.stageBuilder.params.hideFirstLevelPanels;

            hideFirstLevel.addEventListener('change', (e) => {

                this.stageBuilder.setParam('hideFirstLevelPanels', e.target.checked);

            });

        }



        const lasersEnabled = document.getElementById('lasers-enabled');

        if (lasersEnabled) {

            lasersEnabled.checked = this.laserController.enabled;

            lasersEnabled.addEventListener('change', (e) => {

                this.laserController.setEnabled(e.target.checked);

            });

        }



        const p5PanelsEnabled = document.getElementById('p5-panels-enabled');

        if (p5PanelsEnabled) {

            p5PanelsEnabled.checked = this.stageBuilder.params.p5PanelsEnabled;

            p5PanelsEnabled.addEventListener('change', (e) => {

                this.stageBuilder.setParam('p5PanelsEnabled', e.target.checked);

                this.stageBuilder.rebuild();

            });

        }



        this.setupSlider('p5-panels-x', 'p5-panels-x-val', (value) => {

            this.stageBuilder.setParam('p5PanelsX', parseInt(value));

            this.stageBuilder.rebuild();

        });

        this.setupSlider('p5-panels-y', 'p5-panels-y-val', (value) => {

            this.stageBuilder.setParam('p5PanelsY', parseInt(value));

            this.stageBuilder.rebuild();

        });

        this.setupSlider('p5-panels-start', 'p5-panels-start-val', (value) => {

            this.stageBuilder.setParam('p5PanelsStart', parseFloat(value));

            this.stageBuilder.rebuild();

        });

        this.setupSlider('p5-panels-end', 'p5-panels-end-val', (value) => {

            this.stageBuilder.setParam('p5PanelsEnd', parseFloat(value));

            this.stageBuilder.rebuild();

        });

        const p5PanelColor = document.getElementById('p5-panel-color');

        if (p5PanelColor) {

            p5PanelColor.addEventListener('input', (e) => {

                const hex = parseInt(e.target.value.replace('#', '0x'), 16);

                this.stageBuilder.setParam('p5PanelColor', hex);

            });

        }



        const laserAllTowers = document.getElementById('laser-all-towers');

        if (laserAllTowers) {

            laserAllTowers.checked = this.stageBuilder.params.laserAllTowers;

            laserAllTowers.addEventListener('change', (e) => {

                this.stageBuilder.setParam('laserAllTowers', e.target.checked);

            });

        }



        const laserColor = document.getElementById('laser-color');

        if (laserColor) {

            laserColor.value = '#ff0000';

            // aplica a cor inicial aos sistemas
            const initialHex = parseInt(laserColor.value.replace('#', '0x'), 16);
            this.stageBuilder.setParam('laserColor', initialHex);
            this.laserController.setHue(0); // vermelho

            laserColor.addEventListener('input', (e) => {

                const hex = parseInt(e.target.value.replace('#', '0x'), 16);

                // converter para hue aproximado

                const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;

                const max = Math.max(r, g, b), min = Math.min(r, g, b);

                let h = 0;

                if (max !== min) {

                    const d = max - min;

                    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);

                    else if (max === g) h = (b - r) / d + 2;

                    else h = (r - g) / d + 4;

                    h /= 6;

                }

                this.laserController.setHue(Math.round(h * 360));

                this.laserController.resetSignatures();

            });

        }



        this.setupSlider('stage-laser-count', 'stage-laser-count-val', (value) => {

            this.stageBuilder.setParam('stageLaserCount', parseInt(value));

        });



        // Presets de animacao e posicao dos lasers
        this.laserAnimPresets = {

            anim1: { speed: 2.5, thickness: 1.2, hue: 120 }, // pulse rapido verde
            anim2: { speed: 0.6, thickness: 0.9, hue: 200 }, // lento azul

            anim3: { speed: 3.5, thickness: 1.5, hue: 300 }, // turbo magenta

            anim4: { speed: 0.1, thickness: 1.0, hue: 60 },  // quase estatico ambar
            anim5: { speed: 1.3, thickness: 1.1, hue: 0 },   // medio vermelho
            wave: { speed: 1.0, thickness: 1.0, hue: 150, animation: 'laser-wave' }

        };

        this.laserPosPresets = {

            pos1: { distance: 40, patternIndex: 0 }, // frente longa moderada

            pos2: { distance: 18, patternIndex: 4 }, // curta baixa

            pos3: { distance: 50, patternIndex: 8 }, // aberta media
            pos4: { distance: 12, patternIndex: 9 }, // fechada curta

            pos5: { distance: 30, patternIndex: 5 }  // diagonais suaves

        };



        const laserAnimPreset = document.getElementById('laser-anim-preset');

        if (laserAnimPreset) {

            laserAnimPreset.addEventListener('change', (e) => {

                const preset = this.laserAnimPresets[e.target.value];

                if (preset) {

                    if (preset.speed !== undefined) this.laserController.setSpeed(preset.speed);

                    if (preset.thickness !== undefined) this.laserController.setThickness(preset.thickness);

                    if (preset.hue !== undefined) this.laserController.setHue(preset.hue);

                    if (preset.animation) {

                        this.stageBuilder.setParam('laserAnimation', preset.animation);

                    } else {

                        this.stageBuilder.setParam('laserAnimation', 'audio-sync');

                    }

                    this.laserController.resetSignatures();

                }

            });

        }



        const laserPosPreset = document.getElementById('laser-pos-preset');

        if (laserPosPreset) {

            laserPosPreset.addEventListener('change', (e) => {

                const preset = this.laserPosPresets[e.target.value];

                if (preset) {

                    if (preset.patternIndex !== undefined) this.laserController.setPattern(preset.patternIndex);

                    if (preset.distance !== undefined) this.laserController.setDistance(preset.distance);

                    this.laserController.resetSignatures();

                }

            });

        }



        const laserWaveMode = document.getElementById('laser-wave-mode');

        if (laserWaveMode) {

            laserWaveMode.addEventListener('change', (e) => {

                this.stageBuilder.setParam('laserWaveMode', e.target.value);

                this.stageBuilder.setParam('laserAnimation', 'laser-wave');

            });

        }



        // Laser scenes (salvar/carregar/apagar)

        this.laserScenes = this.loadLaserScenes();

        this.refreshLaserSceneList();



        const laserSave = document.getElementById('laser-save');

        const laserLoad = document.getElementById('laser-load');

        const laserDelete = document.getElementById('laser-delete');

        const laserName = document.getElementById('laser-scene-name');

        const laserList = document.getElementById('laser-scene-list');



        const getSelectedKey = () => laserList?.value || '';



        if (laserSave) {

            laserSave.addEventListener('click', () => {

                const name = (laserName?.value || '').trim() || 'Cena';

                const key = name.toLowerCase().replace(/\\s+/g, '-');

                const current = this.laserController.getOptions();

                this.laserScenes[key] = { name, options: current };

                this.storeLaserScenes();

                this.refreshLaserSceneList(key);

            });

        }



        if (laserLoad) {

            laserLoad.addEventListener('click', () => {

                const key = getSelectedKey();

                const scene = this.laserScenes[key];

                if (scene) {

                    this.laserController.applyOptions(scene.options);

                    if (lasersEnabled) lasersEnabled.checked = scene.options.enabled;

                    this.laserController.resetSignatures();

                }

            });

        }



        if (laserDelete) {

            laserDelete.addEventListener('click', () => {

                const key = getSelectedKey();

                if (key && this.laserScenes[key]) {

                    delete this.laserScenes[key];

                    this.storeLaserScenes();

                    this.refreshLaserSceneList();

                }

            });

        }



        const autoRotateCheck = document.getElementById('auto-rotate');

        if (autoRotateCheck) {

            autoRotateCheck.addEventListener('change', (e) => {

                this.autoRotate = e.target.checked;

                this.controls.autoRotate = this.autoRotate;

                this.controls.autoRotateSpeed = 1.0;

            });

        }



        const showFloor = document.getElementById('show-floor');

        if (showFloor) {

            showFloor.addEventListener('change', (e) => {

                this.stageBuilder.setParam('showFloor', e.target.checked);

            });

        }



        const showStageDeck = document.getElementById('show-stage-deck');

        if (showStageDeck) {

            showStageDeck.addEventListener('change', (e) => {

                this.stageBuilder.setParam('stageDeckEnabled', e.target.checked);

            });

        }



        const showGlbModel = document.getElementById('show-glb-model');

        if (showGlbModel) {

            showGlbModel.addEventListener('change', (e) => {

                this.stageBuilder.setParam('showGlbModel', e.target.checked);

            });

        }



        // Camera view buttons

        const topViewBtn = document.getElementById('top-view');

        if (topViewBtn) {

            topViewBtn.addEventListener('click', () => {

                this.camera.position.set(0, 50, 0);

                this.controls.target.set(0, 0, 0);

                this.controls.update();

            });

        }



        const frontViewBtn = document.getElementById('front-view');

        if (frontViewBtn) {

            frontViewBtn.addEventListener('click', () => {

                this.camera.position.set(0, 15, 40);

                this.controls.target.set(0, 5, 0);

                this.controls.update();

            });

        }



        const sideViewBtn = document.getElementById('side-view');

        if (sideViewBtn) {

            sideViewBtn.addEventListener('click', () => {

                this.camera.position.set(40, 15, 0);

                this.controls.target.set(0, 5, 0);

                this.controls.update();

            });

        }



        // Export configuration button

        const exportBtn = document.getElementById('export-config');

        if (exportBtn) {

            exportBtn.addEventListener('click', () => {

                const config = this.stageBuilder.params;

                const json = JSON.stringify(config, null, 2);

                const blob = new Blob([json], { type: 'application/json' });

                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');

                a.href = url;

                a.download = 'palco-config.json';

                document.body.appendChild(a);

                a.click();

                document.body.removeChild(a);

                URL.revokeObjectURL(url);

            });

        }

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



    setupSyncListeners() {

        if (!this.syncManager) return;



        // Listen for remote control changes

        this.syncManager.on('led-scene', (data) => {

            this.currentLedScene = data.scene;

            this.stageBuilder.setParam('ledEffect', data.scene);



            // Update UI

            document.querySelectorAll('#led-scenes .scene-btn').forEach(btn => {

                btn.classList.toggle('active', btn.dataset.scene === data.scene);

            });

        });



        this.syncManager.on('light-scene', (data) => {

            this.currentLightScene = data.scene;

            this.stageBuilder.setParam('laserAnimation', data.scene);



            // Update UI

            document.querySelectorAll('#light-scenes .scene-btn').forEach(btn => {

                btn.classList.toggle('active', btn.dataset.scene === data.scene);

            });

        });



        this.syncManager.on('camera-control', (data) => {

            switch (data.action) {

                case 'forward':

                    const forward = new THREE.Vector3();

                    this.camera.getWorldDirection(forward);

                    forward.y = 0;

                    forward.normalize();

                    this.camera.position.add(forward.multiplyScalar(this.cameraSpeed));

                    this.controls.target.add(forward.multiplyScalar(this.cameraSpeed));

                    break;

                case 'backward':

                    const backward = new THREE.Vector3();

                    this.camera.getWorldDirection(backward);

                    backward.y = 0;

                    backward.normalize();

                    this.camera.position.sub(backward.multiplyScalar(this.cameraSpeed));

                    this.controls.target.sub(backward.multiplyScalar(this.cameraSpeed));

                    break;

                case 'left':

                    const angleL = Math.PI / 8;

                    const posL = this.camera.position.clone().sub(this.controls.target);

                    posL.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleL);

                    this.camera.position.copy(posL.add(this.controls.target));

                    break;

                case 'right':

                    const angleR = -Math.PI / 8;

                    const posR = this.camera.position.clone().sub(this.controls.target);

                    posR.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleR);

                    this.camera.position.copy(posR.add(this.controls.target));

                    break;

                case 'reset':

                    this.camera.position.set(0, 15, 30);

                    this.controls.target.set(0, 5, 0);

                    this.controls.update();

                    break;

                case 'auto-rotate':

                    this.autoRotate = data.data;

                    this.controls.autoRotate = this.autoRotate;

                    this.controls.autoRotateSpeed = 1.0;

                    break;

            }

        });



        this.syncManager.on('music-control', (data) => {

            switch (data.action) {

                case 'play':

                    this.audioSystem.play();

                    this.updateAudioStatus(true);

                    break;

                case 'pause':

                    this.audioSystem.pause();

                    this.updateAudioStatus(false);

                    break;

                case 'track':

                    this.audioSystem.loadTrack(data.data);

                    this.audioSystem.play();

                    this.updateAudioStatus(true);

                    break;

            }

        });



        // Hide QR overlay when control page connects

        this.syncManager.on('control-open', () => {

            this.hideQrOverlay();

            this.hideStartOverlay();

            this.attemptAudioStart();

        });



        // Atualizar painel de info quando cenas mudam

        this.updateInfoPanel();

    }



    setupMessageBridge() {

        window.addEventListener('message', (event) => {

            if (event.origin !== window.location.origin) return;

            const data = event.data;

            if (!data || data.type !== 'control-action') return;



            if (data.kind === 'camera') {

                this.moveCamera(data.action);

            } else if (data.kind === 'playback') {

                if (data.action === 'toggle') {

                    if (this.audioSystem.isPlaying) {

                        this.audioSystem.pause();

                        this.updateAudioStatus(false);

                    } else {

                        this.audioSystem.play();

                        this.updateAudioStatus(true);

                    }

                }

            } else if (data.type === 'control-open') {

                this.hideQrOverlay();

                this.hideStartOverlay();

                this.attemptAudioStart();

            } else if (data.kind === 'scene') {

                if (data.target === 'led') {

                    this.stageBuilder.setParam('ledEffect', data.action);

                } else if (data.target === 'light') {

                    this.stageBuilder.setParam('laserAnimation', data.action);

                }

            } else if (data.kind === 'music') {

                if (data.action === 'play') {

                    this.audioSystem.play();

                    this.updateAudioStatus(true);

                } else if (data.action === 'pause') {

                    this.audioSystem.pause();

                    this.updateAudioStatus(false);

                } else if (data.action === 'track' && data.data) {

                    this.audioSystem.loadTrack(data.data);

                    this.audioSystem.play();

                    this.updateAudioStatus(true);

                }

            }

        });

    }



    hideQrOverlay() {

        const overlay = document.getElementById('qr-overlay');

        if (overlay) {

            overlay.classList.add('hidden');

        }

    }



    hideStartOverlay() {

        const startOverlay = document.getElementById('start-overlay');

        if (startOverlay) {

            startOverlay.classList.add('hidden');

        }

    }



    loadLaserScenes() {

        try {

            const raw = localStorage.getItem('laserScenes');

            if (!raw) return {};

            return JSON.parse(raw);

        } catch (e) {

            console.warn('Falha ao carregar laserScenes', e);

            return {};

        }

    }



    storeLaserScenes() {

        try {

            localStorage.setItem('laserScenes', JSON.stringify(this.laserScenes));

        } catch (e) {

            console.warn('Falha ao salvar laserScenes', e);

        }

    }



    refreshLaserSceneList(selectKey = '') {

        const list = document.getElementById('laser-scene-list');

        if (!list) return;

        list.innerHTML = '';

        Object.entries(this.laserScenes).forEach(([key, value]) => {

            const opt = document.createElement('option');

            opt.value = key;

            opt.textContent = value.name || key;

            if (selectKey && key === selectKey) opt.selected = true;

            list.appendChild(opt);

        });

    }



    updateInfoPanel() {

        if (!this.stageBuilder) return;

        const info = this.stageBuilder.getStats();

        const setText = (id, text) => {

            const el = document.getElementById(id);

            if (el) el.textContent = text;

        };



        setText('panel-total-stat', info.leds.totalPanels.toString());

        setText('panel-external-stat', info.leds.externalPanels.toString());

        setText('panel-boxtruss-stat', info.leds.boxPanels.toString());

        setText('panel-stage-front-stat', info.leds.stageFrontPanels.toString());

        setText('panel-stage-rear-stat', info.leds.stageRearPanels.toString());

        setText('panel-total-area', `${info.leds.totalArea.toFixed(2)} m2`);
        setText('panel-external-area', `${info.leds.externalArea.toFixed(2)} m2`);
        setText('panel-boxtruss-area', `${info.leds.boxArea.toFixed(2)} m2`);
        setText('panel-stage-front-area', `${info.leds.stageFrontArea.toFixed(2)} m2`);
        setText('panel-stage-rear-area', `${info.leds.stageRearArea.toFixed(2)} m2`);
        setText('tower-stat', info.towers.count.toString());

        setText('tower-dims', `${info.towers.width.toFixed(2)} x ${info.towers.depth.toFixed(2)} x ${info.towers.height.toFixed(2)} m`);

        setText('tower-width-only', `${info.towers.width.toFixed(2)} m`);

        setText('stage-dims', `${info.stage.width.toFixed(2)} x ${info.stage.depth.toFixed(2)} x ${info.stage.height.toFixed(2)} m`);

        setText('crowd-count', info.crowd.count.toString());

        setText('crowd-pit-count', info.crowd.pit.toString());

        setText('crowd-backstage-count', info.crowd.backstage.toString());

        setText('triangles', this.renderer.info.render.triangles.toString());

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



    generateQrCode() {

        if (typeof qrcode === 'undefined') return;



        const url = new URL('/control', window.location.href).href;

        const drawQr = (canvas) => {

            if (!canvas) return;

            const qr = qrcode(0, 'H');

            qr.addData(url);

            qr.make();



            const ctx = canvas.getContext('2d');

            const count = qr.getModuleCount();

            const cellSize = Math.floor(canvas.width / count);

            const margin = Math.floor((canvas.width - cellSize * count) / 2);



            ctx.fillStyle = '#fff';

            ctx.fillRect(0, 0, canvas.width, canvas.height);



            ctx.fillStyle = '#000';

            for (let r = 0; r < count; r++) {

                for (let c = 0; c < count; c++) {

                    if (qr.isDark(r, c)) {

                        ctx.fillRect(margin + c * cellSize, margin + r * cellSize, cellSize, cellSize);

                    }

                }

            }

        };



        // Small QR in sidebar

        const sidebarCanvas = document.getElementById('qr-canvas');

        drawQr(sidebarCanvas);



        // Fullscreen overlay QR

        const overlay = document.getElementById('qr-overlay');

        const bigCanvas = document.getElementById('qr-canvas-big');

        drawQr(bigCanvas);



        const handleQrPointer = (event) => {
            const isTouch = event.pointerType === 'touch' || navigator.maxTouchPoints > 0;
            if (isTouch) {
                window.location.href = url;
            } else {
                window.open(url, '_blank');
            }
            this.hideQrOverlay();
            this.hideStartOverlay();
            this.attemptAudioStart();
        };


        if (bigCanvas) {

            bigCanvas.style.cursor = 'pointer';

            bigCanvas.addEventListener('pointerdown', handleQrPointer);

        }



        if (overlay) {

            overlay.addEventListener('pointerdown', handleQrPointer);

        }



        // Permitir interacao com QR pequeno: mobile abre, desktop abre em nova aba
        if (sidebarCanvas) {
            sidebarCanvas.style.cursor = 'pointer';
            sidebarCanvas.title = 'Abrir controle remoto';
            sidebarCanvas.addEventListener('pointerdown', (event) => {
                const isTouch = event.pointerType === 'touch' || navigator.maxTouchPoints > 0;
                if (isTouch) {
                    window.location.href = url;
                    this.attemptAudioStart();
                } else {
                    window.open(url, '_blank');
                    this.attemptAudioStart();
                }
                this.hideQrOverlay();
                this.hideStartOverlay();
            });
        }

    }

    setupStartOverlay() {

        const startOverlay = document.getElementById('start-overlay');

        const btn = document.getElementById('start-experience');

        const hide = () => {

            if (startOverlay) startOverlay.classList.add('hidden');

        };



        if (this.isTouchDevice()) {

            hide();

        }



        if (btn) {

            btn.addEventListener('click', () => {

                this.attemptAudioStart();

                hide();

            });

        }

    }



    isTouchDevice() {

        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    }



    async attemptAudioStart(fromGesture = false) {

        if (!this.audioSystem || this.audioUnlocking) return;

        this.audioUnlocking = true;



        try {

            if (this.audioSystem.audioContext && this.audioSystem.audioContext.state === 'suspended') {

                await this.audioSystem.audioContext.resume();

            }

            await this.audioSystem.play();

            this.hideAudioPrompt();

        } catch (err) {

            if (!fromGesture) {

                console.warn('Audio autoplay blocked, requesting user gesture', err);

                this.showAudioPrompt();

            } else {

                console.warn('Audio play failed even with gesture', err);

            }

        }

        this.audioUnlocking = false;

    }



    showAudioPrompt() {

        if (this.audioPrompt) return;



        const prompt = document.createElement('div');

        prompt.id = 'audio-unlock';

        prompt.style.position = 'fixed';

        prompt.style.bottom = '16px';

        prompt.style.right = '16px';

        prompt.style.zIndex = '3000';

        prompt.style.background = 'rgba(15,15,30,0.9)';

        prompt.style.border = '1px solid rgba(255,255,255,0.2)';

        prompt.style.borderRadius = '10px';

        prompt.style.padding = '12px 14px';

        prompt.style.color = '#fff';

        prompt.style.fontSize = '12px';

        prompt.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';

        prompt.style.display = 'flex';

        prompt.style.alignItems = 'center';

        prompt.style.gap = '10px';



        const text = document.createElement('span');

        text.textContent = 'Clique para ativar audio';
        const btn = document.createElement('button');

        btn.textContent = 'Ativar';

        btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e53)';

        btn.style.color = '#fff';

        btn.style.border = 'none';

        btn.style.borderRadius = '6px';

        btn.style.padding = '8px 10px';

        btn.style.cursor = 'pointer';

        btn.onclick = () => this.attemptAudioStart();



        prompt.appendChild(text);

        prompt.appendChild(btn);

        document.body.appendChild(prompt);

        this.audioPrompt = prompt;

    }



    hideAudioPrompt() {

        if (this.audioPrompt && this.audioPrompt.parentNode) {

            this.audioPrompt.parentNode.removeChild(this.audioPrompt);

        }

        this.audioPrompt = null;

    }



    updateAudioStatus(isOn) {

        const el = document.getElementById('audio-status');

        if (el) {

            el.textContent = isOn ? 'ON' : 'OFF';

        }

    }



    createSunsetSky() {

        const size = 1024;

        const canvas = document.createElement('canvas');

        canvas.width = size;

        canvas.height = size;

        const ctx = canvas.getContext('2d');



        // Fundo preto

        ctx.fillStyle = '#000000';

        ctx.fillRect(0, 0, size, size);



        // Estrelas como pixels nitidos
        const starCount = 0; // sem estrelas

        for (let i = 0; i < starCount; i++) {

            const x = Math.floor(Math.random() * size);

            const y = Math.floor(Math.random() * size);

            const alpha = Math.random() * 0.5 + 0.5;

            ctx.fillStyle = `rgba(255,255,255,${alpha})`;

            ctx.fillRect(x, y, 1, 1);

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
            const fpsBadge = document.getElementById('fps-badge-val');
            if (fpsBadge) fpsBadge.textContent = this.stats.fps;



            // Update beat indicator

            const beatIndicator = document.getElementById('beat-indicator');

            if (this.audioSystem && this.audioSystem.isBeat()) {

                beatIndicator.style.color = '#43e97b';

                beatIndicator.textContent = '*';
            } else {

                beatIndicator.style.color = '#888';

                beatIndicator.textContent = 'o';
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



        // Lasers: selecionar torres conforme opcao e limitar quantidade na traseira
        const towerChildren = this.stageBuilder.towersGroup.children;

        const filteredTowers = this.stageBuilder.params.laserAllTowers

            ? towerChildren

            : towerChildren.filter((_, i) => i % 2 === 0); // uma torre sim, outra nao


        const backChildren = this.stageBuilder.backScaffoldGroup.children;

        let backSelected = backChildren;

        const desiredBack = Math.max(1, Math.min(this.stageBuilder.params.stageLaserCount || backChildren.length, backChildren.length));

        if (backChildren.length > desiredBack) {

            const step = backChildren.length / desiredBack;

            backSelected = [];

            for (let i = 0; i < desiredBack; i++) {

                const idx = Math.floor(i * step);

                backSelected.push(backChildren[idx]);

            }

        }



        this.laserController.updateComposite([

            // Torres/andaimes apontando para as torres opostas

            { groups: { children: filteredTowers }, mode: 'opposite' },

            { groups: { children: backSelected }, mode: 'forward' }

        ]);



        // Update lighting

        this.lightingSystem.update(delta);



        // Render

        this.renderer.render(this.scene, this.camera);



        // Update stats

        this.updateStats();



        // Update info panel (a cada frame e ok, custo baixo)
        this.updateInfoPanel();

    }



    hexToHue(hex) {

        const r = (hex >> 16) & 255;

        const g = (hex >> 8) & 255;

        const b = hex & 255;

        const max = Math.max(r, g, b);

        const min = Math.min(r, g, b);

        let h = 0;

        if (max !== min) {

            const d = max - min;

            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);

            else if (max === g) h = (b - r) / d + 2;

            else h = (r - g) / d + 4;

            h /= 6;

        }

        return Math.round(h * 360);

    }

}



// Initialize when DOM is ready

document.addEventListener('DOMContentLoaded', () => {

    new PalcoParametrico();

});

