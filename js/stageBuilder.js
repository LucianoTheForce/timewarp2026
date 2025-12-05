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

        this.floor = null;

        // Parameters - default values
        this.params = {
            // Tower params
            towerCount: 4,
            towerShape: 'square', // 'square', 'rectangular', 'triangular'
            towerLevels: 4, // Each level is 2m (4 andares = 8m)
            layoutRadius: 10,
            layoutType: 'circular', // 'circular', 'line', 'grid'
            layoutRows: 2,
            layoutCols: 2,
            layoutSpacingX: 5,
            layoutSpacingY: 5,
            towerWidth: 2.0, // 2x2 metros
            towerDepth: 2.0,

            // Pipe params (2m standard)
            pipeLength: 2.0, // Fixed 2m pipes
            pipeDiameter: 0.048, // 48mm default
            pipeColor: 0x555555,
            showDiagonalBraces: true,

            // LED no Box Truss Central (50x50cm)
            ledBoxTrussEnabled: true,
            ledBoxTrussPanelsPerFace: 4, // 4 painéis empilhados (preenche os 4 andares)
            ledBoxTrussFaces: 4, // 4 faces

            // LED nos Andaimes Externos (1000x500mm)
            ledExternalEnabled: true,
            ledExternalWidth: 1.0, // 1000mm
            ledExternalHeight: 0.5, // 500mm
            ledExternalPanelsPerFace: 4, // 4 painéis empilhados
            ledExternalFaces: 4, // 4 faces

            // LED effects
            ledEffect: 'solid',
            ledColor: 0xff0066,
            ledIntensity: 1.0,
            animationSpeed: 1.0
        };

        // Materials
        this.pipeMaterial = null;
        this.ledGlassMaterial = null;
        this.centralPanelMaterial = null;

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
        this.pipeMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.9,
            roughness: 0.2
        });

        // Painel LED normal (opaco, não translúcido)
        this.ledGlassMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            emissive: this.params.ledColor,
            emissiveIntensity: this.params.ledIntensity,
            transparent: false,
            metalness: 0.3,
            roughness: 0.4,
            side: THREE.DoubleSide
        });

        this.centralPanelMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            emissive: this.params.ledColor,
            emissiveIntensity: this.params.ledIntensity,
            metalness: 0.1,
            roughness: 0.3
        });
    }

    createFloor() {
        const floorGeom = new THREE.PlaneGeometry(100, 100);
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

        // Grid helper
        this.gridHelper = new THREE.GridHelper(100, 50, 0x888888, 0x666666);
        this.gridHelper.position.y = 0.01;
        this.scene.add(this.gridHelper);
    }

    setFloorVisible(visible) {
        if (this.floor) this.floor.visible = visible;
        if (this.gridHelper) this.gridHelper.visible = visible;
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
            this.updateLedColor(value);
        } else if (key === 'ledIntensity') {
            this.updateLedIntensity(value);
        } else if (key === 'ledEffect' && value === 'video') {
            // Switch to video mode
        } else {
            // Rebuild for structural changes
            this.rebuild();
        }
    }

    updateLedColor(color) {
        const colorObj = new THREE.Color(color);
        this.allLedPanels.forEach(panel => {
            if (panel.material && panel.material.emissive) {
                panel.material.emissive.copy(colorObj);
            }
        });
    }

    updateLedIntensity(intensity) {
        this.allLedPanels.forEach(panel => {
            if (panel.material) {
                panel.material.emissiveIntensity = intensity;
            }
        });
    }

    rebuild() {
        this.clearTowers();
        this.clearLedGlassPanels();
        this.allLedPanels = [];

        this.buildTowers();

        if (this.params.ledBoxTrussEnabled) {
            this.buildLedBoxTrussPanels();
        }

        if (this.params.ledExternalEnabled) {
            this.buildLedExternalPanels();
        }
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

        for (let i = 0; i < towerCount; i++) {
            let x = 0;
            let z = 0;
            let angle = 0;

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
                angle = (i / towerCount) * Math.PI * 2 - Math.PI / 2;
                x = Math.cos(angle) * layoutRadius;
                z = Math.sin(angle) * layoutRadius;
            }

            if (layoutType !== 'circular') {
                angle = Math.atan2(z, x);
            }

            const tower = this.createTower(towerShape, i);
            tower.position.set(x, 0, z);
            tower.lookAt(0, tower.position.y, 0);
            tower.userData.towerIndex = i;
            tower.userData.angle = angle;

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
                for (let panelIndex = 0; panelIndex < ledBoxTrussPanelsPerFace; panelIndex++) {
                    const y = yPositions[panelIndex] ?? totalHeight / 2;

                    const panelGeom = new THREE.BoxGeometry(panelSize, panelSize, 0.05);
                    const panelMat = this.ledGlassMaterial.clone();
                    const panel = new THREE.Mesh(panelGeom, panelMat);

                    panel.position.copy(tower.position);
                    panel.position.y = y;

                    const faceAngle = angle + (face * Math.PI / 2);
                    panel.position.x += Math.cos(faceAngle) * panelOffset;
                    panel.position.z += Math.sin(faceAngle) * panelOffset;

                    panel.rotation.y = -faceAngle + Math.PI / 2;

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
        const { ledExternalWidth, ledExternalHeight, ledExternalPanelsPerFace, ledExternalFaces, towerLevels, pipeLength, towerWidth } = this.params;

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

        this.towersGroup.children.forEach((tower, towerIndex) => {
            const angle = tower.userData.angle;

            for (let face = 0; face < ledExternalFaces; face++) {
                for (let panelIndex = 0; panelIndex < ledExternalPanelsPerFace; panelIndex++) {
                    const y = yPositions[panelIndex] ?? totalHeight / 2;

                    const panelGeom = new THREE.BoxGeometry(ledExternalWidth, ledExternalHeight, 0.05);
                    const panelMat = this.ledGlassMaterial.clone();
                    const panel = new THREE.Mesh(panelGeom, panelMat);

                    panel.position.copy(tower.position);
                    panel.position.y = y;

                    // Offset para fora do andaime externo
                    const faceAngle = angle + (face * Math.PI / 2);
                    panel.position.x += Math.cos(faceAngle) * panelOffset;
                    panel.position.z += Math.sin(faceAngle) * panelOffset;

                    panel.rotation.y = -faceAngle + Math.PI / 2;

                    panel.userData.towerIndex = towerIndex;
                    panel.userData.panelIndex = panelIndex;
                    panel.userData.face = face;
                    panel.userData.type = 'ledExternal';

                    this.ledGlassPanels.add(panel);
                    this.allLedPanels.push(panel);
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

        this.allLedPanels.forEach((panel, index) => {
            if (!panel.material || !panel.material.emissive) return;

            switch (this.params.ledEffect) {
                case 'rainbow':
                    const hue = (this.time * 0.2 + index * 0.05) % 1;
                    panel.material.emissive.setHSL(hue, 1, 0.5);
                    break;

                case 'pulse':
                    const pulse = (Math.sin(this.time * 3) + 1) / 2;
                    panel.material.emissiveIntensity = this.params.ledIntensity * pulse;
                    break;

                case 'wave':
                    const wave = (Math.sin(this.time * 2 + index * 0.3) + 1) / 2;
                    const baseColor = new THREE.Color(this.params.ledColor);
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = this.params.ledIntensity * wave;
                    break;

                case 'solid':
                default:
                    // Solid color - no animation needed
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
                animationSpeed: this.params.animationSpeed
            }
        };
    }
}
