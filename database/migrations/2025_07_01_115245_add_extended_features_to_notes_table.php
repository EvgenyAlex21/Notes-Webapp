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
            // Для архива
            $table->boolean('is_archived')->default(false);
            $table->timestamp('archived_at')->nullable();
            
            // Для папок
            $table->string('folder')->nullable();
            
            // Для напоминаний
            $table->timestamp('reminder_at')->nullable();
            
            // Для форматированного текста
            $table->text('formatted_description')->nullable();
            
            // Для календаря событий
            $table->date('due_date')->nullable();
            
            // Для вида заметок (карточка, список, текст)
            $table->string('view_mode')->default('card');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn([
                'is_archived',
                'archived_at',
                'folder',
                'reminder_at',
                'formatted_description',
                'due_date',
                'view_mode'
            ]);
        });
    }
};
