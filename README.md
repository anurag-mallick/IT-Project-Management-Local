# 🚀 Horizon IT Management Suite

**A high-performance, local-first IT ticketing and asset management system built for engineering teams.**

Horizon IT is designed to bridge the gap between complex enterprise IT tools and minimalist productivity apps. It offers a premium, intelligence-driven interface with instant responsiveness, optimized for local deployment.

---

## ✨ Premium Features (v2.0)

### 🎨 State-of-the-Art UI/UX
- **Glassmorphism Aesthetics:** Modern, sleek interface with blurred backdrops and vibrant gradients for a premium feel.
- **Dynamic Density System:** Switch between **Compact**, **Comfortable**, or **Spacious** UI modes instantly.
- **Micro-Animations:** Fluid transitions and state changes powered by Framer Motion.
- **Virtualized Lists:** High-performance ticket tables powered by `@tanstack/react-virtual` for handling massive datasets.
- **Integrated Feedback System:** Custom Toast notifications and inline confirmation patterns replace browser defaults.

### 🎫 Intelligent Service Desk
- **SLA Watch:** Real-time surveillance of service level commitments with urgency grouping and countdowns.
- **Omnichannel Workflow:** Manage tickets via Kanban boards, Virtualized Lists, or Slide-over detail panels.
- **Checklist Management:** Break down complex resolutions into actionable, trackable tasks.
- **Automated Triage:** AI-ready triage fields and mention-based commenting for team collaboration.

### 📧 Advanced Email Infrastructure
- **Unified Email Settings UI:** A dedicated, secure interface (Admin Only) to manage SMTP and IMAP credentials.
- **Automated Email-to-Ticket Conversion:** Integrated IMAP polling logic to automatically create tickets from incoming support emails.
- **Self-Hosted SMTP/IMAP:** Complete control over your data with direct integration into your private email infrastructure.

## Installation

### Windows (VM or Desktop)
Open **PowerShell as Administrator** and run:
```powershell
irm https://raw.githubusercontent.com/anurag-mallick/IT-Project-Management-Local/main/install.ps1 | iex
```

### Linux & macOS
Open your **Terminal** and run:
```bash
curl -sSL https://raw.githubusercontent.com/anurag-mallick/IT-Project-Management-Local/main/install.sh | bash
```

The installers will handle prerequisite checks, auto-install missing dependencies (Git, Node.js, PostgreSQL/Docker), clone the repository, and set up your admin account automatically.

---

## What the Installer Does
1. Ask whether you want Docker or Native (direct PostgreSQL) installation
2. Install all required components automatically
3. Set up the database and create your admin account
4. Print your team's access URL, admin email, and admin password
5. Configure the app to start automatically on boot (using Windows Service or PM2)

**Requirements:**
- **Windows**: 10/11 or Windows Server 2019+ (PowerShell 5.1+)
- **macOS**: Catalina 10.15+ (Homebrew recommended)
- **Linux**: Ubuntu 20.04+, Debian 11+, or Fedora 38+

## Uninstall

**Windows**:
```powershell
powershell -File uninstall.ps1
```

**Linux & macOS**:
```bash
bash uninstall.sh
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
- **Outbound Email**: Nodemailer integration for notifications and alerts
- **Inbound Email**: ImapFlow integration for automated ticket polling
- **Storage**: Local filesystem mapping for attachments

---

**Developed by Anurag Mallick** &bull; [GitHub](https://github.com/anurag-mallick) &bull; [LinkedIn](https://www.linkedin.com/in/anuragmallick901/)
