# SecArena Security Model

SecArena is a simulation platform, not an attack-execution environment.

- Virtual hosts, users, services, ports, and files are scenario data only.
- The parser allows a small explicit command whitelist and treats all other input as unsupported.
- No simulator action can call a shell, process launcher, host filesystem, SSH client, socket API, scanner, dynamic evaluator, or arbitrary code runner.
- Authentication and role checks protect sessions. Students can access only their own sessions; instructors and administrators can review sessions as permitted by RBAC.
- Score, progress, flags, and detection events are calculated only by the backend.
- Scenario metadata intentionally excludes secret flag values and virtual file contents from public API responses.

When introducing simulated web or network exercises, add logical rules and virtual state transitions. Never introduce a deliberately vulnerable service or real network interaction.
