/* ============================================
   ABOUT PAGE - NASA HUD ANIMATIONS
   Skill Gauge Animations & System Effects
   ============================================ */

(function () {
    'use strict';

    // =========================================================================
    // 1. SKILL PROFICIENCY BAR ANIMATIONS
    // =========================================================================

    function animateSkillBars() {
        const proficiencyBars = document.querySelectorAll('.proficiency-fill');

        // Create an Intersection Observer to trigger animation when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const level = bar.getAttribute('data-level');

                    // Trigger animation by setting width
                    setTimeout(() => {
                        bar.style.width = level + '%';
                    }, 200);

                    // Unobserve after animation
                    observer.unobserve(bar);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe all proficiency bars
        proficiencyBars.forEach(bar => {
            observer.observe(bar);
        });
    }

    // =========================================================================
    // 2. SCAN LINE ANIMATION
    // =========================================================================

    function createScanLineAnimation() {
        // Create dynamic scan line element
        const scanLine = document.createElement('div');
        scanLine.className = 'dynamic-scan-line';
        document.body.appendChild(scanLine);

        function runScanAnimation() {
            // Reset position
            scanLine.style.top = '0';
            scanLine.style.opacity = '0';

            // Start animation
            setTimeout(() => {
                scanLine.style.transition = 'top 2s linear, opacity 0.5s ease';
                scanLine.style.opacity = '1';
                scanLine.style.top = '100%';

                // Fade out at the end
                setTimeout(() => {
                    scanLine.style.opacity = '0';
                }, 1500);
            }, 100);
        }

        // Run immediately on page load
        setTimeout(runScanAnimation, 1000);

        // Run every 3 minutes (180000ms) like the Work page
        setInterval(runScanAnimation, 180000);
    }

    // =========================================================================
    // 3. MODULE ENTRANCE ANIMATIONS
    // =========================================================================

    function animateModuleEntrance() {
        const modules = document.querySelectorAll('.tool-module, .system-module');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger animation for each module
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        // Set initial state and observe
        modules.forEach(module => {
            module.style.opacity = '0';
            module.style.transform = 'translateY(20px)';
            module.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(module);
        });
    }

    // =========================================================================
    // 4. METADATA PANEL COUNTER ANIMATION
    // =========================================================================

    function animateMetadataCounters() {
        const metaValues = document.querySelectorAll('.meta-value');

        metaValues.forEach(value => {
            const text = value.textContent;

            // Check if it's a numeric value or code
            if (text.includes('DZ-')) {
                // Animate the ID with a scramble effect
                scrambleText(value, text, 1000);
            }
        });
    }

    function scrambleText(element, finalText, duration) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = finalText.length;
        let iterations = 0;
        const maxIterations = 20;

        const interval = setInterval(() => {
            element.textContent = finalText
                .split('')
                .map((char, index) => {
                    if (iterations > index) {
                        return finalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            iterations += 1;

            if (iterations > length + maxIterations) {
                clearInterval(interval);
                element.textContent = finalText;
            }
        }, duration / (length + maxIterations));
    }

    // =========================================================================
    // 5. BIO SECTION FADE IN
    // =========================================================================

    function animateBioSections() {
        const bioSections = document.querySelectorAll('.bio-section');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 150);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        bioSections.forEach(section => {
            if (!section.classList.contains('contenuto-extra') ||
                window.innerWidth >= 1024) {
                section.style.opacity = '0';
                section.style.transform = 'translateY(15px)';
                section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                observer.observe(section);
            }
        });
    }

    // =========================================================================
    // 6. GLITCH EFFECT ON HOVER (OPTIONAL)
    // =========================================================================

    function addGlitchEffects() {
        const systemNames = document.querySelectorAll('.system-name');

        systemNames.forEach(name => {
            name.addEventListener('mouseenter', function () {
                const originalText = this.textContent;

                // Quick glitch effect
                let glitchCount = 0;
                const glitchInterval = setInterval(() => {
                    if (glitchCount % 2 === 0) {
                        this.textContent = scrambleTextOnce(originalText);
                    } else {
                        this.textContent = originalText;
                    }
                    glitchCount++;

                    if (glitchCount > 3) {
                        clearInterval(glitchInterval);
                        this.textContent = originalText;
                    }
                }, 50);
            });
        });
    }

    function scrambleTextOnce(text) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return text
            .split('')
            .map(char => {
                if (Math.random() > 0.7 && char !== ' ') {
                    return chars[Math.floor(Math.random() * chars.length)];
                }
                return char;
            })
            .join('');
    }

    // =========================================================================
    // 7. QUOTE PANEL REVEAL
    // =========================================================================

    function animateQuotePanel() {
        const quotePanel = document.querySelector('.quote-panel');
        if (!quotePanel) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        quotePanel.style.opacity = '0';
        quotePanel.style.transform = 'translateX(-20px)';
        quotePanel.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(quotePanel);
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runAnimations);
        } else {
            runAnimations();
        }
    }

    function runAnimations() {
        animateSkillBars();
        createScanLineAnimation();
        animateModuleEntrance();
        animateMetadataCounters();
        animateBioSections();
        addGlitchEffects();
        animateQuotePanel();
    }

    // Start the initialization
    init();

})();
