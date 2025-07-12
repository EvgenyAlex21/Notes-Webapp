<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Редактирование заметки</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <h1>Редактирование заметки</h1>
                <div class="card">
                    <div class="card-body">
                        <form id="edit-note-form">
                            <input type="hidden" id="note-id" value="{{ $id }}">
                            <div class="mb-3">
                                <label for="name" class="form-label">Название</label>
                                <input type="text" class="form-control" id="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Описание</label>
                                <textarea class="form-control" id="description" rows="4" required></textarea>
                            </div>
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="done">
                                <label class="form-check-label" for="done">Выполнено</label>
                            </div>
                            <div class="d-flex justify-content-between">
                                <div>
                                    <button type="button" id="update-button" class="btn btn-primary">Сохранить</button>
                                    <a href="/notes" class="btn btn-secondary ms-2">Отмена</a>
                                </div>
                                <button type="button" id="delete-button" class="btn btn-danger">Удалить</button>
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
