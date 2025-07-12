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
        .color-option.selected {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px white, 0 0 0 4px #007bff;
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
        .dark-theme .alert-info {
            background-color: #1b4b72;
            border-color: #1e5b85;
            color: #bee5eb;
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
        .fc-event {
            cursor: pointer;
            border-radius: 4px;
            padding: 2px 4px;
            font-size: 0.85rem;
            margin-bottom: 1px;
        }
        .fc-event:hover {
            opacity: 0.8;
            transform: scale(1.02);
        }
        .fc-daygrid-day {
            cursor: pointer;
        }
        .fc-daygrid-day:hover {
            background-color: rgba(0, 123, 255, 0.1);
        }
        .fc-toolbar {
            margin-bottom: 1rem;
        }
        .fc-button {
            border-radius: 6px;
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
        
        /* Стили для папок (точно как на главной странице) */
        .folder-item {
            margin-bottom: 8px;
            transition: all 0.2s ease;
        }
        .folder-item:hover {
            transform: translateY(-1px);
        }
        .folder-item.active-folder .folder-link {
            background-color: #007bff;
            color: white !important;
        }
        .folder-item.active-folder .folder-link i {
            color: white !important;
        }
        .folder-item.active-folder .badge {
            background-color: rgba(255,255,255,0.2) !important;
        }
        .folder-link {
            color: #495057 !important;
            text-decoration: none !important;
            font-weight: 500;
            flex: 1;
            display: flex;
            align-items: center;
        }
        .folder-link:hover {
            color: #495057 !important;
            text-decoration: none !important;
        }
        .folder-link i {
            margin-right: 8px;
            color: #6c757d;
        }
        .folder-actions {
            position: relative;
        }
        .folder-actions .btn {
            border: none;
            background: none;
            padding: 4px 8px;
            color: #6c757d;
        }
        .folder-actions .btn:hover {
            background-color: rgba(0,0,0,0.05);
            border-radius: 4px;
        }
        .folder-actions .dropdown-menu {
            min-width: 200px;
            border: 1px solid #dee2e6;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            z-index: 1050;
        }
        .folder-actions .dropdown-item {
            padding: 8px 16px;
            font-size: 0.875rem;
        }
        .folder-actions .dropdown-item:hover {
            background-color: #f8f9fa;
        }
        .folder-actions .dropdown-item i {
            width: 16px;
            margin-right: 8px;
        }
        
        /* Темная тема для папок */
        .dark-theme .folder-link {
            color: #f8f9fa !important;
        }
        .dark-theme .folder-link:hover {
            color: #f8f9fa !important;
        }
        .dark-theme .folder-link i {
            color: #adb5bd;
        }
        .dark-theme .folder-item.active-folder .folder-link {
            background-color: #0d6efd;
            border-color: #0d6efd;
        }
        .dark-theme .folder-actions .btn {
            color: #adb5bd;
        }
        .dark-theme .folder-actions .btn:hover {
            background-color: rgba(255,255,255,0.1);
        }
        .dark-theme .folder-actions .dropdown-menu {
            background-color: #495057;
            border-color: #6c757d;
        }
        .dark-theme .folder-actions .dropdown-item {
            color: #f8f9fa;
        }
        .dark-theme .folder-actions .dropdown-item:hover {
            background-color: #6c757d;
        }
        
        /* Стили для отключенных элементов */
        .form-check-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .form-check-input:disabled + .form-check-label {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .color-option.disabled {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
        }
        .color-option.disabled:hover {
            transform: none;
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
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebar-filter" id="filter-all" value="all" checked disabled>
                        <label class="form-check-label" for="filter-all">
                            <i class="fas fa-list"></i> Все
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebar-filter" id="filter-active" value="active" disabled>
                        <label class="form-check-label" for="filter-active">
                            <i class="fas fa-circle"></i> Только активные
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebar-filter" id="filter-completed" value="completed" disabled>
                        <label class="form-check-label" for="filter-completed">
                            <i class="fas fa-check-circle"></i> Только выполненные
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebar-filter" id="filter-pinned" value="pinned" disabled>
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
                        <div class="color-option color-default selected disabled" data-color="default" title="Без приоритета"></div>
                        <div class="color-option color-red disabled" data-color="red" title="Критически важно"></div>
                        <div class="color-option color-orange disabled" data-color="orange" title="Очень важно"></div>
                        <div class="color-option color-yellow disabled" data-color="yellow" title="Важно"></div>
                        <div class="color-option color-green disabled" data-color="green" title="Средний приоритет"></div>
                        <div class="color-option color-blue disabled" data-color="blue" title="Стандартная задача"></div>
                        <div class="color-option color-purple disabled" data-color="purple" title="Планирование"></div>
                        <div class="w-100"></div>
                        <div class="color-option color-pink disabled" data-color="pink" title="Личное"></div>
                        <div class="color-option color-teal disabled" data-color="teal" title="Идея"></div>
                        <div class="color-option color-cyan disabled" data-color="cyan" title="Информация"></div>
                        <div class="color-option color-indigo disabled" data-color="indigo" title="Обучение"></div>
                        <div class="color-option color-brown disabled" data-color="brown" title="Ожидание"></div>
                        <div class="color-option color-black disabled" data-color="black" title="Архивное"></div>
                        <div class="color-option color-navy disabled" data-color="navy" title="Ночное"></div>
                    </div>
                </div>
            </div>
            
            <!-- Основное содержимое -->
            <div class="col-md-9">
                <div class="calendar-content">
                    <div class="alert alert-info d-flex align-items-center mb-3" role="alert">
                        <i class="fas fa-info-circle me-2"></i>
                        <small>
                            <strong>Подсказка:</strong> Кликните по дню для создания заметки с этой датой. 
                            Кликните по событию для просмотра заметки. Используйте цветовые фильтры для отображения заметок по приоритету.
                        </small>
                    </div>
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
            } else {
                // Альтернативная загрузка счетчиков
                loadStats();
            }
            
            // Загрузка папок
            loadFolders();
            
            // Обработчик для кнопки добавления папки
            $('#add-folder-btn').on('click', function(e) {
                e.preventDefault();
                console.log('Клик на кнопку добавления папки');
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
                const modal = new bootstrap.Modal(document.getElementById('createFolderModal'));
                modal.show();
                $('#new-folder-name').focus();

                function validateFolderName(name) {
                    if (!name || name.trim() === '') {
                        return { valid: false, message: 'Имя папки не может быть пустым.' };
                    }
                    if (name.length < 2) {
                        return { valid: false, message: 'Имя папки должно содержать не менее 2 символов.' };
                    }
                    if (/[\\\/\:\*\?\"\<\>\|]/.test(name)) {
                        return { valid: false, message: 'Имя папки содержит запрещенные символы (\\, /, :, *, ?, ", <, >, |).' };
                    }
                    const folderId = 'folder-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    if ($('#' + folderId).length > 0) {
                        return { valid: false, message: 'Папка с таким именем уже существует.' };
                    }
                    return { valid: true };
                }

                function showFolderNameError(message) {
                    $('#folder-name-error').remove();
                    $('#new-folder-name').after(`<div id="folder-name-error" class="text-danger mt-1"><small>${message}</small></div>`);
                    $('#new-folder-name').addClass('is-invalid');
                }

                $('#confirm-create-folder').on('click', function() {
                    const folderName = $('#new-folder-name').val().trim();
                    const validation = validateFolderName(folderName);
                    if (validation.valid) {
                        modal.hide();
                        $('#createFolderModal').on('hidden.bs.modal', function() {
                            $(this).remove();
                        });
                        addFolder(folderName);
                    } else {
                        showFolderNameError(validation.message);
                    }
                });

                $('#new-folder-name').on('input', function() {
                    $('#folder-name-error').remove();
                    $(this).removeClass('is-invalid');
                });

                $('#new-folder-name').on('keypress', function(e) {
                    if (e.which === 13) {
                        $('#confirm-create-folder').click();
                    }
                });
            });
            
            // Обработчики для цветовых фильтров
            $('.color-option').on('click', function() {
                $('.color-option').removeClass('selected');
                $(this).addClass('selected');
                
                const selectedColor = $(this).data('color');
                if (selectedColor === 'default') {
                    filterEventsByColor('all');
                } else {
                    filterEventsByColor(selectedColor);
                }
            });
            
            // Обработчики для боковых фильтров
            $('.sidebar-filter').on('change', function() {
                const filterValue = $(this).val();
                // Здесь можно добавить фильтрацию событий по статусу
                // Пока просто обновляем календарь
                if (calendar) {
                    calendar.refetchEvents();
                }
            });
        });

        function initCalendar() {
            const calendarEl = document.getElementById('calendar');
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                firstDay: 1, // Понедельник как первый день недели
                locale: 'ru',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                buttonText: {
                    today: 'Сегодня',
                    month: 'Месяц',
                    week: 'Неделя',
                    day: 'День'
                },
                dayHeaderFormat: { weekday: 'short' },
                events: loadCalendarEvents,
                eventClick: function(info) {
                    // Обработка клика по событию
                    const noteId = info.event.id;
                    if (noteId) {
                        window.location.href = '/notes/' + noteId;
                    }
                },
                dateClick: function(info) {
                    // Обработка клика по дню - создание новой заметки с этой датой
                    const selectedDate = info.dateStr;
                    createNoteForDate(selectedDate);
                },
                height: 'auto',
                dayMaxEvents: true,
                moreLinkClick: 'popover',
                eventDisplay: 'block',
                displayEventTime: false,
                eventDidMount: function(info) {
                    // Добавляем тултип с информацией о заметке
                    $(info.el).attr('title', info.event.title);
                }
            });
            
            calendar.render();
        }

        // Создание заметки для выбранной даты
        function createNoteForDate(dateStr) {
            // Открываем страницу создания заметки с предустановленной датой
            const url = `/notes/create?due_date=${dateStr}`;
            window.location.href = url;
        }

        // Фильтрация событий по цвету
        function filterEventsByColor(colorFilter) {
            if (!calendar) return;
            
            calendar.getEvents().forEach(function(event) {
                if (colorFilter === 'all') {
                    event.setProp('display', 'auto');
                } else {
                    const eventColor = event.backgroundColor;
                    const filterColor = getColorForNote(colorFilter);
                    
                    if (eventColor === filterColor) {
                        event.setProp('display', 'auto');
                    } else {
                        event.setProp('display', 'none');
                    }
                }
            });
        }

        function loadCalendarEvents(info, successCallback, failureCallback) {
            // Получаем активные фильтры
            const activeFilter = $('input[name="sidebar-filter"]:checked').val();
            
            $.ajax({
                url: '/api/notes/by-date',
                type: 'GET',
                data: {
                    start: info.start.toISOString(),
                    end: info.end.toISOString(),
                    filter: activeFilter
                },
                success: function(response) {
                    const events = [];
                    if (response.success && response.data) {
                        response.data.forEach(function(note) {
                            if (note.due_date) {
                                const backgroundColor = getColorForNote(note.color);
                                events.push({
                                    id: note.id,
                                    title: note.title,
                                    start: note.due_date,
                                    backgroundColor: backgroundColor,
                                    borderColor: backgroundColor,
                                    textColor: getContrastColor(backgroundColor),
                                    extendedProps: {
                                        noteColor: note.color,
                                        isCompleted: note.is_completed,
                                        isPinned: note.is_pinned,
                                        description: note.description
                                    }
                                });
                            }
                        });
                    }
                    successCallback(events);
                },
                error: function(xhr, status, error) {
                    console.error('Ошибка загрузки событий календаря:', {
                        xhr: xhr,
                        status: status,
                        error: error,
                        responseText: xhr.responseText
                    });
                    failureCallback();
                }
            });
        }

        // Функция для получения контрастного цвета текста
        function getContrastColor(hexColor) {
            // Простая функция для определения контрастного цвета
            const color = hexColor.replace('#', '');
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 128 ? '#000000' : '#ffffff';
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

        // Функция загрузки статистики (счетчиков)
        function loadStats() {
            $.ajax({
                url: '/api/stats',
                type: 'GET',
                success: function(response) {
                    if (response.success && response.data) {
                        const stats = response.data;
                        
                        // Обновляем счетчики в навигации
                        $('#all-notes-count').text(stats.total || 0);
                        $('#archive-notes-count').text(stats.archived || 0);
                        $('#trash-notes-count').text(stats.trashed || 0);
                        $('#calendar-notes-count').text(stats.calendar || 0);
                    }
                },
                error: function() {
                    console.log('Ошибка загрузки статистики');
                }
            });
        }

        // Функция загрузки папок
        function loadFolders() {
            $.ajax({
                url: '/api/stats',
                type: 'GET',
                success: function(response) {
                    console.log('Ответ API папок:', response);
                    
                    if (response.success && response.data && response.data.by_folder) {
                        const foldersContainer = $('#folders-list');
                        foldersContainer.empty();
                        
                        Object.keys(response.data.by_folder).forEach(function(folderName) {
                            const count = response.data.by_folder[folderName];
                            addFolderToSidebar(folderName, count);
                        });
                        
                        // Инициализируем обработчики для папок
                        initFolderEventHandlers();
                    } else if (response.data && response.data.by_folder) {
                        // Если нет success флага, но есть данные
                        const foldersContainer = $('#folders-list');
                        foldersContainer.empty();
                        
                        Object.keys(response.data.by_folder).forEach(function(folderName) {
                            const count = response.data.by_folder[folderName];
                            addFolderToSidebar(folderName, count);
                        });
                        
                        // Инициализируем обработчики для папок
                        initFolderEventHandlers();
                    }
                },
                error: function() {
                    console.log('Ошибка загрузки папок');
                }
            });
        }

        // Добавление папки в боковую панель (точно как на главной странице)
        function addFolderToSidebar(folderName, count, customId = null) {
            const normalizedName = folderName.toLowerCase().trim();
            const folderId = customId || ('folder-' + normalizedName.replace(/[^a-z0-9]/g, '-'));
            
            console.log('Добавление папки в сайдбар:', folderName, 'ID:', folderId);
            
            // Проверяем, существует ли уже такая папка в sidebar
            if (!customId) {
                const existingFolder = $(`#${folderId}, [data-folder-name="${normalizedName}"]`);
                if (existingFolder.length > 0) {
                    existingFolder.find('.badge').text(count);
                    console.log('Папка уже существует, обновляем счетчик:', count);
                    return;
                }
            }
            
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
        }

        // Инициализация обработчиков для папок
        function initFolderEventHandlers() {
            // Обработчик для переименования папки 
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
                            alert('Переименование папок доступно только на главной странице заметок');
                        }
                    }
                });
            });

            // Обработчик для удаления папки
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
                        alert('Удаление папок доступно только на главной странице заметок');
                    }
                });
            });

            // Обработчик для перемещения заметок в папку
            $('.move-notes-to-folder').off('click').on('click', function(e) {
                e.preventDefault();
                // Ничего не делаем - функция отключена в календаре
                return false;
            });
        }

        // Универсальное модальное окно для ввода названия папки
        function showFolderInputModal({ title, placeholder, value = '', confirmText = 'OK', onConfirm }) {
            // Удаляем старое окно, если оно есть
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

        // Универсальное модальное окно подтверждения действия
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

        // Функция для создания папки
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
                        
                        // Обновляем счетчики
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

        // Функция для отображения уведомлений
        function showNotification(message, type = 'info') {
            const alertClass = type === 'success' ? 'alert-success' : 
                             type === 'danger' ? 'alert-danger' : 
                             type === 'warning' ? 'alert-warning' : 'alert-info';
            
            const notification = $(`
                <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
                     style="top: 20px; right: 20px; z-index: 9999; max-width: 350px;">
                    <strong>${message}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `);
            
            $('body').append(notification);
            
            // Автоматически скрываем через 5 секунд
            setTimeout(() => {
                notification.fadeOut(() => {
                    notification.remove();
                });
            }, 5000);
        }
    </script>

    <!-- Модальное окно просмотрщика файлов -->
    <div class="modal fade" id="fileViewerModal" tabindex="-1" aria-labelledby="fileViewerModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="fileViewerModalLabel">Просмотр файла</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                </div>
                <div class="modal-body p-0">
                    <div class="file-viewer-container d-flex align-items-center justify-content-center position-relative">
                        <div id="file-viewer-content" class="w-100"></div>
                        <button class="btn btn-light position-absolute start-0 top-50 translate-middle-y rounded-circle ms-2 file-nav-btn" id="prev-file-btn" style="display:none">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="btn btn-light position-absolute end-0 top-50 translate-middle-y rounded-circle me-2 file-nav-btn" id="next-file-btn" style="display:none">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="modal-footer justify-content-between">
                    <div class="file-info">
                        <span id="file-name">Имя файла</span>
                        <small class="text-muted ms-2" id="file-size"></small>
                    </div>
                    <div>
                        <a href="#" class="btn btn-primary" id="download-file" download>
                            <i class="fas fa-download"></i> Скачать
                        </a>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
