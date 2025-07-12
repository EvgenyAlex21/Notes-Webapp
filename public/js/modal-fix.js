/**
 * Исправление проблем с aria-hidden в модальных окнах
 */
$(document).ready(function() {
    // Функция для исправления модальных окон
    function fixModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;
        
        console.log(`Исправление модального окна: ${modalId}`);
        
        // Удаляем атрибут aria-hidden
        modalElement.removeAttribute('aria-hidden');
        
        // Исправляем tabindex, если установлен -1
        if (modalElement.getAttribute('tabindex') === '-1') {
            modalElement.removeAttribute('tabindex');
        }
        
        // Добавляем роль диалога, если не установлена
        if (!modalElement.hasAttribute('role')) {
            modalElement.setAttribute('role', 'dialog');
        }
        
        // Добавляем обработчик события для предотвращения установки aria-hidden при показе
        $(modalElement).on('show.bs.modal', function() {
            setTimeout(() => {
                modalElement.removeAttribute('aria-hidden');
            }, 10);
        });
    }
    
    // Исправляем известные модальные окна
    fixModal('viewNoteModal');
    
    // Исправляем все модальные окна на странице
    document.querySelectorAll('.modal').forEach(modal => {
        fixModal(modal.id);
    });
    
    // Перехватываем метод show модального окна Bootstrap
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const originalShow = bootstrap.Modal.prototype.show;
        bootstrap.Modal.prototype.show = function() {
            // Вызываем оригинальный метод
            originalShow.apply(this, arguments);
            
            // Удаляем атрибут aria-hidden
            if (this._element) {
                setTimeout(() => {
                    this._element.removeAttribute('aria-hidden');
                }, 10);
            }
        };
    }
});
