<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Note;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('notes', 'files')) {
            Log::info('Запуск миграции fix_notes_files_data для исправления файлов в заметках');
            
            $notes = Note::all();
            Log::info('Всего заметок для проверки: ' . $notes->count());
            
            foreach ($notes as $note) {
                $filesData = $note->files;
                $needsUpdate = false;

                if ($filesData === null) {
                    $filesData = [];
                    $needsUpdate = true;
                    Log::info('Заметка ' . $note->id . ': null преобразован в пустой массив');
                }
                
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
                
                if (!is_array($filesData)) {
                    $filesData = [];
                    $needsUpdate = true;
                    Log::error('Заметка ' . $note->id . ': файлы не являются массивом');
                }
                
                if (is_array($filesData) && !empty($filesData)) {
                    $validFiles = [];
                    
                    foreach ($filesData as $file) {

                        if (!is_array($file)) {
                            continue;
                        }
                        
                        if (!isset($file['name']) || empty($file['name'])) {
                            continue;
                        }
                        
                        if ((!isset($file['path']) || empty($file['path'])) && 
                            (!isset($file['url']) || empty($file['url']))) {
                            continue;
                        }
                        
                        if ((!isset($file['url']) || empty($file['url'])) && 
                            isset($file['path']) && !empty($file['path'])) {
                            $file['url'] = asset('storage/' . $file['path']);
                            $needsUpdate = true;
                        }
                        
                        $validFiles[] = $file;
                    }
                    
                    if (count($validFiles) !== count($filesData)) {
                        $filesData = $validFiles;
                        $needsUpdate = true;
                        Log::info('Заметка ' . $note->id . ': отфильтровано ' . count($validFiles) . ' валидных файлов из ' . count($filesData));
                    }
                }
                
                if ($needsUpdate) {
                    $note->files = $filesData;
                    $note->save();
                    Log::info('Заметка ' . $note->id . ': обновлена с ' . count($filesData) . ' файлами');
                }
            }
            
            Log::info('Миграция fix_notes_files_data завершена успешно');
        }
    }

    public function down(): void
    {
    }
};