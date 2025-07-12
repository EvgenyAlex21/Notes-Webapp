<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Архив заметок</title>
    
    <!-- Favicon с версионированием для обхода кэша -->
    <link rel="icon" href="/favicon.ico?v=1">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png?v=1">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png?v=1">
    <link rel="shortcut icon" href="/favicon.ico?v=1">
    <link rel="apple-touch-icon" href="/images/logo.png?v=1">
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <link rel="stylesheet" href="{{ asset('css/view-button.css') }}">
    <link rel="stylesheet" href="{{ asset('css/notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/sidebar-counters.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('js/scroll-top.js') }}"></script>
    <script src="{{ asset('js/notifications.js') }}"></script>
    <script src="{{ asset('js/theme-manager.js') }}"></script>
    <!-- Подавляем предупреждения о устаревшем событии DOMNodeInserted в консоли -->
    <script>
        // Сохраняем оригинальную функцию console.warn
        const originalWarn = console.warn;
        
        // Переопределяем console.warn для подавления предупреждений о DOMNodeInserted
        console.warn = function() {
            // Проверяем, содержит ли предупреждение упоминание DOMNodeInserted
            if (arguments[0] && typeof arguments[0] === 'string' && 
                arguments[0].includes('DOMNodeInserted')) {
                // Игнорируем это предупреждение
                return;
            }
            // Для всех остальных предупреждений используем оригинальную функцию
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
            padding: 15px 0;
            margin-bottom: 30px;
        }
        .note-item {
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background-color: #fff;
            border-left: 5px solid #6c757d;
            position: relative;
        }
        .note-item:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.15);
            transform: translateY(-2px);
        }
        .note-item.pinned {
            border-left: 5px solid #ffc107;
            background-color: #fffdf7;
        }
        .note-item.completed {
            opacity: 0.8;
        }
        .note-done-toggle {
            cursor: pointer;
            transition: all 0.3s;
        }
        .note-done-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .sidebar {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 20px;
            position: sticky;
            top: 20px;
        }
        .tag {
            display: inline-block;
            margin-right: 5px;
            margin-bottom: 5px;
            padding: 3px 8px;
            background-color: #e9ecef;
            border-radius: 15px;
            font-size: 0.8rem;
        }
        .tag .remove-tag {
            cursor: pointer;
        }
        .color-picker {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .color-option {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
            border: 2px solid transparent;
        }
        .color-option:hover {
            transform: scale(1.1);
        }
        .color-option.selected {
            border-color: #333;
            transform: scale(1.1);
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
        .color-gray { background-color: #6c757d; }
        .note-red {
            border-left-color: #dc3545;
            background-color: #fff8f8;
        }
        .note-yellow {
            border-left-color: #ffc107;
            background-color: #fffdf8;
        }
        .note-green {
            border-left-color: #198754;
            background-color: #f8fff8;
        }
        .note-blue {
            border-left-color: #0d6efd;
            background-color: #f8f8ff;
        }
        .note-purple {
            border-left-color: #6f42c1;
            background-color: #faf8ff;
        }
        .note-orange {
            border-left-color: #fd7e14;
            background-color: #fff9f8;
        }
        .note-brown {
            border-left-color: #8b4513;
            background-color: #f9f8f8;
        }
        .note-pink {
            border-left-color: #d63384;
            background-color: #fff8fa;
        }
        .note-gray {
            border-left-color: #6c757d;
            background-color: #f8f8f8;
        }
        .note-black {
            border-left-color: #000;
            background-color: #f8f8f8;
        }
        .note-actions .btn {
            margin-bottom: 5px;
        }
        .file-link {
            text-decoration: none;
            margin-right: 5px;
            margin-bottom: 5px;
        }
        .filter-section {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            gap: 10px;
        }
        .filter-btn {
            border-radius: 20px;
            font-size: 0.9rem;
            padding: 5px 15px;
        }
        .note-description {
            white-space: pre-line;
            margin-top: 10px;
            max-height: 150px;
            overflow: hidden;
        }
        
        .formatted-content {
            overflow: hidden;
            white-space: normal;
        }
        .formatted-content h1 { font-size: 1.5rem; }
        .formatted-content h2 { font-size: 1.4rem; }
        .formatted-content h3 { font-size: 1.3rem; }
        .formatted-content h4 { font-size: 1.2rem; }
        .formatted-content h5 { font-size: 1.1rem; }
        .formatted-content ul, .formatted-content ol { padding-left: 1.5rem; }
        .formatted-content img { max-width: 100%; height: auto; }
        .dropdown-menu {
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: none;
            border-radius: 8px;
        }
        /* Счетчики заметок */
        .note-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 1rem;
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
        .dark-theme .note-item {
            background-color: #343a40;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            color: #f8f9fa;
        }
        .dark-theme .note-item.pinned {
            background-color: #3b3a30;
        }
        .dark-theme .empty-container .empty-icon {
            color: #495057;
        }
        .dark-theme .search-results {
            background-color: #343a40;
            border-color: #495057;
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
        
        .search-container {
            position: relative;
            margin-bottom: 1.5rem;
        }
        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 1000;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            max-height: 300px;
            overflow-y: auto;
            display: none;
        }
        .search-result-item {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
        }
        .search-result-item:hover {
            background-color: #f8f9fa;
        }
        .search-clear {
            opacity: 0.5;
            transition: opacity 0.2s;
        }
        .search-clear:hover {
            opacity: 1;
        }
        
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
        .dark-theme .theme-switch {
            background-color: #495057;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">Архив заметок</h1>
                <a href="/notes/create" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Создать заметку
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
                    <a href="/notes/archive" class="sidebar-link active d-flex justify-content-between align-items-center">
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
                        <span><i class="fas fa-sun"></i> Тема</span>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="theme-toggle">
                        </div>
                    </div>
                    
                    <hr>
                    
                    <h5 class="mb-3">Фильтры</h5>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" id="filter-pinned">
                        <label class="form-check-label" for="filter-pinned">
                            <i class="fas fa-thumbtack"></i> Только закрепленные
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" id="filter-completed">
                        <label class="form-check-label" for="filter-completed">
                            <i class="fas fa-check-circle"></i> Только выполненные
                        </label>
                    </div>
                    
                    <hr>
                    
                    <h5 class="mb-3">Папки</h5>
                    <div id="folders-list">
                        <!-- Здесь будут отображаться папки, загруженные из базы данных -->
                    </div>
                    <button class="btn btn-sm btn-outline-secondary w-100" id="add-folder-btn">
                        <i class="fas fa-plus"></i> Добавить папку
                    </button>
                    
                    <hr>
                    
                    <h5 class="mb-3">Цвета</h5>
                    <div class="color-picker d-flex flex-wrap gap-2 mb-3">
                        <div class="color-option color-default" data-color="default" title="По умолчанию"></div>
                        <div class="color-option color-red" data-color="red" title="Высокий приоритет"></div>
                        <div class="color-option color-yellow" data-color="yellow" title="Средний приоритет"></div>
                        <div class="color-option color-green" data-color="green" title="Низкий приоритет"></div>
                        <div class="color-option color-blue" data-color="blue" title="Информационный"></div>
                        <div class="color-option color-purple" data-color="purple" title="Личный"></div>
                        <div class="color-option color-pink" data-color="pink" title="Розовый"></div>
                        <div class="color-option color-orange" data-color="orange" title="Оранжевый"></div>
                        <div class="color-option color-teal" data-color="teal" title="Бирюзовый"></div>
                        <div class="color-option color-cyan" data-color="cyan" title="Голубой"></div>
                        <div class="color-option color-indigo" data-color="indigo" title="Индиго"></div>
                        <div class="color-option color-brown" data-color="brown" title="Коричневый"></div>
                        <div class="color-option color-black" data-color="black" title="Черный"></div>
                        <div class="color-option color-navy" data-color="navy" title="Темно-синий"></div>
                    </div>
                </div>
            </div>

            <!-- Основное содержимое -->
            <div class="col-md-9">
                <div class="search-container mb-4">
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" class="form-control" id="search-notes" placeholder="Поиск заметок..." autocomplete="off">
                        <button class="btn btn-outline-secondary search-clear" id="search-clear" type="button"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="search-results" id="search-results"></div>
                </div>
                
                <div class="filters d-flex justify-content-between align-items-center mb-4">
                    <div class="btn-group">
                        <button class="btn btn-secondary filter-btn" data-filter="all">Все</button>
                        <button class="btn btn-outline-secondary filter-btn" data-filter="active">Активные</button>
                        <button class="btn btn-outline-secondary filter-btn" data-filter="completed">Выполненные</button>
                        <button class="btn btn-outline-secondary filter-btn" data-filter="pinned">Закрепленные</button>
                    </div>
                    
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-sort"></i> Сортировка
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="sortDropdown">
                            <li><a class="dropdown-item sort-option" data-sort="date-new" href="#"><i class="fas fa-calendar-alt"></i> Сначала новые</a></li>
                            <li><a class="dropdown-item sort-option" data-sort="date-old" href="#"><i class="fas fa-calendar"></i> Сначала старые</a></li>
                            <li><a class="dropdown-item sort-option" data-sort="alpha-asc" href="#"><i class="fas fa-sort-alpha-down"></i> По алфавиту (А-Я)</a></li>
                            <li><a class="dropdown-item sort-option" data-sort="alpha-desc" href="#"><i class="fas fa-sort-alpha-up"></i> По алфавиту (Я-А)</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item sort-option" data-sort="color" href="#"><i class="fas fa-palette"></i> По цвету</a></li>
                        </ul>
                    </div>
                </div>
                
                <!-- Информация о количестве заметок (бейджи) -->
                <div class="note-counters mb-3">
                    <div class="d-flex flex-wrap gap-2">
                        <span class="badge rounded-pill text-bg-primary" id="counter-all">
                            Всего: <span class="counter-total">0</span>
                        </span>
                        <span class="badge rounded-pill text-bg-success" id="counter-done">
                            Выполнено: <span class="counter-completed">0</span>
                        </span>
                        <span class="badge rounded-pill text-bg-warning" id="counter-active">
                            Активно: <span class="counter-active">0</span>
                        </span>
                        <span class="badge rounded-pill text-bg-info" id="counter-pinned">
                            Закреплено: <span class="counter-pinned">0</span>
                        </span>
                    </div>
                </div>

                <!-- Список заметок -->
                <div id="notes-container" class="notes-container">
                    <!-- Здесь будут заметки -->
                </div>

                <!-- Пустое состояние -->
                <div class="empty-container text-center py-5 d-none" id="empty-message">
                    <div class="empty-icon">
                        <i class="fas fa-archive"></i>
                    </div>
                    <h3 class="text-muted">Архив пуст</h3>
                    <p class="text-muted">У вас нет заархивированных заметок</p>
                    <a href="/notes" class="btn btn-primary">Вернуться к заметкам</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Модальные окна и дополнительные элементы -->

    <script src="/js/note-update-handler.js"></script>
    <script src="/js/note-status-handler.js"></script>
    <script src="/js/notes.js"></script>
    <script src="/js/note-view.js"></script>
    <script src="/js/file-viewer.js"></script>
    <script src="/js/accessibility-fix.js"></script>
    <script src="/js/modal-fix.js"></script>
    <script src="/js/modal-view-fixes.js"></script>
    <script src="/js/sidebar-counters.js"></script>
</body>
</html>
