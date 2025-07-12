$(document).ready(function() {
    $('.color-option[data-color="default"]').addClass('selected');

    $('.color-option').on('click', function() {
        const selectedColor = $(this).data('color');
        applyColorFilter(selectedColor);
    });
    
    /**
     * Применение фильтра по цвету
     * @param {string} color 
     */
    function applyColorFilter(color) {
        const notes = $('.note-wrapper');
        const notesContainer = $('.notes-container');
        
        if (color) {
            const notesArray = Array.from(notes);
            
            const selectedColorNotes = notesArray.filter(note => $(note).data('color') === color);
            const otherNotes = notesArray.filter(note => $(note).data('color') !== color);

            notesContainer.empty();
            
            selectedColorNotes.forEach(note => {
                notesContainer.append(note);
            });
            
            otherNotes.forEach(note => {
                notesContainer.append(note);
            });
            
            $('.note-wrapper').hide().fadeIn(300);
            
            $('.color-option').removeClass('selected');
            $(`.color-option[data-color="${color}"]`).addClass('selected');
            
            showNotification(`Заметки с приоритетом "${getPriorityName(color)}" показаны вверху`, 'info');
        }
    }
});
