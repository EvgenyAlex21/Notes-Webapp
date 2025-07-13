let selectedColor = 'default';
let currentTags = [];
let currentSort = 'date-new';
let currentTheme = localStorage.getItem('theme') || 'light';
let statsData = {};
let viewNoteModal = null;

$(document).ready(function() {
    if (typeof initNotificationsSystem === 'function') {
        initNotificationsSystem();
        console.log('Инициализирована система уведомлений');
    }
    
    const viewNoteModalElement = document.getElementById('viewNoteModal');
    if (viewNoteModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        try {
            viewNoteModalElement.removeAttribute('tabindex');
            
            viewNoteModal = new bootstrap.Modal(viewNoteModalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
            
            $(viewNoteModalElement).on('shown.bs.modal', function() {
                $(this).attr('aria-hidden', 'false');
            });
        } catch (e) {
            console.warn('Ошибка инициализации модального окна:', e);
        }
    }
    
    safeInitBootstrap();
    
    const currentPath = window.location.pathname;
    
    let trashMode = (typeof pageData !== 'undefined' && pageData.trashMode) || currentPath === '/notes/trash';
    let archiveMode = (typeof pageData !== 'undefined' && pageData.archiveMode) || currentPath === '/notes/archive';
    
    if (trashMode) {
        $('.sidebar-link').removeClass('active');
        $('a[href="/notes/trash"]').addClass('active');
        console.log('Активирован режим корзины');
    } else if (archiveMode) {
        $('.sidebar-link').removeClass('active');
        $('a[href="/notes/archive"]').addClass('active');
        console.log('Активирован режим архива');
    }
    
    initTheme();
    
    $('.color-option').on('click', function() {
        $('.color-option').removeClass('selected');
        $(this).addClass('selected');
        selectedColor = $(this).data('color');
    });
    
    $('#tag-input').on('keydown', function(e) {
        if (e.key === 'Enter' && $(this).val().trim() !== '') {
            e.preventDefault();
            const tagText = $(this).val().trim();
            
            if (!currentTags.includes(tagText)) {
                currentTags.push(tagText);
                
                const tagElement = $(`
                    <div class="tag" data-tag="${tagText}">
                        ${tagText}
                        <span class="remove-tag ms-1">&times;</span>
                    </div>
                `);
                
                $(this).before(tagElement);
                $(this).val('');
                
                $('.remove-tag').off('click').on('click', function() {
                    const tag = $(this).parent().data('tag');
                    currentTags = currentTags.filter(t => t !== tag);
                    $(this).parent().remove();
                });
            }
        }
    });
    
    if (currentPath === '/notes' || currentPath === '/notes/trash' || currentPath === '/notes/archive' || currentPath.match(/\/notes\/folder\//) || currentPath.match(/\/notes\/\d+$/)) {
        console.log('Инициализация загрузки заметок для страницы:', currentPath);
        
        const folderMatch = currentPath.match(/\/notes\/folder\/(.+)/);
        const noteMatch = currentPath.match(/\/notes\/(\d+)$/);
        
        if (folderMatch) {
            console.log('Загружаем заметки для папки из URL:', folderMatch[1]);
            loadAllNotes(trashMode);
        } else if (noteMatch) {
            console.log('Загружаем заметки для просмотра конкретной заметки:', noteMatch[1]);
            loadAllNotes(trashMode);
        } else if (currentPath === '/notes/archive') {
            console.log('Загружаем архивные заметки');
            loadAllNotes(false, null, true); 
        } else {
            loadAllNotes(trashMode);
        }
        
        
        $('.filter-btn').on('click', function() {
            const filter = $(this).data('filter');
            
            $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
            $(this).removeClass('btn-outline-secondary').addClass('btn-secondary');
            
            $('#filter-pinned, #filter-completed, #filter-active').prop('checked', false);
            
            if (filter === 'pinned') {
                $('#filter-pinned').prop('checked', true);
            } else if (filter === 'completed') {
                $('#filter-completed').prop('checked', true);
            } else if (filter === 'active') {
                $('#filter-active').prop('checked', true);
            }
            
            applyFilters();
        });
        
        $('#search-notes').on('input', function() {
            applyFilters();
        });
        
        $('#empty-trash').on('click', function() {
            emptyTrash();
        });
    }
    
    if (currentPath.match(/\/notes\/\d+\/edit/)) {
        const id = $('#note-id').val();
        loadNote(id);
    }
    
    $('#save-button').on('click', function(e) {
        e.preventDefault();
        console.log('Кнопка "Сохранить" нажата');
    });
    
    $('#create-note-form').on('submit', function(e) {
        e.preventDefault();
        console.log('Форма отправлена');
        createNote();
    });
    
    $('#update-button').on('click', function(e) {
        e.preventDefault();
        console.log('Кнопка "Сохранить изменения" нажата');
        const id = $('#note-id').val();
        updateNote(id);
    });
    
    handleFileUpload();

    $('#edit-note-form').on('submit', function(e) {
        e.preventDefault();
        console.log('Форма редактирования отправлена');
        const id = $('#note-id').val();
        updateNote(id);
    });
    
    $('#delete-button').on('click', function() {
        const id = $('#note-id').val();
        deleteNote(id);
    });
    
    $('#toggle-pin-button').on('click', function() {
        const id = $('#note-id').val();
        togglePin(id);
    });
    
    initTheme();
    
    $('#theme-toggle').on('change', function() {
        toggleTheme();
    });
    
    $('#search-notes').on('input', function() {
        const query = $(this).val().trim();
        performSearch(query);
        applyFilters();
    });
    
    $('#search-clear').on('click', function() {
        $('#search-notes').val('');
        $('#search-results').empty().hide();
        applyFilters();
    });
    
    $('.sort-option').on('click', function(e) {
        e.preventDefault();
        const sortType = $(this).data('sort');
        applySorting(sortType);
    });
    
    $('#add-folder-btn').on('click', function() {
        showFolderInputModal({
            title: 'Создание новой папки',
            placeholder: 'Введите название папки',
            confirmText: 'Создать',
            onConfirm: function(folderName) {
                if (folderName) {
                    addFolder(folderName);
                }
            }
        });
    });
    
    $('body').on('click', '.toggle-done-btn', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const id = $(this).data('id');
        toggleDone(id, event);
    });
    
    if (currentPath === '/notes/calendar') {
        initCalendar();
    }
    
    loadStats();
});

function countVisibleNotes() {
    if (window.currentNotesCount) {
        return window.currentNotesCount;
    }
    
    const visibleNotes = $('.note-wrapper:visible, .note-item:visible').length;
    const activeNotes = $('.note-wrapper:visible:not(.completed), .note-item:visible:not(.completed)').length;
    const completedNotes = $('.note-wrapper:visible.completed, .note-item:visible.completed').length;
    const pinnedNotes = $('.note-wrapper:visible.pinned, .note-item:visible.pinned').length;
    
    return {
        total: visibleNotes,
        active: activeNotes,
        completed: completedNotes,
        pinned: pinnedNotes
    };
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
}

function loadAllNotes(trashMode = false, folder = null, archiveModeParam = false) {
    let url = `/api/notes`;
    const currentPath = window.location.pathname;
    let archiveMode = archiveModeParam || (typeof pageData !== 'undefined' && pageData.archiveMode) || currentPath === '/notes/archive';
    const trashModeFromPage = typeof pageData !== 'undefined' && pageData.trashMode;
    
    console.log('loadAllNotes вызван с параметрами:', {
        trashMode, 
        folder,
        archiveModeParam,
        archiveMode,
        currentPath
    });
    
    if (trashMode === false && trashModeFromPage) {
        trashMode = trashModeFromPage;
    }
    
    const folderMatch = currentPath.match(/\/notes\/folder\/(.+)/);
    
    let folderMode = false;
    let folderName = null;
    
    if (folder) {
        folderMode = true;
        folderName = folder;
        console.log('Имя папки получено из параметра функции:', folderName);
    } 
    else if (folderMatch) {
        folderMode = true;
        try {
            folderName = decodeURIComponent(folderMatch[1]);
            while (folderName !== decodeURIComponent(folderName)) {
                folderName = decodeURIComponent(folderName);
            }
            console.log('Полностью декодированное имя папки из URL:', folderName);
        } catch (e) {
            console.warn('Ошибка при декодировании имени папки из URL:', e);
            folderName = folderMatch[1]; 
        }
    }
    else if (typeof pageData !== 'undefined' && pageData.folderMode && pageData.folderName) {
        folderMode = true;
        folderName = pageData.folderName;
        console.log('Имя папки получено из данных страницы:', folderName);
    }
    
    console.log('Режим папки:', folderMode, 'Имя папки:', folderName);
    
    if (folderMode && folderName) {
        $('.folder-link').removeClass('active');
        $('.folder-link').parent().removeClass('active-folder');
        $('.nav-link').removeClass('active');
        
        console.log('Активируем папку в меню:', folderName);
        
        const normalizedName = folderName.toLowerCase().trim();
        const folderId = 'folder-' + normalizedName.replace(/[^a-z0-9]/g, '-');
        
        let foundFolder = false;
        const folderElement = $(`#${folderId}`);
        if (folderElement.length > 0) {
            console.log('Найден элемент папки по ID, активируем:', folderId);
            folderElement.addClass('active-folder');
            folderElement.find('.folder-link').addClass('active');
            foundFolder = true;
        }
        
        if (!foundFolder) {
            const folderByData = $(`[data-folder-name="${normalizedName}"]`);
            if (folderByData.length > 0) {
                console.log('Найден элемент папки по data-атрибуту, активируем');
                folderByData.addClass('active-folder');
                folderByData.find('.folder-link').addClass('active');
                foundFolder = true;
            }
        }
        
        if (!foundFolder) {
            const linkByData = $(`.folder-link[data-folder="${folderName}"]`);
            if (linkByData.length > 0) {
                console.log('Найден элемент папки по data-атрибуту ссылки, активируем');
                linkByData.addClass('active');
                linkByData.parent().addClass('active-folder');
                foundFolder = true;
            }
        }
        
        if (!foundFolder) {
            $(`.folder-item`).each(function() {
                const linkText = $(this).find('.folder-link').text().trim().replace(/\s*\d+\s*$/, '');
                const folderTextMatch = linkText === folderName || 
                                      linkText.includes(folderName) || 
                                      folderName.includes(linkText);
                
                if (folderTextMatch) {
                    console.log('Нашли папку по тексту ссылки:', linkText);
                    $(this).addClass('active-folder');
                    $(this).find('.folder-link').addClass('active');
                    foundFolder = true;
                    return false; 
                }
            });
        }
    } else if (currentPath === '/notes/trash') {
        $('.nav-link').removeClass('active');
        $('.folder-link').removeClass('active');
        $('.folder-link').parent().removeClass('active-folder');
        $('.trash-link').addClass('active');
    } else if (archiveMode) {
        $('.nav-link').removeClass('active');
        $('.folder-link').removeClass('active');
        $('.folder-link').parent().removeClass('active-folder');
        $('.archive-link').addClass('active');
    } else {
        $('.nav-link').removeClass('active');
        $('.folder-link').removeClass('active');
        $('.folder-link').parent().removeClass('active-folder');
        $('.all-notes-link').addClass('active');
    }
    
    console.log('Загрузка заметок:', { 
        currentPath,
        folderMode,
        folderName,
        trashMode,
        archiveMode 
    });
    
    if (trashMode) {
        url += '?trash=true';
        console.log('Формируем URL для режима корзины:', url);
    } else if (archiveMode) {
        url += '?archive=true';
        console.log('Формируем URL для режима архива:', url);
    } else if (folderMode && folderName) {
        try {
            url += `?folder=${encodeURIComponent(folderName)}`;
            console.log('Используем имя папки для API запроса:', folderName);
            console.log('URL параметр для API:', `?folder=${encodeURIComponent(folderName)}`);
            console.log('ОТЛАДКА: Отображение заметок для папки', {
                folderMode,
                folderName,
                encodedParam: encodeURIComponent(folderName),
                url: url
            });
        } catch (e) {
            console.error('Ошибка кодирования имени папки:', e);
            url += `?folder=${encodeURIComponent(folderName)}`;
        }
    }
    
    loadStats();
    
    console.log('Делаем запрос на:', url);
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const notes = response.data;
            console.log('Загружено заметок:', notes.length, notes);
            console.log('URL запроса:', url);
            console.log('Режим архива:', archiveMode, 'Режим корзины:', trashMode, 'Режим папки:', folderMode);
            
            if (archiveMode) {
                console.log('ОТЛАДКА АРХИВА: Получено данных', {
                    total: notes.length,
                    archived: notes.filter(note => note.is_archived).length,
                    nonArchived: notes.filter(note => !note.is_archived).length,
                    deleted: notes.filter(note => note.is_deleted).length,
                    notDeleted: notes.filter(note => !note.is_deleted).length
                });
            }
            
            $('.notes-container, .trash-notes-container').empty();
            
            if (notes.length === 0) {
                console.log('Пустой массив заметок для режима: ' + 
                    (archiveMode ? 'архива' : trashMode ? 'корзины' : 'основной'));
                
                if (trashMode) {
                    $('.notes-container, .trash-notes-container').hide();
                    $('.empty-container, .empty-trash-container').removeClass('d-none');
                } else {
                    $('.notes-container').hide();
                    $('.empty-container').removeClass('d-none');
                }
                
                if (archiveMode) {
                    $('.empty-container h3').html('<i class="fas fa-archive me-2"></i>Архив пуст');
                    $('.empty-container p').text('Архивированные заметки будут отображаться здесь');
                    
                    if ($('.empty-container .btn').length === 0) {
                        $('.empty-container').append('<a href="/notes" class="btn btn-primary mt-3">Вернуться к заметкам</a>');
                    } else {
                        $('.empty-container .btn').attr('href', '/notes').html('Вернуться к заметкам').show();
                    }
                } else if (trashMode) {
                    $('.empty-container h3').html('<i class="fas fa-trash me-2"></i>Корзина пуста');
                    $('.empty-container p').text('Удаленные заметки будут появляться здесь');
                    
                    if ($('.empty-container .btn').length === 0) {
                        $('.empty-container').append('<a href="/notes" class="btn btn-primary mt-3">Вернуться к заметкам</a>');
                    } else {
                        $('.empty-container .btn').attr('href', '/notes').html('Вернуться к заметкам').show();
                    }
                }
            }
            
            let filteredNotes = notes;
            
            if (!trashMode && !archiveMode && !folderMode) {
                console.log('Фильтруем заметки, скрывая те, что в папках');
                filteredNotes = notes.filter(note => !note.folder);
                console.log('Отфильтровано заметок:', filteredNotes.length);
            } else if (folderMode && folderName) {
                console.log('Фильтруем заметки для папки:', folderName);
                filteredNotes = notes.filter(note => note.folder === folderName);
                console.log('Найдено заметок в папке:', filteredNotes.length);
            }
            
            console.log('Количество заметок после фильтрации:', filteredNotes.length);
            
            window.currentNotesCount = {
                total: filteredNotes.length,
                completed: filteredNotes.filter(note => note.done).length,
                active: filteredNotes.filter(note => !note.done).length,
                pinned: filteredNotes.filter(note => note.is_pinned).length
            };
            
            if ($('.counter-total').length) {
                $('.counter-total').text(window.currentNotesCount.total);
            }
            if ($('.counter-completed').length) {
                $('.counter-completed').text(window.currentNotesCount.completed);
            }
            if ($('.counter-active').length) {
                $('.counter-active').text(window.currentNotesCount.active);
            }
            if ($('.counter-pinned').length) {
                $('.counter-pinned').text(window.currentNotesCount.pinned);
            }
            
            if ($('#counter-all').length) {
                $('#counter-all').text(window.currentNotesCount.total);
            }
            if ($('#counter-done').length) {
                $('#counter-done').text(window.currentNotesCount.completed);
            }
            if ($('#counter-active-tab').length) {
                $('#counter-active-tab').text(window.currentNotesCount.active);
            }
            if ($('#counter-pinned-tab').length) {
                $('#counter-pinned-tab').text(window.currentNotesCount.pinned);
            }
            
            if (!filteredNotes || filteredNotes.length === 0) {
                $('.notes-container').hide();
                $('.empty-container').removeClass('d-none');
                
                let emptyMessage = 'Нет заметок';
                let emptyIcon = 'fa-sticky-note';
                let emptyButtonText = 'Создать заметку';
                let emptySubtext = 'Создайте свою первую заметку';
                
                if (trashMode) {
                    emptyMessage = 'Корзина пуста';
                    emptyIcon = 'fa-trash';
                    emptyButtonText = '';
                    emptySubtext = 'Здесь будут отображаться удаленные заметки';
                } else if (archiveMode) {
                    emptyMessage = 'Архив пуст';
                    emptyIcon = 'fa-archive';
                    emptyButtonText = '';
                    emptySubtext = 'Здесь будут отображаться архивированные заметки';
                } else if (folderMode) {
                    emptyMessage = `В папке "${folderName}" нет заметок`;
                    emptyIcon = 'fa-folder-open';
                    emptyButtonText = 'Создать заметку';
                    emptySubtext = 'Вы можете переместить существующие заметки в эту папку или создать новые';
                }
                
                $('.empty-container h3').html(`<i class="fas ${emptyIcon} me-2"></i>${emptyMessage}`);
                $('.empty-container p').text(emptySubtext);
                
                if (emptyButtonText) {
                    if ($('.empty-container .btn').length === 0) {
                        $('.empty-container').append(`<a href="/notes/create" class="btn btn-primary mt-3"><i class="fas fa-plus me-1"></i>${emptyButtonText}</a>`);
                    } else {
                        $('.empty-container .btn').html(`<i class="fas fa-plus me-1"></i>${emptyButtonText}`);
                    }
                } else {
                    $('.empty-container .btn').remove();
                }
                
                return;
            }
            
            if (trashMode) {
                $('.notes-container, .trash-notes-container').show();
                $('.empty-container, .empty-trash-container').addClass('d-none');
            } else {
                $('.notes-container').show();
                $('.empty-container').addClass('d-none');
            }
            
            const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
            const regularNotes = filteredNotes.filter(note => !note.is_pinned);
            
            const generateNoteHTML = (note, isPinned = false) => {
                const tagsArray = note.tags ? note.tags.split(',') : [];
                let tagsHTML = '';
                if (tagsArray.length > 0) {
                    tagsHTML = `
                        <div class="tags-container mt-2">
                            ${tagsArray.slice(0, 3).map(tag => `<span class="tag">#${tag}</span>`).join('')}
                            ${tagsArray.length > 3 ? `<span class="tag bg-secondary text-white">+${tagsArray.length - 3}</span>` : ''}
                        </div>
                    `;
                }
                
                const createdAt = new Date(note.created_at);
                const updatedAt = new Date(note.updated_at);
                const isUpdated = createdAt.getTime() !== updatedAt.getTime();
                const dateString = isUpdated ? 
                    `${formatDate(updatedAt)}` : 
                    `${formatDate(createdAt)}`;
                
                return `
                    <div class="note-item note-wrapper ${note.color} ${note.done ? 'completed' : ''} ${isPinned ? 'pinned' : ''}" 
                         id="note-${note.id}" data-id="${note.id}" data-color="${note.color}" data-done="${note.done}" 
                         data-pinned="${note.is_pinned}" data-tags="${note.tags || ''}" 
                         data-raw-tags="${note.tags || ''}" data-folder="${note.folder || ''}"
                         data-updated-at="${note.updated_at}"
                         style="position: relative;">
                        
                        <div class="row">
                            <div class="col-12">
                                <!-- Заголовок и статус -->
                                <div class="note-header">
                                    <h4>${note.name}</h4>
                                    <div class="note-status-priority">
                                        <span class="badge" style="background-color: ${getNoteColorHex(note.color)}; font-weight: 400;">
                                            ${getPriorityName(note.color)}
                                        </span>
                                        <span class="badge ${note.done ? 'bg-success' : 'bg-warning'} note-done-toggle" 
                                              onclick="toggleDone(${note.id}, event)" style="cursor: pointer;">
                                            ${note.done ? 'Выполнено' : 'Активно'}
                                        </span>
                                        ${note.folder ? `<span class="badge bg-secondary folder-badge" title="В папке: ${note.folder}">
                                            <i class="fas fa-folder me-1"></i>${note.folder}
                                        </span>` : ''}
                                        ${window.location.pathname.includes('/archive') ? '<span class="badge bg-info">Архивирован</span>' : ''}
                                        ${(window.location.pathname.includes('/trash') || window.location.pathname.includes('/new-trash')) ? '<span class="badge bg-danger">В корзине</span>' : ''}
                                        ${isPinned ? '<span class="badge pin-badge">Закреплено</span>' : ''}
                                    </div>
                                </div>
                                
                                <!-- Метаданные (дата) -->
                                <div class="note-meta">
                                    <div class="meta-item">
                                        <i class="far fa-clock me-1"></i>
                                        <span>${dateString}</span>
                                    </div>
                                </div>
                                
                                <!-- Теги -->
                                ${tagsHTML}
                                
                                <!-- Содержимое заметки -->
                                <div class="note-description">
                                    <div class="note-content-preview ${note.formatted_description && note.formatted_description.length > 200 || note.description && $('<div>').html(note.description).text().length > 100 ? 'has-more' : ''}">
                                    ${note.formatted_description ? 
                                      `<div class="formatted-content">${
                                        note.formatted_description.length > 200 ? 
                                        note.formatted_description.substring(0, 200) + '...' : 
                                        note.formatted_description}</div>` : 
                                      `<div>${$('<div>').html(note.description).text().length > 100 ? 
                                        $('<div>').html(note.description).text().substring(0, 100) + '...' : 
                                        note.description}</div>`}
                                    </div>
                                </div>
                                
                                <!-- Прикрепленные файлы -->
                                ${(function() {
                                    try {
                                        if (!note.files) return '';
                                        
                                        let filesArray = note.files;
                                        if (typeof filesArray === 'string') {
                                            try {
                                                filesArray = JSON.parse(filesArray);
                                                console.log('Преобразовали строку файлов в массив для заметки:', note.id);
                                            } catch(e) {
                                                console.error('Ошибка при преобразовании строки файлов:', e);
                                                filesArray = [];
                                            }
                                        }
                                        
                                        if (!Array.isArray(filesArray) || filesArray.length === 0) return '';
                                        
                                        const validFiles = filesArray.filter(file => file && file.name);
                                        if (validFiles.length === 0) return '';
                                        
                                        return `
                                            <div class="note-files mt-3">
                                                <div class="d-flex align-items-center">
                                                    <i class="fas fa-paperclip me-2 text-secondary"></i>
                                                    <a href="#" 
                                                       class="view-note-btn text-decoration-none"
                                                       data-id="${note.id}">
                                                       Прикрепленные файлы (${validFiles.length} шт.)
                                                    </a>
                                                </div>
                                            </div>
                                        `;
                                    } catch (e) {
                                        console.error('Ошибка при обработке файлов заметки:', e, note);
                                        return '';
                                    }
                                })()}
                                
                                <!-- Контейнер для кнопки просмотра и меню действий -->
                                <div class="d-flex justify-content-between align-items-center mt-2">
                                    <!-- Кнопка "Посмотреть" (слева) -->
                                    <div class="view-button-container">
                                        <span class="badge bg-primary view-more-badge view-note-btn" data-id="${note.id}" style="display: inline-block !important; visibility: visible !important;">
                                            <i class="fas fa-eye me-1"></i> Посмотреть
                                        </span>
                                    </div>
                                    
                                    <!-- Кнопки действий (справа) -->
                                    <div class="note-actions">
                                        <div class="dropdown d-inline-block" style="display: inline-block !important; visibility: visible !important;">
                                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="display: inline-block !important; visibility: visible !important;">
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
                                                <i class="fas ${note.done ? 'fa-circle' : 'fa-check-circle'}"></i> ${note.done ? 'Активно' : 'Выполнено'}
                                            </a></li>
                                            <li><a class="dropdown-item toggle-pin-btn" href="#" data-id="${note.id}">
                                                <i class="fas fa-thumbtack"></i> ${note.is_pinned ? 'Открепить' : 'Закрепить'}
                                            </a></li>
                                            ${note.folder ? `<li><a class="dropdown-item remove-from-folder-btn" href="#" data-id="${note.id}">
                                                <i class="fas fa-folder-minus"></i> Убрать из папки
                                            </a></li>` : ''}
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
                </div>
                `;
            };
            
            const notesContainer = trashMode ? $('.trash-notes-container, .notes-container') : $('.notes-container');
            
            pinnedNotes.forEach(note => {
                notesContainer.append(generateNoteHTML(note, true));
            });
            
            regularNotes.forEach(note => {
                notesContainer.append(generateNoteHTML(note, false));
            });
            
            initViewNoteHandlers();
            
            if (trashMode) {
                $('.restore-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    restoreNote(noteId);
                });
                
                $('.force-delete-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    forceDeleteNote(noteId);
                });
            } else {
                $('.delete-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    deleteNote(noteId);
                });
                
                $('.toggle-pin-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    togglePin(noteId);
                });
                
                $('.toggle-archive-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    if (window.location.pathname === '/notes/archive') {
                        unarchiveNote(noteId);
                    } else {
                        archiveNote(noteId);
                    }
                });
                
                $('.view-note-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    console.log('Клик на кнопке "Просмотр", ID заметки:', noteId);
                    
                    const currentPath = window.location.pathname;
                    let source = null;
                    
                    if (currentPath.includes('/trash') || currentPath.includes('/new-trash')) {
                        source = 'trash';
                        console.log('[NOTES.JS] Это заметка из корзины! ID=' + noteId + ', URL=' + currentPath);
                    } else if (currentPath.includes('/archive')) {
                        source = 'archive';
                        console.log('[NOTES.JS] Это заметка из архива! ID=' + noteId + ', URL=' + currentPath);
                    } else {
                        console.log('[NOTES.JS] Это обычная заметка, не из корзины и не из архива. URL=' + currentPath);
                    }
                    
                    if (typeof viewNote === 'function') {
                        console.log('[NOTES.JS] Вызываем viewNote с параметрами: ID=' + noteId + ', source=' + source);
                        viewNote(noteId, source);
                    } else {
                        console.error('Функция viewNote не найдена. Убедитесь, что подключен файл note-view.js');
                    }
                });
            }
            
            applyFilters();
            
            updatePageCounters();
        },
        error: function(error) {
            console.error('Ошибка при загрузке заметок:', error);
            $('.notes-container').html('<p class="text-danger">Ошибка при загрузке заметок</p>');
        }
    });
}

function loadNote(id) {
    $.ajax({
        url: `/api/notes/${id}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const note = response.data;
            
            $('#name').val(note.name);
            $('#description').val(note.formatted_description || note.description);
            $('#done').prop('checked', note.done);
            
            if (window.setQuillContent && typeof window.setQuillContent === 'function') {
                window.setQuillContent(note.formatted_description || note.description);
            }
            
            $('.color-option').removeClass('selected');
            $(`.color-option[data-color="${note.color || 'default'}"]`).addClass('selected');
            
            const createdAt = new Date(note.created_at);
            const updatedAt = new Date(note.updated_at);
            const formattedDate = `Создано: ${formatDate(createdAt)}${createdAt.getTime() !== updatedAt.getTime() ? ` • Обновлено: ${formatDate(updatedAt)}` : ''}`;
            $('#note-date').text(formattedDate);
            
            updatePinButtonState(note.is_pinned);
            
            if (note.tags) {
                const tagsList = note.tags.split(',');
                currentTags = tagsList;
                
                $('#tags-container').find('.tag').remove();
                
                tagsList.forEach(tag => {
                    $('#tag-input').before(`
                        <div class="tag" data-tag="${tag}">
                            ${tag}
                            <span class="remove-tag ms-1">&times;</span>
                        </div>
                    `);
                });
                
                $('.remove-tag').off('click').on('click', function() {
                    const tag = $(this).parent().data('tag');
                    $(this).parent().remove();
                    
                    currentTags = currentTags.filter(t => t !== tag);
                });
            }
            
            if (note.reminder_at) {
                const utcDate = new Date(note.reminder_at);
                const tzOffset = utcDate.getTimezoneOffset();
                const localDate = new Date(utcDate.getTime() - tzOffset * 60000);
                const year = localDate.getFullYear();
                const month = String(localDate.getMonth() + 1).padStart(2, '0');
                const day = String(localDate.getDate()).padStart(2, '0');
                const hours = String(localDate.getHours()).padStart(2, '0');
                const minutes = String(localDate.getMinutes()).padStart(2, '0');
                $('#reminder-date').val(`${year}-${month}-${day}T${hours}:${minutes}`);
                $('#reminder-actions').show();
            } else {
                $('#reminder-date').val('');
                $('#reminder-actions').hide();
            }
            
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
                            $('#reminder-status').text('Без напоминания');
                            showNotification('Напоминание удалено', 'info');
                        },
                        error: function(xhr, status, error) {
                            console.error('Ошибка при удалении напоминания:', error);
                            showNotification('Ошибка при удалении напоминания', 'danger');
                        }
                    });
                }
            });
            
            console.log('Файлы заметки:', note.files);
            console.log('Тип файлов:', typeof note.files, Array.isArray(note.files));
            
            if (typeof note.files === 'string') {
                try {
                    note.files = JSON.parse(note.files);
                    console.log('Преобразовали файлы из строки в массив:', note.files);
                } catch (e) {
                    console.error('Ошибка при парсинге строки файлов:', e);
                    note.files = [];
                }
            } else if (note.files === null || note.files === undefined) {
                note.files = [];
                console.log('Файлы были null или undefined, преобразовали в пустой массив');
            } else if (!Array.isArray(note.files)) {
                console.error('Файлы не являются массивом:', typeof note.files);
                note.files = [];
            }
            
            if (note.files && Array.isArray(note.files)) {
                let validFiles = note.files.filter(file => 
                    file && typeof file === 'object' && file.name && 
                    (file.url || file.path) 
                );
                
                console.log('Проверенные файлы для отображения:', validFiles.length, 'из', note.files.length);
                
                validFiles = validFiles.map(file => {
                    if (!file.url && file.path) {
                        file.url = `/storage/${file.path}`;
                    } else if (!file.url && !file.path) {
                        file.url = 'https://placehold.co/200?text=Файл+недоступен';
                        console.warn('У файла нет ни URL, ни path:', file);
                    }
                    return file;
                });

                window.currentNoteFiles = validFiles;
                console.log('Сохранили валидные файлы в window.currentNoteFiles:', window.currentNoteFiles);
                
                const filesContainer = $('#files-container');
                filesContainer.empty();
                
                filesContainer.append('<div id="existing-files" class="mt-3"></div>');
                const existingFilesContainer = $('#existing-files');
                
                if (validFiles.length > 0) {
                    existingFilesContainer.html('<h6 class="mt-3 mb-2">Прикрепленные файлы:</h6><div class="row g-2 files-container"></div>');
                    let filesHtml = '';
                    
                    validFiles.forEach((file, index) => {
                        const fileUrl = file.url || (file.path ? `/storage/${file.path}` : null);
                        if (!fileUrl) {
                            console.warn('Файл не имеет URL:', file);
                            return; 
                        }
                        
                        if (!file.type && file.extension) {
                            const ext = file.extension.toLowerCase();
                            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                                file.type = 'image';
                            } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
                                file.type = 'video';
                            } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
                                file.type = 'audio';
                            }
                        }
                        
                        let preview = '';
                        if (file.type === 'image') {
                            preview = `<img src="${fileUrl}" class="img-thumbnail w-100" style="height: 100px; object-fit: cover;" alt="${file.name}" onerror="this.onerror=null;this.src='https://placehold.co/200?text=Изображение+недоступно';this.style='height:100px;object-fit:cover;'">`;
                        } else if (file.type === 'video') {
                            preview = `<video src="${fileUrl}" controls style="width: 100%; height: 100px; object-fit: cover; background: #f8f9fa;" onerror="this.onerror=null;this.outerHTML='<div class=\\'d-flex align-items-center justify-content-center\\' style=\\'height:100px;background:#f8f9fa;\\'><i class=\\'fas fa-film fa-2x text-danger\\'></i></div>'"></video>`;
                        } else if (file.type === 'audio') {
                            preview = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-music fa-2x text-info"></i></div>`;
                        } else {
                            let iconClass = 'fa-file';
                            if (file.extension && typeof file.extension === 'string') {
                                const ext = file.extension.toLowerCase();
                                if (ext === 'pdf') iconClass = 'fa-file-pdf';
                                else if (['doc', 'docx'].includes(ext)) iconClass = 'fa-file-word';
                                else if (['xls', 'xlsx'].includes(ext)) iconClass = 'fa-file-excel';
                                else if (['ppt', 'pptx'].includes(ext)) iconClass = 'fa-file-powerpoint';
                                else if (['zip', 'rar', 'tar', 'gz'].includes(ext)) iconClass = 'fa-file-archive';
                                else if (['txt', 'rtf'].includes(ext)) iconClass = 'fa-file-alt';
                                else if (['exe'].includes(ext)) iconClass = 'fa-cog';
                            }
                            preview = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas ${iconClass} fa-2x text-secondary"></i></div>`;
                        }
                        
                        const isEditPage = window.location.pathname.includes('/notes/') && window.location.pathname.includes('/edit');
                        
                        if (isEditPage) {
                            filesHtml += `
                                <div class="col-md-3 col-sm-4 col-6 mb-3">
                                    <div class="card h-100">
                                        ${preview}
                                        <div class="card-body p-2 text-center">
                                            <p class="card-text small text-truncate mb-1" title="${file.name}">${file.name}</p>
                                            <div class="btn-group btn-group-sm w-100">
                                                <button type="button" class="btn btn-outline-primary file-preview-item" 
                                                        data-url="${fileUrl}" 
                                                        data-name="${file.name || ''}" 
                                                        data-size="${file.size || ''}" 
                                                        data-type="${file.type || ''}"
                                                        data-index="${index}" 
                                                        title="Открыть файл">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button type="button" class="btn btn-outline-danger remove-file" data-file-path="${file.path}" data-file-name="${file.name}" title="Удалить файл">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else {
                            filesHtml += `
                                <div class="col-md-3 col-sm-4 col-6 mb-3">
                                    <div class="card h-100">
                                        ${preview}
                                        <div class="card-body p-2 text-center">
                                            <p class="card-text small text-truncate mb-1" title="${file.name}">${file.name}</p>
                                            <button type="button" 
                                                class="btn btn-sm btn-outline-primary file-preview-item" 
                                                data-url="${fileUrl}" 
                                                data-name="${file.name || ''}" 
                                                data-size="${file.size || ''}" 
                                                data-type="${file.type || ''}"
                                                data-index="${index}">
                                                Открыть
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    });
                    
                    existingFilesContainer.find('.files-container').html(filesHtml);
                    
                    if (window.location.pathname.includes('/notes/') && window.location.pathname.includes('/edit')) {
                        setTimeout(function() {
                            $('.remove-file').off('click').on('click', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                const filePath = $(this).data('file-path');
                                const fileCard = $(this).closest('.col-md-3');
                                const fileName = $(this).data('file-name') || 'файл';
                                
                                console.log('Кнопка удаления нажата для файла:', fileName);
                                
                                try {
                                    createConfirmationModal({
                                        title: 'Удаление файла',
                                        message: `Вы уверены, что хотите удалить файл "${fileName}"?`,
                                        confirmButtonText: 'Удалить',
                                        cancelButtonText: 'Отмена',
                                        confirmButtonClass: 'btn-danger',
                                        icon: 'fa-trash',
                                        onConfirm: function() {
                                            console.log('Подтверждено удаление файла:', fileName);
                                            
                                            window.currentNoteFiles = window.currentNoteFiles.filter(file => file.path !== filePath);
                                            
                                            fileCard.remove();
                                            
                                            if (window.currentNoteFiles.length === 0) {
                                                $('#existing-files').hide();
                                            }
                                            
                                            showNotification(`Файл "${fileName}" успешно удален`, 'success');
                                        }
                                    });
                                } catch (e) {
                                    console.error('Ошибка создания модального окна:', e);
                                }
                            });
                        }, 100); 
                    }
                } else {
                    console.log('Нет валидных файлов для отображения');
                }
            } else {
                console.log('Нет файлов для отображения или формат неверный:', typeof note.files);
                window.currentNoteFiles = [];
                
                const existingFilesContainer = $('#existing-files');
                if (existingFilesContainer.length > 0) {
                    existingFilesContainer.empty();
                }
            }
        },
        error: function(error) {
            console.error('Ошибка при загрузке заметки:', error);
            alert('Ошибка при загрузке заметки');
        }
    });
}

