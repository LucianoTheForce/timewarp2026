/**
 * Audio System - Análise de áudio e detecção de beats
 */
export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = 0;
        this.audioElement = null;
        this.source = null;

        // Beat detection
        this.beatThreshold = 1.3;
        this.beatDecayRate = 0.98;
        this.beatMin = 0;
        this.beatCutOff = 0;
        this.beatTime = 0;

        // Audio data
        this.bass = 0;      // 0-255 (low frequencies)
        this.mid = 0;       // 0-255 (mid frequencies)
        this.treble = 0;    // 0-255 (high frequencies)
        this.volume = 0;    // 0-255 (overall volume)
        this.beat = false;  // true when beat detected

        // Smoothing
        this.smoothingFactor = 0.8;

        // Visualizer
        this.visualizerCanvas = null;
        this.visualizerCtx = null;

        // Music library
        this.musicFiles = [];
        this.currentTrack = null;
        this.isPlaying = false;
    }

    async init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create analyser
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;
            this.analyser.smoothingTimeConstant = this.smoothingFactor;

            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);

            // Create audio element
            this.audioElement = new Audio();
            this.audioElement.crossOrigin = "anonymous";

            // Connect audio element to analyser
            this.source = this.audioContext.createMediaElementSource(this.audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Setup visualizer
            this.setupVisualizer();

            console.log('Audio System initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Audio System:', error);
            return false;
        }
    }

    setupVisualizer() {
        this.visualizerCanvas = document.getElementById('audio-visualizer');
        if (this.visualizerCanvas) {
            this.visualizerCtx = this.visualizerCanvas.getContext('2d');
        }
    }

    async loadMusicLibrary() {
        // Scan music folder for audio files
        // In a real application, you'd use a server-side API to list files
        // For now, we'll provide a manual list that users can populate

        const musicFolder = './assets/musicas/';

        // Default tracks (user should add their own music files)
        this.musicFiles = [
            { name: 'Track 1', url: musicFolder + 'track1.mp3' },
            { name: 'Track 2', url: musicFolder + 'track2.mp3' },
            { name: 'Track 3', url: musicFolder + 'track3.mp3' },
        ];

        return this.musicFiles;
    }

    loadTrack(trackUrl) {
        if (!this.audioElement) return;

        this.audioElement.src = trackUrl;
        this.currentTrack = trackUrl;

        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    play() {
        if (!this.audioElement) return;

        this.audioElement.play().then(() => {
            this.isPlaying = true;
            if (this.visualizerCanvas) {
                this.visualizerCanvas.classList.add('active');
            }
        }).catch(err => {
            console.error('Error playing audio:', err);
        });
    }

    pause() {
        if (!this.audioElement) return;

        this.audioElement.pause();
        this.isPlaying = false;
    }

    stop() {
        if (!this.audioElement) return;

        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.isPlaying = false;
    }

    update() {
        if (!this.analyser || !this.dataArray) return;

        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate frequency ranges
        const bassEnd = Math.floor(this.bufferLength * 0.1);      // 0-10%
        const midEnd = Math.floor(this.bufferLength * 0.5);       // 10-50%
        const trebleEnd = this.bufferLength;                       // 50-100%

        // Calculate averages for each range
        this.bass = this.getAverage(this.dataArray, 0, bassEnd);
        this.mid = this.getAverage(this.dataArray, bassEnd, midEnd);
        this.treble = this.getAverage(this.dataArray, midEnd, trebleEnd);

        // Overall volume
        this.volume = this.getAverage(this.dataArray, 0, this.bufferLength);

        // Beat detection
        this.detectBeat();

        // Update visualizer
        this.drawVisualizer();
    }

    getAverage(array, start, end) {
        let sum = 0;
        for (let i = start; i < end; i++) {
            sum += array[i];
        }
        return sum / (end - start);
    }

    detectBeat() {
        const now = Date.now();

        // Only check for beats if enough time has passed
        if (now - this.beatTime < 100) {
            this.beat = false;
            return;
        }

        // Use bass frequencies for beat detection
        if (this.bass > this.beatCutOff && this.bass > this.beatThreshold * this.beatMin) {
            this.beat = true;
            this.beatTime = now;
            this.beatCutOff = this.bass * 1.1;
            this.beatMin = this.bass * 0.95;
        } else {
            this.beat = false;
            if (this.bass > this.beatMin) {
                this.beatMin = this.bass;
            }
            this.beatCutOff *= this.beatDecayRate;
            this.beatCutOff = Math.max(this.beatCutOff, 10);
        }
    }

    drawVisualizer() {
        if (!this.visualizerCtx || !this.visualizerCanvas) return;

        const width = this.visualizerCanvas.width;
        const height = this.visualizerCanvas.height;
        const ctx = this.visualizerCtx;

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);

        // Draw frequency bars
        const barWidth = width / this.bufferLength;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255) * height;

            // Color gradient based on frequency
            const hue = (i / this.bufferLength) * 120 + 100; // Green to cyan
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            x += barWidth;
        }

        // Draw beat indicator
        if (this.beat) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, 0, width, height);
        }
    }

    // Getters for normalized values (0-1)
    getBass() {
        return this.bass / 255;
    }

    getMid() {
        return this.mid / 255;
    }

    getTreble() {
        return this.treble / 255;
    }

    getVolume() {
        return this.volume / 255;
    }

    isBeat() {
        return this.beat;
    }

    getFrequencyData() {
        return {
            bass: this.getBass(),
            mid: this.getMid(),
            treble: this.getTreble(),
            volume: this.getVolume(),
            beat: this.isBeat()
        };
    }
}
