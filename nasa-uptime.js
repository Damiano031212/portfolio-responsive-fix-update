// NASA-inspired uptime counter for home page
(function() {
    const startTime = Date.now();
    const uptimeElement = document.getElementById('uptime');
    
    if (!uptimeElement) return;
    
    function updateUptime() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        
        uptimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // Update immediately and then every second
    updateUptime();
    setInterval(updateUptime, 1000);
})();
