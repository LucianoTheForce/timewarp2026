import * as THREE from 'three';

export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.ambientLight = null;
        this.spotlights = [];
        this.time = 0;
    }
    
    setupLighting() {
        // Ambient light - mais forte para ver melhor
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        // Main directional light (simulates sun/moon)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Front fill lights
        const frontLight1 = new THREE.SpotLight(0xffffff, 1.5, 50, Math.PI / 4, 0.3, 2);
        frontLight1.position.set(-10, 15, 15);
        frontLight1.target.position.set(0, 2, 0);
        frontLight1.castShadow = true;
        this.scene.add(frontLight1);
        this.scene.add(frontLight1.target);
        this.spotlights.push(frontLight1);
        
        const frontLight2 = new THREE.SpotLight(0xffffff, 1.5, 50, Math.PI / 4, 0.3, 2);
        frontLight2.position.set(10, 15, 15);
        frontLight2.target.position.set(0, 2, 0);
        frontLight2.castShadow = true;
        this.scene.add(frontLight2);
        this.scene.add(frontLight2.target);
        this.spotlights.push(frontLight2);
        
        // Back lights
        const backLight1 = new THREE.SpotLight(0xff00ff, 1.0, 40, Math.PI / 3, 0.5, 2);
        backLight1.position.set(-8, 12, -10);
        backLight1.target.position.set(0, 0, 0);
        this.scene.add(backLight1);
        this.scene.add(backLight1.target);
        this.spotlights.push(backLight1);
        
        const backLight2 = new THREE.SpotLight(0x00ffff, 1.0, 40, Math.PI / 3, 0.5, 2);
        backLight2.position.set(8, 12, -10);
        backLight2.target.position.set(0, 0, 0);
        this.scene.add(backLight2);
        this.scene.add(backLight2.target);
        this.spotlights.push(backLight2);
        
        // Ground bounce light
        const groundLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.3);
        this.scene.add(groundLight);
        
        // Rim lights for edge definition
        const rimLight1 = new THREE.PointLight(0xffffff, 0.8, 30);
        rimLight1.position.set(-12, 8, 0);
        this.scene.add(rimLight1);
        
        const rimLight2 = new THREE.PointLight(0xffffff, 0.8, 30);
        rimLight2.position.set(12, 8, 0);
        this.scene.add(rimLight2);
        
        console.log('Lighting system initialized with', this.spotlights.length, 'spotlights');
    }
    
    setAmbientIntensity(intensity) {
        if (this.ambientLight) {
            this.ambientLight.intensity = intensity;
        }
    }
    
    setSpotlightIntensity(intensity) {
        this.spotlights.forEach(light => {
            light.intensity = intensity;
        });
    }
    
    update(delta) {
        this.time += delta;
        
        // Optional: Add subtle lighting animations
        // You can animate the spotlight colors or positions here
    }
    
    getConfig() {
        return {
            ambientIntensity: this.ambientLight ? this.ambientLight.intensity : 0,
            spotlightIntensity: this.spotlights.length > 0 ? this.spotlights[0].intensity : 0,
            spotlightCount: this.spotlights.length
        };
    }
}