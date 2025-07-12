/**
 * Скрипт для кнопки автоскроллинга наверх страницы
 */
$(document).ready(function() {
    // Создаем кнопку скроллинга
    $('body').append(`
        <button id="scrollTopBtn" class="scroll-top-btn" aria-label="Прокрутить страницу наверх">
            <i class="fas fa-arrow-up"></i>
        </button>
    `);
    
    // Показываем/скрываем кнопку при скролле
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('#scrollTopBtn').fadeIn();
        } else {
            $('#scrollTopBtn').fadeOut();
        }
    });
    
    // Обработчик клика - плавный скролл наверх
    $('#scrollTopBtn').click(function() {
        $('html, body').animate({scrollTop: 0}, 500);
        return false;
    });
});
