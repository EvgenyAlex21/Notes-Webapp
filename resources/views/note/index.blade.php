<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Список заметок</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <style>
        .note-item {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            transition: all 0.3s;
        }
        .note-item:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .btn-add {
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-12">
                <h1>Список заметок</h1>
                <a href="/notes/create" class="btn btn-primary btn-add">Создать заметку</a>
                <div class="notes-container">
                    <!-- Сюда будут добавлены заметки с помощью JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <script src="/js/notes.js"></script>
</body>
</html>
