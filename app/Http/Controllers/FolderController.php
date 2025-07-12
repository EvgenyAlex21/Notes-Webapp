<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Folder;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    /**
     * Переименование папки
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function renameFolder(Request $request)
    {
        $validatedData = $request->validate([
            'old_folder' => 'required|string',
            'new_folder' => 'required|string|different:old_folder'
        ]);
        
        // Проверяем существование новой папки в таблице folders, включая удаленные
        $newFolderExists = Folder::where('name', $validatedData['new_folder'])->exists();
                              
        // Проверяем существование в старой системе
        $oldNewFolderExists = Note::where('folder', $validatedData['new_folder'])
                               ->where('is_deleted', false)
                               ->exists();
        
        if ($newFolderExists || $oldNewFolderExists) {
            // Проверим, может быть это папка была удалена
            $deletedFolder = Folder::where('name', $validatedData['new_folder'])
                            ->where('is_deleted', true)
                            ->first();
                
            if ($deletedFolder) {
                // Если папка была удалена, сначала удалим её полностью из БД
                $deletedFolder->delete();
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Папка с таким именем уже существует'
                ], 400);
            }
        }
        
        // Проверяем дополнительные правила для имени папки
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
            // Обновляем запись в таблице folders
            $folder = Folder::where('name', $validatedData['old_folder'])
                      ->where('is_deleted', false)
                      ->first();
            
            if ($folder) {
                $folder->name = $validatedData['new_folder'];
                $folder->save();
            } else {
                // Если папки нет в новой таблице, создаем ее
                $folder = new Folder();
                $folder->name = $validatedData['new_folder'];
                $folder->is_deleted = false;
                $folder->save();
            }
            
            // Обновляем все заметки в этой папке
            $updatedCount = Note::where('folder', $validatedData['old_folder'])
                              ->where('is_deleted', false)
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
     * Удаление папки (заметки остаются, но без привязки к папке)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteFolder(Request $request)
    {
        $validatedData = $request->validate([
            'folder' => 'required|string',
        ]);
        
        try {
            // Проверяем существование папки в новой таблице
            $folder = Folder::where('name', $validatedData['folder'])
                      ->where('is_deleted', false)
                      ->first();
            
            // Проверяем существование папки в старой системе
            $oldFolderExists = Note::where('folder', $validatedData['folder'])
                             ->where('is_deleted', false)
                             ->exists();
            
            if (!$folder && !$oldFolderExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Папка не найдена'
                ], 404);
            }
            
            // Если папка существует в новой таблице, помечаем ее как удаленную
            if ($folder) {
                $folder->is_deleted = true;
                $folder->save();
            }
            
            // Обновляем все заметки в этой папке (удаляем привязку к папке)
            $updatedCount = Note::where('folder', $validatedData['folder'])
                              ->where('is_deleted', false)
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
     * Перемещение нескольких заметок в папку
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function moveNotesToFolder(Request $request)
    {
        $validatedData = $request->validate([
            'note_ids' => 'required|array',
            'note_ids.*' => 'required|integer|exists:notes,id',
            'folder' => 'nullable|string'
        ]);
        
        $noteIds = $validatedData['note_ids'];
        $folder = $validatedData['folder'] ?? null;
        
        // Обновляем все указанные заметки
        $updatedCount = Note::whereIn('id', $noteIds)
                          ->where('is_deleted', false)
                          ->update(['folder' => $folder]);
        
        return response()->json([
            'success' => true,
            'message' => 'Заметки успешно перемещены',
            'data' => [
                'count' => $updatedCount
            ]
        ]);
    }
    
    /**
     * Создание новой папки в базе данных
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createFolder(Request $request)
    {
        $validatedData = $request->validate([
            'folder' => 'required|string|max:255',
        ]);
        
        try {
            // Проверяем, существует ли уже такая папка в новой таблице folders, включая удаленные
            $folderExists = Folder::where('name', $validatedData['folder'])->exists();
            
            // Также проверяем существование в старой системе (на случай миграции)
            $oldFolderExists = Note::where('folder', $validatedData['folder'])
                             ->where('is_deleted', false)
                             ->exists();
            
            if ($folderExists || $oldFolderExists) {
                // Проверим, может быть это папка была удалена
                $deletedFolder = Folder::where('name', $validatedData['folder'])
                                ->where('is_deleted', true)
                                ->first();
                
                if ($deletedFolder) {
                    // Если папка была удалена, восстановим её
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
            
            // Проверяем дополнительные правила для имени папки
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
            
            // Создаем запись о папке в новой таблице
            $folder = new Folder();
            $folder->name = $validatedData['folder'];
            $folder->is_deleted = false;
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
