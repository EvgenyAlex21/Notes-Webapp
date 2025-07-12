<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Редактирование заметки</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <link rel="stylesheet" href="{{ asset('css/file-viewer.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('js/file-viewer.js') }}"></script>
    <script src="{{ asset('js/scroll-top.js') }}"></script>
    <!-- Подавляем предупреждения о устаревшем событии DOMNodeInserted в консоли и другие ошибки Quill -->
    <script>
        // Сохраняем оригинальную функцию console.warn
        const originalWarn = console.warn;
        
        // Переопределяем console.warn для подавления предупреждений о DOMNodeInserted
        console.warn = function() {
            // Проверяем, содержит ли предупреждение упоминание DOMNodeInserted или другие проблемы с Quill
            if (arguments[0] && typeof arguments[0] === 'string' && 
                (arguments[0].includes('DOMNodeInserted') || 
                arguments[0].includes('mutation event') || 
                arguments[0].includes('scroll.js'))) {
                // Игнорируем эти предупреждения
                return;
            }
            // Для всех остальных предупреждений используем оригинальную функцию
            originalWarn.apply(console, arguments);
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
        /* Специальный стиль для серого цвета в боковой панели, чтобы он всегда выглядел выбранным */
        .sidebar .color-option.color-default {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px white, 0 0 0 4px #007bff !important;
        }
        /* Убираем выделение для всех других цветов в боковой панели */
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
        
        /* Стили для загрузки файлов */
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
        
        /* Стили боковой панели */
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
        
        /* Темная тема */
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
        
        /* Стилизация кнопок в заголовке редактирования */
        .action-buttons .btn {
            border-width: 2px;
            padding: 0.375rem 0.75rem;
            margin-right: 5px;
        }
        
        /* Стили для кнопок */
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

    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">
                    <i class="fas fa-edit me-2"></i> 
                    <span class="fw-bold">Редактирование заметки</span>
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
                    <a href="/notes" class="sidebar-link">
                        <i class="fas fa-sticky-note"></i> Все заметки
                    </a>
                    <a href="/notes/archive" class="sidebar-link">
                        <i class="fas fa-archive"></i> Архив
                    </a>
                    <a href="/notes/trash" class="sidebar-link">
                        <i class="fas fa-trash"></i> Корзина
                    </a>
                    <a href="/notes/calendar" class="sidebar-link">
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
                <div class="card">
                    <div class="card-body p-4">
                        <form id="edit-note-form" method="POST" action="/notes/{{ $id }}" enctype="multipart/form-data">
                            <input type="hidden" id="note-id" value="{{ $id }}">
                            <input type="hidden" name="_method" value="PUT">
                            <input type="hidden" name="_token" value="{{ csrf_token() }}">
                            
                            <div class="edit-header mb-4">
                                <div>
                                    <div class="note-info">
                                        <span id="note-date"></span>
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
                                    <!-- Тут будут отображаться существующие файлы -->
                                </div>
                                
                                <!-- Контейнер для хранения файлов -->
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
                                    <input type="datetime-local" class="form-control" id="reminder-date">
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

    <!-- Модальное окно для ошибок -->
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

    <script src="/js/note-colors.js"></script>
    <script src="/js/notes.js"></script>
    <script src="/js/tags-form-improvements.js"></script>
    <script src="/js/note-done-button.js"></script>
    <script src="/js/notifications.js"></script>
    <script>
        $(document).ready(function() {
            // Улучшенная инициализация редактора с дополнительными проверками
            let quill = null;
            const editorContainer = document.getElementById('editor-container');
            
            try {
                if (!editorContainer) {
                    console.error('Контейнер редактора не найден!');
                    return;
                }
                
                // Проверяем, не инициализирован ли уже редактор
                if (editorContainer.classList.contains('ql-container')) {
                    console.log('Редактор Quill уже был инициализирован, получаем существующий экземпляр');
                    quill = Quill.find(editorContainer);
                    if (!quill) {
                        console.warn('Не удалось найти существующий экземпляр Quill, создаем новый');
                    }
                }
                
                // Если редактор не был инициализирован, создаем новый
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
                
                // Запасной вариант - простой textarea
                if (editorContainer && !quill) {
                    console.warn('Создаем запасной textarea вместо Quill');
                    editorContainer.innerHTML = '<textarea id="fallback-editor" class="form-control" style="min-height: 300px;"></textarea>';
                    
                    // Устанавливаем значение из скрытого поля
                    const fallbackEditor = document.getElementById('fallback-editor');
                    const descriptionField = document.getElementById('description');
                    if (fallbackEditor && descriptionField) {
                        fallbackEditor.value = descriptionField.value;
                        
                        // Обновляем скрытое поле при вводе
                        fallbackEditor.addEventListener('input', function() {
                            descriptionField.value = fallbackEditor.value;
                        });
                    }
                }
            }
            
            // Когда данные заметки загрузятся, установим содержимое редактора
            function setQuillContent(htmlContent) {
                try {
                    if (!quill) {
                        console.error('Невозможно установить содержимое - редактор Quill не инициализирован');
                        
                        // Запасной вариант - установка в textarea, если он есть
                        const fallbackEditor = document.getElementById('fallback-editor');
                        if (fallbackEditor) {
                            fallbackEditor.value = htmlContent.replace(/<[^>]*>/g, ''); // Удаляем HTML-теги
                            $('#description').val(htmlContent);
                        }
                        return;
                    }
                    
                    console.log('Устанавливаем HTML содержимое в редактор Quill');
                    quill.clipboard.dangerouslyPasteHTML(htmlContent);
                } catch (error) {
                    console.error('Ошибка при установке содержимого в Quill:', error);
                    $('#description').val(htmlContent); // На всякий случай сохраняем в скрытом поле
                }
            }
            
            // Функция для обновления содержимого скрытого текстового поля
            function updateHiddenField() {
                try {
                    if (!quill) {
                        console.error('Невозможно получить содержимое - редактор Quill не инициализирован');
                        
                        // Запасной вариант - получаем из textarea, если он есть
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
            
            // При отправке формы копируем HTML содержимое редактора в скрытое текстовое поле
            $('#edit-note-form').submit(function() {
                updateHiddenField();
            });
            
            // При нажатии на кнопку "Сохранить изменения"
            $('#update-button').on('click', function(e) {
                e.preventDefault();
                updateHiddenField();
                const id = $('#note-id').val();
                
                // Проверяем общее количество файлов перед отправкой
                const existingFilesCount = (window.currentNoteFiles && Array.isArray(window.currentNoteFiles)) ? window.currentNoteFiles.length : 0;
                const newFilesCount = uploadedFiles ? uploadedFiles.length : 0;
                const totalFilesCount = existingFilesCount + newFilesCount;
                
                console.log(`Проверка файлов перед сохранением:`);
                console.log(`- Существующих файлов: ${existingFilesCount}`);
                console.log(`- Новых файлов: ${newFilesCount}`);
                console.log(`- Общее количество: ${totalFilesCount}`);
                
                if (totalFilesCount > maxFiles) {
                    showErrorMessage(`Превышен лимит файлов! Максимум ${maxFiles} файлов, а у вас ${totalFilesCount}. Удалите ${totalFilesCount - maxFiles} файл(ов) перед сохранением.`);
                    return;
                }
                
                // Проверяем выбранные файлы перед отправкой
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
                
                // Проверяем существующие файлы
                if (window.currentNoteFiles && Array.isArray(window.currentNoteFiles)) {
                    console.log(`Существующие файлы: ${window.currentNoteFiles.length}`);
                } else {
                    console.log('Существующие файлы отсутствуют или некорректны:', window.currentNoteFiles);
                }
                
                // Финальная проверка формы и файлов перед отправкой
                const form = document.getElementById('edit-note-form');
                console.log('Форма имеет правильный enctype?', form.enctype === 'multipart/form-data');
                
                // Проверка загрузки файлов через чистый JavaScript для исключения jQuery-ошибок
                const fileInputNative = document.getElementById('upload-files');
                if (fileInputNative && fileInputNative.files && fileInputNative.files.length > 0) {
                    console.log('>> NATIVE JS: Выбрано файлов:', fileInputNative.files.length);
                    console.log('>> NATIVE JS: Имена файлов:', Array.from(fileInputNative.files).map(f => f.name));
                    
                    // Проверяем файлы перед отправкой
                    const validFiles = Array.from(fileInputNative.files).filter(file => 
                        file.size <= 100 * 1024 * 1024 // Не больше 100 МБ
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
            
            // Обновляем содержимое при изменении для предотвращения потери данных
            quill.on('text-change', function() {
                updateHiddenField();
            });
            
            // Создаем глобальную функцию для установки содержимого редактора
            window.setQuillContent = setQuillContent;
        });
    </script>
    <script>
        // Обработка выбора типа напоминания
        $(document).ready(function() {
            // Обработчик изменения типа напоминания
            $('#reminder-type').on('change', function() {
                const selectedType = $(this).val();
                const dateTimeContainer = $('#reminder-datetime-container');
                const reminderActions = $('#reminder-actions');
                
                switch (selectedType) {
                    case 'none':
                        dateTimeContainer.hide();
                        reminderActions.hide();
                        $('#reminder-date').val('');
                        break;
                    case 'datetime':
                        dateTimeContainer.show();
                        reminderActions.hide();
                        break;
                    case 'today':
                        setQuickDate(0); // сегодня
                        dateTimeContainer.hide();
                        reminderActions.show();
                        break;
                    case 'tomorrow':
                        setQuickDate(1); // завтра
                        dateTimeContainer.hide();
                        reminderActions.show();
                        break;
                    case 'next-week':
                        setQuickDate(7); // через неделю
                        dateTimeContainer.hide();
                        reminderActions.show();
                        break;
                }
            });
            
            // Функция для быстрой установки даты (через указанный период времени)
            function setQuickDate(daysToAdd) {
                const now = new Date();
                now.setDate(now.getDate() + daysToAdd);
                now.setHours(9, 0, 0); // Устанавливаем время на 9:00
                
                // Форматирование даты для input datetime-local
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                
                $('#reminder-date').val(`${year}-${month}-${day}T${hours}:${minutes}`);
            }
            
            // Удаление напоминания
            $('#remove-reminder').off('click').on('click', function() {
                $('#reminder-type').val('none').trigger('change');
                $('#reminder-date').val('');
                $('#reminder-actions').hide();
            });
        });
    </script>
    <script>
        // Инициализация темной темы
        function initTheme() {
            // Проверяем сохраненную тему
            const savedTheme = localStorage.getItem('theme') || 'light';
            
            // Применяем сохраненную тему
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                $('#theme-toggle').prop('checked', true);
            } else {
                document.body.classList.remove('dark-theme');
                $('#theme-toggle').prop('checked', false);
            }
        }
        
        // Переключение темной темы
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
        
        // Инициализация темы при загрузке страницы
        $(document).ready(function() {
            initTheme();
            
            // Обработчик переключения темы
            $('#theme-toggle').on('change', function() {
                toggleTheme();
            });
        });
    </script>
    <script>
        // Функция для загрузки данных заметки
        function loadNoteData() {
            const noteId = $('#note-id').val();
            
            // Отображаем спиннер или индикатор загрузки
            $('#update-button').html('<i class="fas fa-spinner fa-spin"></i> Загрузка...');
            $('#update-button').attr('disabled', true);
            
            // Запрос данных заметки
            $.ajax({
                url: `/api/notes/${noteId}`,
                method: 'GET',
                dataType: 'json',
                success: function(response) {
                    if (response && response.data) {
                        const note = response.data;
                        
                        // Заполняем поля формы
                        $('#name').val(note.name);
                        
                        // Установка описания в Quill редактор
                        if (note.description) {
                            // Сначала убедимся, что редактор инициализирован
                            const editorContainer = document.getElementById('editor-container');
                            if (editorContainer) {
                                const quill = Quill.find(editorContainer);
                                if (quill) {
                                    quill.clipboard.dangerouslyPasteHTML(note.description);
                                    console.log('Содержимое редактора установлено');
                                } else {
                                    console.error('Экземпляр Quill не найден');
                                    // Запасной вариант - инициализируем редактор заново
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
                        
                        // Выбор цвета
                        $('.color-option').removeClass('selected');
                        $(`.color-option.color-${note.color}`).addClass('selected');
                        
                        // Отображаем дату создания/обновления
                        const createdAt = new Date(note.created_at);
                        const updatedAt = new Date(note.updated_at);
                        const dateString = formatDate(createdAt);
                        $('#note-date').text(`Создано: ${dateString}`);
                        
                        // Если заметка завершена, отмечаем состояние кнопки и скрытого поля
                        if (note.done) {
                            $('#done').val('1');
                            isDone = true;
                        } else {
                            $('#done').val('0');
                            isDone = false;
                        }
                        
                        // Обновляем вид кнопки "Выполнено"
                        updateDoneButtonAppearance();
                        updateButtonText();
                        
                        // Если заметка закреплена, обновляем кнопку
                        if (note.is_pinned) {
                            $('#toggle-pin-button').addClass('active').html('<i class="fas fa-thumbtack"></i>');
                        } else {
                            $('#toggle-pin-button').removeClass('active').html('<i class="fas fa-thumbtack"></i>');
                        }
                        
                        // Загружаем теги если они есть
                        if (note.tags) {
                            const tags = note.tags.split(',');
                            tags.forEach(tag => {
                                addTag(tag.trim());
                            });
                        }
                        
                        // Загружаем файлы, если они есть
                        if (note.files) {
                            console.log('Загружаем файлы заметки:', note.files);
                            // Убедимся, что файлы в формате массива
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
                            
                            // Сохраняем для дальнейшего использования
                            console.log('Получены файлы от сервера:', filesArray);
                            console.log('Тип данных:', typeof filesArray, Array.isArray(filesArray));
                            
                            // Если файлы пришли как строка, преобразуем в массив
                            if (typeof filesArray === 'string') {
                                try {
                                    filesArray = JSON.parse(filesArray);
                                    console.log('Преобразовали файлы из строки в массив:', filesArray);
                                } catch (e) {
                                    console.error('Ошибка при парсинге файлов из строки:', e);
                                    filesArray = [];
                                }
                            }
                            
                            // Гарантируем, что всегда работаем с массивом
                            window.currentNoteFiles = Array.isArray(filesArray) ? filesArray : [];
                            
                            // Проверяем и дополняем информацию о файлах
                            window.currentNoteFiles = window.currentNoteFiles
                                .filter(file => {
                                    // Оставляем только корректные объекты файлов
                                    const isValid = file && typeof file === 'object' && file.name;
                                    if (!isValid) {
                                        console.warn('Игнорирую некорректный файл:', file);
                                    }
                                    return isValid;
                                })
                                .map(file => {
                                    // Обогащаем файлы дополнительной информацией
                                    
                                    // Обрабатываем URL файла, если его нет
                                    if (!file.url && file.path) {
                                        file.url = `/storage/${file.path}`;
                                        console.log('Добавлен URL для файла:', file.name);
                                    }
                                    
                                    // Определяем тип файла, если он не указан
                                    if (!file.type) {
                                        // Определяем тип по расширению
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
                            
                            console.log('Файлы сохранены в currentNoteFiles:', window.currentNoteFiles);
                            displayExistingFiles(window.currentNoteFiles);
                        } else {
                            console.log('У заметки нет файлов или они в неправильном формате');
                            window.currentNoteFiles = [];
                        }
                        
                        // Восстанавливаем кнопку сохранения
                        $('#update-button').html('<i class="fas fa-save"></i> Сохранить изменения');
                        $('#update-button').attr('disabled', false);
                    }
                },
                error: function(xhr) {
                    console.error('Ошибка при загрузке заметки:', xhr.responseText);
                    $('#update-button').html('<i class="fas fa-exclamation-circle"></i> Ошибка загрузки');
                    
                    // Отображаем сообщение об ошибке
                    alert('Не удалось загрузить данные заметки. Пожалуйста, попробуйте обновить страницу.');
                }
            });
        }
        
        // Функция для форматирования даты
        function formatDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${day}.${month}.${year}, ${hours}:${minutes}`;
        }
        
        // Функция для добавления тега
        function addTag(tagText) {
            // Проверяем, что такой тег еще не добавлен
            if (!currentTags.includes(tagText)) {
                currentTags.push(tagText);
                
                // Создаем элемент тега
                const tagElement = $(`
                    <div class="tag" data-tag="${tagText}">
                        ${tagText}
                        <span class="remove-tag ms-1">&times;</span>
                    </div>
                `);
                
                // Добавляем перед input
                $('#tag-input').before(tagElement);
                
                // Обработчик для удаления тега
                tagElement.find('.remove-tag').on('click', function() {
                    const tag = $(this).parent().data('tag');
                    // Удаляем из массива
                    const index = currentTags.indexOf(tag);
                    if (index !== -1) {
                        currentTags.splice(index, 1);
                    }
                    // Удаляем элемент из DOM
                    $(this).parent().remove();
                });
            }
        }
        
        // Загружаем данные заметки при загрузке страницы
        $(document).ready(function() {
            // Инициализируем глобальный массив тегов
            window.currentTags = [];
            
            // Загружаем данные заметки
            loadNoteData();
            
            // Обработчик для кнопки закрепления
            $('#toggle-pin-button').on('click', function() {
                const noteId = $('#note-id').val();
                togglePin(noteId);
            });
            
            // Обработчик для кнопки удаления
            $('#delete-button').on('click', function() {
                const noteId = $('#note-id').val();
                
                if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
                    deleteNote(noteId);
                }
            });
            
            // Обработчик ввода тегов
            $('#tag-input').on('keydown', function(e) {
                if (e.key === 'Enter' && $(this).val().trim() !== '') {
                    e.preventDefault();
                    const tagText = $(this).val().trim();
                    addTag(tagText);
                    $(this).val('');
                }
            });
            
            // Обработчик для выбора цвета
            $('.color-option').on('click', function() {
                $('.color-option').removeClass('selected');
                $(this).addClass('selected');
            });
            
            // Обработчик кнопки архивации
            $('#archive-button').on('click', function() {
                const noteId = $('#note-id').val();
                
                if (confirm('Вы уверены, что хотите архивировать заметку?')) {
                    // Показываем индикатор загрузки
                    $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
                    
                    $.ajax({
                        url: `/notes/${noteId}/archive`,
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        success: function(response) {
                            showNotification('Заметка перемещена в архив');
                            // Перенаправляем на список заметок
                            setTimeout(function() {
                                window.location.href = '/notes';
                            }, 1000);
                        },
                        error: function(error) {
                            console.error('Ошибка при архивации заметки:', error);
                            $('#archive-button').prop('disabled', false).html('<i class="fas fa-archive"></i> Архивировать');
                            showNotification('Не удалось архивировать заметку', 'error');
                        }
                    });
                }
            });
        });
        
        // Функция для обновления заметки
        function updateNote(id) {
            // Собираем данные формы
            const name = $('#name').val().trim();
            const description = $('#description').val();
            const color = $('.color-option.selected').data('color') || 'default';
            const done = $('#done-checkbox').is(':checked');
            const tags = currentTags.join(',');
            
            // Проверка обязательных полей
            if (!name) {
                alert('Пожалуйста, введите название заметки');
                return;
            }
            
            // Отображаем индикатор загрузки
            $('#update-button').html('<i class="fas fa-spinner fa-spin"></i> Сохранение...');
            $('#update-button').attr('disabled', true);
            
            // Очень важно! Создаем объект FormData для корректной отправки данных
            const formData = new FormData();
            
            // Добавляем базовые поля
            formData.append('name', name);
            formData.append('description', description);
            formData.append('color', color);
            formData.append('done', done ? '1' : '0');
            formData.append('tags', tags);
            
            // Добавляем дату напоминания, если она есть
            if ($('#reminder-type').val() !== 'none' && $('#reminder-date').val()) {
                formData.append('reminder_date', $('#reminder-date').val());
            }
            
            // Добавляем метод PUT, так как FormData не поддерживает его напрямую
            formData.append('_method', 'PUT');
            
            // ВАЖНО: НЕ добавляем поля version_history и formatted_description,
            // так как они могут отсутствовать в базе данных и вызывать ошибку 500
            
            // Для отладки
            console.log('Отправляемые данные:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }                // Добавляем загруженные файлы в formData
                const uploadInput = document.getElementById('upload-files');
                if (uploadInput && uploadInput.files && uploadInput.files.length > 0) {
                    console.log('Добавляем', uploadInput.files.length, 'новых файлов к отправке');
                    
                    // Проверим, что имя поля правильное для множественной загрузки
                    if (uploadInput.name !== 'upload_files[]') {
                        console.log('Корректировка имени поля для файлов:', uploadInput.name, '->', 'upload_files[]');
                        uploadInput.name = 'upload_files[]';
                    }
                    
                    // Добавляем каждый файл отдельно с именем upload_files[]
                    for (let i = 0; i < uploadInput.files.length; i++) {
                        console.log('Добавляем файл в FormData:', uploadInput.files[i].name);
                        formData.append('upload_files[]', uploadInput.files[i]);
                    }
                    
                    // Для отладки проверим что файлы есть в FormData
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
            
            // Добавляем существующие файлы как JSON
            if (window.currentNoteFiles && window.currentNoteFiles.length > 0) {
                console.log('Добавляем существующие файлы:', window.currentNoteFiles.length);
                // Исправляем проблему - убеждаемся, что files передаётся как массив
                formData.append('files', JSON.stringify(window.currentNoteFiles));
            } else {
                console.log('Нет существующих файлов для отправки');
                formData.append('files', JSON.stringify([]));
            }
            
            // Отладка - покажем все содержимое FormData
            console.log('Полное содержимое FormData:');
            for (let pair of formData.entries()) {
                if (pair[0] === 'upload_files[]') {
                    console.log(pair[0], pair[1].name, pair[1].size + ' байт');
                } else {
                    console.log(pair[0], pair[1]);
                }
            }
            
            // Отправляем AJAX запрос
            $.ajax({
                url: `/api/notes/${id}`,
                method: 'POST', // Используем POST с _method=PUT для совместимости
                data: formData,
                processData: false, // Важно для FormData
                contentType: false, // Важно для FormData
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    console.log('Заметка успешно обновлена:', response);
                    // Восстанавливаем кнопку
                    $('#update-button').html('<i class="fas fa-save"></i> Сохранено!');
                    
                    // Перенаправляем на страницу заметки
                    setTimeout(() => {
                        window.location.href = '/notes';
                    }, 1000);
                },
                error: function(xhr) {
                    console.error('Ошибка при обновлении заметки:', xhr.responseText);
                    $('#update-button').html('<i class="fas fa-exclamation-circle"></i> Ошибка сохранения');
                    $('#update-button').attr('disabled', false);
                    
                    // Отображаем более подробное сообщение об ошибке
                    let errorMsg = 'Произошла ошибка при сохранении заметки.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMsg += ' ' + xhr.responseJSON.message;
                    }
                    
                    // Отображаем модальное окно с ошибкой
                    $('#errorModalText').text(errorMsg);
                    
                    // Добавляем детали ошибки
                    let errorDetails = '';
                    try {
                        const response = JSON.parse(xhr.responseText);
                        errorDetails = JSON.stringify(response, null, 2);
                    } catch (e) {
                        errorDetails = xhr.responseText;
                    }
                    
                    $('#errorModalDetails').text(errorDetails);
                    
                    // Показываем модальное окно
                    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
                    errorModal.show();
                    
                    // Настраиваем кнопку повторной попытки
                    $('#retryButton').off('click').on('click', function() {
                        errorModal.hide();
                        updateNote(id);
                    });
                }
            });
        }
        
        // Функция для переключения закрепления заметки
        // Функция для работы с закреплением заметки
        function togglePin(id) {
            const isPinned = $('#toggle-pin-button').hasClass('active');
            const newStatus = !isPinned;
            
            // Отображаем индикатор загрузки
            $('#toggle-pin-button').html('<i class="fas fa-spinner fa-spin"></i>');
            
            $.ajax({
                url: `/api/notes/${id}/pin`,
                method: 'PUT',
                data: { is_pinned: newStatus },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function() {
                    if (newStatus) {
                        $('#toggle-pin-button').addClass('active').html('<i class="fas fa-thumbtack"></i>');
                    } else {
                        $('#toggle-pin-button').removeClass('active').html('<i class="fas fa-thumbtack"></i>');
                    }
                },
                error: function(xhr) {
                    console.error('Ошибка при изменении статуса закрепления:', xhr.responseText);
                    $('#toggle-pin-button').html('<i class="fas fa-thumbtack"></i>');
                    alert('Произошла ошибка при изменении статуса закрепления');
                }
            });
        }
        
        // Функция для удаления заметки
        function deleteNote(id) {
            $.ajax({
                url: `/api/notes/${id}`,
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function() {
                    // Перенаправляем на главную страницу
                    window.location.href = '/notes';
                },
                error: function(xhr) {
                    console.error('Ошибка при удалении заметки:', xhr.responseText);
                    alert('Произошла ошибка при удалении заметки');
                }
            });
        }
    </script>
    <script>
        $(document).ready(function() {
            // Глобальный массив для хранения загруженных файлов
            let uploadedFiles = [];
            const maxFiles = 10;
            const maxSize = 100 * 1024 * 1024; // 100 МБ
            
            // Обработчики для drag and drop
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
            
            // Обработка события drop
            dropArea.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                handleFiles(files);
            }
            
            // Обработка клика на область загрузки
            $('#drop-area').on('click', function(e) {
                if (e.target !== this) return; // Игнорируем клики на дочерние элементы
                e.preventDefault();
                $('#upload-files').trigger('click');
            });
            
            // Отдельный обработчик для ссылки "выберите файлы"
            $('#browse-files').off('click').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Предотвращаем всплытие события
                
                // Проверим имя поля для файлов
                const uploadInput = document.getElementById('upload-files');
                if (uploadInput.name !== 'upload_files[]') {
                    console.log('Исправляем имя поля для файлов перед выбором:', uploadInput.name, '->', 'upload_files[]');
                    uploadInput.name = 'upload_files[]';
                }
                
                // Используем непосредственный клик на элементе вместо trigger
                uploadInput.click();
            });
            
            // Обработчик выбора файлов через диалог
            $('#upload-files').off('change').on('change', function() {
                // Убеждаемся, что имя поля правильное
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
            
            // Общая функция обработки файлов
            function handleFiles(files) {
                // Преобразуем FileList в массив для обработки
                const filesArray = Array.from(files);
                
                // Проверка на количество выбранных файлов за раз
                if (filesArray.length > maxFiles) {
                    showErrorMessage(`Можно выбрать максимум ${maxFiles} файлов за раз. Выбрано: ${filesArray.length}`);
                    return;
                }
                
                // Подсчитываем существующие файлы
                const existingFilesCount = (window.currentNoteFiles && Array.isArray(window.currentNoteFiles)) ? window.currentNoteFiles.length : 0;
                const currentNewFilesCount = uploadedFiles.length;
                const totalAfterAdd = existingFilesCount + currentNewFilesCount + filesArray.length;
                
                // Проверка общего количества файлов после добавления
                if (totalAfterAdd > maxFiles) {
                    showErrorMessage(`Можно загрузить максимум ${maxFiles} файлов. Существующих: ${existingFilesCount}, уже выбранных новых: ${currentNewFilesCount}, пытаетесь добавить: ${filesArray.length}. Общее: ${totalAfterAdd}`);
                    return;
                }
                
                // Проверка размера каждого файла
                for (let i = 0; i < filesArray.length; i++) {
                    if (filesArray[i].size > maxSize) {
                        showErrorMessage(`Файл "${filesArray[i].name}" имеет размер ${(filesArray[i].size / (1024 * 1024)).toFixed(1)} МБ. Максимально допустимый размер - 100 МБ.`);
                        return;
                    }
                }
                
                // Добавляем файлы в наш глобальный массив
                filesArray.forEach(file => {
                    // Добавляем уникальный ID для каждого файла
                    file.id = generateUniqueId();
                    uploadedFiles.push(file);
                });
                
                // Обновляем превью
                updateFilePreviews();
            }
            
            // Генерирует уникальный ID для файла
            function generateUniqueId() {
                return 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            }
            
            // Показывает сообщение об ошибке
            function showErrorMessage(message) {
                // Создаем красивое модальное окно
                createConfirmationModal({
                    title: 'Ошибка загрузки файла',
                    message: message,
                    confirmButtonText: 'Понятно',
                    cancelButtonText: '', // Пустая строка = кнопка не отображается
                    confirmButtonClass: 'btn-primary',
                    icon: 'fa-exclamation-triangle',
                    size: 'modal-md',
                    onConfirm: function() {
                        // Просто закрываем модальное окно
                    }
                });
            }
            
            // Обновляет превью для всех загруженных файлов
            function updateFilePreviews() {
                const preview = $('#file-preview');
                preview.empty();
                
                uploadedFiles.forEach(file => {
                    const fileType = getFileType(file.type);
                    const fileSize = (file.size / (1024 * 1024)).toFixed(1);
                    const fileId = file.id;
                    
                    let filePreview;
                    
                    if (fileType === 'image') {
                        // Создаем превью для изображений
                        filePreview = $(`
                            <div class="col-md-3 mb-3" id="file-item-${fileId}">
                                <div class="card file-preview-card">
                                    <div class="image-preview-container">
                                        <img class="preview-image" src="${URL.createObjectURL(file)}" alt="${file.name}" data-file-id="${fileId}">
                                    </div>
                                    <div class="card-body p-2">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div class="file-name text-truncate" style="max-width: 150px;">${file.name}</div>
                                                <small class="text-muted">${fileSize} МБ</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="file-remove" data-file-id="${fileId}">
                                        <i class="fas fa-times"></i>
                                    </div>
                                </div>
                            </div>
                        `);
                    } else {
                        // Создаем превью для других файлов
                        filePreview = $(`
                            <div class="col-md-3 mb-3" id="file-item-${fileId}">
                                <div class="card file-preview-card">
                                    <div class="card-body p-3">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-${
                                                fileType === 'video' ? 'video' : 
                                                fileType === 'audio' ? 'music' :
                                                fileType === 'document' ? 'file-alt' : 'file'
                                            } me-3 fa-2x text-${
                                                fileType === 'video' ? 'danger' : 
                                                fileType === 'audio' ? 'success' :
                                                fileType === 'document' ? 'primary' : 'secondary'
                                            }"></i>
                                            <div>
                                                <div class="file-name text-truncate" style="max-width: 150px;">${file.name}</div>
                                                <small class="text-muted">${fileSize} МБ</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="file-remove" data-file-id="${fileId}">
                                        <i class="fas fa-times"></i>
                                    </div>
                                </div>
                            </div>
                        `);
                    }
                    
                    preview.append(filePreview);
                });
                
                // Привязываем обработчики событий к новым элементам
                attachFileEventHandlers();
            }
            
            // Привязывает обработчики событий к превью файлов
            function attachFileEventHandlers() {
                // Обработчик для удаления файлов
                $('.file-remove').on('click', function(e) {
                    e.stopPropagation();
                    const fileId = $(this).data('file-id');
                    
                    // Удаляем файл из массива
                    uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
                    
                    // Удаляем превью из DOM
                    $(`#file-item-${fileId}`).fadeOut(300, function() {
                        $(this).remove();
                    });
                });
                
                // Обработчик для открытия изображений в модальном окне
                $('.preview-image').on('click', function() {
                    const fileId = $(this).data('file-id');
                    const fileIndex = uploadedFiles.findIndex(file => file.id === fileId);
                    const file = uploadedFiles[fileIndex];
                    
                    if (file) {
                        // Собираем информацию о всех новых файлах для галереи и сохраняем в глобальные переменные file-viewer.js
                        window.filesList = uploadedFiles.map(file => ({
                            url: URL.createObjectURL(file),
                            name: file.name,
                            size: file.size,
                            type: getFileType(file.type)
                        }));
                        
                        // Устанавливаем текущий индекс и показываем файл
                        window.currentFileIndex = fileIndex;
                        const imageUrl = URL.createObjectURL(file);
                        showFileInViewer(imageUrl, file.name, file.size, getFileType(file.type));
                        
                        console.log('Открытие нового файла в просмотрщике:', file.name, 'из', window.filesList.length, 'файлов');
                    }
                });
            }
            
            // Открывает модальное окно с предпросмотром изображения
            function openImagePreviewModal(fileName, imageUrl, fileId) {
                // Проверяем, существует ли модальное окно
                let modal = $('#imagePreviewModal');
                
                // Если модального окна нет, создаем его
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
                
                // Обновляем содержимое модального окна
                modal.find('.modal-title').text(fileName);
                modal.find('img').attr('src', imageUrl);
                
                // Обработчик для удаления изображения
                modal.find('#removeImageBtn').off('click').on('click', function() {
                    createConfirmationModal({
                        title: 'Удаление файла',
                        message: `Вы уверены, что хотите удалить файл "${fileName}"?`,
                        confirmButtonText: 'Удалить',
                        cancelButtonText: 'Отмена',
                        confirmButtonClass: 'btn-danger',
                        icon: 'fa-trash',
                        onConfirm: function() {
                            // Удаляем файл из массива
                            uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
                            
                            // Удаляем превью из DOM
                            $(`#file-item-${fileId}`).fadeOut(300, function() {
                                $(this).remove();
                            });
                            
                            // Закрываем модальное окно
                            const bsModal = bootstrap.Modal.getInstance(document.getElementById('imagePreviewModal'));
                            bsModal.hide();
                        }
                    });
                });
                
                // Открываем модальное окно
                const bsModal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
                bsModal.show();
            }
            
            // Функция для определения типа файла
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
            
            // При отправке формы сохраняем выбранные файлы в форму
            $('#update-button').on('click', function() {
                // Перенаправляем файлы из uploadedFiles в input type="file"
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
            });
        });
    </script>
    <script>
        // Функция для отображения существующих файлов
        function displayExistingFiles(files) {
            // Очищаем существующие файлы
            $('#existing-files').empty();
            
            if (!Array.isArray(files) || files.length === 0) {
                console.log('Нет файлов для отображения');
                return;
            }
            
            console.log(`Отображение ${files.length} существующих файлов`);
            
            // Добавляем заголовок
            $('#existing-files').html('<h6 class="mt-2 mb-3">Прикрепленные файлы:</h6><div class="row g-2 existing-files-container"></div>');
            
            // Добавляем файлы в контейнер
            files.forEach((file, index) => {
                // Определяем URL файла - используем url или создаем из path
                const fileUrl = file.url || (file.path ? `/storage/${file.path}` : null);
                if (!fileUrl) {
                    console.warn('Файл не имеет URL:', file);
                    return; // Пропускаем файл без URL
                }
                
                let preview = '';
                if (file.type === 'image') {
                    preview = `<img src="${fileUrl}" class="img-thumbnail w-100" style="height: 100px; object-fit: cover;" alt="${file.name}" onerror="this.onerror=null;this.src='https://placehold.co/200?text=Ошибка+изображения';">`;
                } else if (file.type === 'video') {
                    preview = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-film fa-2x text-danger"></i></div>`;
                } else if (file.type === 'audio') {
                    preview = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-music fa-2x text-info"></i></div>`;
                } else {
                    // Документы и прочее
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
            
            // Привязываем обработчики событий после добавления всех элементов
            setTimeout(function() {
                // Обработчик для кнопки удаления файла
                $('.remove-file').off('click').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const filePath = $(this).data('file-path');
                    const fileCard = $(this).closest('.col-md-3');
                    const fileName = $(this).data('file-name') || 'файл';
                    
                    console.log('Кнопка удаления нажата для файла:', fileName);
                    
                    // Создаем модальное окно для подтверждения удаления
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
                                
                                // Удаляем файл из массива
                                window.currentNoteFiles = window.currentNoteFiles.filter(file => file.path !== filePath);
                                
                                // Удаляем визуальное представление
                                fileCard.fadeOut(300, function() {
                                    $(this).remove();
                                    
                                    // Если файлов не осталось, скрываем контейнер
                                    if (window.currentNoteFiles.length === 0) {
                                        $('#existing-files').hide();
                                    }
                                });
                            }
                        });
                    } catch (error) {
                        console.error('Ошибка при вызове createConfirmationModal:', error);
                        if (confirm(`Удалить файл "${fileName}"?`)) {
                            // Fallback - используем стандартный confirm
                            window.currentNoteFiles = window.currentNoteFiles.filter(file => file.path !== filePath);
                            fileCard.fadeOut(300, function() {
                                $(this).remove();
                                if (window.currentNoteFiles.length === 0) {
                                    $('#existing-files').hide();
                                }
                            });
                        }
                    }
                });
                
                console.log('Обработчики удаления файлов привязаны для', $('.remove-file').length, 'кнопок');
            }, 100);
        }
        
        // Загрузка списка папок
        function loadFoldersList() {
            $.ajax({
                url: '/api/folders',
                type: 'GET',
                success: function(response) {
                    if (response.success && response.data) {
                        const foldersContainer = $('#folders-list');
                        foldersContainer.empty();
                        
                        // Сортируем папки по имени (числовое упорядочивание)
                        const sortedFolders = response.data.sort((a, b) => {
                            // Извлекаем числа из имен папок (если они есть)
                            const numA = parseInt(a.name.match(/\d+/)) || 0;
                            const numB = parseInt(b.name.match(/\d+/)) || 0;
                            return numA - numB;
                        });
                        
                        // Отображение папок
                        sortedFolders.forEach(function(folder) {
                            const folderName = folder.name;
                            const count = folder.count || 0;
                            const normalizedName = folderName.toLowerCase().trim();
                            const folderId = 'folder-' + normalizedName.replace(/[^a-z0-9]/g, '-');
                            
                            foldersContainer.append(`
                                <div class="d-flex justify-content-between align-items-center mb-2 folder-item" 
                                     id="${folderId}" 
                                     data-folder-name="${normalizedName}" 
                                     data-folder-original="${folderName}">
                                    <a href="/notes/folder/${encodeURIComponent(folderName)}" 
                                       class="text-decoration-none text-dark folder-link" 
                                       data-folder="${folderName}">
                                        <i class="fas fa-folder me-1"></i> ${folderName}
                                    </a>
                                    <div class="d-flex align-items-center">
                                        <span class="badge bg-secondary me-2">${count}</span>
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
        
        // Загружаем папки при загрузке страницы
        loadFoldersList();
        
        // Инициализация темного режима
        const darkThemeEnabled = localStorage.getItem('darkTheme') === 'true';
        if (darkThemeEnabled) {
            document.body.classList.add('dark-theme');
            $('#theme-toggle').prop('checked', true);
        }
        
        // Обработчик переключения темы
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
        
        // Отключаем клики на цветах в боковой панели
        $('.sidebar .color-option').css('pointer-events', 'none');
        
        // Гарантируем, что серый цвет в боковой панели всегда выбран, а остальные цвета не выбраны
        $('.sidebar .color-option.color-default').addClass('selected');
        $('.sidebar .color-option:not(.color-default)').removeClass('selected');
        
        // Следим за изменением цвета в основном блоке
        $('.col-lg-9 .color-option, .col-md-9 .color-option').on('click', function() {
            // Убеждаемся, что в боковой панели только серый цвет выбран
            $('.sidebar .color-option.color-default').addClass('selected');
            $('.sidebar .color-option:not(.color-default)').removeClass('selected');
        });
        
        // Инициализируем просмотрщик файлов
        initFileViewer();
        
        // Функция для создания модального окна подтверждения
        function createConfirmationModal(options) {
            // Настройки по умолчанию
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
            
            // Объединяем настройки по умолчанию с переданными параметрами
            const settings = {...defaults, ...options};
            
            // Удаляем предыдущее модальное окно с таким же ID, если оно существует
            $(`#${settings.id}`).remove();
            
            // Определяем дополнительные классы для модального окна
            const modalClasses = [
                'modal fade',
                settings.animation ? 'animate__animated animate__fadeIn' : '',
            ].filter(Boolean).join(' ');
            
            // Определяем классы для диалога
            const dialogClasses = [
                'modal-dialog',
                settings.size,
                settings.centered ? 'modal-dialog-centered' : '',
                'modal-dialog-scrollable'
            ].filter(Boolean).join(' ');
            
            // Создаем HTML модального окна с улучшенным дизайном
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
            
            // Добавляем модальное окно в DOM
            $('body').append(modalHTML);
            
            // Создаем экземпляр модального окна
            const modalElement = document.getElementById(settings.id);
            const modal = new bootstrap.Modal(modalElement);
            
            // Добавляем обработчик события для кнопки подтверждения
            $(`#${settings.id}Confirm`).on('click', function() {
                // Вызываем функцию обратного вызова, если она задана
                if (typeof settings.onConfirm === 'function') {
                    settings.onConfirm();
                }
                
                // Скрываем модальное окно
                modal.hide();
            });
            
            // Обработчик события скрытия модального окна
            modalElement.addEventListener('hidden.bs.modal', function() {
                // Удаляем модальное окно из DOM после скрытия
                $(modalElement).remove();
            });
            
            // Показываем модальное окно
            modal.show();
            
            return modal;
        }
    </script>

    <!-- Модальное окно для просмотра файлов -->
    <div class="modal fade" id="fileViewerModal" tabindex="-1" aria-labelledby="fileViewerModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="fileViewerModalLabel">Просмотр файла</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                </div>
                <div class="modal-body p-0">
                    <div class="file-viewer-container d-flex align-items-center justify-content-center position-relative">
                        <!-- Содержимое будет добавлено динамически -->
                        <div id="file-viewer-content" class="w-100"></div>
                        
                        <!-- Элементы управления навигацией для галереи изображений -->
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
