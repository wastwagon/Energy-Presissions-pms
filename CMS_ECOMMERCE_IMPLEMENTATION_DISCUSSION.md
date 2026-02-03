# Full CMS + E-commerce Implementation Discussion
## Energy Precision PMS with Corporate Website & E-commerce

---

## 🎯 System Overview

**Goal**: Transform Energy Precision PMS into a **full CMS + E-commerce platform** with:
- Public corporate website (CMS)
- E-commerce store (WooCommerce flow)
- Admin PMS (existing management system)
- Paystack payment gateway (Ghana)
- SendGrid email service
- MonsterInsights Premium analytics
- All in One SEO optimization

---

## 📊 MonsterInsights Premium Features

### Core Analytics Features
1. **Enhanced E-commerce Tracking**
   - Track product views, add-to-cart events, checkout steps
   - Monitor conversion rates by product category
   - Revenue tracking with transaction details
   - Shopping behavior analysis (cart abandonment, checkout funnel)

2. **Advanced Reporting**
   - Custom dashboards for e-commerce metrics
   - Product performance reports
   - Customer lifetime value tracking
   - Sales trends and forecasting
   - Geographic sales data

3. **Real-time Analytics**
   - Live visitor tracking
   - Real-time conversion monitoring
   - Active shopping sessions
   - Current cart values

4. **Custom Dimensions**
   - Track custom product attributes
   - Customer segments
   - Traffic source performance
   - Campaign effectiveness

5. **Dual Tracking**
   - Google Analytics 4 (GA4) + Universal Analytics
   - Facebook Pixel integration
   - Multiple tracking codes support

### Implementation Requirements
```typescript
// Frontend: Google Analytics E-commerce Events
- Product views: gtag('event', 'view_item', {...})
- Add to cart: gtag('event', 'add_to_cart', {...})
- Begin checkout: gtag('event', 'begin_checkout', {...})
- Purchase: gtag('event', 'purchase', {...})
- Remove from cart: gtag('event', 'remove_from_cart', {...})
```

**Backend Integration:**
- Track server-side events (order confirmations, refunds)
- Sync order data with Google Analytics
- Custom event tracking for PMS actions

---

## 🔍 All in One SEO (AIOSEO) E-commerce Features

### WooCommerce SEO Features

1. **Product Schema Markup**
   - Product structured data (JSON-LD)
   - Rich snippets for Google Shopping
   - Product ratings/reviews schema
   - Price and availability markup
   - Brand and manufacturer info

2. **E-commerce Schema Types**
   ```json
   {
     "@type": "Product",
     "name": "JA Solar 570W Panel",
     "description": "...",
     "brand": "JA Solar",
     "offers": {
       "@type": "Offer",
       "price": "1400.00",
       "priceCurrency": "GHS",
       "availability": "https://schema.org/InStock"
     },
     "aggregateRating": {
       "@type": "AggregateRating",
       "ratingValue": "4.5",
       "reviewCount": "23"
     }
   }
   ```

3. **Category & Archive SEO**
   - Optimized category page meta tags
   - Product category schema
   - Breadcrumb navigation schema
   - Pagination handling for SEO

4. **Product Page Optimization**
   - Auto-generated meta titles/descriptions
   - Product image alt tags
   - Open Graph tags for social sharing
   - Twitter Card integration

5. **Sitemap Generation**
   - Product sitemap
   - Category sitemap
   - Image sitemap
   - Automatic submission to search engines

### Implementation Plan
- Auto-generate SEO meta for products from database
- Dynamic schema markup based on product data
- Category pages with optimized URLs
- Product review integration for ratings schema

---

## 💳 Paystack Integration (Ghana)

### Payment Methods Supported
1. **Card Payments**
   - Visa, Mastercard, Verve
   - Debit and credit cards
   - 3D Secure authentication

2. **Mobile Money**
   - MTN Mobile Money
   - Vodafone Cash
   - AirtelTigo Money

3. **Bank Transfer**
   - Direct bank transfers
   - Bank account verification

### Integration Flow (WooCommerce Pattern)

