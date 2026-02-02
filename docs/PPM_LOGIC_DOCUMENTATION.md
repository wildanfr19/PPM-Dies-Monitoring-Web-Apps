# PPM (Preventive Periodic Maintenance) Logic Documentation

## 📋 Ringkasan

Sistem PPM Dies Monitoring menggunakan **2 kondisi trigger** untuk menentukan kapan PPM harus dilakukan:

| Kondisi | Nama | Deskripsi |
|---------|------|-----------|
| **Kondisi 1** | Standard Stroke | PPM saat die mencapai batas standard stroke |
| **Kondisi 2** | 4-Lot Checkpoint | PPM setiap kelipatan 4 lot produksi |

**Prinsip utama:** Kondisi yang tercapai **lebih dahulu** akan menjadi trigger PPM.

---

## 🔧 Konsep Dasar

### Parameter Die

| Parameter | Deskripsi | Contoh |
|-----------|-----------|--------|
| `standard_stroke` | Total stroke maksimal sebelum die perlu overhaul/ganti | 6,000 strokes |
| `lot_size` | Jumlah stroke per lot produksi | 375 strokes |
| `accumulation_stroke` | Total stroke yang sudah diakumulasi (tidak di-reset) | 1,200 strokes |

### Parameter PPM Tracking

| Parameter | Deskripsi | Contoh |
|-----------|-----------|--------|
| `ppm_count` | Jumlah PPM yang sudah dilakukan | 0, 1, 2, 3, 4 |
| `stroke_at_last_ppm` | Nilai accumulation_stroke saat PPM terakhir | 1,500 strokes |
| `ppm_number` | Nomor urut PPM dalam history | 1, 2, 3, 4 |

---

## 🎯 Dua Kondisi Trigger PPM

### Kondisi 1: Standard Stroke

PPM dilakukan ketika die mencapai **batas standard stroke** yang ditentukan.

```
Trigger: accumulation_stroke >= standard_stroke
```

**Karakteristik:**
- Merupakan PPM **terakhir** sebelum die overhaul/ganti
- Hanya terjadi **sekali** di akhir lifecycle die
- Target tetap: `standard_stroke` (tidak berubah)

**Contoh:**
- Standard stroke = 6,000
- Saat accumulation mencapai 6,000 → Trigger PPM (Kondisi 1)

---

### Kondisi 2: 4-Lot Checkpoint

PPM dilakukan **setiap kelipatan 4 lot** produksi untuk maintenance berkala.

```
Trigger: accumulation_stroke >= next_ppm_stroke
Next PPM Stroke = stroke_at_last_ppm + (4 × lot_size)
```

**Karakteristik:**
- Terjadi **berulang** sepanjang lifecycle die
- Target berubah setelah setiap PPM
- Memastikan maintenance preventif rutin

**Contoh (Lot Size 375):**
```
PPM #1: Target = 0 + (4 × 375) = 1,500
PPM #2: Target = 1,500 + (4 × 375) = 3,000
PPM #3: Target = 3,000 + (4 × 375) = 4,500
PPM #4: Target = 4,500 + (4 × 375) = 6,000
```

---

## 📊 Perbandingan Kedua Kondisi

| Aspek | Kondisi 1 (Standard Stroke) | Kondisi 2 (4-Lot Checkpoint) |
|-------|----------------------------|------------------------------|
| **Tujuan** | Overhaul/ganti die | Maintenance preventif rutin |
| **Frekuensi** | Sekali (akhir lifecycle) | Berulang setiap 4 lot |
| **Target** | Tetap (standard_stroke) | Dinamis (berubah setelah PPM) |
| **Warna UI** | 🔵 Biru | 🟣 Ungu |
| **Indikator Aktif** | Ya, jika ini PPM terakhir | Ya, jika checkpoint berikutnya |

---

## 🔄 Alur Logika: Mana yang Tercapai Duluan?

### Diagram Keputusan

