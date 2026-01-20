// sfera_alt.js
// Sfera alternativa per altre pagine con gestione RESPONSIVE
// - Disattivata sotto i 1024px
// - FIX DIMENSIONI: Riferimento FOV standardizzato su 16:9

// ------------------------------
// Variabili globali Three.js
// ------------------------------
let scene_alt, camera_alt, renderer_alt, sphere_alt;
let videoSfondo, textureSfondo_alt;
let clock_alt = new THREE.Clock();
let raycaster_alt = new THREE.Raycaster();

// ------------------------------
// Variabili di Stato e Logica
// ------------------------------
let mouse_alt = new THREE.Vector2();
let targetRotation_alt = new THREE.Vector2(0, 0);

// Flag per gestire l'inizializzazione
let isSceneInitialized = false;
let animationFrameId = null; // Per poter fermare il loop

// Configurazioni Posizione
let sphereSize_alt = 0.7;
let centerY = 0;        
let hiddenY = -7;     
let currentBaseY = hiddenY; 

// Stati
let isSleeping = true;        
let isTransitioning = false;  
let lastInteractionTime = 0;  
const INACTIVITY_LIMIT = 60000; 
const WAITING_JUMP_INTERVAL = 4000; 
let lastWaitingJumpTime = 0;

// Animazioni
let spinAnimator = null;      
let moveAnimator = null;      
let jumpAnimator = null;      
let jumpOffset = 0;           
let originalZ_alt = 0;        

// FOV Responsive
let initialHorizontalFOV = 0;

// Supporto hover → cursor.js
window.isHoverSphere = false;

// ------------------------------
// Gestione Responsive (Init/Destroy)
// ------------------------------

function checkResponsiveAndInit() {
    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
        // Se siamo su mobile e la scena esiste, distruggiamola
        if (isSceneInitialized) {
            destroyScene();
        }
    } else {
        // Se siamo su desktop e la scena NON esiste, creiamola
        if (!isSceneInitialized) {
            initAltSphere();
        }
    }
}

function destroyScene() {
    if (!isSceneInitialized) return;

    // 1. Ferma loop animazione
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    // 2. Rimuovi listener
    window.removeEventListener("resize", onAltResize);
    document.removeEventListener("mousemove", onAltMouseMove);
    window.removeEventListener("click", onAltClick);

    // 3. Pulisci Three.js
    if (renderer_alt && renderer_alt.domElement) {
        const container = document.getElementById("container");
        if (container && container.contains(renderer_alt.domElement)) {
            container.removeChild(renderer_alt.domElement);
        }
    }
    
    // Libera memoria geometry/material/texture
    if (sphere_alt) {
        if (sphere_alt.geometry) sphere_alt.geometry.dispose();
        if (sphere_alt.material) sphere_alt.material.dispose();
    }
    if (textureSfondo_alt) textureSfondo_alt.dispose();
    
    // Resetta variabili
    renderer_alt = null;
    scene_alt = null;
    camera_alt = null;
    sphere_alt = null;
    
    isSceneInitialized = false;
}

// ------------------------------
// Setup Video
// ------------------------------
function setupVideo() {
    videoSfondo = document.getElementById("videoSfondo");
    if (!videoSfondo) return; // Sicurezza

    videoSfondo.muted = true;
    videoSfondo.loop = true;
    
    // Tenta autoplay solo se possibile
    const playPromise = videoSfondo.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            console.log("Autoplay bloccato dal browser o non necessario (mobile)");
        });
    }

    textureSfondo_alt = new THREE.VideoTexture(videoSfondo);
    textureSfondo_alt.minFilter = THREE.LinearFilter;
    textureSfondo_alt.magFilter = THREE.LinearFilter;
}

