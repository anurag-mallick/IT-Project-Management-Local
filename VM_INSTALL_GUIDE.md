# Horizon IT - Local VM Installation Guide (20 Users)

This version is pre-configured for deployment on a local VM using Docker.

## Setup Instructions

1. **Install Docker & Docker Compose** on your VM.
2. **Copy this directory** to the VM.
3. **Environment setup**: The `.env` is pre-configured for the internal Docker network.
4. **Deploy**:
   ```bash
   docker-compose up -d --build
   ```
5. **Database Initialization**:
   ```bash
   docker-compose exec app npx prisma db push
   ```

## Performance for 20 Users
The default PostgreSQL settings and Node.js resources are sufficient for 20 concurrent users. 
- **Recommended VM Specs**: 2 vCPU, 4GB RAM.
- **Internal Network**: The app communicates with the DB over `db:5432`.
