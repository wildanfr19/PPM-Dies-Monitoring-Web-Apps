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
            $table->date('ppm_scheduled_date')->nullable()->after('ppm_alert_status');
            $table->string('ppm_scheduled_by', 100)->nullable()->after('ppm_scheduled_date');
            $table->datetime('schedule_approved_at')->nullable()->after('ppm_scheduled_by');
            $table->string('schedule_approved_by', 100)->nullable()->after('schedule_approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn([
                'ppm_scheduled_date',
                'ppm_scheduled_by',
                'schedule_approved_at',
                'schedule_approved_by',
            ]);
        });
    }
};
