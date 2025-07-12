/**
 * Обработчик специально для страницы корзины
 * Добавляет дополнительную логику для корректной работы с восстановлением и удалением заметок
 */
$(document).ready(function() {
    console.log('Инициализация trash-handler.js');
    
    // Определяем, на какой странице мы находимся
    const isTrashPage = window.location.pathname === '/notes/trash';
    
    if (!isTrashPage) return;
    
    // Переопределяем обработку пустого состояния для корзины
    const originalCheckEmptyState = window.checkEmptyState;
    
    // Если функция существует, переопределяем её
    if (typeof originalCheckEmptyState === 'function') {
        window.checkEmptyState = function() {
            if ($('.note-wrapper:visible').length === 0) {
                // В корзине используем правильные классы
                $('.trash-notes-container, .notes-container').hide();
                $('.empty-trash-container, .empty-container').removeClass('d-none');
            }
        };
        
        console.log('Функция checkEmptyState переопределена для корзины');
    }
    
    // Если мы на странице корзины, добавляем обработку для специальных селекторов
    $(document).on('click', '.restore-note-btn', function(e) {
        e.preventDefault();
        const noteId = $(this).data('note-id');
        console.log('Восстановление заметки из корзины (trash-handler):', noteId);
        
        // Анимируем исчезновение заметки с конкретными селекторами для корзины
        $(`.note-wrapper#note-${noteId}, #note-${noteId}`).fadeOut(300, function() {
            $(this).remove();
            
            // После удаления элемента проверяем, остались ли ещё заметки
            if ($('.note-wrapper:visible').length === 0) {
                $('.trash-notes-container, .notes-container').hide();
                $('.empty-trash-container, .empty-container').removeClass('d-none');
            }
        });
    });
    
    $(document).on('click', '.force-delete-note-btn', function(e) {
        e.preventDefault();
        const noteId = $(this).data('note-id');
        console.log('Полное удаление заметки из корзины (trash-handler):', noteId);
    });
});
