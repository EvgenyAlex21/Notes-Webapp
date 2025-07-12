<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    protected $guarded = false;
    
    public static function active()
    {
        return self::where('is_deleted', false);
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'folder', 'name');
    }
    
    public function notesCount()
    {
        return $this->notes()->where('is_deleted', false)->count();
    }
}