/**
 * Sync Manager - usa Upstash Redis (SSE + REST) para sincronizar control/stage
 */
export class SyncManager {
    constructor() {
        this.connected = false;
        this.isController = false;
        this.listeners = new Map();
        this.eventSource = null;
        this.reconnectTimer = null;
    }

    async connect() {
        this.isController = window.innerWidth <= 900;
        this.openEventSource();
        return true;
    }

    openEventSource() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        try {
            this.eventSource = new EventSource('/api/events');
        } catch (err) {
            console.warn('Failed to open event stream', err);
            this.scheduleReconnect();
            return;
        }

        this.eventSource.addEventListener('open', () => {
            this.connected = true;
        });

        this.eventSource.addEventListener('error', () => {
            this.connected = false;
            this.scheduleReconnect();
        });

        this.eventSource.addEventListener('message', (event) => {
            if (!event.data) return;
            try {
                const payload = JSON.parse(event.data);
                if (!payload || !payload.type) return;
                this.emit(payload.type, payload.data);
            } catch (e) {
                // ignore invalid message
            }
        });
    }

    async sendMessage(type, data) {
        try {
            await fetch('/api/emit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, data })
            });
        } catch (err) {
            console.warn('Failed to emit message', err);
        }
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
            this.openEventSource();
        }, 2000);
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.connected = false;
    }
}
