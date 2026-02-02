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
            if (!Schema::hasColumn('dies', 'model')) {
                $table->string('model', 50)->nullable()->after('part_name');
            }

            // Add 'lot_size' field (dari Excel: 600, 5000)
            if (!Schema::hasColumn('dies', 'lot_size')) {
                $table->integer('lot_size')->default(600)->after('customer_id');
            }

            if (!Schema::hasColumn('dies', 'ppm_standard')) {
                $table->integer('ppm_standard')->default(6000)->after('lot_size');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn(['model', 'lot_size', 'ppm_standard']);
        });
    }
};
