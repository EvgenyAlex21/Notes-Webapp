// Глобальные переменные для всего файла
let selectedColor = 'default';
let currentTags = [];
let currentSort = 'date-new';
let currentTheme = localStorage.getItem('theme') || 'light';
let statsData = {};

$(document).ready(function() {
    // Текущий URL
    const currentPath = window.location.pathname;
    
    // Инициализация локальных переменных
    let trashMode = currentPath === '/notes/trash';
    let archiveMode = currentPath === '/notes/archive';
    
    // Инициализация темы
    initTheme();
    
    // Инициализация цветового выбора
    $('.color-option').on('click', function() {
        $('.color-option').removeClass('selected');
        $(this).addClass('selected');
        selectedColor = $(this).data('color');
    });
    
    // Обработка ввода тегов
    $('#tag-input').on('keydown', function(e) {
        if (e.key === 'Enter' && $(this).val().trim() !== '') {
            e.preventDefault();
            const tagText = $(this).val().trim();
            
            // Проверяем, что такой тег еще не добавлен
            if (!currentTags.includes(tagText)) {
                currentTags.push(tagText);
                
                // Создаем элемент тега
                const tagElement = $(`
                    <div class="tag" data-tag="${tagText}">
                        ${tagText}
                        <span class="remove-tag ms-1">&times;</span>
                    </div>
                `);
                
                // Добавляем перед input
                $(this).before(tagElement);
                $(this).val('');
                
                // Обработчик для удаления тега
                $('.remove-tag').off('click').on('click', function() {
                    const tag = $(this).parent().data('tag');
                    currentTags = currentTags.filter(t => t !== tag);
                    $(this).parent().remove();
                });
            }
        }
    });
    
    // Получение списка всех заметок
    if (currentPath === '/notes' || currentPath === '/notes/trash') {
        loadAllNotes(trashMode);
        
        // Обработчики фильтров
        $('#filter-pinned').on('change', function() {
            applyFilters();
        });
        
        $('#filter-completed').on('change', function() {
            applyFilters();
        });
        
        $('.filter-btn').on('click', function() {
            $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
            $(this).removeClass('btn-outline-secondary').addClass('btn-secondary');
            applyFilters();
        });
        
        $('#search-notes').on('input', function() {
            applyFilters();
        });
        
        // Очистка корзины
        $('#empty-trash').on('click', function() {
            if (confirm('Вы уверены, что хотите окончательно удалить все заметки из корзины?')) {
                emptyTrash();
            }
        });
    }
    
    // Загрузка данных для редактирования
    if (currentPath.match(/\/notes\/\d+\/edit/)) {
        const id = $('#note-id').val();
        loadNote(id);
    }
    
    // Обработка создания заметки
    $('#save-button').on('click', function(e) {
        e.preventDefault();
        console.log('Кнопка "Сохранить" нажата');
        createNote();
    });
    
    // Обработка формы создания при нажатии Enter
    $('#create-note-form').on('submit', function(e) {
        e.preventDefault();
        console.log('Форма отправлена');
        createNote();
    });
    
    // Обработка обновления заметки
    $('#update-button').on('click', function(e) {
        e.preventDefault();
        console.log('Кнопка "Сохранить изменения" нажата');
        const id = $('#note-id').val();
        updateNote(id);
    });
    
    // Обработка формы редактирования при нажатии Enter
    $('#edit-note-form').on('submit', function(e) {
        e.preventDefault();
        console.log('Форма редактирования отправлена');
        const id = $('#note-id').val();
        updateNote(id);
    });
    
    // Обработка удаления заметки
    $('#delete-button').on('click', function() {
        const id = $('#note-id').val();
        deleteNote(id);
    });
    
    // Обработка закрепления заметки
    $('#toggle-pin-button').on('click', function() {
        const id = $('#note-id').val();
        togglePin(id);
    });
    
    // Инициализация темы
    initTheme();
    
    // Обработка переключения темы
    $('#theme-toggle').on('change', function() {
        toggleTheme();
    });
    
    // Обработчик для поля поиска
    $('#search-notes').on('input', function() {
        const query = $(this).val().trim();
        performSearch(query);
        applyFilters();
    });
    
    // Обработчик для очистки поиска
    $('#search-clear').on('click', function() {
        $('#search-notes').val('');
        $('#search-results').empty().hide();
        applyFilters();
    });
    
    // Обработчик для сортировки
    $('.sort-option').on('click', function(e) {
        e.preventDefault();
        const sortType = $(this).data('sort');
        applySorting(sortType);
    });
    
    // Обработчик для добавления папки
    $('#add-folder-btn').on('click', function() {
        const folderName = prompt('Введите название папки:');
        if (folderName) {
            addFolder(folderName);
        }
    });
    
    // Если мы находимся на странице календаря
    if (currentPath === '/notes/calendar') {
        initCalendar();
    }
});

