"""Authenticated API for safe, browser-based cybersecurity simulations."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.models.simulation import SimulationEvent, SimulationSession
from app.models.user import User, UserRole
from app.schemas.simulation import (ScenarioResponse, SimulationActionRequest, SimulationActionResponse,
    SimulationEventResponse, SimulationSessionResponse, SimulationStartRequest)
from app.services.simulation import SimulationService
from app.simulation.scenarios import SCENARIOS, public_scenario

router = APIRouter()


@router.get("/scenarios", response_model=List[ScenarioResponse])
def list_scenarios(current_user: User = Depends(get_current_user)):
    return [public_scenario(item) for item in SCENARIOS.values()]


@router.get("", response_model=List[SimulationSessionResponse])
def list_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(SimulationSession).order_by(SimulationSession.started_at.desc())
    if current_user.role == UserRole.STUDENT:
        query = query.filter(SimulationSession.student_id == current_user.id)
    return [SimulationService.response(item) for item in query.all()]


@router.post("/start", response_model=SimulationSessionResponse)
def start_session(payload: SimulationStartRequest, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    return SimulationService.response(SimulationService.start(db, payload.scenario_slug, current_user))


@router.get("/{session_id}", response_model=SimulationSessionResponse)
def get_session(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SimulationService.response(SimulationService.get_session(db, session_id, current_user))


@router.post("/{session_id}/action", response_model=SimulationActionResponse)
def run_action(session_id: str, payload: SimulationActionRequest, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    session = SimulationService.get_session(db, session_id, current_user)
    result, events = SimulationService.action(db, session, payload.input)
    return {"success": result["success"], "command": result["command"], "output": result["output"], "score_contribution": result["score"], "session": SimulationService.response(session), "detections": events}


@router.post("/{session_id}/stop", response_model=SimulationSessionResponse)
def stop_session(session_id: str, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    session = SimulationService.get_session(db, session_id, current_user)
    return SimulationService.response(SimulationService.stop(db, session))


@router.get("/{session_id}/timeline", response_model=List[SimulationEventResponse])
def timeline(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    SimulationService.get_session(db, session_id, current_user)
    return db.query(SimulationEvent).filter(SimulationEvent.session_id == session_id).order_by(SimulationEvent.created_at.asc()).all()


@router.get("/{session_id}/score", response_model=SimulationSessionResponse)
def score(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SimulationService.response(SimulationService.get_session(db, session_id, current_user))


@router.get("/{session_id}/state", response_model=SimulationSessionResponse)
def state(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SimulationService.response(SimulationService.get_session(db, session_id, current_user))
