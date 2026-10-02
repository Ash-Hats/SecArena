"""Persistence and authorization boundary for data-only simulations."""

from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.models.custom_command import CustomCommand
from app.models.simulation import SimulationAction, SimulationEvent, SimulationSession, SimulationStatus, SimulationSessionUser, SimulationTeam
from app.models.user import User, UserRole
from app.simulation.detection import detect
from app.simulation.engine import execute, initial_state
from app.simulation.scenarios import SCENARIOS


class SimulationService:
    @staticmethod
    def history_input(session: SimulationSession, action_input: str) -> str:
        """Keep PvP command history useful without retaining hidden flag values."""
        parts = action_input.strip().split(maxsplit=2)
        if session.is_pvp and parts and parts[0] == "hideflag":
            path = parts[1] if len(parts) > 1 else ""
            return f"hideflag {path} [REDACTED]".strip()
        return action_input

    @staticmethod
    def response(session: SimulationSession, user_id: str = None) -> dict:
        user_states = session.state.get("user_states", {})
        user_cwd = user_states.get(user_id, {}).get("cwd") if user_id else None
        cwd = user_cwd if user_cwd is not None else session.state.get("cwd", "/")
        
        terminal_history = session.state.get("terminal_history", [])
        if user_id:
            terminal_history = [h for h in terminal_history if h.get("user_id") == user_id]
            
        is_pvp = bool(getattr(session, "is_pvp", False))
        pvp_flags = session.state.get("pvp_flags", {})
        
        participants_data = [{"user_id": str(p.user_id), "username": p.user.username if p.user else "Unknown", "team": p.team.value, "is_approved": getattr(p, "is_approved", False)} for p in getattr(session, "participants", [])]
        is_blue = False
        if is_pvp and user_id:
            is_blue = any(p["user_id"] == str(user_id) and p["team"] == "BLUE" for p in participants_data)

        if is_pvp:
            if is_blue:
                public_flags = pvp_flags
            else:
                public_flags = {
                    f"flag_{index + 1}": {"found": bool(flag.get("found")), "points": flag.get("points", 0)}
                    for index, flag in enumerate(pvp_flags.values())
                }
        else:
            public_flags = {}

        discovered_flags = session.state.get("discovered_flags", [])
        return {
            "id": session.id, "scenario_slug": session.scenario_slug, "status": session.status.value,
            "score": session.score, "progress": session.progress, "started_at": session.started_at,
            "completed_at": session.completed_at, "stopped_at": session.stopped_at,
            "cwd": cwd, "discovered_flags": discovered_flags,
            "pvp_flags": public_flags,
            "is_pvp": is_pvp, "join_code": getattr(session, "join_code", None),
            "lobby_name": session.state.get("lobby_name", None),
            "supported_commands": SCENARIOS.get(session.scenario_slug, {}).get("supported_commands", []),
            "student_id": session.student_id,
            "terminal_history": terminal_history,
            "participants": participants_data,
        }

    @staticmethod
    def ensure_pvp_active(db: Session, session: SimulationSession) -> None:
        """Apply the persisted PvP deadline before a protected operation."""
        if not session.is_pvp or not session.time_limit_minutes:
            return
        now = datetime.now(timezone.utc)
        started_at = session.started_at
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        if now >= started_at + timedelta(minutes=session.time_limit_minutes):
            if session.status == SimulationStatus.RUNNING:
                session.status = SimulationStatus.STOPPED
                session.stopped_at = now
                db.add(SimulationEvent(session_id=session.id, event_type="SESSION_EXPIRED", severity="INFO", description="PvP session time limit expired.", detected=True))
                db.commit()
                db.refresh(session)
            raise HTTPException(status_code=409, detail="This PvP session has expired.")

    @classmethod
    def get_session(cls, db: Session, session_id: str, user: User, require_approved: bool = False) -> SimulationSession:
        session = db.query(SimulationSession).filter(SimulationSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Simulation session not found.")
        if user.role == UserRole.STUDENT:
            if getattr(session, "is_pvp", False):
                participant = db.query(SimulationSessionUser).filter_by(session_id=session.id, user_id=user.id).first()
                if not participant and session.student_id != user.id:
                    raise HTTPException(status_code=403, detail="You do not have access to this PvP session.")
                if require_approved and participant and not participant.is_approved:
                    raise HTTPException(status_code=403, detail="You are not approved to perform actions in this room.")
            elif session.student_id != user.id:
                raise HTTPException(status_code=403, detail="You do not have access to this simulation session.")
        return session

    @classmethod
    def start(cls, db: Session, scenario_slug: str, student: User) -> SimulationSession:
        if scenario_slug not in SCENARIOS:
            raise HTTPException(status_code=404, detail="Simulation scenario not found.")
            
        scenario = SCENARIOS.get(scenario_slug, {})
        files = scenario.get("files", {})
        
        state = initial_state()
        from app.simulation.vfs import VirtualFileSystem
        vfs = VirtualFileSystem(files)
        state["vfs"] = vfs.fs
        
        session = SimulationSession(scenario_slug=scenario_slug, student_id=student.id, state=state)
        db.add(session); db.flush()
        db.add(SimulationEvent(session_id=session.id, event_type="SESSION_STARTED", severity="INFO", description="Simulation session started.", detected=True))
        db.commit(); db.refresh(session)
        return session

    @classmethod
    def action(cls, db: Session, session: SimulationSession, action_input: str, user: User) -> tuple[dict, list[SimulationEvent]]:
        cls.ensure_pvp_active(db, session)
        if session.status != SimulationStatus.RUNNING:
            raise HTTPException(status_code=409, detail="This simulation session is no longer running.")
            
        custom_commands = {}
        for cc in db.query(CustomCommand).all():
            custom_commands[cc.command_name] = {
                "output": cc.output,
                "is_real_execution": cc.is_real_execution
            }
            
        scenario = SCENARIOS.get(session.scenario_slug, {})
        supported_commands = scenario.get("supported_commands", [])
            
        is_pvp = getattr(session, "is_pvp", False)
        participant = None
        if is_pvp:
            participant = db.query(SimulationSessionUser).filter_by(session_id=session.id, user_id=user.id).first()
        result = execute(
            session.state, action_input, custom_commands, supported_commands, is_pvp,
            user_id=str(user.id), allow_hideflag=bool(participant and participant.team == SimulationTeam.BLUE),
        )
        if "terminal_history" not in session.state:
            session.state["terminal_history"] = []
        session.state["terminal_history"].append({"user": user.username, "user_id": str(user.id), "command": cls.history_input(session, action_input), "output": result.get("output", "")})
        flag_modified(session, "state")
        if not result["success"]:
            if not is_pvp or (participant and participant.team == SimulationTeam.RED):
                result["score"] = -2
        session.score = max(0, session.score + result["score"])

        if result["flag_found"]:
            session.status = SimulationStatus.COMPLETED; session.completed_at = datetime.now(timezone.utc); session.progress = 100
        else:
            session.progress = min(90, len(session.state.get("completed_rules", [])) * 20)
        db.add(SimulationAction(session_id=session.id, action_input=action_input, command=result["command"], success=result["success"], result=result["output"], score_contribution=result["score"]))
        events: list[SimulationEvent] = []
        detection = detect(result["command"])
        if detection:
            event = SimulationEvent(session_id=session.id, event_type=detection[0], severity=detection[1], description=detection[2], detected=True)
            db.add(event); events.append(event)
        if result["flag_found"]:
            event = SimulationEvent(session_id=session.id, event_type="FLAG_DISCOVERED", severity="INFO", description="Scenario flag discovered; simulation completed.", detected=True)
            db.add(event); events.append(event)
        db.commit(); db.refresh(session)
        for event in events: db.refresh(event)
        return result, events

    @staticmethod
    def stop(db: Session, session: SimulationSession) -> SimulationSession:
        if session.status == SimulationStatus.RUNNING:
            session.status = SimulationStatus.STOPPED; session.stopped_at = datetime.now(timezone.utc)
            db.add(SimulationEvent(session_id=session.id, event_type="SESSION_STOPPED", severity="INFO", description="Simulation session stopped.", detected=True))
            db.commit(); db.refresh(session)
        return session

    @classmethod
    def start_pvp(cls, db: Session, scenario_slug: str, time_limit: int | None, team_choice: str, lobby_name: str, student: User, flag_format: str = "SEC_ARENA{...}") -> SimulationSession:
        import string; import random
        join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        if scenario_slug not in SCENARIOS:
            raise HTTPException(status_code=404, detail="Simulation scenario not found.")
        if team_choice.upper() not in {"RED", "BLUE"}:
            raise HTTPException(status_code=422, detail="team_choice must be RED or BLUE.")
        if time_limit is not None and time_limit <= 0:
            raise HTTPException(status_code=422, detail="time_limit_minutes must be positive.")
        scenario = SCENARIOS[scenario_slug]
        files = scenario.get("files", {})
        
        state = initial_state()
        state["lobby_name"] = lobby_name
        state["flag_format"] = flag_format
        state["cwd"] = "/home/student"
        
        from app.simulation.vfs import VirtualFileSystem
        vfs = VirtualFileSystem(files)
        state["vfs"] = vfs.fs
        
        session = SimulationSession(
            scenario_slug=scenario_slug, student_id=student.id, state=state,
            is_pvp=True, join_code=join_code, time_limit_minutes=time_limit
        )
        db.add(session); db.flush()
        
        team = SimulationTeam.RED if team_choice.upper() == "RED" else SimulationTeam.BLUE
        db.add(SimulationSessionUser(session_id=session.id, user_id=student.id, team=team, is_approved=True))
        db.add(SimulationEvent(session_id=session.id, event_type="SESSION_STARTED", severity="INFO", description=f"PvP session started. Code: {join_code}", detected=True))
        db.commit(); db.refresh(session)
        return session

    @classmethod
    def join_pvp(cls, db: Session, join_code: str, team_choice: str, student: User) -> SimulationSession:
        session = db.query(SimulationSession).filter(SimulationSession.join_code == join_code).first()
        if not session or not session.is_pvp:
            raise HTTPException(status_code=404, detail="PvP session not found or invalid join code.")
        cls.ensure_pvp_active(db, session)
        if session.status != SimulationStatus.RUNNING:
            raise HTTPException(status_code=409, detail="This PvP session is no longer running.")
            
        if team_choice.upper() not in {"RED", "BLUE"}:
            raise HTTPException(status_code=422, detail="team_choice must be RED or BLUE.")
        team = SimulationTeam.RED if team_choice.upper() == "RED" else SimulationTeam.BLUE
        current_members = db.query(SimulationSessionUser).filter_by(session_id=session.id, team=team).count()
        if current_members >= 5:
            raise HTTPException(status_code=400, detail=f"The {team.value} team is full (max 5 members).")
            
        existing = db.query(SimulationSessionUser).filter_by(session_id=session.id, user_id=student.id).first()
        if existing:
            return session
            
        db.add(SimulationSessionUser(session_id=session.id, user_id=student.id, team=team))
        db.add(SimulationEvent(session_id=session.id, event_type="PLAYER_JOINED", severity="INFO", description=f"A player joined the {team.value} team.", detected=True))
        db.commit(); db.refresh(session)
        return session

    @classmethod
    def leave_session(cls, db: Session, session_id: str, student: User):
        session = db.query(SimulationSession).filter_by(id=session_id).first()
        if session:
            cls.ensure_pvp_active(db, session)
        participant = db.query(SimulationSessionUser).filter_by(session_id=session_id, user_id=student.id).first()
        if participant:
            db.delete(participant)
            db.add(SimulationEvent(session_id=session_id, event_type="PLAYER_LEFT", severity="INFO", description=f"A player left the {participant.team.value} team.", detected="true"))
            db.commit()

    @classmethod
    def approve_join(cls, db: Session, session_id: str, target_user_id: str, current_user: User):
        session = db.query(SimulationSession).filter_by(id=session_id).first()
        if not session or session.student_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the host can approve members.")
        cls.ensure_pvp_active(db, session)
            
        participant = db.query(SimulationSessionUser).filter_by(session_id=session_id, user_id=target_user_id).first()
        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found.")
            
        participant.is_approved = True
        db.commit()
        return session

    @classmethod
    def reject_join(cls, db: Session, session_id: str, target_user_id: str, current_user: User):
        session = db.query(SimulationSession).filter_by(id=session_id).first()
        if not session or session.student_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the host can reject members.")
        cls.ensure_pvp_active(db, session)
            
        participant = db.query(SimulationSessionUser).filter_by(session_id=session_id, user_id=target_user_id).first()
        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found.")
            
        db.delete(participant)
        db.commit()
        return session

    @classmethod
    def create_flag(cls, db: Session, session: SimulationSession, content: str, path: str, user: User) -> SimulationSession:
        if not session.is_pvp:
            raise HTTPException(status_code=400, detail="Flags can only be created in PvP sessions.")
        cls.ensure_pvp_active(db, session)
        participant = db.query(SimulationSessionUser).filter_by(session_id=session.id, user_id=user.id).first()
        if not participant or participant.team != SimulationTeam.BLUE:
            raise HTTPException(status_code=403, detail="Only Blue Team can create and hide flags.")
            
        flag_format = session.state.get("flag_format", "SEC_ARENA{...}")
        if "..." in flag_format:
            prefix, suffix = flag_format.split("...", 1)
            if not content.startswith(prefix) or not content.endswith(suffix) or len(content) <= len(prefix) + len(suffix):
                raise HTTPException(status_code=400, detail=f"Flag does not match the required format: {flag_format}")

        if "pvp_flags" not in session.state:
            session.state["pvp_flags"] = {}
            
        session.state["pvp_flags"][content] = {"path": path, "found": False, "points": 50, "hidden_by": user.username}
        
        if "vfs" not in session.state:
            session.state["vfs"] = {}
        
        from app.simulation.vfs import VirtualFileSystem
        vfs = VirtualFileSystem()
        vfs.fs = session.state["vfs"]
        vfs.write_file(path, content)
        session.state["vfs"] = vfs.fs
        
        flag_modified(session, "state")
        db.add(SimulationEvent(session_id=session.id, event_type="FLAG_HIDDEN", severity="INFO", description="Blue Team hid a flag.", detected=True))
        db.commit(); db.refresh(session)
        return session

    @classmethod
    def submit_flag(cls, db: Session, session: SimulationSession, content: str, user: User) -> SimulationSession:
        if not session.is_pvp:
            raise HTTPException(status_code=400, detail="Flags can only be submitted in PvP sessions.")
        cls.ensure_pvp_active(db, session)
        participant = db.query(SimulationSessionUser).filter_by(session_id=session.id, user_id=user.id).first()
        if not participant or participant.team != SimulationTeam.RED:
            raise HTTPException(status_code=403, detail="Only Red Team can submit flags.")
        if "pvp_flags" not in session.state or content not in session.state["pvp_flags"]:
            raise HTTPException(status_code=400, detail="Invalid flag.")
            
        flag_info = session.state["pvp_flags"][content]
        if flag_info["found"]:
            raise HTTPException(status_code=400, detail="Flag already submitted.")
            
        flag_info["found"] = True
        flag_info["found_by"] = user.username
        session.score += flag_info["points"]
        
        if "discovered_flags" not in session.state:
            session.state["discovered_flags"] = []
        session.state["discovered_flags"].append({"flag": content, "discovered_by": user.username})
        
        flag_modified(session, "state")
        db.add(SimulationEvent(session_id=session.id, event_type="FLAG_DISCOVERED", severity="INFO", description=f"{user.username} (Red Team) submitted a valid flag!", detected=True))
        db.commit(); db.refresh(session)
        return session
