import * as THREE from 'three';

export class StageBuilder {
    constructor(scene) {
        this.scene = scene;

        // Groups
        this.towersGroup = new THREE.Group();
        this.towersGroup.name = 'towers';
        this.scene.add(this.towersGroup);

        this.ledGlassPanels = new THREE.Group();
        this.ledGlassPanels.name = 'ledGlassPanels';
        this.scene.add(this.ledGlassPanels);

        this.stageDeck = new THREE.Group();
        this.stageDeck.name = 'stageDeck';
        this.scene.add(this.stageDeck);

        this.dimensionGroup = new THREE.Group();
        this.dimensionGroup.name = 'dimensions';
        this.scene.add(this.dimensionGroup);

        this.backScaffoldGroup = new THREE.Group();
        this.backScaffoldGroup.name = 'backScaffold';
        this.scene.add(this.backScaffoldGroup);

        this.railingsGroup = new THREE.Group();
        this.railingsGroup.name = 'railings';
        this.scene.add(this.railingsGroup);

        this.stairsGroup = new THREE.Group();
        this.stairsGroup.name = 'stairs';
        this.scene.add(this.stairsGroup);

        this.risersGroup = new THREE.Group();
        this.risersGroup.name = 'djRisers';
        this.scene.add(this.risersGroup);

        this.stageBandsGroup = new THREE.Group();
        this.stageBandsGroup.name = 'stageBands';
        this.scene.add(this.stageBandsGroup);

        this.lasersGroup = new THREE.Group();
        this.lasersGroup.name = 'lasers';
        this.scene.add(this.lasersGroup);

        this.p5LightsGroup = new THREE.Group();
        this.p5LightsGroup.name = 'p5Lights';
        this.scene.add(this.p5LightsGroup);

        this.crowdGroup = new THREE.Group();
        this.crowdGroup.name = 'crowd';
        this.scene.add(this.crowdGroup);

        this.stageSkirtsGroup = new THREE.Group();
        this.stageSkirtsGroup.name = 'stageSkirts';
        this.scene.add(this.stageSkirtsGroup);

        this.crowdBarrierGroup = new THREE.Group();
        this.crowdBarrierGroup.name = 'crowdBarrier';
        this.scene.add(this.crowdBarrierGroup);

        this.crowdInstances = null;
        this.crowdCount = 0;
        this.crowdData = []; // Array para armazenar dados de animação

        // Audio data for reactive effects
        this.audioData = {
            bass: 0,
            mid: 0,
            treble: 0,
            volume: 0,
            beat: false
        };

        this.floor = null;
        this.concreteTexture = null;
        this.concreteMaterial = null;
        this.defaultFloorMaterial = null;

        // Parameters - default values
        this.params = {
            // Tower params
            towerCount: 8,
            towerShape: 'square', // 'square', 'rectangular', 'triangular'
            towerLevels: 4, // Each level is 2m (4 andares = 8m)
            layoutRadius: 8,
            layoutType: 'grid', // 'circular', 'line', 'grid'
            layoutRows: 5,
            layoutCols: 2,
            layoutSpacingX: 32,
            layoutSpacingY: 8,
            towerWidth: 2.0, // 2x2 metros
            towerDepth: 2.0,

            // Stage deck
            stageDeckEnabled: true,
            deckModuleSize: 1.25,
            deckHeight: 1.33,
            deckThickness: 0.2,
            backstageLeftWidth: 8.75,
            backstageCenterWidth: 13.75,
            backstageRightWidth: 8.75,
            backstageDepth: 7.5,
            djWidth: 8.75,
            djDepth: 3.75,
            frontWidth: 0.0,
            frontDepth: 0.0,
            showDimensions: false,
            backScaffoldEnabled: true,
            railingsEnabled: true,
            stairsEnabled: true,
            risersEnabled: true,
            lasersEnabled: false, // desativado (usamos laserParty externo)
            railingHeight: 1.1,
            railingThickness: 0.04,
            stairsWidth: 2.0,
            stairsDepth: 3.0,
            riserCount: 4,
            riserWidth: 2.0,
            riserDepth: 1.0, // 4 praticáveis de 2x1 m = 8x1 m total
            riserHeight: 1.0,
            stageFrontBandsEnabled: true,
            stageRearBandsEnabled: true,
            stageBandCount: 3,
            stageBandHeight: 0.6,
            stageBandGap: 0.15,
            stageBandDepth: 0.12,
            laserHeight: 20,
            laserColor: 0x00ff00,
            laserAnimation: 'static', // static, sweep, rotate, pulse, chase, random
            laserSpeed: 1.0,
            stageLasersEnabled: true, // lasers no palco
            stageLaserCount: 6,
            laserAllTowers: true, // laser em todas as torres
            p5LightsEnabled: true, // luzes P5 nos cubos
            p5LightColor: 0xffffff,
            p5LightIntensity: 2.0,

            // Crowd (público)
            crowdEnabled: true,
            crowdDensity: 2.5, // pessoas por m² (2.5 = show lotado, 1.5 = confortável)
            crowdPitEnabled: true, // público na pista
            crowdBackstageEnabled: true, // público no backstage
            crowdColor: 0x444444, // cor base do público (cinza escuro mais visível)
            crowdAnimationSpeed: 1.0,

            showFloor: true,
            useConcreteFloor: true,

            // Pipe params (2m standard)
            pipeLength: 2.0, // Fixed 2m pipes
            pipeDiameter: 0.048, // 48mm default
            pipeColor: 0x555555,
            showDiagonalBraces: true,

            // LED no Box Truss Central (50x50cm)
            ledBoxTrussEnabled: true,
            ledBoxTrussPanelsPerFace: 16, // 16 paineis por face
            ledBoxTrussFaces: 4, // 4 faces
            ledBoxTrussColor: 0xff0066, // 16711782
            ledBoxTrussIntensity: 6.0,

            // LED nos Andaimes Externos (1000x500mm)
            ledExternalEnabled: true,
            ledExternalWidth: 1.0, // 1000mm
            ledExternalHeight: 0.5, // 500mm
            ledExternalPanelsPerFace: 8, // 8 paineis por face
            ledExternalFaces: 4, // 4 faces
            ledExternalPanelsPerRow: 2, // 1 ou 2 por linha/face
            ledExternalColor: 0xff0000, // 16711680
            ledExternalIntensity: 6.0,
            hideRearPanels: true,
            hideFirstLevelPanels: false,

            // LED effects
            ledEffect: 'wave',
            ledColor: 0xff0066,
            ledIntensity: 1.4,
            animationSpeed: 1.0,

            showGlbModel: false
        };

        // Materials
        this.pipeMaterial = null;
        this.ledBoxMaterial = null;
        this.ledExternalMaterial = null;
        this.clothMaterial = null;
        this.centralPanelMaterial = null;
        this.railingMaterial = null;
        this.stairsMaterial = null;
        this.riserMaterial = null;

        // Video texture
        this.videoTexture = null;
        this.videoElement = null;

        // Animation
        this.time = 0;
        this.allLedPanels = [];

        this.initMaterials();
        this.createFloor();
    }