```
┌─────────────────────────────────────────────────────────────┐
│                     Cek Kondisi PPM                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────┐
            │  next_ppm_stroke < standard_stroke? │
            └─────────────────────────────────────┘
                    │                    │
                   YES                   NO
                    │                    │
                    ▼                    ▼
        ┌───────────────────┐   ┌───────────────────┐
        │ KONDISI 2 AKTIF   │   │ KONDISI 1 AKTIF   │
        │ (4-Lot Checkpoint)│   │ (Standard Stroke) │
        │                   │   │                   │
        │ Target: next_ppm  │   │ Target: standard  │
        │ PPM interim       │   │ PPM terakhir      │
        └───────────────────┘   └───────────────────┘
```

### Contoh Lifecycle Die

**Data Die:**
- Standard Stroke: 6,000
- Lot Size: 375
- Total Lots: 16
- Total PPM Checkpoints: 4

| Accumulation | Kondisi Aktif | Next PPM | Keterangan |
|--------------|---------------|----------|------------|
| 0 - 1,499 | Kondisi 2 | 1,500 | Menuju PPM #1 |
| 1,500+ | ⚠️ PPM #1 | - | Record PPM |
| 1,500 - 2,999 | Kondisi 2 | 3,000 | Menuju PPM #2 |
| 3,000+ | ⚠️ PPM #2 | - | Record PPM |
| 3,000 - 4,499 | Kondisi 2 | 4,500 | Menuju PPM #3 |
| 4,500+ | ⚠️ PPM #3 | - | Record PPM |
| 4,500 - 5,999 | **Kondisi 1 & 2** | 6,000 | Menuju PPM #4 (Final) |
| 6,000+ | ⚠️ PPM #4 | - | PPM terakhir, overhaul |

---

## 📈 Status PPM

Status dihitung berdasarkan **progress ke kondisi yang aktif**.

### Perhitungan Progress

```javascript
// Untuk Kondisi 2 (4-Lot Checkpoint)
progress = accumulation_stroke - stroke_at_last_ppm
target = next_ppm_stroke - stroke_at_last_ppm
percentage = (progress / target) × 100%

// Untuk Kondisi 1 (Standard Stroke)
percentage = (accumulation_stroke / standard_stroke) × 100%
```

### Definisi Status

| Status | Kondisi | Warna | Aksi Yang Diperlukan |
|--------|---------|-------|---------------------|
| **Good** | < 75% dari target | 🟢 Hijau | Operasi normal |
| **Warning** | ≥ 75% dan < 100% | 🟠 Oranye | Persiapan PPM |
| **Critical** | ≥ 100% dari target | 🔴 Merah | PPM harus segera dilakukan! |

### Diagram Status dalam 1 Cycle

```
0%                    75%                   100%
│                      │                      │
├──────────────────────┼──────────────────────┤
│       🟢 GOOD        │    🟠 WARNING        │🔴 CRITICAL
│                      │                      │
│   Operasi Normal     │   Persiapan PPM      │  PPM Segera!
```

---

## 📝 Contoh Skenario

### Skenario 1: Die Baru (PPM #1)

**Kondisi:**
- `accumulation_stroke`: 1,200
- `ppm_count`: 0
- `stroke_at_last_ppm`: 0
- `lot_size`: 375
- `standard_stroke`: 6,000

**Perhitungan:**
```
Next PPM Stroke = 0 + (4 × 375) = 1,500
Kondisi Aktif = Kondisi 2 (1,500 < 6,000)

Progress = 1,200 - 0 = 1,200
Percentage = 1,200 / 1,500 × 100% = 80%
```

**Hasil:**
- Kondisi 2 **AKTIF** (badge ungu)
- Status = ⚠️ **WARNING** (80% ≥ 75%)
- Keterangan: Persiapan PPM #1 di 1,500 strokes

---

### Skenario 2: Setelah PPM Kedua

**Kondisi:**
- `accumulation_stroke`: 3,800
- `ppm_count`: 2
- `stroke_at_last_ppm`: 3,000
- `lot_size`: 375
- `standard_stroke`: 6,000

