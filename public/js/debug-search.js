/**
 * Расширенный функционал поиска для отладки проблем поиска по тегам
 */

$(document).ready(function() {
    // Перехватываем функцию поиска
    const originalSearch = window.performSearch;
    
    if (typeof originalSearch === 'function') {
        console.log('Улучшение функции поиска с отладкой');
        
        window.performSearch = function(query) {
            console.log('Выполняем поиск с запросом:', query);
            
            if (!query || query.trim() === '') {
                $('#search-results').empty().hide();
                return;
            }
            
            // Показываем прелоадер
            $('#search-results').html('<div class="p-3 text-center"><i class="fas fa-spinner fa-spin"></i> Поиск...</div>').show();
            
            // Ищем среди заметок
            const notes = $('.note-wrapper');
            console.log(`Всего заметок для поиска: ${notes.length}`);
            
            const results = [];
            
            // Проверяем, ищем ли мы по тегу
            const isTagSearch = query.startsWith('#');
            const tagQuery = isTagSearch ? query.substring(1).toLowerCase() : '';
            
            if (isTagSearch) {
                console.log(`Поиск по тегу: #${tagQuery}`);
            }
            
            notes.each(function(index) {
                const title = $(this).find('h4').text().toLowerCase();
                const description = $(this).find('.note-description').text().toLowerCase();
                const tags = $(this).data('tags') || '';
                const id = $(this).attr('id');
                
                console.log(`Заметка #${index + 1}: ID=${id}, Название='${title}', Теги='${tags}'`);
                
                // Если это поиск по тегу, специальная проверка
                if (isTagSearch) {
                    if (tags) {
                        const noteTags = tags.split(',').map(tag => tag.trim().toLowerCase());
                        console.log(`  Теги заметки: [${noteTags.join(', ')}]`);
                        
                        // Проверяем каждый тег по отдельности для лучшей отладки
                        let found = false;
                        noteTags.forEach(tag => {
                            // Улучшенный поиск с учетом всех возможных вариантов совпадения
                            const exactMatch = tag === tagQuery;
                            const startMatch = tag.startsWith(tagQuery);
                            const includesMatch = tag.includes(tagQuery);
                            const tagIsInQuery = tagQuery.includes(tag);
                            const match = exactMatch || startMatch || includesMatch || tagIsInQuery;
                            
                            console.log(`  Проверка тега '${tag}' на совпадение с '${tagQuery}': 
                              - Точное совпадение: ${exactMatch ? 'ДА' : 'НЕТ'}
                              - Начинается с запроса: ${startMatch ? 'ДА' : 'НЕТ'}
                              - Тег содержит запрос: ${includesMatch ? 'ДА' : 'НЕТ'}
                              - Запрос содержит тег: ${tagIsInQuery ? 'ДА' : 'НЕТ'}
                              - Итоговое решение: ${match ? 'ДА' : 'НЕТ'}`);
                            
                            if (match) found = true;
                        });
                        
                        if (found) {
                            console.log(`  >>> НАЙДЕНО СОВПАДЕНИЕ в заметке ${id}`);
                            results.push({
                                id: id,
                                title: title,
                                description: description,
                                color: $(this).data('color'),
                                tags: tags
                            });
                        }
                    } else {
                        console.log(`  У заметки нет тегов`);
                    }
                } 
                // Обычный поиск
                else if (
                    title.includes(query.toLowerCase()) || 
                    description.includes(query.toLowerCase()) || 
                    (tags && tags.toLowerCase().includes(query.toLowerCase()))
                ) {
                    console.log(`  >>> НАЙДЕНО СОВПАДЕНИЕ в заметке ${id} (обычный поиск)`);
                    results.push({
                        id: id,
                        title: title,
                        description: description,
                        color: $(this).data('color'),
                        tags: tags
                    });
                }
            });
            
            console.log(`Результаты поиска: найдено ${results.length} заметок`);
            
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
                        <div class="search-result-item" data-id="${result.id}">
                            <div class="title">${highlightedTitle}</div>
                            <div class="description">${highlightedDesc}</div>
                            ${tagsHTML}
                        </div>
                    `);
                });
                
                // Добавляем обработчик клика на результаты поиска
                $('.search-result-item').on('click', function(e) {
                    // Если клик был по тегу, не обрабатываем клик по всему элементу
                    if ($(e.target).hasClass('tag')) {
                        return;
                    }
                    
                    const noteId = $(this).data('id');
                    
                    // Прокручиваем к заметке и подсвечиваем ее
                    const noteElement = $(`#${noteId}`);
                    if (noteElement.length) {
                        // Скрываем результаты поиска
                        $('#search-results').hide();
                        
                        // Анимированная прокрутка к заметке
                        $('html, body').animate({
                            scrollTop: noteElement.offset().top - 100
                        }, 500);
                        
                        // Подсветка заметки
                        noteElement.addClass('highlight-note');
                        setTimeout(() => {
                            noteElement.removeClass('highlight-note');
                        }, 3000);
                    }
                });
                
                // Добавляем обработчик клика на теги в результатах поиска
                $('.search-result-item .tag').on('click', function(e) {
                    e.stopPropagation(); // Останавливаем всплытие события
                    const tagText = $(this).text().trim();
                    searchByTag(tagText);
                });
            } else {
                $('#search-results').html('<div class="p-3 text-center">Ничего не найдено</div>');
            }
        };
    } else {
        console.error('Функция performSearch не найдена');
    }
});

// Функция для исправления проблемы с data-tags
$(document).ready(function() {
    console.log('Проверка атрибутов data-tags на всех заметках');
    
    // Проверка атрибутов data-tags на всех заметках
    console.log('Проверка атрибутов data-tags на всех заметках');
    
    // Задержка для уверенности, что DOM полностью загружен
    setTimeout(() => {
        // Собираем и отображаем данные по всем тегам на странице
        const allTags = new Set();
        
        $('.note-wrapper').each(function(index) {
            const $note = $(this);
            const id = $note.attr('id');
            const tags = $note.attr('data-tags'); // Получаем как атрибут
            
            console.log(`Заметка #${index + 1}, ID=${id}, data-tags атрибут:`, tags);
            
            // Устанавливаем data-tags как jQuery data, если атрибут есть
            if (tags !== undefined) {
                $note.data('tags', tags);
                console.log(`  Установлен data('tags') для заметки ${id}: ${tags}`);
                
                // Собираем все теги для отладки
                tags.split(',').forEach(tag => {
                    if (tag.trim()) allTags.add(tag.trim());
                });
            } else {
                const dataObject = $note.data();
                console.log(`  У заметки ${id} нет атрибута data-tags, объект data:`, dataObject);
            }
        });
        
        // Выводим собранные теги
        console.log('=== ОТЛАДКА ТЕГОВ НА СТРАНИЦЕ ===');
        console.log(`Найдено заметок на странице: ${$('.note-wrapper').length}`);
        const uniqueTags = Array.from(allTags).sort();
        console.log(`Все уникальные теги на странице (${uniqueTags.length}): ${uniqueTags.join(', ')}`);
    }, 1000);
    

});
