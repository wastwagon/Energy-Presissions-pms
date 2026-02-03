# Solar Sizing Calculation Explanation

## Complete Calculation Formula

### Input Values
- **Daily Energy Requirement**: 33.27 kWh/day
- **Peak Sun Hours**: 5.2 hrs/day (for Kumasi, Ashanti)
- **System Efficiency**: 72% (0.72)
- **Design Factor**: 1.20 (20% safety margin)
- **Panel Wattage**: 580W (Jinko)
- **Max DC/AC Ratio**: 1.3

### Step-by-Step Calculation

#### Step 1: Account for System Losses
```
Effective Daily Energy = Daily Energy ÷ System Efficiency
Effective Daily Energy = 33.27 ÷ 0.72
Effective Daily Energy = 46.2083... kWh
Rounded: 46.21 kWh
```

**Why?** The system needs to generate more energy than required to account for:
- Inverter losses (~5-10%)
- Wiring losses (~2-3%)
- Temperature derating (~5-8%)
- Soiling losses (~2-4%)
- Total system efficiency: 72%

#### Step 2: Calculate Base System Size
```
Base System Size = Effective Daily Energy ÷ Peak Sun Hours
Base System Size = 46.2083 ÷ 5.2
Base System Size = 8.8862... kW
```

**Why?** This is the DC capacity needed to generate the required energy in the available sunlight hours.

#### Step 3: Apply Design Factor (Safety Margin)
```
System Size = Base System Size × Design Factor
System Size = 8.8862 × 1.20
System Size = 10.6635... kW
Rounded: 10.66 kW
```

**Why?** Adds 20% safety margin for:
- Seasonal variations
- Panel degradation over time
- Unexpected load increases
- Weather variations

#### Step 4: Calculate Number of Panels
```
Exact Panels = System Size (kW) × 1000 ÷ Panel Wattage
Exact Panels = 10.6635 × 1000 ÷ 580
Exact Panels = 18.385... panels
Number of Panels = CEIL(18.385) = 19 panels
```

**Why?** We round UP to ensure the system meets or exceeds the requirement.

#### Step 5: Calculate Panel Array Capacity
```
Panel Array = Number of Panels × Panel Wattage ÷ 1000
Panel Array = 19 × 580 ÷ 1000
Panel Array = 11.02 kW
```

**Why?** This is the actual DC capacity of the installed panels (may be slightly higher than calculated system size due to rounding).

#### Step 6: Calculate Inverter Size
```
Min Inverter = System Size ÷ Max DC/AC Ratio
Min Inverter = 10.6635 ÷ 1.3
Min Inverter = 8.2027... kW
Inverter Size = ROUND UP to nearest 0.5 kW, minimum 6.5 kW
Inverter Size = 8.5 kW
```

**Why?** The inverter must handle the DC power from panels. DC/AC ratio of 1.3 means panels can produce 30% more DC than inverter AC capacity (prevents clipping).

#### Step 7: Calculate DC/AC Ratio
```
DC/AC Ratio = Panel Array Capacity ÷ Inverter Size
DC/AC Ratio = 11.02 ÷ 8.5
DC/AC Ratio = 1.296... ≈ 1.30
```

**Why?** This shows the actual ratio of DC panel capacity to AC inverter capacity. Should be ≤ 1.3 to prevent inverter clipping.

## Results Summary

| Parameter | Value | Formula |
|-----------|-------|---------|
| Effective Daily Energy | 46.21 kWh | 33.27 ÷ 0.72 |
| System Size | 10.66 kW | (46.21 ÷ 5.2) × 1.20 |
| Number of Panels | 19 | CEIL(10.6635 × 1000 ÷ 580) |
| Panel Array | 11.02 kW | 19 × 580W ÷ 1000 |
| Inverter Size | 8.5 kW | ROUND(10.6635 ÷ 1.3) to 0.5 kW |
| DC/AC Ratio | 1.30 | 11.02 ÷ 8.5 |

## Important Notes

1. **Peak Sun Hours**: The value used (5.2 hrs) must match the location. Kumasi should be 5.1 hrs in database.
2. **Rounding**: Panels are always rounded UP to ensure system meets requirements.
3. **Panel Array vs System Size**: Panel array (11.02 kW) may be slightly higher than calculated system size (10.66 kW) due to rounding.
4. **DC/AC Ratio**: Uses actual panel array capacity, not rounded system size, for accuracy.

## Common Calculation Errors

1. **Using rounded intermediate values**: Always use unrounded values for calculations, round only for display.
2. **Wrong peak sun hours**: Verify the location's peak sun hours in the database.
3. **Forgetting design factor**: The 20% safety margin is critical for system reliability.
4. **Using system size instead of panel array for DC/AC**: DC/AC ratio must use actual panel capacity.








