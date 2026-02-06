// script.js â€“ Flip Coin (versione 2D, logiche da sfera.js)

// ============================================
// CONFIGURAZIONE (specchia i valori di sfera.js)
// ============================================
const APPEAR_HEIGHT = 1800;          // scroll Y oltre cui la moneta appare

// Posizioni Y della moneta durante apparizione (in px, relativo al centro del viewport)
// sphereStartY = -1  â†’  parte da sotto (150px sotto il centro, gestito in CSS)
// sphereFinalY = 0   â†’  arriva al centro
// Usiamo var(--footer-push) in CSS per il push verso l'alto

// ============================================
// RIFERIMENTI DOM
// ============================================
const wrapper = document.getElementById('flipCoinWrapper');
const coin = document.getElementById('flipCoin');
const footer = document.querySelector('footer');

// ============================================
// STATO
// ============================================
let coinVisible = false;   // stato logico apparizione
let appearProgress = 0;       // 0 â†’ 1, usata per il fade-in graduale
let disappearProgress = 0;       // 0 â†’ 1, usata per il fade-out graduale
let isFlipping = false;   // lock durante l'animazione di flip
let animationId = null;    // RAF principale

// ============================================
// CALCOLO FOOTER PUSH (portato da sfera.js, adattato in px)
// In sfera.js il footer "spinge" la sfera verso l'alto quando scorre nel viewport.
// Qui calcoliamo direttamente in pixel: se il footer Ã¨ parzialmente visibile,
// lo spostamento verso l'alto Ã¨ pari all'overlapping.
// ============================================
function getFooterPush() {
    if (!footer) return 0;

    const footerRect = footer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Il footer inizia a "spingere" quando il suo bordo superiore entra nel viewport
    if (footerRect.top < viewportHeight) {
        const overlapPixels = viewportHeight - footerRect.top;
        // Limitiamo a metÃ  del viewport per evitare spostamenti escessivi
        return Math.min(overlapPixels, viewportHeight * 0.4);
    }
    return 0;
}

// ============================================
// SCROLL HANDLER (trigger apparizione/sparizione)
// Replica onScrollShowSphere() di sfera.js
// ============================================
function onScroll() {
    if (window.scrollY > APPEAR_HEIGHT && !coinVisible) {
        // APPARIZIONE
        coinVisible = true;
        appearProgress = 0;
        disappearProgress = 0;
        wrapper.classList.add('visible');
    } else if (window.scrollY <= APPEAR_HEIGHT && coinVisible) {
        // SPARIZIONE
        coinVisible = false;
        disappearProgress = 0;
        wrapper.classList.remove('visible');
        // Reset stato flip se in corso
        resetAfterDisappear();
    }
}

// ============================================
// RESET dopo sparizione (replica resetAfterDisappear di sfera.js)
// ============================================
function resetAfterDisappear() {
    coin.classList.remove('flipping', 'settling');
    isFlipping = false;
}

// ============================================
// CLICK HANDLER â€“ Flip della moneta
// Replica onClickScene + clickAnimatorStart di sfera.js:
//   1) Lancia il flip (3 giri, 1500ms, easing click)
//   2) Dopo il flip, settle verso 0Â° (350ms, easing cubic)
//   3) Scroll to top
// ============================================
function onClick(e) {
    // Solo se la moneta Ã¨ visibile e il target Ã¨ dentro il coin
    if (!coinVisible || isFlipping) return;
    if (!coin.contains(e.target)) return;

    isFlipping = true;

    // 1) Rimuovi settling se presente, aggiungi flipping
    coin.classList.remove('settling');
    // Forza il reflow per riavviare l'animazione CSS
    void coin.offsetWidth;
    coin.classList.add('flipping');

    // 2) Dopo la durata del flip (1500ms, come in sfera.js), avvia il settle
    setTimeout(() => {
        coin.classList.remove('flipping');
        // Forza reflow
        void coin.offsetWidth;
        coin.classList.add('settling');

        // 3) Dopo il settle (350ms), rilascia il lock e aspetta 1s prima di scrollare
        setTimeout(() => {
            coin.classList.remove('settling');
            isFlipping = false;

            // Pausa di 1 secondo dopo la fine dell'animazione completa, poi scroll to top
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1);
        }, 50);
    }, 500);
}

// ============================================
// LOOP PRINCIPALE (RAF) â€“ Aggiorna footer push ogni frame
// Replica il ruolo di animate() in sfera.js per la parte footer
// ============================================
function animate() {
    animationId = requestAnimationFrame(animate);

    // Aggiorna il footer push ogni frame (come nel loop di sfera.js)
    // const push = getFooterPush();
    // Scrivi la var CSS come stringa in px con segno negativo (sposta verso l'alto)
    wrapper.style.setProperty('--footer-push', `0px`);
}

// ============================================
// INIZIALIZZAZIONE
// ============================================
function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick);

    // Stato iniziale: assicura che la moneta sia nascosta
    wrapper.classList.remove('visible');
    resetAfterDisappear();

    // Avvia il loop RAF
    animate();
}

// Avvia quando il DOM Ã¨ pronto
window.addEventListener('DOMContentLoaded', init);