// Загрузка всех заметок
function loadAllNotes(trashMode = false) {
    let url = `/api/notes`;
    if (trashMode) {
        url += '?trash=true';
    }
    
    // Обновляем статистику
    loadStats();
    
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const notes = response.data;
            $('.notes-container').empty();
            
            if (notes.length === 0) {
                $('.notes-container').hide();
                $('.empty-container').removeClass('d-none');
                return;
            }
            
            $('.notes-container').show();
            $('.empty-container').addClass('d-none');
            
            // Сначала добавляем закрепленные заметки
            const pinnedNotes = notes.filter(note => note.is_pinned);
            const regularNotes = notes.filter(note => !note.is_pinned);
            
            // Функция для генерации HTML заметки
            const generateNoteHTML = (note, isPinned = false) => {
                // Получаем массив тегов, если они есть
                const tagsArray = note.tags ? note.tags.split(',') : [];
                const tagsHTML = tagsArray.length > 0 ? 
                    `<div class="mt-2">
                        ${tagsArray.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>` : '';
                
                return `
                    <div class="note-item note-wrapper ${note.color} ${note.done ? 'completed' : ''} ${isPinned ? 'pinned' : ''}" 
                         id="${note.id}" data-color="${note.color}" data-done="${note.done}" 
                         data-pinned="${note.is_pinned}" data-tags="${note.tags || ''}">
                         
                        ${isPinned ? '<span class="badge pin-badge">Закреплено</span>' : ''}
                        
                        <div class="row">
                            <div class="col-md-8">
                                <h4>${note.name}</h4>
                                <div class="note-description">${note.description}</div>
                                
                                <div class="mt-2">
                                    <span class="badge ${note.done ? 'bg-success' : 'bg-warning'}">
                                        ${note.done ? 'Выполнено' : 'В процессе'}
                                    </span>
                                </div>
                                
                                ${tagsHTML}
                            </div>
                            <div class="col-md-4 text-end note-actions">
                                ${trashMode ? `
                                    <button class="btn btn-success btn-sm restore-btn" data-id="${note.id}" title="Восстановить">
                                        <i class="fas fa-trash-restore"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm force-delete-btn" data-id="${note.id}" title="Удалить навсегда">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                ` : `
                                    <button class="btn btn-outline-warning btn-sm toggle-pin-btn" data-id="${note.id}" title="${note.is_pinned ? 'Открепить' : 'Закрепить'}">
                                        <i class="fas fa-thumbtack"></i>
                                    </button>
                                    <a href="/notes/${note.id}/edit" class="btn btn-outline-primary btn-sm" title="Редактировать">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <button class="btn btn-outline-danger btn-sm delete-btn" data-id="${note.id}" title="Удалить">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            };
            
            // Добавляем закрепленные заметки
            pinnedNotes.forEach(note => {
                $('.notes-container').append(generateNoteHTML(note, true));
            });
            
            // Затем добавляем обычные заметки
            regularNotes.forEach(note => {
                $('.notes-container').append(generateNoteHTML(note, false));
            });
            
            // Добавляем обработчики событий
            if (trashMode) {
                // Восстановление заметки
                $('.restore-btn').on('click', function() {
                    const noteId = $(this).data('id');
                    restoreNote(noteId);
                });
                
                // Окончательное удаление заметки
                $('.force-delete-btn').on('click', function() {
                    const noteId = $(this).data('id');
                    forceDeleteNote(noteId);
                });
            } else {
                // Удаление заметки (перемещение в корзину)
                $('.delete-btn').on('click', function() {
                    const noteId = $(this).data('id');
                    deleteNote(noteId);
                });
                
                // Закрепление/открепление заметки
                $('.toggle-pin-btn').on('click', function() {
                    const noteId = $(this).data('id');
                    togglePin(noteId);
                });
            }
            
            // Применяем текущие фильтры
            applyFilters();
        },
        error: function(error) {
            console.error('Ошибка при загрузке заметок:', error);
            $('.notes-container').html('<p class="text-danger">Ошибка при загрузке заметок</p>');
        }
    });
}

