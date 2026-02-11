# PPM Dies Monitoring System
## Presentation Guide / Panduan Presentasi

**Version:** 1.0  
**Date:** February 9, 2026

---

# 🏭 PPM Dies Monitoring System

## Overview / Gambaran Umum

### English
PPM Dies Monitoring is a comprehensive system designed to monitor and manage Preventive Maintenance on manufacturing dies. The system tracks stroke accumulation, schedules maintenance, and provides real-time alerts to prevent die damage and ensure product quality.

### Indonesia
PPM Dies Monitoring adalah sistem komprehensif yang dirancang untuk memantau dan mengelola Preventive Maintenance pada dies manufaktur. Sistem ini melacak akumulasi stroke, menjadwalkan perawatan, dan memberikan peringatan waktu nyata untuk mencegah kerusakan dies dan memastikan kualitas produk.

---

## Key Features / Fitur Utama

| Feature | English | Indonesia |
|---------|---------|-----------|
| 📊 Real-time Monitoring | Track stroke accumulation in real-time | Melacak akumulasi stroke secara waktu nyata |
| 🔔 Smart Alerts | Automatic warnings when dies need maintenance | Peringatan otomatis ketika dies perlu perawatan |
| 📅 Scheduled Maintenance | Plan PPM activities systematically | Merencanakan aktivitas PPM secara sistematis |
| 📈 Production Tracking | Record daily production results | Mencatat hasil produksi harian |
| 📋 Comprehensive Reports | Generate detailed analysis reports | Menghasilkan laporan analisis terperinci |

---

# Module Descriptions / Deskripsi Module

---

## 1. 📊 DASHBOARD

### Screenshot Description / Deskripsi Tampilan

The Dashboard provides an at-a-glance overview of the entire PPM Dies Monitoring system status.

Dashboard menyediakan gambaran sekilas tentang status keseluruhan sistem PPM Dies Monitoring.

### Features / Fitur

| Component | English | Indonesia |
|-----------|---------|-----------|
| **Summary Cards** | Display total dies, PPM pending, and critical alerts | Menampilkan total dies, PPM tertunda, dan peringatan kritis |
| **Status Overview** | Shows Green, Orange, and Red status counts | Menampilkan jumlah status Hijau, Orange, dan Merah |
| **Quick Stats** | Production statistics and trends | Statistik produksi dan tren |
| **Recent Activity** | Latest production logs and updates | Log produksi dan pembaruan terbaru |

### Status Color Coding / Kode Warna Status

| Color | English | Indonesia | Condition |
|-------|---------|-----------|-----------|
| 🟢 **Green** | Safe - No maintenance required | Aman - Tidak perlu perawatan | < 75% of standard stroke |
| 🟠 **Orange** | Warning - Schedule maintenance soon | Peringatan - Jadwalkan perawatan segera | 75% - 99% of standard stroke |
| 🔴 **Red** | Critical - Maintenance overdue | Kritis - Perawatan terlambat | ≥ 100% of standard stroke |

---

## 2. 🔧 DIES LIST

### Screenshot Description / Deskripsi Tampilan

The Dies List module displays all registered dies with their current status, stroke information, and maintenance history.

Module Dies List menampilkan semua dies yang terdaftar beserta status saat ini, informasi stroke, dan riwayat perawatan.

### Features / Fitur

| Component | English | Indonesia |
|-----------|---------|-----------|
| **Dies Table** | Complete list with part number, name, customer | Daftar lengkap dengan part number, nama, customer |
| **Status Indicator** | Visual PPM status for each die | Indikator status PPM untuk setiap die |
| **Stroke Tracking** | Current accumulation vs standard stroke | Akumulasi saat ini vs stroke standar |
| **PPM Conditions** | Two-condition PPM trigger system | Sistem trigger PPM dua kondisi |
| **Search & Filter** | Find dies quickly by various criteria | Temukan dies dengan cepat berdasarkan berbagai kriteria |
| **Quick Actions** | View, edit, and manage dies | Lihat, edit, dan kelola dies |

### PPM Trigger Conditions / Kondisi Trigger PPM

#### Condition 1 (Standard Stroke) / Kondisi 1 (Stroke Standar)
- **English:** PPM triggers when accumulation reaches 100% of standard stroke
- **Indonesia:** PPM dipicu ketika akumulasi mencapai 100% dari stroke standar

#### Condition 2 (4-Lot Rule) / Kondisi 2 (Aturan 4-Lot)
- **English:** PPM triggers every 4 production lots (based on lot size configuration)
- **Indonesia:** PPM dipicu setiap 4 lot produksi (berdasarkan konfigurasi ukuran lot)

---

## 3. 📅 SCHEDULE CALENDAR

### Screenshot Description / Deskripsi Tampilan

The Schedule Calendar provides a comprehensive yearly view of PPM schedules for all dies organized by customer and tonnage.

Schedule Calendar menyediakan tampilan tahunan komprehensif dari jadwal PPM untuk semua dies yang diorganisir berdasarkan customer dan tonase.

