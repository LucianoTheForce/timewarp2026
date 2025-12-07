// GSAP is loaded via CDN in the HTML file

class ControlApp {
    constructor() {
        this.currentCategory = null;
        this.waitForGSAP();
    }

    async waitForGSAP() {
        // Wait for GSAP to load
        if (typeof gsap === 'undefined') {
            setTimeout(() => this.waitForGSAP(), 50);
            return;
        }
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

        // Animate logo
        timeline.to('.logo', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        });

        // Animate subtitle
        timeline.to('.subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.5');

        // Animate bubbles with stagger
        timeline.to('.category-bubble', {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'elastic.out(1, 0.5)'
        }, '-=0.4');

        // Add floating animation to bubbles
        gsap.to('.category-bubble', {
            y: '+=10',
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            stagger: {
                each: 0.2,
                from: 'random'
            }
        });
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

                // Send to main app
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
        if (content) {
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
        console.log('Command:', type, data);

        // Use postMessage to communicate with parent window or iframe
        if (window.opener) {
            window.opener.postMessage({ type, data }, '*');
        } else if (window.parent !== window) {
            window.parent.postMessage({ type, data }, '*');
        }

        // Also broadcast to same origin
        const bc = new BroadcastChannel('palco-control');
        bc.postMessage({ type, data });
    }

    exportConfig() {
        const config = {
            timestamp: new Date().toISOString(),
            towers: document.getElementById('tower-count')?.value,
            ledIntensity: document.getElementById('led-intensity')?.value,
            animationSpeed: document.getElementById('animation-speed')?.value,
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
        const badge = document.querySelector('.stats-badge');
        if (badge) {
            gsap.fromTo(badge,
                { scale: 1.2, backgroundColor: 'rgba(78, 205, 196, 0.5)' },
                { scale: 1, backgroundColor: 'rgba(10, 10, 21, 0.9)', duration: 0.5 }
            );
        }
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
                const counter = document.getElementById('fps-counter');
                if (counter) {
                    counter.textContent = fps;
                }
                frames = 0;
                lastTime = now;
            }

            requestAnimationFrame(updateFPS);
        };

        updateFPS();
    }
}

// Initialize app
new ControlApp();