// Загрузка одной заметки
function loadNote(id) {
    $.ajax({
        url: `/api/notes/${id}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const note = response.data;
            
            // Заполняем основные поля
            $('#name').val(note.name);
            $('#description').val(note.description);
            $('#done').prop('checked', note.done);
            
            // Выбираем цвет
            $('.color-option').removeClass('selected');
            $(`.color-option[data-color="${note.color || 'default'}"]`).addClass('selected');
            
            // Отображаем дату создания/обновления
            const createdAt = new Date(note.created_at);
            const updatedAt = new Date(note.updated_at);
            const formattedDate = `Создано: ${formatDate(createdAt)}${createdAt.getTime() !== updatedAt.getTime() ? ` • Обновлено: ${formatDate(updatedAt)}` : ''}`;
            $('#note-date').text(formattedDate);
            
            // Обновляем состояние кнопки закрепления
            updatePinButtonState(note.is_pinned);
            
            // Загружаем теги
            if (note.tags) {
                const tagsList = note.tags.split(',');
                currentTags = tagsList;
                
                // Очищаем контейнер тегов (оставляем только input)
                $('#tags-container').find('.tag').remove();
                
                // Добавляем теги
                tagsList.forEach(tag => {
                    $('#tag-input').before(`
                        <div class="tag" data-tag="${tag}">
                            ${tag}
                            <span class="remove-tag ms-1">&times;</span>
                        </div>
                    `);
                });
                
                // Обработчик для удаления тега
                $('.remove-tag').off('click').on('click', function() {
                    const tag = $(this).parent().data('tag');
                    currentTags = currentTags.filter(t => t !== tag);
                    $(this).parent().remove();
                });
            }
        },
        error: function(error) {
            console.error('Ошибка при загрузке заметки:', error);
            alert('Ошибка при загрузке заметки');
        }
    });
}

// Функция для форматирования даты
function formatDate(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Обновление состояния кнопки закрепления
function updatePinButtonState(isPinned) {
    if (isPinned) {
        $('#toggle-pin-button')
            .removeClass('btn-outline-warning')
            .addClass('btn-warning')
            .attr('title', 'Открепить')
            .html('<i class="fas fa-thumbtack"></i> Закреплено');
    } else {
        $('#toggle-pin-button')
            .removeClass('btn-warning')
            .addClass('btn-outline-warning')
            .attr('title', 'Закрепить')
            .html('<i class="fas fa-thumbtack"></i>');
    }
}

// Создание заметки
function createNote() {
    // Используем глобальную переменную selectedColor
    const noteColor = $('.color-option.selected').data('color');
    
    // Убедимся, что currentTags существует
    if (typeof currentTags === 'undefined') {
        currentTags = [];
        console.log('Инициализирована пустая переменная currentTags');
    }
    
    const data = {
        name: $('#name').val(),
        description: $('#description').val(),
        color: noteColor || 'default',
        is_pinned: $('#is_pinned').is(':checked'),
        tags: (currentTags && currentTags.length > 0) ? currentTags.join(',') : null
    };
    
    if (!data.name || !data.description) {
        showNotification('Пожалуйста, заполните название и описание заметки', 'warning');
        return;
    }
    
    console.log('Отправляю данные на сервер:', data);
    
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Проверяем наличие CSRF-токена
    if (!csrfToken) {
        console.error('CSRF-токен отсутствует');
        showNotification('Ошибка безопасности: отсутствует CSRF-токен', 'danger');
        return;
    }
    
    console.log('CSRF-токен получен:', csrfToken);
    
    $.ajax({
        url: '/api/notes',
        type: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(data),
        processData: false,
        success: function(response) {
            console.log('Успешно создана заметка:', response);
            showNotification('Заметка успешно создана', 'success');
            
            // Небольшая задержка перед перенаправлением
            setTimeout(() => {
                window.location.href = '/notes';
            }, 1000);
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при создании заметки:', xhr.responseText);
            console.error('Статус ошибки:', status);
            console.error('Текст ошибки:', error);
            
            let errorMessage = 'Неизвестная ошибка';
            try {
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = response.message || errorMessage;
                }
            } catch (e) {
                console.error('Ошибка при парсинге ответа:', e);
            }
            
            showNotification('Ошибка при создании заметки: ' + errorMessage, 'danger');
        }
    });
}

// Функция для отображения красивых уведомлений
function showNotification(message, type = 'info', duration = 3000) {
    // Удаляем существующие уведомления, если они есть
    $('.notification-toast').remove();
    
    // Создаем HTML для уведомления
    const toast = $(`
        <div class="toast notification-toast align-items-center text-white bg-${type} border-0 position-fixed show" 
             role="alert" aria-live="assertive" aria-atomic="true" style="top: 20px; right: 20px; z-index: 9999;">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `);
    
    // Добавляем в DOM
    $('body').append(toast);
    
    // Создаем контейнер для тостов, если его нет
    if ($('.toast-container').length === 0) {
        $('body').append('<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>');
    }
    
    // Показываем уведомление
    toast.show();
    
    // Обработчик на кнопку закрытия
    toast.find('.btn-close').on('click', function() {
        toast.hide();
        setTimeout(() => toast.remove(), 500);
    });
    
    // Удаляем через указанный интервал
    setTimeout(() => {
        toast.hide();
        setTimeout(() => toast.remove(), 500);
    }, duration);
}

// Обновление заметки
function updateNote(id) {
    // Получаем выбранный цвет
    const noteColor = $('.color-option.selected').data('color');
    
    // Убедимся, что currentTags существует
    if (typeof currentTags === 'undefined') {
        currentTags = [];
        console.log('Инициализирована пустая переменная currentTags в updateNote');
    }
    
    const data = {
        name: $('#name').val(),
        description: $('#description').val(),
        done: $('#done').is(':checked'),
        color: noteColor || 'default',
        tags: (currentTags && currentTags.length > 0) ? currentTags.join(',') : null
    };
    
    if (!data.name || !data.description) {
        showNotification('Пожалуйста, заполните название и описание заметки', 'warning');
        return;
    }
    
    console.log('Обновляю заметку:', id, data);
    
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Проверяем наличие CSRF-токена
    if (!csrfToken) {
        console.error('CSRF-токен отсутствует');
        showNotification('Ошибка безопасности: отсутствует CSRF-токен', 'danger');
        return;
    }
    
    console.log('CSRF-токен получен:', csrfToken);
    
    $.ajax({
        url: `/api/notes/${id}`,
        type: 'PUT',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(data),
        processData: false,
        success: function(response) {
            console.log('Заметка успешно обновлена:', response);
            showNotification('Заметка успешно обновлена', 'success');
            
            // Обновляем значения полей на форме
            const note = response.data;
            $('#name').val(note.name);
            $('#description').val(note.description);
            $('#done').prop('checked', note.done);
            
            // Обновляем дату
            const updatedAt = new Date(note.updated_at);
            const createdAt = new Date(note.created_at);
            const formattedDate = `Создано: ${formatDate(createdAt)}${createdAt.getTime() !== updatedAt.getTime() ? ` • Обновлено: ${formatDate(updatedAt)}` : ''}`;
            $('#note-date').text(formattedDate);
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при обновлении заметки:', xhr.responseText);
            console.error('Статус ошибки:', status);
            console.error('Текст ошибки:', error);
            
            let errorMessage = 'Неизвестная ошибка';
            try {
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = response.message || errorMessage;
                }
            } catch (e) {
                console.error('Ошибка при парсинге ответа:', e);
            }
            
            showNotification('Ошибка при обновлении заметки: ' + errorMessage, 'danger');
        }
    });
}

// Удаление заметки (перемещение в корзину)
function deleteNote(id) {
    if (!confirm('Вы действительно хотите переместить эту заметку в корзину?')) {
        return;
    }
    
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}`,
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        success: function() {
            showNotification('Заметка перемещена в корзину', 'info');
            
            // Если мы на странице редактирования, перенаправляем на список
            if (window.location.pathname.match(/\/notes\/\d+\/edit/)) {
                setTimeout(() => {
                    window.location.href = '/notes';
                }, 1000);
            } else {
                // Если мы на странице списка, анимируем удаление элемента
                $(`.note-wrapper#${id}`).fadeOut(300, function() {
                    $(this).remove();
                    
                    // Проверим, остались ли ещё заметки
                    if ($('.note-wrapper:visible').length === 0) {
                        $('.notes-container').hide();
                        $('.empty-container').removeClass('d-none');
                    }
                });
            }
        },
        error: function(error) {
            console.error('Ошибка при удалении заметки:', error);
            showNotification('Ошибка при удалении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}

// Восстановление заметки из корзины
function restoreNote(id) {
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}/restore`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        success: function() {
            showNotification('Заметка восстановлена', 'success');
            
            // Удаляем элемент из списка
            $(`.note-wrapper#${id}`).fadeOut(300, function() {
                $(this).remove();
                
                // Проверим, остались ли ещё заметки
                if ($('.note-wrapper:visible').length === 0) {
                    $('.notes-container').hide();
                    $('.empty-container').removeClass('d-none');
                }
            });
        },
        error: function(error) {
            console.error('Ошибка при восстановлении заметки:', error);
            showNotification('Ошибка при восстановлении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}

// Окончательное удаление заметки
function forceDeleteNote(id) {
    if (!confirm('Вы действительно хотите удалить эту заметку навсегда? Это действие нельзя отменить.')) {
        return;
    }
    
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}/force`,
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        success: function() {
            showNotification('Заметка окончательно удалена', 'warning');
            
            // Удаляем элемент из списка
            $(`.note-wrapper#${id}`).fadeOut(300, function() {
                $(this).remove();
                
                // Проверим, остались ли ещё заметки
                if ($('.note-wrapper:visible').length === 0) {
                    $('.notes-container').hide();
                    $('.empty-container').removeClass('d-none');
                }
            });
        },
        error: function(error) {
            console.error('Ошибка при удалении заметки:', error);
            showNotification('Ошибка при удалении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}

// Очистка корзины (удаление всех заметок)
function emptyTrash() {
    // Получаем все идентификаторы заметок в корзине
    const noteIds = Array.from($('.note-wrapper')).map(el => $(el).attr('id'));
    
    if (noteIds.length === 0) {
        showNotification('Корзина уже пуста', 'info');
        return;
    }
    
    // Последовательно удаляем каждую заметку
    let deletedCount = 0;
    
    noteIds.forEach(id => {
        $.ajax({
            url: `/api/notes/${id}/force`,
            method: 'DELETE',
            dataType: 'json',
            contentType: 'application/json',
            success: function() {
                deletedCount++;
                $(`.note-wrapper#${id}`).fadeOut(300, function() {
                    $(this).remove();
                    
                    // Если все заметки удалены
                    if (deletedCount === noteIds.length) {
                        showNotification('Корзина очищена', 'success');
                        $('.notes-container').hide();
                        $('.empty-container').removeClass('d-none');
                    }
                });
            },
            error: function(error) {
                console.error(`Ошибка при удалении заметки ${id}:`, error);
            }
        });
    });
}

// Закрепление/открепление заметки
function togglePin(id) {
    $.ajax({
        url: `/api/notes/${id}/toggle-pin`,
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        success: function(response) {
            const note = response.data;
            
            // Если мы на странице редактирования
            if (window.location.pathname.match(/\/notes\/\d+\/edit/)) {
                updatePinButtonState(note.is_pinned);
                showNotification(note.is_pinned ? 'Заметка закреплена' : 'Заметка откреплена', 'info');
            } 
            // Если мы на странице списка
            else {
                loadAllNotes(window.location.pathname === '/notes/trash');
                showNotification(note.is_pinned ? 'Заметка закреплена' : 'Заметка откреплена', 'info');
            }
        },
        error: function(error) {
            console.error('Ошибка при изменении статуса закрепления:', error);
            showNotification('Ошибка при изменении статуса закрепления', 'danger');
        }
    });
}

// Фильтрация заметок
function applyFilters() {
    // Получаем параметры фильтрации
    const showOnlyPinned = $('#filter-pinned').is(':checked');
    const showOnlyCompleted = $('#filter-completed').is(':checked');
    const searchQuery = $('#search-notes').val().toLowerCase();
    const activeFilter = $('.filter-btn.btn-secondary').data('filter');
    
    // Перебираем все заметки и скрываем/показываем их в соответствии с фильтрами
    $('.note-wrapper').each(function() {
        let shouldShow = true;
        
        // Фильтр по закрепленным
        if (showOnlyPinned && $(this).data('pinned') !== true) {
            shouldShow = false;
        }
        
        // Фильтр по выполненным
        if (showOnlyCompleted && $(this).data('done') !== true) {
            shouldShow = false;
        }
        
        // Фильтр по активным/выполненным/всем
        if (activeFilter === 'active' && $(this).data('done') === true) {
            shouldShow = false;
        } else if (activeFilter === 'completed' && $(this).data('done') !== true) {
            shouldShow = false;
        }
        
        // Поиск по тексту
        if (searchQuery) {
            const title = $(this).find('h4').text().toLowerCase();
            const description = $(this).find('.note-description').text().toLowerCase();
            const tags = $(this).data('tags') ? $(this).data('tags').toLowerCase() : '';
            
            if (!title.includes(searchQuery) && !description.includes(searchQuery) && !tags.includes(searchQuery)) {
                shouldShow = false;
            }
        }
        
        // Показываем или скрываем заметку
        if (shouldShow) {
            $(this).fadeIn(300);
        } else {
            $(this).fadeOut(300);
        }
    });
    
    // Проверяем, есть ли видимые заметки после фильтрации
    setTimeout(() => {
        const visibleNotes = $('.note-wrapper:visible').length;
        
        if (visibleNotes === 0) {
            // Показываем сообщение о том, что ничего не найдено
            if ($('.no-results').length === 0) {
                $('.notes-container').append(`
                    <div class="no-results alert alert-info text-center my-4">
                        <i class="fas fa-search mb-3" style="font-size: 2rem;"></i>
                        <h5>Ничего не найдено</h5>
                        <p>Попробуйте изменить параметры поиска</p>
                    </div>
                `);
            } else {
                $('.no-results').fadeIn(300);
            }
        } else {
            $('.no-results').fadeOut(300, function() {
                $(this).remove();
            });
        }
    }, 350);
}

// Функция загрузки статистики
function loadStats() {
    $.ajax({
        url: '/api/stats',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            statsData = response.data;
            updateStatsDisplay();
        },
        error: function(error) {
            console.error('Ошибка при загрузке статистики:', error);
        }
    });
}

// Обновление отображения статистики
function updateStatsDisplay() {
    if (statsData) {
        $('#total-notes').text(`Всего: ${statsData.total || 0}`);
        $('#completed-notes').text(`Выполнено: ${statsData.completed || 0}`);
        $('#active-notes').text(`Активно: ${statsData.active || 0}`);
        $('#pinned-notes').text(`Закреплено: ${statsData.pinned || 0}`);
    }
}

// Инициализация темы
function initTheme() {
    if (currentTheme === 'dark') {
        $('body').addClass('dark-theme');
        $('#theme-toggle').prop('checked', true);
    } else {
        $('body').removeClass('dark-theme');
        $('#theme-toggle').prop('checked', false);
    }
}

// Переключение темы
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    initTheme();
}

// Архивация заметки
function archiveNote(id) {
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}/archive`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function() {
            showNotification('Заметка архивирована', 'info');
            
            // Обновляем список заметок
            loadAllNotes(window.location.pathname === '/notes/trash');
        },
        error: function(error) {
            console.error('Ошибка при архивации заметки:', error);
            showNotification('Ошибка при архивации заметки', 'danger');
        }
    });
}

// Восстановление из архива
function unarchiveNote(id) {
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}/unarchive`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function() {
            showNotification('Заметка извлечена из архива', 'info');
            
            // Обновляем список заметок
            loadAllNotes(window.location.pathname === '/notes/trash');
        },
        error: function(error) {
            console.error('Ошибка при извлечении заметки из архива:', error);
            showNotification('Ошибка при извлечении заметки из архива', 'danger');
        }
    });
}

