<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    protected $guarded = false;
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public static function active()
    {
        return self::where('is_deleted', false)
                   ->where('user_id', auth()->id());
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'folder', 'name')
                    ->where('user_id', auth()->id());
    }
    
    public function notesCount()
    {
        return $this->notes()->where('is_deleted', false)->count();
    }
}