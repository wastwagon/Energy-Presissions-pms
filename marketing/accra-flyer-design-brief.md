# Energy Precisions — Accra Marketing Flyer Design Brief

**Client:** Energy Precisions  
**Location:** Haatso, Ecomog, Accra, Ghana  
**Reference:** Strom Solar Technology city-night flyer (Harare) — same layout energy, localized for Accra  
**Deliverables:** 1 master flyer + 2 EV-focused variants (residential, commercial)  
**Date:** June 2025

---

## 1. Deliverable formats

| Use | Size | Resolution | Notes |
|-----|------|------------|--------|
| **Social (primary)** | 1080 × 1350 px (4:5 portrait) | 72–144 ppi screen | Instagram / Facebook / WhatsApp Status |
| **Print (optional)** | A4 portrait (210 × 297 mm) | 300 DPI | 3 mm bleed, CMYK export |
| **Stories (optional)** | 1080 × 1920 px | 72 ppi | Crop hero from master; stack contact at bottom |

**Export:** PNG (social), PDF/X-1a (print), plus editable source (AI, PSD, or Figma).

---

## 2. Brand colors (from Energy Precisions design system)

| Role | Hex | RGB | Usage |
|------|-----|-----|--------|
| **Primary green** | `#00E676` | 0, 230, 118 | Logo accent, “Accra” script, icons, CTAs |
| **Green dark** | `#00C85F` | 0, 200, 95 | Icon circles, hover states, subtle gradients |
| **Blue-black** | `#0a0e17` | 10, 14, 23 | Sub-headline box, tagline bar, dark overlays |
| **Blue-black light** | `#0d1b2a` | 13, 27, 42 | Hero text shadow / gradient overlay on photo |
| **Navy** | `#1a4d7a` | 26, 77, 122 | Optional secondary accent on print |
| **White** | `#ffffff` | 255, 255, 255 | Headlines, footer card, icon glyphs |
| **Off-white** | `#f8fafc` | 248, 250, 252 | Footer background (alternative to pure white) |
| **Body gray** | `#475569` | 71, 85, 105 | Footer contact text |

**Print CMYK approximations (verify on press proof):**
- Green `#00E676` → C 65 M 0 Y 75 K 0  
- Blue-black `#0a0e17` → C 90 M 75 Y 50 K 80  

**Gradient overlay on hero photo:**  
`linear-gradient(180deg, rgba(10,14,23,0.55) 0%, rgba(10,14,23,0.25) 45%, rgba(10,14,23,0.70) 100%)`

---

## 3. Typography

| Element | Font | Weight | Size (1080×1350) | Color | Notes |
|---------|------|--------|------------------|-------|--------|
| Company name | Plus Jakarta Sans | 800 | 42–48 px | `#00E676` on dark / `#0a0e17` on white | Match website |
| Tagline bar | Plus Jakarta Sans | 600 | 11–12 px | `#ffffff` on `#0a0e17` bar | ALL CAPS, letter-spacing 0.12em |
| Headline (“Powering”) | Plus Jakarta Sans | 800 | 72–88 px | `#ffffff` | Tight tracking −0.02em |
| City name (“Accra”) | Pacifico or Dancing Script | 400 | 80–96 px | `#00E676` | Script contrast like reference “Harare” |
| Ghana flag | — | — | 32–40 px tall | — | Place adjacent to “Accra” |
| Sub-headline box | Plus Jakarta Sans | 500 | 18–22 px | `#ffffff` | Inside rounded black box |
| Icon labels | Plus Jakarta Sans | 600 | 11–13 px | `#ffffff` | Below each circle |
| Footer slogan | Plus Jakarta Sans | 600 | 16–18 px | `#0a0e17` | Left column, white card |
| Contact lines | Plus Jakarta Sans | 500 | 14–16 px | `#475569` | Right column |

**Web font stack (if designing in browser):**  
`-apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif`

**Fallback for print if Plus Jakarta Sans unavailable:** Montserrat (headlines) + Pacifico (Accra only).

---

## 4. Layout structure (match reference)

```
┌─────────────────────────────────────┐
│ [Logo]  ENERGY PRECISIONS           │  ← Top 12%
│         SOLAR · STORAGE · EV CHARGING│     (tagline bar)
├─────────────────────────────────────┤
│                                     │
│   Powering Accra 🇬🇭                │  ← Hero 28%
│   ┌─────────────────────────────┐   │
│   │ Sub-headline in black box   │   │
│   └─────────────────────────────┘   │
│                                     │
│   [photo: Accra night skyline]      │  ← Full-bleed background
│                                     │
│   (○) (○) (○) (○) (○)              │  ← 5 benefit icons, mid-lower
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [Logo]  Slogan...    │ Contact │ │  ← Footer card ~22%
│ │                       │  list   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Spacing:** 48 px side margins (at 1080 width). Footer card: 24 px top corner radius. Sub-headline box: 12 px radius, 16 px vertical / 20 px horizontal padding.

**Icon row:** 5 circles, 88–96 px diameter, fill `#00C85F`, white line icons 40 px. Equal horizontal spacing; labels centered below.

