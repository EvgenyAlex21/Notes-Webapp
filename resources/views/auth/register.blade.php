<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Регистрация - Notes App</title>
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
                    <h1 class="auth-title">Регистрация</h1>

                    @if($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form method="POST" action="{{ route('register') }}">
                        @csrf
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="name" name="name" placeholder="Имя" value="{{ old('name') }}" required autofocus>
                            <label for="name">Имя</label>
                        </div>
                        
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="username" name="username" placeholder="Логин" value="{{ old('username') }}" required>
                            <label for="username">Логин</label>
                        </div>

                        <div class="form-floating mb-3">
                            <input type="email" class="form-control" id="email" name="email" placeholder="name@example.com" value="{{ old('email') }}" required>
                            <label for="email">Email</label>
                        </div>

                        <div class="form-floating mb-3 password-field">
                            <input type="password" class="form-control" id="password" name="password" placeholder="Пароль" required>
                            <label for="password">Пароль</label>
                            <button type="button" class="password-toggle" onclick="togglePassword('password')" title="Показать/скрыть пароль">
                                <i class="fas fa-eye" id="password-icon"></i>
                            </button>
                        </div>
                        <div class="alert alert-info mb-3">
                            <strong>Пароль должен содержать:</strong>
                            <ul class="mb-0 mt-1">
                                <li>Минимум 8 символов</li>
                                <li>Хотя бы одну заглавную букву</li>
                                <li>Хотя бы одну строчную букву</li>
                                <li>Хотя бы одну цифру</li>
                            </ul>
                        </div>

                        <div class="form-floating mb-3 password-field">
                            <input type="password" class="form-control" id="password_confirmation" name="password_confirmation" placeholder="Подтверждение пароля" required>
                            <label for="password_confirmation">Подтверждение пароля</label>
                            <button type="button" class="password-toggle" onclick="togglePassword('password_confirmation')" title="Показать/скрыть пароль">
                                <i class="fas fa-eye" id="password_confirmation-icon"></i>
                            </button>
                        </div>

                        <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
                    </form>

                    <div class="auth-footer mt-4">
                        <p>Уже есть аккаунт? <a href="{{ route('login') }}">Войти</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
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
        
        document.addEventListener('DOMContentLoaded', function() {
            const darkMode = localStorage.getItem('darkMode');
            if (darkMode === 'enabled') {
                document.body.classList.add('dark-theme');
            }
            
            const passwordInput = document.getElementById('password');
            const passwordConfirmInput = document.getElementById('password_confirmation');
            
            const passwordRulesDiv = document.createElement('div');
            passwordRulesDiv.className = 'password-rules mb-3';
            passwordRulesDiv.innerHTML = `
                <div class="rule d-flex align-items-center mb-1" data-rule="length">
                    <div class="rule-icon me-2" style="width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #dc3545; color: white;">✖</div>
                    <span>Минимум 8 символов</span>
                </div>
                <div class="rule d-flex align-items-center mb-1" data-rule="uppercase">
                    <div class="rule-icon me-2" style="width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #dc3545; color: white;">✖</div>
                    <span>Хотя бы одна заглавная буква</span>
                </div>
                <div class="rule d-flex align-items-center mb-1" data-rule="lowercase">
                    <div class="rule-icon me-2" style="width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #dc3545; color: white;">✖</div>
                    <span>Хотя бы одна строчная буква</span>
                </div>
                <div class="rule d-flex align-items-center mb-1" data-rule="digit">
                    <div class="rule-icon me-2" style="width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #dc3545; color: white;">✖</div>
                    <span>Хотя бы одна цифра</span>
                </div>
            `;
            
            const alertInfo = document.querySelector('.alert-info');
            if (alertInfo) {
                alertInfo.parentNode.replaceChild(passwordRulesDiv, alertInfo);
            }
            
            function validatePassword(password) {
                const rules = {
                    length: password.length >= 8,
                    uppercase: /[A-ZА-Я]/.test(password),
                    lowercase: /[a-zа-я]/.test(password),
                    digit: /[0-9]/.test(password)
                };
                
                for (const rule in rules) {
                    const ruleElement = document.querySelector(`.rule[data-rule="${rule}"]`);
                    if (ruleElement) {
                        const iconElement = ruleElement.querySelector('.rule-icon');
                        if (rules[rule]) {
                            iconElement.style.backgroundColor = '#28a745';
                            iconElement.textContent = '✓';
                        } else {
                            iconElement.style.backgroundColor = '#dc3545';
                            iconElement.textContent = '✖';
                        }
                    }
                }
                return Object.values(rules).every(rule => rule === true);
            }
            
            passwordInput.addEventListener('input', function() {
                validatePassword(this.value);
            });
            
            passwordConfirmInput.addEventListener('input', function() {
                if (passwordInput.value && this.value && passwordInput.value !== this.value) {
                    if (!document.getElementById('password-match-feedback')) {
                        const matchFeedback = document.createElement('div');
                        matchFeedback.id = 'password-match-feedback';
                        matchFeedback.className = 'text-danger mt-2';
                        matchFeedback.innerHTML = '<i class="fas fa-times-circle me-1"></i> Пароли не совпадают';
                        this.parentNode.insertAdjacentElement('afterend', matchFeedback);
                    }
                } else {
                    const matchFeedback = document.getElementById('password-match-feedback');
                    if (matchFeedback) {
                        matchFeedback.remove();
                    }
                }
            });
        });
    </script>
</body>
</html>