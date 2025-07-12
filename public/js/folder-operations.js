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
    
    // Отображаем индикатор загрузки
    showNotification('Удаление папки...', 'info', 1000);
    
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
                console.log('Папка успешно удалена:', response.data);
                
                // Удаляем папку из интерфейса
                const folderId = 'folder-' + folderName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                $(`#${folderId}`).fadeOut(300, function() {
                    $(this).remove();
                });
                
                // Обновляем счетчики
                loadStats();
                
                // Если удаляется папка, ее заметки нужно добавить на главную страницу
                if (response.data && response.data.count > 0) {
                    console.log('Было высвобождено заметок из папки:', response.data.count);
                    
                    // Уведомляем о возвращении заметок
                    showNotification(`${response.data.count} заметок возвращено в общий список`, 'info');
                    
                    // Всегда обновляем список заметок независимо от текущей страницы
                    if (window.location.pathname === '/notes') {
                        console.log('Мы на главной странице, обновляем список заметок');
                        loadAllNotes(false);
                    } else if (window.location.pathname === '/notes/trash') {
                        loadAllNotes(true); // режим корзины
                    } else if (window.location.pathname === '/notes/archive') {
                        loadAllNotes(false, null, true); // режим архива
                    } else if (window.location.pathname.startsWith('/notes/folder/')) {
                        // Если мы в другой папке, обновляем текущий список
                        // Используем функцию getCurrentFolderNameFromUrl для надежности
                        const currentFolder = window.getCurrentFolderNameFromUrl ? 
                                             window.getCurrentFolderNameFromUrl() :
                                             decodeURIComponent(window.location.pathname.split('/').pop());
                        loadAllNotes(false, currentFolder);
                    }
                    
                    // Обновляем счетчики
                    if (typeof updatePageCounters === 'function') {
                        setTimeout(updatePageCounters, 500);
                    }
                } else {
                    showNotification('Папка успешно удалена', 'success');
                }
                
                // Перенаправляем на главную страницу, если мы находимся в удаленной папке
                if (window.location.pathname === `/notes/folder/${encodeURIComponent(folderName)}`) {
                    console.log('Мы находились в удаленной папке, перенаправляем на главную');
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
    
    console.log('Активируем режим выбора заметок для перемещения в папку:', targetFolder);
    
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
            /* Общие стили для всех заметок */
            .note-wrapper, .note-card, .note-item, .card {
                position: relative;
            }
            .note-selection-checkbox {
                position: absolute;
                top: 10px;
                left: 10px;
                z-index: 10;
            }
            .note-selection-badge {
                position: absolute;
                top: 10px;
                left: 10px;
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
            /* Убедимся, что чекбокс не перекрывается с другими элементами и имеет правильное позиционирование */
            .form-check.note-selection-checkbox {
                margin: 0;
                padding: 0;
                min-height: auto;
                z-index: 15;
            }
            .form-check-input.note-select {
                margin-top: 0;
                margin-left: 0;
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
        </style>
    `);
    
    // Добавляем чекбоксы ко всем заметкам
    // Находим заметки с разной структурой - учитываем все возможные варианты классов
    let noteElements = $('.note-wrapper, .note-card, .note-item, .card').filter(function() {
        // Фильтруем только элементы, которые действительно являются заметками
        // Проверяем наличие ID или data-id для заметок
        const noteId = $(this).attr('id') ? ($(this).attr('id').startsWith('note-') ? $(this).attr('id').replace('note-', '') : $(this).attr('id')) : null;
        const dataId = $(this).data('id');
        const isNoteElement = noteId || dataId || 
               ($(this).find('h4').length > 0 && !$(this).parents('.note-wrapper, .note-card, .note-item').length);
        
        // Проверяем наличие вложенной структуры заметок, чтобы избежать дублирования
        const hasParentNoteElement = $(this).parents('.note-wrapper, .note-card, .note-item, .card').length > 0;
        
        return isNoteElement && !hasParentNoteElement;
    });
    
    console.log('Найдено элементов заметок:', noteElements.length);
    
    // Если заметок не найдено, проверим другие варианты
    if (noteElements.length === 0) {
        console.log('Альтернативный поиск заметок в DOM...');
        // Ищем элементы, которые могут быть заметками по их содержимому
        noteElements = $('div').filter(function() {
            return $(this).find('h4:contains("Заметка")').length > 0 || 
                   $(this).find('.note-description').length > 0;
        });
        console.log('Найдено элементов заметок (альтернативный поиск):', noteElements.length);
    }
    
    noteElements.each(function() {
        // Получаем ID заметки из разных возможных источников
        const noteId = $(this).attr('id') || $(this).data('id') || $(this).find('[data-id]').data('id');
        console.log('Обрабатываем заметку:', noteId);
        
        if (!noteId) {
            console.log('Пропускаем элемент без ID');
            return; // Пропускаем элементы без ID
        }
        
        if (!$(this).find('.note-selection-checkbox').length) {
            // Проверяем, не находится ли заметка уже в этой папке
            const noteFolder = $(this).data('folder');
            console.log('Папка заметки:', noteFolder, 'Целевая папка:', targetFolder);
            
            // Если заметка уже в этой папке, не добавляем чекбокс
            if (noteFolder === targetFolder) {
                $(this).addClass('already-in-folder');
                // Найдем заголовок заметки или другой подходящий элемент
                const headerElement = $(this).find('.card-header, .card-title, .note-header, h4').first();
                if (headerElement.length > 0) {
                    // Добавляем бэйдж внутрь заголовка, в начало
                    headerElement.prepend(`
                        <div class="note-selection-badge badge bg-secondary">
                            <i class="fas fa-check"></i> Уже в папке
                        </div>
                    `);
                } else {
                    // Если заголовок не найден, добавляем в начало самой заметки
                    $(this).prepend(`
                        <div class="note-selection-badge badge bg-secondary">
                            <i class="fas fa-check"></i> Уже в папке
                        </div>
                    `);
                }
            } else {
                $(this).addClass('selectable-note');
                
                // Добавляем чекбокс в контейнер заметки, но не внутрь заголовка
                // Это позволит избежать наложения на заголовок
                $(this).addClass('note-with-checkbox');
                
                // Получаем правильный ID заметки для значения чекбокса
                const dataId = $(this).data('id');
                const idForCheckbox = dataId || noteId;
                
                // Добавляем стилизованный чекбокс в верхний левый угол карточки заметки
                $(this).prepend(`
                    <div class="form-check note-selection-checkbox">
                        <input class="form-check-input note-select" type="checkbox" value="${idForCheckbox}" id="select-${idForCheckbox}">
                    </div>
                `);
                
                // Добавляем стили для корректного позиционирования
                $("<style>")
                    .prop("type", "text/css")
                    .html(`
                        .note-with-checkbox {
                            position: relative !important;
                        }
                        .note-selection-checkbox {
                            position: absolute !important;
                            top: 10px !important;
                            left: 10px !important;
                            z-index: 100 !important;
                            margin: 0 !important;
                            background-color: rgba(255, 255, 255, 0.8) !important;
                            border-radius: 50% !important;
                            width: 24px !important;
                            height: 24px !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                        }
                        .note-with-checkbox .card-header,
                        .note-with-checkbox h4,
                        .note-with-checkbox .note-title {
                            padding-left: 30px !important;
                        }
                    `)
                    .appendTo("head");
                
                // Делаем всю карточку кликабельной для выбора
                $(this).off('click.noteSelect').on('click.noteSelect', function(e) {
                    // Исключаем нажатия на ссылки и другие интерактивные элементы
                    if ($(e.target).is('a, button, .form-check-input') || $(e.target).parents('a, button, .form-check').length) {
                        return;
                    }
                    
                    const checkbox = $(this).find('.note-select');
                    if (checkbox.length > 0) {
                        checkbox.prop('checked', !checkbox.prop('checked'));
                        checkbox.trigger('change');
                    }
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
            // Получаем ID заметки из разных возможных атрибутов
            const noteWrapper = $(this).closest('.note-wrapper, .note-card, .note-item');
            let noteId = noteWrapper.data('id');
            
            // Если data-id не найден, пробуем получить из id атрибута
            if (!noteId && noteWrapper.attr('id')) {
                const idAttr = noteWrapper.attr('id');
                if (idAttr.startsWith('note-')) {
                    noteId = idAttr.replace('note-', '');
                } else {
                    noteId = idAttr;
                }
            }
            
            console.log('Выбранная заметка:', { noteId, wrapper: noteWrapper.attr('id') });
            return noteId;
        }).get();
        
        if (selectedNotes.length === 0) {
            showNotification('Не выбрано ни одной заметки для перемещения', 'warning');
            return;
        }
        
        console.log('Перемещение выбранных заметок в папку:', targetFolder);
        console.log('Выбранные заметки:', selectedNotes);
        
        moveNotesToFolder(selectedNotes, targetFolder);
    });
}

/**
 * Выход из режима выбора заметок
 */
function exitSelectionMode() {
    console.log('Выход из режима выбора заметок');
    
    // Удаляем индикатор режима выбора
    $('.notes-selection-active').remove();
    
    // Удаляем стили режима выбора
    $('#selection-mode-styles').remove();
    
    // Удаляем чекбоксы и значки
    $('.note-selection-checkbox').remove();
    $('.note-selection-badge').remove();
    
    // Удаляем обработчики событий и классы с заметок
    $('.note-wrapper, .note-card, .note-item, .card').off('click.noteSelect')
                                                     .removeClass('selectable-note')
                                                     .removeClass('selected')
                                                     .removeClass('already-in-folder');
    
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
    console.log('Перемещение заметок в папку:', folderName);
    console.log('Идентификаторы заметок:', noteIds);
    
    if (!noteIds || noteIds.length === 0) {
        showNotification('Не выбрано ни одной заметки для перемещения', 'warning');
        return;
    }
    
    // Получаем CSRF-токен
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    if (!csrfToken) {
        console.error('CSRF токен не найден. Убедитесь, что мета-тег с csrf-token присутствует на странице.');
        showNotification('Ошибка безопасности: CSRF токен не найден', 'danger');
        return;
    }
    
    // Отображаем индикатор загрузки
    $('.move-selected-notes').prop('disabled', true)
                            .html('<i class="fas fa-spinner fa-spin"></i> Перемещение...');
    
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
        timeout: 10000, // Увеличиваем тайм-аут до 10 секунд
        dataType: 'json',
        success: function(response) {
            console.log('Ответ от сервера:', response);
            
            if (response.success) {
                // Обновляем интерфейс
                showNotification(`${noteIds.length} заметок перемещено в папку "${folderName}"`, 'success');
                
                // Выводим дополнительную информацию
                console.log('Успешно перемещено заметок:', response.data?.count);
                console.log('Целевая папка:', response.data?.folder);
                
                // Обрабатываем успешное перемещение заметок
                handleSuccessfulNoteMove(noteIds, folderName, window.location.pathname.startsWith(`/notes/folder/${encodeURIComponent(folderName)}`));
                
                // Выходим из режима выбора
                exitSelectionMode();
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

/**
 * Обработчик успешного перемещения заметок в папку
 * @param {Array} noteIds - идентификаторы перемещенных заметок
 * @param {string} targetFolder - целевая папка
 * @param {boolean} isCurrentFolder - true, если текущая открытая папка совпадает с целевой
 */
function handleSuccessfulNoteMove(noteIds, targetFolder, isCurrentFolder) {
    console.log('Обработка успешного перемещения заметок в папку:', 
                { noteIds, targetFolder, isCurrentFolder });
    
    // Используем универсальную функцию обновления интерфейса, если она доступна
    if (typeof updateNoteInterface === 'function') {
        updateNoteInterface('move', noteIds, { folder: targetFolder });
    } else {
        // Запасной вариант, если универсальная функция недоступна
        // Если не в текущей папке, скрываем заметки с анимацией
        if (!isCurrentFolder) {
            noteIds.forEach(id => {
                $(`#note-${id}`).fadeOut(300, function() {
                    $(this).remove();
                });
            });
        }
        
        // Обновляем счетчик папки
        if (typeof updateFolderCounter === 'function') {
            updateFolderCounter(targetFolder, noteIds.length);
            console.log('Обновлен счетчик папки:', targetFolder, '+', noteIds.length);
        }
        
        // Обновляем счетчики заметок на текущей странице
        if (typeof updatePageCounters === 'function') {
            setTimeout(updatePageCounters, 350);
        }
        
        // Обновляем статистику
        if (typeof loadStats === 'function') {
            setTimeout(loadStats, 500);
        }
    }
    
    // Обновляем подсветку активной папки
    if (typeof updateActiveSidebar === 'function') {
        setTimeout(updateActiveSidebar, 350);
    }
}
