<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Корзина</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/note-selection.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/sidebar-counters.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
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
        .note-item {
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            background-color: #fff;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }
        .note-item:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.15);
            transform: translateY(-2px);
        }
        .note-content {
            padding: 20px;
        }
        .note-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #333;
        }
        .note-meta {
            font-size: 0.85rem;
            color: #6c757d;
            margin-bottom: 10px;
        }
        .note-description {
            color: #333;
            margin-bottom: 15px;
        }
        .note-actions {
            margin-top: 15px;
        }
        .sidebar {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            position: sticky;
            top: 20px;
        }
        .sidebar h3 {
            font-size: 1.2rem;
            margin-bottom: 15px;
            color: #3c4858;
        }
        .sidebar-link {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            border-radius: 6px;
            color: #3c4858;
            transition: all 0.2s;
            text-decoration: none;
            margin-bottom: 5px;
            justify-content: space-between;
        }
        .sidebar-link:hover {
            background-color: #f8f9fa;
            color: #007bff;
            text-decoration: none;
        }
        .sidebar-link.active {
            background-color: #e7f5ff;
            color: #007bff;
            font-weight: 600;
        }
        .sidebar-link i {
            margin-right: 10px;
        }
        .folder-link {
            display: flex;
            align-items: center;
            padding: 8px 15px;
            border-radius: 6px;
            color: #3c4858;
            transition: all 0.2s;
            text-decoration: none;
            margin-bottom: 5px;
            justify-content: space-between;
        }
        .folder-link:hover {
            background-color: #f8f9fa;
            color: #007bff;
            text-decoration: none;
        }
        .folder-link.active {
            background-color: #e7f5ff;
            color: #007bff;
            font-weight: 600;
        }
        .empty-container {
            text-align: center;
            padding: 50px 0;
        }
        .empty-icon {
            font-size: 5rem;
            color: #adb5bd;
            margin-bottom: 20px;
        }
        .color-option {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            margin: 5px;
            cursor: pointer;
            display: inline-block;
            border: 2px solid transparent;
            transition: all 0.2s;
        }
        .color-option.selected {
            transform: scale(1.15);
            box-shadow: 0 0 0 2px #fff, 0 0 0 4px #007bff;
        }
        .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 15px;
        }
        .tag {
            background-color: #e7f5ff;
            color: #007bff;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            transition: all 0.2s;
        }
        .tag:hover {
            background-color: #d7ebff;
        }
        .remove-tag {
            margin-left: 5px;
            cursor: pointer;
        }
        .note-badge {
            position: absolute;
            top: 0;
            right: 0;
            padding: 5px 10px;
            font-size: 0.75rem;
            border-radius: 0 8px 0 8px;
        }
        .pinned {
            box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.5);
        }
        .badge-archived {
            background-color: #6c757d;
            color: white;
        }
        .note-wrapper.completed .note-item {
            border-left: 5px solid #28a745;
        }
        .note-wrapper.completed .note-title {
            text-decoration: line-through;
            opacity: 0.75;
        }
        .note-meta span {
            display: inline-flex;
            align-items: center;
            margin-right: 15px;
        }
        .note-meta i {
            margin-right: 5px;
        }
        #search-container {
            position: relative;
            margin-bottom: 20px;
        }
        #search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.15);
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
            display: none;
        }
        .search-result {
            padding: 10px 15px;
            border-bottom: 1px solid #e9ecef;
            cursor: pointer;
            transition: all 0.2s;
        }
        .search-result:hover {
            background-color: #f8f9fa;
        }
        .search-result:last-child {
            border-bottom: none;
        }
        .search-highlight {
            background-color: #ffeeba;
            padding: 0 2px;
            border-radius: 2px;
        }
        .note-files {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .file-item {
            padding: 5px 10px;
            border-radius: 5px;
            background-color: #f8f9fa;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        /* Улучшенное позиционирование выпадающего меню */
        .dropdown {
            position: relative;
        }
        .dropdown-menu {
            position: absolute;
            z-index: 1060 !important;
        }
        .note-actions .dropdown-menu {
            transform: translateY(0) !important;
            right: 0 !important;
            left: auto !important;
        }
        /* Исправление наложения выпадающих меню */
        .note-item .dropdown-menu,
        .folder-item .dropdown-menu {
            position: fixed;
            margin-top: 0;
            z-index: 1070 !important;
            max-width: 250px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        /* Предотвращение переполнения и обрезки выпадающих меню */
        .dropdown-menu.show {
            overflow: visible;
            display: block;
        }
        
        /* Стили для просмотра заметки */
        .tags-section .tag {
            font-size: 0.85rem;
            padding: 0.25rem 0.75rem;
            background-color: #e9f3ff;
            color: #0d6efd;
            border-radius: 20px;
            display: inline-block;
            transition: all 0.2s;
        }
        .dark-theme .tags-section .tag {
            background-color: #2c3844;
            color: #8cb2fb;
        }
        .note-files .file-link {
            text-decoration: none;
            transition: all 0.2s;
        }
        .note-files .file-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }
        
        /* Стили для темной темы */
        .dark-theme {
            background-color: #121212;
            color: #e0e0e0;
        }
        .dark-theme .header {
            background-color: #1e1e1e;
            border-bottom: 1px solid #333;
        }
        .dark-theme .sidebar,
        .dark-theme .note-item {
            background-color: #1e1e1e;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .dark-theme .sidebar-link {
            color: #e0e0e0;
        }
        .dark-theme .sidebar-link:hover {
            background-color: #2d2d2d;
            color: #90caf9;
        }
        .dark-theme .sidebar-link.active {
            background-color: #2c3844;
            color: #90caf9;
        }
        .dark-theme .note-title {
            color: #e0e0e0;
        }
        .dark-theme .note-description {
            color: #cccccc;
        }
        .dark-theme .badge {
            background-color: #333;
        }
        .dark-theme .search-result:hover {
            background-color: #2d2d2d;
        }
        .dark-theme #search-results {
            background-color: #1e1e1e;
            box-shadow: 0 5px 15px rgba(0,0,0,0.4);
        }
        .dark-theme .search-result {
            border-bottom: 1px solid #333;
        }
        .dark-theme .tag {
            background-color: #2c3844;
            color: #90caf9;
        }
        .dark-theme .tag:hover {
            background-color: #3a4a5c;
        }
        .dark-theme .file-item {
            background-color: #2d2d2d;
        }
        .dark-theme .dropdown-menu {
            background-color: #1e1e1e;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        }
        .dark-theme .dropdown-item {
            color: #e0e0e0;
        }
        .dark-theme .dropdown-item:hover {
            background-color: #2d2d2d;
            color: #90caf9;
        }
        .dark-theme .dropdown-divider {
            border-top: 1px solid #333;
        }
        .dark-theme .modal-content {
            background-color: #1e1e1e;
            border: 1px solid #333;
        }
        .dark-theme .modal-header,
        .dark-theme .modal-footer {
            border-color: #333;
        }
        .dark-theme .form-control {
            background-color: #2d2d2d;
            border-color: #444;
            color: #e0e0e0;
        }
        .dark-theme .form-control:focus {
            background-color: #2d2d2d;
            border-color: #444;
            color: #e0e0e0;
        }
        .dark-theme .form-control::placeholder {
            color: #aaa;
        }
        .dark-theme .folder-link {
            color: #e0e0e0;
        }
        .dark-theme .folder-link:hover {
            background-color: #2d2d2d;
            color: #90caf9;
        }
        .dark-theme .folder-link.active {
            background-color: #2c3844;
            color: #90caf9;
        }
        
        /* Вертикальная полоса приоритета */
        .priority-indicator {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 5px;
        }
        .priority-1 { background-color: #dc3545; }
        .priority-2 { background-color: #fd7e14; }
        .priority-3 { background-color: #ffc107; }
        .priority-4 { background-color: #20c997; }
        .priority-5 { background-color: #0d6efd; }
        
        /* Счетчики заметок */
        .note-counters {
            margin: 15px 0;
        }
        .note-counters .badge {
            padding: 8px 15px;
            font-size: 0.9rem;
        }
        /* Стили для кнопки добавления папки */
        .add-folder-btn {
            width: 100%;
            padding: 8px;
            margin-top: 10px;
            background-color: #f8f9fa;
            border: 1px dashed #adb5bd;
            border-radius: 6px;
            color: #6c757d;
            transition: all 0.2s;
        }
        .add-folder-btn:hover {
            background-color: #e9ecef;
            color: #495057;
        }
        .dark-theme .add-folder-btn {
            background-color: #2d2d2d;
            border-color: #495057;
            color: #adb5bd;
        }
        .dark-theme .add-folder-btn:hover {
            background-color: #3a3a3a;
            color: #e0e0e0;
        }
        
        /* Дополнительные стили для тегов в заметке */
        .note-tag {
            display: inline-block;
            padding: 3px 10px;
            margin: 3px 5px 3px 0;
            background-color: #e7f5ff;
            color: #007bff;
            border-radius: 20px;
            font-size: 0.75rem;
            transition: all 0.2s;
        }
        .dark-theme .note-tag {
            background-color: #2c3844;
            color: #90caf9;
        }
        
        /* Стили для цветовой палитры в настройках приоритета */
        .priority-colors {
            display: flex;
            flex-wrap: wrap;
            margin: 15px 0;
            justify-content: center;
        }
        .priority-color {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin: 5px;
            cursor: pointer;
            transition: all 0.2s;
            border: 2px solid transparent;
        }
        .priority-color.active {
            transform: scale(1.15);
            box-shadow: 0 0 0 2px #fff, 0 0 0 4px #007bff;
        }
        .dark-theme .priority-color.active {
            box-shadow: 0 0 0 2px #1e1e1e, 0 0 0 4px #90caf9;
        }
        
        /* Улучшенное отображение кнопок статуса заметки */
        .note-done-toggle {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            display: inline-block;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        /* Улучшенный стиль заголовка заметки */
        .note-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        .note-heading {
            margin: 0;
            padding: 0;
            flex-grow: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        /* Стили для меток папок */
        .folder-badge {
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: normal;
            background-color: #6c757d;
            color: white;
            margin-left: 8px;
            display: inline-flex;
            align-items: center;
        }
        .folder-badge i {
            font-size: 0.7rem;
            margin-right: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1><i class="fas fa-trash-alt me-2"></i> Корзина</h1>
                </div>
                <div class="col-md-6 text-end">
                    <button id="empty-trash" class="btn btn-danger">
                        <i class="fas fa-trash-alt"></i> Очистить корзину
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="row">
            <!-- Боковая панель -->
            <div class="col-md-3">
                <div class="sidebar mb-4">
                    <h3>Навигация</h3>
                    <a href="/notes" class="sidebar-link all-notes-link d-flex justify-content-between align-items-center">
                        <div><i class="fas fa-sticky-note"></i> Все заметки</div>
                        <span class="badge bg-secondary me-2 notes-count" id="all-notes-count">0</span>
                    </a>
                    <a href="/notes/archive" class="sidebar-link archive-link d-flex justify-content-between align-items-center">
                        <div><i class="fas fa-archive"></i> Архив</div>
                        <span class="badge bg-secondary me-2 notes-count" id="archive-notes-count">0</span>
                    </a>
                    <a href="/notes/trash" class="sidebar-link trash-link active d-flex justify-content-between align-items-center">
                        <div><i class="fas fa-trash-alt"></i> Корзина</div>
                        <span class="badge bg-secondary me-2 notes-count" id="trash-notes-count">0</span>
                    </a>
                    <a href="/notes/calendar" class="sidebar-link calendar-link d-flex justify-content-between align-items-center">
                        <div><i class="fas fa-calendar-alt"></i> Календарь</div>
                        <span class="badge bg-secondary me-2 notes-count" id="calendar-notes-count">0</span>
                    </a>
                    
                    <hr>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <h3>Фильтры</h3>
                    </div>
                    
                    <!-- Фильтры заметок в боковой панели -->
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebarFilter" id="filter-all" checked>
                        <label class="form-check-label" for="filter-all">
                            <i class="fas fa-layer-group me-2"></i> Все
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebarFilter" id="filter-active">
                        <label class="form-check-label" for="filter-active">
                            <i class="far fa-circle me-2"></i> Только активные
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebarFilter" id="filter-completed">
                        <label class="form-check-label" for="filter-completed">
                            <i class="fas fa-check-circle me-2"></i> Только выполненные
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input sidebar-filter" type="radio" name="sidebarFilter" id="filter-pinned">
                        <label class="form-check-label" for="filter-pinned">
                            <i class="fas fa-thumbtack me-2"></i> Только закрепленные
                        </label>
                    </div>
                    
                    <hr>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <h3>Папки</h3>
                    </div>
                    
                    <!-- Список папок будет добавлен здесь через JavaScript -->
                    <div id="folders-list">
                        <!-- Папки будут добавлены здесь динамически -->
                    </div>
                    
                    <button class="add-folder-btn" id="add-folder-btn">
                        <i class="fas fa-plus"></i> Добавить папку
                    </button>
                    
                    <hr>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <h3>Приоритет заметки</h3>
                    </div>
                    
                    <div class="priority-colors" id="priority-filter">
                        <div class="priority-color active" style="background-color: #0d6efd;" data-priority="default" title="По умолчанию"></div>
                        <div class="priority-color" style="background-color: #dc3545;" data-priority="high" title="Высокий"></div>
                        <div class="priority-color" style="background-color: #fd7e14;" data-priority="medium" title="Средний"></div>
                        <div class="priority-color" style="background-color: #ffc107;" data-priority="normal" title="Нормальный"></div>
                        <div class="priority-color" style="background-color: #20c997;" data-priority="low" title="Низкий"></div>
                        <div class="priority-color" style="background-color: #6c757d;" data-priority="none" title="Без приоритета"></div>
                    </div>
                    
                    <hr>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <h3>Тема</h3>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="theme-toggle">
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Основной контент -->
            <div class="col-md-9">
                <!-- Поиск -->
                <div id="search-container">
                    <div class="input-group mb-3">
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
                <div class="notes-container">
                    <!-- Здесь будут заметки -->
                </div>

                <!-- Пустое состояние -->
                <div class="empty-container text-center py-5 d-none">
                    <div class="empty-icon">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                    <h3>Корзина пуста</h3>
                    <p class="text-muted">Удаленные заметки будут появляться здесь</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Подключаем скрипты -->
    <script src="/js/note-update-handler.js"></script>
    <script src="/js/note-status-handler.js"></script>
    <script src="/js/notes.js"></script>
    <script src="/js/trash-handler.js"></script>
    <script src="/js/note-view.js"></script>
    <script src="/js/file-viewer.js"></script>
    <script src="/js/modal-fix.js"></script>
    <script src="/js/modal-view-fixes.js"></script>
    <script src="/js/sidebar-active.js"></script>
    <script src="/js/debug-search.js"></script>
    <script src="/js/robust-search.js"></script>
    <script src="/js/color-filter.js"></script>
    <script src="/js/folder-operations.js"></script>
    <script src="/js/folder-remove.js"></script>
    <script src="/js/accessibility-fix.js"></script>
    <script src="/js/sidebar-counters.js"></script>
    
    <!-- Модальное окно для просмотра полной заметки -->
    <div class="modal fade" id="viewNoteModal" tabindex="-1" aria-labelledby="viewNoteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="viewNoteModalLabel">Просмотр заметки</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="viewNoteContent">
                        <!-- Содержимое заметки будет загружено сюда через JavaScript -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    <a href="#" id="viewNoteEditBtn" class="btn btn-primary">Редактировать</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
