$(document).ready(function() {
    $('.filter-radio').on('change', function() {
        const filterId = $(this).attr('id');
        
        $('.filter-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
        
        if (filterId === 'filter-pinned') {
            $('.filter-btn[data-filter="pinned"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
        } else if (filterId === 'filter-completed') {
            $('.filter-btn[data-filter="completed"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
        } else if (filterId === 'filter-active') {
            $('.filter-btn[data-filter="active"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
        } else if (filterId === 'filter-archived') {
            $('.filter-btn[data-filter="archived"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
        } else if (filterId === 'filter-trashed') {
            $('.filter-btn[data-filter="trashed"]').removeClass('btn-outline-secondary').addClass('btn-secondary');
        }
        
        applyFilters();
    });
});