function formatDate(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function updatePinButtonState(isPinned) {
    if (isPinned) {
        $('#toggle-pin-button')
            .removeClass('btn-outline-warning')
            .addClass('btn-warning')
            .attr('title', 'Открепить')
            .html('<i class="fas fa-thumbtack"></i>'); 
    } else {
        $('#toggle-pin-button')
            .removeClass('btn-warning')
            .addClass('btn-outline-warning')
            .attr('title', 'Закрепить')
            .html('<i class="fas fa-thumbtack"></i>');
    }
}

function createNote() {
    if (window.isCreatingNote) {
        console.log('Запрос на создание заметки уже выполняется, игнорируем повторный вызов');
        return;
    }
    
    window.isCreatingNote = true;
    
    $('#save-button').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Сохраняем...');
    
    const form = $('#create-note-form');
    if (form.attr('enctype') !== 'multipart/form-data') {
        console.log('Устанавливаем enctype="multipart/form-data" для формы создания заметки');
        form.attr('enctype', 'multipart/form-data');
    }
    
    const noteColor = $('.color-option.selected').data('color');
    
    if (typeof currentTags === 'undefined') {
        currentTags = [];
        console.log('Инициализирована пустая переменная currentTags');
    }
    
    const fileInput = $('#upload-files')[0];
    const hasFiles = fileInput && fileInput.files && fileInput.files.length > 0;
    
    if (hasFiles) {
        console.log('Обнаружены файлы для загрузки:', fileInput.files.length);
        if (fileInput.name !== 'upload_files[]') {
            console.log('Исправляем имя поля для файлов:', fileInput.name, '->', 'upload_files[]');
            fileInput.name = 'upload_files[]';
        }
    }

    const formData = new FormData();
    formData.append('name', $('#name').val());
    formData.append('description', $('#description').val());
    
    if ($('#reminder-date').val()) {
        const localValue = $('#reminder-date').val();
        const localDate = new Date(localValue);
        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
        const isoString = utcDate.toISOString().slice(0, 16);
        formData.append('reminder_at', isoString);
    }
    formData.append('color', noteColor || 'default');
    
    const isPinned = $('#is_pinned').is(':checked');
    console.log('Значение чекбокса is_pinned:', isPinned);
    formData.append('is_pinned', isPinned ? '1' : '0'); 
    
    formData.append('done', '0');
    
    const currentFolder = getCurrentFolderNameFromUrl();
    if (currentFolder) {
        formData.append('folder', currentFolder);
        console.log('Создаем заметку в папке:', currentFolder);
    }
    
    if (currentTags && currentTags.length > 0) {
        formData.append('tags', currentTags.join(','));
    }
    
    if (hasFiles) {
        console.log('Добавляем', fileInput.files.length, 'файлов к запросу');
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            console.log('Файл', i+1, ':', file.name, file.size, 'байт', file.type);
            formData.append('upload_files[]', file);
        }
        
        formData.append('has_files', 'true');
        formData.append('debug_files_count', fileInput.files.length);
    } else {
        console.log('Файлы для загрузки не выбраны');
        formData.append('has_files', 'false');
    }
    
    if (!$('#name').val() || !$('#description').val()) {
        showNotification('Пожалуйста, заполните название и описание заметки', 'warning');
        $('#save-button').prop('disabled', false).html('<i class="fas fa-save"></i> Сохранить');
        window.isCreatingNote = false;
        return;
    }
    
    console.log('Отправляю данные на сервер' + (hasFiles ? ' (с файлами)' : ''));
    
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    if (!csrfToken) {
        console.error('CSRF-токен отсутствует');
        showNotification('Ошибка безопасности: отсутствует CSRF-токен', 'danger');
        return;
    }
    
    console.log('CSRF-токен получен:', csrfToken);
    
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
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total * 100;
                    console.log('Загрузка: ' + percentComplete.toFixed(1) + '%');
                    
                    if (percentComplete < 100) {
                        $('#save-button').html('<i class="fas fa-spinner fa-spin"></i> Загрузка ' + percentComplete.toFixed(0) + '%');
                    } else {
                        $('#save-button').html('<i class="fas fa-spinner fa-spin"></i> Обработка...');
                    }
                }
            }, false);
            return xhr;
        },
        success: function(response) {
            window.isCreatingNote = false;
            
            console.log('Успешно создана заметка:', response);
            showNotification('Заметка успешно создана', 'success');
            
            $('#save-button').html('<i class="fas fa-check"></i> Сохранено!');
            
            if (typeof updateSidebarCounters === 'function') {
                updateSidebarCounters();
            } else if (typeof loadSidebarStats === 'function') {
                loadSidebarStats();
            }
            
            setTimeout(() => {
                const currentFolder = getCurrentFolderNameFromUrl();
                if (currentFolder) {
                    window.location.href = `/notes/folder/${encodeURIComponent(currentFolder)}`;
                } else {
                    window.location.href = '/notes';
                }
            }, 1000);
        },
        error: function(xhr, status, error) {
            window.isCreatingNote = false;
            $('#save-button').prop('disabled', false).html('<i class="fas fa-save"></i> Сохранить');
            
            console.error('Ошибка при создании заметки:', xhr.responseText);
            console.error('Статус ошибки:', status);
            console.error('Текст ошибки:', error);
            console.error('Заголовки ответа:', xhr.getAllResponseHeaders ? xhr.getAllResponseHeaders() : 'Недоступно');
            
            let errorMessage = 'Неизвестная ошибка';
            let errorDetails = '';
            
            try {
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                    
                    if (xhr.responseJSON.errors) {
                        errorDetails = Object.entries(xhr.responseJSON.errors)
                            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                            .join('\n');
                    }
                } else if (xhr.responseText) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        errorMessage = response.message || errorMessage;
                        
                        if (response.errors) {
                            errorDetails = Object.entries(response.errors)
                                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                                .join('\n');
                        }
                    } catch (parseError) {
                        console.error('Ошибка при парсинге ответа:', parseError);
                        errorDetails = xhr.responseText;
                    }
                }
            } catch (e) {
                console.error('Ошибка при обработке ответа:', e);
            }
            
            if (xhr.status === 413 || errorMessage.includes('размер') || errorMessage.includes('превышает') || errorMessage.includes('большой')) {
                showErrorModal('Превышен размер файла', errorMessage + (errorDetails ? '\n\nДетали:\n' + errorDetails : ''));
            } else {
                showNotification('Ошибка при создании заметки: ' + errorMessage, 'danger');
                
                if (errorDetails) {
                    if ($('#errorModal').length > 0) {
                        $('#errorModalText').text(errorMessage);
                        $('#errorModalDetails').text(errorDetails);
                        
                        $('#retryButton').one('click', function() {
                            $('#errorModal').modal('hide');
                            setTimeout(() => createNote(), 500);
                        });
                        
                        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
                        errorModal.show();
                    } else {
                        alert('Ошибка при создании заметки:\n' + errorMessage + '\n\nДетали:\n' + errorDetails);
                    }
                }
            }
        }
    });
}

