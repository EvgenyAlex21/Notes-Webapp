/**
 * Скрипт для обновления счетчиков заметок в боковой панели
 */

// Локальная переменная для хранения статистики
let sidebarStatsData = {
    // Фиктивные данные на случай, если API недоступен
    total: 0, 
    active: 0,
    completed: 0,
    archived: 0, 
    trashed: 0,
    pinned: 0,
    with_reminders: 0
};

$(document).ready(function() {
    // Убираем класс d-none у всех счетчиков
    $('.notes-count').removeClass('d-none');
    
    // Сразу загружаем актуальную статистику с сервера
    $.ajax({
        url: '/api/stats',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.data) {
                sidebarStatsData = response.data;
                
                // Устанавливаем счетчики из статистики
                $('#all-notes-count').text(sidebarStatsData.total || 0);
                $('#archive-notes-count').text(sidebarStatsData.archived || 0);
                $('#trash-notes-count').text(sidebarStatsData.trashed || 0);
                $('#calendar-notes-count').text(sidebarStatsData.with_reminders || 0);
            }
        }
    });
    
    // Сначала посчитаем фактическое количество заметок на текущей странице
    countRealNotesOnPage();
    
    // Загружаем актуальные данные
    setTimeout(loadSidebarStats, 300);
    
    // Обновляем счетчики при каждом обновлении статистики из основного скрипта
    if (typeof window.loadStats === 'function') {
        try {
            const originalLoadStats = window.loadStats;
            window.loadStats = function() {
                const result = originalLoadStats();
                if (result && typeof result.then === 'function') {
                    return result.then(function(data) {
                        // Обновляем локальную копию статистики из основного скрипта
                        if (window.statsData) {
                            sidebarStatsData = window.statsData;
                        }
                        updateSidebarCounters();
                        return data;
                    });
                } else {
                    // Если функция не возвращает промис
                    setTimeout(function() {
                        if (window.statsData) {
                            sidebarStatsData = window.statsData;
                        }
                        updateSidebarCounters();
                    }, 500);
                    return result;
                }
            };
        } catch (e) {
            console.warn('Ошибка при переопределении loadStats');
        }
    }
    
    // Периодически обновляем счетчики из API
    setInterval(loadSidebarStats, 30000);
    
    // Периодически проверяем фактические счетчики на странице
    setInterval(countRealNotesOnPage, 5000);
    
    // Обновляем счетчики при переходе между страницами
    $(document).on('click', '.sidebar-link, .folder-link', function() {
        // Сохраняем предыдущий URL для сравнения
        const prevUrl = window.location.pathname;
        
        // После перехода проверяем, изменился ли URL
        setTimeout(function() {
            const currentUrl = window.location.pathname;
            if (prevUrl !== currentUrl) {
                loadSidebarStats();
            }
        }, 500);
    });
    
    // Добавляем обработчики для различных событий, которые могут изменить количество заметок на странице
    $(document).on('notesLoaded notesUpdated noteDeleted noteAdded noteStatusChanged', function() {
        setTimeout(countRealNotesOnPage, 100);
    });
    
    // Также обновляем счетчики при изменении DOM
    const observer = new MutationObserver(function(mutations) {
        let noteChanged = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                // Проверяем, относятся ли изменения к заметкам
                const noteChanges = Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && (
                        $(node).hasClass('note-item') || 
                        $(node).find('.note-item').length > 0
                    )
                ) || Array.from(mutation.removedNodes).some(node => 
                    node.nodeType === 1 && (
                        $(node).hasClass('note-item') ||
                        $(node).find('.note-item').length > 0
                    )
                );
                
                if (noteChanges) {
                    noteChanged = true;
                }
            }
        });
        
        if (noteChanged) {
            setTimeout(countRealNotesOnPage, 100);
        }
    });
    
    // Наблюдаем за изменениями в контейнере заметок
    const notesContainer = document.getElementById('notes-container');
    if (notesContainer) {
        observer.observe(notesContainer, { childList: true, subtree: true });
    }
    
    // Обработка активных папок - применяем стиль точно как у активных страниц
    $(document).on('click', '.folder-link', function(e) {
        // Предотвращаем мигание синего цвета
        e.preventDefault();
        
        // Сбрасываем все классы и стили мгновенно
        resetFolderStyles();
        
        // Добавляем класс active-folder только к родителю кликнутой ссылки
        $(this).closest('.folder-item').addClass('active-folder');
        
        // Переходим по ссылке программно после установки стилей
        const href = $(this).attr('href');
        if (href) {
            setTimeout(() => {
                window.location.href = href;
            }, 50);
        }
    });
    
    // Функция для сброса всех стилей папок
    function resetFolderStyles() {
        // Удаляем класс active-folder со всех папок
        $('.folder-item').removeClass('active-folder');
        
        // Удаляем все возможные стили, которые могли быть добавлены встроенно
        $('.folder-item').css({
            'background-color': '',
            'color': ''
        });
        
        $('.folder-item .folder-link').css({
            'color': '',
            'font-weight': ''
        });
        
        // Для надежности удаляем все возможные inline стили у счетчиков
        $('.folder-item .badge').css({
            'background-color': '',
            'color': ''
        });
    }
    
    // Устанавливаем активную папку при загрузке страницы на основе URL
    function setActiveFolderFromUrl() {
        // Получаем URL и проверяем, содержит ли он folder
        const currentUrl = window.location.pathname;
        if (currentUrl.includes('/notes/folder/')) {
            // Сбрасываем стили всех папок
            resetFolderStyles();
            
            // Извлекаем ID папки из URL
            const folderId = currentUrl.split('/').pop();
            
            // Находим соответствующую папку в боковом меню и активируем её
            const folderItem = $(`.folder-item a[href*="/notes/folder/${folderId}"]`).closest('.folder-item');
            
            if (folderItem.length > 0) {
                folderItem.addClass('active-folder');
            }
        }
    }
    
    // Запускаем функцию сразу и после небольшой задержки для надежности
    setActiveFolderFromUrl();
    setTimeout(setActiveFolderFromUrl, 500);
});

