from fastapi import APIRouter, Request, Response, status

from app.auth.cookies import (
    REFRESH_COOKIE_NAME,
    clear_auth_cookies,
    read_refresh_token,
    set_auth_cookies,
)
from app.dependencies.auth import AuthServiceDep, CurrentUser, OptionalUser, get_client_ip
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])

GENERIC_EMAIL_SENT = "If an account matches that email, we have sent a message with next steps."


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an account and send a verification email",
)
def register(payload: UserCreate, auth: AuthServiceDep) -> UserRead:
    user = auth.register(payload)
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenResponse, summary="Exchange credentials for tokens")
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    auth: AuthServiceDep,
) -> TokenResponse:
    user = auth.authenticate(payload)
    access_token, expires_in, refresh_token = auth.issue_tokens(
        user,
        remember_me=payload.remember_me,
        user_agent=request.headers.get("user-agent"),
        ip_address=get_client_ip(request),
    )
    set_auth_cookies(response, refresh_token, payload.remember_me)
    return TokenResponse(
        access_token=access_token,
        expires_in=expires_in,
        refresh_token=refresh_token,
        user=UserRead.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse, summary="Rotate the refresh token")
def refresh(
    payload: RefreshRequest | None,
    request: Request,
    response: Response,
    auth: AuthServiceDep,
) -> TokenResponse:
    token = read_refresh_token(request, payload.refresh_token if payload else None)
    user, access_token, expires_in, new_refresh, remember_me = auth.refresh(
        token,
        user_agent=request.headers.get("user-agent"),
        ip_address=get_client_ip(request),
    )
    set_auth_cookies(response, new_refresh, remember_me)
    return TokenResponse(
        access_token=access_token,
        expires_in=expires_in,
        refresh_token=new_refresh,
        user=UserRead.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse, summary="Revoke the current session")
def logout(
    payload: LogoutRequest | None,
    request: Request,
    response: Response,
    auth: AuthServiceDep,
    current_user: OptionalUser,
) -> MessageResponse:
    token = (payload.refresh_token if payload else None) or request.cookies.get(
        REFRESH_COOKIE_NAME
    )
    auth.logout(token, current_user, all_devices=bool(payload and payload.all_devices))
    clear_auth_cookies(response)
    return MessageResponse(message="Signed out")


@router.post(
    "/verify-email", response_model=MessageResponse, summary="Confirm an email address"
)
def verify_email(payload: VerifyEmailRequest, auth: AuthServiceDep) -> MessageResponse:
    auth.verify_email(payload.token)
    return MessageResponse(message="Email verified. You can now sign in.")


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    summary="Send a new verification email",
)
def resend_verification(
    payload: ResendVerificationRequest, auth: AuthServiceDep
) -> MessageResponse:
    auth.resend_verification(payload.email)
    return MessageResponse(message=GENERIC_EMAIL_SENT)


@router.post(
    "/forgot-password", response_model=MessageResponse, summary="Start a password reset"
)
def forgot_password(payload: ForgotPasswordRequest, auth: AuthServiceDep) -> MessageResponse:
    auth.forgot_password(payload.email)
    return MessageResponse(message=GENERIC_EMAIL_SENT)


@router.post(
    "/reset-password", response_model=MessageResponse, summary="Finish a password reset"
)
def reset_password(
    payload: ResetPasswordRequest, response: Response, auth: AuthServiceDep
) -> MessageResponse:
    auth.reset_password(payload)
    clear_auth_cookies(response)
    return MessageResponse(message="Password updated. Please sign in with your new password.")


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change the password of the signed in user",
)
def change_password(
    payload: ChangePasswordRequest,
    response: Response,
    current_user: CurrentUser,
    auth: AuthServiceDep,
) -> MessageResponse:
    auth.change_password(current_user, payload)
    clear_auth_cookies(response)
    return MessageResponse(message="Password updated. Please sign in again.")
