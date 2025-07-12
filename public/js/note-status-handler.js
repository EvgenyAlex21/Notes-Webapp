$(document).ready(function() {
    console.log('Инициализация note-status-handler.js');
    
    /**
     * Обновляет внешний вид заметки
     * @param {jQuery} noteElement 
     * @param {boolean} isDone 
     */
    function updateNoteAppearance(noteElement, isDone) {
        console.log('Обновление внешнего вида заметки:', { 
            noteId: noteElement.attr('id'),
            isDone: isDone
        });
        
        noteElement.attr('data-done', isDone);
        
        if (isDone) {
            noteElement.addClass('completed');
            noteElement.find('.note-done-toggle').removeClass('bg-warning').addClass('bg-success').text('Выполнено');
            
            const dropdownBtn = noteElement.find('.toggle-done-btn');
            if (dropdownBtn.length) {
                dropdownBtn.html('<i class="fas fa-circle"></i> Активно');
                dropdownBtn.attr('title', 'Активно');
            }
        } else {
            noteElement.removeClass('completed');
            noteElement.find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning').text('Активно');
            
            const dropdownBtn = noteElement.find('.toggle-done-btn');
            if (dropdownBtn.length) {
                dropdownBtn.html('<i class="fas fa-check-circle"></i> Выполнено');
                dropdownBtn.attr('title', 'Выполнено');
            }
        }
    }
    
    $(document).on('note:statusChanged', function(event, data) {
        console.log('Событие note:statusChanged получено:', data);
        const { noteId, isDone } = data;
        
        $(`.note-wrapper[id="note-${noteId}"], [id="note-${noteId}"], .note-item[id="note-${noteId}"]`).each(function() {
            updateNoteAppearance($(this), isDone);
        });
    });
    
    window.updateNoteAppearance = updateNoteAppearance;
});
