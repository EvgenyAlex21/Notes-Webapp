$(document).ready(function() {
    window.robustSearch = function(query) {
        if (!query || query.trim() === '') {
            $('#search-results').empty().hide();
            return;
        }
        $('#search-results').html('<div class="p-3 text-center"><i class="fas fa-spinner fa-spin"></i> Поиск...</div>').show();
        const notes = document.querySelectorAll('.note-wrapper');
        const results = [];
        const isTagSearch = query.startsWith('#');
        const tagQuery = isTagSearch ? query.substring(1).toLowerCase() : query.toLowerCase();
        notes.forEach(function(noteElement, index) {
            const $noteElement = $(noteElement);
            const title = $noteElement.find('h4').text().toLowerCase();
            const description = $noteElement.find('.note-description').text().toLowerCase();
            const dataTagsAttr = noteElement.getAttribute('data-tags');
            const dataTagsJQuery = $noteElement.data('tags');
            const tags = dataTagsAttr || (typeof dataTagsJQuery === 'string' ? dataTagsJQuery : '') || '';
            const id = noteElement.id || $noteElement.attr('id');
            if (isTagSearch && tags) {
                const noteTags = tags.split(',').map(tag => tag.trim().toLowerCase());
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
                results.push({
                    id: id,
                    title: title,
                    description: description,
                    color: $noteElement.data('color'),
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
                    <div class="search-result-item" data-id="${result.id.replace('note-', '')}">
                        <div class="title">${highlightedTitle}</div>
                        <div class="description">${highlightedDesc}</div>
                        ${tagsHTML}
                    </div>
                `);
            });
            $('.search-result-item').on('click', function() {
                const id = $(this).data('id');
                const currentPath = window.location.pathname;
                let source = null;
                if (currentPath.includes('/trash') || currentPath.includes('/new-trash')) {
                    source = 'trash';
                } else if (currentPath.includes('/archive')) {
                    source = 'archive';
                }
                viewNote(id, source);
            });
            if (isTagSearch) {
                $('#search-results').append(`
                    <div class="search-hint mt-3 text-center">
                        <small class="text-muted">Поиск по тегу: <strong>#${tagQuery}</strong>. Найдено: ${results.length}</small>
                    </div>
                `);
            }
        } else {
            $('#search-results').html(`
                <div class="p-3 text-center">
                    <i class="fas fa-search mb-3" style="font-size: 2rem; opacity: 0.5;"></i>
                    <div>Ничего не найдено</div>
                    <small class="text-muted">Попробуйте изменить параметры поиска</small>
                </div>
            `);
        }
    };
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
});

function highlightText(text, query) {
    if (!query || query.trim() === '') return text;
    if (query.startsWith('#')) {
        query = query.substring(1);
    }
    const regex = new RegExp(escapeRegExp(query), 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
