# Essential Load vs Diversity Factor

## Overview
These are **two different concepts** that serve **different purposes** in solar system sizing:

---

## 1. **Diversity Factor (Load Diversity Factor)**

### Purpose
Accounts for the fact that **not all appliances run simultaneously**. People manage their usage throughout the day.

### When Applied
- **Applied to**: Daily energy consumption (kWh/day)
- **Used for**: Solar panel sizing, inverter sizing (overall system capacity)
- **Applied in**: `calculate_total_daily_kwh()` function

### How It Works
```
Total Daily kWh (without diversity) = 183.39 kWh/day
Diversity Factor = 0.65 (65% simultaneous usage)
Adjusted Daily kWh = 183.39 × 0.65 = 119.20 kWh/day
```

### Example
- You have: 11 ACs, 10 fridges, 6 TVs, 180 spot lights, etc.
- **Without diversity**: All appliances running 24/7 = 183.39 kWh/day
- **With diversity (0.65)**: Realistic simultaneous usage = 119.20 kWh/day
- **Result**: Smaller solar panels and inverter needed

### Default Value
- **0.65** (65% simultaneous usage)
- Configurable in: **Settings → Sizing Factors → Load Diversity Factor**

---

## 2. **Essential Load (Essential Load Percent)**

### Purpose
Determines **what percentage of the total load needs battery backup** during grid outages.

### When Applied
- **Applied to**: Battery backup capacity only
- **Used for**: Battery sizing (how much battery capacity is needed)
- **Applied in**: `calculate_sizing()` function for battery calculations

### How It Works
```
Total Daily kWh (after diversity) = 119.20 kWh/day
Average Load = 119.20 / 24 = 4.97 kW
Essential Load % = 50% (default)
Essential Load = 4.97 × 0.50 = 2.49 kW

Battery Capacity = (Essential Load × Backup Hours) / Depth of Discharge
Battery Capacity = (2.49 kW × 8 hours) / 0.85 = 23.4 kWh
```

### Example
- **Total Load**: 119.20 kWh/day (all appliances)
- **Essential Load (50%)**: Only critical appliances need backup (fridges, lights, maybe 1 AC)
- **Non-Essential**: Washing machine, oven, some ACs can wait until grid returns
- **Result**: Smaller battery bank needed (only backup essential loads)

### Default Value
- **0.5** (50% of total load is essential)
- Configurable in: **System Sizing input** (when calculating sizing)

---

## Key Differences

| Aspect | Diversity Factor | Essential Load |
|--------|-----------------|----------------|
| **Purpose** | Reduces daily energy consumption | Determines battery backup needs |
| **Applied To** | Total daily kWh | Battery capacity calculation |
| **Affects** | Solar panels, Inverter | Battery bank only |
| **Default** | 0.65 (65%) | 0.5 (50%) |
| **When Used** | Always (for system sizing) | Only for battery sizing |
| **Reason** | Not all appliances on simultaneously | Not all loads need backup |

---

## Real-World Example

### Scenario: Mr. Sowah's Project
- **Total Appliances**: 11 ACs, 10 fridges, 6 TVs, 180 lights, etc.
- **Without Diversity Factor**: 183.39 kWh/day
- **With Diversity Factor (0.65)**: 119.20 kWh/day ✅
  - Used for: Solar panel sizing (70 panels), Inverter sizing (50kW)

### Battery Backup
- **Total Load**: 119.20 kWh/day = 4.97 kW average
- **Essential Load (50%)**: 2.49 kW
  - Only critical loads: Fridges, essential lights, maybe 1-2 ACs
  - Non-essential: Washing machine, oven, extra ACs can wait
- **Battery Capacity**: 55 kWh (for 8 hours backup at 50% essential load)

---

## Summary

1. **Diversity Factor** = "Not everything runs at once" → Reduces overall system size
2. **Essential Load** = "Not everything needs backup" → Reduces battery size

Both help optimize the system cost by avoiding over-sizing!
