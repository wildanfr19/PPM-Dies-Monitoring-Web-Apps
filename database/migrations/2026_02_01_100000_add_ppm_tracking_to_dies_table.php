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
        Schema::table('dies', function (Blueprint $table) {
            // Track how many PPMs have been completed for this die
            // PPM is required every 4 lots, so we need to track this
            $table->integer('ppm_count')->default(0)->after('accumulation_stroke');

            // Stroke at last PPM - to calculate progress since last PPM
            $table->integer('stroke_at_last_ppm')->default(0)->after('ppm_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn(['ppm_count', 'stroke_at_last_ppm']);
        });
    }
};
