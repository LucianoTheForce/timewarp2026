class SwipeController {
    constructor(container, direction = 'vertical', onIndexChange = null) {
        this.container = container;
        this.wrapper = container.querySelector('.swiper-wrapper');
        this.slides = Array.from(this.wrapper.children);
        this.direction = direction;
        this.onIndexChange = onIndexChange;

        this.state = {
            currentOffset: 0,
            targetOffset: 0,
            isDragging: false,
            startPos: 0,
            currentPos: 0,
            startTime: 0,
            currentIndex: 0
        };

        this.config = {
            friction: 0.92,
            sensitivity: 1.5,
            threshold: 50 // Pixel threshold to change slide
        };

        this.init();
    }

    init() {
        // Set initial styles
        this.updateLayout();

        // Event Listeners
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.onTouchEnd.bind(this));

        // Mouse support for testing
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Start animation loop
        this.animate();

        // Mark initial slide as active
        this.updateActiveSlide(0);
    }

    updateLayout() {
        this.slideSize = this.direction === 'vertical' ? this.container.clientHeight : this.container.clientWidth;
        this.maxOffset = (this.slides.length - 1) * this.slideSize;
    }

    getPos(e) {
        return this.direction === 'vertical' ? e.clientY : e.clientX;
    }

    onTouchStart(e) {
        this.startDrag(this.getPos(e.touches[0]));
    }

    onTouchMove(e) {
        if (this.state.isDragging) {
            e.preventDefault(); // Prevent scrolling
            this.updateDrag(this.getPos(e.touches[0]));
        }
    }

    onTouchEnd() {
        this.endDrag();
    }

    onMouseDown(e) {
        this.startDrag(this.getPos(e));
    }

    onMouseMove(e) {
        if (this.state.isDragging) {
            e.preventDefault();
            this.updateDrag(this.getPos(e));
        }
    }

    onMouseUp() {
        this.endDrag();
    }

    startDrag(pos) {
        this.state.isDragging = true;
        this.state.startPos = pos;
        this.state.currentPos = pos;
        this.state.startTime = Date.now();

        // Zoom out effect
        gsap.to(this.slides[this.state.currentIndex], {
            scale: 0.9,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    updateDrag(pos) {
        const delta = (this.state.startPos - pos) * this.config.sensitivity;
        this.state.targetOffset = (this.state.currentIndex * this.slideSize) + delta;
        this.state.currentPos = pos;
    }

    endDrag() {
        if (!this.state.isDragging) return;
        this.state.isDragging = false;

        // Calculate swipe direction and velocity
        const delta = this.state.startPos - this.state.currentPos;
        const time = Date.now() - this.state.startTime;
        const velocity = Math.abs(delta / time);

        // Determine next index
        let nextIndex = this.state.currentIndex;

        if (Math.abs(delta) > this.config.threshold || velocity > 0.5) {
            if (delta > 0 && this.state.currentIndex < this.slides.length - 1) {
                nextIndex++;
            } else if (delta < 0 && this.state.currentIndex > 0) {
                nextIndex--;
            }
        }

        this.snapTo(nextIndex);
    }

    snapTo(index) {
        this.state.currentIndex = index;
        const target = index * this.slideSize;

        // Animate to target
        gsap.to(this.state, {
            targetOffset: target,
            duration: 0.5,
            ease: 'power3.out',
            onUpdate: () => {
                // Keep targetOffset updated for the render loop
            }
        });

        this.updateActiveSlide(index);

        if (this.onIndexChange) {
            this.onIndexChange(index, this.slides[index]);
        }
    }

    updateActiveSlide(index) {
        // Zoom in effect and active class
        this.slides.forEach((slide, i) => {
            const isActive = i === index;

            if (isActive) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }

            gsap.to(slide, {
                scale: isActive ? 1 : 0.9,
                opacity: isActive ? 1 : 0.5,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    }

    animate() {
        // Smooth interpolation
        this.state.currentOffset += (this.state.targetOffset - this.state.currentOffset) * 0.1;

        // Apply transform
        const transform = this.direction === 'vertical'
            ? `translate3d(0, -${this.state.currentOffset}px, 0)`
            : `translate3d(-${this.state.currentOffset}px, 0, 0)`;

        this.wrapper.style.transform = transform;

        requestAnimationFrame(this.animate.bind(this));
    }
}

class ControlApp {
    constructor() {
        this.init();
    }

    async init() {
        this.initBackground();
        await this.hideLoading();
        this.setupSwipers();
        this.setupEventListeners();
        this.startFPSCounter();
        this.notifyControlOpen();
    }

    startFPSCounter() {
        let lastTime = performance.now();
        let frames = 0;
        const fpsEl = document.getElementById('fps-counter');

        const update = () => {
            const now = performance.now();
            frames++;
            if (now >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (now - lastTime));
                if (fpsEl) fpsEl.textContent = fps + ' FPS';
                frames = 0;
                lastTime = now;
            }
            requestAnimationFrame(update);
        };
        update();
    }

    setupSwipers() {
        // Main Vertical Swiper
        const mainSwiperEl = document.getElementById('main-swiper');
        this.verticalSwiper = new SwipeController(mainSwiperEl, 'vertical', (index, slide) => {
            console.log('Category changed to:', slide.dataset.category);
            // Optional: Haptic feedback
        });

        // Horizontal Swipers
        this.horizontalSwipers = [];
        document.querySelectorAll('.swiper-container.horizontal').forEach(el => {
            const swiper = new SwipeController(el, 'horizontal', (index, slide) => {
                // Auto-trigger command on slide change
                this.handleSlideActivation(slide);
            });
            this.horizontalSwipers.push(swiper);

            // Prevent vertical scroll when dragging horizontal
            el.addEventListener('touchstart', (e) => e.stopPropagation());
            el.addEventListener('touchmove', (e) => e.stopPropagation());
        });

        // Handle resize
        window.addEventListener('resize', () => {
            this.verticalSwiper.updateLayout();
            this.horizontalSwipers.forEach(s => s.updateLayout());
        });
    }

    handleSlideActivation(slide) {
        const command = slide.dataset.command;
        const value = slide.dataset.value;

        if (command && value) {
            // Visual feedback on the icon
            const icon = slide.querySelector('.option-icon');
            if (icon) {
                gsap.fromTo(icon,
                    { scale: 1.4, rotate: -10 },
                    { scale: 1.2, rotate: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' }
                );
            }

            this.sendCommand(command, value);
        }
    }

    initBackground() {
        const canvas = document.getElementById('bgCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(78, 205, 196, 0.5)';
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();
    }

    async hideLoading() {
        return new Promise(resolve => {
            gsap.to('#loading', {
                opacity: 0,
                duration: 0.6,
                onComplete: () => {
                    document.getElementById('loading').style.display = 'none';
                    resolve();
                }
            });
        });
    }

    setupEventListeners() {
        // Buttons (for Music/Camera controls that are still buttons)
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.2 });
                if (btn.id.startsWith('cam-')) this.sendCommand('camera-move', btn.id.replace('cam-', ''));
                if (btn.id === 'music-play') this.sendCommand('music', 'play');
                if (btn.id === 'music-pause') this.sendCommand('music', 'pause');
                if (btn.id === 'export-config') this.exportConfig();
            });
        });

        // Sliders
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const display = document.getElementById(slider.id + '-val');
            if (display) {
                slider.addEventListener('input', (e) => {
                    display.textContent = e.target.value;
                    this.sendCommand('slider', { id: slider.id, value: e.target.value });
                });
            }
        });

        // Toggles
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.sendCommand('toggle', { id: toggle.id, value: e.target.checked });
            });
        });
    }

    sendCommand(type, data) {
        console.log('Command:', type, data);
        // Implement actual communication here
        // window.parent.postMessage({ type, data }, '*');
    }

    exportConfig() {
        console.log('Exporting config...');
    }

    notifyControlOpen() {
        try { navigator.sendBeacon('/api/emit', JSON.stringify({ type: 'control-open' })); } catch (e) { }
    }
}

new ControlApp();
