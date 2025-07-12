<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->boolean('is_archived')->default(false);
            $table->timestamp('archived_at')->nullable();
            
            $table->string('folder')->nullable();
            
            $table->timestamp('reminder_at')->nullable();
            
            $table->text('formatted_description')->nullable();
            
            $table->date('due_date')->nullable();
            
            $table->string('view_mode')->default('card');
        });
    }

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