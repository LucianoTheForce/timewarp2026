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

        this.floor = null;

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
            layoutSpacingX: 20,
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
            djWidth: 8.0,
            djDepth: 3.75,
            frontWidth: 8.0,
            frontDepth: 2.5,
            showDimensions: true,

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

            // LED effects
            ledEffect: 'wave',
            ledColor: 0xff0066,
            ledIntensity: 1.4,
            animationSpeed: 1.0
        };

        // Materials
        this.pipeMaterial = null;
        this.ledBoxMaterial = null;
        this.ledExternalMaterial = null;
        this.clothMaterial = null;
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
            transparent: true,
            opacity: 0.65,
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

        // Grid helper (1m x 1m)
        this.gridHelper = new THREE.GridHelper(200, 200, 0x888888, 0x666666);
        this.gridHelper.position.set(0, 0.01, 0);
        this.scene.add(this.gridHelper);
    }

    setFloorVisible(visible) {
        if (this.floor) this.floor.visible = visible;
        if (this.gridHelper) this.gridHelper.visible = visible;
    }

    setTowersVisible(visible) {
        this.towersGroup.visible = visible;
        this.ledGlassPanels.visible = visible;
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
        this.allLedPanels = [];
        this.stageDeck.position.set(0, 0, 0);

        this.buildTowers();

        if (this.params.stageDeckEnabled) {
            this.buildStageDeck();
            this.alignStageDeckToFront();
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

    clearDimensions() {
        while (this.dimensionGroup.children.length > 0) {
            const child = this.dimensionGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material && child.material.map) child.material.map.dispose();
            if (child.material) child.material.dispose();
            this.dimensionGroup.remove(child);
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
            frontWidth,
            frontDepth
        } = this.params;
        const y = height - thickness / 2;

        const totalBackWidth = backstageLeftWidth + backstageCenterWidth + backstageRightWidth;
        const xLeft = -totalBackWidth / 2 + backstageLeftWidth / 2;
        const xCenter = xLeft + backstageLeftWidth / 2 + backstageCenterWidth / 2;
        const xRight = totalBackWidth / 2 - backstageRightWidth / 2;

        const zBack = -backstageDepth / 2;
        const zFrontStage = -(backstageDepth + frontDepth / 2);
        const zDj = -(backstageDepth / 2 - djDepth / 2);

        const blocks = [
            // Green backstage blocks
            { w: backstageLeftWidth, d: backstageDepth, x: xLeft, z: zBack, color: 0x7fcf90 },
            { w: backstageCenterWidth, d: backstageDepth, x: xCenter, z: zBack, color: 0x7fcf90 },
            { w: backstageRightWidth, d: backstageDepth, x: xRight, z: zBack, color: 0x7fcf90 },
            // Pink DJ area
            { w: djWidth, d: djDepth, x: 0, z: zDj, color: 0xf6a6d8 },
            // Gray front stage
            { w: frontWidth, d: frontDepth, x: 0, z: zFrontStage, color: 0x8a8a8a }
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
                for (let panelIndex = 0; panelIndex < ledBoxTrussPanelsPerFace; panelIndex++) {
                    const y = yPositions[panelIndex] ?? totalHeight / 2;

                    const panelGeom = new THREE.BoxGeometry(panelSize, panelSize, 0.05);

                    const isBackFace = face === 2;
                    if (this.params.hideRearPanels && isBackFace) {
                        const cloth = new THREE.Mesh(panelGeom, this.clothMaterial.clone());
                        cloth.position.copy(tower.position);
                        cloth.position.y = y;
                        const faceAngle = angle + (face * Math.PI / 2);
                        cloth.position.x += Math.cos(faceAngle) * panelOffset;
                        cloth.position.z += Math.sin(faceAngle) * panelOffset;
                        cloth.rotation.y = -faceAngle + Math.PI / 2;
                        cloth.userData.type = 'cloth';
                        this.ledGlassPanels.add(cloth);
                        continue;
                    }

                    const panelMat = this.ledBoxMaterial.clone();
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
        const {
            ledExternalWidth,
            ledExternalHeight,
            ledExternalPanelsPerFace,
            ledExternalFaces,
            ledExternalPanelsPerRow,
            towerLevels,
            pipeLength,
            towerWidth
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

        this.towersGroup.children.forEach((tower, towerIndex) => {
            const angle = tower.userData.angle;

            for (let face = 0; face < ledExternalFaces; face++) {
                for (let panelIndex = 0; panelIndex < ledExternalPanelsPerFace; panelIndex++) {
                    for (let col = 0; col < colCount; col++) {
                        const y = yPositions[panelIndex] ?? totalHeight / 2;

                        const panelGeom = new THREE.BoxGeometry(ledExternalWidth, ledExternalHeight, 0.05);
                        const panelMat = this.ledExternalMaterial.clone();
                        const panel = new THREE.Mesh(panelGeom, panelMat);

                        panel.position.copy(tower.position);
                        panel.position.y = y;

                        // Offset normal para fora do andaime externo
                        const faceAngle = angle + (face * Math.PI / 2);
                        panel.position.x += Math.cos(faceAngle) * panelOffset;
                        panel.position.z += Math.sin(faceAngle) * panelOffset;

                        // Offset tangencial (coluna) para permitir 1 ou 2 por linha
                        const tangentX = -Math.sin(faceAngle);
                        const tangentZ = Math.cos(faceAngle);
                        const colOffset = (colCount === 1) ? 0 : (col === 0 ? -colSpacing / 2 : colSpacing / 2);
                        panel.position.x += tangentX * colOffset;
                        panel.position.z += tangentZ * colOffset;

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

                case 'solid':
                default:
                    panel.material.emissive.copy(baseColor);
                    panel.material.emissiveIntensity = baseIntensity;
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
        const stageWidth = Math.max(
            totalBackWidth,
            this.params.djWidth,
            this.params.frontWidth
        );
        const stageDepth = this.params.backstageDepth + this.params.frontDepth;

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
                frontDepth: this.params.frontDepth
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
