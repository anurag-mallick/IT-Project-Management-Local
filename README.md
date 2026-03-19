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

## Installation (Windows VM)

Open **PowerShell as Administrator** and run:

```powershell
irm https://raw.githubusercontent.com/anurag-mallick/IT-Project-Management-Local/main/install.ps1 | iex
```

The installer will:
1. Ask whether you want Docker or Native (direct PostgreSQL) installation
2. Install all required components automatically
3. Set up the database and create your admin account
4. Print your team's access URL, admin email, and admin password
5. Configure the app to start automatically on boot

**Requirements:**
- Windows 10/11 or Windows Server 2019+
- PowerShell 5.1+ (run as Administrator)
- Git (installed automatically if missing)
- Node.js 18+ (installed automatically if missing)
- For Docker mode: Docker Desktop ([download](https://www.docker.com/products/docker-desktop))
- For Native mode: PostgreSQL 16 (installed automatically)

## Uninstall

```powershell
powershell -File uninstall.ps1
```

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
