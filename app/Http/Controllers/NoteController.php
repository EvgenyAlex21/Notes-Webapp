<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;
use App\Models\Folder;
use Illuminate\Support\Facades\Schema;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $query = Note::query();
        
        // Фильтр по статусу удаления
        if ($request->has('trash')) {
            $query->where('is_deleted', true);
        } else {
            $query->where('is_deleted', false);
            
            // Фильтр по статусу архивации
            if ($request->has('archive')) {
                $query->where('is_archived', true);
            } else {
                $query->where('is_archived', false);
            }
            
            // Фильтр по папке
            if ($request->has('folder')) {
                $folder = $request->get('folder');
                \Log::info('Запрос заметок с фильтром по папке', [
                    'folder' => $folder,
                    'decoded_folder' => urldecode($folder)
                ]);
                
                // Выполняем полное декодирование имени папки (на случай двойного кодирования)
                try {
                    $decodedFolder = $folder;
                    // Продолжаем декодировать, пока результат меняется
                    while ($decodedFolder !== urldecode($decodedFolder)) {
                        $decodedFolder = urldecode($decodedFolder);
                    }
                    
                    $query->where('folder', $decodedFolder);
                    \Log::info('Применяем фильтр по папке с полным декодированием', [
                        'original' => $folder,
                        'fully_decoded' => $decodedFolder
                    ]);
                    
                    // Проверим, какие заметки существуют для этой папки
                    $notesInFolder = Note::where('folder', $decodedFolder)->get();
                    \Log::info('Найденные заметки в папке', [
                        'folder' => $decodedFolder,
                        'notes_count' => $notesInFolder->count(),
                        'notes' => $notesInFolder->toArray()
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Ошибка при декодировании имени папки', [
                        'error' => $e->getMessage(),
                        'folder' => $folder
                    ]);
                    $query->where('folder', $folder);
                }
            }
        }
        
        // Сортировка: сначала закрепленные
        $query->orderBy('is_pinned', 'desc')
              ->orderBy('updated_at', 'desc');
              
        return response()->json(['data' => $query->get()]);
    }

    public function show(Note $note)
    {
        $filesArray = $note->files;
        $needsUpdate = false;
        
        // Убедимся, что files всегда массив
        if ($filesArray === null) {
            $filesArray = [];
            $needsUpdate = true;
            \Log::info('Файлы заметки были null, преобразованы в пустой массив');
        }
        
        // Если файлы в формате строки, преобразуем в массив
        if (is_string($filesArray)) {
            \Log::info('Файлы заметки в виде строки: ' . $filesArray);
            try {
                $decoded = json_decode($filesArray, true);
                if (is_array($decoded)) {
                    $filesArray = $decoded;
                    $needsUpdate = true;
                    \Log::info('Строка успешно преобразована в массив файлов');
                } else {
                    $filesArray = [];
                    $needsUpdate = true;
                    \Log::error('Строка не преобразована в массив, результат: ' . gettype($decoded));
                }
            } catch (\Exception $e) {
                \Log::error('Ошибка при декодировании файлов в методе show: ' . $e->getMessage());
                $filesArray = [];
                $needsUpdate = true;
            }
        }
        
        // Даже если files уже массив, убедимся что он действительно массив
        if (!is_array($filesArray)) {
            \Log::error('files не является массивом после обработки: ' . gettype($filesArray));
            $filesArray = [];
            $needsUpdate = true;
        }
        
        \Log::info('Показ заметки: ' . $note->id);
        \Log::info('Файлы заметки (до обработки): ' . json_encode($filesArray));
        
        // Убедимся, что все файлы имеют URL для отображения
        if (is_array($filesArray)) {
            foreach ($filesArray as $key => $file) {
                if (is_array($file) && isset($file['path']) && !isset($file['url'])) {
                    $filesArray[$key]['url'] = asset('storage/' . $file['path']);
                    \Log::info('Добавлен URL для файла: ' . $file['name']);
                    $needsUpdate = true;
                }
            }
        }
        
        // Если были изменения, обновляем запись в БД
        if ($needsUpdate) {
            \Log::info('Обновляем поле files в БД для заметки ' . $note->id);
            $note->update(['files' => $filesArray]);
            // Перезагружаем заметку после обновления
            $note = Note::find($note->id);
        }
        
        \Log::info('Файлы заметки (окончательно): ' . json_encode($note->files));
        return response()->json(['data' => $note]);
    }

    public function store(Request $request)
    {
        \Log::info('Создание новой заметки');
        \Log::info('Входящие данные: ' . json_encode($request->all()));
        
        // Убедимся, что правильно обрабатываем булево значение is_pinned
        if ($request->has('is_pinned')) {
            $isPinned = $request->input('is_pinned');
            if (is_string($isPinned)) {
                // Если передано как строка, преобразуем в булево значение
                $request->merge(['is_pinned' => filter_var($isPinned, FILTER_VALIDATE_BOOLEAN)]);
            }
        }
        
        // Исправим проблему с валидацией files перед вызовом validate
        if ($request->has('files') && is_string($request->input('files'))) {
            try {
                $filesJson = json_decode($request->input('files'), true);
                if (is_array($filesJson)) {
                    // Заменяем строку на массив
                    $request->merge(['files' => $filesJson]);
                    \Log::info('Преобразовано поле files из JSON-строки в массив при создании');
                }
            } catch (\Exception $e) {
                \Log::error('Ошибка при декодировании JSON files при создании: ' . $e->getMessage());
                // В случае ошибки устанавливаем пустой массив
                $request->merge(['files' => []]);
            }
        }
        
        // Если files не передано, устанавливаем пустой массив
        if (!$request->has('files')) {
            $request->merge(['files' => []]);
            \Log::info('Добавлен пустой массив files');
        }
        
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'color' => 'nullable|string',
            'is_pinned' => 'nullable|boolean',
            'tags' => 'nullable|string',
            'files' => 'nullable|array',
            'reminder_at' => 'nullable|date',
            'due_date' => 'nullable|date',
            'folder' => 'nullable|string',
        ]);
        
        // Явно устанавливаем значение is_pinned, если оно не было предоставлено
        if (!isset($data['is_pinned'])) {
            $data['is_pinned'] = false;
        }
        
        // Сохраняем отформатированное описание только если столбец существует
        if (Schema::hasColumn('notes', 'formatted_description')) {
            $data['formatted_description'] = $data['description'];
        }
        
        // Устанавливаем значение done по умолчанию как false
        if (!isset($data['done'])) {
            $data['done'] = false;
        }
        
        // Явно устанавливаем is_deleted как false
        $data['is_deleted'] = false;
        
        // Обработка загруженных файлов
        $uploadedFiles = [];
        
        if ($request->hasFile('upload_files')) {
            \Log::info('Обнаружены файлы для загрузки: ' . count($request->file('upload_files')));
            
            // Создаем символическую ссылку для storage, если её нет
            if (!file_exists(public_path('storage'))) {
                \Artisan::call('storage:link');
                \Log::info('Создана символическая ссылка на storage');
            }
            
            foreach ($request->file('upload_files') as $file) {
                if ($file->isValid()) {
                    $fileName = $file->getClientOriginalName();
                    $fileExt = $file->getClientOriginalExtension();
                    $uniqueFileName = pathinfo($fileName, PATHINFO_FILENAME) . '_' . time() . '.' . $fileExt;
                    
                    try {
                        // Сохраняем файл в public/uploads
                        $path = $file->storeAs('uploads', $uniqueFileName, 'public');
                        
                        // Проверяем, что файл существует
                        $fullPath = storage_path('app/public/' . $path);
                        if (!file_exists($fullPath)) {
                            \Log::error('Файл не был сохранен по пути: ' . $fullPath);
                        } else {
                            \Log::info('Файл успешно сохранен: ' . $fullPath);
                        }
                        
                        // Определяем тип файла
                        $fileType = $this->getFileType($fileExt);
                        
                        $fileData = [
                            'name' => $fileName,
                            'path' => $path,
                            'url' => asset('storage/' . $path),
                            'size' => $file->getSize(),
                            'type' => $fileType,
                            'extension' => $fileExt
                        ];
                        
                        \Log::info('Сохранен файл: ' . json_encode($fileData));
                        $uploadedFiles[] = $fileData;
                    } catch (\Exception $e) {
                        \Log::error('Ошибка при сохранении файла: ' . $e->getMessage());
                    }
                }
            }
            
            \Log::info('Всего загружено файлов: ' . count($uploadedFiles));
            $data['files'] = $uploadedFiles;
        } else {
            \Log::info('Файлы для загрузки не обнаружены');
            // Устанавливаем пустой массив для файлов
            $data['files'] = [];
        }
        
        $data['done'] = false; // По умолчанию задача не выполнена
        $data['is_deleted'] = false;
        
        return response()->json(['data' => Note::create($data)]);
    }

    public function update(Request $request, Note $note)
    {
        \Log::info('Обновление заметки ' . $note->id);
        \Log::info('Входящие данные: ' . json_encode($request->all()));
        \Log::info('Метод запроса: ' . $request->method());
        \Log::info('Content-Type заголовок: ' . $request->header('Content-Type'));
        
        // Подробная информация о файлах
        \Log::info('Проверка файлов в запросе через $request->hasFile("upload_files"): ' . ($request->hasFile('upload_files') ? 'ДА' : 'НЕТ'));
        \Log::info('Проверка файлов в запросе через $request->file("upload_files"): ' . ($request->file('upload_files') ? 'ДА' : 'НЕТ'));
        \Log::info('Все файлы в запросе ($request->allFiles()): ' . json_encode($request->allFiles()));
        \Log::info('Все входящие поля запроса: ' . json_encode($request->all()));
        
        // Проверка наличия файлов через $_FILES
        \Log::info('Содержимое $_FILES: ' . json_encode($_FILES));
        
        // Убедимся, что правильно обрабатываем булевы значения
        if ($request->has('is_pinned')) {
            $isPinned = $request->input('is_pinned');
            if (is_string($isPinned)) {
                // Если передано как строка, преобразуем в булево значение
                $request->merge(['is_pinned' => filter_var($isPinned, FILTER_VALIDATE_BOOLEAN)]);
            }
        }
        
        if ($request->has('done')) {
            $done = $request->input('done');
            if (is_string($done)) {
                // Если передано как строка, преобразуем в булево значение
                $request->merge(['done' => filter_var($done, FILTER_VALIDATE_BOOLEAN)]);
            }
        }
        
        // Исправим проблему с валидацией files перед вызовом validate
        if ($request->has('files') && is_string($request->input('files'))) {
            try {
                $filesJson = json_decode($request->input('files'), true);
                if (is_array($filesJson)) {
                    // Заменяем строку на массив
                    $request->merge(['files' => $filesJson]);
                    \Log::info('Преобразовано поле files из JSON-строки в массив');
                }
            } catch (\Exception $e) {
                \Log::error('Ошибка при декодировании JSON files: ' . $e->getMessage());
            }
        }
        
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'done' => 'boolean',
            'color' => 'nullable|string',
            'is_pinned' => 'nullable|boolean',
            'tags' => 'nullable|string',
            'files' => 'nullable|array',
            'reminder_at' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);
        
        // Проверяем, существует ли столбец formatted_description в таблице
        // и только тогда добавляем его в данные
        if (Schema::hasColumn('notes', 'formatted_description')) {
            $data['formatted_description'] = $data['description'];
        }
        
        // Инициализация массива файлов (всегда начинаем с пустого массива для безопасности)
        $uploadedFiles = [];
        
        // Получаем текущие файлы заметки
        $currentFiles = $note->files;
        \Log::info('Текущие файлы заметки (тип: ' . gettype($currentFiles) . '): ' . json_encode($currentFiles));
        
        // Если текущие файлы существуют и они в правильном формате, используем их как базу
        if (is_array($currentFiles)) {
            $uploadedFiles = $currentFiles;
            \Log::info('Использую существующие файлы как базу (массив)');
        } elseif (is_string($currentFiles)) {
            try {
                $decoded = json_decode($currentFiles, true);
                if (is_array($decoded)) {
                    $uploadedFiles = $decoded;
                    \Log::info('Существующие файлы декодированы из строки');
                }
            } catch (\Exception $e) {
                \Log::error('Ошибка при декодировании существующих файлов: ' . $e->getMessage());
            }
        }
        
        // Проверяем, были ли переданы файлы в запросе
        if ($request->has('files')) {
            \Log::info('Получены файлы из запроса. Тип: ' . gettype($request->input('files')));
            $filesData = $request->input('files');
            
            // Обработка разных форматов входящих данных
            if (is_string($filesData)) {
                \Log::info('Содержимое files (строка): ' . $filesData);
                try {
                    $existingFiles = json_decode($filesData, true);
                    if (is_array($existingFiles)) {
                        \Log::info('Декодированные файлы: ' . json_encode($existingFiles));
                        $uploadedFiles = $existingFiles;
                    } else {
                        \Log::error('Не удалось декодировать JSON файлов (результат не массив): ' . json_last_error_msg());
                        // Сохраняем существующие файлы (если они уже установлены выше)
                    }
                } catch (\Exception $e) {
                    \Log::error('Ошибка при обработке JSON файлов: ' . $e->getMessage());
                }
            } elseif (is_array($filesData)) {
                \Log::info('Файлы уже в формате массива: ' . json_encode($filesData));
                $uploadedFiles = $filesData;
            } else {
                \Log::error('files не является строкой или массивом: ' . gettype($filesData));
            }
        } else {
            \Log::info('Поле files отсутствует в запросе - используем текущие файлы');
        }
        
        // Обработка новых загруженных файлов
        \Log::info('Проверка наличия загруженных файлов: ' . ($request->hasFile('upload_files') ? 'ДА' : 'НЕТ'));
        \Log::info('Проверка для upload_files[]: ' . ($request->hasFile('upload_files[]') ? 'ДА' : 'НЕТ'));
        \Log::info('Все входящие файлы: ' . json_encode($request->allFiles()));
        
        // Попробуем получить файлы из разных возможных имен полей
        $uploadFiles = null;
        
        if ($request->hasFile('upload_files')) {
            $uploadFiles = $request->file('upload_files');
            \Log::info('Файлы найдены в поле upload_files');
        } elseif ($request->hasFile('upload_files[]')) {
            $uploadFiles = $request->file('upload_files[]');
            \Log::info('Файлы найдены в поле upload_files[]');
        }
        
        if ($uploadFiles) {
            \Log::info('Количество загруженных файлов: ' . count($uploadFiles));
            
            foreach ($uploadFiles as $file) {
                \Log::info('Обработка файла: ' . $file->getClientOriginalName() . ' (' . $file->getSize() . ' байт)');
                if ($file->isValid()) {
                    $fileName = $file->getClientOriginalName();
                    $fileExt = $file->getClientOriginalExtension();
                    $uniqueFileName = pathinfo($fileName, PATHINFO_FILENAME) . '_' . time() . '.' . $fileExt;
                    
                    // Сохраняем файл в public/uploads
                    $path = $file->storeAs('uploads', $uniqueFileName, 'public');
                    
                    // Определяем тип файла
                    $fileType = $this->getFileType($fileExt);
                    
                    $uploadedFiles[] = [
                        'name' => $fileName,
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'size' => $file->getSize(),
                        'type' => $fileType,
                        'extension' => $fileExt
                    ];
                }
            }
        } else {
            \Log::error('Не найдены файлы для загрузки. Проверьте имя поля формы.');
            
            // Проверяем все ключи в request для отладки
            \Log::info('Все ключи в запросе: ' . json_encode($request->keys()));
            
            // Проверяем, правильно ли установлен enctype в форме
            \Log::info('Content-Type запроса: ' . $request->header('Content-Type'));
        }
        
        // Добавляем файлы к данным заметки
        $data['files'] = $uploadedFiles; // Всегда сохраняем массив, даже пустой
        \Log::info('Финальные файлы для сохранения: ' . json_encode($data['files']));
        
        $note->update($data);
        
        // Перезагрузим заметку, чтобы получить актуальные данные
        $note = Note::find($note->id);
        
        // Убедимся, что files всегда массив
        if ($note->files === null) {
            $note->update(['files' => []]);
            $note = Note::find($note->id);
        } else if (is_string($note->files)) {
            try {
                $filesArray = json_decode($note->files, true) ?: [];
                $note->update(['files' => $filesArray]);
                $note = Note::find($note->id);
            } catch (\Exception $e) {
                \Log::error('Ошибка при декодировании файлов в методе update: ' . $e->getMessage());
                $note->update(['files' => []]);
                $note = Note::find($note->id);
            }
        }
        
        \Log::info('Обновленная заметка возвращена: ' . json_encode($note->files));
        
        return response()->json(['data' => $note]);
    }

    public function destroy(Note $note)
    {
        // Soft delete - перемещение в корзину
        $note->update([
            'is_deleted' => true,
            'deleted_at' => now()
        ]);
        
        return response()->json(['success' => true]);
    }
    
    // Восстановление заметки из корзины
    public function restore(Note $note)
    {
        $note->update([
            'is_deleted' => false,
            'deleted_at' => null
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Окончательное удаление заметки
    public function forceDelete(Note $note)
    {
        $note->delete();
        
        return response()->json(['success' => true]);
    }
    
    // Изменение цвета заметки
    public function updateColor(Request $request, Note $note)
    {
        $data = $request->validate([
            'color' => 'required|string',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Переключение состояния закрепления
    public function togglePin(Note $note)
    {
        $note->update([
            'is_pinned' => !$note->is_pinned
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Быстрое переключение статуса "Выполнено"
    public function toggleDone(Request $request, Note $note)
    {
        try {
            $done = $request->input('done', null);
            
            // Если параметр не передан, инвертируем текущее значение
            if ($done === null) {
                $done = !$note->done;
            } else {
                $done = (bool)$done;
            }
            
            $note->update([
                'done' => $done,
                'completed_at' => $done ? now() : null
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $note,
                'message' => $done ? 'Заметка отмечена как выполненная' : 'Заметка отмечена как активная'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при обновлении статуса заметки: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // Архивация заметки
    public function archive(Note $note)
    {
        $note->update([
            'is_archived' => true,
            'archived_at' => now()
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Восстановление из архива
    public function unarchive(Note $note)
    {
        $note->update([
            'is_archived' => false,
            'archived_at' => null
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Установка напоминания
    public function setReminder(Request $request, Note $note)
    {
        $data = $request->validate([
            'reminder_at' => 'required|date',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Отмена напоминания
    public function removeReminder(Note $note)
    {
        $note->update([
            'reminder_at' => null
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Перемещение заметки в папку
    public function moveToFolder(Request $request, Note $note)
    {
        $data = $request->validate([
            'folder' => 'nullable|string',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Получение списка всех папок
    public function getFolders()
    {
        try {
            // Получаем папки из специальной таблицы папок
            $newFolders = Folder::where('is_deleted', false)
                          ->select('name')
                          ->get()
                          ->pluck('name')
                          ->toArray();
            
            // Получаем папки из старой системы (папки, указанные в заметках)
            $oldFolders = Note::where('is_deleted', false)
                          ->whereNotNull('folder')
                          ->select('folder')
                          ->distinct()
                          ->get()
                          ->pluck('folder')
                          ->toArray();
            
            // Объединяем и удаляем дубликаты
            $folders = array_unique(array_merge($newFolders, $oldFolders));
            
            // Подготовка данных с количеством заметок в каждой папке
            $folderData = [];
            foreach ($folders as $folderName) {
                $count = Note::where('folder', $folderName)
                          ->where('is_deleted', false)
                          ->count();
                
                $folderData[] = [
                    'name' => $folderName,
                    'count' => $count
                ];
            }
            
            return response()->json([
                'success' => true,
                'data' => $folderData
            ]);
        } catch (\Exception $e) {
            \Log::error('Ошибка при получении папок: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении списка папок',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // Изменение режима отображения заметки
    public function updateViewMode(Request $request, Note $note)
    {
        $data = $request->validate([
            'view_mode' => 'required|string|in:card,list,text',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Получение заметок для заданной даты
    public function getByDueDate(Request $request)
    {
        $date = $request->validate([
            'date' => 'required|date_format:Y-m-d',
        ]);
        
        $notes = Note::where('due_date', $date['date'])
                   ->where('is_deleted', false)
                   ->orderBy('is_pinned', 'desc')
                   ->orderBy('updated_at', 'desc')
                   ->get();
        
        return response()->json(['data' => $notes]);
    }
    
    // Получение статистики
    public function getStats()
    {
        $stats = [
            'total' => Note::where('is_deleted', false)->count(),
            'active' => Note::where('is_deleted', false)->where('is_archived', false)->where('done', false)->count(),
            'completed' => Note::where('is_deleted', false)->where('done', true)->count(),
            'archived' => Note::where('is_archived', true)->where('is_deleted', false)->count(),
            'trashed' => Note::where('is_deleted', true)->count(),
            'pinned' => Note::where('is_pinned', true)->where('is_deleted', false)->count(),
            'with_reminders' => Note::where('is_deleted', false)->whereNotNull('reminder_at')->count(),
        ];
        
        // Добавляем статистику по папкам
        // Получаем папки из старой системы (папки, указанные в заметках)
        $oldFolders = Note::where('is_deleted', false)
            ->whereNotNull('folder')
            ->select('folder')
            ->distinct()
            ->get()
            ->pluck('folder');
            
        // Получаем папки из новой системы
        $newFolders = Folder::where('is_deleted', false)
            ->select('name')
            ->get()
            ->pluck('name');
            
        // Объединяем папки
        $folders = $oldFolders->merge($newFolders)->unique();
        
        $folderStats = [];
        foreach ($folders as $folder) {
            $folderStats[$folder] = Note::where('folder', $folder)
                ->where('is_deleted', false)
                ->count();
        }
        
        $stats['by_folder'] = $folderStats;
        
        // Статистика по цветам
        $colors = ['red', 'green', 'blue', 'yellow', 'purple', 'pink', 'orange', 'teal', 'cyan', 'indigo', 'brown', 'black', 'navy', 'default'];
        $colorStats = [];
        foreach ($colors as $color) {
            $count = Note::where('color', $color)
                ->where('is_deleted', false)
                ->count();
            if ($count > 0) {
                $colorStats[$color] = $count;
            }
        }
        
        $stats['by_color'] = $colorStats;
        
        return response()->json(['data' => $stats]);
    }
    
    /**
     * Определяет тип файла по расширению
     *
     * @param string $extension Расширение файла
     * @return string Тип файла (image, video, document, other)
     */
    protected function getFileType($extension)
    {
        $extension = strtolower($extension);
        
        // Изображения
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        if (in_array($extension, $imageExtensions)) {
            return 'image';
        }
        
        // Видео
        $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
        if (in_array($extension, $videoExtensions)) {
            return 'video';
        }
        
        // Документы
        $documentExtensions = [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 
            'txt', 'rtf', 'csv', 'odt', 'ods', 'odp'
        ];
        if (in_array($extension, $documentExtensions)) {
            return 'document';
        }
        
        // Другие типы файлов
        return 'other';
    }
    
    /**
     * Удаляет все заметки из базы данных
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearAll()
    {
        // Получаем количество заметок перед удалением
        $count = Note::count();
        
        // Удаляем все записи из таблицы notes
        Note::truncate();
        
        return response()->json([
            'success' => true,
            'message' => "Успешно удалено {$count} заметок из базы данных."
        ]);
    }
    
    /**
     * Создает новую папку без создания технической заметки
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createFolder(Request $request)
    {
        $data = $request->validate([
            'folder' => 'required|string',
        ]);
        
        $folderName = $data['folder'];
        
        // Проверяем, существует ли уже такая папка
        $existingFolders = Note::where('is_deleted', false)
            ->whereNotNull('folder')
            ->select('folder')
            ->distinct()
            ->get()
            ->pluck('folder');
            
        if ($existingFolders->contains($folderName)) {
            return response()->json([
                'success' => false,
                'message' => 'Папка с таким именем уже существует'
            ], 422);
        }
        
        // Создаем запись о папке в кэше или другом хранилище (здесь мы просто возвращаем успех)
        // В будущем можно добавить таблицу folders для более правильной организации
        
        return response()->json([
            'success' => true,
            'message' => 'Папка успешно создана',
            'data' => ['folder' => $folderName]
        ]);
    }
    
    /**
     * Переименование папки
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function renameFolder(Request $request)
    {
        $validatedData = $request->validate([
            'old_folder' => 'required|string',
            'new_folder' => 'required|string|different:old_folder'
        ]);
        
        // Проверяем существование новой папки
        $folderExists = Note::where('folder', $validatedData['new_folder'])
                          ->where('is_deleted', false)
                          ->exists();
        
        if ($folderExists) {
            return response()->json([
                'success' => false,
                'message' => 'Папка с таким именем уже существует'
            ], 400);
        }
        
        // Обновляем все заметки в этой папке
        $updatedCount = Note::where('folder', $validatedData['old_folder'])
                          ->where('is_deleted', false)
                          ->update(['folder' => $validatedData['new_folder']]);
        
        return response()->json([
            'success' => true,
            'message' => 'Папка успешно переименована',
            'data' => [
                'count' => $updatedCount
            ]
        ]);
    }
}
