// Обработчик для кнопки отметки о выполнении
let isDone = false;

// Инициализируем состояние при загрузке страницы
$(document).ready(function() {
    // Получаем начальное значение из скрытого поля
    const initialValue = $('#done').val();
    isDone = initialValue === '1';
    
    // Устанавливаем правильный класс для кнопки (как у кнопки корзины)
    updateDoneButtonAppearance();
    
    // Обновляем текст кнопки
    updateButtonText();
});

// Обработчик клика
$('#done-button').on('click', function() {
    isDone = !isDone;
    $('#done').val(isDone ? '1' : '0');
    
    // Визуальное обозначение состояния
    updateDoneButtonAppearance();
    
    // Обновляем текст кнопки
    updateButtonText();
    
    // Синхронизируем с backend без обновления страницы
    const noteId = $('#note-id').val();
    if (noteId) {
        $.ajax({
            url: `/api/notes/${noteId}/toggle-done`,
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {
                done: isDone ? 1 : 0
            },
            success: function(response) {
                console.log('Статус заметки обновлен:', response);
                
                // Показываем уведомление
                showNotification(isDone ? 'Заметка отмечена как выполненная' : 'Заметка отмечена как активная');
            },
            error: function(error) {
                console.error('Ошибка при обновлении статуса заметки:', error);
                showNotification('Не удалось обновить статус заметки', 'error');
            }
        });
    }
});

// Функция для обновления внешнего вида кнопки
function updateDoneButtonAppearance() {
    const $button = $('#done-button');
    
    if (isDone) {
        $button.removeClass('btn-outline-success btn-outline-primary btn-primary');
        $button.addClass('btn-success');
        $button.html('<i class="fas fa-check-circle"></i> Выполнено');
    } else {
        $button.removeClass('btn-success');
        $button.addClass('btn-outline-primary');
        $button.html('<i class="fas fa-circle"></i>');
    }
}

// Функция для обновления текста кнопки
function updateButtonText() {
    const buttonText = isDone ? 'Отметить как активное' : 'Отметить как выполненное';
    $('#done-button').attr('title', buttonText);
}

// Функция для отображения уведомлений
function showNotification(message, type = 'success') {
    // Проверяем, есть ли на странице контейнер для уведомлений
    if (!$('#notification-container').length) {
        $('body').append('<div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>');
    }
    
    // Создаем и отображаем уведомление
    const notificationId = 'notification-' + Date.now();
    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
    
    const notification = `
        <div id="${notificationId}" class="alert ${alertClass} alert-dismissible fade show" role="alert" style="min-width: 300px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('#notification-container').append(notification);
    
    // Автоматически скрываем уведомление через 3 секунды
    setTimeout(function() {
        $(`#${notificationId}`).fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}
