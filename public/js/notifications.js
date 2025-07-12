// Глобальная переменная для хранения всех активных уведомлений
let activeNotifications = [];
let notificationContainer = null;
let notificationCheckInterval = null;
let lastCheckTime = 0;
// Счетчик для уникальных идентификаторов уведомлений
let notificationCounter = 0;

// Инициализация системы уведомлений
function initNotificationsSystem() {
    console.log('Инициализация системы уведомлений...');
    
    // Создаем контейнер для уведомлений, если его еще нет
    if (!document.getElementById('notification-container')) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Добавляем стили для контейнера
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 350px;
                max-height: 90vh;
                overflow-y: auto;
                scrollbar-width: thin;
                padding-right: 5px;
            }
            
            .notification-container::-webkit-scrollbar {
                width: 5px;
            }
            
            .notification-container::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .notification-container::-webkit-scrollbar-thumb {
                background-color: rgba(0,0,0,0.2);
                border-radius: 10px;
            }
            
            .notification-item {
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 12px 15px;
                animation: notification-slide-in 0.3s ease-out;
                transition: transform 0.2s, opacity 0.2s;
                width: 100%;
                position: relative;
                border-left: 4px solid #4CAF50;
            }
            
            .notification-item.closing {
                transform: translateX(400px);
                opacity: 0;
            }
            
            .notification-item.error {
                border-left-color: #f44336;
            }
            
            .notification-item.warning {
                border-left-color: #ff9800;
            }
            
            .notification-item.info {
                border-left-color: #2196F3;
            }
            
            .notification-item.reminder {
                border-left-color: #7e57c2;
            }
            
            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #333;
                margin: 0;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #999;
                font-size: 16px;
                padding: 0;
                margin: 0;
                line-height: 1;
            }
            
            .notification-content {
                color: #555;
                font-size: 13px;
                word-break: break-word;
            }
            
            .notification-actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 8px;
                gap: 8px;
            }
            
            .notification-actions button {
                background: none;
                border: none;
                font-size: 13px;
                cursor: pointer;
                padding: 2px 8px;
                border-radius: 4px;
            }
            
            .notification-actions .primary {
                color: #2196F3;
                font-weight: 600;
            }
            
            .notification-actions .secondary {
                color: #757575;
            }
            
            @keyframes notification-slide-in {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            /* Темная тема */
            body.dark-theme .notification-item {
                background: #333;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            
            body.dark-theme .notification-title {
                color: #f1f1f1;
            }
            
            body.dark-theme .notification-content {
                color: #ccc;
            }
            
            body.dark-theme .notification-close {
                color: #aaa;
            }
            
            body.dark-theme .notification-actions .primary {
                color: #64B5F6;
            }
            
            body.dark-theme .notification-actions .secondary {
                color: #bdbdbd;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Запускаем проверку напоминаний каждую минуту
    if (!notificationCheckInterval) {
        checkReminders();
        notificationCheckInterval = setInterval(checkReminders, 60000); // Каждую минуту
        console.log('Настроена регулярная проверка напоминаний');
    }
    
    // Запрашиваем разрешение на показ браузерных уведомлений
    requestNotificationPermission();
}

// Запрос разрешения на браузерные уведомления
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                console.log('Разрешение на уведомления:', permission);
            });
        }
    }
}

// Проверка напоминаний на сервере
function checkReminders() {
    // Пропускаем, если с последней проверки прошло менее 30 секунд
    const now = Date.now();
    if (now - lastCheckTime < 30000) {
        return;
    }
    
    lastCheckTime = now;
    console.log('Проверка напоминаний...');
    
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: '/api/reminders/check',
        method: 'GET',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function(response) {
            if (response.success && response.reminders) {
                console.log(`Получено ${response.reminders.length} напоминаний`);
                
                // Показываем каждое напоминание
                response.reminders.forEach(reminder => {
                    showReminderNotification(reminder);
                });
            }
        },
        error: function(xhr) {
            console.error('Ошибка при проверке напоминаний:', xhr.responseText);
        }
    });
}

// Показывает уведомление о напоминании
function showReminderNotification(reminder) {
    const notificationId = 'reminder-' + reminder.id;
    
    // Проверяем, не показано ли уже это напоминание
    if (activeNotifications.includes(notificationId)) {
        return;
    }
    
    // Создаем уведомление
    const title = reminder.note_name || 'Напоминание';
    const content = reminder.description || 'Пора проверить заметку';
    
    // Добавляем это напоминание в список активных
    activeNotifications.push(notificationId);
    
    // Показываем уведомление
    showNotification({
        id: notificationId,
        title: title,
        message: content,
        type: 'reminder',
        autoClose: false,
        actions: [
            {
                text: 'Открыть',
                class: 'primary',
                onClick: function() {
                    window.location.href = `/notes/${reminder.note_id}`;
                }
            },
            {
                text: 'Отметить как выполнено',
                class: 'secondary',
                onClick: function() {
                    markReminderAsDone(reminder.id, notificationId);
                }
            }
        ]
    });
    
    // Также показываем браузерное уведомление, если доступно и разрешено
    showBrowserNotification(title, content, `/notes/${reminder.note_id}`);
}

