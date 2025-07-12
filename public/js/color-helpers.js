// Вспомогательные функции для работы с цветами заметок

// Функция для подсветки правильного цвета при редактировании заметки
function setSelectedColor(color) {
    $('.color-option').removeClass('selected');
    $(`.color-option[data-color="${color}"]`).addClass('selected');
    const colorName = getColorName(color);
    $('.selected-color-name').text(colorName);
}
