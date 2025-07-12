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
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
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
        .color-option:hover, .color-option.selected {
            transform: scale(1.2);
            box-shadow: 0 0 0 2px #007bff;
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
                </div>
            </div>
            
            <!-- Основное содержимое -->
            <div class="col-lg-9">
                <div class="card">
                    <div class="card-body p-4">
                        <form id="edit-note-form" method="POST" action="javascript:void(0)" enctype="multipart/form-data">
                            <input type="hidden" id="note-id" value="{{ $id }}">
                            
                            <div class="edit-header mb-4">
                                <div>
                                    <div class="note-info">
                                        <span id="note-date"></span>
                                    </div>
                                </div>
                                <div class="action-buttons">
                                    <button type="button" id="done-button" class="btn btn-sm" title="Отметить как выполненное">
                                        <i class="fas fa-check-circle"></i>
                                    </button>
                                    <button type="button" id="toggle-pin-button" class="btn btn-outline-warning btn-sm" title="Закрепить">
                                        <i class="fas fa-thumbtack"></i>
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
                                <input type="file" class="form-control" id="upload-files" name="upload_files[]" multiple onchange="console.log('Выбраны файлы:', this.files.length, 'шт.')">
                                <small class="text-muted">Можно загружать до 10 файлов, каждый размером до 100 МБ. Поддерживаются изображения, документы и другие типы файлов</small>
                                <div id="file-preview" class="mt-2 row g-2"></div>
                                <div id="existing-files" class="mt-2 row g-2">
                                    <!-- Тут будут отображаться существующие файлы -->
                                </div>
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
            $('#remove-reminder').on('click', function() {
                $('#reminder-type').val('none').trigger('change');
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
                            $('#toggle-pin-button').addClass('active').html('<i class="fas fa-thumbtack"></i> Открепить');
                        } else {
                            $('#toggle-pin-button').removeClass('active').html('<i class="fas fa-thumbtack"></i> Закрепить');
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
                            window.currentNoteFiles = Array.isArray(filesArray) ? filesArray : [];
                            
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
                        $('#toggle-pin-button').addClass('active').html('<i class="fas fa-thumbtack"></i> Открепить');
                    } else {
                        $('#toggle-pin-button').removeClass('active').html('<i class="fas fa-thumbtack"></i> Закрепить');
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
        // Обработчик загрузки файлов с проверкой ограничений
        $('#upload-files').on('change', function() {
            const files = this.files;
            const maxFiles = 10;
            const maxSize = 100 * 1024 * 1024; // 100 МБ
            
            // Проверка на количество файлов
            if (files.length > maxFiles) {
                alert(`Вы выбрали ${files.length} файлов. Максимально допустимое количество - ${maxFiles} файлов.`);
                $(this).val(''); // Очищаем поле
                return;
            }
            
            // Проверка размера каждого файла
            for (let i = 0; i < files.length; i++) {
                if (files[i].size > maxSize) {
                    alert(`Файл "${files[i].name}" имеет размер ${(files[i].size / (1024 * 1024)).toFixed(1)} МБ. Максимально допустимый размер - 100 МБ.`);
                    $(this).val(''); // Очищаем поле
                    return;
                }
            }
            
            // Если все проверки пройдены, отображаем превью
            previewFiles(this.files);
        });
        
        // Функция для отображения превью файлов
        function previewFiles(files) {
            const preview = $('#file-preview');
            preview.empty();
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileType = getFileType(file.type);
                const fileSize = (file.size / (1024 * 1024)).toFixed(1);
                
                const fileElement = $(`
                    <div class="col-md-3 mb-2">
                        <div class="card file-preview-card">
                            <div class="card-body p-2">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-${fileType === 'image' ? 'image' : 
                                                       fileType === 'video' ? 'video' : 
                                                       fileType === 'audio' ? 'music' :
                                                       fileType === 'document' ? 'file-alt' : 'file'} me-2 fa-2x"></i>
                                    <div>
                                        <div class="file-name text-truncate" style="max-width: 150px;">${file.name}</div>
                                        <small class="text-muted">${fileSize} МБ</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                
                preview.append(fileElement);
            }
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
    </script>
    <script>
        // Функция для отображения существующих файлов
        function displayExistingFiles(files) {
            if (!Array.isArray(files) || files.length === 0) {
                console.log('Нет файлов для отображения');
                return;
            }
            
            console.log(`Отображение ${files.length} существующих файлов`);
            
            // Проверяем существование контейнера
            if ($('#existing-files').length === 0) {
                console.log('Создаем контейнер для существующих файлов');
                $('#files-container').append('<div id="existing-files" class="mt-3"><h6>Прикрепленные файлы:</h6><div class="row g-2"></div></div>');
            } else {
                // Очищаем контейнер если он существует
                $('#existing-files .row').empty();
            }
            
            // Добавляем файлы в контейнер
            files.forEach(file => {
                let preview = '';
                if (file.type === 'image') {
                    preview = `<img src="${file.url}" class="img-thumbnail w-100" style="height: 100px; object-fit: cover;" alt="${file.name}" onerror="this.onerror=null;this.src='https://placehold.co/200?text=Ошибка+изображения';">`;
                } else if (file.type === 'video') {
                    preview = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas fa-film fa-2x text-secondary"></i></div>`;
                } else {
                    // Документы и прочее
                    let iconClass = 'fa-file';
                    if (file.extension && typeof file.extension === 'string') {
                        if (file.extension.match(/pdf/i)) iconClass = 'fa-file-pdf';
                        else if (file.extension.match(/docx?/i)) iconClass = 'fa-file-word';
                        else if (file.extension.match(/xlsx?/i)) iconClass = 'fa-file-excel';
                        else if (file.extension.match(/pptx?/i)) iconClass = 'fa-file-powerpoint';
                        else if (file.extension.match(/zip|rar|tar|gz/i)) iconClass = 'fa-file-archive';
                        else if (file.extension.match(/txt|rtf/i)) iconClass = 'fa-file-alt';
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
                                    <a href="${file.url}" target="_blank" class="btn btn-outline-primary" title="Открыть файл">
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>
                                    <button type="button" class="btn btn-outline-danger remove-file" data-file-path="${file.path}" title="Удалить файл">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                $('#existing-files .row').append(fileElement);
            });
            
            // Обработчик для кнопки удаления файла
            $('.remove-file').off('click').on('click', function() {
                const filePath = $(this).data('file-path');
                const fileCard = $(this).closest('.col-md-3');
                
                if (confirm('Удалить этот файл?')) {
                    console.log('Удаление файла с путем:', filePath);
                    
                    // Удаляем файл из массива
                    window.currentNoteFiles = window.currentNoteFiles.filter(file => file.path !== filePath);
                    console.log('Оставшиеся файлы:', window.currentNoteFiles);
                    
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
        }
    </script>
</body>
</html>
