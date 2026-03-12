# PPM DIES MONITORING - COMPLETE LOGIC DOCUMENTATION
# DOKUMENTASI LOGIC LENGKAP MONITORING PPM DIES

---

## Table of Contents / Daftar Isi

1. [System Overview / Ikhtisar Sistem](#1-system-overview--ikhtisar-sistem)
2. [PPM Status Logic (GREEN/ORANGE/RED)](#2-ppm-status-logic-greenorangered)
3. [Group Classification (A1, A2, A3, A4)](#3-group-classification-a1-a2-a3-a4)
4. [STD 3-Day Tolerance (Allowance) = Max 1 LOT](#4-std-3-day-tolerance-allowance--max-1-lot)
5. [ORANGE Status → PPM Preparation Workflow](#5-orange-status--ppm-preparation-workflow)
6. [RED Status → PPM Execution Workflow](#6-red-status--ppm-execution-workflow)
7. [RED to GREEN → PPM Completion Workflow](#7-red-to-green--ppm-completion-workflow)
8. [PPM Timeline SLA (Max 5 Working Days)](#8-ppm-timeline-sla-max-5-working-days)
9. [Special Scenarios During PPM](#9-special-scenarios-during-ppm)
10. [Special Dies Repair Menu](#10-special-dies-repair-menu)
11. [Dashboard TOP 10 by Group](#11-dashboard-top-10-by-group)
12. [User Roles & Responsibilities](#12-user-roles--responsibilities)
13. [Complete PPM Flow Diagram](#13-complete-ppm-flow-diagram)

---

## 1. System Overview / Ikhtisar Sistem

### English
The PPM (Preventive & Predictive Maintenance) Dies Monitoring System tracks the lifecycle of manufacturing dies to ensure timely maintenance. Every die has an accumulation stroke counter that increases with each production run. When the stroke count approaches the PPM threshold, the system triggers alerts and initiates a structured workflow.

**Key Concept: "Every 4 Lots" Rule**
- Standard stroke is divided into lots (e.g., 6000 strokes / 600 per lot = 10 lots)
- PPM is required every 4 lots
- Status changes from GREEN → ORANGE → RED as the die approaches each 4-lot checkpoint

### Bahasa Indonesia
Sistem Monitoring PPM (Preventive & Predictive Maintenance) Dies melacak siklus hidup dies manufaktur untuk memastikan perawatan tepat waktu. Setiap die memiliki penghitung akumulasi stroke yang bertambah setiap produksi berjalan. Ketika jumlah stroke mendekati ambang PPM, sistem memicu alert dan memulai alur kerja terstruktur.

**Konsep Utama: Aturan "Setiap 4 Lot"**
- Standard stroke dibagi menjadi lot (contoh: 6000 strokes / 600 per lot = 10 lot)
- PPM diperlukan setiap 4 lot
- Status berubah dari GREEN → ORANGE → RED saat die mendekati checkpoint setiap 4 lot

---

## 2. PPM Status Logic (GREEN/ORANGE/RED)

### English

The PPM status is calculated dynamically based on the die's current accumulation stroke relative to the next PPM checkpoint.

**Formula:**
```
Next PPM Stroke = stroke_at_last_ppm + (4 × lot_size)
Orange Threshold = Next PPM Stroke - lot_size (1 lot before checkpoint)
```

**Status Rules:**
| Status | Condition | Description |
|--------|-----------|-------------|
| 🟢 GREEN | `accumulation < orange_threshold` | Safe. Lot 1-2 of 4-lot cycle. Normal production. |
| 🟠 ORANGE | `accumulation >= orange_threshold AND < next_ppm_stroke` | Warning. Lot 3. Plan PPM soon. |
| 🔴 RED | `accumulation >= next_ppm_stroke` | Critical. Lot 4+. PPM overdue! Stop production. |

**Example (Standard: 6000, Lot Size: 1500):**
```
PPM Checkpoint 1: stroke 6000 (4 lots × 1500)
- GREEN zone: 0 - 4,499 strokes (Lot 1-2)
- ORANGE zone: 4,500 - 5,999 strokes (Lot 3, Warning)
- RED zone: 6,000+ strokes (Lot 4, PPM Required!)
```

### Bahasa Indonesia

Status PPM dihitung secara dinamis berdasarkan akumulasi stroke die saat ini relatif terhadap checkpoint PPM berikutnya.

**Rumus:**
```
Next PPM Stroke = stroke_pada_ppm_terakhir + (4 × ukuran_lot)
Ambang Orange = Next PPM Stroke - ukuran_lot (1 lot sebelum checkpoint)
```

**Aturan Status:**
| Status | Kondisi | Deskripsi |
|--------|---------|-----------|
| 🟢 GREEN | `akumulasi < ambang_orange` | Aman. Lot 1-2 dari siklus 4 lot. Produksi normal. |
| 🟠 ORANGE | `akumulasi >= ambang_orange DAN < next_ppm_stroke` | Peringatan. Lot 3. Segera rencanakan PPM. |
| 🔴 RED | `akumulasi >= next_ppm_stroke` | Kritis. Lot 4+. PPM terlambat! Hentikan produksi. |

---

## 3. Group Classification (A1, A2, A3, A4)

### English

Dies are classified into 4 groups based on their position in the 4-lot PPM cycle:

| Group | Position | Status | Description |
|-------|----------|--------|-------------|
| **A1** | Lot 1 of cycle | 🟢 Safe | Die just completed PPM or is at the start of a new cycle. Full 4 lots remaining. |
| **A2** | Lot 2 of cycle | 🔵 Normal | Die is in normal production. 2-3 lots remaining before PPM. |
| **A3** | Lot 3 of cycle | 🟠 Warning | Die is approaching PPM checkpoint. 1 lot remaining. ORANGE alert zone. |
| **A4** | Lot 4 of cycle | 🔴 Critical | Die has reached/exceeded PPM checkpoint. Immediate PPM required. RED alert zone. |

**Dashboard Display:**
The Dashboard shows TOP 10 dies in each group (A1-A4), sorted by stroke percentage (highest first). This replaces the Production Trend chart.

### Bahasa Indonesia

Dies diklasifikasikan ke dalam 4 grup berdasarkan posisinya dalam siklus PPM 4 lot:

| Grup | Posisi | Status | Deskripsi |
|------|--------|--------|-----------|
| **A1** | Lot 1 dari siklus | 🟢 Aman | Die baru selesai PPM atau di awal siklus baru. Sisa 4 lot penuh. |
| **A2** | Lot 2 dari siklus | 🔵 Normal | Die dalam produksi normal. Sisa 2-3 lot sebelum PPM. |
| **A3** | Lot 3 dari siklus | 🟠 Peringatan | Die mendekati checkpoint PPM. Sisa 1 lot. Zona ORANGE alert. |
| **A4** | Lot 4 dari siklus | 🔴 Kritis | Die telah mencapai/melewati checkpoint PPM. PPM segera diperlukan. Zona RED alert. |

**Tampilan Dashboard:**
Dashboard menampilkan TOP 10 dies di setiap grup (A1-A4), diurutkan berdasarkan persentase stroke (tertinggi dulu). Ini menggantikan chart Production Trend.

---

## 4. STD 3-Day Tolerance (Allowance) = Max 1 LOT

### English

The system provides a **3-day tolerance (allowance)** before the PPM deadline, which equals a maximum of **1 LOT** size of production.

**Rule:**
- When a die enters ORANGE status (1 lot before PPM checkpoint), production may continue for a maximum of **1 additional LOT** (≈ 3 working days)
- This is the "warning zone" where PPIC must schedule the last LOT
- Once this tolerance is consumed and the die enters RED, production **MUST STOP**

**Example:**
```
Standard: 6000, Lot Size: 1500
Orange at: 4,500 (1 lot before 6,000)
Tolerance: 4,500 → 5,999 = up to 1,500 strokes = approx. 3 days
```

### Bahasa Indonesia

Sistem memberikan **toleransi 3 hari (allowance)** sebelum batas waktu PPM, yang setara dengan maksimum **1 LOT** ukuran produksi.

**Aturan:**
- Ketika die masuk status ORANGE (1 lot sebelum checkpoint PPM), produksi boleh berlanjut maksimum **1 LOT tambahan** (≈ 3 hari kerja)
- Ini adalah "zona peringatan" di mana PPIC harus menjadwalkan LOT terakhir
- Setelah toleransi ini habis dan die masuk RED, produksi **HARUS BERHENTI**

---

## 5. ORANGE Status → PPM Preparation Workflow

### English

When a die reaches **ORANGE** status (1 lot before PPM checkpoint):

**Step-by-step flow:**

| Step | Actor | Action | System Update |
|------|-------|--------|---------------|
| 1 | System | Die enters ORANGE zone → Alert sent | `ppm_alert_status = 'orange_alerted'` |
| 2 | PPIC | Create/confirm schedule for **last LOT** | `ppm_alert_status = 'lot_date_set'`, `last_lot_date` recorded |
| 3 | MTN Dies | Create PPM Schedule (when to perform PPM) | `ppm_alert_status = 'ppm_scheduled'`, PPM Schedule record created |
| 4 | PPIC | Confirm the PPM schedule | Schedule confirmed |

**Alert Recipients (ORANGE):**
- MGR/GM (Manager/General Manager)
- MD (Managing Director)
- MTN Dies (Maintenance Dies)
- PPIC
- PROD (Production)

### Bahasa Indonesia

Ketika die mencapai status **ORANGE** (1 lot sebelum checkpoint PPM):

**Alur langkah demi langkah:**

| Langkah | Pelaku | Aksi | Update Sistem |
|---------|--------|------|---------------|
| 1 | Sistem | Die masuk zona ORANGE → Alert dikirim | `ppm_alert_status = 'orange_alerted'` |
| 2 | PPIC | Buat/konfirmasi jadwal untuk **LOT terakhir** | `ppm_alert_status = 'lot_date_set'`, `last_lot_date` dicatat |
| 3 | MTN Dies | Buat Jadwal PPM (kapan PPM dilakukan) | `ppm_alert_status = 'ppm_scheduled'`, record PPM Schedule dibuat |
| 4 | PPIC | Konfirmasi jadwal PPM | Jadwal dikonfirmasi |

---

## 6. RED Status → PPM Execution Workflow

### English

When a die reaches **RED** status (at or beyond PPM checkpoint):

**Step-by-step flow:**

| Step | Actor | Action | Timeline | System Update |
|------|-------|--------|----------|---------------|
| 1 | System | RED alert triggered (day **n**) | n | `ppm_alert_status = 'red_alerted'`, `red_alerted_at = now()` |
| 2 | PROD | Transfer dies from Production area to Maintenance Dies area | **max n+1** | `ppm_alert_status = 'transferred_to_mtn'`, `transferred_at = now()` |
| 3 | MTN Dies | Start PPM activity | n+1 to n+3 | `ppm_alert_status = 'ppm_in_progress'`, `ppm_started_at = now()` |
| 4 | MTN Dies | PPM activity (cleaning, inspection, repair) | **max n+3** | PPM work in progress |

**Key Rules:**
- **Transfer max n+1**: Production must transfer the dies to maintenance within 1 working day of RED alert
- **PPM activity max n+3**: PPM work must be completed within 3 working days of RED alert

### Bahasa Indonesia

Ketika die mencapai status **RED** (pada atau melewati checkpoint PPM):

**Alur langkah demi langkah:**

| Langkah | Pelaku | Aksi | Timeline | Update Sistem |
|---------|--------|------|----------|---------------|
| 1 | Sistem | RED alert dipicu (hari **n**) | n | `ppm_alert_status = 'red_alerted'`, `red_alerted_at = now()` |
| 2 | PROD | Transfer dies dari area Produksi ke area Maintenance Dies | **maks n+1** | `ppm_alert_status = 'transferred_to_mtn'`, `transferred_at = now()` |
| 3 | MTN Dies | Mulai aktivitas PPM | n+1 sampai n+3 | `ppm_alert_status = 'ppm_in_progress'`, `ppm_started_at = now()` |
| 4 | MTN Dies | Aktivitas PPM (pembersihan, inspeksi, perbaikan) | **maks n+3** | Pekerjaan PPM berlangsung |

**Aturan Utama:**
- **Transfer maks n+1**: Produksi harus mentransfer dies ke maintenance dalam 1 hari kerja setelah RED alert
- **Aktivitas PPM maks n+3**: Pekerjaan PPM harus selesai dalam 3 hari kerja setelah RED alert

---

## 7. RED to GREEN → PPM Completion Workflow

### English

After PPM activity is completed:

| Step | Actor | Action | Timeline | System Update |
|------|-------|--------|----------|---------------|
| 1 | MTN Dies | PPM finish (record results) | **max n+4** | `ppm_finished_at = now()`, PPM History recorded |
| 2 | MTN Dies | Transfer dies back to Production area | **max n+4** | `returned_to_production_at = now()`, `location = 'Production'` |
| 3 | System | Status reset to GREEN | Immediate | `ppm_alert_status = null`, `stroke_at_last_ppm = current_accumulation`, `ppm_count++` |

**Key Rules:**
- **PPM finish max n+4**: PPM must be completed and dies transferred back within 4 working days of RED alert
- After PPM completion, the die starts a new 4-lot cycle from the current accumulation point
- **Accumulation stroke is NOT reset** - it continues from the current value

### Bahasa Indonesia

Setelah aktivitas PPM selesai:

| Langkah | Pelaku | Aksi | Timeline | Update Sistem |
|---------|--------|------|----------|---------------|
| 1 | MTN Dies | PPM selesai (catat hasil) | **maks n+4** | `ppm_finished_at = now()`, PPM History dicatat |
| 2 | MTN Dies | Transfer dies kembali ke area Produksi | **maks n+4** | `returned_to_production_at = now()`, `location = 'Production'` |
| 3 | Sistem | Status direset ke GREEN | Langsung | `ppm_alert_status = null`, `stroke_at_last_ppm = akumulasi_saat_ini`, `ppm_count++` |

**Aturan Utama:**
- **PPM selesai maks n+4**: PPM harus selesai dan dies ditransfer kembali dalam 4 hari kerja setelah RED alert
- Setelah PPM selesai, die memulai siklus 4 lot baru dari titik akumulasi saat ini
- **Akumulasi stroke TIDAK direset** - berlanjut dari nilai saat ini

---

## 8. PPM Timeline SLA (Max 5 Working Days)

### English

**Total PPM from RED alert = Maximum 1 week = 5 working days**

| Day | Activity | Responsible | SLA |
|-----|----------|-------------|-----|
| **n** (Day 0) | RED alert triggered | System | Automatic |
| **n+1** (Day 1) | PROD transfers dies to MTN | Production | Max 1 day |
| **n+1 to n+3** (Day 1-3) | PPM activity (clean, inspect, repair) | MTN Dies | Max 3 days |
| **n+4** (Day 4) | PPM finish + transfer back to PROD | MTN Dies | Max 4 days from RED |
| **n+4 to n+5** (Day 4-5) | Buffer / verification | All | Max 5 days total |

**SLA Monitoring on Dashboard:**
The dashboard shows a PPM Timeline Tracking table for all dies currently in RED/PPM status:
- **On Track** (green): Within the SLA timeline
- **OVERDUE** (red): Exceeded the maximum allowed days

**Columns tracked:**
1. Part Number
2. Customer
3. Current Status
4. RED Alert date (n)
5. Transfer date (n+1)
6. PPM Start date
7. PPM Finish date (n+4)
8. Days elapsed
9. SLA status (On Track / OVERDUE)

### Bahasa Indonesia

**Total PPM dari RED alert = Maksimum 1 minggu = 5 hari kerja**

| Hari | Aktivitas | Penanggung Jawab | SLA |
|------|-----------|------------------|-----|
| **n** (Hari 0) | RED alert dipicu | Sistem | Otomatis |
| **n+1** (Hari 1) | PROD transfer dies ke MTN | Produksi | Maks 1 hari |
| **n+1 sampai n+3** (Hari 1-3) | Aktivitas PPM (bersihkan, inspeksi, perbaikan) | MTN Dies | Maks 3 hari |
| **n+4** (Hari 4) | PPM selesai + transfer kembali ke PROD | MTN Dies | Maks 4 hari dari RED |
| **n+4 sampai n+5** (Hari 4-5) | Buffer / verifikasi | Semua | Maks 5 hari total |

**Monitoring SLA di Dashboard:**
Dashboard menampilkan tabel PPM Timeline Tracking untuk semua dies yang sedang dalam status RED/PPM:
- **On Track** (hijau): Masih dalam timeline SLA
- **OVERDUE** (merah): Melebihi hari maksimum yang diizinkan

---

## 9. Special Scenarios During PPM

### 9.1 Urgent Delivery During PPM / Delivery Mendesak Saat PPM

#### English

**Scenario:** A die is currently undergoing PPM (status: `ppm_in_progress`) but there is an urgent customer delivery that requires this specific die.

**Handling Process:**
1. Create a "Special Dies Repair" request with type `urgent_delivery`
2. System **auto-approves** the request (priority: EMERGENCY)
3. PPM is **paused** (status changes to `special_repair`)
4. Die is **temporarily transferred back** to Production for the urgent delivery
5. Previous PPM status and location are saved for restoration
6. After urgent delivery is fulfilled, die is transferred back to MTN Dies
7. PPM **resumes** from where it was paused

**Decision Factors:**
- Customer PO deadline
- Quantity required
- Alternative dies availability
- Current PPM progress (if nearly complete, may finish PPM first)

#### Bahasa Indonesia

**Skenario:** Die sedang menjalani PPM (status: `ppm_in_progress`) tetapi ada delivery mendesak dari customer yang membutuhkan die ini.

**Proses Penanganan:**
1. Buat permintaan "Special Dies Repair" dengan tipe `urgent_delivery`
2. Sistem **otomatis menyetujui** permintaan (prioritas: EMERGENCY)
3. PPM **dijeda** (status berubah ke `special_repair`)
4. Die **sementara ditransfer kembali** ke Produksi untuk delivery mendesak
5. Status PPM dan lokasi sebelumnya disimpan untuk pemulihan
6. Setelah delivery mendesak terpenuhi, die ditransfer kembali ke MTN Dies
7. PPM **dilanjutkan** dari posisi terakhir

---

### 9.2 Severe Damage During PPM / Kerusakan Parah Saat PPM

#### English

**Scenario:** During PPM inspection, the maintenance team discovers that the die has severe/extensive damage beyond normal PPM scope.

**Handling Process:**
1. MTN Dies creates a "Special Dies Repair" request with type `severe_damage`
2. Request requires **approval** from Manager/Admin (priority: CRITICAL)
3. PPM status changes to `special_repair`
4. Extended repair timeline is initiated (beyond normal 5-day SLA)
5. Detailed damage description, estimated repair hours, and parts needed are documented
6. After approval, repair begins with dedicated PIC
7. Upon completion:
   - If die is repairable: Complete repair → Resume PPM → Return to Production
   - If die is irreparable: Mark die as `disposed` or `inactive`

**Key Differences from Normal PPM:**
- Extended timeline (not bound by 5-day SLA)
- Requires management approval
- May need special parts or external vendor
- Detailed documentation required

#### Bahasa Indonesia

**Skenario:** Selama inspeksi PPM, tim maintenance menemukan bahwa die memiliki kerusakan parah/luas di luar cakupan PPM normal.

**Proses Penanganan:**
1. MTN Dies membuat permintaan "Special Dies Repair" dengan tipe `severe_damage`
2. Permintaan memerlukan **persetujuan** dari Manager/Admin (prioritas: CRITICAL)
3. Status PPM berubah ke `special_repair`
4. Timeline perbaikan diperpanjang (melewati SLA 5 hari normal)
5. Deskripsi kerusakan detail, estimasi jam perbaikan, dan parts yang dibutuhkan didokumentasikan
6. Setelah disetujui, perbaikan dimulai dengan PIC khusus
7. Setelah selesai:
   - Jika die bisa diperbaiki: Selesaikan repair → Lanjutkan PPM → Kembali ke Produksi
   - Jika die tidak bisa diperbaiki: Tandai die sebagai `disposed` atau `inactive`

---

## 10. Special Dies Repair Menu

### English

A new menu "Special Dies Repair" has been added to handle exceptional cases:

**Access:** Admin, MTN Dies, Production

**Repair Types:**
| Type | Description | Approval |
|------|-------------|----------|
| `urgent_delivery` | PPM interrupted for urgent customer delivery | Auto-approved |
| `severe_damage` | Severe damage found during PPM | Requires manager approval |
| `special_request` | Other special repair needs | Requires manager approval |

**Workflow States:**
```
Pending → Approved → In Progress → Completed
                  ↘ Rejected
```

**Features:**
- Track PPM interruptions
- Record delivery deadlines and customer PO
- Document work performed, parts replaced, findings
- Calculate actual repair duration
- Restore previous PPM status after completion

### Bahasa Indonesia

Menu baru "Special Dies Repair" ditambahkan untuk menangani kasus luar biasa:

**Akses:** Admin, MTN Dies, Production

**Tipe Perbaikan:**
| Tipe | Deskripsi | Persetujuan |
|------|-----------|-------------|
| `urgent_delivery` | PPM diinterupsi untuk delivery mendesak customer | Otomatis disetujui |
| `severe_damage` | Kerusakan parah ditemukan saat PPM | Perlu persetujuan manager |
| `special_request` | Kebutuhan perbaikan khusus lainnya | Perlu persetujuan manager |

**Alur Status:**
```
Pending → Approved → In Progress → Completed
                  ↘ Rejected
```

---

## 11. Dashboard TOP 10 by Group

### English

The dashboard now displays **TOP 10 Dies by Group (A1-A4)** in place of the Production Trend chart.

**Display:**
- 4 columns, one for each group (A1, A2, A3, A4)
- Each column shows up to 10 dies sorted by stroke percentage (highest first)
- Each die shows: part number, customer code, progress bar, and percentage
- Color-coded by group: A1=Green, A2=Blue, A3=Orange, A4=Red

**Group Assignment Logic:**
1. If die has explicit `die_group` field set → use that
2. Otherwise, auto-calculated based on:
   - RED status → A4
   - ORANGE status → A3
   - Lot position 1 in cycle → A1
   - Lot position 2 in cycle → A2
   - Lot position 3 in cycle → A3
   - Lot position 4+ → A4

### Bahasa Indonesia

Dashboard sekarang menampilkan **TOP 10 Dies berdasarkan Grup (A1-A4)** menggantikan chart Production Trend.

**Tampilan:**
- 4 kolom, satu untuk setiap grup (A1, A2, A3, A4)
- Setiap kolom menampilkan hingga 10 dies diurutkan berdasarkan persentase stroke (tertinggi dulu)
- Setiap die menampilkan: part number, kode customer, progress bar, dan persentase
- Warna berdasarkan grup: A1=Hijau, A2=Biru, A3=Orange, A4=Merah

---

## 12. User Roles & Responsibilities

### English / Bahasa Indonesia

| Role | Code | PPM Responsibilities |
|------|------|---------------------|
| Admin | `admin` | Full access to all features / Akses penuh ke semua fitur |
| Production Engineering | `pe` | Log production output / Catat output produksi |
| Maintenance Dies | `mtn_dies` | Perform PPM, schedule PPM, manage dies, special repair / Lakukan PPM, jadwalkan PPM, kelola dies, perbaikan khusus |
| Manager/GM | `mgr_gm` | Approve special repairs, receive alerts / Setujui perbaikan khusus, terima alert |
| Managing Director | `md` | Strategic oversight, receive alerts / Pengawasan strategis, terima alert |
| PPIC | `ppic` | Set last LOT date, confirm schedule / Atur tanggal LOT terakhir, konfirmasi jadwal |
| Production | `production` | Transfer dies, log production, special repair requests / Transfer dies, catat produksi, permintaan perbaikan khusus |

---

## 13. Complete PPM Flow Diagram

### English

```
PRODUCTION RUNNING
        │
        ▼
   Accumulation Stroke increases with each production
        │
        ▼
   ┌─── Is accumulation >= orange_threshold? ───┐
   │ NO                                          │ YES
   │                                             ▼
   ▼                                    ┌─── ORANGE STATUS ───┐
GREEN STATUS                            │                      │
(Continue normal                        │ ※ Tolerance = Max 1 LOT (≈3 days)
 production)                            │                      │
                                        ▼                      ▼
                              PPIC: Schedule         MTN Dies: Create
                              last LOT               PPM Schedule
                                        │                      │
                                        ▼                      ▼
                              PPIC: Confirm          Schedule Ready
                              Schedule               
                                        │
                                        ▼
                              Continue production
                              until LOT complete
                                        │
                                        ▼
                           Is accumulation >= next_ppm_stroke?
                                        │ YES
                                        ▼
                              ┌─── RED STATUS (Day n) ───┐
                              │                           │
                              │ STOP PRODUCTION!          │
                              │                           │
                              ▼                           │
                        PROD: Transfer dies         ◄─────┘
                        to MTN Dies (max n+1)
                              │
                              ▼
                        MTN Dies: Start PPM
                        Activity (max n+3)
                              │
                              ├──── Urgent Delivery? ──── YES ──► Special Repair
                              │                                    (Pause PPM)
                              ├──── Severe Damage? ────── YES ──► Special Repair
                              │                                    (Extended timeline)
                              │
                              ▼
                        MTN Dies: Complete PPM
                        (max n+4)
                              │
                              ▼
                        MTN Dies: Transfer dies
                        back to Production (max n+4)
                              │
                              ▼
                        ┌─── GREEN STATUS ───┐
                        │                     │
                        │ New 4-lot cycle     │
                        │ starts from current │
                        │ accumulation point  │
                        │                     │
                        │ Total: max 5 days   │
                        └─────────────────────┘
```

### Bahasa Indonesia

```
PRODUKSI BERJALAN
        │
        ▼
   Akumulasi Stroke bertambah setiap produksi
        │
        ▼
   ┌─── Apakah akumulasi >= ambang_orange? ───┐
   │ TIDAK                                     │ YA
   │                                           ▼
   ▼                              ┌─── STATUS ORANGE ───┐
STATUS GREEN                      │                      │
(Lanjutkan produksi               │ ※ Toleransi = Maks 1 LOT (≈3 hari)
 normal)                          │                      │
                                  ▼                      ▼
                        PPIC: Jadwalkan        MTN Dies: Buat
                        LOT terakhir           Jadwal PPM
                                  │                      │
                                  ▼                      ▼
                        PPIC: Konfirmasi       Jadwal Siap
                        Jadwal                 
                                  │
                                  ▼
                        Lanjutkan produksi
                        sampai LOT selesai
                                  │
                                  ▼
                     Apakah akumulasi >= next_ppm_stroke?
                                  │ YA
                                  ▼
                        ┌─── STATUS RED (Hari n) ───┐
                        │                            │
                        │ HENTIKAN PRODUKSI!         │
                        │                            │
                        ▼                            │
                  PROD: Transfer dies           ◄────┘
                  ke MTN Dies (maks n+1)
                        │
                        ▼
                  MTN Dies: Mulai Aktivitas
                  PPM (maks n+3)
                        │
                        ├──── Delivery Mendesak? ─── YA ──► Special Repair
                        │                                    (Jeda PPM)
                        ├──── Kerusakan Parah? ───── YA ──► Special Repair
                        │                                    (Timeline diperpanjang)
                        │
                        ▼
                  MTN Dies: Selesaikan PPM
                  (maks n+4)
                        │
                        ▼
                  MTN Dies: Transfer dies
                  kembali ke Produksi (maks n+4)
                        │
                        ▼
                  ┌─── STATUS GREEN ───┐
                  │                     │
                  │ Siklus 4 lot baru   │
                  │ dimulai dari titik  │
                  │ akumulasi saat ini  │
                  │                     │
                  │ Total: maks 5 hari  │
                  └─────────────────────┘
```

---

## Summary / Ringkasan

### English
| Rule | Value |
|------|-------|
| STD 3-day tolerance | Max 1 LOT allowance |
| ORANGE → PPIC creates last LOT schedule | Yes |
| ORANGE → MTN Dies creates PPM schedule | Yes |
| ORANGE → PPIC confirms schedule | Yes |
| RED → PROD transfers to MTN | Max n+1 (1 day) |
| RED → PPM activity | Max n+3 (3 days) |
| RED → GREEN: PPM finish | Max n+4 (4 days) |
| RED → GREEN: Transfer back to PROD | Max n+4 |
| Total PPM time from RED | Max 5 working days |
| Urgent delivery during PPM | Special Repair (auto-approved, PPM paused) |
| Severe damage during PPM | Special Repair (needs approval, extended timeline) |
| Production Trend chart | REMOVED from dashboard |
| TOP 10 by group A1-A4 | ADDED to dashboard |
| Special Dies Repair menu | NEW menu added |

### Bahasa Indonesia
| Aturan | Nilai |
|--------|-------|
| Toleransi STD 3 hari | Allowance maks 1 LOT |
| ORANGE → PPIC buat jadwal LOT terakhir | Ya |
| ORANGE → MTN Dies buat jadwal PPM | Ya |
| ORANGE → PPIC konfirmasi jadwal | Ya |
| RED → PROD transfer ke MTN | Maks n+1 (1 hari) |
| RED → Aktivitas PPM | Maks n+3 (3 hari) |
| RED → GREEN: PPM selesai | Maks n+4 (4 hari) |
| RED → GREEN: Transfer kembali ke PROD | Maks n+4 |
| Total waktu PPM dari RED | Maks 5 hari kerja |
| Delivery mendesak saat PPM | Special Repair (otomatis disetujui, PPM dijeda) |
| Kerusakan parah saat PPM | Special Repair (perlu persetujuan, timeline diperpanjang) |
| Chart Production Trend | DIHAPUS dari dashboard |
| TOP 10 berdasarkan grup A1-A4 | DITAMBAHKAN ke dashboard |
| Menu Special Dies Repair | Menu BARU ditambahkan |

---

*Document Version: 2.0*
*Last Updated: February 23, 2026*
*Author: System Documentation*
