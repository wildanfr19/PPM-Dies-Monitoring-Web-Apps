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
    });

    // Dies Management - View for admin, mtn_dies, mgr_gm, md
    Route::get('dies', [DieController::class, 'index'])->name('dies.index');
    Route::get('dies/{die}', [DieController::class, 'show'])->name('dies.show');

    // Production Logs - admin, mtn_dies, production, pe can manage
    Route::middleware(['role:admin,mtn_dies,production,pe'])->group(function () {
        Route::resource('production', ProductionLogController::class);
        Route::post('production/import', [ProductionLogController::class, 'import'])->name('production.import');
    });

    // Schedule Calendar - admin, mtn_dies
    Route::middleware(['role:admin,mtn_dies'])->group(function () {
        Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
        Route::post('/schedule/update-cell', [ScheduleController:: class, 'updateCell'])->name('schedule.update-cell');
    });

    // Tonnage Standards - admin, mtn_dies only
    Route::middleware(['role:admin,mtn_dies'])->group(function () {
        Route::resource('tonnage-standards', TonnageStandardController::class);
    });

    // Import/Export - admin, mtn_dies, production
    Route::middleware(['role:admin,mtn_dies,production'])->group(function () {
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

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__. '/auth.php';
