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
       Schema::create('production_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('die_id')
                  ->constrained('dies')
                  ->onDelete('cascade');
            $table->date('production_date');
            $table->tinyInteger('shift');               // 1, 2, 3
            $table->string('line', 20)->nullable();     // '800T', '1200T'
            $table->enum('running_process', ['Auto', 'Manual'])->default('Auto');

            // Working time
            $table->time('start_time')->nullable();
            $table->time('finish_time')->nullable();
            $table->decimal('total_hours', 5, 2)->nullable();
            $table->integer('total_minutes')->nullable();
            $table->integer('break_time')->nullable();  // in minutes

            // Output (THIS IS THE STROKE COUNT)
            $table->integer('output_qty');              // Total Output Prod = Stroke count

            // Additional
            $table->string('month', 10)->nullable();    // 'Jan', 'Feb', etc.
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->timestamps();

            // Indexes
            $table->index(['production_date']);
            $table->index(['die_id', 'production_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_logs');
    }
};
