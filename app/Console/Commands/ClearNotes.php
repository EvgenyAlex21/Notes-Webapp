<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Note;

class ClearNotes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notes:clear';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Удаляет все заметки из базы данных';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Получаем количество заметок перед удалением
        $count = Note::count();
        
        // Удаляем все записи из таблицы notes
        Note::truncate();
        
        $this->info("Успешно удалено {$count} заметок из базы данных.");
        
        return Command::SUCCESS;
    }
}
