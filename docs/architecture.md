# SecArena Architecture

SecArena consists of a React/Vite client, a FastAPI API, and PostgreSQL persistence.

## Core flow

```
Browser → FastAPI authentication/RBAC → SimulationService
        → whitelist parser → virtual scenario state (JSON)
        → action, detection, score, and timeline records → PostgreSQL
```

Existing `Lab` records remain instructor-authored learning blueprints and `TrainingEvent` records remain instructor-managed cohorts. Simulations are separate student sessions so a scenario can evolve independently of catalogue content.

## Simulation module

- `app/simulation/scenarios.py`: declarative virtual hosts, users, services, files, objectives, and scoring metadata.
- `app/simulation/parser.py`: tokenizes only supported input; it has no shell expansion or execution.
- `app/simulation/engine.py`: evaluates commands against virtual data only.
- `app/simulation/detection.py` and `scoring.py`: server-side rules.
- `SimulationSession`, `SimulationAction`, and `SimulationEvent`: persisted student-owned records.

The first scenario is **Linux Reconnaissance — Beginner**. It exposes virtual `web01` with virtual SSH/HTTP service metadata and a hidden virtual flag. The flag is only returned after the virtual file is read in a session.
