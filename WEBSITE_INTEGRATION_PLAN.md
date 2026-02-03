# Website Integration Plan: Corporate Website + E-commerce + PMS

## Current System Overview

**Energy Precision PMS** is currently a **management-only system** with:
- React frontend (Material-UI)
- FastAPI backend
- JWT authentication
- Protected routes (all require login)
- Features: Customer/Project/Quote management, Solar sizing, PDF generation

---

## Integration Goals

1. **Main Entry Point**: Public corporate website with e-commerce
2. **Admin Access**: PMS accessible via login from website
3. **Unified System**: Single codebase, shared backend, seamless integration
4. **Content Migration**: Copy existing website content/images into new system

---

## Architecture Options

### **Option 1: Monolithic Frontend (Recommended)**
**Single React App with Route-Based Separation**

```
┌─────────────────────────────────────────┐
│         React Application               │
├─────────────────────────────────────────┤
│  Public Routes (No Auth)                │
│  ├── / (Homepage)                        │
│  ├── /about                              │
│  ├── /products                           │
│  ├── /services                           │
│  ├── /contact                            │
│  └── /shop (E-commerce)                   │
│                                          │
│  Admin Routes (Auth Required)            │
│  ├── /admin/login                        │
│  ├── /admin/dashboard                    │
│  ├── /admin/projects                     │
│  ├── /admin/quotes                       │
│  └── ... (all current PMS routes)       │
└─────────────────────────────────────────┘
```

**Pros:**
- ✅ Single codebase, easier maintenance
- ✅ Shared components, styles, utilities
- ✅ Single deployment
- ✅ Shared authentication context
- ✅ Easy data sharing between public/admin

**Cons:**
- ⚠️ Larger bundle size (can be optimized with code splitting)
- ⚠️ More complex routing logic

**Implementation:**
- Move current routes under `/admin/*`
- Add public routes at root level
- Use route guards for admin section
- Code splitting for public vs admin bundles

---

### **Option 2: Micro-Frontend Architecture**
**Separate Apps, Shared Backend**

```
┌─────────────────┐    ┌─────────────────┐
│  Website App    │    │   PMS App       │
│  (Public)       │    │   (Admin)        │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │
         ┌──────────▼──────────┐
         │   FastAPI Backend   │
         └─────────────────────┘
```

**Pros:**
- ✅ Complete separation
- ✅ Independent deployments
- ✅ Smaller individual bundles

**Cons:**
- ❌ Code duplication
- ❌ More complex deployment
- ❌ Harder to share components
- ❌ Separate authentication flows

---

### **Option 3: Subdomain Approach**
**website.com (Public) + admin.website.com (PMS)**

**Pros:**
- ✅ Clear separation
- ✅ Can use different tech stacks

**Cons:**
- ❌ CORS complexity
- ❌ Cookie/session sharing issues
- ❌ More infrastructure

---

## Recommended Approach: **Option 1 (Monolithic Frontend)**

### Implementation Structure

```
frontend/
├── src/
│   ├── App.tsx                    # Main router
│   ├── components/
│   │   ├── public/                # Public website components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── ProductCard.tsx
│   │   ├── admin/                 # Admin/PMS components (existing)
│   │   │   ├── Layout.tsx
│   │   │   └── PrivateRoute.tsx
│   │   └── shared/                # Shared components
│   │       ├── Button.tsx
│   │       └── Loading.tsx
│   ├── pages/
│   │   ├── public/                # Public pages
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Shop.tsx           # E-commerce
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   └── Contact.tsx
│   │   └── admin/                 # Admin pages (existing)
│   │       ├── Dashboard.tsx
│   │       ├── Projects.tsx
│   │       └── ...
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Shared auth
│   │   └── CartContext.tsx        # E-commerce cart
│   └── services/
│       ├── api.ts                 # Shared API client
│       └── ecommerce.ts          # E-commerce API
```

### Routing Structure

```typescript
// App.tsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<PublicLayout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="products" element={<Products />} />
    <Route path="shop" element={<Shop />} />
    <Route path="shop/:id" element={<ProductDetail />} />
    <Route path="cart" element={<Cart />} />
    <Route path="checkout" element={<Checkout />} />
    <Route path="contact" element={<Contact />} />
  </Route>

  {/* Admin Login */}
  <Route path="/admin/login" element={<Login />} />

  {/* Admin Routes (Protected) */}
  <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
    <Route index element={<Navigate to="/admin/dashboard" />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="projects" element={<Projects />} />
    <Route path="quotes" element={<Quotes />} />
    {/* ... all existing admin routes */}
  </Route>
</Routes>
```

---

## Backend API Extensions

### New Public Endpoints (No Auth Required)

```python
# backend/app/routers/public.py

@router.get("/public/products")
async def get_public_products(
    category: str = None,
    featured: bool = False,
    db: Session = Depends(get_db)
):
    """Get products for public website/e-commerce"""
    # Return only active, public-facing products
    pass

@router.get("/public/products/{id}")
async def get_public_product(product_id: int, db: Session = Depends(get_db)):
    """Get single product details"""
    pass

@router.post("/public/contact")
async def submit_contact_form(contact_data: ContactForm, db: Session = Depends(get_db)):
    """Submit contact form"""
    pass

@router.post("/public/quote-request")
async def request_quote(quote_request: QuoteRequest, db: Session = Depends(get_db)):
    """Public quote request form"""
    pass
```

### E-commerce Endpoints (Customer Auth)

