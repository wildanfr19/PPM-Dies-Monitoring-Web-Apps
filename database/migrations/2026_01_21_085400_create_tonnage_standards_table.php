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
        Schema::create('tonnage_standards', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->string('tonnage', 20);              // '1200T', '800T', '250T'
            $table->string('grade', 10);                // 'A', 'B', 'C'
            $table->string('type', 50)->nullable();     // 'Progressive', 'Tandem'
            $table->integer('standard_stroke');          // 5000, 6000, 7000, 10000
            $table->integer('lot_size')->default(2500); // Default 2500 per lot
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tonnage_standards');
    }
};
