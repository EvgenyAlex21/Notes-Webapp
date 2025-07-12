/**
 * Функционал для улучшения работы с тегами в формах создания и редактирования заметок
 */

// Функция для получения всех уникальных тегов из заметок
function getAllTagsFromBackend() {
    return new Promise((resolve, reject) => {
        console.log('Получение тегов из API...');
        $.ajax({
            url: '/api/tags',
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response && response.data) {
                    console.log('Получено тегов:', response.data.length);
                    resolve(response.data.sort());
                } else {
                    console.warn('API вернул пустой или неверный ответ:', response);
                    // Запасной вариант - берем теги из DOM
                    const fallbackTags = getAllTagsFromDOM();
                    console.log('Использованы запасные теги из DOM:', fallbackTags);
                    resolve(fallbackTags);
                }
            },
            error: function(xhr) {
                console.error('Ошибка при получении тегов из API:', xhr.status, xhr.statusText);
                if (xhr.responseText) {
                    try {
                        console.error('Ответ сервера:', JSON.parse(xhr.responseText));
                    } catch(e) {
                        console.error('Текст ответа:', xhr.responseText);
                    }
                }
                
                // Запасной вариант - берем теги из DOM
                const fallbackTags = getAllTagsFromDOM();
                console.log('Использованы запасные теги из DOM из-за ошибки API:', fallbackTags);
                resolve(fallbackTags);
            }
        });
    });
}

// Функция для получения тегов из DOM как запасной вариант
function getAllTagsFromDOM() {
    const allTags = new Set();
    
    try {
        // Получаем из существующих заметок, если они есть на странице
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
        
        // Получаем из уже добавленных тегов, если они есть
        $('.tag-container .tag').each(function() {
            const tagText = $(this).text().trim();
            if (tagText && tagText.startsWith('#')) {
                allTags.add(tagText.substring(1).trim());
            }
        });
    } catch (error) {
        console.error('Ошибка при сборе тегов из DOM:', error);
    }
    
    return Array.from(allTags).sort();
}

// Функция для инициализации автоподстановки тегов в форме создания/редактирования
function initTagsFormAutocomplete() {
    // Добавляем стили для автоподстановки тегов
    addTagsFormStyles();
    
    // Загружаем существующие теги из API
    getAllTagsFromBackend().then(tags => {
        // Добавляем автоподстановку при вводе тега
        $('#tag-input').on('input', function() {
            const input = $(this);
            const query = input.val().trim().toLowerCase();
            
            if (query) {
                // Фильтруем теги по запросу, исключая уже добавленные
                const filteredTags = tags.filter(tag => 
                    tag.toLowerCase().includes(query) && 
                    !currentTags.includes(tag)
                );
                
                if (filteredTags.length > 0) {
                    showTagSuggestions(filteredTags, input);
                } else {
                    hideTagSuggestions();
                }
            } else {
                hideTagSuggestions();
            }
        });
        
        // Сохраняем оригинальный обработчик клавиши Enter
        const originalKeydownHandler = $('#tag-input').data('keydownHandler');
        
        // Если обработчик еще не сохранен, сохраняем его
        if (!originalKeydownHandler) {
            // Сохраняем оригинальный обработчик
            $('#tag-input').data('keydownHandler', true);
            
            // Добавляем обработку навигации по подсказкам с клавиатуры
            $('#tag-input').on('keydown', function(e) {
                const suggestions = $('.tag-suggestion:visible');
                
                if (suggestions.length > 0) {
                    // Выбираем активную подсказку
                    let activeIndex = -1;
                    suggestions.each(function(idx) {
                        if ($(this).hasClass('active')) {
                            activeIndex = idx;
                        }
                    });
                    
                    switch(e.key) {
                        case 'ArrowDown':
                            e.preventDefault();
                            // Выбираем следующую подсказку или первую, если не выбрано
                            if (activeIndex < suggestions.length - 1) {
                                suggestions.removeClass('active');
                                $(suggestions[activeIndex + 1]).addClass('active');
                            } else {
                                suggestions.removeClass('active');
                                $(suggestions[0]).addClass('active');
                            }
                            break;
                            
                        case 'ArrowUp':
                            e.preventDefault();
                            // Выбираем предыдущую подсказку или последнюю, если не выбрано
                            if (activeIndex > 0) {
                                suggestions.removeClass('active');
                                $(suggestions[activeIndex - 1]).addClass('active');
                            } else {
                                suggestions.removeClass('active');
                                $(suggestions[suggestions.length - 1]).addClass('active');
                            }
                            break;
                            
                        case 'Enter':
                            // Если есть активная подсказка, выбираем её
                            const activeSuggestion = $('.tag-suggestion.active');
                            if (activeSuggestion.length > 0) {
                                e.preventDefault();
                                const tag = activeSuggestion.data('tag');
                                addTag(tag);
                                hideTagSuggestions();
                                return false;
                            }
                            break;
                            
                        case 'Escape':
                            e.preventDefault();
                            hideTagSuggestions();
                            break;
                    }
                }
            });
        }
    });
}

