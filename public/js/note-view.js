function initViewNoteHandlers() {
    $('.view-note-btn').off('click').on('click', function(e) {
        e.preventDefault();
        const noteId = $(this).data('id');
        const currentPath = window.location.pathname;
        let source = null;
        if (currentPath.includes('/trash') || currentPath.includes('/new-trash')) {
            source = 'trash';
        } else if (currentPath.includes('/archive')) {
            source = 'archive';
        }
        viewNote(noteId, source);
    });
}

$(document).ready(function() {
    console.log('Инициализация обработчиков для просмотра заметок');
    initViewNoteHandlers();
});

function viewNote(id, source) {
    const noteId = id.toString().replace('note-', '');
    console.log(`Запрос на просмотр заметки: получен ID=${id}, преобразован в noteId=${noteId}, источник=${source || 'не указан'}`);
    if (!source) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/trash') || currentPath.includes('/new-trash')) {
            source = 'trash';
            console.log('Определен источник по URL: заметка из корзины');
        } else if (currentPath.includes('/archive')) {
            source = 'archive';
            console.log('Определен источник по URL: заметка из архива');
        } else {
            console.log('URL не содержит признаков источника: просто просмотр заметки');
        }
    }
    $.ajax({
        url: `/api/notes/${noteId}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.data) {
                const note = response.data;
                console.log('[NOTE-VIEW.JS] Данные заметки для просмотра:', note);
                console.log('[NOTE-VIEW.JS] Файлы заметки для просмотра:', note.files);
                console.log('[NOTE-VIEW.JS] Источник вызова перед рендерингом модального окна:', source);
                renderNoteInModal(note, source);
                viewNoteModal.show();
            }
        },
        error: function(xhr) {
            console.error(`Ошибка при загрузке заметки ID=${noteId}:`, xhr.status, xhr.statusText);
            showNotification(`Не удалось загрузить заметку (${xhr.status})`, 'error');
        }
    });
}

function renderNoteInModal(note, source) {
    if (!source) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/trash') || currentPath.includes('/new-trash')) {
            source = 'trash';
            console.log('[renderNoteInModal] Определен источник по URL: заметка из корзины');
        } else if (currentPath.includes('/archive')) {
            source = 'archive';
            console.log('[renderNoteInModal] Определен источник по URL: заметка из архива');
        }
        if (!source && note) {
            if (note.is_deleted) {
                source = 'trash';
                console.log('[renderNoteInModal] Определен источник по данным заметки: заметка из корзины (is_deleted=true)');
            } else if (note.is_archived) {
                source = 'archive';
                console.log('[renderNoteInModal] Определен источник по данным заметки: заметка из архива (is_archived=true)');
            }
        }
    }
    console.log('[renderNoteInModal] Рендеринг заметки ' + note.id + ' из источника: ' + (source || 'не определен'));
    const tagsArray = note.tags ? note.tags.split(',') : [];
    const tagsHTML = tagsArray.length > 0 ? 
        `<div class="tags-section mt-3">
            <h6 class="mb-2"><i class="fas fa-tags me-2"></i>Теги:</h6>
            <div class="d-flex flex-wrap gap-2">
                ${tagsArray.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
        </div>` : '';
    const createdAt = new Date(note.created_at);
    const updatedAt = new Date(note.updated_at);
    const isUpdated = createdAt.getTime() !== updatedAt.getTime();
    const dateCreated = formatDate(createdAt);
    const dateUpdated = formatDate(updatedAt);
    console.log('Проверка файлов перед рендерингом:', note.files);
    console.log('Тип файлов:', typeof note.files, Array.isArray(note.files));
    let fileArray = [];
    if (note.files === null || note.files === undefined) {
        note.files = [];
        console.log('Файлы отсутствуют (null/undefined), установлен пустой массив');
    } else if (typeof note.files === 'string') {
        try {
            fileArray = JSON.parse(note.files);
            note.files = fileArray;
            console.log('Файлы преобразованы из строки в массив:', fileArray);
            console.log('Преобразовали файлы из строки в массив:', note.files);
        } catch (e) {
            console.error('Ошибка при парсинге строки файлов:', e);
            note.files = [];
        }
    } else if (note.files === null || note.files === undefined) {
        note.files = [];
        console.log('Файлы были null или undefined, преобразовали в пустой массив');
    } else if (!Array.isArray(note.files)) {
        console.error('Файлы не являются массивом:', typeof note.files);
        note.files = [];
    }
    let filesHTML = '';
    console.log('Отображение файлов, тип:', typeof note.files, 'isArray:', Array.isArray(note.files), 'длина:', note.files ? note.files.length : 0);
    if (note.files && note.files.length > 0) {
        console.log('Первый файл:', JSON.stringify(note.files[0]));
    }
    if (note.files && Array.isArray(note.files) && note.files.length > 0) {
        let validFiles = note.files.filter(file => 
            file && typeof file === 'object' && file.name && 
            (file.url || file.path)
        );
        console.log('Проверенные файлы для отображения:', validFiles.length, 'из', note.files.length);
        if (validFiles.length > 0) {
            validFiles = validFiles.map(file => {
                if (!file.url && file.path) {
                    file.url = `/storage/${file.path}`;
                    console.log('Добавлен URL для файла:', file.name, file.url);
                } else if (!file.url && !file.path) {
                    file.url = 'https://placehold.co/200?text=Файл+недоступен';
                    console.warn('У файла нет ни URL, ни path:', file);
                }
                if (!file.type && file.extension) {
                    const ext = file.extension.toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                        file.type = 'image';
                    } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
                        file.type = 'video';
                    } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
                        file.type = 'audio';
                    } else {
                        file.type = 'document';
                    }
                }
                return file;
            });
            filesHTML = `
                <div class="note-files mt-4">
                    <h6 class="mb-3">Прикрепленные файлы (${validFiles.length}):</h6>
                    <div class="existing-files-container row g-3 mt-2">
                        ${validFiles.map(file => {
                            let preview = '';
                            if (file.type === 'image') {
                                preview = `<img src="${file.url}" class="img-thumbnail w-100" style="height: 100px; object-fit: cover;" alt="${file.name}" onerror="this.onerror=null;this.src='https://placehold.co/200?text=Изображение+недоступно';this.style='height:100px;object-fit:cover;'">`;
                            } else if (file.type === 'video') {
                                preview = `<video src="${file.url}" controls style="width: 100%; height: 100px; object-fit: cover; background: #f8f9fa;" onerror="this.onerror=null;this.outerHTML='<div class=\\'d-flex align-items-center justify-content-center\\' style=\\'height:100px;background:#f8f9fa;\\'><i class=\\'fas fa-film fa-2x text-danger\\'></i></div>'"></video>`;
                            } else {
                                let iconClass = 'fa-file';
                                if (file.extension && typeof file.extension === 'string') {
                                    if (file.extension.match(/pdf/i)) iconClass = 'fa-file-pdf';
                                    else if (file.extension.match(/docx?/i)) iconClass = 'fa-file-word';
                                    else if (file.extension.match(/xlsx?/i)) iconClass = 'fa-file-excel';
                                    else if (file.extension.match(/pptx?/i)) iconClass = 'fa-file-powerpoint';
                                    else if (file.extension.match(/zip|rar|tar|gz/i)) iconClass = 'fa-file-archive';
                                    else if (file.extension.match(/txt|rtf/i)) iconClass = 'fa-file-alt';
                                }
                                preview = `<div class="d-flex align-items-center justify-content-center" style="height: 100px; background: #f8f9fa;"><i class="fas ${iconClass} fa-2x text-secondary"></i></div>`;
                            }
                            return `
                                <div class="col-md-3 col-sm-4 col-6">
                                    <div class="card h-100">
                                        ${preview}
                                        <div class="card-body p-2 text-center">
                                            <p class="card-text small text-truncate mb-1" title="${file.name}">${file.name}</p>
                                            <div class="btn-group btn-group-sm w-100">
                                                <button type="button" 
                                                    class="btn btn-outline-primary existing-file-preview" 
                                                    data-url="${file.url}" 
                                                    data-name="${file.name}" 
                                                    data-size="${file.size || ''}" 
                                                    data-type="${file.type || ''}"
                                                    data-index="${validFiles.indexOf(file)}"
                                                    title="Просмотр файла">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            if (typeof updateGlobalCurrentFiles === 'function') {
                const fileData = validFiles.map((file, index) => ({
                    url: file.url,
                    name: file.name,
                    size: file.size || 0,
                    type: file.type || 'file',
                    index: index
                }));
                updateGlobalCurrentFiles(fileData);
                console.log('Обновлен глобальный массив файлов для просмотра заметки:', fileData);
            }
        }
    }
    const isTrash = source === 'trash';
    const isArchive = source === 'archive';
    const badgeStyle = "font-size: 0.7em; font-weight: 600;";
    $('#viewNoteModalLabel').html(`
        <span class="me-2" style="color: ${getNoteColorHex(note.color)};">●</span>
        ${note.name}
        <div class="mt-1">
            <span class="badge ${note.done ? 'bg-success' : 'bg-warning'}" style="${badgeStyle}">
                ${note.done ? 'Выполнено' : 'Активно'}
            </span>
            ${note.folder ? `<span class="badge bg-secondary ms-1" style="${badgeStyle}">
                <i class="fas fa-folder me-1"></i>${note.folder}
            </span>` : ''}
            <span class="badge ms-1" style="${badgeStyle} background-color: ${getNoteColorHex(note.color)};">
                ${getPriorityName(note.color)}
            </span>
            ${isArchive ? `<span class="badge bg-info ms-1" style="${badgeStyle}">Архивирован</span>` : ''}
            ${isTrash ? `<span class="badge bg-danger ms-1" style="${badgeStyle}">В корзине</span>` : ''}
            ${note.is_pinned ? `<span class="badge pin-badge ms-1" style="${badgeStyle}">Закреплено</span>` : ''}
        </div>
    `);
    $('#viewNoteContent').html(`
        <div class="note-full-content mb-4">
            ${note.formatted_description || note.description}
        </div>
        
        ${tagsHTML}
        ${filesHTML}
        
        <div class="note-meta text-muted">
            <div class="row">
                <div class="col-md-6">
                    <p><i class="far fa-calendar-alt me-2"></i>Создано: ${dateCreated}</p>
                </div>
                <div class="col-md-6">
                    ${isUpdated ? `<p><i class="far fa-edit me-2"></i>Обновлено: ${dateUpdated}</p>` : ''}
                </div>
            </div>
        </div>
    `);
    const editButton = $('#viewNoteEditBtn');
    editButton.attr('href', `/notes/${note.id}/edit`);
    console.log(`Управление кнопкой редактирования для заметки: источник=${source}, ID=${note.id}`);
    console.log('[КНОПКА] Состояние source перед обработкой кнопки редактирования:', source);
    if (source === 'trash') {
        editButton.closest('.modal-footer').find('#viewNoteEditBtn').remove();
        console.log('[КНОПКА] 🔴 Кнопка редактирования УДАЛЕНА, так как заметка из корзины');
        editButton.closest('.modal-footer').append('<span class="text-danger ms-2">Редактирование недоступно для заметок в корзине</span>');
    } else {
        editButton.show();
        editButton.removeClass('disabled btn-secondary').addClass('btn-primary');
        editButton.removeAttr('aria-disabled');
        editButton.removeAttr('data-bs-toggle');
        editButton.removeAttr('data-bs-placement');
        editButton.removeAttr('title');
        console.log('[КНОПКА] ✅ Кнопка редактирования доступна');
    }
    const statusAlerts = [];
    if (note.folder) {
        statusAlerts.push({
            type: 'warning',
            icon: 'folder',
            message: `<strong>Внимание!</strong> Эта заметка находится в папке <strong>${note.folder}</strong>.`
        });
    }
    if (source === 'trash' || source === 'archive') {
        statusAlerts.push(`
            <div class="alert ${source === 'trash' ? 'alert-danger' : 'alert-info'} mb-3">
                <i class="fas ${source === 'trash' ? 'fa-trash-alt' : 'fa-archive'} me-2"></i>
                <strong>Внимание!</strong> Эта заметка находится в ${source === 'trash' ? 'корзине' : 'архиве'}.
                ${source === 'trash' ? 'Редактирование недоступно.' : ''}
            </div>
        `);
    }
    if (note.folder) {
        statusAlerts.push(`
            <div class="alert alert-secondary mb-3">
                <i class="fas fa-folder me-2"></i>
                <strong>Внимание!</strong> Эта заметка находится в папке <strong>${note.folder}</strong>.
            </div>
        `);
    }
    if (statusAlerts.length > 0) {
        $('#viewNoteContent').prepend(statusAlerts.join(''));
    }
}
