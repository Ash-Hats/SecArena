"""Persistence and authorization boundary for data-only simulations."""

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.models.simulation import SimulationAction, SimulationEvent, SimulationSession, SimulationStatus
from app.models.user import User, UserRole
from app.simulation.detection import detect
from app.simulation.engine import execute, initial_state
from app.simulation.scenarios import SCENARIOS


class SimulationService:
    @staticmethod
    def response(session: SimulationSession) -> dict:
        return {
            "id": session.id, "scenario_slug": session.scenario_slug, "status": session.status.value,
            "score": session.score, "progress": session.progress, "started_at": session.started_at,
            "completed_at": session.completed_at, "stopped_at": session.stopped_at,
            "cwd": session.state.get("cwd", "/"), "discovered_flags": session.state.get("discovered_flags", []),
        }

    @staticmethod
    def get_session(db: Session, session_id: str, user: User) -> SimulationSession:
        session = db.query(SimulationSession).filter(SimulationSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Simulation session not found.")
        if user.role == UserRole.STUDENT and session.student_id != user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this simulation session.")
        return session

    @classmethod
    def start(cls, db: Session, scenario_slug: str, student: User) -> SimulationSession:
        if scenario_slug not in SCENARIOS:
            raise HTTPException(status_code=404, detail="Simulation scenario not found.")
        session = SimulationSession(scenario_slug=scenario_slug, student_id=student.id, state=initial_state())
        db.add(session); db.flush()
        db.add(SimulationEvent(session_id=session.id, event_type="SESSION_STARTED", severity="INFO", description="Simulation session started.", detected="true"))
        db.commit(); db.refresh(session)
        return session

    @classmethod
    def action(cls, db: Session, session: SimulationSession, action_input: str) -> tuple[dict, list[SimulationEvent]]:
        if session.status != SimulationStatus.RUNNING:
            raise HTTPException(status_code=409, detail="This simulation session is no longer running.")
        result = execute(session.state, action_input)
        flag_modified(session, "state")
        if not result["success"]:
            result["score"] = -2
        session.score = max(0, session.score + result["score"])
        if result["flag_found"]:
            session.status = SimulationStatus.COMPLETED; session.completed_at = datetime.now(timezone.utc); session.progress = 100
        else:
            session.progress = min(90, len(session.state.get("completed_rules", [])) * 20)
        db.add(SimulationAction(session_id=session.id, action_input=action_input, command=result["command"], success=str(result["success"]).lower(), result=result["output"], score_contribution=result["score"]))
        events: list[SimulationEvent] = []
        detection = detect(result["command"])
        if detection:
            event = SimulationEvent(session_id=session.id, event_type=detection[0], severity=detection[1], description=detection[2], detected="true")
            db.add(event); events.append(event)
        if result["flag_found"]:
            event = SimulationEvent(session_id=session.id, event_type="FLAG_DISCOVERED", severity="INFO", description="Scenario flag discovered; simulation completed.", detected="true")
            db.add(event); events.append(event)
        db.commit(); db.refresh(session)
        for event in events: db.refresh(event)
        return result, events

    @staticmethod
    def stop(db: Session, session: SimulationSession) -> SimulationSession:
        if session.status == SimulationStatus.RUNNING:
            session.status = SimulationStatus.STOPPED; session.stopped_at = datetime.now(timezone.utc)
            db.add(SimulationEvent(session_id=session.id, event_type="SESSION_STOPPED", severity="INFO", description="Simulation session stopped.", detected="true"))
            db.commit(); db.refresh(session)
        return session
