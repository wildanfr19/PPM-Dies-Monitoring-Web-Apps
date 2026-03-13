<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('die_processes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('die_id')->constrained('dies')->onDelete('cascade');
            $table->string('process_type', 50); // blank_pierce, draw, embos, trim, etc.
            $table->unsignedTinyInteger('process_order')->default(1); // 1st, 2nd, 3rd, 4th process
            $table->enum('ppm_status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->timestamp('ppm_started_at')->nullable();
            $table->timestamp('ppm_completed_at')->nullable();
            $table->foreignId('ppm_history_id')->nullable()->constrained('ppm_histories')->nullOnDelete();
            $table->string('completed_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['die_id', 'process_type', 'process_order']);
            $table->index(['die_id', 'ppm_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('die_processes');
    }
};
