// Функции для работы с папками

// Функция для удаления заметки из папки (перемещение в "Все заметки")
function removeFromFolder(id) {
    // Получаем CSRF-токен из meta-тега
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
            folder: null // Устанавливаем папку в null (удаление из папки)
        }),
        success: function(response) {
            showNotification('Заметка перемещена во "Все заметки"', 'info');
            
            // Используем универсальную функцию обновления интерфейса
            if (typeof updateNoteInterface === 'function') {
                updateNoteInterface('remove_from_folder', id);
            } else {
                // Запасной вариант, если универсальная функция недоступна
                // Анимируем удаление элемента из текущего вида
                $(`.note-wrapper#note-${id}`).fadeOut(300, function() {
                    $(this).remove();
                    
                    // Проверим, остались ли ещё заметки
                    if ($('.note-wrapper:visible').length === 0) {
                        $('.notes-container').hide();
                        $('.empty-container').removeClass('d-none');
                    }
                });
                
                // Обновляем статистику
                loadStats();
            }
        },
        error: function(error) {
            console.error('Ошибка при перемещении заметки во "Все заметки":', error);
            showNotification('Ошибка при перемещении заметки: ' + (error.responseJSON?.message || 'Неизвестная ошибка'), 'danger');
        }
    });
}
