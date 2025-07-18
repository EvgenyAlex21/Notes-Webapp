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
    
    <link rel="stylesheet" href="{{ asset('css/note-selection.css') }}">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <link rel="stylesheet" href="{{ asset('css/view-button.css') }}">
    <link rel="stylesheet" href="{{ asset('css/notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/unified-notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/notification-text-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/file-viewer.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-cards-uniform.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/sidebar-counters.css') }}">
    <link rel="stylesheet" href="{{ asset('css/improved-mobile.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mobile-components.css') }}">
    <link rel="stylesheet" href="{{ asset('css/avatar-unified.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js'></script>
    <script src="{{ asset('js/file-viewer.js') }}"></script>
    <script src="{{ asset('js/scroll-top.js') }}"></script>
    <script src="{{ asset('js/view-buttons.js') }}"></script>
    <script src="{{ asset('js/note-buttons-fix.js') }}"></script>
    <script src="{{ asset('js/theme-manager.js') }}"></script>
    <script src="{{ asset('js/mobile-responsive.js') }}"></script>
    <script src="{{ asset('js/advanced-mobile.js') }}"></script>
    <script src="{{ asset('js/mobile-init.js') }}"></script>
    <script src="{{ asset('js/counter-updater.js') }}"></script>
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
        
        .user-mini-avatar {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center header-mobile-container">
                <h1 class="h3 mb-0">
                    <i class="fas fa-calendar me-2"></i>
                    <span class="fw-bold full-title">Календарь</span>
                    <span class="fw-bold short-title">Календарь</span>
                </h1>
                <div class="d-flex align-items-center ms-auto header-mobile-actions">
                    <a href="/notes" class="btn btn-outline-secondary mobile-action-btn">
                        <i class="fas fa-arrow-left"></i> <span class="d-none-mobile">Назад</span>
                    </a>
                    <div class="dropdown ms-2">
                        <button class="btn btn-outline-secondary dropdown-toggle mobile-action-btn avatar-button" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            @if(Auth::user()->avatar && Auth::user()->avatar !== 'default-avatar.png')
                                <img src="{{ Auth::user()->avatar_url }}" alt="{{ Auth::user()->name }}" class="user-mini-avatar calendar-avatar">
                            @else
                                <i class="fas fa-user-circle"></i>
                            @endif
                            <span class="d-none-mobile">{{ Auth::user()->name }}</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li class="dropdown-item text-muted">{{ Auth::user()->email }}</li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a href="{{ route('profile.edit') }}" class="dropdown-item"><i class="fas fa-user-cog me-1"></i> Профиль</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="dropdown-item">
                                        <i class="fas fa-sign-out-alt me-1"></i> Выйти
                                    </button>
                                </form>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="row">
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
            
            <div class="col-md-9">
                <div class="calendar-content">
                    <div class="alert alert-info d-flex align-items-center mb-3" role="alert" style="position: relative; left: -15px; width: calc(100% + 30px); border-left: none; border-right: none; border-radius: 0; padding: 10px 20px;">
                        <i class="fas fa-info-circle me-2"></i>
                        <small style="word-break: normal; white-space: normal; overflow-wrap: break-word; display: block; width: 100%;">
                            <strong>Подсказка:</strong> Кликните по дню для создания заметки с этой датой. Кликните по событию для просмотра заметки. Используйте цветовые фильтры для отображения заметок по приоритету.
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
            
            initCalendar();
            
            
            if (typeof ThemeManager !== 'undefined') {
                ThemeManager.init();
            }
            
            
            if (typeof loadNoteCounts === 'function') {
                loadNoteCounts();
            } else {
                
                loadStats();
            }
            
            
            loadFolders();
            
            
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
            
            
            $('.sidebar-filter').on('change', function() {
                const filterValue = $(this).val();
                
                
                if (calendar) {
                    calendar.refetchEvents();
                }
            });
        });

        function initCalendar() {
            const calendarEl = document.getElementById('calendar');
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                firstDay: 1, 
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
                    
                    const noteId = info.event.id;
                    if (noteId) {
                        window.location.href = '/notes/' + noteId;
                    }
                },
                dateClick: function(info) {
                    
                    const selectedDate = info.dateStr;
                    createNoteForDate(selectedDate);
                },
                height: 'auto',
                dayMaxEvents: true,
                moreLinkClick: 'popover',
                eventDisplay: 'block',
                displayEventTime: false,
                eventDidMount: function(info) {
                    
                    $(info.el).attr('title', info.event.title);
                }
            });
            
            calendar.render();
        }

        
        function createNoteForDate(dateStr) {
            
            const url = `/notes/create?due_date=${dateStr}`;
            window.location.href = url;
        }

        
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

        
        function getContrastColor(hexColor) {
            
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

        
        function loadStats() {
            $.ajax({
                url: '/api/stats',
                type: 'GET',
                success: function(response) {
                    if (response.success && response.data) {
                        const stats = response.data;
                        
                        
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
                        
                        
                        initFolderEventHandlers();
                    } else if (response.data && response.data.by_folder) {
                        
                        const foldersContainer = $('#folders-list');
                        foldersContainer.empty();
                        
                        Object.keys(response.data.by_folder).forEach(function(folderName) {
                            const count = response.data.by_folder[folderName];
                            addFolderToSidebar(folderName, count);
                        });
                        
                        
                        initFolderEventHandlers();
                    }
                },
                error: function() {
                    console.log('Ошибка загрузки папок');
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
                            alert('Переименование папок доступно только на главной странице заметок');
                        }
                    }
                });
            });

            
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

            
            $('.move-notes-to-folder').off('click').on('click', function(e) {
                e.preventDefault();
                
                return false;
            });
        }

        
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

        
        function showNotification(message, type = 'info') {
            if (typeof window.showNotification === 'function') {
                window.showNotification(message, type, 5000);
                return;
            }
            
            const alertClass = type === 'success' ? 'alert-success' : 
                             type === 'danger' ? 'alert-danger' : 
                             type === 'warning' ? 'alert-warning' : 'alert-info';
            
            const notification = $(`
                <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
                     style="bottom: 20px; right: 20px; z-index: 9999; max-width: 350px;">
                    <strong>${message}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `);
            
            $('body').append(notification);
            
            
            setTimeout(() => {
                notification.fadeOut(() => {
                    notification.remove();
                });
            }, 5000);
        }
    </script>

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