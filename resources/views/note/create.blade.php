<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Создание заметки</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
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
                <h1 class="h3 mb-0">Создание заметки</h1>
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
                        <form id="create-note-form" method="POST" action="javascript:void(0)" enctype="multipart/form-data">
                            <div class="mb-3">
                                <label for="name" class="form-label fw-bold">Название</label>
                                <input type="text" class="form-control form-control-lg" id="name" required 
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
                                <input type="file" class="form-control" id="upload-files" name="upload_files[]" multiple>
                                <small class="text-muted">Можно загружать до 10 файлов, каждый размером до 100 МБ. Поддерживаются изображения, документы и другие типы файлов</small>
                                <div id="file-preview" class="mt-2 row g-2"></div>
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
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="is_pinned">
                                    <label class="form-check-label" for="is_pinned">
                                        <i class="fas fa-thumbtack"></i> Закрепить заметку
                                    </label>
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

    <script src="/js/note-colors.js"></script>
    <script src="/js/notes.js"></script>
    <script src="/js/tags-form-improvements.js"></script>
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
            });
            
            // При нажатии на кнопку "Сохранить"
            $('#save-button').on('click', function(e) {
                e.preventDefault();
                var htmlContent = quill.root.innerHTML;
                $('#description').val(htmlContent);
                // Теперь вызываем функцию создания заметки вручную
                createNote();
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
        });
    </script>
</body>
</html>
