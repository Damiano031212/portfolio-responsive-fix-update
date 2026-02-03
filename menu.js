document.addEventListener("DOMContentLoaded", () => {
    // --- 1. SELEZIONE ELEMENTI ---
    const openBtn = document.querySelector('.text_under-decoration'); 
    const openBtnMenu = document.querySelector('.menu'); 
    const closeBtn = document.getElementById('closeMenuBtn');
    const overlay = document.getElementById('overlayMenu');
    const overlayLinks = Array.from(document.querySelectorAll('.overlay-link'));

    // Funzione Helper: Imposta visivamente quale voce di menu è attiva
    function setMenuVisualState(nameToActivate) {
        overlayLinks.forEach(link => {
            const textP = link.querySelector('p');
            const iconDiv = link.querySelector('div'); 
            const linkText = textP.textContent.trim();

            if (linkText === nameToActivate) {
                textP.classList.remove('perc_opacity');
                if(iconDiv) iconDiv.style.opacity = '1';
            } else {
                textP.classList.add('perc_opacity');
                if(iconDiv) iconDiv.style.opacity = '0';
            }
        });
    }

    // Funzione Helper: Trova il nome della pagina corrente
    function getCurrentPageName() {
        const activeLink = overlayLinks.find(link => {
            const p = link.querySelector('p');
            return p && !p.classList.contains('perc_opacity');
        });
        return activeLink ? activeLink.querySelector('p').textContent.trim() : null;
    }

    // --- 2. GESTIONE ARRIVO SULLA NUOVA PAGINA ---
    
   // --- 2. GESTIONE ARRIVO SULLA NUOVA PAGINA ---
    
    if (sessionStorage.getItem('menuTransition') === 'true') {
        const originPage = sessionStorage.getItem('originPage');
        const currentPage = getCurrentPageName();

        // 1. Applichiamo la classe standard del JS per tenerlo aperto
        overlay.classList.add('is-open');
        // Usiamo anche instant-setup per coerenza, sebbene il CSS sull'html gestisca già tutto
        overlay.classList.add('instant-setup');

        // 2. Falsificazione stato visivo (menu precedente)
        if (originPage) {
            setMenuVisualState(originPage);
        }

        // 3. RIMUOVIAMO LA CLASSE DELL'HEAD ("Passaggio di consegne")
        // Ora che 'is-open' è applicata, possiamo togliere la forzatura dell'HTML.
        // L'overlay rimarrà fermo perché è fisicamente nella stessa posizione.
        document.documentElement.classList.remove('menu-transition-active');

        // Reflow forzato (sicurezza)
        void overlay.offsetWidth; 

        // Riabilitiamo le transizioni per l'uscita
        overlay.style.transition = '';

        sessionStorage.removeItem('menuTransition');
        
        // 4. ANIMAZIONE DI USCITA (Dopo 500ms)
        setTimeout(() => {
            overlay.classList.remove('is-open');
        }, 500); 

        // 5. PULIZIA E RIPRISTINO (Dopo 1500ms)
        setTimeout(() => {
            overlay.classList.remove('instant-setup');
            
            // Ripristina il menu corretto per la pagina attuale
            if (currentPage) {
                setMenuVisualState(currentPage);
            }
        }, 1500);
    }

    // --- 3. EVENT LISTENER (Uguali a prima) ---

    const triggerOpen = openBtn || openBtnMenu;
    if(triggerOpen) {
        triggerOpen.addEventListener('click', (e) => {
            if(triggerOpen.tagName === 'A') e.preventDefault();
            if(e.target.closest('a')) e.target.closest('a').preventDefault;
            overlay.classList.add('is-open');
        });
    }

    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('is-open');
        });
    }

    overlayLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const currentActiveName = getCurrentPageName();
            sessionStorage.setItem('menuTransition', 'true');
            if (currentActiveName) {
                sessionStorage.setItem('originPage', currentActiveName);
            }
        });
    });
});