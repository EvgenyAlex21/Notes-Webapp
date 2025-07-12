$(document).ready(function() {
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
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    $('.modal').each(function() {
        fixModalAccessibility($(this));
    });

    function fixModalAccessibility($modal) {
        if ($modal.attr('aria-hidden') === 'true') {
            $modal.removeAttr('aria-hidden');
        }
        
        if (!$modal.attr('role')) {
            $modal.attr('role', 'dialog');
        }
        
        $modal.on('show.bs.modal', function() {
            $('.modal').removeAttr('aria-hidden');
        });
        
        $modal.on('hidden.bs.modal', function() {
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

function safeCloseModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            modal.removeAttribute('aria-hidden');
            bsModal.hide();
        }
    }
}

window.safeCloseModal = safeCloseModal;