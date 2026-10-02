# SecArena — Learn. Attack. Detect. Defend.

**Live Demo:** [https://sec-arena.vercel.app](https://sec-arena.vercel.app)

SecArena is a web-based **cyber range and attack simulation platform**. It provides isolated, intentionally vulnerable lab environments where students can practice authorized attacks, study defensive detection, complete challenges, and measure their progress. 

Think of it as a **flight simulator for cybersecurity**. It allows users to practice cyber attacks and defense entirely in their web browser without needing to download anything or risk real computers.

---

## 🎯 The Problem & The Solution

**The Problem:** Traditional cybersecurity learning is too theoretical. Setting up vulnerable machines for practice is hard for beginners and risky for institutions.

**The Solution:** SecArena provides a 100% safe, pre-built, browser-based environment that is isolated, repeatable, and measurable. No complicated lab setup—just open the browser and start learning.

---

## ⚔️ One Platform, Two Perspectives

SecArena supports both major perspectives of cybersecurity:

- 🔴 **Red Team (Attack):** Focuses on offensive tactics. Understand the environment (Reconnaissance), identify potential vulnerabilities, perform authorized exploitation inside the simulation, and capture digital flags to earn points.
- 🔵 **Blue Team (Defense):** Focuses on defensive tactics. Observe live system activity, detect suspicious behavior and anomalies, investigate incident logs, and understand how to deploy defensive responses.

---

## 🚀 Features & Capabilities

- **Zero-Infrastructure Setup:** Browser-based access with ready-to-use challenges.
- **Application-Level Isolation:** All actions happen inside a simulated Virtual Filesystem (VFS). There is zero direct execution of commands on the real operating system.
- **Gamified Learning (CTF):** Solve challenges to discover hidden flags and earn points based on difficulty (Beginner to Expert).
- **PvP Command Center:** Instructors get a real-time, God-mode view of Red Team vs. Blue Team activity, turning training into a live observable competition.
- **Role-Based Access Control:** Dedicated dashboards for Students (practice and track progress) and Instructors (monitor and guide).

---

## 🏗️ Architecture & Technology Stack

```
Student Browser → React + TypeScript Frontend
                        ↓
                 Python + FastAPI Backend
                   ↙            ↘
        PostgreSQL Database   Application-Level Virtual Filesystem (Simulation Engine)
```

- **Frontend:** React + TypeScript + Vite (Interactive UI)
- **Backend:** Python + FastAPI (Application logic & APIs)
- **Database:** PostgreSQL (Stores users, labs, and scores)
- **Simulation:** Custom Application-Level Virtual Filesystem (Processes only whitelisted simulated commands).

*Note: Simulation commands are never sent to a shell. The backend owns session state, scoring, detection events, and flags. Clients cannot submit their own scores or reveal undiscovered flags.*

---

## 🎮 How to Play (Modes)

1. **Sign Up / Log In:** Create a free student account to access the dashboard.
2. **Simulator (Solo Mode):** Practice your terminal skills in standalone scenarios. Use standard simulated Linux commands (`ls`, `cd`, `cat`, `find`) to navigate the virtual filesystem, identify vulnerabilities, and capture the `SEC_ARENA{...}` flag.
3. **PvP Mode (Multiplayer):** Join or create a real-time multiplayer room using a Join Code.
   - **Blue Team:** Hide flags securely within the filesystem using the `hideflag` command.
   - **Red Team:** Search the filesystem to discover flags hidden by the Blue team and submit them to score points.

---

## 🛠️ Local Development

**Prerequisites:** Python 3.12+, Node.js 20+, and a PostgreSQL database.

### Backend Setup
```bash
cp .env.example .env
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Tests

```bash
cd backend
.venv/bin/pytest -v
```

---
*Created by Shivani Barskar & Rohit Soni | Guided by Vijay Mandle*
