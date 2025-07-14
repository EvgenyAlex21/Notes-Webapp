document.addEventListener('DOMContentLoaded', function() {
    const userPreference = document.querySelector('meta[name="theme-preference"]')?.content;
    
    let theme;
    
    if (userPreference === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
        
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                setTheme(e.matches ? 'dark' : 'light');
                localStorage.setItem('theme', e.matches ? 'dark' : 'light');
            });
    } else if (userPreference) {
        theme = userPreference;
    } else {
        theme = localStorage.getItem('theme') || 'light';
    }
    
    setTheme(theme);
    
    localStorage.setItem('theme', theme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        updateThemeToggleState(themeToggle, theme);
        
        themeToggle.addEventListener('click', function() {
            const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            
            const userId = document.querySelector('meta[name="user-id"]')?.content;
            if (userId) {
                updateUserThemePreference(newTheme);
            }
        });
    }
});

/**
 * @param {string} theme 
 */
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        updateThemeToggleState(themeToggle, theme);
    }
}

/**
 * @param {HTMLElement} toggleButton 
 * @param {string} theme 
 */
function updateThemeToggleState(toggleButton, theme) {
    const isDark = theme === 'dark';
    
    const iconElement = toggleButton.querySelector('i');
    if (iconElement) {
        iconElement.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    const textElement = toggleButton.querySelector('span');
    if (textElement) {
        textElement.textContent = isDark ? 'Светлая тема' : 'Темная тема';
    }
}

/**
 * @param {string} theme
 */
function updateUserThemePreference(theme) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    
    if (!csrfToken) return;
    
    fetch('/api/update-theme-preference', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ theme_preference: theme })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Тема пользователя успешно обновлена');
        }
    })
    .catch(error => {
        console.error('Ошибка при обновлении настроек темы:', error);
    });
}