/**
 * Sync Manager - Sincroniza estado entre dispositivos via WebSocket
 */
export class SyncManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.isController = false; // Mobile device acting as controller
        this.listeners = new Map();
    }

    async connect() {
        try {
            // Importa Socket.io dinamicamente
            const { io } = await import('https://cdn.socket.io/4.5.4/socket.io.esm.min.js');

            // Conecta ao servidor WebSocket (Vercel ou local)
            const socketUrl = window.location.origin;
            this.socket = io(socketUrl, {
                path: '/api/socket',
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to sync server');
                this.connected = true;

                // Detecta se é mobile (controlador)
                this.isController = window.innerWidth <= 900;

                if (this.isController) {
                    console.log('📱 Device mode: CONTROLLER (mobile)');
                } else {
                    console.log('🖥️ Device mode: DISPLAY (desktop)');
                }
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Disconnected from sync server');
                this.connected = false;
            });

            // Listen for control changes from other devices
            this.socket.on('control-change', (data) => {
                this.emit('control-change', data);
            });

            this.socket.on('led-scene', (data) => {
                this.emit('led-scene', data);
            });

            this.socket.on('light-scene', (data) => {
                this.emit('light-scene', data);
            });

            this.socket.on('camera-control', (data) => {
                this.emit('camera-control', data);
            });

            this.socket.on('music-control', (data) => {
                this.emit('music-control', data);
            });

            this.socket.on('audio-data', (data) => {
                this.emit('audio-data', data);
            });

            return true;
        } catch (error) {
            console.warn('⚠️ Sync server not available, running in standalone mode', error);
            return false;
        }
    }

    // Send control change to other devices
    sendControlChange(key, value) {
        if (!this.connected || !this.socket) return;

        this.socket.emit('control-change', { key, value });
    }

    // Send LED scene change
    sendLedScene(scene) {
        if (!this.connected || !this.socket) return;

        this.socket.emit('led-scene', { scene });
    }

    // Send light/laser scene change
    sendLightScene(scene) {
        if (!this.connected || !this.socket) return;

        this.socket.emit('light-scene', { scene });
    }

    // Send camera control
    sendCameraControl(action, data) {
        if (!this.connected || !this.socket) return;

        this.socket.emit('camera-control', { action, data });
    }

    // Send music control
    sendMusicControl(action, data) {
        if (!this.connected || !this.socket) return;

        this.socket.emit('music-control', { action, data });
    }

    // Send audio data (from mobile if it's playing audio)
    sendAudioData(audioData) {
        if (!this.connected || !this.socket) return;

        this.socket.emit('audio-data', audioData);
    }

    // Event listener pattern
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;

        this.listeners.get(event).forEach(callback => {
            callback(data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connected = false;
    }
}
