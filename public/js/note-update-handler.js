/**
 * Универсальная функция для обновления интерфейса
 * @param {string} operation 
 * @param {string|Array} noteIds 
 * @param {Object} options 
 */
function updateNoteInterface(operation, noteIds, options = {}) {
    if (!Array.isArray(noteIds)) {
        noteIds = [noteIds];
    }
    
    console.log(`Обновление интерфейса после операции '${operation}' для ${noteIds.length} заметок:`, noteIds, options);
    
    const currentPath = window.location.pathname;
    const isArchiveMode = currentPath === '/notes/archive';
    const isTrashMode = currentPath === '/notes/trash';
    const folderMatch = currentPath.match(/\/notes\/folder\/(.+)/);
    const isFolderMode = !!folderMatch;
    const currentFolder = isFolderMode ? decodeURIComponent(folderMatch[1]) : null;
    
    switch (operation) {
        case 'archive':
            if (!isArchiveMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                reloadCurrentView();
            }
            break;
            
        case 'unarchive':
            if (isArchiveMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                reloadCurrentView();
            }
            break;
            
        case 'trash':
            if (!isTrashMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                reloadCurrentView();
            }
            break;
            
        case 'restore':
            if (isTrashMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                reloadCurrentView();
            }
            break;
            
        case 'move':
            const targetFolder = options.folder;
            const isCurrentTargetFolder = isFolderMode && currentFolder === targetFolder;
            
            if (!isCurrentTargetFolder) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
            } else {
                reloadCurrentView();
            }
            
            if (typeof updateFolderCounter === 'function' && targetFolder) {
                updateFolderCounter(targetFolder, noteIds.length);
            }
            break;
            
        case 'remove_from_folder':
            if (isFolderMode) {
                noteIds.forEach(id => {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        checkEmptyState();
                    });
                });
                
                if (typeof updateFolderCounter === 'function' && currentFolder) {
                    updateFolderCounter(currentFolder, -noteIds.length);
                }
            } else {
                reloadCurrentView();
            }
            break;
            
        case 'force_delete':
            noteIds.forEach(id => {
                $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                    $(this).remove();
                    checkEmptyState();
                });
            });
            break;
    }
    
    if (typeof loadStats === 'function') {
        setTimeout(loadStats, 500);
    }
    
    function checkEmptyState() {
        if ($('.note-wrapper:visible').length === 0) {
            if (window.location.pathname === '/notes/trash') {
                $('.trash-notes-container, .notes-container').hide();
                $('.empty-trash-container, .empty-container').removeClass('d-none');
            } else {
                $('.notes-container').hide();
                $('.empty-container').removeClass('d-none');
            }
        }
    }
    
    window.checkEmptyState = checkEmptyState;
    
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

window.updateNoteInterface = updateNoteInterface;