**Perhitungan:**
```
Next PPM Stroke = 3,000 + (4 × 375) = 4,500
Kondisi Aktif = Kondisi 2 (4,500 < 6,000)

Progress = 3,800 - 3,000 = 800
Target = 4,500 - 3,000 = 1,500
Percentage = 800 / 1,500 × 100% = 53.3%
```

**Hasil:**
- Kondisi 2 **AKTIF** (badge ungu)
- Status = 🟢 **GOOD** (53.3% < 75%)
- Keterangan: Menuju PPM #3 di 4,500 strokes

---

### Skenario 3: PPM Terakhir (Kondisi 1 & 2 Bertemu)

**Kondisi:**
- `accumulation_stroke`: 5,500
- `ppm_count`: 3
- `stroke_at_last_ppm`: 4,500
- `lot_size`: 375
- `standard_stroke`: 6,000

**Perhitungan:**
```
Next PPM Stroke = 4,500 + (4 × 375) = 6,000
Kondisi Aktif = BOTH (6,000 = 6,000)

Progress = 5,500 - 4,500 = 1,000
Target = 6,000 - 4,500 = 1,500
Percentage = 1,000 / 1,500 × 100% = 66.7%
```

**Hasil:**
- **Kedua Kondisi AKTIF** (⚡ Final PPM)
- Status = 🟢 **GOOD** (66.7% < 75%)
- Keterangan: PPM #4 adalah PPM terakhir di 6,000 strokes

---

## 🔄 Proses Record PPM

Ketika PPM dilakukan (via tombol "Record PPM"), sistem akan:

### Langkah-langkah:

1. ✅ **Increment `ppm_count`**
   ```
   ppm_count = ppm_count + 1
   Contoh: 2 → 3
   ```

2. ✅ **Update `stroke_at_last_ppm`**
   ```
   stroke_at_last_ppm = accumulation_stroke (saat ini)
   Contoh: 4,500
   ```

3. ✅ **TIDAK reset `accumulation_stroke`**
   ```
   accumulation_stroke tetap akumulasi sepanjang lifecycle
   ```

4. ✅ **Catat `ppm_number` di history**
   ```
   Dicatat sebagai PPM ke-berapa (1, 2, 3, 4)
   ```

5. ✅ **Update `last_ppm_date`**
   ```
   last_ppm_date = tanggal PPM dilakukan
   ```

### Contoh Before/After:

**Sebelum PPM:**
```
accumulation_stroke: 4,500
ppm_count: 2
stroke_at_last_ppm: 3,000
next_ppm_stroke: 4,500
```

**Setelah Record PPM:**
```
accumulation_stroke: 4,500 (tidak berubah)
ppm_count: 3 (naik 1)
stroke_at_last_ppm: 4,500 (diupdate)
next_ppm_stroke: 6,000 (target baru)
```

---

## 🖥️ Tampilan UI

### 1. Dies Monitoring List

Kolom **PPM Condition** menampilkan:

```
┌──────────────────────────────┐
│ ① Std Stroke        6,000   │  ← Progress bar biru
│   ▓▓░░░░░░░░░░░░░░░ 20%     │
│                              │
│ ② PPM #1            1,500   │  ← Progress bar ungu (AKTIF)
│   ▓▓▓▓▓▓▓▓▓▓▓░░░░░ 80%     │
└──────────────────────────────┘
```

### 2. Die Detail View

Card **🎯 PPM Trigger Conditions** dengan 2 panel:

| Panel Biru (Kondisi 1) | Panel Ungu (Kondisi 2) |
|------------------------|------------------------|
| Standard Stroke | 4-Lot Checkpoint |
| Target: 6,000 | PPM #1 of 4 |
| Current: 1,200 | Target: 1,500 |
| Remaining: 4,800 | Last PPM at: 0 |
| Progress: 20% | Remaining: 300 |
| | Progress: 80% |

### 3. Schedule Preventive Calendar

Kolom **PPM CONDITION** menampilkan info kompak per die.

---

## 💾 Technical Implementation

### Database Schema

