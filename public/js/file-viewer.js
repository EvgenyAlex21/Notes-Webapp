/**
 * Модуль для просмотра различных типов файлов в модальном окне
 * Поддерживает изображения, аудио, видео, PDF и другие типы файлов
 */

let fileViewerModal = null;
let currentFileIndex = 0;
let filesList = [];

/**
 * Инициализация просмотрщика файлов
 */
function initFileViewer() {
    console.log('Инициализация просмотрщика файлов...');
    
    // Инициализация модального окна
    const fileViewerModalElement = document.getElementById('fileViewerModal');
    if (fileViewerModalElement) {
        fileViewerModal = new bootstrap.Modal(fileViewerModalElement);
        
        // Инициализация кнопок навигации
        document.getElementById('prev-file-btn').addEventListener('click', showPreviousFile);
        document.getElementById('next-file-btn').addEventListener('click', showNextFile);
        
        console.log('Просмотрщик файлов инициализирован');
    } else {
        console.warn('Элемент модального окна просмотрщика не найден');
    }
    
    // Добавляем обработчики для предпросмотра файлов
    setupFilePreviewHandlers();
}

/**
 * Настройка обработчиков для предпросмотра файлов
 */
function setupFilePreviewHandlers() {
    // Обработчик для предпросмотра файлов в карточках заметок
    $(document).on('click', '.file-preview-item', function(e) {
        e.preventDefault();
        
        const fileUrl = $(this).data('url');
        const fileName = $(this).data('name');
        const fileSize = $(this).data('size');
        const fileType = $(this).data('type');
        const fileIndex = $(this).data('index');
        const files = $(this).closest('.files-container').find('.file-preview-item');
        
        // Собираем информацию о всех файлах для галереи
        filesList = [];
        files.each(function() {
            filesList.push({
                url: $(this).data('url'),
                name: $(this).data('name'),
                size: $(this).data('size'),
                type: $(this).data('type')
            });
        });
        
        // Устанавливаем текущий индекс и показываем файл
        currentFileIndex = fileIndex !== undefined ? fileIndex : 0;
        showFileInViewer(fileUrl, fileName, fileSize, fileType);
        
        console.log('Открытие файла в просмотрщике:', fileName);
    });
    
    // Обработчик для списка файлов в модальном окне просмотра заметки
    $(document).on('click', '.note-file-item', function(e) {
        e.preventDefault();
        
        const fileUrl = $(this).data('url');
        const fileName = $(this).data('name');
        const fileSize = $(this).data('size');
        const fileType = $(this).data('type');
        const fileIndex = $(this).data('index');
        const files = $(this).closest('.note-files-list').find('.note-file-item');
        
        // Собираем информацию о всех файлах для галереи
        filesList = [];
        files.each(function() {
            filesList.push({
                url: $(this).data('url'),
                name: $(this).data('name'),
                size: $(this).data('size'),
                type: $(this).data('type')
            });
        });
        
        // Устанавливаем текущий индекс и показываем файл
        currentFileIndex = fileIndex !== undefined ? fileIndex : 0;
        showFileInViewer(fileUrl, fileName, fileSize, fileType);
        
        console.log('Открытие файла из модального окна заметки:', fileName);
    });
    
    // Обработчик для страницы редактирования
    $(document).on('click', '.edit-file-preview', function(e) {
        e.preventDefault();
        
        const fileUrl = $(this).data('url');
        const fileName = $(this).data('name');
        const fileSize = $(this).data('size');
        const fileType = $(this).data('type');
        
        // Показываем файл в просмотрщике
        showFileInViewer(fileUrl, fileName, fileSize, fileType);
        console.log('Открытие файла на странице редактирования:', fileName);
    });
}

/**
 * Показать файл в модальном окне просмотрщика
 * @param {string} url - URL файла
 * @param {string} name - Имя файла
 * @param {string|number} size - Размер файла (в байтах или форматированный)
 * @param {string} type - Тип файла (image, audio, video, pdf, doc, etc)
 */
