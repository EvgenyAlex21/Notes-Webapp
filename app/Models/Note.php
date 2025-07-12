<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $guarded = false;
    protected $table = 'notes';
    
    /**
     * Атрибуты, которые должны быть приведены к определённым типам
     */
    protected $casts = [
        'done' => 'boolean',
        'is_pinned' => 'boolean',
        'is_deleted' => 'boolean',
        'is_archived' => 'boolean',
        'deleted_at' => 'datetime',
        'archived_at' => 'datetime',
        'reminder_at' => 'datetime',
    ];
    
    /**
     * Получить все активные заметки (не в архиве и не в корзине)
     */
    public static function active()
    {
        return self::where('is_deleted', false)
                   ->where('is_archived', false);
    }
    
    /**
     * Получить архивированные заметки
     */
    public static function archived()
    {
        return self::where('is_archived', true)
                   ->where('is_deleted', false);
    }
    
    /**
     * Получить удаленные заметки (в корзине)
     */
    public static function trashed()
    {
        return self::where('is_deleted', true);
    }
}
