"""Persistence and authorization boundary for data-only simulations."""

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.models.simulation import SimulationAction, SimulationEvent, SimulationSession, SimulationStatus, SimulationSessionUser, SimulationTeam
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
            "is_pvp": getattr(session, "is_pvp", False), "join_code": getattr(session, "join_code", None),
            "participants": [{"user_id": p.user_id, "team": p.team.value} for p in getattr(session, "participants", [])],
        }

    @staticmethod
    def get_session(db: Session, session_id: str, user: User) -> SimulationSession:
        session = db.query(SimulationSession).filter(SimulationSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Simulation session not found.")
        if user.role == UserRole.STUDENT:
            if getattr(session, "is_pvp", False):
                participant = db.query(SimulationSessionUser).filter_by(session_id=session.id, user_id=user.id).first()
                if not participant and session.student_id != user.id:
                    raise HTTPException(status_code=403, detail="You do not have access to this PvP session.")
            elif session.student_id != user.id:
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

    @classmethod
    def start_pvp(cls, db: Session, scenario_slug: str, time_limit: int | None, team_choice: str, student: User) -> SimulationSession:
        import string; import random
        join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        session = SimulationSession(
            scenario_slug=scenario_slug, student_id=student.id, state=initial_state(),
            is_pvp=True, join_code=join_code, time_limit_minutes=time_limit
        )
        db.add(session); db.flush()
        
        team = SimulationTeam.RED if team_choice.upper() == "RED" else SimulationTeam.BLUE
        db.add(SimulationSessionUser(session_id=session.id, user_id=student.id, team=team))
        db.add(SimulationEvent(session_id=session.id, event_type="SESSION_STARTED", severity="INFO", description=f"PvP session started. Code: {join_code}", detected="true"))
        db.commit(); db.refresh(session)
        return session

    @classmethod
    def join_pvp(cls, db: Session, join_code: str, team_choice: str, student: User) -> SimulationSession:
        session = db.query(SimulationSession).filter(SimulationSession.join_code == join_code).first()
        if not session or not session.is_pvp:
            raise HTTPException(status_code=404, detail="PvP session not found or invalid join code.")
        if session.status != SimulationStatus.RUNNING:
            raise HTTPException(status_code=409, detail="This PvP session is no longer running.")
            
        team = SimulationTeam.RED if team_choice.upper() == "RED" else SimulationTeam.BLUE
        current_members = db.query(SimulationSessionUser).filter_by(session_id=session.id, team=team).count()
        if current_members >= 5:
            raise HTTPException(status_code=400, detail=f"The {team.value} team is full (max 5 members).")
            
        existing = db.query(SimulationSessionUser).filter_by(session_id=session.id, user_id=student.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="You are already in this session.")
            
        db.add(SimulationSessionUser(session_id=session.id, user_id=student.id, team=team))
        db.add(SimulationEvent(session_id=session.id, event_type="PLAYER_JOINED", severity="INFO", description=f"A player joined the {team.value} team.", detected="true"))
        db.commit(); db.refresh(session)
        return session

    @classmethod
    def create_flag(cls, db: Session, session: SimulationSession, content: str, path: str, user: User) -> SimulationSession:
        participant = db.query(SimulationSessionUser).filter_by(session_id=session.id, user_id=user.id).first()
        if not participant or participant.team != SimulationTeam.BLUE:
            raise HTTPException(status_code=403, detail="Only Blue Team can create and hide flags.")
            
        if "pvp_flags" not in session.state:
            session.state["pvp_flags"] = {}
            
        session.state["pvp_flags"][content] = {"path": path, "found": False, "points": 50}
        
        # We need to inject this file into the virtual filesystem
        if "fs" not in session.state:
            session.state["fs"] = {}
        session.state["fs"][path] = {"type": "file", "content": content, "owner": "root", "perms": "644"}
        
        flag_modified(session, "state")
        db.add(SimulationEvent(session_id=session.id, event_type="FLAG_HIDDEN", severity="INFO", description=f"Blue Team hid a flag.", detected="true"))
        db.commit(); db.refresh(session)
        return session

    @classmethod
    def submit_flag(cls, db: Session, session: SimulationSession, content: str, user: User) -> SimulationSession:
        if "pvp_flags" not in session.state or content not in session.state["pvp_flags"]:
            raise HTTPException(status_code=400, detail="Invalid flag.")
            
        flag_info = session.state["pvp_flags"][content]
        if flag_info["found"]:
            raise HTTPException(status_code=400, detail="Flag already submitted.")
            
        flag_info["found"] = True
        session.score += flag_info["points"]
        
        if "discovered_flags" not in session.state:
            session.state["discovered_flags"] = []
        session.state["discovered_flags"].append(content)
        
        flag_modified(session, "state")
        db.add(SimulationEvent(session_id=session.id, event_type="FLAG_DISCOVERED", severity="INFO", description="Red Team submitted a valid flag!", detected="true"))
        db.commit(); db.refresh(session)
        return session
