import * as THREE from 'three';
import laserParty from './laserParty.js';

export class LaserController {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.group.name = 'laserPartyGroup';
        this.scene.add(this.group);

        this.enabled = true;
        this.options = {
            patternIndex: 0, // 0..9 variações
            hue: 120,
            speed: 1,
            distance: 80,
            thickness: 1
        };

        this.lasers = [];
        this.lastSignature = '';

        this.variations = [
            { dx: 0, dz: 0, dy: 0 },
            { dx: 1.5, dz: 0, dy: 2 },
            { dx: -1.5, dz: 0, dy: 2 },
            { dx: 0, dz: 1.5, dy: 1 },
            { dx: 0, dz: -1.5, dy: 1 },
            { dx: 1.5, dz: 1.5, dy: 0 },
            { dx: -1.5, dz: 1.5, dy: 0 },
            { dx: 1.5, dz: 0, dy: 3 },
            { dx: -1.5, dz: 0, dy: 3 },
            { dx: 0, dz: 0, dy: 3 }
        ];
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.group.visible = enabled;
        if (enabled) {
            this.lastSignature = '';
        }
    }

    setHue(hue) {
        this.options.hue = hue;
        this.lasers.forEach((laser) => { laser.hue = hue; });
    }

    setSpeed(speed) {
        this.options.speed = speed;
        this.lasers.forEach((laser) => { laser.speed = speed; });
        laserParty.globalAnimationSpeed = speed;
    }

    setPattern(index) {
        const idx = Math.max(0, Math.min(this.variations.length - 1, parseInt(index, 10) || 0));
        this.options.patternIndex = idx;
        this.lastSignature = '';
    }

    clear() {
        this.lasers.forEach((laser) => {
            if (laser.destroy) laser.destroy();
            else laser.removeFromParent();
        });
        this.lasers = [];
        this.group.clear();
    }

    signature(towersGroup) {
        if (!towersGroup) return '';
        const base = towersGroup.children.map((c) => `${c.position.x.toFixed(2)},${c.position.y.toFixed(2)},${c.position.z.toFixed(2)}`).join('|');
        return `${base}|p${this.options.patternIndex}`;
    }

    buildFromTowers(towersGroup) {
        this.clear();
        if (!this.enabled || !towersGroup) return;

        const thickness = this.options.thickness;
        const hue = this.options.hue;
        const speed = this.options.speed;
        const variation = this.variations[this.options.patternIndex] || this.variations[0];

        const centers = towersGroup.children.map((tower) => {
            const box = new THREE.Box3().setFromObject(tower);
            return { box, center: box.getCenter(new THREE.Vector3()) };
        });

        const total = centers.length;

        centers.forEach((entry, idx) => {
            const { box, center } = entry;
            if (!isFinite(box.max.y)) return;
            const baseY = box.max.y;

            const oppositeIdx = total - 1 - idx;
            const targetEntry = centers[oppositeIdx] || entry;
            const targetCenter = targetEntry.center.clone();
            targetCenter.y = targetEntry.box.max.y * 0.7;
            targetCenter.x += variation.dx;
            targetCenter.y += variation.dy;
            targetCenter.z += variation.dz;
            const distance = center.distanceTo(targetCenter) + 2;

            const createLaser = (angleX = 0, angleY = 0) => {
                const laser = laserParty.new({
                    addTo: this.group,
                    baseBox: false,
                    hue,
                    saturation: 1,
                    lightness: 0.6,
                    distance,
                    thickness,
                    speed,
                    angleX,
                    angleY,
                    raycast: false,
                    animation: null,
                    colorAnimation: null
                });
                laser.position.set(center.x, baseY, center.z);
                laser.pointAt(targetCenter);
                this.lasers.push(laser);
            };

            // dois feixes por torre: 1 reto e 1 com leve inclinação
            createLaser(0, 0);
            createLaser(variation.dy * 0.02, variation.dx * 0.02);
        });
    }

    update(towersGroup) {
        const sig = this.signature(towersGroup);
        if (sig !== this.lastSignature) {
            this.lastSignature = sig;
            this.buildFromTowers(towersGroup);
        }

        if (this.enabled) {
            laserParty.globalAnimationSpeed = this.options.speed;
            laserParty.updateAll();
        }
    }
}
