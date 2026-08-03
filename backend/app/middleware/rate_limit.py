import time
from collections import defaultdict, deque
from threading import Lock

from fastapi.encoders import jsonable_encoder
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import settings

AUTH_SENSITIVE_PATHS = (
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/resend-verification",
)


class SlidingWindowCounter:
    """Thread-safe in-process sliding window request counter."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def hit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        now = time.monotonic()
        with self._lock:
            bucket = self._hits[key]
            while bucket and now - bucket[0] > window_seconds:
                bucket.popleft()
            if len(bucket) >= limit:
                retry_after = int(window_seconds - (now - bucket[0])) + 1
                return False, retry_after
            bucket.append(now)
            return True, 0

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


counter = SlidingWindowCounter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Applies a global limit plus a stricter limit for authentication endpoints."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        client_ip = self._client_ip(request)
        path = request.url.path
        is_auth_path = any(path.endswith(suffix) for suffix in AUTH_SENSITIVE_PATHS)

        if is_auth_path:
            limit = settings.auth_rate_limit_requests
            window = settings.auth_rate_limit_window_seconds
            key = f"auth:{client_ip}:{path}"
        else:
            limit = settings.rate_limit_requests
            window = settings.rate_limit_window_seconds
            key = f"global:{client_ip}"

        allowed, retry_after = counter.hit(key, limit, window)
        if not allowed:
            return JSONResponse(
                status_code=429,
                content=jsonable_encoder({"detail": "Too many requests, please try again later"}),
                headers={"Retry-After": str(retry_after)},
            )
        return await call_next(request)

    @staticmethod
    def _client_ip(request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
