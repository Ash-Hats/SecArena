"""Whitelist parser for virtual terminal actions; it never touches the host OS."""

import shlex


def normalize_path(cwd: str, value: str) -> str:
    value = value.strip()
    if not value:
        return cwd
    parts = ([] if value.startswith("/") else cwd.split("/")) + value.split("/")
    output: list[str] = []
    for part in parts:
        if not part or part == ".":
            continue
        if part == "..":
            if output:
                output.pop()
        else:
            output.append(part)
    return "/" + "/".join(output)


def parse_action(action_input: str, supported: list[str]) -> tuple[str, list[str]]:
    """Parse only a small action grammar; no shell expansion, pipes, or execution."""
    try:
        tokens = shlex.split(action_input, posix=True)
    except ValueError:
        return "", []
    if not tokens or tokens[0] not in supported:
        return "", []
    return tokens[0], tokens[1:]
