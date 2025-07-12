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
            
            if (typeof updateNoteInterface === 'function') {
                updateNoteInterface('remove_from_folder', id);
            } else {
                $(`.note-wrapper#note-${id}`).fadeOut(300, function() {
                    $(this).remove();
                    
                    if ($('.note-wrapper:visible').length === 0) {
                        $('.notes-container').hide();
                        $('.empty-container').removeClass('d-none');
                    }
                });
                
                loadStats();
            }
        },
        error: function(error) {
            console.error('Ошибка при перемещении заметки во "Все заметки":', error);
            showNotification('Ошибка при перемещении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}
