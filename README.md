# Horizon IT - Local VM Edition

A fully standalone, high-performance IT Project Management tool designed for secure, air-gapped, or local VM deployments. 

> [!IMPORTANT]
> This version is **100% Supabase-free**. All data, authentication, and file storage are managed locally on your infrastructure.

## 🚀 Quick Start (Docker)

### 1. Prerequisites
- **Docker** and **Docker Compose** installed.
- Minimum **2GB RAM** (4GB recommended).

### 2. Setup Configuration
Clone the repository and create your environment file:
```bash
cp .env.example .env
```
Edit `.env` and set secure values for `POSTGRES_PASSWORD` and `JWT_SECRET`.

### 3. Launch
```bash
docker-compose up -d --build
```
The application will automatically:
- Start a local PostgreSQL 17 instance.
- Build the Next.js application.
- Run database migrations via Prisma.
- Initialize local file storage volumes.

### 4. Access
- **Web UI**: `http://<your-vm-ip>:3000`
- **Default Login**: Use the `create-admin` script (see below) or seed the database.

---

## 🛠️ Management Commands

| Action | Command |
| :--- | :--- |
| **Create Admin** | `docker-compose exec app npm run create-admin` |
| **Seed Demo Data** | `docker-compose exec app npm run seed` |
| **View Logs** | `docker-compose logs -f app` |
| **Stop App** | `docker-compose down` |

---

## 📦 Architecture
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Local)
- **Auth**: Local JWT (HttpOnly Cookies) + bcryptjs
- **Storage**: Local Disk (with Docker Volume persistence)
- **Real-time**: Intelligent Polling (No external sockets required)

## 📖 Deployment Guide
For advanced configuration, performance tuning, and SSL setup, refer to the [VM_INSTALL_GUIDE.md](./VM_INSTALL_GUIDE.md).
