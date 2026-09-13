"""Rules that turn simulated actions into data-only detection events."""

RULES = {
    "find": ("FILE_ENUMERATION", "LOW", "Directory and file enumeration detected."),
    "grep": ("CONTENT_SEARCH", "LOW", "File-content search detected."),
    "cat": ("FILE_ACCESS", "INFO", "Virtual file access recorded."),
    "ls": ("DIRECTORY_ENUMERATION", "LOW", "Directory enumeration detected."),
}


def detect(command: str) -> tuple[str, str, str] | None:
    return RULES.get(command)
