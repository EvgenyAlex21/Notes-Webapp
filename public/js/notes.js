// Глобальные переменные для всего файла
let selectedColor = 'default';
let currentTags = [];
let currentSort = 'date-new';
let currentTheme = localStorage.getItem('theme') || 'light';
let statsData = {};
let viewNoteModal = null;

$(document).ready(function() {
    // Инициализация системы уведомлений, если доступна
    if (typeof initNotificationsSystem === 'function') {
        initNotificationsSystem();
        console.log('Инициализирована система уведомлений');
    }
    
    // Инициализация модального окна просмотра заметки если оно существует
    const viewNoteModalElement = document.getElementById('viewNoteModal');
    if (viewNoteModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        try {
            // Удаляем tabindex="-1" для предотвращения проблем с ARIA
            viewNoteModalElement.removeAttribute('tabindex');
            
            // Настраиваем опции модального окна для улучшения доступности
            viewNoteModal = new bootstrap.Modal(viewNoteModalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
            
            // Исправление для aria-hidden
            $(viewNoteModalElement).on('shown.bs.modal', function() {
                $(this).attr('aria-hidden', 'false');
            });
        } catch (e) {
            console.warn('Ошибка инициализации модального окна:', e);
        }
    }
    
    // Инициализация выпадающих меню
    safeInitBootstrap();
    
    // Текущий URL
    const currentPath = window.location.pathname;
    
    // Инициализация локальных переменных - используем данные из pageData, если доступны
    let trashMode = (typeof pageData !== 'undefined' && pageData.trashMode) || currentPath === '/notes/trash';
    let archiveMode = (typeof pageData !== 'undefined' && pageData.archiveMode) || currentPath === '/notes/archive';
    
    // Проверяем и устанавливаем активные пункты навигации
    if (trashMode) {
        $('.sidebar-link').removeClass('active');
        $('a[href="/notes/trash"]').addClass('active');
        console.log('Активирован режим корзины');
    } else if (archiveMode) {
        $('.sidebar-link').removeClass('active');
        $('a[href="/notes/archive"]').addClass('active');
        console.log('Активирован режим архива');
    }
    
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
    if (currentPath === '/notes' || currentPath === '/notes/trash' || currentPath === '/notes/archive' || currentPath.match(/\/notes\/folder\//)) {
        console.log('Инициализация загрузки заметок для страницы:', currentPath);
        
        // Проверяем, находимся ли мы в режиме папки
        const folderMatch = currentPath.match(/\/notes\/folder\/(.+)/);
        if (folderMatch) {
            console.log('Загружаем заметки для папки из URL:', folderMatch[1]);
            // В этом случае loadAllNotes сам определит папку из URL
            loadAllNotes(trashMode);
        } else if (currentPath === '/notes/archive') {
            console.log('Загружаем архивные заметки');
            loadAllNotes(false, null, true); // trashMode=false, folder=null, archiveMode=true
        } else {
            loadAllNotes(trashMode);
        }
        
        // Обработчики фильтров вынесены в отдельный файл note-filters.js
        
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
            emptyTrash();
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
    
    return {
        total: visibleNotes,
        active: activeNotes,
        completed: completedNotes,
        pinned: pinnedNotes
    };
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
}

// Загрузка всех заметок
function loadAllNotes(trashMode = false, folder = null, archiveModeParam = false) {
    let url = `/api/notes`;
    // Проверяем текущий режим
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
    
    // Если trashMode передан как параметр, используем его, иначе берем из pageData
    if (trashMode === false && trashModeFromPage) {
        trashMode = trashModeFromPage;
    }
    
    // Проверяем, находимся ли в режиме папки
    const folderMatch = currentPath.match(/\/notes\/folder\/(.+)/);
    
    // Определяем режим папки
    let folderMode = false;
    let folderName = null;
    
    // Получаем имя папки с разных источников
    // 1. Приоритет: из переданного параметра
    if (folder) {
        folderMode = true;
        folderName = folder;
        console.log('Имя папки получено из параметра функции:', folderName);
    } 
    // 2. Из URL
    else if (folderMatch) {
        folderMode = true;
        try {
            folderName = decodeURIComponent(folderMatch[1]);
            // Полное декодирование (на случай, если имя закодировано несколько раз)
            while (folderName !== decodeURIComponent(folderName)) {
                folderName = decodeURIComponent(folderName);
            }
            console.log('Полностью декодированное имя папки из URL:', folderName);
        } catch (e) {
            console.warn('Ошибка при декодировании имени папки из URL:', e);
            folderName = folderMatch[1]; // Используем как есть, если ошибка декодирования
        }
    }
    // 3. Из данных страницы, если они есть
    else if (typeof pageData !== 'undefined' && pageData.folderMode && pageData.folderName) {
        folderMode = true;
        folderName = pageData.folderName;
        console.log('Имя папки получено из данных страницы:', folderName);
    }
    
    console.log('Режим папки:', folderMode, 'Имя папки:', folderName);
    
    // Подсвечиваем текущую папку в боковом меню, если мы в режиме папки
    if (folderMode && folderName) {
        // Снимаем подсветку со всех элементов
        $('.folder-link').removeClass('active');
        $('.folder-link').parent().removeClass('active-folder');
        $('.nav-link').removeClass('active');
        
        console.log('Активируем папку в меню:', folderName);
        
        // Пытаемся найти папку разными способами
        const normalizedName = folderName.toLowerCase().trim();
        const folderId = 'folder-' + normalizedName.replace(/[^a-z0-9]/g, '-');
        
        // 1. Пытаемся найти по ID
        let foundFolder = false;
        const folderElement = $(`#${folderId}`);
        if (folderElement.length > 0) {
            console.log('Найден элемент папки по ID, активируем:', folderId);
            folderElement.addClass('active-folder');
            folderElement.find('.folder-link').addClass('active');
            foundFolder = true;
        }
        
        // 2. Пытаемся найти по data-атрибуту folder-name
        if (!foundFolder) {
            const folderByData = $(`[data-folder-name="${normalizedName}"]`);
            if (folderByData.length > 0) {
                console.log('Найден элемент папки по data-атрибуту, активируем');
                folderByData.addClass('active-folder');
                folderByData.find('.folder-link').addClass('active');
                foundFolder = true;
            }
        }
        
        // 3. Пытаемся найти по data-атрибуту в ссылке
        if (!foundFolder) {
            const linkByData = $(`.folder-link[data-folder="${folderName}"]`);
            if (linkByData.length > 0) {
                console.log('Найден элемент папки по data-атрибуту ссылки, активируем');
                linkByData.addClass('active');
                linkByData.parent().addClass('active-folder');
                foundFolder = true;
            }
        }
        
        // 4. В крайнем случае ищем по тексту
        if (!foundFolder) {
            $(`.folder-item`).each(function() {
                const linkText = $(this).find('.folder-link').text().trim().replace(/\s*\d+\s*$/, ''); // Удаляем счетчик из текста
                const folderTextMatch = linkText === folderName || 
                                      linkText.includes(folderName) || 
                                      folderName.includes(linkText);
                
                if (folderTextMatch) {
                    console.log('Нашли папку по тексту ссылки:', linkText);
                    $(this).addClass('active-folder');
                    $(this).find('.folder-link').addClass('active');
                    foundFolder = true;
                    return false; // Останавливаем цикл
                }
            });
        }
    } else if (currentPath === '/notes/trash') {
        // Если мы в корзине, подсвечиваем соответствующий пункт меню
        $('.nav-link').removeClass('active');
        $('.folder-link').removeClass('active');
        $('.folder-link').parent().removeClass('active-folder');
        $('.trash-link').addClass('active');
    } else if (archiveMode) {
        // Если мы в архиве, подсвечиваем соответствующий пункт меню
        $('.nav-link').removeClass('active');
        $('.folder-link').removeClass('active');
        $('.folder-link').parent().removeClass('active-folder');
        $('.archive-link').addClass('active');
    } else {
        // Если мы на главной странице
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
        // Явно декодируем имя папки (на случай, если оно уже закодировано)
        try {
            // Используем уже декодированное имя папки
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
    
    // Обновляем статистику
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
            
            // Отладка для архивных заметок
            if (archiveMode) {
                console.log('ОТЛАДКА АРХИВА: Получено данных', {
                    total: notes.length,
                    archived: notes.filter(note => note.is_archived).length,
                    nonArchived: notes.filter(note => !note.is_archived).length,
                    deleted: notes.filter(note => note.is_deleted).length,
                    notDeleted: notes.filter(note => !note.is_deleted).length
                });
            }
            
            // Очищаем контейнеры заметок, учитывая как обычный, так и контейнер для корзины
            $('.notes-container, .trash-notes-container').empty();
            
            // Сразу проверяем, есть ли заметки в массиве response
            if (notes.length === 0) {
                console.log('Пустой массив заметок для режима: ' + 
                    (archiveMode ? 'архива' : trashMode ? 'корзины' : 'основной'));
                
                // Скрываем контейнеры заметок, учитывая разные классы
                if (trashMode) {
                    $('.notes-container, .trash-notes-container').hide();
                    $('.empty-container, .empty-trash-container').removeClass('d-none');
                } else {
                    $('.notes-container').hide();
                    $('.empty-container').removeClass('d-none');
                }
                
                // Принудительно устанавливаем правильное сообщение для пустого состояния
                if (archiveMode) {
                    $('.empty-container h3').html('<i class="fas fa-archive me-2"></i>Архив пуст');
                    $('.empty-container p').text('Архивированные заметки будут отображаться здесь');
                    
                    // Проверяем наличие кнопки и гарантируем её наличие
                    if ($('.empty-container .btn').length === 0) {
                        $('.empty-container').append('<a href="/notes" class="btn btn-primary mt-3">Вернуться к заметкам</a>');
                    } else {
                        $('.empty-container .btn').attr('href', '/notes').html('Вернуться к заметкам').show();
                    }
                } else if (trashMode) {
                    $('.empty-container h3').html('<i class="fas fa-trash me-2"></i>Корзина пуста');
                    $('.empty-container p').text('Удаленные заметки будут появляться здесь');
                    
                    // Проверяем наличие кнопки и гарантируем её наличие
                    if ($('.empty-container .btn').length === 0) {
                        $('.empty-container').append('<a href="/notes" class="btn btn-primary mt-3">Вернуться к заметкам</a>');
                    } else {
                        $('.empty-container .btn').attr('href', '/notes').html('Вернуться к заметкам').show();
                    }
                }
            }
            
            // Фильтрация заметок в зависимости от режима отображения
            let filteredNotes = notes;
            
            // Если мы на главной странице и не в режиме корзины или архива,
            // отфильтруем заметки, чтобы не показывать те, которые принадлежат папкам
            if (!trashMode && !archiveMode && !folderMode) {
                console.log('Фильтруем заметки, скрывая те, что в папках');
                filteredNotes = notes.filter(note => !note.folder);
                console.log('Отфильтровано заметок:', filteredNotes.length);
            } else if (folderMode && folderName) {
                // Если мы в режиме папки, показываем только заметки из этой папки
                console.log('Фильтруем заметки для папки:', folderName);
                filteredNotes = notes.filter(note => note.folder === folderName);
                console.log('Найдено заметок в папке:', filteredNotes.length);
            }
            
            // Обновляем счётчики видимых заметок немедленно
            console.log('Количество заметок после фильтрации:', filteredNotes.length);
            
            // Запоминаем фактическое количество заметок в текущем представлении
            window.currentNotesCount = {
                total: filteredNotes.length,
                completed: filteredNotes.filter(note => note.done).length,
                active: filteredNotes.filter(note => !note.done).length,
                pinned: filteredNotes.filter(note => note.is_pinned).length
            };
            
            // Обновляем счётчики верхней панели на основе фактических данных
            // Только если есть такие элементы на странице
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
            
            // Обновляем табы с правильными счетчиками
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
                
                // Обновляем текст пустого состояния в зависимости от режима
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
                
                // Обновляем содержимое блока пустого состояния
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
            
            // Показываем контейнер для заметок и скрываем сообщение о пустой корзине/списке
            if (trashMode) {
                $('.notes-container, .trash-notes-container').show();
                $('.empty-container, .empty-trash-container').addClass('d-none');
            } else {
                $('.notes-container').show();
                $('.empty-container').addClass('d-none');
            }
            
            // Сначала добавляем закрепленные заметки
            const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
            const regularNotes = filteredNotes.filter(note => !note.is_pinned);
            
            // Функция для генерации HTML заметки
            const generateNoteHTML = (note, isPinned = false) => {
                // Получаем массив тегов, если они есть
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
                
                // Форматируем даты
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
                         
                        ${isPinned ? '<span class="badge pin-badge">Закреплено</span>' : ''}
                        
                        <div class="row">
                            <div class="col-12">
                                <!-- Заголовок и статус -->
                                <div class="note-header">
                                    <h4>${note.name}</h4>
                                    <div class="note-status-priority">
                                        ${note.folder ? `<span class="badge bg-secondary folder-badge" title="В папке: ${note.folder}">
                                            <i class="fas fa-folder me-1"></i>${note.folder}
                                        </span>` : ''}
                                        <span class="badge" style="background-color: ${getNoteColorHex(note.color)}; font-weight: 400;">
                                            ${getPriorityName(note.color)}
                                        </span>
                                        <span class="badge ${note.done ? 'bg-success' : 'bg-warning'} note-done-toggle" 
                                              onclick="toggleDone(${note.id}, event)" style="cursor: pointer;">
                                            ${note.done ? 'Выполнено' : 'Активно'}
                                        </span>
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
                                        // Проверяем файлы и их формат
                                        if (!note.files) return '';
                                        
                                        // Пробуем преобразовать строку в массив, если это необходимо
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
                                        
                                        // Если это не массив или массив пустой, возвращаем пустую строку
                                        if (!Array.isArray(filesArray) || filesArray.length === 0) return '';
                                        
                                        // Фильтруем только валидные файлы
                                        const validFiles = filesArray.filter(file => file && file.name);
                                        if (validFiles.length === 0) return '';
                                        
                                        return `
                                            <div class="note-files mt-3">
                                                <div class="small text-muted mb-2">Прикрепленные файлы (${validFiles.length}):</div>
                                                <div class="d-flex flex-wrap gap-2">
                                                    ${validFiles.map((file, index) => {
                                                        // Если нет url, но есть path - генерируем url
                                                        let fileUrl = file.url || '';
                                                        if (!fileUrl && file.path) {
                                                            fileUrl = `/storage/${file.path}`;
                                                        }
                                                        
                                                        // Если нет ни url, ни path, используем заглушку
                                                        if (!fileUrl) {
                                                            fileUrl = '#';
                                                        }
                                                        
                                                        return `
                                                        <a href="#" 
                                                           class="file-link file-preview-item badge bg-light text-dark d-flex align-items-center"
                                                           data-url="${fileUrl}"
                                                           data-name="${file.name || ''}"
                                                           data-size="${file.size || ''}"
                                                           data-type="${file.type || ''}"
                                                           data-index="${index}">
                                                            <i class="fas fa-${file.type === 'image' ? 'image' : 
                                                                               file.type === 'video' ? 'video' : 
                                                                               file.type === 'document' ? 'file-alt' : 'file'} me-1"></i>
                                                            ${file.name || 'Файл без имени'}
                                                        </a>
                                                        `;
                                                    }).join('')}
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
            
            // Определяем контейнер для заметок с учетом режима корзины
            const notesContainer = trashMode ? $('.trash-notes-container, .notes-container') : $('.notes-container');
            
            // Добавляем закрепленные заметки
            pinnedNotes.forEach(note => {
                notesContainer.append(generateNoteHTML(note, true));
            });
            
            // Затем добавляем обычные заметки
            regularNotes.forEach(note => {
                notesContainer.append(generateNoteHTML(note, false));
            });
            
            // Инициализация обработчиков для просмотра заметок
            initViewNoteHandlers();
            
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
                
                // Просмотр заметки
                $('.view-note-btn').on('click', function(e) {
                    e.preventDefault();
                    const noteId = $(this).data('id');
                    console.log('Клик на кнопке "Просмотр", ID заметки:', noteId);
                    viewNote(noteId);
                });
            }
            
            // Применяем текущие фильтры и обновляем счетчики
            applyFilters();
            
            // Дополнительно обновляем счетчики видимых заметок
            updatePageCounters();
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
            console.log('Файлы заметки:', note.files);
            console.log('Тип файлов:', typeof note.files, Array.isArray(note.files));
            
            // Обработка разных форматов файлов
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
            
            // Обработка файлов заметки
            if (note.files && Array.isArray(note.files)) {
                // Фильтруем только корректные файлы
                let validFiles = note.files.filter(file => 
                    file && typeof file === 'object' && file.name && 
                    (file.url || file.path) // Должен быть либо url, либо path
                );
                
                console.log('Проверенные файлы для отображения:', validFiles.length, 'из', note.files.length);
                
                // Для файлов, у которых есть path, но нет url, добавляем url
                validFiles = validFiles.map(file => {
                    if (!file.url && file.path) {
                        file.url = `/storage/${file.path}`;
                    } else if (!file.url && !file.path) {
                        // Если нет ни url, ни path - ставим плейсхолдер
                        file.url = 'https://placehold.co/200?text=Файл+недоступен';
                        console.warn('У файла нет ни URL, ни path:', file);
                    }
                    return file;
                });
                
                // Сохраняем файлы в глобальной переменной для использования при обновлении
                window.currentNoteFiles = validFiles;
                console.log('Сохранили валидные файлы в window.currentNoteFiles:', window.currentNoteFiles);
                
                // Проверим наличие контейнера для файлов
                // Используем #files-container для согласованности с другими страницами
                const filesContainer = $('#files-container');
                filesContainer.empty();
                
                // Создаем элемент для существующих файлов
                filesContainer.append('<div id="existing-files" class="mt-3"></div>');
                const existingFilesContainer = $('#existing-files');
                
                // Если есть валидные файлы - отображаем их
                if (validFiles.length > 0) {
                    // Заголовок для файлов
                    existingFilesContainer.html('<h6 class="mt-3 mb-2">Прикрепленные файлы:</h6><div class="row g-2 files-container"></div>');
                    let filesHtml = '';
                    
                    validFiles.forEach((file, index) => {
                        // Определяем URL файла - используем url или создаем из path
                        const fileUrl = file.url || (file.path ? `/storage/${file.path}` : null);
                        if (!fileUrl) {
                            console.warn('Файл не имеет URL:', file);
                            return; // Пропускаем файл без URL
                        }
                        
                        // Определяем тип файла, если не указан
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
                            // Документы и прочее
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
                    });
                    
                    existingFilesContainer.find('.files-container').html(filesHtml);
                } else {
                    console.log('Нет валидных файлов для отображения');
                }
            } else {
                console.log('Нет файлов для отображения или формат неверный:', typeof note.files);
                window.currentNoteFiles = [];
                
                // Очищаем контейнер для существующих файлов, если он есть
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
    
    // Убедимся, что форма имеет правильный enctype для загрузки файлов
    const form = $('#create-note-form');
    if (form.attr('enctype') !== 'multipart/form-data') {
        console.log('Устанавливаем enctype="multipart/form-data" для формы создания заметки');
        form.attr('enctype', 'multipart/form-data');
    }
    
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
    
    if (hasFiles) {
        console.log('Обнаружены файлы для загрузки:', fileInput.files.length);
        // Проверяем правильное имя поля для файлов
        if (fileInput.name !== 'upload_files[]') {
            console.log('Исправляем имя поля для файлов:', fileInput.name, '->', 'upload_files[]');
            fileInput.name = 'upload_files[]';
        }
    }
    
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
    
    // Проверяем, находимся ли мы в папке
    const currentFolder = getCurrentFolderNameFromUrl();
    if (currentFolder) {
        formData.append('folder', currentFolder);
        console.log('Создаем заметку в папке:', currentFolder);
    }
    
    if (currentTags && currentTags.length > 0) {
        formData.append('tags', currentTags.join(','));
    }
    
    // Добавляем файлы, если они есть
    if (hasFiles) {
        console.log('Добавляем', fileInput.files.length, 'файлов к запросу');
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            console.log('Файл', i+1, ':', file.name, file.size, 'байт', file.type);
            formData.append('upload_files[]', file);
        }
        
        // Добавляем дополнительные поля для отладки
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
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            // Обработчик загрузки для отображения прогресса
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total * 100;
                    console.log('Загрузка: ' + percentComplete.toFixed(1) + '%');
                    
                    // Обновляем текст кнопки
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
            // Сбрасываем флаг создания заметки
            window.isCreatingNote = false;
            
            console.log('Успешно создана заметка:', response);
            showNotification('Заметка успешно создана', 'success');
            
            // Обновляем кнопку
            $('#save-button').html('<i class="fas fa-check"></i> Сохранено!');
            
            // Небольшая задержка перед перенаправлением
            setTimeout(() => {
                // Проверяем, находимся ли мы в папке
                const currentFolder = getCurrentFolderNameFromUrl();
                if (currentFolder) {
                    // Если мы в папке, возвращаемся в эту папку
                    window.location.href = `/notes/folder/${encodeURIComponent(currentFolder)}`;
                } else {
                    window.location.href = '/notes';
                }
            }, 1000);
        },
        error: function(xhr, status, error) {
            // Сбрасываем флаг создания заметки и разблокируем кнопку
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
                    
                    // Проверяем наличие детальных ошибок валидации
                    if (xhr.responseJSON.errors) {
                        errorDetails = Object.entries(xhr.responseJSON.errors)
                            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                            .join('\n');
                    }
                } else if (xhr.responseText) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        errorMessage = response.message || errorMessage;
                        
                        // Проверяем наличие детальных ошибок валидации
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
            
            // Проверяем, является ли это ошибкой размера файла
            if (xhr.status === 413 || errorMessage.includes('размер') || errorMessage.includes('превышает') || errorMessage.includes('большой')) {
                showErrorModal('Превышен размер файла', errorMessage + (errorDetails ? '\n\nДетали:\n' + errorDetails : ''));
            } else {
                showNotification('Ошибка при создании заметки: ' + errorMessage, 'danger');
                
                // Отображаем модальное окно с деталями ошибки, если они есть
                if (errorDetails) {
                    if ($('#errorModal').length > 0) {
                        $('#errorModalText').text(errorMessage);
                        $('#errorModalDetails').text(errorDetails);
                        
                        // Настраиваем обработчик повторной отправки
                        $('#retryButton').one('click', function() {
                            $('#errorModal').modal('hide');
                            setTimeout(() => createNote(), 500);
                        });
                        
                        // Показываем модальное окно
                        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
                        errorModal.show();
                    } else {
                        // Если модального окна нет, показываем обычное сообщение
                        alert('Ошибка при создании заметки:\n' + errorMessage + '\n\nДетали:\n' + errorDetails);
                    }
                }
            }
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
    // Проверяем наличие элементов в DOM и на какой странице мы находимся
    const currentPath = window.location.pathname;
    
    // Если мы не на странице создания или редактирования заметки, пропускаем
    if (!currentPath.match(/\/notes\/create/) && !currentPath.match(/\/notes\/\d+\/edit/)) {
        console.log('Не страница создания/редактирования заметки, пропуск инициализации загрузки файлов');
        return;
    }
    
    // Проверяем наличие элемента #upload-files
    if ($('#upload-files').length === 0) {
        console.log('Элемент #upload-files не найден, пропуск инициализации загрузки файлов');
        return;
    }
    
    // Проверяем правильное имя поля для файлов
    const uploadInput = document.getElementById('upload-files');
    if (uploadInput && uploadInput.name !== 'upload_files[]') {
        console.log('Исправляем имя поля для файлов:', uploadInput.name, '->', 'upload_files[]');
        uploadInput.name = 'upload_files[]';
    }
    
    // Убеждаемся, что форма имеет правильный enctype
    const form = $('#create-note-form, #edit-note-form').first();
    if (form && form.attr('enctype') !== 'multipart/form-data') {
        console.log('Устанавливаем правильный enctype для формы');
        form.attr('enctype', 'multipart/form-data');
    }
    
    // Проверяем существование контейнера для превью
    if ($('#file-preview').length === 0) {
        console.log('Контейнер #file-preview не найден, создаем его');
        $('#files-container').append('<div id="file-preview" class="row g-2 mt-2"></div>');
    }
    
    // Для страницы создания и редактирования заметки
    $('#upload-files').on('change', function() {
        const files = this.files;
        
        // Убедимся, что имя поля правильное
        if (this.name !== 'upload_files[]') {
            console.log('Исправляем имя поля файлов:', this.name, '->', 'upload_files[]');
            this.name = 'upload_files[]';
        }
        
        // Отладочная информация
        console.log('Выбрано файлов:', files.length);
        for (let i = 0; i < files.length; i++) {
            console.log(`Файл ${i+1}:`, files[i].name, files[i].size, 'байт', files[i].type);
        }
        
        // Очищаем превью
        $('#file-preview').empty();
        
        // Проверка на превышение лимита файлов
        if (files.length > 10) {
            showErrorModal('Превышено количество файлов', 'Можно загрузить максимум 10 файлов за раз.');
            $(this).val(''); // Очистить выбор
            return;
        }
        
        // Проверяем размер каждого файла
        let totalSize = 0;
        for (let i = 0; i < files.length; i++) {
            totalSize += files[i].size;
            
            console.log(`Проверка файла ${i+1}: "${files[i].name}", размер: ${files[i].size} байт (${formatFileSize(files[i].size)})`);
            
            if (files[i].size > 15 * 1024 * 1024) { // 15 МБ
                console.log('Файл превышает лимит 15 МБ, показываем модальное окно');
                showErrorModal('Превышен размер файла', `Файл "${files[i].name}" имеет размер ${formatFileSize(files[i].size)}. Максимально допустимый размер - 15 МБ.`);
                $(this).val(''); // Очистить выбор
                $('#file-preview').empty();
                return;
            }
            
            // Создаем превью для файла
            createFilePreview(files[i]);
        }
        
        // Проверка общего размера
        if (totalSize > 50 * 1024 * 1024) { // 50 МБ
            showErrorModal('Превышен общий размер файлов', `Общий размер выбранных файлов составляет ${formatFileSize(totalSize)}. Максимально допустимый размер - 50 МБ.`);
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
    
    console.log('Проверка наличия файлов в updateNote:');
    console.log('- fileInput существует:', !!fileInput);
    console.log('- fileInput.files существует:', fileInput ? !!fileInput.files : false);
    console.log('- количество файлов:', fileInput && fileInput.files ? fileInput.files.length : 0);
    console.log('- hasFiles =', hasFiles);
    
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
    
    // Проверяем наличие существующих файлов
    if (window.currentNoteFiles && Array.isArray(window.currentNoteFiles)) {
        console.log('Сохраняем существующие файлы:', window.currentNoteFiles);
        formData.append('files', JSON.stringify(window.currentNoteFiles));
    } else {
        console.log('Нет существующих файлов или они в неправильном формате');
        // Всегда передаем пустой массив для корректного обновления
        formData.append('files', JSON.stringify([]));
    }
    
    // Убедимся, что форма имеет правильный enctype
    const form = $('#edit-note-form');
    if (form.attr('enctype') !== 'multipart/form-data') {
        console.log('Устанавливаем правильный enctype для формы');
        form.attr('enctype', 'multipart/form-data');
    }
    
    // Проверим имя поля для файлов
    if (fileInput && fileInput.name !== 'upload_files[]') {
        console.log('Исправляем имя поля для файлов:', fileInput.name, '->', 'upload_files[]');
        fileInput.name = 'upload_files[]';
    }
    
    // Добавляем поле для отладки
    formData.append('debug_update', 'true');
    if (hasFiles) {
        formData.append('has_files', 'true');
        formData.append('debug_files_count', fileInput.files.length);
    }
    
    // Добавляем файлы, если они есть
    if (hasFiles) {
        console.log('Добавляем новые файлы в FormData:', fileInput.files.length, 'файлов');
        for (let i = 0; i < fileInput.files.length; i++) {
            console.log(`Добавление файла ${i+1}/${fileInput.files.length}: ${fileInput.files[i].name} (${formatFileSize(fileInput.files[i].size)})`);
            formData.append('upload_files[]', fileInput.files[i]);
        }
    } else {
        console.log('Новых файлов для загрузки нет');
        // Добавляем пустое поле upload_files[], чтобы избежать ошибки на сервере
        formData.append('upload_files[]', '');
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
    
    // Вывод отладочной информации о формируемых данных
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
    // Создаем и показываем модальное окно подтверждения
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

// Выполнение удаления заметки
function executeDeleteNote(id) {
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Немедленно скрываем заметку для улучшения UX
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
            
            // Если мы на странице редактирования, перенаправляем на список
            if (window.location.pathname.match(/\/notes\/\d+\/edit/)) {
                setTimeout(() => {
                    window.location.href = '/notes';
                }, 1000);
            } else {
                // Заметка уже скрыта, теперь удаляем её из DOM
                $(`.note-wrapper#note-${id}`).remove();
                
                // Проверим, остались ли ещё заметки
                if ($('.note-wrapper:visible').length === 0) {
                    $('.notes-container').hide();
                    $('.empty-container').removeClass('d-none');
                }
                
                // Обновляем список заметок и статистику
                // Проверяем, находимся ли в режиме отображения папки
                if (window.location.pathname.startsWith('/notes/folder/')) {
                    // Используем getCurrentFolderNameFromUrl вместо ручной обработки
                    const currentFolder = getCurrentFolderNameFromUrl();
                    console.log('Обновляем заметки в текущей папке:', currentFolder);
                    loadAllNotes(false, currentFolder);
                } else {
                    // Обновляем статистику
                    loadStats();
                }
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
    
    // Обрабатываем ID заметки, удаляя префикс "note-" если он есть
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
            showNotification('Заметка восстановлена', 'success');                // Используем универсальную функцию обновления интерфейса
                if (typeof updateNoteInterface === 'function') {
                    // Явно указываем, что заметка должна быть удалена из интерфейса корзины
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        
                        // Проверим, остались ли ещё заметки
                        if ($('.note-wrapper:visible').length === 0) {
                            $('.trash-notes-container, .notes-container').hide();
                            $('.empty-trash-container, .empty-container').removeClass('d-none');
                        }
                    });
                    
                    // Вызываем событие для обработки в trash-handler.js
                    $(document).trigger('note:restored', [id]);
                    
                    updateNoteInterface('restore', id);
                } else {
                // Запасной вариант, если универсальная функция недоступна
                $(`.note-wrapper#note-${id}`).fadeOut(300, function() {
                    $(this).remove();
                    
                    // Проверим, остались ли ещё заметки
                    if ($('.note-wrapper:visible').length === 0) {
                        $('.notes-container').hide();
                        $('.empty-container').removeClass('d-none');
                    }
                });
            }
            
            // Обновляем статистику
            loadStats();
        },
        error: function(error) {
            console.error('Ошибка при восстановлении заметки:', error);
            showNotification('Ошибка при восстановлении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}

// Окончательное удаление заметки
function forceDeleteNote(id) {
    // Создаем и показываем модальное окно подтверждения
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

// Выполнение окончательного удаления заметки
function executeForceDeleteNote(id) {
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Обрабатываем ID заметки, удаляя префикс "note-" если он есть
    let noteId = id;
    if (typeof noteId === 'string' && noteId.startsWith('note-')) {
        noteId = noteId.substring(5);
    }
    
    console.log(`Окончательное удаление заметки: ${id} -> ${noteId}`);
    
    $.ajax({
        url: `/api/notes/${noteId}/force`,
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        success: function(response) {
            showNotification('Заметка окончательно удалена', 'warning');                // Используем универсальную функцию обновления интерфейса
                if (typeof updateNoteInterface === 'function') {
                    // Явно удаляем заметку из DOM в корзине
                    $(`.note-wrapper#note-${id}, #note-${id}`).fadeOut(300, function() {
                        $(this).remove();
                        
                        // Проверим, остались ли ещё заметки
                        if ($('.note-wrapper:visible').length === 0) {
                            $('.trash-notes-container, .notes-container').hide();
                            $('.empty-trash-container, .empty-container').removeClass('d-none');
                        }
                    });
                    
                    // Вызываем событие для обработки в trash-handler.js
                    $(document).trigger('note:forceDeleted', [id]);
                    
                    updateNoteInterface('force_delete', id);
                } else {
                // Запасной вариант, если универсальная функция недоступна
                $(`.note-wrapper#note-${id}`).fadeOut(300, function() {
                    $(this).remove();
                    
                    // Проверим, остались ли ещё заметки
                    if ($('.note-wrapper:visible').length === 0) {
                        $('.notes-container').hide();
                        $('.empty-container').removeClass('d-none');
                    }
                });
            }
            
            // Обновляем статистику
            loadStats();
        },
        error: function(error) {
            console.error('Ошибка при удалении заметки:', error);
            showNotification('Ошибка при удалении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}

// Очистка корзины (удаление всех заметок)
function emptyTrash() {
    console.log('Функция emptyTrash вызвана');
    // Получаем все идентификаторы заметок в корзине
    const noteElements = $('.note-wrapper');
    console.log('Найдено элементов в корзине:', noteElements.length);
    
    const noteIds = Array.from(noteElements).map(el => {
        // Получаем полный ID элемента
        return $(el).attr('id');
    });
    
    if (noteIds.length === 0) {
        showNotification('Корзина уже пуста', 'info');
        return;
    }
    
    // Создаем фиксированный диалог в стиле примера с удалением папки
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
    
    // Добавляем диалог в DOM
    overlay.append(dialogBox);
    $('body').append(overlay);
    
    // Обработчики кнопок
    $('#cancelTrashBtn, #closeTrashBtn').on('click', function() {
        overlay.remove();
    });
    
    $('#confirmTrashBtn').on('click', function() {
        overlay.remove();
        executeEmptyTrash(noteIds);
    });
}

// Выполнение очистки корзины
function executeEmptyTrash(noteIds) {
    // Последовательно удаляем каждую заметку
    let deletedCount = 0;
    let errorCount = 0;
    
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Проверяем, есть ли заметки для удаления
    if (!noteIds || noteIds.length === 0) {
        showNotification('Нет заметок для удаления', 'info');
        return;
    }
    
    console.log('Удаление заметок из корзины:', noteIds);
    
    noteIds.forEach(id => {
        // Проверяем и обрабатываем ID заметки
        let noteId = id;
        
        // Если ID содержит префикс "note-", удаляем его
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
                
                // Находим и удаляем элемент из DOM
                const noteElement = $(`.note-wrapper#note-${noteId}, #note-${noteId}`);
                noteElement.fadeOut(300, function() {
                    $(this).remove();
                    
                    // Проверяем, все ли заметки обработаны
                    if (deletedCount + errorCount === noteIds.length) {
                        completeTrashEmptying(deletedCount, errorCount);
                    }
                });
            },
            error: function(error) {
                console.error(`Ошибка при удалении заметки ${noteId}:`, error);
                errorCount++;
                
                // Проверяем, все ли заметки обработаны
                if (deletedCount + errorCount === noteIds.length) {
                    completeTrashEmptying(deletedCount, errorCount);
                }
            }
        });
    });
    
    // Функция завершения процесса очистки корзины
    function completeTrashEmptying(success, errors) {
        if (success > 0) {
            const message = errors > 0 
                ? `Удалено ${success} заметок, ${errors} с ошибками` 
                : `Корзина очищена. Удалено ${success} заметок`;
                
            showNotification(message, errors > 0 ? 'warning' : 'success');
            
            // Если все заметки удалены или возникли ошибки, но видимых заметок нет
            if ($('.note-wrapper:visible').length === 0) {
                $('.notes-container, .trash-notes-container').hide();
                $('.empty-container, .empty-trash-container').removeClass('d-none');
            }
            
            // Обновляем статистику после очистки корзины
            loadStats();
        } else if (errors > 0) {
            showNotification(`Не удалось удалить заметки (${errors})`, 'danger');
        }
    }
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
    const activeFilter = $('.filter-btn.btn-secondary').data('filter') || $('input[name="sidebar-filter"]:checked').val() || 'all';
    
    // Обновляем интерфейс в соответствии с выбранным фильтром
    $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
    $(`.filter-btn[data-filter="${activeFilter}"]`).removeClass('btn-outline-secondary').addClass('btn-secondary');
    $(`#filter-${activeFilter}`).prop('checked', true);
    
    console.log('Применяем фильтры:', { searchQuery, activeFilter });
    
    // Перебираем все заметки и скрываем/показываем их в соответствии с фильтрами
    $('.note-wrapper, .note-item').each(function() {
        let shouldShow = true;
        
        // Применяем фильтр в зависимости от выбранного значения
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
            // Для фильтра "all" показываем все заметки
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
        
        // Обновляем счетчики видимых заметок на странице
        updatePageCounters();
        
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
        
        console.log('Видимые заметки после применения фильтров:', visibleNotes);
    }, 350);
}

// Функция загрузки статистики
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

// Получение имени текущей папки из URL
function getCurrentFolderNameFromUrl() {
    const folderMatch = window.location.pathname.match(/\/notes\/folder\/(.+)/);
    if (folderMatch) {
        try {
            let folderName = decodeURIComponent(folderMatch[1]);
            // Полное декодирование (на случай, если имя закодировано несколько раз)
            while (folderName !== decodeURIComponent(folderName)) {
                folderName = decodeURIComponent(folderName);
            }
            console.log('getCurrentFolderNameFromUrl: Декодированное имя папки:', folderName);
            return folderName;
        } catch (e) {
            console.error('getCurrentFolderNameFromUrl: Ошибка при декодировании имени папки:', e);
            return folderMatch[1]; // Используем как есть, если ошибка декодирования
        }
    }
    return null;
}

// Экспортируем функцию для использования в других скриптах
window.getCurrentFolderNameFromUrl = getCurrentFolderNameFromUrl;

// Обновление отображения статистики
function updateStatsDisplay() {
    if (statsData) {
        console.log('Обновляем статистику:', statsData);
        
        // Всегда используем только видимые заметки на текущей странице для счетчиков
        const visibleNotes = {
            total: $('.note-wrapper:visible').length, 
            active: $('.note-wrapper:visible:not(.completed)').length,
            completed: $('.note-wrapper:visible.completed').length,
            pinned: $('.note-wrapper:visible.pinned').length
        };
        
        // Проверяем, находимся ли мы в режиме папки
        const folderMode = window.location.pathname.match(/\/notes\/folder\/(.+)/) !== null;
        const currentFolderName = folderMode ? getCurrentFolderNameFromUrl() : null;
        
        // Определяем текущий режим просмотра
        const trashMode = (typeof pageData !== 'undefined' && pageData.trashMode) || window.location.pathname === '/notes/trash';
        const archiveMode = (typeof pageData !== 'undefined' && pageData.archiveMode) || window.location.pathname === '/notes/archive';
        
        // Обновляем счетчики на основе видимых заметок на текущей странице
        $('#total-notes').text(`Всего: ${visibleNotes.total}`);
        $('#completed-notes').text(`Выполнено: ${visibleNotes.completed}`);
        $('#active-notes').text(`Активно: ${visibleNotes.active}`);
        $('#pinned-notes').text(`Закреплено: ${visibleNotes.pinned}`);
        
        // Обновляем также счетчики в новом формате, если они есть
        $('.counter-total').text(visibleNotes.total);
        $('.counter-completed').text(visibleNotes.completed);
        $('.counter-active').text(visibleNotes.active);
        $('.counter-pinned').text(visibleNotes.pinned);
        
        // Выводим информацию в консоль о текущем режиме
        if (folderMode && currentFolderName) {
            console.log('Отображается статистика для текущей папки:', currentFolderName, visibleNotes);
        } else if (trashMode) {
            console.log('Отображается статистика для корзины:', visibleNotes);
        } else if (archiveMode) {
            console.log('Отображается статистика для архива:', visibleNotes);
        } else {
            console.log('Отображается статистика для всех заметок:', visibleNotes);
        }
        
        // Глобальные счетчики в боковой панели (не меняем)
        $('#archived-notes').text(`В архиве: ${statsData.archived || 0}`);
        $('#trashed-notes').text(`В корзине: ${statsData.trashed || 0}`);
        $('#reminders-notes').text(`С напоминаниями: ${statsData.with_reminders || 0}`);
        
        // Также обновляем счетчики на текущей странице
        updatePageCounters();
        
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
            
            // Используем универсальную функцию обновления интерфейса
            if (typeof updateNoteInterface === 'function') {
                updateNoteInterface('archive', id);
            } else {
                // Запасной вариант, если универсальная функция недоступна
                if (window.location.pathname === '/notes') {
                    $(`.note-wrapper#${id}`).fadeOut(300, function() {
                        $(this).remove();
                        
                        // Проверим, остались ли ещё заметки
                        if ($('.note-wrapper:visible').length === 0) {
                            $('.notes-container').hide();
                            $('.empty-container').removeClass('d-none');
                        }
                    });
                } else {
                    loadAllNotes(window.location.pathname === '/notes/trash');
                }
                
                // Обновляем статистику
                loadStats();
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
        success: function(response) {
            showNotification('Заметка извлечена из архива', 'info');
            
            // Используем универсальную функцию обновления интерфейса
            if (typeof updateNoteInterface === 'function') {
                updateNoteInterface('unarchive', id);
            } else {
                // Запасной вариант, если универсальная функция недоступна
                if (window.location.pathname === '/notes/archive') {
                    $(`.note-wrapper#${id}`).fadeOut(300, function() {
                        $(this).remove();
                        
                        // Проверим, остались ли ещё заметки
                        if ($('.note-wrapper:visible').length === 0) {
                            $('.notes-container').hide();
                            $('.empty-container').removeClass('d-none');
                        }
                    });
                }
                
                // Обновляем статистику
                loadStats();
                
                // Если мы на главной странице, обновляем список
                if (window.location.pathname === '/notes') {
                    loadAllNotes(false);
                }
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
    
    console.log('Создание новой папки:', folderName);
    
    // Получаем CSRF-токен
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    // Создаем папку сразу на странице с временным ID
    const tempId = 'new-folder-' + Date.now();
    addFolderToSidebar(folderName, 0, tempId);
    
    // Создаем папку через API
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
                
                // Удаляем временный элемент и добавляем постоянный с правильным ID
                $(`#${tempId}`).remove();
                addFolderToSidebar(folderName, 0);
                
                showNotification('Папка успешно добавлена', 'success');
                
                // Обновляем счетчики сразу, т.к. папка создается без заметки
                loadStats();
            } else {
                // В случае ошибки удаляем временный элемент
                $(`#${tempId}`).remove();
                showNotification(response.message || 'Ошибка при создании папки', 'warning');
            }
        },
        error: function(xhr) {
            // В случае ошибки удаляем временный элемент
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

// Добавление папки в боковую панель
function addFolderToSidebar(folderName, count, customId = null) {
    // Создаем ID для папки, заменяя пробелы и специальные символы
    // Используем data-атрибуты для точной идентификации папок по имени
    const normalizedName = folderName.toLowerCase().trim();
    const folderId = customId || ('folder-' + normalizedName.replace(/[^a-z0-9]/g, '-'));
    
    console.log('Добавление папки в сайдбар:', folderName, 'ID:', folderId);
    
    // Проверяем, существует ли уже такая папка в sidebar
    if (!customId) {
        // Проверяем по ID и по data-folder-name
        const existingFolder = $(`#${folderId}, [data-folder-name="${normalizedName}"]`);
        if (existingFolder.length > 0) {
            // Если да, просто обновляем счетчик
            existingFolder.find('.badge').text(count);
            console.log('Папка уже существует, обновляем счетчик:', count);
            return;
        }
    }
    
    // Добавляем папку в интерфейс с сохранением оригинального имени в data-атрибуте
    // Проверяем, является ли эта папка текущей для правильной подсветки
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
            // Определяем порядок приоритетов цветов (как они расположены в интерфейсе)
            const colorOrder = [
                'red', 'orange', 'yellow', 'green', 'blue', 'light-blue',  
                'purple', 'pink', 'teal', 'cyan', 'indigo', 'brown', 
                'black', 'dark-blue', 'default'
            ];
            
            notesArray.sort((a, b) => {
                const colorA = $(a).data('color') || 'default';
                const colorB = $(b).data('color') || 'default';
                
                // Получаем индексы цветов в нашем порядке
                const indexA = colorOrder.indexOf(colorA);
                const indexB = colorOrder.indexOf(colorB);
                
                // Если оба цвета одинаковы, сортируем по дате обновления
                if (indexA === indexB) {
                    const dateA = new Date($(a).data('updated-at') || 0);
                    const dateB = new Date($(b).data('updated-at') || 0);
                    return dateB - dateA; // Сначала новые
                }
                
                // Если какой-то из цветов не найден, отправляем его в конец
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                
                // Иначе сортируем по индексу в массиве colorOrder
                return indexA - indexB;
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
    
    // Обновляем счетчики заметок на странице
    setTimeout(updatePageCounters, 350);
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
    
    // Проверяем, ищем ли мы по тегу
    const isTagSearch = query.startsWith('#');
    const tagQuery = isTagSearch ? query.substring(1).toLowerCase() : '';
    
    notes.each(function() {
        const title = $(this).find('h4').text().toLowerCase();
        const description = $(this).find('.note-description').text().toLowerCase();
        // Получаем теги как атрибут для надежности
        const tags = $(this).attr('data-tags') || $(this).data('tags') || '';
        const id = $(this).attr('id');
        
        // Отладочная информация для каждой заметки
        console.log(`[DEBUG] Проверка заметки ID: ${id}, Теги: "${tags}"`)
        
        // Если это поиск по тегу, специальная проверка
        if (isTagSearch) {
            // Проверяем, есть ли у заметки теги
            if (tags) {
                const noteTags = tags.split(',').map(tag => tag.trim().toLowerCase());
                // Выводим для отладки
                console.log(`Заметка ID: ${id}, Название: ${title}, Теги: ${noteTags.join(', ')}`);
                console.log(`Ищем: '${tagQuery}', Есть: ${noteTags.some(tag => tag.includes(tagQuery))}`);
                
                // Проверяем, содержит ли какой-либо тег искомую строку
                // Улучшенный поиск с учетом всех возможных вариантов совпадения
                const found = noteTags.some(tag => {
                    // 1. Точное совпадение всего тега
                    if (tag === tagQuery) return true;
                    // 2. Тег начинается с запроса
                    if (tag.startsWith(tagQuery)) return true;
                    // 3. Тег содержит запрос (для обратной совместимости)
                    if (tag.includes(tagQuery)) return true;
                    // 4. Запрос содержит тег (когда тег - часть более длинного запроса)
                    if (tagQuery.includes(tag)) return true;
                    // Ничего не совпало
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
        // Обычный поиск
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
    
    // Отображаем результаты
    if (results.length > 0) {
        $('#search-results').empty();
        
        results.forEach(result => {
            const highlightedTitle = highlightText(result.title, query);
            const highlightedDesc = highlightText(result.description, query);
            
            // Формируем HTML для тегов, если они есть
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
        
        // Добавляем обработчик клика на результаты поиска
        $('.search-result-item').on('click', function(e) {
            // Если клик был по тегу, не обрабатываем клик по всему элементу
            if ($(e.target).hasClass('tag')) {
                return;
            }
            
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
        
        // Добавляем обработчик клика на теги в результатах поиска
        $('.search-result-item .tag').on('click', function(e) {
            e.stopPropagation(); // Останавливаем всплытие события
            const tagText = $(this).text().trim();
            searchByTag(tagText);
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
    const noteElement = $(`.note-wrapper[id="${id}"], .note-item[id="${id}"]`);
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
    
    console.log(`Переключаем статус заметки ${id}:`, { 
        currentDoneState, 
        newDoneState, 
        pageMode: window.location.pathname 
    });
    
    // Предварительно меняем UI для немедленного отклика
    if (currentDoneState) {
        // Меняем с "Выполнено" на "Активно"
        noteElement.removeClass('completed');
        noteElement.find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning');
        noteElement.find('.note-done-toggle').text('Активно');
        
        // Обновляем текст и иконку в контекстном меню
        const dropdownBtn = noteElement.find('.toggle-done-btn');
        if (dropdownBtn.length) {
            dropdownBtn.html('<i class="fas fa-check-circle"></i> Выполнено');
            dropdownBtn.attr('title', 'Выполнено');
            
            // Обновляем значения всех элементов с одинаковым ID заметки 
            // (может быть несколько представлений одной заметки на странице)
            $(`.toggle-done-btn[data-id="${id}"]`).each(function() {
                $(this).html('<i class="fas fa-check-circle"></i> Выполнено');
                $(this).attr('title', 'Выполнено');
            });
        }
    } else {
        // Меняем с "Активно" на "Выполнено" 
        noteElement.addClass('completed');
        noteElement.find('.note-done-toggle').removeClass('bg-warning').addClass('bg-success');
        noteElement.find('.note-done-toggle').text('Выполнено');
        
        // Обновляем текст и иконку в контекстном меню
        const dropdownBtn = noteElement.find('.toggle-done-btn');
        if (dropdownBtn.length) {
            dropdownBtn.html('<i class="fas fa-circle"></i> Активно');
            dropdownBtn.attr('title', 'Активно');
            
            // Обновляем значения всех элементов с одинаковым ID заметки
            $(`.toggle-done-btn[data-id="${id}"]`).each(function() {
                $(this).html('<i class="fas fa-circle"></i> Активно');
                $(this).attr('title', 'Активно');
            });
        }
    }
    
    // Обновляем визуальное состояние всех элементов с одинаковым ID заметки
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
    
    // Обновляем атрибут данных сразу (до получения ответа с сервера)
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
            
            // Разблокируем кнопки статуса
            statusButton.prop('disabled', false);
            
            // Обновляем атрибут данных согласно данным с сервера
            noteElement.attr('data-done', note.done);
            
            // Показываем уведомление
            showNotification(response.message || (note.done ? 'Заметка отмечена как выполненная' : 'Заметка отмечена как невыполненная'), 'info');
            
            // Вызываем событие изменения статуса заметки
            $(document).trigger('note:statusChanged', { 
                noteId: id, 
                isDone: note.done 
            });
            
            // Используем общий обработчик для обновления внешнего вида заметки на всех страницах
            if (typeof window.updateNoteAppearance === 'function') {
                // Обновляем все экземпляры заметки с тем же ID
                $(`.note-wrapper[id="note-${id}"], [id="note-${id}"], .note-item[id="note-${id}"]`).each(function() {
                    window.updateNoteAppearance($(this), note.done);
                });
            }
            
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
            noteElement.find('.toggle-done-btn').html('<i class="fas fa-circle"></i> Активно');
            noteElement.find('.toggle-done-btn').attr('title', 'Активно');
        } else {
            // Восстанавливаем состояние "Активно"
            noteElement.removeClass('completed');
            noteElement.find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning');
            noteElement.find('.note-done-toggle').text('Активно');
            
            // Восстанавливаем текст и иконку в контекстном меню
            noteElement.find('.toggle-done-btn').html('<i class="fas fa-check-circle"></i> Выполнено');
            noteElement.find('.toggle-done-btn').attr('title', 'Выполнено');
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

// Функция для безопасной инициализации элементов Bootstrap
function safeInitBootstrap() {
    // Инициализация выпадающих меню, если они есть на странице
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
 * 
 * @param {Object} options - Настройки модального окна
 * @param {string} options.id - Идентификатор модального окна
 * @param {string} options.title - Заголовок окна
 * @param {string} options.message - Текст сообщения
 * @param {string} options.confirmButtonText - Текст кнопки подтверждения
 * @param {string} options.cancelButtonText - Текст кнопки отмены
 * @param {string} options.confirmButtonClass - Класс кнопки подтверждения (например, btn-danger)
 * @param {string} options.icon - Иконка для заголовка (например, fa-trash)
 * @param {Function} options.onConfirm - Функция, выполняемая при подтверждении
 * @returns {bootstrap.Modal} - Экземпляр модального окна
 */
function createConfirmationModal(options) {
    // Настройки по умолчанию
    const defaults = {
        id: 'confirmationModal_' + new Date().getTime(),
        title: 'Подтвердите действие',
        message: 'Вы уверены, что хотите выполнить это действие?',
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        confirmButtonClass: 'btn-primary',
        icon: 'fa-question-circle',
        onConfirm: null,
        size: 'modal-md', // Размер модального окна: modal-sm, modal-md, modal-lg
        animation: true, // Анимация появления
        centered: true // Центрирование по вертикали
    };
    
    // Объединяем настройки по умолчанию с переданными параметрами
    const settings = {...defaults, ...options};
    
    // Удаляем предыдущее модальное окно с таким же ID, если оно существует
    $(`#${settings.id}`).remove();
    
    // Определяем дополнительные классы для модального окна
    const modalClasses = [
        'modal fade',
        settings.animation ? 'animate__animated animate__fadeIn' : '',
    ].filter(Boolean).join(' ');
    
    // Определяем классы для диалога
    const dialogClasses = [
        'modal-dialog',
        settings.size,
        settings.centered ? 'modal-dialog-centered' : '',
        'modal-dialog-scrollable'
    ].filter(Boolean).join(' ');
    
    // Создаем HTML модального окна с улучшенным дизайном
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
    
    // Добавляем модальное окно в DOM
    $('body').append(modalHTML);
    
    // Создаем экземпляр модального окна
    const modalElement = document.getElementById(settings.id);
    const modal = new bootstrap.Modal(modalElement);
    
    // Добавляем обработчик события для кнопки подтверждения
    $(`#${settings.id}Confirm`).on('click', function() {
        // Вызываем функцию обратного вызова, если она задана
        if (typeof settings.onConfirm === 'function') {
            settings.onConfirm();
        }
        
        // Скрываем модальное окно
        modal.hide();
    });
    
    // Обработчик события скрытия модального окна
    modalElement.addEventListener('hidden.bs.modal', function() {
        // Удаляем модальное окно из DOM после скрытия
        $(modalElement).remove();
    });
    
    return modal;
}

// Функция для показа модального окна об ошибке
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
    
    // Скрываем кнопку отмены, так как нужна только кнопка "Закрыть"
    modal._element.querySelector('.btn-secondary').style.display = 'none';
    
    modal.show();
    return modal;
}







