/**
 * Получение названия приоритета по цвету заметки
 * @param {string} color - Цвет заметки
 * @return {string} - Название приоритета
 */
function getPriorityName(color) {
    const priorityMap = {
        'default': 'Без приоритета',
        'red': 'Критически важно',
        'orange': 'Очень важно',
        'yellow': 'Важно',
        'green': 'Средний приоритет',
        'blue': 'Стандартная задача',
        'purple': 'Планирование',
        'pink': 'Личное',
        'teal': 'Идея',
        'cyan': 'Информация',
        'indigo': 'Обучение',
        'brown': 'Ожидание',
        'black': 'Архивное',
        'navy': 'Ночное'
    };
    
    return priorityMap[color] || priorityMap['default'];
}

/**
 * Получить цвет заметки в формате hex по названию цвета
 * @param {string} colorName - Название цвета
 * @return {string} - Hex-код цвета
 */
function getNoteColorHex(colorName) {
    const colorMap = {
        'default': '#6c757d', // Серый (Без приоритета)
        'red': '#dc3545',     // Красный (Критически важно)
        'orange': '#fd7e14',  // Оранжевый (Очень важно)
        'yellow': '#ffc107',  // Желтый (Важно)
        'green': '#28a745',   // Зеленый (Средний приоритет)
        'blue': '#007bff',    // Синий (Стандартная задача)
        'purple': '#6f42c1',  // Пурпурный (Планирование)
        'pink': '#e83e8c',    // Розовый (Личное)
        'teal': '#20c997',    // Бирюзовый (Идея)
        'cyan': '#17a2b8',    // Голубой (Информация)
        'indigo': '#6610f2',  // Индиго (Обучение)
        'brown': '#8b4513',   // Коричневый (Ожидание)
        'black': '#000000',   // Черный (Архивное)
        'navy': '#000080'     // Темно-синий (Ночное)
    };
    
    return colorMap[colorName] || colorMap['default'];
}
