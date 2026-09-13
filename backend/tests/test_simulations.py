"""Integration tests for the data-only simulation boundary."""


def _start(client, student_headers):
    response = client.post("/api/v1/simulations/start", headers=student_headers, json={"scenario_slug": "linux-reconnaissance-beginner"})
    assert response.status_code == 200
    return response.json()["id"]


def _action(client, student_headers, session_id, command):
    return client.post(f"/api/v1/simulations/{session_id}/action", headers=student_headers, json={"input": command})


def test_student_can_start_safe_simulation(client, student_headers):
    session_id = _start(client, student_headers)
    response = client.get(f"/api/v1/simulations/{session_id}", headers=student_headers)
    assert response.status_code == 200
    assert response.json()["cwd"] == "/home/student"


def test_virtual_terminal_commands_and_flag(client, student_headers):
    session_id = _start(client, student_headers)
    assert _action(client, student_headers, session_id, "pwd").json()["output"] == "/home/student"
    assert "readme.txt" in _action(client, student_headers, session_id, "ls").json()["output"]
    assert _action(client, student_headers, session_id, "cd /opt").status_code == 200
    assert "analyst" in _action(client, student_headers, session_id, "cat /etc/passwd").json()["output"]
    assert "/opt/secret/flag.txt" in _action(client, student_headers, session_id, "find / -name flag.txt").json()["output"]
    flag = _action(client, student_headers, session_id, "cat /opt/secret/flag.txt").json()
    assert flag["session"]["status"] == "COMPLETED"
    assert "SEC_ARENA{linux_recon_complete}" in flag["session"]["discovered_flags"]
    assert flag["session"]["score"] == 95


def test_unsupported_command_is_not_executed(client, student_headers):
    session_id = _start(client, student_headers)
    response = _action(client, student_headers, session_id, "uname -a")
    assert response.status_code == 200
    assert response.json()["output"] == "Command not supported in this simulation."
    assert response.json()["score_contribution"] == -2


def test_session_ownership_and_stop(client, student_headers, instructor_headers):
    session_id = _start(client, student_headers)
    # Instructors may review; a different student is never allowed by the service.
    assert client.get(f"/api/v1/simulations/{session_id}", headers=instructor_headers).status_code == 200
    stopped = client.post(f"/api/v1/simulations/{session_id}/stop", headers=student_headers)
    assert stopped.status_code == 200
    assert stopped.json()["status"] == "STOPPED"
    assert _action(client, student_headers, session_id, "pwd").status_code == 409


def test_timeline_and_detection(client, student_headers):
    session_id = _start(client, student_headers)
    _action(client, student_headers, session_id, "find / -name flag.txt")
    timeline = client.get(f"/api/v1/simulations/{session_id}/timeline", headers=student_headers).json()
    assert any(event["event_type"] == "FILE_ENUMERATION" for event in timeline)