// Отмечает напоминание как выполненное
function markReminderAsDone(reminderId, notificationId) {
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    console.log('Отмечаем напоминание как выполненное. ID:', reminderId);
    
    $.ajax({
        url: `/reminders/${reminderId}/done`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function(response) {
            console.log('Напоминание отмечено как выполненное:', response);
            closeNotification(notificationId);
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при отметке напоминания:', error || xhr.responseText);
            showNotification({
                title: 'Ошибка',
                message: 'Не удалось отметить напоминание как выполненное',
                type: 'error',
                autoClose: true,
                duration: 5000
            });
        }
    });
}

// Показывает браузерное уведомление
function showBrowserNotification(title, message, url) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: message,
            icon: '/favicon.ico'
        });
        
        notification.onclick = function() {
            window.focus();
            if (url) {
                window.location.href = url;
            }
            notification.close();
        };
    }
}

/**
 * Отображает красивое всплывающее уведомление (обновленная версия)
 * @param {string} message - Текст уведомления
 * @param {string} type - Тип уведомления (info, success, warning, danger)
 * @param {number} duration - Длительность отображения в миллисекундах
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Инкрементируем счетчик для уникального ID
    notificationCounter++;
    const notificationId = `notification-${Date.now()}-${notificationCounter}`;
    
    // Определяем иконку в зависимости от типа уведомления
    let icon;
    switch(type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        case 'danger':
        case 'error':
            type = 'danger'; // Нормализуем тип
            icon = 'fa-exclamation-circle';
            break;
        default:
            icon = 'fa-info-circle';
            type = 'info'; // Нормализуем тип
    }
    
    // Создаем контейнер для уведомлений, если он не существует
    if (!notificationContainer) {
        initNotificationsSystem();
    }
    
    // Создаем элемент уведомления (стиль как на фото 3)
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = `notification alert bg-${type === 'info' ? 'info' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'} ${type === 'warning' ? 'text-dark' : 'text-white'} d-flex align-items-center fade show mb-2`;
    notification.style.cssText = 'border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative; width: 300px;';
    notification.innerHTML = `
        <i class="fas ${icon} me-2" style="font-size: 1.2rem;"></i>
        <div class="flex-grow-1" style="font-size: 0.9rem;">${message}</div>
        <button type="button" class="btn-close btn-close-white ms-3" data-bs-dismiss="alert" aria-label="Close" style="font-size: 0.8rem;"></button>
        <div class="notification-progress-bar"></div>
    `;
    
    // Добавляем в контейнер
    notificationContainer.appendChild(notification);
    
    // Добавляем в массив активных уведомлений
    const notifObj = {
        id: notificationId,
        element: notification,
        createdAt: Date.now(),
        duration: duration,
        timeout: null
    };
    activeNotifications.push(notifObj);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Настройка автозакрытия
    if (duration > 0) {
        const progressBar = notification.querySelector('.notification-progress-bar');
        progressBar.style.animationDuration = `${duration}ms`;
        progressBar.classList.add('active');
        
        notifObj.timeout = setTimeout(() => {
            closeNotification(notificationId);
        }, duration);
    }
    
    // Добавляем обработчик для кнопки закрытия
    const closeBtn = notification.querySelector('.notification-close-btn');
    closeBtn.addEventListener('click', () => {
        closeNotification(notificationId);
    });
    
    // Если уведомлений много, прокручиваем контейнер вниз
    notificationContainer.scrollTop = notificationContainer.scrollHeight;
    
    return notificationId;
}

// Закрывает уведомление по его ID
function closeNotification(id) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.classList.add('closing');
        
        // Удаляем из DOM после завершения анимации
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Удаляем из списка активных
            const index = activeNotifications.indexOf(id);
            if (index !== -1) {
                activeNotifications.splice(index, 1);
            }
        }, 300);
    }
}

// Закрывает все активные уведомления
function closeAllNotifications() {
    const ids = [...activeNotifications];
    ids.forEach(id => closeNotification(id));
}

// Инициализируем систему уведомлений при загрузке страницы
$(document).ready(function() {
    setTimeout(initNotificationsSystem, 1000);
    
    // Обновляем внешний вид уведомлений при изменении темы
    $(document).on('themeChanged', function(e, theme) {
        console.log('Тема изменена на:', theme);
        // Здесь можно добавить код для обновления стилей уведомлений
    });
});

// Экспортируем функции для внешнего использования
window.showNotification = showNotification;
window.closeNotification = closeNotification;
window.closeAllNotifications = closeAllNotifications;
window.checkReminders = checkReminders;
