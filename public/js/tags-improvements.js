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

function initTagsAutocomplete() {
    $('#search-notes').on('input', function() {
        const query = $(this).val().trim();
        const cursorPosition = this.selectionStart;
        const textBeforeCursor = query.substring(0, cursorPosition);
        const lastHashIndex = textBeforeCursor.lastIndexOf('#');
        if (lastHashIndex !== -1) {
            const tagPrefix = textBeforeCursor.substring(lastHashIndex + 1);
            if (tagPrefix !== '') {
                const allTags = getAllTags();
                const filteredTags = allTags.filter(tag => 
                    tag.toLowerCase().startsWith(tagPrefix.toLowerCase())
                );
                if (filteredTags.length > 0) {
                    showTagSuggestions(filteredTags, lastHashIndex, tagPrefix.length);
                } else {
                    hideTagSuggestions();
                }
            } else {
                const allTags = getAllTags();
                showTagSuggestions(allTags, lastHashIndex, 0);
            }
        } else {
            hideTagSuggestions();
            performSearch(query);
        }
        applyFilters();
    });
    $(document).on('mouseover', '.tag', function() {
        $(this).css('cursor', 'pointer');
    });
    $(document).on('click', '.note-wrapper .tag', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const tagText = $(this).text().trim();
        searchByTag(tagText);
    });
    $(document).on('click', '#viewNoteContent .tag', function(e) {
        e.preventDefault();
        const tagText = $(this).text().trim();
        searchByTag(tagText);
        if (typeof viewNoteModal !== 'undefined' && viewNoteModal) {
            viewNoteModal.hide();
        }
    });
    initTagsInputAutocomplete();
}

function showTagSuggestions(tags, hashIndex, prefixLength) {
    const searchInput = $('#search-notes');
    const query = searchInput.val();
    let suggestionsHtml = '<div class="tag-suggestions">';
    tags.forEach(tag => {
        suggestionsHtml += `<div class="tag-suggestion" data-tag="${tag}">#${tag}</div>`;
    });
    suggestionsHtml += '</div>';
    $('#search-results').html(suggestionsHtml).show();
    $('.tag-suggestion').on('click', function() {
        const selectedTag = $(this).data('tag');
        const beforeTag = query.substring(0, hashIndex);
        const afterTag = query.substring(hashIndex + prefixLength + 1);
        const newValue = beforeTag + '#' + selectedTag + ' ' + afterTag;
        searchInput.val(newValue);
        const newCursorPosition = hashIndex + selectedTag.length + 2;
        searchInput[0].setSelectionRange(newCursorPosition, newCursorPosition);
        hideTagSuggestions();
        performSearch(newValue);
        searchInput.focus();
    });
}

function hideTagSuggestions() {
    $('#search-results .tag-suggestions').remove();
    if ($('#search-results').children().length === 0) {
        $('#search-results').hide();
    }
}

function searchByTag(tagText) {
    const tag = tagText.replace(/^#/, '');
    $('#search-notes').val('#' + tag).trigger('input');
    $('html, body').animate({
        scrollTop: $('#search-notes').offset().top - 100
    }, 300);
    $('#search-notes').focus();
}

function initTagsInputAutocomplete() {
    $('#tags-input').on('input', function() {
        const input = $(this);
        const query = input.val().trim();
        const cursorPosition = this[0].selectionStart;
        const lastCommaIndex = query.lastIndexOf(',');
        const textAfterComma = lastCommaIndex !== -1 ? 
            query.substring(lastCommaIndex + 1).trim() : query.trim();
        if (textAfterComma) {
            const allTags = getAllTags();
            const filteredTags = allTags.filter(tag => 
                tag.toLowerCase().startsWith(textAfterComma.toLowerCase()) &&
                !query.toLowerCase().includes(tag.toLowerCase())
            );
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

function showTagInputSuggestions(tags, inputElement) {
    let suggestionsContainer = inputElement.next('.tags-suggestions-container');
    if (suggestionsContainer.length === 0) {
        suggestionsContainer = $('<div class="tags-suggestions-container"></div>');
        inputElement.after(suggestionsContainer);
    }
    let suggestionsHtml = '';
    tags.forEach(tag => {
        suggestionsHtml += `<div class="tag-input-suggestion" data-tag="${tag}">${tag}</div>`;
    });
    suggestionsContainer.html(suggestionsHtml).show();
    $('.tag-input-suggestion').on('click', function() {
        const selectedTag = $(this).data('tag');
        const input = inputElement;
        const query = input.val();
        const lastCommaIndex = query.lastIndexOf(',');
        const newValue = lastCommaIndex !== -1 ?
            query.substring(0, lastCommaIndex + 1) + ' ' + selectedTag + ', ' :
            selectedTag + ', ';
        input.val(newValue);
        input.focus();
        hideTagInputSuggestions();
    });
}

function hideTagInputSuggestions() {
    $('.tags-suggestions-container').hide().empty();
}

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
    $('head').append(styles);
}

function modifyRenderNoteInModal() {
    const originalRenderNoteInModal = window.renderNoteInModal;
    window.renderNoteInModal = function(note) {
        originalRenderNoteInModal(note);
        $('#viewNoteContent .tag').off('click').on('click', function(e) {
            e.preventDefault();
            const tagText = $(this).text().trim();
            searchByTag(tagText);
            if (typeof viewNoteModal !== 'undefined' && viewNoteModal) {
                viewNoteModal.hide();
            }
        });
    };
}

$(document).ready(function() {
    addTagsStyles();
    initTagsAutocomplete();
    modifyRenderNoteInModal();
});
