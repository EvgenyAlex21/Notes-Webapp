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
                
                const fallbackTags = getAllTagsFromDOM();
                console.log('Использованы запасные теги из DOM из-за ошибки API:', fallbackTags);
                resolve(fallbackTags);
            }
        });
    });
}

function getAllTagsFromDOM() {
    const allTags = new Set();
    
    try {
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

function initTagsFormAutocomplete() {

    addTagsFormStyles();
    
    getAllTagsFromBackend().then(tags => {
        $('#tag-input').on('input', function() {
            const input = $(this);
            const query = input.val().trim().toLowerCase();
            
            if (query) {
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
        
        const originalKeydownHandler = $('#tag-input').data('keydownHandler');
        
        if (!originalKeydownHandler) {
            $('#tag-input').data('keydownHandler', true);
            
            $('#tag-input').on('keydown', function(e) {
                const suggestions = $('.tag-suggestion:visible');
                
                if (suggestions.length > 0) {
                    let activeIndex = -1;
                    suggestions.each(function(idx) {
                        if ($(this).hasClass('active')) {
                            activeIndex = idx;
                        }
                    });
                    
                    switch(e.key) {
                        case 'ArrowDown':
                            e.preventDefault();
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
                            if (activeIndex > 0) {
                                suggestions.removeClass('active');
                                $(suggestions[activeIndex - 1]).addClass('active');
                            } else {
                                suggestions.removeClass('active');
                                $(suggestions[suggestions.length - 1]).addClass('active');
                            }
                            break;
                            
                        case 'Enter':
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

function showTagSuggestions(tags, inputElement) {
    let suggestionsContainer = $('.tags-suggestions');
    if (suggestionsContainer.length === 0) {
        suggestionsContainer = $('<div class="tags-suggestions"></div>');
        inputElement.parent().after(suggestionsContainer);
    }
    
    let suggestionsHtml = '';
    tags.forEach((tag, index) => {
        const activeClass = index === 0 ? 'active' : '';
        suggestionsHtml += `<div class="tag-suggestion ${activeClass}" data-tag="${tag}">${tag}</div>`;
    });
    
    suggestionsContainer.html(suggestionsHtml).show();
    
    $('.tag-suggestion').on('click', function() {
        const selectedTag = $(this).data('tag');
        addTag(selectedTag);
        hideTagSuggestions();
    });
    
    $('.tag-suggestion').on('mouseover', function() {
        $('.tag-suggestion').removeClass('active');
        $(this).addClass('active');
    });
}

function addTag(tagText) {
    if (!currentTags.includes(tagText)) {
        currentTags.push(tagText);
        
        const tagElement = $(`
            <div class="tag" data-tag="${tagText}">
                ${tagText}
                <span class="remove-tag ms-1">&times;</span>
            </div>
        `);
        
        $('#tag-input').before(tagElement);
        $('#tag-input').val('');
        
        tagElement.find('.remove-tag').on('click', function() {
            const tag = $(this).parent().data('tag');
            currentTags = currentTags.filter(t => t !== tag);
            $(this).parent().remove();
        });
    }
}

function hideTagSuggestions() {
    $('.tags-suggestions').hide().empty();
}

function addTagsFormStyles() {
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
    
    $('head').append(styles);
}

$(document).ready(function() {
    initTagsFormAutocomplete();
    
    const checkEditorInterval = setInterval(function() {
        if ($('#editor').length > 0 && !$('#editor').hasClass('ql-container')) {
            clearInterval(checkEditorInterval);
            
            if (typeof quill === 'undefined') {
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

                $('form').on('submit', function() {
                    const content = quill.root.innerHTML;
                    $('#description').val(content);
                });

                const initialContent = $('#description').val();
                if (initialContent) {
                    quill.root.innerHTML = initialContent;
                }
                
                console.log('Редактор Quill инициализирован');
            }
        }
    }, 500);
});