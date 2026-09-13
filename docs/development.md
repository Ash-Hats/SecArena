# SecArena Developer Guide

## Prerequisites

- Python 3.12+
- Node.js 20+ and npm 10+
- PostgreSQL 16+ (local or managed)

## Run locally

Copy `.env.example` to `.env`, set a valid PostgreSQL `DATABASE_URL`, and use a boolean value for `DEBUG` (`True` or `False`).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

The API is at `http://localhost:8000/docs`; the frontend is at `http://localhost:5173`.

## Simulation safety

The simulator uses a strict parser and declarative scenario data. Do not add process execution, shell execution, real filesystem access, sockets, or dynamic code execution to simulation code. Extend virtual scenarios and parser rules instead.

## Tests

```bash
cd backend
.venv/bin/pytest -v
```
