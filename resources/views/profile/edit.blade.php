<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="user-id" content="{{ $user->id }}">
    <meta name="theme-preference" content="{{ $user->theme_preference }}">
    @if(session('status'))
        <meta name="status-message" content="{{ session('status') }}">
    @endif
    @if(session('error'))
        <meta name="error-message" content="{{ session('error') }}">
    @endif
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Профиль пользователя</title>
    <link rel="icon" href="/favicon.ico?v=1">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png?v=1">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png?v=1">
    <link rel="shortcut icon" href="/favicon.ico?v=1">
    <link rel="apple-touch-icon" href="/images/logo.png?v=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/note-selection.css') }}">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <link rel="stylesheet" href="{{ asset('css/notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/unified-notifications.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark-theme-fixes.css') }}">
    <link rel="stylesheet" href="{{ asset('css/avatar-unified.css') }}">
    <link rel="stylesheet" href="{{ asset('css/sidebar-counters.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mobile-components.css') }}">
    <link rel="stylesheet" href="{{ asset('css/improved-mobile.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="{{ asset('js/theme-manager.js') }}"></script>
    <script src="{{ asset('js/profile-manager.js') }}"></script>
    <script src="{{ asset('js/mobile-responsive.js') }}"></script>
    <script src="{{ asset('js/advanced-mobile.js') }}"></script>
    <script src="{{ asset('js/mobile-init.js') }}"></script>
    <script src="{{ asset('js/counter-updater.js') }}"></script>
    <style>
        body {
            background-color: #f5f8fa;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .header {
            background-color: #fff;
            border-bottom: 1px solid #e9ecef;
            padding: 1rem 0;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .profile-section {
            background-color: #fff;
            border-radius: 10px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        .profile-section:hover {
            box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }
        .profile-section h2 {
            margin-bottom: 1.5rem;
            color: #333;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
        }
        .profile-section h2 i {
            margin-right: 0.5rem;
            color: #007bff;
        }
        .profile-section hr {
            margin: 2rem 0;
            opacity: 0.1;
        }
        .danger-zone {
            background-color: #fff;
            border: 1px solid #dc3545;
            border-radius: 10px;
            padding: 2rem;
            margin-bottom: 2rem;
            transition: all 0.3s ease;
        }
        .danger-zone:hover {
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
        }
        .danger-zone h2 {
            color: #dc3545;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
        }
        .danger-zone h2 i {
            margin-right: 0.5rem;
        }
        .btn-danger {
            background-color: #dc3545;
        }
        .avatar-container {
            position: relative;
            width: 150px;
            height: 150px;
            margin: 0 auto 2rem;
            border-radius: 50%;
            overflow: hidden;
            background-color: #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .avatar {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid #fff;
            background-color: transparent;
            z-index: 2;
        }
        .avatar-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .avatar-placeholder i {
            font-size: 80px;
            color: #adb5bd;
        }
        .avatar-upload {
            position: absolute;
            bottom: 5px;
            right: 5px;
            background-color: #007bff;
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
        }
        .avatar-upload:hover {
            background-color: #0069d9;
            transform: scale(1.05);
        }
        #avatar-file {
            display: none;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .stats-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 1.2rem 1rem;
            text-align: center;
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
            position: relative;
            overflow: hidden;
        }
        .stats-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #007bff, #0056b3);
        }
        .stats-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
            border-color: #007bff;
        }
        .stats-card h3 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.3rem;
            color: #007bff;
            line-height: 1.2;
        }
        .stats-card p {
            color: #6c757d;
            margin-bottom: 0;
            font-size: 0.85rem;
            font-weight: 500;
        }
        .stats-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            opacity: 0.8;
        }
        .activity-section {
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid #e9ecef;
        }
        .activity-section h5 {
            margin-bottom: 1rem;
            color: #495057;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .activity-section h5::before {
            content: '📊';
            font-size: 1.1rem;
        }
        .chart-container {
            position: relative;
            height: 120px;
            margin-top: 1rem;
        }
        .theme-selector {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }
        .theme-option {
            flex: 1;
            text-align: center;
            padding: 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin: 0 0.5rem;
            border: 2px solid transparent;
        }
        .theme-option.active {
            border-color: #007bff;
            box-shadow: 0 2px 8px rgba(0,123,255,0.3);
        }
        .theme-option:hover {
            transform: translateY(-3px);
        }
        .theme-option i {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            display: block;
        }
        .theme-light {
            background-color: #fff;
            color: #212529;
        }
        .theme-dark {
            background-color: #343a40;
            color: #f8f9fa;
        }
        .theme-auto {
            background: linear-gradient(135deg, #fff 50%, #343a40 50%);
            color: #212529;
        }
        #profile-tabs {
            margin-bottom: 2rem;
        }
        .nav-tabs .nav-link {
            color: #495057;
            font-weight: 500;
            padding: 0.75rem 1.25rem;
            border-radius: 0;
            border: none;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
        }
        .nav-tabs .nav-link.active {
            color: #007bff;
            background-color: transparent;
            border-bottom: 2px solid #007bff;
        }
        .nav-tabs .nav-link:hover:not(.active) {
            border-bottom: 2px solid #dee2e6;
        }
        
        body.dark-theme {
            background-color: #121212;
        }
        body.dark-theme .header {
            background-color: #1e1e1e;
            border-color: #333;
        }
        body.dark-theme .profile-section, 
        body.dark-theme .danger-zone {
            background-color: #1e1e1e;
        }
        body.dark-theme .profile-section h2 {
            color: #e0e0e0;
        }
        body.dark-theme .profile-section h2 i {
            color: #3f8cff;
        }
        body.dark-theme .danger-zone {
            border-color: #dc3545;
        }
        body.dark-theme .form-control,
        body.dark-theme .form-select {
            background-color: #2d2d2d;
            border-color: #444;
            color: #e0e0e0;
        }
        body.dark-theme .form-control:focus {
            background-color: #333;
        }
        body.dark-theme .form-control.is-valid {
            background-color: rgba(25, 135, 84, 0.2);
            border-color: #198754;
        }
        body.dark-theme .form-control.is-invalid {
            background-color: rgba(220, 53, 69, 0.2);
            border-color: #dc3545;
        }
        body.dark-theme .valid-feedback {
            color: #198754;
        }
        body.dark-theme .invalid-feedback {
            color: #dc3545;
        }
        body.dark-theme .avatar-container {
            background-color: #2d2d2d;
        }
        body.dark-theme .avatar-container::before {
            color: #6c757d;
        }
        body.dark-theme .stats-card {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            border-color: #495057;
        }
        body.dark-theme .stats-card::before {
            background: linear-gradient(90deg, #3f8cff, #2c7be5);
        }
        body.dark-theme .stats-card:hover {
            border-color: #3f8cff;
            box-shadow: 0 8px 25px rgba(63, 140, 255, 0.2);
        }
        body.dark-theme .stats-card h3 {
            color: #3f8cff;
        }
        body.dark-theme .stats-card p {
            color: #adb5bd;
        }
        body.dark-theme .activity-section {
            background-color: #2c3e50;
            border-color: #495057;
        }
        body.dark-theme .activity-section h5 {
            color: #f8f9fa;
        }
        body.dark-theme .nav-tabs .nav-link {
            color: #adb5bd;
        }
        body.dark-theme .nav-tabs .nav-link.active {
            color: #3f8cff;
            border-bottom-color: #3f8cff;
        }
        body.dark-theme .nav-tabs .nav-link:hover:not(.active) {
            border-bottom-color: #495057;
        }
        body.dark-theme .theme-light {
            background-color: #2d2d2d;
            color: #e0e0e0;
        }
        
        @media (max-width: 768px) {
            .profile-section, .danger-zone {
                padding: 1.5rem;
            }
            .theme-selector {
                flex-direction: column;
            }
            .theme-option {
                margin: 0.5rem 0;
            }
            .avatar-container {
                width: 120px;
                height: 120px;
            }
            .avatar {
                width: 120px;
                height: 120px;
            }
            .avatar-upload {
                width: 35px;
                height: 35px;
            }
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 0.8rem;
            }
            .stats-card {
                padding: 1rem 0.8rem;
            }
            .stats-card h3 {
                font-size: 1.5rem;
            }
            .activity-section {
                padding: 1rem;
            }
            .chart-container {
                height: 100px;
            }
        }
        
        @media (max-width: 480px) {
            .stats-card h3 {
                font-size: 1.3rem;
            }
            .stats-card p {
                font-size: 0.8rem;
            }
            .chart-container {
                height: 80px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center header-mobile-container">
                <h1 class="h3 mb-0">
                    <i class="fas fa-user me-2"></i> 
                    <span class="fw-bold full-title">Профиль пользователя</span>
                    <span class="fw-bold short-title">Профиль</span>
                </h1>
                <div class="d-flex align-items-center ms-auto header-mobile-actions">
                    <a href="{{ route('notes.index') }}" class="btn btn-outline-secondary mobile-action-btn">
                        <i class="fas fa-arrow-left"></i> <span class="d-none-mobile">К заметкам</span>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="container mb-5">

        <div class="row">
            <div class="col-lg-4 mb-4">
                <div class="profile-section text-center">
                    <div class="avatar-container">
                        <img src="{{ $user->avatar_url }}" alt="{{ $user->name }}" class="avatar">
                        <div class="avatar-placeholder">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                    
                    <form id="avatar-form" action="{{ route('profile.update') }}" method="POST" enctype="multipart/form-data" style="display: none;">
                        @csrf
                        @method('PUT')
                        <input type="file" name="avatar" id="avatar-file" accept="image/jpeg,image/png,image/jpg,image/gif">
                    </form>
                    
                    <div class="mb-3">
                        <button id="upload-avatar-btn" type="button" class="btn btn-primary btn-sm me-2">
                            <i class="fas fa-upload me-1"></i> Загрузить фото
                        </button>
                        
                        @if($user->avatar && $user->avatar !== 'default-avatar.png')
                        <form action="{{ route('profile.avatar.remove') }}" method="POST" style="display: inline;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-outline-danger btn-sm">
                                <i class="fas fa-trash me-1"></i> Удалить аватар
                            </button>
                        </form>
                        @endif
                    </div>
                    
                    <h3 class="mb-1">{{ $user->name }}</h3>
                    <p class="text-muted mb-3">{{ '@' . $user->username }}</p>
                    
                    <div class="d-flex justify-content-around mb-3">
                        <div>
                            <h5>{{ $notesCount }}</h5>
                            <small class="text-muted">Заметки</small>
                        </div>
                        <div>
                            <h5>{{ $foldersCount }}</h5>
                            <small class="text-muted">Папки</small>
                        </div>
                        <div>
                            <h5>{{ $notesWithFiles }}</h5>
                            <small class="text-muted">Файлы</small>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h2><i class="fas fa-chart-bar"></i> Статистика</h2>
                    
                    <div class="stats-grid">
                        <div class="stats-card">
                            <div class="stats-icon">📝</div>
                            <h3>{{ $notesCount }}</h3>
                            <p>Всего заметок</p>
                        </div>
                        
                        <div class="stats-card">
                            <div class="stats-icon">📁</div>
                            <h3>{{ $foldersCount }}</h3>
                            <p>Всего папок</p>
                        </div>
                        
                        <div class="stats-card">
                            <div class="stats-icon">📎</div>
                            <h3>{{ $notesWithFiles }}</h3>
                            <p>Заметок с файлами</p>
                        </div>
                    </div>
                    
                    @if(count($recentNotes) > 0)
                    <div class="activity-section">
                        <h5>Активность за последнее время</h5>
                        <div class="chart-container">
                            <canvas id="activityChart"></canvas>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
            
            <div class="col-lg-8">
                <ul class="nav nav-tabs" id="profile-tabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="account-tab" data-bs-toggle="tab" data-bs-target="#account" type="button" role="tab" aria-controls="account" aria-selected="true">
                            <i class="fas fa-user me-1"></i> Аккаунт
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="security-tab" data-bs-toggle="tab" data-bs-target="#security" type="button" role="tab" aria-controls="security" aria-selected="false">
                            <i class="fas fa-lock me-1"></i> Безопасность
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="preferences-tab" data-bs-toggle="tab" data-bs-target="#preferences" type="button" role="tab" aria-controls="preferences" aria-selected="false">
                            <i class="fas fa-cog me-1"></i> Настройки
                        </button>
                    </li>
                </ul>
                
                <div class="tab-content" id="profile-tabs-content">
                    <div class="tab-pane fade show active" id="account" role="tabpanel" aria-labelledby="account-tab">
                        <div class="profile-section">
                            <h2><i class="fas fa-info-circle"></i> Основная информация</h2>
                            
                            <form action="{{ route('profile.update') }}" method="POST" id="profile-form" enctype="multipart/form-data">
                                @csrf
                                @method('PUT')
                                
                                <div class="mb-3">
                                    <label for="name" class="form-label">Имя</label>
                                    <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ old('name', $user->name) }}" required>
                                    @error('name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                
                                <div class="mb-3">
                                    <label for="username" class="form-label">Логин</label>
                                    <div class="input-group">
                                        <span class="input-group-text">@</span>
                                        <input type="text" class="form-control @error('username') is-invalid @enderror" id="username" name="username" value="{{ old('username', $user->username) }}" required>
                                        @error('username')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="form-text">
                                        Логин используется для входа в систему и должен быть уникальным.
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control @error('email') is-invalid @enderror" id="email" name="email" value="{{ old('email', $user->email) }}" required>
                                    @error('email')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-1"></i> Сохранить изменения
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="security" role="tabpanel" aria-labelledby="security-tab">
                        <div class="profile-section">
                            <h2><i class="fas fa-key"></i> Изменение пароля</h2>
                            
                            <form action="{{ route('profile.password') }}" method="POST" id="password-form">
                                @csrf
                                @method('PUT')
                                
                                <div class="mb-3">
                                    <label for="current_password" class="form-label">Текущий пароль</label>
                                    <div class="input-group">
                                        <input type="password" class="form-control @error('current_password') is-invalid @enderror" id="current_password" name="current_password" required>
                                        <button class="btn btn-outline-secondary toggle-password" type="button" data-target="current_password">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        @error('current_password')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="password" class="form-label">Новый пароль</label>
                                    <div class="input-group">
                                        <input type="password" class="form-control @error('password') is-invalid @enderror" id="password" name="password" required>
                                        <button class="btn btn-outline-secondary toggle-password" type="button" data-target="password">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        @error('password')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="form-text">
                                        <ul class="mb-0 ps-3 mt-1">
                                            <li>Минимум 8 символов</li>
                                            <li>Минимум одна заглавная буква</li>
                                            <li>Минимум одна строчная буква</li>
                                            <li>Минимум одна цифра</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="password_confirmation" class="form-label">Подтверждение пароля</label>
                                    <div class="input-group">
                                        <input type="password" class="form-control" id="password_confirmation" name="password_confirmation" required>
                                        <button class="btn btn-outline-secondary toggle-password" type="button" data-target="password_confirmation">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-key me-1"></i> Изменить пароль
                                    </button>
                                </div>
                            </form>
                            
                            <hr>
                            
                            <div class="danger-zone">
                                <h2><i class="fas fa-exclamation-triangle"></i> Опасная зона</h2>
                                <p class="text-danger">Внимание! Удаление аккаунта приведет к потере всех данных и не может быть отменено.</p>
                                
                                <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteAccountModal">
                                    <i class="fas fa-trash-alt me-2"></i> Удалить аккаунт
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="preferences" role="tabpanel" aria-labelledby="preferences-tab">
                        <div class="profile-section">
                            <h2><i class="fas fa-palette"></i> Внешний вид</h2>
                            
                            <form action="{{ route('profile.preferences.update') }}" method="POST" id="preferences-form">
                                @csrf
                                @method('PUT')
                                
                                <p class="mb-3">Выберите предпочтительную тему оформления:</p>
                                
                                <div class="theme-selector">
                                    <div class="theme-option theme-light {{ $user->theme_preference == 'light' ? 'active' : '' }}" data-theme="light">
                                        <i class="fas fa-sun"></i>
                                        <div>Светлая</div>
                                    </div>
                                    <div class="theme-option theme-dark {{ $user->theme_preference == 'dark' ? 'active' : '' }}" data-theme="dark">
                                        <i class="fas fa-moon"></i>
                                        <div>Темная</div>
                                    </div>
                                    <div class="theme-option theme-auto {{ $user->theme_preference == 'auto' ? 'active' : '' }}" data-theme="auto">
                                        <i class="fas fa-adjust"></i>
                                        <div>Авто</div>
                                    </div>
                                </div>
                                
                                <input type="hidden" name="theme_preference" id="theme_preference" value="{{ $user->theme_preference }}">
                                
                                <hr>
                                
                                <h2><i class="fas fa-bell"></i> Уведомления</h2>
                                
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="notification_preference" name="notification_preference" {{ $user->notification_preference ? 'checked' : '' }}>
                                    <label class="form-check-label" for="notification_preference">Включить уведомления</label>
                                </div>
                                
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-1"></i> Сохранить настройки
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="modal fade" id="deleteAccountModal" tabindex="-1" aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteAccountModalLabel">Подтверждение удаления</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        <strong>Это действие необратимо!</strong> Все ваши заметки, папки и персональные данные будут удалены.
                    </div>
                    
                    <p>Чтобы подтвердить удаление, введите свой пароль:</p>
                    
                    <form id="deleteAccountForm" action="{{ route('profile.destroy') }}" method="POST">
                        @csrf
                        @method('DELETE')
                        
                        <div class="mb-3">
                            <div class="input-group">
                                <input type="password" class="form-control @error('password') is-invalid @enderror" id="confirm_password" name="password" placeholder="Введите пароль" required>
                                <button class="btn btn-outline-secondary toggle-password" type="button" data-target="confirm_password">
                                    <i class="fas fa-eye"></i>
                                </button>
                                @error('password')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                    <button type="button" class="btn btn-danger" id="delete-account-btn">
                        <i class="fas fa-trash-alt me-1"></i> Удалить аккаунт
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);
                
                if (input.type === 'password') {
                    input.type = 'text';
                    this.querySelector('i').classList.remove('fa-eye');
                    this.querySelector('i').classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    this.querySelector('i').classList.remove('fa-eye-slash');
                    this.querySelector('i').classList.add('fa-eye');
                }
            });
        });
        
        @if(count($recentNotes) > 0)
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        const dates = [];
        const counts = {};
        
        @foreach($recentNotes as $index => $note)
            const date{{ $index }} = new Date('{{ $note->created_at }}');
            const formattedDate{{ $index }} = date{{ $index }}.toLocaleDateString('ru-RU');
            dates.push(formattedDate{{ $index }});
            counts[formattedDate{{ $index }}] = (counts[formattedDate{{ $index }}] || 0) + 1;
        @endforeach
        
        const uniqueDates = [...new Set(dates)];
        const activityCounts = uniqueDates.map(date => counts[date]);
        
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const primaryColor = isDarkTheme ? '#3f8cff' : '#007bff';
        const secondaryColor = isDarkTheme ? 'rgba(63, 140, 255, 0.1)' : 'rgba(0, 123, 255, 0.1)';
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: uniqueDates,
                datasets: [{
                    label: 'Заметки',
                    data: activityCounts,
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            maxRotation: 0,
                            color: isDarkTheme ? '#adb5bd' : '#6c757d'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 11
                            },
                            color: isDarkTheme ? '#adb5bd' : '#6c757d'
                        }
                    }
                },
                elements: {
                    bar: {
                        borderRadius: 4
                    }
                }
            }
        });
        @endif
    </script>
</body>
</html>