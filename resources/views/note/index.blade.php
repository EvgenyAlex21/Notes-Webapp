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
                    <a href="/notes/trash" class="sidebar-link {{ isset($trashMode) && $trashMode ? 'active' : '' }}">
                        <i class="fas fa-trash"></i> Корзина
                    </a>
                    
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
                    
                    <h5 class="mb-3">Цвета</h5>
                    <div class="color-picker">
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
                <div class="search-container">
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" class="form-control" id="search-notes" placeholder="Поиск заметок...">
                    </div>
                </div>
                
                <div class="filters">
                    <button class="btn btn-outline-secondary filter-btn" data-filter="all">Все</button>
                    <button class="btn btn-outline-secondary filter-btn" data-filter="active">Активные</button>
                    <button class="btn btn-outline-secondary filter-btn" data-filter="completed">Выполненные</button>
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
