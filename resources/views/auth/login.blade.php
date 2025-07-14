<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Вход - Notes App</title>
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
        
        .password-field {
            position: relative;
        }
        .password-toggle {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #6c757d;
            cursor: pointer;
            z-index: 10;
            padding: 0;
            font-size: 1.2rem;
        }
        .password-toggle:hover {
            color: #007bff;
        }
        body.dark-theme .password-toggle {
            color: #aaa;
        }
        body.dark-theme .password-toggle:hover {
            color: #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="auth-container">
                    <div class="auth-logo">
                        <img src="{{ asset('images/logo.png') }}" alt="Notes App Logo">
                    </div>
                    <h1 class="auth-title">Вход в систему</h1>

                    @if($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form method="POST" action="{{ route('login') }}">
                        @csrf
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="login" name="login" placeholder="Email или логин" value="{{ old('login') }}" required autofocus>
                            <label for="login">Email или логин</label>
                        </div>

                        <div class="form-floating mb-3 password-field">
                            <input type="password" class="form-control" id="password" name="password" placeholder="Пароль" required>
                            <label for="password">Пароль</label>
                            <button type="button" class="password-toggle" onclick="togglePassword('password')" title="Показать/скрыть пароль">
                                <i class="fas fa-eye" id="password-icon"></i>
                            </button>
                        </div>

                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="remember" name="remember">
                            <label class="form-check-label" for="remember">
                                Запомнить меня
                            </label>
                        </div>

                        <button type="submit" class="btn btn-primary">Войти</button>
                    </form>

                    <div class="auth-footer mt-4">
                        <p>Нет аккаунта? <a href="{{ route('register') }}">Зарегистрируйтесь</a></p>
                        <p><a href="{{ route('password.request') }}">Забыли пароль?</a></p>
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
        
        function togglePassword(fieldId) {
            const passwordField = document.getElementById(fieldId);
            const passwordIcon = document.getElementById(fieldId + '-icon');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                passwordIcon.classList.remove('fa-eye');
                passwordIcon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                passwordIcon.classList.remove('fa-eye-slash');
                passwordIcon.classList.add('fa-eye');
            }
        }
    </script>
</body>
</html>