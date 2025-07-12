/**
 * Расширенная функциональность для работы с папками
 */
$(document).ready(function() {
    console.log('Инициализация обработчиков папок...');
    
    // Обработчик для добавления новой папки
    $('#add-folder-btn').off('click').on('click', function() {
        console.log('Клик на кнопку добавления папки');
        
        // Создаем модальное окно для ввода имени папки с улучшенным дизайном
        $('body').append(`
            <div class="modal fade" id="createFolderModal" tabindex="-1" aria-labelledby="createFolderModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title" id="createFolderModalLabel">
                                <i class="fas fa-folder-plus me-2"></i>Создание новой папки
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group mb-0">
                                <input type="text" class="form-control" id="new-folder-name" placeholder="Введите название папки" autofocus>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>Отмена
                            </button>
                            <button type="button" class="btn btn-primary" id="confirm-create-folder">
                                <i class="fas fa-check me-1"></i>Создать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('createFolderModal'));
        modal.show();
        
        // Фокус на поле ввода
        $('#new-folder-name').focus();
        
        // Функция для проверки имени папки
        function validateFolderName(name) {
            if (!name || name.trim() === '') {
                return { valid: false, message: 'Имя папки не может быть пустым.' };
            }
            
            if (name.length < 2) {
                return { valid: false, message: 'Имя папки должно содержать не менее 2 символов.' };
            }
            
            // Проверка на запрещенные символы (например, специальные символы, которые могут вызывать проблемы)
            if (/[\\\/\:\*\?\"\<\>\|]/.test(name)) {
                return { valid: false, message: 'Имя папки содержит запрещенные символы (\\, /, :, *, ?, ", <, >, |).' };
            }
            
            // Проверка на существование папки с таким именем в интерфейсе
            const folderId = 'folder-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            if ($('#' + folderId).length > 0) {
                return { valid: false, message: 'Папка с таким именем уже существует.' };
            }
            
            return { valid: true };
        }
        
        // Функция для отображения ошибки в форме
        function showFolderNameError(message) {
            // Удаляем предыдущее сообщение об ошибке, если есть
            $('#folder-name-error').remove();
            
            // Добавляем новое сообщение об ошибке
            $('#new-folder-name').after(`<div id="folder-name-error" class="text-danger mt-1"><small>${message}</small></div>`);
            
            // Подсвечиваем поле ввода
            $('#new-folder-name').addClass('is-invalid');
        }
        
        // Обработчик для кнопки подтверждения
        $('#confirm-create-folder').on('click', function() {
            const folderName = $('#new-folder-name').val().trim();
            const validation = validateFolderName(folderName);
            
            if (validation.valid) {
                // Закрываем модальное окно
                modal.hide();
                
                // Удаляем модальное окно из DOM после скрытия
                $('#createFolderModal').on('hidden.bs.modal', function() {
                    $(this).remove();
                });
                
                // Создаем папку
                addFolder(folderName);
            } else {
                // Показываем ошибку
                showFolderNameError(validation.message);
            }
        });
        
        // Обработчик изменения ввода для удаления ошибки при исправлении
        $('#new-folder-name').on('input', function() {
            $('#folder-name-error').remove();
            $(this).removeClass('is-invalid');
        });
        
        // Обработчик для клавиши Enter
        $('#new-folder-name').on('keypress', function(e) {
            if (e.which === 13) {
                $('#confirm-create-folder').click();
            }
        });
    });
    
    // Инициализация обработчиков для существующих папок
    initFolderHandlers();
});

/**
 * Инициализация обработчиков для всех папок
 */
function initFolderHandlers() {
    // Обработчик для переименования папки
    $('.rename-folder').off('click').on('click', function(e) {
        e.preventDefault();
        const oldFolderName = $(this).data('folder');
        
        // Создаем модальное окно для переименования папки
        $('body').append(`
            <div class="modal fade" id="renameFolderModal" tabindex="-1" aria-labelledby="renameFolderModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title" id="renameFolderModalLabel">
                                <i class="fas fa-edit me-2"></i>Переименование папки
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group mb-0">
                                <input type="text" class="form-control" id="rename-folder-input" value="${oldFolderName}" placeholder="Введите новое название папки" autofocus>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>Отмена
                            </button>
                            <button type="button" class="btn btn-primary" id="confirm-rename-folder">
                                <i class="fas fa-check me-1"></i>Переименовать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('renameFolderModal'));
        modal.show();
        
        // Выбираем весь текст в поле ввода
        $('#rename-folder-input').select();
        
        // Функция для проверки имени папки при переименовании
        function validateRenameFolderName(name, oldName) {
            if (!name || name.trim() === '') {
                return { valid: false, message: 'Имя папки не может быть пустым.' };
            }
            
            if (name === oldName) {
                return { valid: false, message: 'Новое имя папки должно отличаться от старого.' };
            }
            
            if (name.length < 2) {
                return { valid: false, message: 'Имя папки должно содержать не менее 2 символов.' };
            }
            
            // Проверка на запрещенные символы (например, специальные символы, которые могут вызывать проблемы)
            if (/[\\\/\:\*\?\"\<\>\|]/.test(name)) {
                return { valid: false, message: 'Имя папки содержит запрещенные символы (\\, /, :, *, ?, ", <, >, |).' };
            }
            
            // Проверка на существование папки с таким именем в интерфейсе
            const folderId = 'folder-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            if ($('#' + folderId).length > 0) {
                return { valid: false, message: 'Папка с таким именем уже существует.' };
            }
            
            return { valid: true };
        }
        
        // Функция для отображения ошибки в форме переименования
        function showRenameFolderError(message) {
            // Удаляем предыдущее сообщение об ошибке, если есть
            $('#rename-folder-error').remove();
            
            // Добавляем новое сообщение об ошибке
            $('#rename-folder-input').after(`<div id="rename-folder-error" class="text-danger mt-1"><small>${message}</small></div>`);
            
            // Подсвечиваем поле ввода
            $('#rename-folder-input').addClass('is-invalid');
        }
        
        // Обработчик для кнопки подтверждения
        $('#confirm-rename-folder').on('click', function() {
            const newFolderName = $('#rename-folder-input').val().trim();
            const validation = validateRenameFolderName(newFolderName, oldFolderName);
            
            if (validation.valid) {
                // Закрываем модальное окно
                modal.hide();
                
                // Удаляем модальное окно из DOM после скрытия
                $('#renameFolderModal').on('hidden.bs.modal', function() {
                    $(this).remove();
                });
                
                // Переименовываем папку
                renameFolder(oldFolderName, newFolderName);
            } else {
                // Показываем ошибку
                showRenameFolderError(validation.message);
            }
        });
        
        // Обработчик изменения ввода для удаления ошибки при исправлении
        $('#rename-folder-input').on('input', function() {
            $('#rename-folder-error').remove();
            $(this).removeClass('is-invalid');
        });
        
        // Обработчик для клавиши Enter
        $('#rename-folder-input').on('keypress', function(e) {
            if (e.which === 13) {
                $('#confirm-rename-folder').click();
            }
        });
    });
    
    // Обработчик для удаления папки
    $('.delete-folder').off('click').on('click', function(e) {
        e.preventDefault();
        const folderName = $(this).data('folder');
        
        // Создаем модальное окно для подтверждения удаления папки
        $('body').append(`
            <div class="modal fade" id="deleteFolderModal" tabindex="-1" aria-labelledby="deleteFolderModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title text-danger" id="deleteFolderModalLabel">
                                <i class="fas fa-trash me-2"></i>Удаление папки
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Вы уверены, что хотите удалить папку <strong>"${folderName}"</strong>?</p>
                            <p class="text-muted"><i class="fas fa-info-circle me-1"></i> Заметки в папке не будут удалены, но будут перемещены в общий список.</p>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>Отмена
                            </button>
                            <button type="button" class="btn btn-danger" id="confirm-delete-folder">
                                <i class="fas fa-trash me-1"></i>Удалить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('deleteFolderModal'));
        modal.show();
        
        // Обработчик для кнопки подтверждения
        $('#confirm-delete-folder').on('click', function() {
            // Закрываем модальное окно
            modal.hide();
            
            // Удаляем модальное окно из DOM после скрытия
            $('#deleteFolderModal').on('hidden.bs.modal', function() {
                $(this).remove();
            });
            
            // Удаляем папку
            deleteFolder(folderName);
        });
    });
    
    // Обработчик для перемещения заметок в папку
    $('.move-notes-to-folder').off('click').on('click', function(e) {
        e.preventDefault();
        const folderName = $(this).data('folder');
        
        // Включаем режим выбора заметок для перемещения
        activateNotesSelectionMode(folderName);
    });
}

/**
 * Переименование папки
 * @param {string} oldName - старое название папки
 * @param {string} newName - новое название папки
 */
function renameFolder(oldName, newName) {
    // Получаем CSRF-токен
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: '/api/folders/rename',
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            old_folder: oldName,
            new_folder: newName
        }),
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Удаляем старую папку из интерфейса
                const folderId = 'folder-' + oldName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                $(`#${folderId}`).remove();
                
                // Добавляем новую папку в интерфейс
                const count = response.data.count || 0;
                addFolderToSidebar(newName, count);
                
                // Обновляем счетчики
                loadStats();
                
                showNotification('Папка успешно переименована', 'success');
            } else {
                showNotification(response.message || 'Ошибка при переименовании папки', 'warning');
            }
        },
        error: function(xhr) {
            let errorMessage = 'Ошибка при переименовании папки';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            console.error('Ошибка при переименовании папки:', xhr);
            showNotification(errorMessage, 'danger');
        }
    });
}

