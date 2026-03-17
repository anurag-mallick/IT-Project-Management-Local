## 🚀 Quick Start (Local PC)

These steps are optimized for running the application directly on your local machine using Docker for the database.

### 1. Prerequisites
- **Node.js 20+**
- **Docker Desktop** (must be running)

### 2. Setup Configuration
Clone the repository and create your environment file:
```bash
cp .env.example .env
```
Edit `.env` and ensure `DATABASE_URL` and `DIRECT_URL` point to `localhost:5432`.

### 3. Launch
```bash
# Install dependencies
npm install

# Start the database container
docker-compose up -d db

# Sync database schema
npx prisma db push

# Seed the database (Admin Account & Policies)
node scripts/seed-pg.js

# Start Development Server
npm run dev
```

### 4. Access
- **Web UI**: [http://localhost:3000](http://localhost:3000)
- **Admin Email**: `admin@horizon-it.local`
- **Admin Password**: `AdminPassword123!`

---

## 🛠️ Management Commands

| Action | Command |
| :--- | :--- |
| **Reset Database** | `docker-compose down -v && docker-compose up -d db` |
| **Push Schema** | `npx prisma db push` |
| **Run Seed** | `node scripts/seed-pg.js` |

---

## 📦 Architecture
- **Framework**: Next.js 15 (Standardized API Routes)
- **Database**: PostgreSQL (Docker-based)
- **Auth**: Local JWT (HttpOnly Cookies)
- **Storage**: Local File System (under `/uploads`)
- **Real-time**: Intelligent Polling System
