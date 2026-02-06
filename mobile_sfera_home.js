// mobile.js
// Sfera per dispositivi MOBILE (< 1024px)
// - Si orienta con l'accelerometro/giroscopio
// - Posizione CENTRALE (modificata)
// - Spin al tocco

// ------------------------------
// Variabili Globali Mobile
// ------------------------------
let scene_mob, camera_mob, renderer_mob, sphere_mob;
let textureSfondo_mob;
let isMobileInitialized = false;
let mobileAnimFrameId = null;

// Configurazione Mobile
let sphereSize_mob = 1.5; 

// Variabili Rotazione (Giroscopio)
let targetRotX = 0;
let targetRotY = 0;
let finalRotX = 0;
let finalRotY = 0;

// Animazione Spin (Tocco)
let spinAnim_mob = null;
let originalZ_mob = 0;

// ------------------------------
// Gestione Init/Destroy
// ------------------------------
function checkMobileInit() {
    const isMobileScreen = window.innerWidth < 1024;

    if (isMobileScreen) {
        if (!isMobileInitialized) {
            initMobileSphere();
        }
    } else {
        if (isMobileInitialized) {
            destroyMobileScene();
        }
    }
}

function destroyMobileScene() {
    if (!isMobileInitialized) return;

    if (mobileAnimFrameId) cancelAnimationFrame(mobileAnimFrameId);
    
    window.removeEventListener("deviceorientation", onGyroMove);
    window.removeEventListener("touchstart", onMobileTouch);
    window.removeEventListener("resize", onMobileResize);

    const container = document.getElementById("container");
    if (renderer_mob && renderer_mob.domElement && container) {
        if (container.contains(renderer_mob.domElement)) {
            container.removeChild(renderer_mob.domElement);
        }
    }

    if (sphere_mob) {
        sphere_mob.geometry.dispose();
        sphere_mob.material.dispose();
    }
    
    renderer_mob = null;
    scene_mob = null;
    camera_mob = null;
    sphere_mob = null;

    isMobileInitialized = false;
}

// ------------------------------
// Inizializzazione
// ------------------------------
function initMobileSphere() {
    const container = document.getElementById("container");
    if (!container) return;

    scene_mob = new THREE.Scene();

    camera_mob = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera_mob.position.z = 9;

    renderer_mob = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer_mob.setSize(window.innerWidth, window.innerHeight);
    renderer_mob.setPixelRatio(window.devicePixelRatio); 
    
    container.appendChild(renderer_mob.domElement);

    // Setup Texture
    const videoEl = document.getElementById("videoSfondo");
    if (videoEl) {
        videoEl.play().catch(e => console.log("Autoplay mobile limit:", e));
        textureSfondo_mob = new THREE.VideoTexture(videoEl);
        textureSfondo_mob.minFilter = THREE.LinearFilter;
        textureSfondo_mob.magFilter = THREE.LinearFilter;
    }

    createMobileSphere();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene_mob.add(ambientLight);

    // Event Listeners
    window.addEventListener("resize", onMobileResize);
    window.addEventListener("touchstart", onMobileTouch, { passive: false });
    
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", onGyroMove, true);
    }

    isMobileInitialized = true;
    animateMobile();
}

function createMobileSphere() {
    const geometry = new THREE.SphereGeometry(sphereSize_mob, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: textureSfondo_mob, side: THREE.DoubleSide });

    sphere_mob = new THREE.Mesh(geometry, material);
    sphere_mob.rotation.y = -Math.PI / 2;
    originalZ_mob = sphere_mob.rotation.z;

    // La posizione verrà impostata nel loop di animazione (al centro)
    scene_mob.add(sphere_mob);
    
    adjustMobileScale();
}

// ------------------------------
// Sincronizzazione Posizione (CENTRO SCHERMO)
// ------------------------------
function syncSpherePosition() {
    if (!sphere_mob) return;

    // Impostiamo la posizione al centro della scena (0,0)
    // Non calcoliamo più le coordinate basate sul div HTML
    const worldX = 0;
    const worldY = 0;

    // Applichiamo il leggero movimento 'floating' su Y per mantenerla viva
    const time = Date.now() * 0.001;
    const floatingOffset = Math.sin(time * 1.5) * 0.1;

    sphere_mob.position.x = worldX;
    sphere_mob.position.y = worldY + floatingOffset;
}

