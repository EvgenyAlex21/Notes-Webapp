$(document).ready(function() {
    const originalSearch = window.performSearch;
    
    if (typeof originalSearch === 'function') {
        window.performSearch = function(query) {
            if (!query || query.trim() === '') {
                $('#search-results').empty().hide();
                return;
            }
            $('#search-results').html('<div class="p-3 text-center"><i class="fas fa-spinner fa-spin"></i> Поиск...</div>').show();
            const notes = $('.note-wrapper');
            const results = [];
            const isTagSearch = query.startsWith('#');
            const tagQuery = isTagSearch ? query.substring(1).toLowerCase() : '';
            notes.each(function(index) {
                const title = $(this).find('h4').text().toLowerCase();
                const description = $(this).find('.note-description').text().toLowerCase();
                const tags = $(this).data('tags') || '';
                const id = $(this).attr('id');
                if (isTagSearch) {
                    if (tags) {
                        const noteTags = tags.split(',').map(tag => tag.trim().toLowerCase());
                        let found = false;
                        noteTags.forEach(tag => {
                            const exactMatch = tag === tagQuery;
                            const startMatch = tag.startsWith(tagQuery);
                            const includesMatch = tag.includes(tagQuery);
                            const tagIsInQuery = tagQuery.includes(tag);
                            const match = exactMatch || startMatch || includesMatch || tagIsInQuery;
                            if (match) found = true;
                        });
                        if (found) {
                            results.push({
                                id: id,
                                title: title,
                                description: description,
                                color: $(this).data('color'),
                                tags: tags
                            });
                        }
                    }
                } else if (
                    title.includes(query.toLowerCase()) || 
                    description.includes(query.toLowerCase()) || 
                    (tags && tags.toLowerCase().includes(query.toLowerCase()))
                ) {
                    results.push({
                        id: id,
                        title: title,
                        description: description,
                        color: $(this).data('color'),
                        tags: tags
                    });
                }
            });
            if (results.length > 0) {
                $('#search-results').empty();
                results.forEach(result => {
                    const highlightedTitle = highlightText(result.title, query);
                    const highlightedDesc = highlightText(result.description, query);
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
                $('.search-result-item').on('click', function(e) {
                    if ($(e.target).hasClass('tag')) {
                        return;
                    }
                    const noteId = $(this).data('id');
                    const noteElement = $(`#${noteId}`);
                    if (noteElement.length) {
                        $('#search-results').hide();
                        $('html, body').animate({
                            scrollTop: noteElement.offset().top - 100
                        }, 500);
                        noteElement.addClass('highlight-note');
                        setTimeout(() => {
                            noteElement.removeClass('highlight-note');
                        }, 3000);
                    }
                });
                $('.search-result-item .tag').on('click', function(e) {
                    e.stopPropagation();
                    const tagText = $(this).text().trim();
                    searchByTag(tagText);
                });
            } else {
                $('#search-results').html('<div class="p-3 text-center">Ничего не найдено</div>');
            }
        };
    }
});

$(document).ready(function() {
    setTimeout(() => {
        const allTags = new Set();
        $('.note-wrapper').each(function(index) {
            const $note = $(this);
            const id = $note.attr('id');
            const tags = $note.attr('data-tags');
            if (tags !== undefined) {
                $note.data('tags', tags);
                tags.split(',').forEach(tag => {
                    if (tag.trim()) allTags.add(tag.trim());
                });
            }
        });
        const uniqueTags = Array.from(allTags).sort();
    }, 1000);
});
