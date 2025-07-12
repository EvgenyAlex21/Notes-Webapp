<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ isset($trashMode) && $trashMode ? 'Корзина' : 'Список заметок' }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
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
        .note-item.default { border-left-color: #6c757d; }
        .note-item.red { border-left-color: #dc3545; }
        .note-item.green { border-left-color: #28a745; }
        .note-item.blue { border-left-color: #007bff; }
        .note-item.yellow { border-left-color: #ffc107; }
        .note-item.purple { border-left-color: #6f42c1; }
        
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
        .dropdown-menu {
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: none;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">Заметки</h1>
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
                    <a href="/notes" class="sidebar-link {{ !isset($trashMode) || !$trashMode ? 'active' : '' }}">
                        <i class="fas fa-sticky-note"></i> Все заметки
                    </a>
                    <a href="/notes/archive" class="sidebar-link {{ isset($archiveMode) && $archiveMode ? 'active' : '' }}">
                        <i class="fas fa-archive"></i> Архив
                    </a>
                    <a href="/notes/trash" class="sidebar-link {{ isset($trashMode) && $trashMode ? 'active' : '' }}">
                        <i class="fas fa-trash"></i> Корзина
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
                        <div class="color-option color-red" data-color="red" title="Важно"></div>
                        <div class="color-option color-green" data-color="green" title="Выполнено"></div>
                        <div class="color-option color-blue" data-color="blue" title="Информация"></div>
                        <div class="color-option color-yellow" data-color="yellow" title="Предупреждение"></div>
                        <div class="color-option color-purple" data-color="purple" title="Личное"></div>
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

    <script src="/js/notes.js"></script>
</body>
</html>
