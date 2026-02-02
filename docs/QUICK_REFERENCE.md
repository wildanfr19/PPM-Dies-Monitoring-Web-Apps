# PPM Dies Monitoring System - Quick Reference

## System Purpose

**Objective:** Control system to protect die maintenance from exceeding stroke limits and reduce problematic parts due to die condition issues.

---

## Key Formulas

### Standard Stroke Priority
```
1. control_stroke (if set)
2. ppm_standard (if set)  
3. tonnageStandard.standard_stroke (from machine)
4. Default: 10,000
```

### Lot Calculation
```
Total Lots = ceil(Standard Stroke / Lot Size)
Example: ceil(10,000 / 2,500) = 4 lots
```

### Alert Thresholds
```
Orange Threshold = Standard Stroke - Lot Size
Red Threshold    = Standard Stroke

Example with Standard=10,000, LotSize=2,500:
- Orange at ≥ 7,500 strokes
- Red at ≥ 10,000 strokes
```

---

## Zone Coloring

| Position | Zone | Color | Meaning |
|----------|------|-------|---------|
| Last lot | Red | 🔴 | Critical - Stop Production |
| Second-to-last | Orange | 🟠 | Warning - Schedule PPM |
| Others | Green | 🟢 | Normal - OK to continue |

---

## Alert Recipients

| Alert Type | Recipients |
|------------|------------|
| 🟠 Orange | MGR/GM, MD |
| 🔴 Red | MGR/GM, MD, MTN Dies |

---

## User Roles

| Role | Code | Primary Function |
|------|------|------------------|
| Admin | `admin` | Full system access |
| Production Engineering | `pe` | Production planning |
| Maintenance Dies | `mtn_dies` | Die maintenance |
| Manager/GM | `mgr_gm` | Approval & monitoring |
| Managing Director | `md` | Executive oversight |

---

## Key Files

| Purpose | Location |
|---------|----------|
| Die Model (Core Logic) | `app/Models/DieModel.php` |
| Alert Service | `app/Services/AlertService.php` |
| Notifications | `app/Notifications/CriticalDieAlert.php` |
| Die Controller | `app/Http/Controllers/DieController.php` |
| Production Controller | `app/Http/Controllers/ProductionLogController.php` |
| Lot Progress Component | `resources/js/Components/PPM/LotProgress.jsx` |

---

## Production Log Impact

### On Create
```php
die.accumulation_stroke += output_qty
```

### On Update
```php
difference = new_output - old_output
die.accumulation_stroke += difference
```

### On Delete
```php
die.accumulation_stroke -= output_qty
```

---

## PPM Processing

1. **Schedule PPM** → Set planned date
2. **Start PPM** → Mark in-progress
3. **Complete PPM** → 
   - Reset accumulation_stroke = 0
   - Clear ppm_alert_status = 'none'
   - Record in PPM History

---

*Generated: January 28, 2026*
