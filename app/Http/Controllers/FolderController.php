<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FolderController extends Controller
{
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function renameFolder(Request $request)
    {
        $validatedData = $request->validate([
            'old_folder' => 'required|string',
            'new_folder' => 'required|string|different:old_folder'
        ]);
        
        $newFolderExists = Folder::where('name', $validatedData['new_folder'])
                                 ->where('user_id', Auth::id())
                                 ->exists();
                              
        $oldNewFolderExists = Note::where('folder', $validatedData['new_folder'])
                                 ->where('is_deleted', false)
                                 ->where('user_id', Auth::id())
                                 ->exists();
        
        if ($newFolderExists || $oldNewFolderExists) {
            $deletedFolder = Folder::where('name', $validatedData['new_folder'])
                                  ->where('is_deleted', true)
                                  ->where('user_id', Auth::id())
                                  ->first();
                
            if ($deletedFolder) {
                $deletedFolder->delete();
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Папка с таким именем уже существует'
                ], 400);
            }
        }
        
        if (trim($validatedData['new_folder']) === '') {
            return response()->json([
                'success' => false,
                'message' => 'Имя папки не может быть пустым'
            ], 400);
        }
        
        if (strlen($validatedData['new_folder']) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Имя папки должно содержать не менее 2 символов'
            ], 400);
        }
        
        try {
            $folder = Folder::where('name', $validatedData['old_folder'])
                      ->where('is_deleted', false)
                      ->where('user_id', Auth::id())
                      ->first();
            
            if ($folder) {
                $folder->name = $validatedData['new_folder'];
                $folder->save();
            } else {
                $folder = new Folder();
                $folder->name = $validatedData['new_folder'];
                $folder->is_deleted = false;
                $folder->user_id = Auth::id();
                $folder->save();
            }
            
            $updatedCount = Note::where('folder', $validatedData['old_folder'])
                              ->where('is_deleted', false)
                              ->where('user_id', Auth::id())
                              ->update(['folder' => $validatedData['new_folder']]);
            
            return response()->json([
                'success' => true,
                'message' => 'Папка успешно переименована',
                'data' => [
                    'count' => $updatedCount,
                    'folder' => $validatedData['new_folder']
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Ошибка при переименовании папки: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при переименовании папки',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteFolder(Request $request)
    {
        $validatedData = $request->validate([
            'folder' => 'required|string',
        ]);
        
        try {
            $folder = Folder::where('name', $validatedData['folder'])
                      ->where('is_deleted', false)
                      ->where('user_id', Auth::id())
                      ->first();
            
            $oldFolderExists = Note::where('folder', $validatedData['folder'])
                             ->where('is_deleted', false)
                             ->where('user_id', Auth::id())
                             ->exists();
            
            if (!$folder && !$oldFolderExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Папка не найдена'
                ], 404);
            }
            
            if ($folder) {
                $folder->is_deleted = true;
                $folder->save();
            }

            $updatedCount = Note::where('folder', $validatedData['folder'])
                              ->where('is_deleted', false)
                              ->where('user_id', Auth::id())
                              ->update(['folder' => null]);
            
            return response()->json([
                'success' => true,
                'message' => 'Папка успешно удалена',
                'data' => [
                    'count' => $updatedCount,
                    'folder' => $validatedData['folder']
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Ошибка при удалении папки: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении папки',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function moveNotesToFolder(Request $request)
    {
        \Log::info('Запрос на перемещение заметок в папку', ['request' => $request->all()]);
        
        $validatedData = $request->validate([
            'note_ids' => 'required|array',
            'note_ids.*' => 'required|integer|exists:notes,id',
            'folder' => 'nullable|string'
        ]);
        
        $noteIds = $validatedData['note_ids'];
        $folder = $validatedData['folder'] ?? null;
        
        \Log::info('Перемещение заметок в папку', [
            'note_ids' => $noteIds,
            'folder' => $folder,
            'count' => count($noteIds)
        ]);
        
        try {
            if ($folder) {
                $folderExists = Folder::where('name', $folder)
                                     ->where('user_id', Auth::id())
                                     ->exists();
                
                if (!$folderExists) {
                    \Log::info('Создаем новую папку', ['folder' => $folder]);
                    $newFolder = new Folder();
                    $newFolder->name = $folder;
                    $newFolder->is_deleted = false;
                    $newFolder->user_id = Auth::id();
                    $newFolder->save();
                }
            }
            
            $folder = $folder === '' ? null : (string)$folder;
            $updatedCount = Note::whereIn('id', $noteIds)
                            ->where('is_deleted', false)
                            ->where('user_id', Auth::id())
                            ->update(['folder' => $folder]);
            
            \Log::info('Обновлено заметок', ['count' => $updatedCount, 'folder_type' => gettype($folder)]);
            
            return response()->json([
                'success' => true,
                'message' => 'Заметки успешно перемещены',
                'data' => [
                    'count' => $updatedCount,
                    'folder' => $folder
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Ошибка при перемещении заметок в папку', [
                'error' => $e->getMessage(),
                'note_ids' => $noteIds,
                'folder' => $folder
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при перемещении заметок: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createFolder(Request $request)
    {
        $validatedData = $request->validate([
            'folder' => 'required|string|max:255',
        ]);
        
        try {
            $folderExists = Folder::where('name', $validatedData['folder'])
                                 ->where('user_id', Auth::id())
                                 ->exists();
            
            $oldFolderExists = Note::where('folder', $validatedData['folder'])
                             ->where('is_deleted', false)
                             ->where('user_id', Auth::id())
                             ->exists();
            
            if ($folderExists || $oldFolderExists) {
                $deletedFolder = Folder::where('name', $validatedData['folder'])
                                      ->where('is_deleted', true)
                                      ->where('user_id', Auth::id())
                                      ->first();
                
                if ($deletedFolder) {
                    $deletedFolder->is_deleted = false;
                    $deletedFolder->save();
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Папка успешно восстановлена',
                        'data' => [
                            'folder' => $deletedFolder->name,
                            'id' => $deletedFolder->id
                        ]
                    ]);
                }
                
                return response()->json([
                    'success' => false,
                    'message' => 'Папка с таким именем уже существует'
                ], 400);
            }
            
            if (trim($validatedData['folder']) === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Имя папки не может быть пустым'
                ], 400);
            }
            
            if (strlen($validatedData['folder']) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Имя папки должно содержать не менее 2 символов'
                ], 400);
            }
            
            $folder = new Folder();
            $folder->name = $validatedData['folder'];
            $folder->is_deleted = false;
            $folder->user_id = Auth::id();
            $folder->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Папка успешно создана',
                'data' => [
                    'folder' => $folder->name,
                    'id' => $folder->id
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Ошибка при создании папки: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при создании папки',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}