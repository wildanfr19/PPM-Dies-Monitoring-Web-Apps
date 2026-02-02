<?php

namespace App\Http\Controllers;

use App\Exports\ProductionLogTemplateExport;
use App\Exports\DiesTemplateExport;
use App\Exports\PpmScheduleTemplateExport;
use App\Imports\ProductionLogImport;
use App\Imports\DiesImport;
use App\Imports\PpmScheduleImport;
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
        return Inertia::render('Import/Index');
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

        try {
            $import = new ProductionLogImport();
            Excel::import($import, $request->file('file'));

            $imported = $import->getImportedCount();
            $skipped = $import->getSkippedRows();
            $errors = $import->errors();

            $message = "Successfully imported {$imported} production logs. ";

            if (count($skipped) > 0) {
                $message .= " " . count($skipped) . " rows were skipped.";
            }

            return redirect()->route('import.index')->with('success', $message)->with('importDetails', [
                'imported' => $imported,
                'skipped' => $skipped,
                'errors' => $errors->toArray(),
            ]);

        } catch (\Exception $e) {
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
            'file' => 'required|file|mimes: xlsx,xls,csv|max:10240',
        ]);

        try {
            $import = new DiesImport();
            Excel::import($import, $request->file('file'));

            $imported = $import->getImportedCount();
            $updated = $import->getUpdatedCount();
            $skipped = $import->getSkippedRows();

            $message = "Successfully imported {$imported} new dies, updated {$updated} existing dies.";

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
