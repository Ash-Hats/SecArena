"""Server-side, one-time scoring rules for the first scenario."""

RULES = {
    "pwd": ("pwd", 10),
    "enumerate": ("enumerate", 15),
    "find_flag": ("find_flag", 20),
    "cat_readme": ("read_evidence", 20),
    "flag": ("flag", 50),
    "hide_flag": ("hide_flag", 10),
}


def award(state: dict, rule: str) -> int:
    completed = state.setdefault("completed_rules", [])
    if rule in completed:
        return 0
    completed.append(rule)
    return RULES[rule][1]
