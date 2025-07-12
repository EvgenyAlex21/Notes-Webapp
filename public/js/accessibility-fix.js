/**
 * Фиксы доступности для модальных окон
 * Решает проблему с блокировкой aria-hidden на элементах с фокусом
 */

// Обработчик для правильного управления фокусом в модальных окнах
$(document).ready(function() {
    // Исправление для всех модальных окон Bootstrap
    $('.modal').each(function() {
        const $modal = $(this);
        
        // Перед показом модального окна
        $modal.on('show.bs.modal', function() {
            // Временно удаляем tabindex, чтобы избежать проблем с фокусом
            setTimeout(function() {
                if ($modal.attr('aria-hidden') === 'true') {
                    $modal.attr('aria-hidden', 'false');
                }
            }, 100);
        });
        
        // После закрытия модального окна
        $modal.on('hidden.bs.modal', function() {
            // Возвращаем фокус на элемент, который вызвал модальное окно
            setTimeout(function() {
                // Дополнительная проверка, чтобы избежать проблем с aria-hidden
                if (document.activeElement === document.body) {
                    $('button[data-bs-target="#' + $modal.attr('id') + '"]').first().focus();
                }
            }, 100);
        });
    });
});

// Дополнительная функция для правильного закрытия модальных окон
function safeCloseModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            // Удаляем атрибут aria-hidden перед закрытием
            modal.removeAttribute('aria-hidden');
            bsModal.hide();
        }
    }
}

// Делаем функцию доступной глобально
window.safeCloseModal = safeCloseModal;
