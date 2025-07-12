let fileViewerModal = null;
let currentFileIndex = 0;
let filesList = [];

window.currentFileIndex = currentFileIndex;
window.filesList = filesList;

/**
 * Обновление глобального массива файлов из внешних скриптов
 * @param {Array} newFilesList - Новый массив файлов
 */
function updateGlobalCurrentFiles(newFilesList) {
    filesList = newFilesList || [];
    window.filesList = filesList;
    currentFileIndex = 0;
    window.currentFileIndex = currentFileIndex;
    console.log('Обновлен глобальный массив файлов:', filesList.length, 'файлов');
}

window.updateGlobalCurrentFiles = updateGlobalCurrentFiles;

function initFileViewer() {
    console.log('Инициализация просмотрщика файлов...');
    const fileViewerModalElement = document.getElementById('fileViewerModal');
    if (fileViewerModalElement) {
        fileViewerModal = new bootstrap.Modal(fileViewerModalElement);
        document.getElementById('prev-file-btn').addEventListener('click', showPreviousFile);
        document.getElementById('next-file-btn').addEventListener('click', showNextFile);
        console.log('Просмотрщик файлов инициализирован');
    } else {
        console.warn('Элемент модального окна просмотрщика не найден');
    }
    setupFilePreviewHandlers();
}

function setupFilePreviewHandlers() {
    $(document).on('click', '.file-preview-item', function(e) {
        e.preventDefault();
        const fileUrl = $(this).data('url');
        const fileName = $(this).data('name');
        const fileSize = $(this).data('size');
        const fileType = $(this).data('type');
        const fileIndex = $(this).data('index');
        const files = $(this).closest('.files-container').find('.file-preview-item');
        filesList = [];
        files.each(function() {
            filesList.push({
                url: $(this).data('url'),
                name: $(this).data('name'),
                size: $(this).data('size'),
                type: $(this).data('type')
            });
        });
        currentFileIndex = fileIndex !== undefined ? fileIndex : 0;
        window.filesList = filesList;
        window.currentFileIndex = currentFileIndex;
        showFileInViewer(fileUrl, fileName, fileSize, fileType);
        console.log('Открытие файла в просмотрщике:', fileName);
    });

    $(document).on('click', '.note-file-item', function(e) {
        e.preventDefault();
        const fileUrl = $(this).data('url');
        const fileName = $(this).data('name');
        const fileSize = $(this).data('size');
        const fileType = $(this).data('type');
        const fileIndex = $(this).data('index');
        const files = $(this).closest('.note-files-list').find('.note-file-item');
        filesList = [];
        files.each(function() {
            filesList.push({
                url: $(this).data('url'),
                name: $(this).data('name'),
                size: $(this).data('size'),
                type: $(this).data('type')
            });
        });
        currentFileIndex = fileIndex !== undefined ? fileIndex : 0;
        window.filesList = filesList;
        window.currentFileIndex = currentFileIndex;
        showFileInViewer(fileUrl, fileName, fileSize, fileType);
        console.log('Открытие файла из модального окна заметки:', fileName);
    });

    $(document).on('click', '.existing-file-preview', function(e) {
        e.preventDefault();
        const fileUrl = $(this).data('url');
        const fileName = $(this).data('name');
        const fileSize = $(this).data('size');
        const fileType = $(this).data('type');
        const fileIndex = $(this).data('index');
        const files = $('#viewNoteModal .existing-files-container .existing-file-preview, #viewNoteModal .note-files .existing-file-preview');
        filesList = [];
        files.each(function() {
            filesList.push({
                url: $(this).data('url'),
                name: $(this).data('name'),
                size: $(this).data('size'),
                type: $(this).data('type')
            });
        });
        currentFileIndex = fileIndex !== undefined ? fileIndex : 0;
        window.filesList = filesList;
        window.currentFileIndex = currentFileIndex;
        showFileInViewer(fileUrl, fileName, fileSize, fileType);
        console.log('Открытие существующего файла в просмотрщике:', fileName, 'из', filesList.length, 'файлов');
    });

    $(document).on('click', '.edit-file-preview', function(e) {
        e.preventDefault();
        const fileUrl = $(this).data('url');
        const fileName = $(this).data('name');
        const fileSize = $(this).data('size');
        const fileType = $(this).data('type');
        const fileIndex = $(this).data('index');
        const files = $(this).closest('.existing-files-container').find('.edit-file-preview');
        filesList = [];
        files.each(function() {
            filesList.push({
                url: $(this).data('url'),
                name: $(this).data('name'),
                size: $(this).data('size'),
                type: $(this).data('type')
            });
        });
        currentFileIndex = fileIndex !== undefined ? fileIndex : 0;
        window.filesList = filesList;
        window.currentFileIndex = currentFileIndex;
        showFileInViewer(fileUrl, fileName, fileSize, fileType);
        console.log('Открытие файла на странице редактирования:', fileName, 'из', filesList.length, 'файлов');
    });

    $(document).on('click', '.new-file-preview', function(e) {
        e.preventDefault();
        const fileUrl = $(this).data('url');
        const fileName = $(this).data('name');
        const fileSize = $(this).data('size');
        const fileType = $(this).data('type');
        const fileIndex = $(this).data('index');
        const files = $(this).closest('#file-preview').find('.new-file-preview');
        filesList = [];
        files.each(function() {
            filesList.push({
                url: $(this).data('url'),
                name: $(this).data('name'),
                size: $(this).data('size'),
                type: $(this).data('type')
            });
        });
        currentFileIndex = fileIndex !== undefined ? fileIndex : 0;
        window.filesList = filesList;
        window.currentFileIndex = currentFileIndex;
        showFileInViewer(fileUrl, fileName, fileSize, fileType);
        console.log('Открытие нового файла в просмотрщике:', fileName, 'из', filesList.length, 'файлов');
    });
}

