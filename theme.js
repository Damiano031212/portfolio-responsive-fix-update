document.addEventListener('DOMContentLoaded', () => {
    // 1. Check persistence or default to 'dark'
    const savedTheme = localStorage.getItem('theme') || 'dark';

    // 2. Apply theme immediately
    applyTheme(savedTheme);

    // 3. Find the toggle switch (only exists on Home usually, but check anyway)
    const toggleInput = document.getElementById('input');

    if (toggleInput) {
        // Sync switch state: checked = dark, unchecked = light
        toggleInput.checked = (savedTheme === 'dark');

        // 4. Listen for changes
        toggleInput.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}
