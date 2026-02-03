#!/usr/bin/env python3
"""
Test script to verify sizing calculations
"""
import math

# Test case from the image
daily_kwh = 33.27
system_efficiency = 0.72
peak_sun_hours = 5.0
design_factor = 1.20
panel_wattage = 580

print("=" * 60)
print("SIZING CALCULATION VERIFICATION")
print("=" * 60)
print(f"\nInput Parameters:")
print(f"  Daily Energy Requirement: {daily_kwh} kWh")
print(f"  System Efficiency: {system_efficiency} ({system_efficiency*100}%)")
print(f"  Peak Sun Hours: {peak_sun_hours} hrs")
print(f"  Design Factor: {design_factor} ({int((design_factor-1)*100)}% safety margin)")
print(f"  Panel Wattage: {panel_wattage}W")
print()

# Step 1: Account for system losses
effective_daily_kwh = daily_kwh / system_efficiency
print(f"Step 1: Account for System Losses")
print(f"  Effective Daily Energy = {daily_kwh} / {system_efficiency}")
print(f"  = {effective_daily_kwh:.6f} kWh")
print(f"  (Displayed as: {round(effective_daily_kwh, 2)} kWh)")
print()

# Step 2: Calculate system size (before design factor)
system_size_before = effective_daily_kwh / peak_sun_hours
print(f"Step 2: Calculate Base System Size")
print(f"  System Size = {effective_daily_kwh:.6f} / {peak_sun_hours}")
print(f"  = {system_size_before:.6f} kW")
print(f"  (Displayed as: {round(system_size_before, 2)} kW)")
print()

# Step 3: Apply design factor
system_size_after = system_size_before * design_factor
print(f"Step 3: Apply Design Factor (Safety Margin)")
print(f"  System Size = {system_size_before:.6f} × {design_factor}")
print(f"  = {system_size_after:.6f} kW")
print(f"  (Displayed as: {round(system_size_after, 2)} kW)")
print()

# Step 4: Calculate number of panels
panels_exact = system_size_after * 1000 / panel_wattage
number_of_panels = math.ceil(panels_exact)
print(f"Step 4: Calculate Number of Panels")
print(f"  Panels = ceil({system_size_after:.6f} × 1000 / {panel_wattage})")
print(f"  = ceil({panels_exact:.6f})")
print(f"  = {number_of_panels} panels")
print()

# Panel array capacity
panel_array_kw = number_of_panels * panel_wattage / 1000
print(f"Panel Array Capacity:")
print(f"  {number_of_panels} × {panel_wattage}W = {panel_array_kw:.2f} kW")
print()

# Verify calculations
print("=" * 60)
print("VERIFICATION")
print("=" * 60)

# Check if using rounded value would give different result
system_size_rounded = round(system_size_after, 2)
panels_from_rounded = math.ceil(system_size_rounded * 1000 / panel_wattage)

print(f"\nUsing unrounded system_size_kw ({system_size_after:.6f}):")
print(f"  Panels = {number_of_panels}")

print(f"\nUsing rounded system_size_kw ({system_size_rounded}):")
print(f"  Panels = {panels_from_rounded}")

if number_of_panels != panels_from_rounded:
    print(f"\n⚠️  WARNING: Rounding causes different panel count!")
    print(f"   This could cause confusion in manual calculations.")
else:
    print(f"\n✓ Panel count is consistent regardless of rounding")

# Check intermediate rounding
print(f"\nIntermediate Values:")
print(f"  Effective Daily Energy: {effective_daily_kwh:.6f} kWh")
print(f"  System Size (before design): {system_size_before:.6f} kW")
print(f"  System Size (after design): {system_size_after:.6f} kW")
print(f"  Exact Panels Needed: {panels_exact:.6f}")
print(f"  Rounded Up: {number_of_panels}")








