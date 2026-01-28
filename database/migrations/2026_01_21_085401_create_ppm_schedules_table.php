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
          Schema::create('ppm_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('die_id')
                  ->constrained('dies')
                  ->onDelete('cascade');
            $table->integer('year');                    // 2025
            $table->tinyInteger('month');               // 1-12
            $table->tinyInteger('week');                // 1-4 (I, II, III, IV)

            // Forecast & Planning
            $table->integer('forecast_stroke')->nullable();      // Predicted stroke for this period
            $table->tinyInteger('plan_week')->nullable();        // Planned week for PPM (1-4)

            // Actual
            $table->boolean('is_done')->default(false);          // PPM completed?
            $table->integer('actual_stroke')->nullable();        // Actual stroke when PPM done
            $table->date('ppm_date')->nullable();                // Actual PPM date
            $table->string('pic', 100)->nullable();              // Person In Charge

            $table->text('notes')->nullable();
            $table->timestamps();

            // Unique constraint:  1 schedule per die per year/month/week
            $table->unique(['die_id', 'year', 'month', 'week']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ppm_schedules');
    }
};
