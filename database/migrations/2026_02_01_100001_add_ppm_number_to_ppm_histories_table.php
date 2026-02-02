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
        Schema::table('ppm_histories', function (Blueprint $table) {
            $table->integer('ppm_number')->default(1)->after('stroke_at_ppm')
                ->comment('Which PPM number this is (1st, 2nd, 3rd, etc)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ppm_histories', function (Blueprint $table) {
            $table->dropColumn('ppm_number');
        });
    }
};
