<?php

namespace App\Exports;

use App\Models\DieModel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class DiesReportExport implements FromCollection, WithHeadings, WithStyles, WithTitle, ShouldAutoSize
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function title(): string
    {
        return 'Dies Status Report';
    }

    public function headings(): array
    {
        return [
            'No',
            'Part Number',
            'Part Name',
            'Customer',
            'Model',
            'Tonnage',
            'Qty Die',
            'Accumulation Stroke',
            'Standard Stroke',
            'Remaining Stroke',
            'Progress (%)',
            'Status',
            'Last PPM Date',
        ];
    }

    public function collection()
    {
        $query = DieModel::with(['machineModel.tonnageStandard', 'customer'])->active();

        if (!empty($this->filters['customer_id'])) {
            $query->where('customer_id', $this->filters['customer_id']);
        }

        if (!empty($this->filters['machine_model_id'])) {
            $query->where('machine_model_id', $this->filters['machine_model_id']);
        }

        $dies = $query->orderBy('part_number')->get();

        // Filter by status if specified
        if (!empty($this->filters['status'])) {
            $dies = $dies->filter(fn($die) => $die->ppm_status === $this->filters['status']);
        }

        return $dies->values()->map(function ($die, $index) {
            return [
                'no' => $index + 1,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'customer' => $die->customer?->code,
                'model' => $die->machineModel?->code,
                'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
                'qty_die' => $die->qty_die,
                'accumulation_stroke' => $die->accumulation_stroke,
                'standard_stroke' => $die->standard_stroke,
                'remaining_stroke' => $die->remaining_strokes,
                'progress' => $die->stroke_percentage .  '%',
                'status' => $die->ppm_status_label,
                'last_ppm_date' => $die->last_ppm_date?->format('d-M-Y'),
            ];
        });
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        // Header style
        $sheet->getStyle('A1:M1')->applyFromArray([
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

        // Data rows
        $sheet->getStyle("A2:M{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => ['borderStyle' => Border:: BORDER_THIN],
            ],
        ]);

        // Color code status column
        for ($row = 2; $row <= $lastRow; $row++) {
            $status = $sheet->getCell("L{$row}")->getValue();
            $color = match(true) {
                str_contains($status, 'Critical') => 'FFCDD2',
                str_contains($status, 'Warning') => 'FFE0B2',
                default => 'C8E6C9',
            };
            $sheet->getStyle("L{$row}")->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setRGB($color);
        }

        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }
}
