# Deploy to Render with Blueprint (GitHub + Render Startup)

This guide gets your **Energy Precision PMS** from your Mac into the empty repo [wastwagon/Energy-Presissions-PMS](https://github.com/wastwagon/Energy-Presissions-PMS) and deploys it on Render using a Blueprint and Render startup plans.

---

## 1. Push your code to GitHub (GitHub Desktop or terminal)

Your repo is empty, so you need to push this project into it.

### Option A: Using GitHub Desktop

1. **Open GitHub Desktop** and sign in to the account that owns `wastwagon/Energy-Presissions-PMS`.

2. **Add this project as a local repo** (if not already):
   - **File → Add Local Repository**
   - Choose: `EnergyPrecisionPMS` (this folder)
   - If it says “this directory does not appear to be a Git repository”, click **“create a repository”** and create it in this folder (leave “Git Ignore” and “License” as default).

3. **Connect to your GitHub repo**:
   - **Repository → Repository Settings** (or **Repository → Open in Command Prompt** and run the commands below in **Option B**).
   - Or: **Repository → Push origin** – if it asks for a remote, use:
     - **URL:** `https://github.com/wastwagon/Energy-Presissions-PMS.git`
     - **Name:** `origin`

4. **Push to GitHub**:
   - Make sure the **current branch** is `main` (or `master`; rename to `main` if you prefer).
   - **Commit** any uncommitted changes (e.g. “Initial commit – Energy Precision PMS + Render blueprint”).
   - Click **Push origin** to push to `https://github.com/wastwagon/Energy-Presissions-PMS`.

### Option B: Using the command line (terminal)

From your **project root** (the folder that contains `render.yaml`, `backend/`, `frontend/`):

```bash
cd /Users/OceanCyber/Downloads/EnergyPrecisionPMS

# If this folder is not yet a Git repo:
git init
git add .
git commit -m "Initial commit: Energy Precision PMS + Render blueprint"

# Add your empty GitHub repo as remote (replace with your repo URL)
git remote add origin https://github.com/wastwagon/Energy-Presissions-PMS.git

# Push (use main or master to match your repo default branch)
git branch -M main
git push -u origin main
```

Use your GitHub username and a **Personal Access Token** (not your password) when Git asks for credentials.

---

## 2. Deploy on Render with Blueprint

1. Go to **[Render Dashboard](https://dashboard.render.com)** and sign in.

2. **New → Blueprint** (or **New + → Blueprint**).

3. **Connect the repo**:
   - Connect GitHub if needed.
   - Select **wastwagon/Energy-Presissions-PMS** (or paste `https://github.com/wastwagon/Energy-Presissions-PMS`).
   - Branch: **main** (or your default branch).

4. Render will read **render.yaml** and show:
   - **Postgres:** `energy-pms-db` (plan: free or your choice)
   - **Web Service:** `energy-pms-backend`
   - **Web Service:** `energy-pms-frontend`

5. **Secrets (sync: false)**  
   When prompted, set:
   - **CORS_ORIGINS:** `https://energy-pms-frontend.onrender.com`  
     (Replace with your real frontend URL after the first deploy if Render gives a different name.)
   - **REACT_APP_API_URL:** `https://energy-pms-backend.onrender.com`  
     (Replace with your real backend URL after the first deploy if needed.)
   - Optionally: **COMPANY_PHONE**, **COMPANY_EMAIL**, **SMTP_*** for email.

6. Click **Apply** and wait for the database and both services to deploy.

7. **After first deploy:**
   - In **Dashboard**, open **energy-pms-backend** → **Environment** and set **CORS_ORIGINS** to your frontend URL (e.g. `https://energy-pms-frontend.onrender.com`).
   - Open **energy-pms-frontend** → **Environment** and set **REACT_APP_API_URL** to your backend URL (e.g. `https://energy-pms-backend.onrender.com`).
   - Trigger a **Manual Deploy** on the frontend so it rebuilds with the correct API URL.

---

## 3. Run migrations and seed data (one-time)

1. In Render Dashboard, open **energy-pms-backend**.
2. Open the **Shell** tab.
3. Run:

```bash
cd /app
alembic upgrade head
python -m app.scripts.init_db
python -m app.scripts.setup_bank_details
```

4. Default admin: **Email** `admin@energyprecisions.com`, **Password** `admin123`. Change after first login.

---

## 4. Render startup plans (free vs paid)

- **Free:** Database and web services can use **free** plan (DB free tier has a 90-day limit; see [Render pricing](https://render.com/pricing)).
- **Paid startup:** In **render.yaml** you can change `plan: free` to `plan: starter` for web services and use a paid DB plan (e.g. `basic-256mb`) for the database. Then **Apply** the Blueprint again or change the plan in the Dashboard.

---

## 5. URLs after deploy

- **Frontend (PMS):** `https://energy-pms-frontend.onrender.com`  
  (or the URL Render shows for `energy-pms-frontend`.)
- **Backend API:** `https://energy-pms-backend.onrender.com`  
  **API docs:** `https://energy-pms-backend.onrender.com/docs`

---

## 6. Troubleshooting

- **Backend 500 / DB errors:** In backend **Shell**, run `alembic upgrade head` and `python -m app.scripts.init_db`.
- **Frontend “can’t reach API”:** Set **REACT_APP_API_URL** to the backend URL and redeploy the frontend.
- **CORS errors:** Set **CORS_ORIGINS** on the backend to the frontend URL (no trailing slash), then redeploy.

---

**Summary:** Push this project to `https://github.com/wastwagon/Energy-Presissions-PMS`, then in Render use **New → Blueprint**, connect that repo, set the secrets when prompted, apply, then run migrations and init scripts in the backend Shell and set CORS/API URLs as above.
