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
        
        // Улучшенные обработчики фильтров
        $('#filter-pinned').on('change', function() {
            // Устанавливаем соответствующую верхнюю кнопку фильтра
            if ($(this).is(':checked')) {
                // Визуально активируем кнопку
                $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
                $('.filter-btn[data-filter="pinned"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
                
                // Снимаем другие чекбоксы
                $('#filter-completed, #filter-active').prop('checked', false);
            } else if (!$('#filter-completed').is(':checked') && !$('#filter-active').is(':checked')) {
                // Если ни один фильтр не выбран, активируем "Все"
                $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
                $('.filter-btn[data-filter="all"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
            }
            applyFilters();
        });
        
        $('#filter-completed').on('change', function() {
            // Устанавливаем соответствующую верхнюю кнопку фильтра
            if ($(this).is(':checked')) {
                // Визуально активируем кнопку
                $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
                $('.filter-btn[data-filter="completed"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
                
                // Снимаем другие чекбоксы
                $('#filter-pinned, #filter-active').prop('checked', false);
            } else if (!$('#filter-pinned').is(':checked') && !$('#filter-active').is(':checked')) {
                // Если ни один фильтр не выбран, активируем "Все"
                $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
                $('.filter-btn[data-filter="all"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
            }
            applyFilters();
        });
        
        $('#filter-active').on('change', function() {
            // Устанавливаем соответствующую верхнюю кнопку фильтра
            if ($(this).is(':checked')) {
                // Визуально активируем кнопку
                $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
                $('.filter-btn[data-filter="active"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
                
                // Снимаем другие чекбоксы
                $('#filter-pinned, #filter-completed').prop('checked', false);
            } else if (!$('#filter-pinned').is(':checked') && !$('#filter-completed').is(':checked')) {
                // Если ни один фильтр не выбран, активируем "Все"
                $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
                $('.filter-btn[data-filter="all"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
            }
            applyFilters();
        });
        
        $('.filter-btn').on('click', function() {
            const filter = $(this).data('filter');
            
            // Обновляем визуальное состояние кнопок
            $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
            $(this).removeClass('btn-outline-secondary').addClass('btn-secondary');
            
            // Снимаем все боковые фильтры
            $('#filter-pinned, #filter-completed, #filter-active').prop('checked', false);
            
            // Устанавливаем соответствующий чекбокс при нажатии кнопки
            if (filter === 'pinned') {
                $('#filter-pinned').prop('checked', true);
            } else if (filter === 'completed') {
                $('#filter-completed').prop('checked', true);
            } else if (filter === 'active') {
                $('#filter-active').prop('checked', true);
            }
            
            // Применяем фильтры
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
        // Не вызываем createNote() здесь, так как это уже произойдет в обработчике submit формы
    });
    
    // Обработка формы создания при нажатии Enter или кнопки Сохранить
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
    
    // Инициализация обработки файлов
    handleFileUpload();
    
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
    
    // Обработчик для кнопки "Отметить как выполненное/активное"
    $('body').on('click', '.toggle-done-btn', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const id = $(this).data('id');
        toggleDone(id, event);
    });
    
    // Если мы находимся на странице календаря
    if (currentPath === '/notes/calendar') {
        initCalendar();
    }
    

    
    // Обновляем статистику
    loadStats();
});

// Загрузка всех заметок
function loadAllNotes(trashMode = false) {
    let url = `/api/notes`;
    // Проверяем текущий режим
    const currentPath = window.location.pathname;
    const archiveMode = currentPath === '/notes/archive';
    
    if (trashMode) {
        url += '?trash=true';
    } else if (archiveMode) {
        url += '?archive=true';
    }
    
    // Обновляем статистику
    loadStats();
    
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const notes = response.data;
            console.log('Загружено заметок:', notes.length, notes);
            console.log('URL запроса:', url);
            console.log('Режим архива:', archiveMode, 'Режим корзины:', trashMode);
            $('.notes-container').empty();
            
            if (!notes || notes.length === 0) {
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
                
                // Форматируем даты
                const createdAt = new Date(note.created_at);
                const updatedAt = new Date(note.updated_at);
                const isUpdated = createdAt.getTime() !== updatedAt.getTime();
                const dateString = isUpdated ? 
                    `Обновлено: ${formatDate(updatedAt)}` : 
                    `Создано: ${formatDate(createdAt)}`;
                
                return `
                    <div class="note-item note-wrapper ${note.color} ${note.done ? 'completed' : ''} ${isPinned ? 'pinned' : ''}" 
                         id="${note.id}" data-color="${note.color}" data-done="${note.done}" 
                         data-pinned="${note.is_pinned}" data-tags="${note.tags || ''}"
                         data-updated-at="${note.updated_at}">
                         
                        ${isPinned ? '<span class="badge pin-badge">Закреплено</span>' : ''}
                        
                        <div class="row">
                            <div class="col-md-8">
                                <h4>${note.name}</h4>
                                <div class="note-description">
                                    ${note.formatted_description ? 
                                      `<div class="formatted-content">${note.formatted_description.length > 300 ? 
                                        note.formatted_description.substring(0, 300) + '...' : 
                                        note.formatted_description}</div>` : 
                                      `<div>${$('<div>').html(note.description).text().length > 150 ? 
                                        $('<div>').html(note.description).text().substring(0, 150) + '...' : 
                                        note.description}</div>`}
                                </div>
                                
                                <div class="mt-2 d-flex align-items-center gap-2 flex-wrap">
                                    <span class="badge ${note.done ? 'bg-success' : 'bg-warning'} note-done-toggle" 
                                          onclick="toggleDone(${note.id}, event)" style="cursor: pointer;">
                                        ${note.done ? 'Выполнено' : 'В процессе'}
                                    </span>
                                    <small class="text-muted note-date">
                                        <i class="far fa-clock me-1"></i>${dateString}
                                    </small>
                                </div>
                                
                                ${tagsHTML}
                                
                                ${note.files && note.files.length > 0 ? `
                                    <div class="note-files mt-3">
                                        <div class="small text-muted mb-2">Прикрепленные файлы (${note.files.length}):</div>
                                        <div class="d-flex flex-wrap gap-2">
                                            ${note.files.map(file => `
                                                <a href="${file.url}" target="_blank" 
                                                   class="file-link badge bg-light text-dark d-flex align-items-center">
                                                    <i class="fas fa-${file.type === 'image' ? 'image' : 
                                                                       file.type === 'video' ? 'video' : 
                                                                       file.type === 'document' ? 'file-alt' : 'file'} me-1"></i>
                                                    ${file.name}
                                                </a>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="col-md-4 text-end note-actions">
                                <div class="dropdown d-inline-block">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end shadow">
                                        ${trashMode ? `
                                            <li><a class="dropdown-item restore-btn" href="#" data-id="${note.id}">
                                                <i class="fas fa-trash-restore"></i> Восстановить
                                            </a></li>
                                            <li><a class="dropdown-item force-delete-btn text-danger" href="#" data-id="${note.id}">
                                                <i class="fas fa-trash-alt"></i> Удалить навсегда
                                            </a></li>
                                        ` : `
                                            <li><a class="dropdown-item toggle-done-btn" href="#" data-id="${note.id}">
                                                <i class="fas ${note.done ? 'fa-circle' : 'fa-check-circle'}"></i> ${note.done ? 'Отметить как активное' : 'Отметить как выполненное'}
                                            </a></li>
                                            <li><a class="dropdown-item toggle-pin-btn" href="#" data-id="${note.id}">
                                                <i class="fas fa-thumbtack"></i> ${note.is_pinned ? 'Открепить' : 'Закрепить'}
                                            </a></li>
                                            <li><a class="dropdown-item view-note-btn" href="#" data-id="${note.id}">
                                                <i class="fas fa-eye"></i> Просмотреть
                                            </a></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li><a class="dropdown-item" href="/notes/${note.id}/edit">
                                                <i class="fas fa-edit"></i> Редактировать
                                            </a></li>
                                            <li><a class="dropdown-item toggle-archive-btn" href="#" data-id="${note.id}">
                                                <i class="fas ${window.location.pathname === '/notes/archive' ? 'fa-box-open' : 'fa-archive'}"></i> ${window.location.pathname === '/notes/archive' ? 'Разархивировать' : 'Архивировать'}
                                            </a></li>
                                            <li><a class="dropdown-item text-danger delete-btn" href="#" data-id="${note.id}">
                                                <i class="fas fa-trash"></i> Удалить
                                            </a></li>
                                        `}
                                    </ul>
                                </div>
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
                $('.restore-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    restoreNote(noteId);
                });
                
                // Окончательное удаление заметки
                $('.force-delete-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    forceDeleteNote(noteId);
                });
            } else {
                // Удаление заметки (перемещение в корзину)
                $('.delete-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    deleteNote(noteId);
                });
                
                // Закрепление/открепление заметки
                $('.toggle-pin-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    togglePin(noteId);
                });
                
                // Архивирование/разархивирование заметки
                $('.toggle-archive-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    // Если мы в архиве, восстанавливаем из архива
                    if (window.location.pathname === '/notes/archive') {
                        unarchiveNote(noteId);
                    } else {
                        // Иначе архивируем
                        archiveNote(noteId);
                    }
                });
                
                // Переключение статуса "Выполнено"
                $('.toggle-done-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    toggleDone(noteId);
                });
                
                // Просмотр заметки
                $('.view-note-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    viewNote(noteId);
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
            $('#description').val(note.formatted_description || note.description);
            $('#done').prop('checked', note.done);
            
            // Если есть функция для установки содержимого Quill-редактора, используем её
            if (window.setQuillContent && typeof window.setQuillContent === 'function') {
                window.setQuillContent(note.formatted_description || note.description);
            }
            
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
                    $(this).parent().remove();
                    
                    // Удаляем тег из массива
                    currentTags = currentTags.filter(t => t !== tag);
                });
            }
            
            // Устанавливаем дату напоминания, если она есть
            if (note.reminder_at) {
                // Форматируем дату напоминания для input datetime-local
                const reminderDate = new Date(note.reminder_at);
                const year = reminderDate.getFullYear();
                const month = String(reminderDate.getMonth() + 1).padStart(2, '0');
                const day = String(reminderDate.getDate()).padStart(2, '0');
                const hours = String(reminderDate.getHours()).padStart(2, '0');
                const minutes = String(reminderDate.getMinutes()).padStart(2, '0');
                
                $('#reminder-date').val(`${year}-${month}-${day}T${hours}:${minutes}`);
                $('#reminder-actions').show();
            } else {
                $('#reminder-date').val('');
                $('#reminder-actions').hide();
            }
            
            // Обработчик удаления напоминания
            $('#remove-reminder').off('click').on('click', function() {
                if (confirm('Вы уверены, что хотите удалить напоминание?')) {
                    $.ajax({
                        url: `/api/notes/${note.id}/remove-reminder`,
                        type: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        success: function(response) {
                            $('#reminder-date').val('');
                            $('#reminder-actions').hide();
                            showNotification('Напоминание удалено', 'info');
                        },
                        error: function(xhr, status, error) {
                            console.error('Ошибка при удалении напоминания:', error);
                            showNotification('Ошибка при удалении напоминания', 'danger');
                        }
                    });
                }
            });
            
            // Отображаем существующие файлы
            if (note.files && note.files.length > 0) {
                const existingFilesContainer = $('#existing-files');
                existingFilesContainer.empty();
                
                existingFilesContainer.append('<h6 class="mt-3 mb-2">Прикрепленные файлы:</h6>');
                
                note.files.forEach(file => {
                    let fileIcon, filePreview;
                    
                    if (file.type === 'image') {
                        filePreview = `<img src="${file.url}" class="img-thumbnail" style="max-height: 100px; max-width: 100%;" alt="${file.name}">`;
                    } else if (file.type === 'video') {
                        fileIcon = '<i class="fas fa-film fa-2x text-secondary"></i>';
                    } else if (file.type === 'document') {
                        fileIcon = '<i class="fas fa-file-alt fa-2x text-secondary"></i>';
                    } else {
                        fileIcon = '<i class="fas fa-file fa-2x text-secondary"></i>';
                    }
                    
                    existingFilesContainer.append(`
                        <div class="col-md-3 mb-3">
                            <div class="card">
                                <div class="card-body text-center">
                                    ${filePreview || fileIcon || ''}
                                    <p class="mt-2 mb-0 text-truncate">${file.name}</p>
                                    <a href="${file.url}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">
                                        Открыть
                                    </a>
                                </div>
                            </div>
                        </div>
                    `);
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
    // Проверяем, не выполняется ли уже запрос
    if (window.isCreatingNote) {
        console.log('Запрос на создание заметки уже выполняется, игнорируем повторный вызов');
        return;
    }
    
    // Устанавливаем флаг, что выполняется запрос
    window.isCreatingNote = true;
    
    // Блокируем кнопку сохранения, чтобы предотвратить повторные нажатия
    $('#save-button').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Сохраняем...');
    
    // Используем глобальную переменную selectedColor
    const noteColor = $('.color-option.selected').data('color');
    
    // Убедимся, что currentTags существует
    if (typeof currentTags === 'undefined') {
        currentTags = [];
        console.log('Инициализирована пустая переменная currentTags');
    }
    
    // Проверяем, есть ли файлы для загрузки
    const fileInput = $('#upload-files')[0];
    const hasFiles = fileInput && fileInput.files && fileInput.files.length > 0;
    
    // Создаем FormData для отправки файлов
    const formData = new FormData();
    formData.append('name', $('#name').val());
    formData.append('description', $('#description').val());
    
    // Добавляем дату напоминания, если она указана
    if ($('#reminder-date').val()) {
        formData.append('reminder_at', $('#reminder-date').val());
    }
    formData.append('color', noteColor || 'default');
    
    // Проверяем значение и отладочный вывод
    const isPinned = $('#is_pinned').is(':checked');
    console.log('Значение чекбокса is_pinned:', isPinned);
    formData.append('is_pinned', isPinned ? '1' : '0'); // Используем числовые значения 1/0 для boolean
    
    // Добавляем значение done со значением false
    formData.append('done', '0');
    
    if (currentTags && currentTags.length > 0) {
        formData.append('tags', currentTags.join(','));
    }
    
    // Добавляем файлы, если они есть
    if (hasFiles) {
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('upload_files[]', fileInput.files[i]);
        }
    }
    
    if (!$('#name').val() || !$('#description').val()) {
        showNotification('Пожалуйста, заполните название и описание заметки', 'warning');
        return;
    }
    
    console.log('Отправляю данные на сервер (с файлами)');
    
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Проверяем наличие CSRF-токена
    if (!csrfToken) {
        console.error('CSRF-токен отсутствует');
        showNotification('Ошибка безопасности: отсутствует CSRF-токен', 'danger');
        return;
    }
    
    console.log('CSRF-токен получен:', csrfToken);
    
    // Отладочный вывод содержимого formData
    console.log('FormData содержит следующие данные:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }
    
    $.ajax({
        url: '/notes',
        type: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        data: formData,
        contentType: false,
        processData: false,
        cache: false,
        success: function(response) {
            // Сбрасываем флаг создания заметки
            window.isCreatingNote = false;
            
            console.log('Успешно создана заметка:', response);
            showNotification('Заметка успешно создана', 'success');
            
            // Небольшая задержка перед перенаправлением
            setTimeout(() => {
                window.location.href = '/notes';
            }, 1000);
        },
        error: function(xhr, status, error) {
            // Сбрасываем флаг создания заметки и разблокируем кнопку
            window.isCreatingNote = false;
            $('#save-button').prop('disabled', false).html('<i class="fas fa-save"></i> Сохранить');
            
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

// Обработка загрузки файлов
function handleFileUpload() {
    // Для страницы создания и редактирования заметки
    $('#upload-files').on('change', function() {
        const files = this.files;
        
        // Очищаем превью
        $('#file-preview').empty();
        
        // Проверка на превышение лимита файлов
        if (files.length > 10) {
            showNotification('Можно загрузить максимум 10 файлов за раз', 'warning');
            $(this).val(''); // Очистить выбор
            return;
        }
        
        // Проверяем размер каждого файла
        let totalSize = 0;
        for (let i = 0; i < files.length; i++) {
            totalSize += files[i].size;
            
            if (files[i].size > 15 * 1024 * 1024) { // 15 МБ
                showNotification(`Файл "${files[i].name}" слишком большой. Максимальный размер - 15МБ`, 'warning');
                $(this).val(''); // Очистить выбор
                $('#file-preview').empty();
                return;
            }
            
            // Создаем превью для файла
            createFilePreview(files[i]);
        }
        
        // Проверка общего размера
        if (totalSize > 50 * 1024 * 1024) { // 50 МБ
            showNotification('Общий размер файлов не должен превышать 50МБ', 'warning');
            $(this).val(''); // Очистить выбор
            $('#file-preview').empty();
            return;
        }
    });
}

// Создание превью для загруженных файлов
function createFilePreview(file) {
    const reader = new FileReader();
    const previewContainer = $('#file-preview');
    const fileType = getFileTypeByMime(file.type);
    
    reader.onload = function(e) {
        let previewElement = '';
        
        if (fileType === 'image') {
            // Для изображений создаем превью с миниатюрой
            previewElement = `
                <div class="col-md-3 col-sm-4 col-6">
                    <div class="card h-100">
                        <div class="card-img-top file-preview-img" style="height: 100px; background-image: url('${e.target.result}'); background-size: cover; background-position: center;"></div>
                        <div class="card-body p-2">
                            <p class="card-text small text-truncate">${file.name}</p>
                            <small class="text-muted">${formatFileSize(file.size)}</small>
                        </div>
                    </div>
                </div>
            `;
        } else if (fileType === 'video') {
            // Для видео показываем иконку
            previewElement = `
                <div class="col-md-3 col-sm-4 col-6">
                    <div class="card h-100">
                        <div class="card-img-top file-preview-icon d-flex align-items-center justify-content-center" style="height: 100px; background-color: #f8f9fa;">
                            <i class="fas fa-film fa-2x text-secondary"></i>
                        </div>
                        <div class="card-body p-2">
                            <p class="card-text small text-truncate">${file.name}</p>
                            <small class="text-muted">${formatFileSize(file.size)}</small>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Для других файлов
            let iconClass = 'fa-file';
            if (file.name.match(/\.pdf$/i)) iconClass = 'fa-file-pdf';
            else if (file.name.match(/\.(doc|docx)$/i)) iconClass = 'fa-file-word';
            else if (file.name.match(/\.(xls|xlsx)$/i)) iconClass = 'fa-file-excel';
            else if (file.name.match(/\.(ppt|pptx)$/i)) iconClass = 'fa-file-powerpoint';
            else if (file.name.match(/\.(zip|rar|tar|gz)$/i)) iconClass = 'fa-file-archive';
            else if (file.name.match(/\.(txt|rtf)$/i)) iconClass = 'fa-file-alt';
            
            previewElement = `
                <div class="col-md-3 col-sm-4 col-6">
                    <div class="card h-100">
                        <div class="card-img-top file-preview-icon d-flex align-items-center justify-content-center" style="height: 100px; background-color: #f8f9fa;">
                            <i class="fas ${iconClass} fa-2x text-secondary"></i>
                        </div>
                        <div class="card-body p-2">
                            <p class="card-text small text-truncate">${file.name}</p>
                            <small class="text-muted">${formatFileSize(file.size)}</small>
                        </div>
                    </div>
                </div>
            `;
        }
        
        previewContainer.append(previewElement);
    };
    
    reader.readAsDataURL(file);
}

// Определение типа файла по MIME-типу
function getFileTypeByMime(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('text/') || mimeType.includes('pdf') || 
        mimeType.includes('document') || mimeType.includes('spreadsheet') ||
        mimeType.includes('presentation')) return 'document';
    return 'other';
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    
    // Проверяем, есть ли файлы для загрузки
    const fileInput = $('#upload-files')[0];
    const hasFiles = fileInput && fileInput.files && fileInput.files.length > 0;
    
    // Создаем FormData для отправки файлов
    const formData = new FormData();
    formData.append('name', $('#name').val());
    formData.append('description', $('#description').val());
    
    // Добавляем дату напоминания, если она указана
    if ($('#reminder-date').val()) {
        formData.append('reminder_at', $('#reminder-date').val());
    }
    // Явно передаем булево значение как строку "1" или "0"
    formData.append('done', $('#done').is(':checked') ? '1' : '0');
    formData.append('color', noteColor || 'default');
    
    // Если есть поле is_pinned
    if ($('#is_pinned').length) {
        formData.append('is_pinned', $('#is_pinned').is(':checked') ? '1' : '0');
    }
    
    formData.append('_method', 'PUT'); // Для поддержки PUT-запроса через FormData
    
    if (currentTags && currentTags.length > 0) {
        formData.append('tags', currentTags.join(','));
    }
    
    // Добавляем файлы, если они есть
    if (hasFiles) {
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('upload_files[]', fileInput.files[i]);
        }
    }
    
    if (!$('#name').val() || !$('#description').val()) {
        showNotification('Пожалуйста, заполните название и описание заметки', 'warning');
        return;
    }
    
    console.log('Обновляю заметку:', id);
    
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
        url: `/notes/${id}`,
        type: 'POST', // Используем POST для FormData с методом PUT
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        data: formData,
        contentType: false,
        processData: false,
        cache: false,
        success: function(response) {
            console.log('Заметка успешно обновлена:', response);
            showNotification('Заметка успешно обновлена', 'success');
            
            // Редирект на главную страницу после успешного обновления
            setTimeout(function() {
                window.location.href = '/notes';
            }, 1000); // Задержка в 1 секунду, чтобы пользователь увидел уведомление
            
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
                
                // Обновляем статистику
                loadStats();
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
                
                // Обновляем статистику
                loadStats();
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
                        
                        // Обновляем статистику после очистки корзины
                        loadStats();
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
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Проверяем наличие CSRF-токена
    if (!csrfToken) {
        console.error('CSRF-токен отсутствует');
        showNotification('Ошибка безопасности: отсутствует CSRF-токен', 'danger');
        return;
    }
    
    $.ajax({
        url: `/api/notes/${id}/toggle-pin`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        dataType: 'json',
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
            
            // Обновляем статистику
            loadStats();
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при изменении статуса закрепления:', xhr.responseText, status, error);
            showNotification('Ошибка при изменении статуса закрепления', 'danger');
        }
    });
}

// Фильтрация заметок
function applyFilters() {
    // Получаем параметры фильтрации
    const searchQuery = $('#search-notes').val().toLowerCase();
    const activeFilter = $('.filter-btn.btn-secondary').data('filter');
    
    // Полная двусторонняя синхронизация между верхними фильтрами и боковыми чекбоксами
    if (activeFilter) {
        // Сначала снимаем все боковые фильтры
        $('#filter-pinned, #filter-completed, #filter-active').prop('checked', false);
        
        // Устанавливаем соответствующий чекбокс в зависимости от активного фильтра
        if (activeFilter === 'active') {
            $('#filter-active').prop('checked', true);
        } else if (activeFilter === 'completed') {
            $('#filter-completed').prop('checked', true);
        } else if (activeFilter === 'pinned') {
            $('#filter-pinned').prop('checked', true);
        }
    } else {
        // Если нажата кнопка "Все", снимаем все чекбоксы
        if (!$('#filter-pinned').is(':checked') && !$('#filter-completed').is(':checked') && !$('#filter-active').is(':checked')) {
            $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
            $('.filter-btn[data-filter="all"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
        }
    }
    
    // Проверяем, если какие-то чекбоксы отмечены, устанавливаем соответствующую кнопку фильтра
    if ($('#filter-pinned').is(':checked')) {
        $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
        $('.filter-btn[data-filter="pinned"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
    } else if ($('#filter-completed').is(':checked')) {
        $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
        $('.filter-btn[data-filter="completed"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
    } else if ($('#filter-active').is(':checked')) {
        $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
        $('.filter-btn[data-filter="active"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
    }
    
    // Обновляем переменные после синхронизации для фильтрации
    const updatedShowOnlyPinned = $('#filter-pinned').is(':checked');
    const updatedShowOnlyCompleted = $('#filter-completed').is(':checked');
    const updatedShowOnlyActive = $('#filter-active').is(':checked');
    const updatedActiveFilter = $('.filter-btn.btn-secondary').data('filter');
    
    // Перебираем все заметки и скрываем/показываем их в соответствии с фильтрами
    $('.note-wrapper, .note-item').each(function() {
        let shouldShow = true;
        
        // Фильтр по закрепленным
        if (updatedShowOnlyPinned && $(this).data('pinned') !== true) {
            shouldShow = false;
        }
        
        // Фильтр по выполненным
        if (updatedShowOnlyCompleted && $(this).data('done') !== true) {
            shouldShow = false;
        }
        
        // Фильтр по активным (не выполненным)
        if (updatedShowOnlyActive && $(this).data('done') === true) {
            shouldShow = false;
        }
        
        // Фильтр по кнопкам (Все, Активные, Выполненные, Закрепленные)
        // Используем обновленный activeFilter после синхронизации
        if (updatedActiveFilter === 'active' && $(this).data('done') === true) {
            shouldShow = false;
        } else if (updatedActiveFilter === 'completed' && $(this).data('done') !== true) {
            shouldShow = false;
        } else if (updatedActiveFilter === 'pinned' && $(this).data('pinned') !== true) {
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
            console.log('Обновляем статистику:', statsData);
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
        console.log('Обновляем статистику:', statsData);
        // Обновляем основные счетчики
        $('#total-notes').text(`Всего: ${statsData.total || 0}`);
        $('#completed-notes').text(`Выполнено: ${statsData.completed || 0}`);
        $('#active-notes').text(`Активно: ${statsData.active || 0}`);
        $('#pinned-notes').text(`Закреплено: ${statsData.pinned || 0}`);
        $('#archived-notes').text(`В архиве: ${statsData.archived || 0}`);
        $('#trashed-notes').text(`В корзине: ${statsData.trashed || 0}`);
        $('#reminders-notes').text(`С напоминаниями: ${statsData.with_reminders || 0}`);
        
        // Обновляем папки в боковой панели
        if (statsData.by_folder) {
            // Очищаем список папок
            $('#folders-list').empty();
            
            // Добавляем каждую папку
            Object.keys(statsData.by_folder).forEach(folderName => {
                const count = statsData.by_folder[folderName];
                addFolderToSidebar(folderName, count);
            });
            
            // Инициализируем обработчики для папок
            if (typeof initFolderHandlers === 'function') {
                initFolderHandlers();
            }
        }
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
    
    console.log('Архивация заметки с ID:', id);
    
    $.ajax({
        url: `/api/notes/${id}/archive`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function(response) {
            console.log('Ответ сервера при архивации:', response);
            showNotification('Заметка архивирована', 'info');
            
            // Если мы на обычной странице (не архив), удаляем заметку из представления
            if (window.location.pathname === '/notes') {
                $(`.note-wrapper#${id}`).fadeOut(300, function() {
                    $(this).remove();
                    
                    // Проверим, остались ли ещё заметки
                    if ($('.note-wrapper:visible').length === 0) {
                        $('.notes-container').hide();
                        $('.empty-container').removeClass('d-none');
                    }
                });
                
                // Обновляем статистику
                loadStats();
            } else {
                // В других случаях обновляем весь список
                loadAllNotes(window.location.pathname === '/notes/trash');
            }
            
            // Перенаправляем на страницу архива, если указано
            if (window.location.pathname === '/notes') {
                setTimeout(function() {
                    if (confirm('Заметка архивирована. Хотите перейти в архив?')) {
                        window.location.href = '/notes/archive';
                    }
                }, 500);
            }
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
            
            // Если мы на странице архива, удаляем заметку из представления
            if (window.location.pathname === '/notes/archive') {
                $(`.note-wrapper#${id}`).fadeOut(300, function() {
                    $(this).remove();
                    
                    // Проверим, остались ли ещё заметки
                    if ($('.note-wrapper:visible').length === 0) {
                        $('.notes-container').hide();
                        $('.empty-container').removeClass('d-none');
                    }
                });
                
                // Обновляем статистику
                loadStats();
            } else {
                // В других случаях обновляем весь список
                loadAllNotes(window.location.pathname === '/notes/trash');
            }
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
            
            // Если мы находимся на странице редактирования, скрываем информацию о напоминании
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
    
    // Получаем CSRF-токен
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Создаем папку через новый API
    $.ajax({
        url: '/api/folders',
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
                // Добавляем папку в интерфейс
                addFolderToSidebar(folderName, 0);
                
                showNotification('Папка успешно добавлена', 'success');
                
                // Обновляем счетчики
                loadStats();
            } else {
                showNotification(response.message || 'Ошибка при создании папки', 'warning');
            }
        },
        error: function(xhr) {
            let errorMessage = 'Ошибка при создании папки';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            console.error('Ошибка при создании папки:', xhr);
            showNotification(errorMessage, 'danger');
        }
    });
}

// Добавление папки в боковую панель
function addFolderToSidebar(folderName, count) {
    // Создаем ID для папки, заменяя пробелы и специальные символы
    const folderId = 'folder-' + folderName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Проверяем, существует ли уже такая папка в sidebar
    if ($('#' + folderId).length > 0) {
        // Если да, просто обновляем счетчик
        $('#' + folderId + ' .badge').text(count);
        return;
    }
    
    // Добавляем папку в интерфейс
    $('#folders-list').append(`
        <div class="d-flex justify-content-between align-items-center mb-2 folder-item" id="${folderId}">
            <a href="/notes/folder/${encodeURIComponent(folderName)}" class="text-decoration-none text-dark folder-link">
                <i class="fas fa-folder me-1"></i> ${folderName}
            </a>
            <div class="d-flex align-items-center">
                <span class="badge bg-secondary me-2">${count}</span>
                <div class="dropdown folder-actions">
                    <button class="btn btn-sm btn-link text-secondary p-0" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item rename-folder" href="#" data-folder="${folderName}">
                            <i class="fas fa-edit me-1"></i> Переименовать
                        </a></li>
                        <li><a class="dropdown-item delete-folder" href="#" data-folder="${folderName}">
                            <i class="fas fa-trash me-1"></i> Удалить папку
                        </a></li>
                        <li><a class="dropdown-item move-notes-to-folder" href="#" data-folder="${folderName}">
                            <i class="fas fa-arrow-right me-1"></i> Переместить заметки сюда
                        </a></li>
                    </ul>
                </div>
            </div>
        </div>
    `);
    
    // Добавляем обработчики событий для новой папки
    initFolderEventHandlers();
}

// Инициализация обработчиков для папок
function initFolderEventHandlers() {
    // Обработчик для переименования папки
    $('.rename-folder').off('click').on('click', function(e) {
        e.preventDefault();
        const oldFolderName = $(this).data('folder');
        const newFolderName = prompt('Введите новое название папки:', oldFolderName);
        
        if (newFolderName && newFolderName !== oldFolderName) {
            renameFolder(oldFolderName, newFolderName);
        }
    });
    
    // Обработчик для удаления папки
    $('.delete-folder').off('click').on('click', function(e) {
        e.preventDefault();
        const folderName = $(this).data('folder');
        
        if (confirm(`Вы уверены, что хотите удалить папку "${folderName}"? Заметки внутри папки НЕ будут удалены.`)) {
            deleteFolder(folderName);
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
}    // Быстрое переключение статуса "Выполнено"
function toggleDone(id, event) {
    // Предотвращаем всплытие события, чтобы не активировалась карточка заметки
    if (event) event.stopPropagation();
    
    // Блокируем кнопки статуса, чтобы предотвратить множественные клики
    const noteElement = $(`.note-wrapper#${id}, .note-item#${id}`);
    const statusButton = noteElement.find('.note-done-toggle, .toggle-done-btn');
    statusButton.prop('disabled', true);
    
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Проверяем наличие CSRF-токена
    if (!csrfToken) {
        console.error('CSRF-токен отсутствует');
        showNotification('Ошибка безопасности: отсутствует CSRF-токен', 'danger');
        statusButton.prop('disabled', false);
        return;
    }
    
    // Определяем текущее состояние заметки до запроса
    const currentDoneState = noteElement.attr('data-done') === 'true';
    const newDoneState = !currentDoneState;
    
    // Предварительно меняем UI для немедленного отклика
    if (currentDoneState) {
        // Меняем с "Выполнено" на "В процессе"
        noteElement.removeClass('completed');
        noteElement.find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning');
        noteElement.find('.note-done-toggle').text('В процессе');
        
        // Обновляем текст и иконку в контекстном меню
        const dropdownBtn = noteElement.find('.toggle-done-btn');
        dropdownBtn.html('<i class="fas fa-check-circle"></i> Отметить как выполненное');
        dropdownBtn.attr('title', 'Отметить как выполненное');
        
        // Обновляем значения всех элементов с одинаковым ID заметки 
        // (может быть несколько представлений одной заметки на странице)
        $(`.toggle-done-btn[data-id="${id}"]`).each(function() {
            $(this).html('<i class="fas fa-check-circle"></i> Отметить как выполненное');
            $(this).attr('title', 'Отметить как выполненное');
        });
    } else {
        // Меняем с "В процессе" на "Выполнено" 
        noteElement.addClass('completed');
        noteElement.find('.note-done-toggle').removeClass('bg-warning').addClass('bg-success');
        noteElement.find('.note-done-toggle').text('Выполнено');
        
        // Обновляем текст и иконку в контекстном меню
        const dropdownBtn = noteElement.find('.toggle-done-btn');
        dropdownBtn.html('<i class="fas fa-circle"></i> Отметить как активное');
        dropdownBtn.attr('title', 'Отметить как активное');
        
        // Обновляем значения всех элементов с одинаковым ID заметки
        $(`.toggle-done-btn[data-id="${id}"]`).each(function() {
            $(this).html('<i class="fas fa-circle"></i> Отметить как активное');
            $(this).attr('title', 'Отметить как активное');
        });
    }
    
    // Обновляем визуальное состояние всех элементов с одинаковым ID заметки
    $(`.note-wrapper#${id}, .note-item#${id}`).each(function() {
        $(this).attr('data-done', newDoneState);
        if (newDoneState) {
            $(this).addClass('completed');
            $(this).find('.note-done-toggle').removeClass('bg-warning').addClass('bg-success').text('Выполнено');
        } else {
            $(this).removeClass('completed');
            $(this).find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning').text('В процессе');
        }
    });
    
    // Обновляем атрибут данных сразу (до получения ответа с сервера)
    noteElement.attr('data-done', newDoneState);
    
    $.ajax({
        url: `/notes/${id}/toggle-done`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        dataType: 'json',
        success: function(response) {
            const note = response.data;
            
            // Разблокируем кнопки статуса
            statusButton.prop('disabled', false);
            
            // Обновляем атрибут данных согласно данным с сервера
            noteElement.attr('data-done', note.done);
            
            // Показываем уведомление
            showNotification(response.message || (note.done ? 'Заметка отмечена как выполненная' : 'Заметка отмечена как невыполненная'), 'info');
            
            // Обновляем счетчики на боковой панели
            loadStats();
        },
        error: function(xhr, status, error) {        // В случае ошибки восстанавливаем предыдущее состояние
        if (currentDoneState) {
            // Восстанавливаем состояние "Выполнено"
            noteElement.addClass('completed');
            noteElement.find('.note-done-toggle').removeClass('bg-warning').addClass('bg-success');
            noteElement.find('.note-done-toggle').text('Выполнено');
            
            // Восстанавливаем текст и иконку в контекстном меню
            noteElement.find('.toggle-done-btn').html('<i class="fas fa-circle"></i> Отметить как активное');
            noteElement.find('.toggle-done-btn').attr('title', 'Отметить как активное');
        } else {
            // Восстанавливаем состояние "В процессе"
            noteElement.removeClass('completed');
            noteElement.find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning');
            noteElement.find('.note-done-toggle').text('В процессе');
            
            // Восстанавливаем текст и иконку в контекстном меню
            noteElement.find('.toggle-done-btn').html('<i class="fas fa-check-circle"></i> Отметить как выполненное');
            noteElement.find('.toggle-done-btn').attr('title', 'Отметить как выполненное');
        }
            
            // Восстанавливаем атрибут данных
            noteElement.attr('data-done', currentDoneState);
            
            // Разблокируем кнопку
            statusButton.prop('disabled', false);
            
            console.error('Ошибка при изменении статуса выполнения:', xhr.responseText, status, error);
            showNotification('Ошибка при изменении статуса выполнения', 'danger');
        }
    });
}







