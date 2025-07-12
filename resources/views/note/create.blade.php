<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Создание заметки</title>
    
    <!-- Favicon с версионированием для обхода кэша -->
    <link rel="icon" href="/favicon.ico?v=1">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png?v=1">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png?v=1">
    <link rel="shortcut icon" href="/favicon.ico?v=1">
    <link rel="apple-touch-icon" href="/images/logo.png?v=1">
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <link rel="stylesheet" href="{{ asset('css/file-viewer.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/sidebar-counters.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
    <script src="{{ asset('js/file-viewer.js') }}"></script>
    <script src="{{ asset('js/scroll-top.js') }}"></script>
    <script src="{{ asset('js/theme-manager.js') }}"></script>
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
        
        /* Стили для папок - точно такие же как у sidebar-link */
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
            color: #495057;
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
        /* Стили для редактора */
        .note-editor.note-frame {
            border-radius: 5px;
            border-color: #ced4da;
        }
        .note-toolbar {
            background-color: #f8f9fa;
            border-bottom: 1px solid #ced4da;
        }
        .note-statusbar {
            background-color: #f8f9fa;
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
        .dark-theme {
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
        .dark-theme .card {
            background-color: #343a40;
            color: #f8f9fa;
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
        .dark-theme .text-muted {
            color: #adb5bd !important;
        }
        .dark-theme .sidebar-link {
            color: #f1f3f5;
        }
        .dark-theme .sidebar-link:hover {
            background-color: #4a4f55;
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
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">
                    <i class="fas fa-plus me-2"></i> 
                    <span class="fw-bold">Создание заметки</span>
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
                        <form id="create-note-form" method="POST" action="/notes" enctype="multipart/form-data">
                            <input type="hidden" name="files" value="[]">
                            <input type="hidden" name="_token" value="{{ csrf_token() }}">
                            <div class="mb-3">
                                <label for="name" class="form-label fw-bold">Название</label>
                                <input type="text" class="form-control form-control-lg" id="name" name="name" required 
                                       placeholder="Добавьте заголовок заметки">
                            </div>
                            
                            <div class="mb-4">
                                <label for="description" class="form-label fw-bold">Описание</label>
                                <div id="editor-container" style="height: 200px; border-radius: 0.25rem;"></div>
                                <textarea class="form-control d-none" id="description" name="description" required></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Приоритет заметки</label>
                                <div class="color-picker">
                                    <div class="color-option color-default selected" data-color="default" title="Без приоритета"></div>
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
                                <div class="tag-input">
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
                                
                                <!-- Контейнер для хранения файлов -->
                                <div id="files-container"></div>
                            </div>
                            
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
                                <button type="submit" id="save-button" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Сохранить
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
    <script src="/js/notifications.js"></script>
    <script src="/js/sidebar-counters.js"></script>
    <script>
        $(document).ready(function() {
            // Инициализация Quill
            var quill = new Quill('#editor-container', {
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
            
            // При отправке формы копируем HTML содержимое редактора в скрытое текстовое поле
            $('#create-note-form').submit(function() {
                var htmlContent = quill.root.innerHTML;
                $('#description').val(htmlContent);
                // Преобразуем дату напоминания из локального времени в UTC перед отправкой
                var reminderVal = $('#reminder-date').val();
                if (reminderVal) {
                    var localDate = new Date(reminderVal);
                    var utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
                    var isoString = utcDate.toISOString().slice(0, 19).replace('T', ' ');
                    // Кладём в скрытое поле reminder_at
                    if ($('#reminder_at').length === 0) {
                        $('<input>').attr({type: 'hidden', id: 'reminder_at', name: 'reminder_at'}).appendTo('#create-note-form');
                    }
                    $('#reminder_at').val(isoString);
                    console.log('Добавлено напоминание (UTC, reminder_at):', isoString);
                } else {
                    // Если напоминание не установлено, явно очищаем его
                    if ($('#reminder_at').length === 0) {
                        $('<input>').attr({type: 'hidden', id: 'reminder_at', name: 'reminder_at'}).appendTo('#create-note-form');
                    }
                    $('#reminder_at').val('');
                    console.log('Напоминание очищено (reminder_at)');
                }
                // Для отладки: логируем все значения формы
                var formDataLog = {};
                $('#create-note-form').serializeArray().forEach(function(item) { formDataLog[item.name] = item.value; });
                console.log('Отправляемые данные формы:', formDataLog);
            });
            
            // При нажатии на кнопку "Сохранить"
            $('#save-button').on('click', function(e) {
                e.preventDefault();
                var htmlContent = quill.root.innerHTML;
                $('#description').val(htmlContent);
                
                // Проверяем загружены ли файлы
                const uploadInput = document.getElementById('upload-files');
                if (uploadInput && uploadInput.files && uploadInput.files.length > 0) {
                    console.log('Файлы для загрузки:', uploadInput.files.length);
                    
                    // Выводим информацию о каждом файле
                    for (let i = 0; i < uploadInput.files.length; i++) {
                        const file = uploadInput.files[i];
                        console.log(`Файл ${i+1}: ${file.name}, ${file.size} байт, ${file.type}`);
                    }
                    
                    // Убедимся, что форма имеет правильный enctype
                    const form = $('#create-note-form');
                    if (form.attr('enctype') !== 'multipart/form-data') {
                        console.log('Устанавливаем правильный enctype для формы');
                        form.attr('enctype', 'multipart/form-data');
                    }
                    
                    // Проверим имя поля для файлов
                    if (uploadInput.name !== 'upload_files[]') {
                        console.log('Исправляем имя поля для файлов:', uploadInput.name, '->', 'upload_files[]');
                        uploadInput.name = 'upload_files[]';
                    }
                    
                    // Добавляем скрытое поле с информацией о количестве файлов
                    const debugInput = document.createElement('input');
                    debugInput.type = 'hidden';
                    debugInput.name = 'debug_files_count';
                    debugInput.value = uploadInput.files.length;
                    document.getElementById('create-note-form').appendChild(debugInput);
                    
                    console.log('Подготовлены файлы для отправки:', uploadInput.files.length);
                } else {
                    // Даже если файлов нет, устанавливаем пустой массив для files
                    // чтобы избежать ошибки "The files field must be an array"
                    const filesInput = document.createElement('input');
                    filesInput.type = 'hidden';
                    filesInput.name = 'files';
                    filesInput.value = '[]';
                    document.getElementById('create-note-form').appendChild(filesInput);
                    
                    console.log('Файлы не выбраны, добавлено скрытое поле files=[]');
                }
                
                // Отправляем форму напрямую, а не через AJAX
                // Это обеспечит правильную отправку файлов
                document.getElementById('create-note-form').submit();
            });
            
            // Обработка выбора типа напоминания
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
                        dateTimeContainer.show(); // Показываем поле времени
                        reminderActions.show();
                        break;
                    case 'tomorrow':
                        setQuickDate(1); // завтра
                        dateTimeContainer.show(); // Показываем поле времени
                        reminderActions.show();
                        break;
                    case 'next-week':
                        setQuickDate(7); // через неделю
                        dateTimeContainer.show(); // Показываем поле времени и дату
                        reminderActions.show();
                        break;
                }
            });
            
            // Функция для быстрой установки даты (через указанное количество дней)
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
                        $('#reminder-actions').hide();
                        if ($('#reminder-status').length) {
                            $('#reminder-status').text('Без напоминания');
                        }
                    }
                });
            });
            
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
                console.log('Выбрано файлов:', this.files.length);
                
                // Убеждаемся, что имя поля правильное
                if (this.name !== 'upload_files[]') {
                    console.log('Исправляем имя поля для файлов после выбора:', this.name, '->', 'upload_files[]');
                    this.name = 'upload_files[]';
                }
                
                // Показываем имена и размеры выбранных файлов
                for (let i = 0; i < this.files.length; i++) {
                    console.log(`Выбран файл ${i+1}: ${this.files[i].name}, ${this.files[i].size} байт`);
                }
                
                handleFiles(this.files);
                
                // НЕ сбрасываем input, чтобы файлы сохранились для отправки на сервер
                // $(this).val(''); // Убираем эту строку
                
                // Добавляем визуальное подтверждение
                $('#drop-area').addClass('border-success').removeClass('border-dashed');
                setTimeout(() => {
                    $('#drop-area').removeClass('border-success').addClass('border-dashed');
                }, 2000);
            });
            
            // Общая функция обработки файлов
            function handleFiles(files) {
                // Проверка на количество файлов
                if (uploadedFiles.length + files.length > maxFiles) {
                    showErrorMessage(`Можно загрузить максимум ${maxFiles} файлов. Сейчас выбрано: ${uploadedFiles.length + files.length}`);
                    return;
                }
                
                // Преобразуем FileList в массив для обработки
                const filesArray = Array.from(files);
                
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
                alert(message);
                // Здесь можно реализовать более красивое отображение ошибки
            }
            
            // Обновляет превью для всех загруженных файлов
            function updateFilePreviews() {
                const preview = $('#file-preview');
                preview.empty();
                
                uploadedFiles.forEach((file, index) => {
                    const fileType = getFileType(file.type);
                    const fileSize = (file.size / (1024 * 1024)).toFixed(1);
                    const fileId = file.id;
                    const fileUrl = URL.createObjectURL(file);
                    
                    // Создаем превью в едином стиле
                    let previewContent = '';
                    if (fileType === 'image') {
                        previewContent = `<img src="${fileUrl}" class="img-thumbnail w-100" style="height: 100px; object-fit: cover;" alt="${file.name}">`;
                    } else if (fileType === 'video') {
                        previewContent = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-film fa-2x text-danger"></i></div>`;
                    } else if (fileType === 'audio') {
                        previewContent = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-music fa-2x text-info"></i></div>`;
                    } else {
                        // Документы и прочее
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
                
                // Привязываем обработчики событий к новым элементам
                attachFileEventHandlers();
                
                // Обновляем глобальный массив для галереи
                updateGlobalFilesArray();
            }
            
            // Привязывает обработчики событий к превью файлов
            function attachFileEventHandlers() {
                // Обработчик для удаления файлов
                $('.file-remove').off('click').on('click', function(e) {
                    e.stopPropagation();
                    const fileId = $(this).data('file-id');
                    const fileName = uploadedFiles.find(file => file.id === fileId)?.name || 'файл';
                    
                    // Используем модальное окно подтверждения вместо confirm
                    createConfirmationModal(
                        'Удалить файл?',
                        `Вы уверены, что хотите удалить файл "${fileName}"?`,
                        'Удалить',
                        'Отмена',
                        function() {
                            // Удаляем файл из массива
                            uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
                            
                            // Удаляем превью из DOM
                            $(`#file-item-${fileId}`).fadeOut(300, function() {
                                $(this).remove();
                                // Обновляем глобальный массив для галереи
                                updateGlobalFilesArray();
                            });
                        }
                    );
                });
                
                // Обработчик кнопок просмотра файлов уже настроен в file-viewer.js как '.new-file-preview'
                console.log('Привязаны обработчики для', $('.file-remove').length, 'кнопок удаления и', $('.new-file-preview').length, 'кнопок просмотра');
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
                                    <div class="folder-item" 
                                         id="${folderId}" 
                                         data-folder-name="${normalizedName}" 
                                         data-folder-original="${folderName}">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <a href="/notes/folder/${encodeURIComponent(folderName)}" 
                                               class="text-decoration-none text-dark folder-link" 
                                               data-folder="${folderName}">
                                                <i class="fas fa-folder me-1"></i> ${folderName}
                                            </a>
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
            
            // Загружаем папки при загрузке страницы
            loadFoldersList();
            
            // Инициализация темного режима
            const darkThemeEnabled = localStorage.getItem('darkTheme') === 'true';
            // Примечание: управление темой перенесено в theme-manager.js
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
        });
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