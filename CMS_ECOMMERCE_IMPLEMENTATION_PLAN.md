# CMS & E-commerce Implementation Plan

## Executive Summary

This document outlines a phased plan to add a **full CMS** for the corporate website and enhance **e-commerce** with order management—all within the existing **single admin backend** at `/pms/*`. The approach is incremental to avoid breaking current functionality.

---

## Current State (What You Have)

### ✅ Already Implemented

| Area | Status | Notes |
|------|--------|-------|
| **PMS Admin** | ✅ Complete | Dashboard, Customers, Projects, Quotes, Products, Settings, Reports |
| **Corporate Website** | ✅ Live | Home, About, Services, Shop, Cart, Checkout, Contact, FAQs |
| **E-commerce Flow** | ✅ Complete | Products → Cart → Checkout → Order → Paystack redirect |
| **Paystack Backend** | ✅ Integrated | Initialize, verify, webhook handlers |
| **Content** | ⚠️ Static | `extracted_content.json` + hardcoded Home sections |

### ⚠️ Gaps

| Gap | Impact |
|-----|--------|
| **No CMS** | Content changes require code edits or JSON file updates |
| **No Order Management** | Admin cannot view/update orders from PMS |
| **Web Admin** | `/web/admin` exists but no separate CMS UI (we'll extend PMS instead) |
| **Paystack Keys** | Need `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `FRONTEND_URL` in Render env |

---

## Architecture: One Admin Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                    energyprecisions.com                          │
├─────────────────────────────────────────────────────────────────┤
│  PUBLIC WEBSITE                    │  PMS ADMIN (/pms/*)          │
│  • Home (CMS-driven)               │  • Dashboard                 │
│  • About, Services (CMS-driven)    │  • Customers                 │
│  • Shop, Cart, Checkout            │  • Projects                  │
│  • Contact, FAQs                   │  • Quotes                    │
│                                    │  • Products                  │
│                                    │  • Orders (NEW)               │
│                                    │  • Website Content (NEW)     │
│                                    │  • Settings                  │
│                                    │  • Reports                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND API (energy-pms-backend-1b7h.onrender.com)              │
│  • /api/auth/*                                                    │
│  • /api/ecommerce/* (products, cart, orders)                     │
│  • /api/payments/paystack/*                                      │
│  • /api/cms/* (NEW - public content API)                         │
│  • /api/admin/cms/* (NEW - admin content CRUD, protected)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phased Implementation

### Phase 1: Order Management in Admin (Low Risk)

**Goal:** Admin can view and manage e-commerce orders from PMS.

| Task | Backend | Frontend |
|------|---------|----------|
| Orders list API | `GET /api/ecommerce/orders` (admin-only) | — |
| Order detail API | `GET /api/ecommerce/orders/:id` (admin) | — |
| Update order status | `PATCH /api/ecommerce/orders/:id` | — |
| Orders page | — | `/pms/orders` with table, filters, status update |

**Files to add/modify:**
- `backend/app/routers/ecommerce.py` – add admin order endpoints
- `frontend/src/pages/Orders.tsx` – new page
- `frontend/src/App.tsx` – add route
- `frontend/src/components/Layout.tsx` – add "Orders" to sidebar

**Risk:** Low. No changes to existing flows.

---

### Phase 2: CMS Backend & Content API

**Goal:** Store website content in DB; expose public API for frontend.

| Task | Backend | Frontend |
|------|---------|----------|
| CMS models | `PageContent`, `Section` (or key-value) | — |
| Migration | Alembic migration for new tables | — |
| Public content API | `GET /api/cms/content?page=home` | — |
| Admin content API | `GET/PUT /api/admin/cms/:page` (protected) | — |

**Content structure (flexible):**
```json
{
  "page": "home",
  "sections": {
    "hero": {
      "badge": "Ghana's Leading Solar Energy Solutions",
      "headline": "Powering Ghana's Future with Clean Energy",
      "subheadline": "Complete solar solutions from premium equipment...",
      "cta_text": "Request a Quote",
      "cta_link": "/contact",
      "hero_image": "/website_images/image17.png"
    },
    "trust_stats": [
      { "value": "500+", "label": "Installations" },
      { "value": "10+", "label": "Years Experience" }
    ]
  }
}
```

**Files to add:**
- `backend/app/models_cms.py` – CMS models
- `backend/app/routers/cms.py` – public + admin CMS routes
- `backend/alembic/versions/xxx_add_cms_tables.py`

**Risk:** Low. New tables and routes only.

---

### Phase 3: CMS Admin UI

**Goal:** Admin can edit website content from PMS.

| Task | Backend | Frontend |
|------|---------|----------|
| Website Content page | — | `/pms/website` or `/pms/content` |
| Page selector | — | Home, About, Services, etc. |
| Section editor | — | Form per section (hero, stats, testimonials) |
| Image upload | Use existing `POST /api/settings/upload-logo` pattern | — |

**Files to add:**
- `frontend/src/pages/WebsiteContent.tsx` – CMS editor
- Sidebar: "Website" or "Content"

**Risk:** Low. New page only.

---

### Phase 4: Frontend Uses CMS API

**Goal:** Replace static JSON and hardcoded content with CMS API.

| Task | Backend | Frontend |
|------|---------|----------|
| Fetch content on load | — | `useEffect` → `GET /api/cms/content?page=home` |
| Fallback | — | Keep `extracted_content.json` as fallback if API fails |
| Home.tsx | — | Use CMS data for hero, stats, testimonials |
| About.tsx, Services.tsx | — | Use CMS data |

**Risk:** Medium. Requires careful fallback so site works if CMS empty.

---

### Phase 5: Paystack Production & Polish

**Goal:** Production-ready Paystack; premium UX polish.

| Task | Backend | Frontend |
|------|---------|----------|
| Paystack env vars | `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` | — |
| FRONTEND_URL | Set in Render (e.g. `https://energyprecisions.com`) | — |
| Webhook URL | Configure in Paystack dashboard | — |
| Checkout UX | — | Loading states, error handling, success animation |
| Order confirmation email | Already exists | Verify templates |

**Risk:** Low. Configuration and polish.

---

## File Structure (New/Modified)

```
backend/
├── app/
│   ├── models_cms.py          # NEW
│   ├── routers/
│   │   ├── cms.py             # NEW
│   │   └── ecommerce.py      # MODIFY (add admin order endpoints)
│   └── main.py               # MODIFY (include cms router)
├── alembic/versions/
│   └── xxx_add_cms_tables.py # NEW

frontend/
├── src/
│   ├── pages/
│   │   ├── Orders.tsx        # NEW
│   │   ├── WebsiteContent.tsx # NEW
│   │   └── public/
│   │       ├── Home.tsx       # MODIFY (use CMS API)
│   │       ├── About.tsx      # MODIFY
│   │       └── Services.tsx   # MODIFY
│   ├── components/
│   │   └── Layout.tsx        # MODIFY (add Orders, Website to nav)
│   └── App.tsx               # MODIFY (add routes)
```

---

## Safeguards (Don't Break Existing)

1. **No removal of existing routes** – Only add new ones.
2. **CMS fallback** – If CMS API fails or returns empty, use `extracted_content.json`.
3. **Feature flags** – Optional env var `USE_CMS=true` to switch between static and CMS.
4. **Incremental rollout** – Phase 1 first, validate, then Phase 2, etc.
5. **Admin-only CMS** – CMS edit endpoints require auth; public read is unauthenticated.

---

## Paystack Setup (When You Have Keys)

1. **Render → energy-pms-backend → Environment:**
   - `PAYSTACK_SECRET_KEY` = sk_live_xxx
   - `PAYSTACK_PUBLIC_KEY` = pk_live_xxx (for frontend if needed)
   - `FRONTEND_URL` = https://energyprecisions.com

2. **Paystack Dashboard:**
   - Webhook URL: `https://energy-pms-backend-1b7h.onrender.com/api/payments/paystack/webhook`
   - Events: `charge.success`, `charge.failed` (if needed)

3. **Frontend:** Payment flow already uses backend; no frontend key needed for redirect flow.

---

## Recommended Order of Work

| Order | Phase | Effort | Value |
|-------|-------|--------|-------|
| 1 | Phase 1: Order Management | 1–2 days | High – manage orders immediately |
| 2 | Phase 5: Paystack Production | 0.5 day | High – enable real payments |
| 3 | Phase 2: CMS Backend | 1–2 days | Foundation for CMS |
| 4 | Phase 3: CMS Admin UI | 1–2 days | Edit content from admin |
| 5 | Phase 4: Frontend CMS | 1 day | Live CMS-driven content |

---

## Next Steps

1. **Confirm** this plan aligns with your priorities.
2. **Phase 1** – Implement Orders in admin (I can provide concrete code).
3. **Paystack** – Add env vars when you have keys.
4. **Phase 2–4** – CMS backend → admin UI → frontend integration.

If you want to proceed, say which phase to start with (recommend **Phase 1: Order Management**).
