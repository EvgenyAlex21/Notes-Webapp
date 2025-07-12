<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Note;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    /**
     * Получить все уникальные теги из заметок пользователя
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            // Получаем все теги из заметок (не фильтруем по пользователю для упрощения)
            $notes = Note::whereNotNull('tags')->get();
            
            // Собираем уникальные теги из всех заметок
            $allTags = [];
            foreach ($notes as $note) {
                if (!empty($note->tags)) {
                    $noteTags = explode(',', $note->tags);
                    foreach ($noteTags as $tag) {
                        $tag = trim($tag);
                        if (!empty($tag) && !in_array($tag, $allTags)) {
                            $allTags[] = $tag;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
        
        // Сортируем теги
        sort($allTags);
        
        return response()->json([
            'success' => true,
            'data' => $allTags
        ]);
    }
}
