<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->boolean('is_4lot_check')->default(false)->after('die_group');
        });
    }

    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn('is_4lot_check');
        });
    }
};
