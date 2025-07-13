<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Note;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    /**
     * Получение уникальных тегов из заметок
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $notes = Note::whereNotNull('tags')->get();
            
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
        
        sort($allTags);
        
        return response()->json([
            'success' => true,
            'data' => $allTags
        ]);
    }
}