// Установка напоминания
function setReminder(id, dateTime) {
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}/reminder`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: JSON.stringify({ reminder_at: dateTime }),
        success: function() {
            showNotification('Напоминание установлено', 'success');
            
            // Если мы на странице редактирования, показываем дату напоминания
            if (window.location.pathname.match(/\/notes\/\d+\/edit/)) {
                $('#reminder-date').text(`Напоминание: ${formatDate(new Date(dateTime))}`);
                $('#reminder-container').removeClass('d-none');
            }
        },
        error: function(error) {
            console.error('Ошибка при установке напоминания:', error);
            showNotification('Ошибка при установке напоминания', 'danger');
        }
    });
}

// Удаление напоминания
function removeReminder(id) {
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}/reminder`,
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function() {
            showNotification('Напоминание удалено', 'info');
            
            // Если мы на странице редактирования, скрываем информацию о напоминании
            if (window.location.pathname.match(/\/notes\/\d+\/edit/)) {
                $('#reminder-container').addClass('d-none');
            }
        },
        error: function(error) {
            console.error('Ошибка при удалении напоминания:', error);
            showNotification('Ошибка при удалении напоминания', 'danger');
        }
    });
}

// Добавление новой папки
function addFolder(folderName) {
    if (!folderName || folderName.trim() === '') return;
    
    // Получаем существующие папки
    $.ajax({
        url: '/api/folders',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const folders = response.data;
            
            // Проверяем, существует ли такая папка
            if (folders.includes(folderName)) {
                showNotification('Папка с таким именем уже существует', 'warning');
                return;
            }
            
            // Добавляем папку в интерфейс
            $('#folders-list').append(`
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span><i class="fas fa-folder"></i> ${folderName}</span>
                    <span class="badge bg-secondary">0</span>
                </div>
            `);
            
            showNotification('Папка добавлена', 'success');
        },
        error: function(error) {
            console.error('Ошибка при получении списка папок:', error);
            showNotification('Ошибка при добавлении папки', 'danger');
        }
    });
}

