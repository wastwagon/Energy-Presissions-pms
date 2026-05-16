"""
Customer-facing explanations for hybrid package marketing (brochure + website).

Written to answer common questions without a salesperson present.
"""
from __future__ import annotations

READING_GUIDE: dict[str, object] = {
    "title": "How to read these packages",
    "points": [
        "KVA on the badge = your load tier (how much you plan to run at once), not the inverter brand size.",
        "Watts shown (~0.85 × kVA) = continuous planning ceiling — stagger AC, iron, and heaters; do not run every heavy load together.",
        "Inverter line = equipment we stock; it may be larger than the kVA badge for starting surges and reliability.",
        "Panel count = sized to the kVA load tier, not to fill a larger inverter — survey may add or reduce modules.",
        "Hybrid = solar + lithium + grid (and generator where fitted); backup hours depend on battery size and your night load.",
        "Turnkey price is from our Accra office; final BOM and price are confirmed after a free site survey.",
    ],
}

FOOTER_BULLETS: list[str] = [
    "Hybrid systems combine solar, lithium storage, and ECG/grid (generator-ready where fitted). Full off-grid only when engineered on survey.",
    "Connected load ceilings use ~0.85 power factor. Stagger split AC, iron, kettle, and water heater — never assume all peaks run together.",
    "A larger inverter than the kVA badge is normal: it covers motor starts and growth while you still plan within the stated watt ceiling.",
    "Solar panel counts follow the package load tier (kVA), not the inverter nameplate — avoids paying for PV you cannot use on that load.",
    "Storage uses stocked 16 kWh LiFePO₄ modules; night backup hours depend on your load — survey confirms module count.",
    "Commercial and Power tiers need a load schedule on survey; brochure lists are typical examples, not unlimited simultaneous use.",
    "Larger projects receive engineered BOM, load analysis, and itemised quotation from Energy Precisions.",
    "Typical payment: 30% deposit · 40% on delivery · 30% on commissioning (negotiable for commercial clients).",
]

LOAD_CEILING_HELP = (
    "Continuous planning figure (~0.85 power factor). Stagger heavy loads — do not exceed this together."
)

TIER_CUSTOMER_NOTES: dict[str, str] = {
    "ep-6.5kva": (
        "6.5 KVA tier with a matching 6.5 kW inverter. Fifteen panels are sized for this load — "
        "no air conditioning in this tier; upgrade if you need AC."
    ),
    "ep-8kva": (
        "Badge is 8 KVA (~6,800 W planned use). We install one 10 kW inverter (stocked) for AC starts — "
        "still plan within ~6,800 W continuous. Nineteen panels match the 8 KVA tier, not 10 kW maximum."
    ),
    "ep-10kva": (
        "10 KVA tier with one 10 kW inverter — aligned. Run up to ~8,500 W continuous; "
        "do not run two split AC units on full cool at the same time."
    ),
    "ep-12kva": (
        "12 KVA tier (~10,200 W planned use). Two 6.5 kW inverters work together (~13 kW available). "
        "Twenty-eight panels are sized for 12 KVA load, not 13 kW inverter maximum."
    ),
    "ep-15kva": (
        "15 KVA tier (~12,800 W planned use). Two 10 kW inverters (synchronized, stocked) handle peaks; "
        "thirty-five panels are sized for 15 KVA — less solar than the 20 KVA tier on the same inverter pair."
    ),
    "ep-20kva": (
        "20 KVA tier (~17,000 W planned use) with two 10 kW inverters. "
        "Forty-six panels match this load; guest-house and hotel loads need a written load schedule on survey."
    ),
}


# Short chip on brochure/website when stocked inverter exceeds load-tier badge.
TIER_INVERTER_HEADROOM: dict[str, str] = {
    "ep-8kva": "+25% inverter headroom · AC motor starts",
    "ep-12kva": "+8% inverter headroom · dual 6.5 kW sync",
    "ep-15kva": "+33% inverter headroom · dual 10 kW sync",
}


def tier_customer_note(pkg_id: str) -> str:
    return TIER_CUSTOMER_NOTES.get(pkg_id, "")


def tier_inverter_headroom(pkg_id: str) -> str:
    return TIER_INVERTER_HEADROOM.get(pkg_id, "")


# One-line notes for brochure PDF cards (full text stays on website).
TIER_BROCHURE_NOTES: dict[str, str] = {
    "ep-6.5kva": "6.5 KVA tier · matching 6.5 kW inverter · 15 panels · no AC in this tier.",
    "ep-8kva": "8 KVA (~6,800 W). 10 kW inverter for AC starts · 19 panels sized for 8 KVA load.",
    "ep-10kva": "10 KVA / 10 kW aligned · ~8,500 W continuous · stagger two AC units.",
    "ep-12kva": "12 KVA (~10,200 W) · dual 6.5 kW (~13 kW) · 28 panels for 12 KVA load.",
    "ep-15kva": "15 KVA (~12,800 W) · dual 10 kW sync · 35 panels (less than 20 KVA tier).",
    "ep-20kva": "20 KVA (~17,000 W) · dual 10 kW · 46 panels · load schedule on survey.",
}


def tier_brochure_note(pkg_id: str) -> str:
    return TIER_BROCHURE_NOTES.get(pkg_id, tier_customer_note(pkg_id))
