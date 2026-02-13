document.addEventListener('DOMContentLoaded', () => {
    const flipCoinWrapper = document.getElementById('flipCoinWrapper');
    const flipCoin = document.getElementById('flipCoin');

    if (!flipCoinWrapper || !flipCoin) return;

    // Show/Hide on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            flipCoinWrapper.classList.add('visible');
        } else {
            flipCoinWrapper.classList.remove('visible');
        }
    });

    // Handle Click
    flipCoin.addEventListener('click', () => {
        // Prevent double clicking while animating
        if (flipCoin.classList.contains('flipping')) return;

        // Add flipping class to trigger CSS animation
        flipCoin.classList.add('flipping');

        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Remove class after animation completes (1.5s as per CSS)
        // We add a little buffer or listen for animationend
        setTimeout(() => {
            flipCoin.classList.remove('flipping');

            // Optional: add settling class if needed for smooth return, 
            // though CSS handles removal cleanly usually.
            flipCoin.classList.add('settling');
            setTimeout(() => {
                flipCoin.classList.remove('settling');
            }, 350); // Match CSS transition time for settling if it exists
        }, 1500);
    });
});
