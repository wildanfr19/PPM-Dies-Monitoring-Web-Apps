<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add new columns
        Schema::table('production_logs', function (Blueprint $table) {
            $table->string('model', 20)->nullable()->after('die_id');  // YHA, KS, 2JX, Y4L, etc.
            $table->tinyInteger('qty_die')->default(1)->after('line'); // 1, 2, 3, 4, 5
        });

        // Modify running_process to include Blanking
        DB::statement("ALTER TABLE production_logs MODIFY COLUMN running_process ENUM('Auto', 'Manual', 'Blanking') DEFAULT 'Auto'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('production_logs', function (Blueprint $table) {
            $table->dropColumn(['model', 'qty_die']);
        });

        DB::statement("ALTER TABLE production_logs MODIFY COLUMN running_process ENUM('Auto', 'Manual') DEFAULT 'Auto'");
    }
};
