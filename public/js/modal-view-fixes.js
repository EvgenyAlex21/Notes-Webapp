$(document).ready(function() {
    console.log('[modal-view-fixes] Инициализация исправлений для модальных окон');
    
    function fixViewNoteModal() {
        const currentPath = window.location.pathname;
        let noteSource = null;
        
        if (currentPath.includes('/trash') || currentPath.includes('/new-trash')) {
            noteSource = 'trash';
            console.log('[modal-view-fixes] Страница корзины');
        } else if (currentPath.includes('/archive')) {
            noteSource = 'archive';
            console.log('[modal-view-fixes] Страница архива');
        }
        
        $(document).on('shown.bs.modal', '#viewNoteModal', function() {
            console.log('[modal-view-fixes] Модальное окно просмотра заметки открыто');
            
            if (noteSource === 'trash') {
                $('#viewNoteEditBtn').hide();
                
                if (!$('#trash-note-warning').length) {
                    $('#viewNoteContent').prepend(`
                        <div id="trash-note-warning" class="alert alert-danger mb-3">
                            <i class="fas fa-trash-alt me-2"></i>
                            <strong>Внимание!</strong> Эта заметка находится в корзине.
                            Редактирование недоступно.
                        </div>
                    `);
                }
                console.log('[modal-view-fixes] Кнопка редактирования скрыта, добавлено предупреждение');
            } 
            else if (noteSource === 'archive') {
                if (!$('#archive-note-warning').length) {
                    $('#viewNoteContent').prepend(`
                        <div id="archive-note-warning" class="alert alert-info mb-3">
                            <i class="fas fa-archive me-2"></i>
                            <strong>Информация:</strong> Эта заметка находится в архиве.
                        </div>
                    `);
                }
                console.log('[modal-view-fixes] Добавлено уведомление об архивной заметке');
            }
            
            if (noteSource && !$('#modal-header-status').length) {
                const badgeHtml = noteSource === 'trash' 
                    ? '<span id="modal-header-status" class="badge bg-danger ms-2">В корзине</span>' 
                    : '<span id="modal-header-status" class="badge bg-info ms-2">Архивировано</span>';
                
                $('#viewNoteModalLabel').append(badgeHtml);
                console.log('[modal-view-fixes] Добавлена плашка в заголовок модального окна');
            }
        });
    }

    fixViewNoteModal();
});
