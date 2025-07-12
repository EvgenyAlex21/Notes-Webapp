/**
 * Скрипт для обработки активных пунктов меню
 * Автоматически выделяет активный пункт меню на основе текущего URL
 */
$(document).ready(function() {
    // Вызываем функцию при загрузке страницы
    updateActiveSidebar();
    
    // Также можем добавить обработчик изменения URL без перезагрузки страницы
    $(window).on('hashchange popstate', updateActiveSidebar);
});

function updateActiveSidebar() {
    // Получаем текущий путь
    const currentPath = window.location.pathname;
    console.log('Обновление активного пункта меню:', currentPath);
    
    // Сначала снимаем все активные классы
    $('.folder-link').removeClass('active');
    $('.folder-item').removeClass('active-folder');
    $('.nav-link').removeClass('active');
    
    // Проверяем, находимся ли мы в режиме папки
    const folderMatch = currentPath.match(/\/notes\/folder\/(.+)/);
    if (folderMatch) {
        try {
            // Декодируем имя папки
            let folderName = decodeURIComponent(folderMatch[1]);
            // Полное декодирование (на случай, если имя закодировано несколько раз)
            while (folderName !== decodeURIComponent(folderName)) {
                folderName = decodeURIComponent(folderName);
            }
            console.log('Текущая папка:', folderName);
            
            // Находим соответствующий элемент меню по разным признакам
            let foundFolder = false;
            
            // 1. По data-folder в ссылке
            const folderByData = $(`.folder-link[data-folder="${folderName}"]`);
            if (folderByData.length > 0) {
                folderByData.addClass('active');
                folderByData.parent().addClass('active-folder');
                foundFolder = true;
                console.log('Найдена папка по data-folder:', folderName);
            }
            
            // 2. По data-folder-original атрибуту
            if (!foundFolder) {
                const folderByOriginal = $(`[data-folder-original="${folderName}"]`);
                if (folderByOriginal.length > 0) {
                    folderByOriginal.addClass('active-folder');
                    folderByOriginal.find('.folder-link').addClass('active');
                    foundFolder = true;
                    console.log('Найдена папка по data-folder-original:', folderName);
                }
            }
            
            // 3. По тексту ссылки
            if (!foundFolder) {
                $('.folder-item').each(function() {
                    const linkText = $(this).find('.folder-link').text().trim().replace(/\s*\d+\s*$/, ''); // Удаляем счетчик из текста
                    if (linkText === folderName || linkText.includes(folderName) || folderName.includes(linkText)) {
                        $(this).addClass('active-folder');
                        $(this).find('.folder-link').addClass('active');
                        foundFolder = true;
                        console.log('Найдена папка по тексту:', linkText);
                        return false; // Останавливаем цикл
                    }
                });
            }
            
            // 3. По id элемента
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
        // Корзина
        $('.trash-link').addClass('active');
        console.log('Активирован пункт меню: Корзина');
    } else if (currentPath === '/notes/archive') {
        // Архив
        $('.archive-link').addClass('active');
        console.log('Активирован пункт меню: Архив');
    } else if (currentPath === '/notes') {
        // Все заметки
        $('.all-notes-link').addClass('active');
        console.log('Активирован пункт меню: Все заметки');
    }
}