```
Customer Checkout Flow:
1. Customer adds products to cart
2. Proceeds to checkout
3. Enters shipping/billing info
4. Selects Paystack as payment method
5. Redirected to Paystack payment page (or popup)
6. Customer completes payment
7. Paystack webhook notifies backend
8. Order status updated to "Processing"
9. Customer receives confirmation email
10. Admin notified of new order
```

### Backend Implementation

```python
# backend/app/routers/payments.py

@router.post("/payments/paystack/initialize")
async def initialize_paystack_payment(
    order_id: int,
    current_user: Customer = Depends(get_current_customer)
):
    """Initialize Paystack payment"""
    order = get_order(db, order_id)
    
    # Call Paystack API
    response = paystack_client.initialize_transaction(
        email=current_user.email,
        amount=int(order.total_amount * 100),  # Convert to kobo
        reference=f"EP-{order.order_number}",
        callback_url=f"{settings.FRONTEND_URL}/checkout/success",
        metadata={
            "order_id": order.id,
            "customer_id": current_user.id
        }
    )
    
    return {
        "authorization_url": response["data"]["authorization_url"],
        "access_code": response["data"]["access_code"]
    }

@router.post("/payments/paystack/webhook")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Paystack webhook notifications"""
    payload = await request.json()
    signature = request.headers.get("x-paystack-signature")
    
    # Verify webhook signature
    if not verify_paystack_signature(payload, signature):
        raise HTTPException(401, "Invalid signature")
    
    event = payload["event"]
    
    if event == "charge.success":
        reference = payload["data"]["reference"]
        order = get_order_by_reference(db, reference)
        
        # Update order status
        order.status = OrderStatus.PAID
        order.payment_reference = reference
        order.paid_at = datetime.now()
        db.commit()
        
        # Send confirmation email
        send_order_confirmation_email(order)
        
        # Update inventory
        update_inventory_for_order(order)
    
    return {"status": "success"}
```

### Frontend Integration

```typescript
// Frontend: Paystack Payment Component
const handlePaystackPayment = async () => {
  const response = await api.post('/payments/paystack/initialize', {
    order_id: order.id
  });
  
  // Redirect to Paystack payment page
  window.location.href = response.data.authorization_url;
  
  // Or use Paystack inline popup
  // const handler = PaystackPop.setup({...});
  // handler.openIframe();
};
```

---

## 📧 SendGrid Email Integration

### Email Templates Required

1. **Order Confirmation Email**
   - Order details (items, quantities, prices)
   - Order number and date
   - Payment confirmation
   - Shipping address
   - Estimated delivery date
   - Track order link

2. **Order Status Updates**
   - Order processing
   - Order shipped (with tracking number)
   - Order delivered
   - Order cancelled/refunded

3. **Customer Account Emails**
   - Welcome email (account creation)
   - Password reset
   - Email verification
   - Account update notifications

4. **Marketing Emails** (Optional)
   - Product recommendations
   - Abandoned cart reminders
   - New product announcements
   - Special offers/promotions

5. **Admin Notifications**
   - New order notification
   - Low stock alerts
   - Payment received
   - Customer inquiries

### SendGrid Implementation

```python
# backend/app/services/email_service.py

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, TemplateId

class EmailService:
    def __init__(self):
        self.sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    
    def send_order_confirmation(self, order: Order, customer: Customer):
        """Send order confirmation email"""
        message = Mail(
            from_email=settings.FROM_EMAIL,
            to_emails=customer.email,
            subject=f"Order Confirmation - {order.order_number}"
        )
        
        # Use SendGrid dynamic template
        message.template_id = settings.SENDGRID_ORDER_CONFIRMATION_TEMPLATE_ID
        message.dynamic_template_data = {
            "order_number": order.order_number,
            "order_date": order.created_at.strftime("%B %d, %Y"),
            "total_amount": f"GHS {order.total_amount:,.2f}",
            "items": [
                {
                    "name": item.product.name,
                    "quantity": item.quantity,
                    "price": f"GHS {item.unit_price:,.2f}",
                    "total": f"GHS {item.total_price:,.2f}"
                }
                for item in order.items
            ],
            "shipping_address": format_address(order.shipping_address),
            "track_order_url": f"{settings.FRONTEND_URL}/orders/{order.id}"
        }
        
        response = self.sg.send(message)
        return response.status_code == 202
    
    def send_order_shipped(self, order: Order, tracking_number: str):
        """Send shipping notification"""
        message = Mail(
            from_email=settings.FROM_EMAIL,
            to_emails=order.customer.email,
            subject=f"Your Order #{order.order_number} Has Shipped"
        )
        
        message.template_id = settings.SENDGRID_ORDER_SHIPPED_TEMPLATE_ID
        message.dynamic_template_data = {
            "order_number": order.order_number,
            "tracking_number": tracking_number,
            "tracking_url": f"{settings.CARRIER_URL}/{tracking_number}",
            "estimated_delivery": calculate_delivery_date()
        }
        
        self.sg.send(message)
```

