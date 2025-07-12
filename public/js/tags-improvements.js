/**
 * Функционал для работы с тегами в приложении заметок
 * Добавляет автоподстановку тегов при поиске и обработку кликов по тегам
 */

// Функция для получения всех уникальных тегов из заметок
function getAllTags() {
    const allTags = new Set();
    $('.note-wrapper').each(function() {
        const tags = $(this).data('tags');
        if (tags) {
            tags.split(',').forEach(tag => {
                if (tag.trim()) {
                    allTags.add(tag.trim());
                }
            });
        }
    });
    return Array.from(allTags).sort();
}

// Функция для инициализации автоподстановки тегов при поиске
function initTagsAutocomplete() {
    // Обработчик для поля поиска с поддержкой автоподстановки тегов
    $('#search-notes').on('input', function() {
        const query = $(this).val().trim();
        const cursorPosition = this.selectionStart;
        
        // Проверяем, вводится ли тег (символ # перед курсором)
        const textBeforeCursor = query.substring(0, cursorPosition);
        const lastHashIndex = textBeforeCursor.lastIndexOf('#');
        
        if (lastHashIndex !== -1) {
            // Если после # и до курсора есть текст, используем его как префикс для поиска тегов
            const tagPrefix = textBeforeCursor.substring(lastHashIndex + 1);
            
            if (tagPrefix !== '') {
                // Получаем все теги и фильтруем по префиксу
                const allTags = getAllTags();
                const filteredTags = allTags.filter(tag => 
                    tag.toLowerCase().startsWith(tagPrefix.toLowerCase())
                );
                
                // Если найдены теги, отображаем их в выпадающем списке
                if (filteredTags.length > 0) {
                    showTagSuggestions(filteredTags, lastHashIndex, tagPrefix.length);
                } else {
                    hideTagSuggestions();
                }
            } else {
                // Если после # нет текста, показываем все теги
                const allTags = getAllTags();
                showTagSuggestions(allTags, lastHashIndex, 0);
            }
        } else {
            // Если не вводится тег, скрываем подсказки и выполняем обычный поиск
            hideTagSuggestions();
            performSearch(query);
        }
        
        // В любом случае применяем фильтры
        applyFilters();
    });
    
    // Изменяем стиль курсора при наведении на теги
    $(document).on('mouseover', '.tag', function() {
        $(this).css('cursor', 'pointer');
    });
    
    // Обработка клика по тегу в карточке заметки
    $(document).on('click', '.note-wrapper .tag', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const tagText = $(this).text().trim();
        searchByTag(tagText);
    });
    
    // Обработка клика по тегу в модальном окне просмотра
    $(document).on('click', '#viewNoteContent .tag', function(e) {
        e.preventDefault();
        
        const tagText = $(this).text().trim();
        searchByTag(tagText);
        
        // Закрываем модальное окно просмотра
        if (typeof viewNoteModal !== 'undefined' && viewNoteModal) {
            viewNoteModal.hide();
        }
    });
    
    // Добавляем автоподстановку тегов при создании/редактировании заметки
    initTagsInputAutocomplete();
}

// Функция для отображения подсказок с тегами
function showTagSuggestions(tags, hashIndex, prefixLength) {
    const searchInput = $('#search-notes');
    const query = searchInput.val();
    
    // Создаем список подсказок
    let suggestionsHtml = '<div class="tag-suggestions">';
    tags.forEach(tag => {
        suggestionsHtml += `<div class="tag-suggestion" data-tag="${tag}">#${tag}</div>`;
    });
    suggestionsHtml += '</div>';
    
    // Отображаем подсказки в контейнере результатов поиска
    $('#search-results').html(suggestionsHtml).show();
    
    // Обработчик клика по подсказке с тегом
    $('.tag-suggestion').on('click', function() {
        const selectedTag = $(this).data('tag');
        
        // Заменяем введенный текст на полное название тега
        const beforeTag = query.substring(0, hashIndex);
        const afterTag = query.substring(hashIndex + prefixLength + 1); // +1 для символа #
        
        const newValue = beforeTag + '#' + selectedTag + ' ' + afterTag;
        searchInput.val(newValue);
        
        // Помещаем курсор после вставленного тега
        const newCursorPosition = hashIndex + selectedTag.length + 2; // +1 для # и +1 для пробела
        searchInput[0].setSelectionRange(newCursorPosition, newCursorPosition);
        
        // Скрываем подсказки и выполняем поиск
        hideTagSuggestions();
        performSearch(newValue);
        searchInput.focus();
    });
}

// Функция для скрытия подсказок с тегами
function hideTagSuggestions() {
    $('#search-results .tag-suggestions').remove();
    if ($('#search-results').children().length === 0) {
        $('#search-results').hide();
    }
}

