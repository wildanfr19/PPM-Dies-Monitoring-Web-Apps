<?php

namespace App\Exports;
use App\Models\DieModel;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class PpmScheduleTemplateExport implements FromArray, WithStyles, WithColumnWidths, WithTitle, WithEvents
{
    protected string $year;
    protected string $model;
    protected string $customer;

    public function __construct(string $year = '2025', string $model = 'KS (Grade B)', string $customer = 'HMMI')
    {
        $this->year = $year;
        $this->model = $model;
        $this->customer = $customer;
    }

    public function title(): string
    {
        return 'Schedule PPM Dies';
    }

    public function array(): array
    {
        $data = [];

        // Row 1-2: Title
        $data[] = array_merge(['', '', '', '', '', '', 'SCHEDULE'], array_fill(0, 50, ''));
        $data[] = array_merge(['', '', '', '', '', '', 'PREVENTIVE MAINTENANCE DIES'], array_fill(0, 50, ''));

        // Row 3: Empty
        $data[] = array_fill(0, 55, '');

        // Row 4-6: Header info
        $data[] = array_merge(['', 'Year', ':', $this->year], array_fill(0, 51, ''));
        $data[] = array_merge(['', 'Model', ':', $this->model], array_fill(0, 48, ''), ['Issued', '', '', '', 'Checked', '', '', '', 'Approved']);
        $data[] = array_merge(['', 'Customer', ':', $this->customer], array_fill(0, 48, ''), ['Rydha RG', '', '', '', 'Mr. Kammee', '', '', '', 'Mr. Manop']);

        // Row 7: Empty
        $data[] = array_fill(0, 55, '');

        // Row 8: Main header
        $mainHeader = [
            'NO',
            'NAME/PART NUMBER DIE',
            'MODEL',
            'TOTAL DIE',
            'ACCUMULATION',
            'LAST STROKE',
            'PLAN',
        ];

        // Add months
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        foreach ($months as $month) {
            $mainHeader = array_merge($mainHeader, [$month, '', '', '']);
        }
        $data[] = $mainHeader;

        // Row 9: Week numbers (I, II, III, IV)
        $weekHeader = ['', '', '', '', '', '', ''];
        for ($i = 0; $i < 12; $i++) {
            $weekHeader = array_merge($weekHeader, ['I', 'II', 'III', 'IV']);
        }
        $data[] = $weekHeader;

        // Row 10: Customer section header
        $customerHeader = array_merge([$this->customer .  ' (' . $this->model . ')'], array_fill(0, 54, ''));
        $data[] = $customerHeader;

        // Sample die entries
        $sampleDies = [
            ['71142-I6000', 'REINF-FR PILLAR OTR LWR,RH', 'KS B', 4, 1500, 804],
            ['65122-I6000', 'PNL CTR FLOOR SIDE,RH', 'KS B', 4, 2075, 1467],
            ['71176-I6000', 'BRKT FR PILLAR OTR,LH/RH', 'KS B', 4, 1067, 689],
            ['71132-I6000', 'REINF-FR PILLAR OTR LWR,LH', 'KS B', 4, 1407, 616],
        ];

        $no = 1;
        foreach ($sampleDies as $die) {
            // Row 1:  Part info with Forecast
            $row1 = [
                $no,
                $die[0],
                $die[2],
                $die[3],
                'ACCUMULATION STROKE',
                $die[4],
                'Forecast',
            ];
            // Add forecast values for each week
            for ($m = 0; $m < 12; $m++) {
                $forecast = rand(100, 300);
                $row1 = array_merge($row1, [$forecast, '', '', '']);
            }
            $data[] = $row1;

            // Row 2: Part name with Plan
            $row2 = array_merge(
                ['', $die[1], '', '', '', '', 'Plan'],
                array_fill(0, 48, '')
            );
            $data[] = $row2;

            // Row 3: Accumulation All Stroke with Actual
            $row3 = array_merge(
                ['', '', '', '', 'ACCUMULATION ALL STROKE', '', 'Actual'],
                array_fill(0, 48, '')
            );
            $data[] = $row3;

            // Row 4: Control Stroke with Stroke
            $row4 = array_merge(
                ['', '', '', '', 'CONTROL STROKE', $die[5], 'Stroke'],
                array_fill(0, 48, '')
            );
            $data[] = $row4;

            // Row 5: PPM Date
            $row5 = array_merge(
                ['', '', '', '', '', '', 'PPM Date'],
                array_fill(0, 48, '')
            );
            $data[] = $row5;

            // Row 6:  Pic
            $row6 = array_merge(
                ['', '', '', '', '', '', 'Pic'],
                array_fill(0, 48, '')
            );
            $data[] = $row6;

            $no++;
        }

        return $data;
    }

    public function columnWidths(): array
    {
        $widths = [
            'A' => 4,   // NO
            'B' => 28,  // Part Number/Name
            'C' => 8,   // Model
            'D' => 8,   // Total Die
            'E' => 20,  // Accumulation
            'F' => 12,  // Last Stroke
            'G' => 10,  // Plan
        ];

        // Week columns (H onwards)
        $cols = range('H', 'Z');
        $cols = array_merge($cols, ['AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ', 'BA', 'BB', 'BC']);

        foreach ($cols as $col) {
            $widths[$col] = 5;
        }

        return $widths;
    }

    public function mergedCells(): array
    {
        return [
            // Title merges
            'G1:Z1',
            'G2:Z2',

            // Month header merges (Row 8)
            'H8:K8', // Jan
            'L8:O8', // Feb
            'P8:S8', // Mar
            'T8:W8', // Apr
            'X8:AA8', // May
            'AB8:AE8', // Jun
            'AF8:AI8', // Jul
            'AJ8:AM8', // Aug
            'AN8:AQ8', // Sep
            'AR8:AU8', // Oct
            'AV8:AY8', // Nov
            'AZ8:BC8', // Dec
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                foreach ($this->mergedCells() as $range) {
                    $sheet->mergeCells($range);
                }
            },
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        // Title style
        $sheet->getStyle('G1:Z2')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);

        // Header row style
        $sheet->getStyle('A8:BC9')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2E7D32'],
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

        // Customer header
        $sheet->getStyle('A10:BC10')->applyFromArray([
            'font' => [
                'bold' => true,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'C8E6C9'],
            ],
        ]);

        // Set header row heights
        $sheet->getRowDimension(8)->setRowHeight(25);
        $sheet->getRowDimension(9)->setRowHeight(20);

        return [];
    }
}
