<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('notes', 'plain_description')) {
            Schema::table('notes', function (Blueprint $table) {
                $table->text('plain_description')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('plain_description');
        });
    }
};
