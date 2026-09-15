"""Declarative scenario definitions. These records never map to host resources."""

LINUX_RECON = {
    "slug": "linux-reconnaissance-beginner",
    "title": "Linux Reconnaissance — Beginner",
    "difficulty": "EASY",
    "objective": "Explore the simulated Linux environment and locate the hidden flag.",
    "host": "web01",
    "users": {"student": {"uid": 1000, "gid": 1000}, "analyst": {"uid": 1001, "gid": 1001}, "root": {"uid": 0, "gid": 0}},
    "services": [{"port": 22, "name": "ssh"}, {"port": 80, "name": "http"}],
    "files": {
        "/home/student/readme.txt": "Welcome to web01. Review the system carefully; useful evidence may be outside your home directory.",
        "/home/student/notes.txt": "The analyst mentioned an application backup under /opt.",
        "/var/www/html/index.html": "<h1>SecArena simulated web01</h1>",
        "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:Student:/home/student:/bin/bash\nanalyst:x:1001:1001:Analyst:/home/analyst:/bin/bash",
        "/opt/secret/flag.txt": "SEC_ARENA{linux_recon_complete}",
    },
    "flag_path": "/opt/secret/flag.txt",
    "flag": "SEC_ARENA{linux_recon_complete}",
    "supported_commands": ["pwd", "ls", "cd", "cat", "find", "grep", "whoami", "id", "history", "clear", "hideflag", "mkdir", "touch", "rm", "echo", "|"],
}

SCENARIOS = {LINUX_RECON["slug"]: LINUX_RECON}


def public_scenario(scenario: dict) -> dict:
    """Return scenario metadata without secret flag values or virtual file contents."""
    return {key: scenario[key] for key in ("slug", "title", "difficulty", "objective", "host", "services", "supported_commands")}
