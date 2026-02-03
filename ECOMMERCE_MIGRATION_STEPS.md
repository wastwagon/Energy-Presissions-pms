# E-commerce Migration Steps

## Step-by-Step Guide to Set Up E-commerce

### 1. Run Database Migration

```bash
cd backend
alembic upgrade head
```

This will:
- Add e-commerce fields to `products` table
- Create `orders` table
- Create `order_items` table
- Create `cart_items` table
- Create `coupons` table

### 2. Update Existing Products

Update your existing products with e-commerce fields:

```bash
cd backend
python -m app.scripts.update_products_for_ecommerce
```

This script will:
- Generate product names from brand/model
- Create descriptions
- Set categories
- Generate SKUs
- Set stock status

### 3. (Optional) Seed Sample Products

If you want to add sample products for testing:

```bash
cd backend
python -m app.scripts.seed_ecommerce_products
```

**Note:** This only runs if no products exist in the database.

### 4. Configure Environment Variables

Add to your `.env` file:

```bash
# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# SendGrid
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@energyprecisions.com
SENDGRID_FROM_NAME=Energy Precisions

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin Email
ADMIN_EMAIL=admin@energyprecisions.com
```

### 5. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 6. Start Services

```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm start
```

### 7. Test the Flow

1. Visit `http://localhost:3000/shop`
2. Browse products
3. Add items to cart
4. Go to cart and review
5. Proceed to checkout
6. Fill shipping information
7. Select Paystack payment
8. Complete test payment
9. Verify order confirmation

---

## Verification Checklist

- [ ] Database migration completed successfully
- [ ] Products updated with e-commerce fields
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] Can browse products in shop
- [ ] Can add items to cart
- [ ] Cart persists (check localStorage)
- [ ] Checkout form works
- [ ] Paystack payment redirects (test mode)
- [ ] Order confirmation email received (if SendGrid configured)

---

## Troubleshooting

### Migration Fails

If migration fails with "table already exists":
- Tables may have been created manually
- Check if tables exist: `\dt` in PostgreSQL
- If they exist, you can skip migration or drop and recreate

### Products Not Showing

- Check if products have `is_active = true`
- Verify products have `name` field set
- Check API endpoint: `GET /api/ecommerce/products`

### Cart Not Working

- Check browser console for errors
- Verify session ID in localStorage
- Check CORS settings in backend
- Verify cart API endpoints are accessible

### Paystack Not Working

- Verify API keys in `.env`
- Check Paystack dashboard for transaction logs
- Ensure webhook URL is accessible
- Test with Paystack test cards

---

## Next Steps After Migration

1. **Add Product Images**
   - Upload product images
   - Update `image_url` in products table
   - Or use image URLs from your existing website

2. **Configure Shipping**
   - Set up shipping methods
   - Calculate shipping costs
   - Add shipping zones

3. **Create Coupons**
   - Add discount codes
   - Set usage limits
   - Configure expiration dates

4. **Set Up Production**
   - Switch to Paystack live keys
   - Configure production webhook
   - Set up production email templates
   - Enable SSL

---

**Ready to go!** 🚀