### Features / Fitur

| Component | English | Indonesia |
|-----------|---------|-----------|
| **Yearly Calendar View** | 12-month schedule overview | Gambaran jadwal 12 bulan |
| **Weekly Breakdown** | 4 weeks per month (I, II, III, IV) | 4 minggu per bulan (I, II, III, IV) |
| **Forecast Entry** | Plan expected stroke per week | Merencanakan stroke yang diharapkan per minggu |
| **Plan Marking** | Mark planned PPM weeks | Tandai minggu PPM yang direncanakan |
| **Actual Tracking** | Record actual PPM completion | Catat penyelesaian PPM aktual |
| **PIC Assignment** | Assign Person In Charge | Tetapkan Penanggung Jawab |

### Table Columns / Kolom Tabel

| Column | English | Indonesia |
|--------|---------|-----------|
| **NO** | Row number | Nomor baris |
| **NAME/PART NUMBER** | Die identification | Identifikasi die |
| **MODEL** | Machine model | Model mesin |
| **TOTAL DIE** | Quantity of dies | Jumlah die |
| **ACCUMULATION** | Current stroke count | Jumlah stroke saat ini |
| **PPM CONDITION** | Trigger status visualization | Visualisasi status trigger |
| **LAST STROKE** | Latest stroke reading | Pembacaan stroke terakhir |
| **PLAN** | Planned maintenance | Perawatan yang direncanakan |

### Editable Fields / Field yang Dapat Diedit

- **F (Forecast):** Expected stroke count / Perkiraan jumlah stroke
- **P (Plan):** Planned week number / Nomor minggu yang direncanakan
- **A (Actual):** Actual PPM completion marker / Penanda penyelesaian PPM aktual
- **D (Date):** PPM execution date / Tanggal pelaksanaan PPM

---

## 4. ⚙️ PRODUCTION RESULT

### Screenshot Description / Deskripsi Tampilan

The Production Result module records daily production output and automatically updates die stroke accumulation.

Module Production Result mencatat output produksi harian dan secara otomatis memperbarui akumulasi stroke die.

### Features / Fitur

| Component | English | Indonesia |
|-----------|---------|-----------|
| **Production Log Entry** | Record daily production data | Mencatat data produksi harian |
| **Die Selection** | Choose die from registered list | Pilih die dari daftar terdaftar |
| **Shift Management** | Track production by shift (1, 2, 3) | Melacak produksi berdasarkan shift (1, 2, 3) |
| **Time Recording** | Start time, finish time, break time | Waktu mulai, waktu selesai, waktu istirahat |
| **Output Quantity** | Record total stroke count | Mencatat jumlah stroke total |
| **Auto Calculation** | Automatic accumulation update | Pembaruan akumulasi otomatis |

### Form Fields / Field Formulir

| Field | English | Indonesia |
|-------|---------|-----------|
| **Select Die** | Choose the die being used | Pilih die yang digunakan |
| **Production Date** | Date of production | Tanggal produksi |
| **Shift** | Work shift (1/2/3) | Shift kerja (1/2/3) |
| **Line** | Production line (250T, 800T, 1200T, Progressive) | Lini produksi |
| **Running Process** | Auto, Manual, or Blanking | Auto, Manual, atau Blanking |
| **Start/Finish Time** | Production time range | Rentang waktu produksi |
| **Output/Stroke Count** | Total strokes produced | Total stroke yang diproduksi |

### Important Notes / Catatan Penting

> **English:** The stroke count entered here is automatically added to the die's accumulation stroke, triggering PPM status updates.

> **Indonesia:** Jumlah stroke yang dimasukkan di sini secara otomatis ditambahkan ke stroke akumulasi die, memicu pembaruan status PPM.

---

## 5. 📥 IMPORT / EXPORT

### Screenshot Description / Deskripsi Tampilan

The Import/Export module allows bulk data management through Excel file uploads and downloads.

Module Import/Export memungkinkan manajemen data massal melalui unggahan dan unduhan file Excel.

### Features / Fitur

| Component | English | Indonesia |
|-----------|---------|-----------|
| **Dies Import** | Bulk import die data from Excel | Import data die massal dari Excel |
| **Production Import** | Import production logs from LHP | Import log produksi dari LHP |
| **PPM Schedule Import** | Import yearly PPM schedules | Import jadwal PPM tahunan |
| **Template Download** | Get formatted templates | Unduh template terformat |
| **Data Validation** | Automatic data checking | Pengecekan data otomatis |
| **Error Reporting** | Clear error messages | Pesan error yang jelas |

### Supported Imports / Import yang Didukung

| Import Type | Description (EN) | Deskripsi (ID) |
|-------------|------------------|----------------|
| **Dies Data** | Part number, name, customer, machine model | Nomor part, nama, customer, model mesin |
| **Production Log** | Daily production records | Catatan produksi harian |
| **PPM Schedule** | Yearly maintenance schedule | Jadwal perawatan tahunan |

---

## 6. ⚡ STANDARD STROKES

