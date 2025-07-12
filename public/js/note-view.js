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
    // Получаем числовой ID заметки (если передан с префиксом note-)
    const noteId = id.toString().replace('note-', '');
    console.log(`Запрос на просмотр заметки: получен ID=${id}, преобразован в noteId=${noteId}`);
    
    // Получаем заметку по ID
    $.ajax({
        url: `/api/notes/${noteId}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.data) {
                const note = response.data;
                console.log('Данные заметки для просмотра:', note);
                console.log('Файлы заметки для просмотра:', note.files);
                renderNoteInModal(note);
                // Открываем модальное окно
                viewNoteModal.show();
            }
        },
        error: function(xhr) {
            console.error(`Ошибка при загрузке заметки ID=${noteId}:`, xhr.status, xhr.statusText);
            showNotification(`Не удалось загрузить заметку (${xhr.status})`, 'error');
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
    console.log('Проверка файлов перед рендерингом:', note.files);
    console.log('Тип файлов:', typeof note.files, Array.isArray(note.files));
    
    // Обработка разных форматов файлов
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
    
    // Подробная отладка файлов
    if (note.files && note.files.length > 0) {
        console.log('Первый файл:', JSON.stringify(note.files[0]));
    }
    
    // Дополнительная проверка на корректность структуры файлов
    if (note.files && Array.isArray(note.files) && note.files.length > 0) {
        let validFiles = note.files.filter(file => 
            file && typeof file === 'object' && file.name && 
            (file.url || file.path) // Должен быть либо url, либо path
        );
        
        console.log('Проверенные файлы для отображения:', validFiles.length, 'из', note.files.length);
        
        // Если есть корректные файлы для отображения
        if (validFiles.length > 0) {
            // Для файлов, у которых есть path, но нет url, добавляем url
            validFiles = validFiles.map(file => {
                if (!file.url && file.path) {
                    file.url = `/storage/${file.path}`;
                    console.log('Добавлен URL для файла:', file.name, file.url);
                } else if (!file.url && !file.path) {
                    // Если нет ни url, ни path - ставим плейсхолдер
                    file.url = 'https://placehold.co/200?text=Файл+недоступен';
                    console.warn('У файла нет ни URL, ни path:', file);
                }
                
                // Определяем тип файла, если не указан
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
                    <div class="row g-3 mt-2">
                        ${validFiles.map(file => {
                            let preview = '';
                            if (file.type === 'image') {
                                preview = `<img src="${file.url}" class="img-thumbnail w-100" style="height: 100px; object-fit: cover;" alt="${file.name}" onerror="this.onerror=null;this.src='https://placehold.co/200?text=Изображение+недоступно';this.style='height:100px;object-fit:cover;'">`;
                            } else if (file.type === 'video') {
                                preview = `<video src="${file.url}" controls style="width: 100%; height: 100px; object-fit: cover; background: #f8f9fa;" onerror="this.onerror=null;this.outerHTML='<div class=\\'d-flex align-items-center justify-content-center\\' style=\\'height:100px;background:#f8f9fa;\\'><i class=\\'fas fa-film fa-2x text-danger\\'></i></div>'"></video>`;
                            } else {
                                // Документы и прочее
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
                                            <a href="${file.url}" target="_blank" class="btn btn-sm btn-outline-primary">Открыть</a>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
    }
    
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


