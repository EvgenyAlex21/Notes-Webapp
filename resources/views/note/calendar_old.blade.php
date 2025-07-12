<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Календарь</title>
    <link rel="icon" href="/favicon.ico?v=1">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png?v=1">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png?v=1">
    <link rel="shortcut icon" href="/favicon.ico?v=1">
    <link rel="apple-touch-icon" href="/images/logo.png?v=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/main.min.css' rel='stylesheet' />
    <link rel="stylesheet" href="{{ asset('css/note-selection.css') }}">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <link rel="stylesheet" href="{{ asset('css/view-button.css') }}">
    <link rel="stylesheet" href="{{ asset('css/notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/file-viewer.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/sidebar-counters.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mobile-responsive.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js'></script>
    <script src="{{ asset('js/file-viewer.js') }}"></script>
    <script src="{{ asset('js/scroll-top.js') }}"></script>
    <script src="{{ asset('js/view-buttons.js') }}"></script>
    <script src="{{ asset('js/note-buttons-fix.js') }}"></script>
    <script src="{{ asset('js/theme-manager.js') }}"></script>
    <script>
        const originalWarn = console.warn;
        console.warn = function() {
            if (arguments[0] && typeof arguments[0] === 'string' && 
                arguments[0].includes('DOMNodeInserted')) {
                return;
            }
            originalWarn.apply(console, arguments);
        };
    </script>
    <style>
        body {
            background-color: #f8f9fa;
        }
        .header {
            background-color: #fff;
            border-bottom: 1px solid #e9ecef;
            padding: 20px 0;
            margin-bottom: 30px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
        }
        .header h1 {
            display: flex;
            align-items: center;
            color: #3c4858;
            font-weight: 600;
        }
        .header h1 i {
            color: #007bff;
        }
        .sidebar {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 20px;
            position: sticky;
            top: 20px;
        }
        .sidebar-link {
            display: block;
            padding: 10px 15px;
            margin-bottom: 5px;
            color: #495057;
            border-radius: 5px;
            text-decoration: none;
        }
        .sidebar-link:hover {
            background-color: #f8f9fa;
        }
        .sidebar-link.active {
            background-color: #e9ecef;
            color: #212529;
            font-weight: bold;
        }
        .sidebar-link i {
            margin-right: 10px;
        }
        .folder-link {
            display: block;
            padding: 8px 12px;
            margin-bottom: 5px;
            border-radius: 5px;
            text-decoration: none;
            color: #495057;
            transition: all 0.2s;
        }
        .folder-link:hover {
            background-color: #f8f9fa;
        }
        .folder-link.active {
            background-color: #e9ecef;
            color: #212529;
            font-weight: bold;
        }
        .color-option {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin: 0 3px;
            cursor: pointer;
            border: 2px solid #fff;
            box-shadow: 0 0 0 1px #ddd;
        }
        .color-option:hover {
            transform: scale(1.2);
        }
        .color-default { background-color: #6c757d; }
        .color-red { background-color: #dc3545; }
        .color-green { background-color: #28a745; }
        .color-blue { background-color: #007bff; }
        .color-yellow { background-color: #ffc107; }
        .color-purple { background-color: #6f42c1; }
        .color-pink { background-color: #e83e8c; }
        .color-orange { background-color: #fd7e14; }
        .color-teal { background-color: #20c997; }
        .color-cyan { background-color: #17a2b8; }
        .color-indigo { background-color: #6610f2; }
        .color-brown { background-color: #8b4513; }
        .color-black { background-color: #000000; }
        .color-navy { background-color: #000080; }
        .theme-switch {
            cursor: pointer;
            padding: 10px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 8px;
            background-color: #f8f9fa;
        }
        .calendar-content {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            padding: 20px;
            min-height: 600px;
        }
        #calendar {
            height: 100%;
            min-height: 500px;
        }
        .calendar-placeholder {
            color: #6c757d;
            font-size: 1.2rem;
        }
        .calendar-placeholder i {
            font-size: 4rem;
            color: #007bff;
            margin-bottom: 20px;
        }
        
        /* Темная тема */
        body.dark-theme {
            background-color: #212529;
            color: #f8f9fa;
        }
        .dark-theme .header {
            background-color: #343a40;
            border-bottom-color: #495057;
        }
        .dark-theme .sidebar {
            background-color: #343a40;
            color: #f8f9fa;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .dark-theme .sidebar-link {
            color: #f1f3f5;
        }
        .dark-theme .sidebar-link:hover {
            background-color: #4a4f55;
        }
        .dark-theme .sidebar-link.active {
            background-color: #4a4f55;
            color: #ffffff;
        }
        .dark-theme .folder-link {
            color: #f1f3f5 !important;
        }
        .dark-theme .folder-link:hover {
            background-color: #4a4f55;
        }
        .dark-theme .folder-link.active {
            background-color: #4a4f55;
            color: #ffffff !important;
            font-weight: bold;
        }
        .dark-theme .theme-switch {
            background-color: #495057;
        }
        .dark-theme .calendar-content {
            background-color: #343a40;
        }
        .dark-theme .calendar-placeholder {
            color: #adb5bd;
        }
        .dark-theme .btn-outline-secondary {
            color: #c2c7d0;
            border-color: #495057;
        }
        .dark-theme .btn-outline-secondary:hover {
            background-color: #495057;
            color: #ffffff;
        }
        
        /* Стили для календаря */
        .dark-theme .fc-theme-standard .fc-list-day-cushion {
            background-color: #495057;
        }
        .dark-theme .fc-theme-standard th {
            background-color: #343a40;
            color: #f8f9fa;
            border-color: #495057;
        }
        .dark-theme .fc-theme-standard td {
            border-color: #495057;
        }
        .dark-theme .fc-theme-standard .fc-scrollgrid {
            border-color: #495057;
        }
        .dark-theme .fc-col-header-cell-cushion {
            color: #f8f9fa;
        }
        .dark-theme .fc-daygrid-day-number {
            color: #f8f9fa;
        }
        .dark-theme .fc-button-primary {
            background-color: #495057;
            border-color: #495057;
        }
        .dark-theme .fc-button-primary:hover {
            background-color: #6c757d;
            border-color: #6c757d;
        }
        .dark-theme .fc-toolbar-title {
            color: #f8f9fa;
        }
            color: #f8f9fa;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .dark-theme .sidebar-link {
            color: #f1f3f5;
        }
        .dark-theme .sidebar-link:hover {
            background-color: #4a4f55;
        }
        .dark-theme .sidebar-link.active {
            background-color: #4a4f55;
            color: #ffffff;
        }
        .dark-theme .header {
            background-color: #343a40;
            border-bottom-color: #495057;
        }
        .dark-theme .calendar-container {
            background-color: #343a40;
            color: #f8f9fa;
        }
        .dark-theme .fc-theme-standard .fc-list-day-cushion {
            background-color: #495057;
        }
        .dark-theme .fc-theme-standard th {
            background-color: #343a40;
            color: #f8f9fa;
            border-color: #495057;
        }
        .dark-theme .fc-theme-standard td {
            border-color: #495057;
        }
        .dark-theme .fc-theme-standard .fc-scrollgrid {
            border-color: #495057;
        }
        .dark-theme .fc-col-header-cell-cushion {
            color: #f8f9fa;
        }
        .dark-theme .fc-daygrid-day-number {
            color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">
                    <i class="fas fa-calendar me-2"></i>
                    <span class="fw-bold">Календарь</span>
                </h1>
                <a href="/notes" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left"></i> Назад к списку
                </a>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="row">
            <!-- Боковая панель -->
            <div class="col-md-3 mb-4">
                <div class="sidebar">
                    <h5 class="mb-3">Навигация</h5>
                    <a href="/notes" class="sidebar-link d-flex justify-content-between align-items-center">
                        <div><i class="fas fa-sticky-note"></i> Все заметки</div>
                        <span class="badge bg-secondary me-2 notes-count" id="all-notes-count">0</span>
                    </a>
                    <a href="/notes/archive" class="sidebar-link d-flex justify-content-between align-items-center">
                        <div><i class="fas fa-archive"></i> Архив</div>
                        <span class="badge bg-secondary me-2 notes-count" id="archive-notes-count">0</span>
                    </a>
                    <a href="/notes/trash" class="sidebar-link d-flex justify-content-between align-items-center">
                        <div><i class="fas fa-trash"></i> Корзина</div>
                        <span class="badge bg-secondary me-2 notes-count" id="trash-notes-count">0</span>
                    </a>
                    <a href="/notes/calendar" class="sidebar-link d-flex justify-content-between align-items-center active">
                        <div><i class="fas fa-calendar"></i> Календарь</div>
                        <span class="badge bg-secondary me-2 notes-count" id="calendar-notes-count">0</span>
                    </a>
                    <hr>
                    <div class="theme-switch" id="theme-switch">
                        <span><i class="fas fa-sun"></i> Тема</span>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="theme-toggle">
                        </div>
                    </div>
                    <hr>
                    <h5 class="mb-3">Фильтры</h5>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebar-filter" id="filter-all" value="all" checked>
                        <label class="form-check-label" for="filter-all">
                            <i class="fas fa-list"></i> Все
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebar-filter" id="filter-active" value="active">
                        <label class="form-check-label" for="filter-active">
                            <i class="fas fa-circle"></i> Только активные
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebar-filter" id="filter-completed" value="completed">
                        <label class="form-check-label" for="filter-completed">
                            <i class="fas fa-check-circle"></i> Только выполненные
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebar-filter" id="filter-pinned" value="pinned">
                        <label class="form-check-label" for="filter-pinned">
                            <i class="fas fa-thumbtack"></i> Только закрепленные
                        </label>
                    </div>
                    <hr>
                    <h5 class="mb-3">Папки</h5>
                    <div id="folders-list">
                    </div>
                    <button class="btn btn-sm btn-outline-secondary w-100" id="add-folder-btn">
                        <i class="fas fa-plus"></i> Добавить папку
                    </button>
                    <hr>
                    <h5 class="mb-3">Приоритет заметки</h5>
                    <div class="color-picker d-flex flex-wrap gap-2 mb-3">
                        <div class="color-option color-default" data-color="default" title="Без приоритета"></div>
                        <div class="color-option color-red" data-color="red" title="Критически важно"></div>
                        <div class="color-option color-orange" data-color="orange" title="Очень важно"></div>
                        <div class="color-option color-yellow" data-color="yellow" title="Важно"></div>
                        <div class="color-option color-green" data-color="green" title="Средний приоритет"></div>
                        <div class="color-option color-blue" data-color="blue" title="Стандартная задача"></div>
                        <div class="color-option color-purple" data-color="purple" title="Планирование"></div>
                        <div class="w-100"></div>
                        <div class="color-option color-pink" data-color="pink" title="Личное"></div>
                        <div class="color-option color-teal" data-color="teal" title="Идея"></div>
                        <div class="color-option color-cyan" data-color="cyan" title="Информация"></div>
                        <div class="color-option color-indigo" data-color="indigo" title="Обучение"></div>
                        <div class="color-option color-brown" data-color="brown" title="Ожидание"></div>
                        <div class="color-option color-black" data-color="black" title="Архивное"></div>
                        <div class="color-option color-navy" data-color="navy" title="Ночное"></div>
                    </div>
                </div>
            </div>
            
            <!-- Основное содержимое -->
            <div class="col-md-9">
                <div class="calendar-content">
                    <div id="calendar"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="{{ asset('js/sidebar-counters.js') }}"></script>
    <script>
        let calendar;
        
        $(document).ready(function() {
            // Инициализация календаря
            initCalendar();
            
            // Инициализация темы
            if (typeof ThemeManager !== 'undefined') {
                ThemeManager.init();
            }
            
            // Загрузка счетчиков
            if (typeof loadNoteCounts === 'function') {
                loadNoteCounts();
            }
            
            // Загрузка папок
            loadFolders();
        });

        function initCalendar() {
            const calendarEl = document.getElementById('calendar');
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                locale: 'ru',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: loadCalendarEvents,
                eventClick: function(info) {
                    // Обработка клика по событию
                    const noteId = info.event.id;
                    if (noteId) {
                        window.location.href = '/notes/' + noteId;
                    }
                },
                height: 'auto',
                dayMaxEvents: true,
                moreLinkClick: 'popover'
            });
            
            calendar.render();
        }

        function loadCalendarEvents(info, successCallback, failureCallback) {
            $.ajax({
                url: '/api/notes/by-date',
                type: 'GET',
                data: {
                    start: info.start.toISOString(),
                    end: info.end.toISOString()
                },
                success: function(response) {
                    const events = [];
                    if (response.success && response.data) {
                        response.data.forEach(function(note) {
                            if (note.due_date) {
                                events.push({
                                    id: note.id,
                                    title: note.title,
                                    start: note.due_date,
                                    backgroundColor: getColorForNote(note.color),
                                    borderColor: getColorForNote(note.color),
                                    textColor: '#fff'
                                });
                            }
                        });
                    }
                    successCallback(events);
                },
                error: function() {
                    failureCallback();
                }
            });
        }

        function getColorForNote(color) {
            const colorMap = {
                'default': '#6c757d',
                'red': '#dc3545',
                'green': '#28a745',
                'blue': '#007bff',
                'yellow': '#ffc107',
                'purple': '#6f42c1',
                'pink': '#e83e8c',
                'orange': '#fd7e14',
                'teal': '#20c997',
                'cyan': '#17a2b8',
                'indigo': '#6610f2',
                'brown': '#8b4513',
                'black': '#000000',
                'navy': '#000080'
            };
            return colorMap[color] || colorMap['default'];
        }

        // Функция загрузки папок
        function loadFolders() {
            $.ajax({
                url: '/api/folders',
                type: 'GET',
                success: function(response) {
                    if (response.success && response.data) {
                        const foldersContainer = $('#folders-list');
                        foldersContainer.empty();
                        
                        response.data.forEach(function(folder) {
                            const folderItem = $(`
                                <a href="/notes/folder/${encodeURIComponent(folder.name)}" class="folder-link d-flex justify-content-between align-items-center">
                                    <div><i class="fas fa-folder"></i> ${folder.name}</div>
                                    <span class="badge bg-secondary me-2">${folder.notes_count || 0}</span>
                                </a>
                            `);
                            foldersContainer.append(folderItem);
                        });
                    }
                },
                error: function() {
                    console.log('Ошибка загрузки папок');
                }
            });
        }
    </script>
</body>
</html>
                    sortedFolders.forEach(function(folder) {
                        const folderName = folder.name;
                        const count = folder.count || 0;
                        const normalizedName = folderName.toLowerCase().trim();
                        const folderId = 'folder-' + normalizedName.replace(/[^a-z0-9]/g, '-');
                        const isActive = window.location.pathname.includes(`/notes/folder/${encodeURIComponent(folderName)}`);
                        const activeClass = isActive ? 'active-folder' : '';
                        foldersContainer.append(`
                            <div class="folder-item d-flex align-items-center mb-2 ${activeClass}" 
                                 id="${folderId}" 
                                 data-folder-name="${normalizedName}" 
                                 data-folder-original="${folderName}">
                                <a href="/notes/folder/${encodeURIComponent(folderName)}" 
                                   class="text-decoration-none text-dark folder-link" 
                                   data-folder="${folderName}">
                                    <i class="fas fa-folder me-1"></i> ${folderName}
                                </a>
                                <div class="ms-auto d-flex align-items-center gap-1">
                                    <span class="badge bg-secondary">${count}</span>
                                    <button class="btn btn-link p-0 ms-1 folder-actions" tabindex="-1" style="color:#adb5bd;" title="Действия">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                </div>
                            </div>
                        `);
                    });
                    // Включаем обработчик для троеточий
                    $('.folder-actions').off('click').on('click', function(e) {
                        e.preventDefault();
                        // Здесь можно реализовать выпадающее меню или действия для папки
                        showNotification('Действия с папкой будут реализованы позже', 'info');
                    });
                }
            },
            error: function() {
                console.error('Ошибка при загрузке папок');
            }
        });
    }
    // Загрузка папок при загрузке страницы
    $(document).ready(function() {
        loadFoldersList();
        // Отключаем клики на цветах в боковой панели
        $('.sidebar .color-option').css('pointer-events', 'none');
        $('.sidebar .color-option.color-default').addClass('selected');
        $('.sidebar .color-option:not(.color-default)').removeClass('selected');
        // Счетчики заметок (если есть функция)
        if (typeof loadSidebarStats === 'function') {
            setTimeout(loadSidebarStats, 200);
        }
        // Переключение темы
        const darkThemeEnabled = localStorage.getItem('darkTheme') === 'true';
        if (darkThemeEnabled) {
            document.body.classList.add('dark-theme');
            $('#theme-toggle').prop('checked', true);
        }
        $('#theme-toggle').on('change', function() {
            const isDarkMode = $(this).is(':checked');
            if (isDarkMode) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('darkTheme', 'true');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('darkTheme', 'false');
            }
        });
    });
    </script>
    
    <!-- Модальное окно для просмотра/редактирования заметки -->
    <div class="modal fade" id="eventModal" tabindex="-1" aria-labelledby="eventModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="eventModalLabel">Детали заметки</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="event-details">
                    <div class="mb-3">
                        <h4 id="event-title" class="mb-2"></h4>
                        <p id="event-description" class="text-muted"></p>
                    </div>
                    <div class="mb-3">
                        <div class="d-flex align-items-center mb-2">
                            <span class="badge me-2" id="event-color"></span>
                            <span id="event-date"></span>
                        </div>
                        <div id="event-tags"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    <a href="#" class="btn btn-primary" id="edit-event-btn">Редактировать</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Модальное окно для создания заметки с напоминанием -->
    <div class="modal fade" id="createEventModal" tabindex="-1" aria-labelledby="createEventModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createEventModalLabel">Создать заметку с напоминанием</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="new-event-title" class="form-label">Название</label>
                        <input type="text" class="form-control" id="new-event-title" required>
                    </div>
                    <div class="mb-3">
                        <label for="new-event-description" class="form-label">Описание</label>
                        <textarea class="form-control" id="new-event-description" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Цвет</label>
                        <div class="color-picker d-flex">
                            <div class="color-option color-default selected" data-color="default" title="По умолчанию"></div>
                            <div class="color-option color-red" data-color="red" title="Высокий приоритет"></div>
                            <div class="color-option color-yellow" data-color="yellow" title="Средний приоритет"></div>
                            <div class="color-option color-green" data-color="green" title="Низкий приоритет"></div>
                            <div class="color-option color-blue" data-color="blue" title="Информационный"></div>
                            <div class="color-option color-purple" data-color="purple" title="Личный"></div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="new-event-date" class="form-label">Дата напоминания</label>
                        <input type="datetime-local" class="form-control" id="new-event-date">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                    <button type="button" class="btn btn-primary" id="save-event-btn">Создать заметку</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Глобальные переменные
        let calendar;
        let selectedColor = 'default';
        let currentTheme = localStorage.getItem('theme') || 'light';

        document.addEventListener('DOMContentLoaded', function() {
            // Инициализация темы
            if (typeof initTheme === 'function') initTheme();

            // Проверка наличия контейнера календаря
            const calendarEl = document.getElementById('calendar');
            if (calendarEl) {
                document.getElementById('calendar-debug-text').innerText = 'Инициализация календаря...';
                try {
                    initCalendar();
                    document.getElementById('calendar-debug-text').style.display = 'none';
                } catch (e) {
                    document.getElementById('calendar-debug-text').innerText = 'Ошибка инициализации: ' + e;
                    calendarEl.style.color = 'red';
                }
            } else {
                console.error('Контейнер #calendar не найден!');
            }

            // Инициализация цветового выбора
            $('.color-option').on('click', function() {
                $('.color-option').removeClass('selected');
                $(this).addClass('selected');
                selectedColor = $(this).data('color');
            });

            // Обработчик для перерисовки календаря при смене темы
            $('#theme-toggle').on('change', function() {
                if (calendar) calendar.render();
            });

            // Обработчик для создания заметки
            $('#save-event-btn').on('click', function() {
                const title = $('#new-event-title').val();
                const description = $('#new-event-description').val();
                const reminderDate = $('#new-event-date').val();

                if (!title || !description || !reminderDate) {
                    alert('Пожалуйста, заполните все поля');
                    return;
                }

                createNoteWithReminder(title, description, selectedColor, reminderDate);
            });
        });
        
        // Инициализация календаря
        function initCalendar() {
            const calendarEl = document.getElementById('calendar');
            
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,listWeek'
                },
                locale: 'ru',
                timeZone: 'local',
                events: function(fetchInfo, successCallback, failureCallback) {
                    loadEvents(fetchInfo.start, fetchInfo.end, successCallback);
                },
                eventClick: function(info) {
                    showEventDetails(info.event);
                },
                dateClick: function(info) {
                    // При клике на дату открываем модальное окно создания заметки
                    const clickedDate = info.dateStr;
                    $('#new-event-date').val(clickedDate + 'T12:00');
                    $('#createEventModal').modal('show');
                },
                dayMaxEvents: true // Разрешить "more" ссылку при большом количестве событий
            });
            
            calendar.render();
        }
        
        // Загрузка событий (заметок с напоминаниями)
        function loadEvents(start, end, successCallback) {
            $.ajax({
                url: '/api/notes',
                method: 'GET',
                dataType: 'json',
                success: function(response) {
                    const notes = response.data;
                    const events = [];
                    
                    notes.forEach(note => {
                        if (note.reminder_at || note.due_date) {
                            const date = note.reminder_at || note.due_date;
                            
                            // Определяем цвет события на основе цвета заметки
                            let eventColor;
                            switch(note.color) {
                                case 'red': eventColor = '#dc3545'; break;
                                case 'green': eventColor = '#28a745'; break;
                                case 'blue': eventColor = '#007bff'; break;
                                case 'yellow': eventColor = '#ffc107'; break;
                                case 'purple': eventColor = '#6f42c1'; break;
                                default: eventColor = '#6c757d';
                            }
                            
                            events.push({
                                id: note.id,
                                title: note.name,
                                start: date,
                                backgroundColor: eventColor,
                                borderColor: eventColor,
                                extendedProps: {
                                    description: note.description,
                                    color: note.color,
                                    tags: note.tags
                                }
                            });
                        }
                    });
                    
                    successCallback(events);
                },
                error: function(error) {
                    console.error('Ошибка при загрузке событий:', error);
                    successCallback([]);
                }
            });
        }
        
        // Показать детали заметки
        function showEventDetails(event) {
            $('#event-title').text(event.title);
            $('#event-description').text(event.extendedProps.description);
            
            // Отображаем цвет заметки
            const colorClass = event.extendedProps.color || 'default';
            $('#event-color').removeClass().addClass(`badge color-${colorClass}`).text(getColorName(colorClass));
            
            // Отображаем дату события
            const eventDate = new Date(event.start);
            $('#event-date').text(formatDate(eventDate));
            
            // Отображаем теги, если они есть
            if (event.extendedProps.tags) {
                const tags = event.extendedProps.tags.split(',');
                let tagsHtml = '';
                
                tags.forEach(tag => {
                    tagsHtml += `<span class="badge bg-light text-dark me-1">${tag}</span>`;
                });
                
                $('#event-tags').html(tagsHtml);
            } else {
                $('#event-tags').empty();
            }
            
            // Настраиваем кнопку редактирования
            $('#edit-event-btn').attr('href', `/notes/${event.id}/edit`);
            
            // Показываем модальное окно
            $('#eventModal').modal('show');
        }
        
        // Создание заметки с напоминанием
        function createNoteWithReminder(title, description, color, reminderDate) {
            // Получаем CSRF-токен из meta-тега
            const csrfToken = $('meta[name="csrf-token"]').attr('content');
            
            const data = {
                name: title,
                description: description,
                color: color || 'default',
                reminder_at: reminderDate,
                is_pinned: false
            };
            
            $.ajax({
                url: '/api/notes',
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data),
                success: function(response) {
                    $('#createEventModal').modal('hide');
                    
                    // Очищаем форму
                    $('#new-event-title').val('');
                    $('#new-event-description').val('');
                    $('#new-event-date').val('');
                    
                    // Обновляем календарь
                    calendar.refetchEvents();
                    
                    // Показываем сообщение об успехе
                    alert('Заметка с напоминанием создана успешно!');
                },
                error: function(error) {
                    console.error('Ошибка при создании заметки:', error);
                    alert('Ошибка при создании заметки');
                }
            });
        }
        
        // Получение названия цвета
        function getColorName(color) {
            switch(color) {
                case 'red': return 'Высокий приоритет';
                case 'yellow': return 'Средний приоритет';
                case 'green': return 'Низкий приоритет';
                case 'blue': return 'Информационный';
                case 'purple': return 'Личный';
                default: return 'Стандартный';
            }
        }
        
        // Форматирование даты
        function formatDate(date) {
            return new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }
        
        // Примечание: функции управления темой перенесены в theme-manager.js
    </script>
</body>
</html>
