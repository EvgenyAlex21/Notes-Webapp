let activeNotifications = [];
let notificationContainer = null;
let notificationCheckInterval = null;
let lastCheckTime = 0;
let notificationCounter = 0;

function initNotificationsSystem() {
    if (!document.getElementById('notification-container')) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);

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
    if (!notificationCheckInterval) {
        setTimeout(checkReminders, 2000);
        notificationCheckInterval = setInterval(checkReminders, 60000);
    }
    requestNotificationPermission();
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {});
        }
    }
}

function checkReminders() {
    const now = Date.now();
    if (now - lastCheckTime < 30000) {
        return;
    }
    lastCheckTime = now;
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    $.ajax({
        url: '/api/reminders/check',
        method: 'GET',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function(response) {
            if (response.success && response.reminders) {
                response.reminders.forEach(reminder => {
                    const notificationId = 'reminder-' + reminder.id;
                    const alreadyShown = activeNotifications.some(n => n.id === notificationId);
                    if (!alreadyShown) {
                        showReminderNotification(reminder);
                    }
                });
            }
        },
        error: function(xhr) {}
    });
}

function showReminderNotification(reminder) {
    const notificationId = 'reminder-' + reminder.id;
    if (activeNotifications.some(n => n.id === notificationId)) {
        return;
    }
    const title = reminder.note_name || 'Напоминание';
    const content = reminder.description || 'Пора проверить заметку';
    showReminderNotificationUI({
        id: notificationId,
        title: title,
        message: content,
        type: 'reminder',
        autoClose: false,
        reminder: reminder
    });
    showBrowserNotification(title, content, `/notes/${reminder.note_id}`);
}

function markReminderAsDone(reminderId, notificationId) {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    $.ajax({
        url: `/api/reminders/${reminderId}/done`,
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        success: function(response) {
            closeNotification(notificationId);
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

function showReminderNotificationUI(options) {
    const notificationId = options.id || `reminder-${Date.now()}`;
    const reminder = options.reminder;
    if (!notificationContainer) {
        initNotificationsSystem();
    }
    const isOverdue = reminder.is_overdue || false;
    const statusText = isOverdue ? '⚠️ Просрочено:' : '🔔';
    const statusClass = isOverdue ? 'overdue' : 'active';
    let overdueText = '';
    if (isOverdue) {
        if (reminder.reminder_at) {
            const date = new Date(reminder.reminder_at);
            overdueText = `<div class="overdue-text">Напоминание просрочено: ${date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>`;
        } else if (reminder.time_diff) {
            overdueText = `<div class="overdue-text">Напоминание просрочено: ${reminder.time_diff.replace('hours', 'часов').replace('hour', 'час').replace('minutes', 'минут').replace('minute', 'минута')}</div>`;
        } else {
            overdueText = `<div class="overdue-text">Напоминание просрочено</div>`;
        }
    }
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
    if (isOverdue) {
        notification.style.borderLeftColor = '#ff5722';
    }
    notificationContainer.appendChild(notification);
    activeNotifications.push({
        id: notificationId,
        element: notification,
        type: 'reminder',
        reminderId: reminder.id,
        createdAt: Date.now()
    });
    notificationContainer.scrollTop = notificationContainer.scrollHeight;
    return notificationId;
}

function snoozeReminder(reminderId, notificationId, minutes) {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
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
            closeReminderNotification(notificationId);
            showNotification(`Напоминание отложено на ${minutes} минут`, 'info', 3000);
        },
        error: function(xhr, status, error) {
            showNotification('Не удалось отложить напоминание', 'error', 5000);
        }
    });
}

function openNoteFromReminder(noteId, notificationId) {
    closeReminderNotification(notificationId);
    if (typeof viewNote === 'function') {
        viewNote(noteId);
    } else {
        window.location.href = `/notes/${noteId}`;
    }
}

function closeReminderNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.classList.add('closing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = activeNotifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                activeNotifications.splice(index, 1);
            }
        }, 300);
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    notificationCounter++;
    const notificationId = `notification-${Date.now()}-${notificationCounter}`;
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
            type = 'danger';
            icon = 'fa-exclamation-circle';
            break;
        default:
            icon = 'fa-info-circle';
            type = 'info';
    }
    if (!notificationContainer) {
        initNotificationsSystem();
    }
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
    notificationContainer.appendChild(notification);
    const notifObj = {
        id: notificationId,
        element: notification,
        createdAt: Date.now(),
        duration: duration,
        timeout: null
    };
    activeNotifications.push(notifObj);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    if (duration > 0) {
        const progressBar = notification.querySelector('.notification-progress-bar');
        progressBar.style.animationDuration = `${duration}ms`;
        progressBar.classList.add('active');
        notifObj.timeout = setTimeout(() => {
            closeNotification(notificationId);
        }, duration);
    }
    const closeBtn = notification.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeNotification(notificationId);
        });
    }
    notificationContainer.scrollTop = notificationContainer.scrollHeight;
    return notificationId;
}

function closeNotification(id) {
    const notificationIndex = activeNotifications.findIndex(n => n.id === id);
    if (notificationIndex !== -1) {
        const notificationObj = activeNotifications[notificationIndex];
        const notification = notificationObj.element;
        if (notification) {
            notification.classList.add('closing');
            if (notificationObj.timeout) {
                clearTimeout(notificationObj.timeout);
            }
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                activeNotifications.splice(notificationIndex, 1);
            }, 300);
        }
    }
}

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

$(document).ready(function() {
    setTimeout(initNotificationsSystem, 1000);
    $(document).on('themeChanged', function(e, theme) {});
});

window.showNotification = showNotification;
window.closeNotification = closeNotification;
window.closeAllNotifications = closeAllNotifications;
window.checkReminders = checkReminders;
window.showReminderNotificationUI = showReminderNotificationUI;
window.closeReminderNotification = closeReminderNotification;
window.openNoteFromReminder = openNoteFromReminder;
window.markReminderAsDone = markReminderAsDone;
window.snoozeReminder = snoozeReminder;