/**
 * Универсальная функция для обновления интерфейса после операций с заметкой
 * @param {string} operation - тип операции ('archive', 'unarchive', 'trash', 'restore', 'move')
 * @param {string|Array} noteIds - ID заметки или массив ID заметок
 * @param {Object} options - дополнительные параметры (например, целевая папка)
 */
function updateNoteInterface(operation, noteIds, options = {}) {
    // Преобразуем в массив, если передан один ID
    if (!Array.isArray(noteIds)) {
        noteIds = [noteIds];
    }
    
    console.log(`Обновление интерфейса после операции '${operation}' для ${noteIds.length} заметок:`, noteIds, options);
    
    // Определяем текущий режим просмотра
    const currentPath = window.location.pathname;
    const isArchiveMode = currentPath === '/notes/archive';
    const isTrashMode = currentPath === '/notes/trash';
    const folderMatch = currentPath.match(/\/notes\/folder\/(.+)/);
    const isFolderMode = !!folderMatch;
    const currentFolder = isFolderMode ? decodeURIComponent(folderMatch[1]) : null;
    
    // Обработка визуальных изменений на странице в зависимости от операции
    switch (operation) {
        case 'archive':
            // Если мы не в архиве, скрываем заархивированные заметки
            if (!isArchiveMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                // Если мы в архиве, обновляем весь список
                reloadCurrentView();
            }
            break;
            
        case 'unarchive':
            // Если мы в архиве, скрываем разархивированные заметки
            if (isArchiveMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                // В других случаях обновляем весь список
                reloadCurrentView();
            }
            break;
            
        case 'trash':
            // Если мы не в корзине, скрываем удаленные заметки
            if (!isTrashMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                // Если мы в корзине, обновляем весь список
                reloadCurrentView();
            }
            break;
            
        case 'restore':
            // Если мы в корзине, скрываем восстановленные заметки
            if (isTrashMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                // В других случаях обновляем весь список
                reloadCurrentView();
            }
            break;
            
        case 'move':
            const targetFolder = options.folder;
            const isCurrentTargetFolder = isFolderMode && currentFolder === targetFolder;
            
            // Если мы не в целевой папке, скрываем перемещенные заметки
            if (!isCurrentTargetFolder) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                // Если мы в целевой папке, обновляем весь список
                reloadCurrentView();
            }
            
            // Обновляем счетчик папки
            if (typeof updateFolderCounter === 'function' && targetFolder) {
                updateFolderCounter(targetFolder, noteIds.length);
            }
            break;
            
        case 'remove_from_folder':
            // Если мы в папке, скрываем заметки, убранные из папки
            if (isFolderMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
                
                // Обновляем счетчик папки
                if (typeof updateFolderCounter === 'function' && currentFolder) {
                    updateFolderCounter(currentFolder, -noteIds.length);
                }
            } else {
                // В других случаях обновляем весь список
                reloadCurrentView();
            }
            break;
            
        case 'force_delete':
            // При окончательном удалении заметки просто удаляем элемент из DOM
            noteIds.forEach(id => {
                $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                    $(this).remove();
                    checkEmptyState();
                });
            });
            break;
    }
    
    // Всегда обновляем статистику
    if (typeof loadStats === 'function') {
        setTimeout(loadStats, 500);
    }
    
    // Проверяем, нужно ли показать сообщение "Нет заметок"
    function checkEmptyState() {
        if ($('.note-wrapper:visible').length === 0) {
            // Проверяем, находимся ли мы в корзине
            if (window.location.pathname === '/notes/trash') {
                $('.trash-notes-container, .notes-container').hide();
                $('.empty-trash-container, .empty-container').removeClass('d-none');
            } else {
                $('.notes-container').hide();
                $('.empty-container').removeClass('d-none');
            }
        }
    }
    
    // Экспортируем функцию checkEmptyState глобально
    window.checkEmptyState = checkEmptyState;
    
    // Функция для полного обновления текущего представления
    function reloadCurrentView() {
        if (isTrashMode) {
            loadAllNotes(true);
        } else if (isArchiveMode) {
            loadAllNotes(false, null, true);
        } else if (isFolderMode) {
            loadAllNotes(false, currentFolder);
        } else {
            loadAllNotes(false);
        }
    }
}

// Делаем функцию доступной глобально
window.updateNoteInterface = updateNoteInterface;
