$(document).ready(function() {
    function fixModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;
        
        console.log(`Исправление модального окна: ${modalId}`);
        
        modalElement.removeAttribute('aria-hidden');
        
        if (modalElement.getAttribute('tabindex') === '-1') {
            modalElement.removeAttribute('tabindex');
        }
        
        if (!modalElement.hasAttribute('role')) {
            modalElement.setAttribute('role', 'dialog');
        }
        
        $(modalElement).on('show.bs.modal', function() {
            setTimeout(() => {
                modalElement.removeAttribute('aria-hidden');
            }, 10);
        });
    }
    
    fixModal('viewNoteModal');
    
    document.querySelectorAll('.modal').forEach(modal => {
        fixModal(modal.id);
    });
    
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const originalShow = bootstrap.Modal.prototype.show;
        bootstrap.Modal.prototype.show = function() {
            originalShow.apply(this, arguments);
            if (this._element) {
                setTimeout(() => {
                    this._element.removeAttribute('aria-hidden');
                }, 10);
            }
        };
    }
});