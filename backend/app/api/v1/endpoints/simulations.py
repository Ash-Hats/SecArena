"""Authenticated API for safe, browser-based cybersecurity simulations."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.models.simulation import SimulationEvent, SimulationSession
from app.models.user import User, UserRole
from app.schemas.simulation import (ScenarioResponse, SimulationActionRequest, SimulationActionResponse,
    SimulationEventResponse, SimulationSessionResponse, SimulationStartRequest,
    PvpCreateRequest, PvpJoinRequest, PvpCreateFlagRequest)
from app.services.simulation import SimulationService
from app.simulation.scenarios import SCENARIOS, public_scenario

router = APIRouter()


@router.get("/scenarios", response_model=List[ScenarioResponse])
def list_scenarios(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.custom_command import CustomCommand
    custom_cmds = [cc.command_name for cc in db.query(CustomCommand).all()]
    scenarios = []
    for item in SCENARIOS.values():
        pub = public_scenario(item)
        pub["supported_commands"] = pub.get("supported_commands", []) + custom_cmds
        scenarios.append(pub)
    return scenarios


@router.get("", response_model=List[SimulationSessionResponse])
def list_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(SimulationSession).order_by(SimulationSession.started_at.desc())
    if current_user.role == UserRole.STUDENT:
        query = query.filter(SimulationSession.student_id == current_user.id)
    return [SimulationService.response(item, str(current_user.id)) for item in query.all()]


@router.post("/start", response_model=SimulationSessionResponse)
def start_session(payload: SimulationStartRequest, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    return SimulationService.response(SimulationService.start(db, payload.scenario_slug, current_user), str(current_user.id))


@router.get("/{session_id}", response_model=SimulationSessionResponse)
def get_session(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SimulationService.response(SimulationService.get_session(db, session_id, current_user), str(current_user.id))


@router.post("/{session_id}/action", response_model=SimulationActionResponse)
def run_action(session_id: str, payload: SimulationActionRequest, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    session = SimulationService.get_session(db, session_id, current_user)
    result, events = SimulationService.action(db, session, payload.input, current_user)
    return {"success": result["success"], "command": result["command"], "output": result["output"], "score_contribution": result["score"], "session": SimulationService.response(session, str(current_user.id)), "detections": events}


@router.post("/{session_id}/stop", response_model=SimulationSessionResponse)
def stop_session(session_id: str, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    session = SimulationService.get_session(db, session_id, current_user)
    return SimulationService.response(SimulationService.stop(db, session), str(current_user.id))


@router.post("/{session_id}/leave")
def leave_session(session_id: str, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    SimulationService.leave_session(db, session_id, current_user)
    return {"status": "left"}


@router.get("/{session_id}/timeline", response_model=List[SimulationEventResponse])
def timeline(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    SimulationService.get_session(db, session_id, current_user)
    return db.query(SimulationEvent).filter(SimulationEvent.session_id == session_id).order_by(SimulationEvent.created_at.asc()).all()


@router.get("/{session_id}/score", response_model=SimulationSessionResponse)
def score(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SimulationService.response(SimulationService.get_session(db, session_id, current_user), str(current_user.id))


@router.get("/{session_id}/state", response_model=SimulationSessionResponse)
def state(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SimulationService.response(SimulationService.get_session(db, session_id, current_user), str(current_user.id))

@router.get("/pvp/public-lobbies", response_model=List[SimulationSessionResponse])
def get_public_lobbies(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.simulation import SimulationStatus
    query = db.query(SimulationSession).filter(
        SimulationSession.is_pvp == True,
        SimulationSession.status == SimulationStatus.RUNNING
    ).order_by(SimulationSession.started_at.desc())
    return [SimulationService.response(item, str(current_user.id)) for item in query.all()]

@router.get("/pvp/history", response_model=List[SimulationSessionResponse])
def get_pvp_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.simulation import SimulationSessionUser, SimulationStatus
    query = db.query(SimulationSession).join(SimulationSessionUser).filter(
        SimulationSession.is_pvp == True,
        SimulationSessionUser.user_id == current_user.id
    ).order_by(SimulationSession.started_at.desc())
    return [SimulationService.response(item, str(current_user.id)) for item in query.all()]

@router.post("/pvp/create", response_model=SimulationSessionResponse)
def create_pvp(payload: PvpCreateRequest, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    session = SimulationService.start_pvp(db, payload.scenario_slug, payload.time_limit_minutes, payload.team_choice, payload.lobby_name, current_user, payload.flag_format)
    return SimulationService.response(session, str(current_user.id))


@router.post("/pvp/join", response_model=SimulationSessionResponse)
def join_pvp_session(payload: PvpJoinRequest, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    return SimulationService.response(SimulationService.join_pvp(db, payload.join_code, payload.team_choice, current_user), str(current_user.id))


@router.post("/{session_id}/create_flag", response_model=SimulationSessionResponse)
def create_pvp_flag(session_id: str, payload: PvpCreateFlagRequest, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    session = SimulationService.get_session(db, session_id, current_user)
    return SimulationService.response(SimulationService.create_flag(db, session, payload.flag_content, payload.flag_path, current_user), str(current_user.id))


@router.post("/{session_id}/submit_flag", response_model=SimulationSessionResponse)
def submit_pvp_flag(session_id: str, payload: PvpCreateFlagRequest, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    # Re-using PvpCreateFlagRequest just for flag_content field
    session = SimulationService.get_session(db, session_id, current_user)
    return SimulationService.response(SimulationService.submit_flag(db, session, payload.flag_content, current_user), str(current_user.id))