function showNotification(message, type = 'info', duration = 3000) {
    if (window.showNotification && typeof window.showNotification === 'function' && 
        window.showNotification.toString() !== showNotification.toString()) {
        return window.showNotification(message, type, duration);
    }

    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    let icon;
    switch(type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        case 'danger':
        case 'error':
            type = 'danger';
            icon = 'fa-exclamation-circle';
            break;
        default:
            icon = 'fa-info-circle';
            type = 'info';
    }
    
    if ($('.notifications-container').length === 0) {
        $('body').append('<div class="notifications-container position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>');
    }
    
    const toast = $(`
        <div id="${notificationId}" class="notification-toast alert bg-${type} ${type === 'warning' ? 'text-dark' : 'text-white'} d-flex align-items-center fade show mb-2" 
             role="alert" aria-live="assertive" aria-atomic="true" style="border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.2); min-width: 300px; max-width: 400px;">
            <div class="d-flex w-100 align-items-center">
                <i class="fas ${icon} me-3" style="font-size: 1.2rem;"></i>
                <div class="notification-body flex-grow-1">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <div class="notification-progress-bar" style="position: absolute; bottom: 0; left: 0; height: 3px; background-color: rgba(255,255,255,0.7); width: 100%; transition: width linear;"></div>
        </div>
    `);
    
    $('.notifications-container').append(toast);
    toast.show();
    
    const progressBar = toast.find('.notification-progress-bar');
    progressBar.css('transition', `width ${duration}ms linear`);
    setTimeout(() => progressBar.css('width', '0%'), 50);

    toast.find('.btn-close').on('click', function() {
        toast.removeClass('show').addClass('hiding');
        setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => {
        toast.removeClass('show').addClass('hiding');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function handleFileUpload() {
    const currentPath = window.location.pathname;
    
    if (!currentPath.match(/\/notes\/create/) && !currentPath.match(/\/notes\/\d+\/edit/)) {
        console.log('Не страница создания/редактирования заметки, пропуск инициализации загрузки файлов');
        return;
    }
    
    if ($('#upload-files').length === 0) {
        console.log('Элемент #upload-files не найден, пропуск инициализации загрузки файлов');
        return;
    }
    
    const uploadInput = document.getElementById('upload-files');
    if (uploadInput && uploadInput.name !== 'upload_files[]') {
        console.log('Исправляем имя поля для файлов:', uploadInput.name, '->', 'upload_files[]');
        uploadInput.name = 'upload_files[]';
    }
    
    const form = $('#create-note-form, #edit-note-form').first();
    if (form && form.attr('enctype') !== 'multipart/form-data') {
        console.log('Устанавливаем правильный enctype для формы');
        form.attr('enctype', 'multipart/form-data');
    }
    
    if ($('#file-preview').length === 0) {
        console.log('Контейнер #file-preview не найден, создаем его');
        $('#files-container').append('<div id="file-preview" class="row g-2 mt-2"></div>');
    }
    
    $('#upload-files').on('change', function() {
        const files = this.files;
        
        if (this.name !== 'upload_files[]') {
            console.log('Исправляем имя поля файлов:', this.name, '->', 'upload_files[]');
            this.name = 'upload_files[]';
        }
        
        console.log('Выбрано файлов:', files.length);
        for (let i = 0; i < files.length; i++) {
            console.log(`Файл ${i+1}:`, files[i].name, files[i].size, 'байт', files[i].type);
        }
        
        $('#file-preview').empty();
        
        if (files.length > 10) {
            showErrorModal('Превышено количество файлов', 'Можно загрузить максимум 10 файлов за раз.');
            $(this).val('');
            return;
        }
        
        let totalSize = 0;
        for (let i = 0; i < files.length; i++) {
            totalSize += files[i].size;
            
            console.log(`Проверка файла ${i+1}: "${files[i].name}", размер: ${files[i].size} байт (${formatFileSize(files[i].size)})`);
            
            if (files[i].size > 15 * 1024 * 1024) {
                console.log('Файл превышает лимит 15 МБ, показываем модальное окно');
                showErrorModal('Превышен размер файла', `Файл "${files[i].name}" имеет размер ${formatFileSize(files[i].size)}. Максимально допустимый размер - 15 МБ.`);
                $(this).val(''); 
                $('#file-preview').empty();
                return;
            }
            
            createFilePreview(files[i]);
        }
        
        if (totalSize > 50 * 1024 * 1024) { 
            showErrorModal('Превышен общий размер файлов', `Общий размер выбранных файлов составляет ${formatFileSize(totalSize)}. Максимально допустимый размер - 50 МБ.`);
            $(this).val('');
            $('#file-preview').empty();
            return;
        }
    });
}

function createFilePreview(file) {
    const reader = new FileReader();
    const previewContainer = $('#file-preview');
    const fileType = getFileTypeByMime(file.type);
    
    reader.onload = function(e) {
        let previewElement = '';
        
        if (fileType === 'image') {
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

function getFileTypeByMime(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('text/') || mimeType.includes('pdf') || 
        mimeType.includes('document') || mimeType.includes('spreadsheet') ||
        mimeType.includes('presentation')) return 'document';
    return 'other';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showNotification(message, type = 'info', duration = 3000) {
    $('.notification-toast').remove();
    
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
    
    $('body').append(toast);
    
    if ($('.toast-container').length === 0) {
        $('body').append('<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>');
    }
    
    toast.show();

    toast.find('.btn-close').on('click', function() {
        toast.hide();
        setTimeout(() => toast.remove(), 500);
    });
    
    setTimeout(() => {
        toast.hide();
        setTimeout(() => toast.remove(), 500);
    }, duration);
}

function updateNote(id) {
    const noteColor = $('.color-option.selected').data('color');
    
    if (typeof currentTags === 'undefined') {
        currentTags = [];
        console.log('Инициализирована пустая переменная currentTags в updateNote');
    }
    
    const fileInput = $('#upload-files')[0];
    const hasFiles = fileInput && fileInput.files && fileInput.files.length > 0;
    
    console.log('Проверка наличия файлов в updateNote:');
    console.log('- fileInput существует:', !!fileInput);
    console.log('- fileInput.files существует:', fileInput ? !!fileInput.files : false);
    console.log('- количество файлов:', fileInput && fileInput.files ? fileInput.files.length : 0);
    console.log('- hasFiles =', hasFiles);
    
    const formData = new FormData();
    formData.append('name', $('#name').val());
    formData.append('description', $('#description').val());
    
    if ($('#reminder_at').length && $('#reminder_at').val()) {
        formData.append('reminder_at', $('#reminder_at').val());
        console.log('Использовано значение из скрытого поля reminder_at:', $('#reminder_at').val());
    } 
    else if ($('#reminder-date').val() && $('#reminder-type').val() !== 'none') {
        const localValue = $('#reminder-date').val();
        const localDate = new Date(localValue);
        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
        const isoString = utcDate.toISOString();
        formData.append('reminder_at', isoString);
        console.log('Создано значение reminder_at из поля даты:', isoString);
    } else {
        formData.append('reminder_at', '');
        console.log('Передано пустое значение для reminder_at');
    }
    formData.append('done', $('#done').is(':checked') ? '1' : '0');
    formData.append('color', noteColor || 'default');
    
    if ($('#is_pinned').length) {
        formData.append('is_pinned', $('#is_pinned').is(':checked') ? '1' : '0');
    }
    
    formData.append('_method', 'PUT'); 
    
    if (currentTags && currentTags.length > 0) {
        formData.append('tags', currentTags.join(','));
    }
    
    if (window.currentNoteFiles && Array.isArray(window.currentNoteFiles)) {
        console.log('Сохраняем существующие файлы:', window.currentNoteFiles);
        formData.append('files', JSON.stringify(window.currentNoteFiles));
    } else {
        console.log('Нет существующих файлов или они в неправильном формате');
        formData.append('files', JSON.stringify([]));
    }
    
    const form = $('#edit-note-form');
    if (form.attr('enctype') !== 'multipart/form-data') {
        console.log('Устанавливаем правильный enctype для формы');
        form.attr('enctype', 'multipart/form-data');
    }
    
    if (fileInput && fileInput.name !== 'upload_files[]') {
        console.log('Исправляем имя поля для файлов:', fileInput.name, '->', 'upload_files[]');
        fileInput.name = 'upload_files[]';
    }
    
    formData.append('debug_update', 'true');
    if (hasFiles) {
        formData.append('has_files', 'true');
        formData.append('debug_files_count', fileInput.files.length);
    }
    
    if (hasFiles) {
        console.log('Добавляем новые файлы в FormData:', fileInput.files.length, 'файлов');
        for (let i = 0; i < fileInput.files.length; i++) {
            console.log(`Добавление файла ${i+1}/${fileInput.files.length}: ${fileInput.files[i].name} (${formatFileSize(fileInput.files[i].size)})`);
            formData.append('upload_files[]', fileInput.files[i]);
        }
    } else {
        console.log('Новых файлов для загрузки нет');
        formData.append('upload_files[]', '');
    }
    
    if (!$('#name').val() || !$('#description').val()) {
        showNotification('Пожалуйста, заполните название и описание заметки', 'warning');
        return;
    }
    
    console.log('Обновляю заметку:', id);
    
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    if (!csrfToken) {
        console.error('CSRF-токен отсутствует');
        showNotification('Ошибка безопасности: отсутствует CSRF-токен', 'danger');
        return;
    }
    
    console.log('CSRF-токен получен:', csrfToken);
    
    console.log('Отправляемые данные:');
    let hasUploadFiles = false;
    for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
        if (pair[0] === 'upload_files[]') {
            hasUploadFiles = true;
            console.log('>>> Найден файл для загрузки:', pair[1].name);
        }
    }
    
    console.log('Проверка наличия файлов в FormData: ' + (hasUploadFiles ? 'ЕСТЬ' : 'НЕТ'));

    $.ajax({
        url: `/notes/${id}`,
        type: 'POST', 
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
            
            setTimeout(function() {
                window.location.href = '/notes';
            }, 1000); 
            
            const note = response.data;
            $('#name').val(note.name);
            $('#description').val(note.description);
            $('#done').prop('checked', note.done);
            
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

function deleteNote(id) {
    const modal = createConfirmationModal({
        id: `deleteNoteModal_${id}`,
        title: 'Подтвердите действие на сайте',
        message: 'Вы действительно хотите переместить эту заметку в корзину?',
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        confirmButtonClass: 'btn-danger',
        icon: 'fa-trash',
        onConfirm: function() {
            executeDeleteNote(id);
        }
    });
    
    modal.show();
}

function executeDeleteNote(id) {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    $(`.note-wrapper#note-${id}`).fadeOut(300);
    
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
            
            if (window.location.pathname.match(/\/notes\/\d+\/edit/)) {
                setTimeout(() => {
                    window.location.href = '/notes';
                }, 1000);
            } else {
                $(`.note-wrapper#note-${id}`).remove();
                
                if ($('.note-wrapper:visible').length === 0) {
                    $('.notes-container').hide();
                    $('.empty-container').removeClass('d-none');
                }
                
                if (window.location.pathname.startsWith('/notes/folder/')) {
                    const currentFolder = getCurrentFolderNameFromUrl();
                    console.log('Обновляем заметки в текущей папке:', currentFolder);
                    loadAllNotes(false, currentFolder);
                } else {
                    loadStats();
                }
                
                if (typeof updateSidebarCounters === 'function') {
                    setTimeout(updateSidebarCounters, 500);
                } else if (typeof loadSidebarStats === 'function') {
                    setTimeout(loadSidebarStats, 500);
                }
            }
        },
        error: function(error) {
            console.error('Ошибка при удалении заметки:', error);
            showNotification('Ошибка при удалении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}

function restoreNote(id) {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    let noteId = id;
    if (typeof noteId === 'string' && noteId.startsWith('note-')) {
        noteId = noteId.substring(5);
    }
    
    console.log(`Восстановление заметки из корзины: ${id} -> ${noteId}`);
    
    $.ajax({
        url: `/api/notes/${noteId}/restore`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        success: function(response) {
            showNotification('Заметка восстановлена', 'success');                
                if (typeof updateNoteInterface === 'function') {
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        
                        if ($('.note-wrapper:visible').length === 0) {
                            $('.trash-notes-container, .notes-container').hide();
                            $('.empty-trash-container, .empty-container').removeClass('d-none');
                        }
                    });
                    
                    $(document).trigger('note:restored', [id]);
                    
                    updateNoteInterface('restore', id);
                } else {
                $(`.note-wrapper#note-${id}`).fadeOut(300, function() {
                    $(this).remove();
                    
                    if ($('.note-wrapper:visible').length === 0) {
                        $('.notes-container').hide();
                        $('.empty-container').removeClass('d-none');
                    }
                });
            }
            
            loadStats();
        },
        error: function(error) {
            console.error('Ошибка при восстановлении заметки:', error);
            showNotification('Ошибка при восстановлении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}

function forceDeleteNote(id) {
    const modal = createConfirmationModal({
        id: `forceDeleteNoteModal_${id}`,
        title: 'Подтвердите действие на сайте',
        message: 'Вы действительно хотите удалить эту заметку навсегда? Это действие нельзя отменить.',
        confirmButtonText: 'Удалить навсегда',
        cancelButtonText: 'Отмена',
        confirmButtonClass: 'btn-danger',
        icon: 'fa-trash-alt',
        onConfirm: function() {
            executeForceDeleteNote(id);
        }
    });
    
    modal.show();
}

function executeForceDeleteNote(id) {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    let noteId = id;
    if (typeof noteId === 'string' && noteId.startsWith('note-')) {
        noteId = noteId.substring(5);
    }
    
    console.log(`Окончательное удаление заметки: ${id} -> ${noteId}`);
    
    $.ajax({
        url: `/api/notes/${noteId}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        success: function(noteData) {
            let files = [];
            
            if (noteData && noteData.files) {
                try {
                    if (typeof noteData.files === 'string') {
                        files = JSON.parse(noteData.files);
                    } else if (Array.isArray(noteData.files)) {
                        files = noteData.files;
                    }
                    console.log(`Найдено ${files.length} файлов для удаления`);
                } catch (e) {
                    console.error('Ошибка при обработке файлов заметки перед удалением:', e);
                }
            }
            
            const deleteAttachedFiles = function(files, callback) {
                if (!files || !files.length) {
                    console.log('Нет файлов для удаления');
                    callback();
                    return;
                }
                
                let deletedCount = 0;
                let errorCount = 0;
                
                const deletePromises = files.map(file => {
                    return new Promise((resolve) => {
                        if (!file.path) {
                            console.warn('Файл не имеет пути для удаления:', file);
                            resolve();
                            return;
                        }
                        
                        $.ajax({
                            url: `/api/files/${encodeURIComponent(file.path)}`,
                            method: 'DELETE',
                            headers: {
                                'X-CSRF-TOKEN': csrfToken,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            success: function() {
                                console.log(`Файл ${file.name} удален успешно`);
                                deletedCount++;
                                resolve();
                            },
                            error: function(error) {
                                console.error(`Ошибка при удалении файла ${file.name}:`, error);
                                errorCount++;
                                resolve(); 
                            }
                        });
                    });
                });
                
                Promise.all(deletePromises).then(() => {
                    if (deletedCount > 0) {
                        console.log(`Удалено файлов: ${deletedCount}`);
                        showNotification(`Удалены ${deletedCount} прикрепленных файлов`, 'info');
                    }
                    if (errorCount > 0) {
                        console.warn(`Ошибок при удалении файлов: ${errorCount}`);
                    }
                    callback();
                });
            };
            
            deleteAttachedFiles(files, function() {
                $.ajax({
                    url: `/api/notes/${noteId}/force`,
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    success: function(response) {
                        showNotification('Заметка окончательно удалена', 'warning');                
                        if (typeof updateNoteInterface === 'function') {
                            $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                                $(this).remove();
                                
                                if ($('.note-wrapper:visible').length === 0) {
                                    $('.trash-notes-container, .notes-container').hide();
                                    $('.empty-trash-container, .empty-container').removeClass('d-none');
                                }
                            });
                            
                            $(document).trigger('note:forceDeleted', [id]);
                            updateNoteInterface('force_delete', id);
                        } else {
                            $(`.note-wrapper#note-${id}`).fadeOut(300, function() {
                                $(this).remove();
                                
                                if ($('.note-wrapper:visible').length === 0) {
                                    $('.notes-container').hide();
                                    $('.empty-container').removeClass('d-none');
                                }
                            });
                        }
                        
                        loadStats();
                        
                        if (typeof updateSidebarCounters === 'function') {
                            setTimeout(updateSidebarCounters, 500);
                        } else if (typeof loadSidebarStats === 'function') {
                            setTimeout(loadSidebarStats, 500);
                        }
                    },
                    error: function(error) {
                        console.error('Ошибка при удалении заметки:', error);
                        showNotification('Ошибка при удалении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
                    }
                });
            });
        },
        error: function(error) {
            console.error('Ошибка при получении данных заметки перед удалением:', error);
            showNotification('Не удалось получить данные заметки для удаления', 'danger');
        }
    });
}

function emptyTrash() {
    console.log('Функция emptyTrash вызвана');
    const noteElements = $('.note-wrapper');
    console.log('Найдено элементов в корзине:', noteElements.length);
    
    const noteIds = Array.from(noteElements).map(el => {
        return $(el).attr('id');
    });
    
    if (noteIds.length === 0) {
        showNotification('Корзина уже пуста', 'info');
        return;
    }
    
    const overlay = $('<div></div>').css({
        'position': 'fixed',
        'top': 0,
        'left': 0,
        'width': '100%',
        'height': '100%',
        'background-color': 'rgba(0, 0, 0, 0.5)',
        'z-index': 1050,
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
    }).attr('id', 'confirmTrashOverlay');
    
    const dialogBox = $(`
        <div style="width: 400px; background-color: #fff; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
            <div style="padding: 15px 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                <h5 style="margin: 0; font-size: 18px; color: #dc3545;">
                    <i class="fas fa-trash" style="margin-right: 8px; color: #dc3545;"></i>Удаление корзины
                </h5>
                <span id="closeTrashBtn" style="cursor: pointer; font-size: 20px; color: #6c757d;">&times;</span>
            </div>
            <div style="padding: 20px;">
                <div style="display: flex; align-items: flex-start;">
                    <i class="fas fa-info-circle" style="color: #6c757d; margin-right: 10px; font-size: 18px;"></i>
                    <p style="margin: 0;">Вы уверены, что хотите удалить все заметки из корзины?</p>
                </div>
                <p style="color: #6c757d; margin-top: 10px; margin-bottom: 0; margin-left: 28px;">Заметки будут удалены безвозвратно.</p>
            </div>
            <div style="display: flex; justify-content: flex-end; padding: 15px 20px; gap: 10px; border-top: 1px solid #e9ecef;">
                <button id="cancelTrashBtn" class="btn btn-secondary" style="min-width: 100px;">
                    <i class="fas fa-times"></i> Отмена
                </button>
                <button id="confirmTrashBtn" class="btn btn-danger" style="min-width: 100px;">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `);
    
    overlay.append(dialogBox);
    $('body').append(overlay);
    
    $('#cancelTrashBtn, #closeTrashBtn').on('click', function() {
        overlay.remove();
    });
    
    $('#confirmTrashBtn').on('click', function() {
        overlay.remove();
        executeEmptyTrash(noteIds);
    });
}

function executeEmptyTrash(noteIds) {
    let deletedCount = 0;
    let errorCount = 0;
    
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    if (!noteIds || noteIds.length === 0) {
        showNotification('Нет заметок для удаления', 'info');
        return;
    }
    
    console.log('Удаление заметок из корзины:', noteIds);
    
    noteIds.forEach(id => {
        let noteId = id;
        
        if (typeof noteId === 'string' && noteId.startsWith('note-')) {
            noteId = noteId.substring(5);
        }
        
        console.log(`Удаление заметки: ${id} -> ${noteId}`);
        
        $.ajax({
            url: `/api/notes/${noteId}/force`,
            method: 'DELETE',
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            },
            success: function(response) {
                console.log(`Заметка ${noteId} успешно удалена:`, response);
                deletedCount++;
                
                const noteElement = $(`.note-wrapper#note-${noteId}, #note-${noteId}`);
                noteElement.fadeOut(300, function() {
                    $(this).remove();
                    
                    if (deletedCount + errorCount === noteIds.length) {
                        completeTrashEmptying(deletedCount, errorCount);
                    }
                });
            },
            error: function(error) {
                console.error(`Ошибка при удалении заметки ${noteId}:`, error);
                errorCount++;
                
                if (deletedCount + errorCount === noteIds.length) {
                    completeTrashEmptying(deletedCount, errorCount);
                }
            }
        });
    });
    
    function completeTrashEmptying(success, errors) {
        if (success > 0) {
            const message = errors > 0 
                ? `Удалено ${success} заметок, ${errors} с ошибками` 
                : `Корзина очищена. Удалено ${success} заметок`;
                
            showNotification(message, errors > 0 ? 'warning' : 'success');

            if ($('.note-wrapper:visible').length === 0) {
                $('.notes-container, .trash-notes-container').hide();
                $('.empty-container, .empty-trash-container').removeClass('d-none');
            }
            
            loadStats();
        } else if (errors > 0) {
            showNotification(`Не удалось удалить заметки (${errors})`, 'danger');
        }
    }
}

function togglePin(id) {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    if (!csrfToken) {
        console.error('CSRF-токен отсутствует');
        showNotification('Ошибка безопасности: отсутствует CSRF-токен', 'danger');
        return;
    }
    
    const $pinButton = $('#toggle-pin-button');
    const isPinnedBefore = $pinButton.hasClass('btn-warning');
    
    $.ajax({
        url: `/notes/${id}/toggle-pin`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        dataType: 'json',
        success: function(response) {
            const note = response.data;
            
            if (window.location.pathname.match(/\/notes\/\d+\/edit/)) {
                if (isPinnedBefore !== note.is_pinned) {
                    updatePinButtonState(note.is_pinned);
                    showNotification(note.is_pinned ? 'Заметка закреплена' : 'Заметка откреплена', 'info');
                    console.log('Состояние закрепления изменилось с', isPinnedBefore, 'на', note.is_pinned);
                } else {
                    console.warn('Состояние закрепления не изменилось:', note.is_pinned);
                }
            } 
            else {
                loadAllNotes(window.location.pathname === '/notes/trash');
                showNotification(note.is_pinned ? 'Заметка закреплена' : 'Заметка откреплена', 'info');
            }
            
            loadStats();
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при изменении статуса закрепления:', xhr.responseText, status, error);
            showNotification('Ошибка при изменении статуса закрепления', 'danger');
        }
    });
}

function applyFilters() {
    const searchQuery = $('#search-notes').val().toLowerCase();
    const activeFilter = $('.filter-btn.btn-secondary').data('filter') || $('input[name="sidebar-filter"]:checked').val() || 'all';
    
    $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
    $(`.filter-btn[data-filter="${activeFilter}"]`).removeClass('btn-outline-secondary').addClass('btn-secondary');
    $(`#filter-${activeFilter}`).prop('checked', true);
    
    console.log('Применяем фильтры:', { searchQuery, activeFilter });
    
    $('.note-wrapper, .note-item').each(function() {
        let shouldShow = true;
        
        switch (activeFilter) {
            case 'active':
                if ($(this).data('done') === true) {
                    shouldShow = false;
                }
                break;
            case 'completed':
                if ($(this).data('done') !== true) {
                    shouldShow = false;
                }
                break;
            case 'pinned':
                if ($(this).data('pinned') !== true) {
                    shouldShow = false;
                }
                break;
        }
        
        if (searchQuery) {
            const title = $(this).find('h4').text().toLowerCase();
            const description = $(this).find('.note-description').text().toLowerCase();
            const tags = $(this).data('tags') ? $(this).data('tags').toLowerCase() : '';
            
            if (!title.includes(searchQuery) && !description.includes(searchQuery) && !tags.includes(searchQuery)) {
                shouldShow = false;
            }
        }
        
        if (shouldShow) {
            $(this).fadeIn(300);
        } else {
            $(this).fadeOut(300);
        }
    });
    
    setTimeout(() => {
        const visibleNotes = $('.note-wrapper:visible').length;
        
        updatePageCounters();
        
        if (visibleNotes === 0) {
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
        
        console.log('Видимые заметки после применения фильтров:', visibleNotes);
    }, 350);
}

function loadStats() {
    console.log('Загружаем статистику...');
    return $.ajax({
        url: '/api/stats',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.data) {
                statsData = response.data;
                console.log('Статистика успешно обновлена:', statsData);
                updateStatsDisplay();
                return true;
            } else {
                console.error('Ошибка формата ответа при загрузке статистики:', response);
                return false;
            }
        },
        error: function(error) {
            console.error('Ошибка при загрузке статистики:', error);
            return false;
        }
    });
}

function getCurrentFolderNameFromUrl() {
    const folderMatch = window.location.pathname.match(/\/notes\/folder\/(.+)/);
    if (folderMatch) {
        try {
            let folderName = decodeURIComponent(folderMatch[1]);
            while (folderName !== decodeURIComponent(folderName)) {
                folderName = decodeURIComponent(folderName);
            }
            console.log('getCurrentFolderNameFromUrl: Декодированное имя папки:', folderName);
            return folderName;
        } catch (e) {
            console.error('getCurrentFolderNameFromUrl: Ошибка при декодировании имени папки:', e);
            return folderMatch[1]; 
        }
    }
    return null;
}

window.getCurrentFolderNameFromUrl = getCurrentFolderNameFromUrl;

function updateStatsDisplay() {
    if (statsData) {
        console.log('Обновляем статистику:', statsData);
        
        const visibleNotes = {
            total: $('.note-wrapper:visible').length, 
            active: $('.note-wrapper:visible:not(.completed)').length,
            completed: $('.note-wrapper:visible.completed').length,
            pinned: $('.note-wrapper:visible.pinned').length
        };
        
        const folderMode = window.location.pathname.match(/\/notes\/folder\/(.+)/) !== null;
        const currentFolderName = folderMode ? getCurrentFolderNameFromUrl() : null;
        
        const trashMode = (typeof pageData !== 'undefined' && pageData.trashMode) || window.location.pathname === '/notes/trash';
        const archiveMode = (typeof pageData !== 'undefined' && pageData.archiveMode) || window.location.pathname === '/notes/archive';
        
        $('#total-notes').text(`Всего: ${visibleNotes.total}`);
        $('#completed-notes').text(`Выполнено: ${visibleNotes.completed}`);
        $('#active-notes').text(`Активно: ${visibleNotes.active}`);
        $('#pinned-notes').text(`Закреплено: ${visibleNotes.pinned}`);
        
        $('.counter-total').text(visibleNotes.total);
        $('.counter-completed').text(visibleNotes.completed);
        $('.counter-active').text(visibleNotes.active);
        $('.counter-pinned').text(visibleNotes.pinned);
        
        if (folderMode && currentFolderName) {
            console.log('Отображается статистика для текущей папки:', currentFolderName, visibleNotes);
        } else if (trashMode) {
            console.log('Отображается статистика для корзины:', visibleNotes);
        } else if (archiveMode) {
            console.log('Отображается статистика для архива:', visibleNotes);
        } else {
            console.log('Отображается статистика для всех заметок:', visibleNotes);
        }
        
        $('#archived-notes').text(`В архиве: ${statsData.archived || 0}`);
        $('#trashed-notes').text(`В корзине: ${statsData.trashed || 0}`);
        $('#reminders-notes').text(`С напоминаниями: ${statsData.with_reminders || 0}`);
        
        updatePageCounters();
        
        if (statsData.by_folder) {
            $('#folders-list').empty();
            
            Object.keys(statsData.by_folder).forEach(folderName => {
                const count = statsData.by_folder[folderName];
                addFolderToSidebar(folderName, count);
            });
            
            if (typeof initFolderHandlers === 'function') {
                initFolderHandlers();
            }
        }
    }
}

function initTheme() {
    if (currentTheme === 'dark') {
        $('body').addClass('dark-theme');
        $('#theme-toggle').prop('checked', true);
    } else {
        $('body').removeClass('dark-theme');
        $('#theme-toggle').prop('checked', false);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    initTheme();
}

function archiveNote(id) {

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
            
            if (typeof updateNoteInterface === 'function') {
                updateNoteInterface('archive', id);
            } else {
                if (window.location.pathname === '/notes') {
                    $(`.note-wrapper#${id}`).fadeOut(300, function() {
                        $(this).remove();
                        
                        if ($('.note-wrapper:visible').length === 0) {
                            $('.notes-container').hide();
                            $('.empty-container').removeClass('d-none');
                        }
                    });
                } else {
                    loadAllNotes(window.location.pathname === '/notes/trash');
                }
                
                loadStats();
            }
            
            if (typeof updateSidebarCounters === 'function') {
                setTimeout(updateSidebarCounters, 500);
            } else if (typeof loadSidebarStats === 'function') {
                setTimeout(loadSidebarStats, 500);
            }
        },
        error: function(error) {
            console.error('Ошибка при архивации заметки:', error);
            showNotification('Ошибка при архивации заметки', 'danger');
        }
    });
}

function unarchiveNote(id) {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}/unarchive`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function(response) {
            showNotification('Заметка извлечена из архива', 'info');
            
            if (typeof updateNoteInterface === 'function') {
                updateNoteInterface('unarchive', id);
            } else {
                if (window.location.pathname === '/notes/archive') {
                    $(`.note-wrapper#${id}`).fadeOut(300, function() {
                        $(this).remove();
                        
                        if ($('.note-wrapper:visible').length === 0) {
                            $('.notes-container').hide();
                            $('.empty-container').removeClass('d-none');
                        }
                    });
                }
                
                loadStats();
                
                if (window.location.pathname === '/notes') {
                    loadAllNotes(false);
                }
            }
            
            if (typeof updateSidebarCounters === 'function') {
                setTimeout(updateSidebarCounters, 500);
            } else if (typeof loadSidebarStats === 'function') {
                setTimeout(loadSidebarStats, 500);
            }
        },
        error: function(error) {
            console.error('Ошибка при извлечении заметки из архива:', error);
            showNotification('Ошибка при извлечении заметки из архива', 'danger');
        }
    });
}

