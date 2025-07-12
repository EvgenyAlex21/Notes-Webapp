<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    protected $guarded = false;
    
    /**
     * Получить активные (не удаленные) папки
     */
    public static function active()
    {
        return self::where('is_deleted', false);
    }
    
    /**
     * Получить заметки, принадлежащие к этой папке
     */
    public function notes()
    {
        return $this->hasMany(Note::class, 'folder', 'name');
    }
    
    /**
     * Подсчитать количество заметок в папке
     */
    public function notesCount()
    {
        return $this->notes()->where('is_deleted', false)->count();
    }
}