function showFileInViewer(url, name, size, type) {
    // Заполняем информацию о файле
    document.getElementById('file-name').textContent = name;
    document.getElementById('file-size').textContent = formatFileSize(size);
    
    // Настраиваем кнопку скачивания
    const downloadBtn = document.getElementById('download-file');
    downloadBtn.href = url;
    downloadBtn.setAttribute('download', name);
    
    // Получаем контейнер для содержимого файла
    const contentContainer = document.getElementById('file-viewer-content');
    contentContainer.innerHTML = '';
    
    // Определяем тип файла по расширению, если не передан
    if (!type) {
        type = getFileTypeByExtension(name);
    }
    
    // Получаем расширение файла для более точного определения типа
    const extension = name.toLowerCase().split('.').pop();
    
    // В зависимости от типа файла создаем соответствующий элемент
    switch (type) {
        case 'image':
            createImageViewer(contentContainer, url, name);
            break;
        case 'audio':
            createAudioPlayer(contentContainer, url, name);
            break;
        case 'video':
            createVideoPlayer(contentContainer, url, name);
            break;
        case 'pdf':
        case 'application/pdf':
            createPdfViewer(contentContainer, url, name);
            break;
        case 'doc':
        case 'docx':
        case 'xls':
        case 'xlsx':
        case 'ppt':
        case 'pptx':
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            createOfficeViewer(contentContainer, url, name, extension || type);
            break;
        case 'txt':
        case 'text/plain':
        case 'json':
        case 'application/json':
        case 'xml':
        case 'html':
        case 'css':
        case 'js':
            createTextViewer(contentContainer, url, name);
            break;
        case 'archive':
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
        case 'bz2':
        case 'xz':
        case 'tgz':
            createArchiveViewer(contentContainer, url, name, type);
            break;
        default:
            // Проверяем наличие функции перед вызовом
            if (typeof createGenericFileInfo === 'function') {
                createGenericFileInfo(contentContainer, url, name, extension || type);
            } else {
                // Запасной вариант, если функция не определена
                console.error('Функция createGenericFileInfo не найдена, используем запасной вариант');
                const infoDiv = document.createElement('div');
                infoDiv.className = 'p-4 text-center';
                infoDiv.innerHTML = `
                    <div class="mb-3"><i class="fas fa-file fa-4x text-secondary"></i></div>
                    <h5>${name}</h5>
                    <p class="text-muted mb-4">Файл не может быть предпросмотрен. Вы можете скачать его.</p>
                    <a href="${url}" class="btn btn-primary" download>
                        <i class="fas fa-download me-2"></i>Скачать файл
                    </a>
                `;
                contentContainer.appendChild(infoDiv);
            }
            break;
    }
    
    // Настраиваем отображение кнопок навигации
    updateNavigationButtons();
    
    // Открываем модальное окно
    fileViewerModal.show();
}

/**
 * Создает просмотрщик изображений
 */
function createImageViewer(container, url, name) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = name;
    img.className = 'img-fluid';
    img.style.maxHeight = '80vh';
    container.appendChild(img);
    
    // Настраиваем контейнер
    container.style.textAlign = 'center';
    container.style.padding = '20px';
}

/**
 * Создает аудиоплеер
 */
function createAudioPlayer(container, url, name) {
    const audioContainer = document.createElement('div');
    audioContainer.className = 'p-4 text-center';
    
    // Иконка аудиофайла
    const icon = document.createElement('div');
    icon.innerHTML = '<i class="fas fa-file-audio fa-4x mb-3 text-primary"></i>';
    
    // Название файла
    const title = document.createElement('h5');
    title.textContent = name;
    title.className = 'mb-3';
    
    // Аудиоплеер
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = url;
    audio.className = 'w-100';
    audio.style.maxWidth = '500px';
    
    // Добавляем элементы в контейнер
    audioContainer.appendChild(icon);
    audioContainer.appendChild(title);
    audioContainer.appendChild(audio);
    container.appendChild(audioContainer);
    
    // Автоматически запускаем воспроизведение
    audio.play().catch(e => console.log('Автоматическое воспроизведение не разрешено браузером'));
}

