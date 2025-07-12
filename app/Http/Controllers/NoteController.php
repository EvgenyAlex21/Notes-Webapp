<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;

class NoteController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Note::all()]);
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
        ]);
        
        $data['done'] = false; // По умолчанию задача не выполнена
        
        return response()->json(['data' => Note::create($data)]);
    }

    public function update(Request $request, Note $note)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'done' => 'boolean',
        ]);
        
        $note->update($data);
        
        return response()->json(['data' => $note]);
    }

    public function destroy(Note $note)
    {
        $note->delete();
        
        return response()->json(['success' => true]);
    }
}
