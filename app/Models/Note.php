<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Note extends Model
{
    protected $guarded = false;
    protected $table = 'notes';
    
    protected $casts = [
        'done' => 'boolean',
        'is_pinned' => 'boolean',
        'is_deleted' => 'boolean',
        'is_archived' => 'boolean',
        'deleted_at' => 'datetime',
        'archived_at' => 'datetime',
        'reminder_at' => 'datetime',
        'due_date' => 'datetime',
        'files' => 'json',
        'compatibility_settings' => 'array',
        'version_history' => 'array',
    ];
    
    public static function active()
    {
        return self::where('is_deleted', false)
                   ->where('is_archived', false);
    }
    
    public static function archived()
    {
        return self::where('is_archived', true)
                   ->where('is_deleted', false);
    }
    
    public static function trashed()
    {
        return self::where('is_deleted', true);
    }
    
    public static function withReminders()
    {
        return self::where('is_deleted', false)
                   ->whereNotNull('reminder_at');
    }
    
    public static function byFolder($folder)
    {
        return self::where('is_deleted', false)
                   ->where('folder', $folder);
    }
    
    public static function byTag($tag)
    {
        return self::where('is_deleted', false)
                   ->where('tags', 'like', "%$tag%");
    }
    
    public function addVersion()
    {
        if (!Schema::hasColumn('notes', 'version_history')) {
            return $this;
        }
        
        $history = $this->version_history ?? [];
        
        $history[] = [
            'version' => count($history) + 1,
            'timestamp' => now()->format('Y-m-d H:i:s'),
            'description' => $this->description,
            'name' => $this->name,
            'color' => $this->color,
            'tags' => $this->tags
        ];
        
        if (count($history) > 10) {
            $history = array_slice($history, -10);
        }
        
        $this->version_history = $history;
        return $this;
    }
    
    public function generatePlainDescription()
    {
        return $this;
    }

    public function save(array $options = [])
    {
        if (!$this->isNewRecord() && 
            ($this->isDirty('name') || $this->isDirty('description') || $this->isDirty('tags'))) {
            $this->addVersion();
        }
        
        return parent::save($options);
    }
    
    public function isNewRecord()
    {
        return $this->id === null;
    }
}