### Email Template Structure (SendGrid Dynamic Templates)

```html
<!-- Order Confirmation Template -->
<h1>Thank You for Your Order!</h1>
<p>Hi {{customer_name}},</p>
<p>Your order <strong>{{order_number}}</strong> has been confirmed.</p>

<h2>Order Details</h2>
<table>
  {{#each items}}
  <tr>
    <td>{{name}}</td>
    <td>Qty: {{quantity}}</td>
    <td>{{price}}</td>
    <td>{{total}}</td>
  </tr>
  {{/each}}
</table>

<p><strong>Total: {{total_amount}}</strong></p>
<p><a href="{{track_order_url}}">Track Your Order</a></p>
```

---

## 🛒 WooCommerce Flow Implementation

### Order Lifecycle

```
1. Cart Management
   ├── Add to cart (localStorage + database)
   ├── Update quantities
   ├── Remove items
   └── Apply coupons/discounts

2. Checkout Process
   ├── Customer information (new/returning)
   ├── Shipping address
   ├── Shipping method selection
   ├── Payment method selection (Paystack)
   └── Order review

3. Payment Processing
   ├── Initialize Paystack payment
   ├── Customer completes payment
   ├── Webhook receives confirmation
   └── Order status: Pending → Processing

4. Order Fulfillment
   ├── Admin processes order
   ├── Update inventory
   ├── Generate shipping label
   ├── Mark as shipped
   └── Send tracking info

5. Order Completion
   ├── Customer receives order
   ├── Order marked as delivered
   ├── Request review/rating
   └── Archive order
```

### Database Schema (WooCommerce Pattern)

```sql
-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    status VARCHAR NOT NULL,  -- pending, processing, shipped, delivered, cancelled
    payment_status VARCHAR,    -- pending, paid, refunded
    payment_method VARCHAR,    -- paystack, cash_on_delivery
    payment_reference VARCHAR,
    
    -- Pricing
    subtotal DECIMAL(10,2),
    shipping_cost DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    
    -- Shipping
    shipping_address JSONB,
    billing_address JSONB,
    shipping_method VARCHAR,
    tracking_number VARCHAR,
    
    -- Timestamps
    created_at TIMESTAMP,
    paid_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR,  -- Snapshot at time of order
    product_sku VARCHAR,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2)
);

-- Cart (for logged-in customers)
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Coupons/Discounts
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR UNIQUE,
    discount_type VARCHAR,  -- percentage, fixed
    discount_value DECIMAL(10,2),
    minimum_amount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    is_active BOOLEAN
);
```

---

## 📝 Full CMS Implementation

### Content Management Features

1. **Page Management**
   - Create/edit/delete pages
   - WYSIWYG editor (Rich text editor)
   - Page templates
   - SEO settings per page
   - Custom fields/metadata

2. **Post/Blog Management**
   - Blog posts with categories/tags
   - Featured images
   - Author management
   - Publishing schedule
   - Comments system

3. **Media Library**
   - Image upload/management
   - File organization
   - Image optimization
   - CDN integration

4. **Menu Management**
   - Custom navigation menus
   - Multi-level menus
   - Menu locations (header, footer, sidebar)

5. **Widgets/Blocks**
   - Reusable content blocks
   - Sidebar widgets
   - Custom components

### CMS Database Schema

