<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ isset($trashMode) && $trashMode ? 'Корзина' : 'Список заметок' }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/note-selection.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
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
            padding: 15px;
            margin-bottom: 15px;
            transition: all 0.3s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            background-color: #fff;
            border-left: none;
            position: relative;
            border-top: 4px solid #6c757d; /* Цвет по умолчанию */
        }
        .note-item:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        .note-item.pinned {
            background-color: #fffdf7;
            border: 1px solid #ffeeba;
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
        /* Индикатор приоритета (цветная полоска сверху) */
        .note-item.default { border-top-color: #6c757d; }
        .note-item.red { border-top-color: #dc3545; }
        .note-item.green { border-top-color: #28a745; }
        .note-item.blue { border-top-color: #007bff; }
        .note-item.yellow { border-top-color: #ffc107; }
        .note-item.purple { border-top-color: #6f42c1; }
        .note-item.pink { border-top-color: #e83e8c; }
        .note-item.orange { border-top-color: #fd7e14; }
        .note-item.teal { border-top-color: #20c997; }
        .note-item.cyan { border-top-color: #17a2b8; }
        .note-item.indigo { border-top-color: #6610f2; }
        .note-item.brown { border-top-color: #8b4513; }
        .note-item.black { border-top-color: #000000; }
        .note-item.navy { border-top-color: #000080; }
        
        /* Стили для выбранных цветов в фильтрации */
        .color-option.selected {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px white, 0 0 0 4px #007bff;
        }
        
        /* Режим выбора заметок для перемещения в папку */
        .selectable-note {
            position: relative;
        }
        
        .note-selection-checkbox {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 10;
        }
        
        .note-selection-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 10;
        }
        
        .already-in-folder .note-item {
            opacity: 0.7;
        }
        
        .notes-selection-active {
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .color-picker {
            display: inline-flex;
            margin-right: 10px;
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
        
        .note-actions {
            margin-top: 15px;
        }
        .pin-badge {
            position: absolute;
            top: -5px;
            right: 10px;
            background-color: #ffc107;
            color: #212529;
            font-size: 0.8rem;
        }
        .empty-container {
            text-align: center;
            padding: 50px 0;
        }
        .empty-icon {
            font-size: 5rem;
            color: #ccc;
            margin-bottom: 20px;
        }
        .sidebar {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 20px;
            position: sticky;
            top: 20px;
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
        .search-result-item .title {
            font-weight: bold;
        }
        .search-result-item .description {
            font-size: 0.9rem;
            color: #666;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .search-result-item .search-result-tags {
            margin-top: 5px;
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .search-result-item .tag {
            font-size: 0.75rem;
            padding: 1px 6px;
            border-radius: 10px;
            background-color: #f0f0f0;
            color: #666;
            cursor: pointer;
        }
        .search-result-item .tag:hover {
            background-color: #e0e0e0;
        }
        .search-result-item .highlight {
            background-color: #ffffc0;
        }
        .search-container {
            position: relative;
            margin-bottom: 1.5rem;
        }
        .search-clear {
            opacity: 0.5;
            transition: opacity 0.2s;
        }
        .search-clear:hover {
            opacity: 1;
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
        .dark-theme .search-result-item {
            border-color: #495057;
        }
        .dark-theme .search-result-item:hover {
            background-color: #2b3035;
        }
        .dark-theme .search-result-item .description {
            color: #adb5bd;
        }
        
        /* Архивные заметки */
        .note-item.archived {
            opacity: 0.7;
            border-left-color: #6c757d;
            background-color: #f1f1f1;
        }
        .dark-theme .note-item.archived {
            background-color: #2c3034;
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
        
        /* Стили для папок */
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
        .active-folder .folder-link {
            background-color: #e9ecef;
            color: #212529;
            font-weight: bold;
        }
        .tag {
            display: inline-block;
            background-color: #e9ecef;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8rem;
            color: #495057;
            margin-right: 5px;
            margin-bottom: 5px;
        }
        .search-container {
            margin-bottom: 20px;
        }
        .filters {
            margin-bottom: 20px;
            display: flex;
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
        }
        .note-item {
            transition: transform 0.2s ease;
            overflow: hidden;
            padding-top: 15px;
            padding-bottom: 15px;
        }
        .note-item .note-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .note-item .note-status-priority {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        .note-item h4 {
            font-weight: 600;
            color: #333;
            margin: 0;
            font-size: 1.2rem;
        }
        .dark-theme .note-item h4 {
            color: #f1f3f5;
        }
        .note-item .note-meta {
            font-size: 0.8rem;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            margin-bottom: 8px;
            color: #6c757d;
        }
        .note-item .note-meta .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .note-item .tag {
            font-size: 0.75rem;
            padding: 0.15rem 0.5rem;
            background-color: #f0f0f0;
            color: #555;
            border-radius: 12px;
            display: inline-block;
            transition: all 0.2s;
            font-weight: 500;
        }
        .note-item .tag:hover {
            background-color: #e5e5e5;
            transform: translateY(-1px);
        }
        .note-item .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            align-items: center;
            margin-bottom: 10px;
        }
        .dark-theme .note-item .tag {
            background-color: #444;
            color: #ccc;
        }
        .note-item .note-content-preview {
            max-height: 150px;
            overflow: hidden;
            position: relative;
            border-top: 1px solid #f0f0f0;
            padding-top: 10px;
            margin-top: 5px;
            font-size: 0.9rem;
        }
        .dark-theme .note-item .note-content-preview {
            border-top-color: #444;
        }
        .note-item .note-content-preview.has-more::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: linear-gradient(to bottom, transparent, #fff);
            pointer-events: none;
        }
        .dark-theme .note-item .note-content-preview.has-more::after {
            background: linear-gradient(to bottom, transparent, #343a40);
        }
        .view-more-badge {
            margin-top: 10px;
            display: inline-block;
            cursor: pointer;
            padding: 5px 12px;
            border-radius: 50px;
            transition: all 0.2s;
        }
        .view-more-badge:hover {
            background-color: #0d6efd;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        #viewNoteModal .modal-content {
            border-radius: 10px;
        }
        #viewNoteModal .modal-header {
            border-bottom: 2px solid #f1f1f1;
        }
        #viewNoteModal .note-full-content {
            white-space: pre-line;
        }
        #viewNoteModal .note-meta {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            font-size: 0.9rem;
        }
        .dark-theme #viewNoteModal .modal-content {
            background-color: #343a40;
            color: #f8f9fa;
        }
        .dark-theme #viewNoteModal .modal-header {
            border-color: #495057;
        }
        .dark-theme #viewNoteModal .note-meta {
            border-color: #495057;
        }
        .dropdown-menu {
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: none;
            border-radius: 8px;
        }
        
        /* Дополнительные стили для исправления контрастности в темной теме */
        .dark-theme .text-muted {
            color: #c2c7d0 !important;
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
        .dark-theme .folder-link.active,
        .dark-theme .active-folder .folder-link {
            background-color: #4a4f55;
            color: #ffffff !important;
            font-weight: bold;
        }
        .dark-theme .dropdown-menu {
            background-color: #343a40;
            border-color: #495057;
        }
        .dark-theme .dropdown-item {
            color: #f1f3f5;
        }
        .dark-theme .dropdown-item:hover {
            background-color: #4a4f55;
            color: #ffffff;
        }
        .dark-theme .btn-outline-secondary {
            color: #c2c7d0;
            border-color: #495057;
        }
        .dark-theme .btn-outline-secondary:hover {
            background-color: #495057;
            color: #ffffff;
        }
        .dark-theme .badge {
            color: #ffffff !important;
        }
        .dark-theme .form-check-label {
            color: #f1f3f5;
        }
        
        /* Стили для выпадающих меню */
        .dropdown-menu-end {
            right: 0;
            left: auto !important;
        }
        .folder-actions .dropdown-menu {
            min-width: 200px;
            max-width: 250px;
            z-index: 1050;
        }
        /* Предотвращаем переполнение текста в меню */
        .folder-item {
            position: relative;
        }
        .folder-link {
            max-width: 180px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            display: inline-block;
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
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">
                    <i class="fas fa-sticky-note me-2"></i> 
                    <span class="fw-bold">{{ isset($trashMode) && $trashMode ? 'Корзина' : 'Заметки' }}</span>
                </h1>
                <a href="/notes/create" class="btn btn-primary d-flex align-items-center">
                    <i class="fas fa-plus me-2"></i> Создать заметку
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
                    <a href="/notes" class="sidebar-link {{ !isset($trashMode) || !$trashMode ? 'active' : '' }}">
                        <i class="fas fa-sticky-note"></i> Все заметки
                    </a>
                    <a href="/notes/archive" class="sidebar-link {{ isset($archiveMode) && $archiveMode ? 'active' : '' }}">
                        <i class="fas fa-archive"></i> Архив
                    </a>
                    <a href="/notes/trash" class="sidebar-link {{ isset($trashMode) && $trashMode ? 'active' : '' }}">
                        <i class="fas fa-trash"></i> Корзина
                    </a>
                    <a href="/notes/calendar" class="sidebar-link {{ isset($calendarMode) && $calendarMode ? 'active' : '' }}">
                        <i class="fas fa-calendar"></i> Календарь
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
                        <!-- Здесь будут отображаться папки, загруженные из базы данных -->
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
                
                <div class="note-stats mb-3">
                    <span class="badge bg-primary me-2" id="total-notes">Всего: 0</span>
                    <span class="badge bg-success me-2" id="completed-notes">Выполнено: 0</span>
                    <span class="badge bg-warning me-2" id="active-notes">Активно: 0</span>
                    <span class="badge bg-info me-2" id="pinned-notes">Закреплено: 0</span>
                </div>
                
                <div class="notes-container">
                    <!-- Сюда будут добавлены заметки с помощью JavaScript -->
                </div>
                
                <div class="empty-container d-none">
                    <div class="empty-icon">
                        <i class="{{ isset($trashMode) && $trashMode ? 'fas fa-trash' : 'fas fa-sticky-note' }}"></i>
                    </div>
                    <h3>{{ isset($trashMode) && $trashMode ? 'Корзина пуста' : 'Заметок пока нет' }}</h3>
                    <p class="text-muted">{{ isset($trashMode) && $trashMode ? 'Удаленные заметки будут появляться здесь' : 'Создайте свою первую заметку!' }}</p>
                    @if(!isset($trashMode) || !$trashMode)
                    <a href="/notes/create" class="btn btn-primary mt-3">Создать заметку</a>
                    @else
                    <a href="/notes" class="btn btn-primary mt-3">Вернуться к заметкам</a>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Инициализация данных страницы -->
    <script>
        var pageData = {
            trashMode: {{ isset($trashMode) && $trashMode ? 'true' : 'false' }},
            archiveMode: {{ isset($archiveMode) && $archiveMode ? 'true' : 'false' }},
            folderMode: {{ isset($folderMode) && $folderMode ? 'true' : 'false' }},
            folderName: {{ isset($folderName) ? '"' . $folderName . '"' : 'null' }}
        };
        console.log('Инициализированы данные страницы:', pageData);
    </script>

    <script src="/js/note-colors.js"></script>
    <script src="/js/note-counter.js"></script>
    <script src="/js/sidebar-active.js"></script>
    <script src="/js/notes.js"></script>
    <script src="/js/note-view.js"></script>
    <script src="/js/note-filters.js"></script>
    <script src="/js/tags-improvements.js"></script>
    <script src="/js/debug-search.js"></script>
    <script src="/js/robust-search.js"></script>
    <script src="/js/color-filter.js"></script>
    <script src="/js/folder-operations.js"></script>
    
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
