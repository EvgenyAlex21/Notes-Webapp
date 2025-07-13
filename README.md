# 📝 Заметки (Notes App)

Современное веб-приложение для управления заметками, созданное на Laravel с использованием современных технологий веб-разработки.

![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## 🌟 Особенности

### 📋 Управление заметками
- **Создание и редактирование** заметок
- **Система приоритетов** с цветовым кодированием
- **Теги** для организации заметок
- **Система папок** для структурирования контента
- **Закрепление заметок** для быстрого доступа к важной информации

### 📁 Организация контента
- **Архивирование** заметок для долгосрочного хранения
- **Корзина** с возможностью восстановления удаленных заметок
- **Поиск и фильтрация** заметок
- **Календарный просмотр** заметок

### ⏰ Напоминания
- **Система напоминаний** с настройкой даты и времени
- **Отметка выполнения** задач

### 📎 Работа с файлами
- **Загрузка вложений** к заметкам
- **Управление файлами** с возможностью удаления

### 🔧 Технические возможности
- **RESTful API** для интеграции с внешними сервисами
- **Версионирование заметок** с историей изменений

## 🚀 Технологический стек

### Backend
- **Laravel 12.0** - современный PHP фреймворк
- **PHP 8.2+** - последняя версия PHP с типизацией
- **SQLite** - легковесная база данных
- **Eloquent ORM** - для работы с базой данных

### Frontend
- **TailwindCSS 4.0** - utility-first CSS фреймворк
- **Vite 6.2** - современный bundler
- **Axios** - HTTP клиент для AJAX запросов

### Инструменты разработки
- **Composer** - менеджер зависимостей PHP
- **NPM** - менеджер пакетов Node.js
- **Laravel Artisan** - CLI инструмент
- **Laravel Tinker** - REPL для отладки

## 📦 Установка и настройка

### Системные требования
- PHP 8.2 или выше
- Composer 2.0+
- Node.js 18+ и NPM
- SQLite

### Шаги установки

1. **Клонирование репозитория**
```bash
git clone https://github.com/your-username/note-app.git
cd note-app
```

2. **Установка PHP зависимостей**
```bash
composer install
```

3. **Установка Node.js зависимостей**
```bash
npm install
```

4. **Настройка окружения**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Настройка базы данных**
```bash
touch database/database.sqlite
php artisan migrate
```

6. **Сборка фронтенд ресурсов**
```bash
npm run build
# или для разработки
npm run dev
```

7. **Запуск сервера разработки**
```bash
php artisan serve
```

Приложение будет доступно по адресу `http://localhost:8000`

## 🔧 Конфигурация

### Переменные окружения (.env)
```env
APP_NAME="Заметки"
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

### Настройка уведомлений
Для работы системы напоминаний настройте cron задачу:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

## 🎯 Использование

### Основные функции

1. **Создание заметки**
   - Нажмите кнопку "Создать заметку"
   - Заполните название и описание
   - Выберите цвет приоритета
   - Добавьте теги при необходимости

2. **Организация заметок**
   - Используйте папки для группировки
   - Применяйте теги для быстрого поиска
   - Закрепляйте важные заметки

3. **Работа с напоминаниями**
   - Установите дату и время напоминания
   - Отмечайте выполненные задачи

4. **Архивирование и удаление**
   - Архивируйте неактуальные заметки
   - Удаляйте ненужные заметки в корзину
   - Восстанавливайте заметки из корзины

## 🔌 API

Приложение предоставляет REST API для интеграции:

### Основные эндпоинты
```
GET    /api/notes              - Получить список заметок
GET    /api/notes/{id}         - Получить заметку по ID
POST   /api/notes              - Создать новую заметку
PUT    /api/notes/{id}         - Обновить заметку
DELETE /api/notes/{id}         - Удалить заметку
GET    /api/tags               - Получить список тегов
POST   /api/notes/{note}/toggle-pin   - Закрепить/открепить заметку
POST   /api/notes/{note}/archive      - Архивировать заметку
POST   /api/notes/{note}/unarchive    - Разархивировать заметку
POST   /api/notes/{note}/trash        - Переместить в корзину
POST   /api/notes/{note}/restore      - Восстановить из корзины
POST   /api/notes/{note}/toggle-done  - Отметить как выполненное/невыполненное
```

### Пример запроса
```javascript
// Создание новой заметки
fetch('/api/notes', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    },
    body: JSON.stringify({
        name: 'Название заметки',
        description: 'Содержимое заметки',
        color: 'blue',
        tags: 'работа,важно'
    })
})
```

## 🏗️ Архитектура

### Структура проекта
```
note-app/
├── app/
│   ├── Http/Controllers/    # Контроллеры
│   │   ├── NoteController.php
│   │   ├── TagController.php
│   │   ├── FolderController.php
│   │   ├── ReminderController.php
│   │   └── PagesController.php
│   └── Models/             # Модели данных
│       └── Note.php
├── database/
│   ├── migrations/         # Миграции БД
│   └── seeders/           # Сидеры для тестовых данных
├── public/
│   ├── css/               # Скомпилированные стили
│   ├── js/                # Скомпилированные JavaScript файлы
│   └── images/            # Изображения
├── resources/
│   ├── views/             # Blade шаблоны
│   ├── css/               # Исходные стили
│   └── js/                # Исходные JS файлы
└── routes/
    ├── web.php            # Веб маршруты
    └── api.php            # API маршруты
