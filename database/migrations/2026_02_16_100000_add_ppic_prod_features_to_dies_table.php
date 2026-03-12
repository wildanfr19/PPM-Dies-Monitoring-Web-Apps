<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds PPIC "Last Date of LOT" and PROD "Transfer Dies" features per flowchart
     */
    public function up(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            // PPIC Feature: Last Date of LOT
            $table->date('last_lot_date')->nullable()->after('ppm_alert_status');
            $table->string('last_lot_date_set_by', 100)->nullable()->after('last_lot_date');

            // PROD Feature: Transfer Dies Location
            $table->timestamp('transferred_at')->nullable()->after('last_lot_date_set_by');
            $table->string('transferred_by', 100)->nullable()->after('transferred_at');
            $table->string('transfer_from_location', 100)->nullable()->after('transferred_by');
            $table->string('transfer_to_location', 100)->nullable()->after('transfer_from_location');
        });

        // Update ppm_alert_status enum to include new statuses
        // Drop the old enum constraint and recreate
        DB::statement("ALTER TABLE dies MODIFY COLUMN ppm_alert_status VARCHAR(50) NULL DEFAULT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn([
                'last_lot_date',
                'last_lot_date_set_by',
                'transferred_at',
                'transferred_by',
                'transfer_from_location',
                'transfer_to_location',
            ]);
        });
    }
};