// ------------------------------
// Gestione Giroscopio
// ------------------------------
function onGyroMove(event) {
    if (!event) return;
    
    let beta = event.beta || 0; 
    let gamma = event.gamma || 0;

    if (beta > 45) beta = 45;
    if (beta < -45) beta = -45;
    if (gamma > 45) gamma = 45;
    if (gamma < -45) gamma = -45;

    targetRotX = (beta * Math.PI) / 180; 
    targetRotY = (gamma * Math.PI) / 180;
}

// ------------------------------
// Gestione Tocco
// ------------------------------
function onMobileTouch(event) {
    if (spinAnim_mob) return;

    // Intercettiamo il tocco per vedere se colpisce la sfera
    const touch = event.changedTouches[0];
    
    // Raycasting
    const x = (touch.clientX / window.innerWidth) * 2 - 1;
    const y = -(touch.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera_mob);

    const hits = raycaster.intersectObject(sphere_mob);

    if (hits.length > 0) {
        startMobileSpin();
    }
}

function startMobileSpin() {
    if (spinAnim_mob) cancelAnimationFrame(spinAnim_mob);

    const startZ = sphere_mob.rotation.z;
    const targetZ = startZ + (Math.PI * 4); 
    const duration = 1000;
    const startTime = performance.now();

    function spinStep(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - t, 3);
        
        sphere_mob.rotation.z = startZ + (targetZ - startZ) * ease;

        if (t < 1) {
            spinAnim_mob = requestAnimationFrame(spinStep);
        } else {
            decelerateMobileSpin();
        }
    }
    spinAnim_mob = requestAnimationFrame(spinStep);
}

function decelerateMobileSpin() {
    let speed = 0.1;
    const decay = 0.93;

    function decayStep() {
        sphere_mob.rotation.z += speed;
        speed *= decay;
        if (speed > 0.003) {
            spinAnim_mob = requestAnimationFrame(decayStep);
        } else {
            returnBounceMobile();
        }
    }
    spinAnim_mob = requestAnimationFrame(decayStep);
}

function returnBounceMobile() {
    const startZ = sphere_mob.rotation.z;
    const overshoot = originalZ_mob + 0.25;
    const duration = 500;
    const start = performance.now();

    function bounceStep(now) {
        const t = Math.min(1, (now - start) / duration);
        if (t < 0.7) {
            const tt = t / 0.7;
            sphere_mob.rotation.z = startZ + (overshoot - startZ) * (1 - Math.pow(1 - tt, 3));
        } else {
            const tt = (t - 0.7) / 0.3;
            sphere_mob.rotation.z = overshoot + (originalZ_mob - overshoot) * tt;
        }
        
        if (t < 1) {
            spinAnim_mob = requestAnimationFrame(bounceStep);
        } else {
            sphere_mob.rotation.z = originalZ_mob;
            spinAnim_mob = null;
        }
    }
    spinAnim_mob = requestAnimationFrame(bounceStep);
}

// ------------------------------
// Loop Animazione
// ------------------------------
function animateMobile() {
    if (!isMobileInitialized) return;

    mobileAnimFrameId = requestAnimationFrame(animateMobile);

    if (sphere_mob) {
        // 1. Sincronizziamo la posizione (ora fissa al centro)
        syncSpherePosition();

        // 2. Applichiamo la rotazione del giroscopio
        finalRotX += (targetRotX - finalRotX) * 0.1;
        finalRotY += (targetRotY - finalRotY) * 0.1;

        const time = Date.now() * 0.001;
        
        sphere_mob.rotation.x = finalRotX + (Math.sin(time) * 0.05);
        sphere_mob.rotation.y = (-Math.PI / 2) + finalRotY + (Math.cos(time * 0.8) * 0.05);
    }

    renderer_mob.render(scene_mob, camera_mob);
}

// ------------------------------
// Resize & Scale
// ------------------------------
function adjustMobileScale() {
    if (!sphere_mob) return;
    const scaleFactor = (window.innerWidth / 400) * 0.6; 
    sphere_mob.scale.set(scaleFactor, scaleFactor, scaleFactor);
}

function onMobileResize() {
    if (window.innerWidth >= 1024) {
        checkMobileInit();
        return;
    }

    if (camera_mob && renderer_mob) {
        camera_mob.aspect = window.innerWidth / window.innerHeight;
        camera_mob.updateProjectionMatrix();
        renderer_mob.setSize(window.innerWidth, window.innerHeight);
        adjustMobileScale();
    }
}

// ------------------------------
// Avvio
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
    checkMobileInit();
    window.addEventListener("resize", checkMobileInit);
});