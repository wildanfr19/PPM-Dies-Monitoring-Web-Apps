<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DieController;
use App\Http\Controllers\ProductionLogController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\MachineModelController;
use App\Http\Controllers\UserController;
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
    // Master Data
    Route::resource('customers', CustomerController::class)->except(['show']);
    Route::resource('machine-models', MachineModelController::class)->except(['show']);

    // Dies Management
    Route::resource('dies', DieController::class)
        ->parameters(['dies' => 'die']);
    Route::post('dies/{die}/record-ppm', [DieController::class, 'recordPpm'])
        ->name('dies.record-ppm');

    // Production Logs
    Route::resource('production', ProductionLogController::class)->only(['index', 'create', 'store']);
    Route::post('production/import', [ProductionLogController:: class, 'import'])
        ->name('production.import');

        // Schedule Calendar
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::post('/schedule/update-cell', [ScheduleController:: class, 'updateCell'])->name('schedule.update-cell');

    // Import/Export
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

        // Reports
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
    // User Management
    Route::resource('users', UserController::class)->except(['show']);
    Route::post('users/{user}/remove-photo', [UserController::class, 'removePhoto'])->name('users.remove-photo');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__. '/auth.php';
