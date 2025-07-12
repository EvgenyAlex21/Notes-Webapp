// JS для обеспечения консистентности отображения кнопок просмотра

document.addEventListener('DOMContentLoaded', function() {
    console.log('view-buttons.js загружен');
    
    // Добавляем обработчик для проверки и добавления кнопок просмотра
    setTimeout(() => {
        checkAndAddViewButtons();
    }, 500);
    
    // Регулярно проверяем наличие кнопок, так как контент может загружаться асинхронно
    setInterval(() => {
        checkAndAddViewButtons();
    }, 2000);
    
    // Также выполняем проверку после загрузки заметок через AJAX
    document.addEventListener('notes-loaded', function() {
        console.log('Событие notes-loaded: проверяем кнопки просмотра');
        setTimeout(() => {
            checkAndAddViewButtons();
        }, 300);
    });
    
    // Наблюдатель за изменениями в DOM для поиска новых заметок
    const observer = new MutationObserver(function(mutations) {
        checkAndAddViewButtons();
    });
    
    // Начинаем наблюдение за всеми изменениями в содержимом body
    observer.observe(document.body, { childList: true, subtree: true });
});

/**
 * Проверяет и добавляет кнопки просмотра на все заметки, где они отсутствуют
 */
function checkAndAddViewButtons() {
    // Находим все карточки заметок
    const noteCards = document.querySelectorAll('.note-card');
    console.log(`Проверка кнопок просмотра для ${noteCards.length} заметок`);
    
    noteCards.forEach(card => {
        const noteId = card.getAttribute('data-id');
        if (!noteId) return; // Пропускаем карточки без ID
        
        const viewButtonContainer = card.querySelector('.view-button-container');
        const existingButton = card.querySelector('.view-more-badge');
        
        // Если кнопка уже существует, ничего не делаем
        if (existingButton) {
            console.log(`Кнопка просмотра для заметки ${noteId} уже существует`);
            return;
        }
        
        // Если контейнер есть, но нет кнопки - добавляем
        if (viewButtonContainer && !viewButtonContainer.querySelector('.view-more-badge')) {
            const viewButton = document.createElement('span');
            viewButton.className = 'badge bg-primary view-more-badge view-note-btn';
            viewButton.setAttribute('data-id', noteId);
            viewButton.innerHTML = '<i class="fas fa-eye me-1"></i> Посмотреть';
            viewButtonContainer.appendChild(viewButton);
            console.log(`Добавлена кнопка просмотра в существующий контейнер для заметки ${noteId}`);
        }
        
        // Если нет контейнера для кнопки - создаем его и добавляем кнопку
        if (!viewButtonContainer) {
            const noteContent = card.querySelector('.note-content');
            if (noteContent) {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'mt-2 view-button-container';
                
                const viewButton = document.createElement('span');
                viewButton.className = 'badge bg-primary view-more-badge view-note-btn';
                viewButton.setAttribute('data-id', noteId);
                viewButton.innerHTML = '<i class="fas fa-eye me-1"></i> Посмотреть';
                
                buttonContainer.appendChild(viewButton);
                noteContent.appendChild(buttonContainer);
                console.log(`Создан контейнер и добавлена кнопка просмотра для заметки ${noteId}`);
            }
        }
        
        // Добавляем обработчик клика для кнопки
        const addedButton = card.querySelector('.view-more-badge');
        if (addedButton && !addedButton.hasAttribute('data-click-handler-added')) {
            addedButton.setAttribute('data-click-handler-added', 'true');
            addedButton.addEventListener('click', function() {
                console.log(`Клик на кнопке просмотра для заметки ${noteId}`);
                // Вызываем событие просмотра заметки
                const event = new CustomEvent('view-note', { detail: { noteId: noteId } });
                document.dispatchEvent(event);
            });
        }
    });
}
