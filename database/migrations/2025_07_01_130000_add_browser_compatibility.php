<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBrowserCompatibility extends Migration
{
    /**
     * @return void
     */
    public function up()
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->text('plain_description')->nullable()->after('description');
            
            $table->json('compatibility_settings')->nullable()->after('view_mode');
            
            $table->json('version_history')->nullable()->after('compatibility_settings');
            
            $table->index('name');
            $table->index('tags');
            $table->index('folder');
            $table->index('due_date');
            $table->index('reminder_at');
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn([
                'plain_description',
                'compatibility_settings',
                'version_history'
            ]);
            
            $table->dropIndex(['name']);
            $table->dropIndex(['tags']);
            $table->dropIndex(['folder']);
            $table->dropIndex(['due_date']);
            $table->dropIndex(['reminder_at']);
        });
    }
}