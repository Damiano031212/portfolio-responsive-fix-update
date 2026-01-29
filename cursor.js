document.addEventListener("DOMContentLoaded", () => {

    const cursor = document.querySelector(".cursor");

    // 🛠️ FIX GEOMETRICO
    cursor.style.aspectRatio = "1";

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // --- STATI ---
    let freezeCursor = false;
    let hasDetectedMouse = false;
    let isHoverSphere = false;
    let isHovered = false;
    let isPressed = false;
    let isMobile = false;

    // 🔒 LOCK TOTALE DURANTE PAGE TRANSITION
    let isCursorTransitioning = false;

    // --- RESPONSIVE ---
    function checkResponsive() {
        if (window.innerWidth < 1024) {
            isMobile = true;
            cursor.style.display = "none";
            document.body.style.cursor = "auto";

            if (!document.getElementById("mobile-cursor-fix")) {
                const style = document.createElement("style");
                style.id = "mobile-cursor-fix";
                style.innerHTML = `* { cursor: auto !important; }`;
                document.head.appendChild(style);
            }
        } else {
            isMobile = false;
            cursor.style.display = "block";
            cursor.style.opacity = 1;
            document.body.style.cursor = "none";

            const fix = document.getElementById("mobile-cursor-fix");
            if (fix) fix.remove();

            setCursorToCenter();
        }
    }

    checkResponsive();
    window.addEventListener("resize", () => {
        checkResponsive();
        if (!isMobile && !hasDetectedMouse) setCursorToCenter();
    });

    // --- POSIZIONE INIZIALE ---
    function setCursorToCenter() {
        if (isMobile) return;

        const targetElement = document.querySelector(".damiano_zangrilli");
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            mouseX = rect.left + rect.width / 3.7;
            mouseY = rect.top + (rect.height - 185);
        } else {
            mouseX = window.innerWidth / 2;
            mouseY = window.innerHeight / 2;
        }

        cursorX = mouseX;
        cursorY = mouseY;
        cursor.style.left = cursorX + "px";
        cursor.style.top = cursorY + "px";
    }

    // --- TRACKING MOUSE ---
    const updateMouse = (e) => {
        if (freezeCursor || isMobile || isCursorTransitioning) return;
        hasDetectedMouse = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    document.addEventListener("mousemove", updateMouse);
    document.addEventListener("pointermove", updateMouse);

    // --- ANIMAZIONE CURSORE (ZERO DELAY) ---
    function animate() {
        if (!isMobile && !isCursorTransitioning) {
            cursorX = mouseX;
            cursorY = mouseY;

            cursor.style.left = cursorX + "px";
            cursor.style.top = cursorY + "px";

            if (window.isHoverSphere !== isHoverSphere) {
                isHoverSphere = window.isHoverSphere;
                applyCursorScale();
            }
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // --- SCALE / HOVER ---
    const interactive = document.querySelectorAll(
        "a, button, .clickable, .project-wrapper"
    );

    function applyCursorScale() {
        if (isMobile || isCursorTransitioning) return;

        if (isPressed) {
            cursor.style.transform = "translate(-50%, -50%) scale(0.6)";
        } else if (isHovered || isHoverSphere) {
            cursor.style.transform = "translate(-50%, -50%) scale(1.5)";
        } else {
            cursor.style.transform = "translate(-50%, -50%) scale(1)";
        }
    }

    interactive.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            if (isCursorTransitioning) return;
            isHovered = true;
            applyCursorScale();
        });

        el.addEventListener("mouseleave", () => {
            if (isCursorTransitioning) return;
            isHovered = false;
            applyCursorScale();
        });

        el.addEventListener("pointerdown", (ev) => {
            if (isMobile || isCursorTransitioning) return;
            if (ev.button !== undefined && ev.button !== 0) return;
            isPressed = true;
            applyCursorScale();
        });

        el.addEventListener("pointerup", () => {
            if (isMobile || isCursorTransitioning) return;
            isPressed = false;
            applyCursorScale();
        });
    });

    document.addEventListener("pointerdown", () => {
        if (isHoverSphere && !isMobile && !isCursorTransitioning) {
            isPressed = true;
            applyCursorScale();
        }
    });

    document.addEventListener("pointerup", () => {
        if (isPressed && !isMobile && !isCursorTransitioning) {
            isPressed = false;
            applyCursorScale();
        }
    });

    // --- PAGE TRANSITION ---
    const projectButtons = document.querySelectorAll(".link-wrapper");
    let isButtonAnimating = false;

    projectButtons.forEach((btn) => {
        btn.addEventListener("click", (ev) => {
            if (window.innerWidth < 1024) return;

            ev.preventDefault();
            ev.stopPropagation();

            if (isButtonAnimating) return;

            const parentA = btn.closest("a");
            const targetHref = parentA?.href || btn.dataset.href;
            if (!targetHref) return;

            isButtonAnimating = true;
            isCursorTransitioning = true;
            document.body.style.pointerEvents = "none";

            freezeCursor = true;
            mouseX = cursorX;
            mouseY = cursorY;

            const comp = getComputedStyle(cursor);
            const origWidth = comp.width || "50px";

            const expandDuration = 800;
            const shrinkDuration = 800;
            const curve = "ease-in-out";

            cursor.style.transition =
                `width ${expandDuration}ms ${curve}, height ${expandDuration}ms ${curve}`;

            requestAnimationFrame(() => {
                cursor.style.width = "100%";
                cursor.style.height = "auto";
            });

            setTimeout(() => {
                cursor.style.transition =
                    `width ${shrinkDuration}ms ${curve}, height ${shrinkDuration}ms ${curve}`;
                cursor.style.width = origWidth;
                cursor.style.height = "auto";

                setTimeout(() => {
                    location.href = targetHref;
                }, shrinkDuration);

            }, expandDuration);
        });
    });
});
