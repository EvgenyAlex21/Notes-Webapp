/**
 * Менеджер темы для приложения заметок
 * Обеспечивает единую работу темы на всех страницах
 */

// Инициализация темы при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем тему из LocalStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Инициализируем тему
    setTheme(savedTheme);
    
    // Настраиваем переключатель темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark';
        
        // Обработчик переключения темы
        themeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});

/**
 * Устанавливает тему для всего приложения
 * @param {string} theme - Название темы ('light' или 'dark')
 */
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Обновляем состояние переключателя на всех страницах
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = theme === 'dark';
    }
}