function setReminder(id, dateTime) {
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

function removeReminder(id) {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}/reminder`,
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function() {
            showNotification('Напоминание удалено', 'info');
            
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

function addFolder(folderName) {
    if (!folderName || folderName.trim() === '') return;
    
    console.log('Создание новой папки:', folderName);
    
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    const tempId = 'new-folder-' + Date.now();
    addFolderToSidebar(folderName, 0, tempId);
    
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
                console.log('Папка успешно создана:', response);
                
                $(`#${tempId}`).remove();
                addFolderToSidebar(folderName, 0);
                
                showNotification('Папка успешно добавлена', 'success');
                
                loadStats();
            } else {
                $(`#${tempId}`).remove();
                showNotification(response.message || 'Ошибка при создании папки', 'warning');
            }
        },
        error: function(xhr) {
            $(`#${tempId}`).remove();
            
            let errorMessage = 'Ошибка при создании папки';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            console.error('Ошибка при создании папки:', xhr);
            showNotification(errorMessage, 'danger');
        }
    });
}

function addFolderToSidebar(folderName, count, customId = null) {

    const normalizedName = folderName.toLowerCase().trim();
    const folderId = customId || ('folder-' + normalizedName.replace(/[^a-z0-9]/g, '-'));
    
    console.log('Добавление папки в сайдбар:', folderName, 'ID:', folderId);
    
    if (!customId) {
        const existingFolder = $(`#${folderId}, [data-folder-name="${normalizedName}"]`);
        if (existingFolder.length > 0) {
            existingFolder.find('.badge').text(count);
            console.log('Папка уже существует, обновляем счетчик:', count);
            return;
        }
    }
    
    const currentPath = window.location.pathname;
    const folderMatch = currentPath.match(/\/notes\/folder\/(.+)/);
    let isActive = false;
    
    if (folderMatch) {
        try {
            let currentFolderName = decodeURIComponent(folderMatch[1]);
            while (currentFolderName !== decodeURIComponent(currentFolderName)) {
                currentFolderName = decodeURIComponent(currentFolderName);
            }
            isActive = (currentFolderName === folderName);
        } catch (e) {
            console.error('Ошибка при определении активной папки:', e);
        }
    }
    
    $('#folders-list').append(`
        <div class="d-flex justify-content-between align-items-center mb-2 folder-item ${isActive ? 'active-folder' : ''}" 
             id="${folderId}" 
             data-folder-name="${normalizedName}" 
             data-folder-original="${folderName}">
            <a href="/notes/folder/${encodeURIComponent(folderName)}" 
               class="text-decoration-none text-dark folder-link ${isActive ? 'active' : ''}" 
               data-folder="${folderName}">
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
                            <i class="fas fa-trash me-1"></i> Удалить
                        </a></li>
                        <li><a class="dropdown-item move-notes-to-folder" href="#" data-folder="${folderName}">
                            <i class="fas fa-arrow-right me-1"></i> Переместить заметки сюда
                        </a></li>
                    </ul>
                </div>
            </div>
        </div>
    `);
    
    initFolderEventHandlers();
}

