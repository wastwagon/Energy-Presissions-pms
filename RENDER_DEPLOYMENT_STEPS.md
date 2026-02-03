# Render Deployment Steps - Energy Precision PMS

## Your Database Details (from Render Dashboard)

Based on your Render dashboard:
- **Database Name:** `energy_pms`
- **Username:** `energy_pms`
- **Hostname:** `dpg-d4kpnmnpm1nc738dncg0-a`
- **Port:** `5432`
- **Region:** Oregon (US West)

## Step 1: Create Backend Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (or use "Public Git repository" and paste your repo URL)
4. Configure the service:
   - **Name:** `energy-pms-backend`
   - **Environment:** `Docker`
   - **Docker Image:** `flygonpriest/energy-pms-backend:latest`
   - **Region:** Choose the same region as your database (Oregon) or Frankfurt for better latency to Ghana
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** Leave empty
   - **Dockerfile Path:** Leave empty (we're using pre-built image)

5. **Environment Variables:**
   Add these environment variables (use the values from your database connection page):

   ```
   POSTGRES_HOST=dpg-d4kpnmnpm1nc738dncg0-a
   POSTGRES_PORT=5432
   POSTGRES_DB=energy_pms
   POSTGRES_USER=energy_pms
   POSTGRES_PASSWORD=<your-database-password-from-render>
   ```

   **Additional Required Variables:**
   ```
   SECRET_KEY=<generate-a-random-secret-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   SMTP_HOST=<your-smtp-host>
   SMTP_PORT=587
   SMTP_USER=<your-smtp-username>
   SMTP_PASSWORD=<your-smtp-password>
   SMTP_FROM_EMAIL=<your-email>
   COMPANY_NAME=Energy Precisions
   COMPANY_ADDRESS=Haatso - Ecomog
   COMPANY_PHONE=0244123456
   COMPANY_EMAIL=info@energyprecisions.com
   CORS_ORIGINS=https://energy-pms-frontend.onrender.com
   ```

   **Note:** Replace `<your-database-password-from-render>` with the actual password from your Render database connection page. Click the eye icon to reveal it, then copy it.

6. **Health Check Path:** `/api/health`
7. Click **"Create Web Service"**

## Step 2: Run Database Migrations

After the backend service is created and running:

1. Go to your backend service on Render
2. Click on **"Shell"** tab
3. Run these commands:

   ```bash
   cd /app
   alembic upgrade head
   python -m app.scripts.init_db
   ```

   This will:
   - Run all database migrations
   - Initialize default settings
   - Create admin user (email: `admin@energyprecisions.com`, password: `admin123`)

## Step 3: Create Frontend Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Configure the service:
   - **Name:** `energy-pms-frontend`
   - **Environment:** `Docker`
   - **Docker Image:** `flygonpriest/energy-pms-frontend:latest`
   - **Region:** Same as backend
   - **Branch:** `main`

4. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://energy-pms-backend.onrender.com
   ```

   **Note:** Replace `energy-pms-backend` with your actual backend service name if different.

5. Click **"Create Web Service"**

## Step 4: Update Backend CORS

After the frontend is deployed, update the backend's `CORS_ORIGINS` environment variable:

1. Go to your backend service
2. Go to **"Environment"** tab
3. Update `CORS_ORIGINS` to:
   ```
   https://energy-pms-frontend.onrender.com
   ```
   (Replace with your actual frontend URL)
4. Click **"Save Changes"**
5. The service will automatically redeploy

## Step 5: Upload Company Logo (Optional)

1. Log into your application at: `https://energy-pms-frontend.onrender.com`
2. Use admin credentials:
   - Email: `admin@energyprecisions.com`
   - Password: `admin123`
3. Go to **Settings** → **General** tab
4. Upload your company logo
5. Update company contact details if needed

## Step 6: Verify Deployment

1. Visit your frontend URL: `https://energy-pms-frontend.onrender.com`
2. Log in with admin credentials
3. Test creating a customer, project, and quote
4. Generate a PDF quotation to verify all features work

## Troubleshooting

### Backend won't start
- Check the **Logs** tab in Render
- Verify all environment variables are set correctly
- Ensure database password is correct

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` points to your backend URL
- Check backend `CORS_ORIGINS` includes your frontend URL
- Check backend logs for CORS errors

### Database connection errors
- Verify database credentials match exactly
- Check that the database is in "Available" status
- Ensure the backend service is in the same region or has network access

## Important Notes

1. **Database Password:** Keep your database password secure. Never commit it to Git.
2. **Secret Key:** Generate a strong secret key for `SECRET_KEY`. You can use:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. **SMTP Settings:** Configure SMTP for email functionality. You can use services like SendGrid, Mailgun, or your email provider's SMTP.
4. **Auto-Deploy:** Render will automatically pull the latest `latest` tag from Docker Hub when you redeploy. To update, just click "Manual Deploy" → "Deploy latest commit" in Render.

## Next Steps After Deployment

1. Change the default admin password
2. Create additional users (sales, designers) as needed
3. Configure product pricing in Settings
4. Upload company logo and branding
5. Test the full workflow: Customer → Project → Load Analysis → Sizing → Quote → PDF








