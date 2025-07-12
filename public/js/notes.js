$(document).ready(function() {
    // Текущий URL
    const currentPath = window.location.pathname;
    
    // Получение списка всех заметок
    if (currentPath === '/notes') {
        loadAllNotes();
    }
    
    // Загрузка данных для редактирования
    if (currentPath.match(/\/notes\/\d+\/edit/)) {
        const id = $('#note-id').val();
        loadNote(id);
    }
    
    // Обработка создания заметки
    $('#save-button').on('click', function() {
        createNote();
    });
    
    // Обработка обновления заметки
    $('#update-button').on('click', function() {
        const id = $('#note-id').val();
        updateNote(id);
    });
    
    // Обработка удаления заметки
    $('#delete-button').on('click', function() {
        const id = $('#note-id').val();
        deleteNote(id);
    });
});

// Загрузка всех заметок
function loadAllNotes() {
    $.ajax({
        url: `/api/notes`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const notes = response.data;
            $('.notes-container').empty();
            
            if (notes.length === 0) {
                $('.notes-container').append('<p>Заметок пока нет. Создайте свою первую заметку!</p>');
                return;
            }
            
            notes.forEach(note => {
                $('.notes-container').append(`
                    <div class="note-item note-wrapper" id="${note.id}">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h4>${note.name}</h4>
                                <p>${note.description}</p>
                                <div>
                                    <span class="badge ${note.done ? 'bg-success' : 'bg-warning'}">
                                        ${note.done ? 'Выполнено' : 'В процессе'}
                                    </span>
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                <a href="/notes/${note.id}/edit" class="btn btn-primary btn-sm">Редактировать</a>
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${note.id}">Удалить</button>
                            </div>
                        </div>
                    </div>
                `);
            });
            
            // Добавим обработчики для кнопок удаления в списке
            $('.delete-btn').on('click', function() {
                const noteId = $(this).data('id');
                deleteNote(noteId);
            });
        },
        error: function(error) {
            console.error('Ошибка при загрузке заметок:', error);
            $('.notes-container').html('<p class="text-danger">Ошибка при загрузке заметок</p>');
        }
    });
}

// Загрузка одной заметки
function loadNote(id) {
    $.ajax({
        url: `/api/notes/${id}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const note = response.data;
            $('#name').val(note.name);
            $('#description').val(note.description);
            $('#done').prop('checked', note.done);
        },
        error: function(error) {
            console.error('Ошибка при загрузке заметки:', error);
            alert('Ошибка при загрузке заметки');
        }
    });
}

// Создание заметки
function createNote() {
    const data = {
        name: $('#name').val(),
        description: $('#description').val()
    };
    
    if (!data.name || !data.description) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    $.ajax({
        url: '/api/notes',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            alert('Заметка успешно создана');
            window.location.href = '/notes';
        },
        error: function(error) {
            console.error('Ошибка при создании заметки:', error);
            alert('Ошибка при создании заметки');
        }
    });
}

// Обновление заметки
function updateNote(id) {
    const data = {
        name: $('#name').val(),
        description: $('#description').val(),
        done: $('#done').is(':checked')
    };
    
    if (!data.name || !data.description) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    $.ajax({
        url: `/api/notes/${id}`,
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            alert('Заметка успешно обновлена');
            // Обновляем значения полей на форме
            const note = response.data;
            $('#name').val(note.name);
            $('#description').val(note.description);
            $('#done').prop('checked', note.done);
        },
        error: function(error) {
            console.error('Ошибка при обновлении заметки:', error);
            alert('Ошибка при обновлении заметки');
        }
    });
}

// Удаление заметки
function deleteNote(id) {
    if (!confirm('Вы действительно хотите удалить эту заметку?')) {
        return;
    }
    
    $.ajax({
        url: `/api/notes/${id}`,
        method: 'DELETE',
        dataType: 'json',
        contentType: 'application/json',
        success: function() {
            alert('Заметка удалена');
            
            // Если мы на странице редактирования, перенаправляем на список
            if (window.location.pathname.match(/\/notes\/\d+\/edit/)) {
                window.location.href = '/notes';
            } else {
                // Если мы на странице списка, просто удаляем элемент
                $(`.note-wrapper#${id}`).remove();
                
                // Проверим, остались ли ещё заметки
                if ($('.note-wrapper').length === 0) {
                    $('.notes-container').html('<p>Заметок пока нет. Создайте свою первую заметку!</p>');
                }
            }
        },
        error: function(error) {
            console.error('Ошибка при удалении заметки:', error);
            alert('Ошибка при удалении заметки');
        }
    });
}
