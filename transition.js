document.addEventListener("DOMContentLoaded", () => {
  // --- CONTROLLO INIZIALE RESPONSIVE ---
  // Se siamo sotto i 1024px, non creiamo nemmeno la tendina o la nascondiamo subito
  if (window.innerWidth < 1024) {
      sessionStorage.removeItem("pageTransition"); // Pulizia bandiera
      return; // Interrompiamo l'esecuzione dello script qui
  }

  const shutter = document.createElement("div");
  shutter.className = "page-shutter";
  document.body.appendChild(shutter);

  let isAnimating = false;

  function clearFlag() {
    sessionStorage.removeItem("pageTransition");
  }

  function finishReveal() {
    shutter.classList.remove("down");
    isAnimating = false;
    clearFlag();
  }

  // --- GESTIONE CARICAMENTO PAGINA (SALITA TENDINA) ---
  if (sessionStorage.getItem("pageTransition") === "1") {
    
    // Sicurezza ulteriore: se nel frattempo l'utente ha ridimensionato sotto 1024
    if (window.innerWidth < 1024) {
        clearFlag();
    } else {
        // 1. Posiziona la tendina giù
        shutter.style.transition = "none";
        shutter.classList.add("down");
        
        // 2. Reflow
        shutter.getBoundingClientRect();
        
        // 3. Ripristina transizione e anima salita
        shutter.style.transition = "";
        requestAnimationFrame(() => {
            shutter.classList.remove("down");
        });

        const onRevealEnd = (e) => {
          if (e.propertyName !== "transform") return;
          isAnimating = false;
          clearFlag();
          shutter.removeEventListener("transitionend", onRevealEnd);
        };
        shutter.addEventListener("transitionend", onRevealEnd);
    }
  }

  // --- GESTIONE CLICK LINK (DISCESA TENDINA) ---
  
  const navbarLinks = Array.from(document.querySelectorAll("nav a"));
  let linksToAnimate = [...navbarLinks];

  const footerHomeBtn = document.querySelector("footer .home");
  if (footerHomeBtn) {
      const footerHomeLink = footerHomeBtn.closest("a");
      if (footerHomeLink) {
          linksToAnimate.push(footerHomeLink);
      }
  }

  linksToAnimate.forEach((a) => {
    a.addEventListener("click", (ev) => {
      
      // ⛔⛔⛔ STOP: Se lo schermo è < 1024px, NON fare animazione.
      // Lascia che il link funzioni normalmente.
      if (window.innerWidth < 1024) return;

      if (!a.href) return;

      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return; 

      const isSamePageHash = (url.pathname === location.pathname) && !!url.hash;
      
      ev.preventDefault();
      if (isAnimating) return;
      isAnimating = true;

      const fallbackDuration = 1200; 
      let fallback = setTimeout(() => {
        isAnimating = false;
        clearFlag();
        shutter.classList.remove("down"); 
      }, fallbackDuration * 2); 

      const onCoverComplete = () => {
        clearTimeout(fallback); 
        
        if (isSamePageHash) {
          location.hash = url.hash;
          requestAnimationFrame(() => shutter.classList.remove("down"));
          shutter.addEventListener("transitionend", function onUp(ev2) {
             if (ev2.propertyName !== "transform") return;
             finishReveal();
             shutter.removeEventListener("transitionend", onUp);
          }, { once: true });

        } else {
          sessionStorage.setItem("pageTransition", "1");
          if (url.href === location.href) {
            location.reload();
          } else {
            location.href = url.href;
          }
        }
      };

      shutter.classList.add("down");
      
      shutter.addEventListener("transitionend", function onDown(e) {
        if (e.propertyName !== "transform") return;
        shutter.removeEventListener("transitionend", onDown);
        onCoverComplete();
      });
    });
  });
});