function initFolderEventHandlers() {
    $('.rename-folder').off('click').on('click', function(e) {
        e.preventDefault();
        const oldFolderName = $(this).data('folder');
        showFolderInputModal({
            title: 'Переименование папки',
            placeholder: 'Введите новое название папки',
            value: oldFolderName,
            confirmText: 'Переименовать',
            onConfirm: function(newFolderName) {
                if (newFolderName && newFolderName !== oldFolderName) {
                    renameFolder(oldFolderName, newFolderName);
                }
            }
        });
    });
function showFolderInputModal({ title, placeholder, value = '', confirmText = 'OK', onConfirm }) {
    $('#folderInputModal').remove();
    const modalHtml = `
        <div class="modal fade" id="folderInputModal" tabindex="-1" aria-labelledby="folderInputModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-light">
                        <h5 class="modal-title" id="folderInputModalLabel">
                            <i class="fas fa-edit me-2"></i>${title}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group mb-0">
                            <input type="text" class="form-control" id="folder-input-field" placeholder="${placeholder}" value="${value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" autofocus>
                        </div>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>Отмена
                        </button>
                        <button type="button" class="btn btn-primary" id="folder-input-confirm">
                            <i class="fas fa-check me-1"></i>${confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('body').append(modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('folderInputModal'));
    modal.show();
    setTimeout(() => { $('#folder-input-field').focus(); }, 300);
    $('#folder-input-confirm').off('click').on('click', function() {
        const val = $('#folder-input-field').val().trim();
        modal.hide();
        if (onConfirm) onConfirm(val);
    });
    $('#folder-input-field').off('keydown').on('keydown', function(e) {
        if (e.key === 'Enter') {
            $('#folder-input-confirm').click();
        }
    });
}
    
    $('.delete-folder').off('click').on('click', function(e) {
        e.preventDefault();
        const folderName = $(this).data('folder');
        showConfirmModal({
            title: `<span class='text-danger'><i class='fas fa-trash-alt me-2'></i>Удаление папки</span>`,
            message: `Вы уверены, что хотите удалить папку <strong>${folderName}</strong>?<br><span class='d-block mt-3 mb-2 text-muted'><i class='fas fa-info-circle me-1'></i>Заметки в папке не будут удалены, но будут перемещены в общий список.</span>`,
            confirmText: '<i class="fas fa-trash me-1"></i>Удалить',
            confirmClass: 'btn-danger',
            cancelText: '<span style="font-weight:500">× Отмена</span>',
            onConfirm: function() {
                deleteFolder(folderName);
            }
        });
    });
function showConfirmModal({ title, message, confirmText = 'OK', confirmClass = 'btn-primary', cancelText = '× Отмена', onConfirm }) {
    $('#confirmActionModal').remove();
    const modalHtml = `
        <div class="modal fade" id="confirmActionModal" tabindex="-1" aria-labelledby="confirmActionModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-light">
                        <h5 class="modal-title w-100 d-flex align-items-center gap-2" id="confirmActionModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div>${message}</div>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
                        <button type="button" class="btn ${confirmClass}" id="confirm-action-btn">${confirmText}</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('body').append(modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('confirmActionModal'));
    modal.show();
    $('#confirm-action-btn').off('click').on('click', function() {
        modal.hide();
        if (onConfirm) onConfirm();
    });
}
}

