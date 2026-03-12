# PPM DIES MONITORING SYSTEM — MANUAL BOOK
# BUKU PANDUAN SISTEM MONITORING PPM DIES

**PT. Indonesia Thai Summit Auto**
**Version 1.0 — March 2, 2026**

---

## Table of Contents / Daftar Isi

1. [System Overview / Gambaran Sistem](#1-system-overview--gambaran-sistem)
2. [User Roles & Access Rights / Peran Pengguna & Hak Akses](#2-user-roles--access-rights--peran-pengguna--hak-akses)
3. [Login & Navigation / Login & Navigasi](#3-login--navigation--login--navigasi)
4. [Dashboard](#4-dashboard)
5. [Dies Management / Manajemen Dies](#5-dies-management--manajemen-dies)
6. [Die Detail Page / Halaman Detail Die](#6-die-detail-page--halaman-detail-die)
7. [PPM Workflow / Alur Kerja PPM](#7-ppm-workflow--alur-kerja-ppm)
8. [Schedule Calendar / Kalender Jadwal](#8-schedule-calendar--kalender-jadwal)
9. [Production Result / Hasil Produksi](#9-production-result--hasil-produksi)
10. [Special Dies Repair / Perbaikan Dies Khusus](#10-special-dies-repair--perbaikan-dies-khusus)
11. [Reports / Laporan](#11-reports--laporan)
12. [Import & Export / Impor & Ekspor](#12-import--export--impor--ekspor)
13. [Notifications / Notifikasi](#13-notifications--notifikasi)
14. [Master Data](#14-master-data)
15. [Profile / Profil](#15-profile--profil)
16. [PPM Calculation Logic / Logika Perhitungan PPM](#16-ppm-calculation-logic--logika-perhitungan-ppm)
17. [PPM Alert Status Flow / Alur Status Alert PPM](#17-ppm-alert-status-flow--alur-status-alert-ppm)
18. [SLA & Timeline Targets / Target SLA & Timeline](#18-sla--timeline-targets--target-sla--timeline)
19. [FAQ / Pertanyaan Umum](#19-faq--pertanyaan-umum)

---

## 1. System Overview / Gambaran Sistem

### English

**PPM Dies Monitoring System** is a web-based application for managing and monitoring Preventive and Predictive Maintenance (PPM) of dies at PT. Indonesia Thai Summit Auto. The system tracks die stroke counts, automatically determines when PPM is needed based on a 4-lot cycle calculation, and manages the complete PPM workflow from alert to completion.

**Key Capabilities:**
- Real-time die stroke monitoring with automatic color-coded status (Green/Orange/Red)
- Dual PPM trigger conditions (Standard Stroke limit & 4-Lot Checkpoint)
- Complete PPM workflow management with role-based actions
- Schedule calendar with smart filtering for easy PPM scheduling
- SLA tracking with timeline milestones (max 5 working days)
- Inspection checklist system with 9 process types
- Special dies repair handling (Urgent Delivery & Severe Damage)
- Comprehensive reporting and data import/export
- Real-time notification system across all roles

### Bahasa Indonesia

**Sistem Monitoring PPM Dies** adalah aplikasi berbasis web untuk mengelola dan memantau Preventive and Predictive Maintenance (PPM) dies di PT. Indonesia Thai Summit Auto. Sistem ini melacak jumlah stroke die, secara otomatis menentukan kapan PPM diperlukan berdasarkan perhitungan siklus 4-lot, dan mengelola alur kerja PPM secara lengkap dari alert hingga selesai.

**Kemampuan Utama:**
- Monitoring stroke die secara real-time dengan status berwarna otomatis (Hijau/Oranye/Merah)
- Dua kondisi pemicu PPM (Batas Standard Stroke & Checkpoint 4-Lot)
- Manajemen alur kerja PPM lengkap dengan aksi berbasis role
- Kalender jadwal dengan filter pintar untuk kemudahan penjadwalan PPM
- Pelacakan SLA dengan milestone timeline (maksimal 5 hari kerja)
- Sistem checklist inspeksi dengan 9 jenis proses
- Penanganan perbaikan dies khusus (Urgent Delivery & Severe Damage)
- Laporan lengkap dan fitur impor/ekspor data
- Sistem notifikasi real-time ke semua role

---

## 2. User Roles & Access Rights / Peran Pengguna & Hak Akses

### English

The system supports 7 user roles, each with specific responsibilities and access levels:

| # | Role | Full Name | Description |
|---|------|-----------|-------------|
| 1 | `admin` | Administrator | Full access to all features. Can perform all actions across the system. |
| 2 | `pe` | Production Engineering | Inputs production data (daily output, stroke counts). Views dies and reports. |
| 3 | `mtn_dies` | Maintenance Dies | Core PPM operator. Creates/edits dies, schedules PPM, performs PPM inspections, manages Standard Stroke, Machine Models. |
| 4 | `ppic` | Production Planning & Inventory Control | Sets Last LOT dates, confirms PPM schedules, views Schedule Calendar. |
| 5 | `production` | Production | Transfers dies to MTN Dies location when RED alert triggers. Logs production data. |
| 6 | `mgr_gm` | Manager / General Manager | Views dashboard, dies, and reports. Receives alert notifications for oversight. |
| 7 | `md` | Managing Director | Views dashboard, dies, and reports. Receives alert notifications for executive oversight. |

### Bahasa Indonesia

Sistem mendukung 7 peran pengguna, masing-masing dengan tanggung jawab dan level akses tertentu:

| # | Role | Nama Lengkap | Deskripsi |
|---|------|-------------|-----------|
| 1 | `admin` | Administrator | Akses penuh ke semua fitur. Dapat melakukan semua aksi di seluruh sistem. |
| 2 | `pe` | Production Engineering | Menginput data produksi (output harian, jumlah stroke). Melihat dies dan laporan. |
| 3 | `mtn_dies` | Maintenance Dies | Operator utama PPM. Membuat/mengedit dies, menjadwalkan PPM, melaksanakan inspeksi PPM, mengelola Standard Stroke dan Machine Model. |
| 4 | `ppic` | Production Planning & Inventory Control | Mengatur tanggal Last LOT, mengkonfirmasi jadwal PPM, melihat Kalender Jadwal. |
| 5 | `production` | Production | Mentransfer dies ke lokasi MTN Dies saat RED alert. Mencatat data produksi. |
| 6 | `mgr_gm` | Manager / General Manager | Melihat dashboard, dies, dan laporan. Menerima notifikasi alert untuk pengawasan. |
| 7 | `md` | Managing Director | Melihat dashboard, dies, dan laporan. Menerima notifikasi alert untuk pengawasan eksekutif. |

### Menu Access Matrix / Matriks Akses Menu

| Menu | admin | mtn_dies | production | ppic | pe | mgr_gm | md |
|------|:-----:|:--------:|:----------:|:----:|:--:|:------:|:--:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dies List | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Schedule Calendar | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Production Result | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Special Repair | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Import/Export | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master Data:** | | | | | | | |
| — Customers | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| — Machine Models | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| — Standard Stroke | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| — Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| — Test Alert | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Login & Navigation / Login & Navigasi

### English

**Login:**
1. Open the application URL in your browser (e.g., `http://localhost:8000`)
2. Enter your email and password
3. Click **Log in**
4. You will be redirected to the Dashboard

**Navigation Sidebar:**
- The sidebar is on the left side of the screen
- Click the **arrow button** to collapse/expand the sidebar
- On mobile, use the **hamburger menu** (☰) at the top left
- Menu items are filtered based on your role — you only see menus you have access to
- The **Master Data** section (if visible) contains sub-menus for Customers, Machine Models, Standard Stroke, Users, and Test Alert

**Top Bar:**
- **🔔 Notification bell** — Click to see recent notifications. Red badge shows unread count.
- **User avatar** — Click to open dropdown with Profile and Logout options. Your role is displayed as a badge.

### Bahasa Indonesia

**Login:**
1. Buka URL aplikasi di browser Anda (contoh: `http://localhost:8000`)
2. Masukkan email dan password
3. Klik **Log in**
4. Anda akan diarahkan ke Dashboard

**Sidebar Navigasi:**
- Sidebar berada di sisi kiri layar
- Klik **tombol panah** untuk memperkecil/memperbesar sidebar
- Di perangkat mobile, gunakan **menu hamburger** (☰) di kiri atas
- Item menu difilter berdasarkan role Anda — Anda hanya melihat menu yang dapat diakses
- Bagian **Master Data** (jika terlihat) berisi sub-menu untuk Customers, Machine Models, Standard Stroke, Users, dan Test Alert

**Bar Atas:**
- **🔔 Bel notifikasi** — Klik untuk melihat notifikasi terbaru. Badge merah menunjukkan jumlah belum dibaca.
- **Avatar pengguna** — Klik untuk membuka dropdown dengan opsi Profile dan Logout. Role Anda ditampilkan sebagai badge.

---

## 4. Dashboard

**URL:** `/dashboard`
**Access / Akses:** All roles / Semua role

### English

The Dashboard provides a comprehensive overview of the entire PPM monitoring system at a glance.

#### 4.1 Status Summary Cards
Four cards at the top showing:
- **Total Dies** — Total number of active dies in the system
- **Green Status (OK)** — Dies in safe zone, no PPM needed soon
- **Orange Status (Warning)** — Dies approaching PPM threshold, scheduling required
- **Red Status (Critical)** — Dies that have reached or exceeded the PPM threshold, immediate action needed

#### 4.2 Charts & Visualizations
- **Dies Status Distribution** — Doughnut chart showing the proportion of Green/Orange/Red dies
- **Dies Status by Tonnage** — Stacked bar chart grouped by machine tonnage, showing die status distribution per tonnage group
- **Top 10 Dies by Stroke Progress** — Horizontal bar chart showing the 10 dies closest to needing PPM
- **Overall PPM Health Gauge** — Percentage of dies in good condition (Green)
- **PPM Completed per Month** — Line chart showing how many PPMs were completed each month this year

#### 4.3 Top 10 Dies by Group (A1–A4)
Dies are classified into 4 groups based on their position in the 4-lot cycle:
- **A1 (Green)** — Lot 1 of cycle. Safe zone. No action needed.
- **A2 (Blue)** — Lot 2 of cycle. Normal zone. Monitoring continues.
- **A3 (Orange)** — Lot 3 of cycle. Warning zone. PPM scheduling should begin.
- **A4 (Red)** — Lot 4 of cycle. Critical zone. PPM must be performed.

Each group shows up to 10 dies ranked by stroke percentage with mini progress bars.

#### 4.4 PPM Timeline Tracking Table
Shows all dies currently in the PPM process (from RED alert to completion). Columns:
- Part Number, Customer, Current Status
- RED Alert date (n), Transfer date (n+1), PPM Start (n+3), PPM Finish (n+4)
- Total working days elapsed
- SLA status: **On Track** (≤5 days) or **OVERDUE** (>5 days, highlighted in red)

#### 4.5 Critical Alerts & Upcoming PPM
- **Critical Alert Table** — Top 5 dies needing immediate PPM attention
- **Upcoming PPM Table** — Dies estimated to need PPM within 14 days, showing remaining strokes and estimated days

#### 4.6 Quick Actions
Role-based shortcut buttons for common tasks:
- Add New Die, Log Production, View Schedule, Special Repair, Reports, Import Data

#### 4.7 Active Special Repairs
Table showing up to 5 active special repair requests with priority, status, and deadline.

---

### Bahasa Indonesia

Dashboard menyediakan gambaran menyeluruh dari seluruh sistem monitoring PPM dalam satu pandangan.

#### 4.1 Kartu Ringkasan Status
Empat kartu di bagian atas menampilkan:
- **Total Dies** — Jumlah total die aktif dalam sistem
- **Green Status (OK)** — Die dalam zona aman, PPM belum diperlukan
- **Orange Status (Warning)** — Die mendekati ambang PPM, perlu dijadwalkan
- **Red Status (Critical)** — Die telah mencapai atau melewati ambang PPM, perlu tindakan segera

#### 4.2 Grafik & Visualisasi
- **Distribusi Status Dies** — Grafik donut menampilkan proporsi die Hijau/Oranye/Merah
- **Status Dies per Tonnage** — Grafik batang bertumpuk berdasarkan tonnage mesin
- **Top 10 Dies berdasarkan Progress Stroke** — Grafik batang horizontal menampilkan 10 die paling dekat dengan kebutuhan PPM
- **Gauge Kesehatan PPM Keseluruhan** — Persentase die dalam kondisi baik (Hijau)
- **PPM Selesai per Bulan** — Grafik garis menampilkan jumlah PPM selesai setiap bulan tahun ini

#### 4.3 Top 10 Dies per Grup (A1–A4)
Dies diklasifikasikan ke dalam 4 grup berdasarkan posisi mereka dalam siklus 4-lot:
- **A1 (Hijau)** — Lot 1 dari siklus. Zona aman. Tidak perlu tindakan.
- **A2 (Biru)** — Lot 2 dari siklus. Zona normal. Monitoring berlanjut.
- **A3 (Oranye)** — Lot 3 dari siklus. Zona peringatan. Penjadwalan PPM harus dimulai.
- **A4 (Merah)** — Lot 4 dari siklus. Zona kritis. PPM harus dilaksanakan.

Setiap grup menampilkan hingga 10 die diurutkan berdasarkan persentase stroke.

#### 4.4 Tabel Pelacakan Timeline PPM
Menampilkan semua die yang sedang dalam proses PPM (dari RED alert hingga selesai). Kolom:
- Part Number, Customer, Status Saat Ini
- Tanggal RED Alert (n), Tanggal Transfer (n+1), Mulai PPM (n+3), Selesai PPM (n+4)
- Total hari kerja yang berlalu
- Status SLA: **On Track** (≤5 hari) atau **OVERDUE** (>5 hari, disorot merah)

#### 4.5 Alert Kritis & Upcoming PPM
- **Tabel Alert Kritis** — 5 die teratas yang membutuhkan perhatian PPM segera
- **Tabel Upcoming PPM** — Die yang diperkirakan membutuhkan PPM dalam 14 hari, menampilkan sisa stroke dan estimasi hari

#### 4.6 Aksi Cepat
Tombol pintasan berdasarkan role untuk tugas-tugas umum:
- Tambah Die Baru, Log Produksi, Lihat Jadwal, Special Repair, Laporan, Impor Data

#### 4.7 Perbaikan Khusus Aktif
Tabel menampilkan hingga 5 permintaan perbaikan khusus aktif dengan prioritas, status, dan deadline.

---

## 5. Dies Management / Manajemen Dies

**URL:** `/dies`
**Access / Akses:** View — All roles | Create/Edit/Delete — Admin, MTN Dies

### English

The Dies List page is the central hub for viewing and managing all dies in the system.

#### 5.1 Filters & Search
- **Search box** — Search by part number or part name (auto-search with 400ms delay)
- **Customer dropdown** — Filter by customer
- **Machine Model dropdown** — Filter by machine model
- **PPM Status dropdown** — Filter by status: Green (OK), Orange (Warning), Red (Critical)
- **Reset button** — Clear all filters

#### 5.2 Dies Table
Each row displays:
- **Part Number** — Clickable link to Die Detail page
- **Part Name** — Name/description of the die
- **Customer** — Customer badge
- **Model / Tonnage** — Machine model and tonnage
- **Lot Progress** — Visual progress bar showing the current position in the 4-lot cycle
- **PPM Condition** — Dual-condition display:
  - **Condition 1 (Standard Stroke):** Progress toward standard stroke limit
  - **Condition 2 (4-Lot Checkpoint):** Progress toward 4-lot PPM checkpoint
- **Status** — Color-coded badge: 🟢 Green, 🟠 Orange, 🔴 Red
- **Last PPM** — Date of the most recent PPM
- **Actions** — View Detail, Edit (admin/mtn_dies only)

#### 5.3 Pagination
- Configurable items per page: 10, 15, 25, 50, 100
- Full pagination controls with page numbers
- Status legend at the bottom showing color meanings

#### 5.4 Create New Die
**(Admin & MTN Dies only)**
Click **"+ Add Die"** button. Fill in the form:
- Part Number (required, unique)
- Part Name
- Customer (select from dropdown)
- Machine Model (select from dropdown — determines Standard Stroke and Lot Size)
- Qty Die
- Line
- Process Type (select: BLANK+PIERCE, DRAW, EMBOS, TRIM, FORM, FLANG, RESTRIKE, PIERCE, CAM-PIERCE)
- Lot Size (auto-filled from Machine Model, can override)
- Control Stroke (optional, overrides Standard Stroke)
- Notes

#### 5.5 Edit Die
**(Admin & MTN Dies only)**
Click the ✏️ Edit button on any die row or the Edit button on the Die Detail page. All fields from Create are editable.

#### 5.6 Delete Die
**(Admin & MTN Dies only)**
Click Delete button with confirmation dialog. Deletion is permanent.

---

### Bahasa Indonesia

Halaman Dies List adalah pusat utama untuk melihat dan mengelola semua die dalam sistem.

#### 5.1 Filter & Pencarian
- **Kotak pencarian** — Cari berdasarkan part number atau part name (pencarian otomatis dengan jeda 400ms)
- **Dropdown Customer** — Filter berdasarkan customer
- **Dropdown Machine Model** — Filter berdasarkan machine model
- **Dropdown Status PPM** — Filter berdasarkan status: Green (OK), Orange (Warning), Red (Critical)
- **Tombol Reset** — Hapus semua filter

#### 5.2 Tabel Dies
Setiap baris menampilkan:
- **Part Number** — Link yang bisa diklik ke halaman Detail Die
- **Part Name** — Nama/deskripsi die
- **Customer** — Badge customer
- **Model / Tonnage** — Model mesin dan tonnage
- **Lot Progress** — Bar visual menampilkan posisi saat ini dalam siklus 4-lot
- **PPM Condition** — Tampilan dua kondisi:
  - **Kondisi 1 (Standard Stroke):** Progres menuju batas standard stroke
  - **Kondisi 2 (Checkpoint 4-Lot):** Progres menuju checkpoint PPM 4-lot
- **Status** — Badge berwarna: 🟢 Hijau, 🟠 Oranye, 🔴 Merah
- **Last PPM** — Tanggal PPM terakhir
- **Aksi** — Lihat Detail, Edit (hanya admin/mtn_dies)

#### 5.3 Paginasi
- Item per halaman yang bisa dikonfigurasi: 10, 15, 25, 50, 100
- Kontrol paginasi lengkap dengan nomor halaman
- Legenda status di bagian bawah menampilkan arti warna

#### 5.4 Buat Die Baru
**(Hanya Admin & MTN Dies)**
Klik tombol **"+ Add Die"**. Isi form:
- Part Number (wajib, unik)
- Part Name
- Customer (pilih dari dropdown)
- Machine Model (pilih dari dropdown — menentukan Standard Stroke dan Lot Size)
- Qty Die
- Line
- Process Type (pilih: BLANK+PIERCE, DRAW, EMBOS, TRIM, FORM, FLANG, RESTRIKE, PIERCE, CAM-PIERCE)
- Lot Size (otomatis terisi dari Machine Model, bisa di-override)
- Control Stroke (opsional, meng-override Standard Stroke)
- Notes

#### 5.5 Edit Die
**(Hanya Admin & MTN Dies)**
Klik tombol ✏️ Edit pada baris die mana saja atau tombol Edit di halaman Detail Die.

#### 5.6 Hapus Die
**(Hanya Admin & MTN Dies)**
Klik tombol Delete dengan dialog konfirmasi. Penghapusan bersifat permanen.

---

## 6. Die Detail Page / Halaman Detail Die

**URL:** `/dies/{id}`
**Access / Akses:** All roles can view; actions depend on role

### English

The Die Detail page shows complete information about a single die and provides all role-based action buttons for the PPM workflow.

#### 6.1 Action Buttons (Top)
Buttons appear based on your role and the current die status:

| Button | Role | When Visible |
|--------|------|-------------|
| ✏️ **Edit** | admin, mtn_dies | Always |
| 📝 **Record PPM** | admin, mtn_dies | Always visible, but **disabled** (gray) until die is transferred to MTN. **Enabled** (blue) when `ppm_alert_status` = `transferred_to_mtn`, `ppm_in_progress`, or `additional_repair` |
| 📅 **Set Last LOT Date** | admin, ppic | When PPM status is Orange or Red |
| ✅ **Confirm PPM Schedule** | admin, ppic | When `ppm_alert_status` = `ppm_scheduled` |
| 🚚 **Transfer to MTN Dies** | admin, production | When PPM status is Red and not yet transferred |
| ▶️ **Start PPM Processing** | admin, mtn_dies | When `ppm_alert_status` = `transferred_to_mtn` |
| 🔧 **Additional Repair** | admin, mtn_dies | When `ppm_alert_status` = `ppm_in_progress` |
| ▶️ **Resume PPM** | admin, mtn_dies | When `ppm_alert_status` = `additional_repair` |
| 🏭 **Transfer Back to Production** | admin, mtn_dies | When `ppm_alert_status` = `ppm_completed` |

#### 6.2 Die Information Card (Left Column)
Displays: Customer, Model, Tonnage, Qty Die, Line, Standard Stroke, Lot Size, Last PPM Date, Process Type badge.

#### 6.3 PPM Flow Status Card (Left Column)
Shown when the PPM workflow is active. Displays the current stage with color-coded info blocks:
- 📅 PPIC: Last LOT Date set (who, when)
- 📝 MTN Dies: PPM Scheduled (date, by whom)
- ✅ PPIC: Schedule Confirmed (date, by whom)
- 🚚 PROD: Transfer to MTN Dies (from → to location, date, by whom)
- ▶️ MTN Dies: PPM In Progress (start date)
- ✅ MTN Dies: PPM Completed (finish date, total working days)

#### 6.4 Stroke Status Card (Middle Column)
- Large accumulation stroke number with status color
- Stroke percentage progress bar
- Remaining strokes to next PPM
- Remaining lots to next PPM
- Current lot position in the 4-lot cycle
- **Lot Progress** — Visual bar showing each lot with zone colors (green → orange → red)

#### 6.5 PPM Trigger Conditions Card (Middle Column)
Shows two conditions side by side:
- **Condition 1: Standard Stroke** — PPM required when accumulation reaches the standard stroke limit. Shows target, current, remaining, and progress bar.
- **Condition 2: 4-Lot Checkpoint** — PPM required every 4 production lots. Shows PPM#N, target stroke, last PPM stroke, remaining, and progress bar.
- The **active** condition is highlighted. When both conditions trigger simultaneously, a "⚡ Final PPM" indicator appears.

#### 6.6 PPM History Tab
Table showing all past PPM records: Date, Stroke at PPM, PIC, Process Type, Maintenance Type, Checklist results (normal/unusual count), Status.

#### 6.7 Production Logs Tab
Recent 10 production logs: Date, Shift, Output Qty, Running Process. Link to view all production logs.

#### 6.8 Record PPM Modal
When clicking 📝 Record PPM (enabled state), a comprehensive modal opens:
1. **Header info** — Die part number, customer, model
2. **Basic fields** — PPM Date, PIC, Maintenance Type (routine/repair/overhaul)
3. **Process Type selector** — Choose from 9 types; auto-filled from die's process type
4. **Inspection Checklist Table** — Dynamic table based on process type with:
   - Item descriptions specific to the selected process type
   - **Normal / Unusual** radio buttons per item
   - **Remark** text field per item
5. **Detail fields** — Work Performed, Parts Replaced, Findings, Recommendations, Checked By, Approved By
6. **Submit** — Records the PPM, updates die status

---

### Bahasa Indonesia

Halaman Detail Die menampilkan informasi lengkap tentang satu die dan menyediakan semua tombol aksi berbasis role untuk alur kerja PPM.

#### 6.1 Tombol Aksi (Atas)
Tombol muncul berdasarkan role dan status die saat ini:

| Tombol | Role | Kapan Muncul |
|--------|------|-------------|
| ✏️ **Edit** | admin, mtn_dies | Selalu |
| 📝 **Record PPM** | admin, mtn_dies | Selalu terlihat, tapi **disabled** (abu-abu) sampai die ditransfer ke MTN. **Enabled** (biru) saat `ppm_alert_status` = `transferred_to_mtn`, `ppm_in_progress`, atau `additional_repair` |
| 📅 **Set Last LOT Date** | admin, ppic | Saat status PPM Orange atau Red |
| ✅ **Confirm PPM Schedule** | admin, ppic | Saat `ppm_alert_status` = `ppm_scheduled` |
| 🚚 **Transfer to MTN Dies** | admin, production | Saat status PPM Red dan belum ditransfer |
| ▶️ **Start PPM Processing** | admin, mtn_dies | Saat `ppm_alert_status` = `transferred_to_mtn` |
| 🔧 **Additional Repair** | admin, mtn_dies | Saat `ppm_alert_status` = `ppm_in_progress` |
| ▶️ **Resume PPM** | admin, mtn_dies | Saat `ppm_alert_status` = `additional_repair` |
| 🏭 **Transfer Back to Production** | admin, mtn_dies | Saat `ppm_alert_status` = `ppm_completed` |

#### 6.2 Kartu Informasi Die (Kolom Kiri)
Menampilkan: Customer, Model, Tonnage, Qty Die, Line, Standard Stroke, Lot Size, Tanggal PPM Terakhir, badge Process Type.

#### 6.3 Kartu Status Alur PPM (Kolom Kiri)
Ditampilkan saat alur kerja PPM aktif. Menampilkan tahap saat ini dengan blok info berwarna:
- 📅 PPIC: Last LOT Date ditetapkan (siapa, kapan)
- 📝 MTN Dies: PPM Dijadwalkan (tanggal, oleh siapa)
- ✅ PPIC: Jadwal Dikonfirmasi (tanggal, oleh siapa)
- 🚚 PROD: Transfer ke MTN Dies (lokasi asal → tujuan, tanggal, oleh siapa)
- ▶️ MTN Dies: PPM Sedang Berlangsung (tanggal mulai)
- ✅ MTN Dies: PPM Selesai (tanggal selesai, total hari kerja)

#### 6.4 Kartu Status Stroke (Kolom Tengah)
- Angka besar accumulation stroke dengan warna status
- Progress bar persentase stroke
- Sisa stroke menuju PPM berikutnya
- Sisa lot menuju PPM berikutnya
- Posisi lot saat ini dalam siklus 4-lot
- **Lot Progress** — Bar visual menampilkan setiap lot dengan warna zona (hijau → oranye → merah)

#### 6.5 Kartu Kondisi Pemicu PPM (Kolom Tengah)
Menampilkan dua kondisi secara berdampingan:
- **Kondisi 1: Standard Stroke** — PPM diperlukan saat akumulasi mencapai batas standard stroke. Menampilkan target, saat ini, sisa, dan progress bar.
- **Kondisi 2: Checkpoint 4-Lot** — PPM diperlukan setiap 4 lot produksi. Menampilkan PPM#N, target stroke, stroke PPM terakhir, sisa, dan progress bar.
- Kondisi yang **aktif** disorot. Ketika kedua kondisi terpicu bersamaan, indikator "⚡ Final PPM" muncul.

#### 6.6 Tab Riwayat PPM
Tabel menampilkan semua catatan PPM terdahulu: Tanggal, Stroke saat PPM, PIC, Process Type, Tipe Maintenance, Hasil Checklist (jumlah normal/unusual), Status.

#### 6.7 Tab Log Produksi
10 log produksi terbaru: Tanggal, Shift, Output Qty, Running Process. Link ke semua log produksi.

#### 6.8 Modal Record PPM
Saat mengklik 📝 Record PPM (dalam keadaan enabled), modal komprehensif terbuka:
1. **Info header** — Part number die, customer, model
2. **Field dasar** — Tanggal PPM, PIC, Tipe Maintenance (routine/repair/overhaul)
3. **Pemilih Process Type** — Pilih dari 9 tipe; otomatis terisi dari process type die
4. **Tabel Checklist Inspeksi** — Tabel dinamis berdasarkan process type dengan:
   - Deskripsi item spesifik sesuai process type yang dipilih
   - Tombol radio **Normal / Unusual** per item
   - Field teks **Remark** per item
5. **Field detail** — Work Performed, Parts Replaced, Findings, Recommendations, Checked By, Approved By
6. **Submit** — Mencatat PPM, memperbarui status die

---

## 7. PPM Workflow / Alur Kerja PPM

### English

The PPM workflow follows a specific sequence of steps involving multiple roles. Below is the complete normal flow:

```
Step 1:  PE inputs production data → accumulation stroke increases
Step 2:  MTN Dies sets up die (Standard Stroke, Lot Size, Process Type)
Step 3:  SYSTEM calculates formula → determines Green/Orange/Red status
Step 4:  Accumulation reaches Orange zone → status becomes ORANGE
Step 5:  SYSTEM sends Orange Alert to all roles
Step 6:  PPIC sets Last LOT Date
Step 7:  MTN Dies creates PPM schedule (via Schedule Calendar)
Step 8:  PPIC confirms the PPM schedule
Step 9:  Accumulation reaches Red zone → status becomes RED
Step 10: SYSTEM sends Red Alert to all roles
Step 11: PROD transfers die to MTN Dies location
Step 12: MTN Dies starts PPM processing
Step 13: (If abnormal) MTN Dies marks Additional Repair → repairs → resumes PPM
Step 14: MTN Dies records PPM with inspection checklist → PPM Completed
Step 15: SYSTEM changes status from Red to Green (new cycle begins)
Step 16: MTN Dies transfers die back to Production location
Step 17: Cycle complete ✅
```

#### Process Types & Inspection Checklist Items
When recording PPM, the inspection checklist changes based on the die's process type:

| # | Process Type | Checklist Items |
|---|-------------|----------------|
| 1 | BLANK+PIERCE | 8 items |
| 2 | DRAW | 12 items |
| 3 | EMBOS | 10 items |
| 4 | TRIM | 7 items |
| 5 | FORM | 7 items |
| 6 | FLANG | 9 items |
| 7 | RESTRIKE | 9 items |
| 8 | PIERCE | 9 items |
| 9 | CAM-PIERCE | 9 items |

Each item has a Normal/Unusual assessment and optional Remark field.

---

### Bahasa Indonesia

Alur kerja PPM mengikuti urutan langkah tertentu yang melibatkan beberapa role. Berikut alur normal lengkap:

```
Langkah 1:  PE menginput data produksi → accumulation stroke bertambah
Langkah 2:  MTN Dies mengatur die (Standard Stroke, Lot Size, Process Type)
Langkah 3:  SISTEM menghitung formula → menentukan status Hijau/Oranye/Merah
Langkah 4:  Akumulasi mencapai zona Oranye → status menjadi ORANGE
Langkah 5:  SISTEM mengirim Orange Alert ke semua role
Langkah 6:  PPIC mengatur Last LOT Date
Langkah 7:  MTN Dies membuat jadwal PPM (via Kalender Jadwal)
Langkah 8:  PPIC mengkonfirmasi jadwal PPM
Langkah 9:  Akumulasi mencapai zona Merah → status menjadi RED
Langkah 10: SISTEM mengirim Red Alert ke semua role
Langkah 11: PROD mentransfer die ke lokasi MTN Dies
Langkah 12: MTN Dies memulai proses PPM
Langkah 13: (Jika tidak normal) MTN Dies menandai Additional Repair → perbaikan → lanjutkan PPM
Langkah 14: MTN Dies mencatat PPM dengan checklist inspeksi → PPM Selesai
Langkah 15: SISTEM mengubah status dari Merah ke Hijau (siklus baru dimulai)
Langkah 16: MTN Dies mentransfer die kembali ke lokasi Production
Langkah 17: Siklus selesai ✅
```

#### Jenis Proses & Item Checklist Inspeksi
Saat mencatat PPM, checklist inspeksi berubah berdasarkan jenis proses die:

| # | Process Type | Item Checklist |
|---|-------------|----------------|
| 1 | BLANK+PIERCE | 8 item |
| 2 | DRAW | 12 item |
| 3 | EMBOS | 10 item |
| 4 | TRIM | 7 item |
| 5 | FORM | 7 item |
| 6 | FLANG | 9 item |
| 7 | RESTRIKE | 9 item |
| 8 | PIERCE | 9 item |
| 9 | CAM-PIERCE | 9 item |

Setiap item memiliki penilaian Normal/Unusual dan field Remark opsional.

---

## 8. Schedule Calendar / Kalender Jadwal

**URL:** `/schedule`
**Access / Akses:** Admin, MTN Dies, PPIC

### English

The Schedule Calendar provides a yearly view of PPM schedules for all dies, organized by Customer and Tonnage groups.

#### 8.1 Filters
- **Year** — Select year (2023–2027)
- **Customer** — Filter by customer
- **Tonnage** — Filter by tonnage group
- **🔍 Apply Filter** — Apply selected filters

#### 8.2 Smart Scheduling Filters (MTN Dies & Admin only)
Three toggle buttons to quickly find dies that need attention:
- **📋 Semua (All)** — Show all dies (default)
- **🔔 Perlu Dijadwalkan (Needs Scheduling)** — Shows only dies that have a LOT date set by PPIC but haven't been scheduled for PPM yet. Has animated ping indicator.
- **✅ Sudah Dijadwalkan (Already Scheduled)** — Shows only dies that already have a PPM schedule date

These filters help MTN Dies users quickly identify which dies need PPM scheduling without searching through hundreds of rows.

#### 8.3 Calendar Table
The table shows monthly data (12 months × 4 weeks) for each die with 6 data rows:
- **Forecast** — Forecasted stroke (editable)
- **Plan** — Planned PPM week (editable, 1-4)
- **Actual** — PPM completion indicator (● dot when done)
- **Stroke** — Actual stroke at PPM (editable)
- **PPM Date** — Actual PPM date (editable — also updates the die's scheduled date)
- **PIC** — Person in charge (editable)

**Click any editable cell** to open the edit modal. Changes are saved per cell.

#### 8.4 Visual Indicators
- **Amber/Yellow row highlight** — Die that needs PPM scheduling (has LOT date but no schedule)
- **📅 SCHEDULE badge** — Animated badge next to part number for dies needing scheduling
- **📅 LOT: date** — Shows the LOT date set by PPIC (below part name)
- **✅ Scheduled: date** — Shows the scheduled PPM date (below part name)
- **Color-coded accumulation stroke** — Green/Orange/Red based on PPM status

#### 8.5 PPM Condition Column
Each die shows dual-condition progress indicators:
- Condition 1 (Standard Stroke) with progress bar
- Condition 2 (4-Lot Checkpoint) with progress bar

#### 8.6 Summary Statistics
Cards at the bottom showing: Total Dies, OK Status, Warning, Critical, and for MTN Dies: 🔔 Needs Scheduling, ✅ Already Scheduled. Stat cards are **clickable** as filter shortcuts.

#### 8.7 Legend
Color and icon meanings: PPM Done (●), Planned Week (green badge), Critical/Warning/OK stroke colors, Click to Edit, and Needs Scheduling badge.

---

### Bahasa Indonesia

Kalender Jadwal menyediakan tampilan tahunan jadwal PPM untuk semua die, diorganisir berdasarkan grup Customer dan Tonnage.

#### 8.1 Filter
- **Year** — Pilih tahun (2023–2027)
- **Customer** — Filter berdasarkan customer
- **Tonnage** — Filter berdasarkan grup tonnage
- **🔍 Apply Filter** — Terapkan filter yang dipilih

#### 8.2 Filter Penjadwalan Pintar (Hanya MTN Dies & Admin)
Tiga tombol toggle untuk cepat menemukan die yang perlu ditindaklanjuti:
- **📋 Semua** — Tampilkan semua die (default)
- **🔔 Perlu Dijadwalkan** — Menampilkan hanya die yang sudah punya LOT date dari PPIC tapi belum dijadwalkan PPM. Memiliki indikator animasi ping.
- **✅ Sudah Dijadwalkan** — Menampilkan hanya die yang sudah memiliki tanggal jadwal PPM

Filter ini membantu pengguna MTN Dies dengan cepat mengidentifikasi die mana yang perlu dijadwalkan PPM tanpa harus mencari melalui ratusan baris.

#### 8.3 Tabel Kalender
Tabel menampilkan data bulanan (12 bulan × 4 minggu) untuk setiap die dengan 6 baris data:
- **Forecast** — Stroke yang diramalkan (bisa diedit)
- **Plan** — Minggu PPM yang direncanakan (bisa diedit, 1-4)
- **Actual** — Indikator penyelesaian PPM (titik ● saat selesai)
- **Stroke** — Stroke aktual saat PPM (bisa diedit)
- **PPM Date** — Tanggal PPM aktual (bisa diedit — juga memperbarui tanggal jadwal die)
- **PIC** — Person in charge (bisa diedit)

**Klik cell yang bisa diedit** untuk membuka modal edit. Perubahan disimpan per cell.

#### 8.4 Indikator Visual
- **Sorotan baris kuning/amber** — Die yang perlu dijadwalkan PPM (sudah ada LOT date tapi belum ada jadwal)
- **Badge 📅 SCHEDULE** — Badge animasi di samping part number untuk die yang perlu dijadwalkan
- **📅 LOT: tanggal** — Menampilkan tanggal LOT yang diset PPIC (di bawah part name)
- **✅ Scheduled: tanggal** — Menampilkan tanggal jadwal PPM (di bawah part name)
- **Accumulation stroke berwarna** — Hijau/Oranye/Merah berdasarkan status PPM

#### 8.5 Kolom Kondisi PPM
Setiap die menampilkan indikator progres dua kondisi:
- Kondisi 1 (Standard Stroke) dengan progress bar
- Kondisi 2 (Checkpoint 4-Lot) dengan progress bar

#### 8.6 Statistik Ringkasan
Kartu di bagian bawah menampilkan: Total Dies, OK Status, Warning, Critical, dan untuk MTN Dies: 🔔 Perlu Dijadwalkan, ✅ Sudah Dijadwalkan. Kartu statistik **bisa diklik** sebagai pintasan filter.

#### 8.7 Legenda
Arti warna dan ikon: PPM Selesai (●), Minggu Terencana (badge hijau), Warna stroke Kritis/Peringatan/OK, Klik untuk Edit, dan badge Perlu Dijadwalkan.

---

## 9. Production Result / Hasil Produksi

**URL:** `/production`
**Access / Akses:** Admin, MTN Dies, Production, PE

### English

The Production Result page tracks daily production output for each die. Production data drives the accumulation stroke count which determines PPM status.

#### 9.1 Features
- **Add Production Result** — Create a new production log entry
- **Filter by date range** — Date From and Date To
- **Filter by die** — Select specific die from dropdown
- **Table columns** — Date, Die (Part Number), Shift, Output Qty, Running Process, Actions
- **Delete** — Remove a production log (with confirmation)

#### 9.2 Create Production Log
Fill in the form:
- **Die** — Select from dropdown (shows part number + name)
- **Production Date** — Date of production
- **Shift** — Shift number (1, 2, 3)
- **Output Qty** — Number of pieces produced (this value is added to the die's accumulation stroke)
- **Running Process** — Description of the production process

#### 9.3 Import Production Data
Production logs can also be imported in bulk via the Import page. See [Section 12: Import & Export](#12-import--export--impor--ekspor).

---

### Bahasa Indonesia

Halaman Hasil Produksi melacak output produksi harian untuk setiap die. Data produksi menggerakkan hitungan accumulation stroke yang menentukan status PPM.

#### 9.1 Fitur
- **Tambah Hasil Produksi** — Buat entri log produksi baru
- **Filter berdasarkan rentang tanggal** — Tanggal Dari dan Tanggal Sampai
- **Filter berdasarkan die** — Pilih die spesifik dari dropdown
- **Kolom tabel** — Tanggal, Die (Part Number), Shift, Output Qty, Running Process, Aksi
- **Hapus** — Menghapus log produksi (dengan konfirmasi)

#### 9.2 Buat Log Produksi
Isi form:
- **Die** — Pilih dari dropdown (menampilkan part number + nama)
- **Tanggal Produksi** — Tanggal produksi
- **Shift** — Nomor shift (1, 2, 3)
- **Output Qty** — Jumlah pieces yang diproduksi (nilai ini ditambahkan ke accumulation stroke die)
- **Running Process** — Deskripsi proses produksi

#### 9.3 Impor Data Produksi
Log produksi juga bisa diimpor secara massal melalui halaman Import. Lihat [Bagian 12: Import & Export](#12-import--export--impor--ekspor).

---

## 10. Special Dies Repair / Perbaikan Dies Khusus

**URL:** `/special-repair`
**Access / Akses:** Admin, MTN Dies, Production

### English

The Special Dies Repair module handles two special scenarios that can interrupt the normal PPM flow:

#### 10.1 Repair Types
1. **Urgent Delivery** — Customer has an urgent order. Die must be temporarily pulled from PPM for production. Auto-approved (no approval needed). After delivery, die returns to PPM.
2. **Severe Damage** — Die has serious damage discovered during PPM requiring special repair. Requires manager/admin approval. Extended timeline (not bound by 5-day SLA).

#### 10.2 Priority Levels
- 🔴 **Emergency** — Immediate attention required
- 🟠 **Critical** — High priority, needs quick resolution
- 🟡 **High** — Important but can wait briefly

#### 10.3 Workflow Status
```
Urgent Delivery: Created → Approved (auto) → In Progress → Completed → Return to PPM
Severe Damage:   Created → Pending → Approved/Rejected → In Progress → Completed → Return to PPM
```

#### 10.4 Features
- **Create Request** — Select die, repair type, priority, reason, description
- **Stats Cards** — Overview of requests by status
- **Filter & Search** — Search by text, filter by status and repair type
- **Approve/Reject** (Manager/Admin) — For severe damage requests
- **Start Repair** — Begin the repair process
- **Complete Repair** — Mark repair as done, fill work performed and hours
- **PPM Interruption** — Die's PPM status is saved and restored after repair

---

### Bahasa Indonesia

Modul Perbaikan Dies Khusus menangani dua skenario khusus yang bisa menginterupsi alur PPM normal:

#### 10.1 Jenis Perbaikan
1. **Urgent Delivery** — Customer mempunyai pesanan mendesak. Die harus ditarik sementara dari PPM untuk produksi. Disetujui otomatis (tidak perlu approval). Setelah pengiriman, die kembali ke PPM.
2. **Severe Damage** — Die mengalami kerusakan serius yang ditemukan selama PPM memerlukan perbaikan khusus. Memerlukan persetujuan manager/admin. Timeline diperpanjang (tidak terikat SLA 5 hari).

#### 10.2 Level Prioritas
- 🔴 **Emergency** — Perlu perhatian segera
- 🟠 **Critical** — Prioritas tinggi, perlu penyelesaian cepat
- 🟡 **High** — Penting tapi bisa menunggu sebentar

#### 10.3 Alur Status
```
Urgent Delivery: Dibuat → Disetujui (otomatis) → Sedang Dikerjakan → Selesai → Kembali ke PPM
Severe Damage:   Dibuat → Pending → Disetujui/Ditolak → Sedang Dikerjakan → Selesai → Kembali ke PPM
```

#### 10.4 Fitur
- **Buat Permintaan** — Pilih die, jenis perbaikan, prioritas, alasan, deskripsi
- **Kartu Statistik** — Gambaran permintaan berdasarkan status
- **Filter & Pencarian** — Cari berdasarkan teks, filter berdasarkan status dan jenis perbaikan
- **Setuju/Tolak** (Manager/Admin) — Untuk permintaan severe damage
- **Mulai Perbaikan** — Memulai proses perbaikan
- **Selesaikan Perbaikan** — Tandai perbaikan selesai, isi pekerjaan yang dilakukan dan jam kerja
- **Interupsi PPM** — Status PPM die disimpan dan dipulihkan setelah perbaikan

---

## 11. Reports / Laporan

**URL:** `/reports`
**Access / Akses:** All roles / Semua role

### English

The Reports page provides four types of exportable reports:

#### 11.1 Dies Status Report
- **Description:** Complete report of all dies with their current status
- **Filters:** Customer, PPM Status (Green/Orange/Red)
- **Export formats:** Excel (.xlsx) and PDF
- **Contents:** Part Number, Part Name, Customer, Model, Tonnage, Accumulation Stroke, Status, Last PPM Date

#### 11.2 Critical Dies Report
- **Description:** Report of dies requiring immediate attention (Orange + Red status)
- **Filters:** None (auto-filtered to critical/warning dies)
- **Export format:** PDF only
- **Contents:** Critical and warning dies with stroke details and urgency level

#### 11.3 PPM History Report
- **Description:** Historical record of all PPM activities
- **Filters:** Date From, Date To
- **Export format:** Excel (.xlsx)
- **Contents:** Die info, PPM Date, PIC, Stroke at PPM, Process Type, Maintenance Type, Checklist results

#### 11.4 Production Report
- **Description:** Production output data over a date range
- **Filters:** Date From, Date To
- **Export format:** Excel (.xlsx)
- **Contents:** Production dates, die info, shift, output quantities

#### 11.5 Summary Stats
Four cards at the top show: Total Dies, OK count, Warning count, Critical count.

---

### Bahasa Indonesia

Halaman Laporan menyediakan empat jenis laporan yang bisa diekspor:

#### 11.1 Laporan Status Dies
- **Deskripsi:** Laporan lengkap semua die dengan status saat ini
- **Filter:** Customer, Status PPM (Green/Orange/Red)
- **Format ekspor:** Excel (.xlsx) dan PDF
- **Isi:** Part Number, Part Name, Customer, Model, Tonnage, Accumulation Stroke, Status, Tanggal PPM Terakhir

#### 11.2 Laporan Dies Kritis
- **Deskripsi:** Laporan die yang membutuhkan perhatian segera (status Orange + Red)
- **Filter:** Tidak ada (otomatis difilter ke die kritis/peringatan)
- **Format ekspor:** Hanya PDF
- **Isi:** Die kritis dan peringatan dengan detail stroke dan tingkat urgensi

#### 11.3 Laporan Riwayat PPM
- **Deskripsi:** Catatan historis semua aktivitas PPM
- **Filter:** Tanggal Dari, Tanggal Sampai
- **Format ekspor:** Excel (.xlsx)
- **Isi:** Info die, Tanggal PPM, PIC, Stroke saat PPM, Process Type, Tipe Maintenance, Hasil checklist

#### 11.4 Laporan Produksi
- **Deskripsi:** Data output produksi dalam rentang tanggal
- **Filter:** Tanggal Dari, Tanggal Sampai
- **Format ekspor:** Excel (.xlsx)
- **Isi:** Tanggal produksi, info die, shift, jumlah output

#### 11.5 Statistik Ringkasan
Empat kartu di bagian atas menampilkan: Total Dies, jumlah OK, jumlah Warning, jumlah Critical.

---

## 12. Import & Export / Impor & Ekspor

**URL:** `/import`
**Access / Akses:** Admin, MTN Dies, Production, PE

### English

The Import page allows bulk data upload from Excel files. Three import types are available:

#### 12.1 Production Log Import
- **Purpose:** Bulk import daily production data
- **Template:** Download template via "📥 Download Template"
- **Format:** Excel file with columns: Part Number, Date, Shift, Output Qty, Running Process
- **Action:** Upload file → Click Import → Data is processed and accumulation strokes are updated

#### 12.2 Dies Import
- **Purpose:** Bulk import die master data
- **Template:** Download template via "📥 Download Template"
- **Format:** Excel file with columns: Part Number, Part Name, Customer Code, Model, Total Die, Accumulation Stroke, Last Stroke, Monthly forecast data
- **Action:** Upload file → Click Import → Dies are created or updated

#### 12.3 PPM Schedule Import
- **Purpose:** Import PPM schedule data for a specific year
- **Template:** Download template via "📥 Download Template"
- **Additional field:** Year selector
- **Format:** Excel file with schedule data per month/week
- **Action:** Select year → Upload file → Click Import → Schedule data is populated in the calendar

#### 12.4 Template Downloads
Each import type has a downloadable Excel template showing the expected format with sample data. Always use the template to ensure correct column order and data format.

---

### Bahasa Indonesia

Halaman Import memungkinkan unggah data massal dari file Excel. Tiga jenis impor tersedia:

#### 12.1 Impor Log Produksi
- **Tujuan:** Impor massal data produksi harian
- **Template:** Unduh template via "📥 Download Template"
- **Format:** File Excel dengan kolom: Part Number, Tanggal, Shift, Output Qty, Running Process
- **Cara:** Upload file → Klik Import → Data diproses dan accumulation stroke diperbarui

#### 12.2 Impor Dies
- **Tujuan:** Impor massal data master die
- **Template:** Unduh template via "📥 Download Template"
- **Format:** File Excel dengan kolom: Part Number, Part Name, Customer Code, Model, Total Die, Accumulation Stroke, Last Stroke, Data forecast bulanan
- **Cara:** Upload file → Klik Import → Die dibuat atau diperbarui

#### 12.3 Impor Jadwal PPM
- **Tujuan:** Impor data jadwal PPM untuk tahun tertentu
- **Template:** Unduh template via "📥 Download Template"
- **Field tambahan:** Pemilih tahun
- **Format:** File Excel dengan data jadwal per bulan/minggu
- **Cara:** Pilih tahun → Upload file → Klik Import → Data jadwal diisi di kalender

#### 12.4 Unduh Template
Setiap jenis impor memiliki template Excel yang bisa diunduh menampilkan format yang diharapkan dengan data contoh. Selalu gunakan template untuk memastikan urutan kolom dan format data benar.

---

## 13. Notifications / Notifikasi

**URL:** `/notifications`
**Access / Akses:** All roles / Semua role

### English

The notification system keeps all users informed about PPM events relevant to their role.

#### 13.1 Notification Types
- **🔴 Critical Die Alert** — Die has reached RED status, immediate PPM needed
- **🟠 Orange Alert** — Die is approaching PPM threshold
- **🟢 PPM Completed** — PPM has been successfully completed
- **🔵 PPM Workflow Updates** — Status changes in the PPM workflow (transfer, schedule, etc.)
- **📊 Daily PPM Summary** — Daily summary of PPM status across all dies

#### 13.2 Notification Bell (Top Bar)
- Click the 🔔 bell icon in the top navigation bar
- Red badge shows the count of unread notifications
- Dropdown shows recent notifications
- Click "View All" to go to the full notifications page

#### 13.3 Notifications Page Features
- **Notification list** — Paginated list of all notifications
- **Unread highlighting** — Unread notifications have a blue background
- **Color-coded icons** — Red for critical, orange for warning, green for success, blue for info
- **Mark as Read** — Click to mark individual notification as read
- **Mark All Read** — Mark all unread notifications as read at once
- **Delete** — Remove individual notification
- **Clear All** — Remove all notifications (with confirmation dialog)

---

### Bahasa Indonesia

Sistem notifikasi menjaga semua pengguna tetap mendapat informasi tentang kejadian PPM yang relevan dengan role mereka.

#### 13.1 Jenis Notifikasi
- **🔴 Alert Die Kritis** — Die telah mencapai status RED, PPM segera diperlukan
- **🟠 Orange Alert** — Die mendekati ambang PPM
- **🟢 PPM Selesai** — PPM telah berhasil diselesaikan
- **🔵 Update Alur Kerja PPM** — Perubahan status dalam alur kerja PPM (transfer, jadwal, dll.)
- **📊 Ringkasan PPM Harian** — Ringkasan harian status PPM di semua die

#### 13.2 Bel Notifikasi (Bar Atas)
- Klik ikon 🔔 bel di bar navigasi atas
- Badge merah menampilkan jumlah notifikasi belum dibaca
- Dropdown menampilkan notifikasi terbaru
- Klik "View All" untuk ke halaman notifikasi lengkap

#### 13.3 Fitur Halaman Notifikasi
- **Daftar notifikasi** — Daftar berpaginasi dari semua notifikasi
- **Sorotan belum dibaca** — Notifikasi belum dibaca memiliki latar belakang biru
- **Ikon berkode warna** — Merah untuk kritis, oranye untuk peringatan, hijau untuk sukses, biru untuk info
- **Tandai Dibaca** — Klik untuk menandai notifikasi individual sebagai dibaca
- **Tandai Semua Dibaca** — Tandai semua notifikasi belum dibaca sekaligus
- **Hapus** — Hapus notifikasi individual
- **Hapus Semua** — Hapus semua notifikasi (dengan dialog konfirmasi)

---

## 14. Master Data

### English

Master Data menus are for managing foundational system data. Access varies by role.

#### 14.1 Customers
**URL:** `/customers` | **Access:** Admin only

Manage customer records used to classify dies.
- **Add Customer** — Code, Name, Contact Person, Address, Phone, Status (active/inactive)
- **Edit** — Update any customer field
- **Delete** — Remove customer (with confirmation)
- **Search** — Search by code, name, or contact person

#### 14.2 Machine Models
**URL:** `/machine-models` | **Access:** Admin, MTN Dies

Manage machine model records linked to dies.
- **Add Machine Model** — Code, Name, Tonnage Standard (select), Description
- **Edit** — Update any field
- **Delete** — Remove machine model (with confirmation)
- **Search** — Search by code or name
- Machine Model determines the tonnage and default Standard Stroke / Lot Size for dies

#### 14.3 Tonnage Standards (Standard Stroke)
**URL:** `/tonnage-standards` | **Access:** Admin, MTN Dies

Define standard stroke limits and lot sizes per tonnage.
- **Add Standard** — Tonnage (number), Grade, Standard Stroke, Lot Size, Description
- **Edit** — Update any field
- **Delete** — Remove standard (with confirmation)
- These values are the default PPM parameters for all dies on machines of this tonnage

#### 14.4 Users
**URL:** `/users` | **Access:** Admin only

Manage system user accounts.
- **Add User** — Name, Email, Password, Role (7 options), Photo
- **Edit** — Update any field, change role, upload/remove photo
- **Delete** — Remove user (with confirmation)

#### 14.5 Test Alert
**URL:** `/test-alert` | **Access:** Admin only

Send test alert notifications for development/testing purposes.
- Select a die and alert type (Orange / Red)
- Click Send to dispatch test notification to all relevant roles

---

### Bahasa Indonesia

Menu Master Data untuk mengelola data fundamental sistem. Akses bervariasi berdasarkan role.

#### 14.1 Customers
**URL:** `/customers` | **Akses:** Hanya Admin

Mengelola data customer yang digunakan untuk mengklasifikasikan die.
- **Tambah Customer** — Code, Name, Contact Person, Address, Phone, Status (active/inactive)
- **Edit** — Perbarui field customer mana saja
- **Hapus** — Hapus customer (dengan konfirmasi)
- **Pencarian** — Cari berdasarkan code, nama, atau contact person

#### 14.2 Machine Models
**URL:** `/machine-models` | **Akses:** Admin, MTN Dies

Mengelola data model mesin yang terhubung dengan die.
- **Tambah Machine Model** — Code, Name, Tonnage Standard (pilih), Description
- **Edit** — Perbarui field mana saja
- **Hapus** — Hapus machine model (dengan konfirmasi)
- **Pencarian** — Cari berdasarkan code atau nama
- Machine Model menentukan tonnage dan default Standard Stroke / Lot Size untuk die

#### 14.3 Tonnage Standards (Standard Stroke)
**URL:** `/tonnage-standards` | **Akses:** Admin, MTN Dies

Mendefinisikan batas standard stroke dan lot size per tonnage.
- **Tambah Standard** — Tonnage (angka), Grade, Standard Stroke, Lot Size, Description
- **Edit** — Perbarui field mana saja
- **Hapus** — Hapus standard (dengan konfirmasi)
- Nilai-nilai ini menjadi parameter PPM default untuk semua die pada mesin dengan tonnage ini

#### 14.4 Users
**URL:** `/users` | **Akses:** Hanya Admin

Mengelola akun pengguna sistem.
- **Tambah User** — Name, Email, Password, Role (7 pilihan), Photo
- **Edit** — Perbarui field mana saja, ubah role, upload/hapus foto
- **Hapus** — Hapus user (dengan konfirmasi)

#### 14.5 Test Alert
**URL:** `/test-alert` | **Akses:** Hanya Admin

Mengirim notifikasi test alert untuk keperluan pengembangan/testing.
- Pilih die dan jenis alert (Orange / Red)
- Klik Send untuk mengirim notifikasi test ke semua role terkait

---

## 15. Profile / Profil

**URL:** `/profile`
**Access / Akses:** All roles / Semua role

### English
- **Update Profile Information** — Change your name and email
- **Update Password** — Change your password (requires current password)
- **Delete Account** — Permanently delete your account (requires password confirmation)

### Bahasa Indonesia
- **Perbarui Informasi Profil** — Ubah nama dan email Anda
- **Perbarui Password** — Ubah password Anda (memerlukan password saat ini)
- **Hapus Akun** — Hapus akun Anda secara permanen (memerlukan konfirmasi password)

---

## 16. PPM Calculation Logic / Logika Perhitungan PPM

### English

The system uses a dual-condition approach to determine when PPM is needed:

#### Condition 1: Standard Stroke Limit
PPM is required when the die's total accumulation stroke reaches the machine's standard stroke limit.
```
Target = Standard Stroke (from Tonnage Standard or Control Stroke override)
Example: Standard Stroke = 50,000 → PPM needed at 50,000 strokes
```

#### Condition 2: 4-Lot Checkpoint
PPM is required every 4 production lots (one lot = one batch of products).
```
Lot Size = from Tonnage Standard (e.g., 5,000)
PPM Checkpoint = stroke_at_last_ppm + (4 × lot_size)
Example: Last PPM at 10,000 + (4 × 5,000) = 30,000 strokes
```

#### Status Color Determination
```
Next PPM = stroke_at_last_ppm + (4 × lot_size)
Orange Threshold = Next PPM - lot_size (= 3 lots into the cycle)

🟢 GREEN:  accumulation < Orange Threshold  (Lots 1-2 of cycle)
🟠 ORANGE: accumulation >= Orange Threshold AND < Next PPM (Lot 3)
🔴 RED:    accumulation >= Next PPM (Lot 4+)
```

#### Priority Logic
```
Standard Stroke: control_stroke → ppm_standard → tonnageStandard.standard_stroke → 6000
Lot Size:        die.lot_size → tonnageStandard.lot_size → 600
```

The system checks **both conditions** and triggers PPM when either one (or both) are met.

---

### Bahasa Indonesia

Sistem menggunakan pendekatan dua kondisi untuk menentukan kapan PPM diperlukan:

#### Kondisi 1: Batas Standard Stroke
PPM diperlukan ketika total accumulation stroke die mencapai batas standard stroke mesin.
```
Target = Standard Stroke (dari Tonnage Standard atau override Control Stroke)
Contoh: Standard Stroke = 50.000 → PPM diperlukan saat 50.000 stroke
```

#### Kondisi 2: Checkpoint 4-Lot
PPM diperlukan setiap 4 lot produksi (satu lot = satu batch produk).
```
Lot Size = dari Tonnage Standard (contoh: 5.000)
Checkpoint PPM = stroke_at_last_ppm + (4 × lot_size)
Contoh: PPM terakhir di 10.000 + (4 × 5.000) = 30.000 stroke
```

#### Penentuan Warna Status
```
PPM Berikutnya = stroke_at_last_ppm + (4 × lot_size)
Ambang Oranye = PPM Berikutnya - lot_size (= 3 lot dalam siklus)

🟢 HIJAU:  akumulasi < Ambang Oranye  (Lot 1-2 dari siklus)
🟠 ORANYE: akumulasi >= Ambang Oranye DAN < PPM Berikutnya (Lot 3)
🔴 MERAH:  akumulasi >= PPM Berikutnya (Lot 4+)
```

#### Logika Prioritas
```
Standard Stroke: control_stroke → ppm_standard → tonnageStandard.standard_stroke → 6000
Lot Size:        die.lot_size → tonnageStandard.lot_size → 600
```

Sistem memeriksa **kedua kondisi** dan memicu PPM ketika salah satu (atau keduanya) terpenuhi.

---

## 17. PPM Alert Status Flow / Alur Status Alert PPM

### English

The `ppm_alert_status` field tracks the die's position in the PPM workflow:

```
null
 ↓ (Orange alert triggered)
orange_alerted
 ↓ (PPIC sets Last LOT Date)
lot_date_set
 ↓ (MTN Dies creates schedule)
ppm_scheduled
 ↓ (PPIC confirms schedule)
schedule_approved
 ↓ (Accumulation hits RED + Red Alert sent)
red_alerted
 ↓ (Production transfers die to MTN location)
transferred_to_mtn
 ↓ (MTN Dies starts PPM)
ppm_in_progress ←──────────┐
 ↓                          │
 ↓ (Process not normal?)    │
additional_repair ──────────┘ (Resume PPM after repair)
 ↓ (Process normal → Record PPM)
ppm_completed
 ↓ (MTN Dies transfers back to Production)
null (cycle complete, ready for next cycle)
```

| Status | Label | Actor |
|--------|-------|-------|
| `null` | Normal / Cycle Complete | — |
| `orange_alerted` | Orange Alert Sent | System |
| `lot_date_set` | PPIC: Last LOT Date Set | PPIC |
| `ppm_scheduled` | MTN Dies: PPM Scheduled | MTN Dies |
| `schedule_approved` | PPIC: Schedule Confirmed | PPIC |
| `red_alerted` | Red Alert Sent | System |
| `transferred_to_mtn` | PROD: Transferred to MTN | Production |
| `ppm_in_progress` | MTN Dies: PPM In Progress | MTN Dies |
| `additional_repair` | MTN Dies: Additional Repair | MTN Dies |
| `ppm_completed` | MTN Dies: PPM Completed | MTN Dies |
| `special_repair` | Special Repair (Interrupted) | Various |

---

### Bahasa Indonesia

Field `ppm_alert_status` melacak posisi die dalam alur kerja PPM:

```
null
 ↓ (Orange alert terpicu)
orange_alerted
 ↓ (PPIC mengatur Last LOT Date)
lot_date_set
 ↓ (MTN Dies membuat jadwal)
ppm_scheduled
 ↓ (PPIC mengkonfirmasi jadwal)
schedule_approved
 ↓ (Akumulasi mencapai MERAH + Red Alert dikirim)
red_alerted
 ↓ (Production mentransfer die ke lokasi MTN)
transferred_to_mtn
 ↓ (MTN Dies memulai PPM)
ppm_in_progress ←──────────┐
 ↓                          │
 ↓ (Proses tidak normal?)   │
additional_repair ──────────┘ (Lanjutkan PPM setelah perbaikan)
 ↓ (Proses normal → Record PPM)
ppm_completed
 ↓ (MTN Dies mentransfer kembali ke Production)
null (siklus selesai, siap untuk siklus berikutnya)
```

| Status | Label | Pelaku |
|--------|-------|--------|
| `null` | Normal / Siklus Selesai | — |
| `orange_alerted` | Orange Alert Terkirim | Sistem |
| `lot_date_set` | PPIC: Last LOT Date Ditetapkan | PPIC |
| `ppm_scheduled` | MTN Dies: PPM Dijadwalkan | MTN Dies |
| `schedule_approved` | PPIC: Jadwal Dikonfirmasi | PPIC |
| `red_alerted` | Red Alert Terkirim | Sistem |
| `transferred_to_mtn` | PROD: Ditransfer ke MTN | Production |
| `ppm_in_progress` | MTN Dies: PPM Sedang Berlangsung | MTN Dies |
| `additional_repair` | MTN Dies: Perbaikan Tambahan | MTN Dies |
| `ppm_completed` | MTN Dies: PPM Selesai | MTN Dies |
| `special_repair` | Perbaikan Khusus (Terinterupsi) | Berbagai |

---

## 18. SLA & Timeline Targets / Target SLA & Timeline

### English

The PPM process has strict SLA (Service Level Agreement) targets measured in **working days** from the RED alert date:

| Milestone | Target | Description |
|-----------|--------|-------------|
| RED Alert | Day 0 (n) | System sends RED alert when die reaches critical status |
| Transfer to MTN | n+1 (1 day) | Production must transfer die to MTN Dies location within 1 working day |
| PPM Activity Start | n+3 (3 days) | MTN Dies must start PPM within 3 working days |
| PPM Finish | n+4 (4 days) | PPM must be completed within 4 working days |
| Total Cycle | n+5 (5 days = 1 week) | Entire cycle from RED alert to transfer back must complete within 5 working days |

**SLA Status on Dashboard:**
- **On Track** (green) — Total days ≤ 5
- **OVERDUE** (red) — Total days > 5, row highlighted in red

> **Note:** Working days exclude weekends (Saturday & Sunday). Special Repair scenarios (Urgent Delivery, Severe Damage) have extended timelines not bound by the 5-day SLA.

---

### Bahasa Indonesia

Proses PPM memiliki target SLA (Service Level Agreement) yang ketat diukur dalam **hari kerja** dari tanggal RED alert:

| Milestone | Target | Deskripsi |
|-----------|--------|-----------|
| RED Alert | Hari 0 (n) | Sistem mengirim RED alert saat die mencapai status kritis |
| Transfer ke MTN | n+1 (1 hari) | Production harus mentransfer die ke lokasi MTN Dies dalam 1 hari kerja |
| Mulai PPM | n+3 (3 hari) | MTN Dies harus memulai PPM dalam 3 hari kerja |
| PPM Selesai | n+4 (4 hari) | PPM harus diselesaikan dalam 4 hari kerja |
| Total Siklus | n+5 (5 hari = 1 minggu) | Seluruh siklus dari RED alert hingga transfer kembali harus selesai dalam 5 hari kerja |

**Status SLA di Dashboard:**
- **On Track** (hijau) — Total hari ≤ 5
- **OVERDUE** (merah) — Total hari > 5, baris disorot merah

> **Catatan:** Hari kerja tidak termasuk akhir pekan (Sabtu & Minggu). Skenario Special Repair (Urgent Delivery, Severe Damage) memiliki timeline yang diperpanjang dan tidak terikat SLA 5 hari.

---

## 19. FAQ / Pertanyaan Umum

### Q: Why is the "Record PPM" button gray/disabled?
### T: Kenapa tombol "Record PPM" abu-abu/disabled?

**EN:** The Record PPM button is disabled until the die is physically transferred to the MTN Dies location by Production (Step 11). This ensures PPM can only be recorded when the die is actually in the maintenance area. The button becomes enabled when `ppm_alert_status` is `transferred_to_mtn`, `ppm_in_progress`, or `additional_repair`.

**ID:** Tombol Record PPM disabled sampai die secara fisik ditransfer ke lokasi MTN Dies oleh Production (Langkah 11). Ini memastikan PPM hanya bisa dicatat saat die benar-benar berada di area maintenance. Tombol menjadi enabled saat `ppm_alert_status` adalah `transferred_to_mtn`, `ppm_in_progress`, atau `additional_repair`.

---

### Q: Why can't I see the "Transfer Back to Production" button?
### T: Kenapa saya tidak bisa melihat tombol "Transfer Back to Production"?

**EN:** This button is only visible to **MTN Dies** role (and Admin). It appears only after PPM is completed (`ppm_alert_status` = `ppm_completed`). If you're logged in as Production, you won't see this button — MTN Dies is responsible for transferring the die back after PPM completion.

**ID:** Tombol ini hanya terlihat untuk role **MTN Dies** (dan Admin). Tombol muncul hanya setelah PPM selesai (`ppm_alert_status` = `ppm_completed`). Jika Anda login sebagai Production, Anda tidak akan melihat tombol ini — MTN Dies yang bertanggung jawab mentransfer die kembali setelah PPM selesai.

---

### Q: What is the "Confirm PPM Schedule" button?
### T: Apa itu tombol "Confirm PPM Schedule"?

**EN:** This button is for PPIC users to confirm that the PPM schedule created by MTN Dies is aligned with the production plan. It only appears when `ppm_alert_status` = `ppm_scheduled` (after MTN Dies creates the schedule). This was previously labeled "Approve" but renamed to "Confirm" to better reflect the workflow.

**ID:** Tombol ini untuk pengguna PPIC untuk mengkonfirmasi bahwa jadwal PPM yang dibuat MTN Dies sudah sesuai dengan rencana produksi. Tombol hanya muncul saat `ppm_alert_status` = `ppm_scheduled` (setelah MTN Dies membuat jadwal). Sebelumnya berlabel "Approve" tapi diubah menjadi "Confirm" agar lebih sesuai dengan alur kerja.

---

### Q: How do I find dies that need PPM scheduling in the Schedule Calendar?
### T: Bagaimana cara menemukan die yang perlu dijadwalkan PPM di Kalender Jadwal?

**EN:** In the Schedule Calendar, look for the **"🔔 Perlu Dijadwalkan"** filter button (visible to MTN Dies and Admin only). Click it to show only dies that have a LOT date set by PPIC but haven't been scheduled yet. These dies are also highlighted in amber/yellow with a "📅 SCHEDULE" badge.

**ID:** Di Kalender Jadwal, cari tombol filter **"🔔 Perlu Dijadwalkan"** (hanya terlihat untuk MTN Dies dan Admin). Klik untuk menampilkan hanya die yang sudah punya LOT date dari PPIC tapi belum dijadwalkan. Die-die ini juga disorot kuning/amber dengan badge "📅 SCHEDULE".

---

### Q: What happens when both PPM conditions trigger at the same time?
### T: Apa yang terjadi ketika kedua kondisi PPM terpicu bersamaan?

**EN:** When both Condition 1 (Standard Stroke) and Condition 2 (4-Lot Checkpoint) trigger simultaneously, it's called a "Final PPM" (indicated by ⚡). The PPM is performed once, satisfying both conditions. After PPM, the die enters a new cycle for both conditions.

**ID:** Ketika Kondisi 1 (Standard Stroke) dan Kondisi 2 (Checkpoint 4-Lot) terpicu bersamaan, ini disebut "Final PPM" (ditandai dengan ⚡). PPM dilakukan sekali, memenuhi kedua kondisi. Setelah PPM, die memasuki siklus baru untuk kedua kondisi.

---

### Q: Can Admin do everything?
### T: Bisakah Admin melakukan semuanya?

**EN:** Yes. The Admin role has full access to all features and can perform all actions that any role can do. This is useful for testing the complete flow with a single account.

**ID:** Ya. Role Admin memiliki akses penuh ke semua fitur dan dapat melakukan semua aksi yang bisa dilakukan role mana pun. Ini berguna untuk testing alur lengkap dengan satu akun.

---

### Q: What is "Additional Repair"?
### T: Apa itu "Additional Repair"?

**EN:** During PPM processing, if MTN Dies discovers that the process is NOT normal (in the flow: "The Process is Normal?" → No), they can mark the die for "Additional Repair". After repair is completed, PPM is resumed using the "Resume PPM" button. This loop can happen multiple times until the process is normal.

**ID:** Selama proses PPM, jika MTN Dies menemukan bahwa proses TIDAK normal (dalam flow: "The Process is Normal?" → Tidak), mereka bisa menandai die untuk "Additional Repair". Setelah perbaikan selesai, PPM dilanjutkan menggunakan tombol "Resume PPM". Perulangan ini bisa terjadi beberapa kali sampai prosesnya normal.

---

### Q: How are working days calculated for SLA?
### T: Bagaimana hari kerja dihitung untuk SLA?

**EN:** Working days exclude Saturdays and Sundays. The SLA timer starts when the RED alert is triggered (`red_alerted_at`) and counts only Monday–Friday until the PPM cycle is complete (`returned_to_production_at`).

**ID:** Hari kerja tidak termasuk Sabtu dan Minggu. Timer SLA dimulai saat RED alert terpicu (`red_alerted_at`) dan menghitung hanya Senin–Jumat sampai siklus PPM selesai (`returned_to_production_at`).

---

*PPM Dies Monitoring System — Manual Book*
*PT. Indonesia Thai Summit Auto*
*Version 1.0 — March 2, 2026*
