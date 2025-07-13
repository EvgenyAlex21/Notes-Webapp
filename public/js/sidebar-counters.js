let sidebarStatsData = {
    total: 0, 
    active: 0,
    completed: 0,
    archived: 0, 
    trashed: 0,
    pinned: 0,
    with_reminders: 0
};

$(document).ready(function() {
    $('.notes-count').removeClass('d-none');
    $.ajax({
        url: '/api/stats',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.data) {
                sidebarStatsData = response.data;
                $('#all-notes-count').text(sidebarStatsData.total || 0);
                $('#archive-notes-count').text(sidebarStatsData.archived || 0);
                $('#trash-notes-count').text(sidebarStatsData.trashed || 0);
                $('#calendar-notes-count').text(sidebarStatsData.calendar || 0);
            }
        }
    });
    countRealNotesOnPage();
    setTimeout(loadSidebarStats, 300);
    if (typeof window.loadStats === 'function') {
        try {
            const originalLoadStats = window.loadStats;
            window.loadStats = function() {
                const result = originalLoadStats();
                if (result && typeof result.then === 'function') {
                    return result.then(function(data) {
                        if (window.statsData) {
                            sidebarStatsData = window.statsData;
                        }
                        updateSidebarCounters();
                        return data;
                    });
                } else {
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
    setInterval(loadSidebarStats, 30000);
    setInterval(countRealNotesOnPage, 5000);
    $(document).on('click', '.sidebar-link, .folder-link', function() {
        const prevUrl = window.location.pathname;
        setTimeout(function() {
            const currentUrl = window.location.pathname;
            if (prevUrl !== currentUrl) {
                loadSidebarStats();
            }
        }, 500);
    });
    $(document).on('notesLoaded notesUpdated noteDeleted noteAdded noteStatusChanged', function() {
        setTimeout(countRealNotesOnPage, 100);
    });
    const observer = new MutationObserver(function(mutations) {
        let noteChanged = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
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
    const notesContainer = document.getElementById('notes-container');
    if (notesContainer) {
        observer.observe(notesContainer, { childList: true, subtree: true });
    }
    $(document).on('click', '.folder-link', function(e) {
        e.preventDefault();
        resetFolderStyles();
        $(this).closest('.folder-item').addClass('active-folder');
        const href = $(this).attr('href');
        if (href) {
            setTimeout(() => {
                window.location.href = href;
            }, 50);
        }
    });
    function resetFolderStyles() {
        $('.folder-item').removeClass('active-folder');
        $('.folder-item').css({
            'background-color': '',
            'color': ''
        });
        $('.folder-item .folder-link').css({
            'color': '',
            'font-weight': ''
        });
        $('.folder-item .badge').css({
            'background-color': '',
            'color': ''
        });
    }
    function setActiveFolderFromUrl() {
        const url = window.location.href;
        if (url.includes('/notes/folder/')) {
            const folderId = url.split('/').pop();
            try {
                localStorage.setItem('activeFolder', folderId);
                $('.folder-link').removeClass('active');
                $(`.folder-link[href$="/notes/folder/${folderId}"]`).addClass('active');
            } catch (e) {
                console.error('Ошибка при установке активной папки:', e);
            }
        }
    }
    setActiveFolderFromUrl();
    setTimeout(setActiveFolderFromUrl, 500);
});

let isLoadingSidebarStats = false;

function loadSidebarStats() {
    if (isLoadingSidebarStats) {
        console.log("Загрузка статистики уже выполняется, пропускаем вызов");
        return;
    }
    isLoadingSidebarStats = true;
    if (typeof window.loadStats === 'function') {
        try {
            window.loadStats();
            if (window.statsData && Object.keys(window.statsData).length > 0) {
                sidebarStatsData = window.statsData;
                updateSidebarCounters();
                isLoadingSidebarStats = false;
                return;
            }
        } catch (e) {
            console.warn('Не удалось использовать глобальный loadStats');
        }
    }
    $.ajax({
        url: '/api/stats',
        method: 'GET',
        dataType: 'json',
        timeout: 5000,
        success: function(response) {
            if (response && response.data) {
                sidebarStatsData = response.data;
                const currentPath = window.location.pathname;
                const isEditPage = currentPath.includes('/notes/') && (
                    currentPath.includes('/edit') || 
                    currentPath.includes('/create') ||
                    currentPath.match(/\/notes\/\d+$/)
                );
                if (isEditPage) {
                    const totalActive = sidebarStatsData.total - sidebarStatsData.archived - sidebarStatsData.trashed;
                    $('#all-notes-count').text(totalActive);
                    $('#archive-notes-count').text(sidebarStatsData.archived);
                    $('#trash-notes-count').text(sidebarStatsData.trashed);
                    $('#calendar-notes-count').text(sidebarStatsData.calendar);
                    updateFolderCountersFromAPI();
                }
                else if (currentPath === '/notes' || currentPath === '/notes/' || currentPath.includes('/notes/folder')) {
                    updateMainPageCounter();
                } else {
                    updateSidebarCounters();
                }
            } else {
                console.error('Ошибка формата ответа при загрузке статистики боковой панели');
            }
        },
        error: function() {
            countRealNotesOnPage();
            isLoadingSidebarStats = false;
        },
        complete: function() {
            setTimeout(() => {
                isLoadingSidebarStats = false;
            }, 200);
        }
    });
}

function updateSidebarCounters() {
    const statsSource = window.statsData || sidebarStatsData;
    if (!statsSource || Object.keys(statsSource).length === 0) {
        console.warn('Статистика не загружена, загружаем...');
        loadSidebarStats();
        return;
    }
    console.log('Обновление счетчиков боковой панели');
    const currentPath = window.location.pathname;
    updateCountersFromAPI(statsSource, currentPath);
    
    if (currentPath === '/notes' || currentPath === '/notes/') {
        const visibleNotesCount = $('.note-item').length;
        $('#all-notes-count').text(visibleNotesCount);
        console.log('Обновлен счетчик на главной странице:', visibleNotesCount);
    } else if (currentPath.includes('/notes/folder')) {
        updateFolderPageCounter();
    } else    if (currentPath.includes('/notes/') && currentPath.includes('/edit')) {
        const totalActive = Math.max(0, statsSource.active || 0);
        $('#all-notes-count').text(totalActive);
        $('#archive-notes-count').text(statsSource.archived || 0);
        $('#trash-notes-count').text(statsSource.trashed || 0);
        $('#calendar-notes-count').text(statsSource.calendar || 0);
    } else {
        countRealNotesOnPage();
    }
    function checkPageCountersChange() {
        const totalNotesElement = $('#total-notes');
        if (totalNotesElement.length > 0 && !totalNotesElement.data('observer-attached')) {
            const observer = new MutationObserver(function(mutations) {
                countRealNotesOnPage();
            });
            observer.observe(totalNotesElement[0], {
                childList: true,
                characterData: true,
                subtree: true
            });
            totalNotesElement.data('observer-attached', true);
        }
    }
    setTimeout(checkPageCountersChange, 1000);
    $('.notes-count').each(function() {
        $(this).removeClass('d-none');
    });
}

function updateCountersFromAPI(statsSource, currentPath) {
    const isEditPage = currentPath.includes('/notes/') && (
        currentPath.includes('/edit') || 
        currentPath.includes('/create') ||
        currentPath.match(/\/notes\/\d+$/)
    );
    if (isEditPage) {
        const totalActive = Math.max(0, statsSource.active || 0);
        $('#all-notes-count').text(totalActive);
        $('#archive-notes-count').text(statsSource.archived || 0);
        $('#trash-notes-count').text(statsSource.trashed || 0);
        $('#calendar-notes-count').text(statsSource.calendar || 0);
        updateFolderCountersFromAPI();
        console.log('Обновлены все счетчики из API на странице редактирования');
        return;
    }
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

function updateMainPageCounterExcludingFolders(statsSource) {
    const visibleNotesCount = $('.note-item').length;
    
    if (visibleNotesCount > 0) {
        $('#all-notes-count').text(visibleNotesCount);
        console.log('Счетчик "Все заметки" на главной странице (по видимым заметкам):', visibleNotesCount);
    } else {
        const totalActive = Math.max(0, statsSource.active || 0);
        $('#all-notes-count').text(totalActive);
        console.log('Счетчик "Все заметки" на главной странице (из API):', totalActive);
    }
}

function updateFolderPageCounter() {
    const statsSource = window.statsData || sidebarStatsData;
    if (statsSource && statsSource.total !== undefined) {
        const totalActive = Math.max(0, statsSource.active || 0);
        $('#all-notes-count').text(totalActive);
        console.log('Счетчик "Все заметки" в папке:', totalActive);
        
        const currentPath = window.location.pathname;
        if (currentPath.includes('/notes/folder/')) {
            const folderName = decodeURIComponent(currentPath.split('/').pop());
            const normalizedName = folderName.toLowerCase().trim();
            const folderId = 'folder-' + normalizedName.replace(/[^a-z0-9]/g, '-');
            
            if ($('.note-item').length === 0) {
                $(`#${folderId} .badge`).text(0);
            }
        }
    }
}

function countRealNotesOnPage() {
    const pagePath = window.location.pathname;
    const statsSource = window.statsData || sidebarStatsData;
    if (pagePath === '/notes' || pagePath === '/notes/') {
        updateMainPageCounterExcludingFolders(statsSource);
        updateCountersFromAPI(statsSource, pagePath);
    } else if (pagePath.includes('/notes/folder')) {
        updateFolderPageCounter();
        updateCountersFromAPI(statsSource, pagePath);
    } else {
        updateCurrentPageCounter(pagePath, statsSource);
    }
    $('.notes-count').each(function() {
        $(this).removeClass('d-none');
    });
}

function updateCurrentPageCounter(pagePath, statsSource) {
    let pageNotesCount = 0;
    try {
        if (pagePath.includes('/notes/create') || pagePath.includes('/notes/edit')) {
            if (statsSource) {
                const totalActive = Math.max(0, statsSource.active || 0);
                $('#all-notes-count').text(totalActive);
                $('#archive-notes-count').text(statsSource.archived || 0);
                $('#trash-notes-count').text(statsSource.trashed || 0);
                $('#calendar-notes-count').text(statsSource.calendar || 0);
            }
            return;
        }
        const notesOnPage = $('.note-item').length;
        let pageCount = 0;
        const totalNotesElement = $('#total-notes');
        if (totalNotesElement.length > 0) {
            const totalCountMatch = totalNotesElement.text().match(/Всего:\s*(\d+)/);
            if (totalCountMatch && totalCountMatch[1]) {
                pageCount = parseInt(totalCountMatch[1]);
            }
        }
        if (pageCount === 0) {
            const totalCountSelectors = [
                '.badge:contains("Всего:")',
                '.card-header .badge:contains("Всего")',
                '#notes-header .badge:contains("Всего")',
                '.header-counters .badge:contains("Всего")'
            ];
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
            if (pageCount === 0) {
                pageCount = notesOnPage;
            }
        }
        const countToUse = !isNaN(pageCount) && pageCount > 0 ? pageCount : notesOnPage;
        if (pagePath.includes('/notes/archive')) {
            $('#archive-notes-count').text(countToUse);
            if (statsSource) {
                const totalActive = Math.max(0, statsSource.active || 0);
                $('#all-notes-count').text(totalActive);
                $('#trash-notes-count').text(statsSource.trashed || 0);
                $('#calendar-notes-count').text(statsSource.calendar || 0);
            }
        } else if (pagePath.includes('/notes/trash') || pagePath.includes('/notes/new-trash')) {
            $('#trash-notes-count').text(countToUse);
            if (statsSource) {
                const totalActive = Math.max(0, statsSource.active || 0);
                $('#all-notes-count').text(totalActive);
                $('#archive-notes-count').text(statsSource.archived || 0);
                $('#calendar-notes-count').text(statsSource.calendar || 0);
            }
        } else if (pagePath.includes('/notes/calendar')) {
            $('#calendar-notes-count').text(countToUse);
            if (statsSource) {
                const totalActive = Math.max(0, statsSource.active || 0);
                $('#all-notes-count').text(totalActive);
                $('#archive-notes-count').text(statsSource.archived || 0);
                $('#trash-notes-count').text(statsSource.trashed || 0);
            }
        }
    } catch (error) {
        console.error('Ошибка при подсчете заметок:', error);
    }
    $('.notes-count').each(function() {
        $(this).removeClass('d-none');
    });
}

function updateMainPageCounter() {
    const statsSource = window.statsData || sidebarStatsData;
    
    if (statsSource && statsSource.total !== undefined) {
        const totalActive = Math.max(0, statsSource.active || 0);
        $('#all-notes-count').text(totalActive);
        $('#archive-notes-count').text(statsSource.archived || 0);
        $('#trash-notes-count').text(statsSource.trashed || 0);
        $('#calendar-notes-count').text(statsSource.calendar || 0);
        return totalActive;
    }
    
    const totalNotesElement = $('#total-notes');
    let visibleNotesCount = 0;
    if (totalNotesElement.length > 0) {
        const totalCountMatch = totalNotesElement.text().match(/Всего:\s*(\d+)/);
        if (totalCountMatch && totalCountMatch[1]) {
            visibleNotesCount = parseInt(totalCountMatch[1]);
            $('#all-notes-count').text(visibleNotesCount);
            return visibleNotesCount;
        }
    }
    
    const counterTotal = $('.counter-total');
    if (counterTotal.length > 0) {
        const counterValue = parseInt(counterTotal.text());
        if (!isNaN(counterValue)) {
            visibleNotesCount = counterValue;
            $('#all-notes-count').text(visibleNotesCount);
            return visibleNotesCount;
        }
    }
    
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
            const match = element.text().match(/Всего:?\s*(\d+)/);
            if (match && match[1]) {
                visibleNotesCount = parseInt(match[1]);
                $('#all-notes-count').text(visibleNotesCount);
                return visibleNotesCount;
            }
        }
    }
    
    const bodyText = $('body').text();
    const bodyMatch = bodyText.match(/Всего:?\s*(\d+)/);
    if (bodyMatch && bodyMatch[1]) {
        visibleNotesCount = parseInt(bodyMatch[1]);
        $('#all-notes-count').text(visibleNotesCount);
        return visibleNotesCount;
    }
    
    visibleNotesCount = $('.note-item').length;
    $('#all-notes-count').text(visibleNotesCount);
    return visibleNotesCount;
}

function setActiveFolderFromUrl() {
    const url = window.location.href;
    if (url.includes('/notes/folder/')) {
        const folderId = url.split('/').pop();
        try {
            localStorage.setItem('activeFolder', folderId);
            $('.folder-link').removeClass('active');
            $(`.folder-link[href$="/notes/folder/${folderId}"]`).addClass('active');
        } catch (e) {
            console.error('Ошибка при установке активной папки:', e);
        }
    }
}

function handleSidebarChanges() {
    if (typeof setActiveFolderFromUrl === 'function') {
        setActiveFolderFromUrl();
    } else {
        console.warn('Функция setActiveFolderFromUrl не определена, пропускаем вызов');
    }
    $(document).on('click', '.folder-link', function() {
        const folderLink = $(this).attr('href');
        if (folderLink && folderLink.includes('/notes/folder/')) {
            const folderId = folderLink.split('/').pop();
            try {
                localStorage.setItem('activeFolder', folderId);
            } catch (e) {}
        }
    });
    $(document).ready(function() {
        try {
            const activeFolder = localStorage.getItem('activeFolder');
            if (activeFolder) {
                const currentUrl = window.location.pathname;
                if (!currentUrl.includes('/notes/folder/')) {
                    localStorage.removeItem('activeFolder');
                }
            }
        } catch (e) {}
    });
}

handleSidebarChanges();
window.updateSidebarCounters = updateSidebarCounters;

function updateFolderCountersFromAPI() {
    $.ajax({
        url: '/api/folders',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.success && response.data) {
                response.data.forEach(function(folder) {
                    const folderName = folder.name;
                    const count = Math.max(0, folder.count || 0);
                    const normalizedName = folderName.toLowerCase().trim();
                    const folderId = 'folder-' + normalizedName.replace(/[^a-z0-9]/g, '-');
                    
                    const currentPath = window.location.pathname;
                    const currentFolderName = decodeURIComponent(currentPath.split('/').pop());
                    
                    if (currentPath.includes('/notes/folder/') && 
                        currentFolderName === folderName && 
                        $('.note-item').length === 0) {
                        $(`#${folderId} .badge`).text(0);
                    } else {
                        $(`#${folderId} .badge`).text(count);
                    }
                });
                console.log('Счетчики папок обновлены из API');
            }
        },
        error: function() {
            console.error('Ошибка при получении данных о папках из API');
        }
    });
}