# Database Migration Guide: MySQL to PostgreSQL

## Overview

This guide provides step-by-step instructions for migrating the 小小读书郎 (xiaoxiao-dushulang) application from MySQL to PostgreSQL with safe-mode validation and rollback capabilities.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Architecture](#migration-architecture)
3. [Pre-Migration Steps](#pre-migration-steps)
4. [Migration Process](#migration-process)
5. [Post-Migration Validation](#post-migration-validation)
6. [Rollback Procedures](#rollback-procedures)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Software Requirements

- Node.js ≥ 20.0.0
- MySQL 8.0+ (source database)
- PostgreSQL 13+ (target database)
- npm packages: `pg`, `mysql2`, `sequelize`

### Environment Setup

1. **Install PostgreSQL dependency:**
   ```bash
   npm install pg
   ```

2. **Environment Variables:**
   Create `.env` file with both MySQL and PostgreSQL configurations:
   ```env
   # MySQL Configuration (source)
   DB_HOST=localhost
   DB_PORT=3308
   DB_USER=root
   DB_PASS=yourpassword
   DB_NAME=xiaoxiao_dushulang

   # PostgreSQL Configuration (target)
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=postgres
   PG_PASSWORD=yourpassword
   PG_DB_NAME=xiaoxiao_dushulang
   ```

3. **Database Permissions:**
   Ensure your database users have:
   - MySQL: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP`
   - PostgreSQL: `CONNECT`, `CREATE`, `USAGE`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`

## Migration Architecture

### Key Components

1. **Migration Scripts:**
   - `scripts/migrate-postgresql.js` - PostgreSQL schema creation
   - `scripts/data-migration.js` - Data migration utility
   - `scripts/switch-database.js` - Configuration switching
   - `scripts/rollback-migration.js` - Rollback procedures

2. **Configuration Files:**
   - `models/index-postgresql.js` - PostgreSQL-optimized models
   - `tests/migration-validation.test.js` - Comprehensive validation tests

3. **Safe Mode Features:**
   - Automatic backups before migration
   - Data validation at each step
   - Rollback capabilities
   - Error recovery procedures

## Pre-Migration Steps

### 1. Database Assessment

```bash
# Check current MySQL database status
npm run db:status

# Validate MySQL connection
node scripts/switch-database.js validate mysql
```

### 2. Create Backups

```bash
# Create MySQL backup
node scripts/rollback-migration.js backup-mysql

# Verify backup
node scripts/rollback-migration.js list-backups
```

### 3. PostgreSQL Setup

```bash
# Create PostgreSQL database and schema
npm run db:migrate:postgresql

# Validate PostgreSQL setup
node scripts/migrate-postgresql.js --validate
```

## Migration Process

### Phase 1: Schema Migration

1. **Create PostgreSQL Schema:**
   ```bash
   npm run db:migrate:postgresql
   ```

2. **Verify Schema:**
   ```bash
   node scripts/migrate-postgresql.js --validate
   ```

### Phase 2: Data Migration

1. **Dry Run (Validation Only):**
   ```bash
   npm run db:migrate:data -- --validate-only
   ```

2. **Full Data Migration:**
   ```bash
   npm run db:migrate:data -- --batch-size=1000
   ```

3. **Monitor Progress:**
   The migration utility provides real-time progress updates:
   ```
   [2023-12-25T10:00:00.000Z] Starting migration for table: users
   [2023-12-25T10:00:01.000Z] Total rows to migrate from users: 150
   [2023-12-25T10:00:02.000Z] Migrated 150/150 rows from users
   [2023-12-25T10:00:03.000Z] ✅ Completed migration for users: 150 rows
   ```

### Phase 3: Application Configuration

1. **Switch to PostgreSQL:**
   ```bash
   npm run db:switch postgresql
   ```

2. **Verify Configuration:**
   ```bash
   npm run db:status
   ```

### Phase 4: Testing

1. **Run Migration Tests:**
   ```bash
   npm test -- tests/migration-validation.test.js
   ```

2. **Start Application:**
   ```bash
   npm run dev
   ```

## Post-Migration Validation

### Data Integrity Checks

1. **Row Count Validation:**
   ```bash
   node scripts/data-migration.js --validate-only
   ```

2. **Functional Testing:**
   ```bash
   # Run full test suite
   npm test

   # Run E2E tests
   npm run test:e2e
   ```

3. **Performance Validation:**
   ```bash
   # Check query performance
   node -e "
   const { postgresqlUtils } = require('./models/index-postgresql');
   postgresqlUtils.analyzePerformance().then(console.log);
   "
   ```

### Health Checks

```bash
# Application health check
curl http://localhost:9005/health

# Database health check
node -e "
const { healthCheck } = require('./models/index-postgresql');
healthCheck().then(console.log);
"
```

## Rollback Procedures

### Emergency Rollback to MySQL

```bash
# Quick rollback (with backup)
node scripts/rollback-migration.js mysql
```

### Controlled Rollback

1. **Create PostgreSQL Backup:**
   ```bash
   node scripts/rollback-migration.js backup-postgresql
   ```

2. **Switch Configuration:**
   ```bash
   npm run db:switch mysql
   ```

3. **Validate MySQL:**
   ```bash
   npm run db:validate mysql
   ```

### Restore from Backup

```bash
# List available backups
node scripts/rollback-migration.js list-backups

# Restore specific backup
node scripts/rollback-migration.js restore /path/to/backup.json postgresql
```

## Performance Optimization

### PostgreSQL-Specific Optimizations

1. **Enable Advanced Features:**
   ```bash
   node -e "
   const { initializePostgreSQLFeatures } = require('./models/index-postgresql');
   initializePostgreSQLFeatures().then(() => console.log('Features initialized'));
   "
   ```

2. **JSONB Indexing:**
   Automatically created during migration:
   - Full-text search on Chinese content
   - GIN indexes for JSON fields
   - Optimized character lookup indexes

3. **Materialized Views:**
   ```sql
   -- User progress analytics (auto-created)
   SELECT * FROM user_progress_summary;
   
   -- Character learning analytics (auto-created)
   SELECT * FROM character_analytics;
   ```

### Monitoring

1. **Query Performance:**
   ```bash
   node -e "
   const { postgresqlUtils } = require('./models/index-postgresql');
   postgresqlUtils.analyzePerformance().then(console.log);
   "
   ```

2. **Refresh Analytics:**
   ```bash
   node -e "
   const { postgresqlUtils } = require('./models/index-postgresql');
   postgresqlUtils.refreshViews().then(() => console.log('Views refreshed'));
   "
   ```

## Troubleshooting

### Common Issues

#### 1. Connection Errors

**Problem:** Cannot connect to PostgreSQL
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify configuration
node scripts/switch-database.js validate postgresql
```

#### 2. Character Encoding Issues

**Problem:** Chinese characters display incorrectly

**Solution:**
```sql
-- Verify database encoding
SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = 'xiaoxiao_dushulang';

-- Should return 'UTF8'
```

#### 3. Migration Timeout

**Problem:** Large table migration times out

**Solution:**
```bash
# Use smaller batch size
npm run db:migrate:data -- --batch-size=500

# Or migrate specific tables
node scripts/data-migration.js --table users --batch-size=100
```

#### 4. Foreign Key Violations

**Problem:** Data migration fails due to foreign key constraints

**Solution:**
```bash
# Check for orphaned records in MySQL first
node -e "
const mysql = require('mysql2/promise');
// Add validation queries here
"

# Clean up orphaned data before migration
```

### Validation Failures

#### Data Count Mismatch

**Symptoms:**
```
❌ Migration validation failed - discrepancies found:
  users: MySQL=100, PostgreSQL=95, Diff=5
```

**Investigation:**
```bash
# Check for migration errors
node scripts/data-migration.js --validate-only --verbose

# Compare specific records
node -e "
// Add comparison queries here
"
```

**Resolution:**
```bash
# Re-run migration for specific table
node scripts/data-migration.js --table users --force
```

### Recovery Procedures

#### Complete Migration Failure

1. **Stop Application:**
   ```bash
   npm run docker:stop
   ```

2. **Emergency Rollback:**
   ```bash
   node scripts/rollback-migration.js emergency-restore /path/to/mysql-backup.json mysql
   ```

3. **Verify Recovery:**
   ```bash
   npm run db:validate mysql
   npm run dev
   ```

#### Partial Migration Success

1. **Identify Failed Tables:**
   ```bash
   npm run db:migrate:data -- --validate-only
   ```

2. **Re-migrate Failed Tables:**
   ```bash
   node scripts/data-migration.js --table table_name --force
   ```

3. **Validate and Continue:**
   ```bash
   npm run db:validate postgresql
   ```

## Migration Checklist

### Pre-Migration

- [ ] Environment variables configured
- [ ] PostgreSQL installed and running
- [ ] MySQL backup created
- [ ] Dependencies installed (`npm install`)
- [ ] Database permissions verified

### Migration

- [ ] PostgreSQL schema created
- [ ] Schema validation passed
- [ ] Data migration completed
- [ ] Row count validation passed
- [ ] Application configuration switched
- [ ] Functional tests passed

### Post-Migration

- [ ] Application starts successfully
- [ ] All features working correctly
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Rollback procedures tested
- [ ] Documentation updated

## npm Scripts Reference

```json
{
  "db:migrate:postgresql": "Create PostgreSQL schema",
  "db:migrate:data": "Migrate data from MySQL to PostgreSQL", 
  "db:switch": "Switch database configuration",
  "db:validate": "Validate database connections",
  "db:status": "Show current database status"
}
```

## Best Practices

1. **Always Backup:** Create backups before any migration operation
2. **Test First:** Run validation-only mode before actual migration
3. **Monitor Progress:** Watch logs for any warnings or errors
4. **Validate Everything:** Check data integrity at each step
5. **Plan Rollback:** Have rollback procedures ready and tested
6. **Performance Check:** Validate performance after migration
7. **Team Communication:** Keep stakeholders informed of progress

## Support

For issues not covered in this guide:

1. Check application logs: `tail -f logs/app.log`
2. Review migration logs in the console output
3. Run diagnostic commands: `npm run db:status`
4. Test individual components: `npm test -- --testNamePattern="migration"`

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize PostgreSQL Guide](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql)
- [Node.js pg Module](https://node-postgres.com/)

---

*This migration guide ensures a safe, validated transition from MySQL to PostgreSQL with comprehensive rollback capabilities and performance optimization.*