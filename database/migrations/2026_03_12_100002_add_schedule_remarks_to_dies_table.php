<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->text('schedule_remark')->nullable()->after('ppm_scheduled_by');
            $table->text('schedule_change_reason')->nullable()->after('schedule_remark');
            $table->text('mtn_remark')->nullable()->after('notes'); // MTN Dies general remark
            $table->text('ppic_remark')->nullable()->after('mtn_remark'); // PPIC general remark
            $table->timestamp('schedule_cancelled_at')->nullable()->after('schedule_change_reason');
            $table->string('schedule_cancelled_by')->nullable()->after('schedule_cancelled_at');
        });
    }

    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn([
                'schedule_remark',
                'schedule_change_reason',
                'mtn_remark',
                'ppic_remark',
                'schedule_cancelled_at',
                'schedule_cancelled_by',
            ]);
        });
    }
};
