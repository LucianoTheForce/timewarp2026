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
            pattern: 'cross', // cross = horizontal + vertical
            hue: 120,
            speed: 1,
            distance: 80,
            thickness: 1
        };

        this.lasers = [];
        this.lastSignature = '';
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

    setPattern(pattern) {
        this.options.pattern = pattern;
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
        return towersGroup.children.map((c) => `${c.position.x.toFixed(2)},${c.position.y.toFixed(2)},${c.position.z.toFixed(2)}`).join('|');
    }

    buildFromTowers(towersGroup) {
        this.clear();
        if (!this.enabled || !towersGroup) return;

        const distance = this.options.distance;
        const thickness = this.options.thickness;
        const hue = this.options.hue;
        const speed = this.options.speed;

        towersGroup.children.forEach((tower, idx) => {
            if (idx % 2 !== 0) return; // uma torre sim, outra não

            const box = new THREE.Box3().setFromObject(tower);
            if (!isFinite(box.max.y)) return;
            const center = box.getCenter(new THREE.Vector3());
            const baseY = box.max.y;

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
                    animation: this.options.pattern === 'spin' ? 'exampleSpin' : null,
                    colorAnimation: this.options.pattern === 'hue-shift' ? 'exampleHue' : null
                });
                laser.position.set(center.x, baseY, center.z);
                this.lasers.push(laser);
            };

            // vertical (subindo)
            createLaser(-Math.PI / 2, 0);
            // horizontal (para frente +Z)
            createLaser(0, 0);
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
