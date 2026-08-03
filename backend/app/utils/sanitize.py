from urllib.parse import urlparse

CONTROL_CHARS = dict.fromkeys(range(0, 32))
ALLOWED_IMAGE_SCHEMES = {"http", "https"}


def clean_text(value: str | None) -> str | None:
    """Strip control characters and surrounding whitespace from user supplied text."""
    if value is None:
        return None
    cleaned = value.translate(CONTROL_CHARS).strip()
    return cleaned or None


def clean_image_url(value: str | None) -> str | None:
    """Only allow absolute http(s) image URLs, blocking javascript:/data: payloads."""
    cleaned = clean_text(value)
    if cleaned is None:
        return None
    parsed = urlparse(cleaned)
    if parsed.scheme.lower() not in ALLOWED_IMAGE_SCHEMES or not parsed.netloc:
        raise ValueError("Profile image must be an absolute http(s) URL")
    return cleaned
