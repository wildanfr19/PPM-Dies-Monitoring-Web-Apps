# PPM Dies Monitoring System
## Technical Documentation

**Version:** 1.0  
**Last Updated:** January 28, 2026  
**Author:** Development Team

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [System Flow Diagram](#2-system-flow-diagram)
3. [Database Schema](#3-database-schema)
4. [Core Logic](#4-core-logic)
5. [Alert System](#5-alert-system)
6. [Lot Progress Visualization](#6-lot-progress-visualization)
7. [User Roles & Permissions](#7-user-roles--permissions)
8. [API Endpoints](#8-api-endpoints)

---

## 1. System Overview

### 1.1 Purpose

PPM Dies Monitoring adalah sistem pengendalian untuk:
- **Membuat PPM berdasarkan produksi aktual** mengacu pada standard stroke yang telah ditentukan
- **Melindungi perawatan cetakan (dies)** agar tidak melebihi batas stroke
- **Mengurangi part bermasalah** akibat kondisi dies yang tidak terpelihara

### 1.2 Technology Stack

| Component | Technology |
|-----------|------------|
| Backend | Laravel 11 (PHP 8.2+) |
| Frontend | React + Inertia.js |
| Database | MySQL/MariaDB |
| Styling | Tailwind CSS |
| Notifications | Laravel Notifications (Mail) |

### 1.3 Key Features

- Real-time stroke accumulation tracking
- Automated PPM scheduling based on production
- Multi-level alert notifications (Orange & Red)
- Visual lot progress indicator
- Production log management (LHP)
- Role-based access control

---

## 2. System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PPM DIES MONITORING FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────┐
                              │    PE     │
                              │(Production│
                              │Engineering│
                              └─────┬─────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     MTN DIES        │
                         │  (Maintenance)      │
                         │  Input Data Dies    │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │   Standard  │ │  Lot Size   │ │ Production  │
            │   Stroke    │ │   (PPM)     │ │    Logs     │
            │  (10,000)   │ │   (2,500)   │ │   (LHP)     │
            └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
                   │               │               │
                   └───────────────┼───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │        SYSTEM CALCULATES     │
                    │  ─────────────────────────── │
                    │  Accumulation Stroke vs      │
                    │  Standard Stroke             │
                    │                              │
                    │  Total Lots = Standard /     │
                    │               Lot Size       │
                    │  (10,000 / 2,500 = 4 lots)   │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │                              │
                    ▼                              ▼
        ┌───────────────────┐          ┌───────────────────┐
        │   🟠 ORANGE ZONE  │          │    🔴 RED ZONE    │
        │   (Warning)       │          │    (Critical)     │
        │                   │          │                   │
        │  Stroke ≥         │          │  Stroke ≥         │
        │  Standard - 1 Lot │          │  Standard Stroke  │
        │  (≥ 7,500)        │          │  (≥ 10,000)       │
        └─────────┬─────────┘          └─────────┬─────────┘
                  │                              │
                  ▼                              ▼
        ┌───────────────────┐          ┌───────────────────┐
        │  NOTIFY:          │          │  NOTIFY:          │
        │  • MGR/GM         │          │  • MGR/GM         │
        │  • MD             │          │  • MD             │
        │                   │          │  • MTN Dies       │
        └─────────┬─────────┘          └─────────┬─────────┘
                  │                              │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │      SCHEDULE PPM            │
                  │  (Preventive Maintenance)    │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │      PPM PROCESSING          │
                  │  • Reset Accumulation Stroke │
                  │  • Record PPM History        │
                  │  • Update Die Status         │
                  └──────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Entity Relationship

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  customers  │──1:N──│    dies     │──1:N──│production_  │
│             │       │             │       │   logs      │
└─────────────┘       └──────┬──────┘       └─────────────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
            ┌─────────┐ ┌─────────┐ ┌─────────────┐
            │machines │ │tonnage_ │ │ppm_schedules│
            │         │ │standards│ │             │
            └─────────┘ └─────────┘ └──────┬──────┘
                                           │
                                           ▼
                                   ┌─────────────┐
                                   │ppm_histories│
                                   └─────────────┘
```

### 3.2 Dies Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `part_number` | VARCHAR | Unique part identifier |
| `part_name` | VARCHAR | Part description |
| `customer_id` | BIGINT | FK to customers |
| `machine_id` | BIGINT | FK to machines |
| `accumulation_stroke` | INT | Current stroke count |
| `ppm_standard` | INT | Custom standard stroke (nullable) |
| `control_stroke` | INT | Override stroke limit (nullable) |
| `lot_size` | INT | Strokes per lot (default: 2500) |
| `ppm_alert_status` | ENUM | 'none', 'orange', 'red' |
| `status` | VARCHAR | Die status |

### 3.3 Key Fields Priority Chain

```
Standard Stroke Resolution:

    ┌─────────────────────────────────────────────────────┐
    │  1. control_stroke (if set)                         │
    │     ↓ (if null)                                     │
    │  2. ppm_standard (if set)                           │
    │     ↓ (if null)                                     │
    │  3. tonnageStandard->standard_stroke (from machine) │
    │     ↓ (if null)                                     │
    │  4. Default: 10,000                                 │
    └─────────────────────────────────────────────────────┘
```

---

## 4. Core Logic

### 4.1 Standard Stroke Calculation

**Location:** `app/Models/DieModel.php`

```php
public function getStandardStrokeAttribute()
{
    // Priority 1: Control stroke (highest priority)
    if ($this->control_stroke) {
        return $this->control_stroke;
    }
    
    // Priority 2: PPM Standard (die-specific)
    if ($this->ppm_standard) {
        return $this->ppm_standard;
    }
    
    // Priority 3: Tonnage standard based on machine
    if ($this->machine && $this->machine->tonnageStandard) {
        return $this->machine->tonnageStandard->standard_stroke;
    }
    
    // Priority 4: Default value
    return 10000;
}
```

### 4.2 Lot Size Resolution

**Location:** `app/Models/DieModel.php`

```php
public function getLotSizeValueAttribute()
{
    // Priority 1: Die-specific lot_size
    if ($this->lot_size) {
        return $this->lot_size;
    }
    
    // Priority 2: Tonnage standard lot_size
    if ($this->machine && $this->machine->tonnageStandard) {
        return $this->machine->tonnageStandard->lot_size ?? 2500;
    }
    
    // Priority 3: Default
    return 2500;
}
```

### 4.3 Total Lots Calculation

```php
public function getTotalLotsAttribute()
{
    $lotSize = $this->lot_size_value;
    if ($lotSize <= 0) return 1;
    
    // IMPORTANT: Cast to int to avoid float comparison issues
    return (int) ceil($this->standard_stroke / $lotSize);
}
```

**Example:**
```
Standard Stroke: 10,000
Lot Size: 2,500
Total Lots: ceil(10,000 / 2,500) = 4 lots
```

### 4.4 PPM Status Determination

**Location:** `app/Models/DieModel.php`

```php
public function getPpmStatusAttribute()
{
    $current = $this->accumulation_stroke ?? 0;
    $standard = $this->standard_stroke;
    $lotSize = $this->lot_size_value;
    
    // Calculate thresholds
    $orangeThreshold = $standard - $lotSize;  // e.g., 10,000 - 2,500 = 7,500
    $redThreshold = $standard;                 // e.g., 10,000
    
    if ($current >= $redThreshold) {
        return 'critical';   // 🔴 RED - Must stop production
    } elseif ($current >= $orangeThreshold) {
        return 'warning';    // 🟠 ORANGE - Schedule PPM soon
    }
    
    return 'normal';         // 🟢 GREEN - OK to continue
}
```

**Visual Representation:**

```
    0                    7,500              10,000
    |────────────────────|──────────────────|
    │     🟢 GREEN       │   🟠 ORANGE      │🔴 RED
    │     (Normal)       │   (Warning)      │(Critical)
    └────────────────────┴──────────────────┴─────────
                         ▲                  ▲
                  Orange Threshold    Red Threshold
                  (Standard - 1 Lot)  (Standard Stroke)
```

---

## 5. Alert System

### 5.1 Alert Flow

```
┌──────────────────────────────────────────────────────────┐
│                    ALERT TRIGGER                         │
│  When: Production log saved (stroke accumulation updated)│
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Check accumulation_stroke   │
              │  vs standard_stroke          │
              └──────────────┬───────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌───────────┐    ┌───────────┐    ┌───────────┐
    │  < Orange │    │  Orange   │    │  >= Red   │
    │ Threshold │    │ Threshold │    │ Threshold │
    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
          │                │                │
          ▼                ▼                ▼
    ┌───────────┐    ┌───────────┐    ┌───────────┐
    │  No Alert │    │  🟠 Orange│    │  🔴 Red   │
    │           │    │   Alert   │    │   Alert   │
    └───────────┘    └─────┬─────┘    └─────┬─────┘
                           │                │
                           ▼                ▼
                    ┌───────────┐    ┌───────────┐
                    │  Notify:  │    │  Notify:  │
                    │  • MGR/GM │    │  • MGR/GM │
                    │  • MD     │    │  • MD     │
                    │           │    │  • MTN    │
                    └───────────┘    └───────────┘
```

### 5.2 Alert Recipients

**Location:** `app/Services/AlertService.php`

```php
// Orange Alert Recipients
protected function getOrangeAlertRecipients()
{
    return User::where(function($query) {
        $query->where('role', User::ROLE_MGR_GM)
              ->orWhere('role', User::ROLE_MD);
    })->get();
}

// Red Alert Recipients (includes MTN Dies)
protected function getRedAlertRecipients()
{
    return User::where(function($query) {
        $query->where('role', User::ROLE_MGR_GM)
              ->orWhere('role', User::ROLE_MD)
              ->orWhere('role', User::ROLE_MTN_DIES);
    })->get();
}
```

### 5.3 Notification Content

**Orange Alert Email:**
```
Subject: ⚠️ PPM Warning Alert - {part_number}

Die {part_number} ({part_name}) is approaching PPM threshold.

Current Stroke: 8,000
Standard Stroke: 10,000
Usage: 80%

Action Required: Schedule PPM within next production cycle.
```

**Red Alert Email:**
```
Subject: 🚨 CRITICAL PPM Alert - {part_number}

Die {part_number} ({part_name}) has exceeded PPM threshold!

Current Stroke: 10,500
Standard Stroke: 10,000
Usage: 105%

IMMEDIATE ACTION REQUIRED: Stop production and perform PPM!
```

---

## 6. Lot Progress Visualization

### 6.1 Zone-Based Coloring Logic

**Location:** `app/Models/DieModel.php`

```php
public function getLotProgressAttribute()
{
    $totalLots = $this->total_lots;      // e.g., 4
    $lotSize = $this->lot_size_value;    // e.g., 2,500
    $current = $this->accumulation_stroke ?? 0;
    $standard = $this->standard_stroke;  // e.g., 10,000
    
    $lots = [];
    
    for ($i = 1; $i <= $totalLots; $i++) {
        $lotStart = ($i - 1) * $lotSize;
        $lotEnd = $i * $lotSize;
        
        // Determine zone color based on position
        if ($i === $totalLots) {
            $zone = 'red';           // Last lot = RED
        } elseif ($i === $totalLots - 1) {
            $zone = 'orange';        // Second-to-last = ORANGE
        } else {
            $zone = 'green';         // Others = GREEN
        }
        
        // Determine if lot is filled based on current stroke
        $filled = $current >= $lotEnd;
        $partial = !$filled && $current > $lotStart;
        
        $lots[] = [
            'lot' => $i,
            'start' => $lotStart,
            'end' => $lotEnd,
            'zone' => $zone,
            'filled' => $filled,
            'partial' => $partial,
            'percentage' => $partial 
                ? (($current - $lotStart) / $lotSize) * 100 
                : ($filled ? 100 : 0),
        ];
    }
    
    return $lots;
}
```

### 6.2 Visual Example

**Scenario:** Standard = 10,000, Lot Size = 2,500, Current = 6,000

```
    Lot 1       Lot 2       Lot 3       Lot 4
  (0-2,500)  (2,500-5,000) (5,000-7,500) (7,500-10,000)
  
  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
  │█████████│ │█████████│ │████░░░░░│ │░░░░░░░░░│
  │ 🟢 100% │ │ 🟢 100% │ │ 🟠 40%  │ │ 🔴 0%   │
  └─────────┘ └─────────┘ └─────────┘ └─────────┘
      ✓           ✓          Partial      Empty
```

### 6.3 Frontend Component

**Location:** `resources/js/Components/PPM/LotProgress.jsx`

```jsx
// Zone-based color classes
const getZoneColor = (zone, filled, partial) => {
    if (!filled && !partial) {
        // Empty lot - lighter version with border
        return {
            green: 'bg-green-100 border border-green-300',
            orange: 'bg-orange-100 border border-orange-300',
            red: 'bg-red-100 border border-red-300',
        }[zone];
    }
    
    // Filled lot - solid color
    return {
        green: 'bg-green-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
    }[zone];
};
```

---

## 7. User Roles & Permissions

### 7.1 Role Definitions

**Location:** `app/Models/User.php`

```php
const ROLE_ADMIN = 'admin';
const ROLE_PE = 'pe';              // Production Engineering
const ROLE_MTN_DIES = 'mtn_dies';  // Maintenance Dies
const ROLE_MGR_GM = 'mgr_gm';      // Manager / General Manager
const ROLE_MD = 'md';              // Managing Director
```

### 7.2 Role Permissions Matrix

| Feature | Admin | PE | MTN Dies | MGR/GM | MD |
|---------|-------|-----|----------|--------|-----|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Dies | ✅ | ❌ | ✅ | ❌ | ❌ |
| Input Production Log | ✅ | ✅ | ✅ | ❌ | ❌ |
| Schedule PPM | ✅ | ❌ | ✅ | ❌ | ❌ |
| Process PPM | ✅ | ❌ | ✅ | ❌ | ❌ |
| Receive Orange Alert | ❌ | ❌ | ❌ | ✅ | ✅ |
| Receive Red Alert | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |

### 7.3 Alert Recipients by Role

```
┌──────────────────────────────────────────────────────────┐
│                    ALERT RECIPIENTS                      │
├────────────────────┬─────────────────┬───────────────────┤
│       Role         │  Orange Alert   │    Red Alert      │
├────────────────────┼─────────────────┼───────────────────┤
│  Admin             │       ❌        │        ❌         │
│  PE                │       ❌        │        ❌         │
│  MTN Dies          │       ❌        │        ✅         │
│  MGR/GM            │       ✅        │        ✅         │
│  MD                │       ✅        │        ✅         │
└────────────────────┴─────────────────┴───────────────────┘
```

---

## 8. API Endpoints

### 8.1 Dies Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dies` | List all dies with pagination |
| GET | `/dies/{id}` | Show die details |
| POST | `/dies` | Create new die |
| PUT | `/dies/{id}` | Update die |
| DELETE | `/dies/{id}` | Delete die |
| POST | `/dies/{id}/schedule-ppm` | Schedule PPM for die |
| POST | `/dies/{id}/start-ppm` | Start PPM processing |

### 8.2 Production Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/production` | List production logs |
| GET | `/production/{id}` | Show log details |
| POST | `/production` | Create new log (adds stroke) |
| PUT | `/production/{id}` | Update log (adjusts stroke) |
| DELETE | `/production/{id}` | Delete log (decrements stroke) |

### 8.3 PPM Schedule

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ppm-schedule` | List PPM schedules |
| POST | `/ppm-schedule` | Create PPM schedule |
| PUT | `/ppm-schedule/{id}` | Update schedule |
| POST | `/ppm-schedule/{id}/complete` | Mark PPM complete |

---

## Appendix A: Production Log Stroke Adjustment

When editing or deleting production logs, the system automatically adjusts die accumulation:

### On Update:
```php
$difference = $newOutputQty - $oldOutputQty;
$die->accumulation_stroke += $difference;
```

### On Delete:
```php
$die->accumulation_stroke -= $productionLog->output_qty;
```

---

## Appendix B: PPM Processing Flow

```
┌─────────────────────────────────────────────────────────┐
│                   PPM PROCESSING                        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  1. Create PPM History       │
              │     - Record current stroke  │
              │     - Record maintenance     │
              │       performed              │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  2. Reset Die Accumulation   │
              │     accumulation_stroke = 0  │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  3. Update Die Status        │
              │     ppm_alert_status = none  │
              │     status = 'active'        │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  4. Update PPM Schedule      │
              │     status = 'completed'     │
              │     completed_at = now()     │
              └──────────────────────────────┘
```

---

## Appendix C: Configuration Constants

```php
// Default Values
const DEFAULT_STANDARD_STROKE = 10000;
const DEFAULT_LOT_SIZE = 2500;

// Alert Thresholds
const ORANGE_THRESHOLD = STANDARD_STROKE - LOT_SIZE;  // 75%
const RED_THRESHOLD = STANDARD_STROKE;                 // 100%

// Tonnage Standards (Machine-based)
// 800T  → Standard: 10,000, Lot: 2,500
// 1200T → Standard: 8,000,  Lot: 2,000
// 1600T → Standard: 6,000,  Lot: 1,500
```

---

**Document End**

*For questions or clarifications, contact the Development Team.*