---

## 5. Photography & assets

| Asset | Direction |
|-------|-----------|
| **Hero background** | Night Accra — Airport City skyline, Independence Arch at dusk, or lit urban street with light trails. High contrast, blue city lights. |
| **Logo** | `frontend/public/website_images/Logo1-1-scaled-e1752479241874.png` or vector from client |
| **Ghana flag** | Small emoji or SVG beside “Accra” |
| **Icons** | Line icons (solar panel, shield/check, house+panel, EV plug, leaf) — white on green circles |

**Do not** use Strom Solar or Harare/Zimbabwe imagery or copy.

---

## 6. Master flyer — final copy

### Header
- **Company:** Energy Precisions  
- **Tagline bar:** `SOLAR · STORAGE · EV CHARGING`

### Hero
- **Headline:** Powering **Accra** 🇬🇭  
- **Sub-headline (black box):** The best solar systems and EV charging solutions now available in **Accra**

### Benefit icons (left → right)
1. **Clean Energy** — Solar power for a greener Ghana  
2. **Reliable Solutions** — Engineered systems, proven performance  
3. **Homes & Businesses** — Residential, commercial & industrial  
4. **EV Charging** — Home & workplace electric vehicle chargers  
5. **Sustainable Future** — Building Ghana’s energy transition  

*(Icon labels only on flyer; sub-lines optional for A4 print back.)*

### Footer
- **Left slogan:** Powering Accra with clean, reliable solar — and smart EV charging for tomorrow’s mobility.  
- **Contact:**
  - info@energyprecisions.com  
  - (+233) 533 611 611  
  - www.energyprecisions.com  
  - Haatso, Ecomog, Accra, Ghana  

---

## 7. Variant A — Residential EV charging

**Use:** Homeowners, estates, WhatsApp forwards, residential sales team.

### Changes from master
- **Tagline bar:** `HOME SOLAR · BATTERY BACKUP · EV CHARGING`
- **Headline:** Charge at home in **Accra** 🇬🇭  
- **Sub-headline:** Solar-powered homes with reliable backup and EV charging — installed by Accra’s trusted energy team  
- **Icons (4 only):** Clean Energy | 24/7 Backup | Home EV Charging | Expert Install  
- **Footer slogan:** Wake up to full batteries — at home and in your car.

### Extra bullet copy (A4 reverse or social carousel slide 2)
- AC home chargers (7 kW–22 kW) sized to your panel and meter  
- Works with solar and hybrid battery systems  
- Site survey, supply, installation & commissioning from one team  
- Serving Greater Accra and nationwide by appointment  

---

## 8. Variant B — Commercial EV charging

**Use:** Offices, retail, hotels, fleet operators, developers.

### Changes from master
- **Tagline bar:** `COMMERCIAL SOLAR · STORAGE · EV INFRASTRUCTURE`
- **Headline:** Powering business mobility in **Accra** 🇬🇭  
- **Sub-headline:** Commercial solar, battery storage & EV charging for offices, retail, hotels & fleets  
- **Icons (5):** Commercial Solar | Battery Storage | Workplace EV Charging | Fleet Ready | Ongoing Support  
- **Footer slogan:** Cut operating costs, meet sustainability goals, and offer EV charging your customers expect.

### Extra bullet copy (A4 reverse or carousel slide 2)
- Workplace & destination chargers for staff, guests & customers  
- Load management with existing solar and hybrid systems  
- Turnkey design, installation, monitoring & maintenance  
- Scalable solutions for single sites and multi-location operators  

---

## 9. Contact block (all versions)

Use green circular icons (20 px) left of each line, matching reference flyer.

| Field | Value |
|-------|--------|
| Email | info@energyprecisions.com |
| Phone | (+233) 533 611 611 |
| WhatsApp | wa.me/233533611611 *(optional QR on print)* |
| Web | www.energyprecisions.com |
| Address | Haatso, Ecomog, Accra, Ghana |

**Footnote (small, gray):** Site surveys and installations across Greater Accra and Ghana by appointment.

---

## 10. Designer checklist

- [ ] Logo clear on dark hero and white footer  
- [ ] Green `#00E676` consistent (not lime/yellow-green drift)  
- [ ] “Accra” readable at phone thumbnail size  
- [ ] Contact text legible at 14 px minimum  
- [ ] No competitor branding or wrong country flag  
- [ ] Safe zone: keep text/logos 48 px from edges (social crop)  
- [ ] Export master + residential + commercial variants  
- [ ] Optional: QR code → energyprecisions.com/contact or WhatsApp  

---

## 11. File naming

```
EP-Flyer-Accra-Master-1080x1350.png
EP-Flyer-Accra-Master-A4-Print.pdf
EP-Flyer-EV-Residential-1080x1350.png
EP-Flyer-EV-Commercial-1080x1350.png
EP-Flyer-Source.fig  (or .ai / .psd)
```

---

*Canonical contact data: `frontend/src/data/companyContact.ts`*
