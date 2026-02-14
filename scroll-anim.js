document.addEventListener('DOMContentLoaded', () => {
    // Configuration for the Intersection Observer
    const observerOptions = {
        root: null, // use the viewport
        rootMargin: '0px',
        threshold: 0.15 // trigger when 15% of the element is visible
    };

    // Callback function to handle intersection
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the reveal class to trigger the animation
                entry.target.classList.add('reveal');
                // Stop observing the element after it has been revealed
                observer.unobserve(entry.target);
            }
        });
    };

    // Create the observer instance
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Select elements to animate
    const elementsToAnimate = [
        '.section-mission .section-container',
        '.section-trajectory .section-container',
        '.section-assets .section-container',
        '.problem-statement',
        '.challenges-grid',
        '.process-block',
        '.visual-module',
        '.stats-card', // Assuming stats might be cards
        '.stat-card', // Actual class in HTML
        '.section-footer .section-container',
        '.mission-brief-panel',
        '.brief-item',
        '.hud-element',
        '.scroll-indicator'
    ];

    // Select and observe elements
    elementsToAnimate.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            observer.observe(el);

            // Add staggered delays for grid items
            if (selector.includes('grid') || selector === '.brief-item') {
                el.style.transitionDelay = `${index * 100}ms`;
            }
        });
    });

    // Special handling for staggered grid items if they are children
    const grids = document.querySelectorAll('.challenges-grid, .modules-grid, .brief-items, .stats-grid');
    grids.forEach(grid => {
        const children = grid.children;
        Array.from(children).forEach((child, index) => {
            observer.observe(child);
            child.style.transitionDelay = `${index * 100}ms`;
        });
    });

    // Handle divider lines and HUD labels specifically if needed
    // The CSS will handle the specific properties (scaleX, opacity, etc.)
    // based on the .reveal class added by the observer.
});
