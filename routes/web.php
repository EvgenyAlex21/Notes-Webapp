<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PagesController;

Route::get('/', function () {
    return redirect('/notes');
});

Route::get('/notes', [PagesController::class, 'index']);
Route::get('/notes/create', [PagesController::class, 'create']);
Route::get('/notes/{id}/edit', [PagesController::class, 'edit']);
Route::get('/notes/trash', [PagesController::class, 'trash']);

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
});
