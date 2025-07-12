/**
 * Скрипт для исправления отображения кнопок действий в заметках
 * Находит заметки, у которых отсутствуют кнопки действий, и добавляет их
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Запуск исправления кнопок действий для заметок...');
    
    // Сразу запускаем проверку
    setTimeout(() => {
        fixNotesActionButtons();
    }, 500);
    
    // Устанавливаем регулярную проверку каждые 2 секунды
    setInterval(() => {
        fixNotesActionButtons();
    }, 2000);
    
    // Наблюдатель за изменениями в DOM
    const observer = new MutationObserver(function(mutations) {
        // Если обнаружены изменения, проверяем кнопки
        setTimeout(() => {
            fixNotesActionButtons();
        }, 300);
    });
    
    // Начинаем наблюдение за всеми изменениями в содержимом body
    observer.observe(document.body, { childList: true, subtree: true });
});

/**
 * Исправляет отсутствующие кнопки действий на заметках
 */
function fixNotesActionButtons() {
    // Находим все карточки заметок
    const noteCards = document.querySelectorAll('.note-wrapper, .note-item');
    console.log(`Проверка кнопок действий для ${noteCards.length} заметок`);
    
    noteCards.forEach(card => {
        const noteId = card.getAttribute('data-id');
        if (!noteId) return; // Пропускаем карточки без ID
        
        // Проверяем наличие контейнера кнопок действий
        const actionsContainer = card.querySelector('.note-actions');
        
        // Если контейнер действий отсутствует, добавляем его
        if (!actionsContainer) {
            console.log(`Добавляем контейнер кнопок действий для заметки ${noteId}`);
            
            // Создаем контейнер действий
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'col-12 text-end note-actions mt-2';
            actionsDiv.style.display = 'block';
            actionsDiv.style.visibility = 'visible';
            
            // Создаем выпадающее меню
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
            
            // Находим последнюю строку в карточке или родительский элемент
            const lastRow = card.querySelector('.row');
            
            if (lastRow) {
                lastRow.appendChild(actionsDiv);
            } else {
                // Если нет строки, добавляем в саму карточку
                card.appendChild(actionsDiv);
            }
            
            // Подключаем обработчик для выпадающего меню
            try {
                const dropdownToggle = actionsDiv.querySelector('.dropdown-toggle');
                if (dropdownToggle) {
                    new bootstrap.Dropdown(dropdownToggle);
                }
            } catch (e) {
                console.error('Ошибка при инициализации выпадающего меню:', e);
            }
        } else {
            // Проверяем, видим ли контейнер действий
            if (getComputedStyle(actionsContainer).display === 'none' || 
                getComputedStyle(actionsContainer).visibility === 'hidden' || 
                getComputedStyle(actionsContainer).opacity === '0') {
                
                console.log(`Исправляем отображение контейнера действий для заметки ${noteId}`);
                actionsContainer.style.display = 'block';
                actionsContainer.style.visibility = 'visible';
                actionsContainer.style.opacity = '1';
                
                // Проверяем выпадающее меню внутри
                const dropdown = actionsContainer.querySelector('.dropdown');
                if (dropdown) {
                    dropdown.style.display = 'inline-block';
                    dropdown.style.visibility = 'visible';
                    dropdown.style.opacity = '1';
                    
                    // Проверяем кнопку выпадающего меню
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
