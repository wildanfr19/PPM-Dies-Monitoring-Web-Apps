<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('receiver_role', 20)->nullable(); // broadcast to role: mtn_dies, ppic
            $table->foreignId('die_id')->nullable()->constrained('dies')->nullOnDelete();
            $table->string('subject', 200);
            $table->text('message');
            $table->enum('priority', ['normal', 'urgent', 'critical'])->default('normal');
            $table->enum('category', ['coordination', 'schedule_change', 'urgent_issue', 'ppm_update', 'general'])->default('general');
            $table->foreignId('parent_id')->nullable()->constrained('user_messages')->nullOnDelete();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['receiver_id', 'is_read']);
            $table->index(['receiver_role', 'is_read']);
            $table->index(['sender_id', 'created_at']);
            $table->index('die_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_messages');
    }
};
