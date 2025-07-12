<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReminderController extends Controller
{
    /**
     * Проверяет активные напоминания для текущего пользователя
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkReminders()
    {
        try {
            // Получаем заметки с напоминаниями, которые должны быть показаны
            $now = Carbon::now();
            
            // Ищем все напоминания, срок которых наступил или прошел (не более 30 минут назад)
            $startTime = $now->copy()->subMinutes(30);
            
            $notes = Note::where('is_deleted', false)
                ->whereNotNull('reminder_at')
                ->where('reminder_at', '<=', $now)
                ->where('reminder_at', '>=', $startTime)
                ->get();
            
            $reminders = [];
            
            foreach ($notes as $note) {
                $reminders[] = [
                    'id' => $note->id,
                    'note_id' => $note->id,
                    'note_name' => $note->name,
                    'description' => mb_substr(strip_tags($note->description), 0, 150) . (mb_strlen(strip_tags($note->description)) > 150 ? '...' : ''),
                    'color' => $note->color,
                    'reminder_at' => $note->reminder_at,
                    'created_at' => $note->created_at,
                ];
            }
            
            return response()->json([
                'success' => true,
                'reminders' => $reminders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при проверке напоминаний: ' . $e->getMessage(),
                'error' => $e->getTrace()
            ], 500);
        }
    }
    
    /**
     * Отмечает напоминание как выполненное (сбрасывает reminder_at)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markReminderAsDone($id)
    {
        try {
            $note = Note::findOrFail($id);
            
            // Сбрасываем reminder_at
            $note->reminder_at = null;
            $note->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Напоминание отмечено как выполненное'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при обработке напоминания: ' . $e->getMessage()
            ], 500);
        }
    }
}