/**
 * Показать файл в модальном окне
 * @param {string} url 
 * @param {string} name 
 * @param {string|number} size 
 * @param {string} type 
 */
function showFileInViewer(url, name, size, type) {
    document.getElementById('file-name').textContent = name;
    document.getElementById('file-size').textContent = formatFileSize(size);
    
    const downloadBtn = document.getElementById('download-file');
    downloadBtn.href = url;
    downloadBtn.setAttribute('download', name);
    
    const contentContainer = document.getElementById('file-viewer-content');
    contentContainer.innerHTML = '';
    
    if (!type) {
        type = getFileTypeByExtension(name);
    }
    
    const extension = name.toLowerCase().split('.').pop();
    
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
            if (typeof createGenericFileInfo === 'function') {
                createGenericFileInfo(contentContainer, url, name, extension || type);
            } else {
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
    
    updateNavigationButtons();
    
    fileViewerModal.show();
}

function createImageViewer(container, url, name) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = name;
    img.className = 'img-fluid';
    img.style.maxHeight = '80vh';
    container.appendChild(img);
    
    container.style.textAlign = 'center';
    container.style.padding = '20px';
}

function createAudioPlayer(container, url, name) {
    const audioContainer = document.createElement('div');
    audioContainer.className = 'p-4 text-center';
    
    const icon = document.createElement('div');
    icon.innerHTML = '<i class="fas fa-file-audio fa-4x mb-3 text-primary"></i>';
    
    const title = document.createElement('h5');
    title.textContent = name;
    title.className = 'mb-3';
    
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = url;
    audio.className = 'w-100';
    audio.style.maxWidth = '500px';

    audioContainer.appendChild(icon);
    audioContainer.appendChild(title);
    audioContainer.appendChild(audio);
    container.appendChild(audioContainer);
    
    audio.play().catch(e => console.log('Автоматическое воспроизведение не разрешено браузером'));
}

function createVideoPlayer(container, url, name) {
    const video = document.createElement('video');
    video.controls = true;
    video.src = url;
    video.className = 'w-100';
    video.style.maxHeight = '70vh';
    container.appendChild(video);
    
    video.play().catch(e => console.log('Автоматическое воспроизведение не разрешено браузером'));
}

