<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->default('default-avatar.png')->after('username');
            $table->string('theme_preference')->default('auto')->after('avatar');
            $table->boolean('notification_preference')->default(true)->after('theme_preference');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'theme_preference', 'notification_preference']);
        });
    }
};