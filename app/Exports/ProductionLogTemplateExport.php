<?php

namespace App\Exports;

use App\Models\Die;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ProductionLogTemplateExport implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithTitle
{
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

    public function array(): array
    {
        // Sample data rows
        return [
            [1, '20-Jan-25', 1, '5240B908/909', 'BRACE DASH SIDE RH', '4L45W', 'ATS', '800T', 3, 'Auto', '16:18', '17:45', '1:27', 87, 15, 600, 'Jan'],
            [2, '20-Jan-25', 1, '5253AT11/AT12', 'REINF F/FLR SIDE SILL INR LH', '4L45W', 'ATS', '800T', 4, 'Auto', '17:45', '19:50', '2:05', 125, 20, 752, 'Jan'],
            [3, '20-Jan-25', 1, 'T/O 77697-VT010-00', 'INSULATOR, FUEL TANK HEAT NO.  1', '560B', 'TMMIN', '800T', 1, 'Manual', '14:10', '16:18', '2:08', 128, 10, 500, 'Jan'],
            [4, '20-Jan-25', 1, '67412 W000P', 'C/ MBR DASH', '4L45W', 'ATS', '1200T', 4, 'Auto', '8:00', '10:00', '2:00', 120, 0, 800, 'Jan'],
            [5, '20-Jan-25', 1, '71362-I6000', 'REINF CTR PLR OTR UPR,RH', 'KS', 'HMMI', '1200T', 4, 'Auto', '10:00', '11:44', '1:44', 104, 10, 600, 'Jan'],
            [6, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            [7, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            [8, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5,   // No
            'B' => 12,  // Date
            'C' => 6,   // Shift
            'D' => 22,  // Part Number
            'E' => 35,  // Part Name
            'F' => 10,  // Model
            'G' => 10,  // Customer
            'H' => 8,   // Line
            'I' => 8,   // Qty Die
            'J' => 12,  // Running Process
            'K' => 8,   // Start
            'L' => 8,   // Finish
            'M' => 10,  // Total (hr)
            'N' => 10,  // Total (min)
            'O' => 14,  // Break Time
            'P' => 18,  // Total Output
            'Q' => 8,   // Month
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        // Header style
        $sheet->getStyle('A1:Q1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2E7D32'], // Dark green
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border:: BORDER_THIN,
                ],
            ],
        ]);

        // Data rows style
        $sheet->getStyle('A2:Q9')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Set row height
        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
