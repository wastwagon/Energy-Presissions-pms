# Energy Precisions — corporate website growth (phased)

Safe rollout aligned with the 2025–2030 business development plan. **Phases 1–2** are implemented in the React app; later phases are architectural or operational.

## Phase 1 — Trust, financing clarity, navigation (shipped in repo)

- **Trust strip** — `TrustStrip` + `data/trustContent.ts` on Home & About. Edit copy there; have legal/compliance approve claims before major campaigns.
- **Financing** — PAYG / staged payment section on `/financing` (honest, non-rate-specific).
- **Resources menu** — Blog, Solar estimate, Referral program in header + footer + `sitemap.xml`.

## Phase 2 — Public conversion tools (shipped, client-side)

- **`/solar-estimate`** — Ballpark kWp / panel count from monthly kWh or bill + tariff. **Indicative only**; runs in the browser (no new backend attack surface). Tune defaults in the page if needed.
- **`/referral`** — Solar Champions landing; CTAs to contact with `topic=referral`. Rewards remain **off-page** until policy is fixed.

## Phase 3 — Measurement & content (ops + config)

- Set **`REACT_APP_GA4_MEASUREMENT_ID`** on production builds; define conversions (quote submit, checkout, estimate CTA).
- **Publish 1–2 CMS blog posts per week** via Website admin (`/web/app` → Blog & FAQs).
- **Google Business**: review campaign toward 50+ reviews (process, not code).

## Phase 4 — Organic / technical SEO (platform decision)

The marketing site is a **CRA SPA**. Crawlers get a solid `index.html` shell + JSON-LD; inner routes rely on **client-side** `Seo`/`Helmet`.

**Options (choose one when ready):**

| Approach | Pros | Cons |
|----------|------|------|
| **Prerender service** (e.g. prerender.io, Cloudflare) | Faster than full rewrite | Ongoing cost / config |
| **Migrate public site to Next.js/Remix** | Best long-term SEO + SSR | Largest engineering investment |
| **Post-build static render** (e.g. react-snap) | Low runtime cost | Brittle with dynamic CMS routes |

Recommendation: **do Phases 1–3 first**, then pick Phase 4 based on organic traffic goals.

## Phase 5 — Off-site & trust assets (non-code)

- Submit to **GhanaYello, Ensun, Socialander**, etc.
- **Energy Commission** (or other) badges: add real certificate images under `/website_images/` and optional extra row in `trustContent.ts` when approved.
- **Social**: post regularly; site links already expose profiles.

---

*Last updated: April 2026 — matches codebase features for trust, estimate, referral, and phased SSR note.*
