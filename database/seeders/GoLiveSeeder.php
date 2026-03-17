<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\DieModel;
use App\Models\MachineModel;
use App\Models\TonnageStandard;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class GoLiveSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure customers exist
        $this->ensureCustomers();

        // Ensure machine models exist
        $this->ensureMachineModels();

        // Seed all 175 dies
        $this->seedDies();
    }

    private function ensureCustomers(): void
    {
        $customers = [
            ['code' => 'ATS', 'name' => 'Astra Toyota Motor'],
            ['code' => 'HMMI', 'name' => 'Honda Motor Manufacturing Indonesia'],
            ['code' => 'G-TIM', 'name' => 'G-TIM Industries'],
            ['code' => 'TMMIN', 'name' => 'Toyota Motor Manufacturing Indonesia'],
            ['code' => 'SIM', 'name' => 'Suzuki Indomobil Motor'],
            ['code' => 'UPIN', 'name' => 'UPIN Manufacturing'],
            ['code' => 'ASI', 'name' => 'ASI Manufacturing'],
        ];

        foreach ($customers as $c) {
            Customer::firstOrCreate(['code' => $c['code']], $c);
        }
    }

    private function ensureMachineModels(): void
    {
        // Determine tonnage_standard_id dynamically based on actual DB
        $ts800 = TonnageStandard::where('tonnage', 'LIKE', '800%')->first();
        $ts1200 = TonnageStandard::where('tonnage', 'LIKE', '1200%')->first();
        $ts250Prog = TonnageStandard::where('tonnage', 'LIKE', '250%')->where('type', 'Progressive')->first();
        $ts250Tandem = TonnageStandard::where('tonnage', 'LIKE', '250%')->where('type', '!=', 'Progressive')->first();

        $id800 = $ts800 ? $ts800->id : 5;
        $id1200 = $ts1200 ? $ts1200->id : 1;
        $id250P = $ts250Prog ? $ts250Prog->id : 3;
        $id250T = $ts250Tandem ? $ts250Tandem->id : 4;

        $models = [
            ['code' => '20QX', 'name' => '20QX Series', 'tonnage_standard_id' => $id800],
            ['code' => 'RNE', 'name' => 'RNE Series', 'tonnage_standard_id' => $id800],
            ['code' => '5H45 (RV)', 'name' => '5H45 RV Series', 'tonnage_standard_id' => $id800],
            ['code' => '5H45 (RX)', 'name' => '5H45 RX Series', 'tonnage_standard_id' => $id800],
            ['code' => '5H45 (RVE)', 'name' => '5H45 RVE Series', 'tonnage_standard_id' => $id800],
            ['code' => 'KS', 'name' => 'KS Series', 'tonnage_standard_id' => $id800],
            ['code' => '2JX', 'name' => '2JX Series', 'tonnage_standard_id' => $id250T],
            ['code' => '3K6A', 'name' => '3K6A Series', 'tonnage_standard_id' => $id250T],
            ['code' => '2GN', 'name' => '2GN Series', 'tonnage_standard_id' => $id250T],
            ['code' => '4L45W', 'name' => '4L45W Series', 'tonnage_standard_id' => $id1200],
            ['code' => 'QX', 'name' => 'QX Series', 'tonnage_standard_id' => $id1200],
            ['code' => 'T64', 'name' => 'T64 Series', 'tonnage_standard_id' => $id250T],
            ['code' => '2JX (T86A)', 'name' => '2JX T86A Series', 'tonnage_standard_id' => $id250T],
            ['code' => '2JX (T86A & 3K6A)', 'name' => '2JX T86A & 3K6A Series', 'tonnage_standard_id' => $id250T],
            ['code' => '2GN (3N1A)', 'name' => '2GN 3N1A Series', 'tonnage_standard_id' => $id250T],
            ['code' => '560B', 'name' => '560B Series', 'tonnage_standard_id' => $id250T],
            ['code' => 'YHA', 'name' => 'YHA Series', 'tonnage_standard_id' => $id250T],
            ['code' => 'Y4L', 'name' => 'Y4L Series', 'tonnage_standard_id' => $id250T],
            ['code' => 'YTB', 'name' => 'YTB Series', 'tonnage_standard_id' => $id250T],
            ['code' => '3M0A', 'name' => '3M0A Series', 'tonnage_standard_id' => $id250T],
            ['code' => '2VF', 'name' => '2VF Series', 'tonnage_standard_id' => $id1200],
            ['code' => '2JX (LHD)', 'name' => '2JX LHD Series', 'tonnage_standard_id' => $id250T],
            ['code' => '2JX (3K6A)', 'name' => '2JX 3K6A Series', 'tonnage_standard_id' => $id250T],
        ];

        foreach ($models as $m) {
            MachineModel::firstOrCreate(['code' => $m['code']], $m);
        }
    }

    private function seedDies(): void
    {
        $dies = $this->getDiesData();

        $created = 0;
        $updated = 0;

        foreach ($dies as $row) {
            $customer = Customer::where('code', $row['customer'])->first();
            $machineModel = MachineModel::where('code', $row['model'])->first();

            if (!$customer || !$machineModel) {
                $this->command->warn("Skipped: {$row['part_number']} - Customer '{$row['customer']}' or Model '{$row['model']}' not found.");
                continue;
            }

            $die = DieModel::where('part_number', $row['part_number'])->first();

            $data = [
                'part_name' => $row['part_name'],
                'machine_model_id' => $machineModel->id,
                'customer_id' => $customer->id,
                'qty_die' => $row['qty_die'],
                'line' => $row['line'],
                'model' => $row['model'],
                'lot_size' => $row['lot_size'],
                'ppm_standard' => $row['ppm_standard'],
                'last_stroke' => $row['last_stroke'],
                'accumulation_stroke' => 0,
                'last_ppm_date' => !empty($row['last_ppm_date']) ? Carbon::parse($row['last_ppm_date']) : null,
                'status' => 'active',
            ];

            if ($die) {
                $die->update($data);
                $updated++;
            } else {
                $data['part_number'] = $row['part_number'];
                $data['ppm_count'] = 0;
                $data['stroke_at_last_ppm'] = 0;
                DieModel::create($data);
                $created++;
            }
        }

        $this->command->info("Go-Live Seeder: Created {$created}, Updated {$updated} dies.");
    }

    private function getDiesData(): array
    {
        return [
            // ===== IMAGE 1: Rows 1-31 (800T & 1200T) =====
            // No. 1-14: ATS customer, 800T line
            ['part_number' => '5211A428', 'part_name' => 'BAR, FR END UPR, SIDE RH', 'qty_die' => 4, 'line' => '800T', 'model' => '20QX', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-10', 'last_stroke' => 0, 'ppm_standard' => 6000],
            ['part_number' => '5211A429', 'part_name' => 'BAR, FR END UPR, SIDE LH', 'qty_die' => 4, 'line' => '800T', 'model' => '20QX', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-04', 'last_stroke' => 0, 'ppm_standard' => 6000],
            ['part_number' => '76452-W100P', 'part_name' => 'SILL-INR,RH', 'qty_die' => 4, 'line' => '800T', 'model' => 'RNE', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-11', 'last_stroke' => 1964, 'ppm_standard' => 6000],
            ['part_number' => '76452-B000P', 'part_name' => 'SILL-INR,RH', 'qty_die' => 4, 'line' => '800T', 'model' => '5H45 (RV)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-11', 'last_stroke' => 1964, 'ppm_standard' => 6000],
            ['part_number' => '76452-C000P', 'part_name' => 'SILL-INR,RH', 'qty_die' => 1, 'line' => '800T', 'model' => '5H45 (RX)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-11', 'last_stroke' => 1964, 'ppm_standard' => 6000],
            ['part_number' => '76453-B000P', 'part_name' => 'SILL-INR,LH', 'qty_die' => 3, 'line' => '800T', 'model' => '5H45 (RV)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-12', 'last_stroke' => 469, 'ppm_standard' => 6000],
            ['part_number' => '76453-C000P', 'part_name' => 'SILL-INR,LH', 'qty_die' => 1, 'line' => '800T', 'model' => '5H45 (RX)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-12', 'last_stroke' => 469, 'ppm_standard' => 6000],
            ['part_number' => '76452-B010P', 'part_name' => 'SILL-INR,RH', 'qty_die' => 4, 'line' => '800T', 'model' => '5H45 (RVE)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-11', 'last_stroke' => 1964, 'ppm_standard' => 6000],
            ['part_number' => '76453-B020P', 'part_name' => 'SILL-INR,LH', 'qty_die' => 3, 'line' => '800T', 'model' => '5H45 (RVE)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-12', 'last_stroke' => 469, 'ppm_standard' => 6000],
            ['part_number' => '764B0-B000P', 'part_name' => 'REINF-SILL OTR,FR RH', 'qty_die' => 5, 'line' => '800T', 'model' => '5H45 (RV)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-13', 'last_stroke' => 1050, 'ppm_standard' => 6000],
            ['part_number' => '764B0-C000P', 'part_name' => 'REINF-SILL OTR,FR RH', 'qty_die' => 3, 'line' => '800T', 'model' => '5H45 (RX)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-13', 'last_stroke' => 1050, 'ppm_standard' => 6000],
            ['part_number' => '764B1-B000P', 'part_name' => 'REINF-SILL OTR,FR LH', 'qty_die' => 4, 'line' => '800T', 'model' => '5H45 (RV)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-05', 'last_stroke' => 1200, 'ppm_standard' => 6000],
            ['part_number' => '764B1-C000P', 'part_name' => 'REINF-SILL OTR,FR LH', 'qty_die' => 2, 'line' => '800T', 'model' => '5H45 (RX)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-05', 'last_stroke' => 1200, 'ppm_standard' => 6000],
            ['part_number' => '67412-C000P', 'part_name' => 'C/ MBR DASH', 'qty_die' => 5, 'line' => '800T', 'model' => '5H45 (RX)', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-03-03', 'last_stroke' => 4800, 'ppm_standard' => 6000],
            // No. 15-24: HMMI customer, 800T line
            ['part_number' => '65176-I6000', 'part_name' => 'MBR FR SEAT CROSS RR LH/RH', 'qty_die' => 3, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-06', 'last_stroke' => 1200, 'ppm_standard' => 6000],
            ['part_number' => '65212/22-I6000', 'part_name' => 'MBR CTR FLR SIDE LH/RH', 'qty_die' => 4, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-25', 'last_stroke' => 1200, 'ppm_standard' => 6000],
            ['part_number' => '71234/44-I6000', 'part_name' => 'SUPPORT-FR PILLAR INR,LH/RH', 'qty_die' => 4, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-10', 'last_stroke' => 4013, 'ppm_standard' => 6000],
            ['part_number' => '71328-I6000', 'part_name' => 'REINF S/SILL OTR CTR,RH', 'qty_die' => 4, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-20', 'last_stroke' => 600, 'ppm_standard' => 6000],
            ['part_number' => '71232-I6000', 'part_name' => 'PILLAR FR INR UPR,LH', 'qty_die' => 4, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-07', 'last_stroke' => 4101, 'ppm_standard' => 6000],
            ['part_number' => '71454-I6000', 'part_name' => 'REINF ASSY ROOF SIDE OTR,LH', 'qty_die' => 4, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-10', 'last_stroke' => 1170, 'ppm_standard' => 6000],
            ['part_number' => '71464-I6000', 'part_name' => 'REINF ASSY ROOF SIDE OTR,RH', 'qty_die' => 4, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-11', 'last_stroke' => 1101, 'ppm_standard' => 6000],
            ['part_number' => '71242-I6000', 'part_name' => 'PILLAR FR INR UPR,RH', 'qty_die' => 4, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-09', 'last_stroke' => 1200, 'ppm_standard' => 6000],
            ['part_number' => '71318-I6000', 'part_name' => 'REINF S/SILL OTR CTR,LH', 'qty_die' => 4, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-26', 'last_stroke' => 0, 'ppm_standard' => 6000],
            ['part_number' => '71236/46-I6000', 'part_name' => 'REINF FR PILLAR INR UPR,LH/RH', 'qty_die' => 5, 'line' => '800T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-06', 'last_stroke' => 4643, 'ppm_standard' => 6000],
            // No. 25-27: G-TIM customer, 800T line
            ['part_number' => '66114/164-T86-K000-50', 'part_name' => 'GST R/L, RR PLR LWR', 'qty_die' => 5, 'line' => '800T', 'model' => '2JX', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-19', 'last_stroke' => 4646, 'ppm_standard' => 6000],
            ['part_number' => '65701-TSV-K000-50', 'part_name' => 'C/ MBR MID FLOOR', 'qty_die' => 7, 'line' => '800T', 'model' => '3K6A', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-02', 'last_stroke' => 2980, 'ppm_standard' => 6000],
            ['part_number' => '66114/154-3M0-3000', 'part_name' => 'STIFF R/L, RR PANEL SIDE', 'qty_die' => 5, 'line' => '800T', 'model' => '2GN', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-10-24', 'last_stroke' => 2576, 'ppm_standard' => 6000],
            // No. 28-31: ATS customer, 1200T line
            ['part_number' => '5253AH62', 'part_name' => 'SILL F/FLR SIDE INR RH', 'qty_die' => 3, 'line' => '1200T', 'model' => '4L45W', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-02-19', 'last_stroke' => 4520, 'ppm_standard' => 5000],
            ['part_number' => '5253AH61', 'part_name' => 'SILL F/FLR SIDE INR LH', 'qty_die' => 4, 'line' => '1200T', 'model' => '4L45W', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-02-18', 'last_stroke' => 4785, 'ppm_standard' => 5000],
            ['part_number' => '5240B908/909', 'part_name' => 'BRACE DASH SIDE RH/LH', 'qty_die' => 3, 'line' => '1200T', 'model' => '4L45W', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-02-26', 'last_stroke' => 3600, 'ppm_standard' => 5000],
            ['part_number' => '5253AT11/12', 'part_name' => 'REINF ,F/FLR SIDE SILL INR LH', 'qty_die' => 4, 'line' => '1200T', 'model' => '4L45W', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2026-02-27', 'last_stroke' => 2419, 'ppm_standard' => 5000],

            // ===== IMAGE 2: Rows 32-67 (1200T & 250T) =====
            // No. 32: ATS, 1200T
            ['part_number' => '5240C305', 'part_name' => 'PANEL, DASH (RHD)', 'qty_die' => 4, 'line' => '1200T', 'model' => 'QX', 'customer' => 'ATS', 'lot_size' => 600, 'last_ppm_date' => '2025-11-21', 'last_stroke' => 1223, 'ppm_standard' => 5000],
            // No. 33-56: HMMI, 1200T
            ['part_number' => '71378-I6000', 'part_name' => 'REINF SIDE SILL OTR,LH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-11', 'last_stroke' => 4102, 'ppm_standard' => 5000],
            ['part_number' => '65132-I6000', 'part_name' => 'REINF-CTR FLOOR', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-02', 'last_stroke' => 1200, 'ppm_standard' => 5000],
            ['part_number' => '71188-I6000', 'part_name' => 'REINF FR PILLAR OTR UPR,RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-23', 'last_stroke' => 600, 'ppm_standard' => 5000],
            ['part_number' => '71148-I6000', 'part_name' => 'REINF ROOF SIDE OTR RR,RH', 'qty_die' => 3, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-24', 'last_stroke' => 596, 'ppm_standard' => 5000],
            ['part_number' => '71132-I6000', 'part_name' => 'REINF-FR PILLAR OTR LWR,LH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-20', 'last_stroke' => 2816, 'ppm_standard' => 5000],
            ['part_number' => '71142-I6000', 'part_name' => 'REINF-FR PILLAR OTR LWR,RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-03', 'last_stroke' => 3458, 'ppm_standard' => 5000],
            ['part_number' => '71222-I6000/I6900', 'part_name' => 'PILLAR-FR INR LWR,RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-11-05', 'last_stroke' => 3356, 'ppm_standard' => 5000],
            ['part_number' => '65112-I6000', 'part_name' => 'PNL-CTR FLOOR SIDE,LH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-17', 'last_stroke' => 3882, 'ppm_standard' => 5000],
            ['part_number' => '65122-I6000', 'part_name' => 'PNL-CTR FLOOR SIDE,RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-18', 'last_stroke' => 4350, 'ppm_standard' => 5000],
            ['part_number' => '65114-I6000', 'part_name' => 'PNL-CTR FLOOR CTR', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-27', 'last_stroke' => 600, 'ppm_standard' => 5000],
            ['part_number' => '71178-I6000', 'part_name' => 'REINF FR PILLAR OTR UPR,LH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-10-20', 'last_stroke' => 3289, 'ppm_standard' => 5000],
            ['part_number' => '71138-I6000', 'part_name' => 'REINF ROOF SIDE OTR RR,LH', 'qty_die' => 3, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-13', 'last_stroke' => 594, 'ppm_standard' => 5000],
            ['part_number' => '71412-I6000', 'part_name' => 'PILLAR CTR INR, LH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-23', 'last_stroke' => 1200, 'ppm_standard' => 5000],
            ['part_number' => '71422-I6000', 'part_name' => 'PILLAR CTR INR, RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-03-09', 'last_stroke' => 0, 'ppm_standard' => 5000],
            ['part_number' => '71362-I6000', 'part_name' => 'REINF CTR PLR OTR UPR,RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-03-02', 'last_stroke' => 0, 'ppm_standard' => 5000],
            ['part_number' => '71352-I6000', 'part_name' => 'REINF CTR PLR OTR UPR,LH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-25', 'last_stroke' => 401, 'ppm_standard' => 5000],
            ['part_number' => '71388-I6000', 'part_name' => 'REINF SIDE SILL OTR,RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-12', 'last_stroke' => 2800, 'ppm_standard' => 5000],
            ['part_number' => '65182-I6000', 'part_name' => 'PNL-SIDE SILL INR,RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-04', 'last_stroke' => 1800, 'ppm_standard' => 5000],
            ['part_number' => '71354/64-I6000', 'part_name' => 'REINF CTR PILLAR OTR LWR,LH/RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-12', 'last_stroke' => 600, 'ppm_standard' => 5000],
            ['part_number' => '71376/86-I6000', 'part_name' => 'REINF SIDE SILL OTR RR LH/RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-24', 'last_stroke' => 513, 'ppm_standard' => 5000],
            ['part_number' => '71176/86-I6000', 'part_name' => 'BRKT-FR PILLAR OTR.LH/LH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-19', 'last_stroke' => 3494, 'ppm_standard' => 5000],
            ['part_number' => '71212-I6000/I6900', 'part_name' => 'PILLAR-FR INR LWR,LH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-04', 'last_stroke' => 3375, 'ppm_standard' => 5000],
            ['part_number' => '65188-I6000', 'part_name' => 'MEMBER-CTR FLOOR SIDE UPR,RH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-05', 'last_stroke' => 1705, 'ppm_standard' => 5000],
            ['part_number' => '65172-I6000', 'part_name' => 'PNL-SIDE SILL INR,LH', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-03', 'last_stroke' => 1756, 'ppm_standard' => 5000],
            // No. 57: ASI, 1200T
            ['part_number' => '64312-I6000', 'part_name' => 'PANEL DASH LHD A/T', 'qty_die' => 4, 'line' => '1200T', 'model' => 'KS', 'customer' => 'ASI', 'lot_size' => 600, 'last_ppm_date' => '2025-10-16', 'last_stroke' => 1000, 'ppm_standard' => 5000],
            // No. 58-59: UPIN, 1200T
            ['part_number' => '63131-TG4-U000-50', 'part_name' => 'STIFF R, FR PILLAR LWR', 'qty_die' => 4, 'line' => '1200T', 'model' => '2VF', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-12-17', 'last_stroke' => 5708, 'ppm_standard' => 5000],
            ['part_number' => '65112-TG1-T000-50', 'part_name' => 'BRKT FR SEAT CTR RR', 'qty_die' => 4, 'line' => '1200T', 'model' => '2VF', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-12-22', 'last_stroke' => 5065, 'ppm_standard' => 5000],
            // No. 60-67: G-TIM, 250T (7000)
            ['part_number' => '63323-T86-K000-50', 'part_name' => 'ADPT R,RR COMBI', 'qty_die' => 7, 'line' => '250T', 'model' => '2JX (T86A)', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-06', 'last_stroke' => 2816, 'ppm_standard' => 7000],
            ['part_number' => '63723-T86-K000-50', 'part_name' => 'ADPT L,RR COMBI', 'qty_die' => 7, 'line' => '250T', 'model' => '2JX (T86A)', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-15', 'last_stroke' => 1213, 'ppm_standard' => 7000],
            ['part_number' => '65317-T86-K000-H1', 'part_name' => 'ADPT L,RR COMBI', 'qty_die' => 3, 'line' => '250T', 'model' => '2JX (T86A)', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-10-13', 'last_stroke' => 2641, 'ppm_standard' => 7000],
            ['part_number' => '65317-T86-K000-H1 Blank', 'part_name' => 'STIFF R, FRM CTR TNL', 'qty_die' => 1, 'line' => '250T', 'model' => '2JX (T86A & 3K6A)', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-10-13', 'last_stroke' => 2641, 'ppm_standard' => 7000],
            ['part_number' => '63323-3K6-K000-50', 'part_name' => 'ADPT R, RR COMBI', 'qty_die' => 7, 'line' => '250T', 'model' => '3K6A', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-03', 'last_stroke' => 1181, 'ppm_standard' => 7000],
            ['part_number' => '63325/725-3K6-K000-H1', 'part_name' => 'GTR R/L, RR PLR MID', 'qty_die' => 7, 'line' => '250T', 'model' => '3K6A', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-05', 'last_stroke' => 2383, 'ppm_standard' => 7000],
            ['part_number' => '63723-3K6-K000-50', 'part_name' => 'ADPT L, RR COMBI', 'qty_die' => 7, 'line' => '250T', 'model' => '3K6A', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-18', 'last_stroke' => 1938, 'ppm_standard' => 7000],
            ['part_number' => '63212/612-TG2-K000-H1 Bl', 'part_name' => 'R/L RNFCT CTR PLR STIFF TG2', 'qty_die' => 1, 'line' => '250T', 'model' => 'T64', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-24', 'last_stroke' => 5850, 'ppm_standard' => 7000],

            // ===== IMAGE 3: Rows 68-103 (250T) =====
            ['part_number' => '63212-TG2-K000-H1', 'part_name' => 'R RNFCT CTR PLR STIFF TG2', 'qty_die' => 3, 'line' => '250T', 'model' => 'T64', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-24', 'last_stroke' => 5850, 'ppm_standard' => 7000],
            ['part_number' => '63612-TG2-K000-H1', 'part_name' => 'L RNFCT CTR PLR STIFF TG2', 'qty_die' => 3, 'line' => '250T', 'model' => 'T64', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-25', 'last_stroke' => 4865, 'ppm_standard' => 7000],
            ['part_number' => '65318-T86-P000-H1 (blank)', 'part_name' => 'STIFF L, FRM CTR TNL', 'qty_die' => 1, 'line' => '250T', 'model' => '2JX (LHD)', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2026-01-21', 'last_stroke' => 1080, 'ppm_standard' => 7000],
            ['part_number' => '65318-T86-P000-H1', 'part_name' => 'STIFF L, FRM CTR TNL', 'qty_die' => 4, 'line' => '250T', 'model' => '2JX (LHD)', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2026-01-21', 'last_stroke' => 1080, 'ppm_standard' => 7000],
            ['part_number' => '63323-3M0-3000-50', 'part_name' => 'ADPT R,RR COMBI', 'qty_die' => 5, 'line' => '250T', 'model' => '2GN (3N1A)', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-29', 'last_stroke' => 4802, 'ppm_standard' => 7000],
            ['part_number' => '63723-3M0-3000-50', 'part_name' => 'ADPT L,RR COMBI', 'qty_die' => 5, 'line' => '250T', 'model' => '2GN (3N1A)', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-30', 'last_stroke' => 4830, 'ppm_standard' => 7000],
            // No. 74-78: TMMIN, 250T, 560B
            ['part_number' => '77751-VT010-00', 'part_name' => 'BRACKET, CHARCOAL CANISTER BASE', 'qty_die' => 2, 'line' => '250T', 'model' => '560B', 'customer' => 'TMMIN', 'lot_size' => 600, 'last_ppm_date' => '2026-03-05', 'last_stroke' => 1188, 'ppm_standard' => 7000],
            ['part_number' => '77751-VT010-00 (Blank)', 'part_name' => 'BRACKET, CHARCOAL CANISTER BASE', 'qty_die' => 1, 'line' => '250T', 'model' => '560B', 'customer' => 'TMMIN', 'lot_size' => 600, 'last_ppm_date' => '2026-03-05', 'last_stroke' => 1188, 'ppm_standard' => 7000],
            ['part_number' => '77751-VT020-00 (Blank)', 'part_name' => 'BRACKET, CHARCOAL CANISTER BASE', 'qty_die' => 1, 'line' => '250T', 'model' => '560B', 'customer' => 'TMMIN', 'lot_size' => 600, 'last_ppm_date' => '2025-10-31', 'last_stroke' => 4518, 'ppm_standard' => 7000],
            ['part_number' => '77751-VT020-00', 'part_name' => 'BRACKET, CHARCOAL CANISTER BASE', 'qty_die' => 3, 'line' => '250T', 'model' => '560B', 'customer' => 'TMMIN', 'lot_size' => 600, 'last_ppm_date' => '2025-10-31', 'last_stroke' => 4518, 'ppm_standard' => 7000],
            ['part_number' => '77697-VT010-00', 'part_name' => 'INSULATOR, FUEL TANK HEAT NO. 1', 'qty_die' => 3, 'line' => '250T', 'model' => '560B', 'customer' => 'TMMIN', 'lot_size' => 600, 'last_ppm_date' => '2026-03-05', 'last_stroke' => 1690, 'ppm_standard' => 7000],
            // No. 79-103: HMMI, 250T, KS
            ['part_number' => '71136-I6000', 'part_name' => 'REINF-FR PILLAR OTR,LH', 'qty_die' => 6, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-03-02', 'last_stroke' => 1200, 'ppm_standard' => 7000],
            ['part_number' => '71146-I6000', 'part_name' => 'REINF-FR PILLAR OTR,RH', 'qty_die' => 6, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-28', 'last_stroke' => 2184, 'ppm_standard' => 7000],
            ['part_number' => '71134-I6000', 'part_name' => 'REINF-FR DR HINGE MTG UPR,LH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-01-28', 'last_stroke' => 2145, 'ppm_standard' => 7000],
            ['part_number' => '71144-I6000', 'part_name' => 'REINF-FR DR HINGE MTG UPR,RH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-16', 'last_stroke' => 600, 'ppm_standard' => 7000],
            ['part_number' => '71154-I6000', 'part_name' => 'REINF-FR DR HINGE LWR,LH', 'qty_die' => 5, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-20', 'last_stroke' => 2708, 'ppm_standard' => 7000],
            ['part_number' => '71164-I6000', 'part_name' => 'REINF-FR DR HINGE LWR,RH', 'qty_die' => 5, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-14', 'last_stroke' => 3510, 'ppm_standard' => 7000],
            ['part_number' => '71172-I6000', 'part_name' => 'REINF-FR DR CHECKER MTG,LH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-21', 'last_stroke' => 3565, 'ppm_standard' => 7000],
            ['part_number' => '71182-I6000', 'part_name' => 'REINF-FR DR CHECKER MTG,RH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-20', 'last_stroke' => 3455, 'ppm_standard' => 7000],
            ['part_number' => '651C8-I6000', 'part_name' => 'BRACE-CTR FLOOR TUNNEL', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-22', 'last_stroke' => 2361, 'ppm_standard' => 7000],
            ['part_number' => '651D8-I6000', 'part_name' => 'BRACE-CTR FLOOR TUNNEL RR', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-23', 'last_stroke' => 2403, 'ppm_standard' => 7000],
            ['part_number' => '651A8-I6000', 'part_name' => 'MBR CTR FLR SIDE UPR,RH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-02', 'last_stroke' => 1200, 'ppm_standard' => 7000],
            ['part_number' => '651F2-I6000', 'part_name' => 'PATCH S/SILL INR REINF NO.1', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-01', 'last_stroke' => 2715, 'ppm_standard' => 7000],
            ['part_number' => '651B2-I6000', 'part_name' => 'REINF CTR FLR SIDE FR,RH', 'qty_die' => 3, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-04', 'last_stroke' => 2673, 'ppm_standard' => 7000],
            ['part_number' => '71374/84-I6000', 'part_name' => 'REINF SIDE SILL OTR FR,LH/RH', 'qty_die' => 3, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-09', 'last_stroke' => 1668, 'ppm_standard' => 7000],
            ['part_number' => '71394-I6000', 'part_name' => 'GUSSET SIDE SILL OTR NO.2,RH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-06', 'last_stroke' => 1800, 'ppm_standard' => 7000],
            ['part_number' => '71391-I6000', 'part_name' => 'GUSSET SIDE SILL OTR NO.1 LH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-30', 'last_stroke' => 6832, 'ppm_standard' => 7000],
            ['part_number' => '65152-I6000', 'part_name' => 'MBR FR SEAT CROSS,LH', 'qty_die' => 5, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-03-03', 'last_stroke' => 0, 'ppm_standard' => 7000],
            ['part_number' => '65162-I6000', 'part_name' => 'MBR FR SEAT CROSS,RH', 'qty_die' => 5, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-09-23', 'last_stroke' => 3614, 'ppm_standard' => 7000],
            ['part_number' => '65156-I6000', 'part_name' => 'BRKT FR ST RR OTR MTG,LH', 'qty_die' => 5, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-03-04', 'last_stroke' => 0, 'ppm_standard' => 7000],
            ['part_number' => '65166-I6000', 'part_name' => 'BRKT FR ST RR OTR MTG,RH', 'qty_die' => 5, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-03-09', 'last_stroke' => 0, 'ppm_standard' => 7000],
            ['part_number' => '71358-I6000', 'part_name' => 'EXTN SIDE SILL OTR FR,L', 'qty_die' => 5, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-10-23', 'last_stroke' => 2783, 'ppm_standard' => 7000],
            ['part_number' => '71368-I6000', 'part_name' => 'EXTN SIDE SILL OTR FR,R', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-12', 'last_stroke' => 2005, 'ppm_standard' => 7000],
            ['part_number' => '65106-I6000', 'part_name' => 'REINF CTR FLOOR RR', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-28', 'last_stroke' => 4413, 'ppm_standard' => 7000],
            ['part_number' => '65154-I6000', 'part_name' => 'BRKT FR ST RR INR MTG,LH', 'qty_die' => 5, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-31', 'last_stroke' => 2326, 'ppm_standard' => 7000],
            ['part_number' => '65164-I6000', 'part_name' => 'BRKT FR ST RR INR MTG,RH', 'qty_die' => 5, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-01-30', 'last_stroke' => 1800, 'ppm_standard' => 7000],

            // ===== IMAGE 4: Rows 104-139 (250T & Progressive) =====
            // No. 104-108: HMMI, 250T, KS
            ['part_number' => '65174-I6000', 'part_name' => 'REINF SIDE SILL INR LH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-03', 'last_stroke' => 3796, 'ppm_standard' => 7000],
            ['part_number' => '65184-I6000', 'part_name' => 'REINF SIDE SILL INR RH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-03', 'last_stroke' => 2049, 'ppm_standard' => 7000],
            ['part_number' => '71252-I6000', 'part_name' => 'EXTN FR PILLAR UPR,LH', 'qty_die' => 3, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-01-22', 'last_stroke' => 2400, 'ppm_standard' => 7000],
            ['part_number' => '71262-I6000', 'part_name' => 'EXTN FR PILLAR UPR,RH', 'qty_die' => 3, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-01-23', 'last_stroke' => 2070, 'ppm_standard' => 7000],
            ['part_number' => '71393-I6000', 'part_name' => 'GUSSET SIDE SILL OTR NO.2,LH', 'qty_die' => 4, 'line' => '250T', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-13', 'last_stroke' => 2094, 'ppm_standard' => 7000],
            // No. 109: SIM, 250T, YHA
            ['part_number' => '57343-72S0A', 'part_name' => 'REINF FRONT HOOD FRONT', 'qty_die' => 5, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-21', 'last_stroke' => 4290, 'ppm_standard' => 7000],
            // No. 110-120: SIM, 250T, YHA
            ['part_number' => '64113-72S00', 'part_name' => 'REINF ROOF RAIL FR R', 'qty_die' => 2, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-16', 'last_stroke' => 2592, 'ppm_standard' => 7000],
            ['part_number' => '64513-72S00', 'part_name' => 'REINF ROOF RAIL FR L', 'qty_die' => 2, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-17', 'last_stroke' => 2808, 'ppm_standard' => 7000],
            ['part_number' => '64114-72S00', 'part_name' => 'REINF ROOF RAIL CTR R', 'qty_die' => 4, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-03-12', 'last_stroke' => 0, 'ppm_standard' => 7000],
            ['part_number' => '64514-72S00', 'part_name' => 'REINF ROOF RAIL CTR L', 'qty_die' => 4, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-03-13', 'last_stroke' => 0, 'ppm_standard' => 7000],
            ['part_number' => '64115-72S00', 'part_name' => 'REINF ROOF RAIL RR, R', 'qty_die' => 2, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-20', 'last_stroke' => 2436, 'ppm_standard' => 7000],
            ['part_number' => '64515-72S00', 'part_name' => 'REINF ROOF RAIL RR, L', 'qty_die' => 2, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-19', 'last_stroke' => 2592, 'ppm_standard' => 7000],
            ['part_number' => '64113-72S00 (Blank)', 'part_name' => 'REINF ROOF RAIL FR R', 'qty_die' => 1, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-16', 'last_stroke' => 2592, 'ppm_standard' => 7000],
            ['part_number' => '64513-72S00 (Blank)', 'part_name' => 'REINF ROOF RAIL FR L', 'qty_die' => 1, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-17', 'last_stroke' => 2808, 'ppm_standard' => 7000],
            ['part_number' => '64114/514-72S00 (Blank)', 'part_name' => 'REINF ROOF RAIL CTR R/L', 'qty_die' => 1, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-20', 'last_stroke' => 2436, 'ppm_standard' => 7000],
            ['part_number' => '64115-72S00 (Blank)', 'part_name' => 'REINF ROOF RAIL RR, R', 'qty_die' => 1, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-20', 'last_stroke' => 2436, 'ppm_standard' => 7000],
            ['part_number' => '64515-72S00 (Blank)', 'part_name' => 'REINF ROOF RAIL RR, L', 'qty_die' => 1, 'line' => '250T', 'model' => 'YHA', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-19', 'last_stroke' => 2592, 'ppm_standard' => 7000],
            // No. 121-126: SIM, 250T, Y4L
            ['part_number' => '58821-52S20', 'part_name' => 'BRKT COOLING UNIT', 'qty_die' => 5, 'line' => '250T', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-03-10', 'last_stroke' => 0, 'ppm_standard' => 7000],
            ['part_number' => '58861-52S00', 'part_name' => 'BRACKET, BUMPER & FR PNL, L', 'qty_die' => 2, 'line' => '250T', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-02-12', 'last_stroke' => 3936, 'ppm_standard' => 7000],
            ['part_number' => '58851-52S00', 'part_name' => 'BRACKET, BUMPER & FR PNL, R', 'qty_die' => 2, 'line' => '250T', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-02-13', 'last_stroke' => 4320, 'ppm_standard' => 7000],
            ['part_number' => '58321-52S00', 'part_name' => 'BRACE, HEADLAMP SUPPORT, R', 'qty_die' => 3, 'line' => '250T', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-03-02', 'last_stroke' => 1603, 'ppm_standard' => 7000],
            ['part_number' => '58331-52S00', 'part_name' => 'BRACE, HEADLAMP SUPPORT, L', 'qty_die' => 3, 'line' => '250T', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-03-06', 'last_stroke' => 1400, 'ppm_standard' => 7000],
            ['part_number' => '58815-52S00', 'part_name' => 'BRACKET,BUMPER & FR PNL CTR', 'qty_die' => 4, 'line' => '250T', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-03-11', 'last_stroke' => 0, 'ppm_standard' => 7000],
            // No. 127-128: SIM, 250T, YTB
            ['part_number' => '58322-74T00', 'part_name' => 'BRACKET FR FENDER LWR R', 'qty_die' => 3, 'line' => '250T', 'model' => 'YTB', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-24', 'last_stroke' => 5420, 'ppm_standard' => 7000],
            ['part_number' => '58422-74T00', 'part_name' => 'BRACKET FR FENDER LWR L', 'qty_die' => 3, 'line' => '250T', 'model' => 'YTB', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-29', 'last_stroke' => 4440, 'ppm_standard' => 7000],
            // No. 129-132: UPIN, 250T, 3M0A
            ['part_number' => '64717-3M0A-3000', 'part_name' => 'BHD L, RR PLR', 'qty_die' => 3, 'line' => '250T', 'model' => '3M0A', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-12-29', 'last_stroke' => 1840, 'ppm_standard' => 7000],
            ['part_number' => '64717-3M0A-3000 (Blank)', 'part_name' => 'BHD L, RR PLR', 'qty_die' => 1, 'line' => '250T', 'model' => '3M0A', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-12-29', 'last_stroke' => 1840, 'ppm_standard' => 7000],
            ['part_number' => '64317-3M0A-3000', 'part_name' => 'BHD R, RR PLR', 'qty_die' => 3, 'line' => '250T', 'model' => '3M0A', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-11-18', 'last_stroke' => 1920, 'ppm_standard' => 7000],
            ['part_number' => '64317-3M0A-3000 (Blank)', 'part_name' => 'BHD R, RR PLR', 'qty_die' => 1, 'line' => '250T', 'model' => '3M0A', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-11-18', 'last_stroke' => 1840, 'ppm_standard' => 7000],
            // No. 133: SIM, 250T, YTB
            ['part_number' => '62741-74U00', 'part_name' => 'BRACKET , FUEL TANK REAR , L', 'qty_die' => 3, 'line' => '250T', 'model' => 'YTB', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-20', 'last_stroke' => 4875, 'ppm_standard' => 7000],
            // No. 134-139: HMMI, Progressive (10000)
            ['part_number' => '71372/82-I6000 (Blank)', 'part_name' => 'REINF RR DR CHKR MTG LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-03', 'last_stroke' => 1498, 'ppm_standard' => 10000],
            ['part_number' => '71216-I6900 (Blank)', 'part_name' => 'BRKT-COWL CROSS MEMBER GD,LH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-16', 'last_stroke' => 2300, 'ppm_standard' => 10000],
            ['part_number' => '71216-I6000 (Blank)', 'part_name' => 'BRKT-COWL CROSS MEMBER GD,LH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-17', 'last_stroke' => 3634, 'ppm_standard' => 10000],
            ['part_number' => '71478/88-I6000 (Blank)', 'part_name' => 'BRKT FR SEAT BELT LWR MTG,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-02', 'last_stroke' => 2518, 'ppm_standard' => 10000],
            ['part_number' => '71226-I6900 (Blank)', 'part_name' => 'BRKT-COWL CROSS MEMBER GDE,RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-04', 'last_stroke' => 1200, 'ppm_standard' => 10000],
            ['part_number' => '71226-I6000 (Blank)', 'part_name' => 'BRKT-COWL CROSS MEMBER GDE,RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-10', 'last_stroke' => 1855, 'ppm_standard' => 10000],

            // ===== IMAGE 5: Rows 140-175 (Progressive, 10000) =====
            ['part_number' => '71474/84-I6000 (Blank)', 'part_name' => 'REINF CTR PLR INR UPR,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-04', 'last_stroke' => 4448, 'ppm_standard' => 10000],
            ['part_number' => '651C2/D2-I6000 (Blank)', 'part_name' => 'REINF-FR SEAT FR INR MTG,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-05', 'last_stroke' => 6046, 'ppm_standard' => 10000],
            ['part_number' => '71432-I6000 (Blank)', 'part_name' => 'BRKT ASSIST HDL FR,LH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-31', 'last_stroke' => 1200, 'ppm_standard' => 10000],
            ['part_number' => '71434-I6000 (Blank)', 'part_name' => 'BRKT ASSIST HDL RR,LH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-31', 'last_stroke' => 1200, 'ppm_standard' => 10000],
            ['part_number' => '65138-I6000 (Blank)', 'part_name' => 'REINF P/BRAKE LVR MTG', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-29', 'last_stroke' => 3810, 'ppm_standard' => 10000],
            ['part_number' => '65195-I6000 (Blank)', 'part_name' => 'REINF P/BRAKE CBL MTG', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-24', 'last_stroke' => 2600, 'ppm_standard' => 10000],
            ['part_number' => '651F2-I6000 (Blank)', 'part_name' => 'PATCH S/SILL INR REINF NO.1', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-01', 'last_stroke' => 2715, 'ppm_standard' => 10000],
            ['part_number' => '651A8-I6000 (Blank)', 'part_name' => 'MBR CTR FLR SIDE UPR,RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-02', 'last_stroke' => 1200, 'ppm_standard' => 10000],
            ['part_number' => '651B2-I6000 (Blank)', 'part_name' => 'REINF CTR FLR SIDE FR,RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-04', 'last_stroke' => 2673, 'ppm_standard' => 10000],
            ['part_number' => '65156/66-I6000 (Blank)', 'part_name' => 'BRKT FR ST RR OTR MTG,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-03-04', 'last_stroke' => 0, 'ppm_standard' => 10000],
            ['part_number' => '71134/44-I6000 (Blank)', 'part_name' => 'REINF-FR DR HINGE MTG UPR,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-01-28', 'last_stroke' => 2145, 'ppm_standard' => 10000],
            ['part_number' => '71136/46-I6000 (Blank)', 'part_name' => 'REINF-FR PILLAR OTR,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-03-02', 'last_stroke' => 1200, 'ppm_standard' => 10000],
            ['part_number' => '71391-I6000 (Blank)', 'part_name' => 'GUSSET SIDE SILL OTR NO.1 LH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-30', 'last_stroke' => 6832, 'ppm_standard' => 10000],
            ['part_number' => '71358/68-I6000 (Blank)', 'part_name' => 'EXTN SIDE SILL OTR FR,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-10-23', 'last_stroke' => 2783, 'ppm_standard' => 10000],
            ['part_number' => '71476/86-I6000 (Blank)', 'part_name' => 'BRKT FR S/BELT UPR MTG,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-01-27', 'last_stroke' => 2400, 'ppm_standard' => 10000],
            ['part_number' => '71154/64-I6000 (Blank)', 'part_name' => 'REINF-FR DR HINGE LWR,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-20', 'last_stroke' => 2708, 'ppm_standard' => 10000],
            ['part_number' => '65158/68-I6000 (Blank)', 'part_name' => 'REINF-FR SEAT FR OTR MTG,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-01-26', 'last_stroke' => 1500, 'ppm_standard' => 10000],
            ['part_number' => '65106-I6000 (Blank)', 'part_name' => 'REINF CTR FLOOR RR', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-28', 'last_stroke' => 4413, 'ppm_standard' => 10000],
            ['part_number' => '65154/64-I6000 (Blank)', 'part_name' => 'BRKT FR ST RR INR MTG,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-31', 'last_stroke' => 2326, 'ppm_standard' => 10000],
            ['part_number' => '65174/84-I6000 (Blank)', 'part_name' => 'REINF SIDE SILL INR LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-03', 'last_stroke' => 3796, 'ppm_standard' => 10000],
            ['part_number' => '71172/82-I6000 (Blank)', 'part_name' => 'REINF-FR DR CHECKER MTG,LH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-21', 'last_stroke' => 3565, 'ppm_standard' => 10000],
            ['part_number' => '71393/94-I6000 (Blank)', 'part_name' => 'GUSSET SIDE SILL OTR NO.2,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-11-13', 'last_stroke' => 2094, 'ppm_standard' => 10000],
            ['part_number' => '71252/62-I6000 (Blank)', 'part_name' => 'EXTN FR PILLAR UPR,RH/LH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-01-22', 'last_stroke' => 2400, 'ppm_standard' => 10000],
            ['part_number' => '71477/87-I6000 (Blank)', 'part_name' => 'BRKT FR SEAT BELT LWR MTG,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-04', 'last_stroke' => 0, 'ppm_standard' => 10000],
            ['part_number' => '71374/84-I6000 (Blank Sheet)', 'part_name' => 'REINF SIDE SILL OTR FR,LH/RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-02-09', 'last_stroke' => 1668, 'ppm_standard' => 10000],
            ['part_number' => '651C8-I6000 (Blank Sheet)', 'part_name' => 'BRACE CTR FLR TUNNEL RR', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-22', 'last_stroke' => 2361, 'ppm_standard' => 10000],
            ['part_number' => '651D8-I6000 (Blank Sheet)', 'part_name' => 'BRACE CTR FLR TUNNEL', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-12-23', 'last_stroke' => 2403, 'ppm_standard' => 10000],
            ['part_number' => '65152-I6000 (Blank Sheet)', 'part_name' => 'MEMBER-FR SEAT CROSS,LH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2026-03-03', 'last_stroke' => 0, 'ppm_standard' => 10000],
            ['part_number' => '65162-I6000 (Blank Sheet)', 'part_name' => 'MEMBER-FR SEAT CROSS,RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'KS', 'customer' => 'HMMI', 'lot_size' => 600, 'last_ppm_date' => '2025-09-23', 'last_stroke' => 3614, 'ppm_standard' => 10000],
            // No. 169-173: SIM, Progressive, Y4L
            ['part_number' => '58331-52S00 (Blank)', 'part_name' => 'BRACE HEAD LAMP SUPPORT LH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-03-06', 'last_stroke' => 1400, 'ppm_standard' => 10000],
            ['part_number' => '58321-52S00 (Blank)', 'part_name' => 'BRACE HEAD LAMP SUPPORT RH', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-03-02', 'last_stroke' => 1603, 'ppm_standard' => 10000],
            ['part_number' => '58851-52S00 (Blank)', 'part_name' => 'BRKT BMPR & FR FNL R', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-26', 'last_stroke' => 4320, 'ppm_standard' => 10000],
            ['part_number' => '58861-52S00 (Blank)', 'part_name' => 'BRKT BMPR & FR FNL L', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-02-12', 'last_stroke' => 3936, 'ppm_standard' => 10000],
            ['part_number' => '58815-52S00 (Blank)', 'part_name' => 'BRKT BMPR & FR FNL CTR', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'Y4L', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2026-03-11', 'last_stroke' => 0, 'ppm_standard' => 10000],
            // No. 174: SIM, Progressive, YTB
            ['part_number' => '58322/422-74T00 (Blank)', 'part_name' => 'BRACKET FR FENDER LWR R/L', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'YTB', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-12-24', 'last_stroke' => 5420, 'ppm_standard' => 10000],
            // No. 175: UPIN, Progressive, 2JX (3K6A)
            ['part_number' => '64348-TVS-K010-H1 (Blank)', 'part_name' => 'ANCHOR PLATE CTR INN', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '2JX (3K6A)', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-11-19', 'last_stroke' => 5000, 'ppm_standard' => 10000],

            // ===== IMAGE 6: Rows 176-185 (Progressive, 10000) =====
            ['part_number' => '65314-T86-K000-H1 (Blank)', 'part_name' => 'BRACKET CANISTER', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '2JX', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-11-19', 'last_stroke' => 3250, 'ppm_standard' => 10000],
            ['part_number' => '65613-SCD-3000 (Blank)', 'part_name' => 'BASE SPRING', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '2JX', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-11-28', 'last_stroke' => 4200, 'ppm_standard' => 10000],
            ['part_number' => '65705-T86-K000-H1 (Blank)', 'part_name' => 'BHD MID FLOOR C/ MBR', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '2JX', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-12-22', 'last_stroke' => 1500, 'ppm_standard' => 10000],
            ['part_number' => '65706-T86-K000-H1 (Blank)', 'part_name' => 'BRKT L, RR F/ TANK STOPPER', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '2JX', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-11-28', 'last_stroke' => 5200, 'ppm_standard' => 10000],
            ['part_number' => '65743/93-T86A-K000-H1 (Blank)', 'part_name' => 'STIFF R/L, EXTN S/ SILL', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '2JX (LHD)', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-11-13', 'last_stroke' => 2400, 'ppm_standard' => 10000],
            ['part_number' => '65748-T86-K000-H1 (Blank)', 'part_name' => 'BRKT, BREATHER TUBE', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '2JX', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-11-13', 'last_stroke' => 4500, 'ppm_standard' => 10000],
            ['part_number' => '64743-T7A-3000 (Blank)', 'part_name' => 'BRKT, SECURITY HORN', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '3M0A', 'customer' => 'UPIN', 'lot_size' => 600, 'last_ppm_date' => '2025-12-09', 'last_stroke' => 1700, 'ppm_standard' => 10000],
            ['part_number' => '61541-3M0-3000 (Blank)', 'part_name' => 'STPR, ACCEL PEDAL', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '2GN (3N1A)', 'customer' => 'G-TIM', 'lot_size' => 600, 'last_ppm_date' => '2025-10-27', 'last_stroke' => 3760, 'ppm_standard' => 10000],
            ['part_number' => '77751-VT050 (Blank)', 'part_name' => 'BRACKET, CHARCOAL CANISTER NO. 1', 'qty_die' => 1, 'line' => 'Progressive', 'model' => '560B', 'customer' => 'TMMIN', 'lot_size' => 600, 'last_ppm_date' => '2026-02-10', 'last_stroke' => 0, 'ppm_standard' => 10000],
            ['part_number' => '62741-74U00 (Blank)', 'part_name' => 'BRACKET , FUEL TANK REAR , L', 'qty_die' => 1, 'line' => 'Progressive', 'model' => 'YTB', 'customer' => 'SIM', 'lot_size' => 600, 'last_ppm_date' => '2025-11-20', 'last_stroke' => 4875, 'ppm_standard' => 10000],
        ];
    }
}
