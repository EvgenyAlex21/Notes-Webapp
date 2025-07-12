/**
 * Функционал сортировки и фильтрации по цвету
 */
$(document).ready(function() {
    // По умолчанию выбираем серый цвет (без приоритета)
    $('.color-option[data-color="default"]').addClass('selected');
    
    // Обработчик клика по цветовым опциям в сайдбаре
    $('.color-option').on('click', function() {
        const selectedColor = $(this).data('color');
        applyColorFilter(selectedColor);
    });
    
    /**
     * Применение фильтра по цвету
     * @param {string} color - выбранный цвет для приоритизации
     */
    function applyColorFilter(color) {
        // Получаем все заметки
        const notes = $('.note-wrapper');
        const notesContainer = $('.notes-container');
        
        // Если цвет выбран и это не действие сброса
        if (color) {
            // Копируем в массив для сортировки
            const notesArray = Array.from(notes);
            
            // Разделяем заметки на те, что имеют выбранный цвет и все остальные
            const selectedColorNotes = notesArray.filter(note => $(note).data('color') === color);
            const otherNotes = notesArray.filter(note => $(note).data('color') !== color);
            
            // Сначала добавляем заметки с выбранным цветом
            notesContainer.empty();
            
            // Добавляем заметки с выбранным цветом
            selectedColorNotes.forEach(note => {
                notesContainer.append(note);
            });
            
            // Затем добавляем все остальные заметки
            otherNotes.forEach(note => {
                notesContainer.append(note);
            });
            
            // Визуальный эффект обновления списка
            $('.note-wrapper').hide().fadeIn(300);
            
            // Добавляем индикатор активного цвета
            $('.color-option').removeClass('selected');
            $(`.color-option[data-color="${color}"]`).addClass('selected');
            
            // Показываем сообщение об активном фильтре
            showNotification(`Заметки с приоритетом "${getPriorityName(color)}" показаны вверху`, 'info');
        }
    }
});
