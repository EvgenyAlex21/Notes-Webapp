$(document).ready(function() {
    
    updateActiveSidebar();
    
    $(window).on('hashchange popstate', updateActiveSidebar);
});

function updateActiveSidebar() {
    const currentPath = window.location.pathname;
    console.log('Обновление активного пункта меню:', currentPath);
    
    $('.folder-link').removeClass('active');
    $('.folder-item').removeClass('active-folder');
    $('.nav-link').removeClass('active');
    
    const folderMatch = currentPath.match(/\/notes\/folder\/(.+)/);
    if (folderMatch) {
        try {
            let folderName = decodeURIComponent(folderMatch[1]);
            while (folderName !== decodeURIComponent(folderName)) {
                folderName = decodeURIComponent(folderName);
            }
            console.log('Текущая папка:', folderName);
            
            let foundFolder = false;
            
            const folderByData = $(`.folder-link[data-folder="${folderName}"]`);
            if (folderByData.length > 0) {
                folderByData.addClass('active');
                folderByData.parent().addClass('active-folder');
                foundFolder = true;
                console.log('Найдена папка по data-folder:', folderName);
            }
            
            if (!foundFolder) {
                const folderByOriginal = $(`[data-folder-original="${folderName}"]`);
                if (folderByOriginal.length > 0) {
                    folderByOriginal.addClass('active-folder');
                    folderByOriginal.find('.folder-link').addClass('active');
                    foundFolder = true;
                    console.log('Найдена папка по data-folder-original:', folderName);
                }
            }
            
            if (!foundFolder) {
                $('.folder-item').each(function() {
                    const linkText = $(this).find('.folder-link').text().trim().replace(/\s*\d+\s*$/, ''); // Удаляем счетчик из текста
                    if (linkText === folderName || linkText.includes(folderName) || folderName.includes(linkText)) {
                        $(this).addClass('active-folder');
                        $(this).find('.folder-link').addClass('active');
                        foundFolder = true;
                        console.log('Найдена папка по тексту:', linkText);
                        return false; 
                    }
                });
            }
            
            if (!foundFolder) {
                const normalizedName = folderName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const folderId = `folder-${normalizedName}`;
                const folderElement = $(`#${folderId}`);
                if (folderElement.length > 0) {
                    folderElement.addClass('active-folder');
                    folderElement.find('.folder-link').addClass('active');
                    foundFolder = true;
                    console.log('Найдена папка по ID:', folderId);
                }
            }
        } catch (e) {
            console.error('Ошибка при обработке имени папки:', e);
        }
    } else if (currentPath === '/notes/trash') {
        $('.trash-link').addClass('active');
        console.log('Активирован пункт меню: Корзина');
    } else if (currentPath === '/notes/archive') {
        $('.archive-link').addClass('active');
        console.log('Активирован пункт меню: Архив');
    } else if (currentPath === '/notes') {
        $('.all-notes-link').addClass('active');
        console.log('Активирован пункт меню: Все заметки');
    }
}
