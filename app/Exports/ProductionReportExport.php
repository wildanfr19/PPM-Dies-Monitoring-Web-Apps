<?php

namespace App\Exports;

use App\Models\ProductionLog;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ProductionReportExport implements FromCollection, WithHeadings, WithStyles, WithTitle, ShouldAutoSize
{
    protected Carbon $dateFrom;
    protected Carbon $dateTo;
    protected ? int $dieId;

    public function __construct(Carbon $dateFrom, Carbon $dateTo, ? int $dieId = null)
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
        $this->dieId = $dieId;
    }

    public function title(): string
    {
        return 'Production Report';
    }

    public function headings(): array
    {
        return [
            'No',
            'Date',
            'Shift',
            'Part Number',
            'Part Name',
            'Customer',
            'Model',
            'Line',
            'Running Process',
            'Start Time',
            'Finish Time',
            'Total Hours',
            'Break Time (min)',
            'Output (Stroke)',
        ];
    }

    public function collection()
    {
        $query = ProductionLog::with(['die.customer', 'die.machineModel'])
            ->whereBetween('production_date', [$this->dateFrom, $this->dateTo])
            ->orderByDesc('production_date')
            ->orderByDesc('shift');

        if ($this->dieId) {
            $query->where('die_id', $this->dieId);
        }

        $logs = $query->get();

        return $logs->map(function ($log, $index) {
            return [
                'no' => $index + 1,
                'date' => $log->production_date->format('d-M-Y'),
                'shift' => $log->shift,
                'part_number' => $log->die?->part_number,
                'part_name' => $log->die?->part_name,
                'customer' => $log->die?->customer?->code,
                'model' => $log->die?->machineModel?->code,
                'line' => $log->line,
                'running_process' => $log->running_process,
                'start_time' => $log->start_time,
                'finish_time' => $log->finish_time,
                'total_hours' => $log->total_hours,
                'break_time' => $log->break_time,
                'output' => $log->output_qty,
            ];
        });
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:N1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '6A1B9A'],
            ],
            'alignment' => [
                'horizontal' => Alignment:: HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        $sheet->getStyle("A2:N{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }
}
