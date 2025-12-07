/**
 * Sync Manager - WebSocket broadcast between control (mobile) and stage (desktop)
 * Uses native WebSocket talking to the Edge function at /api/socket.
 */
export class SyncManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.isController = false; // Mobile device acting as controller
        this.listeners = new Map();
        this.reconnectTimer = null;
    }

    async connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/socket`;

        return new Promise((resolve) => {
            try {
                this.socket = new WebSocket(wsUrl);
            } catch (error) {
                console.warn('Sync server not available, running standalone', error);
                resolve(false);
                return;
            }

            let resolved = false;
            const finish = (ok) => {
                if (resolved) return;
                resolved = true;
                resolve(ok);
            };

            this.socket.addEventListener('open', () => {
                console.log('Connected to sync server (WebSocket)');
                this.connected = true;
                this.isController = window.innerWidth <= 900;
                finish(true);
            });

            this.socket.addEventListener('close', () => {
                this.connected = false;
                this.scheduleReconnect();
                finish(false);
            });

            this.socket.addEventListener('error', (err) => {
                console.warn('Sync socket error', err);
                this.connected = false;
                try {
                    this.socket.close();
                } catch (e) {
                    /* ignore */
                }
            });

            this.socket.addEventListener('message', (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    if (!payload || !payload.type) return;
                    this.emit(payload.type, payload.data);
                } catch (e) {
                    console.warn('Invalid sync message', e);
                }
            });
        });
    }

    // Send control change to other devices
    sendControlChange(key, value) {
        this.sendMessage('control-change', { key, value });
    }

    // Send LED scene change
    sendLedScene(scene) {
        this.sendMessage('led-scene', { scene });
    }

    // Send light/laser scene change
    sendLightScene(scene) {
        this.sendMessage('light-scene', { scene });
    }

    // Send camera control
    sendCameraControl(action, data) {
        this.sendMessage('camera-control', { action, data });
    }

    // Send music control
    sendMusicControl(action, data) {
        this.sendMessage('music-control', { action, data });
    }

    // Send audio data (from mobile if it's playing audio)
    sendAudioData(audioData) {
        this.sendMessage('audio-data', audioData);
    }

    sendMessage(type, data) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        const payload = JSON.stringify({ type, data });
        this.socket.send(payload);
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

        this.listeners.get(event).forEach((callback) => {
            callback(data);
        });
    }

    scheduleReconnect() {
        if (this.reconnectTimer) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, 2000);
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket) {
            try {
                this.socket.close();
            } catch (e) {
                /* ignore */
            }
            this.socket = null;
        }
        this.connected = false;
    }
}
