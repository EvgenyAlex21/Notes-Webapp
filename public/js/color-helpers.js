function setSelectedColor(color) {
    $('.color-option').removeClass('selected');
    $(`.color-option[data-color="${color}"]`).addClass('selected');
    const colorName = getColorName(color);
    $('.selected-color-name').text(colorName);
}
