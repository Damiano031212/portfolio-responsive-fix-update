document.addEventListener('DOMContentLoaded', () => {
    // Force Dark Mode always
    document.body.classList.remove('light-mode');

    // Remove 'theme' from localStorage if it exists, to avoid confusion
    localStorage.removeItem('theme');
});
