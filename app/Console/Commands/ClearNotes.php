<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Note;

class ClearNotes extends Command
{
    /**
     *
     * @var string
     */
    protected $signature = 'notes:clear';

    /**
     *
     * @var string
     */
    protected $description = 'Удаляет все заметки из базы данных';

    /**
     *
     * @return int
     */
    public function handle()
    {
        $count = Note::count();
        
        Note::truncate();
        
        $this->info("Успешно удалено {$count} заметок из базы данных.");
        
        return Command::SUCCESS;
    }
}