// Применение сортировки
function applySorting(sortType) {
    currentSort = sortType;
    
    const notes = $('.note-wrapper');
    const notesContainer = $('.notes-container');
    
    // Копируем в массив для сортировки
    const notesArray = Array.from(notes);
    
    // Сортируем в зависимости от выбранного типа
    switch (sortType) {
        case 'date-new':
            notesArray.sort((a, b) => {
                const dateA = new Date($(a).data('updated-at') || 0);
                const dateB = new Date($(b).data('updated-at') || 0);
                return dateB - dateA; // Сначала новые
            });
            break;
        case 'date-old':
            notesArray.sort((a, b) => {
                const dateA = new Date($(a).data('updated-at') || 0);
                const dateB = new Date($(b).data('updated-at') || 0);
                return dateA - dateB; // Сначала старые
            });
            break;
        case 'alpha-asc':
            notesArray.sort((a, b) => {
                const titleA = $(a).find('h4').text().toLowerCase();
                const titleB = $(b).find('h4').text().toLowerCase();
                return titleA.localeCompare(titleB); // А-Я
            });
            break;
        case 'alpha-desc':
            notesArray.sort((a, b) => {
                const titleA = $(a).find('h4').text().toLowerCase();
                const titleB = $(b).find('h4').text().toLowerCase();
                return titleB.localeCompare(titleA); // Я-А
            });
            break;
        case 'color':
            notesArray.sort((a, b) => {
                const colorA = $(a).data('color') || 'default';
                const colorB = $(b).data('color') || 'default';
                return colorA.localeCompare(colorB);
            });
            break;
    }
    
    // Очищаем контейнер и добавляем отсортированные элементы
    notesContainer.empty();
    
    // Сначала добавляем закрепленные заметки
    const pinnedNotes = notesArray.filter(note => $(note).data('pinned') === true);
    const regularNotes = notesArray.filter(note => $(note).data('pinned') !== true);
    
    // Добавляем закрепленные заметки
    pinnedNotes.forEach(note => {
        notesContainer.append(note);
    });
    
    // Затем добавляем обычные заметки
    regularNotes.forEach(note => {
        notesContainer.append(note);
    });
    
    // Анимация для обновленного списка
    $('.note-wrapper').hide().fadeIn(300);
}