// Функция для отображения подсказок с тегами
function showTagSuggestions(tags, inputElement) {
    // Проверяем, существует ли уже контейнер для подсказок
    let suggestionsContainer = $('.tags-suggestions');
    if (suggestionsContainer.length === 0) {
        // Создаем контейнер для подсказок и добавляем его после поля ввода
        suggestionsContainer = $('<div class="tags-suggestions"></div>');
        inputElement.parent().after(suggestionsContainer);
    }
    
    // Создаем список подсказок
    let suggestionsHtml = '';
    tags.forEach((tag, index) => {
        // Первая подсказка будет активной
        const activeClass = index === 0 ? 'active' : '';
        suggestionsHtml += `<div class="tag-suggestion ${activeClass}" data-tag="${tag}">${tag}</div>`;
    });
    
    // Отображаем подсказки
    suggestionsContainer.html(suggestionsHtml).show();
    
    // Обработчик клика по подсказке с тегом
    $('.tag-suggestion').on('click', function() {
        const selectedTag = $(this).data('tag');
        addTag(selectedTag);
        hideTagSuggestions();
    });
    
    // Обработчик наведения мыши на подсказку (делаем активной)
    $('.tag-suggestion').on('mouseover', function() {
        $('.tag-suggestion').removeClass('active');
        $(this).addClass('active');
    });
}

// Функция для добавления тега в форму
function addTag(tagText) {
    // Проверяем, что такой тег еще не добавлен
    if (!currentTags.includes(tagText)) {
        currentTags.push(tagText);
        
        // Создаем элемент тега
        const tagElement = $(`
            <div class="tag" data-tag="${tagText}">
                ${tagText}
                <span class="remove-tag ms-1">&times;</span>
            </div>
        `);
        
        // Добавляем перед input
        $('#tag-input').before(tagElement);
        $('#tag-input').val('');
        
        // Обработчик удаления тега
        tagElement.find('.remove-tag').on('click', function() {
            const tag = $(this).parent().data('tag');
            // Удаляем из массива
            currentTags = currentTags.filter(t => t !== tag);
            // Удаляем элемент
            $(this).parent().remove();
        });
    }
}

// Функция для скрытия подсказок с тегами
function hideTagSuggestions() {
    $('.tags-suggestions').hide().empty();
}

// Функция для добавления стилей
function addTagsFormStyles() {
    // Проверяем, не добавлены ли уже стили
    if ($('#tags-form-autocomplete-styles').length > 0) {
        return;
    }
    
    const styles = `
        <style id="tags-form-autocomplete-styles">
            .tags-suggestions {
                max-height: 150px;
                overflow-y: auto;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 4px;
                position: absolute;
                width: calc(100% - 2rem);
                z-index: 1000;
                margin-top: -10px;
                margin-bottom: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
            .tag-suggestion.active {
                background-color: #e9f2ff;
            }
            
            .dark-theme .tags-suggestions {
                background-color: #343a40;
                border-color: #495057;
            }
            .dark-theme .tag-suggestion {
                border-bottom-color: #495057;
            }
            .dark-theme .tag-suggestion:hover,
            .dark-theme .tag-suggestion.active {
                background-color: #2b3035;
            }
        </style>
    `;
    
    // Добавляем стили в head
    $('head').append(styles);
}

// Инициализируем автоподстановку тегов при загрузке страницы
$(document).ready(function() {
    initTagsFormAutocomplete();
    
    // Проверка наличия редактора
    const checkEditorInterval = setInterval(function() {
        if ($('#editor').length > 0 && !$('#editor').hasClass('ql-container')) {
            clearInterval(checkEditorInterval);
            
            // Если редактор не инициализирован, инициализируем его
            if (typeof quill === 'undefined') {
                // Инициализация Quill редактора
                const toolbarOptions = [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'script': 'sub' }, { 'script': 'super' }],
                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                    [{ 'direction': 'rtl' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['clean'],
                    ['link', 'image', 'video']
                ];

                window.quill = new Quill('#editor', {
                    modules: {
                        toolbar: toolbarOptions
                    },
                    placeholder: 'Введите описание заметки...',
                    theme: 'snow'
                });

                // Сохраняем контент редактора в скрытое поле формы при отправке
                $('form').on('submit', function() {
                    const content = quill.root.innerHTML;
                    $('#description').val(content);
                });

                // Если есть начальное содержимое, устанавливаем его
                const initialContent = $('#description').val();
                if (initialContent) {
                    quill.root.innerHTML = initialContent;
                }
                
                console.log('Редактор Quill инициализирован');
            }
        }
    }, 500);
});
