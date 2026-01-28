<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('machine_models') || ! Schema::hasTable('tonnage_standards')) {
            return;
        }

        $database = DB::getDatabaseName();

        $constraintExists = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', 'machine_models')
            ->where('COLUMN_NAME', 'tonnage_standard_id')
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->exists();

        if ($constraintExists) {
            return;
        }

        Schema::table('machine_models', function (Blueprint $table) {
            $table->foreign('tonnage_standard_id')
                ->references('id')
                ->on('tonnage_standards')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('machine_models')) {
            return;
        }

        Schema::table('machine_models', function (Blueprint $table) {
            $table->dropForeign(['tonnage_standard_id']);
        });
    }
};