/**
 * Удаление папки
 * @param {string} folderName - название папки для удаления
 */
function deleteFolder(folderName) {
    // Получаем CSRF-токен
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: '/api/folders/delete',
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            folder: folderName
        }),
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Удаляем папку из интерфейса
                const folderId = 'folder-' + folderName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                $(`#${folderId}`).fadeOut(300, function() {
                    $(this).remove();
                });
                
                // Обновляем счетчики
                loadStats();
                
                showNotification('Папка успешно удалена', 'success');
                
                // Перенаправляем на главную страницу, если мы находимся в удаленной папке
                if (window.location.pathname === `/notes/folder/${encodeURIComponent(folderName)}`) {
                    window.location.href = '/notes';
                }
            } else {
                showNotification(response.message || 'Ошибка при удалении папки', 'warning');
            }
        },
        error: function(xhr) {
            let errorMessage = 'Ошибка при удалении папки';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            console.error('Ошибка при удалении папки:', xhr);
            showNotification(errorMessage, 'danger');
        }
    });
}

/**
 * Активация режима выбора заметок для перемещения в папку
 * @param {string} targetFolder - папка, в которую будут перемещены выбранные заметки
 */
function activateNotesSelectionMode(targetFolder) {
    // Проверяем, не активен ли уже режим выбора
    if ($('.notes-selection-active').length > 0) {
        return;
    }
    
    // Вычисляем отступ для индикатора активного режима
    const navbarHeight = $('.navbar').outerHeight() || 0;
    
    // Добавляем индикатор активного режима выбора заметок, с учетом отступа от верха
    $('body').append(`
        <div class="notes-selection-active position-fixed start-0 w-100 bg-info text-white p-2 d-flex justify-content-between align-items-center" 
             style="z-index: 1050; top: ${navbarHeight}px;">
            <span>
                <i class="fas fa-info-circle me-2"></i> 
                Выберите заметки для перемещения в папку <strong>"${targetFolder}"</strong>
            </span>
            <div>
                <span id="selected-notes-counter" class="badge bg-light text-dark me-2">0 выбрано</span>
                <button class="btn btn-sm btn-success me-2 move-selected-notes" data-target-folder="${targetFolder}" disabled>
                    <i class="fas fa-check"></i> Переместить выбранные
                </button>
                <button class="btn btn-sm btn-secondary cancel-selection">
                    <i class="fas fa-times"></i> Отмена
                </button>
            </div>
        </div>
    `);
    
    // Добавляем стили для корректировки отображения содержимого
    $('body').append(`
        <style id="selection-mode-styles">
            .main-content {
                margin-top: ${navbarHeight + 40}px !important;
            }
            .note-wrapper {
                position: relative;
            }
            .note-selection-checkbox {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 10;
            }
            .note-selection-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 10;
            }
            .selectable-note {
                transition: all 0.2s ease;
            }
            .selectable-note:hover {
                box-shadow: 0 0 10px rgba(0,123,255,0.5);
            }
            .selectable-note.selected {
                box-shadow: 0 0 15px rgba(40,167,69,0.7);
                transform: scale(1.01);
            }
        </style>
    `);
    
    // Добавляем чекбоксы ко всем заметкам
    $('.note-wrapper').each(function() {
        const noteId = $(this).attr('id');
        
        if (!$(this).find('.note-selection-checkbox').length) {
            // Проверяем, не находится ли заметка уже в этой папке
            const noteFolder = $(this).data('folder');
            
            // Если заметка уже в этой папке, не добавляем чекбокс
            if (noteFolder === targetFolder) {
                $(this).addClass('already-in-folder');
                $(this).find('.card-header').prepend(`
                    <div class="note-selection-badge badge bg-secondary">
                        <i class="fas fa-check"></i> Уже в папке
                    </div>
                `);
            } else {
                $(this).addClass('selectable-note');
                $(this).find('.card-header').prepend(`
                    <div class="form-check note-selection-checkbox">
                        <input class="form-check-input note-select" type="checkbox" value="${noteId}" id="select-${noteId}">
                    </div>
                `);
                
                // Делаем всю карточку кликабельной для выбора
                $(this).on('click', function(e) {
                    // Исключаем нажатия на ссылки и другие интерактивные элементы
                    if ($(e.target).is('a, button, .form-check-input') || $(e.target).parents('a, button').length) {
                        return;
                    }
                    
                    const checkbox = $(this).find('.note-select');
                    checkbox.prop('checked', !checkbox.prop('checked'));
                    checkbox.trigger('change');
                });
            }
        }
    });
    
    // Добавляем обработчик изменения состояния чекбоксов
    $('.note-select').on('change', function() {
        const selectedCount = $('.note-select:checked').length;
        $('#selected-notes-counter').text(selectedCount + ' выбрано');
        
        // Включаем/выключаем кнопку перемещения в зависимости от количества выбранных заметок
        if (selectedCount > 0) {
            $('.move-selected-notes').prop('disabled', false);
        } else {
            $('.move-selected-notes').prop('disabled', true);
        }
        
        // Добавляем/удаляем класс для визуального выделения выбранных заметок
        const noteWrapper = $(this).closest('.note-wrapper');
        if ($(this).prop('checked')) {
            noteWrapper.addClass('selected');
        } else {
            noteWrapper.removeClass('selected');
        }
    });
    
    // Обработчики для режима выбора
    // Отмена выбора
    $('.cancel-selection').on('click', function() {
        exitSelectionMode();
    });
    
    // Перемещение выбранных заметок
    $('.move-selected-notes').on('click', function() {
        const targetFolder = $(this).data('target-folder');
        const selectedNotes = $('.note-select:checked').map(function() {
            return $(this).val();
        }).get();
        
        if (selectedNotes.length === 0) {
            showNotification('Не выбрано ни одной заметки для перемещения', 'warning');
            return;
        }
        
        moveNotesToFolder(selectedNotes, targetFolder);
    });
}

