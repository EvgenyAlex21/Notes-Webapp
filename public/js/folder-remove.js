/**
 * Скрипт для работы с удалением заметок из папок
 */
$(document).ready(function() {
    // Обработчик кнопки удаления из папки
    $('body').on('click', '.remove-from-folder-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const noteId = $(this).data('id');
        
        // Создаем модальное окно подтверждения
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
        
        // Показываем модальное окно
        confirmModal.show();
    });
});

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
            if (typeof loadStats === 'function') {
                loadStats();
            }
            
            // Специально обновляем счетчики в боковой панели
            setTimeout(function() {
                if (typeof loadSidebarStats === 'function') {
                    loadSidebarStats();
                }
                
                // Дополнительно обновляем счетчик папки в боковом меню
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
