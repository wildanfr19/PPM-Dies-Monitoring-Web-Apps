<?php

namespace App\Http\Controllers;

use App\Exports\ProductionLogTemplateExport;
use App\Exports\DiesTemplateExport;
use App\Exports\PpmScheduleTemplateExport;
use App\Imports\ProductionLogImport;
use App\Imports\DiesImport;
use App\Imports\PpmScheduleImport;
use App\Models\ImportLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    /**
     * Show import page
     */
    public function index()
    {
        $importLogs = ImportLog::with('user')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'type' => $log->type,
                    'file_name' => $log->file_name,
                    'status' => $log->status,
                    'imported_count' => $log->imported_count,
                    'skipped_count' => $log->skipped_count,
                    'accumulated_count' => $log->accumulated_count,
                    'skipped_rows' => $log->skipped_rows,
                    'error_message' => $log->error_message,
                    'user' => $log->user?->name ?? '-',
                    'created_at' => $log->created_at->format('d-M-Y H:i'),
                ];
            });

        return Inertia::render('Import/Index', [
            'importLogs' => $importLogs,
        ]);
    }

    /**
     * Download Production Log template
     */
    public function downloadProductionTemplate()
    {
        return Excel::download(
            new ProductionLogTemplateExport(),
            'Template_Act_Prod_' . date('Y-m-d') . '.xlsx'
        );
    }

    /**
     * Download Dies Master template
     */
    public function downloadDiesTemplate()
    {
        return Excel::download(
            new DiesTemplateExport(),
            'Template_Dies_Master_' . date('Y-m-d') . '.xlsx'
        );
    }

    /**
     * Download PPM Schedule template
     */
    public function downloadPpmScheduleTemplate(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $model = $request->get('model', 'KS (Grade B)');
        $customer = $request->get('customer', 'HMMI');

        return Excel::download(
            new PpmScheduleTemplateExport($year, $model, $customer),
            'Template_PPM_Schedule_' .  $year . '_' . date('Y-m-d') . '.xlsx'
        );
    }

    /**
     * Import Production Logs
     */
    public function importProduction(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        $fileName = $request->file('file')->getClientOriginalName();

        try {
            $import = new ProductionLogImport();
            Excel::import($import, $request->file('file'));

            $imported = $import->getImportedCount();
            $skipped = $import->getSkippedRows();
            $successRows = $import->getSuccessRows();
            $accumulated = $import->getAccumulatedCount();
            $accumulatedRows = $import->getAccumulatedRows();
            $errors = $import->errors();

            // Save import log
            ImportLog::create([
                'type' => 'production',
                'file_name' => $fileName,
                'status' => 'success',
                'imported_count' => $imported,
                'skipped_count' => count($skipped),
                'accumulated_count' => $accumulated,
                'skipped_rows' => count($skipped) > 0 ? $skipped : null,
                'user_id' => $request->user()?->id,
            ]);

            $message = "Successfully imported {$imported} production log data.";

            if ($accumulated > 0) {
                $message .= " {$accumulated} data diakumulasi (part number, tanggal & shift sama).";
            }

            if (count($skipped) > 0) {
                $message .= " " . count($skipped) . " baris dilewati.";
            }

            return redirect()->route('import.index')->with('success', $message)->with('importResult', [
                'type' => 'production',
                'imported' => $imported,
                'skipped_count' => count($skipped),
                'accumulated_count' => $accumulated,
                'success_rows' => $successRows,
                'skipped_rows' => $skipped,
                'accumulated_rows' => $accumulatedRows,
                'error_count' => $errors->count(),
            ]);

        } catch (\Exception $e) {
            // Save failed import log
            ImportLog::create([
                'type' => 'production',
                'file_name' => $fileName,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'user_id' => $request->user()?->id,
            ]);

            return redirect()->route('import.index')
                ->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     * Import Dies Master
     */
    public function importDies(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        $fileName = $request->file('file')->getClientOriginalName();

        try {
            $import = new DiesImport();
            Excel::import($import, $request->file('file'));

            $imported = $import->getImportedCount();
            $skipped = $import->getSkippedRows();
            $successRows = $import->getSuccessRows();

            // Save import log
            ImportLog::create([
                'type' => 'dies',
                'file_name' => $fileName,
                'status' => 'success',
                'imported_count' => $imported,
                'skipped_count' => count($skipped),
                'skipped_rows' => count($skipped) > 0 ? $skipped : null,
                'user_id' => $request->user()?->id,
            ]);

            $message = "Successfully imported {$imported} new dies.";

            if (count($skipped) > 0) {
                $message .= " " . count($skipped) . " rows were skipped.";
            }

            return redirect()->route('import.index')->with('success', $message)->with('importResult', [
                'type' => 'dies',
                'imported' => $imported,
                'skipped_count' => count($skipped),
                'success_rows' => $successRows,
                'skipped_rows' => $skipped,
            ]);

        } catch (\Exception $e) {
            // Save failed import log
            ImportLog::create([
                'type' => 'dies',
                'file_name' => $fileName,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'user_id' => $request->user()?->id,
            ]);

            return redirect()->route('import.index')
                ->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     * Import PPM Schedule
     */
    public function importPpmSchedule(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
            'year' => 'nullable|integer|min:2020|max:2030',
        ]);

        try {
            $year = $request->get('year', date('Y'));
            $import = new PpmScheduleImport($year);
            Excel::import($import, $request->file('file'));

            $imported = $import->getImportedCount();
            $updated = $import->getUpdatedCount();
            $skipped = $import->getSkippedRows();

            $message = "Successfully imported {$imported} new PPM schedules, updated {$updated} existing schedules.";

            if (count($skipped) > 0) {
                $message .= " " . count($skipped) . " rows were skipped.";
            }

            return redirect()->route('import.index')->with('success', $message)->with('importDetails', [
                'imported' => $imported,
                'updated' => $updated,
                'skipped' => $skipped,
            ]);

        } catch (\Exception $e) {
            return redirect()->route('import.index')
                ->with('error', 'Import failed: ' . $e->getMessage());
        }
    }
}
