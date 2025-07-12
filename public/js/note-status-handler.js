/**
 * Обработчик для корректной работы статусов заметок во всех режимах
 * (обычный, архив, корзина, папки)
 */

$(document).ready(function() {
    console.log('Инициализация note-status-handler.js');
    
    /**
     * Обновляет внешний вид заметки в соответствии с её статусом выполнения
     * @param {jQuery} noteElement - jQuery элемент заметки
     * @param {boolean} isDone - статус выполнения
     */
    function updateNoteAppearance(noteElement, isDone) {
        console.log('Обновление внешнего вида заметки:', { 
            noteId: noteElement.attr('id'),
            isDone: isDone
        });
        
        // Обновляем атрибут данных
        noteElement.attr('data-done', isDone);
        
        // Обновляем классы и текст
        if (isDone) {
            noteElement.addClass('completed');
            noteElement.find('.note-done-toggle').removeClass('bg-warning').addClass('bg-success').text('Выполнено');
            
            // Обновляем кнопки в контекстном меню
            const dropdownBtn = noteElement.find('.toggle-done-btn');
            if (dropdownBtn.length) {
                dropdownBtn.html('<i class="fas fa-circle"></i> Отметить как активное');
                dropdownBtn.attr('title', 'Отметить как активное');
            }
        } else {
            noteElement.removeClass('completed');
            noteElement.find('.note-done-toggle').removeClass('bg-success').addClass('bg-warning').text('Активно');
            
            // Обновляем кнопки в контекстном меню
            const dropdownBtn = noteElement.find('.toggle-done-btn');
            if (dropdownBtn.length) {
                dropdownBtn.html('<i class="fas fa-check-circle"></i> Отметить как выполненное');
                dropdownBtn.attr('title', 'Отметить как выполненное');
            }
        }
    }
    
    // Обработчик события изменения статуса заметки
    $(document).on('note:statusChanged', function(event, data) {
        console.log('Событие note:statusChanged получено:', data);
        const { noteId, isDone } = data;
        
        // Обновляем все экземпляры заметки с тем же ID
        $(`.note-wrapper[id="note-${noteId}"], [id="note-${noteId}"], .note-item[id="note-${noteId}"]`).each(function() {
            updateNoteAppearance($(this), isDone);
        });
    });
    
    // Экспортируем функцию обновления внешнего вида для использования в других скриптах
    window.updateNoteAppearance = updateNoteAppearance;
});
