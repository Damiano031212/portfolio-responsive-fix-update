/**
 * Portfolio Lightbox - Fullscreen Image Viewer with Lucide Icons
 * Production-ready implementation with icon-based UI and micro-interactions
 */

(function () {
    'use strict';

    // Wait for DOM and Lucide to be ready
    function initPortfolioGallery() {
        // Get all portfolio images
        const portfolioImages = document.querySelectorAll('.image-placeholder, .visual-module');
        const lightboxModal = document.getElementById('lightboxModal');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxClose = document.getElementById('lightboxClose');
        const body = document.body;

        if (!lightboxModal || !lightboxImage || !lightboxClose) {
            console.error('Lightbox elements not found');
            return;
        }

        /**
         * Create and inject icon elements into portfolio images
         */
        function injectGalleryIcons() {
            portfolioImages.forEach(image => {
                // Skip if already has icons
                if (image.querySelector('.gallery-hint')) {
                    return;
                }

                // Create "Hover me" idle state hint
                const hintElement = document.createElement('div');
                hintElement.className = 'gallery-hint';
                hintElement.innerHTML = `
                    <i data-lucide="mouse-pointer-2"></i>
                `;

                // Create fullscreen CTA
                const ctaElement = document.createElement('div');
                ctaElement.className = 'gallery-cta';
                ctaElement.innerHTML = `
                    <div class="gallery-cta-icon">
                        <i data-lucide="maximize-2"></i>
                    </div>
                `;

                // Append to image
                image.appendChild(hintElement);
                image.appendChild(ctaElement);
            });

            // Initialize Lucide icons
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            } else {
                console.warn('Lucide not loaded, retrying...');
                setTimeout(() => {
                    if (window.lucide && typeof window.lucide.createIcons === 'function') {
                        window.lucide.createIcons();
                    }
                }, 500);
            }
        }

        /**
         * Extract background image URL from element
         * @param {HTMLElement} element - The element with background image
         * @returns {string} - The image URL
         */
        function getBackgroundImageUrl(element) {
            const bgImage = window.getComputedStyle(element).backgroundImage;
            // Extract URL from url("...") or url('...')
            const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            return urlMatch ? urlMatch[1] : '';
        }

        /**
         * Open lightbox with specified image
         * @param {string} imageUrl - URL of the image to display
         */
        function openLightbox(imageUrl) {
            if (!imageUrl) return;

            lightboxImage.src = imageUrl;
            lightboxModal.classList.add('active');
            body.classList.add('lightbox-open');
        }

        /**
         * Close the lightbox modal
         */
        function closeLightbox() {
            lightboxModal.classList.remove('active');
            body.classList.remove('lightbox-open');
            // Clear image source after transition
            setTimeout(() => {
                lightboxImage.src = '';
            }, 300);
        }

        // Inject icons into all portfolio images
        injectGalleryIcons();

        // Add click event listeners to all portfolio images
        portfolioImages.forEach(image => {
            image.addEventListener('click', function (e) {
                e.preventDefault();
                const imageUrl = getBackgroundImageUrl(this);
                openLightbox(imageUrl);
            });

            // Add keyboard accessibility
            image.setAttribute('tabindex', '0');
            image.setAttribute('role', 'button');
            image.setAttribute('aria-label', 'View fullscreen image');

            image.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const imageUrl = getBackgroundImageUrl(this);
                    openLightbox(imageUrl);
                }
            });
        });

        // Close button click
        lightboxClose.addEventListener('click', closeLightbox);

        // Click outside image to close
        lightboxModal.addEventListener('click', function (e) {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            // Give Lucide time to load
            setTimeout(initPortfolioGallery, 200);
        });
    } else {
        // DOM already loaded
        setTimeout(initPortfolioGallery, 200);
    }

})();
