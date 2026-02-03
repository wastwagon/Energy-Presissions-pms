# Quick Deployment Guide - Docker Hub & Render

## 🚀 Quick Start (Using Docker Desktop)

### Step 1: Login to Docker Hub

1. Open **Terminal** (or Docker Desktop terminal)
2. Run:
   ```bash
   docker login
   ```
3. Enter your Docker Hub username and password

### Step 2: Build and Push Images

**Option A: Using the script (Recommended):**
```bash
cd /Users/OceanCyber/Downloads/EnergyPrecisionPMS
./build-and-push.sh your-dockerhub-username
```

**Option B: Manual commands:**
```bash
# Set your Docker Hub username
export DOCKERHUB_USERNAME=your-username

# Build and push backend (with --platform linux/amd64 for Render compatibility)
docker build --platform linux/amd64 -f backend/Dockerfile.prod -t $DOCKERHUB_USERNAME/energy-pms-backend:latest ./backend
docker push $DOCKERHUB_USERNAME/energy-pms-backend:latest

# Build and push frontend (with --platform linux/amd64 for Render compatibility)
docker build --platform linux/amd64 -f frontend/Dockerfile.prod -t $DOCKERHUB_USERNAME/energy-pms-frontend:latest ./frontend --build-arg REACT_APP_API_URL=http://localhost:8000
docker push $DOCKERHUB_USERNAME/energy-pms-frontend:latest
```

### Step 3: Deploy to Render

#### 3.1 Create Database
1. Go to https://dashboard.render.com
2. **New +** → **PostgreSQL**
3. Name: `energy-pms-db`
4. Database: `energy_pms`
5. User: `energy_pms`
6. **Create Database**
7. **Copy the Internal Database URL** (you'll need this)

#### 3.2 Create Backend Service
1. **New +** → **Web Service**
2. **Connect Docker Hub** (if not connected)
3. Select **"Use an existing image from a registry"**
4. Image: `your-username/energy-pms-backend:latest`
5. Name: `energy-pms-backend`
6. **Environment Variables:**
   ```
   POSTGRES_USER=energy_pms
   POSTGRES_PASSWORD=<from database>
   POSTGRES_DB=energy_pms
   POSTGRES_HOST=<internal-host-from-database>
   POSTGRES_PORT=5432
   SECRET_KEY=<generate-random-string>
   CORS_ORIGINS=https://energy-pms-frontend.onrender.com
   ```
7. **Create Web Service**
8. Wait for it to start, then go to **Shell** tab and run:
   ```bash
   alembic upgrade head
   python -m app.scripts.init_db
   python -m app.scripts.create_admin
   ```
   (Follow prompts to create admin user)

#### 3.3 Create Frontend Service
1. **New +** → **Web Service**
2. Select **"Use an existing image from a registry"**
3. Image: `your-username/energy-pms-frontend:latest`
4. Name: `energy-pms-frontend`
5. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://energy-pms-backend.onrender.com
   ```
   (Use your actual backend URL)
6. **Create Web Service**

#### 3.4 Update Backend CORS
1. Go to backend service → **Environment** tab
2. Add/Update:
   ```
   CORS_ORIGINS=https://energy-pms-frontend.onrender.com
   ```
3. **Save Changes** (service will restart)

### Step 4: Access Your Application

1. Go to your frontend service URL
2. Login with admin credentials
3. Configure settings and upload logo

## 📝 Important Notes

- **Free tier services** on Render spin down after 15 min inactivity
- **Database URL**: Use **Internal Database URL** for backend (not external)
- **CORS**: Must include your frontend URL in backend CORS_ORIGINS
- **SECRET_KEY**: Generate a strong random string (e.g., use `openssl rand -hex 32`)

## 🔧 Troubleshooting

- **Backend won't start**: Check database connection string
- **Frontend shows errors**: Verify REACT_APP_API_URL matches backend URL
- **CORS errors**: Ensure CORS_ORIGINS includes frontend URL
- **Can't login**: Check if database migrations ran successfully

