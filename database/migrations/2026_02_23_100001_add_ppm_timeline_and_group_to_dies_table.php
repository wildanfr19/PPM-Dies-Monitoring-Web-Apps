<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            // PPM Timeline tracking fields (n+1 through n+4 day tracking)
            $table->timestamp('red_alerted_at')->nullable()->after('ppm_alert_status');
            $table->timestamp('ppm_started_at')->nullable()->after('red_alerted_at');
            $table->timestamp('ppm_finished_at')->nullable()->after('ppm_started_at');
            $table->timestamp('returned_to_production_at')->nullable()->after('ppm_finished_at');
            $table->integer('ppm_total_days')->nullable()->after('returned_to_production_at');
            // Group classification
            $table->string('die_group', 10)->nullable()->after('line'); // A1, A2, A3, A4
        });
    }

    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn([
                'red_alerted_at',
                'ppm_started_at',
                'ppm_finished_at',
                'returned_to_production_at',
                'ppm_total_days',
                'die_group',
            ]);
        });
    }
};