/**
 * Загружает статистику для боковой панели
 */
function loadSidebarStats() {
    // Если доступна глобальная функция загрузки статистики и данные, используем их
    if (typeof window.loadStats === 'function') {
        try {
            window.loadStats();
            if (window.statsData && Object.keys(window.statsData).length > 0) {
                sidebarStatsData = window.statsData;
                updateSidebarCounters();
                return;
            }
        } catch (e) {
            console.warn('Не удалось использовать глобальный loadStats');
        }
    }
    
    // Если нет - загружаем статистику самостоятельно
    $.ajax({
        url: '/api/stats',
        method: 'GET',
        dataType: 'json',
        timeout: 5000, // таймаут 5 секунд
        success: function(response) {
            if (response && response.data) {
                sidebarStatsData = response.data;
                
                // Обновляем счетчики с учетом текущей страницы
                const currentPath = window.location.pathname;
                
                // Для главной страницы и папок используем фактическое количество заметок на странице
                if (currentPath === '/notes' || currentPath === '/notes/' || currentPath.includes('/notes/folder')) {
                    // Вызываем функцию обновления счетчика главной страницы
                    updateMainPageCounter();
                } else {
                    // Для остальных страниц обновляем все счетчики
                    updateSidebarCounters();
                }
            } else {
                console.error('Ошибка формата ответа при загрузке статистики боковой панели');
            }
        },
        error: function() {
            // Используем счетчики из DOM, если они доступны
            countRealNotesOnPage();
        }
    });
}

/**
 * Обновляет счетчики заметок в боковой панели на основе статистики и реальных данных на странице
 */
function updateSidebarCounters() {
    // Определяем источник данных - сначала проверяем глобальные данные, потом локальные
    const statsSource = window.statsData || sidebarStatsData;
    
    // Если статистика не загружена, загружаем ее
    if (!statsSource || Object.keys(statsSource).length === 0) {
        console.warn('Статистика не загружена, загружаем...');
        loadSidebarStats();
        return;
    }
    
    // Обновляем счетчики с учетом реального количества заметок на странице
    console.log('Обновление счетчиков боковой панели');
    
    // Текущий путь для правильного обновления счетчиков
    const currentPath = window.location.pathname;
    
    // Всегда обновляем счетчики из API для разделов, которые не отображаются
    updateCountersFromAPI(statsSource, currentPath);
    
    // Для текущей отображаемой страницы используем реальные данные
    if (currentPath === '/notes' || currentPath === '/notes/') {
        // На главной странице показываем только заметки БЕЗ папок
        updateMainPageCounterExcludingFolders(statsSource);
    } else if (currentPath.includes('/notes/folder')) {
        // В папке показываем количество заметок в этой конкретной папке
        updateFolderPageCounter();
    } else {
        // Для других страниц (архив, корзина, календарь) вызываем стандартную обработку
        countRealNotesOnPage();
    }
    
    // Проверяем, изменились ли счетчики на странице
    function checkPageCountersChange() {
        // Отслеживаем изменения в счетчиках на странице
        const totalNotesElement = $('#total-notes');
        
        if (totalNotesElement.length > 0 && !totalNotesElement.data('observer-attached')) {
            // Создаем наблюдатель за изменениями текста счетчика
            const observer = new MutationObserver(function(mutations) {
                countRealNotesOnPage();
            });
            
            // Начинаем наблюдение
            observer.observe(totalNotesElement[0], {
                childList: true,
                characterData: true,
                subtree: true
            });
            
            // Устанавливаем флаг, чтобы не создавать наблюдатель повторно
            totalNotesElement.data('observer-attached', true);
        }
    }
    
    // Запускаем функцию отслеживания изменений счетчиков
    setTimeout(checkPageCountersChange, 1000);
    
    // Всегда показываем счетчики, даже если они равны нулю
    $('.notes-count').each(function() {
        $(this).removeClass('d-none');
    });
}

