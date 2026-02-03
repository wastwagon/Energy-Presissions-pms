# Routing Structure Guide

## Overview

The application now has **two separate interfaces** accessible from a single URL:

1. **Public Website** - Customer-facing website with e-commerce
2. **PMS (Project Management System)** - Admin interface for project management, quotes, and invoices

---

## Route Structure

### Public Website Routes
- **Base URL**: `http://localhost:5000/`
- **Routes**:
  - `/` - Homepage
  - `/about` - About page
  - `/services` - Services page
  - `/shop` - Product shop
  - `/products/:id` - Product detail
  - `/cart` - Shopping cart
  - `/checkout` - Checkout page
  - `/contact` - Contact page
  - `/faqs` - FAQs page

### PMS (Project Management System) Routes
- **Login**: `http://localhost:5000/pms/admin`
- **Base URL**: `http://localhost:5000/pms/`
- **Routes**:
  - `/pms/admin` - Login page
  - `/pms/dashboard` - Dashboard
  - `/pms/customers` - Customer management
  - `/pms/projects` - Project management
  - `/pms/projects/:id` - Project detail
  - `/pms/quotes` - Quote management
  - `/pms/quotes/:id` - Quote detail
  - `/pms/products` - Product catalog (admin)
  - `/pms/settings` - System settings
  - `/pms/reports` - Reports & analytics

### Website Admin Routes
- **Login**: `http://localhost:5000/web/admin`
- **Purpose**: For future website content management (currently redirects to public website)

### Interface Selector
- **URL**: `http://localhost:5000/select`
- **Purpose**: Landing page to choose between Public Website and PMS

---

## Access Points

### For Customers/Public
```
http://localhost:5000/
```
- Direct access to public website
- No authentication required
- Browse products, shop, contact

### For Admin/PMS Users
```
http://localhost:5000/pms/admin
```
- Login page for Project Management System
- Requires authentication
- Access to all PMS features

### For Website Administrators
```
http://localhost:5000/web/admin
```
- Login page for website content management
- Currently redirects to public website after login
- Can be extended for CMS features

---

## Navigation Flow

### Public Website Flow
```
/ → Homepage
  → Shop → Product Detail → Cart → Checkout
  → About, Services, Contact, FAQs
```

### PMS Flow
```
/pms/admin (Login)
  → /pms/dashboard
    → Customers → Projects → Quotes
    → Products, Settings, Reports
```

---

## Authentication

### Shared Authentication
- Both interfaces use the same authentication system
- Same user credentials work for both
- JWT tokens stored in localStorage
- Session persists across both interfaces

### Redirects
- **Unauthenticated PMS access** → Redirects to `/pms/admin`
- **Unauthenticated Web admin access** → Redirects to `/web/admin`
- **Legacy `/admin/*` routes** → Automatically redirect to `/pms/*`

---

## Backward Compatibility

### Legacy Route Redirects
- `/admin/login` → `/pms/admin`
- `/admin/*` → `/pms/*`

These redirects ensure old bookmarks and links continue to work.

---

## File Structure

### Login Pages
- `frontend/src/pages/PMSLogin.tsx` - PMS login page
- `frontend/src/pages/WebAdminLogin.tsx` - Website admin login
- `frontend/src/pages/InterfaceSelector.tsx` - Interface selection page

### Layouts
- `frontend/src/components/Layout.tsx` - PMS admin layout
- `frontend/src/components/public/PublicLayout.tsx` - Public website layout

### Routes
- `frontend/src/App.tsx` - Main routing configuration

---

## Recommended URLs

### Production URLs
- **Public Website**: `https://yourdomain.com/`
- **PMS Login**: `https://yourdomain.com/pms/admin`
- **Web Admin**: `https://yourdomain.com/web/admin`

### Development URLs
- **Public Website**: `http://localhost:5000/`
- **PMS Login**: `http://localhost:5000/pms/admin`
- **Web Admin**: `http://localhost:5000/web/admin`

---

## Quick Reference

| Purpose | URL |
|---------|-----|
| Public Website | `/` |
| PMS Login | `/pms/admin` |
| PMS Dashboard | `/pms/dashboard` |
| Web Admin Login | `/web/admin` |
| Interface Selector | `/select` |

---

## Implementation Notes

1. **Single Frontend Application**: Both interfaces are in the same React app
2. **Shared Components**: Authentication, API services, and utilities are shared
3. **Separate Layouts**: Different layouts for public vs admin interfaces
4. **Route Protection**: PMS routes are protected with authentication
5. **Public Routes**: Website routes are public (no authentication required)

---

**Last Updated**: January 2025
