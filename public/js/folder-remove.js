$(document).ready(function() {
    $('body').on('click', '.remove-from-folder-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const noteId = $(this).data('id');
        
        const confirmModal = createConfirmationModal({
            title: 'Подтверждение',
            message: 'Вы уверены, что хотите удалить заметку из текущей папки и переместить во "Все заметки"?',
            confirmButtonText: 'Да, удалить из папки',
            confirmButtonClass: 'btn-primary',
            icon: 'fa-folder-minus',
            onConfirm: function() {
                removeFromFolder(noteId);
            }
        });
        
        confirmModal.show();
    });
});

function removeFromFolder(id) {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    $.ajax({
        url: `/api/notes/${id}/folder`,
        method: 'PUT',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: JSON.stringify({
            folder: null 
        }),
        success: function(response) {
            showNotification('Заметка перемещена во "Все заметки"', 'info');
            
            $(`.note-wrapper#note-${id}`).fadeOut(300, function() {
                $(this).remove();
                
                if ($('.note-wrapper:visible').length === 0) {
                    $('.notes-container').hide();
                    $('.empty-container').removeClass('d-none');
                }
            });
            
            if (typeof loadStats === 'function') {
                loadStats();
            }
            
            setTimeout(function() {
                if (typeof loadSidebarStats === 'function') {
                    loadSidebarStats();
                }
                
                if (typeof updateFolderCountersFromAPI === 'function') {
                    updateFolderCountersFromAPI();
                }
            }, 300);
        },
        error: function(error) {
            console.error('Ошибка при перемещении заметки во "Все заметки":', error);
            showNotification('Ошибка при перемещении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}
