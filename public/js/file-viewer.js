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
            createPdfViewer(contentContainer, url, name);
            break;
        case 'doc':
        case 'docx':
        case 'xls':
        case 'xlsx':
        case 'ppt':
        case 'pptx':
            createOfficeViewer(contentContainer, url, name, type);
            break;
        case 'txt':
            createTextViewer(contentContainer, url, name);
            break;
        default:
            createGenericFileInfo(contentContainer, url, name, type);
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
    infoDiv.className = 'p-4 text-center';
    
    // Иконка в зависимости от типа файла
    let iconClass = 'fa-file';
    if (type.includes('doc')) iconClass = 'fa-file-word';
    else if (type.includes('xls')) iconClass = 'fa-file-excel';
    else if (type.includes('ppt')) iconClass = 'fa-file-powerpoint';
    
    infoDiv.innerHTML = `
        <div class="mb-3"><i class="fas ${iconClass} fa-4x text-primary"></i></div>
        <h5>${name}</h5>
        <p class="text-muted mb-4">Документы не могут быть предпросмотрены напрямую. Используйте кнопку скачать или откройте через Google Docs.</p>
    `;
    
    // Кнопка для открытия через Google Docs
    const googleDocsBtn = document.createElement('a');
    googleDocsBtn.href = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    googleDocsBtn.target = '_blank';
    googleDocsBtn.className = 'btn btn-primary me-2';
    googleDocsBtn.innerHTML = '<i class="fab fa-google me-2"></i>Открыть через Google Docs';
    
    infoDiv.appendChild(googleDocsBtn);
    container.appendChild(infoDiv);
}

/**
 * Создает просмотрщик текстовых файлов
 */
function createTextViewer(container, url, name) {
    // Создаем контейнер для текста
    const textContainer = document.createElement('div');
    textContainer.className = 'p-3';
    textContainer.style.maxHeight = '70vh';
    textContainer.style.overflow = 'auto';
    textContainer.style.backgroundColor = '#f8f9fa';
    textContainer.style.fontFamily = 'monospace';
    textContainer.style.whiteSpace = 'pre-wrap';
    
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
 * Создает информацию о файле, для которого нет специального обработчика
 */
function createGenericFileInfo(container, url, name, type) {
    const extension = name.split('.').pop().toLowerCase();
    
    // Определяем иконку в зависимости от расширения
    let iconClass = 'fa-file';
    if (['zip', 'rar', '7z'].includes(extension)) iconClass = 'fa-file-archive';
    else if (['js', 'php', 'html', 'css', 'py', 'java', 'c', 'cpp'].includes(extension)) iconClass = 'fa-file-code';
    
    // Создаем контейнер с информацией
    const infoDiv = document.createElement('div');
    infoDiv.className = 'p-4 text-center';
    infoDiv.innerHTML = `
        <div class="mb-3"><i class="fas ${iconClass} fa-4x text-secondary"></i></div>
        <h5>${name}</h5>
        <p class="text-muted">Предпросмотр для этого типа файла не поддерживается.</p>
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
    const extension = filename.split('.').pop().toLowerCase();
    
    // Определяем тип по расширению
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
        return 'image';
    } else if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(extension)) {
        return 'audio';
    } else if (['mp4', 'webm', 'avi', 'mov', 'wmv', 'mkv'].includes(extension)) {
        return 'video';
    } else if (extension === 'pdf') {
        return 'pdf';
    } else if (['doc', 'docx'].includes(extension)) {
        return 'doc';
    } else if (['xls', 'xlsx'].includes(extension)) {
        return 'xls';
    } else if (['ppt', 'pptx'].includes(extension)) {
        return 'ppt';
    } else if (extension === 'txt') {
        return 'txt';
    } else {
        return 'other';
    }
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
