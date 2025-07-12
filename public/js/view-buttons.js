document.addEventListener('DOMContentLoaded', function() {
    console.log('view-buttons.js загружен');
    
    setTimeout(() => {
        checkAndAddViewButtons();
    }, 500);
    
    setInterval(() => {
        checkAndAddViewButtons();
    }, 2000);
    
    document.addEventListener('notes-loaded', function() {
        console.log('Событие notes-loaded: проверяем кнопки просмотра');
        setTimeout(() => {
            checkAndAddViewButtons();
        }, 300);
    });

    const observer = new MutationObserver(function(mutations) {
        checkAndAddViewButtons();
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

function checkAndAddViewButtons() {
    const noteCards = document.querySelectorAll('.note-card');
    console.log(`Проверка кнопок просмотра для ${noteCards.length} заметок`);
    
    noteCards.forEach(card => {
        const noteId = card.getAttribute('data-id');
        if (!noteId) return; 
        
        const viewButtonContainer = card.querySelector('.view-button-container');
        const existingButton = card.querySelector('.view-more-badge');
        
        if (existingButton) {
            console.log(`Кнопка просмотра для заметки ${noteId} уже существует`);
            return;
        }
        
        if (viewButtonContainer && !viewButtonContainer.querySelector('.view-more-badge')) {
            const viewButton = document.createElement('span');
            viewButton.className = 'badge bg-primary view-more-badge view-note-btn';
            viewButton.setAttribute('data-id', noteId);
            viewButton.innerHTML = '<i class="fas fa-eye me-1"></i> Посмотреть';
            viewButtonContainer.appendChild(viewButton);
            console.log(`Добавлена кнопка просмотра в существующий контейнер для заметки ${noteId}`);
        }
        
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
        
        const addedButton = card.querySelector('.view-more-badge');
        if (addedButton && !addedButton.hasAttribute('data-click-handler-added')) {
            addedButton.setAttribute('data-click-handler-added', 'true');
            addedButton.addEventListener('click', function() {
                console.log(`Клик на кнопке просмотра для заметки ${noteId}`);
                const event = new CustomEvent('view-note', { detail: { noteId: noteId } });
                document.dispatchEvent(event);
            });
        }
    });
}
