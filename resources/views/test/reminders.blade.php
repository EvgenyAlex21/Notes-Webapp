<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Тестирование напоминаний</title>
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
            margin-bottom: 20px;
        }
        .notification-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">
                    <i class="fas fa-bell me-2"></i>
                    <span class="fw-bold">Тестирование напоминаний</span>
                </h1>
                <a href="/notes" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left"></i> Назад к заметкам
                </a>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Создать тестовое напоминание</h5>
                    </div>
                    <div class="card-body">
                        <form id="create-reminder-form">
                            <div class="mb-3">
                                <label for="seconds" class="form-label">Через сколько секунд должно сработать напоминание:</label>
                                <select class="form-select" id="seconds" name="seconds">
                                    <option value="5">5 секунд</option>
                                    <option value="10" selected>10 секунд</option>
                                    <option value="30">30 секунд</option>
                                    <option value="60">1 минута</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-plus-circle"></i> Создать напоминание
                            </button>
                        </form>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle"></i> Напоминание будет отображаться как уведомление в правом нижнем углу экрана.
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header bg-secondary text-white">
                        <h5 class="mb-0">Последние напоминания</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-striped mb-0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Заметка</th>
                                        <th>Время напоминания</th>
                                        <th>Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($notes as $note)
                                    <tr>
                                        <td>{{ $note->id }}</td>
                                        <td>{{ $note->name }}</td>
                                        <td>{{ $note->reminder_at }}</td>
                                        <td>
                                            @if($note->reminder_at > now())
                                                <span class="badge bg-warning">Ожидает</span>
                                            @else
                                                <span class="badge bg-success">Активно</span>
                                            @endif
                                        </td>
                                    </tr>
                                    @empty
                                    <tr>
                                        <td colspan="4" class="text-center py-3">
                                            <i class="fas fa-info-circle"></i> Нет активных напоминаний
                                        </td>
                                    </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">Инструкция</h5>
                    </div>
                    <div class="card-body">
                        <ol class="mb-0">
                            <li class="mb-2">Выберите время, через которое должно сработать напоминание</li>
                            <li class="mb-2">Нажмите кнопку "Создать напоминание"</li>
                            <li class="mb-2">Дождитесь появления уведомления</li>
                            <li>Проверьте функциональность кнопок в уведомлении</li>
                        </ol>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="mb-0">Проверка напоминаний вручную</h5>
                    </div>
                    <div class="card-body">
                        <button id="check-reminders" class="btn btn-warning w-100">
                            <i class="fas fa-sync"></i> Проверить напоминания
                        </button>
                        
                        <div class="mt-3">
                            <div class="alert alert-light border">
                                <p class="mb-0"><strong>Последняя проверка:</strong> <span id="last-check">Никогда</span></p>
                                <p class="mb-0 mt-1"><strong>Результат:</strong> <span id="check-result">-</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="/js/notifications.js"></script>
    <script>
        $(document).ready(function() {
            // Обработчик отправки формы
            $('#create-reminder-form').on('submit', function(e) {
                e.preventDefault();
                
                const seconds = $('#seconds').val();
                
                // Блокируем кнопку на время запроса
                const submitBtn = $(this).find('button[type="submit"]');
                submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Создаем...');
                
                $.ajax({
                    url: '/test/create-reminder',
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    data: {
                        seconds: seconds
                    },
                    success: function(response) {
                        // Выводим уведомление
                        showNotification({
                            title: 'Напоминание создано',
                            message: `Напоминание будет активировано через ${seconds} секунд`,
                            type: 'success',
                            autoClose: true,
                            duration: 3000
                        });
                        
                        // Обновляем таблицу
                        setTimeout(function() {
                            location.reload();
                        }, parseInt(seconds) * 1000 + 1000);
                        
                        // Восстанавливаем кнопку
                        submitBtn.prop('disabled', false).html('<i class="fas fa-plus-circle"></i> Создать напоминание');
                    },
                    error: function(xhr) {
                        console.error('Ошибка при создании напоминания:', xhr.responseText);
                        
                        // Выводим уведомление об ошибке
                        showNotification({
                            title: 'Ошибка',
                            message: 'Не удалось создать напоминание',
                            type: 'error',
                            autoClose: true
                        });
                        
                        // Восстанавливаем кнопку
                        submitBtn.prop('disabled', false).html('<i class="fas fa-plus-circle"></i> Создать напоминание');
                    }
                });
            });
            
            // Обработчик проверки напоминаний вручную
            $('#check-reminders').on('click', function() {
                $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Проверяем...');
                
                // Устанавливаем время последней проверки
                $('#last-check').text(new Date().toLocaleTimeString());
                
                // Вызываем функцию проверки напоминаний из notifications.js
                window.checkReminders();
                
                // Через 2 секунды восстанавливаем кнопку
                setTimeout(() => {
                    $(this).prop('disabled', false).html('<i class="fas fa-sync"></i> Проверить напоминания');
                    $('#check-result').text('Проверка выполнена');
                }, 2000);
            });
        });
    </script>
</body>
</html>
