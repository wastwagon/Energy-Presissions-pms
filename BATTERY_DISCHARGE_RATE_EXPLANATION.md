# Battery Discharge Rate (C-Rate) and Sizing Impact

## What is C-Rate?

**C-rate** (or discharge rate) determines how fast a battery can discharge its stored energy. It's expressed as a fraction or multiple of the battery's capacity.

### Examples:
- **0.5C**: Battery can discharge 50% of its capacity per hour
  - A 10kWh battery at 0.5C can deliver **5kW** continuously
- **1C**: Battery can discharge 100% of its capacity per hour
  - A 10kWh battery at 1C can deliver **10kW** continuously
- **0.25C**: Battery can discharge 25% of its capacity per hour
  - A 10kWh battery at 0.25C can deliver **2.5kW** continuously

## Why C-Rate Matters for Sizing

Battery sizing must satisfy **TWO requirements**:

### 1. **Energy Requirement** (kWh)
- How much energy is needed for the backup duration?
- Formula: `Capacity = (Load Power × Backup Hours) / Depth of Discharge`

### 2. **Power Requirement** (kW)
- Can the battery deliver enough power to run the load?
- Formula: `Max Power = C-Rate × Capacity × Depth of Discharge`
- Therefore: `Capacity = Load Power / (C-Rate × DOD)`

**The battery must be sized to meet BOTH requirements** - use the larger of the two calculations.

## Real-World Example

### Scenario:
- **Essential Load**: 5kW
- **Backup Hours**: 8 hours
- **Depth of Discharge**: 85% (0.85)
- **C-Rate**: 0.5C (typical for LiFePO4 batteries)

### Calculation:

**Step 1: Energy-based sizing**
```
Capacity = (5kW × 8 hours) / 0.85
Capacity = 40 kWh / 0.85
Capacity = 47.06 kWh
```

**Step 2: Power-based sizing (C-rate)**
```
Max Power = C-Rate × Capacity × DOD
5kW = 0.5 × Capacity × 0.85
5kW = 0.425 × Capacity
Capacity = 5kW / 0.425
Capacity = 11.76 kWh
```

**Step 3: Use the larger value**
```
Required Capacity = max(47.06 kWh, 11.76 kWh) = 47.06 kWh
Rounded to nearest 5kWh = 50 kWh
```

### What if C-Rate was 0.25C instead?

**Power-based sizing would be:**
```
Capacity = 5kW / (0.25 × 0.85)
Capacity = 5kW / 0.2125
Capacity = 23.53 kWh
```

**Still need 50 kWh** (energy requirement is still the limiting factor)

### What if load was 10kW instead?

**Energy-based sizing:**
```
Capacity = (10kW × 8 hours) / 0.85 = 94.12 kWh
```

**Power-based sizing (0.5C):**
```
Capacity = 10kW / (0.5 × 0.85) = 23.53 kWh
```

**Still need 100 kWh** (energy requirement is still the limiting factor)

### What if load was 20kW with 2 hours backup?

**Energy-based sizing:**
```
Capacity = (20kW × 2 hours) / 0.85 = 47.06 kWh
```

**Power-based sizing (0.5C):**
```
Capacity = 20kW / (0.5 × 0.85) = 47.06 kWh
```

**Need 50 kWh** (both requirements are similar)

### What if load was 30kW with 2 hours backup?

**Energy-based sizing:**
```
Capacity = (30kW × 2 hours) / 0.85 = 70.59 kWh
```

**Power-based sizing (0.5C):**
```
Capacity = 30kW / (0.5 × 0.85) = 70.59 kWh
```

**Need 75 kWh** (both requirements are similar)

### Critical Case: High Power, Short Duration

**Load: 25kW, Backup: 1 hour, C-Rate: 0.5C**

**Energy-based sizing:**
```
Capacity = (25kW × 1 hour) / 0.85 = 29.41 kWh
```

**Power-based sizing:**
```
Capacity = 25kW / (0.5 × 0.85) = 58.82 kWh
```

**Need 60 kWh** (power requirement is the limiting factor!)

## System Efficiency Consideration

### Important: Battery Discharge Efficiency

When sizing batteries, we must account for **inverter losses** during battery discharge:

**Energy Flow:**
```
Battery (DC) → Inverter → Load (AC)
```

**Efficiency Loss:**
- Inverter efficiency: ~95%
- Wiring losses: ~2-3%
- **Total battery discharge efficiency: ~90%**

### Why This Matters:

If the AC load needs **5kW**, the battery must provide:
```
DC Power Required = AC Load / Battery Discharge Efficiency
DC Power Required = 5kW / 0.90 = 5.56kW
```

**Without efficiency consideration:**
- Battery sized for 5kW → insufficient!

**With efficiency consideration:**
- Battery sized for 5.56kW → correct!

## System Implementation

### Default Settings:
- **C-Rate**: 0.5C (configurable in Settings)
- **Depth of Discharge**: 85% (0.85)
- **Battery Discharge Efficiency**: 90% (0.90) - accounts for inverter losses
- **Minimum Battery Size**: 5 kWh

### Calculation Logic:
```python
# Step 1: Convert AC load to DC power requirement
# AC load is what the user needs, but battery provides DC
essential_load_kw_ac = (total_daily_kwh / 24) × essential_percent
essential_load_kw_dc = essential_load_kw_ac / battery_discharge_efficiency

# Step 2: Energy requirement
battery_capacity_energy = (load_kw_dc × backup_hours) / dod

# Step 3: Power requirement (C-rate)
battery_capacity_power = load_kw_dc / (c_rate × dod)

# Step 4: Use the larger value
battery_capacity = max(battery_capacity_energy, battery_capacity_power)
```

### Example with Efficiency:

**Scenario:**
- AC Load: 5kW
- Backup: 8 hours
- DOD: 85%
- C-Rate: 0.5C
- Discharge Efficiency: 90%

**Calculation:**
```
DC Load = 5kW / 0.90 = 5.56kW

Energy requirement:
Capacity = (5.56kW × 8 hours) / 0.85 = 52.33 kWh

Power requirement:
Capacity = 5.56kW / (0.5 × 0.85) = 13.09 kWh

Result: 55 kWh (rounded to nearest 5kWh)
```

**Without efficiency (WRONG):**
```
Energy requirement:
Capacity = (5kW × 8 hours) / 0.85 = 47.06 kWh

Result: 50 kWh (UNDERSIZED!)
```

## Impact on Sizing

**C-rate becomes critical when:**
1. **High power loads** relative to backup duration
2. **Short backup durations** (1-2 hours)
3. **Low C-rate batteries** (0.25C or lower)

**C-rate is less critical when:**
1. **Long backup durations** (8+ hours)
2. **Low power loads** relative to backup duration
3. **High C-rate batteries** (1C or higher)

## Typical C-Rates by Battery Type

- **Lead-Acid**: 0.1C - 0.2C (very low)
- **LiFePO4 (Standard)**: 0.5C - 1C (common)
- **LiFePO4 (High Power)**: 1C - 2C
- **Lithium NMC**: 1C - 3C (high power)

## Configuration

The C-rate can be adjusted in the Settings table:
- **Key**: `battery_c_rate`
- **Default**: 0.5 (0.5C)
- **Description**: Battery discharge rate - maximum power as fraction of capacity

This ensures batteries are properly sized for both energy storage AND power delivery requirements.

