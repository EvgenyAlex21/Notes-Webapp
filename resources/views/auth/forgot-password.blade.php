<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Сброс пароля - Notes App</title>
    <link rel="icon" href="/favicon.ico?v=1">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png?v=1">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png?v=1">
    <link rel="shortcut icon" href="/favicon.ico?v=1">
    <link rel="apple-touch-icon" href="/images/logo.png?v=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/unified-notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <style>
        body {
            background-color: #f5f8fa;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 0;
        }
        .auth-container {
            max-width: 450px;
            width: 90%;
            margin: 0 auto;
            padding: 2rem;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .auth-logo {
            text-align: center;
            margin-bottom: 2rem;
        }
        .auth-logo img {
            max-width: 80px;
        }
        .auth-title {
            font-size: 1.8rem;
            font-weight: 600;
            text-align: center;
            margin-bottom: 1.5rem;
            color: #333;
        }
        .form-floating {
            margin-bottom: 1rem;
        }
        .btn-primary {
            width: 100%;
            padding: 0.8rem;
            font-weight: 500;
            margin-top: 1rem;
        }
        .auth-footer {
            text-align: center;
            margin-top: 1.5rem;
        }
        .auth-footer a {
            color: #6c757d;
            text-decoration: none;
        }
        .auth-footer a:hover {
            color: #0d6efd;
            text-decoration: underline;
        }
        /* Темная тема */
        body.dark-theme {
            background-color: #121212;
        }
        body.dark-theme .auth-container {
            background-color: #1e1e1e;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        body.dark-theme .auth-title {
            color: #e0e0e0;
        }
        body.dark-theme .form-control {
            background-color: #2d2d2d;
            border-color: #444;
            color: #e0e0e0;
        }
        body.dark-theme .form-control:focus {
            background-color: #333;
        }
        body.dark-theme .form-floating label {
            color: #aaa;
        }
        body.dark-theme .auth-footer a {
            color: #aaa;
        }
        body.dark-theme .auth-footer a:hover {
            color: #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-lg-12">
                <div class="auth-container">
                    <div class="auth-logo">
                        <img src="{{ asset('images/logo.png') }}" alt="Notes App Logo">
                    </div>
                    <h1 class="auth-title">Сброс пароля</h1>

                    @if(session('status'))
                        <div class="alert alert-success mb-4">
                            {{ session('status') }}
                        </div>
                    @endif

                    @if($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form method="POST" action="{{ route('password.email') }}">
                        @csrf
                        <div class="form-floating mb-3">
                            <input type="email" class="form-control" id="email" name="email" placeholder="name@example.com" value="{{ old('email') }}" required autofocus>
                            <label for="email">Email</label>
                        </div>

                        <button type="submit" class="btn btn-primary">Отправить ссылку для сброса пароля</button>
                    </form>

                    <div class="auth-footer mt-4">
                        <p>Вспомнили пароль? <a href="{{ route('login') }}">Войти</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const darkMode = localStorage.getItem('darkMode');
            if (darkMode === 'enabled') {
                document.body.classList.add('dark-theme');
            }
        });
    </script>
</body>
</html>