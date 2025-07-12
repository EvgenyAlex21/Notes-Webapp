/**
 * Фиксы доступности для модальных окон
 * Решает проблему с блокировкой aria-hidden на элементах с фокусом
 */

// Обработчик для правильного управления фокусом в модальных окнах
$(document).ready(function() {
    // Мониторинг динамически созданных модальных окон
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1 && $(node).hasClass('modal')) {
                        fixModalAccessibility($(node));
                    }
                }
            }
        });
    });
    
    // Начинаем наблюдать за изменениями в DOM
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Исправление для всех существующих модальных окон Bootstrap
    $('.modal').each(function() {
        fixModalAccessibility($(this));
    });
    
    // Функция для исправления доступности модального окна
    function fixModalAccessibility($modal) {
        // Удаляем атрибут aria-hidden
        if ($modal.attr('aria-hidden') === 'true') {
            $modal.removeAttr('aria-hidden');
        }
        
        // Добавляем роль диалога, если отсутствует
        if (!$modal.attr('role')) {
            $modal.attr('role', 'dialog');
        }
        
        // Перед показом модального окна
        $modal.on('show.bs.modal', function() {
            // Удаляем атрибут aria-hidden со всех модальных окон
            $('.modal').removeAttr('aria-hidden');
        });
        
        // После закрытия модального окна
        $modal.on('hidden.bs.modal', function() {
            // Возвращаем фокус на элемент, который вызвал модальное окно
            setTimeout(function() {
                if (document.activeElement === document.body) {
                    const targetSelector = $('button[data-bs-target="#' + $modal.attr('id') + '"]');
                    if (targetSelector.length) {
                        targetSelector.first().focus();
                    }
                }
            }, 100);
        });
    }
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
