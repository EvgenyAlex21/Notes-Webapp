/**
 * Улучшенная реализация поиска по тегам
 * Исправляет проблемы с поиском по тегам в приложении заметок
 */

$(document).ready(function() {
    // Создаем улучшенную функцию поиска
    window.robustSearch = function(query) {
        console.log('[ROBUST SEARCH] Запущен поиск с запросом:', query);
        
        if (!query || query.trim() === '') {
            $('#search-results').empty().hide();
            return;
        }
        
        // Показываем прелоадер
        $('#search-results').html('<div class="p-3 text-center"><i class="fas fa-spinner fa-spin"></i> Поиск...</div>').show();
        
        // Ищем среди заметок
        const notes = document.querySelectorAll('.note-wrapper');
        console.log(`[ROBUST SEARCH] Всего заметок для поиска: ${notes.length}`);
        
        const results = [];
        
        // Проверяем, ищем ли мы по тегу
        const isTagSearch = query.startsWith('#');
        const tagQuery = isTagSearch ? query.substring(1).toLowerCase() : query.toLowerCase();
        
        if (isTagSearch) {
            console.log(`[ROBUST SEARCH] Поиск по тегу: #${tagQuery}`);
        }
        
        notes.forEach(function(noteElement, index) {
            const $noteElement = $(noteElement);
            const title = $noteElement.find('h4').text().toLowerCase();
            const description = $noteElement.find('.note-description').text().toLowerCase();
            
            // Получаем теги несколькими способами для надежности
            const dataTagsAttr = noteElement.getAttribute('data-tags');
            const dataTagsJQuery = $noteElement.data('tags');
            const tags = dataTagsAttr || (typeof dataTagsJQuery === 'string' ? dataTagsJQuery : '') || '';
            
            const id = noteElement.id || $noteElement.attr('id');
            
            console.log(`[ROBUST SEARCH] Заметка #${index + 1}: ID=${id}, Теги атрибут='${dataTagsAttr}', Теги jQuery='${dataTagsJQuery}'`);
            
            // Если это поиск по тегу, специальная проверка
            if (isTagSearch && tags) {
                // Обработка случая, когда теги представлены как строка
                const noteTags = tags.split(',').map(tag => tag.trim().toLowerCase());
                console.log(`[ROBUST SEARCH] Теги заметки ${id}: [${noteTags.join(', ')}]`);
                
                // Проверка всех возможных совпадений
                let found = false;
                noteTags.forEach(tag => {
                    const matchTypes = {
                        exact: tag === tagQuery,
                        startsWith: tag.startsWith(tagQuery),
                        includes: tag.includes(tagQuery),
                        tagIsInQuery: tagQuery.includes(tag)
                    };
                    
                    const isMatch = Object.values(matchTypes).some(val => val === true);
                    
                    if (isMatch) {
                        found = true;
                        console.log(`[ROBUST SEARCH] СОВПАДЕНИЕ! Заметка ${id}, тег '${tag}' совпадает с запросом '${tagQuery}'`);
                        console.log(`  - Точное: ${matchTypes.exact}, Начинается с: ${matchTypes.startsWith}, Содержит: ${matchTypes.includes}, Тег в запросе: ${matchTypes.tagIsInQuery}`);
                    }
                });
                
                if (found) {
                    results.push({
                        id: id,
                        title: title,
                        description: description,
                        color: $noteElement.data('color'),
                        tags: tags
                    });
                }
            } else if (!isTagSearch && (
                title.includes(query.toLowerCase()) || 
                description.includes(query.toLowerCase()) || 
                (tags && tags.toLowerCase().includes(query.toLowerCase()))
            )) {
                // Обычный поиск
                console.log(`[ROBUST SEARCH] Найдено обычное совпадение в заметке ${id}`);
                results.push({
                    id: id,
                    title: title,
                    description: description,
                    color: $noteElement.data('color'),
                    tags: tags
                });
            }
        });
        
        console.log(`[ROBUST SEARCH] Результаты поиска: найдено ${results.length} заметок`);
        
        // Отображаем результаты
        if (results.length > 0) {
            $('#search-results').empty();
            
            results.forEach(result => {
                const highlightedTitle = highlightText(result.title, query);
                const highlightedDesc = highlightText(result.description, query);
                
                // Формируем HTML для тегов, если они есть
                let tagsHTML = '';
                if (result.tags) {
                    const tagsArray = result.tags.split(',');
                    tagsHTML = `<div class="search-result-tags">
                        ${tagsArray.map(tag => `<span class="tag">#${tag.trim()}</span>`).join(' ')}
                    </div>`;
                }
                
                $('#search-results').append(`
                    <div class="search-result-item" data-id="${result.id.replace('note-', '')}">
                        <div class="title">${highlightedTitle}</div>
                        <div class="description">${highlightedDesc}</div>
                        ${tagsHTML}
                    </div>
                `);
            });
            
            // Добавляем обработчик клика на результаты
            $('.search-result-item').on('click', function() {
                const id = $(this).data('id');
                console.log('Клик по результату поиска, ID заметки:', id);
                viewNote(id);
            });
            
            // Если тегов нет, добавляем сообщение
            if (isTagSearch) {
                $('#search-results').append(`
                    <div class="search-hint mt-3 text-center">
                        <small class="text-muted">Поиск по тегу: <strong>#${tagQuery}</strong>. Найдено: ${results.length}</small>
                    </div>
                `);
            }
        } else {
            // Если ничего не найдено
            $('#search-results').html(`
                <div class="p-3 text-center">
                    <i class="fas fa-search mb-3" style="font-size: 2rem; opacity: 0.5;"></i>
                    <div>Ничего не найдено</div>
                    <small class="text-muted">Попробуйте изменить параметры поиска</small>
                </div>
            `);
        }
    };
    
    // Перехват событий поиска
    $('#search-notes').off('input').on('input', function() {
        const query = $(this).val().trim();
        if (query) {
            window.robustSearch(query);
        } else {
            $('#search-results').empty().hide();
        }
    });
    
    $('#search-clear').off('click').on('click', function() {
        $('#search-notes').val('');
        $('#search-results').empty().hide();
    });
    
    console.log('[ROBUST SEARCH] Улучшенный поиск подключен');
});

// Функция для подсветки искомого текста
function highlightText(text, query) {
    if (!query || query.trim() === '') return text;
    
    // Для поиска по тегу ищем без #
    if (query.startsWith('#')) {
        query = query.substring(1);
    }
    
    const regex = new RegExp(escapeRegExp(query), 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

// Функция для экранирования специальных символов в регулярном выражении
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
