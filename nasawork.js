/**
 * MISSION ARCHIVE - Command Console
 * Interactive functionality for the NASA-core mission interface
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        typingSpeed: 50,
        cursorBlinkInterval: 530,
        scanLineSpeed: 20,
        glitchProbability: 0.02,
        glitchDuration: 150
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    const utils = {
        // Random integer between min and max
        randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

        // Random item from array
        randomItem: (arr) => arr[Math.floor(Math.random() * arr.length)],

        // Debounce function
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Sleep/delay promise
        sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
    };

    // ============================================
    // TYPING EFFECT
    // ============================================

    class TypewriterEffect {
        constructor(element, text, speed = CONFIG.typingSpeed) {
            this.element = element;
            this.text = text;
            this.speed = speed;
            this.currentIndex = 0;
            this.isTyping = false;
        }

        async type() {
            if (this.isTyping) return;
            this.isTyping = true;
            this.element.textContent = '';

            for (let i = 0; i < this.text.length; i++) {
                this.element.textContent += this.text[i];
                await utils.sleep(this.speed);
            }

            this.isTyping = false;
        }

        reset() {
            this.currentIndex = 0;
            this.isTyping = false;
            this.element.textContent = '';
        }
    }

    // ============================================
    // GLITCH EFFECT
    // ============================================

    class GlitchEffect {
        constructor() {
            this.glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
            this.init();
        }

        init() {
            // Apply glitch to mission names on hover
            const missionNames = document.querySelectorAll('.mission-name');

            missionNames.forEach(name => {
                const originalText = name.textContent;

                name.addEventListener('mouseenter', () => {
                    this.triggerGlitch(name, originalText);
                });
            });
        }

        triggerGlitch(element, originalText) {
            if (Math.random() > CONFIG.glitchProbability) return;

            const iterations = 3;
            let count = 0;

            const glitchInterval = setInterval(() => {
                element.textContent = originalText
                    .split('')
                    .map((char, index) => {
                        if (index < count) return originalText[index];
                        return utils.randomItem(this.glitchChars.split(''));
                    })
                    .join('');

                count += originalText.length / iterations;

                if (count >= originalText.length) {
                    clearInterval(glitchInterval);
                    element.textContent = originalText;
                }
            }, CONFIG.glitchDuration / iterations);
        }
    }

    // ============================================
    // SCAN LINE ANIMATION
    // ============================================

    class ScanLineAnimator {
        constructor() {
            this.scanLine = null;
            this.isActive = false;
            this.intervalId = null;
            this.init();
        }

        init() {
            // Create scan line element
            this.scanLine = document.createElement('div');
            this.scanLine.className = 'dynamic-scan-line';
            document.body.appendChild(this.scanLine);
        }

        start() {
            if (this.isActive) return;
            this.isActive = true;

            // Trigger first animation immediately
            this.trigger();

            // Schedule subsequent animations every 3 minutes (180,000 ms)
            this.intervalId = setInterval(() => {
                this.trigger();
            }, 180000);
        }

        trigger() {
            if (!this.isActive) return;

            const duration = 4000;

            // Reset position
            this.scanLine.style.transition = 'none';
            this.scanLine.style.top = '0';
            this.scanLine.style.opacity = '0';

            // Force reflow to ensure the transition is applied correctly
            this.scanLine.offsetHeight;

            // Start animation
            this.scanLine.style.transition = `top ${duration}ms linear, opacity 300ms ease`;
            this.scanLine.style.opacity = '1';

            setTimeout(() => {
                this.scanLine.style.top = '100vh';
            }, 50);

            setTimeout(() => {
                this.scanLine.style.opacity = '0';
            }, duration);
        }

        stop() {
            this.isActive = false;
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
    }

    // ============================================
    // MISSION CARD INTERACTIONS
    // ============================================

    class MissionCardHandler {
        constructor() {
            this.cards = document.querySelectorAll('.mission-card');
            this.init();
        }

        init() {
            this.cards.forEach(card => {
                this.setupCardInteractions(card);
            });
        }

        setupCardInteractions(card) {
            const btn = card.querySelector('.initialize-btn');
            const missionName = card.querySelector('.mission-name').textContent;
            const missionId = card.dataset.mission;

            // Button click handler
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.initializeMission(card, missionName, missionId);
            });

            // Card hover sound effect (visual feedback)
            card.addEventListener('mouseenter', () => {
                this.onCardHover(card, true);
            });

            card.addEventListener('mouseleave', () => {
                this.onCardHover(card, false);
            });
        }

        onCardHover(card, isHovering) {
            const hudElements = card.querySelectorAll('.hud-coords');

            hudElements.forEach(el => {
                el.style.transition = 'color 0.3s ease';
                el.style.color = isHovering ? 'rgba(255, 255, 255, 0.5)' : '#4A4A4A';
            });
        }

        async initializeMission(card, missionName, missionId) {
            const btn = card.querySelector('.initialize-btn');
            const btnText = btn.querySelector('.btn-text');
            const originalText = btnText.textContent;

            // Mission ID to URL mapping
            const missionUrls = {
                '03': 'myfitnesspal.html',
                '02': 'khiaro.html',
                '01': 'verso.html'
            };

            // Disable button
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';

            // Loading state
            btnText.textContent = 'INITIALIZING...';
            btn.style.borderColor = '#00FF88';

            // Simulate initialization sequence
            await utils.sleep(800);

            // Success state
            btnText.textContent = 'MISSION ACTIVE';
            btn.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';
            btn.style.borderColor = '#00FF88';

            // Log to console (mission control style)
            console.log(`%c[MISSION CONTROL] ${missionName} (ID: ${missionId}) initialized successfully`,
                'color: #00FF88; font-family: monospace; font-weight: bold;');

            // Brief delay to allow user to see "MISSION ACTIVE" before navigation
            await utils.sleep(500);

            // Navigate to the project page
            const url = missionUrls[missionId];
            if (url) {
                window.location.href = url;
            } else {
                console.error(`Unknown mission ID: ${missionId}`);
                // Reset button if navigation fails
                btnText.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                btn.disabled = false;
                btn.style.cursor = '';
            }
        }
    }

    // ============================================
    // STATUS PANEL UPDATER
    // ============================================

    class StatusPanelUpdater {
        constructor() {
            this.statusPanel = document.querySelector('.status-panel');
            this.init();
        }

        init() {
            // Update T-MINUS timer
            this.updateTimer();
            setInterval(() => this.updateTimer(), 1000);

            // Random coordinate updates
            this.startCoordinateUpdates();
        }

        updateTimer() {
            const timerElement = document.querySelector('.corner-marker.bottom-right .coords');
            if (timerElement) {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                timerElement.textContent = `T-MINUS ${hours}:${minutes}:${seconds}`;
            }
        }

        startCoordinateUpdates() {
            const coords = document.querySelectorAll('.corner-marker .coords');

            setInterval(() => {
                coords.forEach(coord => {
                    if (coord.textContent.includes('°')) {
                        // Slight coordinate drift for realism
                        const baseCoord = parseFloat(coord.textContent);
                        if (!isNaN(baseCoord)) {
                            const drift = (Math.random() - 0.5) * 0.0001;
                            const newCoord = (baseCoord + drift).toFixed(4);
                            const direction = coord.textContent.includes('N') ? 'N' : 'W';
                            coord.textContent = `${newCoord}° ${direction}`;
                        }
                    }
                });
            }, 5000);
        }
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================

    class KeyboardHandler {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('keydown', (e) => {
                this.handleKeyPress(e);
            });
        }

        handleKeyPress(e) {
            // Number keys 1-3 to focus/select missions
            if (e.key >= '1' && e.key <= '3') {
                const missionIndex = parseInt(e.key) - 1;
                const cards = document.querySelectorAll('.mission-card');

                if (cards[missionIndex]) {
                    cards[missionIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    cards[missionIndex].style.borderColor = '#FFFFFF';
                    setTimeout(() => {
                        cards[missionIndex].style.borderColor = '';
                    }, 1000);
                }
            }

            // 'H' key to scroll to hero
            if (e.key === 'h' || e.key === 'H') {
                document.querySelector('.hero-section').scrollIntoView({ behavior: 'smooth' });
            }

            // 'Enter' on focused button
            if (e.key === 'Enter' && document.activeElement.classList.contains('initialize-btn')) {
                document.activeElement.click();
            }
        }
    }

    // ============================================
    // PARALLAX EFFECT
    // ============================================

    class ParallaxEffect {
        constructor() {
            this.codeBlocks = document.querySelectorAll('.code-decoration');
            this.isTouch = window.matchMedia('(pointer: coarse)').matches;
            this.init();
        }

        init() {
            if (this.isTouch) return; // Disable on touch devices

            document.addEventListener('mousemove', utils.debounce((e) => {
                this.handleMouseMove(e);
            }, 16));
        }

        handleMouseMove(e) {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;

            this.codeBlocks.forEach((block, index) => {
                const speed = (index + 1) * 10;
                const x = mouseX * speed;
                const y = mouseY * speed;
                block.style.transform = `translate(${x}px, ${y}px)`;
                block.style.transition = 'transform 0.3s ease-out';
            });
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    class MissionArchive {
        constructor() {
            this.components = {};
        }

        init() {
            // Initialize all components
            this.components.glitch = new GlitchEffect();
            this.components.missionCards = new MissionCardHandler();
            this.components.statusPanel = new StatusPanelUpdater();
            this.components.keyboard = new KeyboardHandler();
            this.components.parallax = new ParallaxEffect();

            // Start scan line animation
            const scanAnimator = new ScanLineAnimator();
            scanAnimator.start();

            // Console greeting
            this.logWelcomeMessage();

            // Add loaded class for entrance animations
            document.body.classList.add('loaded');
        }

        logWelcomeMessage() {
            const styles = [
                'color: #FFFFFF',
                'font-family: monospace',
                'font-size: 14px',
                'font-weight: bold',
                'padding: 10px',
                'border: 1px solid #4A4A4A',
                'border-radius: 8px'
            ].join(';');

            console.log('%c🚀 MISSION ARCHIVE v2.4.1 - ONLINE', styles);
            console.log('%c   STATUS: All systems operational', 'color: #00FF88; font-family: monospace;');
            console.log('%c   ACCESS: Authorized personnel only', 'color: #00CCFF; font-family: monospace;');
            console.log('%c   Use keys 1-3 to quick-select missions', 'color: #4A4A4A; font-family: monospace; font-size: 11px;');
        }
    }

    // ============================================
    // START APPLICATION
    // ============================================

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const app = new MissionArchive();
            app.init();
        });
    } else {
        const app = new MissionArchive();
        app.init();
    }

    // Expose to global scope for debugging
    window.MissionArchive = MissionArchive;

})();