function createPdfViewer(container, url, name) {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'w-100';
    iframe.style.height = '70vh';
    iframe.style.border = 'none';
    container.appendChild(iframe);
}

function createOfficeViewer(container, url, name, type) {
    const absoluteUrl = new URL(url, window.location.origin).href;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'file-info-block';
    
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

function createTextViewer(container, url, name) {
    const textContainer = document.createElement('div');
    textContainer.className = 'text-content';
    
    const loader = document.createElement('div');
    loader.className = 'd-flex justify-content-center align-items-center p-5';
    loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>';
    container.appendChild(loader);
    
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
 * @param {HTMLElement} container 
 * @param {string} url 
 * @param {string} name 
 * @param {string} type 
 */
function createGenericFileInfo(container, url, name, type) {
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

function showPreviousFile() {
    const currentList = window.filesList || filesList;
    let currentIndex = window.currentFileIndex !== undefined ? window.currentFileIndex : currentFileIndex;
    
    if (currentList.length <= 1) return;
    
    currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    const file = currentList[currentIndex];

    window.currentFileIndex = currentIndex;
    currentFileIndex = currentIndex;
    
    showFileInViewer(file.url, file.name, file.size, file.type);
}

function showNextFile() {
    const currentList = window.filesList || filesList;
    let currentIndex = window.currentFileIndex !== undefined ? window.currentFileIndex : currentFileIndex;
    
    if (currentList.length <= 1) return;
    
    currentIndex = (currentIndex + 1) % currentList.length;
    const file = currentList[currentIndex];
    
    window.currentFileIndex = currentIndex;
    currentFileIndex = currentIndex;
    
    showFileInViewer(file.url, file.name, file.size, file.type);
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-file-btn');
    const nextBtn = document.getElementById('next-file-btn');
    
    const currentList = window.filesList || filesList;
    
    if (currentList.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    }
}

function getFileTypeByExtension(filename) {
    if (!filename) return 'unknown';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico', 'heic'].includes(extension)) {
        return 'image';
    }
    
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'opus', '3gp', 'mid', 'midi'].includes(extension)) {
        return 'audio';
    }
    
    if (['mp4', 'webm', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'mpeg', 'mpg', '3gp', 'ogv', 'ts', 'm4v'].includes(extension)) {
        return 'video';
    }
    
    if (extension === 'pdf') {
        return 'pdf';
    }
    
    if (['doc', 'docx', 'docm', 'dot', 'dotx'].includes(extension)) {
        return 'doc';
    }
    if (['xls', 'xlsx', 'xlsm', 'xlsb', 'xlt', 'xltx'].includes(extension)) {
        return 'xls';
    }
    if (['ppt', 'pptx', 'pptm', 'pot', 'potx', 'pps', 'ppsx'].includes(extension)) {
        return 'ppt';
    }
    
    if (['odt', 'ott', 'fodt'].includes(extension)) {
        return 'doc'; 
    }
    if (['ods', 'ots', 'fods'].includes(extension)) {
        return 'xls'; 
    }
    if (['odp', 'otp', 'fodp'].includes(extension)) {
        return 'ppt'; 
    }
    
    if (['txt', 'csv', 'json', 'xml', 'log', 'md', 'rtf', 'ini', 'conf', 'config', 'yml', 'yaml', 'toml'].includes(extension)) {
        return 'txt';
    }
    
    if (['html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx', 'php', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go', 'rb', 'pl', 'swift'].includes(extension)) {
        return 'txt';
    }
    
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'].includes(extension)) {
        return 'archive';
    }
    
    return 'other';
}

/**
 * Форматирует размер файла для отображения
 * @param {number|string} size 
 */
function formatFileSize(size) {
    if (typeof size === 'string' && isNaN(size)) {
        return size;
    }
    
    const sizeInBytes = typeof size === 'string' ? parseInt(size, 10) : size;
    
    if (isNaN(sizeInBytes)) {
        return '';
    }
    
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

$(document).ready(function() {
    initFileViewer();
});