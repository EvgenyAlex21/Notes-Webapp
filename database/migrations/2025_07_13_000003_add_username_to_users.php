<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->after('name')->nullable()->unique();
        });

        $users = \App\Models\User::all();
        foreach ($users as $user) {
            $username = explode('@', $user->email)[0];
            $counter = 1;
            $originalUsername = $username;
            while (\App\Models\User::where('username', $username)->where('id', '!=', $user->id)->exists()) {
                $username = $originalUsername . $counter;
                $counter++;
            }
            $user->username = $username;
            $user->save();
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }
};