/**
 * Обновляет счетчики из API для разделов, которые не отображаются на текущей странице
 */
function updateCountersFromAPI(statsSource, currentPath) {
    // Обновляем счетчики только для тех разделов, которые НЕ отображаются на текущей странице
    if (!currentPath.includes('/notes/archive')) {
        const archivedNotesCount = statsSource.archived || 0;
        $('#archive-notes-count').text(archivedNotesCount);
    }
    
    if (!currentPath.includes('/notes/trash')) {
        const trashedNotesCount = statsSource.trashed || 0;
        $('#trash-notes-count').text(trashedNotesCount);
    }
    
    if (!currentPath.includes('/notes/calendar')) {
        const calendarNotesCount = statsSource.with_reminders || 0;
        $('#calendar-notes-count').text(calendarNotesCount);
    }
    
    console.log('Обновлены счетчики из API для невидимых разделов');
}

/**
 * Обновляет счетчик главной страницы, исключая заметки в папках
 */
function updateMainPageCounterExcludingFolders(statsSource) {
    // На главной странице счетчик "Все заметки" должен показывать только заметки БЕЗ папок
    let mainPageCount = 0;
    
    // Сначала пробуем получить из счетчика на странице
    const totalNotesElement = $('#total-notes');
    if (totalNotesElement.length > 0) {
        const match = totalNotesElement.text().match(/Всего:\s*(\d+)/);
        if (match && match[1]) {
            mainPageCount = parseInt(match[1]);
        }
    }
    
    // Если не получилось, считаем видимые заметки
    if (mainPageCount === 0) {
        mainPageCount = $('.note-item').length;
    }
    
    console.log('Счетчик "Все заметки" на главной странице (без папок):', mainPageCount);
    $('#all-notes-count').text(mainPageCount);
}

/**
 * Обновляет счетчик для страницы папки
 */
function updateFolderPageCounter() {
    // В папке счетчик "Все заметки" должен показывать общее количество заметок БЕЗ папок
    const statsSource = window.statsData || sidebarStatsData;
    
    // Обновляем счетчик "Все заметки" из общей статистики (без учета папок)
    if (statsSource && statsSource.total !== undefined) {
        // Получаем общее количество заметок без учета папок
        let totalWithoutFolders = statsSource.total || 0;
        
        // Вычитаем заметки в папках
        if (statsSource.by_folder) {
            Object.values(statsSource.by_folder).forEach(folderCount => {
                totalWithoutFolders -= folderCount;
            });
        }
        
        $('#all-notes-count').text(Math.max(0, totalWithoutFolders));
        console.log('Счетчик "Все заметки" в папке (общие заметки без папок):', Math.max(0, totalWithoutFolders));
    }
}

/**
 * Считает и обновляет фактическое количество заметок на текущей странице
 * А также устанавливает правильный счетчик "Все заметки" на основе глобальной статистики
 */
function countRealNotesOnPage() {
    // Определяем текущую страницу по URL
    const pagePath = window.location.pathname;
    
    // Всегда получаем актуальное общее количество заметок из глобальной статистики
    const statsSource = window.statsData || sidebarStatsData;
    
    // Проверяем, находимся ли мы на главной странице заметок или в папках
    if (pagePath === '/notes' || pagePath === '/notes/') {
        // На главной странице показываем только заметки БЕЗ папок
        updateMainPageCounterExcludingFolders(statsSource);
        // Обновляем остальные счетчики из API
        updateCountersFromAPI(statsSource, pagePath);
    } else if (pagePath.includes('/notes/folder')) {
        // В папке показываем общие заметки без папок в счетчике "Все заметки"
        updateFolderPageCounter();
        // Обновляем остальные счетчики из API
        updateCountersFromAPI(statsSource, pagePath);
    } else {
        // Для других страниц обновляем соответствующий счетчик фактическими данными
        updateCurrentPageCounter(pagePath, statsSource);
    }
    
    // Всегда показываем счетчики
    $('.notes-count').each(function() {
        $(this).removeClass('d-none');
    });
}

