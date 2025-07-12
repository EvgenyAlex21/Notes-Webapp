// Обработчик для кнопки отметки о выполнении
let isDone = false;

// Инициализируем состояние при загрузке страницы
$(document).ready(function() {
    // Получаем начальное значение из скрытого поля
    const initialValue = $('#done').val();
    isDone = initialValue === '1';
    
    // Устанавливаем правильный класс для кнопки
    if (isDone) {
        $('#done-button').removeClass('btn-outline-success').addClass('btn-success');
    } else {
        $('#done-button').removeClass('btn-success').addClass('btn-outline-success');
    }
    
    // Обновляем текст кнопки
    updateButtonText();
});

// Обработчик клика
$('#done-button').on('click', function() {
    isDone = !isDone;
    $('#done').val(isDone ? '1' : '0');
    
    // Визуальное обозначение состояния
    if (isDone) {
        $(this).removeClass('btn-outline-success').addClass('btn-success');
    } else {
        $(this).removeClass('btn-success').addClass('btn-outline-success');
    }
    
    // Обновляем текст кнопки
    updateButtonText();
});

// Функция для обновления текста кнопки
function updateButtonText() {
    const buttonText = isDone ? 'Выполнено' : 'Отметить как выполненное';
    $('#done-button').attr('title', buttonText);
    
    // Обновляем содержимое кнопки, если в ней есть текст
    if ($('#done-button .button-text').length) {
        $('#done-button .button-text').text(buttonText);
    }
}
