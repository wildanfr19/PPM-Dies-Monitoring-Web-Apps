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
    protected ?Carbon $dateFrom;
    protected ?Carbon $dateTo;
    protected ?int $dieId;

    public function __construct(?Carbon $dateFrom = null, ?Carbon $dateTo = null, ?int $dieId = null)
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
        $this->dieId = $dieId;
    }

    public function title(): string
    {
        return 'Act_Prod';
    }

    public function headings(): array
    {
        return [
            'No',
            'Date',
            'Shift',
            'Part Number',
            'Part Name',
            'Model',
            'Customer',
            'Line',
            'Qty Die',
            'Running Process',
            'Start',
            'Finish',
            'Total (hr)',
            'Total (min)',
            'Break Time (min)',
            'Total Output Prod.  (Pcs)',
            'Month',
        ];
    }

    public function collection()
    {
        $query = ProductionLog::with(['die.customer', 'die.machineModel'])
            ->orderByDesc('production_date')
            ->orderByDesc('shift');

        if ($this->dateFrom && $this->dateTo) {
            $query->whereBetween('production_date', [$this->dateFrom, $this->dateTo]);
        } elseif ($this->dateFrom) {
            $query->where('production_date', '>=', $this->dateFrom);
        } elseif ($this->dateTo) {
            $query->where('production_date', '<=', $this->dateTo);
        }

        if ($this->dieId) {
            $query->where('die_id', $this->dieId);
        }

        $logs = $query->get();

        return $logs->map(function ($log, $index) {
            return [
                'no' => $index + 1,
                'date' => $log->production_date->format('d-M-y'),
                'shift' => $log->shift,
                'part_number' => $log->die?->part_number,
                'part_name' => $log->die?->part_name,
                'model' => $log->die?->machineModel?->code ?? $log->model,
                'customer' => $log->die?->customer?->code,
                'line' => $log->line,
                'qty_die' => $log->die?->qty_die ?? 1,
                'running_process' => $log->running_process,
                'start_time' => $log->start_time,
                'finish_time' => $log->finish_time,
                'total_hours' => $log->total_hours,
                'total_minutes' => $log->total_minutes,
                'break_time' => $log->break_time,
                'output' => $log->output_qty,
                'month' => $log->production_date->format('M'),
            ];
        });
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:Q1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2E7D32'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        $sheet->getStyle("A2:Q{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }
}
