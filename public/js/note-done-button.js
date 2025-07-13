let isDone = false;
let isStatusModified = false;

$(document).ready(function() {
    const initialValue = $('#done').val();
    isDone = initialValue === '1';
    updateDoneButtonAppearance();
    updateButtonText();
    window.addEventListener('beforeunload', function(e) {
        if (isStatusModified) {
            e.preventDefault();
            e.returnValue = 'Внесенные изменения могут быть не сохранены. Вы уверены, что хотите покинуть страницу?';
            return e.returnValue;
        }
    });
});

$('#done-button').on('click', function() {
    isDone = !isDone;
    $('#done').val(isDone ? '1' : '0');
    isStatusModified = true;
    updateDoneButtonAppearance();
    updateButtonText(true);
});

$('#edit-note-form').submit(function() {
    isStatusModified = false;
});

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

function updateButtonText(showAlert = false) {
    const buttonText = isDone ? 'Отметить как активное' : 'Отметить как выполненное';
    $('#done-button').attr('title', buttonText);
    if (showAlert) {
        const notificationMessage = isDone ? 'Задача отмечена как выполненная' : 'Задача отмечена как активная';
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(notificationMessage, isDone ? 'success' : 'info');
        } else if (typeof showNotification === 'function') {
            showNotification(notificationMessage, isDone ? 'success' : 'info');
        }
    }
}

function showNotification(message, type = 'success') {
    if (window.showNotification && typeof window.showNotification === 'function' && 
        window.showNotification.toString() !== showNotification.toString()) {
        window.showNotification(message, type);
        return;
    }
    if (!$('#app-notifications').length) {
        $('body').append('<div id="app-notifications" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; width: 300px;"></div>');
    }
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
    setTimeout(function() {
        $(`#${notificationId}`).fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}
