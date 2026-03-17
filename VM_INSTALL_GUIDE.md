# Horizon IT - VM Deployment & Performance Guide

This guide provides deep-dive instructions for system administrators deploying Horizon IT on local virtual machines or bare-metal servers.

## 🛡️ Security Hardening

### Environment Variables
Ensure your `.env` file contains strong secrets:
- `JWT_SECRET`: Generate a 64-character random string.
- `POSTGRES_PASSWORD`: Use a complex alphanumeric string.
- `NODE_ENV`: Should always be `production` for VM deployment.

### File Permissions
The application stores uploads in `/app/uploads`. In Docker, this is mapped to the `uploads-data` volume. Ensure the Docker daemon has write permissions to the volume destination on the host if using bind mounts.

## 🚀 Performance Tuning (20+ Users)

### Resource Allocation
Suggested VM specs for optimal performance:
- **CPU**: 2 vCPUs (Intel/AMD or ARM64).
- **RAM**: 4GB.
- **Disk**: 20GB SSD (scaled based on attachment volume).

### Database Optimization
The included `docker-compose.yml` uses the standard `postgres:17-alpine` image. For higher loads, consider adding a custom `postgresql.conf` via volumes:
```yaml
services:
  db:
    volumes:
      - ./my-postgres.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

## 📂 Data Persistence & Backups

### Volumes
1. **`db-data`**: Stores the entire PostgreSQL database.
2. **`uploads-data`**: Stores all ticket attachments and assets.

### Manual Backup
To backup the database while running:
```bash
docker-compose exec db pg_dump -U postgres horizon_it > backup_$(date +%F).sql
```

## 🔄 Updates & Migrations
When pulling a new version from GitHub:
1. `git pull origin main`
2. `docker-compose up -d --build`
The `entrypoint.sh` script automatically detects schema changes and applies them via `prisma db push`.

---

## ❓ Troubleshooting
- **Database Connection**: Ensure the `DATABASE_URL` uses `db` as the hostname inside Docker.
- **Auth Errors**: If users can't log in, verify `JWT_SECRET` hasn't changed between restarts.
- **Upload Failures**: Check if the `uploads/` directory inside the container is writable.