function applySorting(sortType) {
    currentSort = sortType;
    
    const notes = $('.note-wrapper');
    const notesContainer = $('.notes-container');
    
    const notesArray = Array.from(notes);
    
    switch (sortType) {
        case 'date-new':
            notesArray.sort((a, b) => {
                const dateA = new Date($(a).data('updated-at') || 0);
                const dateB = new Date($(b).data('updated-at') || 0);
                return dateB - dateA;
            });
            break;
        case 'date-old':
            notesArray.sort((a, b) => {
                const dateA = new Date($(a).data('updated-at') || 0);
                const dateB = new Date($(b).data('updated-at') || 0);
                return dateA - dateB; 
            });
            break;
        case 'alpha-asc':
            notesArray.sort((a, b) => {
                const titleA = $(a).find('h4').text().toLowerCase();
                const titleB = $(b).find('h4').text().toLowerCase();
                return titleA.localeCompare(titleB); 
            });
            break;
        case 'alpha-desc':
            notesArray.sort((a, b) => {
                const titleA = $(a).find('h4').text().toLowerCase();
                const titleB = $(b).find('h4').text().toLowerCase();
                return titleB.localeCompare(titleA); 
            });
            break;
        case 'color':
            const colorOrder = [
                'red', 'orange', 'yellow', 'green', 'blue', 'light-blue',  
                'purple', 'pink', 'teal', 'cyan', 'indigo', 'brown', 
                'black', 'dark-blue', 'default'
            ];
            
            notesArray.sort((a, b) => {
                const colorA = $(a).data('color') || 'default';
                const colorB = $(b).data('color') || 'default';
                
                const indexA = colorOrder.indexOf(colorA);
                const indexB = colorOrder.indexOf(colorB);
                
                if (indexA === indexB) {
                    const dateA = new Date($(a).data('updated-at') || 0);
                    const dateB = new Date($(b).data('updated-at') || 0);
                    return dateB - dateA; 
                }
                
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                
                return indexA - indexB;
            });
            break;
    }
    
    notesContainer.empty();
    
    const pinnedNotes = notesArray.filter(note => $(note).data('pinned') === true);
    const regularNotes = notesArray.filter(note => $(note).data('pinned') !== true);
    
    pinnedNotes.forEach(note => {
        notesContainer.append(note);
    });
    
    regularNotes.forEach(note => {
        notesContainer.append(note);
    });
    
    $('.note-wrapper').hide().fadeIn(300);
    
    setTimeout(updatePageCounters, 350);
}

