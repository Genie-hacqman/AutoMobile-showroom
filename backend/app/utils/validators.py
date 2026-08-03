import re

PHONE_PATTERN = re.compile(r"^\+?[0-9 ()\-]{7,20}$")


def normalize_email(value: str) -> str:
    return value.strip().lower()


def normalize_phone(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    if not PHONE_PATTERN.match(cleaned):
        raise ValueError("Phone number must contain 7-20 digits and may start with '+'")
    return cleaned


def validate_password_strength(value: str) -> str:
    """Enforce a minimum password policy shared by every password entry point."""
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[a-z]", value):
        raise ValueError("Password must contain a lowercase letter")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must contain an uppercase letter")
    if not re.search(r"\d", value):
        raise ValueError("Password must contain a number")
    if not re.search(r"[^A-Za-z0-9]", value):
        raise ValueError("Password must contain a special character")
    return value
