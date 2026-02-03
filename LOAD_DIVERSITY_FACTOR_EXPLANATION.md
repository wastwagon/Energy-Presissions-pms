# Load Diversity Factor - System Optimization

## ✅ Problem Solved

The system was calculating **too many panels** because it assumed **all appliances run simultaneously** at full capacity. In reality, people manage their usage and not all appliances are on at the same time.

## 📊 Before vs After Comparison

### **Before (Without Diversity Factor)**
- **Total Daily Consumption**: 183.39 kWh/day
- **System Size**: ~61.5 kW
- **Number of Panels**: ~108 panels (Longi 570W)
- **Inverter Size**: ~47 kW
- **Battery Capacity**: ~48 kWh
- **Roof Area**: ~334 m²

### **After (With 65% Diversity Factor)**
- **Total Daily Consumption**: 119.20 kWh/day ⬇️ **35% reduction**
- **System Size**: 39.73 kW ⬇️ **35% reduction**
- **Number of Panels**: **70 panels** (Longi 570W) ⬇️ **35% reduction**
- **Inverter Size**: 31.0 kW ⬇️ **34% reduction**
- **Battery Capacity**: 30.0 kWh ⬇️ **38% reduction**
- **Roof Area**: 218.4 m² ⬇️ **35% reduction**

## 🎯 What is Load Diversity Factor?

**Load Diversity Factor = 0.65 (65%)**

This means:
- On average, only **65% of appliances are running simultaneously**
- Accounts for realistic usage patterns:
  - Not all 11 ACs run at the same time
  - Not all 6 TVs are on simultaneously
  - Not all 195 lights are on at once
  - People manage their usage throughout the day
  - Appliances are used in shifts/staggered

## 💡 Real-World Examples

### Why 65% is Realistic:

1. **Air Conditioners (11 units)**
   - Peak usage: Maybe 6-7 ACs on during hottest hours
   - Night: Only 2-3 bedrooms need AC
   - **Diversity**: ~60-70%

2. **Televisions (6 units)**
   - Family watches 1-2 TVs at a time
   - Not all rooms have TVs on simultaneously
   - **Diversity**: ~30-40%

3. **Lighting (195 units)**
   - Daytime: Minimal lighting needed
   - Evening: More lights, but not all 195
   - **Diversity**: ~40-50%

4. **Refrigeration (10 units)**
   - These run 24/7, but with duty cycles
   - Already accounted for in individual calculations
   - **Diversity**: Already factored

## 🔧 How It Works

The diversity factor is applied to the **total daily consumption**:

```
Adjusted Daily kWh = Total Daily kWh × Diversity Factor
Adjusted Daily kWh = 183.39 × 0.65 = 119.20 kWh/day
```

This adjusted value is then used for:
- Panel sizing calculations
- Inverter sizing
- Battery sizing
- System design

## ⚙️ Configuration

The diversity factor is **configurable** in the Settings:

- **Default**: 0.65 (65%)
- **Range**: 0.5 - 1.0 (50% - 100%)
- **Location**: Settings table, key: `load_diversity_factor`

### When to Adjust:

- **Lower (0.5-0.6)**: For very conservative usage, strict load management
- **Default (0.65)**: For typical residential/commercial usage
- **Higher (0.7-0.8)**: For commercial/industrial with consistent high load
- **1.0 (100%)**: Only if all appliances truly run simultaneously (rare)

## 📈 Benefits

1. **More Realistic Sizing**: System matches actual usage patterns
2. **Cost Savings**: Fewer panels = lower equipment costs
3. **Better ROI**: Right-sized system for the actual load
4. **Flexibility**: Can adjust factor based on customer usage patterns
5. **Industry Standard**: Load diversity is standard in electrical engineering

## 🎓 Technical Details

The diversity factor is applied in `calculate_total_daily_kwh()`:

```python
if apply_diversity_factor:
    diversity_factor = get_setting_value(db, "load_diversity_factor", 0.65)
    total_kwh = total_kwh * diversity_factor
```

This happens **before** sizing calculations, so all downstream calculations (panels, inverter, battery) use the adjusted value.

## ✅ Status

- ✅ Load diversity factor implemented
- ✅ Default set to 65% (0.65)
- ✅ Applied automatically to all sizing calculations
- ✅ Configurable via Settings
- ✅ Mr. Sowah's project recalculated with new factor

## 🔄 Next Steps

1. **Recalculate Sizing**: Go to project page and click "Calculate Sizing"
2. **Review Results**: Check the new panel count and system size
3. **Adjust if Needed**: If customer has specific usage patterns, adjust diversity factor in Settings
4. **Generate Quote**: Create quote with the optimized sizing

---

**Note**: The diversity factor is a **realistic engineering approach** used in electrical load calculations worldwide. It ensures the system is properly sized for actual usage, not theoretical maximum load.
