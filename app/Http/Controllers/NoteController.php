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
        
        if ($request->has('trash')) {
            $query->where('is_deleted', true);
        } else {
            $query->where('is_deleted', false);
            
            if ($request->has('archive')) {
                \Log::info('Запрос архивных заметок', [
                    'query' => $request->all(),
                    'url' => $request->fullUrl()
                ]);
                
                $query->where('is_archived', true);
                
                $archiveCount = Note::where('is_archived', true)
                                   ->where('is_deleted', false)
                                   ->count();
                
                \Log::info('Количество архивных заметок в базе: ' . $archiveCount);
                
                $archiveNotes = Note::where('is_archived', true)
                                   ->where('is_deleted', false)
                                   ->get();
                
                \Log::info('Архивные заметки:', ['notes' => $archiveNotes->toArray()]);
            } else {
                $query->where('is_archived', false);
            }
            
            if ($request->has('folder')) {
                $folder = $request->get('folder');
                \Log::info('Запрос заметок с фильтром по папке', [
                    'folder' => $folder,
                    'decoded_folder' => urldecode($folder)
                ]);
                
                try {
                    $decodedFolder = $folder;
                    while ($decodedFolder !== urldecode($decodedFolder)) {
                        $decodedFolder = urldecode($decodedFolder);
                    }
                    
                    $query->where('folder', $decodedFolder);
                    \Log::info('Применяем фильтр по папке с полным декодированием', [
                        'original' => $folder,
                        'fully_decoded' => $decodedFolder
                    ]);
                    
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
        
        $query->orderBy('is_pinned', 'desc')
              ->orderBy('updated_at', 'desc');
              
        return response()->json(['data' => $query->get()]);
    }

    public function show(Note $note)
    {
        $filesArray = $note->files;
        $needsUpdate = false;
        
        if ($filesArray === null) {
            $filesArray = [];
            $needsUpdate = true;
            \Log::info('Файлы заметки были null, преобразованы в пустой массив');
        }
        
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
        
        if (!is_array($filesArray)) {
            \Log::error('files не является массивом после обработки: ' . gettype($filesArray));
            $filesArray = [];
            $needsUpdate = true;
        }
        
        \Log::info('Показ заметки: ' . $note->id);
        \Log::info('Файлы заметки (до обработки): ' . json_encode($filesArray));
        
        if (is_array($filesArray)) {
            foreach ($filesArray as $key => $file) {
                if (is_array($file) && isset($file['path']) && !isset($file['url'])) {
                    $filesArray[$key]['url'] = asset('storage/' . $file['path']);
                    \Log::info('Добавлен URL для файла: ' . $file['name']);
                    $needsUpdate = true;
                }
            }
        }
        
        if ($needsUpdate) {
            \Log::info('Обновляем поле files в БД для заметки ' . $note->id);
            $note->update(['files' => $filesArray]);
            $note = Note::find($note->id);
        }
        
        $note->files = $filesArray;
        
        \Log::info('Напоминание заметки ' . $note->id . ': ' . ($note->reminder_at ? $note->reminder_at->format('Y-m-d\TH:i:s') : 'отсутствует'));
        
        if ($note->reminder_at) {
            $note->reminder_at = $note->reminder_at->format('Y-m-d\TH:i:s');
        }
        return response()->json(['data' => $note]);
    }

    public function store(Request $request)
    {
        \Log::info('Создание новой заметки');
        \Log::info('Входящие данные: ' . json_encode($request->all()));
        
        if ($request->has('is_pinned')) {
            $isPinned = $request->input('is_pinned');
            if (is_string($isPinned)) {
                $request->merge(['is_pinned' => filter_var($isPinned, FILTER_VALIDATE_BOOLEAN)]);
            }
        }
        
        if ($request->has('files') && is_string($request->input('files'))) {
            try {
                $filesJson = json_decode($request->input('files'), true);
                if (is_array($filesJson)) {
                    $request->merge(['files' => $filesJson]);
                    \Log::info('Преобразовано поле files из JSON-строки в массив при создании');
                }
            } catch (\Exception $e) {
                \Log::error('Ошибка при декодировании JSON files при создании: ' . $e->getMessage());
                $request->merge(['files' => []]);
            }
        }
        
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
        
        if (!isset($data['is_pinned'])) {
            $data['is_pinned'] = false;
        }
        
        if (Schema::hasColumn('notes', 'formatted_description')) {
            $data['formatted_description'] = $data['description'];
        }
        
        if (!isset($data['done'])) {
            $data['done'] = false;
        }
        
        $data['is_deleted'] = false;
        
        $uploadedFiles = [];
        $uploadFiles = null;
        
        \Log::info('Метод запроса: ' . $request->method());
        \Log::info('Content-Type: ' . $request->header('Content-Type'));
        \Log::info('Все параметры запроса: ' . json_encode($request->all()));
        \Log::info('Все файлы в запросе: ' . json_encode($request->allFiles()));
        \Log::info('Наличие поля upload_files: ' . ($request->hasFile('upload_files') ? 'ДА' : 'НЕТ'));
        \Log::info('Наличие поля upload_files[]: ' . ($request->hasFile('upload_files[]') ? 'ДА' : 'НЕТ'));
        \Log::info('Содержимое $_FILES: ' . json_encode($_FILES));
        
        $uploadDir = storage_path('app/public/uploads');
        if (!file_exists($uploadDir)) {
            \Log::info('Создаем директорию для загрузки файлов: ' . $uploadDir);
            mkdir($uploadDir, 0755, true);
        }
        
        if ($request->hasFile('upload_files')) {
            $uploadFiles = $request->file('upload_files');
            \Log::info('Обнаружены файлы для загрузки в поле upload_files: ' . count($uploadFiles));
        } elseif ($request->hasFile('upload_files[]')) {
            $uploadFiles = $request->file('upload_files[]');
            \Log::info('Обнаружены файлы для загрузки в поле upload_files[]: ' . count($uploadFiles));
        } else {
            foreach ($request->allFiles() as $key => $files) {
                \Log::info('Обнаружено поле с файлами: ' . $key . ' (количество: ' . count($files) . ')');
                $uploadFiles = $files;
                break;
            }
            
            if (!$uploadFiles && !empty($_FILES)) {
                \Log::info('Пытаемся получить файлы напрямую через $_FILES');
                foreach ($_FILES as $key => $fileData) {
                    if (isset($fileData['tmp_name']) && is_array($fileData['tmp_name'])) {
                        \Log::info('Найдено поле с файлами в $_FILES: ' . $key);
                        $uploadFiles = [];
                        for ($i = 0; $i < count($fileData['tmp_name']); $i++) {
                            if (!empty($fileData['tmp_name'][$i]) && is_uploaded_file($fileData['tmp_name'][$i])) {
                                $uploadFiles[] = $fileData['tmp_name'][$i];
                            }
                        }
                    }
                }
            }
        }
        
        if ($request->has('debug_files_count')) {
            \Log::info('Отладочное поле debug_files_count: ' . $request->input('debug_files_count'));
        }
        
        if ($request->has('has_files')) {
            \Log::info('Отладочное поле has_files: ' . $request->input('has_files'));
        }
        
        if ($uploadFiles) {
            \Log::info('Обнаружены файлы для загрузки: ' . count($uploadFiles));
            
            if (!file_exists(public_path('storage'))) {
                \Artisan::call('storage:link');
                \Log::info('Создана символическая ссылка на storage');
            }
            
            $uploadDir = storage_path('app/public/uploads');
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
                \Log::info('Создана директория для загрузок: ' . $uploadDir);
            }
            
            \Log::info('Начинаем обработку ' . count($uploadFiles) . ' файлов');
            foreach ($uploadFiles as $index => $file) {
                \Log::info('Обработка файла #' . ($index + 1) . ': ' . ($file->getClientOriginalName() ?? 'без имени'));
                
                if ($file->isValid()) {
                    $fileName = $file->getClientOriginalName();
                    $fileExt = $file->getClientOriginalExtension();
                    $uniqueFileName = pathinfo($fileName, PATHINFO_FILENAME) . '_' . time() . '_' . uniqid() . '.' . $fileExt;
                    
                    try {
                        $uploadDir = storage_path('app/public/uploads');
                        if (!file_exists($uploadDir)) {
                            \Log::info('Создаем директорию для загрузки файлов: ' . $uploadDir);
                            mkdir($uploadDir, 0755, true);
                        }
                        
                        $path = $file->storeAs('uploads', $uniqueFileName, 'public');
                        
                        $fullPath = storage_path('app/public/' . $path);
                        if (!file_exists($fullPath)) {
                            \Log::error('Файл не был сохранен по пути: ' . $fullPath);
                            
                            if ($file->move(storage_path('app/public/uploads'), $uniqueFileName)) {
                                \Log::info('Файл успешно сохранен альтернативным способом');
                                $path = 'uploads/' . $uniqueFileName;
                            } else {
                                \Log::error('Не удалось сохранить файл альтернативным способом');
                                continue;
                            }
                        } else {
                            \Log::info('Файл успешно сохранен: ' . $fullPath);
                        }
                        
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
                        \Log::error('Ошибка при сохранении файла: ' . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
                    }
                } else {
                    \Log::error('Файл не прошел валидацию: ' . ($file->getErrorMessage() ?? 'неизвестная ошибка'));
                }
            }
            
            \Log::info('Всего загружено файлов: ' . count($uploadedFiles));
            $data['files'] = $uploadedFiles;
        } else {
            \Log::info('Файлы для загрузки не обнаружены');
            $data['files'] = [];
        }
        
        $data['done'] = false;
        $data['is_deleted'] = false;
        
        return response()->json(['data' => Note::create($data)]);
    }

    public function update(Request $request, Note $note)
    {
        \Log::info('Обновление заметки ' . $note->id);
        \Log::info('Входящие данные: ' . json_encode($request->all()));
        \Log::info('Метод запроса: ' . $request->method());
        \Log::info('Content-Type заголовок: ' . $request->header('Content-Type'));
        
        \Log::info('Проверка файлов в запросе через $request->hasFile("upload_files"): ' . ($request->hasFile('upload_files') ? 'ДА' : 'НЕТ'));
        \Log::info('Проверка файлов в запросе через $request->file("upload_files"): ' . ($request->file('upload_files') ? 'ДА' : 'НЕТ'));
        \Log::info('Все файлы в запросе ($request->allFiles()): ' . json_encode($request->allFiles()));
        \Log::info('Все входящие поля запроса: ' . json_encode($request->all()));
        \Log::info('Содержимое $_FILES: ' . json_encode($_FILES));
        
        if ($request->has('is_pinned')) {
            $isPinned = $request->input('is_pinned');
            if (is_string($isPinned)) {
                $request->merge(['is_pinned' => filter_var($isPinned, FILTER_VALIDATE_BOOLEAN)]);
            }
        }
        
        if ($request->has('done')) {
            $done = $request->input('done');
            if (is_string($done)) {
                $request->merge(['done' => filter_var($done, FILTER_VALIDATE_BOOLEAN)]);
            }
        }
        
        if ($request->has('files') && is_string($request->input('files'))) {
            try {
                $filesJson = json_decode($request->input('files'), true);
                if (is_array($filesJson)) {
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
        
        if ($request->has('reminder_at')) {
            $reminderAt = $request->input('reminder_at');
            if ($reminderAt && $reminderAt !== '') {
                $data['reminder_at'] = $reminderAt;
                \Log::info('Установлено напоминание: ' . $data['reminder_at']);
            } else {
                $data['reminder_at'] = null;
                \Log::info('Напоминание очищено');
            }
        }
        
        if (Schema::hasColumn('notes', 'formatted_description')) {
            $data['formatted_description'] = $data['description'];
        }
        
        $uploadedFiles = [];
        $currentFiles = $note->files;
        \Log::info('Текущие файлы заметки (тип: ' . gettype($currentFiles) . '): ' . json_encode($currentFiles));
        
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
        
        if ($request->has('files')) {
            \Log::info('Получены файлы из запроса. Тип: ' . gettype($request->input('files')));
            $filesData = $request->input('files');
            
            if (is_string($filesData)) {
                \Log::info('Содержимое files (строка): ' . $filesData);
                try {
                    $existingFiles = json_decode($filesData, true);
                    if (is_array($existingFiles)) {
                        \Log::info('Декодированные файлы: ' . json_encode($existingFiles));
                        $uploadedFiles = $existingFiles;
                    } else {
                        \Log::error('Не удалось декодировать JSON файлов (результат не массив): ' . json_last_error_msg());
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
        
        \Log::info('Проверка наличия загруженных файлов: ' . ($request->hasFile('upload_files') ? 'ДА' : 'НЕТ'));
        \Log::info('Проверка для upload_files[]: ' . ($request->hasFile('upload_files[]') ? 'ДА' : 'НЕТ'));
        \Log::info('Все входящие файлы: ' . json_encode($request->allFiles()));
        
        $uploadFiles = null;
        
        if ($request->hasFile('upload_files')) {
            $uploadFiles = $request->file('upload_files');
            \Log::info('Файлы найдены в поле upload_files');
        } elseif ($request->hasFile('upload_files[]')) {
            $uploadFiles = $request->file('upload_files[]');
            \Log::info('Файлы найдены в поле upload_files[]');
        } else {
            foreach ($request->allFiles() as $key => $files) {
                \Log::info('Обнаружено поле с файлами: ' . $key . ' (количество: ' . count($files) . ')');
                $uploadFiles = $files;
                break;
            }
        }
        
        if ($uploadFiles) {
            \Log::info('Количество загруженных файлов: ' . count($uploadFiles));
            
            $existingFilesCount = is_array($uploadedFiles) ? count($uploadedFiles) : 0;
            $newFilesCount = count($uploadFiles);
            $totalFiles = $existingFilesCount + $newFilesCount;
            $maxFiles = 10;
            
            \Log::info("Проверка лимита файлов: существующих=$existingFilesCount, новых=$newFilesCount, итого=$totalFiles, лимит=$maxFiles");
            
            if ($totalFiles > $maxFiles) {
                \Log::error("Превышен лимит файлов: $totalFiles > $maxFiles");
                return response()->json([
                    'error' => "Превышен лимит файлов! Максимум $maxFiles файлов, а пытаетесь загрузить $totalFiles. Удалите " . ($totalFiles - $maxFiles) . " файл(ов)."
                ], 422);
            }
            
            foreach ($uploadFiles as $file) {
                if (!is_string($file) && $file->isValid()) {
                    $maxSize = 100 * 1024 * 1024;
                    if ($file->getSize() > $maxSize) {
                        $sizeMB = round($file->getSize() / (1024 * 1024), 1);
                        \Log::error("Файл {$file->getClientOriginalName()} превышает лимит размера: {$sizeMB} MB");
                        return response()->json([
                            'error' => "Файл \"{$file->getClientOriginalName()}\" имеет размер {$sizeMB} МБ. Максимально допустимый размер - 100 МБ."
                        ], 422);
                    }
                }
            }
            
            if (!file_exists(public_path('storage'))) {
                \Artisan::call('storage:link');
                \Log::info('Создана символическая ссылка на storage');
            }
            
            $uploadDir = storage_path('app/public/uploads');
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
                \Log::info('Создана директория для загрузок: ' . $uploadDir);
            }
            
            foreach ($uploadFiles as $file) {
                if (!is_string($file) && $file->isValid()) {
                    try {
                        \Log::info('Обработка файла: ' . $file->getClientOriginalName() . ' (' . $file->getSize() . ' байт)');
                        $fileName = $file->getClientOriginalName();
                        $fileExt = $file->getClientOriginalExtension();
                        $uniqueFileName = pathinfo($fileName, PATHINFO_FILENAME) . '_' . time() . '.' . $fileExt;
                        
                        $path = $file->storeAs('uploads', $uniqueFileName, 'public');
                        \Log::info('Файл сохранен по пути: ' . $path);
                        
                        $fullPath = storage_path('app/public/' . $path);
                        if (file_exists($fullPath)) {
                            \Log::info('Проверка - файл существует по пути: ' . $fullPath);
                        } else {
                            \Log::error('Файл не найден по указанному пути: ' . $fullPath);
                        }
                        
                        $fileType = $this->getFileType($fileExt);
                        
                        $fileData = [
                            'name' => $fileName,
                            'path' => $path,
                            'url' => asset('storage/' . $path),
                            'size' => $file->getSize(),
                            'type' => $fileType,
                            'extension' => $fileExt
                        ];
                        
                        \Log::info('Добавление данных файла в заметку: ' . json_encode($fileData));
                        $uploadedFiles[] = $fileData;
                    } catch (\Exception $e) {
                        \Log::error('Ошибка при сохранении файла: ' . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
                    }
                } else {
                    if (is_string($file)) {
                        \Log::error('Файл является строкой, а не объектом UploadedFile');
                    } else if (!$file->isValid()) {
                        \Log::error('Файл не прошел валидацию: ' . $file->getErrorMessage());
                    }
                }
            }
        } else {
            \Log::error('Не найдены файлы для загрузки. Проверьте имя поля формы.');
            \Log::info('Все ключи в запросе: ' . json_encode($request->keys()));
            \Log::info('Content-Type запроса: ' . $request->header('Content-Type'));
        }
        
        $data['files'] = $uploadedFiles;
        \Log::info('Финальные файлы для сохранения: ' . json_encode($data['files']));
        
        if (!is_array($data['files'])) {
            \Log::error('КРИТИЧЕСКАЯ ОШИБКА: files не является массивом перед сохранением, исправляем');
            $data['files'] = is_string($data['files']) ? json_decode($data['files'], true) : [];
            if (!is_array($data['files'])) {
                $data['files'] = [];
            }
        }
        
        \Log::info('Данные для обновления заметки ' . $note->id . ': ' . json_encode($data));
        \Log::info('Напоминание в данных: ' . (isset($data['reminder_at']) ? $data['reminder_at'] : 'НЕ УСТАНОВЛЕНО'));
        
        $note->update($data);
        $note = Note::find($note->id);
        
        \Log::info('Заметка после обновления - напоминание: ' . ($note->reminder_at ? $note->reminder_at->format('Y-m-d\TH:i:s') : 'отсутствует'));
        
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
        
        if ($note->reminder_at) {
            $note->reminder_at = $note->reminder_at->format('Y-m-d\TH:i:s');
        }
        
        \Log::info('Обновленная заметка возвращена: ' . json_encode($note->files));
        
        return response()->json(['data' => $note]);
    }

    public function destroy(Note $note)
    {
        $note->update([
            'is_deleted' => true,
            'deleted_at' => now()
        ]);
        
        return response()->json(['success' => true]);
    }
    
    public function restore(Note $note)
    {
        $note->update([
            'is_deleted' => false,
            'deleted_at' => null
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    public function forceDelete(Note $note)
    {
        $note->delete();
        
        return response()->json(['success' => true]);
    }
    
    public function updateColor(Request $request, Note $note)
    {
        $data = $request->validate([
            'color' => 'required|string',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    public function togglePin(Note $note)
    {
        $note->update([
            'is_pinned' => !$note->is_pinned
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    public function toggleDone(Request $request, Note $note)
    {
        try {
            $done = $request->input('done', null);
            
            if ($done === null) {
                $done = !$note->done;
            } else {
                $done = (bool)$done;
            }
            
            $note->update([
                'done' => $done
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
    
    public function archive(Note $note)
    {
        \Log::info('Архивация заметки', [
            'id' => $note->id,
            'title' => $note->title,
            'before_status' => [
                'is_archived' => $note->is_archived,
                'is_deleted' => $note->is_deleted
            ]
        ]);
        
        $note->update([
            'is_archived' => true,
            'archived_at' => now()
        ]);
        
        \Log::info('Заметка архивирована', [
            'id' => $note->id,
            'title' => $note->title,
            'after_status' => [
                'is_archived' => $note->is_archived,
                'is_deleted' => $note->is_deleted
            ]
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    public function unarchive(Note $note)
    {
        $note->update([
            'is_archived' => false,
            'archived_at' => null
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    public function setReminder(Request $request, Note $note)
    {
        $data = $request->validate([
            'reminder_at' => 'required|date',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    public function removeReminder(Note $note)
    {
        $note->update([
            'reminder_at' => null
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    public function moveToFolder(Request $request, Note $note)
    {
        $data = $request->validate([
            'folder' => 'nullable|string',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    public function getFolders()
    {
        try {
            $newFolders = Folder::where('is_deleted', false)
                          ->select('name')
                          ->get()
                          ->pluck('name')
                          ->toArray();
            
            $oldFolders = Note::where('is_deleted', false)
                          ->whereNotNull('folder')
                          ->select('folder')
                          ->distinct()
                          ->get()
                          ->pluck('folder')
                          ->toArray();
            
            $folders = array_unique(array_merge($newFolders, $oldFolders));
            
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
    
    public function updateViewMode(Request $request, Note $note)
    {
        $data = $request->validate([
            'view_mode' => 'required|string|in:card,list,text',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
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
        
        $oldFolders = Note::where('is_deleted', false)
            ->whereNotNull('folder')
            ->select('folder')
            ->distinct()
            ->get()
            ->pluck('folder');
            
        $newFolders = Folder::where('is_deleted', false)
            ->select('name')
            ->get()
            ->pluck('name');
            
        $folders = $oldFolders->merge($newFolders)->unique();
        
        $folderStats = [];
        foreach ($folders as $folder) {
            $folderStats[$folder] = Note::where('folder', $folder)
                ->where('is_deleted', false)
                ->count();
        }
        
        $stats['by_folder'] = $folderStats;
        
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
    
    protected function getFileType($extension)
    {
        $extension = strtolower($extension);
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        if (in_array($extension, $imageExtensions)) {
            return 'image';
        }
        $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
        if (in_array($extension, $videoExtensions)) {
            return 'video';
        }
        $documentExtensions = [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 
            'txt', 'rtf', 'csv', 'odt', 'ods', 'odp'
        ];
        if (in_array($extension, $documentExtensions)) {
            return 'document';
        }
        return 'other';
    }
    
    public function clearAll()
    {
        $count = Note::count();
        Note::truncate();
        return response()->json([
            'success' => true,
            'message' => "Успешно удалено {$count} заметок из базы данных."
        ]);
    }
    
    public function createFolder(Request $request)
    {
        $data = $request->validate([
            'folder' => 'required|string',
        ]);
        
        $folderName = $data['folder'];
        
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
        
        return response()->json([
            'success' => true,
            'message' => 'Папка успешно создана',
            'data' => ['folder' => $folderName]
        ]);
    }
    
    public function renameFolder(Request $request)
    {
        $validatedData = $request->validate([
            'old_folder' => 'required|string',
            'new_folder' => 'required|string|different:old_folder'
        ]);
        
        $folderExists = Note::where('folder', $validatedData['new_folder'])
                          ->where('is_deleted', false)
                          ->exists();
        
        if ($folderExists) {
            return response()->json([
                'success' => false,
                'message' => 'Папка с таким именем уже существует'
            ], 400);
        }
        
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