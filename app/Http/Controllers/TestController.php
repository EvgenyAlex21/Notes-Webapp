<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    /**
     * Создает тестовое напоминание для демонстрации
     * Создает напоминание на текущий момент + указанное количество секунд
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createTestReminder(Request $request)
    {
        try {
            // Проверяем, есть ли заметки в системе
            $note = Note::where('is_deleted', false)->first();
            
            if (!$note) {
                // Если нет заметок, создаем новую
                $note = new Note();
                $note->name = "Тестовая заметка с напоминанием";
                $note->description = "<p>Это тестовая заметка для проверки системы напоминаний.</p>";
                $note->color = "blue";
                $note->save();
            }
            
            // Получаем количество секунд, через которое сработает напоминание
            $seconds = $request->input('seconds', 10);
            
            // Устанавливаем напоминание
            $note->reminder_at = Carbon::now()->addSeconds($seconds);
            $note->save();
            
            return response()->json([
                'success' => true,
                'message' => "Напоминание будет активировано через {$seconds} секунд",
                'note_id' => $note->id,
                'reminder_at' => $note->reminder_at
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при создании тестового напоминания: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Отображает страницу для тестирования системы напоминаний
     *
     * @return \Illuminate\View\View
     */
    public function testReminders()
    {
        $notes = Note::whereNotNull('reminder_at')
            ->where('is_deleted', false)
            ->orderBy('reminder_at', 'desc')
            ->limit(5)
            ->get();
            
        return view('test.reminders', [
            'notes' => $notes
        ]);
    }
}
