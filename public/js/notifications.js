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
            
            .notification-item.reminder.overdue {
                border-left-color: #ff5722;
                background: #fff3e0;
            }
            
            .overdue-text {
                font-size: 12px;
                color: #ff5722;
                font-style: italic;
                margin-top: 4px;
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
            
            body.dark-theme .notification-item.reminder.overdue {
                background: #3e2723;
            }
            
            body.dark-theme .overdue-text {
                color: #ff8a65;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Запускаем первую проверку напоминаний через 2 секунды после загрузки
    // и затем проверяем каждую минуту
    if (!notificationCheckInterval) {
        setTimeout(checkReminders, 2000); // Первая проверка через 2 секунды
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
            console.log('[REMINDER] Ответ сервера:', response);
            if (response.success && response.reminders) {
                console.log(`Получено ${response.reminders.length} напоминаний`);
                
                // Показываем каждое напоминание (только если оно еще не показано)
                response.reminders.forEach(reminder => {
                    const notificationId = 'reminder-' + reminder.id;
                    const alreadyShown = activeNotifications.some(n => n.id === notificationId);
                    
                    if (!alreadyShown) {
                        console.log('Показываем новое напоминание:', reminder.note_name);
                        showReminderNotification(reminder);
                    } else {
                        console.log('Напоминание уже показано:', reminder.note_name);
                    }
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
    if (activeNotifications.some(n => n.id === notificationId)) {
        return;
    }
    
    // Создаем уведомление
    const title = reminder.note_name || 'Напоминание';
    const content = reminder.description || 'Пора проверить заметку';
    
    // Показываем красивое уведомление
    showReminderNotificationUI({
        id: notificationId,
        title: title,
        message: content,
        type: 'reminder',
        autoClose: false,
        reminder: reminder
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
        url: `/api/reminders/${reminderId}/done`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function(response) {
            console.log('Напоминание отмечено как выполненное:', response);
            closeNotification(notificationId);
            // Если на странице редактирования — сбрасываем напоминание в UI
            if (window.location.pathname.match(/\/notes\//)) {
                if ($('#reminder-type').length) {
                    $('#reminder-type').val('none').trigger('change');
                }
                if ($('#reminder-date').length) {
                    $('#reminder-date').val('');
                }
                if ($('#reminder-actions').length) {
                    $('#reminder-actions').hide();
                }
            }
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
 * Показывает красивое уведомление о напоминании с кнопками действий
 */
function showReminderNotificationUI(options) {
    const notificationId = options.id || `reminder-${Date.now()}`;
    const reminder = options.reminder;
    
    // Создаем контейнер для уведомлений, если он не существует
    if (!notificationContainer) {
        initNotificationsSystem();
    }
    
    // Определяем статус напоминания
    const isOverdue = reminder.is_overdue || false;
    const statusText = isOverdue ? '⚠️ Просрочено:' : '🔔';
    const statusClass = isOverdue ? 'overdue' : 'active';

    // Формируем корректный текст для просроченного напоминания
    let overdueText = '';
    if (isOverdue) {
        // Если есть точная дата, показываем ее
        if (reminder.reminder_at) {
            const date = new Date(reminder.reminder_at);
            overdueText = `<div class="overdue-text">Напоминание просрочено: ${date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>`;
        } else if (reminder.time_diff) {
            overdueText = `<div class="overdue-text">Напоминание просрочено: ${reminder.time_diff.replace('hours', 'часов').replace('hour', 'час').replace('minutes', 'минут').replace('minute', 'минута')}</div>`;
        } else {
            overdueText = `<div class="overdue-text">Напоминание просрочено</div>`;
        }
    }

    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = `notification-item reminder ${statusClass}`;
    notification.innerHTML = `
        <div class="notification-header">
            <h5 class="notification-title">${statusText} ${options.title}</h5>
            <button class="notification-close" onclick="closeReminderNotification('${notificationId}')">&times;</button>
        </div>
        <div class="notification-content">
            ${options.message}
            ${overdueText}
        </div>
        <div class="notification-actions">
            <button type="button" class="secondary" onclick="closeReminderNotification('${notificationId}')">Закрыть</button>
            <button type="button" class="secondary" onclick="snoozeReminder(${reminder.id}, '${notificationId}', 15)">+15 мин</button>
            <button type="button" class="secondary" onclick="markReminderAsDone(${reminder.id}, '${notificationId}')">Выполнено</button>
            <button type="button" class="primary" onclick="openNoteFromReminder(${reminder.note_id}, '${notificationId}')">Открыть</button>
        </div>
    `;
    
    // Добавляем стили для просроченных напоминаний
    if (isOverdue) {
        notification.style.borderLeftColor = '#ff5722';
    }
    
    // Добавляем в контейнер
    notificationContainer.appendChild(notification);
    
    // Добавляем в список активных уведомлений
    activeNotifications.push({
        id: notificationId,
        element: notification,
        type: 'reminder',
        reminderId: reminder.id,
        createdAt: Date.now()
    });
    
    // Прокручиваем контейнер вниз
    notificationContainer.scrollTop = notificationContainer.scrollHeight;
    
    return notificationId;
}

/**
 * Отложить напоминание на указанное количество минут
 */
function snoozeReminder(reminderId, notificationId, minutes) {
    // Получаем CSRF-токен из meta-тега
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    console.log('Откладываем напоминание на', minutes, 'минут. ID:', reminderId);
    
    // Вычисляем новое время напоминания
    const newReminderTime = new Date();
    newReminderTime.setMinutes(newReminderTime.getMinutes() + minutes);
    
    $.ajax({
        url: `/api/notes/${reminderId}/reminder`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        data: {
            reminder_at: newReminderTime.toISOString()
        },
        success: function(response) {
            console.log('Напоминание отложено:', response);
            closeReminderNotification(notificationId);
            showNotification(`Напоминание отложено на ${minutes} минут`, 'info', 3000);
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при откладывании напоминания:', error || xhr.responseText);
            showNotification('Не удалось отложить напоминание', 'error', 5000);
        }
    });
}

/**
 * Открывает заметку из напоминания
 */
function openNoteFromReminder(noteId, notificationId) {
    closeReminderNotification(notificationId);
    // Открываем модальное окно просмотра заметки, если функция доступна
    if (typeof viewNote === 'function') {
        viewNote(noteId);
    } else {
        window.location.href = `/notes/${noteId}`;
    }
}

/**
 * Закрывает уведомление о напоминании
 */
function closeReminderNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.classList.add('closing');
        
        // Удаляем из DOM после завершения анимации
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Удаляем из списка активных
            const index = activeNotifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                activeNotifications.splice(index, 1);
            }
        }, 300);
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
    const closeBtn = notification.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeNotification(notificationId);
        });
    }
    
    // Если уведомлений много, прокручиваем контейнер вниз
    notificationContainer.scrollTop = notificationContainer.scrollHeight;
    
    return notificationId;
}

// Закрывает уведомление по его ID
function closeNotification(id) {
    const notificationIndex = activeNotifications.findIndex(n => n.id === id);
    if (notificationIndex !== -1) {
        const notificationObj = activeNotifications[notificationIndex];
        const notification = notificationObj.element;
        
        if (notification) {
            notification.classList.add('closing');
            
            // Очищаем таймер, если есть
            if (notificationObj.timeout) {
                clearTimeout(notificationObj.timeout);
            }
            
            // Удаляем из DOM после завершения анимации
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                
                // Удаляем из списка активных
                activeNotifications.splice(notificationIndex, 1);
            }, 300);
        }
    }
}

// Закрывает все активные уведомления
function closeAllNotifications() {
    const notifications = [...activeNotifications];
    notifications.forEach(notification => {
        if (notification.type === 'reminder') {
            closeReminderNotification(notification.id);
        } else {
            closeNotification(notification.id);
        }
    });
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
window.showReminderNotificationUI = showReminderNotificationUI;
window.closeReminderNotification = closeReminderNotification;
window.openNoteFromReminder = openNoteFromReminder;
window.markReminderAsDone = markReminderAsDone;
window.snoozeReminder = snoozeReminder;
