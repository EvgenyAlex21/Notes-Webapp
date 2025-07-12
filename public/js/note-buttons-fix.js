document.addEventListener('DOMContentLoaded', function() {
    console.log('Запуск исправления кнопок действий для заметок...');
    
    setTimeout(() => {
        fixNotesActionButtons();
    }, 500);
    
    setInterval(() => {
        fixNotesActionButtons();
    }, 2000);
    
    const observer = new MutationObserver(function(mutations) {
        setTimeout(() => {
            fixNotesActionButtons();
        }, 300);
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

function fixNotesActionButtons() {
    const noteCards = document.querySelectorAll('.note-wrapper, .note-item');
    console.log(`Проверка кнопок действий для ${noteCards.length} заметок`);
    
    noteCards.forEach(card => {
        const noteId = card.getAttribute('data-id');
        if (!noteId) return; 
        
        const actionsContainer = card.querySelector('.note-actions');
        
        if (!actionsContainer) {
            console.log(`Добавляем контейнер кнопок действий для заметки ${noteId}`);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'col-12 text-end note-actions mt-2';
            actionsDiv.style.display = 'block';
            actionsDiv.style.visibility = 'visible';
            
            actionsDiv.innerHTML = `
                <div class="dropdown d-inline-block" style="display: inline-block !important; visibility: visible !important;">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="display: inline-block !important; visibility: visible !important;">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow">
                        <li><a class="dropdown-item view-note-btn" href="#" data-id="${noteId}">
                            <i class="fas fa-eye"></i> Просмотреть
                        </a></li>
                        <li><a class="dropdown-item" href="/notes/${noteId}/edit">
                            <i class="fas fa-edit"></i> Редактировать
                        </a></li>
                        <li><a class="dropdown-item toggle-archive-btn" href="#" data-id="${noteId}">
                            <i class="fas fa-archive"></i> Архивировать
                        </a></li>
                        <li><a class="dropdown-item text-danger delete-btn" href="#" data-id="${noteId}">
                            <i class="fas fa-trash"></i> Удалить
                        </a></li>
                    </ul>
                </div>
            `;
            
            const lastRow = card.querySelector('.row');
            
            if (lastRow) {
                lastRow.appendChild(actionsDiv);
            } else {
                card.appendChild(actionsDiv);
            }
            
            try {
                const dropdownToggle = actionsDiv.querySelector('.dropdown-toggle');
                if (dropdownToggle) {
                    new bootstrap.Dropdown(dropdownToggle);
                }
            } catch (e) {
                console.error('Ошибка при инициализации выпадающего меню:', e);
            }
        } else {
            if (getComputedStyle(actionsContainer).display === 'none' || 
                getComputedStyle(actionsContainer).visibility === 'hidden' || 
                getComputedStyle(actionsContainer).opacity === '0') {
                
                console.log(`Исправляем отображение контейнера действий для заметки ${noteId}`);
                actionsContainer.style.display = 'block';
                actionsContainer.style.visibility = 'visible';
                actionsContainer.style.opacity = '1';
                
                const dropdown = actionsContainer.querySelector('.dropdown');
                if (dropdown) {
                    dropdown.style.display = 'inline-block';
                    dropdown.style.visibility = 'visible';
                    dropdown.style.opacity = '1';
                    
                    const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
                    if (dropdownToggle) {
                        dropdownToggle.style.display = 'inline-block';
                        dropdownToggle.style.visibility = 'visible';
                        dropdownToggle.style.opacity = '1';
                    }
                }
            }
        }
    });
}