// ------------------------------
// Init Reale
// ------------------------------
function initAltSphere() {
    if (isSceneInitialized) return;

    const container = document.getElementById("container");
    if (!container) return; 

    scene_alt = new THREE.Scene();

    // Impostiamo un FOV verticale base di 75
    camera_alt = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera_alt.position.z = 9;

    // --- FIX GEOMETRICO ---
    // Invece di calcolare il FOV orizzontale sulla finestra ATTUALE (che può essere stretta),
    // lo calcoliamo su un riferimento STANDARD (16:9).
    // Questo assicura che la matematica sia identica sia se apri a tutto schermo, sia se apri in finestra.
    const vFOV = THREE.MathUtils.degToRad(75); // 75 degrees in radians
    const referenceAspect = 16 / 9; // Standard Widescreen Aspect Ratio
    
    // Calcoliamo l'Horizontal FOV ideale e lo blocchiamo
    initialHorizontalFOV = 2 * Math.atan(Math.tan(vFOV / 2) * referenceAspect);

    renderer_alt = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer_alt.setSize(window.innerWidth, window.innerHeight);
    renderer_alt.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer_alt.domElement);

    setupVideo();
    createAltSphere();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene_alt.add(ambientLight);

    // Reset tempi
    lastInteractionTime = performance.now();
    lastWaitingJumpTime = performance.now();
    clock_alt.start();

    // Eventi
    window.addEventListener("resize", onAltResize);
    document.addEventListener("mousemove", onAltMouseMove);
    window.addEventListener("click", onAltClick);

    isSceneInitialized = true;

    // --- FORZA RESIZE ---
    // Applichiamo subito la logica di ridimensionamento per adattare 
    // il nostro riferimento standard alla finestra reale attuale.
    onAltResize();

    animateAltSphere();
}

// ------------------------------
// Creazione Sfera
// ------------------------------
function createAltSphere() {
    const geometry = new THREE.SphereGeometry(sphereSize_alt, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: textureSfondo_alt, side: THREE.DoubleSide });

    sphere_alt = new THREE.Mesh(geometry, material);
    sphere_alt.rotation.y = -Math.PI / 2;
    originalZ_alt = sphere_alt.rotation.z;
    
    sphere_alt.position.y = hiddenY;
    
    // Nota: adjustSphereScale viene chiamato da onAltResize subito dopo l'init
    scene_alt.add(sphere_alt);
}

// ------------------------------
// Logica Interazione & "Wake Up"
// ------------------------------
function onAltMouseMove(event) {
    if (!isSceneInitialized) return;

    const rect = renderer_alt.domElement.getBoundingClientRect();
    mouse_alt.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse_alt.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    targetRotation_alt.x = -mouse_alt.y * 0.5;
    targetRotation_alt.y = mouse_alt.x * 0.5;

    checkAltHover();

    lastInteractionTime = performance.now();

    if (isSleeping) {
        wakeUpSphere();
    }
}

// Funzione: Porta la sfera al centro
function wakeUpSphere() {
    if (!isSleeping && !isTransitioning) return; 

    isSleeping = false;
    isTransitioning = true;
    
    if (jumpAnimator) cancelAnimationFrame(jumpAnimator);
    jumpOffset = 0; 

    const startY = currentBaseY;
    const endY = centerY;
    const startTime = performance.now();
    const duration = 1200; 

    if (moveAnimator) cancelAnimationFrame(moveAnimator);

    function moveUpStep(now) {
        if (!isSceneInitialized) return; // Stop se distrutta
        const t = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - t, 3);

        currentBaseY = startY + (endY - startY) * ease;

        if (t < 1) {
            moveAnimator = requestAnimationFrame(moveUpStep);
        } else {
            currentBaseY = endY;
            isTransitioning = false;
            performArrivalJump();
        }
    }
    moveAnimator = requestAnimationFrame(moveUpStep);
}

