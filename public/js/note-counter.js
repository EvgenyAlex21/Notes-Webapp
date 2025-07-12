function countVisibleNotes() {
    if (window.currentNotesCount) {
        return window.currentNotesCount;
    }
    
    const visibleNotes = $('.note-wrapper:visible, .note-item:visible').length;
    const activeNotes = $('.note-wrapper:visible:not(.completed), .note-item:visible:not(.completed)').length;
    const completedNotes = $('.note-wrapper:visible.completed, .note-item:visible.completed').length;
    const pinnedNotes = $('.note-wrapper:visible.pinned, .note-item:visible.pinned').length;
    
    window.currentNotesCount = {
        total: visibleNotes,
        active: activeNotes,
        completed: completedNotes,
        pinned: pinnedNotes
    };
    
    console.log('Подсчитано видимых заметок:', window.currentNotesCount);
    
    return window.currentNotesCount;
}

function updatePageCounters() {
    const counts = countVisibleNotes();
    
    $('#visible-total-notes').text(`Всего: ${counts.total}`);
    $('#visible-completed-notes').text(`Выполнено: ${counts.completed}`);
    $('#visible-active-notes').text(`Активно: ${counts.active}`);
    $('#visible-pinned-notes').text(`Закреплено: ${counts.pinned}`);
    
    $('.counter-total').text(counts.total);
    $('.counter-completed').text(counts.completed);
    $('.counter-active').text(counts.active);
    $('.counter-pinned').text(counts.pinned);
    
    console.log('Обновлены счетчики заметок:', counts);
}

function updateFolderCounter(folderName, change = 0) {
    if (!folderName) return;
    
    try {
        const folderElement = $(`.folder-link[data-folder="${folderName}"]`);
        if (folderElement.length) {
            const counterElement = folderElement.find('.badge');
            if (counterElement.length) {
                let currentCount = parseInt(counterElement.text()) || 0;
                currentCount += change;
                if (currentCount < 0) currentCount = 0;
                counterElement.text(currentCount);
                
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
 * Обновляет счётчики и данные на странице
 * @param {Object} options 
 * @param {boolean} options.updateStats 
 * @param {boolean} options.updateSidebar 
 * @param {boolean} options.updatePageCounters 
 */
function refreshAllCounters(options = {}) {
    const defaults = {
        updateStats: true,
        updateSidebar: true, 
        updatePageCounters: true
    };
    
    const settings = {...defaults, ...options};
    
    if (settings.updatePageCounters && typeof updatePageCounters === 'function') {
        updatePageCounters();
    }
    
    if (settings.updateStats && typeof loadStats === 'function') {
        loadStats();
    }
    
    if (settings.updateSidebar && typeof updateActiveSidebar === 'function') {
        updateActiveSidebar();
    }
    
    console.log('Обновлены все счетчики и данные с параметрами:', settings);
}

window.countVisibleNotes = countVisibleNotes;
window.updatePageCounters = updatePageCounters;
window.updateFolderCounter = updateFolderCounter;
window.refreshAllCounters = refreshAllCounters;

$(document).ready(function() {
    setTimeout(updatePageCounters, 500);
});
