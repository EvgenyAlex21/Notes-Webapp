$(document).ready(function() {

    $('.sidebar-filter').on('change', function() {
        const filter = $(this).val();
        
        $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
        $(`.filter-btn[data-filter="${filter}"]`).removeClass('btn-outline-secondary').addClass('btn-secondary');
        
        applyFilterByValue(filter);
    });
    
    $('.filter-btn').on('click', function() {
        const filter = $(this).data('filter');
        
        $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
        $(this).removeClass('btn-outline-secondary').addClass('btn-secondary');
        
        $(`.sidebar-filter[value="${filter}"]`).prop('checked', true);
        
        applyFilterByValue(filter);
    });
    
    /**
     * Применение фильтра по значению
     * @param {string} filterValue 
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
        
        if ($('.note-item:visible').length === 0) {
            $('.empty-container').removeClass('d-none');
        } else {
            $('.empty-container').addClass('d-none');
        }
    }
});