# 🚀 Horizon IT Management Suite

**A high-performance, local-first IT ticketing and asset management system built for engineering teams.**

Horizon IT is designed to bridge the gap between complex enterprise IT tools and minimalist productivity apps. It offers a premium, intelligence-driven interface with instant responsiveness, optimized for local deployment.

---

## ✨ Key Features (Redesign v2.0)

- **Premium Design System**: A high-fidelity dark-mode interface with glassmorphism, custom typography, and a refined color palette.
- **Dynamic Density System**: Switch between **Compact**, **Comfortable**, or **Spacious** UI modes to match your workflow.
- **Intelligence Dashboard**: Real-time KPI tracking, volume trends, and priority distribution analytics.
- **SLA Watch**: Dedicated surveillance of service level commitments with real-time countdowns and urgency grouping.
- **Integrated UI Feedback**: Replaced intrusive `alert()` and `window.confirm()` calls with a custom **Toast** system and inline confirmation patterns for a seamless experience.
- **Slide-over Ticket Details**: A non-disruptive, right-side panel for ticket management including AI-assisted triage and mention-based commenting.
- **Virtualized List View**: High-performance ticket table powered by `@tanstack/react-virtual` for handling large datasets smoothly.
- **Streamlined Workflow**: Kanban boards with status-based borders, magic triage actions, and integrated checklist management.
- **Standalone Public Portal**: A dedicated, distraction-free interface for users to submit requests without needing an account.

---

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
| **Sync DB Client** | `npx prisma generate` |

---

## 📦 Architecture

- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion
- **Logic**: TypeScript, Lucide Icons, Date-fns
- **Performance**: High-speed virtualization (@tanstack/react-virtual)
- **Database**: PostgreSQL (Dockerized) via Prisma ORM
- **State Management**: React Context (Density, Auth)
- **Authentication**: Local JWT with HttpOnly cookie security
- **Email**: Nodemailer integration for P0 notifications
- **Storage**: Local filesystem mapping for attachments

---

**Developed by Anurag Mallick** &bull; [GitHub](https://github.com/anurag-mallick) &bull; [LinkedIn](https://www.linkedin.com/in/anuragmallick901/)
