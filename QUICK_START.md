# Quick Start Guide - Accessing the Frontend

## Step 1: Start the Application

Open a terminal in the project directory and run:

```bash
docker-compose up -d
```

This will start all three services:
- Database (PostgreSQL) on port 5432
- Backend API (FastAPI) on port 8000
- Frontend (React) on port 3000

## Step 2: Wait for Services to Start

Wait about 30-60 seconds for all containers to start up. You can check the status with:

```bash
docker-compose ps
```

All services should show "Up" status.

## Step 3: Initialize Database (First Time Only)

If this is your first time running the application:

```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Initialize default settings
docker-compose exec backend python -m app.scripts.init_db

# Create an admin user
docker-compose exec backend python -m app.scripts.create_admin
```

Follow the prompts to enter:
- Admin email
- Admin password
- Admin full name

## Step 4: Access the Frontend

Once everything is running, open your web browser and go to:

**http://localhost:3000**

You should see the login page.

## Step 5: Log In

Use the admin credentials you created in Step 3 to log in.

## Troubleshooting

### If the frontend doesn't load:

1. **Check if containers are running:**
   ```bash
   docker-compose ps
   ```

2. **Check frontend logs:**
   ```bash
   docker-compose logs frontend
   ```

3. **Check backend logs:**
   ```bash
   docker-compose logs backend
   ```

4. **Restart services:**
   ```bash
   docker-compose restart
   ```

### If you see connection errors:

- Make sure the backend is running on port 8000
- Check that `REACT_APP_API_URL` is set correctly (default: http://localhost:8000)
- Verify the backend API is accessible at http://localhost:8000/docs

### If you need to rebuild:

```bash
docker-compose down
docker-compose up -d --build
```

## Access Points

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432 (username: energy_pms, password: changeme)

## Stopping the Application

To stop all services:

```bash
docker-compose down
```

To stop and remove all data (including database):

```bash
docker-compose down -v
```








