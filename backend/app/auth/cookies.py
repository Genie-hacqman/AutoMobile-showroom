from fastapi import Request, Response

from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.core.security import constant_time_equals, generate_csrf_token

REFRESH_COOKIE_NAME = "refresh_token"
CSRF_COOKIE_NAME = "csrf_token"
CSRF_HEADER_NAME = "X-CSRF-Token"


def _max_age(remember_me: bool) -> int:
    days = (
        settings.refresh_token_remember_me_expire_days
        if remember_me
        else settings.refresh_token_expire_days
    )
    return days * 24 * 60 * 60


def set_auth_cookies(response: Response, refresh_token: str, remember_me: bool) -> str:
    """Store the refresh token in an HTTP-only cookie and return the CSRF token."""
    max_age = _max_age(remember_me)
    csrf_token = generate_csrf_token()
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        refresh_token,
        max_age=max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        path="/",
    )
    response.set_cookie(
        CSRF_COOKIE_NAME,
        csrf_token,
        max_age=max_age,
        httponly=False,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        path="/",
    )
    return csrf_token


def clear_auth_cookies(response: Response) -> None:
    for name in (REFRESH_COOKIE_NAME, CSRF_COOKIE_NAME):
        response.delete_cookie(name, domain=settings.cookie_domain, path="/")


def read_refresh_token(request: Request, body_token: str | None = None) -> str:
    """Use an explicitly supplied token, otherwise the CSRF protected cookie."""
    if body_token:
        return body_token
    cookie_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if cookie_token:
        verify_csrf(request)
        return cookie_token
    raise AuthenticationError("Missing refresh token")


def verify_csrf(request: Request) -> None:
    """Double-submit cookie check for cookie-authenticated state changing requests."""
    cookie_value = request.cookies.get(CSRF_COOKIE_NAME)
    header_value = request.headers.get(CSRF_HEADER_NAME)
    if not cookie_value or not header_value or not constant_time_equals(cookie_value, header_value):
        raise AuthenticationError("CSRF verification failed", status_code=403)
