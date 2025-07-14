<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('notes')->truncate();
        
        if (Schema::hasTable('folders')) {
            DB::table('folders')->truncate();
        }

        Schema::table('notes', function (Blueprint $table) {
            if (!Schema::hasColumn('notes', 'user_id')) {
                $table->foreignId('user_id')->after('id')->nullable()->constrained()->onDelete('cascade');
            }
        });

        Schema::table('folders', function (Blueprint $table) {
            if (!Schema::hasColumn('folders', 'user_id')) {
                $table->foreignId('user_id')->after('id')->nullable()->constrained()->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
    }
};