/**
 * Выход из режима выбора заметок
 */
function exitSelectionMode() {
    // Удаляем индикатор режима выбора
    $('.notes-selection-active').remove();
    
    // Удаляем стили режима выбора
    $('#selection-mode-styles').remove();
    
    // Удаляем чекбоксы
    $('.note-selection-checkbox').remove();
    $('.note-selection-badge').remove();
    
    // Удаляем обработчики событий с заметок
    $('.note-wrapper').off('click');
    
    // Удаляем классы режима выбора
    $('.selectable-note').removeClass('selectable-note selected');
    $('.already-in-folder').removeClass('already-in-folder');
    
    // Возвращаем исходные отступы контента
    $('.main-content').css('margin-top', '');
}

/**
 * Перемещение выбранных заметок в папку
 * @param {Array} noteIds - массив ID заметок для перемещения
 * @param {string} folderName - название целевой папки
 */
function moveNotesToFolder(noteIds, folderName) {
    if (!noteIds || noteIds.length === 0) {
        return;
    }
    
    // Получаем CSRF-токен
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: '/api/notes/move-to-folder',
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            note_ids: noteIds,
            folder: folderName
        }),
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Обновляем интерфейс
                showNotification(`${noteIds.length} заметок перемещено в папку "${folderName}"`, 'success');
                
                // Выходим из режима выбора
                exitSelectionMode();
                
                // Обновляем счетчики
                loadStats();
                
                // Обновляем список заметок, если мы находимся в режиме отображения папки
                if (window.location.pathname.startsWith('/notes/folder/')) {
                    loadAllNotes(false);
                }
            } else {
                showNotification(response.message || 'Ошибка при перемещении заметок', 'warning');
            }
        },
        error: function(xhr) {
            let errorMessage = 'Ошибка при перемещении заметок';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            console.error('Ошибка при перемещении заметок:', xhr);
            showNotification(errorMessage, 'danger');
        }
    });
}
