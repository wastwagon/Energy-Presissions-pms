# Formulas and Features Verification

This document summarizes verification of sizing formulas, pricing logic, and feature behavior in Energy Precision PMS.

---

## 1. Data loaded

Sample data has been populated so the app is usable with real records:

- **Customers:** Mama Wana, Mr. Sammy, Albert Amonoo, Francis
- **Projects:** 4 projects (borehole, 76 kW commercial, residential Afieya) with appliances and daily energy

To load only data (no code changes), run from project root:

```bash
docker compose exec backend python -m app.scripts.create_mama_wana_project
docker compose exec backend python -m app.scripts.create_mr_sammy_project
docker compose exec backend python -m app.scripts.create_albert_amonoo_project
docker compose exec backend python -m app.scripts.create_francis_project
```

---

## 2. Sizing formulas (verified)

All factors come from **Settings** (Sizing Factors). Defaults are Ghana-oriented.

| Step | Formula | Settings / source |
|------|---------|-------------------|
| System losses | `effective_daily_kwh = total_daily_kwh / system_efficiency` | `system_efficiency` (default 0.72) |
| System size | `system_size_kw = effective_daily_kwh / peak_sun_hours` | `peak_sun_hours` from location or `default_peak_sun_hours` |
| Design margin | `system_size_kw *= design_factor` | `design_factor` (default 1.20) |
| Panel count | `number_of_panels = ceil(system_size_kw * 1000 / panel_wattage)` | `panel_brand` → wattage (Jinko 580W, Longi 570W, JA 560W) |
| Roof area | `roof_area_m2 = number_of_panels * panel_area_m2 * spacing_factor` | `panel_area_m2`, `spacing_factor` |
| Inverter (min) | `min_inverter_kw = system_size_kw / max_dc_ac_ratio` | `max_dc_ac_ratio` (default 1.3) |
| Inverter selection | Parallel/single from product catalog; single preferred &lt; 30 kW, parallel preferred ≥ 30 kW | `standard_inverter_sizes`, `max_parallel_inverters`, `prefer_parallel_above_kw` |
| Battery (if hybrid/off‑grid or backup_hours &gt; 0) | Energy: `(essential_load_kw_dc * backup_hours) / battery_dod`; Power: `essential_load_kw_dc / (c_rate * battery_dod)`; use **max** of the two, rounded up to 5 kWh steps | `battery_dod`, `battery_c_rate`, `battery_discharge_efficiency`, `min_battery_size_kwh` |

**Grid-tied vs hybrid:** Battery is only added when system type is hybrid/off_grid or when `backup_hours > 0` for grid_tied. So grid-tied with 0 backup = no battery.

**Implementation:** `backend/app/services/sizing.py` — `calculate_sizing()`, `get_setting_value()`, `get_peak_sun_hours()`, `calculate_parallel_inverters()`.

---

## 3. Pricing and quote totals (verified)

- **Panel:** per_panel or per_watt from Product; `total = unit_price * number_of_panels`.
- **Inverter:** per_kw or fixed; supports parallel (quantity × unit_price).
- **Battery:** per_kwh or fixed; quantity from sizing capacity vs product capacity.
- **Mounting:** per_kw, per_panel, or fixed from Product.
- **BOS:** `equipment_total * (bos_percentage / 100)`. Equipment = panels + inverter + battery + mounting. From Product if type BOS and percentage, else from setting `bos_percentage`.
- **Transport:** Fixed from Product or `transport_cost_fixed` setting; added **before** Installation in line order.
- **Installation:** `(equipment_total + BOS) * (installation_percent / 100)`. From Product if type INSTALLATION and percentage, else `installation_cost_percent`.

**Quote subtotals:**

- **Equipment subtotal** = panels + inverter + battery + mounting + **BOS** (consistent with recalculator and verification).
- **Services subtotal** = transport + installation.
- **Grand total** = equipment_subtotal + services_subtotal + tax − discount.

**Implementation:** `backend/app/services/pricing.py` — `generate_quote_items_from_sizing()`; `backend/app/routers/quotes.py` — quote creation totals; `backend/app/services/quote_recalculator.py` — BOS/Installation and totals on change.

**Fix applied:** On quote creation, BOS is now counted in **equipment_subtotal** (not services), so new quotes match the recalculator and system verification. Deleting **mounting** (or BOS when no product_id) now triggers recalc so BOS/Installation and grand total stay correct.

---

## 4. Recalculation on delete (verified)

- When an **equipment** item is deleted (panel, inverter, battery, mounting, or BOS), `recalculate_dependent_items()` is called **after** the item is removed.
- Recalculator: recomputes BOS from remaining equipment total; recomputes Installation from (equipment + BOS); then equipment_subtotal, services_subtotal, tax, discount, grand_total.
- When a **service** item is deleted (e.g. transport, installation), only grand total is updated from the new subtotals.

**Implementation:** `backend/app/routers/quotes.py` — delete quote item handler (delete + flush, then recalc); `backend/app/services/quote_recalculator.py`.

---

## 5. Display order of quote items

Order enforced in PDF and frontend: Panel → Inverter → Battery → BOS → Transport & Logistics → Installation (Installation last).

**Implementation:** `backend/app/services/pdf_generator.py` (sorted items); `frontend/src/pages/QuoteDetail.tsx` (display order).

---

## 6. PDF and Proforma Invoice

- Same quote can be generated as **Quotation** or **Proforma Invoice** via `document_type` (e.g. `GET /quotes/{id}/pdf?document_type=proforma_invoice`).
- Proforma shows the “Payment – Bank Details” block; Quotation does not.
- Bank details come from Settings: `company_bank_name`, `company_account_name`, `company_account_number`, `company_bank_branch`, `company_swift_code`.

**Implementation:** `backend/app/services/pdf_generator.py`; frontend “Proforma Invoice” button on quote detail.

---

## 7. System verification script

Run full checks (quote totals, panel brand consistency, API endpoints, PDF generators, recalc trigger, data consistency):

```bash
docker compose exec backend python -m app.scripts.system_verification
```

All listed checks are passing. Optional: SENDGRID_API_KEY warning appears if email is not configured; it does not affect formulas or PDFs.

---

## 8. Summary

| Area | Status | Notes |
|------|--------|--------|
| Sizing formulas | Verified | Uses Settings; battery only when hybrid/off-grid or backup_hours &gt; 0 |
| Pricing (items & %) | Verified | BOS % of equipment; Installation % of equipment+BOS; Transport before Installation |
| Quote totals | Verified | BOS in equipment subtotal; grand = equipment + services + tax − discount |
| Recalc on delete | Verified | Equipment/BOS delete triggers full recalc; mounting delete included |
| Item order | Verified | Panel → Inverter → Battery → BOS → Transport → Installation |
| PDF / Proforma | Verified | document_type and bank block; generators load correctly |
| System verification | Passed | Quote calculations, consistency, APIs, PDFs, recalc, data relations |

You can rely on the above formulas and behavior for quotes and reports. For regression checks after changes, run `system_verification` and re-check one quote end-to-end (sizing → create quote → change/delete item → PDF/Proforma).
