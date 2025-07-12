// Обработчик для кнопки отметки о выполнении
let isDone = false;

// Переменная для отслеживания изменений статуса
let isStatusModified = false;

// Инициализируем состояние при загрузке страницы
$(document).ready(function() {
    // Получаем начальное значение из скрытого поля
    const initialValue = $('#done').val();
    isDone = initialValue === '1';
    
    // Устанавливаем правильный класс для кнопки (как у кнопки корзины)
    updateDoneButtonAppearance();
    
    // Обновляем текст кнопки
    updateButtonText();
    
    // Добавляем обработчик на закрытие страницы без сохранения
    window.addEventListener('beforeunload', function(e) {
        if (isStatusModified) {
            // Отменяем действие по умолчанию для большинства браузеров
            e.preventDefault();
            // Chrome требует возврата строки
            e.returnValue = 'Внесенные изменения могут быть не сохранены. Вы уверены, что хотите покинуть страницу?';
            return e.returnValue;
        }
    });
});

// Обработчик клика
$('#done-button').on('click', function() {
    isDone = !isDone;
    $('#done').val(isDone ? '1' : '0');
    // Отмечаем, что статус изменен
    isStatusModified = true;
    
    // Визуальное обозначение состояния
    updateDoneButtonAppearance();
    
    // Обновляем текст кнопки и показываем уведомление
    updateButtonText(true);
});

// Сбрасываем флаг после успешного сохранения формы
$('#edit-note-form').submit(function() {
    isStatusModified = false;
});

// Функция для обновления внешнего вида кнопки
function updateDoneButtonAppearance() {
    const $button = $('#done-button');
    
    if (isDone) {
        $button.removeClass('btn-outline-success btn-outline-primary btn-primary');
        $button.addClass('btn-success');
        $button.html('<i class="fas fa-check-circle"></i>');
    } else {
        $button.removeClass('btn-success');
        $button.addClass('btn-outline-primary');
        $button.html('<i class="fas fa-circle"></i>');
    }
}

// Функция для обновления текста кнопки
function updateButtonText(showAlert = false) {
    const buttonText = isDone ? 'Отметить как активное' : 'Отметить как выполненное';
    $('#done-button').attr('title', buttonText);
    
    // Показываем уведомление о смене статуса только если передан флаг showAlert
    if (showAlert) {
        const notificationMessage = isDone ? 'Задача отмечена как выполненная' : 'Задача отмечена как активная';
        // Используем глобальную функцию showNotification, чтобы уведомления соответствовали общему стилю
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(notificationMessage, isDone ? 'success' : 'info');
        } else if (typeof showNotification === 'function') {
            showNotification(notificationMessage, isDone ? 'success' : 'info');
        }
    }
}

// Функция для отображения уведомлений
function showNotification(message, type = 'success') {
    // Используем глобальную функцию showNotification, только если это не эта же функция
    if (window.showNotification && typeof window.showNotification === 'function' && 
        window.showNotification.toString() !== showNotification.toString()) {
        window.showNotification(message, type);
        return;
    }
    
    // Запасной вариант, если глобальная функция недоступна
    console.log("Используется запасная версия showNotification");
    
    // Проверяем, есть ли на странице контейнер для уведомлений
    if (!$('#app-notifications').length) {
        $('body').append('<div id="app-notifications" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; width: 300px;"></div>');
    }
    
    // Определяем цвет фона, бордера и иконку в зависимости от типа
    let bgClass = 'bg-info';
    let textClass = 'text-white';
    let icon = 'fas fa-info-circle';
    
    switch(type) {
        case 'success':
            bgClass = 'bg-success';
            textClass = 'text-white';
            icon = 'fas fa-check-circle';
            break;
        case 'error':
        case 'danger':
            bgClass = 'bg-danger';
            textClass = 'text-white';
            icon = 'fas fa-exclamation-triangle';
            break;
        case 'warning':
            bgClass = 'bg-warning';
            textClass = 'text-dark';
            icon = 'fas fa-exclamation-circle';
            break;
        case 'info':
            bgClass = 'bg-info';
            textClass = 'text-white';
            icon = 'fas fa-info-circle';
            break;
    }
    
    // Создаем и отображаем уведомление
    const notificationId = 'notification-' + Date.now();
    
    const notification = `
        <div id="${notificationId}" class="alert ${bgClass} ${textClass} d-flex align-items-center fade show mb-2" role="alert" 
             style="border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative;">
            <i class="${icon} me-2" style="font-size: 1.2rem;"></i>
            <div class="flex-grow-1" style="font-size: 0.9rem;">${message}</div>
            <button type="button" class="btn-close btn-close-white ms-3" data-bs-dismiss="alert" aria-label="Close" style="font-size: 0.8rem;"></button>
        </div>
    `;
    
    $('#app-notifications').append(notification);
    
    // Автоматически скрываем уведомление через 3 секунды
    setTimeout(function() {
        $(`#${notificationId}`).fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}