    initMaterials() {
        const ledTexture = this.createLedTexture();

        this.pipeMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.9,
            roughness: 0.2
        });

        // Painel LED com textura e emissao apenas na face frontal (verso sem luz)
        this.ledBoxMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            map: ledTexture,
            emissiveMap: ledTexture,
            emissive: this.params.ledBoxTrussColor,
            emissiveIntensity: this.params.ledBoxTrussIntensity,
            transparent: false,
            opacity: 1.0,
            metalness: 0.3,
            roughness: 0.4,
            side: THREE.FrontSide
        });

        this.ledExternalMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            map: ledTexture,
            emissiveMap: ledTexture,
            emissive: this.params.ledExternalColor,
            emissiveIntensity: this.params.ledExternalIntensity,
            transparent: true,
            opacity: 0.65,
            metalness: 0.3,
            roughness: 0.4,
            side: THREE.FrontSide
        });

        this.stageFrontLedMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            map: ledTexture,
            emissiveMap: ledTexture,
            emissive: this.params.ledExternalColor,
            emissiveIntensity: this.params.ledExternalIntensity,
            transparent: true,
            opacity: 0.45,
            metalness: 0.25,
            roughness: 0.35,
            side: THREE.FrontSide
        });

        this.stageRearLedMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            map: ledTexture,
            emissiveMap: ledTexture,
            emissive: this.params.ledExternalColor,
            emissiveIntensity: this.params.ledExternalIntensity,
            transparent: false,
            opacity: 1.0,
            metalness: 0.25,
            roughness: 0.35,
            side: THREE.FrontSide
        });

        this.laserMaterial = new THREE.MeshBasicMaterial({
            color: this.params.laserColor,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.centralPanelMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            emissive: this.params.ledBoxTrussColor,
            emissiveIntensity: this.params.ledBoxTrussIntensity,
            metalness: 0.1,
            roughness: 0.3,
            side: THREE.FrontSide
        });

        this.clothMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.0,
            roughness: 0.9,
            side: THREE.DoubleSide
        });

        this.railingMaterial = new THREE.MeshStandardMaterial({
            color: 0x606060,  // Cinza metálico de grade de evento
            metalness: 0.7,
            roughness: 0.4
        });

        this.stairsMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.1,
            roughness: 0.8
        });

        this.riserMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.2,
            roughness: 0.7
        });
    }

    createLedTexture() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0c0c0c';
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = '#1a1a1a';
        for (let y = 4; y < size; y += 8) {
            for (let x = 4; x < size; x += 8) {
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        texture.anisotropy = 4;
        return texture;
    }

    createFloor() {
        const floorGeom = new THREE.PlaneGeometry(200, 200);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.8,
            metalness: 0.1
        });
        this.floor = new THREE.Mesh(floorGeom, floorMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.y = 0;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);

        // Grid helper (1m x 1m) - discreto, próximo da cor do piso
        this.gridHelper = new THREE.GridHelper(200, 200, 0x404040, 0x3a3a3a);
        this.gridHelper.position.set(0, 0.01, 0);
        this.scene.add(this.gridHelper);

        // Piso concreto opcional
        this.applyConcreteFloor(this.params.useConcreteFloor);
        this.setFloorVisible(this.params.showFloor);
    }

    setFloorVisible(visible) {
        if (this.floor) this.floor.visible = visible;
        if (this.gridHelper) this.gridHelper.visible = visible;
    }

    applyConcreteFloor(enabled) {
        this.params.useConcreteFloor = enabled;
        if (!this.floor) return;

        if (!this.concreteMaterial) {
            // Cinza chumbo simples
            this.concreteMaterial = new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.8,
                metalness: 0.1
            });
        }

        if (!this.defaultFloorMaterial) {
            this.defaultFloorMaterial = this.floor.material;
        }

        this.floor.material = enabled ? this.concreteMaterial : this.defaultFloorMaterial;
        this.floor.material.needsUpdate = true;
    }

    setTowersVisible(visible) {
        this.towersGroup.visible = visible;
        this.ledGlassPanels.visible = visible;
        this.lasersGroup.visible = visible;
    }

    setAudioData(audioData) {
        // Update audio data for reactive effects
        if (audioData) {
            this.audioData = {
                bass: audioData.bass || 0,
                mid: audioData.mid || 0,
                treble: audioData.treble || 0,
                volume: audioData.volume || 0,
                beat: audioData.beat || false
            };
        }
    }

    updateParams(newParams) {
        Object.assign(this.params, newParams);
        this.rebuild();
    }

    setParam(key, value) {
        this.params[key] = value;

        // Handle specific parameter changes
        if (key === 'pipeColor') {
            this.pipeMaterial.color.setHex(value);
        } else if (key === 'ledColor') {
            this.params.ledBoxTrussColor = value;
            this.params.ledExternalColor = value;
            this.updateLedColorForType('all', value);
        } else if (key === 'ledIntensity') {
            this.params.ledBoxTrussIntensity = value;
            this.params.ledExternalIntensity = value;
            this.updateLedIntensityForType('all', value);
        } else if (key === 'ledBoxTrussColor') {
            this.updateLedColorForType('ledBoxTruss', value);
        } else if (key === 'ledExternalColor') {
            this.updateLedColorForType('ledExternal', value);
        } else if (key === 'ledBoxTrussIntensity') {
            this.updateLedIntensityForType('ledBoxTruss', value);
        } else if (key === 'ledExternalIntensity') {
            this.updateLedIntensityForType('ledExternal', value);
        } else if (key === 'laserColor') {
            this.params.laserColor = value;
            if (this.laserMaterial) this.laserMaterial.color = new THREE.Color(value);
            this.lasersGroup.children.forEach((beam) => {
                if (beam.material) beam.material.color = new THREE.Color(value);
            });
        } else if (key === 'p5LightColor') {
            const p5Color = new THREE.Color(value);
            this.p5LightsGroup.children.forEach((light) => {
                if (light.userData.type === 'p5Light' && light.material) {
                    light.material.color.copy(p5Color);
                    light.material.emissive.copy(p5Color);
                } else if (light.userData.type === 'p5Cone' && light.material) {
                    light.material.color.copy(p5Color);
                }
            });
        } else if (key === 'p5LightIntensity') {
            this.p5LightsGroup.children.forEach((light) => {
                if (light.userData.type === 'p5Light' && light.material) {
                    light.material.emissiveIntensity = value;
                }
            });
        } else if (key === 'laserAnimation' || key === 'laserSpeed') {
            // Não precisa rebuild, apenas atualiza na animação
        } else if (key === 'crowdColor') {
            // Atualizar cor do público dinamicamente
            if (this.crowdInstances && this.crowdInstances.material) {
                this.crowdInstances.material.color.setHex(value);
            }
        } else if (key === 'showFloor') {
            this.setFloorVisible(value);
        } else if (key === 'stageDeckEnabled') {
            this.rebuild();
        } else if (key === 'useConcreteFloor') {
            this.applyConcreteFloor(value);
        } else if (key === 'crowdAnimationSpeed') {
            // Não precisa rebuild, apenas atualiza na animação
        } else if (key === 'ledEffect' && value === 'video') {
            // Switch to video mode
        } else if (key === 'showDimensions') {
            if (!value) {
                this.clearDimensions();
            } else {
                this.clearDimensions();
                this.buildDimensionLines();
            }
        } else {
            // Rebuild for structural changes
            this.rebuild();
        }
    }

    updateLedColorForType(type, color) {
        const colorObj = new THREE.Color(color);

        if (type === 'ledBoxTruss' || type === 'all') {
            if (this.ledBoxMaterial) this.ledBoxMaterial.emissive.copy(colorObj);
            if (this.centralPanelMaterial) this.centralPanelMaterial.emissive.copy(colorObj);
        }
        if (type === 'ledExternal' || type === 'all') {
            if (this.ledExternalMaterial) this.ledExternalMaterial.emissive.copy(colorObj);
            if (this.stageFrontLedMaterial) this.stageFrontLedMaterial.emissive.copy(colorObj);
            if (this.stageRearLedMaterial) this.stageRearLedMaterial.emissive.copy(colorObj);
            this.stageDeck.traverse((child) => {
                if (child.userData && child.userData.type === 'stageBand' && child.material && child.material.emissive) {
                    child.material.emissive.copy(colorObj);
                }
            });
        }

        this.allLedPanels.forEach(panel => {
            if (!panel.material || !panel.material.emissive) return;
            if (type === 'all' || panel.userData.type === type) {
                panel.material.emissive.copy(colorObj);
            }
        });
    }

    updateLedIntensityForType(type, intensity) {
        if (type === 'ledBoxTruss' || type === 'all') {
            if (this.ledBoxMaterial) this.ledBoxMaterial.emissiveIntensity = intensity;
            if (this.centralPanelMaterial) this.centralPanelMaterial.emissiveIntensity = intensity;
        }
        if (type === 'ledExternal' || type === 'all') {
            if (this.ledExternalMaterial) this.ledExternalMaterial.emissiveIntensity = intensity;
            if (this.stageFrontLedMaterial) this.stageFrontLedMaterial.emissiveIntensity = intensity;
            if (this.stageRearLedMaterial) this.stageRearLedMaterial.emissiveIntensity = intensity;
            this.stageDeck.traverse((child) => {
                if (child.userData && child.userData.type === 'stageBand' && child.material) {
                    child.material.emissiveIntensity = intensity;
                }
            });
        }

        this.allLedPanels.forEach(panel => {
            if (!panel.material) return;
            if (type === 'all' || panel.userData.type === type) {
                panel.material.emissiveIntensity = intensity;
            }
        });
    }

    rebuild() {
        this.clearTowers();
        this.clearLedGlassPanels();
        this.clearStageDeck();
        this.clearDimensions();
        this.clearBackScaffold();
        this.clearRailings();
        this.clearStairs();
        this.clearRisers();
        this.clearLasers();
        this.clearStageBands();
        this.clearStageSkirts();
        this.clearCrowdBarrier();
        this.allLedPanels = [];
        this.stageDeck.position.set(0, 0, 0);

        this.buildTowers();

        if (this.params.stageDeckEnabled) {
            this.buildStageDeck();
            this.alignStageDeckToFront();
            this.buildStageSkirts();
        }

        if (this.params.backScaffoldEnabled) {
            this.buildBackScaffold();
            this.buildStageBands();
        }

        if (this.params.railingsEnabled) {
            this.buildRailings();
        }

        if (this.params.stairsEnabled) {
            this.buildStairs();
        }

        if (this.params.risersEnabled) {
            this.buildRisers();
        }

        if (this.params.showDimensions) {
            this.buildDimensionLines();
        }

        if (this.params.ledBoxTrussEnabled) {
            this.buildLedBoxTrussPanels();
        }

        if (this.params.ledExternalEnabled) {
            this.buildLedExternalPanels();
        }

        if (this.params.p5LightsEnabled) {
            this.buildP5Lights();
        }

        if (this.params.crowdEnabled) {
            this.buildCrowd();
        }
    }

    getStats() {
        const boxPanels = this.allLedPanels.filter(p => p.userData.type === 'ledBoxTruss').length;
        const extPanels = this.allLedPanels.filter(p => p.userData.type === 'ledExternal').length;
        const boxArea = boxPanels * 0.5 * 0.5;
        const extArea = extPanels * (this.params.ledExternalWidth || 1.0) * (this.params.ledExternalHeight || 0.5);
        const totalArea = boxArea + extArea;

        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        const stageWidth = isFinite(deckBox.max.x) ? (deckBox.max.x - deckBox.min.x) : 0;
        const stageDepth = isFinite(deckBox.max.z) ? (deckBox.max.z - deckBox.min.z) : 0;
        const stageHeight = this.params.deckHeight || 0;

        return {
            towers: {
                count: this.params.towerCount,
                width: this.params.towerWidth,
                depth: this.params.towerDepth,
                levels: this.params.towerLevels,
                height: this.params.towerLevels * this.params.pipeLength
            },
            leds: {
                boxPanels,
                externalPanels: extPanels,
                totalPanels: boxPanels + extPanels,
                boxArea,
                externalArea: extArea,
                totalArea
            },
            stage: {
                width: stageWidth,
                depth: stageDepth,
                height: stageHeight
            },
            crowd: {
                count: this.crowdCount || 0,
                pit: (this.crowdData || []).filter(p => p.area === 'pit').length,
                backstage: (this.crowdData || []).filter(p => p.area === 'backstage').length
            }
        };
    }

    clearTowers() {
        while (this.towersGroup.children.length > 0) {
            const child = this.towersGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.towersGroup.remove(child);
        }
    }

    clearLedGlassPanels() {
        while (this.ledGlassPanels.children.length > 0) {
            const child = this.ledGlassPanels.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.ledGlassPanels.remove(child);
        }
    }

    clearStageDeck() {
        while (this.stageDeck.children.length > 0) {
            const child = this.stageDeck.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.stageDeck.remove(child);
        }
    }

    clearStageBands() {
        while (this.stageBandsGroup.children.length > 0) {
            const child = this.stageBandsGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.stageBandsGroup.remove(child);
        }
    }

    clearBackScaffold() {
        while (this.backScaffoldGroup.children.length > 0) {
            const child = this.backScaffoldGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.backScaffoldGroup.remove(child);
        }
    }

    clearDimensions() {
        while (this.dimensionGroup.children.length > 0) {
            const child = this.dimensionGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material && child.material.map) child.material.map.dispose();
            if (child.material) child.material.dispose();
            this.dimensionGroup.remove(child);
        }
    }

    clearRailings() {
        while (this.railingsGroup.children.length > 0) {
            const child = this.railingsGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.railingsGroup.remove(child);
        }
    }

    clearStairs() {
        while (this.stairsGroup.children.length > 0) {
            const child = this.stairsGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.stairsGroup.remove(child);
        }
    }

    clearStageSkirts() {
        while (this.stageSkirtsGroup.children.length > 0) {
            const child = this.stageSkirtsGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.stageSkirtsGroup.remove(child);
        }
    }

    clearCrowdBarrier() {
        while (this.crowdBarrierGroup.children.length > 0) {
            const child = this.crowdBarrierGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.crowdBarrierGroup.remove(child);
        }
    }

    clearLasers() {
        while (this.lasersGroup.children.length > 0) {
            const child = this.lasersGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material && !child.material.isShaderMaterial) child.material.dispose();
            this.lasersGroup.remove(child);
        }
    }

    clearRisers() {
        while (this.risersGroup.children.length > 0) {
            const child = this.risersGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.risersGroup.remove(child);
        }
    }

    buildStageDeck() {
        const module = this.params.deckModuleSize;
        const height = this.params.deckHeight;
        const thickness = this.params.deckThickness;
        const {
            backstageLeftWidth,
            backstageCenterWidth,
            backstageRightWidth,
            backstageDepth,
            djWidth,
            djDepth,
        } = this.params;
        const y = height - thickness / 2;

        const totalBackWidth = backstageLeftWidth + backstageCenterWidth + backstageRightWidth;
        const xLeft = -totalBackWidth / 2 + backstageLeftWidth / 2;
        const xCenter = xLeft + backstageLeftWidth / 2 + backstageCenterWidth / 2;
        const xRight = totalBackWidth / 2 - backstageRightWidth / 2;

        const zBack = -backstageDepth / 2;
        const zDj = -(backstageDepth / 2 - djDepth / 2);

        // Palco unificado (verde)
        const deckColor = 0x555b65; // chumbo claro para diferenciar do restante
        const blocks = [
            { w: backstageLeftWidth, d: backstageDepth, x: xLeft, z: zBack, color: deckColor },
            { w: backstageCenterWidth, d: backstageDepth, x: xCenter, z: zBack, color: deckColor },
            { w: backstageRightWidth, d: backstageDepth, x: xRight, z: zBack, color: deckColor }
        ];

        const deckMat = (hex) =>
            new THREE.MeshStandardMaterial({
                color: hex,
                roughness: 0.6,
                metalness: 0.05
            });

        blocks.forEach((b) => {
            const geom = new THREE.BoxGeometry(b.w, thickness, b.d);
            const mesh = new THREE.Mesh(geom, deckMat(b.color));
            mesh.position.set(b.x, y, b.z);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.userData.type = 'deck';
            this.stageDeck.add(mesh);
        });

        // Grid lines to suggest modular 1.25m layout
        const gridMat = new THREE.LineBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.5 });
        blocks.forEach((b) => {
            const cols = Math.round(b.w / module);
            const rows = Math.round(b.d / module);
            const x0 = b.x - b.w / 2;
            const z0 = b.z - b.d / 2;

            for (let i = 0; i <= cols; i++) {
                const x = x0 + i * module;
                const pts = [new THREE.Vector3(x, y + thickness / 2 + 0.001, z0), new THREE.Vector3(x, y + thickness / 2 + 0.001, z0 + b.d)];
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                const line = new THREE.Line(geo, gridMat);
                this.stageDeck.add(line);
            }
            for (let j = 0; j <= rows; j++) {
                const z = z0 + j * module;
                const pts = [new THREE.Vector3(x0, y + thickness / 2 + 0.001, z), new THREE.Vector3(x0 + b.w, y + thickness / 2 + 0.001, z)];
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                const line = new THREE.Line(geo, gridMat);
                this.stageDeck.add(line);
            }
        });

        // Área DJ apenas sinalizada (7x3 módulos)
        const djW = module * 7;
        const djD = module * 3;
        const djMat = new THREE.MeshStandardMaterial({
            color: 0xf6a6d8,
            roughness: 0.6,
            metalness: 0.05,
            transparent: true,
            opacity: 0.6
        });
        const djGeom = new THREE.BoxGeometry(djW, 0.02, djD);
        const djMesh = new THREE.Mesh(djGeom, djMat);
        djMesh.position.set(0, height + 0.01, zDj);
        djMesh.userData.type = 'djArea';
        this.stageDeck.add(djMesh);

    }

    alignStageDeckToFront() {
        if (this.towersGroup.children.length === 0 || this.stageDeck.children.length === 0) return;

        const towerBox = new THREE.Box3().setFromObject(this.towersGroup);
        const frontZ = towerBox.min.z; // menor Z = frente das torres

        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        const deckBack = deckBox.max.z; // parte mais perto das torres

        // Garantir 6m de afastamento: deck termina 6m antes da frente das torres
        const targetBack = frontZ - 6.0;
        const deltaZ = targetBack - deckBack;
        this.stageDeck.position.z += deltaZ;
    }

    buildStageSkirts() {
        this.clearStageSkirts();

        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        if (!isFinite(deckBox.min.x) || !isFinite(deckBox.max.x)) return;

        const height = this.params.deckHeight;
        const thickness = 0.05;
        const stairsGapMargin = 0.05;
        const stairsGap = (this.params.stairsWidth || 1.5) + 0.3; // abertura para a escada na lateral
        const gapCenterZ = deckBox.min.z + (this.params.stairsWidth || 1.5) / 2 + stairsGapMargin;

        const skirtMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 1.0,
            metalness: 0.0,
            side: THREE.DoubleSide
        });

        const addSkirt = (w, h, d, x, y, z) => {
            const geom = new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geom, skirtMat.clone());
            mesh.position.set(x, y, z);
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            mesh.userData.type = 'stageSkirt';
            this.stageSkirtsGroup.add(mesh);
        };

        const y = height / 2;
        const totalWidth = deckBox.max.x - deckBox.min.x;
        const totalDepth = deckBox.max.z - deckBox.min.z;

        // Frente e traseira
        addSkirt(totalWidth, height, thickness, (deckBox.min.x + deckBox.max.x) / 2, y, deckBox.min.z - thickness / 2);
        addSkirt(totalWidth, height, thickness, (deckBox.min.x + deckBox.max.x) / 2, y, deckBox.max.z + thickness / 2);

        // Laterais com abertura para escada
        const gapMin = gapCenterZ - stairsGap / 2;
        const gapMax = gapCenterZ + stairsGap / 2;

        const addSideSkirt = (xPos) => {
            // Segmento frontal até a abertura
            const frontDepth = Math.max(0, gapMin - deckBox.min.z);
            if (frontDepth > 0.01) {
                addSkirt(thickness, height, frontDepth, xPos, y, deckBox.min.z + frontDepth / 2);
            }
            // Segmento após a abertura até o fundo
            const rearDepth = Math.max(0, deckBox.max.z - gapMax);
            if (rearDepth > 0.01) {
                addSkirt(thickness, height, rearDepth, xPos, y, gapMax + rearDepth / 2);
            }
        };

        addSideSkirt(deckBox.min.x - thickness / 2);
        addSideSkirt(deckBox.max.x + thickness / 2);
    }

    buildDimensionLines() {
        this.clearDimensions();

        // Stage width and depth
        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        if (isFinite(deckBox.min.x) && isFinite(deckBox.max.x)) {
            const y = this.params.deckHeight + 0.1;
            const frontZ = deckBox.min.z;
            const backZ = deckBox.max.z;
            const width = deckBox.max.x - deckBox.min.x;
            const depth = deckBox.max.z - deckBox.min.z;

            const startW = new THREE.Vector3(deckBox.min.x, y, frontZ);
            const endW = new THREE.Vector3(deckBox.max.x, y, frontZ);
            this.addDimension(startW, endW, `${width.toFixed(2)} m`);

            const startD = new THREE.Vector3(deckBox.max.x + 0.2, y, frontZ);
            const endD = new THREE.Vector3(deckBox.max.x + 0.2, y, backZ);
            this.addDimension(startD, endD, `${depth.toFixed(2)} m`);
        }

        // Tower height (use first tower)
        if (this.towersGroup.children.length > 0) {
            const tower = this.towersGroup.children[0];
            const tBox = new THREE.Box3().setFromObject(tower);
            if (isFinite(tBox.min.y) && isFinite(tBox.max.y)) {
                const x = tBox.max.x + 0.3;
                const z = tBox.max.z + 0.3;
                const h = tBox.max.y - tBox.min.y;
                const startH = new THREE.Vector3(x, tBox.min.y, z);
                const endH = new THREE.Vector3(x, tBox.max.y, z);
                this.addDimension(startH, endH, `${h.toFixed(2)} m`);
            }
        }
    }

    addDimension(start, end, label) {
        const mat = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
        const points = [start, end];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, mat);
        this.dimensionGroup.add(line);

        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const sprite = this.makeTextSprite(label);
        sprite.position.copy(mid);
        sprite.position.y += 0.2;
        this.dimensionGroup.add(sprite);
    }

    makeTextSprite(message) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontSize = 48;
        ctx.font = `${fontSize}px Arial`;
        const padding = 20;
        const metrics = ctx.measureText(message);
        canvas.width = metrics.width + padding;
        canvas.height = fontSize + padding;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffff00';
        ctx.fillText(message, padding / 2, fontSize);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        const scale = 0.5;
        sprite.scale.set(canvas.width / fontSize * scale, canvas.height / fontSize * scale, 1);
        return sprite;
    }

    buildBackScaffold() {
        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        if (!isFinite(deckBox.min.x) || !isFinite(deckBox.max.x)) return;

        const width = deckBox.max.x - deckBox.min.x;
        const count = Math.max(2, Math.round(width / this.params.towerWidth));
        const spacing = count > 1 ? width / (count - 1) : 0;
        const startX = deckBox.min.x;
        // Encostar na face traseira do palco (lado oposto ao público)
        const z = deckBox.min.z - (this.params.towerDepth / 2 + 0.05);

        for (let i = 0; i < count; i++) {
            const tower = this.createTower('square', i);
            const x = startX + spacing * i;
            tower.position.set(x, 0, z);
            tower.rotation.y = 0;
            this.backScaffoldGroup.add(tower);
        }
    }

    buildRailings() {
        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        if (!isFinite(deckBox.min.x) || !isFinite(deckBox.max.x)) return;

        const { railingHeight, railingThickness, stairsWidth } = this.params;
        const y = this.params.deckHeight + railingHeight / 2;
        const t = railingThickness;

        const addSegment = (x, z, w, d, rotY = 0) => {
            if (w <= 0 || d <= 0) return;

            // Grade de evento profissional
            const group = new THREE.Group();
            const isHorizontal = w > d;
            const length = isHorizontal ? w : d;
            const sectionLength = 2.0; // seções de 2 metros
            const numSections = Math.ceil(length / sectionLength);

            // Para cada seção de 2 metros
            for (let s = 0; s < numSections; s++) {
                const sectionGroup = new THREE.Group();
                const sectionStart = -length / 2 + (s * sectionLength);
                const actualSectionLength = Math.min(sectionLength, length / 2 - sectionStart);

                if (actualSectionLength <= 0) continue;

                const sectionCenter = sectionStart + actualSectionLength / 2;

                // Montante de sustentação (mais grosso) nas extremidades da seção
                const postRadius = 0.025;
                const postHeight = railingHeight + 0.15; // um pouco mais alto
                const postGeom = new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 8);

                // Montante no início da seção
                const post = new THREE.Mesh(postGeom, this.railingMaterial.clone());
                if (isHorizontal) {
                    post.position.set(sectionStart, 0, 0);
                } else {
                    post.position.set(0, 0, sectionStart);
                }
                sectionGroup.add(post);

                // Pé de sustentação (mais forte, indo até o chão)
                const footDepth = 0.3;
                const footGeom = new THREE.BoxGeometry(0.08, 0.05, footDepth);
                const foot = new THREE.Mesh(footGeom, this.railingMaterial.clone());
                if (isHorizontal) {
                    foot.position.set(sectionStart, -railingHeight / 2 - 0.05, footDepth / 4);
                } else {
                    foot.position.set(footDepth / 4, -railingHeight / 2 - 0.05, sectionStart);
                    foot.rotation.y = Math.PI / 2;
                }
                sectionGroup.add(foot);

                // Corrimão superior arredondado
                const topRailRadius = 0.02;
                const topRailLength = actualSectionLength;
                const topRailGeom = new THREE.CylinderGeometry(topRailRadius, topRailRadius, topRailLength, 12);
                const topRail = new THREE.Mesh(topRailGeom, this.railingMaterial.clone());
                topRail.position.y = railingHeight / 2;
                if (isHorizontal) {
                    topRail.rotation.z = Math.PI / 2;
                    topRail.position.x = sectionCenter;
                } else {
                    topRail.rotation.x = Math.PI / 2;
                    topRail.position.z = sectionCenter;
                }
                sectionGroup.add(topRail);

                // Corrimão inferior
                const bottomRail = topRail.clone();
                bottomRail.position.y = -railingHeight / 2 + 0.1;
                sectionGroup.add(bottomRail);

                // Barras verticais finas dentro da seção
                const barThickness = 0.012;
                const barSpacing = 0.12;
                const numBars = Math.floor(actualSectionLength / barSpacing);

                for (let i = 1; i < numBars; i++) {
                    const barPos = sectionStart + (i * barSpacing);
                    const barGeom = new THREE.CylinderGeometry(barThickness, barThickness, railingHeight - 0.2, 6);
                    const bar = new THREE.Mesh(barGeom, this.railingMaterial.clone());

                    if (isHorizontal) {
                        bar.position.set(barPos, 0, 0);
                    } else {
                        bar.position.set(0, 0, barPos);
                    }
                    sectionGroup.add(bar);
                }

                group.add(sectionGroup);
            }

            group.position.set(x, y, z);
            group.rotation.y = rotY;
            this.railingsGroup.add(group);
        };

        // Frente e traseira contínuas
        addSegment((deckBox.min.x + deckBox.max.x) / 2, deckBox.min.z - t / 2, deckBox.max.x - deckBox.min.x, t);
        addSegment((deckBox.min.x + deckBox.max.x) / 2, deckBox.max.z + t / 2, deckBox.max.x - deckBox.min.x, t);

        // Laterais com aberturas perto dos cantos (escadas na lateral)
        const margin = 0.05;
        const gapD = stairsWidth + 0.2;
        const gapCenterZ = deckBox.min.z + stairsWidth / 2 + margin; // canto frontal encostado na borda

        const addSideWithGap = (xPos) => {
            const gapMin = gapCenterZ - gapD / 2;
            const gapMax = gapCenterZ + gapD / 2;
            if (gapMin > deckBox.min.z) {
                addSegment(xPos, (deckBox.min.z + gapMin) / 2, t, gapMin - deckBox.min.z);
            }
            if (deckBox.max.z > gapMax) {
                addSegment(xPos, (gapMax + deckBox.max.z) / 2, t, deckBox.max.z - gapMax);
            }
        };

        const leftX = deckBox.min.x - t / 2;
        const rightX = deckBox.max.x + t / 2;
        addSideWithGap(leftX);
        addSideWithGap(rightX);

        // Barreira ao redor da área do DJ (proteção backstage vs DJ)
        const djW = this.params.djWidth;
        const djD = this.params.djDepth;
        const zDj = -(this.params.backstageDepth / 2 - this.params.djDepth / 2) + this.stageDeck.position.z;
        const djXMin = this.stageDeck.position.x - djW / 2;
        const djXMax = this.stageDeck.position.x + djW / 2;

        // Frente e trás do DJ
        addSegment((djXMin + djXMax) / 2, zDj + djD / 2 + t / 2, djW, t);
        addSegment((djXMin + djXMax) / 2, zDj - djD / 2 - t / 2, djW, t);
        // Laterais do DJ
        addSegment(djXMin - t / 2, zDj, t, djD);
        addSegment(djXMax + t / 2, zDj, t, djD);
    }

    buildStairs() {
        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        if (!isFinite(deckBox.min.x) || !isFinite(deckBox.max.x)) return;

        const { stairsWidth, stairsDepth } = this.params;
        const deckH = this.params.deckHeight;

        const steps = 4;
        const stepH = deckH / steps;
        const stepD = stairsDepth / steps;
        const margin = 0.05;

        // Escadas na lateral frontal esquerda/direita, degraus entrando no palco (eixo +X para esquerda, -X para direita)
        const zPos = deckBox.min.z + stairsWidth / 2 + margin; // encostado na borda frontal do palco
        const extraSideOffset = 0.5;
        const lateralAdjust = 1.0; // deslocar 1m para cada lado
        const leftStartX = deckBox.min.x - stepD / 2 - margin - extraSideOffset - lateralAdjust;
        const rightStartX = deckBox.max.x + stepD / 2 + margin + extraSideOffset + lateralAdjust;

        const makeStairs = (xStart, dir) => {
            for (let i = 0; i < steps; i++) {
                const geom = new THREE.BoxGeometry(stepD, stepH, stairsWidth);
                const mesh = new THREE.Mesh(geom, this.stairsMaterial.clone());
                const yCenter = stepH * (i + 0.5);
                const xCenter = xStart + dir * i * stepD;
                mesh.position.set(xCenter, yCenter, zPos);
                mesh.userData.type = 'stairs';
                this.stairsGroup.add(mesh);
            }
        };

        // esquerda: avança para +X; direita: avança para -X
        makeStairs(leftStartX, +1);
        makeStairs(rightStartX, -1);
    }

    buildRisers() {
        if (!this.params.risersEnabled) return;
        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        if (!isFinite(deckBox.min.x) || !isFinite(deckBox.max.x)) return;

        const {
            riserCount,
            riserWidth,
            riserDepth,
            riserHeight,
            backstageDepth,
            djDepth
        } = this.params;

        const totalWidth = riserCount * riserWidth;
        const startX = -totalWidth / 2 + riserWidth / 2;
        const frontZ = deckBox.max.z - riserDepth / 2 - 0.2; // encostado na grade frontal
        const y = this.params.deckHeight + riserHeight / 2;

        for (let i = 0; i < riserCount; i++) {
            const x = startX + i * riserWidth;
            const geom = new THREE.BoxGeometry(riserWidth, riserHeight, riserDepth);
            const mesh = new THREE.Mesh(geom, this.riserMaterial.clone());
            mesh.position.set(x, y, frontZ);
            mesh.userData.type = 'riser';
            this.risersGroup.add(mesh);
        }

        // DJ em cima dos praticáveis
        const djHeight = 1.8;
        const djBody = new THREE.BoxGeometry(0.55, djHeight * 0.65, 0.35);
        const djHead = new THREE.SphereGeometry(0.18, 16, 16);
        const djMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.1, roughness: 0.7 });

        const djGroup = new THREE.Group();
        const bodyMesh = new THREE.Mesh(djBody, djMat);
        bodyMesh.position.y = djHeight * 0.65 / 2;
        const headMesh = new THREE.Mesh(djHead, djMat);
        headMesh.position.y = djHeight * 0.65 + 0.18;
        djGroup.add(bodyMesh);
        djGroup.add(headMesh);

        djGroup.position.set(0, this.params.deckHeight + riserHeight, frontZ - 0.5); // recuado 0.5m
        djGroup.userData.type = 'dj';
        this.risersGroup.add(djGroup);
    }

    buildStageBands() {
        if (!this.params.stageFrontBandsEnabled && !this.params.stageRearBandsEnabled) return;
        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        if (!isFinite(deckBox.min.x) || !isFinite(deckBox.max.x)) return;

        const scaffoldBox = new THREE.Box3().setFromObject(this.backScaffoldGroup);
        const bandCount = this.params.stageBandCount || 3;
        const bandH = this.params.stageBandHeight || 0.6;
        const bandGap = this.params.stageBandGap ?? 0.15;
        const bandDepth = this.params.stageBandDepth || 0.12;
        const width = deckBox.max.x - deckBox.min.x;
        const centerX = (deckBox.min.x + deckBox.max.x) / 2;
        const baseY = this.params.deckHeight + bandH / 2;

        // Frente do andaime (face voltada para o palco)
        const zFront = isFinite(scaffoldBox.max.z) ? scaffoldBox.max.z + bandDepth / 2 + 0.05 : deckBox.max.z + bandDepth / 2;
        // Traseira do andaime
        const zRear = isFinite(scaffoldBox.min.z) ? scaffoldBox.min.z - bandDepth / 2 - 0.05 : deckBox.min.z - bandDepth / 2;

        const addBands = (isFront) => {
            const matBase = isFront ? this.stageFrontLedMaterial : this.stageRearLedMaterial;
            const zPos = isFront ? zFront : zRear;

            // Distribuir em 3 níveis: baixo, meio, alto
            const scaffoldHeight = isFinite(scaffoldBox.max.y) ? scaffoldBox.max.y - this.params.deckHeight : 12;
            const levels = [
                this.params.deckHeight + bandH / 2,  // baixo
                this.params.deckHeight + scaffoldHeight * 0.5,  // meio
                this.params.deckHeight + scaffoldHeight * 0.9   // alto
            ];

            levels.forEach((yPos, i) => {
                const geom = new THREE.BoxGeometry(width, bandH, bandDepth);
                const mesh = new THREE.Mesh(geom, matBase.clone());
                mesh.position.set(centerX, yPos, zPos);
                mesh.userData.type = 'stageBand';
                mesh.userData.level = i; // 0=baixo, 1=meio, 2=alto
                this.stageBandsGroup.add(mesh);
            });
        };

        if (this.params.stageFrontBandsEnabled) addBands(true);
        if (this.params.stageRearBandsEnabled) addBands(false);
    }

    buildLasers() {
        const height = this.params.laserHeight || this.params.towerLevels * this.params.pipeLength;
        const beamRadius = 0.05;
        const sphereRadius = 0.08;

        const makeRand = (seed) => {
            let s = seed;
            return () => {
                s = (s * 9301 + 49297) % 233280;
                return s / 233280;
            };
        };

        // Lasers nas torres
        this.towersGroup.children.forEach((tower, idx) => {
            const towerIndex = tower.userData.towerIndex ?? idx;
            // Se não for todas, alterna
            if (!this.params.laserAllTowers && towerIndex % 2 !== 0) return;

            const box = new THREE.Box3().setFromObject(tower);
            if (!isFinite(box.max.y)) return;
            const center = box.getCenter(new THREE.Vector3());

            const rand = makeRand(towerIndex + 1);
            const colorMat = this.laserMaterial.clone();

            // Linha vertical
            const vertGeom = new THREE.CylinderGeometry(beamRadius, beamRadius, height, 8, 1, true);
            const vert = new THREE.Mesh(vertGeom, colorMat.clone());
            vert.position.set(center.x, box.max.y + height / 2, center.z);
            vert.userData.type = 'laser';
            vert.userData.towerIndex = towerIndex;
            vert.userData.laserType = 'vertical';
            vert.renderOrder = 2;
            this.lasersGroup.add(vert);

            // Linha horizontal (eixo X) em altura média
            const horizLen = Math.max(6, this.params.layoutSpacingX || 8);
            const horizGeom = new THREE.CylinderGeometry(beamRadius, beamRadius, horizLen, 8, 1, true);
            const horiz = new THREE.Mesh(horizGeom, colorMat.clone());
            horiz.rotation.z = Math.PI / 2;
            horiz.position.set(center.x, box.max.y + height * 0.3, center.z);
            horiz.userData.type = 'laser';
            horiz.userData.towerIndex = towerIndex;
            horiz.userData.laserType = 'horizontal';
            horiz.renderOrder = 2;
            this.lasersGroup.add(horiz);

            // Pontos generativos ao longo do volume (esferas pequenas)
            const pointCount = 8;
            for (let i = 0; i < pointCount; i++) {
                const px = center.x + (rand() - 0.5) * 1.8;
                const pz = center.z + (rand() - 0.5) * 1.8;
                const py = this.params.deckHeight + rand() * height;
                const sphereGeom = new THREE.SphereGeometry(sphereRadius, 10, 10);
                const sphere = new THREE.Mesh(sphereGeom, colorMat.clone());
                sphere.position.set(px, py, pz);
                sphere.userData.type = 'laser';
                sphere.userData.towerIndex = towerIndex;
                sphere.userData.laserType = 'point';
                sphere.renderOrder = 2;
                this.lasersGroup.add(sphere);
            }
        });

        // Lasers no palco (andaimes traseiros)
        if (this.params.stageLasersEnabled) {
            const scaffoldBox = new THREE.Box3().setFromObject(this.backScaffoldGroup);
            if (isFinite(scaffoldBox.min.x) && isFinite(scaffoldBox.max.x)) {
                const scaffoldWidth = scaffoldBox.max.x - scaffoldBox.min.x;
                const scaffoldHeight = scaffoldBox.max.y - this.params.deckHeight;
                const laserCount = Math.max(1, this.params.stageLaserCount || 6); // lasers ao longo do palco

                for (let i = 0; i < laserCount; i++) {
                    const colorMat = this.laserMaterial.clone();
                    const xPos = scaffoldBox.min.x + (i / (laserCount - 1)) * scaffoldWidth;
                    const yBase = this.params.deckHeight + scaffoldHeight * 0.8;
                    const zPos = scaffoldBox.max.z + 0.3;

                    // Laser vertical
                    const laserHeight = 8;
                    const vertGeom = new THREE.CylinderGeometry(beamRadius, beamRadius, laserHeight, 8, 1, true);
                    const vert = new THREE.Mesh(vertGeom, colorMat.clone());
                    vert.position.set(xPos, yBase + laserHeight / 2, zPos);
                    vert.userData.type = 'laser';
                    vert.userData.stageIndex = i;
                    vert.userData.laserType = 'stage-vertical';
                    vert.renderOrder = 2;
                    this.lasersGroup.add(vert);

                    // Laser diagonal (apontando para frente)
                    const diagGeom = new THREE.CylinderGeometry(beamRadius, beamRadius, 12, 8, 1, true);
                    const diag = new THREE.Mesh(diagGeom, colorMat.clone());
                    diag.position.set(xPos, yBase, zPos - 6);
                    diag.rotation.x = Math.PI / 4; // 45 graus
                    diag.userData.type = 'laser';
                    diag.userData.stageIndex = i;
                    diag.userData.laserType = 'stage-diagonal';
                    diag.renderOrder = 2;
                    this.lasersGroup.add(diag);
                }
            }
        }
    }
    isRearFace(towerPosition, faceIndex) {
        // Face indices: 0=+X, 1=+Z, 2=-X, 3=-Z (com facingAngle=0)
        if (towerPosition.x < 0) {
            // Torres do lado esquerdo: traseira = face -X (2)
            return faceIndex === 2;
        } else if (towerPosition.x > 0) {
            // Torres do lado direito: traseira = face +X (0)
            return faceIndex === 0;
        }
        // Centro: não remover
        return false;
    }

    buildTowers() {
        const {
            towerCount,
            layoutRadius,
            towerShape,
            layoutType,
            layoutRows,
            layoutCols,
            layoutSpacingX,
            layoutSpacingY
        } = this.params;

        const facingAngle = 0; // todas as torres alinhadas olhando para +Z

        for (let i = 0; i < towerCount; i++) {
            let x = 0;
            let z = 0;
            let positionAngle = 0;

            if (layoutType === 'line') {
                const offset = ((towerCount - 1) * layoutSpacingX) / 2;
                x = -offset + i * layoutSpacingX;
                z = 0;
            } else if (layoutType === 'grid') {
                const cols = layoutCols || Math.ceil(Math.sqrt(towerCount));
                const rows = layoutRows || Math.ceil(towerCount / cols);
                const row = Math.floor(i / cols);
                const col = i % cols;
                const offsetX = ((cols - 1) * layoutSpacingX) / 2;
                const offsetZ = ((rows - 1) * layoutSpacingY) / 2;
                x = -offsetX + col * layoutSpacingX;
                z = -offsetZ + row * layoutSpacingY;
            } else {
                positionAngle = (i / towerCount) * Math.PI * 2 - Math.PI / 2;
                x = Math.cos(positionAngle) * layoutRadius;
                z = Math.sin(positionAngle) * layoutRadius;
            }

            const tower = this.createTower(towerShape, i);
            tower.position.set(x, 0, z);
            tower.rotation.y = facingAngle;
            tower.userData.towerIndex = i;
            tower.userData.angle = facingAngle;

            this.towersGroup.add(tower);
        }
    }

    createTower(shape, index) {
        const towerGroup = new THREE.Group();
        const { towerLevels, towerWidth, towerDepth, pipeDiameter, pipeLength, showDiagonalBraces } = this.params;

        const pipeRadius = pipeDiameter / 2;
        const totalHeight = towerLevels * pipeLength;

        // Get corner positions based on shape
        let corners;
        if (shape === 'triangular') {
            // Triangular tower - 3 corners
            const radius = towerWidth / 2;
            corners = [
                { x: 0, z: -radius },
                { x: -radius * Math.cos(Math.PI / 6), z: radius * Math.sin(Math.PI / 6) },
                { x: radius * Math.cos(Math.PI / 6), z: radius * Math.sin(Math.PI / 6) }
            ];
        } else if (shape === 'rectangular') {
            // Rectangular tower - 4 corners (width != depth)
            const w = towerWidth / 2;
            const d = towerDepth / 2;
            corners = [
                { x: -w, z: -d },
                { x: w, z: -d },
                { x: w, z: d },
                { x: -w, z: d }
            ];
        } else {
            // Square tower - 4 corners
            const size = towerWidth / 2;
            corners = [
                { x: -size, z: -size },
                { x: size, z: -size },
                { x: size, z: size },
                { x: -size, z: size }
            ];
        }

        // Create vertical pipes (2m each level)
        corners.forEach((corner, cornerIndex) => {
            for (let level = 0; level < towerLevels; level++) {
                const pipeGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLength, 8);
                const pipe = new THREE.Mesh(pipeGeom, this.pipeMaterial.clone());
                pipe.position.set(corner.x, level * pipeLength + pipeLength / 2, corner.z);
                pipe.castShadow = true;
                pipe.receiveShadow = true;
                towerGroup.add(pipe);
            }
        });

        // Create horizontal pipes at each level
        for (let level = 0; level <= towerLevels; level++) {
            const y = level * pipeLength;

            for (let i = 0; i < corners.length; i++) {
                const c1 = corners[i];
                const c2 = corners[(i + 1) % corners.length];

                const dx = c2.x - c1.x;
                const dz = c2.z - c1.z;
                const length = Math.sqrt(dx * dx + dz * dz);
                const angle = Math.atan2(dz, dx);

                const pipeGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, length, 8);
                const pipe = new THREE.Mesh(pipeGeom, this.pipeMaterial.clone());
                pipe.position.set((c1.x + c2.x) / 2, y, (c1.z + c2.z) / 2);
                pipe.rotation.z = Math.PI / 2;
                pipe.rotation.y = -angle;
                pipe.castShadow = true;
                towerGroup.add(pipe);
            }
        }

        // Create diagonal braces
        if (showDiagonalBraces) {
            for (let level = 0; level < towerLevels; level++) {
                for (let i = 0; i < corners.length; i++) {
                    const c1 = corners[i];
                    const c2 = corners[(i + 1) % corners.length];

                    const y1 = level * pipeLength;
                    const y2 = (level + 1) * pipeLength;

                    // Calculate diagonal length
                    const dx = c2.x - c1.x;
                    const dz = c2.z - c1.z;
                    const dy = y2 - y1;
                    const diagLength = Math.sqrt(dx * dx + dz * dz + dy * dy);

                    const braceGeom = new THREE.CylinderGeometry(pipeRadius * 0.6, pipeRadius * 0.6, diagLength, 6);
                    const brace = new THREE.Mesh(braceGeom, this.pipeMaterial.clone());

                    // Position at center of diagonal
                    brace.position.set(
                        (c1.x + c2.x) / 2,
                        (y1 + y2) / 2,
                        (c1.z + c2.z) / 2
                    );

                    // Rotate to align with diagonal
                    const hLength = Math.sqrt(dx * dx + dz * dz);
                    const pitchAngle = Math.atan2(dy, hLength);
                    const yawAngle = Math.atan2(dz, dx);

                    brace.rotation.z = Math.PI / 2 - pitchAngle;
                    brace.rotation.y = -yawAngle;

                    towerGroup.add(brace);
                }
            }
        }

        // Create central Box Truss Q50 (50x50cm)
        this.createCentralBoxTruss(towerGroup, towerLevels, pipeLength, pipeRadius);

        return towerGroup;
    }

    createCentralBoxTruss(towerGroup, towerLevels, pipeLength, pipeRadius) {
        const boxSize = 0.5; // 50cm = Q50
        const halfBox = boxSize / 2;
        const boxTrussRadius = pipeRadius * 0.7;

        // Box truss corners (50x50cm no centro)
        const boxCorners = [
            { x: -halfBox, z: -halfBox },
            { x: halfBox, z: -halfBox },
            { x: halfBox, z: halfBox },
            { x: -halfBox, z: halfBox }
        ];

        // Vertical pipes do box truss central (4 cantos)
        boxCorners.forEach((corner) => {
            for (let level = 0; level < towerLevels; level++) {
                const pipeGeom = new THREE.CylinderGeometry(boxTrussRadius, boxTrussRadius, pipeLength, 8);
                const pipe = new THREE.Mesh(pipeGeom, this.pipeMaterial.clone());
                pipe.position.set(corner.x, level * pipeLength + pipeLength / 2, corner.z);
                pipe.castShadow = true;
                towerGroup.add(pipe);
            }
        });

        // Horizontal pipes do box truss em cada nível (conectando os cantos)
        for (let level = 0; level <= towerLevels; level++) {
            const y = level * pipeLength;

            // Frente e trás (eixo X)
            const frontPipe = new THREE.Mesh(
                new THREE.CylinderGeometry(boxTrussRadius, boxTrussRadius, boxSize, 8),
                this.pipeMaterial.clone()
            );
            frontPipe.rotation.z = Math.PI / 2;
            frontPipe.position.set(0, y, -halfBox);
            towerGroup.add(frontPipe);

            const backPipe = new THREE.Mesh(
                new THREE.CylinderGeometry(boxTrussRadius, boxTrussRadius, boxSize, 8),
                this.pipeMaterial.clone()
            );
            backPipe.rotation.z = Math.PI / 2;
            backPipe.position.set(0, y, halfBox);
            towerGroup.add(backPipe);

            // Lados (eixo Z)
            const leftPipe = new THREE.Mesh(
                new THREE.CylinderGeometry(boxTrussRadius, boxTrussRadius, boxSize, 8),
                this.pipeMaterial.clone()
            );
            leftPipe.rotation.x = Math.PI / 2;
            leftPipe.position.set(-halfBox, y, 0);
            towerGroup.add(leftPipe);

            const rightPipe = new THREE.Mesh(
                new THREE.CylinderGeometry(boxTrussRadius, boxTrussRadius, boxSize, 8),
                this.pipeMaterial.clone()
            );
            rightPipe.rotation.x = Math.PI / 2;
            rightPipe.position.set(halfBox, y, 0);
            towerGroup.add(rightPipe);
        }
    }

    // LED no Box Truss Central Q50 (50x50cm cada módulo)
    buildLedBoxTrussPanels() {
        const { ledBoxTrussPanelsPerFace, ledBoxTrussFaces, towerLevels, pipeLength } = this.params;

        const panelSize = 0.5; // 50cm x 50cm
        const boxTrussSize = 0.5; // Q50
        const panelOffset = boxTrussSize / 2 + 0.02;
        const totalHeight = towerLevels * pipeLength;
        const yPositions = [];

        if (ledBoxTrussPanelsPerFace <= 1) {
            yPositions.push(totalHeight / 2);
        } else {
            const startY = panelSize / 2;
            const step = (totalHeight - panelSize) / (ledBoxTrussPanelsPerFace - 1);
            for (let i = 0; i < ledBoxTrussPanelsPerFace; i++) {
                yPositions.push(startY + step * i);
            }
        }

        this.towersGroup.children.forEach((tower, towerIndex) => {
            const angle = tower.userData.angle;

            for (let face = 0; face < ledBoxTrussFaces; face++) {
                const isBackFace = this.params.hideRearPanels && this.isRearFace(tower.position, face);
                const faceAngle = angle + (face * Math.PI / 2);

                // pano traseiro
                if (isBackFace) {
                    const clothGeom = new THREE.BoxGeometry(panelSize, totalHeight, 0.02);
                    const cloth = new THREE.Mesh(clothGeom, this.clothMaterial.clone());
                    cloth.position.copy(tower.position);
                    cloth.position.y = totalHeight / 2;
                    cloth.position.x += Math.cos(faceAngle) * panelOffset;
                    cloth.position.z += Math.sin(faceAngle) * panelOffset;
                    cloth.rotation.y = -faceAngle + Math.PI / 2;
                    cloth.userData.type = 'cloth';
                    this.ledGlassPanels.add(cloth);
                    continue;
                }

                // pano até 2m e remoção dos painéis até 2m se opção ligada
                const bandHeight = Math.min(2.0, totalHeight);
                if (this.params.hideFirstLevelPanels && bandHeight > 0) {
                    const clothGeom = new THREE.BoxGeometry(panelSize, bandHeight, 0.02);
                    const cloth = new THREE.Mesh(clothGeom, this.clothMaterial.clone());
                    cloth.position.copy(tower.position);
                    cloth.position.y = bandHeight / 2;
                    cloth.position.x += Math.cos(faceAngle) * panelOffset;
                    cloth.position.z += Math.sin(faceAngle) * panelOffset;
                    cloth.rotation.y = -faceAngle + Math.PI / 2;
                    cloth.userData.type = 'cloth';
                    this.ledGlassPanels.add(cloth);
                }

                for (let panelIndex = 0; panelIndex < ledBoxTrussPanelsPerFace; panelIndex++) {
                    const y = yPositions[panelIndex] ?? totalHeight / 2;

                    // Remover painéis até 2m se opção ligada
                    const panelTop = y + panelSize / 2;
                    if (this.params.hideFirstLevelPanels && panelTop <= bandHeight + 0.001) continue;

                    const panelGeom = new THREE.BoxGeometry(panelSize, panelSize, 0.05);

                    const panelMat = this.ledBoxMaterial.clone();
                    const panel = new THREE.Mesh(panelGeom, panelMat);

                    panel.position.copy(tower.position);
                    panel.position.y = y;

                    const faceAngleLocal = angle + (face * Math.PI / 2);
                    panel.position.x += Math.cos(faceAngleLocal) * panelOffset;
                    panel.position.z += Math.sin(faceAngleLocal) * panelOffset;

                    panel.rotation.y = -faceAngleLocal + Math.PI / 2;

                    panel.userData.towerIndex = towerIndex;
                    panel.userData.panelIndex = panelIndex;
                    panel.userData.face = face;
                    panel.userData.type = 'ledBoxTruss';

                    this.ledGlassPanels.add(panel);
                    this.allLedPanels.push(panel);
                }
            }
        });
    }

    // LED nos Andaimes Externos (1000x500mm)
    buildLedExternalPanels() {
        const {
            ledExternalWidth,
            ledExternalHeight,
            ledExternalPanelsPerFace,
            ledExternalFaces,
            ledExternalPanelsPerRow,
            towerLevels,
            pipeLength,
            towerWidth,
            towerDepth
        } = this.params;

        const panelOffset = towerWidth / 2 + 0.05; // Fora do andaime externo
        const totalHeight = towerLevels * pipeLength;
        const yPositions = [];

        if (ledExternalPanelsPerFace <= 1) {
            yPositions.push(totalHeight / 2);
        } else {
            const startY = ledExternalHeight / 2;
            const step = (totalHeight - ledExternalHeight) / (ledExternalPanelsPerFace - 1);
            for (let i = 0; i < ledExternalPanelsPerFace; i++) {
                yPositions.push(startY + step * i);
            }
        }

        const colCount = Math.max(1, Math.min(ledExternalPanelsPerRow || 1, 2));
        const colSpacing = ledExternalWidth + 0.1;
        const bandHeight = Math.min(2.0, totalHeight); // faixa até 2m

        this.towersGroup.children.forEach((tower, towerIndex) => {
            const angle = tower.userData.angle;

            for (let face = 0; face < ledExternalFaces; face++) {
                const isRearFace = this.params.hideRearPanels && this.isRearFace(tower.position, face);
                if (isRearFace) {
                    const isXFace = face % 2 === 0; // 0:+X,2:-X
                    const widthFace = isXFace ? towerDepth : towerWidth;
                    const offset = (isXFace ? towerWidth : towerDepth) / 2 + 0.05;
                    const clothGeom = new THREE.BoxGeometry(widthFace, totalHeight, 0.02);
                    const cloth = new THREE.Mesh(clothGeom, this.clothMaterial.clone());
                    const faceAngle = angle + (face * Math.PI / 2);
                    cloth.position.copy(tower.position);
                    cloth.position.y = totalHeight / 2;
                    cloth.position.x += Math.cos(faceAngle) * offset;
                    cloth.position.z += Math.sin(faceAngle) * offset;
                    cloth.rotation.y = -faceAngle + Math.PI / 2;
                    cloth.userData.type = 'cloth';
                    this.ledGlassPanels.add(cloth);
                    continue;
                }

                // Faixa de tecido preto até 2m cobrindo toda a face
                if (this.params.hideFirstLevelPanels && bandHeight > 0) {
                    const isXFace = face % 2 === 0; // 0:+X,2:-X
                    const faceWidth = isXFace ? towerDepth : towerWidth;
                    const offset = (isXFace ? towerWidth : towerDepth) / 2 + 0.05;
                    const clothGeom = new THREE.BoxGeometry(faceWidth, bandHeight, 0.02);
                    const cloth = new THREE.Mesh(clothGeom, this.clothMaterial.clone());
                    const faceAngle = angle + (face * Math.PI / 2);
                    cloth.position.copy(tower.position);
                    cloth.position.y = bandHeight / 2;
                    cloth.position.x += Math.cos(faceAngle) * offset;
                    cloth.position.z += Math.sin(faceAngle) * offset;
                    cloth.rotation.y = -faceAngle + Math.PI / 2;
                    cloth.userData.type = 'cloth';
                    this.ledGlassPanels.add(cloth);
                }

                for (let panelIndex = 0; panelIndex < ledExternalPanelsPerFace; panelIndex++) {
                    for (let col = 0; col < colCount; col++) {
                        const y = yPositions[panelIndex] ?? totalHeight / 2;
                        // Remover painéis até 2m se habilitado
                        const panelTop = y + ledExternalHeight / 2;
                        if (this.params.hideFirstLevelPanels && panelTop <= bandHeight + 0.001) {
                            continue;
                        }

                        const panelGeom = new THREE.BoxGeometry(ledExternalWidth, ledExternalHeight, 0.05);
                        const faceAngle = angle + (face * Math.PI / 2);

                        // Offset normal para fora do andaime externo
                        const baseX = tower.position.x + Math.cos(faceAngle) * panelOffset;
                        const baseZ = tower.position.z + Math.sin(faceAngle) * panelOffset;

                        // Offset tangencial (coluna) para permitir 1 ou 2 por linha
                        const tangentX = -Math.sin(faceAngle);
                        const tangentZ = Math.cos(faceAngle);
                        const colOffset = (colCount === 1) ? 0 : (col === 0 ? -colSpacing / 2 : colSpacing / 2);
                        const posX = baseX + tangentX * colOffset;
                        const posZ = baseZ + tangentZ * colOffset;

                        const panelMat = this.ledExternalMaterial.clone();
                        const panel = new THREE.Mesh(panelGeom, panelMat);

                        panel.position.set(posX, y, posZ);
                        panel.rotation.y = -faceAngle + Math.PI / 2;

                        panel.userData.towerIndex = towerIndex;
                        panel.userData.panelIndex = panelIndex;
                        panel.userData.face = face;
                        panel.userData.type = 'ledExternal';

                        this.ledGlassPanels.add(panel);
                        this.allLedPanels.push(panel);
                    }
                }
            }
        });
    }

    // Video texture handling
    setVideoSource(source) {
        if (!this.videoElement) {
            this.videoElement = document.createElement('video');
            this.videoElement.loop = true;
            this.videoElement.muted = true;
            this.videoElement.playsInline = true;
            this.videoElement.crossOrigin = 'anonymous';
        }

        if (source instanceof File) {
            this.videoElement.src = URL.createObjectURL(source);
        } else if (typeof source === 'string') {
            this.videoElement.src = source;
        }

        this.videoElement.load();
    }

    applyVideoTexture() {
        if (!this.videoElement) return;

        if (this.videoTexture) {
            this.videoTexture.dispose();
        }

        this.videoTexture = new THREE.VideoTexture(this.videoElement);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBAFormat;

        // Apply to all LED panels
        this.allLedPanels.forEach(panel => {
            if (panel.material) {
                panel.material.map = this.videoTexture;
                panel.material.emissiveMap = this.videoTexture;
                panel.material.needsUpdate = true;
            }
        });

        this.params.ledEffect = 'video';
    }

    playVideo() {
        if (this.videoElement) {
            this.videoElement.play();
        }
    }

    pauseVideo() {
        if (this.videoElement) {
            this.videoElement.pause();
        }
    }

    update(delta) {
        this.time += delta * this.params.animationSpeed;

        if (this.params.ledEffect === 'video') {
            // Video texture updates automatically
            return;
        }

        const boxColor = new THREE.Color(this.params.ledBoxTrussColor);
        const extColor = new THREE.Color(this.params.ledExternalColor);
        const boxIntensity = this.params.ledBoxTrussIntensity;
        const extIntensity = this.params.ledExternalIntensity;

        this.allLedPanels.forEach((panel, index) => {
            if (!panel.material || !panel.material.emissive) return;

            const isExternal = panel.userData.type === 'ledExternal';
            const baseColor = isExternal ? extColor : boxColor;
            const baseIntensity = isExternal ? extIntensity : boxIntensity;

            const towerIndex = panel.userData.towerIndex || 0;
            const panelIndex = panel.userData.panelIndex || 0;
            const faceIndex = panel.userData.face || 0;

            switch (this.params.ledEffect) {
                case 'rainbow':
                    const hue = (this.time * 0.2 + index * 0.05) % 1;
                    panel.material.emissive.setHSL(hue, 1, 0.5);
                    panel.material.emissiveIntensity = baseIntensity;
                    break;

                case 'pulse':
                    const pulse = (Math.sin(this.time * 3) + 1) / 2;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity * pulse;
                    break;

                case 'wave':
                    const wave = (Math.sin(this.time * 2 + index * 0.3) + 1) / 2;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity * wave;
                    break;

                case 'strobe':
                    const strobeFreq = Math.floor(this.time * 8) % 2;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = strobeFreq === 0 ? baseIntensity : 0;
                    break;

                case 'chase':
                    const chasePos = Math.floor(this.time * 3) % this.allLedPanels.length;
                    const isActive = Math.abs(index - chasePos) < 3;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = isActive ? baseIntensity : baseIntensity * 0.1;
                    break;

                case 'tower-wave':
                    const towerWave = (Math.sin(this.time * 2 + towerIndex * 0.8) + 1) / 2;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity * towerWave;
                    break;

                case 'vertical-scan':
                    const scanPos = (Math.sin(this.time * 1.5) + 1) / 2;
                    const panelHeight = panel.position.y;
                    const maxHeight = 20;
                    const targetHeight = scanPos * maxHeight;
                    const dist = Math.abs(panelHeight - targetHeight);
                    const scanIntensity = Math.max(0, 1 - dist / 3);
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity * scanIntensity;
                    break;

                case 'sparkle':
                    const sparkle = Math.random() > 0.95 ? 1 : 0.2;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity * sparkle;
                    break;

                case 'rainbow-wave':
                    const rainbowHue = (this.time * 0.3 + index * 0.1) % 1;
                    const rainbowWave = (Math.sin(this.time * 2 + index * 0.2) + 1) / 2;
                    panel.material.emissive.setHSL(rainbowHue, 1, 0.5);
                    panel.material.emissiveIntensity = baseIntensity * (0.3 + rainbowWave * 0.7);
                    break;

                case 'fire':
                    const fireFlicker = Math.random() * 0.3 + 0.7;
                    const fireHue = 0.05 + Math.random() * 0.05;
                    panel.material.emissive.setHSL(fireHue, 1, 0.5);
                    panel.material.emissiveIntensity = baseIntensity * fireFlicker;
                    break;

                case 'alternate':
                    const altPhase = Math.floor(this.time * 2) % 2;
                    const isOddTower = towerIndex % 2;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = (isOddTower === altPhase) ? baseIntensity : baseIntensity * 0.1;
                    break;

                case 'wipe-horizontal':
                    // Cortina horizontal da esquerda para direita
                    const wipeX = (Math.sin(this.time * 1.5) + 1) / 2;
                    const panelX = (panel.position.x + 50) / 100; // normalizar -50 a 50 para 0 a 1
                    const wipeDistX = Math.abs(panelX - wipeX);
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = wipeDistX < 0.15 ? baseIntensity : baseIntensity * 0.1;
                    break;

                case 'wipe-vertical':
                    // Cortina vertical de baixo para cima
                    const wipeY = (Math.sin(this.time * 1.5) + 1) / 2;
                    const panelY = panel.position.y / 20; // normalizar 0 a 20 para 0 a 1
                    const wipeDistY = Math.abs(panelY - wipeY);
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = wipeDistY < 0.2 ? baseIntensity : baseIntensity * 0.1;
                    break;

                case 'center-out':
                    // Do centro para fora
                    const centerDist = Math.sqrt(
                        Math.pow(panel.position.x, 2) +
                        Math.pow(panel.position.z, 2)
                    ) / 50;
                    const expandRadius = (Math.sin(this.time * 2) + 1) / 2;
                    const centerIntensity = Math.abs(centerDist - expandRadius) < 0.2 ? 1 : 0.1;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity * centerIntensity;
                    break;

                case 'edge-in':
                    // Das bordas para dentro (inverso do center-out)
                    const edgeDist = Math.sqrt(
                        Math.pow(panel.position.x, 2) +
                        Math.pow(panel.position.z, 2)
                    ) / 50;
                    const contractRadius = 1 - ((Math.sin(this.time * 2) + 1) / 2);
                    const edgeIntensity = Math.abs(edgeDist - contractRadius) < 0.2 ? 1 : 0.1;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity * edgeIntensity;
                    break;

                case 'diagonal':
                    // Diagonal sweep
                    const diagPos = (Math.sin(this.time * 1.2) + 1) / 2;
                    const normalizedDiag = (panel.position.x + panel.position.z + 70) / 140;
                    const diagDist = Math.abs(normalizedDiag - diagPos);
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = diagDist < 0.15 ? baseIntensity : baseIntensity * 0.1;
                    break;

                case 'kaleidoscope':
                    // Efeito caleidoscópio com 4 quadrantes
                    const quadX = panel.position.x > 0 ? 1 : 0;
                    const quadZ = panel.position.z > 0 ? 1 : 0;
                    const quadrant = quadX * 2 + quadZ;
                    const quadPhase = Math.floor(this.time * 3) % 4;
                    const kaleido = quadrant === quadPhase ? 1 : 0.15;
                    const kaleidoHue = (quadrant * 0.25 + this.time * 0.1) % 1;
                    panel.material.emissive.setHSL(kaleidoHue, 0.9, 0.5);
                    panel.material.emissiveIntensity = baseIntensity * kaleido;
                    break;

                case 'matrix-rain':
                    // Efeito Matrix - chuva verde
                    const rainSpeed = this.time * 5;
                    const columnPhase = (panel.position.x * 0.5 + panel.position.z * 0.3) % 6.28;
                    const rainY = ((rainSpeed + columnPhase) % 20);
                    const rainDist = Math.abs(panel.position.y - rainY);
                    const matrixIntensity = Math.max(0, 1 - rainDist / 2);
                    panel.material.emissive.setRGB(0, matrixIntensity, 0);
                    panel.material.emissiveIntensity = baseIntensity * matrixIntensity;
                    break;

                case 'rings':
                    // Anéis concêntricos pulsantes
                    const ringDist = Math.sqrt(
                        Math.pow(panel.position.x, 2) +
                        Math.pow(panel.position.z, 2)
                    );
                    const ringPhase = (this.time * 3 + ringDist * 0.3) % 6.28;
                    const ringIntensity = (Math.sin(ringPhase) + 1) / 2;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity * (0.2 + ringIntensity * 0.8);
                    break;

                case 'spin':
                    // Rotação em espiral
                    const angle = Math.atan2(panel.position.z, panel.position.x);
                    const spinPhase = (angle + this.time * 2) % (Math.PI * 2);
                    const spinSeg = Math.floor(spinPhase / (Math.PI / 4)) % 2;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = spinSeg === 0 ? baseIntensity : baseIntensity * 0.2;
                    break;

                case 'checkerboard':
                    // Tabuleiro de xadrez alternado
                    const checkX = Math.floor((panel.position.x + 50) / 5) % 2;
                    const checkZ = Math.floor((panel.position.z + 50) / 5) % 2;
                    const checkPhase = Math.floor(this.time * 2) % 2;
                    const isCheckOn = ((checkX + checkZ) % 2) === checkPhase;
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = isCheckOn ? baseIntensity : baseIntensity * 0.1;
                    break;

                case 'build-up':
                    // Build up de baixo para cima (típico de drops em EDM)
                    const buildProgress = (Math.sin(this.time * 0.5) + 1) / 2;
                    const buildThreshold = panel.position.y / 20;
                    const isBuildOn = buildThreshold < buildProgress;
                    const buildHue = buildProgress * 0.7; // de vermelho a roxo
                    panel.material.emissive.setHSL(buildHue, 1, 0.5);
                    panel.material.emissiveIntensity = isBuildOn ? baseIntensity : 0;
                    break;

                case 'audio-reactive':
                    // Audio reactive - reage ao volume geral
                    const audioIntensity = this.audioData.volume * 0.8 + 0.2;
                    const audioHue = (this.audioData.bass * 0.3 + this.time * 0.1) % 1;
                    panel.material.emissive.setHSL(audioHue, 0.9, 0.5);
                    panel.material.emissiveIntensity = baseIntensity * audioIntensity;

                    // Beat flash
                    if (this.audioData.beat) {
                        panel.material.emissiveIntensity *= 1.5;
                    }
                    break;

                case 'audio-bass':
                    // Reage principalmente aos graves (bass)
                    const bassLevel = this.audioData.bass;
                    const bassColor = new THREE.Color();
                    bassColor.setHSL(0.6 + bassLevel * 0.2, 1, 0.5); // Azul a roxo
                    panel.material.emissive.copy(bassColor);
                    panel.material.emissiveIntensity = baseIntensity * (0.3 + bassLevel * 0.7);

                    // Extra intensity on beat
                    if (this.audioData.beat) {
                        panel.material.emissiveIntensity *= 2.0;
                    }
                    break;

                case 'solid':
                default:
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity;
                    break;
            }
        });

        // Animações de lasers
        this.updateLaserAnimations();

        // Animação do público
        this.updateCrowdAnimation();
    }

    buildP5Lights() {
        // Limpar luzes P5 existentes
        while (this.p5LightsGroup.children.length > 0) {
            const child = this.p5LightsGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.p5LightsGroup.remove(child);
        }

        if (!this.params.p5LightsEnabled) return;

        const p5Size = 0.15; // tamanho da luz P5
        const p5Color = new THREE.Color(this.params.p5LightColor);

        // Material para luzes P5
        const p5Material = new THREE.MeshStandardMaterial({
            color: p5Color,
            emissive: p5Color,
            emissiveIntensity: this.params.p5LightIntensity,
            metalness: 0.3,
            roughness: 0.4
        });

        // Adicionar P5 nas torres
        this.towersGroup.children.forEach((tower) => {
            const box = new THREE.Box3().setFromObject(tower);
            if (!isFinite(box.min.y)) return;

            const towerHeight = box.max.y - box.min.y;
            const centerX = (box.min.x + box.max.x) / 2;
            const centerZ = (box.min.z + box.max.z) / 2;

            const p5Geom = new THREE.BoxGeometry(p5Size, p5Size, p5Size);
            const p5Mesh = new THREE.Mesh(p5Geom, p5Material.clone());
            p5Mesh.position.set(centerX, towerHeight * 0.6, centerZ);
            p5Mesh.userData.type = 'p5Light';
            this.p5LightsGroup.add(p5Mesh);
        });
    }

    buildCrowd() {
        // Limpar crowd existente
        if (this.crowdInstances) {
            this.crowdInstances.geometry.dispose();
            this.crowdInstances.material.dispose();
            this.crowdGroup.remove(this.crowdInstances);
            this.crowdInstances = null;
        }
        this.crowdData = [];
        this.crowdCount = 0;

        if (!this.params.crowdEnabled) return;

        const deckBox = new THREE.Box3().setFromObject(this.stageDeck);
        const towerBox = new THREE.Box3().setFromObject(this.towersGroup);
        if (!isFinite(deckBox.min.x) || !isFinite(towerBox.max.z)) return;

        const density = this.params.crowdDensity; // pessoas por m²
        const peoplePositions = [];

        // Pista em frente ao palco (lado +Z): inicia 3m à frente do palco e vai até 5m além da última torre
        if (this.params.crowdPitEnabled) {
            const pitWidth = deckBox.max.x - deckBox.min.x;
            const gridSpacing = Math.sqrt(1 / density);
            const numCols = Math.floor(pitWidth / gridSpacing);

            // Inicia na frente do palco (face +Z) e termina 5m após a última torre
            const stageFrontZ = deckBox.max.z;
            const pitStartZ = stageFrontZ + 3.0; // faixa livre de 3m para som
            const pitEndZ = towerBox.max.z + 5;
            const pitDepth = pitEndZ - pitStartZ;
            if (pitDepth <= 0) return;

            const numRows = Math.floor(pitDepth / gridSpacing);

            // Barreira na linha de início da pista (3m do palco)
            this.clearCrowdBarrier();
            const barrierHeight = 1.2;
            const barrierThickness = 0.15;
            const barrierWidth = pitWidth;
            const barrierGeom = new THREE.BoxGeometry(barrierWidth, barrierHeight, barrierThickness);
            const barrierMat = new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.8,
                metalness: 0.1
            });
            const barrier = new THREE.Mesh(barrierGeom, barrierMat);
            barrier.position.set((deckBox.min.x + deckBox.max.x) / 2, barrierHeight / 2, pitStartZ - barrierThickness / 2);
            barrier.userData.type = 'crowdBarrier';
            barrier.castShadow = true;
            barrier.receiveShadow = true;
            this.crowdBarrierGroup.add(barrier);

            for (let row = 0; row < numRows; row++) {
                for (let col = 0; col < numCols; col++) {
                    const randomOffset = (Math.random() - 0.5) * gridSpacing * 0.5;
                    const x = deckBox.min.x + (col + 0.5) * gridSpacing + randomOffset;
                    const z = pitStartZ + (row + 0.5) * gridSpacing + randomOffset * 0.5;
                    const y = 0.9;

                    peoplePositions.push({
                        x, y, z,
                        area: 'pit',
                        randomPhase: Math.random() * Math.PI * 2,
                        randomSpeed: 0.8 + Math.random() * 0.4
                    });
                }
            }
        }

        // Backstage sobre o deck (lado -Z), evitando área do DJ
        if (this.params.crowdBackstageEnabled) {
            const gridSpacing = Math.sqrt(1 / density);

            // Dimensões da área DJ para excluir
            const module = this.params.deckModuleSize;
            const djW = module * 7;
            const djD = module * 3;
            const zDj = -(this.params.backstageDepth / 2 - this.params.djDepth / 2) + this.stageDeck.position.z;
            const djMinX = -djW / 2 + this.stageDeck.position.x;
            const djMaxX = djW / 2 + this.stageDeck.position.x;
            const djMinZ = zDj - djD / 2;
            const djMaxZ = zDj + djD / 2;

            const numRows = Math.floor((deckBox.max.z - deckBox.min.z) / gridSpacing);
            const numCols = Math.floor((deckBox.max.x - deckBox.min.x) / gridSpacing);

            for (let row = 0; row < numRows; row++) {
                for (let col = 0; col < numCols; col++) {
                    const randomOffset = (Math.random() - 0.5) * gridSpacing * 0.5;
                    const x = deckBox.min.x + (col + 0.5) * gridSpacing + randomOffset;
                    const z = deckBox.min.z + (row + 0.5) * gridSpacing + randomOffset * 0.5;
                    const y = this.params.deckHeight + 0.9;

                    // pular área do DJ
                    if (x > djMinX && x < djMaxX && z > djMinZ && z < djMaxZ) continue;

                    peoplePositions.push({
                        x, y, z,
                        area: 'backstage',
                        randomPhase: Math.random() * Math.PI * 2,
                        randomSpeed: 0.8 + Math.random() * 0.4
                    });
                }
            }
        }

        this.crowdCount = peoplePositions.length;
        this.crowdData = peoplePositions;

        // Criar geometria de pessoa (cilindro simples representando corpo)
        const personGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 6);
        const personMaterial = new THREE.MeshStandardMaterial({
            color: this.params.crowdColor,
            roughness: 0.8,
            metalness: 0.1
        });

        // Criar InstancedMesh para performance
        this.crowdInstances = new THREE.InstancedMesh(
            personGeometry,
            personMaterial,
            this.crowdCount
        );

        // Posicionar cada inst?ncia
        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();

        peoplePositions.forEach((person, i) => {
            matrix.makeTranslation(person.x, person.y, person.z);
            this.crowdInstances.setMatrixAt(i, matrix);

            // Varia??o de cor para cada pessoa
            const hueVariation = (Math.random() - 0.5) * 0.1;
            color.setHSL(0.08 + hueVariation, 0.8, 0.5);
            this.crowdInstances.setColorAt(i, color);
        });

        this.crowdInstances.instanceMatrix.needsUpdate = true;
        this.crowdInstances.instanceColor.needsUpdate = true;
        this.crowdInstances.castShadow = true;
        this.crowdInstances.receiveShadow = true;

        this.crowdGroup.add(this.crowdInstances);
    }

    updateCrowdAnimation() {
        if (!this.crowdInstances || this.crowdCount === 0) return;

        const t = this.time * this.params.crowdAnimationSpeed;
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const scale = new THREE.Vector3(1, 1, 1);

        this.crowdData.forEach((person, i) => {
            // Animação de dança: movimento vertical (pular) + rotação
            const phase = t + person.randomPhase;
            const jumpHeight = Math.abs(Math.sin(phase * 2 * person.randomSpeed)) * 0.15;
            const sway = Math.sin(phase * person.randomSpeed) * 0.05;

            position.set(
                person.x + sway,
                person.y + jumpHeight,
                person.z
            );

            // Rotação suave no eixo Y (balançar)
            rotation.set(0, Math.sin(phase * 0.5) * 0.2, 0);

            // Pequena variação de escala (breathing)
            const breathe = 1 + Math.sin(phase * 3) * 0.05;
            scale.set(1, breathe, 1);

            matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
            this.crowdInstances.setMatrixAt(i, matrix);
        });

        this.crowdInstances.instanceMatrix.needsUpdate = true;
    }

    updateLaserAnimations() {
        const speed = this.params.laserSpeed || 1.0;
        const t = this.time * speed;

        this.lasersGroup.children.forEach((laser, index) => {
            if (!laser.material) return;

            const laserType = laser.userData.laserType;
            const towerIndex = laser.userData.towerIndex || 0;
            const stageIndex = laser.userData.stageIndex || 0;

            switch (this.params.laserAnimation) {
                case 'pulse':
                    // Pulsar intensidade
                    const pulseIntensity = (Math.sin(t * 3) + 1) / 2;
                    laser.material.opacity = 0.3 + pulseIntensity * 0.5;
                    break;

                case 'chase':
                    // Perseguição - um laser por vez
                    const activeIndex = Math.floor(t * 2) % this.lasersGroup.children.length;
                    laser.material.opacity = (index === activeIndex) ? 0.9 : 0.2;
                    break;

                case 'sweep':
                    // Varredura horizontal
                    if (laserType === 'horizontal' || laserType === 'stage-diagonal') {
                        const sweepAngle = Math.sin(t * 1.5) * Math.PI / 4;
                        laser.rotation.y = sweepAngle;
                    }
                    break;

                case 'rotate':
                    // Rotação contínua
                    if (laserType === 'vertical' || laserType === 'stage-vertical') {
                        laser.rotation.y = t * 0.5;
                    } else if (laserType === 'horizontal') {
                        laser.rotation.x = t * 0.3;
                    }
                    break;

                case 'random':
                    // Movimento aleatório
                    const randomPhase = Math.sin(t + index * 0.5);
                    if (laserType === 'horizontal' || laserType === 'stage-diagonal') {
                        laser.rotation.y = randomPhase * Math.PI / 3;
                    }
                    if (laserType === 'vertical' || laserType === 'stage-vertical') {
                        laser.rotation.z = randomPhase * Math.PI / 6;
                    }
                    break;

                case 'tower-wave':
                    // Onda por torre
                    const towerPhase = (Math.sin(t * 2 + towerIndex * 0.5) + 1) / 2;
                    laser.material.opacity = 0.2 + towerPhase * 0.6;
                    break;

                case 'strobe':
                    // Strobe rápido
                    const strobeOn = Math.floor(t * 10) % 2;
                    laser.material.opacity = strobeOn === 0 ? 0.8 : 0.1;
                    break;

                case 'stage-sweep':
                    // Varredura específica do palco
                    if (laserType === 'stage-vertical' || laserType === 'stage-diagonal') {
                        const stageSweep = (Math.sin(t * 1.2 + stageIndex * 0.3) + 1) / 2;
                        laser.material.opacity = 0.3 + stageSweep * 0.6;
                        if (laserType === 'stage-diagonal') {
                            laser.rotation.x = Math.PI / 6 + stageSweep * Math.PI / 3;
                        }
                    }
                    break;

                case 'audio-sync':
                    // Audio reactive - sincronizado com volume
                    const audioOpacity = 0.3 + this.audioData.volume * 0.6;
                    laser.material.opacity = audioOpacity;

                    // Rotação baseada nos médios
                    if (laserType === 'vertical' || laserType === 'stage-vertical') {
                        laser.rotation.y = this.audioData.mid * Math.PI * 2;
                    } else if (laserType === 'horizontal' || laserType === 'stage-diagonal') {
                        const sweepAmount = this.audioData.treble * Math.PI / 2;
                        laser.rotation.y = Math.sin(t + this.audioData.bass * 5) * sweepAmount;
                    }

                    // Beat flash
                    if (this.audioData.beat) {
                        laser.material.opacity = Math.min(1.0, audioOpacity * 1.5);
                    }
                    break;

                case 'audio-kick':
                    // Reage principalmente ao kick/bass
                    const kickLevel = this.audioData.bass;
                    laser.material.opacity = 0.2 + kickLevel * 0.7;

                    // Movimento brusco no beat
                    if (this.audioData.beat) {
                        if (laserType === 'vertical' || laserType === 'stage-vertical') {
                            laser.rotation.y = Math.random() * Math.PI * 2;
                        } else if (laserType === 'horizontal' || laserType === 'stage-diagonal') {
                            laser.rotation.x = (Math.random() - 0.5) * Math.PI / 2;
                        }
                        laser.material.opacity = 1.0;
                    }
                    break;

                case 'static':
                default:
                    laser.material.opacity = 0.65;
                    break;
            }
        });
    }

    // Stats
    getTowerCount() {
        return this.towersGroup.children.length;
    }

    getPanelCount() {
        return this.allLedPanels.length;
    }

    getPanelCounts() {
        let boxTruss = 0;
        let external = 0;
        this.allLedPanels.forEach(panel => {
            if (!panel.userData) return;
            if (panel.userData.type === 'ledBoxTruss') boxTruss++;
            else if (panel.userData.type === 'ledExternal') external++;
        });
        return { boxTruss, external, total: boxTruss + external };
    }

    getPanelAreas() {
        const areas = {
            external: 0,
            boxTruss: 0,
            total: 0
        };
        const counts = this.getPanelCounts();
        const externalArea = this.params.ledExternalWidth * this.params.ledExternalHeight;
        const boxArea = 0.5 * 0.5; // 50cm x 50cm
        areas.external = counts.external * externalArea;
        areas.boxTruss = counts.boxTruss * boxArea;
        areas.total = areas.external + areas.boxTruss;
        return areas;
    }

    getDimensions() {
        const towerHeight = this.params.towerLevels * this.params.pipeLength;
        const towerWidth = this.params.towerWidth;
        const towerDepth = this.params.towerDepth;

        const totalBackWidth = this.params.backstageLeftWidth + this.params.backstageCenterWidth + this.params.backstageRightWidth;
        const stageWidth = totalBackWidth;
        const stageDepth = this.params.backstageDepth;

        return {
            towers: { width: towerWidth, depth: towerDepth, height: towerHeight },
            stage: {
                width: stageWidth,
                depth: stageDepth,
                height: this.params.deckHeight
            }
        };
    }

    // Export configuration
    getConfig() {
        return {
            towers: {
                count: this.params.towerCount,
                shape: this.params.towerShape,
                levels: this.params.towerLevels,
                layoutType: this.params.layoutType,
                layoutRadius: this.params.layoutRadius,
                layoutRows: this.params.layoutRows,
                layoutCols: this.params.layoutCols,
                layoutSpacingX: this.params.layoutSpacingX,
                layoutSpacingY: this.params.layoutSpacingY,
                width: this.params.towerWidth,
                depth: this.params.towerDepth
            },
            pipes: {
                length: this.params.pipeLength,
                diameter: this.params.pipeDiameter,
                color: this.params.pipeColor,
                showDiagonalBraces: this.params.showDiagonalBraces
            },
            ledGlass: {
                enabled: this.params.ledGlassEnabled,
                width: this.params.ledGlassWidth,
                height: this.params.ledGlassHeight,
                panelsPerFace: this.params.panelsPerFace,
                facesWithPanel: this.params.facesWithPanel
            },
            stageDeck: {
                enabled: this.params.stageDeckEnabled,
                moduleSize: this.params.deckModuleSize,
                height: this.params.deckHeight,
                thickness: this.params.deckThickness,
                backstageLeftWidth: this.params.backstageLeftWidth,
                backstageCenterWidth: this.params.backstageCenterWidth,
                backstageRightWidth: this.params.backstageRightWidth,
                backstageDepth: this.params.backstageDepth,
                djWidth: this.params.djWidth,
                djDepth: this.params.djDepth,
                frontWidth: this.params.frontWidth,
                frontDepth: this.params.frontDepth,
                frontBandsEnabled: this.params.stageFrontBandsEnabled,
                rearBandsEnabled: this.params.stageRearBandsEnabled,
                bandCount: this.params.stageBandCount,
                bandHeight: this.params.stageBandHeight,
                bandGap: this.params.stageBandGap,
                bandDepth: this.params.stageBandDepth
            },
            floor: {
                concrete: this.params.useConcreteFloor
            },
            lasers: {
                enabled: this.params.lasersEnabled,
                height: this.params.laserHeight,
                color: this.params.laserColor
            },
            centralPanel: {
                type: this.params.centralPanelType,
                width: this.params.centralPanelWidth,
                height: this.params.centralPanelHeight,
                elevation: this.params.centralPanelElevation
            },
            effects: {
                ledEffect: this.params.ledEffect,
                ledColor: this.params.ledColor,
                ledIntensity: this.params.ledIntensity,
                ledBoxTrussColor: this.params.ledBoxTrussColor,
                ledBoxTrussIntensity: this.params.ledBoxTrussIntensity,
                ledExternalColor: this.params.ledExternalColor,
                ledExternalIntensity: this.params.ledExternalIntensity,
                ledExternalPanelsPerRow: this.params.ledExternalPanelsPerRow,
                animationSpeed: this.params.animationSpeed
            }
        };
    }
}
