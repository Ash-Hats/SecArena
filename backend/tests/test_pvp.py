import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
from app.models.simulation import SimulationSession

def test_pvp_lifecycle(client: TestClient, db, student_user, student_token, instructor_user, instructor_token):
    # Phase 1: Blue Team (Student 1) Creates PvP Match
    headers1 = {"Authorization": f"Bearer {student_token}"}
    res_create = client.post(
        "/api/v1/simulations/pvp/create",
        headers=headers1,
        json={"scenario_slug": "linux-reconnaissance-beginner", "team_choice": "BLUE", "time_limit_minutes": 1}
    )
    assert res_create.status_code == 200
    session_data = res_create.json()
    assert session_data["is_pvp"] is True
    assert session_data["join_code"] is not None
    session_id = session_data["id"]
    join_code = session_data["join_code"]

    # Let's create a second student manually to simulate Red Team
    res_register = client.post("/api/v1/auth/register", json={
        "username": "red_student", "email": "red@example.com", "password": "Password123!", "role": "student"
    })
    assert res_register.status_code == 201
    res_login = client.post("/api/v1/auth/login", json={
        "username_or_email": "red_student", "password": "Password123!"
    })
    red_token = res_login.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {red_token}"}

    # Phase 2: Red Team Joins PvP Match
    res_join = client.post(
        "/api/v1/simulations/pvp/join",
        headers=headers2,
        json={"join_code": join_code, "team_choice": "RED"}
    )
    assert res_join.status_code == 200
    join_data = res_join.json()
    assert join_data["id"] == session_id
    assert len(join_data["participants"]) >= 2
    red_user_id = next(participant["user_id"] for participant in join_data["participants"] if participant["team"] == "RED")

    # Phase 3: Blue Team Hides Flag
    res_hide = client.post(
        f"/api/v1/simulations/{session_id}/create_flag",
        headers=headers1,
        json={"flag_content": "SEC_ARENA{super_secret}", "flag_path": "/opt/secret.txt"}
    )
    assert res_hide.status_code == 200
    # API state must expose only opaque scoreboard metadata, never the flag.
    assert "SEC_ARENA{super_secret}" not in str(res_hide.json())

    blue_hide = client.post(
        f"/api/v1/simulations/{session_id}/action",
        headers=headers1,
        json={"input": "hideflag /tmp/history SEC_ARENA{history_secret}"},
    )
    assert blue_hide.status_code == 200
    assert "SEC_ARENA{history_secret}" not in str(blue_hide.json()["session"]["terminal_history"])

    # Team-specific endpoints and the terminal command enforce the same rule.
    assert client.post(f"/api/v1/simulations/{session_id}/submit_flag", headers=headers1,
                       json={"flag_content": "SEC_ARENA{super_secret}", "flag_path": ""}).status_code == 403
    assert client.post(f"/api/v1/simulations/{session_id}/create_flag", headers=headers2,
                       json={"flag_content": "SEC_ARENA{other}", "flag_path": "/tmp/other"}).status_code == 403
    hide_attempt = client.post(f"/api/v1/simulations/{session_id}/action", headers=headers2,
                               json={"input": "hideflag /tmp/nope SEC_ARENA{other}"})
    assert hide_attempt.status_code == 200
    assert "permission denied" in hide_attempt.json()["output"]

    # Red Team checks timeline (Timeline is shared)
    res_timeline = client.get(f"/api/v1/simulations/{session_id}/timeline", headers=headers2)
    timeline = res_timeline.json()
    assert any("Blue Team hid a flag" in e["description"] for e in timeline)

    # Red Team runs cat /opt/secret.txt
    res_action = client.post(
        f"/api/v1/simulations/{session_id}/action",
        headers=headers2,
        json={"input": "cat /opt/secret.txt"}
    )
    assert res_action.status_code == 200
    action_data = res_action.json()
    assert "SEC_ARENA{super_secret}" in action_data["output"]

    # Phase 4: Red Team Submits Flag
    res_submit = client.post(
        f"/api/v1/simulations/{session_id}/submit_flag",
        headers=headers2,
        json={"flag_content": "SEC_ARENA{super_secret}", "flag_path": ""}
    )
    assert res_submit.status_code == 200
    submit_data = res_submit.json()
    assert "SEC_ARENA{super_secret}" not in str(submit_data)

    assert client.post(f"/api/v1/simulations/{session_id}/submit_flag", headers=headers2,
                       json={"flag_content": "SEC_ARENA{super_secret}", "flag_path": ""}).status_code == 400

    session = db.get(SimulationSession, session_id)
    session.started_at = datetime.now(timezone.utc) - timedelta(minutes=2)
    db.commit()
    assert client.post(f"/api/v1/simulations/{session_id}/action", headers=headers2,
                       json={"input": "pwd"}).status_code == 409
    assert client.post(f"/api/v1/simulations/pvp/{session_id}/approve/{red_user_id}", headers=headers1).status_code == 409
    assert client.post(f"/api/v1/simulations/pvp/{session_id}/reject/{red_user_id}", headers=headers1).status_code == 409
    assert client.post(f"/api/v1/simulations/{session_id}/leave", headers=headers2).status_code == 409

    # Timeline should show discovery
    res_timeline_final = client.get(f"/api/v1/simulations/{session_id}/timeline", headers=headers2)
    timeline_final = res_timeline_final.json()
    assert any("(Red Team) submitted a valid flag!" in e["description"] for e in timeline_final)