// Глобальный поиск с мгновенными результатами
function performSearch(query) {
    if (!query || query.trim() === '') {
        $('#search-results').empty().hide();
        return;
    }
    
    // Показываем прелоадер
    $('#search-results').html('<div class="p-3 text-center"><i class="fas fa-spinner fa-spin"></i> Поиск...</div>').show();
    
    // Ищем среди заметок
    const notes = $('.note-wrapper');
    const results = [];
    
    notes.each(function() {
        const title = $(this).find('h4').text().toLowerCase();
        const description = $(this).find('.note-description').text().toLowerCase();
        const tags = $(this).data('tags') || '';
        const id = $(this).attr('id');
        
        if (title.includes(query.toLowerCase()) || 
            description.includes(query.toLowerCase()) || 
            tags.includes(query.toLowerCase())) {
            
            results.push({
                id: id,
                title: title,
                description: description,
                color: $(this).data('color')
            });
        }
    });
    
    // Отображаем результаты
    if (results.length > 0) {
        $('#search-results').empty();
        
        results.forEach(result => {
            const highlightedTitle = highlightText(result.title, query);
            const highlightedDesc = highlightText(result.description, query);
            
            $('#search-results').append(`
                <div class="search-result-item" data-id="${result.id}">
                    <div class="title">${highlightedTitle}</div>
                    <div class="description">${highlightedDesc}</div>
                </div>
            `);
        });
        
        // Добавляем обработчик клика на результаты поиска
        $('.search-result-item').on('click', function() {
            const noteId = $(this).data('id');
            
            // Прокручиваем к заметке и подсвечиваем ее
            const noteElement = $(`#${noteId}`);
            if (noteElement.length) {
                // Скрываем результаты поиска
                $('#search-results').hide();
                
                // Анимированная прокрутка к заметке
                $('html, body').animate({
                    scrollTop: noteElement.offset().top - 100
                }, 500);
                
                // Подсветка заметки
                noteElement.addClass('highlight-note');
                setTimeout(() => {
                    noteElement.removeClass('highlight-note');
                }, 3000);
            }
        });
    } else {
        $('#search-results').html('<div class="p-3 text-center">Ничего не найдено</div>');
    }
}

// Функция для подсветки текста
function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}
