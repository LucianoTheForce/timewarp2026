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
        this.lastCompositeSignature = '';
        this.lastCompositeSignature = '';

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
        this.resetSignatures();
    }

    setSpeed(speed) {
        this.options.speed = speed;
        this.lasers.forEach((laser) => { laser.speed = speed; });
        laserParty.globalAnimationSpeed = speed;
        this.resetSignatures();
    }

    setPattern(index) {
        const idx = Math.max(0, Math.min(this.variations.length - 1, parseInt(index, 10) || 0));
        this.options.patternIndex = idx;
        this.resetSignatures();
    }

    setDistance(distance) {
        this.options.distance = distance;
        this.resetSignatures();
    }

    setThickness(thickness) {
        this.options.thickness = thickness;
        this.resetSignatures();
    }

    clear() {
        this.lasers.forEach((laser) => {
            if (laser.destroy) laser.destroy();
            else laser.removeFromParent();
        });
        this.lasers = [];
        this.group.clear();
    }

    signature(groups) {
        const arr = Array.isArray(groups) ? groups : [groups];
        if (!arr.length) return '';
        const base = arr
            .filter(g => g && g.children)
            .map(g => g.children.map((c) => `${c.position.x.toFixed(2)},${c.position.y.toFixed(2)},${c.position.z.toFixed(2)}`).join('|'))
            .join('||');
        return `${base}|p${this.options.patternIndex}`;
    }

    buildForGroups(groups, mode = 'side') {
        const arr = Array.isArray(groups) ? groups : [groups];
        const validGroups = arr.filter(g => g && g.children && g.children.length > 0);
        if (!this.enabled || validGroups.length === 0) return;

        const thickness = this.options.thickness;
        const hue = this.options.hue;
        const speed = this.options.speed;
        const variation = this.variations[this.options.patternIndex] || this.variations[0];

        const centers = [];
        validGroups.forEach((g) => {
            g.children.forEach((tower) => {
                const box = new THREE.Box3().setFromObject(tower);
                centers.push({ box, center: box.getCenter(new THREE.Vector3()) });
            });
        });

        const forwardDist = this.options.distance || 40;

        centers.forEach((entry) => {
            const { box, center } = entry;
            if (!isFinite(box.max.y)) return;
            const baseY = box.max.y;

            const targetCenter = center.clone();
            if (mode === 'side') {
                // Torres: apontar lateralmente para o lado oposto
                const isLeft = center.x < 0;
                const dirX = isLeft ? +1 : -1;
                targetCenter.x += dirX * forwardDist;
                targetCenter.y = baseY + variation.dy;
                targetCenter.z += variation.dz;
            } else {
                // Frente: apontar para +Z
                targetCenter.x += variation.dx;
                targetCenter.y = baseY + variation.dy;
                targetCenter.z += forwardDist + variation.dz;
            }

            const distance = forwardDist;

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

    updateComposite(configs) {
        const cfgs = Array.isArray(configs) ? configs : [];
        const sig = cfgs.map(cfg => `${this.signature(cfg.groups)}|m${cfg.mode || 'side'}`).join('||');
        if (sig !== this.lastCompositeSignature) {
            this.lastCompositeSignature = sig;
            this.clear();
            cfgs.forEach(cfg => {
                this.buildForGroups(cfg.groups, cfg.mode || 'side');
            });
        }

        if (this.enabled) {
            laserParty.globalAnimationSpeed = this.options.speed;
            laserParty.updateAll();
        }
    }

    getOptions() {
        return { ...this.options, enabled: this.enabled };
    }

    applyOptions(opts = {}) {
        if (typeof opts.enabled === 'boolean') this.setEnabled(opts.enabled);
        if (typeof opts.hue === 'number') this.setHue(opts.hue);
        if (typeof opts.speed === 'number') this.setSpeed(opts.speed);
        if (typeof opts.patternIndex === 'number') this.setPattern(opts.patternIndex);
        if (typeof opts.distance === 'number') this.setDistance(opts.distance);
        if (typeof opts.thickness === 'number') this.setThickness(opts.thickness);
        this.resetSignatures();
    }

    resetSignatures() {
        this.lastSignature = '';
        this.lastCompositeSignature = '';
    }
}
