<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\PagesController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\CounterController;
use App\Http\Controllers\ProfileController;

Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return redirect('/login');
    });
    
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);
    
    Route::get('/forgot-password', [PasswordResetController::class, 'showForgotPasswordForm'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetPasswordForm'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->name('password.update');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::delete('/profile/avatar', [ProfileController::class, 'removeAvatar'])->name('profile.avatar.remove');
    Route::put('/profile/preferences', [ProfileController::class, 'updatePreferences'])->name('profile.preferences.update');
    
    Route::get('/api/counts', [CounterController::class, 'getCounts']);
    Route::post('/api/cleanup-data', [CounterController::class, 'cleanupOldData']);
    
    Route::get('/api/check-username', [ProfileController::class, 'checkUsername']);
    Route::get('/api/check-email', [ProfileController::class, 'checkEmail']);
    Route::post('/api/update-theme-preference', [ProfileController::class, 'ajaxUpdateTheme']);
    
    Route::get('/notes', [PagesController::class, 'index'])->name('notes.index');
    Route::get('/notes/create', [PagesController::class, 'create']);
    Route::get('/notes/trash', [PagesController::class, 'trash']);
    Route::get('/notes/archive', [PagesController::class, 'archive']);
    Route::get('/notes/calendar', [PagesController::class, 'calendar']);
    Route::get('/notes/folder/{folder}', [PagesController::class, 'folder']);
    
    Route::get('/notes/{id}', [PagesController::class, 'show'])->name('notes.show');
    Route::get('/notes/{id}/edit', [PagesController::class, 'edit']);

    Route::post('/notes', [NoteController::class, 'store']);
    Route::match(['post', 'put'], '/notes/{note}', [NoteController::class, 'update']);
    Route::post('/notes/{note}/toggle-pin', [NoteController::class, 'togglePin']);
    Route::post('/notes/{note}/archive', [NoteController::class, 'archive']);
    Route::post('/notes/{note}/unarchive', [NoteController::class, 'unarchive']);
    Route::post('/notes/{note}/files', [NoteController::class, 'uploadFiles']);
    Route::delete('/notes/files/temp', [NoteController::class, 'deleteTempFile']);

    Route::prefix('api')->group(function () {
        Route::get('/notes', [NoteController::class, 'index']);
        Route::get('/notes/by-date', [NoteController::class, 'getByDueDate']);
        Route::get('/notes/{note}', [NoteController::class, 'show']);
        Route::post('/notes', [NoteController::class, 'store']);
        Route::put('/notes/{note}', [NoteController::class, 'update']);
        Route::delete('/notes/{note}', [NoteController::class, 'destroy']);
        Route::get('/tags', [TagController::class, 'index']);
        Route::delete('/notes', [NoteController::class, 'clearAll']);
        Route::post('/notes/{note}/trash', [NoteController::class, 'destroy']);
        Route::post('/notes/{note}/restore', [NoteController::class, 'restore']);
        Route::delete('/notes/{note}/force', [NoteController::class, 'forceDelete']);
        Route::put('/notes/{note}/color', [NoteController::class, 'updateColor']);
        Route::post('/notes/{note}/toggle-pin', [NoteController::class, 'togglePin']);
        Route::get('/reminders/check', [ReminderController::class, 'checkReminders']);
        Route::post('/reminders/{id}/done', [ReminderController::class, 'markReminderAsDone']);
        Route::post('/notes/{note}/remove-reminder', [NoteController::class, 'removeReminder']);
        Route::post('/api/notes/{note}/remove-reminder', [NoteController::class, 'removeReminder']);
        Route::get('/test/reminders', [TestController::class, 'testReminders']);
        Route::post('/test/create-reminder', [TestController::class, 'createTestReminder']);
        Route::post('/notes/{note}/archive', [NoteController::class, 'archive']);
        Route::post('/notes/{note}/unarchive', [NoteController::class, 'unarchive']);
        Route::post('/notes/{note}/toggle-done', [NoteController::class, 'toggleDone']);
        Route::post('/notes/{note}/reminder', [NoteController::class, 'setReminder']);
        Route::delete('/notes/{note}/reminder', [NoteController::class, 'removeReminder']);
        Route::put('/notes/{note}/folder', [NoteController::class, 'moveToFolder']);
        Route::put('/notes/{note}/view-mode', [NoteController::class, 'updateViewMode']);
        Route::post('/api/notes/{note}/toggle-done', [NoteController::class, 'toggleDone']);
        Route::get('/folders', [NoteController::class, 'getFolders']);
        Route::post('/folders', [FolderController::class, 'createFolder']);
        Route::post('/folders/rename', [FolderController::class, 'renameFolder']);
        Route::post('/folders/delete', [FolderController::class, 'deleteFolder']);
        Route::post('/notes/move-to-folder', [FolderController::class, 'moveNotesToFolder']);
        Route::get('/stats', [NoteController::class, 'getStats']);
        Route::get('/debug/note-files/{id}', function ($id) {
            $note = \App\Models\Note::find($id);
            if (!$note) {
                return response()->json(['error' => 'Заметка не найдена'], 404);
            }
            return response()->json([
                'note_id' => $note->id,
                'files' => $note->files,
                'files_type' => gettype($note->files),
                'has_files' => isset($note->files),
                'files_count' => is_array($note->files) ? count($note->files) : 'not an array'
            ]);
        });
        
        Route::post('/test-upload', function(Request $request) {
            \Log::info('Тестовая загрузка файлов');
            \Log::info('Все файлы в запросе: ' . json_encode($request->allFiles()));
            $result = [
                'success' => false,
                'message' => 'Нет файлов для обработки',
                'files' => []
            ];
            if ($request->hasFile('upload_files')) {
                $result['success'] = true;
                $result['message'] = 'Файлы получены';
                $files = [];
                foreach ($request->file('upload_files') as $file) {
                    if ($file->isValid()) {
                        $fileName = $file->getClientOriginalName();
                        $fileExt = $file->getClientOriginalExtension();
                        $uniqueFileName = pathinfo($fileName, PATHINFO_FILENAME) . '_' . time() . '.' . $fileExt;
                        $path = $file->storeAs('uploads', $uniqueFileName, 'public');
                        $files[] = [
                            'name' => $fileName,
                            'path' => $path,
                            'url' => asset('storage/' . $path),
                            'size' => $file->getSize()
                        ];
                        \Log::info('Файл сохранен: ' . $fileName . ' -> ' . $path);
                    } else {
                        \Log::error('Невалидный файл: ' . $file->getClientOriginalName());
                    }
                }
                $result['files'] = $files;
            } else {
                \Log::warning('Запрос не содержит файлов upload_files');
                \Log::info('Доступные поля: ' . json_encode($request->all()));
            }
            return response()->json($result);
        });
    });
});