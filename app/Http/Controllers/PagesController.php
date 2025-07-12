<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PagesController extends Controller
{
    public function index()
    {
        return view('note.index');
    }

    public function create()
    {
        return view('note.create');
    }

    public function edit($id)
    {
        return view('note.edit', compact('id'));
    }
}
