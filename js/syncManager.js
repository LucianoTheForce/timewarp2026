/**
 * Sync Manager - usa Upstash Redis (polling REST) para sincronizar control/stage
 */
export class SyncManager {
    constructor() {
        this.connected = false;
        this.isController = false;
        this.listeners = new Map();
        this.cursor = null;
        this.pollTimer = null;
    }

    async connect() {
        this.isController = window.innerWidth <= 900;

        // Evita spam no dev local se as rotas /api nao estiverem disponiveis
        if (window.location.hostname === 'localhost') {
            console.warn('SyncManager desativado em localhost (sem /api/events)');
            this.connected = false;
            return false;
        }

        await this.initCursor();
        this.connected = true;
        this.startPolling();
        return true;
    }

    async initCursor() {
        try {
            const res = await fetch('/api/events');
            const data = await res.json();
            this.cursor = data.cursor || '0-0';
        } catch (err) {
            console.warn('Failed to init cursor', err);
            this.cursor = '0-0';
        }
    }

    startPolling() {
        if (!this.connected) return;
        const poll = async () => {
            try {
                const url = `/api/events?cursor=${encodeURIComponent(this.cursor || '')}`;
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) throw new Error('poll failed');
                const payload = await res.json();
                if (payload.cursor) this.cursor = payload.cursor;

                if (Array.isArray(payload.events)) {
                    payload.events.forEach((evt) => {
                        if (evt && evt.payload && evt.payload.type) {
                            this.emit(evt.payload.type, evt.payload.data);
                        }
                    });
                }
            } catch (err) {
                // ignore and retry
            } finally {
                if (this.connected) {
                    this.pollTimer = setTimeout(poll, 800);
                }
            }
        };

        poll();
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

    disconnect() {
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
        this.connected = false;
    }
}
