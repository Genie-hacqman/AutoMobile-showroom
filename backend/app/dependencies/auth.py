import uuid
from typing import Annotated

import jwt
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.security import ACCESS_TOKEN_TYPE, decode_token
from app.database.session import get_db
from app.models.user import User, UserRole
from app.services import user_service
from app.services.auth_service import AuthService

bearer_scheme = HTTPBearer(auto_error=False, description="JWT access token")

DbSession = Annotated[Session, Depends(get_db)]


def get_auth_service(db: DbSession) -> AuthService:
    return AuthService(db)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
) -> User:
    if credentials is None or not credentials.credentials:
        raise AuthenticationError("Not authenticated")
    try:
        payload = decode_token(credentials.credentials, ACCESS_TOKEN_TYPE)
    except jwt.PyJWTError as exc:
        raise AuthenticationError("Invalid or expired token") from exc

    subject = payload.get("sub")
    try:
        user_id = uuid.UUID(str(subject))
    except (TypeError, ValueError) as exc:
        raise AuthenticationError("Invalid or expired token") from exc

    user = user_service.get_by_id(db, user_id)
    if user is None:
        raise AuthenticationError("Invalid or expired token")
    if not user.is_active:
        raise PermissionDeniedError("This account has been deactivated")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_optional_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
) -> User | None:
    """Resolve the caller when a valid access token is present, otherwise None."""
    if credentials is None or not credentials.credentials:
        return None
    try:
        return get_current_user(db, credentials)
    except (AuthenticationError, PermissionDeniedError):
        return None


OptionalUser = Annotated[User | None, Depends(get_optional_user)]


def get_verified_user(user: CurrentUser) -> User:
    if not user.is_verified:
        raise PermissionDeniedError("Please verify your email address to continue")
    return user


VerifiedUser = Annotated[User, Depends(get_verified_user)]


def require_admin(user: CurrentUser) -> User:
    if user.role != UserRole.ADMIN:
        raise PermissionDeniedError("Administrator access required")
    return user


AdminUser = Annotated[User, Depends(require_admin)]


def get_client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None
