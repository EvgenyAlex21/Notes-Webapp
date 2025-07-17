<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Редактирование заметки</title>
    
    <link rel="icon" href="/favicon.ico?v=1">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png?v=1">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png?v=1">
    <link rel="shortcut icon" href="/favicon.ico?v=1">
    <link rel="apple-touch-icon" href="/images/logo.png?v=1">
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <link rel="stylesheet" href="{{ asset('css/notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/unified-notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/notification-text-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/file-viewer.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/sidebar-counters.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mobile-responsive.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mobile-components.css') }}">
    <link rel="stylesheet" href="{{ asset('css/improved-mobile.css') }}">
    <link rel="stylesheet" href="{{ asset('css/avatar-unified.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('js/file-viewer.js') }}"></script>
    <script src="{{ asset('js/scroll-top.js') }}"></script>
    <script src="{{ asset('js/mobile-responsive.js') }}"></script>
    <script src="{{ asset('js/advanced-mobile.js') }}"></script>
    <script src="{{ asset('js/mobile-init.js') }}"></script>
    <script src="{{ asset('js/counter-updater.js') }}"></script>
    <script>
        const originalWarn = console.warn;
        const originalError = console.error;
        
        console.warn = function() {
            if (arguments[0] && typeof arguments[0] === 'string' && 
                (arguments[0].includes('DOMNodeInserted') || 
                arguments[0].includes('mutation event') || 
                arguments[0].includes('scroll.js'))) {
                return;
            }
            originalWarn.apply(console, arguments);
        };
        
        console.error = function() {
            if (arguments[0] && typeof arguments[0] === 'string' &&
                (arguments[0].includes('Элемент модального окна просмотрщика не найден'))) {
                return console.log('[Игнорируемая ошибка]', ...arguments);
            }
            originalError.apply(console, arguments);
        };
    </script>
    <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
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
        .card {
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border: none;
        }
        .form-control:focus {
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
        }
        .color-picker {
            display: flex;
            gap: 8px;
            margin: 10px 0;
        }
        .color-option {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid #fff;
            box-shadow: 0 0 0 1px #ddd;
            transition: transform 0.2s;
        }
        .color-option:hover {
            transform: scale(1.2);
        }
        .color-option.selected {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px white, 0 0 0 4px #007bff;
        }
        .sidebar .color-option.color-default {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px white, 0 0 0 4px #007bff !important;
        }
        .sidebar .color-option:not(.color-default) {
            transform: scale(1.0) !important;
            box-shadow: 0 0 0 1px #ddd !important;
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
        .tag-input {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            padding: 5px;
            border: 1px solid #ced4da;
            border-radius: 5px;
            min-height: 38px;
            margin-bottom: 15px;
        }
        .tag {
            display: inline-flex;
            align-items: center;
            background-color: #e9ecef;
            border-radius: 15px;
            padding: 2px 10px;
            font-size: 0.85rem;
        }
        .tag .remove-tag {
            margin-left: 5px;
            cursor: pointer;
        }
        #tag-input {
            flex-grow: 1;
            border: none;
            outline: none;
            padding: 5px;
        }
        .action-buttons {
            display: flex;
            gap: 10px;
        }
        .edit-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .note-info {
            color: #6c757d;
            font-size: 0.85rem;
        }
        
        .upload-area {
            border: 2px dashed #ccc;
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .upload-area:hover, .upload-area.drag-over {
            border-color: #007bff;
            background-color: rgba(0, 123, 255, 0.05);
        }
        .border-dashed {
            border-style: dashed !important;
        }
        .file-preview-card {
            position: relative;
            overflow: hidden;
            transition: transform 0.2s;
        }
        .file-preview-card:hover {
            transform: translateY(-3px);
        }
        .file-preview-card .file-remove {
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0,0,0,0.5);
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .file-preview-card:hover .file-remove {
            opacity: 1;
        }
        .image-preview-container {
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background-color: #f8f9fa;
            position: relative;
        }
        .image-preview-container img {
            max-height: 100%;
            max-width: 100%;
            object-fit: contain;
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
        
        .folder-item {
            padding: 10px 15px;
            border-radius: 0.375rem;
            transition: background-color 0.15s ease-in-out;
            position: relative;
        }
        
        .folder-link {
            max-width: 180px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            display: inline-block;
        }
        
        .folder-item:hover {
            background-color: #f8f9fa;
        }
        
        .folder-item.active-folder {
            background-color: #e9ecef;
        }
        
        .folder-item.active-folder .folder-link {
            font-weight: bold;
            color: #212529 !important;
        }
        
        .dark-theme .folder-item:hover {
            background-color: #4a4f55;
        }
        
        .dark-theme .folder-item.active-folder {
            background-color: #4a4f55;
        }
        
        .dark-theme .folder-item.active-folder .folder-link {
            color: #ffffff !important;
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
        
        body.dark-theme {
            background-color: #212529;
            color: #f8f9fa;
        }
        .dark-theme .header {
            background-color: #343a40;
            border-bottom-color: #495057;
        }
        .dark-theme .card {
            background-color: #343a40;
            color: #f8f9fa;
        }
        .dark-theme .sidebar {
            background-color: #343a40;
            color: #f8f9fa;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .dark-theme .theme-switch {
            background-color: #495057;
        }
        .dark-theme .text-muted {
            color: #adb5bd !important;
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
        .dark-theme .form-control, 
        .dark-theme .form-select {
            background-color: #2c3034;
            color: #f8f9fa;
            border-color: #495057;
        }
        .dark-theme .form-check-label {
            color: #f1f3f5;
        }
        .dark-theme .ql-toolbar, 
        .dark-theme .ql-container {
            background-color: #2c3034;
            color: #f1f3f5;
            border-color: #495057;
        }
        .dark-theme .ql-editor.ql-blank::before {
            color: #adb5bd;
        }
        .dark-theme .ql-picker,
        .dark-theme .ql-picker-options,
        .dark-theme .ql-picker-item,
        .dark-theme .ql-picker-label {
            color: #f1f3f5 !important;
        }
        
        .action-buttons .btn {
            border-width: 2px;
            padding: 0.375rem 0.75rem;
            margin-right: 5px;
        }
        
        #done-button.btn-success {
            border: 2px solid #198754;
        }
        
        #done-button.btn-outline-primary {
            border: 2px solid #0d6efd;
        }
        
        #toggle-pin-button.active {
            background-color: #ffc107;
            color: #000;
        }
        
        #archive-button:hover {
            background-color: #6c757d;
            color: #fff;
        }
        
        .dark-theme .ql-snow .ql-stroke {
            stroke: #f1f3f5;
        }
        .dark-theme .ql-snow .ql-fill, 
        .dark-theme .ql-snow .ql-stroke.ql-fill {
            fill: #f1f3f5;
        }
        .dark-theme .tag {
            background-color: #495057;
            color: #f1f3f5;
        }
        .dark-theme .tag-input {
            border-color: #495057;
            background-color: #2c3034;
        }
        .dark-theme #tag-input {
            color: #f1f3f5;
            background-color: #2c3034;
        }
        .dark-theme .btn-light {
            background-color: #495057;
            color: #f1f3f5;
            border-color: #495057;
        }
        .dark-theme .btn-light:hover {
            background-color: #5a6268;
            color: #fff;
            border-color: #5a6268;
        }
        .dark-theme .btn-outline-secondary {
            color: #adb5bd;
            border-color: #495057;
        }
        .dark-theme .btn-outline-secondary:hover {
            background-color: #495057;
            color: #f8f9fa;
            border-color: #6c757d;
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
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0 order-1">
                    <i class="fas fa-edit me-2"></i> 
                    <span class="fw-bold">Редактирование заметки</span>
                </h1>
                <div class="d-flex align-items-center ms-auto order-2">
                    <a href="/notes" class="btn btn-outline-secondary me-2">
                        <i class="fas fa-arrow-left"></i> <span class="d-none-mobile">Назад к списку</span>
                    </a>
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle mobile-action-btn avatar-button" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            @if(Auth::user()->avatar && Auth::user()->avatar !== 'default-avatar.png')
                                <img src="{{ Auth::user()->avatar_url }}" alt="{{ Auth::user()->name }}" class="user-mini-avatar calendar-avatar">
                            @else
                                <i class="fas fa-user-circle me-1"></i>
                            @endif
                            {{ Auth::user()->name }}
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
            
            <div class="col-lg-9">
                <div class="card">
                    <div class="card-body p-4">
                        <form id="edit-note-form" method="POST" action="/notes/{{ $id }}" enctype="multipart/form-data">
                            <input type="hidden" id="note-id" value="{{ $id }}">
                            <input type="hidden" name="_method" value="PUT">
                            <input type="hidden" name="_token" value="{{ csrf_token() }}">
                            <input type="hidden" id="done" name="done" value="0">
                            <input type="hidden" id="is_pinned" name="is_pinned" value="0">
                            
                            <div class="edit-header mb-4">
                                <div>
                                    <div class="note-info">
                                        <span id="note-date"></span>
                                        <span id="note-updated" class="ms-2"></span>
                                    </div>
                                </div>
                                <div class="action-buttons">
                                    <button type="button" id="done-button" class="btn btn-outline-primary btn-sm" title="Отметить как выполненное">
                                        <i class="fas fa-check-circle"></i>
                                    </button>
                                    <button type="button" id="toggle-pin-button" class="btn btn-outline-warning btn-sm" title="Закрепить">
                                        <i class="fas fa-thumbtack"></i>
                                    </button>
                                    <button type="button" id="archive-button" class="btn btn-outline-secondary btn-sm" title="Архивировать">
                                        <i class="fas fa-archive"></i>
                                    </button>
                                    <button type="button" id="delete-button" class="btn btn-outline-danger btn-sm" title="Удалить">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="name" class="form-label fw-bold">Название</label>
                                <input type="text" class="form-control form-control-lg" id="name" required>
                            </div>
                            
                            <div class="mb-4">
                                <label for="description" class="form-label fw-bold">Описание</label>
                                <div id="editor-container" style="height: 200px; border-radius: 0.25rem;"></div>
                                <textarea class="form-control d-none" id="description" name="description" required></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Приоритет заметки</label>
                                <div class="color-picker">
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
                            
                            <div class="mb-4">
                                <label class="form-label fw-bold">Теги</label>
                                <div class="tag-input" id="tags-container">
                                    <input type="text" id="tag-input" placeholder="Добавить тег...">
                                </div>
                                <small class="text-muted">Нажмите Enter, чтобы добавить тег</small>
                            </div>
                            
                            <div class="mb-4">
                                <label class="form-label fw-bold">Прикрепить файлы</label>
                                
                                <div class="upload-area p-3 bg-light rounded border border-dashed position-relative" id="drop-area">
                                    <input type="file" class="form-control d-none" id="upload-files" name="upload_files[]" multiple>
                                    <div class="text-center py-4">
                                        <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-2"></i>
                                        <p class="mb-0">Перетащите файлы сюда или <a href="#" id="browse-files" class="text-primary">выберите файлы</a></p>
                                        <small class="text-muted d-block mt-1">Можно загружать до 10 файлов, каждый размером до 100 МБ</small>
                                    </div>
                                </div>
                                
                                <div id="file-preview" class="mt-3 row g-2"></div>
                                <div id="existing-files" class="mt-3 row g-2">
                                </div>
                                
                                <div id="files-container"></div>
                            </div>
                            
                            <input type="hidden" id="done" name="done" value="0">
                            
                            <div class="mb-4">
                                <label class="form-label fw-bold">Напоминание</label>
                                <div class="mb-2">
                                    <select class="form-select mb-2" id="reminder-type">
                                        <option value="none">Без напоминания</option>
                                        <option value="datetime">Указать дату и время</option>
                                        <option value="today">Сегодня</option>
                                        <option value="tomorrow">Завтра</option>
                                        <option value="next-week">Через неделю</option>
                                    </select>
                                </div>
                                <div id="reminder-datetime-container" style="display: none;">
                                    <input type="datetime-local" class="form-control" id="reminder-date" min="">
                                    <input type="hidden" id="reminder_at" name="reminder_at">
                                </div>
                                <div class="mt-2" id="reminder-actions" style="display: none;">
                                    <button type="button" class="btn btn-outline-danger btn-sm" id="remove-reminder">
                                        <i class="fas fa-times"></i> Удалить напоминание
                                    </button>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <div class="d-flex justify-content-end gap-2">
                                <a href="/notes" class="btn btn-light">Отмена</a>
                                <button type="submit" id="update-button" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Сохранить изменения
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

<div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-danger text-white">
                <h5 class="modal-title" id="errorModalLabel">Ошибка</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
            </div>
            <div class="modal-body">
                <div class="d-flex align-items-center mb-3">
                    <i class="fas fa-exclamation-triangle text-danger fs-1 me-3"></i>
                    <div>
                        <p id="errorModalText">Произошла ошибка при сохранении заметки.</p>
                    </div>
                </div>
                <div class="alert alert-secondary overflow-auto" style="max-height: 200px;">
                    <pre id="errorModalDetails" class="m-0" style="white-space: pre-wrap;"></pre>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                <button type="button" class="btn btn-primary" id="retryButton">Попробовать снова</button>
            </div>
        </div>
    </div>
</div>

    <script>
        function showNotification(message, type = 'info', duration = 3000) {
            // Используем глобальную функцию из notifications.js если доступна
            if (typeof window.showNotification === 'function') {
                window.showNotification(message, type, duration);
                return;
            }
            
            // Fallback с обновленными стилями 
            if (!$('#app-notifications').length) {
                $('body').append('<div id="app-notifications" class="notification-container"></div>');
            }
            
            let bgClass = 'alert-info';
            let icon = 'fas fa-info-circle';
            
            switch(type) {
                case 'success':
                    bgClass = 'alert-success';
                    icon = 'fas fa-check-circle';
                    break;
                case 'error':
                case 'danger':
                    bgClass = 'alert-danger';
                    icon = 'fas fa-exclamation-circle';
                    break;
                case 'warning':
                    bgClass = 'alert-warning';
                    icon = 'fas fa-exclamation-triangle';
                    break;
                case 'info':
                    bgClass = 'alert-info';
                    icon = 'fas fa-info-circle';
                    break;
            }
            
            const notificationId = 'notification-' + Date.now();
            
            const notification = `
                <div id="${notificationId}" class="alert ${bgClass} alert-dismissible fade show mb-2" role="alert">
                    <div class="notification-content">
                        <i class="${icon} notification-icon"></i>
                        <div class="notification-message">${message}</div>
                        <button type="button" class="notification-close-btn" data-bs-dismiss="alert" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            
            $('#app-notifications').append(notification);
            
            setTimeout(function() {
                $(`#${notificationId}`).fadeOut(300, function() {
                    $(this).remove();
                });
            }, duration);
        }
    </script>
    <script src="/js/note-colors.js"></script>
    <script src="/js/notifications.js"></script>
    <script src="/js/notes.js"></script>
    <script>
        console.log('Функция togglePin после загрузки notes.js:', typeof window.togglePin);
        if (typeof togglePin === 'function') {
            const originalTogglePin = togglePin;
            window.togglePin = function(id) {
                console.log('Вызов модифицированной функции togglePin для заметки ID:', id);
                
                const $button = $('#toggle-pin-button');
                $button.prop('disabled', true);
                
                originalTogglePin(id);
                
                setTimeout(function() {
                    $button.prop('disabled', false);
                }, 1000);
            };
            console.log('Функция togglePin сохранена глобально с дополнительной логикой');
        }
    </script>
    <script src="/js/tags-form-improvements.js"></script>
    <script src="/js/note-done-button.js"></script>
    <script src="/js/sidebar-counters.js"></script>
    <script>
        $(document).ready(function() {
            function setMinDateTime() {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                
                const minDate = `${year}-${month}-${day}T00:00`;
                $('#reminder-date').attr('min', minDate);
            }
            
            setMinDateTime();
            
            $('#reminder-date').on('input', function() {
                const selectedDateTime = new Date($(this).val());
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDateTime < today) {
                    $(this).addClass('is-invalid');
                    if (!$(this).next('.invalid-feedback').length) {
                        $(this).after('<div class="invalid-feedback">Дата не может быть раньше сегодняшнего дня</div>');
                    }
                } else {
                    $(this).removeClass('is-invalid');
                    $(this).next('.invalid-feedback').remove();
                }
            });
            
            let quill = null;
            const editorContainer = document.getElementById('editor-container');
            
            try {
                if (!editorContainer) {
                    console.error('Контейнер редактора не найден!');
                    return;
                }
                
                if (editorContainer.classList.contains('ql-container')) {
                    console.log('Редактор Quill уже был инициализирован, получаем существующий экземпляр');
                    quill = Quill.find(editorContainer);
                    if (!quill) {
                        console.warn('Не удалось найти существующий экземпляр Quill, создаем новый');
                    }
                }
                
                if (!quill) {
                    console.log('Инициализация нового редактора Quill');
                    quill = new Quill('#editor-container', {
                        modules: {
                            toolbar: [
                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['link', 'image'],
                                ['clean']
                            ]
                        },
                        placeholder: 'О чем эта заметка?',
                        theme: 'snow'
                    });
                }
                
                console.log('Редактор Quill успешно инициализирован:', !!quill);
            } catch (error) {
                console.error('Ошибка при инициализации редактора Quill:', error);
                
                if (editorContainer && !quill) {
                    console.warn('Создаем запасной textarea вместо Quill');
                    editorContainer.innerHTML = '<textarea id="fallback-editor" class="form-control" style="min-height: 300px;"></textarea>';
                    
                    const fallbackEditor = document.getElementById('fallback-editor');
                    const descriptionField = document.getElementById('description');
                    if (fallbackEditor && descriptionField) {
                        fallbackEditor.value = descriptionField.value;
                        
                        fallbackEditor.addEventListener('input', function() {
                            descriptionField.value = fallbackEditor.value;
                        });
                    }
                }
            }
            
            function setQuillContent(htmlContent) {
                try {
                    if (!quill) {
                        console.error('Невозможно установить содержимое - редактор Quill не инициализирован');
                        
                        const fallbackEditor = document.getElementById('fallback-editor');
                        if (fallbackEditor) {
                            fallbackEditor.value = htmlContent.replace(/<[^>]*>/g, ''); 
                            $('#description').val(htmlContent);
                        }
                        return;
                    }
                    
                    console.log('Устанавливаем HTML содержимое в редактор Quill');
                    quill.clipboard.dangerouslyPasteHTML(htmlContent);
                } catch (error) {
                    console.error('Ошибка при установке содержимого в Quill:', error);
                    $('#description').val(htmlContent); 
                }
            }
            
            function updateHiddenField() {
                try {
                    if (!quill) {
                        console.error('Невозможно получить содержимое - редактор Quill не инициализирован');
                        
                        const fallbackEditor = document.getElementById('fallback-editor');
                        if (fallbackEditor) {
                            $('#description').val(fallbackEditor.value);
                        }
                        return;
                    }
                    
                    var htmlContent = quill.root.innerHTML;
                    $('#description').val(htmlContent);
                } catch (error) {
                    console.error('Ошибка при получении содержимого из Quill:', error);
                }
            }
            
            $('#edit-note-form').submit(function(e) {
                var reminderVal = $('#reminder-date').val();
                if (reminderVal) {
                    var selectedDateTime = new Date(reminderVal);
                    var today = new Date();
                    today.setHours(0, 0, 0, 0); 
                    
                    if (selectedDateTime < today) {
                        e.preventDefault();
                        alert('Дата напоминания не может быть раньше сегодняшнего дня');
                        return false;
                    }
                }
                
                updateHiddenField();
            });
            
            $('#update-button').off('click').on('click', function(e) {
                e.preventDefault();
                updateHiddenField();

                if (typeof prepareFilesForUpload === 'function') {
                    prepareFilesForUpload();
                }
                
                const id = $('#note-id').val();

                const uploadInput = document.getElementById('upload-files');
                const newFilesCount = (uploadInput && uploadInput.files) ? uploadInput.files.length : 0;
                const existingFilesCount = (window.currentNoteFiles && Array.isArray(window.currentNoteFiles)) ? window.currentNoteFiles.length : 0;
                const totalFilesCount = existingFilesCount + newFilesCount;
                const maxFiles = 10;
                console.log(`Проверка файлов перед сохранением:`);
                console.log(`- Существующих файлов: ${existingFilesCount}`);
                console.log(`- Новых файлов: ${newFilesCount}`);
                console.log(`- Общее количество: ${totalFilesCount}`);
                if (totalFilesCount > maxFiles) {
                    showErrorMessage(`Превышен лимит файлов! Максимум ${maxFiles} файлов, а у вас ${totalFilesCount}. Удалите ${totalFilesCount - maxFiles} файл(ов) перед сохранением.`);
                    return;
                }

                const fileInput = $('#upload-files')[0];
                console.log('Кнопка "Сохранить изменения" нажата');
                
                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    console.log(`Выбрано ${fileInput.files.length} новых файлов для загрузки:`);
                    for (let i = 0; i < fileInput.files.length; i++) {
                        const file = fileInput.files[i];
                        console.log(`- ${file.name} (${file.size} байт, ${file.type})`);
                    }
                } else {
                    console.log('Новые файлы не выбраны');
                }
                
                if (window.currentNoteFiles && Array.isArray(window.currentNoteFiles)) {
                    console.log(`Существующие файлы: ${window.currentNoteFiles.length}`);
                } else {
                    console.log('Существующие файлы отсутствуют или некорректны:', window.currentNoteFiles);
                }
                
                const form = document.getElementById('edit-note-form');
                console.log('Форма имеет правильный enctype?', form.enctype === 'multipart/form-data');
                
                const fileInputNative = document.getElementById('upload-files');
                if (fileInputNative && fileInputNative.files && fileInputNative.files.length > 0) {
                    console.log('>> NATIVE JS: Выбрано файлов:', fileInputNative.files.length);
                    console.log('>> NATIVE JS: Имена файлов:', Array.from(fileInputNative.files).map(f => f.name));
                    
                    const validFiles = Array.from(fileInputNative.files).filter(file => 
                        file.size <= 100 * 1024 * 1024 
                    );
                    
                    if (validFiles.length !== fileInputNative.files.length) {
                        console.warn('Некоторые файлы превышают допустимый размер и будут пропущены');
                    }
                    
                    if (validFiles.length > 0) {
                        console.log(`Добавлено ${validFiles.length} файлов к форме`);
                    }
                } else {
                    console.log('>> NATIVE JS: Файлы не выбраны');
                }
                
                updateNote(id);
            });
            
            quill.on('text-change', function() {
                updateHiddenField();
            });
            
            window.setQuillContent = setQuillContent;
        });
    </script>
    <script>
        $(document).ready(function() {
            let dataLoadingInProgress = true;
            
            $('#reminder-type').on('change', function() {
                const selectedType = $(this).val();
                console.log('Изменение типа напоминания на:', selectedType, 'во время загрузки:', dataLoadingInProgress);
                
                if (dataLoadingInProgress && selectedType === 'none') {
                    console.log('Пропускаем автоматический сброс на "none" во время загрузки');
                    return;
                }
                
                console.log('Обрабатываем изменение типа напоминания на:', selectedType);
                
                const dateTimeContainer = $('#reminder-datetime-container');
                const reminderActions = $('#reminder-actions');

                switch (selectedType) {
                    case 'none':
                        dateTimeContainer.hide();
                        reminderActions.hide();
                        $('#reminder-date').val('');
                        $('#reminder_at').val(''); 
                        console.log('Скрыты поля напоминания для типа "none"');
                        break;
                    case 'datetime':
                        dateTimeContainer.show();
                        reminderActions.hide();
                        console.log('Показаны поля даты/времени для типа "datetime"');
                        break;
                    case 'today':
                        setQuickDate(0);
                        dateTimeContainer.show(); 
                        reminderActions.show();
                        console.log('Установлен тип "сегодня"');
                        break;
                    case 'tomorrow':
                        setQuickDate(1); 
                        dateTimeContainer.show(); 
                        reminderActions.show();
                        console.log('Установлен тип "завтра"');
                        break;
                    case 'next-week':
                        setQuickDate(7); 
                        dateTimeContainer.show(); 
                        reminderActions.show();
                        console.log('Установлен тип "через неделю"');
                        break;
                }
            });
            
            window.setReminderInitialized = function() {
                dataLoadingInProgress = false;
                console.log('Инициализация напоминаний завершена, все обработчики активированы');
            };
            
            function setQuickDate(daysToAdd) {
                const now = new Date();
                now.setDate(now.getDate() + daysToAdd);
                now.setHours(9, 0, 0);
                
                const currentTime = new Date();
                if (now < currentTime) {
                    now.setTime(currentTime.getTime());
                    now.setHours(now.getHours() + 1); 
                }
                
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                
                $('#reminder-date').val(`${year}-${month}-${day}T${hours}:${minutes}`);
                
                updateReminderHiddenField();
            }
            
            function updateReminderHiddenField() {
                if ($('#reminder-type').val() !== 'none' && $('#reminder-date').val()) {
                    const localDate = new Date($('#reminder-date').val());
                    const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
                    const isoString = utcDate.toISOString();
                    $('#reminder_at').val(isoString);
                    console.log('Обновлено скрытое поле напоминания:', isoString);
                } else {
                    $('#reminder_at').val('');
                    console.log('Очищено скрытое поле напоминания');
                }
            }
            
            $('#reminder-date').on('change', function() {
                updateReminderHiddenField();
            });
            
            $('#remove-reminder').off('click').on('click', function() {
                createConfirmationModal({
                    title: 'Удалить напоминание?',
                    message: 'Вы уверены, что хотите удалить напоминание?',
                    confirmButtonText: 'Удалить',
                    cancelButtonText: 'Отмена',
                    confirmButtonClass: 'btn-danger',
                    icon: 'fa-bell-slash',
                    onConfirm: function() {
                        $('#reminder-type').val('none').trigger('change');
                        $('#reminder-date').val('');
                        $('#reminder_at').val(''); 
                        $('#reminder-actions').hide();
                        if ($('#reminder-status').length) {
                            $('#reminder-status').text('Без напоминания');
                        }
                    }
                });
            });
        });
    </script>
    <script>
        function initTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                $('#theme-toggle').prop('checked', true);
            } else {
                document.body.classList.remove('dark-theme');
                $('#theme-toggle').prop('checked', false);
            }
        }
        
        function toggleTheme() {
            const isDarkMode = $('#theme-toggle').prop('checked');
            
            if (isDarkMode) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        }
        
        $(document).ready(function() {
            initTheme();
            
            $('#theme-toggle').on('change', function() {
                toggleTheme();
            });
        });
    </script>
    <script>
        function loadNoteData() {
            const noteId = $('#note-id').val();
            
            $('#update-button').html('<i class="fas fa-spinner fa-spin"></i> Загрузка...');
            $('#update-button').attr('disabled', true);
            
            $.ajax({
                url: `/api/notes/${noteId}`,
                method: 'GET',
                dataType: 'json',
                success: function(response) {
                    if (response && response.data) {
                        const note = response.data;
                        console.log('Получены данные заметки:', note);
                        console.log('Поле reminder_at:', note.reminder_at);
                        
                        $('#name').val(note.name);
                        
                        if (note.description) {
                            const editorContainer = document.getElementById('editor-container');
                            if (editorContainer) {
                                const quill = Quill.find(editorContainer);
                                if (quill) {
                                    quill.clipboard.dangerouslyPasteHTML(note.description);
                                    console.log('Содержимое редактора установлено');
                                } else {
                                    console.error('Экземпляр Quill не найден');
                                    setTimeout(function() {
                                        const newQuill = new Quill('#editor-container', {
                                            modules: {
                                                toolbar: [
                                                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ 'color': [] }, { 'background': [] }],
                                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                    ['link', 'image'],
                                                    ['clean']
                                                ]
                                            },
                                            theme: 'snow'
                                        });
                                        newQuill.clipboard.dangerouslyPasteHTML(note.description);
                                    }, 500);
                                }
                            }
                        }
                        
                        $('.color-option').removeClass('selected');
                        $(`.color-option.color-${note.color}`).addClass('selected');
                        
                        const createdAt = new Date(note.created_at);
                        const updatedAt = new Date(note.updated_at);
                        const createdDateString = formatDate(createdAt);
                        const updatedDateString = formatDate(updatedAt);
                        $('#note-date').text(`Создано: ${createdDateString}`);
                        
                        if (updatedAt.getTime() > createdAt.getTime()) {
                            $('#note-updated').text(`Обновлено: ${updatedDateString}`);
                        }
                        
                        window.initialNoteData = {
                            name: note.name,
                            description: note.description,
                            color: note.color,
                            done: note.done ? '1' : '0',
                            is_pinned: note.is_pinned ? '1' : '0',
                            tags: note.tags ? note.tags.split(',').map(tag => tag.trim()) : []
                        };
                        
                        if (note.done) {
                            $('#done').val('1');
                            isDone = true;
                        } else {
                            $('#done').val('0');
                            isDone = false;
                        }
                        
                        updateDoneButtonAppearance();
                        updateButtonText();
                        
                        if (note.is_pinned) {
                            isPinned = true;
                            $('#is_pinned').val('1');
                            $('#toggle-pin-button').removeClass('btn-outline-warning').addClass('btn-warning');
                            console.log('Заметка закреплена, активируем кнопку');
                        } else {
                            isPinned = false;
                            $('#is_pinned').val('0');
                            $('#toggle-pin-button').removeClass('btn-warning').addClass('btn-outline-warning');
                            console.log('Заметка не закреплена, деактивируем кнопку');
                        }
                        
                        $('#toggle-pin-button').html('<i class="fas fa-thumbtack"></i>');
                        updatePinButtonText();
                        
                        if (note.tags) {
                            const tags = note.tags.split(',');
                            tags.forEach(tag => {
                                addTag(tag.trim());
                            });
                        }
                        
                        console.log('Проверяем напоминание. note.reminder_at =', note.reminder_at, 'тип:', typeof note.reminder_at);
                        if (note.reminder_at && note.reminder_at !== null && note.reminder_at !== '') {
                            console.log('Загружаем напоминание:', note.reminder_at);
                            let utcDate = new Date(note.reminder_at);
                            if (isNaN(utcDate.getTime()) && typeof note.reminder_at === 'string') {
                                utcDate = new Date(note.reminder_at + 'Z'); 
                            }
                            if (!isNaN(utcDate.getTime())) {
                                const tzOffset = utcDate.getTimezoneOffset();
                                const localDate = new Date(utcDate.getTime() - tzOffset * 60000);
                                const year = localDate.getFullYear();
                                const month = String(localDate.getMonth() + 1).padStart(2, '0');
                                const day = String(localDate.getDate()).padStart(2, '0');
                                const hours = String(localDate.getHours()).padStart(2, '0');
                                const minutes = String(localDate.getMinutes()).padStart(2, '0');
                                const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
                                console.log('Дата напоминания в формате datetime-local:', datetimeLocal);

                                const now = new Date();
                                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                                const reminderDate = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
                                
                                let reminderType = 'datetime'; 
                                
                                if (reminderDate.getTime() === today.getTime()) {
                                    reminderType = 'today';
                                } else if (reminderDate.getTime() === tomorrow.getTime()) {
                                    reminderType = 'tomorrow';
                                } else if (reminderDate.getTime() === nextWeek.getTime()) {
                                    reminderType = 'week';
                                }
                                
                                console.log('Определен тип напоминания:', reminderType);

                                $('#reminder-type').val(reminderType);
                                $('#reminder-date').val(datetimeLocal);
                                $('#reminder_at').val(note.reminder_at);
                                $('#reminder-datetime-container').show();
                                $('#reminder-actions').show();
                            } else {
                                console.warn('Некорректная дата напоминания, устанавливаем "none":', note.reminder_at);
                                $('#reminder-type').val('none');
                                $('#reminder-date').val('');
                                $('#reminder-datetime-container').hide();
                                $('#reminder-actions').hide();
                            }
                        } else {
                            console.log('У заметки нет напоминания, устанавливаем none');
                            $('#reminder-type').val('none');
                            $('#reminder-date').val('');
                            $('#reminder_at').val('');
                            $('#reminder-datetime-container').hide();
                            $('#reminder-actions').hide();
                            console.log('Установлен тип "none" и скрыты поля');
                        }
                        
                        if (note.files) {
                            console.log('Загружаем файлы заметки:', note.files);
                            
                        if (typeof loadSidebarStats === 'function') {
                            setTimeout(loadSidebarStats, 200);
                        }
                            let filesArray = note.files;
                            if (typeof filesArray === 'string') {
                                try {
                                    filesArray = JSON.parse(filesArray);
                                    console.log('Файлы преобразованы из строки в массив');
                                } catch (e) {
                                    console.error('Ошибка при парсинге строки файлов:', e);
                                    filesArray = [];
                                }
                            }
                            
                            console.log('Получены файлы от сервера:', filesArray);
                            console.log('Тип данных:', typeof filesArray, Array.isArray(filesArray));
                            
                            if (typeof filesArray === 'string') {
                                try {
                                    filesArray = JSON.parse(filesArray);
                                    console.log('Преобразовали файлы из строки в массив:', filesArray);
                                } catch (e) {
                                    console.error('Ошибка при парсинге файлов из строки:', e);
                                    filesArray = [];
                                }
                            }
                            
                            window.currentNoteFiles = Array.isArray(filesArray) ? filesArray : [];
                            
                            window.currentNoteFiles = window.currentNoteFiles
                                .filter(file => {
                                    const isValid = file && typeof file === 'object' && file.name;
                                    if (!isValid) {
                                        console.warn('Игнорирую некорректный файл:', file);
                                    }
                                    return isValid;
                                })
                                .map(file => {

                                    if (!file.url && file.path) {
                                        file.url = `/storage/${file.path}`;
                                        console.log('Добавлен URL для файла:', file.name);
                                    }
                                    
                                    if (!file.type) {
                                        const ext = file.extension ? file.extension.toLowerCase() : '';
                                        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                                            file.type = 'image';
                                        } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
                                            file.type = 'video';
                                        } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
                                            file.type = 'audio';
                                        } else {
                                            file.type = 'document';
                                        }
                                        console.log('Определен тип файла:', file.name, file.type);
                                    }
                                    return file;
                                });
                            
                            displayExistingFiles(window.currentNoteFiles);

                            $('#update-button').html('<i class="fas fa-save"></i> Сохранить изменения');
                            $('#update-button').attr('disabled', false);
                            
                            dataLoadingInProgress = false;
                            console.log('Загрузка данных заметки завершена, dataLoadingInProgress = false');
                            
                            const currentReminderType = $('#reminder-type').val();
                            console.log('Текущий тип напоминания после загрузки:', currentReminderType);
                            if (currentReminderType === 'none') {
                                $('#reminder-datetime-container').hide();
                                $('#reminder-actions').hide();
                                console.log('Принудительно скрыты поля для типа "none"');
                            } else {
                                $('#reminder-datetime-container').show();
                                if (currentReminderType !== 'datetime') {
                                    $('#reminder-actions').show();
                                }
                                console.log('Показаны поля для типа:', currentReminderType);
                            }
                            
                            if (typeof window.setReminderInitialized === 'function') {
                                setTimeout(window.setReminderInitialized, 500);
                            }
                        }
                    }
                },
                    error: function(xhr) {
                        console.error('Ошибка при загрузке заметки:', xhr.responseText);
                        $('#update-button').html('<i class="fas fa-exclamation-circle"></i> Ошибка загрузки');

                        dataLoadingInProgress = false;
                        console.log('Ошибка загрузки, dataLoadingInProgress = false');
                        
                        showErrorModal('Ошибка загрузки', 'Не удалось загрузить данные заметки. Пожалуйста, попробуйте обновить страницу.');
                    }
                });
            }
            
            function formatDate(date) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                
                return `${day}.${month}.${year}, ${hours}:${minutes}`;
            }

            function addTag(tagText) {
                if (!currentTags.includes(tagText)) {
                    currentTags.push(tagText);
                    
                    const tagElement = $(`
                        <div class="tag" data-tag="${tagText}">
                            ${tagText}
                            <span class="remove-tag ms-1">&times;</span>
                        </div>
                    `);
                    
                    $('#tag-input').before(tagElement);
                    
                    tagElement.find('.remove-tag').on('click', function() {
                        const tag = $(this).parent().data('tag');
                        const index = currentTags.indexOf(tag);
                        if (index !== -1) {
                            currentTags.splice(index, 1);
                        }
                        $(this).parent().remove();
                    });
                }
            }
            
            $(document).ready(function() {
                window.currentTags = [];
                
                loadNoteData();
                
                $('#toggle-pin-button').on('click', function() {
                    if ($(this).prop('disabled')) {
                        console.log('Кнопка заблокирована, игнорируем клик');
                        return;
                    }
                    
                    const noteId = $('#note-id').val();
                    
                    $(this).prop('disabled', true);
                    
                    if (window.togglePin && typeof window.togglePin === 'function') {
                        console.log('Вызов API для закрепления заметки...');
                        window.togglePin(noteId);
                    } else {
                        console.log('API-функция не найдена, используем локальную...');
                        togglePinLocal();
                        
                        setTimeout(() => {
                            $(this).prop('disabled', false);
                        }, 1000);
                    }
                });
                
                $('#delete-button').on('click', function() {
                    const noteId = $('#note-id').val();
                    
                    createConfirmationModal({
                        title: 'Подтвердите удаление',
                        message: `
                            <div class="d-flex align-items-center">
                                <i class="fas fa-trash-alt text-danger fs-2 me-3"></i>
                                <div>
                                    <p class="fw-bold mb-1">Вы уверены, что хотите удалить эту заметку?</p>
                                    <p class="mb-0 text-muted">Это действие нельзя будет отменить.</p>
                            </div>
                        </div>
                        `,
                        confirmButtonText: 'Удалить',
                        cancelButtonText: 'Отмена',
                        confirmButtonClass: 'btn-danger',
                        icon: 'fa-trash-alt',
                        onConfirm: function() {
                            $('#delete-button').data('processing', true);
                            
                            window.removeEventListener('beforeunload', beforeUnloadHandler);
                            deleteNote(noteId);
                        }
                    });
                });
                
                $('#tag-input').on('keydown', function(e) {
                    if (e.key === 'Enter' && $(this).val().trim() !== '') {
                        e.preventDefault();
                        const tagText = $(this).val().trim();
                        addTag(tagText);
                        $(this).val('');
                    }
                });
                
                $('.color-option').on('click', function() {
                    $('.color-option').removeClass('selected');
                    $(this).addClass('selected');
                });
                
                $('#archive-button').on('click', function() {
                    const noteId = $('#note-id').val();
                    
                    createConfirmationModal({
                        title: 'Архивировать заметку?',
                        message: 'Вы уверены, что хотите переместить эту заметку в архив?',
                        confirmButtonText: 'Архивировать',
                        cancelButtonText: 'Отмена',
                        confirmButtonClass: 'btn-warning',
                        icon: 'fa-archive',
                        onConfirm: function() {
                            window.removeEventListener('beforeunload', beforeUnloadHandler);
                            
                            $('#archive-button').data('processing', true);
                            
                            $('#archive-button').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
                            
                            console.log('Отправляем запрос архивации для заметки:', noteId);
                            
                            $.ajax({
                                url: `/notes/${noteId}/archive`,
                                method: 'POST',
                                dataType: 'json',
                                headers: {
                                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            success: function(response) {
                                console.log('Заметка успешно архивирована:', response);
                                showNotification('Заметка перемещена в архив', 'success');
                                window.location.href = '/notes';
                            },
                            error: function(error) {
                                console.error('Ошибка при архивации заметки:', error);
                                console.log('Текст ошибки:', error.responseText);
                                console.log('Статус:', error.status, error.statusText);
                                
                                $('#archive-button').prop('disabled', false)
                                    .html('<i class="fas fa-archive"></i>')
                                    .data('processing', false);
                                
                                try {
                                    if (error.status === 200) {
                                        showNotification('Заметка перемещена в архив');
                                        setTimeout(function() {
                                            window.location.href = '/notes';
                                        }, 1000);
                                        return;
                                    }
                                } catch(e) {
                                    console.error('Ошибка при обработке ответа:', e);
                                }
                                
                                showNotification('Не удалось архивировать заметку: ' + error.statusText, 'error');
                                
                                window.addEventListener('beforeunload', beforeUnloadHandler);
                            }
                        });
                    }
                });
            });
        });
        
        function updateNote(id) {
            const name = $('#name').val().trim();
            const description = $('#description').val();
            const color = $('.color-option.selected').data('color') || 'default';
            const done = $('#done-checkbox').is(':checked');
            const tags = currentTags.join(',');
            
            if (!name) {
                showErrorModal('Ошибка валидации', 'Пожалуйста, введите название заметки');
                return;
            }
            
            $('#update-button').html('<i class="fas fa-spinner fa-spin"></i> Сохранение...');
            $('#update-button').attr('disabled', true);
            
            const formData = new FormData();
            
            formData.append('name', name);
            formData.append('description', description);
            formData.append('color', color);
            formData.append('done', done ? '1' : '0');
            formData.append('tags', tags);
            
            if ($('#reminder_at').length && $('#reminder_at').val()) {
                formData.append('reminder_at', $('#reminder_at').val());
                console.log('Использовано значение из скрытого поля reminder_at:', $('#reminder_at').val());
            } 
            else if ($('#reminder-type').val() !== 'none' && $('#reminder-date').val()) {
                const localValue = $('#reminder-date').val();
                const localDate = new Date(localValue);
                const utcYear = localDate.getUTCFullYear();
                const utcMonth = String(localDate.getUTCMonth() + 1).padStart(2, '0');
                const utcDay = String(localDate.getUTCDate()).padStart(2, '0');
                const utcHours = String(localDate.getUTCHours()).padStart(2, '0');
                const utcMinutes = String(localDate.getUTCMinutes()).padStart(2, '0');
                const utcSeconds = String(localDate.getUTCSeconds()).padStart(2, '0');
                const isoString = `${utcYear}-${utcMonth}-${utcDay}T${utcHours}:${utcMinutes}:${utcSeconds}`;
                formData.append('reminder_at', isoString);
                console.log('Создано значение reminder_at из поля даты:', isoString);
            } else {
                formData.append('reminder_at', '');
                console.log('Напоминание очищено (reminder_at)');
            }
            let formDataLog = {};
            for (let [key, value] of formData.entries()) {
                formDataLog[key] = value;
            }
            console.log('Отправляемые данные formData:', formDataLog);
            
            formData.append('_method', 'PUT');

            console.log('Отправляемые данные:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }               
                const uploadInput = document.getElementById('upload-files');
                if (uploadInput && uploadInput.files && uploadInput.files.length > 0) {
                    console.log('Добавляем', uploadInput.files.length, 'новых файлов к отправке');
                    
                    if (uploadInput.name !== 'upload_files[]') {
                        console.log('Корректировка имени поля для файлов:', uploadInput.name, '->', 'upload_files[]');
                        uploadInput.name = 'upload_files[]';
                    }
                    
                    for (let i = 0; i < uploadInput.files.length; i++) {
                        console.log('Добавляем файл в FormData:', uploadInput.files[i].name);
                        formData.append('upload_files[]', uploadInput.files[i]);
                    }
                    
                    let hasFiles = false;
                    for (let pair of formData.entries()) {
                        if (pair[0] === 'upload_files[]' && pair[1] instanceof File) {
                            hasFiles = true;
                            console.log('В FormData найден файл:', pair[1].name);
                        }
                    }
                    console.log('Файлы добавлены в FormData:', hasFiles);
                } else {
                    console.log('Нет новых файлов для загрузки');
                }
            
            if (window.currentNoteFiles && window.currentNoteFiles.length > 0) {
                console.log('Добавляем существующие файлы:', window.currentNoteFiles.length);
                formData.append('files', JSON.stringify(window.currentNoteFiles));
            } else {
                console.log('Нет существующих файлов для отправки');
                formData.append('files', JSON.stringify([]));
            }
            
            console.log('Полное содержимое FormData:');
            for (let pair of formData.entries()) {
                if (pair[0] === 'upload_files[]') {
                    console.log(pair[0], pair[1].name, pair[1].size + ' байт');
                } else {
                    console.log(pair[0], pair[1]);
                }
            }
            
            $.ajax({
                url: `/api/notes/${id}`,
                method: 'POST', 
                data: formData,
                processData: false, 
                contentType: false, 
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    console.log('Заметка успешно обновлена:', response);
                    $('#update-button').html('<i class="fas fa-save"></i> Сохранено!');
                    if (!window._noteSaveNotified) {
                        showNotification('Изменения сохранены', 'success');
                        window._noteSaveNotified = true;
                    }
                    setTimeout(() => {
                        window.location.href = '/notes';
                    }, 1000);
                },
                error: function(xhr) {
                    console.error('Ошибка при обновлении заметки:', xhr.responseText);
                    $('#update-button').html('<i class="fas fa-exclamation-circle"></i> Ошибка сохранения');
                    $('#update-button').attr('disabled', false);
                    
                    let errorMsg = 'Произошла ошибка при сохранении заметки.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMsg += ' ' + xhr.responseJSON.message;
                    }

                    $('#errorModalText').text(errorMsg);
                    
                    let errorDetails = '';
                    try {
                        const response = JSON.parse(xhr.responseText);
                        errorDetails = JSON.stringify(response, null, 2);
                    } catch (e) {
                        errorDetails = xhr.responseText;
                    }
                    
                    $('#errorModalDetails').text(errorDetails);
                    
                    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
                    errorModal.show();
                    
                    $('#retryButton').off('click').on('click', function() {
                        errorModal.hide();
                        updateNote(id);
                    });
                }
            });
        }

        function showErrorModal(title, message, details = '') {
            const modalId = 'errorModal' + Date.now();
            const modalHTML = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content border-0 shadow">
                            <div class="modal-header bg-danger text-white border-bottom-0">
                                <h5 class="modal-title">
                                    <i class="fas fa-exclamation-triangle me-2"></i>${title}
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                            </div>
                            <div class="modal-body p-4">
                                <p class="mb-0">${message}</p>
                                ${details ? `<div class="mt-3"><details><summary class="text-muted">Подробности</summary><pre class="text-small">${details}</pre></details></div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(modalHTML);
            const modal = new bootstrap.Modal(document.getElementById(modalId));
            modal.show();
            
            document.getElementById(modalId).addEventListener('hidden.bs.modal', function() {
                $(this).remove();
            });
        }

        let isPinModified = false;
        let hasFormChanges = false;
        
        function checkFormChanges() {
            if ($('#delete-button').data('processing') || $('#archive-button').data('processing')) {
                return false;
            }
            
            const nameChanged = initialNoteData && initialNoteData.name !== $('#name').val();
            const descriptionChanged = initialNoteData && initialNoteData.description !== quill.root.innerHTML;
            const colorChanged = initialNoteData && initialNoteData.color !== color;
            const tagsChanged = initialNoteData && JSON.stringify(initialNoteData.tags.sort()) !== JSON.stringify(getTags().sort());
            const pinChanged = initialNoteData && initialNoteData.is_pinned !== isPinned;
            
            return nameChanged || descriptionChanged || colorChanged || tagsChanged || 
                   isPinModified || pinChanged || (typeof isStatusModified !== 'undefined' && isStatusModified);
        }
        
        function showCloseConfirmationDialog(callback) {
            const modalId = 'leavePageModal_' + Date.now();
            const modalHTML = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 shadow">
                            <div class="modal-body p-4 bg-dark text-white">
                                <h5 class="mb-3">Уверены, что хотите закрыть эту страницу?</h5>
                                <p class="mb-4">Введённые вами данные могут не сохраниться.</p>
                                <div class="d-flex justify-content-end gap-2">
                                    <button type="button" class="btn btn-light px-4" id="${modalId}Confirm">Да, закрыть</button>
                                    <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">Отмена</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(modalHTML);
            const modal = new bootstrap.Modal(document.getElementById(modalId));
            modal.show();
            
            $(`#${modalId}Confirm`).on('click', function() {
                modal.hide();
                
                window.removeEventListener('beforeunload', beforeUnloadHandler);
                
                if (typeof callback === 'function') {
                    callback();
                }

                setTimeout(() => {
                    window.addEventListener('beforeunload', beforeUnloadHandler);
                }, 500);
            });

            document.getElementById(modalId).addEventListener('hidden.bs.modal', function() {
                $(this).remove();
            });
        }
        
        function showRefreshConfirmationDialog() {
            const modalId = 'refreshPageModal_' + Date.now();
            const modalHTML = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 shadow">
                            <div class="modal-body p-4 bg-dark text-white">
                                <h5 class="mb-3">Обновить страницу</h5>
                                <p class="mb-4">Вы уверены, что хотите обновить эту страницу?</p>
                                <div class="d-flex justify-content-end gap-2">
                                    <button type="button" class="btn btn-light px-4" id="${modalId}Confirm">Да, обновить</button>
                                    <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">Отмена</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(modalHTML);
            const modal = new bootstrap.Modal(document.getElementById(modalId));
            modal.show();
            
            $(`#${modalId}Confirm`).on('click', function() {
                modal.hide();
                
                window.location.reload();
            });
            
            document.getElementById(modalId).addEventListener('hidden.bs.modal', function() {
                $(this).remove();
            });
        }
        
        function beforeUnloadHandler(e) {
            const isActionInProgress = $('#delete-button').data('processing') || 
                                      $('#archive-button').data('processing');
                                     
            if (!isActionInProgress && checkFormChanges()) {
                e.preventDefault();
                e.returnValue = 'Внесенные изменения могут быть не сохранены. Вы уверены, что хотите покинуть страницу?';
                return e.returnValue;
            }
        }
        
        window.addEventListener('beforeunload', beforeUnloadHandler);
        
        $(document).on('click', 'a:not([data-no-confirm])', function(e) {
            if (checkFormChanges()) {
                e.preventDefault();
                const href = $(this).attr('href');
                
                showCloseConfirmationDialog(function() {
                    window.location.href = href;
                });
            }
        });
        
        $(document).on('keydown', function(e) {
            if (e.keyCode === 116 || (e.ctrlKey && e.keyCode === 82)) {
                if (checkFormChanges()) {
                    e.preventDefault();
                    showRefreshConfirmationDialog();
                    return false;
                }
            }
        });
        
        $('#edit-note-form').submit(function() {
            isPinModified = false;
            if (typeof isStatusModified !== 'undefined') {
                isStatusModified = false;
            }
        });
        
        let isPinned = false;
        
        function togglePinLocal() {
            if ($('#toggle-pin-button').prop('disabled')) {
                console.log('Кнопка заблокирована, пропускаем локальное переключение');
                return;
            }
            
            isPinned = !isPinned;
            
            console.log('Локальное переключение закрепления:', !isPinned, '->', isPinned);
            
            isPinModified = true;
            
            if (isPinned) {
                $('#toggle-pin-button').removeClass('btn-outline-warning').addClass('btn-warning');
            } else {
                $('#toggle-pin-button').removeClass('btn-warning').addClass('btn-outline-warning');
            }
            $('#toggle-pin-button').html('<i class="fas fa-thumbtack"></i>');
            
            $('#is_pinned').val(isPinned ? '1' : '0');
            
            updatePinButtonText(true);
        }
        
        function updatePinButtonAppearance() {
            const $button = $('#toggle-pin-button');
            
            console.log('Обновление внешнего вида кнопки закрепления, текущий статус isPinned:', isPinned);
            
            if (isPinned) {
                $button.removeClass('btn-outline-warning');
                $button.addClass('btn-warning');
                $button.html('<i class="fas fa-thumbtack"></i>'); 
            } else {
                $button.removeClass('btn-warning');
                $button.addClass('btn-outline-warning');
                $button.html('<i class="fas fa-thumbtack"></i>');
            }
        }
        
        function updatePinButtonText(showAlert = false) {
            const buttonText = isPinned ? 'Открепить' : 'Закрепить';
            $('#toggle-pin-button').attr('title', buttonText);
            
            if (showAlert) {
                const notificationMessage = isPinned ? 
                    'Заметка будет закреплена после сохранения' : 
                    'Заметка будет откреплена после сохранения';
                    
                if (typeof showNotification === 'function') {
                    showNotification(notificationMessage, isPinned ? 'warning' : 'info');
                } else {
                    alert(notificationMessage);
                }
            }
        }
        
        $('#edit-note-form').submit(function() {
            isPinModified = false;
        });
        
        function deleteNote(id) {
            $('#delete-button').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
            
            $.ajax({
                url: `/notes/${id}/trash`,
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    console.log('Заметка успешно перемещена в корзину:', response);
                    
                    if (typeof showNotification === 'function') {
                        showNotification('Заметка помещена в корзину', 'info');
                    } else {
                        alert('Заметка помещена в корзину');
                    }
                    
                    setTimeout(function() {
                        window.location.href = '/notes';
                    }, 1000);
                },
                error: function(xhr) {
                    $('#delete-button').prop('disabled', false).html('<i class="fas fa-trash"></i>');
                    
                    console.error('Ошибка при перемещении заметки в корзину:', xhr.responseText);
                    showErrorModal('Ошибка', 'Произошла ошибка при перемещении заметки в корзину', xhr.responseText);
                    
                    window.addEventListener('beforeunload', beforeUnloadHandler);
                }
            });
        }
    </script>
    <script>
        $(document).ready(function() {
            let uploadedFiles = [];
            const maxFiles = 10;
            const maxSize = 100 * 1024 * 1024; 
            
            const dropArea = document.getElementById('drop-area');
            
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                dropArea.classList.add('drag-over');
            }
            
            function unhighlight() {
                dropArea.classList.remove('drag-over');
            }
            
            dropArea.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                handleFiles(files);
            }
            
            $('#drop-area').on('click', function(e) {
                if (e.target !== this) return; 
                e.preventDefault();
                $('#upload-files').trigger('click');
            });
            
            $('#browse-files').off('click').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); 

                const uploadInput = document.getElementById('upload-files');
                if (uploadInput.name !== 'upload_files[]') {
                    console.log('Исправляем имя поля для файлов перед выбором:', uploadInput.name, '->', 'upload_files[]');
                    uploadInput.name = 'upload_files[]';
                }
                
                uploadInput.click();
            });
            
            $('#upload-files').off('change').on('change', function() {
                if (this.name !== 'upload_files[]') {
                    console.log('Исправляем имя поля для файлов после выбора:', this.name, '->', 'upload_files[]');
                    this.name = 'upload_files[]';
                }
                
                console.log('Выбрано файлов:', this.files.length);
                for (let i = 0; i < this.files.length; i++) {
                    console.log(`Выбран файл ${i+1}: ${this.files[i].name}, ${this.files[i].size} байт`);
                }
                
                handleFiles(this.files);
            });
            
            function handleFiles(files) {
                const filesArray = Array.from(files);
                
                if (filesArray.length > maxFiles) {
                    showErrorMessage(`Можно выбрать максимум ${maxFiles} файлов за раз. Выбрано: ${filesArray.length}`);
                    return;
                }
                
                const existingFilesCount = (window.currentNoteFiles && Array.isArray(window.currentNoteFiles)) ? window.currentNoteFiles.length : 0;
                const currentNewFilesCount = uploadedFiles.length;
                const totalAfterAdd = existingFilesCount + currentNewFilesCount + filesArray.length;
                
                if (totalAfterAdd > maxFiles) {
                    showErrorMessage(`Можно загрузить максимум ${maxFiles} файлов. Существующих: ${existingFilesCount}, уже выбранных новых: ${currentNewFilesCount}, пытаетесь добавить: ${filesArray.length}. Общее: ${totalAfterAdd}`);
                    return;
                }
                
                for (let i = 0; i < filesArray.length; i++) {
                    if (filesArray[i].size > maxSize) {
                        showErrorMessage(`Файл "${filesArray[i].name}" имеет размер ${(filesArray[i].size / (1024 * 1024)).toFixed(1)} МБ. Максимально допустимый размер - 100 МБ.`);
                        return;
                    }
                }
                
                filesArray.forEach(file => {
                    file.id = generateUniqueId();
                    uploadedFiles.push(file);
                });
                
                updateFilePreviews();
            }
            
            function generateUniqueId() {
                return 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            }
            
            function showErrorMessage(message) {
                createConfirmationModal({
                    title: 'Ошибка загрузки файла',
                    message: message,
                    confirmButtonText: 'Понятно',
                    cancelButtonText: '', 
                    confirmButtonClass: 'btn-primary',
                    icon: 'fa-exclamation-triangle',
                    size: 'modal-md',
                    onConfirm: function() {
                    }
                });
            }

            function updateFilePreviews() {
                const preview = $('#file-preview');
                preview.empty();
                
                uploadedFiles.forEach((file, index) => {
                    const fileType = getFileType(file.type);
                    const fileSize = (file.size / (1024 * 1024)).toFixed(1);
                    const fileId = file.id;
                    const fileUrl = URL.createObjectURL(file);
                    
                    let previewContent = '';
                    if (fileType === 'image') {
                        previewContent = `<img src="${fileUrl}" class="img-thumbnail w-100" style="height: 100px; object-fit: cover;" alt="${file.name}">`;
                    } else if (fileType === 'video') {
                        previewContent = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-film fa-2x text-danger"></i></div>`;
                    } else if (fileType === 'audio') {
                        previewContent = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-music fa-2x text-info"></i></div>`;
                    } else {
                        let iconClass = 'fa-file';
                        if (file.name) {
                            const ext = file.name.split('.').pop().toLowerCase();
                            if (ext === 'pdf') iconClass = 'fa-file-pdf';
                            else if (['doc', 'docx'].includes(ext)) iconClass = 'fa-file-word';
                            else if (['xls', 'xlsx'].includes(ext)) iconClass = 'fa-file-excel';
                            else if (['ppt', 'pptx'].includes(ext)) iconClass = 'fa-file-powerpoint';
                            else if (['zip', 'rar', 'tar', 'gz'].includes(ext)) iconClass = 'fa-file-archive';
                            else if (['txt', 'rtf'].includes(ext)) iconClass = 'fa-file-alt';
                            else if (['exe'].includes(ext)) iconClass = 'fa-cog';
                        }
                        previewContent = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas ${iconClass} fa-2x text-secondary"></i></div>`;
                    }
                    
                    const fileElement = `
                        <div class="col-md-3 col-sm-4 col-6 mb-2" id="file-item-${fileId}">
                            <div class="card h-100">
                                ${previewContent}
                                <div class="card-body p-2 text-center">
                                    <p class="card-text small text-truncate mb-1" title="${file.name}">${file.name}</p>
                                    <div class="btn-group btn-group-sm w-100">
                                        <button type="button" class="btn btn-outline-primary new-file-preview" 
                                                data-url="${fileUrl}" 
                                                data-name="${file.name}" 
                                                data-size="${file.size}" 
                                                data-type="${fileType}" 
                                                data-index="${index}" 
                                                title="Открыть файл">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button type="button" class="btn btn-outline-danger file-remove" data-file-id="${fileId}" title="Удалить файл">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    preview.append(fileElement);
                });
                
                attachFileEventHandlers();
                
                updateGlobalFilesArray();
            }
            
            function attachFileEventHandlers() {
                $('.file-remove').off('click').on('click', function(e) {
                    e.stopPropagation();
                    const fileId = $(this).data('file-id');
                    const fileName = uploadedFiles.find(file => file.id === fileId)?.name || 'файл';
                    
                    createConfirmationModal({
                        title: 'Удалить файл?',
                        message: `Вы уверены, что хотите удалить файл "${fileName}"?`,
                        confirmButtonText: 'Удалить',
                        cancelButtonText: 'Отмена',
                        confirmButtonClass: 'btn-danger',
                        icon: 'fa-trash',
                        onConfirm: function() {
                            uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
                            
                            $(`#file-item-${fileId}`).fadeOut(300, function() {
                                $(this).remove();

                                updateGlobalFilesArray();
                            });
                        }
                    });
                });
                
                console.log('Привязаны обработчики для', $('.file-remove').length, 'кнопок удаления и', $('.new-file-preview').length, 'кнопок просмотра');
            }
            
            function updateGlobalFilesArray() {
                if (typeof window !== 'undefined') {
                    window.filesList = uploadedFiles.map(file => ({
                        url: URL.createObjectURL(file),
                        name: file.name,
                        size: file.size,
                        type: getFileType(file.type)
                    }));
                    console.log('Обновлен глобальный массив файлов для галереи:', window.filesList.length, 'файлов');
                }
            }
            
            function openImagePreviewModal(fileName, imageUrl, fileId) {
                let modal = $('#imagePreviewModal');

                if (modal.length === 0) {
                    modal = $(`
                        <div class="modal fade" id="imagePreviewModal" tabindex="-1" aria-hidden="true">
                            <div class="modal-dialog modal-xl modal-dialog-centered">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title"></h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                                    </div>
                                    <div class="modal-body text-center p-0">
                                        <img src="" class="img-fluid" style="max-height: 80vh;">
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-danger" id="removeImageBtn">
                                            <i class="fas fa-trash-alt"></i> Удалить
                                        </button>
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                    
                    $('body').append(modal);
                }
                
                modal.find('.modal-title').text(fileName);
                modal.find('img').attr('src', imageUrl);
                
                modal.find('#removeImageBtn').off('click').on('click', function() {
                    createConfirmationModal({
                        title: 'Удаление файла',
                        message: `Вы уверены, что хотите удалить файл "${fileName}"?`,
                        confirmButtonText: 'Удалить',
                        cancelButtonText: 'Отмена',
                        confirmButtonClass: 'btn-danger',
                        icon: 'fa-trash',
                        onConfirm: function() {
                            uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
                            
                            $(`#file-item-${fileId}`).fadeOut(300, function() {
                                $(this).remove();
                            });
                            
                            const bsModal = bootstrap.Modal.getInstance(document.getElementById('imagePreviewModal'));
                            bsModal.hide();
                        }
                    });
                });
                
                const bsModal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
                bsModal.show();
            }
            
            function getFileType(mimeType) {
                if (mimeType.startsWith('image/')) return 'image';
                if (mimeType.startsWith('video/')) return 'video';
                if (mimeType.startsWith('audio/')) return 'audio';
                if (mimeType.startsWith('text/') || 
                    mimeType === 'application/pdf' || 
                    mimeType.includes('document') || 
                    mimeType.includes('sheet')) return 'document';
                return 'file';
            }
            
            function prepareFilesForUpload() {
                if (uploadedFiles.length > 0) {
                    const dt = new DataTransfer();
                    uploadedFiles.forEach(file => {
                        if (file instanceof File) {
                            dt.items.add(file);
                        }
                    });
                    
                    const fileInput = document.getElementById('upload-files');
                    if (fileInput) {
                        fileInput.files = dt.files;
                        console.log('Добавлено', dt.files.length, 'файлов к форме');
                    }
                }
            }
        });
    </script>
    <script>
        function displayExistingFiles(files) {
            $('#existing-files').empty();
            
            if (!Array.isArray(files) || files.length === 0) {
                console.log('Нет файлов для отображения');
                return;
            }
            
            console.log(`Отображение ${files.length} существующих файлов`);
            
            $('#existing-files').html('<h6 class="mt-2 mb-3">Прикрепленные файлы:</h6><div class="row g-2 existing-files-container"></div>');
            
            files.forEach((file, index) => {
                const fileUrl = file.url || (file.path ? `/storage/${file.path}` : null);
                if (!fileUrl) {
                    console.warn('Файл не имеет URL:', file);
                    return; 
                }
                
                let preview = '';
                if (file.type === 'image') {
                    preview = `<img src="${fileUrl}" class="img-thumbnail w-100" style="height: 100px; object-fit: cover;" alt="${file.name}" onerror="this.onerror=null;this.src='https://placehold.co/200?text=Ошибка+изображения';">`;
                } else if (file.type === 'video') {
                    preview = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-film fa-2x text-danger"></i></div>`;
                } else if (file.type === 'audio') {
                    preview = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-music fa-2x text-info"></i></div>`;
                } else {
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
                
                const fileElement = `
                    <div class="col-md-3 col-sm-4 col-6 mb-2">
                        <div class="card h-100">
                            ${preview}
                            <div class="card-body p-2 text-center">
                                <p class="card-text small text-truncate mb-1" title="${file.name}">${file.name}</p>
                                <div class="btn-group btn-group-sm w-100">
                                    <button type="button" class="btn btn-outline-primary edit-file-preview" 
                                            data-url="${fileUrl}" 
                                            data-name="${file.name}" 
                                            data-size="${file.size || 0}" 
                                            data-type="${file.type || 'file'}" 
                                            data-index="${index}" 
                                            title="Открыть файл">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-danger remove-file" data-file-path="${file.path}" data-file-name="${file.name}" title="Удалить файл">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                $('#existing-files .existing-files-container').append(fileElement);
            });
            
            setTimeout(function() {
                $('.remove-file').off('click').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const filePath = $(this).data('file-path');
                    const fileCard = $(this).closest('.col-md-3');
                    const fileName = $(this).data('file-name') || 'файл';
                    
                    console.log('Кнопка удаления нажата для файла:', fileName);
                    
                    try {
                        createConfirmationModal({
                            title: 'Удаление файла',
                            message: `Вы уверены, что хотите удалить файл "${fileName}"?`,
                            confirmButtonText: 'Удалить',
                            cancelButtonText: 'Отмена',
                            confirmButtonClass: 'btn-danger',
                            icon: 'fa-trash',
                            onConfirm: function() {
                                console.log('Подтверждено удаление файла:', fileName);
                                
                                window.currentNoteFiles = window.currentNoteFiles.filter(file => file.path !== filePath);
                                
                                fileCard.fadeOut(300, function() {
                                    $(this).remove();
                                    
                                    if (window.currentNoteFiles.length === 0) {
                                        $('#existing-files').hide();
                                    }
                                });
                            }
                        });
                    } catch (error) {
                        console.error('Ошибка при вызове createConfirmationModal:', error);
                        
                        const modalId = 'deleteFileModal_' + Date.now();
                        const modalHTML = `
                            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                                <div class="modal-dialog">
                                    <div class="modal-content">
                                        <div class="modal-header bg-warning">
                                            <h5 class="modal-title" id="${modalId}Label">Подтвердите удаление</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <p>Вы уверены, что хотите удалить файл "${fileName}"?</p>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                                            <button type="button" class="btn btn-danger" id="${modalId}Confirm">Удалить</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        $('body').append(modalHTML);
                        const modal = new bootstrap.Modal(document.getElementById(modalId));
                        modal.show();
                        
                        $(`#${modalId}Confirm`).on('click', function() {
                            modal.hide();
                            
                            window.currentNoteFiles = window.currentNoteFiles.filter(file => file.path !== filePath);
                            fileCard.fadeOut(300, function() {
                                $(this).remove();
                                if (window.currentNoteFiles.length === 0) {
                                    $('#existing-files').hide();
                                }
                            });
                        });
                    }
                });
                
                console.log('Обработчики удаления файлов привязаны для', $('.remove-file').length, 'кнопок');
            }, 100);
        }
        
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
                                    <div class="ms-auto">
                                        <span class="badge bg-secondary">${count}</span>
                                    </div>
                                </div>
                            `);
                        });
                    }
                },
                error: function() {
                    console.error('Ошибка при загрузке папок');
                }
            });
        }
        
        loadFoldersList();
        
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

        $('.sidebar .color-option').css('pointer-events', 'none');
        
        $('.sidebar .color-option.color-default').addClass('selected');
        $('.sidebar .color-option:not(.color-default)').removeClass('selected');
        
        $('.col-lg-9 .color-option, .col-md-9 .color-option').on('click', function() {
            $('.sidebar .color-option.color-default').addClass('selected');
            $('.sidebar .color-option:not(.color-default)').removeClass('selected');
        });
        
        initFileViewer();
        
        function createConfirmationModal(options) {
            const defaults = {
                id: 'confirmationModal_' + new Date().getTime(),
                title: 'Подтвердите действие',
                message: 'Вы уверены, что хотите выполнить это действие?',
                confirmButtonText: 'Да',
                cancelButtonText: 'Нет',
                confirmButtonClass: 'btn-primary',
                icon: 'fa-question-circle',
                onConfirm: null,
                size: 'modal-md',
                animation: true,
                centered: true
            };
            
            const settings = {...defaults, ...options};
            
            $(`#${settings.id}`).remove();
            
            const modalClasses = [
                'modal fade',
                settings.animation ? 'animate__animated animate__fadeIn' : '',
            ].filter(Boolean).join(' ');
            
            const dialogClasses = [
                'modal-dialog',
                settings.size,
                settings.centered ? 'modal-dialog-centered' : '',
                'modal-dialog-scrollable'
            ].filter(Boolean).join(' ');
            
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
                                ${settings.cancelButtonText ? `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-1"></i>${settings.cancelButtonText}
                                </button>` : ''}
                                <button type="button" class="btn ${settings.confirmButtonClass}" id="${settings.id}Confirm">
                                    <i class="fas fa-check me-1"></i>${settings.confirmButtonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $('body').append(modalHTML);

            const modalElement = document.getElementById(settings.id);
            const modal = new bootstrap.Modal(modalElement);
            
            $(`#${settings.id}Confirm`).on('click', function() {
                if (typeof settings.onConfirm === 'function') {
                    settings.onConfirm();
                }
                
                modal.hide();
            });
            
            modalElement.addEventListener('hidden.bs.modal', function() {
                $(modalElement).remove();
            });
            
            modal.show();
            
            return modal;
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