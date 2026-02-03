# Deployment Checklist - Energy Precision PMS

## Pre-Deployment Review ✅

### Project Status
- ✅ All recent features implemented and tested
- ✅ Battery sizing with C-rate and discharge efficiency
- ✅ Real-time quote calculations (BOS, Installation, Tax, Discount)
- ✅ PDF generation with updated sections
- ✅ System verification scripts available
- ✅ Database migration script ready

### Files Ready for Deployment
- ✅ `backend/Dockerfile.prod` - Production backend image
- ✅ `frontend/Dockerfile.prod` - Production frontend image
- ✅ `docker-compose.prod.yml` - Production compose file
- ✅ `build-and-push.sh` - Docker Hub push script
- ✅ `backend/app/scripts/migrate_production_db.py` - Database migration

---

## Step 1: Review Project ✅

**Status:** ✅ Complete

Review document created: `PROJECT_REVIEW_AND_DEPLOYMENT.md`

Key points:
- Architecture documented
- Recent updates listed
- Key features summarized
- Database schema overview

---

## Step 2: Push to Docker Hub

### Prerequisites
- [ ] Docker Desktop running
- [ ] Logged in to Docker Hub (`docker login`)
- [ ] Docker Hub username ready

### Commands

```bash
# Option 1: Use the build script (recommended)
./build-and-push.sh <your-dockerhub-username>

# Option 2: Manual build and push
export DOCKERHUB_USERNAME=your-username

# Build backend
docker build --platform linux/amd64 -f backend/Dockerfile.prod \
  -t $DOCKERHUB_USERNAME/energy-pms-backend:latest ./backend

# Push backend
docker push $DOCKERHUB_USERNAME/energy-pms-backend:latest

# Build frontend
docker build --platform linux/amd64 -f frontend/Dockerfile.prod \
  -t $DOCKERHUB_USERNAME/energy-pms-frontend:latest ./frontend \
  --build-arg REACT_APP_API_URL=http://localhost:8000

# Push frontend
docker push $DOCKERHUB_USERNAME/energy-pms-frontend:latest
```

### Expected Output
- ✅ Backend image built successfully
- ✅ Frontend image built successfully
- ✅ Both images pushed to Docker Hub
- ✅ Images available at:
  - `your-username/energy-pms-backend:latest`
  - `your-username/energy-pms-frontend:latest`

---

## Step 3: Production Database Migration

### Prerequisites
- [ ] Production PostgreSQL database created
- [ ] Database credentials available
- [ ] Network access to production database
- [ ] **BACKUP production database first!**

### Migration Steps

#### 3.1: Test Connection

```bash
cd backend

# Set environment variables
export PROD_POSTGRES_HOST=your-production-host
export PROD_POSTGRES_PORT=5432
export PROD_POSTGRES_USER=your_username
export PROD_POSTGRES_PASSWORD=your_password
export PROD_POSTGRES_DB=your_database

# Test connection (no changes made)
python -m app.scripts.migrate_production_db --verify-only
```

#### 3.2: Run Migration

```bash
# Run full migration
python -m app.scripts.migrate_production_db
```

Or with command-line arguments:

```bash
python -m app.scripts.migrate_production_db \
  --host your-production-host \
  --port 5432 \
  --user your_username \
  --password your_password \
  --database your_database
```

### What Gets Migrated
- ✅ Database schema (all tables)
- ✅ Default settings (sizing factors, pricing, etc.)
- ✅ Peak sun hours data (Ghana cities)
- ✅ Existing data preserved

### Verification
After migration, verify:
- [ ] All tables created
- [ ] Settings initialized
- [ ] Peak sun hours data present
- [ ] No errors in migration output

---

## Step 4: Update Production Environment

### Environment Variables

Update your production environment (Render, AWS, etc.) with:

**Backend:**
```env
POSTGRES_HOST=your-production-host
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
# ... other environment variables
```

**Frontend:**
```env
REACT_APP_API_URL=https://your-backend-url.com
```

### Docker Images

Update your production services to use:
- Backend: `your-username/energy-pms-backend:latest`
- Frontend: `your-username/energy-pms-frontend:latest`

---

## Step 5: Post-Deployment Verification

### Application Tests
- [ ] Frontend loads correctly
- [ ] Login works
- [ ] API endpoints accessible
- [ ] Create a test project
- [ ] Run system sizing
- [ ] Generate a quote
- [ ] Download PDF quote
- [ ] Verify calculations are correct

### System Verification

```bash
# Run comprehensive system check
cd backend
python -m app.scripts.system_verification
```

Expected results:
- ✅ All API endpoints accessible
- ✅ Quote calculations accurate
- ✅ PDF generation works
- ✅ Data consistency verified

---

## Troubleshooting

### Docker Build Issues

**Error: "platform linux/amd64 not supported"**
- Use `--platform linux/amd64` flag (already in script)
- Ensure Docker Desktop supports multi-platform builds

**Error: "Build failed"**
- Check Dockerfile syntax
- Verify all files are present
- Check build logs for specific errors

### Database Migration Issues

**Error: "Connection refused"**
- Verify database host and port
- Check firewall rules
- Ensure database is accessible

**Error: "Authentication failed"**
- Double-check credentials
- Verify user permissions
- Check database name

### Application Issues

**Error: "Cannot connect to database"**
- Verify environment variables
- Check database is running
- Test connection manually

**Error: "API not accessible"**
- Check backend logs
- Verify CORS settings
- Check network configuration

---

## Rollback Plan

If deployment fails:

1. **Restore Database Backup**
   ```bash
   # Restore from backup
   pg_restore -h host -U user -d database backup.dump
   ```

2. **Revert Docker Images**
   - Use previous image tags
   - Or rebuild from previous commit

3. **Review Logs**
   - Check application logs
   - Review migration output
   - Check database logs

---

## Success Criteria

Deployment is successful when:

- ✅ Docker images pushed to Docker Hub
- ✅ Database migration completed without errors
- ✅ Production environment updated
- ✅ Application accessible and functional
- ✅ All features working correctly
- ✅ System verification passes
- ✅ Test quote generated successfully

---

## Next Steps After Deployment

1. **Monitor Application**
   - Check logs regularly
   - Monitor performance
   - Watch for errors

2. **User Testing**
   - Have users test the system
   - Gather feedback
   - Address any issues

3. **Documentation**
   - Update deployment docs if needed
   - Document any custom configurations
   - Note any environment-specific settings

---

## Support Resources

- **Project Review:** `PROJECT_REVIEW_AND_DEPLOYMENT.md`
- **Migration Guide:** `PRODUCTION_DB_MIGRATION.md`
- **Deployment Docs:** `DEPLOYMENT.md`, `QUICK_DEPLOY.md`
- **System Verification:** `backend/app/scripts/system_verification.py`

---

**Ready to Deploy!** 🚀

Follow the steps above in order. If you encounter any issues, refer to the troubleshooting section or review the detailed documentation.