// Функция для поиска по тегу
function searchByTag(tagText) {
    // Получаем текст тега без символа #
    const tag = tagText.replace(/^#/, '');
    
    // Устанавливаем значение в поле поиска
    $('#search-notes').val('#' + tag).trigger('input');
    
    // Прокручиваем страницу к полю поиска
    $('html, body').animate({
        scrollTop: $('#search-notes').offset().top - 100
    }, 300);
    
    // Фокусируемся на поле поиска
    $('#search-notes').focus();
}

// Функция для инициализации автоподстановки тегов в поле ввода тегов при создании/редактировании заметки
function initTagsInputAutocomplete() {
    // Обработчик для поля ввода тегов
    $('#tags-input').on('input', function() {
        const input = $(this);
        const query = input.val().trim();
        const cursorPosition = this[0].selectionStart;
        
        // Проверяем, вводится ли новый тег (после последней запятой)
        const lastCommaIndex = query.lastIndexOf(',');
        const textAfterComma = lastCommaIndex !== -1 ? 
            query.substring(lastCommaIndex + 1).trim() : query.trim();
        
        if (textAfterComma) {
            // Получаем все теги и фильтруем по введенному тексту
            const allTags = getAllTags();
            const filteredTags = allTags.filter(tag => 
                tag.toLowerCase().startsWith(textAfterComma.toLowerCase()) &&
                !query.toLowerCase().includes(tag.toLowerCase())
            );
            
            // Если найдены теги, отображаем их в выпадающем списке
            if (filteredTags.length > 0) {
                showTagInputSuggestions(filteredTags, input);
            } else {
                hideTagInputSuggestions();
            }
        } else {
            hideTagInputSuggestions();
        }
    });
}

// Функция для отображения подсказок с тегами в поле ввода тегов
function showTagInputSuggestions(tags, inputElement) {
    // Проверяем, существует ли уже контейнер для подсказок
    let suggestionsContainer = inputElement.next('.tags-suggestions-container');
    if (suggestionsContainer.length === 0) {
        // Создаем контейнер для подсказок
        suggestionsContainer = $('<div class="tags-suggestions-container"></div>');
        inputElement.after(suggestionsContainer);
    }
    
    // Создаем список подсказок
    let suggestionsHtml = '';
    tags.forEach(tag => {
        suggestionsHtml += `<div class="tag-input-suggestion" data-tag="${tag}">${tag}</div>`;
    });
    
    // Отображаем подсказки
    suggestionsContainer.html(suggestionsHtml).show();
    
    // Обработчик клика по подсказке с тегом
    $('.tag-input-suggestion').on('click', function() {
        const selectedTag = $(this).data('tag');
        const input = inputElement;
        const query = input.val();
        
        // Заменяем текущий ввод тега на выбранный тег
        const lastCommaIndex = query.lastIndexOf(',');
        const newValue = lastCommaIndex !== -1 ?
            query.substring(0, lastCommaIndex + 1) + ' ' + selectedTag + ', ' :
            selectedTag + ', ';
        
        input.val(newValue);
        
        // Фокусируемся на поле ввода
        input.focus();
        
        // Скрываем подсказки
        hideTagInputSuggestions();
    });
}

// Функция для скрытия подсказок с тегами в поле ввода тегов
function hideTagInputSuggestions() {
    $('.tags-suggestions-container').hide().empty();
}

// Добавляем стили для подсказок тегов
function addTagsStyles() {
    const styles = `
        <style>
            .tag-suggestions {
                max-height: 200px;
                overflow-y: auto;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .tag-suggestion {
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
            }
            .tag-suggestion:last-child {
                border-bottom: none;
            }
            .tag-suggestion:hover {
                background-color: #f5f5f5;
            }
            
            .tag {
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            .tag:hover {
                background-color: #e2e6ea;
            }
            
            .tags-suggestions-container {
                position: absolute;
                width: calc(100% - 30px);
                max-height: 200px;
                overflow-y: auto;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 4px;
                z-index: 1000;
                margin-top: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .tag-input-suggestion {
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
            }
            .tag-input-suggestion:last-child {
                border-bottom: none;
            }
            .tag-input-suggestion:hover {
                background-color: #f5f5f5;
            }
            
            .dark-theme .tag-suggestions,
            .dark-theme .tags-suggestions-container {
                background-color: #343a40;
                border-color: #495057;
            }
            .dark-theme .tag-suggestion,
            .dark-theme .tag-input-suggestion {
                border-bottom-color: #495057;
            }
            .dark-theme .tag-suggestion:hover,
            .dark-theme .tag-input-suggestion:hover {
                background-color: #2b3035;
            }
            .dark-theme .tag:hover {
                background-color: #495057;
            }
        </style>
    `;
    
    // Добавляем стили в head
    $('head').append(styles);
}

// Модифицируем функцию отображения заметки в модальном окне,
// чтобы теги были кликабельными
function modifyRenderNoteInModal() {
    // Сохраняем оригинальную функцию
    const originalRenderNoteInModal = window.renderNoteInModal;
    
    // Переопределяем функцию
    window.renderNoteInModal = function(note) {
        // Вызываем оригинальную функцию
        originalRenderNoteInModal(note);
        
        // Добавляем обработчик клика для тегов в модальном окне
        $('#viewNoteContent .tag').off('click').on('click', function(e) {
            e.preventDefault();
            
            const tagText = $(this).text().trim();
            searchByTag(tagText);
            
            // Закрываем модальное окно просмотра
            if (typeof viewNoteModal !== 'undefined' && viewNoteModal) {
                viewNoteModal.hide();
            }
        });
    };
}

// Инициализация всего функционала тегов при загрузке документа
$(document).ready(function() {
    addTagsStyles();
    initTagsAutocomplete();
    modifyRenderNoteInModal();
});
