<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $query = Note::query();
        
        // Фильтр по статусу удаления
        if ($request->has('trash')) {
            $query->where('is_deleted', true);
        } else {
            $query->where('is_deleted', false);
        }
        
        // Сортировка: сначала закрепленные
        $query->orderBy('is_pinned', 'desc')
              ->orderBy('updated_at', 'desc');
              
        return response()->json(['data' => $query->get()]);
    }

    public function show(Note $note)
    {
        return response()->json(['data' => $note]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'color' => 'nullable|string',
            'is_pinned' => 'nullable|boolean',
            'tags' => 'nullable|string',
        ]);
        
        $data['done'] = false; // По умолчанию задача не выполнена
        $data['is_deleted'] = false;
        
        return response()->json(['data' => Note::create($data)]);
    }

    public function update(Request $request, Note $note)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'done' => 'boolean',
            'color' => 'nullable|string',
            'is_pinned' => 'nullable|boolean',
            'tags' => 'nullable|string',
        ]);
        
        $note->update($data);
        
        return response()->json(['data' => $note]);
    }

    public function destroy(Note $note)
    {
        // Soft delete - перемещение в корзину
        $note->update([
            'is_deleted' => true,
            'deleted_at' => now()
        ]);
        
        return response()->json(['success' => true]);
    }
    
    // Восстановление заметки из корзины
    public function restore(Note $note)
    {
        $note->update([
            'is_deleted' => false,
            'deleted_at' => null
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Окончательное удаление заметки
    public function forceDelete(Note $note)
    {
        $note->delete();
        
        return response()->json(['success' => true]);
    }
    
    // Изменение цвета заметки
    public function updateColor(Request $request, Note $note)
    {
        $data = $request->validate([
            'color' => 'required|string',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Переключение состояния закрепления
    public function togglePin(Note $note)
    {
        $note->update([
            'is_pinned' => !$note->is_pinned
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Архивация заметки
    public function archive(Note $note)
    {
        $note->update([
            'is_archived' => true,
            'archived_at' => now()
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Восстановление из архива
    public function unarchive(Note $note)
    {
        $note->update([
            'is_archived' => false,
            'archived_at' => null
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Установка напоминания
    public function setReminder(Request $request, Note $note)
    {
        $data = $request->validate([
            'reminder_at' => 'required|date',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Отмена напоминания
    public function removeReminder(Note $note)
    {
        $note->update([
            'reminder_at' => null
        ]);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Перемещение заметки в папку
    public function moveToFolder(Request $request, Note $note)
    {
        $data = $request->validate([
            'folder' => 'nullable|string',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Получение списка всех папок
    public function getFolders()
    {
        $folders = Note::where('is_deleted', false)
                      ->whereNotNull('folder')
                      ->select('folder')
                      ->distinct()
                      ->get()
                      ->pluck('folder');
        
        return response()->json(['data' => $folders]);
    }
    
    // Изменение режима отображения заметки
    public function updateViewMode(Request $request, Note $note)
    {
        $data = $request->validate([
            'view_mode' => 'required|string|in:card,list,text',
        ]);
        
        $note->update($data);
        
        return response()->json(['success' => true, 'data' => $note]);
    }
    
    // Получение заметок для заданной даты
    public function getByDueDate(Request $request)
    {
        $date = $request->validate([
            'date' => 'required|date_format:Y-m-d',
        ]);
        
        $notes = Note::where('due_date', $date['date'])
                   ->where('is_deleted', false)
                   ->orderBy('is_pinned', 'desc')
                   ->orderBy('updated_at', 'desc')
                   ->get();
        
        return response()->json(['data' => $notes]);
    }
    
    // Получение статистики
    public function getStats()
    {
        $stats = [
            'total' => Note::where('is_deleted', false)->count(),
            'active' => Note::where('is_deleted', false)->where('is_archived', false)->where('done', false)->count(),
            'completed' => Note::where('is_deleted', false)->where('done', true)->count(),
            'archived' => Note::where('is_archived', true)->where('is_deleted', false)->count(),
            'trashed' => Note::where('is_deleted', true)->count(),
            'pinned' => Note::where('is_pinned', true)->where('is_deleted', false)->count(),
            'with_reminders' => Note::where('is_deleted', false)->whereNotNull('reminder_at')->count(),
        ];
        
        return response()->json(['data' => $stats]);
    }
}
