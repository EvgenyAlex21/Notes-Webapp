<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;
use App\Models\Folder;
use Illuminate\Support\Facades\Auth;

class CounterController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCounts()
    {
        if (!Auth::check()) {
            return response()->json([
                'error' => 'Пользователь не авторизован'
            ], 401);
        }
        
        $userId = Auth::id();
        
        $totalCount = Note::where('user_id', $userId)->count();
        $activeCount = Note::where('user_id', $userId)
                         ->where('is_deleted', false)
                         ->where('is_archived', false)
                         ->count();
        $doneCount = Note::where('user_id', $userId)
                         ->where('is_deleted', false)
                         ->where('done', true)
                         ->count();
        $archivedCount = Note::where('user_id', $userId)
                         ->where('is_archived', true)
                         ->where('is_deleted', false)
                         ->count();
        $trashCount = Note::where('user_id', $userId)
                         ->where('is_deleted', true)
                         ->count();
        $pinnedCount = Note::where('user_id', $userId)
                         ->where('is_deleted', false)
                         ->where('is_pinned', true)
                         ->count();
                     
        return response()->json([
            'total' => $totalCount,
            'active' => $activeCount,
            'done' => $doneCount,
            'archived' => $archivedCount,
            'trash' => $trashCount,
            'pinned' => $pinnedCount
        ]);
    }
    
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function cleanupOldData()
    {
        if (!Auth::check() || Auth::id() !== 1) {
            return response()->json([
                'error' => 'Недостаточно прав'
            ], 403);
        }
        
        $notesDeleted = Note::whereNull('user_id')->delete();
        
        $foldersDeleted = Folder::whereNull('user_id')->delete();
        
        return response()->json([
            'success' => true,
            'notes_deleted' => $notesDeleted,
            'folders_deleted' => $foldersDeleted,
            'message' => 'Старые данные успешно удалены'
        ]);
    }
}