function performSearch(query) {
    if (!query || query.trim() === '') {
        $('#search-results').empty().hide();
        return;
    }
    
    $('#search-results').html('<div class="p-3 text-center"><i class="fas fa-spinner fa-spin"></i> Поиск...</div>').show();
    
    const notes = $('.note-wrapper');
    const results = [];
    
    const isTagSearch = query.startsWith('#');
    const tagQuery = isTagSearch ? query.substring(1).toLowerCase() : '';
    
    notes.each(function() {
        const title = $(this).find('h4').text().toLowerCase();
        const description = $(this).find('.note-description').text().toLowerCase();
        const tags = $(this).attr('data-tags') || $(this).data('tags') || '';
        const id = $(this).attr('id');
        
        console.log(`[DEBUG] Проверка заметки ID: ${id}, Теги: "${tags}"`)
        
        if (isTagSearch) {
            if (tags) {
                const noteTags = tags.split(',').map(tag => tag.trim().toLowerCase());
                console.log(`Заметка ID: ${id}, Название: ${title}, Теги: ${noteTags.join(', ')}`);
                console.log(`Ищем: '${tagQuery}', Есть: ${noteTags.some(tag => tag.includes(tagQuery))}`);
                
                const found = noteTags.some(tag => {
                    if (tag === tagQuery) return true;
                    if (tag.startsWith(tagQuery)) return true;
                    if (tag.includes(tagQuery)) return true;
                    if (tagQuery.includes(tag)) return true;
                    return false;
                });
                
                if (found) {
                    results.push({
                        id: id,
                        title: title,
                        description: description,
                        color: $(this).data('color'),
                        tags: tags
                    });
                }
            }
        } 
        else if (
            title.includes(query.toLowerCase()) || 
            description.includes(query.toLowerCase()) || 
            tags.toLowerCase().includes(query.toLowerCase())
        ) {
            results.push({
                id: id,
                title: title,
                description: description,
                color: $(this).data('color'),
                tags: tags
            });
        }
    });
    
    if (results.length > 0) {
        $('#search-results').empty();
        
        results.forEach(result => {
            const highlightedTitle = highlightText(result.title, query);
            const highlightedDesc = highlightText(result.description, query);
            
            let tagsHTML = '';
            if (result.tags) {
                const tagsArray = result.tags.split(',');
                tagsHTML = `<div class="search-result-tags">
                    ${tagsArray.map(tag => `<span class="tag">#${tag.trim()}</span>`).join(' ')}
                </div>`;
            }
            
            $('#search-results').append(`
                <div class="search-result-item" data-id="${result.id}">
                    <div class="title">${highlightedTitle}</div>
                    <div class="description">${highlightedDesc}</div>
                    ${tagsHTML}
                </div>
            `);
        });
        
        $('.search-result-item').on('click', function(e) {
            if ($(e.target).hasClass('tag')) {
                return;
            }
            
            const noteId = $(this).data('id');
            
            const noteElement = $(`#${noteId}`);
            if (noteElement.length) {
                $('#search-results').hide();
                
                $('html, body').animate({
                    scrollTop: noteElement.offset().top - 100
                }, 500);
                
                noteElement.addClass('highlight-note');
                setTimeout(() => {
                    noteElement.removeClass('highlight-note');
                }, 3000);
            }
        });
        
        $('.search-result-item .tag').on('click', function(e) {
            e.stopPropagation(); 
            const tagText = $(this).text().trim();
            searchByTag(tagText);
        });
    } else {
        $('#search-results').html('<div class="p-3 text-center">Ничего не найдено</div>');
    }
}

function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}   
function toggleDone(id, event) {
    if (event) event.stopPropagation();
    
    const noteElement = $(`.note-wrapper[id="${id}"], .note-item[id="${id}"]`);
    const statusButton = noteElement.find('.note-done-toggle, .toggle-done-btn');
    statusButton.prop('disabled', true);
    
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    if (!csrfToken) {
        console.error('CSRF-токен отсутствует');
        showNotification('Ошибка безопасности: отсутствует CSRF-токен', 'danger');
        statusButton.prop('disabled', false);
        return;
    }
    
    const currentDoneState = noteElement.attr('data-done') === 'true';
    const newDoneState = !currentDoneState;
    
    console.log(`Переключаем статус заметки ${id}:`, { 
        currentDoneState, 
        newDoneState, 
        pageMode: window.location.pathname 
    });
    
    if (currentDoneState) {
        noteElement.removeClass('completed');
        noteElement.find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning');
        noteElement.find('.note-done-toggle').text('Активно');
        
        const dropdownBtn = noteElement.find('.toggle-done-btn');
        if (dropdownBtn.length) {
            dropdownBtn.html('<i class="fas fa-check-circle"></i> Выполнено');
            dropdownBtn.attr('title', 'Выполнено');
            
            $(`.toggle-done-btn[data-id="${id}"]`).each(function() {
                $(this).html('<i class="fas fa-check-circle"></i> Выполнено');
                $(this).attr('title', 'Выполнено');
            });
        }
    } else {
        noteElement.addClass('completed');
        noteElement.find('.note-done-toggle').removeClass('bg-warning').addClass('bg-success');
        noteElement.find('.note-done-toggle').text('Выполнено');
        
        const dropdownBtn = noteElement.find('.toggle-done-btn');
        if (dropdownBtn.length) {
            dropdownBtn.html('<i class="fas fa-circle"></i> Активно');
            dropdownBtn.attr('title', 'Активно');

            $(`.toggle-done-btn[data-id="${id}"]`).each(function() {
                $(this).html('<i class="fas fa-circle"></i> Активно');
                $(this).attr('title', 'Активно');
            });
        }
    }

    $(`.note-wrapper[id="${id}"], .note-item[id="${id}"]`).each(function() {
        $(this).attr('data-done', newDoneState);
        if (newDoneState) {
            $(this).addClass('completed');
            $(this).find('.note-done-toggle').removeClass('bg-warning').addClass('bg-success').text('Выполнено');
        } else {
            $(this).removeClass('completed');
            $(this).find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning').text('Активно');
        }
    });
    
    noteElement.attr('data-done', newDoneState);
    
    $.ajax({
        url: `/api/notes/${id}/toggle-done`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        dataType: 'json',
        success: function(response) {
            const note = response.data;
            
            console.log('Ответ сервера при переключении статуса:', response);
            
            statusButton.prop('disabled', false);
            
            noteElement.attr('data-done', note.done);
            
            showNotification(response.message || (note.done ? 'Заметка отмечена как выполненная' : 'Заметка отмечена как невыполненная'), 'info');
            
            $(document).trigger('note:statusChanged', { 
                noteId: id, 
                isDone: note.done 
            });

            if (typeof window.updateNoteAppearance === 'function') {
                $(`.note-wrapper[id="note-${id}"], [id="note-${id}"], .note-item[id="note-${id}"]`).each(function() {
                    window.updateNoteAppearance($(this), note.done);
                });
            }
            
            loadStats();
            
            if (typeof updateSidebarCounters === 'function') {
                setTimeout(updateSidebarCounters, 500);
            } else if (typeof loadSidebarStats === 'function') {
                setTimeout(loadSidebarStats, 500);
            }
        },
        error: function(xhr, status, error) {       
        if (currentDoneState) {
            noteElement.addClass('completed');
            noteElement.find('.note-done-toggle').removeClass('bg-warning').addClass('bg-success');
            noteElement.find('.note-done-toggle').text('Выполнено');
            
            noteElement.find('.toggle-done-btn').html('<i class="fas fa-circle"></i> Активно');
            noteElement.find('.toggle-done-btn').attr('title', 'Активно');
        } else {
            noteElement.removeClass('completed');
            noteElement.find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning');
            noteElement.find('.note-done-toggle').text('Активно');
            
            noteElement.find('.toggle-done-btn').html('<i class="fas fa-check-circle"></i> Выполнено');
            noteElement.find('.toggle-done-btn').attr('title', 'Выполнено');
        }
            
            noteElement.attr('data-done', currentDoneState);
            
            statusButton.prop('disabled', false);
            
            console.error('Ошибка при изменении статуса выполнения:', xhr.responseText, status, error);
            showNotification('Ошибка при изменении статуса выполнения', 'danger');
        }
    });
}

