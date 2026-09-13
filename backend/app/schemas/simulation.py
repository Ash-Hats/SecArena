from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class SimulationStartRequest(BaseModel):
    scenario_slug: str = "linux-reconnaissance-beginner"


class SimulationActionRequest(BaseModel):
    input: str = Field(min_length=1, max_length=500)


class PvpCreateRequest(BaseModel):
    scenario_slug: str = "linux-reconnaissance-beginner"
    time_limit_minutes: int | None = None
    team_choice: str = "RED" # RED or BLUE


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
    team: str

class SimulationSessionResponse(BaseModel):
    id: str; scenario_slug: str; status: str; score: int; progress: int
    started_at: datetime; completed_at: datetime | None; stopped_at: datetime | None
    cwd: str; discovered_flags: list[str]
    is_pvp: bool = False
    join_code: str | None = None
    participants: list[ParticipantResponse] = []
    model_config = {"from_attributes": True}


class SimulationActionResponse(BaseModel):
    success: bool; command: str; output: str; score_contribution: int
    session: SimulationSessionResponse; detections: list[SimulationEventResponse]
