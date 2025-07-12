/**
 * Синхронизация фильтров между радиокнопками в сайдбаре и кнопками в верхней плашке
 */
$(document).ready(function() {
    // Обработчик радиокнопок в сайдбаре
    $('.sidebar-filter').on('change', function() {
        const filter = $(this).val();
        
        // Обновляем состояние кнопок в верхней плашке
        $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
        $(`.filter-btn[data-filter="${filter}"]`).removeClass('btn-outline-secondary').addClass('btn-secondary');
        
        // Применяем фильтрацию
        applyFilterByValue(filter);
    });
    
    // Обработчик кнопок в верхней плашке
    $('.filter-btn').on('click', function() {
        const filter = $(this).data('filter');
        
        // Обновляем состояние кнопок
        $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
        $(this).removeClass('btn-outline-secondary').addClass('btn-secondary');
        
        // Обновляем состояние радиокнопок в сайдбаре
        $(`.sidebar-filter[value="${filter}"]`).prop('checked', true);
        
        // Применяем фильтрацию
        applyFilterByValue(filter);
    });
    
    /**
     * Применение фильтра по значению
     * @param {string} filterValue - значение фильтра (all, active, completed, pinned)
     */
    function applyFilterByValue(filterValue) {
        const notes = $('.note-item');
        
        switch (filterValue) {
            case 'all':
                notes.show();
                break;
            case 'active':
                notes.hide();
                notes.filter(function() {
                    return $(this).data('done') === false;
                }).show();
                break;
            case 'completed':
                notes.hide();
                notes.filter(function() {
                    return $(this).data('done') === true;
                }).show();
                break;
            case 'pinned':
                notes.hide();
                notes.filter(function() {
                    return $(this).data('pinned') === true;
                }).show();
                break;
        }
        
        // Показываем сообщение, если нет заметок для отображения
        if ($('.note-item:visible').length === 0) {
            $('.empty-container').removeClass('d-none');
        } else {
            $('.empty-container').addClass('d-none');
        }
    }
});
