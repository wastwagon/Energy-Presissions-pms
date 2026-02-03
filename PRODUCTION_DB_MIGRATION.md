# Production Database Migration Guide

This guide will help you migrate your Energy Precision PMS database to production.

## Prerequisites

1. **Production PostgreSQL Database** - Already created and accessible
2. **Database Credentials** - Host, port, user, password, database name
3. **Network Access** - Ability to connect to production database from your machine
4. **Backup** - Always backup your production database before migration

## Migration Steps

### Step 1: Prepare Credentials

You can provide credentials in two ways:

#### Option A: Environment Variables (Recommended)

```bash
export PROD_POSTGRES_HOST=your-production-host.com
export PROD_POSTGRES_PORT=5432
export PROD_POSTGRES_USER=your_username
export PROD_POSTGRES_PASSWORD=your_password
export PROD_POSTGRES_DB=your_database_name
```

#### Option B: Command-Line Arguments

```bash
python -m app.scripts.migrate_production_db \
    --host your-production-host.com \
    --port 5432 \
    --user your_username \
    --password your_password \
    --database your_database_name
```

### Step 2: Test Connection

First, verify you can connect to the production database:

```bash
python -m app.scripts.migrate_production_db --verify-only \
    --host <host> --user <user> --password <password> --database <database>
```

This will:
- ✅ Test database connection
- ✅ List existing tables
- ✅ Verify schema
- ✅ Show table row counts

**No changes will be made** in verify-only mode.

### Step 3: Run Migration

Once connection is verified, run the full migration:

```bash
# Using environment variables
python -m app.scripts.migrate_production_db

# Or using command-line arguments
python -m app.scripts.migrate_production_db \
    --host <host> --user <user> --password <password> --database <database>
```

### Step 4: Verify Migration

The script will:
1. ✅ Test database connection
2. ✅ Check existing tables
3. ✅ Run Alembic migrations (creates/updates schema)
4. ✅ Verify all expected tables exist
5. ✅ Initialize default settings
6. ✅ Initialize peak sun hours data
7. ✅ Display database statistics

## What Gets Migrated

### Schema Migration
- All database tables are created/updated via Alembic migrations
- Includes: users, customers, projects, appliances, sizing_results, quotes, quote_items, products, settings, peak_sun_hours

### Default Data
- **Settings**: System configuration (sizing factors, pricing defaults, etc.)
- **Peak Sun Hours**: Location-specific solar data for Ghana cities

### Existing Data
- **Preserved**: If tables already exist with data, existing data is preserved
- **Updated**: Settings and peak sun hours are updated if they already exist

## Important Notes

### ⚠️ Safety Features

1. **No Data Deletion**: The migration script does NOT delete existing data
2. **Updates Only**: Settings and peak sun hours are updated, not replaced
3. **Confirmation Required**: If tables exist, you'll be asked to confirm before proceeding

### 🔒 Security

- **Never commit credentials** to version control
- **Use environment variables** or secure credential management
- **Test in staging first** before production migration

### 📊 Database Size

- Small databases (< 1GB): Migration should complete in seconds
- Large databases (> 1GB): May take a few minutes
- Very large databases: Consider running during maintenance window

## Troubleshooting

### Connection Issues

**Error: "Connection refused"**
- Check if database host and port are correct
- Verify firewall rules allow your IP
- Check if database is running

**Error: "Authentication failed"**
- Verify username and password
- Check if user has required permissions
- Ensure database name is correct

### Migration Issues

**Error: "Table already exists"**
- This is normal if migrating to existing database
- The script will update existing tables
- Confirm when prompted

**Error: "Migration failed"**
- Check Alembic migration files are up to date
- Verify database user has CREATE/ALTER permissions
- Review error message for specific issue

### Data Issues

**Settings not updating**
- Settings are updated by key, not replaced
- Check if setting key exists in database
- Verify database commit succeeded

## Post-Migration Checklist

After migration completes:

- [ ] Verify all tables exist
- [ ] Check default settings are initialized
- [ ] Verify peak sun hours data
- [ ] Test application connection
- [ ] Run system verification script
- [ ] Test quote generation
- [ ] Test PDF generation
- [ ] Verify calculations

## Rollback Plan

If migration fails or causes issues:

1. **Restore from Backup**: Restore production database from backup
2. **Review Logs**: Check migration script output for errors
3. **Fix Issues**: Address any identified problems
4. **Re-run Migration**: Once issues are resolved

## Next Steps

After successful migration:

1. **Update Application Environment Variables**
   - Set `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
   - Update in your deployment platform (Render, AWS, etc.)

2. **Test Application**
   - Verify API endpoints work
   - Test frontend connection
   - Generate test quote

3. **Monitor**
   - Check application logs
   - Monitor database performance
   - Verify all functionality

## Support

If you encounter issues:

1. Review the error message carefully
2. Check database connection and permissions
3. Verify all prerequisites are met
4. Review migration script output
5. Check application logs

---

**Remember**: Always backup your production database before running migrations!




