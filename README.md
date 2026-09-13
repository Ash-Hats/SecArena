# SecArena — Learn. Attack. Detect. Defend.

SecArena is a browser-based cybersecurity attack-simulation and defense-training platform. It models virtual hosts, files, users, services, actions, detections, flags, scores, and timelines entirely as application data.

No scenario starts a vulnerable machine, executes a shell command, reads the host filesystem, scans a network, or runs arbitrary code.

## Current capabilities

- FastAPI, React/Vite/TypeScript, and PostgreSQL application stack.
- JWT authentication, Argon2id password hashing, and Student/Instructor/Admin RBAC.
- Student and instructor dashboards, lab blueprint management, and training events.
- A safe Linux Reconnaissance simulation with virtual `web01`, a command whitelist, simulated detections, scoring, timeline, and protected flag discovery.

## Architecture

```
Student → SecArena web app → simulation engine → virtual scenario state
        → action parser → detection + scoring → timeline + feedback
```

The action parser accepts only documented simulated commands. It interprets them against scenario dictionaries stored in the application/database; it never invokes the operating system or network.

## Local development

Prerequisites: Python 3.12+, Node.js 20+, and a PostgreSQL database.

```bash
cp .env.example .env
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend
.venv/bin/pytest -v
```

## Security boundary

Simulation commands are never sent to a shell. The backend owns session state, scoring, detection events, and flags; clients cannot submit their own scores or reveal undiscovered flags.
