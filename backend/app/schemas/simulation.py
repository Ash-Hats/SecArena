from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field
from app.models.simulation import SimulationTeam


class SimulationStartRequest(BaseModel):
    scenario_slug: str = "linux-reconnaissance-beginner"


class SimulationActionRequest(BaseModel):
    input: str = Field(min_length=1, max_length=500)


class PvpCreateRequest(BaseModel):
    scenario_slug: str = "linux-reconnaissance-beginner"
    time_limit_minutes: int | None = None
    team_choice: str = "RED" # RED or BLUE
    lobby_name: str = "PvP Match"
    flag_format: str = "SEC_ARENA{...}"


class PvpJoinRequest(BaseModel):
    join_code: str
    team_choice: str = "RED" # RED or BLUE


class PvpCreateFlagRequest(BaseModel):
    flag_content: str
    flag_path: str


class ScenarioResponse(BaseModel):
    slug: str; title: str; difficulty: str; objective: str; host: str
    services: list[dict[str, Any]]; supported_commands: list[str]


class SimulationEventResponse(BaseModel):
    event_type: str; severity: str; description: str; detected: str; created_at: datetime
    model_config = {"from_attributes": True}


class ParticipantResponse(BaseModel):
    user_id: str
    username: str | None = None
    team: SimulationTeam
    is_approved: bool
    model_config = {"from_attributes": True}


class SimulationSessionResponse(BaseModel):
    id: str; scenario_slug: str; status: str; score: int; progress: int
    started_at: datetime; completed_at: datetime | None; stopped_at: datetime | None
    cwd: str; discovered_flags: list[Any]
    pvp_flags: dict[str, Any] = {}
    is_pvp: bool = False
    join_code: str | None = None
    lobby_name: str | None = None
    flag_format: str = "SEC_ARENA{...}"
    student_id: str | None = None
    supported_commands: list[str] = []
    terminal_history: list[dict[str, Any]] = []
    participants: list[ParticipantResponse] = []
    model_config = {"from_attributes": True}


class SimulationActionResponse(BaseModel):
    success: bool; command: str; output: str; score_contribution: int
    session: SimulationSessionResponse; detections: list[SimulationEventResponse]
