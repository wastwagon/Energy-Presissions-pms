# E-commerce Setup Guide

## ✅ Implementation Complete

The full e-commerce system with Paystack and SendGrid integration is now implemented!

---

## 🚀 Quick Start

### 1. Database Migration

Create the e-commerce tables:

```bash
cd backend
python -m app.scripts.create_ecommerce_tables
```

Or use Alembic:

```bash
cd backend
alembic revision --autogenerate -m "Add e-commerce tables"
alembic upgrade head
```

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Paystack (Ghana)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# SendGrid
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@energyprecisions.com
SENDGRID_FROM_NAME=Energy Precisions

# Frontend URL (for payment callbacks)
FRONTEND_URL=http://localhost:3000

# Admin email for order notifications
ADMIN_EMAIL=admin@energyprecisions.com
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

## 📋 Features Implemented

### Backend

✅ **E-commerce Models**
- Order management
- Order items
- Shopping cart (guest & logged-in)
- Coupon/discount codes
- Enhanced Product model

✅ **API Endpoints**
- `/api/ecommerce/products` - Public product listing
- `/api/ecommerce/products/{id}` - Product details
- `/api/ecommerce/cart/*` - Cart management
- `/api/ecommerce/orders` - Order creation
- `/api/ecommerce/coupons/validate` - Coupon validation

✅ **Payment Integration**
- `/api/payments/paystack/initialize` - Initialize payment
- `/api/payments/paystack/webhook` - Webhook handler
- `/api/payments/paystack/verify/{reference}` - Verify payment

✅ **Email Service**
- Order confirmation emails
- Shipping notifications
- Admin order notifications
- HTML email templates

### Frontend

✅ **Pages**
- Shop page with product listing
- Product detail pages
- Shopping cart with management
- Full checkout flow (3 steps)
- Checkout success page

✅ **Features**
- Cart context (React)
- Guest cart support
- Cart count in header
- Paystack payment redirect
- Order confirmation

---

## 🔧 Paystack Setup

### 1. Get Paystack Keys

1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings > API Keys & Webhooks
3. Copy your Test/Live keys

### 2. Configure Webhook

In Paystack dashboard:
- Webhook URL: `https://your-domain.com/api/payments/paystack/webhook`
- Events to listen: `charge.success`

### 3. Test Mode

Use test cards:
- Card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`

---

## 📧 SendGrid Setup

### 1. Create Account

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your sender email
3. Create API key (Settings > API Keys)

### 2. Email Templates

The system uses HTML email templates. You can:
- Customize templates in `backend/app/services/email_service.py`
- Use SendGrid Dynamic Templates (recommended for production)
- Set up template IDs in environment variables

### 3. Verify Sender

- Verify your sender email in SendGrid
- Or use a verified domain

---

## 🛒 Testing the E-commerce Flow

### 1. Add Products

Update products in admin panel or database with:
- `name` - Display name
- `description` - Full description
- `short_description` - Brief description
- `category` - Product category
- `image_url` - Product image URL
- `base_price` - Price in GHS
- `in_stock` - Stock status

### 2. Test Flow

1. Visit `/shop` - Browse products
2. Add items to cart
3. Go to `/cart` - Review cart
4. Click "Proceed to Checkout"
5. Fill shipping information
6. Select payment method (Paystack)
7. Complete payment
8. Receive confirmation email

---

## 📊 Database Schema

### New Tables

- `orders` - Customer orders
- `order_items` - Order line items
- `cart_items` - Shopping cart items
- `coupons` - Discount codes

### Enhanced Tables

- `products` - Added e-commerce fields:
  - `name`, `description`, `short_description`
  - `image_url`, `gallery_images`
  - `category`, `sku`
  - `stock_quantity`, `manage_stock`, `in_stock`

---

## 🔐 Security Notes

1. **Paystack Webhook**: Signature verification implemented
2. **Cart Sessions**: Guest carts use session IDs
3. **Order Validation**: Server-side validation for all orders
4. **Email Security**: SendGrid API key stored in environment

---

## 🐛 Troubleshooting

### Paystack Not Working

- Check API keys in `.env`
- Verify webhook URL is accessible
- Check Paystack dashboard for transaction logs

### Emails Not Sending

- Verify SendGrid API key
- Check sender email is verified
- Review SendGrid activity logs
- Check email service logs in backend

### Cart Not Persisting

- Check session ID in localStorage
- Verify cart API endpoints are accessible
- Check CORS settings

---

## 📝 Next Steps

1. **Add Product Images**
   - Upload product images
   - Update `image_url` in products table

2. **Configure Shipping**
   - Set up shipping methods
   - Calculate shipping costs
   - Add shipping zones

3. **Set Up Coupons**
   - Create discount codes
   - Configure usage limits
   - Set expiration dates

4. **Production Deployment**
   - Switch to Paystack live keys
   - Configure production webhook URL
   - Set up production email templates
   - Enable SSL certificates

---

## 📞 Support

For issues or questions:
- Email: info@energyprecisions.com
- Phone: +233 533 611 611

---

**System is ready for testing!** 🎉



