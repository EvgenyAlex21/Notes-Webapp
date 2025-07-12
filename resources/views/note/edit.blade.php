<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Редактирование заметки</title>
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

    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">Редактирование заметки</h1>
                <a href="/notes" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left"></i> Назад к списку
                </a>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-body p-4">
                        <form id="edit-note-form" method="POST" action="javascript:void(0)">
                            <input type="hidden" id="note-id" value="{{ $id }}">
                            
                            <div class="edit-header mb-4">
                                <div>
                                    <div class="note-info">
                                        <span id="note-date"></span>
                                    </div>
                                </div>
                                <div class="action-buttons">
                                    <button type="button" id="toggle-pin-button" class="btn btn-outline-warning btn-sm">
                                        <i class="fas fa-thumbtack"></i>
                                    </button>
                                    <button type="button" id="delete-button" class="btn btn-outline-danger btn-sm">
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
                                <textarea class="form-control" id="description" rows="5" required></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Цвет приоритета</label>
                                <div class="color-picker">
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
                            
                            <div class="mb-4">
                                <label class="form-label fw-bold">Теги</label>
                                <div class="tag-input" id="tags-container">
                                    <input type="text" id="tag-input" placeholder="Добавить тег...">
                                </div>
                                <small class="text-muted">Нажмите Enter, чтобы добавить тег</small>
                            </div>
                            
                            <div class="mb-4">
                                <label class="form-label fw-bold">Прикрепить файлы</label>
                                <input type="file" class="form-control" id="upload-files" multiple>
                                <small class="text-muted">Можно загружать изображения, документы и другие файлы</small>
                                <div id="file-preview" class="mt-2 row g-2"></div>
                                <div id="existing-files" class="mt-2 row g-2">
                                    <!-- Тут будут отображаться существующие файлы -->
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="done">
                                    <label class="form-check-label" for="done">
                                        <i class="fas fa-check-circle"></i> Отметить как выполненное
                                    </label>
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label for="reminder-date" class="form-label fw-bold">Установить напоминание</label>
                                <input type="datetime-local" class="form-control" id="reminder-date">
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

    <script src="/js/notes.js"></script>
</body>
</html>
