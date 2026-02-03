# Deployment Guide - Energy Precision PMS

This guide will help you deploy the application to Docker Hub and Render.

## Prerequisites

1. **Docker Desktop** installed and running
2. **Docker Hub account** (create at https://hub.docker.com)
3. **Render account** (create at https://render.com)

## Step 1: Prepare Docker Hub

1. Create a Docker Hub account if you don't have one
2. Note your Docker Hub username (e.g., `yourusername`)

## Step 2: Build and Push Images to Docker Hub

### Option A: Using Docker Desktop (Recommended)

1. **Open Docker Desktop**
2. **Open Terminal** in Docker Desktop or use your system terminal
3. **Navigate to project directory:**
   ```bash
   cd /Users/OceanCyber/Downloads/EnergyPrecisionPMS
   ```

4. **Login to Docker Hub:**
   ```bash
   docker login
   ```
   Enter your Docker Hub username and password when prompted.

5. **Set your Docker Hub username:**
   ```bash
   export DOCKERHUB_USERNAME=yourusername
   ```
   Replace `yourusername` with your actual Docker Hub username.

6. **Build and push backend image:**
   ```bash
   # Build (with --platform linux/amd64 for Render compatibility)
   docker build --platform linux/amd64 -f backend/Dockerfile.prod -t $DOCKERHUB_USERNAME/energy-pms-backend:latest ./backend
   
   # Push
   docker push $DOCKERHUB_USERNAME/energy-pms-backend:latest
   ```

7. **Build and push frontend image:**
   ```bash
   # Build (with --platform linux/amd64 for Render compatibility)
   docker build --platform linux/amd64 -f frontend/Dockerfile.prod -t $DOCKERHUB_USERNAME/energy-pms-frontend:latest ./frontend --build-arg REACT_APP_API_URL=http://localhost:8000
   
   # Push
   docker push $DOCKERHUB_USERNAME/energy-pms-frontend:latest
   ```

### Option B: Using Helper Script (Easiest)

1. **Make script executable** (if not already):
   ```bash
   chmod +x build-and-push.sh
   ```

2. **Run the script:**
   ```bash
   ./build-and-push.sh yourusername
   ```
   Replace `yourusername` with your Docker Hub username.

   The script will:
   - Check Docker is running
   - Check you're logged in
   - Build both images
   - Push both images to Docker Hub

## Step 3: Deploy to Render

### 3.1 Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `energy-pms-db`
   - **Database:** `energy_pms`
   - **User:** `energy_pms` (or your choice)
   - **Region:** Choose closest to Ghana (e.g., Frankfurt, Europe)
   - **Plan:** Free tier or paid
4. Click **"Create Database"**
5. **Note the connection details:**
   - Internal Database URL (for backend service)
   - External Database URL (for local testing)

### 3.2 Create Backend Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your Docker Hub account (if not connected)
3. Select **"Use an existing image from a registry"**
4. Enter image: `yourusername/energy-pms-backend:latest`
5. Configure:
   - **Name:** `energy-pms-backend`
   - **Region:** Same as database
   - **Branch:** (not applicable for Docker images)
   - **Root Directory:** (leave empty)
   - **Environment:** `Docker`
   - **Docker Command:** (leave empty, uses CMD from Dockerfile)
   - **Docker Context:** (leave empty)
6. **Environment Variables:**
   ```
   POSTGRES_USER=<from database>
   POSTGRES_PASSWORD=<from database>
   POSTGRES_DB=energy_pms
   POSTGRES_HOST=<internal-db-host-from-render>
   POSTGRES_PORT=5432
   SECRET_KEY=<generate-a-strong-secret-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   SMTP_HOST=<your-smtp-host>
   SMTP_PORT=587
   SMTP_USER=<your-smtp-user>
   SMTP_PASSWORD=<your-smtp-password>
   SMTP_FROM_EMAIL=<your-email>
   COMPANY_NAME=Energy Precisions
   COMPANY_ADDRESS=Haatso - Ecomog
   COMPANY_PHONE=<your-phone>
   COMPANY_EMAIL=<your-email>
   ```
7. Click **"Create Web Service"**
8. **After service starts, run database migrations:**
   - Go to service → **"Shell"** tab
   - Run: `alembic upgrade head`
   - Run: `python -m app.scripts.init_db`
   - Run: `python -m app.scripts.create_admin` (create admin user)

### 3.3 Create Frontend Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Select **"Use an existing image from a registry"**
3. Enter image: `yourusername/energy-pms-frontend:latest`
4. Configure:
   - **Name:** `energy-pms-frontend`
   - **Region:** Same as backend
   - **Environment:** `Docker`
5. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://energy-pms-backend.onrender.com
   ```
   (Replace with your actual backend URL from Render)
6. Click **"Create Web Service"**

### 3.4 Update Backend CORS Settings

After frontend is deployed, update backend CORS to allow frontend URL:

1. Go to backend service on Render → **Environment** tab
2. Add environment variable:
   ```
   CORS_ORIGINS=https://energy-pms-frontend.onrender.com
   ```
   (Replace with your actual frontend URL)
3. **Restart the backend service** for changes to take effect
4. The backend is already configured to read `CORS_ORIGINS` from environment variables

## Step 4: Post-Deployment Setup

1. **Access your frontend URL** (e.g., `https://energy-pms-frontend.onrender.com`)
2. **Login** with admin credentials created in Step 3.2
3. **Configure settings** in the Settings page
4. **Upload company logo** in Settings → Other tab

## Notes

- Render free tier services spin down after 15 minutes of inactivity
- For production, consider paid plans for always-on services
- Database backups are recommended for production
- Monitor logs in Render dashboard for any issues

## Troubleshooting

- **Backend won't start:** Check database connection string and environment variables
- **Frontend can't connect:** Verify `REACT_APP_API_URL` matches backend URL
- **CORS errors:** Update CORS origins in backend to include frontend URL
- **Database connection:** Use internal database URL for backend service