// Funzione: Manda la sfera in basso
function goToSleep() {
    if (isSleeping) return;

    isSleeping = true;
    isTransitioning = true;

    const startY = currentBaseY;
    const endY = hiddenY;
    const startTime = performance.now();
    const duration = 1500; 

    if (moveAnimator) cancelAnimationFrame(moveAnimator);
    if (jumpAnimator) cancelAnimationFrame(jumpAnimator);
    jumpOffset = 0;

    function moveDownStep(now) {
        if (!isSceneInitialized) return;
        const t = Math.min(1, (now - startTime) / duration);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        currentBaseY = startY + (endY - startY) * ease;

        if (t < 1) {
            moveAnimator = requestAnimationFrame(moveDownStep);
        } else {
            currentBaseY = endY;
            isTransitioning = false;
            lastWaitingJumpTime = performance.now();
        }
    }
    moveAnimator = requestAnimationFrame(moveDownStep);
}

// ------------------------------
// Gestione Salti
// ------------------------------
function performArrivalJump() {
    if (jumpAnimator) cancelAnimationFrame(jumpAnimator);

    const startTime = performance.now();
    const duration = 600; 
    const height = 0.5; 

    function jumpStep(now) {
        if (!isSceneInitialized) return;
        const t = Math.min(1, (now - startTime) / duration);
        if (t < 1) {
            jumpOffset = Math.sin(t * Math.PI) * height;
            jumpAnimator = requestAnimationFrame(jumpStep);
        } else {
            jumpOffset = 0;
        }
    }
    jumpAnimator = requestAnimationFrame(jumpStep);
}

function performWaitingJump() {
    if (jumpAnimator) cancelAnimationFrame(jumpAnimator);

    const startTime = performance.now();
    const duration = 500; 
    const height = 0.8;   

    function waitJumpStep(now) {
        if (!isSceneInitialized) return;
        const t = Math.min(1, (now - startTime) / duration);
        if (t < 1) {
            jumpOffset = Math.sin(t * Math.PI) * height;
            jumpAnimator = requestAnimationFrame(waitJumpStep);
        } else {
            jumpOffset = 0;
        }
    }
    jumpAnimator = requestAnimationFrame(waitJumpStep);
}


// ------------------------------
// Logica Spin
// ------------------------------
function onAltClick(event) {
    if (isSleeping && !isTransitioning) return;

    raycaster_alt.setFromCamera(mouse_alt, camera_alt);
    const hits = raycaster_alt.intersectObject(sphere_alt);
    if (hits.length === 0) return;

    startSpinWithBounce();
}

function startSpinWithBounce() {
    if (spinAnimator) cancelAnimationFrame(spinAnimator);

    const startZ = sphere_alt.rotation.z;
    const targetZ = startZ + (Math.PI * 4); 
    const durationSpin = 1000;
    const startTime = performance.now();

    function spinPhase(now) {
        if (!isSceneInitialized) return;
        const t = Math.min(1, (now - startTime) / durationSpin);
        const ease = t < 1 ? (1 - Math.pow(1 - t, 3)) : 1;
        sphere_alt.rotation.z = startZ + (targetZ - startZ) * ease;

        if (t < 1) {
            spinAnimator = requestAnimationFrame(spinPhase);
        } else {
            decelerateSpin();
        }
    }
    spinAnimator = requestAnimationFrame(spinPhase);
}

function decelerateSpin() {
    let speed = 0.1;
    const decay = 0.93;

    function decayStep() {
        if (!isSceneInitialized) return;
        sphere_alt.rotation.z += speed;
        speed *= decay;
        if (speed > 0.003) {
            spinAnimator = requestAnimationFrame(decayStep);
        } else {
            startBounceReturn();
        }
    }
    spinAnimator = requestAnimationFrame(decayStep);
}

