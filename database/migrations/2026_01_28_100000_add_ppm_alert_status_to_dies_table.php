<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Menambahkan field ppm_alert_status untuk tracking status alert
     * sesuai flow PPM Dies Controlling System:
     * - orange_alerted: Orange alert sudah dikirim ke MGR/GM & MD
     * - red_alerted: Red alert sudah dikirim, menunggu PPM Processing
     * - ppm_scheduled: PPM sudah dijadwalkan oleh MTN Dies
     * - ppm_in_progress: PPM sedang dikerjakan
     * - null: tidak ada alert aktif
     */
    public function up(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            if (!Schema::hasColumn('dies', 'ppm_alert_status')) {
                $table->enum('ppm_alert_status', [
                    'orange_alerted',
                    'red_alerted',
                    'ppm_scheduled',
                    'ppm_in_progress'
                ])->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn('ppm_alert_status');
        });
    }
};
