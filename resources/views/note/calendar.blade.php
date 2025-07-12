<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Календарь заметок</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.css">
    <link rel="stylesheet" href="{{ asset('css/scroll-top.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.js"></script>
    <script src="{{ asset('js/scroll-top.js') }}"></script>
    <style>
        body {
            background-color: #f8f9fa;
        }
        .header {
            background-color: #fff;
            border-bottom: 1px solid #e9ecef;
            padding: 15px 0;
            margin-bottom: 30px;
        }
        .calendar-container {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            padding: 20px;
        }
        .fc-event {
            cursor: pointer;
        }
        .fc-event-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        /* Темная тема */
        body.dark-theme {
            background-color: #212529;
            color: #f8f9fa;
        }
        .dark-theme .header {
            background-color: #343a40;
            border-bottom-color: #495057;
        }
        .dark-theme .calendar-container {
            background-color: #343a40;
            color: #f8f9fa;
        }
        .dark-theme .fc-theme-standard .fc-list-day-cushion {
            background-color: #495057;
        }
        .dark-theme .fc-theme-standard th {
            background-color: #343a40;
            color: #f8f9fa;
            border-color: #495057;
        }
        .dark-theme .fc-theme-standard td {
            border-color: #495057;
        }
        .dark-theme .fc-theme-standard .fc-scrollgrid {
            border-color: #495057;
        }
        .dark-theme .fc-col-header-cell-cushion {
            color: #f8f9fa;
        }
        .dark-theme .fc-daygrid-day-number {
            color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">Календарь заметок</h1>
                <div class="d-flex">
                    <div class="form-check form-switch me-3">
                        <input class="form-check-input" type="checkbox" id="theme-toggle">
                        <label class="form-check-label" for="theme-toggle">
                            <i class="fas fa-moon"></i> Темная тема
                        </label>
                    </div>
                    <a href="/notes" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left"></i> Назад к списку
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="calendar-container">
                    <div id="calendar"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Модальное окно для просмотра/редактирования заметки -->
    <div class="modal fade" id="eventModal" tabindex="-1" aria-labelledby="eventModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="eventModalLabel">Детали заметки</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="event-details">
                    <div class="mb-3">
                        <h4 id="event-title" class="mb-2"></h4>
                        <p id="event-description" class="text-muted"></p>
                    </div>
                    <div class="mb-3">
                        <div class="d-flex align-items-center mb-2">
                            <span class="badge me-2" id="event-color"></span>
                            <span id="event-date"></span>
                        </div>
                        <div id="event-tags"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    <a href="#" class="btn btn-primary" id="edit-event-btn">Редактировать</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Модальное окно для создания заметки с напоминанием -->
    <div class="modal fade" id="createEventModal" tabindex="-1" aria-labelledby="createEventModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createEventModalLabel">Создать заметку с напоминанием</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="new-event-title" class="form-label">Название</label>
                        <input type="text" class="form-control" id="new-event-title" required>
                    </div>
                    <div class="mb-3">
                        <label for="new-event-description" class="form-label">Описание</label>
                        <textarea class="form-control" id="new-event-description" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Цвет</label>
                        <div class="color-picker d-flex">
                            <div class="color-option color-default selected" data-color="default" title="По умолчанию"></div>
                            <div class="color-option color-red" data-color="red" title="Высокий приоритет"></div>
                            <div class="color-option color-yellow" data-color="yellow" title="Средний приоритет"></div>
                            <div class="color-option color-green" data-color="green" title="Низкий приоритет"></div>
                            <div class="color-option color-blue" data-color="blue" title="Информационный"></div>
                            <div class="color-option color-purple" data-color="purple" title="Личный"></div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="new-event-date" class="form-label">Дата напоминания</label>
                        <input type="datetime-local" class="form-control" id="new-event-date">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                    <button type="button" class="btn btn-primary" id="save-event-btn">Создать заметку</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Глобальные переменные
        let calendar;
        let selectedColor = 'default';
        let currentTheme = localStorage.getItem('theme') || 'light';
        
        document.addEventListener('DOMContentLoaded', function() {
            // Инициализация темы
            initTheme();
            
            // Инициализация календаря
            initCalendar();
            
            // Инициализация цветового выбора
            $('.color-option').on('click', function() {
                $('.color-option').removeClass('selected');
                $(this).addClass('selected');
                selectedColor = $(this).data('color');
            });
            
            // Обработчик для переключения темы
            $('#theme-toggle').on('change', function() {
                toggleTheme();
                // Перерисовываем календарь при смене темы
                calendar.render();
            });
            
            // Обработчик для создания заметки
            $('#save-event-btn').on('click', function() {
                const title = $('#new-event-title').val();
                const description = $('#new-event-description').val();
                const reminderDate = $('#new-event-date').val();
                
                if (!title || !description || !reminderDate) {
                    alert('Пожалуйста, заполните все поля');
                    return;
                }
                
                createNoteWithReminder(title, description, selectedColor, reminderDate);
            });
        });
        
        // Инициализация календаря
        function initCalendar() {
            const calendarEl = document.getElementById('calendar');
            
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,listWeek'
                },
                locale: 'ru',
                timeZone: 'local',
                events: function(fetchInfo, successCallback, failureCallback) {
                    loadEvents(fetchInfo.start, fetchInfo.end, successCallback);
                },
                eventClick: function(info) {
                    showEventDetails(info.event);
                },
                dateClick: function(info) {
                    // При клике на дату открываем модальное окно создания заметки
                    const clickedDate = info.dateStr;
                    $('#new-event-date').val(clickedDate + 'T12:00');
                    $('#createEventModal').modal('show');
                },
                dayMaxEvents: true // Разрешить "more" ссылку при большом количестве событий
            });
            
            calendar.render();
        }
        
        // Загрузка событий (заметок с напоминаниями)
        function loadEvents(start, end, successCallback) {
            $.ajax({
                url: '/api/notes',
                method: 'GET',
                dataType: 'json',
                success: function(response) {
                    const notes = response.data;
                    const events = [];
                    
                    notes.forEach(note => {
                        if (note.reminder_at || note.due_date) {
                            const date = note.reminder_at || note.due_date;
                            
                            // Определяем цвет события на основе цвета заметки
                            let eventColor;
                            switch(note.color) {
                                case 'red': eventColor = '#dc3545'; break;
                                case 'green': eventColor = '#28a745'; break;
                                case 'blue': eventColor = '#007bff'; break;
                                case 'yellow': eventColor = '#ffc107'; break;
                                case 'purple': eventColor = '#6f42c1'; break;
                                default: eventColor = '#6c757d';
                            }
                            
                            events.push({
                                id: note.id,
                                title: note.name,
                                start: date,
                                backgroundColor: eventColor,
                                borderColor: eventColor,
                                extendedProps: {
                                    description: note.description,
                                    color: note.color,
                                    tags: note.tags
                                }
                            });
                        }
                    });
                    
                    successCallback(events);
                },
                error: function(error) {
                    console.error('Ошибка при загрузке событий:', error);
                    successCallback([]);
                }
            });
        }
        
        // Показать детали заметки
        function showEventDetails(event) {
            $('#event-title').text(event.title);
            $('#event-description').text(event.extendedProps.description);
            
            // Отображаем цвет заметки
            const colorClass = event.extendedProps.color || 'default';
            $('#event-color').removeClass().addClass(`badge color-${colorClass}`).text(getColorName(colorClass));
            
            // Отображаем дату события
            const eventDate = new Date(event.start);
            $('#event-date').text(formatDate(eventDate));
            
            // Отображаем теги, если они есть
            if (event.extendedProps.tags) {
                const tags = event.extendedProps.tags.split(',');
                let tagsHtml = '';
                
                tags.forEach(tag => {
                    tagsHtml += `<span class="badge bg-light text-dark me-1">${tag}</span>`;
                });
                
                $('#event-tags').html(tagsHtml);
            } else {
                $('#event-tags').empty();
            }
            
            // Настраиваем кнопку редактирования
            $('#edit-event-btn').attr('href', `/notes/${event.id}/edit`);
            
            // Показываем модальное окно
            $('#eventModal').modal('show');
        }
        
        // Создание заметки с напоминанием
        function createNoteWithReminder(title, description, color, reminderDate) {
            // Получаем CSRF-токен из meta-тега
            const csrfToken = $('meta[name="csrf-token"]').attr('content');
            
            const data = {
                name: title,
                description: description,
                color: color || 'default',
                reminder_at: reminderDate,
                is_pinned: false
            };
            
            $.ajax({
                url: '/api/notes',
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data),
                success: function(response) {
                    $('#createEventModal').modal('hide');
                    
                    // Очищаем форму
                    $('#new-event-title').val('');
                    $('#new-event-description').val('');
                    $('#new-event-date').val('');
                    
                    // Обновляем календарь
                    calendar.refetchEvents();
                    
                    // Показываем сообщение об успехе
                    alert('Заметка с напоминанием создана успешно!');
                },
                error: function(error) {
                    console.error('Ошибка при создании заметки:', error);
                    alert('Ошибка при создании заметки');
                }
            });
        }
        
        // Получение названия цвета
        function getColorName(color) {
            switch(color) {
                case 'red': return 'Высокий приоритет';
                case 'yellow': return 'Средний приоритет';
                case 'green': return 'Низкий приоритет';
                case 'blue': return 'Информационный';
                case 'purple': return 'Личный';
                default: return 'Стандартный';
            }
        }
        
        // Форматирование даты
        function formatDate(date) {
            return new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }
        
        // Инициализация темы
        function initTheme() {
            if (currentTheme === 'dark') {
                $('body').addClass('dark-theme');
                $('#theme-toggle').prop('checked', true);
            } else {
                $('body').removeClass('dark-theme');
                $('#theme-toggle').prop('checked', false);
            }
        }
        
        // Переключение темы
        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            initTheme();
        }
    </script>
</body>
</html>
