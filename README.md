# Horizon IT - Local VM Installation Copy

Standalone IT Project Management tool optimized for local virtual machine deployment (up to 20 users).

## 🚀 Independent Deployment
This version is fully decoupled from Supabase. It uses a local PostgreSQL instance running via Docker.

## 🛠️ Installation Guide

### Prerequisites
- Docker and Docker Compose installed on the VM.
- Access to the terminal.

### Step 1: Clone or Copy
Copy this entire directory to your VM.

### Step 2: Configure Environment
The `.env` file is pre-configured for Docker. You generally don't need to change anything unless you want to update the database password.

### Step 3: Launch
Run the following command in the root directory:
```bash
docker-compose up -d --build
```

### Step 4: Initialize Database
Wait about 10 seconds for the database to start, then run:
```bash
docker-compose exec app npx prisma db push
```

## 📋 Features
- **Local PostgreSQL**: Data stays on your VM.
- **Resource Efficient**: Optimized for 2-4GB RAM VMs.
- **20 Users Capacity**: Pre-configured connection pooling for 20 concurrent users.

## 📖 Detailed Guide
See [VM_INSTALL_GUIDE.md](./VM_INSTALL_GUIDE.md) for advanced configuration and performance tuning.
