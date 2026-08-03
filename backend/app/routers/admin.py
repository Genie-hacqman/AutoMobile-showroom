import uuid

from fastapi import APIRouter, Query

from app.core.exceptions import PermissionDeniedError
from app.dependencies.auth import AdminUser, DbSession
from app.models.user import UserRole
from app.schemas.auth import MessageResponse
from app.schemas.user import AdminUserUpdate, UserListResponse, UserRead
from app.services import token_service, user_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=UserListResponse, summary="List every user account")
def list_users(
    _admin: AdminUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=120),
    role: UserRole | None = None,
    is_active: bool | None = None,
) -> UserListResponse:
    users, total = user_service.list_users(
        db, page=page, page_size=page_size, search=search, role=role, is_active=is_active
    )
    return UserListResponse(
        items=[UserRead.model_validate(user) for user in users],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/users/{user_id}", response_model=UserRead, summary="Get a single user account")
def get_user(user_id: uuid.UUID, _admin: AdminUser, db: DbSession) -> UserRead:
    return UserRead.model_validate(user_service.require_by_id(db, user_id))


@router.patch(
    "/users/{user_id}",
    response_model=UserRead,
    summary="Activate, deactivate, verify or change the role of a user",
)
def update_user(
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    admin: AdminUser,
    db: DbSession,
) -> UserRead:
    user = user_service.require_by_id(db, user_id)
    if user.id == admin.id and (payload.is_active is False or payload.role == UserRole.USER):
        raise PermissionDeniedError("Administrators cannot demote or deactivate themselves")
    user = user_service.admin_update_user(db, user, payload)
    if payload.is_active is False:
        token_service.revoke_all_refresh_tokens(db, user.id)
    return UserRead.model_validate(user)


@router.delete("/users/{user_id}", response_model=MessageResponse, summary="Delete a user account")
def delete_user(user_id: uuid.UUID, admin: AdminUser, db: DbSession) -> MessageResponse:
    user = user_service.require_by_id(db, user_id)
    if user.id == admin.id:
        raise PermissionDeniedError("Administrators cannot delete their own account here")
    token_service.revoke_all_refresh_tokens(db, user.id)
    user_service.delete_user(db, user)
    return MessageResponse(message="User deleted")
