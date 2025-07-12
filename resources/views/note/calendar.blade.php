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
    
    <!-- Favicon с версионированием для обхода кэша -->
    <link rel="icon" href="/favicon.ico?v=1">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png?v=1">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png?v=1">
    <link rel="shortcut icon" href="/favicon.ico?v=1">
    <link rel="apple-touch-icon" href="/images/logo.png?v=1">
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.css">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/sidebar-counters.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.js"></script>
    <script src="{{ asset('js/scroll-top.js') }}"></script>
    <script src="{{ asset('js/theme-manager.js') }}"></script>
    <script src="{{ asset('js/sidebar-counters.js') }}"></script>
    <style>
        body {
            background-color: #f8f9fa;
        }
        .header {
            background-color: #fff;
            border-bottom: 1px solid #e9ecef;
            padding: 15px 0;
            margin-bottom: 30px;
        }
        .calendar-container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            padding: 20px;
            min-height: 0;
            display: block;
        }
        #calendar {
            min-height: 0;
            background: none;
            border-radius: 0;
            box-shadow: none;
            display: block;
        }
        .fc-event {
            cursor: pointer;
        }
        .fc-event-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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
        
        /* Темная тема */
        body.dark-theme {
            background-color: #212529;
            color: #f8f9fa;
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
                    <a href="/notes/calendar" class="sidebar-link d-flex justify-content-between align-items-center">
                        <div><i class="fas fa-calendar"></i> Календарь</div>
                        <span class="badge bg-secondary me-2 notes-count" id="calendar-notes-count">0</span>
                    </a>
                    <hr>
                    <div class="theme-switch" id="theme-switch">
                        <span class="d-flex align-items-center"><i class="fas fa-sun me-2"></i>Тема</span>
                        <div class="form-check form-switch ms-auto">
                            <input class="form-check-input" type="checkbox" id="theme-toggle">
                        </div>
                    </div>
                    <hr>
                    <h5 class="mb-3">Фильтры</h5>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="filter" id="filter-all" checked disabled>
                        <label class="form-check-label" for="filter-all">
                            <i class="fas fa-list"></i> Все
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="filter" id="filter-active" disabled>
                        <label class="form-check-label" for="filter-active">
                            <i class="fas fa-circle"></i> Только активные
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="filter" id="filter-completed" disabled>
                        <label class="form-check-label" for="filter-completed">
                            <i class="fas fa-check-circle"></i> Только выполненные
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="filter" id="filter-pinned" disabled>
                        <label class="form-check-label" for="filter-pinned">
                            <i class="fas fa-thumbtack"></i> Только закрепленные
                        </label>
                    </div>
                    <hr>
                    <h5 class="mb-3">Папки</h5>
                    <div id="folders-list">
                        <!-- Список папок будет загружен динамически -->
                    </div>
                    <div class="mb-3 mt-2">
                        <button id="add-folder-btn" class="btn btn-sm btn-outline-secondary w-100" disabled>
                            <i class="fas fa-plus"></i> Добавить папку
                        </button>
                    </div>
                    <hr>
                    <h5 class="mb-3">Приоритет заметки</h5>
                    <div class="color-picker d-flex flex-wrap mb-3" style="pointer-events: none; opacity: 0.7;">
                        <div class="color-option color-default selected" data-color="default" title="Без приоритета" style="width: 20px; height: 20px; margin: 0 3px; border: 2px solid #333;"></div>
                        <div class="color-option color-red" data-color="red" title="Критически важно" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-orange" data-color="orange" title="Очень важно" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-yellow" data-color="yellow" title="Важно" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-green" data-color="green" title="Средний приоритет" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-blue" data-color="blue" title="Стандартная задача" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-purple" data-color="purple" title="Планирование" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="w-100"></div>
                        <div class="color-option color-pink" data-color="pink" title="Личное" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-teal" data-color="teal" title="Идея" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-cyan" data-color="cyan" title="Информация" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-indigo" data-color="indigo" title="Обучение" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-brown" data-color="brown" title="Ожидание" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-black" data-color="black" title="Архивное" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                        <div class="color-option color-navy" data-color="navy" title="Ночное" style="width: 20px; height: 20px; margin: 0 3px;"></div>
                    </div>
                </div>
            </div>
            <!-- Основное содержимое -->
            <div class="col-lg-9">
                <div class="calendar-container">
                <div id="calendar" style="min-height:500px; border:2px dashed #007bff; display:flex; align-items:center; justify-content:center; color:#007bff; font-size:1.2rem;">
                    <!-- Календарь будет инициализирован здесь -->
                </div>
                </div>
            </div>
        </div>
    </div>
    <script src="/js/notifications.js"></script>
    <script src="/js/sidebar-counters.js"></script>
    <script src="/js/note-colors.js"></script>
    <script>
    // Глобальная функция для уведомлений (как в edit.blade.php)
    function showNotification(message, type = 'info', duration = 3000) {
        if (!$('#app-notifications').length) {
            $('body').append('<div id="app-notifications" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; width: 300px;"></div>');
        }
        let bgClass = 'bg-info';
        let textClass = 'text-dark';
        let icon = 'fas fa-info-circle';
        switch(type) {
            case 'success': bgClass = 'bg-success'; textClass = 'text-white'; icon = 'fas fa-check-circle'; break;
            case 'error': case 'danger': bgClass = 'bg-danger'; textClass = 'text-white'; icon = 'fas fa-exclamation-triangle'; break;
            case 'warning': bgClass = 'bg-warning'; textClass = 'text-dark'; icon = 'fas fa-exclamation-circle'; break;
            case 'info': bgClass = 'bg-info'; textClass = 'text-white'; icon = 'fas fa-info-circle'; break;
        }
        const notificationId = 'notification-' + Date.now();
        const notification = `
            <div id="${notificationId}" class="alert ${bgClass} ${textClass} d-flex align-items-center fade show mb-2" role="alert" 
                 style="border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative;">
                <i class="${icon} me-2" style="font-size: 1.2rem;"></i>
                <div class="flex-grow-1" style="font-size: 0.9rem;">${message}</div>
                <button type="button" class="btn-close btn-close-white ms-3" data-bs-dismiss="alert" aria-label="Close" style="font-size: 0.8rem;"></button>
            </div>
        `;
        $('#app-notifications').append(notification);
        setTimeout(function() {
            $(`#${notificationId}`).fadeOut(300, function() { $(this).remove(); });
        }, duration);
    }
    // Динамическая загрузка папок (как в edit.blade.php)
    function loadFoldersList() {
        $.ajax({
            url: '/api/folders',
            type: 'GET',
            success: function(response) {
                if (response.success && response.data) {
                    const foldersContainer = $('#folders-list');
                    foldersContainer.empty();
                    const sortedFolders = response.data.sort((a, b) => {
                        const numA = parseInt(a.name.match(/\d+/)) || 0;
                        const numB = parseInt(b.name.match(/\d+/)) || 0;
                        return numA - numB;
                    });
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
