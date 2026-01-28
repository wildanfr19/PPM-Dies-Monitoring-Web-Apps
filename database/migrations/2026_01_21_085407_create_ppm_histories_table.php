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
       Schema:: create('ppm_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('die_id')
                  ->constrained('dies')
                  ->onDelete('cascade');
            $table->date('ppm_date');
            $table->integer('stroke_at_ppm');           // Stroke count when PPM was performed
            $table->string('pic', 100);                 // Person In Charge
            $table->enum('status', ['done', 'pending', 'cancelled', 'partial'])
                  ->default('done');

            // Maintenance details
            $table->enum('maintenance_type', ['routine', 'repair', 'overhaul', 'emergency'])
                  ->default('routine');
            $table->text('work_performed')->nullable(); // Description of work done
            $table->text('parts_replaced')->nullable(); // Parts that were replaced
            $table->text('findings')->nullable();       // Issues found during PPM
            $table->text('recommendations')->nullable();// Recommendations for next PPM

            // Approval
            $table->string('checked_by', 100)->nullable();
            $table->string('approved_by', 100)->nullable();

            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->timestamps();

            // Index
            $table->index(['die_id', 'ppm_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ppm_histories');
    }
};
