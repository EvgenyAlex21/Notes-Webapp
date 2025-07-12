<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PagesController;

Route::get('/', function () {
    return redirect('/notes');
});

Route::get('/notes', [PagesController::class, 'index']);
Route::get('/notes/create', [PagesController::class, 'create']);
Route::get('/notes/trash', [PagesController::class, 'trash']);
Route::get('/notes/archive', [PagesController::class, 'archive']);
Route::get('/notes/calendar', [PagesController::class, 'calendar']);
Route::get('/notes/folder/{folder}', [PagesController::class, 'folder']);
Route::get('/notes/{id}/edit', [PagesController::class, 'edit']);

// API routes
use App\Http\Controllers\NoteController;

Route::prefix('api')->group(function () {
    Route::get('/notes', [NoteController::class, 'index']);
    Route::get('/notes/{note}', [NoteController::class, 'show']);
    Route::post('/notes', [NoteController::class, 'store']);
    Route::put('/notes/{note}', [NoteController::class, 'update']);
    Route::delete('/notes/{note}', [NoteController::class, 'destroy']);
    
    // Дополнительные маршруты для расширенной функциональности
    Route::post('/notes/{note}/restore', [NoteController::class, 'restore']);
    Route::delete('/notes/{note}/force', [NoteController::class, 'forceDelete']);
    Route::put('/notes/{note}/color', [NoteController::class, 'updateColor']);
    Route::post('/notes/{note}/toggle-pin', [NoteController::class, 'togglePin']);
    
    // Новые маршруты для расширенных функций
    Route::post('/notes/{note}/archive', [NoteController::class, 'archive']);
    Route::post('/notes/{note}/unarchive', [NoteController::class, 'unarchive']);
    Route::post('/notes/{note}/toggle-done', [NoteController::class, 'toggleDone']); // Быстрая отметка выполнено
    Route::post('/notes/{note}/reminder', [NoteController::class, 'setReminder']);
    Route::delete('/notes/{note}/reminder', [NoteController::class, 'removeReminder']);
    Route::put('/notes/{note}/folder', [NoteController::class, 'moveToFolder']);
    Route::put('/notes/{note}/view-mode', [NoteController::class, 'updateViewMode']);
    
    // Получение статистики и дополнительных данных
    Route::get('/folders', [NoteController::class, 'getFolders']);
    Route::get('/notes/by-date', [NoteController::class, 'getByDueDate']);
    Route::get('/stats', [NoteController::class, 'getStats']);
    

});