```python
# backend/app/routers/ecommerce.py

@router.post("/ecommerce/cart/add")
async def add_to_cart(
    item: CartItem,
    current_user: Customer = Depends(get_current_customer)
):
    """Add item to cart"""
    pass

@router.post("/ecommerce/checkout")
async def checkout(
    order: OrderCreate,
    current_user: Customer = Depends(get_current_customer)
):
    """Process order"""
    pass
```

---

## Database Schema Extensions

### New Tables Needed

```sql
-- E-commerce tables
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_number VARCHAR UNIQUE,
    status VARCHAR,  -- pending, processing, shipped, delivered
    total_amount DECIMAL,
    created_at TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price DECIMAL,
    total_price DECIMAL
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    created_at TIMESTAMP
);

-- Public website content
CREATE TABLE website_pages (
    id SERIAL PRIMARY KEY,
    slug VARCHAR UNIQUE,
    title VARCHAR,
    content TEXT,
    meta_description TEXT,
    is_published BOOLEAN
);

CREATE TABLE website_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR UNIQUE,
    value TEXT
);
```

---

## Authentication Strategy

### Two-Tier Authentication

1. **Customer Authentication** (Public/E-commerce)
   - Simple email/password
   - Optional: Social login (Google, Facebook)
   - Session-based or JWT
   - Access: Shop, cart, orders

2. **Admin Authentication** (PMS)
   - Existing JWT system
   - Role-based access (Admin, Sales, Viewer)
   - Access: All `/admin/*` routes

### Implementation

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  // Customer auth
  customer: Customer | null;
  isCustomerLoggedIn: boolean;
  loginAsCustomer: (email: string, password: string) => Promise<void>;
  
  // Admin auth (existing)
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  
  // Route detection
  isAdminRoute: (path: string) => boolean;
}
```

---

## E-commerce Features

### Shopping Cart
- Guest cart (localStorage)
- Customer cart (database)
- Cart persistence across sessions

### Product Catalog
- Display products from PMS database
- Filter by category, price, brand
- Product detail pages
- Image galleries

### Checkout Process
1. Cart review
2. Customer info (new or existing)
3. Shipping address
4. Payment (integrate payment gateway)
5. Order confirmation
6. Email notification

### Order Management
- Customer: View orders, track status
- Admin: Process orders in PMS

---

## Content Migration Strategy

### When You Share Your Website URL:

1. **Content Extraction Script**
   ```python
   # scripts/extract_website_content.py
   - Scrape HTML structure
   - Extract text content
   - Download images
   - Extract navigation structure
   - Save to database/JSON
   ```

2. **Image Handling**
   - Download all images
   - Optimize for web
   - Store in `/static/website/` directory
   - Update references in content

3. **Page Structure**
   - Convert HTML to React components
   - Preserve styling (CSS extraction)
   - Make responsive

---

## Deployment Considerations

### Environment Variables

```bash
# Public website settings
WEBSITE_NAME="Energy Precision"
WEBSITE_URL="https://energyprecision.com"
ENABLE_ECOMMERCE=true

# Payment gateway
STRIPE_PUBLIC_KEY=...
STRIPE_SECRET_KEY=...

# Email service
SMTP_HOST=...
SMTP_USER=...
```

### Docker Updates

```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    environment:
      - REACT_APP_API_URL=http://backend:8000
      - REACT_APP_ENABLE_ECOMMERCE=true
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Restructure frontend routing
- [ ] Move admin routes to `/admin/*`
- [ ] Create public layout components
- [ ] Set up public API endpoints

### Phase 2: Content Migration (Week 2-3)
- [ ] Extract website content (when URL provided)
- [ ] Create React components from content
- [ ] Migrate images and assets
- [ ] Build homepage, about, contact pages

### Phase 3: E-commerce (Week 3-4)
- [ ] Product catalog display
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] Order management
- [ ] Payment integration

### Phase 4: Integration (Week 4-5)
- [ ] Link public quote requests to PMS
- [ ] Customer account creation from e-commerce
- [ ] Admin order management in PMS
- [ ] Email notifications

### Phase 5: Polish & Testing (Week 5-6)
- [ ] Responsive design
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Testing and bug fixes

---

## Questions to Discuss

1. **E-commerce Scope**
   - What products will be sold? (Solar panels, inverters, batteries, accessories?)
   - Physical products or services too?
   - Do you need inventory management?

2. **Payment Gateway**
   - Which payment provider? (Stripe, PayPal, local payment methods?)
   - Do you need multiple payment options?

3. **Customer Accounts**
   - Should e-commerce customers be separate from PMS customers?
   - Or unified customer database?

4. **Order Fulfillment**
   - How will orders be processed?
   - Integration with shipping providers?
   - Manual order processing in PMS?

5. **Content Management**
   - Do you need a CMS for website content?
   - Or static pages are fine?

6. **SEO & Marketing**
   - Blog functionality needed?
   - Newsletter integration?
   - Social media integration?

---

## Next Steps

1. **Review this plan** and discuss architecture choice
2. **Answer the questions** above to refine scope
3. **Share your website URL** when ready for content extraction
4. **Start Phase 1** implementation

---

## Benefits of This Approach

✅ **Unified System**: One codebase, one deployment, easier maintenance  
✅ **Shared Data**: Products, customers, orders all in one database  
✅ **Seamless Experience**: Customers can request quotes, shop, and admins manage everything  
✅ **Cost Effective**: Single hosting, single domain  
✅ **Scalable**: Can add features incrementally  

---

**Ready to proceed?** Let's discuss your preferences and I'll start implementing! 🚀



