"""Virtual command interpreter for SecArena simulations; it never executes host commands."""
from app.simulation.vfs import VirtualShell

def initial_state() -> dict:
    return {"cwd": "/tmp", "history": [], "discovered_flags": [], "completed_rules": []}

def execute(state: dict, action_input: str, custom_commands: dict = None, supported_commands: list = None, is_pvp: bool = False, user_id: str = None, allow_hideflag: bool = False) -> dict:
    """Interpret action directly via VirtualShell for all simulation modes."""
    
    vshell = VirtualShell(state, supported_commands, custom_commands, user_id=user_id, allow_hideflag=allow_hideflag)
    result = vshell.execute(action_input)
    result["score"] = 0
    result["rule"] = None
    result["flag_found"] = False if is_pvp else "SEC_ARENA{" in result.get("output", "")
    
    return result
