from fastapi import APIRouter, Response, status

from app.auth.cookies import clear_auth_cookies
from app.dependencies.auth import AuthServiceDep, CurrentUser, DbSession
from app.schemas.auth import MessageResponse
from app.schemas.user import UserRead, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead, summary="Get the signed in user")
def read_me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)


@router.put("/me", response_model=UserRead, summary="Update the signed in user's profile")
def update_me(payload: UserUpdate, current_user: CurrentUser, db: DbSession) -> UserRead:
    user = user_service.update_profile(db, current_user, payload)
    return UserRead.model_validate(user)


@router.delete(
    "/me",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Permanently delete the signed in user's account",
)
def delete_me(
    current_user: CurrentUser, auth: AuthServiceDep, response: Response
) -> MessageResponse:
    auth.delete_account(current_user)
    clear_auth_cookies(response)
    return MessageResponse(message="Your account has been deleted")