/**
 * Обновляет счетчик для текущей отображаемой страницы (архив, корзина, календарь)
 */
function updateCurrentPageCounter(pagePath, statsSource) {
    // Счетчики для каждого раздела
    let pageNotesCount = 0;
    
    try {
        // Для страницы создания или редактирования заметки используем данные из API
        if (pagePath.includes('/notes/create') || pagePath.includes('/notes/edit')) {
            // Обновляем все счетчики напрямую из сохраненных данных статистики
            if (statsSource) {
                // Для счетчика "Все заметки" используем заметки без папок
                let totalWithoutFolders = statsSource.total || 0;
                if (statsSource.by_folder) {
                    Object.values(statsSource.by_folder).forEach(folderCount => {
                        totalWithoutFolders -= folderCount;
                    });
                }
                $('#all-notes-count').text(Math.max(0, totalWithoutFolders));
                $('#archive-notes-count').text(statsSource.archived || 0);
                $('#trash-notes-count').text(statsSource.trashed || 0);
                $('#calendar-notes-count').text(statsSource.with_reminders || 0);
            }
            return;
        }
        
        // Для обычных страниц подсчитываем количество заметок
        const notesOnPage = $('.note-item').length;
        
        // Получаем числовое значение счетчика "Всего" на странице
        let pageCount = 0;
        
        // Ищем счетчик через функцию поиска счетчиков
        const totalNotesElement = $('#total-notes');
        if (totalNotesElement.length > 0) {
            const totalCountMatch = totalNotesElement.text().match(/Всего:\s*(\d+)/);
            if (totalCountMatch && totalCountMatch[1]) {
                pageCount = parseInt(totalCountMatch[1]);
            }
        }
        
        // Если не найдено по ID, ищем альтернативными способами
        if (pageCount === 0) {
            const totalCountSelectors = [
                '.badge:contains("Всего:")',
                '.card-header .badge:contains("Всего")',
                '#notes-header .badge:contains("Всего")',
                '.header-counters .badge:contains("Всего")'
            ];
            
            // Перебираем селекторы
            for (const selector of totalCountSelectors) {
                const element = $(selector);
                if (element.length > 0) {
                    const match = element.text().match(/Всего:\s*(\d+)/);
                    if (match && match[1]) {
                        pageCount = parseInt(match[1]);
                        break;
                    }
                }
            }
            
            // Если всё еще не нашли, используем количество заметок на странице
            if (pageCount === 0) {
                pageCount = notesOnPage;
            }
        }
        
        // Используем найденное значение счетчика
        const countToUse = !isNaN(pageCount) && pageCount > 0 ? pageCount : notesOnPage;
        
        // Обновляем соответствующий счетчик в зависимости от текущего URL
        if (pagePath.includes('/notes/archive')) {
            $('#archive-notes-count').text(countToUse);
            // Для остальных счетчиков используем API
            if (statsSource) {
                let totalWithoutFolders = statsSource.total || 0;
                if (statsSource.by_folder) {
                    Object.values(statsSource.by_folder).forEach(folderCount => {
                        totalWithoutFolders -= folderCount;
                    });
                }
                $('#all-notes-count').text(Math.max(0, totalWithoutFolders));
                $('#trash-notes-count').text(statsSource.trashed || 0);
                $('#calendar-notes-count').text(statsSource.with_reminders || 0);
            }
        } else if (pagePath.includes('/notes/trash') || pagePath.includes('/notes/new-trash')) {
            $('#trash-notes-count').text(countToUse);
            // Для остальных счетчиков используем API
            if (statsSource) {
                let totalWithoutFolders = statsSource.total || 0;
                if (statsSource.by_folder) {
                    Object.values(statsSource.by_folder).forEach(folderCount => {
                        totalWithoutFolders -= folderCount;
                    });
                }
                $('#all-notes-count').text(Math.max(0, totalWithoutFolders));
                $('#archive-notes-count').text(statsSource.archived || 0);
                $('#calendar-notes-count').text(statsSource.with_reminders || 0);
            }
        } else if (pagePath.includes('/notes/calendar')) {
            $('#calendar-notes-count').text(countToUse);
            // Для остальных счетчиков используем API
            if (statsSource) {
                let totalWithoutFolders = statsSource.total || 0;
                if (statsSource.by_folder) {
                    Object.values(statsSource.by_folder).forEach(folderCount => {
                        totalWithoutFolders -= folderCount;
                    });
                }
                $('#all-notes-count').text(Math.max(0, totalWithoutFolders));
                $('#archive-notes-count').text(statsSource.archived || 0);
                $('#trash-notes-count').text(statsSource.trashed || 0);
            }
        }
    } catch (error) {
        console.error('Ошибка при подсчете заметок:', error);
    }
    
    // Всегда показываем счетчики
    $('.notes-count').each(function() {
        $(this).removeClass('d-none');
    });
}

