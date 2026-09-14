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


def execute(state: dict, action_input: str, custom_commands: dict = None) -> dict:
    """Interpret a whitelisted action against scenario data, never system resources."""
    if custom_commands is None:
        custom_commands = {}
    
    supported_commands = LINUX_RECON["supported_commands"] + list(custom_commands.keys())
    from app.simulation.parser import parse_pipeline
    pipeline = parse_pipeline(action_input, supported_commands)
    state.setdefault("history", []).append(action_input)
    if not pipeline:
        return {"command": "unsupported", "success": False, "output": "Command not supported or parse error in pipeline.", "score": 0, "rule": None, "flag_found": False}
    files = dict(LINUX_RECON["files"])
    if "fs" in state:
        for p, d in state["fs"].items():
            files[p] = d.get("content", d) if isinstance(d, dict) else d
    
    piped_input = None
    final_score = 0
    final_rule = None
    final_flag_found = False
    
    for command, args in pipeline:
        cwd = state["cwd"]
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
            if not args:
                return {"command": command, "success": False, "output": "grep: provide a pattern", "score": 0, "rule": None, "flag_found": False}
            pattern = args[0]
            if piped_input is not None:
                content = piped_input
            else:
                if len(args) < 2: return {"command": command, "success": False, "output": "grep: provide a pattern and virtual file", "score": 0, "rule": None, "flag_found": False}
                target = normalize_path(cwd, args[-1]); content = files.get(target, "")
            output = "\n".join(line for line in content.splitlines() if pattern.lower() in line.lower())
        elif command == "mkdir":
            if not args: return {"command": command, "success": False, "output": "mkdir: missing operand", "score": 0, "rule": None, "flag_found": False}
            target = normalize_path(cwd, args[0])
            if "fs" not in state: state["fs"] = {}
            state["fs"][f"{target}/.keep"] = ""
            output = ""
        elif command == "touch":
            if not args: return {"command": command, "success": False, "output": "touch: missing file operand", "score": 0, "rule": None, "flag_found": False}
            target = normalize_path(cwd, args[0])
            if "fs" not in state: state["fs"] = {}
            if target not in files and target not in state["fs"]:
                state["fs"][target] = ""
            output = ""
        elif command == "rm":
            if not args: return {"command": command, "success": False, "output": "rm: missing operand", "score": 0, "rule": None, "flag_found": False}
            target = normalize_path(cwd, args[0])
            if "fs" not in state: state["fs"] = {}
            if target in state["fs"]:
                del state["fs"][target]
                output = ""
            elif target in files:
                output = f"rm: cannot remove '{args[0]}': Permission denied (read-only base file)"
            else:
                output = f"rm: cannot remove '{args[0]}': No such file or directory"
        elif command == "echo":
            if ">" in args or ">>" in args:
                redir_op = ">>" if ">>" in args else ">"
                op_idx = args.index(redir_op)
                if op_idx == len(args) - 1:
                    return {"command": command, "success": False, "output": "parse error near `\\n'", "score": 0, "rule": None, "flag_found": False}
                content_str = " ".join(args[:op_idx])
                if piped_input is not None:
                    content_str = piped_input
                target = normalize_path(cwd, args[op_idx+1])
                if "fs" not in state: state["fs"] = {}
                if target not in files and target not in state["fs"]:
                    state["fs"][target] = ""
                if redir_op == ">>":
                    curr = state["fs"].get(target, "")
                    if curr and not curr.endswith("\n"): curr += "\n"
                    state["fs"][target] = curr + content_str + "\n"
                else:
                    state["fs"][target] = content_str + "\n"
                output = ""
            else:
                output = " ".join(args) if piped_input is None else piped_input
        elif command == "hideflag":
            if len(args) < 2: return {"command": command, "success": False, "output": "hideflag: usage: hideflag <flag> <path>", "score": 0, "rule": None, "flag_found": False}
            flag_content = args[0]
            flag_path = normalize_path(cwd, args[1])
            if "fs" in state:
                state["fs"][flag_path] = {"content": flag_content, "hidden_by_terminal": True}
            output = f"Flag hidden securely at {flag_path}"
            rule = "hide_flag"
        elif command in ("nano", "vim", "vi"):
            output = f"{command}: The SecArena virtual terminal is non-interactive. To add or modify files, use 'echo' with output redirection (e.g., echo 'SEC_ARENA{my_flag}' > my_flag.txt)"
        elif command in custom_commands:
            import subprocess
            cmd_meta = custom_commands[command]
            if cmd_meta["is_real_execution"]:
                try:
                    res = subprocess.run(action_input, shell=True, capture_output=True, text=True, timeout=10)
                    output = res.stdout
                    if res.stderr: output += "\n" + res.stderr
                except subprocess.TimeoutExpired:
                    output = f"{command}: execution timed out"
                except Exception as e:
                    output = f"{command}: execution failed - {str(e)}"
            else:
                output = cmd_meta["output"]

        if rule: 
            score = award(state, rule)
            
        piped_input = output
        final_score += score
        if rule: final_rule = rule
        if flag_found: final_flag_found = True
        
    return {"command": pipeline[-1][0], "success": True, "output": output, "score": final_score, "rule": final_rule, "flag_found": final_flag_found}
