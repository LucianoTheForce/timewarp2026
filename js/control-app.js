class ControlApp {
    constructor() {
        this.currentCategory = null;
        this.init();
    }

    async init() {
        // Initialize background animation
        this.initBackground();

        // Wait a bit then hide loading
        await this.hideLoading();

        // Animate home screen entrance
        this.animateHomeEntrance();

        // Setup event listeners
        this.setupEventListeners();

        // Setup slider interactions
        this.setupSliders();

        // Setup vertical category slider
        this.setupVerticalSlider();

        // FPS Counter
        this.startFPSCounter();
    }

    initBackground() {
        const canvas = document.getElementById('bgCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
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

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    async hideLoading() {
        return new Promise(resolve => {
            gsap.to('#loading', {
                opacity: 0,
                duration: 0.6,
                ease: 'power2.inOut',
                onComplete: () => {
                    document.getElementById('loading').style.display = 'none';
                    resolve();
                }
            });
        });
    }

    animateHomeEntrance() {
        const timeline = gsap.timeline();

        // Animate close button
        timeline.to('.close-btn', {
            opacity: 0.8,
            duration: 0.6,
            ease: 'power2.out'
        });

        // Animate "Similar" text
        timeline.to('.similar-text', {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.3');

        // Animate slider items with stagger
        timeline.to('.slider-item', {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out'
        }, '-=0.4');

        // Animate gradient background
        timeline.to('.gradient-bg', {
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out'
        }, '-=0.6');
    }

    setupEventListeners() {
        // Category bubble clicks
        document.querySelectorAll('.category-bubble').forEach(bubble => {
            bubble.addEventListener('click', (e) => {
                const category = bubble.dataset.category;
                this.openCategory(category);
            });

            // Add hover effect
            bubble.addEventListener('mouseenter', () => {
                gsap.to(bubble, {
                    scale: 1.1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            bubble.addEventListener('mouseleave', () => {
                gsap.to(bubble, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Scene card clicks - LED Effects
        document.querySelectorAll('[data-led-effect]').forEach(card => {
            card.addEventListener('click', () => {
                // Remove active from all
                document.querySelectorAll('[data-led-effect]').forEach(c => c.classList.remove('active'));
                // Add active to clicked
                card.classList.add('active');

                // Animate click
                gsap.fromTo(card,
                    { scale: 0.9 },
                    { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' }
                );

                // TODO: Send to main app
                const effect = card.dataset.ledEffect;
                console.log('LED Effect:', effect);
                this.sendCommand('led-effect', effect);
            });
        });

        // Scene card clicks - Laser Effects
        document.querySelectorAll('[data-laser-effect]').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('[data-laser-effect]').forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                gsap.fromTo(card,
                    { scale: 0.9 },
                    { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' }
                );

                const effect = card.dataset.laserEffect;
                console.log('Laser Effect:', effect);
                this.sendCommand('laser-effect', effect);
            });
        });

        // Camera view buttons
        document.getElementById('view-front')?.addEventListener('click', () => {
            this.sendCommand('camera-view', 'front');
            this.flashButton('view-front');
        });

        document.getElementById('view-top')?.addEventListener('click', () => {
            this.sendCommand('camera-view', 'top');
            this.flashButton('view-top');
        });

        document.getElementById('view-side')?.addEventListener('click', () => {
            this.sendCommand('camera-view', 'side');
            this.flashButton('view-side');
        });

        document.getElementById('view-reset')?.addEventListener('click', () => {
            this.sendCommand('camera-view', 'reset');
            this.flashButton('view-reset');
        });

        // Camera movement
        ['cam-forward', 'cam-backward', 'cam-left', 'cam-right'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    const direction = id.replace('cam-', '');
                    this.sendCommand('camera-move', direction);
                    this.flashButton(id);
                });
            }
        });

        // Music controls
        document.getElementById('music-play')?.addEventListener('click', () => {
            this.sendCommand('music', 'play');
            this.flashButton('music-play');
        });

        document.getElementById('music-pause')?.addEventListener('click', () => {
            this.sendCommand('music', 'pause');
            this.flashButton('music-pause');
        });

        // Export config
        document.getElementById('export-config')?.addEventListener('click', () => {
            this.exportConfig();
            this.flashButton('export-config');
        });

        // Setup back buttons
        window.closeCategory = () => {
            this.closeCategory();
        };
    }

    setupSliders() {
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const displayId = slider.id + '-val';
            const display = document.getElementById(displayId);

            if (display) {
                slider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    display.textContent = value;

                    // Animate value change
                    gsap.fromTo(display,
                        { scale: 1.2, color: '#ff6b6b' },
                        { scale: 1, color: '#4ecdc4', duration: 0.3 }
                    );

                    // Send command
                    this.sendCommand('slider', { id: slider.id, value: parseFloat(value) });
                });
            }
        });

        // Setup toggles
        document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const isChecked = e.target.checked;

                // Animate toggle
                const toggleSlider = toggle.nextElementSibling;
                gsap.fromTo(toggleSlider,
                    { scale: 0.9 },
                    { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.5)' }
                );

                // Send command
                this.sendCommand('toggle', { id: toggle.id, value: isChecked });
            });
        });
    }

    openCategory(category) {
        this.currentCategory = category;
        const viewId = category + '-view';
        const view = document.getElementById(viewId);

        if (!view) return;

        // Animate home out
        gsap.to('#home', {
            opacity: 0,
            scale: 0.9,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                document.getElementById('home').style.pointerEvents = 'none';
            }
        });

        // Animate category view in
        view.classList.add('active');
        gsap.fromTo(view,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.2 }
        );

        // Animate category content
        const content = view.querySelector('.category-content');
        gsap.fromTo(content.children,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out',
                delay: 0.4
            }
        );
    }

    closeCategory() {
        if (!this.currentCategory) return;

        const viewId = this.currentCategory + '-view';
        const view = document.getElementById(viewId);

        // Animate view out
        gsap.to(view, {
            opacity: 0,
            y: 50,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                view.classList.remove('active');
            }
        });

        // Animate home in
        gsap.to('#home', {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power3.out',
            delay: 0.2,
            onStart: () => {
                document.getElementById('home').style.pointerEvents = 'all';
            }
        });

        this.currentCategory = null;
    }

    flashButton(btnId) {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        gsap.fromTo(btn,
            { scale: 0.95, backgroundColor: 'rgba(255, 107, 107, 0.3)' },
            { scale: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', duration: 0.3 }
        );
    }

    sendCommand(type, data) {
        // This will communicate with the main 3D app
        // For now, just log
        console.log('Command:', type, data);

        // TODO: Implement WebSocket or BroadcastChannel communication
        // window.parent.postMessage({ type, data }, '*');
    }

    exportConfig() {
        const config = {
            timestamp: new Date().toISOString(),
            towers: document.getElementById('tower-count')?.value,
            ledIntensity: document.getElementById('led-intensity')?.value,
            // Add all other parameters
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'palco-config-' + Date.now() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success animation
        gsap.fromTo('.stats-badge',
            { scale: 1.2, backgroundColor: 'rgba(78, 205, 196, 0.5)' },
            { scale: 1, backgroundColor: 'rgba(10, 10, 21, 0.9)', duration: 0.5 }
        );
    }

    startFPSCounter() {
        let lastTime = performance.now();
        let frames = 0;
        let fps = 60;

        const updateFPS = () => {
            frames++;
            const now = performance.now();

            if (now >= lastTime + 1000) {
                fps = Math.round((frames * 1000) / (now - lastTime));
                document.getElementById('fps-counter').textContent = fps;
                frames = 0;
                lastTime = now;
            }

            requestAnimationFrame(updateFPS);
        };

        updateFPS();
    }

    setupVerticalSlider() {
        const sliderContainer = document.querySelector('.slider-container');
        const sliderTrack = document.getElementById('sliderTrack');
        const originalItems = Array.from(document.querySelectorAll('.slider-item'));

        if (!sliderContainer || !sliderTrack || originalItems.length === 0) return;

        const itemCount = originalItems.length;
        let rotation = 0; // Current rotation angle
        let targetRotation = 0;
        let isDragging = false;
        let isActuallyDragging = false;
        let startY = 0;
        let lastY = 0;
        let velocity = 0;
        let lastTime = Date.now();

        // Radius of the wheel (distance from center)
        const radius = 300;
        const angleStep = (2 * Math.PI) / itemCount; // 360 degrees / number of items

        // Position items on the 3D wheel
        const updateWheel = () => {
            originalItems.forEach((item, index) => {
                // Calculate angle for this item (infinite rotation)
                const angle = rotation + (index * angleStep);

                // Calculate 3D position on the wheel
                const y = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius;

                // Calculate scale based on Z position (closer = bigger)
                const scale = 0.5 + (z + radius) / (radius * 2) * 0.5;

                // Calculate opacity based on position
                const opacity = Math.max(0.2, Math.min(1, (z + radius) / (radius * 1.5)));

                // Determine size class based on position
                // Item closest to front (z closest to radius) is center
                const distanceFromFront = Math.abs(Math.cos(angle) - 1);

                // Remove all classes
                item.classList.remove('tiny', 'small', 'center');

                // Add appropriate class
                if (distanceFromFront < 0.3) {
                    item.classList.add('center');
                } else if (distanceFromFront < 0.8) {
                    item.classList.add('small');
                } else {
                    item.classList.add('tiny');
                }

                // Apply 3D transform
                gsap.set(item, {
                    y: y,
                    z: z,
                    scale: scale,
                    opacity: opacity,
                    rotateX: 0,
                    zIndex: Math.round(z)
                });
            });
        };

        // Animation loop
        const animate = () => {
            // Smooth rotation towards target
            rotation += (targetRotation - rotation) * 0.1;

            // Apply velocity decay when not dragging
            if (!isDragging && Math.abs(velocity) > 0.001) {
                targetRotation += velocity;
                velocity *= 0.95; // Friction
            }

            updateWheel();
            requestAnimationFrame(animate);
        };

        // Handle touch/mouse start
        const handleStart = (e) => {
            isDragging = true;
            isActuallyDragging = false;
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            lastY = startY;
            lastTime = Date.now();
            velocity = 0;

            if (e.type.includes('mouse')) {
                sliderContainer.style.cursor = 'grabbing';
            }
        };

        // Handle touch/mouse move
        const handleMove = (e) => {
            if (!isDragging) return;

            const now = Date.now();
            const deltaTime = now - lastTime;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const deltaY = currentY - lastY;
            const totalDelta = currentY - startY;

            // Mark as actually dragging if moved more than 5px
            if (Math.abs(totalDelta) > 5) {
                isActuallyDragging = true;
                e.preventDefault();
                e.stopPropagation();
            }

            if (!isActuallyDragging) return;

            // Calculate velocity for momentum
            if (deltaTime > 0) {
                velocity = (deltaY / deltaTime) * 0.01; // Convert to rotation velocity
            }

            // Rotate the wheel based on drag
            targetRotation -= deltaY * 0.005; // Sensitivity

            lastY = currentY;
            lastTime = now;
        };

        // Handle touch/mouse end
        const handleEnd = () => {
            if (!isDragging) return;

            const wasDragging = isActuallyDragging;
            isDragging = false;
            isActuallyDragging = false;
            sliderContainer.style.cursor = 'grab';

            if (!wasDragging) {
                // Was a click - snap to nearest item
                const nearestAngle = Math.round(targetRotation / angleStep) * angleStep;
                targetRotation = nearestAngle;
                velocity = 0;
                return;
            }

            // Apply momentum and snap to nearest
            targetRotation += velocity * 50;
            const nearestAngle = Math.round(targetRotation / angleStep) * angleStep;
            targetRotation = nearestAngle;
        };

        // Click on slider items
        originalItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                // Don't handle click if it was part of a drag
                if (isActuallyDragging) return;

                // Check if this item is currently centered
                const angle = rotation + (index * angleStep);
                const distanceFromFront = Math.abs(Math.cos(angle) - 1);

                if (distanceFromFront < 0.3) {
                    // Open category view
                    const category = item.dataset.category || 'stage-views';
                    this.openCategory(category);
                } else {
                    // Snap to this item
                    const targetAngle = -(index * angleStep);
                    targetRotation = targetAngle;
                    velocity = 0;
                }
            });
        });

        // Mouse events
        sliderContainer.addEventListener('mousedown', handleStart);
        sliderContainer.addEventListener('mousemove', handleMove);
        sliderContainer.addEventListener('mouseup', handleEnd);
        sliderContainer.addEventListener('mouseleave', handleEnd);

        // Touch events
        sliderContainer.addEventListener('touchstart', handleStart, { passive: false });
        sliderContainer.addEventListener('touchmove', handleMove, { passive: false });
        sliderContainer.addEventListener('touchend', handleEnd);
        sliderContainer.addEventListener('touchcancel', handleEnd);

        // Mouse wheel support (infinite)
        sliderContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Rotate wheel based on scroll
            targetRotation -= e.deltaY * 0.002;

            // Snap to nearest item
            const nearestAngle = Math.round(targetRotation / angleStep) * angleStep;
            targetRotation = nearestAngle;
            velocity = 0;
        }, { passive: false });

        // Initial setup
        sliderContainer.style.cursor = 'grab';

        // Start animation loop
        animate();
    }
}

// Initialize app
new ControlApp();
