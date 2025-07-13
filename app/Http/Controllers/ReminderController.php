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
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkReminders()
    {
        try {
            \Log::info('=== ПРОВЕРКА ЛОГИРОВАНИЯ ===', ['datetime' => now()->toDateTimeString()]);

            $allNotes = Note::where('is_deleted', false)
                ->where('is_archived', false)
                ->whereNotNull('reminder_at')
                ->orderBy('reminder_at', 'desc')
                ->get();
            \Log::info('[REMINDER][DEBUG] Все заметки с reminder_at:', [
                'count' => $allNotes->count(),
                'reminders' => $allNotes->map(function($n) { return [
                    'id' => $n->id,
                    'reminder_at' => $n->reminder_at,
                    'name' => $n->name
                ]; })->toArray()
            ]);
            $nowLocal = Carbon::now(config('app.timezone', 'Europe/Moscow'));
            $startTimeLocal = $nowLocal->copy()->subHours(24);

            \Log::info('[REMINDER][DEBUG] Проверка напоминаний', [
                'now_local' => $nowLocal->toDateTimeString(),
                'startTime_local' => $startTimeLocal->toDateTimeString()
            ]);

            $notes = Note::where('is_deleted', false)
                ->where('is_archived', false)
                ->whereNotNull('reminder_at')
                ->where('reminder_at', '<=', $nowLocal)
                ->where('reminder_at', '>=', $startTimeLocal)
                ->orderBy('reminder_at', 'desc')
                ->get();

            \Log::info('[REMINDER][DEBUG] Найдено напоминаний', [
                'count' => $notes->count(),
                'ids' => $notes->pluck('id')->toArray(),
                'reminder_at' => $notes->pluck('reminder_at')->toArray()
            ]);

            foreach ($notes as $note) {
                \Log::info('[REMINDER][DEBUG] Сравнение времени', [
                    'note_id' => $note->id,
                    'reminder_at' => $note->reminder_at,
                    'reminder_at_local' => Carbon::parse($note->reminder_at)->setTimezone(config('app.timezone', 'Europe/Moscow'))->toDateTimeString(),
                    'now_local' => $nowLocal->toDateTimeString(),
                ]);
            }

            $reminders = [];
            foreach ($notes as $note) {
                $reminderTime = Carbon::parse($note->reminder_at);
                $isOverdue = $reminderTime->isPast();
                $reminders[] = [
                    'id' => $note->id,
                    'note_id' => $note->id,
                    'note_name' => $note->name,
                    'description' => mb_substr(strip_tags($note->description), 0, 150) . (mb_strlen(strip_tags($note->description)) > 150 ? '...' : ''),
                    'color' => $note->color,
                    'reminder_at' => $note->reminder_at,
                    'is_overdue' => $isOverdue,
                    'time_diff' => $reminderTime->diffForHumans($nowLocal),
                    'created_at' => $note->created_at,
                ];
            }

            $allReminders = Note::where('is_deleted', false)
                ->where('is_archived', false)
                ->whereNotNull('reminder_at')
                ->orderBy('reminder_at', 'desc')
                ->get();

            \Log::info('[REMINDER][DEBUG] Все напоминания в базе:', [
                'count' => $allReminders->count(),
                'reminders' => $allReminders->map(function($n) { return [
                    'id' => $n->id,
                    'reminder_at' => $n->reminder_at,
                    'name' => $n->name
                ]; })->toArray()
            ]);

            return response()->json([
                'success' => true,
                'reminders' => $reminders
            ]);
        } catch (\Exception $e) {
            \Log::error('[REMINDER] Ошибка: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при проверке напоминаний: ' . $e->getMessage(),
                'error' => $e->getTrace()
            ], 500);
        }
    }
    
    /**
     * Отмечает напоминание как выполненное (сбрасывает reminder_at)
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markReminderAsDone($id)
    {
        try {
            $note = Note::findOrFail($id);
            
            \Log::info('Отмечаем напоминание как выполненное для заметки: ' . $note->name);
            
            $note->reminder_at = null;
            $note->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Напоминание отмечено как выполненное',
                'note' => $note
            ]);
        } catch (\Exception $e) {
            \Log::error('Ошибка при обработке напоминания: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при обработке напоминания: ' . $e->getMessage()
            ], 500);
        }
    }
}
