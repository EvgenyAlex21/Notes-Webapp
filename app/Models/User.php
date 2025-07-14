<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
        'theme_preference',
        'notification_preference',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'notification_preference' => 'boolean',
        ];
    }
    
    public function notes()
    {
        return $this->hasMany(Note::class);
    }
    
    public function folders()
    {
        return $this->hasMany(Folder::class);
    }
    
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar && $this->avatar !== 'default-avatar.png') {
            return asset('storage/avatars/' . $this->avatar);
        }
        return 'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="150" height="150"><circle cx="12" cy="7" r="5" fill="#adb5bd"/><path d="M22,21V20c0-4.42-3.58-8-8-8h-4c-4.42,0-8,3.58-8,8v1" fill="#adb5bd"/></svg>');
    }
    
    public function getNotesCountAttribute()
    {
        return $this->notes()->count();
    }
    
    public function getFoldersCountAttribute()
    {
        return $this->folders()->count();
    }
}