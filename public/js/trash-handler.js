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
    
    // Переопределение функции очистки корзины
    const originalEmptyTrash = window.emptyTrash;
    if (typeof originalEmptyTrash === 'function') {
        window.emptyTrash = function() {
            console.log('Переопределенная функция emptyTrash вызвана');
            // Получаем все идентификаторы заметок в корзине
            const noteElements = $('.note-wrapper');
            console.log('Найдено элементов в корзине:', noteElements.length);
            
            if (noteElements.length === 0) {
                showNotification('Корзина уже пуста', 'info');
                return;
            }
            
            const noteIds = Array.from(noteElements).map(el => {
                // Получаем id заметки (возвращаем полный ID, 
                // обработка префикса "note-" будет выполнена в executeEmptyTrash)
                const fullId = $(el).attr('id');
                console.log('Заметка для удаления:', fullId);
                return fullId;
            });
            
            // Создаем и показываем модальное окно подтверждения
            const modal = createConfirmationModal({
                id: 'emptyTrashModal',
                title: 'Очистка корзины',
                message: `
                    <div class="d-flex align-items-start mb-3">
                        <i class="fas fa-info-circle text-warning me-2 mt-1"></i>
                        <div>
                            <p class="mb-1">Вы уверены, что хотите удалить все заметки из корзины?</p>
                            <p class="text-muted small mb-0">Заметки будут удалены безвозвратно.</p>
                        </div>
                    </div>
                `,
                confirmButtonText: 'Удалить',
                cancelButtonText: 'Отмена',
                confirmButtonClass: 'btn-danger',
                icon: 'fa-trash',
                onConfirm: function() {
                    // Вызываем оригинальный executeEmptyTrash с правильными ID
                    executeEmptyTrash(noteIds);
                }
            });
            
            modal.show();
        };
        
        console.log('Функция emptyTrash переопределена для корзины');
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
    
    // Обработчики событий для обновления интерфейса
    $(document).on('note:restored', function(event, noteId) {
        console.log('Событие note:restored получено для заметки:', noteId);
    });
    
    $(document).on('note:forceDeleted', function(event, noteId) {
        console.log('Событие note:forceDeleted получено для заметки:', noteId);
    });
});
