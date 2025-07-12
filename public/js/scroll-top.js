$(document).ready(function() {
    $('body').append(`
        <button id="scrollTopBtn" class="scroll-top-btn" aria-label="Прокрутить страницу наверх">
            <i class="fas fa-arrow-up"></i>
        </button>
    `);

    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('#scrollTopBtn').fadeIn();
        } else {
            $('#scrollTopBtn').fadeOut();
        }
    });
    
    $('#scrollTopBtn').click(function() {
        $('html, body').animate({scrollTop: 0}, 500);
        return false;
    });
});
