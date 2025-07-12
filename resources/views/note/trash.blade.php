<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Корзина заметок</title>
    <link rel="icon" href="/favicon.ico?v=1">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png?v=1">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png?v=1">
    <link rel="shortcut icon" href="/favicon.ico?v=1">
    <link rel="apple-touch-icon" href="/images/logo.png?v=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <link rel="stylesheet" href="{{ asset('css/view-button.css') }}">
    <link rel="stylesheet" href="{{ asset('css/notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/note-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="{{ asset('js/scroll-top.js') }}"></script>
    <script src="{{ asset('js/notifications.js') }}"></script>
    <script src="{{ asset('js/theme-manager.js') }}"></script>
    <style>
        .note-item {
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            transition: all 0.3s;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .note-item:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .btn-add {
            margin-bottom: 20px;
        }
        .deleted-note {
            opacity: 0.7;
        }
        .note-actions {
            display: flex;
            gap: 5px;
        }
        .empty-trash-container {
            text-align: center;
            padding: 50px 0;
        }
        .empty-trash-icon {
            font-size: 5rem;
            color: #ccc;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-12">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/notes">Заметки</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Корзина</li>
                    </ol>
                </nav>
                
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Корзина</h2>
                    <div class="d-flex align-items-center">
                        <div class="form-check form-switch me-3">
                            <input class="form-check-input" type="checkbox" id="theme-toggle">
                            <label class="form-check-label" for="theme-toggle">Темная тема</label>
                        </div>
                        <button class="btn btn-danger btn-sm empty-trash-btn">
                            <i class="fas fa-trash"></i> Очистить корзину
                        </button>
                    </div>
                </div>
                
                <div class="trash-notes-container">

                </div>
                
                <div class="empty-trash-container d-none">
                    <div class="empty-trash-icon">
                        <i class="fas fa-trash"></i>
                    </div>
                    <h3>Корзина пуста</h3>
                    <p class="text-muted">Удаленные заметки будут появляться здесь</p>
                    <a href="/notes" class="btn btn-primary mt-3">Вернуться к заметкам</a>
                </div>
            </div>
        </div>
    </div>

    <script src="/js/note-update-handler.js"></script>
    <script src="/js/note-status-handler.js"></script>
    <script src="/js/notes.js"></script>
    <script src="/js/trash-handler.js"></script>
    <script src="/js/note-view.js"></script>
    <script src="/js/file-viewer.js"></script>
    <script src="/js/accessibility-fix.js"></script>
    <script src="/js/modal-fix.js"></script>
    <script src="/js/modal-view-fixes.js"></script>
</body>
</html>
