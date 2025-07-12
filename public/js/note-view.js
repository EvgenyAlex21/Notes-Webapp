// Функции для работы с просмотром заметки

/**
 * Инициализация обработчиков для просмотра заметок
 */
function initViewNoteHandlers() {
    // Обработчик для кнопки "Просмотреть" в контекстном меню
    $('.view-note-btn').off('click').on('click', function(e) {
        e.preventDefault();
        const noteId = $(this).data('id');
        viewNote(noteId);
    });
}

/**
 * Показать заметку в модальном окне
 * @param {number} id - ID заметки
 */
function viewNote(id) {
    // Получаем заметку по ID
    $.ajax({
        url: `/api/notes/${id}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.data) {
                const note = response.data;
                renderNoteInModal(note);
                // Открываем модальное окно
                viewNoteModal.show();
            }
        },
        error: function(xhr) {
            showNotification('Не удалось загрузить заметку', 'error');
        }
    });
}

/**
 * Отображение заметки в модальном окне
 * @param {Object} note - Данные заметки
 */
function renderNoteInModal(note) {
    // Получаем массив тегов, если они есть
    const tagsArray = note.tags ? note.tags.split(',') : [];
    const tagsHTML = tagsArray.length > 0 ? 
        `<div class="tags-section mt-3">
            <h6 class="mb-2"><i class="fas fa-tags me-2"></i>Теги:</h6>
            <div class="d-flex flex-wrap gap-2">
                ${tagsArray.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
        </div>` : '';
    
    // Форматируем даты
    const createdAt = new Date(note.created_at);
    const updatedAt = new Date(note.updated_at);
    const isUpdated = createdAt.getTime() !== updatedAt.getTime();
    const dateCreated = formatDate(createdAt);
    const dateUpdated = formatDate(updatedAt);
    
    // Формируем HTML для файлов
    const filesHTML = note.files && note.files.length > 0 ? `
        <div class="note-files mt-4">
            <h6 class="mb-3">Прикрепленные файлы (${note.files.length}):</h6>
            <div class="d-flex flex-wrap gap-3 mt-2">
                ${note.files.map(file => `
                    <a href="${file.url}" target="_blank" 
                       class="file-link d-flex align-items-center p-2 border rounded bg-light text-dark">
                        <i class="fas fa-${file.type === 'image' ? 'image' : 
                                           file.type === 'video' ? 'video' : 
                                           file.type === 'audio' ? 'music' :
                                           file.type === 'document' ? 'file-alt' : 'file'} me-2"></i>
                        <span class="text-truncate" style="max-width: 150px;">${file.name}</span>
                        <span class="ms-2 badge bg-light text-secondary" style="font-size: 0.7em;">
                            ${(file.size / (1024 * 1024)).toFixed(1)} МБ
                        </span>
                    </a>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    // Устанавливаем содержимое модального окна
    $('#viewNoteModalLabel').html(`
        <span class="me-2" style="color: ${getNoteColorHex(note.color)};">●</span>
        ${note.name}
        <span class="ms-2 badge ${note.done ? 'bg-success' : 'bg-warning'}" style="font-size: 0.6em;">
            ${note.done ? 'Выполнено' : 'Активно'}
        </span>
        <span class="ms-2 badge" style="font-size: 0.6em; background-color: ${getNoteColorHex(note.color)};">
            ${getPriorityName(note.color)}
        </span>
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
    
    // Устанавливаем ссылку на редактирование
    $('#viewNoteEditBtn').attr('href', `/notes/${note.id}/edit`);
}


