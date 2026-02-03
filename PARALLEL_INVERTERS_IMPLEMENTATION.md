# Parallel Inverters Implementation

## ✅ Feature Implemented

The system now supports **parallel inverter configurations** instead of always using one large inverter. This allows for more flexible and cost-effective system designs.

## 📊 Example: Mr. Sowah's Project

### Before (Single Large Inverter)
- **Required**: 31kW
- **Solution**: 1× 31kW inverter (or larger)
- **Issue**: Large inverters are expensive and may not be readily available

### After (Parallel Inverters)
- **Required**: 31kW
- **Solution**: **2× 20kW inverters** (40kW total)
- **Benefits**:
  - More cost-effective
  - Better availability
  - Redundancy (if one fails, system still operates)
  - Easier installation and maintenance

## 🎯 How It Works

### Configuration
The system uses these settings (configurable in Settings):

1. **use_parallel_inverters**: `1` (enabled) or `0` (disabled)
2. **standard_inverter_sizes**: `"10,15,20,25,30"` (comma-separated kW sizes)
3. **max_parallel_inverters**: `4` (maximum number of inverters in parallel)

### Calculation Logic

1. **Calculate Required Capacity**: Based on system size and DC/AC ratio
2. **Find Optimal Configuration**: 
   - Tries different combinations of standard sizes
   - Selects configuration with minimum waste (excess capacity)
   - Ensures total capacity meets or exceeds requirement
   - Respects maximum parallel limit

3. **Examples**:
   - 31kW required → 2× 20kW = 40kW ✅
   - 50kW required → 2× 25kW = 50kW ✅
   - 60kW required → 3× 20kW = 60kW ✅
   - 35kW required → 2× 20kW = 40kW ✅ (or 1× 30kW + 1× 10kW if available)

## 🔧 Technical Details

### Database Changes
Added to `SizingResult` model:
- `inverter_count` (Integer): Number of parallel inverters
- `inverter_unit_size_kw` (Float): Size of each inverter unit

### Code Changes
1. **`sizing.py`**: Added `calculate_parallel_inverters()` function
2. **`pricing.py`**: Updated to add multiple inverters to quotes when count > 1
3. **`schemas.py`**: Added new fields to `SizingResult` schema
4. **`models.py`**: Added new columns to `SizingResult` model

### Quote Generation
When generating quotes:
- If `inverter_count > 1`: Adds multiple line items or one item with quantity > 1
- Description shows: `"Energy Precisions 20kW Inverter (×2 parallel)"`
- Total price = unit_price × quantity

## ⚙️ Configuration

### Default Settings
- **Standard Sizes**: 10kW, 15kW, 20kW, 25kW, 30kW
- **Max Parallel**: 4 inverters
- **Enabled**: Yes

### To Customize
1. Go to Settings in PMS
2. Update `standard_inverter_sizes` with your available sizes
3. Update `max_parallel_inverters` if needed
4. Set `use_parallel_inverters` to `0` to disable

### Example Customization
If you have 5kW, 10kW, 15kW, 20kW inverters:
```
standard_inverter_sizes = "5,10,15,20"
```

## 📈 Benefits

1. **Cost Savings**: Smaller inverters are often cheaper per kW
2. **Availability**: Standard sizes are more readily available
3. **Flexibility**: Can mix and match sizes if needed
4. **Redundancy**: System continues operating if one inverter fails
5. **Scalability**: Easy to add more inverters later
6. **Installation**: Smaller units are easier to handle and install

## 🔄 Migration Notes

If you have existing sizing results:
- Old results will have `inverter_count = 1` (default)
- Recalculate sizing to get parallel inverter configuration
- New calculations will automatically use parallel inverters

## ✅ Status

- ✅ Parallel inverter calculation implemented
- ✅ Settings configured
- ✅ Quote generation updated
- ✅ Database model updated
- ✅ Tested with Mr. Sowah's project (31kW → 2× 20kW)

## 🎓 Industry Standard

Parallel inverters are a common practice in solar installations:
- **Small Systems**: Often use single inverter
- **Medium Systems (20-50kW)**: Often use 2-3 parallel inverters
- **Large Systems (50kW+)**: Typically use multiple parallel inverters

This implementation follows industry best practices and provides flexibility for different system sizes.
