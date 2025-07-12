<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->string('color')->default('default'); // Цвет для приоритета заметки
            $table->boolean('is_deleted')->default(false); // Признак нахождения заметки в корзине
            $table->timestamp('deleted_at')->nullable(); // Время удаления (для возможности восстановления)
            $table->boolean('is_pinned')->default(false); // Признак закрепления заметки наверху списка
            $table->string('tags')->nullable(); // Теги для категоризации заметок
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn(['color', 'is_deleted', 'deleted_at', 'is_pinned', 'tags']);
        });
    }
};
