"""Pure data simulation of the Linux reconnaissance scenario."""

from app.simulation.parser import normalize_path, parse_action
from app.simulation.scenarios import LINUX_RECON
from app.simulation.scoring import award


def initial_state() -> dict:
    return {"cwd": "/home/student", "history": [], "discovered_flags": [], "completed_rules": []}


def _children(files: dict, directory: str) -> list[str]:
    prefix = directory.rstrip("/") + "/"
    result = set()
    for path in files:
        if path.startswith(prefix):
            remainder = path[len(prefix):]
            result.add(remainder.split("/")[0])
    return sorted(result)


def execute(state: dict, action_input: str) -> dict:
    """Interpret a whitelisted action against scenario data, never system resources."""
    command, args = parse_action(action_input, LINUX_RECON["supported_commands"])
    state.setdefault("history", []).append(action_input)
    if not command:
        return {"command": "unsupported", "success": False, "output": "Command not supported in this simulation.", "score": 0, "rule": None, "flag_found": False}
    files, cwd = LINUX_RECON["files"], state["cwd"]
    score = 0; rule = None; flag_found = False; output = ""
    if command == "pwd":
        output = cwd; rule = "pwd"
    elif command == "whoami": output = "student"
    elif command == "id": output = "uid=1000(student) gid=1000(student) groups=1000(student)"
    elif command == "clear": output = ""
    elif command == "history": output = "\n".join(f"{index + 1}  {item}" for index, item in enumerate(state["history"]))
    elif command == "ps": output = "PID TTY          TIME CMD\n101 pts/0    00:00:00 sim-shell\n118 pts/0    00:00:00 ps"
    elif command == "cd":
        target = normalize_path(cwd, args[0] if args else "/home/student")
        if target == "/" or _children(files, target): state["cwd"] = target; output = ""
        else: return {"command": command, "success": False, "output": f"cd: {target}: No such virtual directory", "score": 0, "rule": None, "flag_found": False}
    elif command == "ls":
        target = normalize_path(cwd, args[0] if args else cwd); entries = _children(files, target)
        if not entries: return {"command": command, "success": False, "output": f"ls: cannot access '{target}': No such virtual directory", "score": 0, "rule": None, "flag_found": False}
        output = "  ".join(entries); rule = "enumerate"
    elif command == "cat":
        if not args: return {"command": command, "success": False, "output": "cat: missing virtual file operand", "score": 0, "rule": None, "flag_found": False}
        target = normalize_path(cwd, args[0])
        if target not in files: return {"command": command, "success": False, "output": f"cat: {target}: No such virtual file", "score": 0, "rule": None, "flag_found": False}
        output = files[target]
        if target == "/home/student/readme.txt": rule = "cat_readme"
        if target == LINUX_RECON["flag_path"]:
            rule = "flag"; flag_found = True
            if LINUX_RECON["flag"] not in state["discovered_flags"]: state["discovered_flags"].append(LINUX_RECON["flag"])
    elif command == "find":
        search = args[-1] if args else ""
        matches = [path for path in files if search.replace("*", "") in path]
        output = "\n".join(matches) or ""
        rule = "find_flag" if LINUX_RECON["flag_path"] in matches else None
    elif command == "grep":
        if len(args) < 2: return {"command": command, "success": False, "output": "grep: provide a pattern and virtual file", "score": 0, "rule": None, "flag_found": False}
        target = normalize_path(cwd, args[-1]); content = files.get(target, "")
        output = "\n".join(line for line in content.splitlines() if args[0].lower() in line.lower())
    if rule: score = award(state, rule)
    return {"command": command, "success": True, "output": output, "score": score, "rule": rule, "flag_found": flag_found}
