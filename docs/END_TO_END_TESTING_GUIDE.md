# PPM DIES MONITORING - END TO END TESTING GUIDE
# PANDUAN TESTING END TO END

---

## Daftar Isi / Table of Contents

1. [Persiapan / Preparation](#1-persiapan--preparation)
2. [Test Accounts / Akun Test](#2-test-accounts--akun-test)
3. [FLOW TEST: Complete PPM Cycle](#3-flow-test-complete-ppm-cycle)
4. [FLOW TEST: Special Scenario - Urgent Delivery](#4-flow-test-special-scenario---urgent-delivery)
5. [FLOW TEST: Special Scenario - Severe Damage](#5-flow-test-special-scenario---severe-damage)
6. [FLOW TEST: Additional Repair During PPM](#6-flow-test-additional-repair-during-ppm)
7. [Dashboard Verification](#7-dashboard-verification)
8. [Checklist Summary](#8-checklist-summary)
9. [Process Type & Inspection Checklist Verification ⭐ NEW](#9-process-type--inspection-checklist-verification--new)
10. [Schedule Calendar - Smart Scheduling ⭐ NEW](#10-schedule-calendar---smart-scheduling--new)

---

## 1. Persiapan / Preparation

### Bahasa Indonesia
Sebelum testing, pastikan:
1. Jalankan `php artisan migrate` (sudah dilakukan)
2. Jalankan `npm run dev` atau `npm run build`
3. Buka browser ke `http://localhost:8000` atau URL Laragon Anda
4. Siapkan minimal 7 akun user dengan role berbeda untuk testing lengkap

### English
Before testing, ensure:
1. Run `php artisan migrate` (already done)
2. Run `npm run dev` or `npm run build`
3. Open browser to `http://localhost:8000` or your Laragon URL
4. Prepare at least 7 user accounts with different roles for complete testing

---

## 2. Test Accounts / Akun Test

Buat akun berikut melalui menu **Users** (login sebagai Admin):

| # | Name | Email | Role | Keterangan |
|---|------|-------|------|------------|
| 1 | Admin | admin@test.com | `admin` | Full access |
| 2 | PE User | pe@test.com | `pe` | Production Engineering - Input data |
| 3 | MTN Dies | mtn@test.com | `mtn_dies` | Maintenance Dies - PPM processing |
| 4 | Manager | mgr@test.com | `mgr_gm` | Manager/GM - Receive alerts |
| 5 | Director | md@test.com | `md` | Managing Director - Receive alerts |
| 6 | PPIC | ppic@test.com | `ppic` | PPIC - Schedule & approve |
| 7 | Production | prod@test.com | `production` | PROD - Transfer dies |

> **Tips:** Bisa juga pakai akun Admin saja untuk testing semua flow, karena Admin punya akses ke semua fitur.
>
> **Tips:** You can also use the Admin account alone to test all flows, as Admin has access to all features.

---

## 3. FLOW TEST: Complete PPM Cycle (Normal Flow)

Ini adalah test utama yang mengikuti **Flow PPM Dies Controlling System** dari flow map.

This is the main test following the **Flow PPM Dies Controlling System** from the flow map.

---

### STEP 1: PE - Input Data Production Result
**Login as:** `pe` (Production Engineering)
**URL:** `/production/create`

```
Langkah / Steps:
1. Buka menu "Production Result" → klik "Add New"
2. Pilih die yang ingin di-test (contoh: part number yang sudah ada)
3. Isi form:
   - Production Date: (hari ini)
   - Shift: 1
   - Output Qty: (masukkan qty yang cukup besar agar die mendekati orange)
4. Klik "Save"
```

**Yang di-verifikasi / Verify:**
- [ ] Production log tersimpan di tabel
- [ ] Accumulation stroke die bertambah sesuai output qty
- [ ] Bisa dilihat di halaman die detail (`/dies/{id}`)

---

### STEP 2: MTN DIES - Setup STD Stroke, LOT & Alert Categories
**Login as:** `mtn_dies` (Maintenance Dies)
**URL:** `/dies/{id}/edit`

```
Langkah / Steps:
1. Buka menu "Dies List" → pilih die yang akan di-test
2. Klik "Edit"
3. Pastikan data berikut sudah terisi:
   - Machine Model (yang punya Tonnage Standard)
   - Standard Stroke sudah otomatis dari Tonnage Standard
   - Lot Size sudah otomatis
   - **Process Type** ⭐ NEW: Pilih jenis proses die (wajib untuk inspection checklist PPM)
     Pilihan: BLANK+PIERCE, DRAW, EMBOS, TRIM, FORM, FLANG, RESTRIKE, PIERCE, CAM-PIERCE
4. Jika perlu override, isi "Control Stroke" 
5. Save
```

**Yang di-verifikasi / Verify:**
- [ ] Standard Stroke tampil benar (dari Tonnage Standard atau Control Stroke)
- [ ] Lot Size tampil benar
- [ ] Total Lots terhitung benar (Standard Stroke / Lot Size)
- [ ] **Process Type** dropdown tampil dan bisa dipilih ⭐ NEW
- [ ] Process Type tersimpan di database
- [ ] Process Type badge tampil di halaman detail die

---

### STEP 3: SYSTEM - Calculate Formula & Determine Color
**URL:** `/dies/{id}` (Die Detail Page)

```
Langkah / Steps:
1. Buka halaman detail die
2. Lihat section "PPM Status"
3. Perhatikan warna status: GREEN / ORANGE / RED
```

**Rumus yang di-verifikasi / Formula to verify:**
```
Next PPM = stroke_at_last_ppm + (4 × lot_size)
Orange Threshold = Next PPM - lot_size

Jika accumulation < orange_threshold → 🟢 GREEN
Jika accumulation >= orange_threshold AND < next_ppm → 🟠 ORANGE  
Jika accumulation >= next_ppm → 🔴 RED
```

**Yang di-verifikasi / Verify:**
- [ ] Status warna sesuai dengan rumus di atas
- [ ] Lot Progress bar menampilkan posisi yang benar
- [ ] Stroke Percentage terhitung benar

---

### STEP 4: Trigger ORANGE Status
**Login as:** `pe` atau `admin`
**URL:** `/production/create`

```
Langkah / Steps:
1. Input production log dengan qty yang cukup untuk membuat die masuk zona ORANGE
   Contoh: Jika next_ppm = 6000, lot_size = 1500, 
           maka orange di 4500. Input qty sampai accumulation >= 4500
2. Save production log
3. Cek halaman die → status harus berubah ke 🟠 ORANGE
```

**Yang di-verifikasi / Verify:**
- [ ] Status die berubah dari GREEN ke ORANGE
- [ ] Lot progress menunjukkan posisi di Lot 3 dari siklus 4-lot

---

### STEP 5: SYSTEM - Orange Alert Sent to All Roles
**Login as:** `admin`
**URL:** `/test-alert` atau jalankan `php artisan ppm:check-alerts`

```
Langkah / Steps:
1. OPSI A (Manual): Buka /test-alert → pilih die yang ORANGE → kirim test alert
2. OPSI B (Otomatis): Jalankan di terminal:
   php artisan ppm:check-alerts
3. Cek Notifications (icon bell di navbar)
```

**Yang di-verifikasi / Verify:**
- [ ] Orange Alert terkirim ke: MTN DIES, MGR/GM, MD, PPIC, PROD
- [ ] Notifikasi muncul di sistem
- [ ] ppm_alert_status berubah ke `orange_alerted`

---

### STEP 6: PPIC - Create Date The Last of LOT
**Login as:** `ppic`
**URL:** `/dies/{id}` (Die Detail Page)

```
Langkah / Steps:
1. Buka halaman detail die yang ORANGE (ppm_alert_status = 'orange_alerted')
2. Klik tombol "📅 Set Last LOT Date"
3. Di modal yang muncul:
   - Last LOT Date: (pilih tanggal terakhir produksi LOT ini)
   - Set By: (otomatis terisi nama user)
4. Klik Submit
```

**Yang di-verifikasi / Verify:**
- [ ] Tombol "📅 Set Last LOT Date" muncul untuk user PPIC
- [ ] Last LOT Date tersimpan dan tampil di halaman detail
- [ ] ppm_alert_status berubah ke `lot_date_set`
- [ ] Flow Status card menampilkan "PPIC: Last LOT Date Set"

---

### STEP 7: MTN DIES - Create Schedule of PPM ⭐ UPDATED
**Login as:** `mtn_dies`
**URL:** `/schedule` (Schedule Calendar) atau `/dies/{id}` (Die Detail Page)

#### Bahasa Indonesia
MTN Dies membuat jadwal PPM untuk die yang sudah dalam status ORANGE.
Sekarang di halaman Schedule Calendar ada **filter pintar** yang memudahkan MTN Dies
untuk langsung melihat die-die mana saja yang sudah punya LOT date dan perlu dijadwalkan.
Lihat [Section 10: Schedule Calendar - Smart Scheduling](#10-schedule-calendar---smart-scheduling--new) untuk detail fitur baru.

#### English
MTN Dies creates the PPM schedule for dies already in ORANGE status.
The Schedule Calendar page now has **smart filters** that help MTN Dies easily identify
which dies already have LOT dates and need to be scheduled.
See [Section 10: Schedule Calendar - Smart Scheduling](#10-schedule-calendar---smart-scheduling--new) for new feature details.

```
Langkah / Steps:
1. Buka menu "Schedule Calendar" (/schedule)
2. 🆕 Klik tombol "🔔 Perlu Dijadwalkan" untuk filter hanya die yang butuh jadwal
3. Die yang perlu dijadwalkan akan di-highlight kuning dengan badge "📅 SCHEDULE"
4. Klik cell PPM Date pada bulan/minggu yang diinginkan untuk die tersebut
5. Isi tanggal PPM
6. PPM Alert Status akan berubah ke "ppm_scheduled"
```

**Cara alternative via Die Detail Page:**
```
POST /dies/{id}/schedule-ppm
Body: {
    "scheduled_date": "2026-03-01",
    "plan_week": "W1",
    "pic": "Nama PIC MTN",
    "notes": "Scheduled PPM after Orange Alert"
}
```

**Yang di-verifikasi / Verify:**
- [ ] PPM Schedule terbuat di Schedule Calendar
- [ ] ppm_alert_status berubah ke `ppm_scheduled`
- [ ] Flow Status card menampilkan "MTN Dies: PPM Scheduled"
- [ ] 🆕 Filter "Perlu Dijadwalkan" berfungsi menampilkan hanya die yang butuh jadwal
- [ ] 🆕 Die yang sudah dijadwalkan berpindah ke filter "Sudah Dijadwalkan"

---

### STEP 8: PPIC - Confirm The PPM Schedule ⭐ UPDATED
**Login as:** `ppic`
**URL:** `/dies/{id}` (Die Detail Page)

#### Bahasa Indonesia
Setelah MTN Dies membuat jadwal PPM (Step 7), PPIC perlu **mengkonfirmasi** jadwal tersebut.
Tombol ini sebelumnya bernama "Approve", sekarang diganti menjadi "Confirm" karena lebih sesuai
dengan alur kerja — PPIC mengkonfirmasi bahwa jadwal PPM yang dibuat MTN Dies sudah sesuai
dengan rencana produksi dan ketersediaan mesin.

#### English
After MTN Dies creates the PPM schedule (Step 7), PPIC needs to **confirm** the schedule.
This button was previously labeled "Approve" and has been renamed to "Confirm" as it better
reflects the workflow — PPIC confirms that the PPM schedule created by MTN Dies aligns with
the production plan and machine availability.

```
Langkah / Steps:
1. Buka halaman detail die yang ppm_alert_status = 'ppm_scheduled'
   (artinya MTN DIES sudah buat jadwal PPM di Step 7)
2. Klik tombol "✅ Confirm PPM Schedule"
3. Konfirmasi dialog "Confirm Jadwal PPM?"
4. Klik OK
```

> ⚠️ **PENTING:** Tombol ini HANYA muncul jika:
> - User role = `ppic` atau `admin`
> - ppm_alert_status = `ppm_scheduled` (MTN DIES sudah buat jadwal)
>
> **CATATAN:** Step 6 (Set Last LOT Date) dan Step 7 (Schedule PPM) bisa dilakukan
> dalam urutan bebas. Tapi tombol Confirm **hanya muncul setelah MTN DIES buat jadwal** (Step 7 selesai).
> Jika PPIC set LOT date setelah jadwal dibuat, status tidak akan di-downgrade.

**Yang di-verifikasi / Verify:**
- [ ] Tombol "✅ Confirm PPM Schedule" muncul untuk PPIC
- [ ] Label tombol bertuliskan "Confirm" (bukan "Approve")
- [ ] Dialog konfirmasi bertuliskan "Confirm Jadwal PPM?"
- [ ] Tombol TIDAK muncul jika MTN belum buat jadwal (status masih lot_date_set/orange_alerted)
- [ ] Tombol TIDAK muncul untuk role lain (MTN Dies, PROD, etc)
- [ ] ppm_alert_status berubah ke `schedule_approved`
- [ ] Flow Status card menampilkan "PPIC: Schedule Approved"
- [ ] Flash message "PPM Schedule has been approved by PPIC."

---

### STEP 9: Trigger RED Status
**Login as:** `pe` atau `admin`
**URL:** `/production/create`

```
Langkah / Steps:
1. Input production log lagi sampai accumulation >= next_ppm_stroke
   Contoh: Jika next_ppm = 6000, input qty sampai accumulation >= 6000
2. Save production log
3. Cek halaman die → status harus berubah ke 🔴 RED
```

**Yang di-verifikasi / Verify:**
- [ ] Status die berubah dari ORANGE ke RED
- [ ] Lot progress menunjukkan posisi di Lot 4 (zona merah)

---

### STEP 10: SYSTEM - Red Alert Sent to All Roles
**Login as:** `admin`

```
Langkah / Steps:
1. Jalankan: php artisan ppm:check-alerts
   ATAU: Buka /test-alert → pilih die RED → kirim
2. Cek notifikasi
```

**Yang di-verifikasi / Verify:**
- [ ] Red Alert terkirim ke SEMUA role: MTN DIES, MGR/GM, MD, PPIC, PROD
- [ ] ppm_alert_status berubah ke `red_alerted`
- [ ] `red_alerted_at` timestamp tercatat (untuk SLA tracking)
- [ ] Die muncul di Dashboard → PPM Timeline Tracking table
- [ ] Flow Status card menampilkan "Red Alert Sent - Awaiting Transfer"

---

### STEP 11: PROD - Transfer Dies to Location MTN Dies
**Login as:** `production`
**URL:** `/dies/{id}` (Die Detail Page)

```
Langkah / Steps:
1. Buka halaman detail die yang RED
2. Klik tombol "🚚 Transfer to MTN Dies"
3. Di modal yang muncul:
   - From Location: Production (otomatis)
   - To Location: MTN Dies
   - Transferred By: (otomatis nama user)
4. Klik Submit
```

> ⚠️ **SLA:** Transfer harus dilakukan maksimal **n+1** (1 hari kerja setelah RED alert)

**Yang di-verifikasi / Verify:**
- [ ] Tombol "🚚 Transfer to MTN Dies" muncul untuk user PROD
- [ ] Tombol TIDAK muncul jika sudah transferred
- [ ] ppm_alert_status berubah ke `transferred_to_mtn`
- [ ] Location die berubah dari "Production" ke "MTN Dies"
- [ ] `transferred_at` timestamp tercatat
- [ ] Flow Status card menampilkan "PROD: Dies Transferred to MTN"
- [ ] Transfer info tampil di detail (from → to, by, date)
- [ ] Dashboard Timeline: kolom "Transfer (n+1)" terisi

---

### STEP 12: MTN DIES - Start PPM Processing
**Login as:** `mtn_dies`
**URL:** `/dies/{id}` (Die Detail Page)

```
Langkah / Steps:
1. Buka halaman detail die yang transferred_to_mtn
2. Cari tombol/aksi untuk memulai PPM Processing
3. Klik "Start PPM Processing"
```

**Cara via route:**
```
POST /dies/{id}/start-ppm
```

> ⚠️ **SLA:** PPM harus selesai maksimal **n+3** (3 hari kerja setelah RED alert)

**Yang di-verifikasi / Verify:**
- [ ] ppm_alert_status berubah ke `ppm_in_progress`
- [ ] `ppm_started_at` timestamp tercatat
- [ ] Flow Status card menampilkan "MTN Dies: PPM In Progress"
- [ ] Dashboard Timeline: kolom "PPM Start (n+3)" terisi

---

### STEP 13: Decision - "The Process is Normal?"

#### ✅ JIKA NORMAL → Lanjut ke STEP 14
#### ❌ JIKA TIDAK NORMAL → Lihat [Section 6: Additional Repair](#6-flow-test-additional-repair-during-ppm)

---

### STEP 14: MTN DIES - PPM Completed (Record PPM) ⭐ UPDATED
**Login as:** `mtn_dies`
**URL:** `/dies/{id}` (Die Detail Page)

> ⚠️ **PENTING - BUTTON DISABLED LOGIC:** ⭐ NEW
> Tombol "📝 Record PPM" **DISABLED** (abu-abu) sampai die ditransfer ke lokasi MTN Dies.
> - Tombol **disabled** jika `ppm_alert_status` BELUM di `transferred_to_mtn`, `ppm_in_progress`, atau `additional_repair`
> - Tombol **enabled** jika die sudah ditransfer ke MTN (STEP 11 selesai)
> - Info banner kuning akan tampil: "Record PPM disabled: Die harus ditransfer ke lokasi MTN Dies oleh Production terlebih dahulu"
> - Backend juga memvalidasi: request akan ditolak jika die belum ditransfer ke MTN

```
Langkah / Steps:
1. Buka halaman detail die yang ppm_in_progress (atau transferred_to_mtn)
2. Klik tombol "📝 Record PPM" (harus ENABLED / biru)
3. Modal "INSPECTION CHECK PPM DIES" (F-PRO-030-0) akan muncul ⭐ NEW
4. Isi form bagian atas:
   - PPM Date: (hari ini)
   - PIC: (nama teknisi)
   - Maintenance Type: routine / repair / overhaul
5. ⭐ NEW: Pilih Process Type (jika belum diset pada die)
   - Pilihan: BLANK+PIERCE, DRAW, EMBOS, TRIM, FORM, FLANG, RESTRIKE, PIERCE, CAM-PIERCE
   - Otomatis terisi dari process_type die jika sudah diset sebelumnya
6. ⭐ NEW: Isi Inspection Checklist Table:
   - Tabel berisi item-item pengecekan sesuai process type yang dipilih
   - Setiap item memiliki pilihan: ✅ Normal / ⚠️ Unusual (radio button)
   - Kolom Remark: isi keterangan jika ada temuan (opsional)
   - Form Notes otomatis: "Cleaning Dies Lower & Upper", "Check All Bolt Lower & Upper Dies"
7. Isi form bagian bawah:
   - Work Performed: (detail pekerjaan)
   - Parts Replaced: (parts yang diganti, jika ada)
   - Findings: (temuan)
   - Recommendations: (rekomendasi)
   - Checked By: (nama checker)
   - Approved By: (nama approver)
8. Klik "✓ Record PPM"
```

**9 Process Types & Jumlah Checklist Items:** ⭐ NEW
| # | Process Type | Jumlah Item Checklist |
|---|-------------|----------------------|
| 1 | BLANK+PIERCE | 8 items |
| 2 | DRAW | 12 items |
| 3 | EMBOS | 10 items |
| 4 | TRIM | 7 items |
| 5 | FORM | 7 items |
| 6 | FLANG | 9 items |
| 7 | RESTRIKE | 9 items |
| 8 | PIERCE | 9 items |
| 9 | CAM-PIERCE | 9 items |

> ⚠️ **SLA:** PPM finish maksimal **n+4** (4 hari kerja setelah RED alert)

**Yang di-verifikasi / Verify:**
- [ ] ⭐ Tombol "📝 Record PPM" **DISABLED** sebelum die ditransfer ke MTN (STEP 11)
- [ ] ⭐ Tombol berubah ENABLED setelah die ditransfer ke MTN
- [ ] ⭐ Info banner kuning tampil saat tombol disabled
- [ ] ⭐ Tooltip "Die harus ditransfer ke lokasi MTN Dies terlebih dahulu" saat hover tombol disabled
- [ ] ⭐ Backend menolak request jika die belum ditransfer (validasi server-side)
- [ ] ⭐ Modal "INSPECTION CHECK PPM DIES" tampil dengan header info die
- [ ] ⭐ Process Type selector berfungsi dan mengubah checklist items
- [ ] ⭐ Checklist items sesuai process type (lihat tabel di atas)
- [ ] ⭐ Radio button Normal/Unusual berfungsi untuk setiap item
- [ ] ⭐ Remark field bisa diisi per item
- [ ] ⭐ Checklist results tersimpan sebagai JSON di `ppm_histories.checklist_results`
- [ ] ⭐ Process type tersimpan di `ppm_histories.process_type`
- [ ] PPM History record terbuat
- [ ] `ppm_count` bertambah 1
- [ ] `stroke_at_last_ppm` diupdate ke accumulation saat ini
- [ ] `last_ppm_date` diupdate
- [ ] `ppm_finished_at` timestamp tercatat
- [ ] ppm_alert_status berubah ke `ppm_completed` (BUKAN langsung null)
- [ ] Flow Status card menampilkan "PPM Completed - Awaiting Transfer Back"
- [ ] ⭐ PPM History di tab riwayat menampilkan kolom Process dan Checklist (normal/unusual count)
- [ ] Dashboard Timeline: kolom "PPM Finish (n+4)" terisi

---

### STEP 15: SYSTEM - Change Status from Red to Green
**Otomatis saat Record PPM di STEP 14**

```
Verifikasi:
1. Buka halaman detail die
2. Status PPM seharusnya sudah kembali ke 🟢 GREEN
   (karena stroke_at_last_ppm = current accumulation, 
    sehingga siklus 4-lot dimulai dari awal)
```

**Yang di-verifikasi / Verify:**
- [ ] PPM Status berubah dari 🔴 RED ke 🟢 GREEN
- [ ] Stroke percentage kembali ke ~0% (awal siklus baru)
- [ ] Lot progress menunjukkan Lot 1 dari siklus 4-lot baru
- [ ] Accumulation stroke TIDAK reset (tetap berlanjut)

---

### STEP 16: MTN DIES - Dies Location Back to Production ⭐ UPDATED
**Login as:** `mtn_dies`
**URL:** `/dies/{id}` (Die Detail Page)

#### Bahasa Indonesia
Setelah PPM selesai (PPM Completed), **MTN Dies** yang bertanggung jawab untuk mentransfer
die kembali ke Production. Sebelumnya fitur ini ada di role Production, tapi berdasarkan
flow map yang benar, setelah PPM selesai di area MTN Dies, maka MTN Dies yang mengembalikan
die ke lokasi Production.

#### English
After PPM is completed, **MTN Dies** is responsible for transferring the die back to
Production. Previously this feature was assigned to the Production role, but according to
the correct flow map, after PPM is completed in the MTN Dies area, MTN Dies is the one
who returns the die to the Production location.

```
Langkah / Steps:
1. Buka halaman detail die yang ppm_alert_status = 'ppm_completed'
2. Klik tombol "🏭 Transfer Back to Production"
3. Konfirmasi dialog "Transfer dies back to Production?"
4. Klik OK
```

> ⚠️ **PENTING:** Langkah ini TERPISAH dari Record PPM.
> Setelah MTN Dies selesai PPM dan record PPM, MTN Dies juga yang transfer balik ke Production.
> Tombol ini muncul di halaman die detail untuk role **mtn_dies** (bukan production).

**Yang di-verifikasi / Verify:**
- [ ] Tombol "🏭 Transfer Back to Production" muncul untuk **MTN Dies** (bukan PROD)
- [ ] Tombol TIDAK muncul untuk role Production
- [ ] Tombol HANYA muncul ketika ppm_alert_status = `ppm_completed`
- [ ] Location die berubah dari "MTN Dies" kembali ke "Production"
- [ ] ppm_alert_status berubah ke `null` (fully completed)
- [ ] `returned_to_production_at` timestamp tercatat
- [ ] `ppm_total_days` terhitung (hari kerja dari RED alert)
- [ ] Timeline tracking fields di-reset (siap untuk siklus berikutnya)
- [ ] Flash message "Dies has been transferred back to Production. PPM cycle completed."
- [ ] Die hilang dari Dashboard PPM Timeline Tracking table

---

### STEP 17: Finish ✅
**Verifikasi akhir / Final verification:**

```
Langkah / Steps:
1. Buka Dashboard
2. Cek stats cards - die seharusnya kembali ke hitungan GREEN
3. Buka detail die - semua normal, siklus 4-lot baru dimulai
4. Cek bahwa die TIDAK muncul lagi di PPM Timeline Tracking
5. Input produksi baru → accumulation bertambah dari titik terakhir
```

**Yang di-verifikasi / Verify:**
- [ ] Siklus PPM lengkap dari GREEN → ORANGE → RED → PPM → GREEN
- [ ] Die siap memulai siklus 4-lot berikutnya
- [ ] Tidak ada data yang hilang atau terkorupsi

---

## 4. FLOW TEST: Special Scenario - Urgent Delivery

### Skenario / Scenario:
Die sedang dalam proses PPM (`ppm_in_progress`), tapi ada urgent delivery dari customer.

A die is currently undergoing PPM but there's an urgent customer delivery.

---

### STEP U1: Buat Special Repair Request - Urgent Delivery
**Login as:** `production` atau `admin`
**URL:** `/special-repair/create`

```
Langkah / Steps:
1. Buka menu "Special Repair" → klik "Create New Request"
2. Isi form:
   - Die: (pilih die yang sedang PPM / ppm_in_progress)
   - Repair Type: "Urgent Delivery"
   - Priority: Emergency
   - Reason: "Customer PO urgent, deadline 2 hari"
   - Customer PO: "PO-12345"
   - Delivery Deadline: (2 hari dari sekarang)
3. Klik Submit
```

**Yang di-verifikasi / Verify:**
- [ ] Request terbuat dengan status `approved` (auto-approved untuk urgent delivery)
- [ ] Die ppm_alert_status berubah ke `special_repair`
- [ ] `is_ppm_interrupted` = true pada record special repair
- [ ] `previous_ppm_status` menyimpan status sebelumnya (`ppm_in_progress`)

---

### STEP U2: Proses Urgent Delivery
**Login as:** `mtn_dies` atau `production`
**URL:** `/special-repair/{id}`

```
Langkah / Steps:
1. Buka detail Special Repair request
2. Klik "Start Repair" (memulai proses)
3. Setelah delivery selesai, klik "Complete Repair"
4. Isi form completion:
   - Work Performed: "Urgent delivery completed"
   - Actual Repair Hours: (jam aktual)
```

**Yang di-verifikasi / Verify:**
- [ ] Status special repair: pending → approved → in_progress → completed
- [ ] Setelah complete, die ppm_alert_status kembali ke status sebelumnya (`ppm_in_progress`)
- [ ] PPM bisa dilanjutkan kembali

---

### STEP U3: Lanjutkan PPM
**Login as:** `mtn_dies`

```
Langkah / Steps:
1. Buka halaman detail die
2. Pastikan ppm_alert_status kembali ke `ppm_in_progress`
3. Lanjutkan PPM seperti biasa (Record PPM ketika selesai)
```

**Yang di-verifikasi / Verify:**
- [ ] PPM bisa dilanjutkan tanpa masalah
- [ ] Record PPM berjalan normal setelah urgent delivery selesai

---

## 5. FLOW TEST: Special Scenario - Severe Damage

### Skenario / Scenario:
Saat PPM, MTN Dies menemukan kerusakan parah yang membutuhkan perbaikan khusus.

During PPM, MTN Dies discovers severe damage requiring special repair.

---

### STEP S1: Buat Special Repair Request - Severe Damage
**Login as:** `mtn_dies`
**URL:** `/special-repair/create`

```
Langkah / Steps:
1. Buka menu "Special Repair" → klik "Create New Request"
2. Isi form:
   - Die: (pilih die yang sedang PPM)
   - Repair Type: "Severe Damage"
   - Priority: Critical
   - Reason: "Crack pada cavity bagian atas, perlu welding dan machining"
   - Description: (detail kerusakan)
   - Estimated Repair Hours: 40
3. Klik Submit
```

**Yang di-verifikasi / Verify:**
- [ ] Request terbuat dengan status `pending` (PERLU approval, tidak auto-approved)
- [ ] Die ppm_alert_status berubah ke `special_repair`

---

### STEP S2: Manager/Admin Approve
**Login as:** `admin` atau `mgr_gm`
**URL:** `/special-repair/{id}`

```
Langkah / Steps:
1. Buka detail Special Repair request
2. Review detail kerusakan
3. Klik "Approve" untuk menyetujui
```

**Yang di-verifikasi / Verify:**
- [ ] Status berubah dari `pending` ke `approved`
- [ ] `approved_by` dan `approved_at` tercatat

---

### STEP S3: Proses Repair
**Login as:** `mtn_dies`
**URL:** `/special-repair/{id}`

```
Langkah / Steps:
1. Klik "Start Repair"
2. Lakukan perbaikan (timeline extended, tidak terikat SLA 5 hari)
3. Setelah selesai, klik "Complete Repair"
4. Isi work performed, parts replaced, actual hours
```

**Yang di-verifikasi / Verify:**
- [ ] Status flow: approved → in_progress → completed
- [ ] Setelah complete, die ppm_alert_status kembali ke sebelumnya
- [ ] Timeline perbaikan terdokumentasi

---

### STEP S4: Reject Scenario (Optional Test)
**Login as:** `admin`
**URL:** `/special-repair/{id}`

```
Langkah / Steps:
1. Buat request baru dengan type "Severe Damage"
2. Klik "Reject" instead of "Approve"
3. Isi alasan penolakan
```

**Yang di-verifikasi / Verify:**
- [ ] Status berubah ke `rejected`
- [ ] `rejected_by` dan `rejected_at` tercatat
- [ ] Die status kembali normal

---

## 6. FLOW TEST: Additional Repair During PPM ⭐ NEW

### Skenario / Scenario:
Selama Processing PPM, ditemukan bahwa proses TIDAK normal dan butuh perbaikan tambahan.
Per flow map: **"The Process is Normal?" → No → "Additional Repair Dies" → back to "Processing PPM"**

---

### STEP A1: MTN Dies - Mark Additional Repair
**Login as:** `mtn_dies`
**URL:** `/dies/{id}` (Die yang sedang `ppm_in_progress`)

```
Langkah / Steps:
1. Buka halaman detail die yang sedang PPM (ppm_alert_status = 'ppm_in_progress')
2. Klik tombol "🔧 Additional Repair"
3. Konfirmasi dialog "Mark this die for additional repair?"
4. Klik OK
```

> ⚠️ **PENTING:** Tombol ini HANYA muncul jika:
> - User role = `mtn_dies` atau `admin`
> - ppm_alert_status = `ppm_in_progress`

**Yang di-verifikasi / Verify:**
- [ ] Tombol "🔧 Additional Repair" muncul saat PPM in progress
- [ ] ppm_alert_status berubah ke `additional_repair`
- [ ] Flow Status card menampilkan "MTN Dies: Additional Repair Needed"
- [ ] Flash message "Die marked for additional repair. PPM continues after repair."
- [ ] Dashboard Timeline status menampilkan "Additional Repair Needed"

---

### STEP A2: MTN Dies - Resume PPM After Repair
**Login as:** `mtn_dies`
**URL:** `/dies/{id}` (Die yang `additional_repair`)

```
Langkah / Steps:
1. Buka halaman detail die yang additional_repair
2. Klik tombol "▶️ Resume PPM"
3. Konfirmasi dialog "Resume PPM processing after additional repair?"
4. Klik OK
```

> ⚠️ **PENTING:** Tombol ini HANYA muncul jika:
> - User role = `mtn_dies` atau `admin`
> - ppm_alert_status = `additional_repair`

**Yang di-verifikasi / Verify:**
- [ ] Tombol "▶️ Resume PPM" muncul saat additional_repair
- [ ] ppm_alert_status berubah kembali ke `ppm_in_progress`
- [ ] Flow Status card kembali menampilkan "MTN Dies: PPM In Progress"
- [ ] Flash message "PPM processing resumed after additional repair."
- [ ] Bisa di-loop: Additional Repair → Resume → Additional Repair → Resume (berkali-kali)

---

### STEP A3: Setelah Repair Selesai - Lanjut PPM Normal

```
Langkah / Steps:
1. Setelah resume, lanjutkan ke STEP 14 (Record PPM / PPM Completed)
2. Flow berlanjut normal: PPM Completed → Transfer Back → Finish
```

---

## 7. Dashboard Verification

### 7.1 Stats Cards
**URL:** `/dashboard`

**Yang di-verifikasi / Verify:**
- [ ] "Total Dies" = jumlah die aktif
- [ ] "Green Status" = jumlah die yang GREEN
- [ ] "Orange Status" = jumlah die yang ORANGE
- [ ] "Red Status" = jumlah die yang RED
- [ ] Angka berubah real-time sesuai perubahan status

---

### 7.2 TOP 10 by Group (A1, A2, A3, A4)
**URL:** `/dashboard` → section "TOP 10 Dies by Group"

**Yang di-verifikasi / Verify:**
- [ ] 4 kolom ditampilkan: A1 (Hijau), A2 (Biru), A3 (Orange), A4 (Merah)
- [ ] A1 = Dies di Lot 1 siklus (aman)
- [ ] A2 = Dies di Lot 2 siklus (normal)
- [ ] A3 = Dies di Lot 3 siklus / ORANGE status
- [ ] A4 = Dies di Lot 4 siklus / RED status
- [ ] Setiap grup menampilkan max 10 dies
- [ ] Diurutkan berdasarkan stroke percentage (tertinggi dulu)
- [ ] Progress bar dan persentase tampil benar

---

### 7.3 PPM Timeline Tracking Table
**URL:** `/dashboard` → section "PPM Timeline Tracking"

**Yang di-verifikasi / Verify:**
- [ ] Tabel HANYA muncul jika ada die yang sedang dalam proses PPM (RED alert s/d selesai)
- [ ] Kolom: Part Number, Customer, Status, RED Alert (n), Transfer (n+1), PPM Start (n+3), PPM Finish (n+4), Days, SLA
- [ ] Tanggal terisi sesuai milestone
- [ ] Kolom "Days" menghitung hari kerja (weekdays only, exclude weekend)
- [ ] SLA indicator:
  - "On Track" (hijau) jika <= 5 hari
  - "OVERDUE" (merah) jika > 5 hari
- [ ] Row berwarna merah jika overdue
- [ ] Link ke halaman detail die berfungsi
- [ ] Die hilang dari tabel setelah PROD transfer back ke Production

---

### 7.4 Active Special Repairs
**URL:** `/dashboard` → section "Active Special Repairs"

**Yang di-verifikasi / Verify:**
- [ ] Menampilkan special repair yang aktif (pending/approved/in_progress)
- [ ] Menampilkan: Part Number, Type, Priority, Status, Date
- [ ] Warna priority sesuai (emergency=merah, critical=orange, dll)

---

## 8. Checklist Summary / Ringkasan Checklist

### Complete PPM Flow (Main Test)
| Step | Actor | Action | Route | Status |
|------|-------|--------|-------|--------|
| 1 | PE | Input Production Data | POST `/production` | ⬜ |
| 2 | MTN DIES | Setup STD Stroke & LOT | PUT `/dies/{id}` | ⬜ |
| 3 | SYSTEM | Calculate & Determine Color | GET `/dies/{id}` | ⬜ |
| 4 | PE | Input until ORANGE | POST `/production` | ⬜ |
| 5 | SYSTEM | Orange Alert Sent | `php artisan ppm:check-alerts` | ⬜ |
| 6 | PPIC | Set Last LOT Date | POST `/dies/{id}/set-last-lot-date` | ⬜ |
| 7 | MTN DIES | Create Schedule PPM | POST `/dies/{id}/schedule-ppm` | ⬜ |
| 8 | PPIC | Confirm PPM Schedule ⭐ | POST `/dies/{id}/approve-schedule` | ⬜ |
| 9 | PE | Input until RED | POST `/production` | ⬜ |
| 10 | SYSTEM | Red Alert Sent | `php artisan ppm:check-alerts` | ⬜ |
| 11 | PROD | Transfer to MTN Dies | POST `/dies/{id}/transfer` | ⬜ |
| 12 | MTN DIES | Start PPM Processing | POST `/dies/{id}/start-ppm` | ⬜ |
| 13 | MTN DIES | (if not normal) Additional Repair ⭐ | POST `/dies/{id}/additional-repair` | ⬜ |
| 13b | MTN DIES | (after repair) Resume PPM ⭐ | POST `/dies/{id}/resume-ppm` | ⬜ |
| 14 | MTN DIES | Record PPM + Inspection Checklist ⭐ | POST `/dies/{id}/record-ppm` | ⬜ |
| 15 | SYSTEM | Status Red → Green | (automatic) | ⬜ |
| 16 | MTN DIES | Transfer Back to Production ⭐ | POST `/dies/{id}/transfer-back` | ⬜ |
| 17 | - | Finish! Verify all data | GET `/dies/{id}` | ⬜ |

### PPM Alert Status Flow
```
null → orange_alerted → lot_date_set → ppm_scheduled → schedule_approved
                                              ↓
                              red_alerted → transferred_to_mtn → ppm_in_progress
                                                                      ↓        ↑
                                                            additional_repair ──┘
                                                                      ↓
                                                              ppm_completed → null (Transfer Back)
```

### Button Visibility Matrix
| Button | Role | Condition |
|--------|------|-----------|
| ✏️ Edit | admin, mtn_dies | Always |
| 📝 Record PPM | admin, mtn_dies | ⭐ **DISABLED** sampai `ppm_alert_status` = `transferred_to_mtn` / `ppm_in_progress` / `additional_repair` |
| 📅 Set Last LOT Date | admin, ppic | ppm_status = orange/red |
| ✅ Confirm PPM Schedule | admin, ppic | ppm_alert_status = ppm_scheduled |
| 🚚 Transfer to MTN Dies | admin, production | ppm_status = red AND not yet transferred |
| 🔧 Additional Repair | admin, mtn_dies | ppm_alert_status = ppm_in_progress |
| ▶️ Resume PPM | admin, mtn_dies | ppm_alert_status = additional_repair |
| 🏭 Transfer Back to Production | admin, mtn_dies | ppm_alert_status = ppm_completed |

### SLA Timeline Check
| Milestone | Max Days from RED (n) | Check |
|-----------|----------------------|-------|
| Transfer to MTN | n+1 (1 day) | ⬜ |
| PPM Activity | n+3 (3 days) | ⬜ |
| PPM Finish | n+4 (4 days) | ⬜ |
| Total Cycle | n+5 (5 days = 1 week) | ⬜ |

---

### Quick Test Shortcut (Admin Only)

Jika ingin test cepat tanpa ganti-ganti akun, login sebagai **Admin** dan lakukan semua step secara berurutan. Admin memiliki akses ke semua tombol dan fitur.

If you want to test quickly without switching accounts, login as **Admin** and perform all steps sequentially. Admin has access to all buttons and features.

```
Urutan Cepat (Login Admin):
1. Input Production → Trigger ORANGE
2. Schedule PPM (mtn_dies action)
3. Set Last LOT Date (ppic action)
4. Confirm PPM Schedule (ppic action) ⭐ renamed from "Approve"
5. Input Production → Trigger RED
6. Transfer to MTN Dies (prod action)
7. Start PPM Processing (mtn_dies action)
8. (Optional) Additional Repair → Resume PPM
9. Record PPM + Inspection Checklist ⭐ (mtn_dies action) → Status RED → GREEN
10. Transfer Back to Production (mtn_dies action) ⭐ moved to mtn_dies → CYCLE COMPLETE
```

---

---

## 9. Process Type & Inspection Checklist Verification ⭐ NEW

### 9.1 Process Type pada Die Create/Edit
**URL:** `/dies/create` atau `/dies/{id}/edit`

```
Langkah / Steps:
1. Buka form Create Die atau Edit Die
2. Cari field "Process Type" (di antara Line dan Control Stroke)
3. Pilih salah satu dari 9 process type
4. Save
```

**Yang di-verifikasi / Verify:**
- [ ] Dropdown Process Type tampil di form Create dan Edit
- [ ] 9 pilihan tersedia: BLANK+PIERCE, DRAW, EMBOS, TRIM, FORM, FLANG, RESTRIKE, PIERCE, CAM-PIERCE
- [ ] Process Type tersimpan di database (`dies.process_type`)
- [ ] Process Type badge tampil di halaman detail die (bagian Die Information)
- [ ] Process Type otomatis terisi di modal Record PPM

---

### 9.2 Inspection Checklist di Record PPM
**URL:** `/dies/{id}` → klik "📝 Record PPM"

```
Langkah / Steps:
1. Pastikan die sudah ditransfer ke MTN Dies (tombol Record PPM enabled)
2. Klik "📝 Record PPM"
3. Di modal, pilih/ubah Process Type
4. Perhatikan tabel checklist berubah sesuai process type
5. Isi setiap item: Normal atau Unusual
6. Isi Remark jika ada temuan
7. Submit
```

**Test per Process Type:**

| Test | Action | Expected |
|------|--------|----------|
| Ganti process type di modal | Pilih DRAW | Tabel berubah jadi 12 items |
| Ganti ke TRIM | Pilih TRIM | Tabel berubah jadi 7 items |
| Ganti ke CAM-PIERCE | Pilih CAM-PIERCE | Tabel berubah jadi 9 items, termasuk "CAM unit slider" |
| Isi semua Normal | Set semua radio ke Normal | Semua tersimpan sebagai 'normal' |
| Isi beberapa Unusual | Set item 2,3 ke Unusual + remark | Tersimpan dengan result='unusual' + remark |
| Cek PPM History | Lihat tab PPM History | Kolom Process menampilkan badge, kolom Checklist menampilkan "N normal, M unusual" |

**Yang di-verifikasi / Verify:**
- [ ] Checklist items berubah dinamis saat process type diganti
- [ ] Default semua item = Normal
- [ ] Radio button Normal/Unusual berfungsi per item
- [ ] Remark field bisa diisi per item
- [ ] Data checklist tersimpan sebagai JSON array di `ppm_histories.checklist_results`
- [ ] Format JSON: `[{item_no, description, result: 'normal'/'unusual', remark}]`
- [ ] PPM History table menampilkan kolom Process dan Checklist count

---

### 9.3 Record PPM Button Disabled Logic ⭐ NEW
**URL:** `/dies/{id}` (Die Detail Page)

Test bahwa tombol Record PPM benar-benar disabled sebelum transfer:

| Die Status | ppm_alert_status | Button State | Expected |
|-----------|-----------------|-------------|----------|
| 🟢 GREEN | null | Disabled (abu-abu) | ✅ |
| 🟠 ORANGE | orange_alerted | Disabled | ✅ |
| 🟠 ORANGE | lot_date_set | Disabled | ✅ |
| 🟠 ORANGE | ppm_scheduled | Disabled | ✅ |
| 🟠 ORANGE | schedule_approved | Disabled | ✅ |
| 🔴 RED | red_alerted | Disabled | ✅ |
| 🔴 RED | **transferred_to_mtn** | **ENABLED** (biru) | ✅ |
| 🔴 RED | **ppm_in_progress** | **ENABLED** | ✅ |
| 🔴 RED | **additional_repair** | **ENABLED** | ✅ |
| 🟢 GREEN | ppm_completed | Disabled | ✅ |

**Yang di-verifikasi / Verify:**
- [ ] Button disabled menampilkan warna abu-abu (`bg-gray-300`)
- [ ] Button disabled menampilkan cursor `not-allowed`
- [ ] Tooltip saat hover disabled: "Die harus ditransfer ke lokasi MTN Dies terlebih dahulu"
- [ ] Info banner kuning tampil saat die RED tapi belum ditransfer
- [ ] Backend validasi: POST `/dies/{id}/record-ppm` mengembalikan error jika die belum ditransfer

---

### 9.4 Database Schema Changes ⭐ NEW

**Migration:** `add_process_type_and_checklist_to_dies_and_ppm_histories`

| Table | Column | Type | Description |
|-------|--------|------|-------------|
| `dies` | `process_type` | varchar(30), nullable | Jenis proses die (blank_pierce, draw, etc.) |
| `ppm_histories` | `process_type` | varchar(30), nullable | Process type saat PPM dilakukan |
| `ppm_histories` | `checklist_results` | JSON, nullable | Hasil inspection checklist |

**Contoh `checklist_results` JSON:**
```json
[
    {
        "item_no": 1,
        "description": "The state Upper plate Lower plate, bent, deformed or not.",
        "result": "normal",
        "remark": ""
    },
    {
        "item_no": 2,
        "description": "The state Stripper pad bent, deformed or not.",
        "result": "unusual",
        "remark": "Sedikit bengkok, perlu straightening"
    }
]
```

---

## 10. Schedule Calendar - Smart Scheduling ⭐ NEW

### Bahasa Indonesia
Halaman Schedule Calendar (`/schedule`) telah ditingkatkan untuk memudahkan user **MTN Dies**
dalam membuat jadwal PPM. Sebelumnya, MTN Dies harus mencari secara manual die mana yang
sudah mempunyai LOT date (dari PPIC) dan perlu dijadwalkan PPM. Sekarang ada fitur:

1. **Filter "Perlu Dijadwalkan"** — Tombol filter yang langsung menampilkan hanya die-die yang
   sudah punya LOT date tapi belum dijadwalkan PPM. Ada indikator animasi (ping) agar terlihat jelas.

2. **Filter "Sudah Dijadwalkan"** — Tombol filter untuk melihat die-die yang sudah memiliki
   jadwal PPM, sehingga bisa di-review atau di-update.

3. **Visual Highlight** — Baris die yang perlu dijadwalkan di-highlight kuning (amber) dengan
   border kiri tebal dan badge "📅 SCHEDULE" di samping part number.

4. **Info LOT Date & Schedule Date** — Ditampilkan di bawah part name:
   - `📅 LOT: 02-Mar-2026` (tanggal LOT date yang di-set PPIC)
   - `✅ Scheduled: 05-Mar-2026` (tanggal jadwal PPM)

5. **Summary Stat Cards** — Card "🔔 Perlu Dijadwalkan" dan "✅ Sudah Dijadwalkan" yang
   bisa diklik langsung sebagai shortcut filter. Angka menunjukkan jumlah die di masing-masing kategori.

### English
The Schedule Calendar page (`/schedule`) has been enhanced to help **MTN Dies** users
create PPM schedules more easily. Previously, MTN Dies had to manually search for dies that
already have a LOT date (set by PPIC) and need PPM scheduling. Now there are features:

1. **"Needs Scheduling" Filter** — A filter button that shows only dies that already have a
   LOT date but haven't been scheduled for PPM yet. Has an animated ping indicator for visibility.

2. **"Already Scheduled" Filter** — A filter button to view dies that already have a PPM
   schedule, for review or updates.

3. **Visual Highlight** — Rows of dies needing scheduling are highlighted in amber/yellow with
   a thick left border and a "📅 SCHEDULE" badge next to the part number.

4. **LOT Date & Schedule Date Info** — Displayed below the part name:
   - `📅 LOT: 02-Mar-2026` (LOT date set by PPIC)
   - `✅ Scheduled: 05-Mar-2026` (PPM schedule date)

5. **Summary Stat Cards** — "🔔 Needs Scheduling" and "✅ Already Scheduled" cards that can
   be clicked as filter shortcuts. Numbers show the count of dies in each category.

---

### 10.1 Test: Schedule Calendar Filters
**Login as:** `mtn_dies`
**URL:** `/schedule`

```
Langkah / Steps:
1. Buka menu "Schedule Calendar"
2. Pastikan ada die yang sudah di-set LOT date oleh PPIC (dari Step 6)
3. Perhatikan tombol filter di bawah filter Year/Customer/Tonnage:
   - "📋 Semua" (default, tampilkan semua)
   - "🔔 Perlu Dijadwalkan (N)" (hanya die yang perlu dijadwalkan)
   - "✅ Sudah Dijadwalkan (N)" (hanya die yang sudah dijadwalkan)
4. Klik "🔔 Perlu Dijadwalkan" → tabel hanya menampilkan die yang perlu jadwal
5. Klik lagi untuk kembali ke "Semua"
6. Klik "✅ Sudah Dijadwalkan" → tabel hanya menampilkan die yang sudah dijadwalkan
```

**Yang di-verifikasi / Verify:**
- [ ] Filter buttons muncul untuk role `mtn_dies` dan `admin`
- [ ] Filter buttons TIDAK muncul jika tidak ada die yang perlu dijadwalkan
- [ ] Tombol "📋 Semua" menampilkan semua dies
- [ ] Tombol "🔔 Perlu Dijadwalkan (N)" menampilkan hanya dies yang butuh jadwal
  - Angka (N) sesuai jumlah die yang perlu dijadwalkan
  - Ada indikator animasi ping pada tombol ini
- [ ] Tombol "✅ Sudah Dijadwalkan (N)" menampilkan hanya dies yang sudah dijadwalkan
  - Angka (N) sesuai jumlah die yang sudah dijadwalkan
- [ ] Toggle behavior: klik filter aktif → kembali ke "Semua"
- [ ] Keterangan teks muncul saat filter aktif (menjelaskan filter apa yang aktif)
- [ ] Group header tetap tampil dengan benar saat filter aktif

---

### 10.2 Test: Visual Highlighting
**Login as:** `mtn_dies`
**URL:** `/schedule`

**Yang di-verifikasi / Verify:**
- [ ] Die yang perlu dijadwalkan → baris di-highlight kuning/amber
- [ ] Border kiri tebal berwarna amber pada nomor baris
- [ ] Badge "📅 SCHEDULE" muncul di samping part number (animasi pulse)
- [ ] Hover badge menampilkan tooltip: "LOT Date: dd-MMM-YYYY (by nama_ppic)"
- [ ] Die yang TIDAK perlu dijadwalkan → baris normal (tanpa highlight)

---

### 10.3 Test: LOT Date & Schedule Date Info
**Login as:** `mtn_dies`
**URL:** `/schedule`

**Yang di-verifikasi / Verify:**
- [ ] Di bawah Part Name, tampil info LOT date jika sudah di-set: "📅 LOT: dd-MMM-YYYY"
- [ ] Hover pada LOT date menampilkan "Set by nama_ppic"
- [ ] Di bawah Part Name, tampil info schedule jika sudah dijadwalkan: "✅ Scheduled: dd-MMM-YYYY"
- [ ] Hover pada schedule date menampilkan "Scheduled by nama_mtn"
- [ ] Jika belum ada LOT date → info tidak tampil
- [ ] Jika belum dijadwalkan → hanya LOT date yang tampil

---

### 10.4 Test: Summary Stat Cards
**Login as:** `mtn_dies`
**URL:** `/schedule`

**Yang di-verifikasi / Verify:**
- [ ] Summary stats menampilkan 6 cards (4 status + 2 scheduling) untuk mtn_dies
- [ ] Summary stats menampilkan 4 cards untuk role lain (tanpa scheduling cards)
- [ ] Card "🔔 Perlu Dijadwalkan" menampilkan jumlah yang benar
  - Background amber jika ada die yang perlu dijadwalkan
  - Background gray jika tidak ada
- [ ] Card "✅ Sudah Dijadwalkan" menampilkan jumlah yang benar
  - Background green jika ada die yang sudah dijadwalkan
  - Background gray jika tidak ada
- [ ] Klik card → aktifkan filter yang sesuai (shortcut filter)
- [ ] Klik card yang sudah aktif → kembali ke "Semua"
- [ ] Ring/border highlight pada card yang filter-nya sedang aktif

---

### 10.5 "Needs Scheduling" Logic / Logika Needs Scheduling

#### Bahasa Indonesia
Die ditandai sebagai "Perlu Dijadwalkan" jika **semua** kondisi ini terpenuhi:
1. `last_lot_date` sudah di-set (PPIC sudah set tanggal LOT terakhir)
2. `ppm_scheduled_date` belum ada (MTN Dies belum buat jadwal PPM)
3. `ppm_alert_status` masih dalam fase awal: `lot_date_set`, `orange_alerted`, atau `null`

#### English
A die is flagged as "Needs Scheduling" when **all** these conditions are met:
1. `last_lot_date` is set (PPIC has set the last LOT date)
2. `ppm_scheduled_date` is not set yet (MTN Dies hasn't created a PPM schedule)
3. `ppm_alert_status` is still in early phase: `lot_date_set`, `orange_alerted`, or `null`

**Backend location:** `ScheduleController@transformToScheduleData` → `needs_scheduling` flag

---

### 10.6 Legend Items
**URL:** `/schedule` → bagian bawah tabel

**Yang di-verifikasi / Verify:**
- [ ] Legend menampilkan item "📅 SCHEDULE = Perlu Dijadwalkan PPM" (hanya untuk mtn_dies/admin)
- [ ] Legend item tidak tampil untuk role lain

---

*Document Version: 1.2*
*Last Updated: March 2, 2026*
*Related: PPM_WORKFLOW_DOCUMENTATION.md*