```

### Основные компоненты

1. **NoteController** - Управление CRUD операциями для заметок
2. **FolderController** - Управление папками
3. **ReminderController** - Управление напоминаниями
4. **Note Model** - Модель данных заметки
5. **Blade Templates** - Шаблоны интерфейса
6. **JavaScript Modules** - Клиентская логика

## 🧪 Тестирование

### Запуск тестов
```bash
# Все тесты
php artisan test

# Конкретная группа тестов
php artisan test --group=feature
```

### Типы тестов
- **Unit тесты** - тестирование отдельных компонентов
- **Feature тесты** - тестирование пользовательских сценариев

## 🚀 Деплой

### Production готовность
1. **Оптимизация конфигурации**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

2. **Сборка production ресурсов**
```bash
npm run build
```

3. **Настройка веб-сервера**
- Укажите document root на папку `public/`
- Настройте SSL сертификат
- Включите gzip сжатие

## 🤝 Участие в разработке

### Процесс разработки
1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/NewFeature`)
3. Commit изменения (`git commit -m 'Add some NewFeature'`)
4. Push в branch (`git push origin feature/NewFeature`)
5. Создайте Pull Request

### Стандарты кода
- Следуйте PSR-12 для PHP кода
- Пишите тесты для новой функциональности

## 📋 Планы развития

### Планируемые функции
- [ ] Улучшенный текстовый редактор с поддержкой форматирования
- [ ] Экспорт заметок в PDF/Word
- [ ] Система шаблонов заметок
- [ ] Улучшенная фильтрация и поиск
- [ ] Интеграция с календарными сервисами
- [ ] Поддержка Markdown

## 🔧 Поддержка

### Часто задаваемые вопросы

**Q: Как создать новую заметку?**
A: Нажмите на кнопку "Создать заметку" на главной странице.

**Q: Как архивировать заметку?**
A: В меню заметки выберите опцию "Архивировать".

**Q: Как восстановить удаленную заметку?**
A: Перейдите в раздел "Корзина" и нажмите "Восстановить" у нужной заметки.

### Сообщение об ошибках
Если вы нашли ошибку, пожалуйста:
1. Проверьте существующие issues
2. Создайте новый issue с подробным описанием
3. Укажите шаги для воспроизведения
4. Приложите скриншоты при необходимости

## 👥 Авторы

- **Разработчик** - [EvgenyAlex](https://github.com/EvgenyAlex21)