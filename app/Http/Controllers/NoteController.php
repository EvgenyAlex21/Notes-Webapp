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
}