function startBounceReturn() {
    const startZ = sphere_alt.rotation.z;
    const overshoot = originalZ_alt + 0.25;
    const duration = 500;
    const start = performance.now();

    function bounceStep(now) {
        if (!isSceneInitialized) return;
        const t = Math.min(1, (now - start) / duration);
        if (t < 0.7) {
            const tt = t / 0.7;
            sphere_alt.rotation.z = startZ + (overshoot - startZ) * (1 - Math.pow(1 - tt, 3));
        } else {
            const tt = (t - 0.7) / 0.3;
            sphere_alt.rotation.z = overshoot + (originalZ_alt - overshoot) * tt;
        }
        if (t < 1) {
            spinAnimator = requestAnimationFrame(bounceStep);
        } else {
            sphere_alt.rotation.z = originalZ_alt;
        }
    }
    spinAnimator = requestAnimationFrame(bounceStep);
}

// ------------------------------
// Animation Loop Principale
// ------------------------------
function animateAltSphere() {
    if (!isSceneInitialized) return; // Stop if killed

    animationFrameId = requestAnimationFrame(animateAltSphere);

    const time = clock_alt.getElapsedTime();
    const now = performance.now();

    // Logica Inattività
    if (!isSleeping && !isTransitioning) {
        if (now - lastInteractionTime > INACTIVITY_LIMIT) {
            goToSleep();
        }
    }

    // Logica Salti Attesa
    if (isSleeping && !isTransitioning) {
        if (now - lastWaitingJumpTime > WAITING_JUMP_INTERVAL) {
            performWaitingJump();
            lastWaitingJumpTime = now;
        }
    }

    if (sphere_alt) {
        sphere_alt.rotation.x += (targetRotation_alt.x - sphere_alt.rotation.x) * 0.1;
        let targetY_Rot = targetRotation_alt.y - Math.PI / 2;
        sphere_alt.rotation.y += (targetY_Rot - sphere_alt.rotation.y) * 0.1;

        const floatSpeed = 2;
        const floatAmp = 0.1;
        const floatingY = Math.sin(time * floatSpeed) * floatAmp;

        sphere_alt.position.y = currentBaseY + floatingY + jumpOffset;
    }

    renderer_alt.render(scene_alt, camera_alt);
}

// ------------------------------
// Responsive & Utility
// ------------------------------
function adjustSphereScale() {
    if (!sphere_alt) return;
    const scaleFactor = (window.innerWidth / 1600) + 0.25;
    sphere_alt.scale.set(scaleFactor, scaleFactor, scaleFactor);
}

function onAltResize() {
    // Se siamo scesi sotto i 1024px, il gestore "checkResponsiveAndInit" ci penserà.
    if (window.innerWidth < 1024) {
        checkResponsiveAndInit();
        return;
    }

    if (!isSceneInitialized) {
        checkResponsiveAndInit();
        return;
    }

    const newAspect = window.innerWidth / window.innerHeight;
    
    // Calcoliamo il nuovo FOV verticale necessario per MANTENERE 
    // l'Horizontal FOV standard (che abbiamo calcolato come se fossimo in 16:9)
    const newVFOV = 2 * Math.atan(Math.tan(initialHorizontalFOV / 2) / newAspect);
    
    camera_alt.fov = THREE.MathUtils.radToDeg(newVFOV);
    camera_alt.aspect = newAspect;
    camera_alt.updateProjectionMatrix();
    
    renderer_alt.setSize(window.innerWidth, window.innerHeight);
    adjustSphereScale();
}

function checkAltHover() {
    if (!isSceneInitialized) return;
    raycaster_alt.setFromCamera(mouse_alt, camera_alt);
    const hits = raycaster_alt.intersectObject(sphere_alt);
    window.isHoverSphere = hits.length > 0;
}

// ------------------------------
// AVVIO
// ------------------------------
// All'avvio controlliamo se dobbiamo partire o no
window.addEventListener("DOMContentLoaded", () => {
    checkResponsiveAndInit();
    
    // Aggiungiamo un listener globale per il resize che controlli l'init/destroy
    window.addEventListener("resize", checkResponsiveAndInit);
});