function safeInitBootstrap() {
    document.querySelectorAll('.dropdown-toggle').forEach(function(element) {
        try {
            if (element && typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                new bootstrap.Dropdown(element);
            }
        } catch (e) {
            console.warn('Ошибка инициализации выпадающего меню:', e);
        }
    });
}

/**
 * Создает модальное окно подтверждения действия в едином стиле
 * @param {Object} options 
 * @param {string} options.id 
 * @param {string} options.title 
 * @param {string} options.message 
 * @param {string} options.confirmButtonText 
 * @param {string} options.cancelButtonText 
 * @param {string} options.confirmButtonClass 
 * @param {string} options.icon 
 * @param {Function} options.onConfirm 
 * @returns {bootstrap.Modal} 
 */
function createConfirmationModal(options) {
    const defaults = {
        id: 'confirmationModal_' + new Date().getTime(),
        title: 'Подтвердите действие',
        message: 'Вы уверены, что хотите выполнить это действие?',
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        confirmButtonClass: 'btn-primary',
        icon: 'fa-question-circle',
        onConfirm: null,
        size: 'modal-md', 
        animation: true, 
        centered: true 
    };
    
    const settings = {...defaults, ...options};
    
    $(`#${settings.id}`).remove();
    
    const modalClasses = [
        'modal fade',
        settings.animation ? 'animate__animated animate__fadeIn' : '',
    ].filter(Boolean).join(' ');
    
    const dialogClasses = [
        'modal-dialog',
        settings.size,
        settings.centered ? 'modal-dialog-centered' : '',
        'modal-dialog-scrollable'
    ].filter(Boolean).join(' ');
    
    const modalHTML = `
        <div class="${modalClasses}" id="${settings.id}" tabindex="-1" aria-labelledby="${settings.id}Label}" role="dialog">
            <div class="${dialogClasses}">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-light border-bottom-0">
                        <h5 class="modal-title" id="${settings.id}Label">
                            <i class="fas ${settings.icon} me-2"></i>${settings.title}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        ${settings.message}
                    </div>
                    <div class="modal-footer bg-light border-top-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>${settings.cancelButtonText}
                        </button>
                        <button type="button" class="btn ${settings.confirmButtonClass}" id="${settings.id}Confirm">
                            <i class="fas fa-check me-1"></i>${settings.confirmButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modalHTML);
    
    const modalElement = document.getElementById(settings.id);
    const modal = new bootstrap.Modal(modalElement);
    
    $(`#${settings.id}Confirm`).on('click', function() {
        if (typeof settings.onConfirm === 'function') {
            settings.onConfirm();
        }
        
        modal.hide();
    });
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        $(modalElement).remove();
    });
    
    return modal;
}

function showErrorModal(title, message) {
    const modal = createConfirmationModal({
        title: title,
        message: message,
        confirmButtonText: 'Закрыть',
        cancelButtonText: '',
        confirmButtonClass: 'btn-primary',
        icon: 'fa-exclamation-triangle',
        size: 'modal-md'
    });
    
    modal._element.querySelector('.btn-secondary').style.display = 'none';
    
    modal.show();
    return modal;
}