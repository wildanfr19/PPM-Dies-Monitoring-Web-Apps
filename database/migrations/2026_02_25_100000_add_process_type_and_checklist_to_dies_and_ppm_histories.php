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
        // Add process_type to dies table
        Schema::table('dies', function (Blueprint $table) {
            $table->string('process_type', 30)->nullable()->after('line')
                ->comment('Process type: blank_pierce, draw, embos, trim, form, flang, restrike, pierce, cam_pierce');
        });

        // Add checklist_results to ppm_histories table
        Schema::table('ppm_histories', function (Blueprint $table) {
            $table->string('process_type', 30)->nullable()->after('ppm_number')
                ->comment('Process type used during this PPM inspection');
            $table->json('checklist_results')->nullable()->after('process_type')
                ->comment('JSON array of checklist inspection results');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn('process_type');
        });

        Schema::table('ppm_histories', function (Blueprint $table) {
            $table->dropColumn(['process_type', 'checklist_results']);
        });
    }
};