```sql
-- Pages
CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    featured_image VARCHAR,
    meta_title VARCHAR,
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    author_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Posts/Blog
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    featured_image VARCHAR,
    meta_title VARCHAR,
    meta_description TEXT,
    category_id INTEGER REFERENCES categories(id),
    author_id INTEGER REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id)
);

-- Media Library
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    filename VARCHAR NOT NULL,
    original_filename VARCHAR,
    file_path VARCHAR NOT NULL,
    file_type VARCHAR,  -- image, document, video
    file_size INTEGER,
    mime_type VARCHAR,
    alt_text VARCHAR,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP
);

-- Menus
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    location VARCHAR,  -- header, footer, sidebar
    created_at TIMESTAMP
);

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER REFERENCES menus(id),
    title VARCHAR NOT NULL,
    url VARCHAR,
    target VARCHAR,  -- _self, _blank
    parent_id INTEGER REFERENCES menu_items(id),
    order_index INTEGER
);
```

### CMS API Endpoints

```python
# backend/app/routers/cms.py

@router.get("/cms/pages")
async def list_pages(
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    """List all pages"""
    pass

@router.get("/cms/pages/{slug}")
async def get_page(slug: str, db: Session = Depends(get_db)):
    """Get page by slug"""
    pass

@router.post("/cms/pages")
async def create_page(
    page: PageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create new page (admin only)"""
    pass

@router.get("/cms/posts")
async def list_posts(
    category: str = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """List blog posts"""
    pass

@router.get("/cms/media")
async def list_media(
    file_type: str = None,
    db: Session = Depends(get_db)
):
    """List media files"""
    pass

@router.post("/cms/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload media file"""
    pass
```

---

## 🏗️ System Architecture

### Frontend Structure

```
frontend/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── public/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Hero.tsx
│   │   ├── cms/
│   │   │   ├── PageEditor.tsx
│   │   │   ├── MediaLibrary.tsx
│   │   │   └── MenuBuilder.tsx
│   │   ├── ecommerce/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   └── PaystackPayment.tsx
│   │   └── admin/ (existing PMS components)
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Blog.tsx
│   │   │   ├── BlogPost.tsx
│   │   │   └── Contact.tsx
│   │   ├── cms/
│   │   │   ├── Pages.tsx
│   │   │   ├── Posts.tsx
│   │   │   └── Media.tsx
│   │   └── admin/ (existing PMS pages)
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── CMSContext.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── paystack.ts
│   │   ├── analytics.ts (MonsterInsights)
│   │   └── email.ts
│   └── utils/
│       ├── seo.ts (AIOSEO helpers)
│       └── analytics.ts
```

### Backend Structure

```
backend/
├── app/
│   ├── routers/
│   │   ├── cms.py (Pages, Posts, Media)
│   │   ├── ecommerce.py (Products, Cart, Orders)
│   │   ├── payments.py (Paystack integration)
│   │   ├── analytics.py (MonsterInsights tracking)
│   │   └── email.py (SendGrid integration)
│   ├── services/
│   │   ├── paystack_service.py
│   │   ├── email_service.py (SendGrid)
│   │   ├── analytics_service.py
│   │   └── seo_service.py (Schema generation)
│   ├── models/
│   │   ├── cms.py (Page, Post, Media models)
│   │   └── ecommerce.py (Order, OrderItem, Cart models)
│   └── schemas/
│       ├── cms.py
│       └── ecommerce.py
```

---

## 🔄 Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Public Website                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   CMS     │  │E-commerce│  │  Blog    │              │
│  │  Pages    │  │  Shop    │  │  Posts   │              │
│  └────┬──────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
└───────┼──────────────┼──────────────┼────────────────────┘
        │              │              │
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Backend                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   CMS    │  │E-commerce │  │ Analytics│              │
│  │   API    │  │   API     │  │  API     │              │
│  └────┬─────┘  └────┬──────┘  └────┬─────┘              │
│       │             │               │                    │
└───────┼──────────────┼───────────────┼────────────────────┘
        │             │               │
        │             │               │
        ▼             ▼               ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Paystack │  │ SendGrid  │  │  Google  │              │