### Screenshot Description / Deskripsi Tampilan

The Standard Strokes module manages tonnage-based stroke standards that determine PPM triggering thresholds.

Module Standard Strokes mengelola standar stroke berbasis tonase yang menentukan ambang batas pemicu PPM.

### Features / Fitur

| Component | English | Indonesia |
|-----------|---------|-----------|
| **Tonnage Definition** | Define stroke standards per tonnage | Tentukan standar stroke per tonase |
| **Grade Classification** | Classify by grade (A, B, C) | Klasifikasi berdasarkan grade (A, B, C) |
| **Lot Size Configuration** | Set strokes per production lot | Atur stroke per lot produksi |
| **PPM Checkpoint Calculation** | Auto-calculate PPM frequency | Hitung frekuensi PPM otomatis |
| **Preview System** | Visual preview of PPM logic | Pratinjau visual logika PPM |

### Configuration Fields / Field Konfigurasi

| Field | English | Indonesia |
|-------|---------|-----------|
| **Tonnage** | Machine tonnage (e.g., 800T, 1200T) | Tonase mesin (mis., 800T, 1200T) |
| **Grade** | Quality grade classification | Klasifikasi grade kualitas |
| **Type** | Standard, Heavy Duty, etc. | Standar, Heavy Duty, dll. |
| **Standard Stroke** | Maximum strokes before PPM | Stroke maksimum sebelum PPM |
| **Lot Size** | Strokes per production lot | Stroke per lot produksi |

### PPM Calculation Example / Contoh Perhitungan PPM

```
Standard Stroke: 6,000
Lot Size: 375
─────────────────────────
Total Lots = 6,000 ÷ 375 = 16 lots
PPM Checkpoints = 16 ÷ 4 = 4x PPM

PPM triggers at lots: 4, 8, 12, 16
```

---

## 7. 👥 USER ROLES

### Role Matrix / Matriks Peran

| Role | English Description | Deskripsi Indonesia | Access Level |
|------|--------------------|--------------------|--------------|
| **Admin** | Full system access | Akses penuh sistem | All modules |
| **MTN Dies** | Maintenance team | Tim perawatan | Dies, Schedule, Production, Import |
| **Production** | Production operators | Operator produksi | Dashboard, Production, Import |
| **PE** | Production Engineering | Teknik Produksi | Dashboard, Production, Reports |
| **MD** | Management | Manajemen | Dashboard, Dies, Reports |
| **MGR/GM** | Manager/General Manager | Manajer/General Manager | Dashboard, Dies, Reports |

---

## 8. 🔔 ALERT SYSTEM

### Alert Types / Jenis Peringatan

| Alert | English | Indonesia | Trigger |
|-------|---------|-----------|---------|
| 🟠 **Orange Alert** | Warning notification | Notifikasi peringatan | 75% of standard stroke |
| 🔴 **Red Alert** | Critical notification | Notifikasi kritis | 100% of standard stroke |
| ✅ **PPM Complete** | Maintenance completed | Perawatan selesai | After PPM execution |
| 📋 **Daily Summary** | Daily status report | Laporan status harian | Scheduled daily |

### Notification Channels / Saluran Notifikasi

- **Email:** Automated email alerts / Peringatan email otomatis
- **In-App:** Dashboard notifications / Notifikasi dashboard
- **Bell Icon:** Real-time notification bell / Lonceng notifikasi waktu nyata

---

## System Benefits / Manfaat Sistem

### English

1. **Prevent Die Damage:** Timely maintenance prevents costly repairs
2. **Improve Product Quality:** Well-maintained dies produce better parts
3. **Increase Efficiency:** Automated tracking reduces manual work
4. **Data-Driven Decisions:** Comprehensive reports support planning
5. **Reduce Downtime:** Scheduled maintenance minimizes unexpected stops

### Indonesia

1. **Mencegah Kerusakan Die:** Perawatan tepat waktu mencegah perbaikan mahal
2. **Meningkatkan Kualitas Produk:** Dies terawat menghasilkan part lebih baik
3. **Meningkatkan Efisiensi:** Pelacakan otomatis mengurangi pekerjaan manual
4. **Keputusan Berbasis Data:** Laporan komprehensif mendukung perencanaan
5. **Mengurangi Downtime:** Perawatan terjadwal meminimalkan berhenti tak terduga

---

## Technical Specifications / Spesifikasi Teknis

| Component | Technology |
|-----------|------------|
| **Backend** | Laravel 11 (PHP 8.2+) |
| **Frontend** | React + Inertia.js |
| **Database** | MySQL/MariaDB |
| **Styling** | Tailwind CSS |
| **Icons** | Font Awesome |
| **Charts** | Recharts |
| **Export** | Laravel Excel (Maatwebsite) |

---

## Contact / Kontak

**Developer:** Development Team  
**Company:** PT. Indonesia Thai Summit Auto  
**System Version:** 1.0  
**Last Updated:** February 9, 2026

---

*This document is intended for presentation purposes. / Dokumen ini ditujukan untuk keperluan presentasi.*
