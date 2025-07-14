<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;
use Illuminate\Support\Facades\Auth;

class PagesController extends Controller
{    
    public function index()
    {
        return view('note.index', [
            'trashMode' => false, 
            'archiveMode' => false
        ]);
    }
    
    public function trash()
    {
        return view('note.index', [
            'trashMode' => true, 
            'archiveMode' => false
        ]);
    }
    
    public function archive()
    {
        return view('note.index', [
            'trashMode' => false, 
            'archiveMode' => true
        ]);
    }
    
    public function calendar()
    {
        return view('note.calendar', [
            'calendarMode' => true
        ]);
    }
    
    public function folder($folderName)
    {
        return view('note.index', [
            'trashMode' => false, 
            'archiveMode' => false,
            'folderMode' => true,
            'folderName' => $folderName
        ]);
    }

    public function create()
    {
        return view('note.create');
    }

    public function edit($id)
    {
        $note = Note::where('id', $id)
                    ->where('user_id', Auth::id())
                    ->first();
        
        if (!$note) {
            abort(404);
        }
        
        return view('note.edit', compact('id'));
    }

    public function show($id)
    {
        $note = Note::where('id', $id)
                    ->where('user_id', Auth::id())
                    ->first();
        
        if (!$note) {
            abort(404);
        }
        
        return view('note.index', [
            'trashMode' => false, 
            'archiveMode' => false,
            'showNoteId' => $id  
        ]);
    }
}