│  │ Payment  │  │   Email   │  │Analytics │              │
│  └──────────┘  └───────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│              Admin PMS (Existing)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Projects │  │  Quotes   │  │ Customers│              │
│  │  Sizing  │  │  Reports  │  │ Products │              │
│  └──────────┘  └───────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Phases

### Phase 1: Foundation & CMS (Weeks 1-2)
- [ ] Set up CMS database schema
- [ ] Create CMS API endpoints
- [ ] Build page/post management UI
- [ ] Implement media library
- [ ] Create WYSIWYG editor integration
- [ ] Menu management system

### Phase 2: E-commerce Core (Weeks 3-4)
- [ ] E-commerce database schema
- [ ] Product catalog display
- [ ] Shopping cart (localStorage + database)
- [ ] Checkout flow
- [ ] Order management system
- [ ] Inventory tracking

### Phase 3: Payment Integration (Week 5)
- [ ] Paystack API integration
- [ ] Payment initialization
- [ ] Webhook handling
- [ ] Payment status updates
- [ ] Refund processing

### Phase 4: Email System (Week 6)
- [ ] SendGrid API integration
- [ ] Email template creation
- [ ] Order confirmation emails
- [ ] Shipping notifications
- [ ] Admin notifications
- [ ] Email queue system

### Phase 5: Analytics & SEO (Week 7)
- [ ] Google Analytics integration
- [ ] MonsterInsights e-commerce tracking
- [ ] Event tracking implementation
- [ ] AIOSEO schema markup
- [ ] Product schema generation
- [ ] Sitemap generation

### Phase 6: Integration & Testing (Week 8)
- [ ] Link e-commerce orders to PMS
- [ ] Customer account unification
- [ ] Admin order management in PMS
- [ ] End-to-end testing
- [ ] Performance optimization

---

## 🎨 Key Features Summary

### CMS Features
✅ Page management with WYSIWYG editor  
✅ Blog/post system with categories  
✅ Media library with upload/management  
✅ Menu builder  
✅ SEO settings per page/post  
✅ Custom fields/metadata  

### E-commerce Features
✅ Product catalog with filters  
✅ Shopping cart (guest + customer)  
✅ Checkout process (WooCommerce flow)  
✅ Paystack payment integration  
✅ Order management  
✅ Inventory tracking  
✅ Coupon/discount system  

### Email Features
✅ Order confirmation emails  
✅ Shipping notifications  
✅ Customer account emails  
✅ Admin notifications  
✅ Transactional email templates  

### Analytics & SEO
✅ MonsterInsights Premium tracking  
✅ E-commerce conversion tracking  
✅ Google Analytics 4 integration  
✅ AIOSEO schema markup  
✅ Product rich snippets  
✅ Sitemap generation  

---

## 🔐 Security Considerations

1. **Payment Security**
   - PCI DSS compliance
   - Secure webhook verification
   - Payment data encryption
   - Tokenization for card data

2. **Data Protection**
   - GDPR compliance
   - Customer data encryption
   - Secure API endpoints
   - Rate limiting

3. **Authentication**
   - JWT for admin access
   - Session management for customers
   - Role-based access control
   - Two-factor authentication (optional)

---

## 📊 Performance Optimization

1. **Frontend**
   - Code splitting (public vs admin)
   - Image optimization
   - Lazy loading
   - CDN for static assets

2. **Backend**
   - Database indexing
   - Query optimization
   - Caching (Redis)
   - API response compression

3. **E-commerce**
   - Product image CDN
   - Cart persistence
   - Checkout optimization
   - Payment processing optimization

---

## 🚀 Next Steps for Discussion

1. **Content Migration**
   - When will you share your website URL?
   - What content needs to be migrated?
   - Any specific design requirements?

2. **E-commerce Products**
   - Which products will be sold?
   - Physical products or digital?
   - Inventory management requirements?

3. **Payment Configuration**
   - Paystack account setup status?
   - Test vs live mode preferences?
   - Payment method preferences?

4. **Email Templates**
   - Brand colors/design preferences?
   - Custom email template designs?
   - Email frequency preferences?

5. **Analytics Goals**
   - Key metrics to track?
   - Custom event requirements?
   - Reporting preferences?

---

**Ready to proceed?** Let's discuss your preferences and I'll start implementing! 🚀