**Dies Table (tambahan kolom):**
```sql
ALTER TABLE dies ADD COLUMN ppm_count INT DEFAULT 0;
ALTER TABLE dies ADD COLUMN stroke_at_last_ppm INT DEFAULT 0;
```

**PPM Histories Table (tambahan kolom):**
```sql
ALTER TABLE ppm_histories ADD COLUMN ppm_number INT DEFAULT 1;
```

### Model Attributes (DieModel.php)

```php
// Fixed value
$die->lots_per_ppm           // 4 (fixed)

// Calculated attributes
$die->next_ppm_stroke        // Target stroke PPM berikutnya
$die->total_ppm_checkpoints  // Total PPM yang dibutuhkan
$die->remaining_strokes      // Sisa stroke ke checkpoint
$die->stroke_percentage      // Progress ke checkpoint (%)

// Status
$die->ppm_status             // 'green', 'orange', 'red'
$die->ppm_status_label       // Label dengan info PPM

// Condition info
$die->ppm_trigger_condition  // Kondisi mana yang aktif
$die->ppm_conditions_info    // Detail kedua kondisi
```

### Condition Logic

```php
// Di DieModel.php
public function getPpmConditionsInfoAttribute()
{
    // Kondisi 1: Standard Stroke
    $condition1 = [
        'target' => $this->standard_stroke,
        'is_active' => $this->next_ppm_stroke >= $this->standard_stroke,
    ];

    // Kondisi 2: 4-Lot Checkpoint
    $condition2 = [
        'target' => $this->next_ppm_stroke,
        'is_active' => $this->next_ppm_stroke < $this->standard_stroke,
    ];

    return [
        'condition_1' => $condition1,
        'condition_2' => $condition2,
        'next_trigger' => $condition2['is_active'] ? 'condition_2' : 'condition_1',
    ];
}
```

---

## ❓ FAQ

### Q: Apakah accumulation_stroke di-reset setelah PPM?
**A:** Tidak. `accumulation_stroke` tetap akumulasi sepanjang lifecycle die. Yang diupdate adalah `stroke_at_last_ppm`.

### Q: Bagaimana jika die melewati checkpoint tanpa PPM?
**A:** Status menjadi 🔴 **CRITICAL** (≥100%). Die harus segera di-PPM.

### Q: Kapan Kondisi 1 aktif?
**A:** Kondisi 1 aktif saat `next_ppm_stroke >= standard_stroke`, artinya ini adalah PPM terakhir.

### Q: Apa yang terjadi setelah PPM terakhir (PPM #4)?
**A:** Die perlu overhaul/ganti. Lifecycle baru dimulai dengan reset semua parameter.

---

## 📊 Summary Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LIFECYCLE DIE (16 LOTS)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Lot 1-4         Lot 5-8         Lot 9-12        Lot 13-16                  │
│  ┌──────┐        ┌──────┐        ┌──────┐        ┌──────┐                   │
│  │      │        │      │        │      │        │      │                   │
│  │ 0-   │        │1500- │        │3000- │        │4500- │                   │
│  │1500  │        │3000  │        │4500  │        │6000  │                   │
│  │      │        │      │        │      │        │      │                   │
│  └──┬───┘        └──┬───┘        └──┬───┘        └──┬───┘                   │
│     │               │               │               │                        │
│     ▼               ▼               ▼               ▼                        │
│  ┌──────┐        ┌──────┐        ┌──────┐        ┌──────┐                   │
│  │PPM #1│        │PPM #2│        │PPM #3│        │PPM #4│                   │
│  │@1500 │        │@3000 │        │@4500 │        │@6000 │                   │
│  │      │        │      │        │      │        │      │                   │
│  │Kond.2│        │Kond.2│        │Kond.2│        │Kond.1│                   │
│  │      │        │      │        │      │        │& 2   │                   │
│  └──────┘        └──────┘        └──────┘        └──────┘                   │
│                                                    ⚡                        │
│                                                  FINAL                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Dokumen ini menjelaskan logic PPM dengan 2 kondisi trigger.**

**Version:** 2.0  
**Last Updated:** February 2, 2026  
**Author:** PPM Dies Monitoring System
