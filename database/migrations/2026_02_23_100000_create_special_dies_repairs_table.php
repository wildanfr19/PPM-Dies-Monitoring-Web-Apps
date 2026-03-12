<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('special_dies_repairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('die_id')->constrained('dies')->onDelete('cascade');
            $table->string('repair_type', 50); // urgent_delivery, severe_damage, special_request
            $table->string('priority', 20)->default('high'); // high, critical, emergency
            $table->string('status', 30)->default('pending');
            // Status flow: pending -> approved -> in_progress -> completed / rejected / cancelled
            $table->text('reason'); // Why special repair is needed
            $table->text('description')->nullable(); // Detailed damage/issue description
            $table->string('requested_by', 100)->nullable();
            $table->string('approved_by', 100)->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('pic', 100)->nullable(); // Person in charge for repair
            $table->text('work_performed')->nullable();
            $table->text('parts_replaced')->nullable();
            $table->text('findings')->nullable();
            $table->text('recommendations')->nullable();
            $table->boolean('is_ppm_interrupted')->default(false); // Was PPM interrupted for this?
            $table->boolean('is_urgent_delivery')->default(false); // Urgent delivery case
            $table->date('delivery_deadline')->nullable(); // For urgent delivery cases
            $table->string('customer_po', 100)->nullable(); // Customer PO for urgent delivery
            $table->integer('estimated_hours')->nullable(); // Estimated repair time
            $table->integer('actual_hours')->nullable(); // Actual repair time
            $table->string('previous_ppm_status', 50)->nullable(); // Status before interruption
            $table->string('previous_location', 100)->nullable(); // Location before repair
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('special_dies_repairs');
    }
};
