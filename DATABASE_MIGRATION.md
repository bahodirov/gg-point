# Database Migration Guide: JSON to PostgreSQL

This guide provides step-by-step instructions for migrating from JSON file storage to PostgreSQL database.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Migration Process](#migration-process)
- [Post-Migration Validation](#post-migration-validation)
- [Rollback Procedure](#rollback-procedure)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- PostgreSQL 12 or higher
- Node.js 18 or higher
- At least 1GB free disk space
- Backup of existing data

### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### Create Database and User

Connect to PostgreSQL:
```bash
sudo -u postgres psql
```

Create database and user:
```sql
CREATE DATABASE ggpoint;
CREATE USER ggpoint_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ggpoint TO ggpoint_user;
\q
```

## Pre-Migration Checklist

- [ ] **Backup existing data**
  ```bash
  mkdir -p backups
  cp -r data/ backups/data-$(date +%Y%m%d-%H%M%S)
  ```

- [ ] **Stop the application** (if running)
  ```bash
  # If using PM2
  pm2 stop ggpoint
  
  # Or if running directly
  # Press Ctrl+C to stop the server
  ```

- [ ] **Verify PostgreSQL is running**
  ```bash
  sudo systemctl status postgresql
  # or
  psql -U postgres -c "SELECT version();"
  ```

- [ ] **Create .env file** (copy from .env.example)
  ```bash
  cp .env.example .env
  ```

- [ ] **Configure database connection** in `.env`
  ```env
  # Option 1: Connection string (recommended)
  DATABASE_URL=postgresql://ggpoint_user:your_secure_password@localhost:5432/ggpoint
  
  # Option 2: Individual settings
  # DB_HOST=localhost
  # DB_PORT=5432
  # DB_NAME=ggpoint
  # DB_USER=ggpoint_user
  # DB_PASSWORD=your_secure_password
  ```

- [ ] **Set other required environment variables**
  ```env
  SESSION_SECRET=generate-a-random-32-character-string-here
  NODE_ENV=production
  PORT=4000
  ```

## Migration Process

### Step 1: Test Database Connection

Before migration, test that your database connection works:

```bash
npm run build:ssr
node -e "
  import('./dist/ggpoint/server/server.mjs').then(() => {
    console.log('Database connection test successful!');
    process.exit(0);
  }).catch(err => {
    console.error('Connection test failed:', err);
    process.exit(1);
  });
"
```

### Step 2: Run Migration Script

The migration will automatically run when you start the server with PostgreSQL configured:

```bash
npm run serve:ssr:ggpoint
```

The migration script will:
1. Create all necessary tables and indexes
2. Migrate existing users from `data/users.json`
3. Migrate existing products from `data/products-db.json` or `data/products.ts`
4. Create default admin user if no users exist
5. Validate data integrity

### Step 3: Monitor Migration Progress

Watch the console output for migration progress:

```
=== Starting PostgreSQL Migration ===

Testing PostgreSQL connection...
✓ Connection test successful

Step 1: Initializing database schema...
✓ Schema initialized

Step 2: Migrating users...
✓ Migrated 1 users

Step 3: Migrating products...
✓ Migrated 45 products

Step 4: Validating migration...
✓ Users in PostgreSQL: 1
✓ Products in PostgreSQL: 45
✓ Sample user query successful: admin
✓ Sample product query successful: Product Name
✓ Validation complete

=== PostgreSQL Migration Completed Successfully ===
```

## Post-Migration Validation

### 1. Verify Data Count

Connect to PostgreSQL and check data:

```bash
psql -U ggpoint_user -d ggpoint
```

```sql
-- Check users
SELECT COUNT(*) as user_count FROM users;

-- Check products
SELECT COUNT(*) as product_count FROM products;

-- Check sample data
SELECT username, role FROM users;
SELECT slug, name_ru, price FROM products LIMIT 5;

\q
```

### 2. Test Application

1. **Start the application:**
   ```bash
   npm run serve:ssr:ggpoint
   ```

2. **Test login:**
   - Navigate to `http://localhost:4000/admin`
   - Login with credentials (default: admin / admin123)
   - Verify you can access the admin panel

3. **Test product CRUD:**
   - List all products
   - View a single product
   - Create a new product
   - Update a product
   - Delete a product

4. **Test image upload** (if using PostgreSQL):
   - Upload a product image
   - Verify optimization and thumbnail generation
   - Delete an image

### 3. Performance Check

Compare response times before and after migration:

```bash
# Test API response time
time curl http://localhost:4000/api/products
```

## Rollback Procedure

If you need to rollback to JSON storage:

### Option 1: Remove PostgreSQL Configuration

1. **Stop the application**
   ```bash
   pm2 stop ggpoint
   ```

2. **Remove or comment out DATABASE_URL** in `.env`:
   ```env
   # DATABASE_URL=postgresql://...
   ```

3. **Restore backup data** (if needed):
   ```bash
   cp -r backups/data-YYYYMMDD-HHMMSS/* data/
   ```

4. **Restart application:**
   ```bash
   npm run serve:ssr:ggpoint
   ```

The application will automatically fall back to JSON file storage.

### Option 2: Drop PostgreSQL Tables

If you want to start fresh:

```bash
psql -U ggpoint_user -d ggpoint
```

```sql
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS uploaded_images CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Connection Refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check PostgreSQL is listening: `sudo netstat -plunt | grep 5432`
- Start PostgreSQL: `sudo systemctl start postgresql`

#### 2. Authentication Failed

**Error:**
```
Error: password authentication failed for user "ggpoint_user"
```

**Solution:**
- Verify password in `.env` matches database
- Check PostgreSQL `pg_hba.conf` authentication method
- Grant proper privileges:
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE ggpoint TO ggpoint_user;
  ```

#### 3. Permission Denied

**Error:**
```
Error: permission denied for table users
```

**Solution:**
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ggpoint_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ggpoint_user;
```

#### 4. Migration Fails Midway

**Solution:**
1. Check error message in console
2. Connect to database and check what was migrated:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM products;
   ```
3. If partial migration, drop tables and retry:
   ```sql
   DROP TABLE IF EXISTS users CASCADE;
   DROP TABLE IF EXISTS products CASCADE;
   DROP TABLE IF EXISTS sessions CASCADE;
   ```
4. Restart application to retry migration

#### 5. Duplicate Key Error

**Error:**
```
Error: duplicate key value violates unique constraint
```

**Solution:**
- Data was already migrated
- Check existing data in PostgreSQL
- If you want to re-migrate, drop tables first
- Or skip migration by keeping existing data

#### 6. JSON Parsing Errors

**Error:**
```
Error: Unexpected token in JSON
```

**Solution:**
- Check JSON files for syntax errors
- Validate JSON:
  ```bash
  cat data/users.json | jq .
  cat data/products-db.json | jq .
  ```
- Fix any JSON syntax issues

### Performance Issues

If experiencing slow queries:

1. **Check indexes:**
   ```sql
   SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';
   ```

2. **Analyze tables:**
   ```sql
   ANALYZE users;
   ANALYZE products;
   ANALYZE sessions;
   ```

3. **Monitor slow queries:**
   ```sql
   -- Enable logging in postgresql.conf
   log_min_duration_statement = 1000  # Log queries taking > 1 second
   ```

### Getting Help

If you encounter issues not covered here:

1. Check application logs
2. Check PostgreSQL logs: `/var/log/postgresql/postgresql-*.log`
3. Review environment variables in `.env`
4. Consult [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Best Practices

### Security
- Use strong passwords for database users
- Change default admin password immediately after migration
- Keep `.env` file secure (never commit to git)
- Use SSL for PostgreSQL connections in production

### Backup
- Schedule regular database backups:
  ```bash
  pg_dump -U ggpoint_user ggpoint > backup-$(date +%Y%m%d).sql
  ```
- Keep JSON files as backup until migration is fully validated
- Test restore procedures

### Monitoring
- Monitor database disk usage
- Set up query performance monitoring
- Track connection pool metrics
- Monitor error rates

### Maintenance
- Run `VACUUM ANALYZE` periodically:
  ```sql
  VACUUM ANALYZE;
  ```
- Update statistics regularly
- Archive old audit logs
- Monitor and clean expired sessions

## Next Steps

After successful migration:
1. Update deployment scripts to include PostgreSQL
2. Set up database backups
3. Configure monitoring and alerts
4. Document any custom configurations
5. Train team on new database operations
