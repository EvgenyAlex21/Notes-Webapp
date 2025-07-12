/**
 * Скрипт для улучшенного подсчета заметок и обновления счетчиков
 */

// Функция для подсчета видимых заметок на странице
function countVisibleNotes() {
    // Сначала проверяем, есть ли сохраненные счетчики из фактических данных
    if (window.currentNotesCount) {
        return window.currentNotesCount;
    }
    
    // Если нет, подсчитываем по DOM
    const visibleNotes = $('.note-wrapper:visible, .note-item:visible').length;
    const activeNotes = $('.note-wrapper:visible:not(.completed), .note-item:visible:not(.completed)').length;
    const completedNotes = $('.note-wrapper:visible.completed, .note-item:visible.completed').length;
    const pinnedNotes = $('.note-wrapper:visible.pinned, .note-item:visible.pinned').length;
    
    // Сохраняем для использования в других местах
    window.currentNotesCount = {
        total: visibleNotes,
        active: activeNotes,
        completed: completedNotes,
        pinned: pinnedNotes
    };
    
    console.log('Подсчитано видимых заметок:', window.currentNotesCount);
    
    return window.currentNotesCount;
}

// Функция обновления счетчиков на текущей странице
function updatePageCounters() {
    const counts = countVisibleNotes();
    
    // Обновляем счетчики на странице
    $('#visible-total-notes').text(`Всего: ${counts.total}`);
    $('#visible-completed-notes').text(`Выполнено: ${counts.completed}`);
    $('#visible-active-notes').text(`Активно: ${counts.active}`);
    $('#visible-pinned-notes').text(`Закреплено: ${counts.pinned}`);
    
    // Обновляем счетчики вверху страницы
    $('.counter-total').text(counts.total);
    $('.counter-completed').text(counts.completed);
    $('.counter-active').text(counts.active);
    $('.counter-pinned').text(counts.pinned);
    
    console.log('Обновлены счетчики заметок:', counts);
}

// Обновляем счетчик видимых заметок в папке
function updateFolderCounter(folderName, change = 0) {
    if (!folderName) return;
    
    try {
        // Ищем элемент папки в боковой панели
        const folderElement = $(`.folder-link[data-folder="${folderName}"]`);
        if (folderElement.length) {
            // Находим счетчик
            const counterElement = folderElement.find('.badge');
            if (counterElement.length) {
                // Текущее значение счетчика
                let currentCount = parseInt(counterElement.text()) || 0;
                // Обновляем значение
                currentCount += change;
                if (currentCount < 0) currentCount = 0;
                counterElement.text(currentCount);
                
                // Обновляем визуальное отображение
                if (currentCount > 0) {
                    counterElement.removeClass('d-none');
                } else {
                    counterElement.addClass('d-none');
                }
            }
        }
    } catch (e) {
        console.error('Ошибка при обновлении счетчика папки:', e);
    }
}

/**
 * Обновляет все счетчики и необходимые данные после изменений заметок или папок
 * @param {Object} options - параметры обновления
 * @param {boolean} options.updateStats - обновить общую статистику
 * @param {boolean} options.updateSidebar - обновить подсветку активного пункта меню
 * @param {boolean} options.updatePageCounters - обновить счетчики на странице
 */
function refreshAllCounters(options = {}) {
    const defaults = {
        updateStats: true,
        updateSidebar: true, 
        updatePageCounters: true
    };
    
    const settings = {...defaults, ...options};
    
    // Обновляем счетчики на текущей странице
    if (settings.updatePageCounters && typeof updatePageCounters === 'function') {
        updatePageCounters();
    }
    
    // Обновляем общую статистику
    if (settings.updateStats && typeof loadStats === 'function') {
        loadStats();
    }
    
    // Обновляем подсветку активного пункта меню
    if (settings.updateSidebar && typeof updateActiveSidebar === 'function') {
        updateActiveSidebar();
    }
    
    console.log('Обновлены все счетчики и данные с параметрами:', settings);
}

// Экспортируем функции для использования в других скриптах
window.countVisibleNotes = countVisibleNotes;
window.updatePageCounters = updatePageCounters;
window.updateFolderCounter = updateFolderCounter;
window.refreshAllCounters = refreshAllCounters;

// Обновляем счетчики при загрузке страницы
$(document).ready(function() {
    setTimeout(updatePageCounters, 500);
});
