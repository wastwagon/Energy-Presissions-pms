#!/usr/bin/env python3
"""
Manual calculation verification for sizing
"""
import math

# Input values from the image
daily_kwh = 33.27
peak_sun_hours = 5.2  # Note: Image shows 5.2 in Input Parameters, but also shows "5 hrs" for location
system_efficiency = 0.72
design_factor = 1.20
panel_wattage = 580
max_dc_ac_ratio = 1.3

print("=" * 70)
print("MANUAL CALCULATION VERIFICATION")
print("=" * 70)
print(f"\nInput Values:")
print(f"  Daily Energy: {daily_kwh} kWh/day")
print(f"  Peak Sun Hours: {peak_sun_hours} hrs/day")
print(f"  System Efficiency: {system_efficiency} ({system_efficiency*100}%)")
print(f"  Design Factor: {design_factor} ({int((design_factor-1)*100)}% margin)")
print(f"  Panel Wattage: {panel_wattage}W")
print(f"  Max DC/AC Ratio: {max_dc_ac_ratio}")
print()

# Step 1: Account for system losses
effective_daily_kwh = daily_kwh / system_efficiency
print(f"Step 1: Account for System Losses")
print(f"  Effective Daily Energy = {daily_kwh} / {system_efficiency}")
print(f"  = {effective_daily_kwh:.10f} kWh")
print(f"  Rounded to 2 decimals: {round(effective_daily_kwh, 2)} kWh")
print(f"  Expected: 46.21 kWh")
print()

# Step 2: Calculate system size (before design factor)
system_size_before = effective_daily_kwh / peak_sun_hours
print(f"Step 2: Calculate Base System Size")
print(f"  System Size (before design) = {effective_daily_kwh:.10f} / {peak_sun_hours}")
print(f"  = {system_size_before:.10f} kW")
print(f"  Rounded to 2 decimals: {round(system_size_before, 2)} kW")
print()

# Step 3: Apply design factor
system_size_after = system_size_before * design_factor
print(f"Step 3: Apply Design Factor")
print(f"  System Size (with design) = {system_size_before:.10f} × {design_factor}")
print(f"  = {system_size_after:.10f} kW")
print(f"  Rounded to 2 decimals: {round(system_size_after, 2)} kW")
print(f"  Expected: 10.66 kW")
print()

# Step 4: Calculate number of panels
panels_exact = system_size_after * 1000 / panel_wattage
number_of_panels = math.ceil(panels_exact)
print(f"Step 4: Calculate Number of Panels")
print(f"  Exact panels needed = {system_size_after:.10f} × 1000 / {panel_wattage}")
print(f"  = {panels_exact:.10f} panels")
print(f"  Rounded UP (CEIL): {number_of_panels} panels")
print(f"  Expected: 19 panels")
print()

# Panel array capacity
panel_array_kw = (number_of_panels * panel_wattage) / 1000
print(f"Panel Array Capacity:")
print(f"  {number_of_panels} × {panel_wattage}W = {panel_array_kw:.10f} kW")
print(f"  Rounded to 2 decimals: {round(panel_array_kw, 2)} kW")
print(f"  Expected: 11.02 kW")
print()

# Step 5: Calculate inverter size
min_inverter_kw = system_size_after / max_dc_ac_ratio
inverter_size_kw = max(6.5, math.ceil(min_inverter_kw * 2) / 2)
print(f"Step 5: Calculate Inverter Size")
print(f"  Min Inverter = {system_size_after:.10f} / {max_dc_ac_ratio}")
print(f"  = {min_inverter_kw:.10f} kW")
print(f"  Rounded to nearest 0.5 kW: {inverter_size_kw} kW")
print(f"  Expected: 8.5 kW")
print()

# DC/AC Ratio
dc_ac_ratio = panel_array_kw / inverter_size_kw
print(f"DC/AC Ratio:")
print(f"  = Panel Array / Inverter")
print(f"  = {panel_array_kw:.10f} / {inverter_size_kw}")
print(f"  = {dc_ac_ratio:.10f}")
print(f"  Rounded to 2 decimals: {round(dc_ac_ratio, 2)}")
print(f"  Expected: 1.30")
print()

print("=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"Effective Daily Energy: {round(effective_daily_kwh, 2)} kWh")
print(f"System Size: {round(system_size_after, 2)} kW")
print(f"Number of Panels: {number_of_panels}")
print(f"Panel Array: {round(panel_array_kw, 2)} kW")
print(f"Inverter: {inverter_size_kw} kW")
print(f"DC/AC Ratio: {round(dc_ac_ratio, 2)}")
print()

# Check if using rounded values would give different results
print("=" * 70)
print("CHECKING FOR ROUNDING ERRORS")
print("=" * 70)
effective_rounded = round(effective_daily_kwh, 2)
system_rounded = round(system_size_after, 2)

print(f"\nIf using rounded effective energy ({effective_rounded}):")
system_from_rounded = effective_rounded / peak_sun_hours * design_factor
panels_from_rounded = math.ceil(system_from_rounded * 1000 / panel_wattage)
print(f"  System Size = {system_from_rounded:.6f} kW")
print(f"  Panels = {panels_from_rounded}")

print(f"\nIf using rounded system size ({system_rounded}):")
panels_from_system_rounded = math.ceil(system_rounded * 1000 / panel_wattage)
print(f"  Panels = {panels_from_system_rounded}")

if panels_from_system_rounded != number_of_panels:
    print(f"\n⚠️  WARNING: Using rounded system size gives {panels_from_system_rounded} panels instead of {number_of_panels}!")
else:
    print(f"\n✓ Panel count is consistent")








