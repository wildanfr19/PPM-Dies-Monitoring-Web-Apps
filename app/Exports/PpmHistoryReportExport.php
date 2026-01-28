<?php

namespace App\Exports;

use App\Models\PpmHistory;
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

class PpmHistoryReportExport implements FromCollection, WithHeadings, WithStyles, WithTitle, ShouldAutoSize
{
    protected Carbon $dateFrom;
    protected Carbon $dateTo;

    public function __construct(Carbon $dateFrom, Carbon $dateTo)
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    public function title(): string
    {
        return 'PPM History Report';
    }

    public function headings(): array
    {
        return [
            'No',
            'PPM Date',
            'Part Number',
            'Part Name',
            'Customer',
            'Model',
            'Stroke at PPM',
            'Maintenance Type',
            'PIC',
            'Status',
            'Work Performed',
            'Checked By',
            'Approved By',
        ];
    }

    public function collection()
    {
        $histories = PpmHistory::with(['die. customer', 'die.machineModel'])
            ->whereBetween('ppm_date', [$this->dateFrom, $this->dateTo])
            ->orderByDesc('ppm_date')
            ->get();

        return $histories->map(function ($history, $index) {
            return [
                'no' => $index + 1,
                'ppm_date' => $history->ppm_date->format('d-M-Y'),
                'part_number' => $history->die?->part_number,
                'part_name' => $history->die?->part_name,
                'customer' => $history->die?->customer?->code,
                'model' => $history->die?->machineModel?->code,
                'stroke_at_ppm' => $history->stroke_at_ppm,
                'maintenance_type' => ucfirst($history->maintenance_type),
                'pic' => $history->pic,
                'status' => ucfirst($history->status),
                'work_performed' => $history->work_performed,
                'checked_by' => $history->checked_by,
                'approved_by' => $history->approved_by,
            ];
        });
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:M1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1565C0'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        $sheet->getStyle("A2:M{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }
}
