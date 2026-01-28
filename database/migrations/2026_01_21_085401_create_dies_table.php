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
        Schema::create('dies', function (Blueprint $table) {
                $table->id();
                $table->string('part_number', 50);          // '71142-I6000'
                $table->string('part_name', 200);           // 'REINF-FR PILLAR OTR LWR,RH'
                $table->foreignId('machine_model_id')
                    ->constrained('machine_models')
                    ->onDelete('restrict');
                $table->foreignId('customer_id')
                    ->constrained('customers')
                    ->onDelete('restrict');
                $table->integer('qty_die')->default(1);     // Jumlah die (4, 3, etc.)
                $table->string('line', 20)->nullable();     // '800T', '1200T', '250T'

                // Stroke tracking
                $table->integer('accumulation_stroke')->default(0);  // Current accumulated stroke
                $table->integer('last_stroke')->default(0);          // Stroke saat PPM terakhir
                $table->integer('control_stroke')->nullable();       // Custom override standard stroke
                $table->date('last_ppm_date')->nullable();           // Tanggal PPM terakhir

                // Additional info
                $table->string('location', 100)->nullable();         // Storage location
                $table->enum('status', ['active', 'inactive', 'maintenance', 'disposed'])
                    ->default('active');
                $table->text('notes')->nullable();

                $table->timestamps();

                // Index untuk search performance
                $table->index(['part_number']);
                $table->index(['status']);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dies');
    }
};
