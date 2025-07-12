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
        'due_date' => 'datetime',
        'files' => 'array',
        'compatibility_settings' => 'array',
        'version_history' => 'array',
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
    
    /**
     * Получить заметки с напоминаниями
     */
    public static function withReminders()
    {
        return self::where('is_deleted', false)
                   ->whereNotNull('reminder_at');
    }
    
    /**
     * Получить заметки по папке
     */
    public static function byFolder($folder)
    {
        return self::where('is_deleted', false)
                   ->where('folder', $folder);
    }
    
    /**
     * Получить заметки по тегу
     */
    public static function byTag($tag)
    {
        return self::where('is_deleted', false)
                   ->where('tags', 'like', "%$tag%");
    }
    
    /**
     * Метод для добавления версии в историю
     */
    public function addVersion()
    {
        $history = $this->version_history ?? [];
        
        $history[] = [
            'version' => count($history) + 1,
            'timestamp' => now()->format('Y-m-d H:i:s'),
            'description' => $this->description,
            'name' => $this->name,
            'color' => $this->color,
            'tags' => $this->tags
        ];
        
        // Оставляем максимум 10 последних версий
        if (count($history) > 10) {
            $history = array_slice($history, -10);
        }
        
        $this->version_history = $history;
        return $this;
    }
    
    /**
     * Метод для генерации простого текста из HTML-описания
     */
    public function generatePlainDescription()
    {
        // Временно отключим эту функцию, пока не добавим колонку plain_description в БД
        return $this;
    }
    
    /**
     * Переопределяем метод save для автоматического обновления версий
     */
    public function save(array $options = [])
    {
        // Если это не новая запись и были изменены важные поля, сохраняем версию
        if (!$this->isNewRecord() && 
            ($this->isDirty('name') || $this->isDirty('description') || $this->isDirty('tags'))) {
            $this->addVersion();
        }
        
        return parent::save($options);
    }
    
    /**
     * Проверка на новую запись
     */
    public function isNewRecord()
    {
        return $this->id === null;
    }
}
