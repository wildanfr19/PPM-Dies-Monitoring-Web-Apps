<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DieController;
use App\Http\Controllers\ProductionLogController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\MachineModelController;
use App\Http\Controllers\TonnageStandardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SpecialDiesRepairController;
use App\Http\Controllers\TransferDiesController;
use App\Http\Controllers\UserMessageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ScheduleController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
    ]);
});

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Master Data - Admin only
    Route::middleware(['role:admin'])->group(function () {
        Route::resource('customers', CustomerController::class)->except(['show']);
        Route::resource('users', UserController::class)->except(['show']);
        Route::post('users/{user}/remove-photo', [UserController::class, 'removePhoto'])->name('users.remove-photo');

        // Test Alert (Admin only)
        Route::get('/test-alert', [DieController::class, 'showTestAlert'])->name('test-alert.index');
        Route::post('/test-alert/send', [DieController::class, 'sendTestAlert'])->name('test-alert.send');
    });

    // Machine Models - Admin and mtn_dies
    Route::middleware(['role:admin,mtn_dies'])->group(function () {
        Route::resource('machine-models', MachineModelController::class)->except(['show']);
    });

    // Dies Management - Create/Edit/Delete for admin and mtn_dies only
    Route::middleware(['role:admin,mtn_dies'])->group(function () {
        Route::get('dies/create', [DieController::class, 'create'])->name('dies.create');
        Route::post('dies', [DieController::class, 'store'])->name('dies.store');
        Route::get('dies/{die}/edit', [DieController::class, 'edit'])->name('dies.edit');
        Route::put('dies/{die}', [DieController::class, 'update'])->name('dies.update');
        Route::patch('dies/{die}', [DieController::class, 'update']);
        Route::delete('dies/{die}', [DieController::class, 'destroy'])->name('dies.destroy');
        Route::post('dies/{die}/record-ppm', [DieController::class, 'recordPpm'])->name('dies.record-ppm');
        Route::post('dies/{die}/schedule-ppm', [DieController::class, 'schedulePpm'])->name('dies.schedule-ppm');
        Route::post('dies/{die}/start-ppm', [DieController::class, 'startPpmProcessing'])->name('dies.start-ppm');
        // Flow: Processing PPM → "The Process is Normal?" → No → Additional Repair Dies
        Route::post('dies/{die}/additional-repair', [DieController::class, 'markAdditionalRepair'])->name('dies.additional-repair');
        Route::post('dies/{die}/resume-ppm', [DieController::class, 'resumePpmAfterRepair'])->name('dies.resume-ppm');
        // Cancel / Reschedule PPM
        Route::post('dies/{die}/cancel-schedule', [DieController::class, 'cancelSchedule'])->name('dies.cancel-schedule');
        Route::post('dies/{die}/reschedule', [DieController::class, 'reschedule'])->name('dies.reschedule');
        // Multi-process PPM actions
        Route::post('die-process/{process}/start', [DieController::class, 'startProcess'])->name('dies.process-start');
        Route::post('die-process/{process}/complete', [DieController::class, 'completeProcess'])->name('dies.process-complete');
        // MTN Dies remark
        Route::post('dies/{die}/mtn-remark', [DieController::class, 'updateMtnRemark'])->name('dies.mtn-remark');

        // Batch PPM Actions - multiple dies at once
        Route::post('dies/batch/start-ppm', [DieController::class, 'batchStartPpm'])->name('dies.batch-start-ppm');
        Route::post('dies/batch/additional-repair', [DieController::class, 'batchAdditionalRepair'])->name('dies.batch-additional-repair');
        Route::post('dies/batch/resume-ppm', [DieController::class, 'batchResumePpm'])->name('dies.batch-resume-ppm');
        Route::post('dies/batch/record-ppm', [DieController::class, 'batchRecordPpm'])->name('dies.batch-record-ppm');
    });

    // PPIC: Set Last LOT Date & Approve PPM Schedule
    // Flow: Orange Alert → PPIC creates date last of LOT → PPIC approves the PPM Schedule
    Route::middleware(['role:admin,ppic'])->group(function () {
        Route::post('dies/batch/set-last-lot-date', [DieController::class, 'batchSetLastLotDate'])->name('dies.batch-set-last-lot-date');
        Route::post('dies/{die}/set-last-lot-date', [DieController::class, 'setLastLotDate'])->name('dies.set-last-lot-date');
        Route::post('dies/{die}/approve-schedule', [DieController::class, 'approvePpmSchedule'])->name('dies.approve-schedule');
        // PPIC remark
        Route::post('dies/{die}/ppic-remark', [DieController::class, 'updatePpicRemark'])->name('dies.ppic-remark');
    });

    // PROD: Transfer Dies to MTN
    // Flow: Red Alert → PROD transfers dies to MTN Dies
    Route::middleware(['role:admin,production'])->group(function () {
        Route::post('dies/{die}/transfer', [DieController::class, 'transferDies'])->name('dies.transfer');
        Route::post('dies/batch/transfer', [DieController::class, 'batchTransferDies'])->name('dies.batch-transfer');
    });

    // MTN Dies: Transfer Back to Production
    // Flow: PPM Completed → MTN Dies: Dies Location Back to Production
    Route::middleware(['role:admin,mtn_dies'])->group(function () {
        Route::post('dies/{die}/transfer-back', [DieController::class, 'transferBackToProduction'])->name('dies.transfer-back');
        Route::post('dies/batch/transfer-back', [DieController::class, 'batchTransferBack'])->name('dies.batch-transfer-back');
    });

    // Dies Management - View for admin, mtn_dies, mgr_gm, md, ppic
    Route::get('dies', [DieController::class, 'index'])->name('dies.index');
    Route::get('dies/{die}', [DieController::class, 'show'])->name('dies.show');

    // Production Logs - admin, mtn_dies, production, pe can manage
    Route::middleware(['role:admin,mtn_dies,production,pe'])->group(function () {
        Route::resource('production', ProductionLogController::class);
        Route::post('production/import', [ProductionLogController::class, 'import'])->name('production.import');
    });

    // Schedule Calendar - admin, mtn_dies, ppic
    Route::middleware(['role:admin,mtn_dies,ppic'])->group(function () {
        Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
        Route::post('/schedule/update-cell', [ScheduleController:: class, 'updateCell'])->name('schedule.update-cell');
    });

    // Tonnage Standards - admin, mtn_dies only
    Route::middleware(['role:admin,mtn_dies'])->group(function () {
        Route::resource('tonnage-standards', TonnageStandardController::class);
    });

    // Import/Export - admin, mtn_dies, production, pe
    Route::middleware(['role:admin,mtn_dies,production,pe'])->group(function () {
        Route::get('/import', [ImportController::class, 'index'])->name('import.index');
        Route::get('/import/template/production', [ImportController::class, 'downloadProductionTemplate'])
            ->name('import.template.production');
        Route::get('/import/template/dies', [ImportController::class, 'downloadDiesTemplate'])
            ->name('import.template.dies');
        Route::get('/import/template/ppm-schedule', [ImportController::class, 'downloadPpmScheduleTemplate'])
            ->name('import.template.ppm-schedule');
        Route::post('/import/production', [ImportController::class, 'importProduction'])
            ->name('import.production');
        Route::post('/import/dies', [ImportController::class, 'importDies'])
            ->name('import.dies');
        Route::post('/import/ppm-schedule', [ImportController::class, 'importPpmSchedule'])
            ->name('import.ppm-schedule');
    });

    // Reports - All authenticated users can view
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/dies/excel', [ReportController::class, 'exportDiesExcel'])
        ->name('reports.dies.excel');
    Route::get('/reports/dies/pdf', [ReportController:: class, 'exportDiesPdf'])
        ->name('reports.dies.pdf');
    Route::get('/reports/critical/pdf', [ReportController::class, 'exportCriticalPdf'])
        ->name('reports.critical.pdf');
    Route::get('/reports/ppm-history/excel', [ReportController::class, 'exportPpmHistoryExcel'])
        ->name('reports.ppm-history.excel');
    Route::get('/reports/production/excel', [ReportController::class, 'exportProductionExcel'])
        ->name('reports.production.excel');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/all', [NotificationController::class, 'all'])->name('notifications.all');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'clearAll'])->name('notifications.clear-all');

    // Special Dies Repair - admin, mtn_dies, production
    Route::middleware(['role:admin,mtn_dies,production'])->group(function () {
        Route::get('/special-repair', [SpecialDiesRepairController::class, 'index'])->name('special-repair.index');
        Route::get('/special-repair/create', [SpecialDiesRepairController::class, 'create'])->name('special-repair.create');
        Route::post('/special-repair', [SpecialDiesRepairController::class, 'store'])->name('special-repair.store');
        Route::get('/special-repair/{specialRepair}', [SpecialDiesRepairController::class, 'show'])->name('special-repair.show');
        Route::delete('/special-repair/{specialRepair}', [SpecialDiesRepairController::class, 'destroy'])->name('special-repair.destroy');

        // Workflow actions
        Route::post('/special-repair/{specialRepair}/start', [SpecialDiesRepairController::class, 'startRepair'])->name('special-repair.start');
        Route::post('/special-repair/{specialRepair}/complete', [SpecialDiesRepairController::class, 'completeRepair'])->name('special-repair.complete');

        // Special scenarios
        Route::post('/special-repair/urgent-delivery', [SpecialDiesRepairController::class, 'handleUrgentDelivery'])->name('special-repair.urgent-delivery');
        Route::post('/special-repair/severe-damage', [SpecialDiesRepairController::class, 'handleSevereDamage'])->name('special-repair.severe-damage');
    });

    // ==================== TRANSFER DIES (Separate Menu) ====================
    // Accessible by admin, production, mtn_dies
    Route::middleware(['role:admin,production,mtn_dies'])->group(function () {
        Route::get('/transfer-dies', [TransferDiesController::class, 'index'])->name('transfer-dies.index');
    });
    // Transfer TO MTN - Production role
    Route::middleware(['role:admin,production'])->group(function () {
        Route::post('/transfer-dies/{die}/to-mtn', [TransferDiesController::class, 'transferToMtn'])->name('transfer-dies.to-mtn');
        Route::post('/transfer-dies/batch/to-mtn', [TransferDiesController::class, 'batchTransferToMtn'])->name('transfer-dies.batch-to-mtn');
    });
    // Transfer BACK to Production - MTN Dies role
    Route::middleware(['role:admin,mtn_dies'])->group(function () {
        Route::post('/transfer-dies/{die}/to-production', [TransferDiesController::class, 'transferToProduction'])->name('transfer-dies.to-production');
        Route::post('/transfer-dies/batch/to-production', [TransferDiesController::class, 'batchTransferToProduction'])->name('transfer-dies.batch-to-production');
    });

    // ==================== USER MESSAGES (MTN Dies <-> PPIC) ====================
    Route::middleware(['role:admin,mtn_dies,ppic'])->group(function () {
        Route::get('/messages', [UserMessageController::class, 'index'])->name('messages.index');
        Route::post('/messages', [UserMessageController::class, 'store'])->name('messages.store');
        Route::get('/messages/{message}', [UserMessageController::class, 'show'])->name('messages.show');
        Route::post('/messages/{message}/reply', [UserMessageController::class, 'reply'])->name('messages.reply');
        Route::post('/messages/{message}/read', [UserMessageController::class, 'markRead'])->name('messages.read');
        Route::get('/messages-unread-count', [UserMessageController::class, 'unreadCount'])->name('messages.unread-count');
    });

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__. '/auth.php';
