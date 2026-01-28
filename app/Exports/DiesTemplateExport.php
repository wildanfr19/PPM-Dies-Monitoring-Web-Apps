<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class DiesTemplateExport implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithTitle
{
    public function title(): string
    {
        return 'Dies_Master';
    }

    public function headings(): array
    {
        return [
            'No',
            'Part Number',
            'Part Name',
            'Model',
            'Customer',
            'Total Die',
            'Line',
            'Accumulation Stroke',
            'Last Stroke',
            'Control Stroke',
            'Last PPM Date',
            'Location',
            'Notes',
        ];
    }

    public function array(): array
    {
        return [
            [1, '71142-I6000', 'REINF-FR PILLAR OTR LWR,RH', 'KS', 'HMMI', 4, '800T', 0, 0, '', '', 'Rack A-01', ''],
            [2, '65122-I6000', 'PNL CTR FLOOR SIDE,RH', 'KS', 'HMMI', 4, '800T', 0, 0, '', '', 'Rack A-02', ''],
            [3, '60415-TSEY-X000-H1', 'STIFF R, BHD SIDE MBR', '2SJ', 'UPIN', 3, '250T', 0, 0, 10000, '', 'Rack B-01', 'Progressive die'],
            [4, '5240B908/909', 'BRACE DASH SIDE RH', '4L45W', 'ATS', 3, '800T', 0, 0, '', '', '', ''],
            [5, '', '', '', '', '', '', '', '', '', '', '', ''],
            [6, '', '', '', '', '', '', '', '', '', '', '', ''],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5,   // No
            'B' => 25,  // Part Number
            'C' => 35,  // Part Name
            'D' => 10,  // Model
            'E' => 10,  // Customer
            'F' => 10,  // Total Die
            'G' => 8,   // Line
            'H' => 18,  // Accumulation Stroke
            'I' => 12,  // Last Stroke
            'J' => 14,  // Control Stroke
            'K' => 14,  // Last PPM Date
            'L' => 12,  // Location
            'M' => 20,  // Notes
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->getStyle('A1:M1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1565C0'], // Dark blue
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment:: VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getStyle('A2:M7')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border:: BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
