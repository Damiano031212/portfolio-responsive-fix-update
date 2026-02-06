document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing) {
        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;

        // Segue il movimento del mouse
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        // Animazione fluida dell'anello (effetto ritardo)
        function animateRing() {
            const speed = 0.12;
            ringX += (mouseX - ringX) * speed;
            ringY += (mouseY - ringY) * speed;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';

            // Supporto per la sfera 3D (se presente)
            if (window.isHoverSphere) {
                document.body.classList.add('cursor-hover');
            } else {
                // Rimuoviamo la classe SOLO se non siamo sopra altri elementi interattivi
                // Ma attenzione: gli EventListener sugli elementi HTML gestiscono già add/remove.
                // Se siamo sulla sfera, isHoverSphere è true.
                // Se usciamo dalla sfera, isHoverSphere diventa false. 
                // DOBBIAMO rimuovere la classe se non stiamo hoverando un elemento HTML.
                // Per semplicità, possiamo lasciare che la logica HTML vinca o fare un controllo congiunto.

                // Soluzione robusta:
                // Se window.isHoverSphere è false, NON forziamo il remove qui (perché potremmo essere su un bottone).
                // Ma se ERA vero e ora è falso, dobbiamo rimuoverlo?
            }
            // MIGLIORIA: Usare una variabile di stato locale per gestire l'uscita dalla sfera
            if (window.isHoverSphere !== wasHoverSphere) {
                if (window.isHoverSphere) {
                    document.body.classList.add('cursor-hover');
                } else {
                    document.body.classList.remove('cursor-hover');
                }
                wasHoverSphere = window.isHoverSphere;
            }

            requestAnimationFrame(animateRing);
        }
        let wasHoverSphere = false;
        animateRing();

        // Rilevamento elementi per l'effetto Hover
        // Rilevamento elementi per l'effetto Hover
        const interactiveElements = document.querySelectorAll('a, button, .btn, .slider-nav, .slider-dot, .feature-card, .flip-card, .step-icon, .play-button, .clickable, .project-wrapper, #flipCoinWrapper, .switch, .image-placeholder, .visual-module');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });

        // Nasconde il cursore quando esce dalla finestra del browser
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '0.6';
        });
    }
});