/**
 * Создает видеоплеер
 */
function createVideoPlayer(container, url, name) {
    const video = document.createElement('video');
    video.controls = true;
    video.src = url;
    video.className = 'w-100';
    video.style.maxHeight = '70vh';
    container.appendChild(video);
    
    // Автоматически запускаем воспроизведение
    video.play().catch(e => console.log('Автоматическое воспроизведение не разрешено браузером'));
}

/**
 * Создает просмотрщик PDF
 */
function createPdfViewer(container, url, name) {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'w-100';
    iframe.style.height = '70vh';
    iframe.style.border = 'none';
    container.appendChild(iframe);
}

/**
 * Создает просмотрщик офисных документов (через Google Docs Viewer или Office Online)
 */
function createOfficeViewer(container, url, name, type) {
    // Формируем абсолютный URL файла
    const absoluteUrl = new URL(url, window.location.origin).href;
    
    // Создаем контейнер с информацией
    const infoDiv = document.createElement('div');
    infoDiv.className = 'file-info-block';
    
    // Иконка в зависимости от типа файла
    let iconClass = 'fa-file';
    if (type.includes('doc')) iconClass = 'fa-file-word';
    else if (type.includes('xls')) iconClass = 'fa-file-excel';
    else if (type.includes('ppt')) iconClass = 'fa-file-powerpoint';
    
    infoDiv.innerHTML = `
        <div class="file-type-icon"><i class="fas ${iconClass} fa-4x text-primary"></i></div>
        <h4>${name}</h4>
        <p class="text-muted mb-4">Предпросмотр для документа можно открыть через внешний сервис Google Docs Viewer</p>
        <div class="d-flex justify-content-center">
            <a href="${url}" class="btn btn-outline-primary me-2" download>
                <i class="fas fa-download me-1"></i> Скачать
            </a>
            <a href="https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true" 
               class="btn btn-primary" target="_blank">
                <i class="fab fa-google me-1"></i> Открыть в Google Docs
            </a>
        </div>
    `;
    
    // Пытаемся встроить предпросмотр через iframe с Google Docs
    const previewContainer = document.createElement('div');
    previewContainer.className = 'mt-4';
    previewContainer.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Предпросмотр документа</span>
                <a href="https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}" 
                   class="btn btn-sm btn-outline-primary" target="_blank">
                   <i class="fas fa-external-link-alt me-1"></i> Открыть в полном размере
                </a>
            </div>
            <div class="card-body p-0">
                <iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true" 
                        width="100%" height="500px" frameborder="0"></iframe>
            </div>
        </div>
    `;
    
    container.appendChild(infoDiv);
    container.appendChild(previewContainer);
}

/**
 * Создает просмотрщик текстовых файлов
 */
function createTextViewer(container, url, name) {
    // Создаем контейнер для текста
    const textContainer = document.createElement('div');
    textContainer.className = 'text-content';
    
    // Добавляем лоадер, пока загружается содержимое
    const loader = document.createElement('div');
    loader.className = 'd-flex justify-content-center align-items-center p-5';
    loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>';
    container.appendChild(loader);
    
    // Загружаем содержимое текстового файла
    fetch(url)
        .then(response => response.text())
        .then(text => {
            textContainer.textContent = text;
        })
        .catch(error => {
            textContainer.innerHTML = `<div class="alert alert-danger">Не удалось загрузить текстовый файл: ${error.message}</div>`;
        });
    
    container.appendChild(textContainer);
}

/**
 * Создает просмотрщик для архивов
 */
function createArchiveViewer(container, url, name, type) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'file-info-block';
    
    infoDiv.innerHTML = `
        <div class="file-type-icon"><i class="fas fa-file-archive fa-4x text-primary"></i></div>
        <h4>${name}</h4>
        <p class="text-muted mb-4">Архивы можно только скачать. Предпросмотр недоступен.</p>
        <div class="d-flex justify-content-center">
            <a href="${url}" class="btn btn-primary" download>
                <i class="fas fa-download me-1"></i> Скачать архив
            </a>
        </div>
    `;
    
    container.appendChild(infoDiv);
}

/**
 * Создает информацию о недоступном файле
 */
function createErrorFileInfo(container, url, name, errorType = 'not-found') {
    container.innerHTML = '';
    
    const errorContainer = document.createElement('div');
    errorContainer.className = 'file-info-block';
    
    let iconClass, errorMessage, errorDetails;
    
    switch (errorType) {
        case 'not-found':
            iconClass = 'fa-exclamation-triangle text-warning';
            errorMessage = 'Файл не найден';
            errorDetails = 'Запрашиваемый файл не найден или был удален.';
            break;
        case 'access-denied':
            iconClass = 'fa-lock text-danger';
            errorMessage = 'Доступ запрещен';
            errorDetails = 'У вас нет прав для просмотра этого файла.';
            break;
        case 'format-error':
            iconClass = 'fa-file-alt text-danger';
            errorMessage = 'Ошибка формата';
            errorDetails = 'Невозможно отобразить файл в данном формате.';
            break;
        default:
            iconClass = 'fa-exclamation-circle text-danger';
            errorMessage = 'Ошибка просмотра';
            errorDetails = 'Произошла ошибка при попытке отобразить файл.';
    }
    
    errorContainer.innerHTML = `
        <div class="file-type-icon"><i class="fas ${iconClass}"></i></div>
        <h4 class="mb-3">${errorMessage}</h4>
        <p class="text-muted mb-4">${errorDetails}</p>
        <p class="text-muted mb-2">Имя файла: ${name}</p>
        <a href="${url}" class="btn btn-primary" download>
            <i class="fas fa-download me-2"></i>Скачать файл
        </a>
    `;
    
    container.appendChild(errorContainer);
}

/**
 * Создает информацию о файле для неподдерживаемых типов
 * @param {HTMLElement} container - Контейнер для размещения
 * @param {string} url - URL файла
 * @param {string} name - Имя файла
 * @param {string} type - Тип файла
 */
function createGenericFileInfo(container, url, name, type) {
    // Определяем подходящую иконку в зависимости от типа
    let iconClass = 'fa-file';
    let fileTypeText = 'Файл';
    
    if (type === 'archive' || ['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) {
        iconClass = 'fa-file-archive';
        fileTypeText = 'Архив';
    } else if (['exe', 'msi', 'bat', 'cmd'].includes(type)) {
        iconClass = 'fa-file-code';
        fileTypeText = 'Исполняемый файл';
    } else if (['db', 'sqlite', 'mdb', 'accdb'].includes(type)) {
        iconClass = 'fa-database';
        fileTypeText = 'База данных';
    } else if (['ttf', 'otf', 'woff', 'woff2'].includes(type)) {
        iconClass = 'fa-font';
        fileTypeText = 'Шрифт';
    }
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'file-info-block';
    
    infoDiv.innerHTML = `
        <div class="file-type-icon"><i class="fas ${iconClass} fa-4x text-primary"></i></div>
        <h4>${name}</h4>
        <p class="text-muted mb-4">${fileTypeText} не может быть предпросмотрен. Вы можете скачать его на устройство.</p>
    `;
    
    container.appendChild(infoDiv);
}

/**
 * Показывает предыдущий файл в галерее
 */
function showPreviousFile() {
    if (filesList.length <= 1) return;
    
    currentFileIndex = (currentFileIndex - 1 + filesList.length) % filesList.length;
    const file = filesList[currentFileIndex];
    showFileInViewer(file.url, file.name, file.size, file.type);
}

/**
 * Показывает следующий файл в галерее
 */
function showNextFile() {
    if (filesList.length <= 1) return;
    
    currentFileIndex = (currentFileIndex + 1) % filesList.length;
    const file = filesList[currentFileIndex];
    showFileInViewer(file.url, file.name, file.size, file.type);
}

/**
 * Обновляет отображение кнопок навигации
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-file-btn');
    const nextBtn = document.getElementById('next-file-btn');
    
    if (filesList.length <= 1) {
        // Если в галерее только один файл, скрываем кнопки навигации
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        // Показываем кнопки навигации
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    }
}

/**
 * Определяет тип файла по расширению
 */
function getFileTypeByExtension(filename) {
    if (!filename) return 'unknown';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    // Изображения
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico', 'heic'].includes(extension)) {
        return 'image';
    }
    
    // Аудио
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'opus', '3gp', 'mid', 'midi'].includes(extension)) {
        return 'audio';
    }
    
    // Видео
    if (['mp4', 'webm', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'mpeg', 'mpg', '3gp', 'ogv', 'ts', 'm4v'].includes(extension)) {
        return 'video';
    }
    
    // PDF
    if (extension === 'pdf') {
        return 'pdf';
    }
    
    // Офисные документы - Microsoft Office
    if (['doc', 'docx', 'docm', 'dot', 'dotx'].includes(extension)) {
        return 'doc';
    }
    if (['xls', 'xlsx', 'xlsm', 'xlsb', 'xlt', 'xltx'].includes(extension)) {
        return 'xls';
    }
    if (['ppt', 'pptx', 'pptm', 'pot', 'potx', 'pps', 'ppsx'].includes(extension)) {
        return 'ppt';
    }
    
    // Офисные документы - OpenOffice / LibreOffice
    if (['odt', 'ott', 'fodt'].includes(extension)) {
        return 'doc'; // OpenDocument Text
    }
    if (['ods', 'ots', 'fods'].includes(extension)) {
        return 'xls'; // OpenDocument Spreadsheet
    }
    if (['odp', 'otp', 'fodp'].includes(extension)) {
        return 'ppt'; // OpenDocument Presentation
    }
    
    // Текстовые файлы
    if (['txt', 'csv', 'json', 'xml', 'log', 'md', 'rtf', 'ini', 'conf', 'config', 'yml', 'yaml', 'toml'].includes(extension)) {
        return 'txt';
    }
    
    // Код
    if (['html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx', 'php', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go', 'rb', 'pl', 'swift'].includes(extension)) {
        return 'txt';
    }
    
    // Архивы
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'].includes(extension)) {
        return 'archive';
    }
    
    // По умолчанию
    return 'other';
}

/**
 * Форматирует размер файла для отображения
 * @param {number|string} size - Размер файла в байтах или уже отформатированная строка
 */
function formatFileSize(size) {
    // Если это уже строка и она не является числом
    if (typeof size === 'string' && isNaN(size)) {
        return size;
    }
    
    // Преобразуем в число, если это строковое представление числа
    const sizeInBytes = typeof size === 'string' ? parseInt(size, 10) : size;
    
    // Если не число, возвращаем пустую строку
    if (isNaN(sizeInBytes)) {
        return '';
    }
    
    // Форматируем размер файла
    if (sizeInBytes < 1024) {
        return sizeInBytes + ' Б';
    } else if (sizeInBytes < 1024 * 1024) {
        return (sizeInBytes / 1024).toFixed(1) + ' КБ';
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
        return (sizeInBytes / (1024 * 1024)).toFixed(1) + ' МБ';
    } else {
        return (sizeInBytes / (1024 * 1024 * 1024)).toFixed(1) + ' ГБ';
    }
}

// Инициализация при загрузке документа
$(document).ready(function() {
    initFileViewer();
});
