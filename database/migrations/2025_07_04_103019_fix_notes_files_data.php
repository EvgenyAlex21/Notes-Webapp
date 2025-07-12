<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Note;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Не добавляем никаких новых столбцов
        
        // Проверяем и исправляем существующие данные в поле files
        if (Schema::hasColumn('notes', 'files')) {
            Log::info('Запуск миграции fix_notes_files_data для исправления файлов в заметках');
            
            // Получаем все заметки
            $notes = Note::all();
            Log::info('Всего заметок для проверки: ' . $notes->count());
            
            foreach ($notes as $note) {
                $filesData = $note->files;
                $needsUpdate = false;
                
                // Преобразуем null в пустой массив
                if ($filesData === null) {
                    $filesData = [];
                    $needsUpdate = true;
                    Log::info('Заметка ' . $note->id . ': null преобразован в пустой массив');
                }
                
                // Преобразуем строку в массив
                if (is_string($filesData) && $filesData !== '') {
                    try {
                        $decoded = json_decode($filesData, true);
                        if (is_array($decoded)) {
                            $filesData = $decoded;
                            $needsUpdate = true;
                            Log::info('Заметка ' . $note->id . ': строка успешно преобразована в массив');
                        } else {
                            $filesData = [];
                            $needsUpdate = true;
                            Log::error('Заметка ' . $note->id . ': строка не преобразована в массив');
                        }
                    } catch (\Exception $e) {
                        $filesData = [];
                        $needsUpdate = true;
                        Log::error('Заметка ' . $note->id . ': ошибка при декодировании JSON - ' . $e->getMessage());
                    }
                }
                
                // Если это не массив, преобразуем в пустой массив
                if (!is_array($filesData)) {
                    $filesData = [];
                    $needsUpdate = true;
                    Log::error('Заметка ' . $note->id . ': файлы не являются массивом');
                }
                
                // Проверяем каждый файл в массиве
                if (is_array($filesData) && !empty($filesData)) {
                    $validFiles = [];
                    
                    foreach ($filesData as $file) {
                        // Проверяем, что каждый файл имеет необходимые поля
                        if (!is_array($file)) {
                            continue;
                        }
                        
                        // Должно быть имя
                        if (!isset($file['name']) || empty($file['name'])) {
                            continue;
                        }
                        
                        // Должен быть либо путь, либо URL
                        if ((!isset($file['path']) || empty($file['path'])) && 
                            (!isset($file['url']) || empty($file['url']))) {
                            continue;
                        }
                        
                        // Если нет URL, но есть путь - создаем URL
                        if ((!isset($file['url']) || empty($file['url'])) && 
                            isset($file['path']) && !empty($file['path'])) {
                            $file['url'] = asset('storage/' . $file['path']);
                            $needsUpdate = true;
                        }
                        
                        // Добавляем валидный файл
                        $validFiles[] = $file;
                    }
                    
                    // Если количество валидных файлов отличается от исходного
                    if (count($validFiles) !== count($filesData)) {
                        $filesData = $validFiles;
                        $needsUpdate = true;
                        Log::info('Заметка ' . $note->id . ': отфильтровано ' . count($validFiles) . ' валидных файлов из ' . count($filesData));
                    }
                }
                
                // Обновляем данные, если были изменения
                if ($needsUpdate) {
                    $note->files = $filesData;
                    $note->save();
                    Log::info('Заметка ' . $note->id . ': обновлена с ' . count($filesData) . ' файлами');
                }
            }
            
            Log::info('Миграция fix_notes_files_data завершена успешно');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Нет необходимости в откате, данные уже были исправлены
    }
};
