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
            'Qty Dies',
            'Line',
            'Model',
            'Customer',
            'Lot Size',
            'Last PPM Dies',
            'Last Stroke',
            'PPM Standard',
        ];
    }

    public function array(): array
    {
        return [
            [1, '5211A428', 'BAR, FR END UPR, SIDE RH', 4, '800T', '20QX', 'ATS', 600, '10-Mar-26', 0, 6000],
            [2, '71142-I6000', 'REINF-FR PILLAR OTR LWR,RH', 4, '1200T', 'KS', 'HMMI', 600, '03-Nov-25', 3458, 5000],
            [3, '63323-T86-K000-50', 'ADPT R,RR COMBI', 7, '250T', '2JX (T86A)', 'G-TIM', 600, '06-Nov-25', 2816, 7000],
            [4, '71372/82-I6000 (Blank)', 'REINF RR DR CHKR MTG LH/RH', 1, 'Progressive', 'KS', 'HMMI', 600, '03-Nov-25', 1498, 10000],
            [5, '', '', '', '', '', '', '', '', '', ''],
            [6, '', '', '', '', '', '', '', '', '', ''],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5,   // No
            'B' => 30,  // Part Number
            'C' => 38,  // Part Name
            'D' => 10,  // Qty Dies
            'E' => 12,  // Line
            'F' => 18,  // Model
            'G' => 12,  // Customer
            'H' => 10,  // Lot Size
            'I' => 14,  // Last PPM Dies
            'J' => 12,  // Last Stroke
            'K' => 14,  // PPM Standard
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->getStyle('A1:K1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2E5A2E'], // Dark green to match the image
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getStyle('A2:K7')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
