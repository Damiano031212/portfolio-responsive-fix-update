/**
 * ORBITAL DASHBOARD — CASE STUDY SCRIPTS
 * NASA-Core Aesthetic | Interactive Elements
 */

(function () {
    'use strict';

    // ========================================
    // MASCOT SPHERE ANIMATION
    // ========================================

    const mascotSphere = document.getElementById('mascotSphere');

    if (mascotSphere) {
        let time = 0;
        let animationId = null;
        let isHovered = false;

        // Floating animation
        function animateMascot() {
            time += 0.02;

            if (!isHovered) {
                const floatY = Math.sin(time) * 8;
                const rotX = Math.sin(time * 0.7) * 3;
                const rotY = Math.cos(time * 0.5) * 5;

                mascotSphere.style.transform = `
          translateY(${floatY}px) 
          rotateX(${rotX}deg) 
          rotateY(${rotY}deg)
        `;
            }

            animationId = requestAnimationFrame(animateMascot);
        }

        // Start animation
        animateMascot();

        // Hover effects
        mascotSphere.addEventListener('mouseenter', () => {
            isHovered = true;
            mascotSphere.style.transform = 'scale(1.05) rotateX(0) rotateY(0)';
        });

        mascotSphere.addEventListener('mouseleave', () => {
            isHovered = false;
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        });
    }

    // ========================================
    // FOOTER MASCOT ANIMATION
    // ========================================

    const footerMascot = document.querySelector('.footer-mascot .mascot-sphere-small');

    if (footerMascot) {
        let footerTime = 0;
        let footerAnimationId = null;

        function animateFooterMascot() {
            footerTime += 0.02;
            const floatY = Math.sin(footerTime) * 4;
            footerMascot.style.transform = `translateY(${floatY}px)`;
            footerAnimationId = requestAnimationFrame(animateFooterMascot);
        }

        animateFooterMascot();

        window.addEventListener('beforeunload', () => {
            if (footerAnimationId) {
                cancelAnimationFrame(footerAnimationId);
            }
        });
    }

    // ========================================
    // SCROLL REVEAL ANIMATIONS
    // ========================================

    const revealElements = document.querySelectorAll(
        '.challenge-card, .process-block, .visual-module, .stat-card, .footer-mascot, .footer-title, .footer-description, .cta-buttons, .footer-info-panel'
    );

    const revealOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.7s ease-out ${index * 0.1}s, transform 0.7s ease-out ${index * 0.1}s`;
        revealObserver.observe(el);
    });

    // ========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========================================
    // BUTTON INTERACTIONS
    // ========================================

    const primaryButton = document.querySelector('.tech-button.primary');
    const secondaryButton = document.querySelector('.tech-button.secondary');

    if (primaryButton) {
        primaryButton.addEventListener('click', () => {
            // Show coming soon notification
            showNotification('Live demo coming soon');
        });
    }

    if (secondaryButton) {
        secondaryButton.addEventListener('click', () => {
            // Show coming soon notification
            showNotification('Next project coming soon');
        });
    }

    // ========================================
    // NOTIFICATION SYSTEM
    // ========================================

    function showNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
      <div class="notification-content">
        <span class="crosshair"></span>
        <span class="message">${message}</span>
        <span class="crosshair"></span>
      </div>
    `;

        // Add styles
        notification.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #1A1A1A;
      border: 1px solid #4A4A4A;
      border-radius: 1rem;
      padding: 16px 32px;
      z-index: 10000;
      opacity: 0;
      transition: all 0.4s ease-out;
    `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
      display: flex;
      align-items: center;
      gap: 16px;
    `;

        const message = notification.querySelector('.message');
        message.style.cssText = `
      font-size: 14px;
      color: #FFFFFF;
      font-weight: 500;
    `;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }

    // ========================================
    // PARALLAX EFFECT FOR HERO
    // ========================================

    const heroSection = document.querySelector('.section-hero');

    if (heroSection && !window.matchMedia('(pointer: coarse)').matches) {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const heroHeight = heroSection.offsetHeight;

                    if (scrollY < heroHeight) {
                        const parallaxElements = heroSection.querySelectorAll('.mascot-container, .mission-title, .hero-subtitle');
                        parallaxElements.forEach((el, index) => {
                            const speed = 0.1 + (index * 0.05);
                            el.style.transform = `translateY(${scrollY * speed}px)`;
                        });
                    }

                    ticking = false;
                });

                ticking = true;
            }
        }, { passive: true });
    }

    // ========================================
    // MOUSE TRACKING FOR MASCOT (DESKTOP ONLY)
    // ========================================

    if (mascotSphere && !window.matchMedia('(pointer: coarse)').matches) {
        document.addEventListener('mousemove', (e) => {
            const rect = mascotSphere.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) / window.innerWidth;
            const deltaY = (e.clientY - centerY) / window.innerHeight;

            const eyes = mascotSphere.querySelectorAll('.mascot-eye');
            eyes.forEach(eye => {
                eye.style.transform = `translate(${deltaX * 4}px, ${deltaY * 4}px)`;
            });
        });
    }

    // ========================================
    // KEYBOARD NAVIGATION
    // ========================================

    document.addEventListener('keydown', (e) => {
        // Escape key to close notifications
        if (e.key === 'Escape') {
            const notification = document.querySelector('.notification');
            if (notification) {
                notification.remove();
            }
        }
    });

    // ========================================
    // PERFORMANCE: CLEANUP ON VISIBILITY CHANGE
    // ========================================

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause expensive animations when tab is hidden
            if (animationId) cancelAnimationFrame(animationId);
            if (footerAnimationId) cancelAnimationFrame(footerAnimationId);
        } else {
            // Resume animations when tab becomes visible
            if (mascotSphere) animateMascot();
            if (footerMascot) animateFooterMascot();
        }
    });

    // ========================================
    // CONSOLE EASTER EGG
    // ========================================

    console.log('%c🛰 ORBITAL DASHBOARD', 'font-size: 24px; font-weight: bold; color: #FFFFFF;');
    console.log('%cMission Control Interface v2.0.4', 'font-size: 14px; color: #6A6A6A;');
    console.log('%cStatus: OPERATIONAL', 'font-size: 12px; color: #4A4A4A;');

})();