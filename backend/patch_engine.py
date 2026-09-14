import re

with open("app/simulation/engine.py", "r") as f:
    content = f.read()

# Replace parse_action with parse_pipeline
content = content.replace(
    "from app.simulation.parser import normalize_path, parse_action",
    "from app.simulation.parser import normalize_path, parse_pipeline"
)

# Extract the big if-elif block for command execution
start_str = '    if command == "pwd":'
end_str = '            except Exception as e:\n                output = f"{command}: execution failed - {str(e)}"\n'

start_idx = content.find(start_str)
end_idx = content.find(end_str) + len(end_str)

command_block = content[start_idx:end_idx]

execute_replacement = """
    supported_commands = LINUX_RECON["supported_commands"] + list(custom_commands.keys())
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
        
""" + command_block.replace("    if command ==", "        if command ==").replace("    elif command", "        elif command").replace("    else:", "        else:").replace("            ", "                ").replace("        ", "            ") + """
        if piped_input is not None and command == "grep":
            pass # grep handles piped_input internally now, handled below
        
        piped_input = output
        final_score += score
        if rule: final_rule = rule
        if flag_found: final_flag_found = True
        
    return {"command": pipeline[-1][0], "success": True, "output": output, "score": final_score, "rule": final_rule, "flag_found": final_flag_found}
"""

# Now we need to modify grep to use piped_input.
# Wait, I can do this in another replace. Let's just assemble the whole execute function.

old_execute_start = '    supported_commands = LINUX_RECON["supported_commands"] + list(custom_commands.keys())'
old_execute_end = '    return {"command": command, "success": True, "output": output, "score": score, "rule": rule, "flag_found": flag_found}\n'

content = content[:content.find(old_execute_start)] + execute_replacement + content[content.find(old_execute_end) + len(old_execute_end):]

with open("app/simulation/engine.py", "w") as f:
    f.write(content)

