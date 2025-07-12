<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('notes', 'files')) {
            if (DB::connection()->getDriverName() !== 'sqlite') {
                Schema::table('notes', function (Blueprint $table) {
                    $table->json('files')->nullable()->change();
                });
                \Log::info('Изменен тип колонки files на JSON');
            }
            
            $notes = DB::table('notes')->get();
            \Log::info('Обработка ' . count($notes) . ' заметок для миграции files');
            
            foreach ($notes as $note) {
                $files = $note->files;
                
                if ($files === null) {
                    DB::table('notes')
                        ->where('id', $note->id)
                        ->update(['files' => json_encode([])]);
                    \Log::info('Заметка ' . $note->id . ': NULL преобразован в пустой массив');
                    continue;
                }
                
                if (!$this->isValidJson($files)) {
                    try {
                        $filesArray = json_decode($files, true);
                        if ($filesArray === null) {
                            $filesArray = [];
                            \Log::info('Заметка ' . $note->id . ': не удалось декодировать строку, установлен пустой массив');
                        } else {
                            \Log::info('Заметка ' . $note->id . ': успешно декодировано ' . count($filesArray) . ' файлов');
                        }
                        
                        DB::table('notes')
                            ->where('id', $note->id)
                            ->update(['files' => json_encode($filesArray)]);
                    } catch (\Exception $e) {
                        DB::table('notes')
                            ->where('id', $note->id)
                            ->update(['files' => json_encode([])]);
                        \Log::error('Заметка ' . $note->id . ': ошибка при обработке JSON: ' . $e->getMessage());
                    }
                } else {
                    \Log::info('Заметка ' . $note->id . ': уже в формате JSON');
                }
            }
        } else {
            \Log::info('Колонка files не найдена в таблице notes');
        }
    }
    
    private function isValidJson($string) {
        if (!is_string($string)) {
            return false;
        }
        
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            if (Schema::hasColumn('notes', 'files')) {
                $table->text('files')->nullable()->change();
            }
        });
    }
};