/**
 * Обновляет счетчик заметок для главной страницы на основе счетчика "Всего" на странице
 */
function updateMainPageCounter() {
    // На главной странице "Все заметки" получаем количество из счетчика "Всего" на странице
    const totalNotesElement = $('#total-notes');
    let visibleNotesCount = 0;
    
    // Пытаемся найти счетчик на странице разными способами
    
    // 1. Проверяем основной ID элемента (в index.blade.php)
    if (totalNotesElement.length > 0) {
        const totalCountMatch = totalNotesElement.text().match(/Всего:\s*(\d+)/);
        if (totalCountMatch && totalCountMatch[1]) {
            visibleNotesCount = parseInt(totalCountMatch[1]);
            $('#all-notes-count').text(visibleNotesCount);
            return visibleNotesCount;
        }
    }
    
    // 2. Проверяем счетчик в новой корзине и других страницах с классом counter-total
    const counterTotal = $('.counter-total');
    if (counterTotal.length > 0) {
        const counterValue = parseInt(counterTotal.text());
        if (!isNaN(counterValue)) {
            visibleNotesCount = counterValue;
            $('#all-notes-count').text(visibleNotesCount);
            return visibleNotesCount;
        }
    }
    
    // 3. Проверяем альтернативные селекторы для счетчика "Всего"
    const alternativeSelectors = [
        '.card-header .badge:contains("Всего")', 
        '.header-counters .badge:contains("Всего")',
        '#notes-header .badge:contains("Всего")',
        '.card-header:contains("Всего")',
        '.card-title:contains("Всего")',
        '.notes-counter:contains("Всего")'
    ];
    
    for (const selector of alternativeSelectors) {
        const element = $(selector);
        if (element.length > 0) {
            // Проверяем варианты форматирования текста
            const match = element.text().match(/Всего:?\s*(\d+)/);
            if (match && match[1]) {
                visibleNotesCount = parseInt(match[1]);
                $('#all-notes-count').text(visibleNotesCount);
                return visibleNotesCount;
            }
        }
    }
    
    // 4. Ищем просто любой текст "Всего: X" на странице
    const bodyText = $('body').text();
    const bodyMatch = bodyText.match(/Всего:?\s*(\d+)/);
    if (bodyMatch && bodyMatch[1]) {
        visibleNotesCount = parseInt(bodyMatch[1]);
        $('#all-notes-count').text(visibleNotesCount);
        return visibleNotesCount;
    }
    
    // 5. Если не нашли ни в одном селекторе, считаем заметки на странице
    visibleNotesCount = $('.note-item').length;
    $('#all-notes-count').text(visibleNotesCount);
    
    return visibleNotesCount;
}

/**
 * Обрабатывает изменения в боковом меню и сохраняет выбранную папку
 */
function handleSidebarChanges() {
    // Установка активной папки при загрузке страницы
    setActiveFolderFromUrl();
    
    // Установка обработчиков событий на ссылки папок для сохранения состояния
    $(document).on('click', '.folder-link', function() {
        // Сохраняем ID активной папки для возможного восстановления после перезагрузки
        const folderLink = $(this).attr('href');
        if (folderLink && folderLink.includes('/notes/folder/')) {
            const folderId = folderLink.split('/').pop();
            try {
                localStorage.setItem('activeFolder', folderId);
            } catch (e) {
                // Игнорируем ошибки localStorage
            }
        }
    });
    
    // Проверяем сохраненное состояние при загрузке страницы
    $(document).ready(function() {
        try {
            const activeFolder = localStorage.getItem('activeFolder');
            if (activeFolder) {
                const currentUrl = window.location.pathname;
                // Если мы не находимся на странице папки, но имеем сохраненную папку
                if (!currentUrl.includes('/notes/folder/')) {
                    // Удаляем сохраненное состояние, так как мы ушли со страницы папки
                    localStorage.removeItem('activeFolder');
                }
            }
        } catch (e) {
            // Игнорируем ошибки localStorage
        }
    });
}

// Запускаем обработчик боковой панели
handleSidebarChanges();

// Экспортируем функцию для использования в других скриптах
window.updateSidebarCounters = updateSidebarCounters;
