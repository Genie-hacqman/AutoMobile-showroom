from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.security import (
    create_access_token,
    hash_password,
    password_needs_rehash,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
)
from app.schemas.user import UserCreate
from app.services import token_service, user_service
from app.services.email_service import EmailService, email_service

GENERIC_CREDENTIALS_ERROR = "Invalid email or password"
GENERIC_TOKEN_ERROR = "This link is invalid or has expired"


class AuthService:
    def __init__(self, db: Session, emails: EmailService | None = None) -> None:
        self.db = db
        self.emails = emails or email_service

    # -- registration & verification ------------------------------------
    def register(self, payload: UserCreate) -> User:
        user = user_service.create_user(self.db, payload)
        token = token_service.create_email_verification_token(self.db, user)
        self.emails.send_verification_email(user.email, user.first_name, token)
        return user

    def verify_email(self, token: str) -> User:
        record = token_service.get_email_verification_token(self.db, token)
        if record is None or not record.is_usable:
            raise AuthenticationError(GENERIC_TOKEN_ERROR)
        record.consume()
        user = user_service.require_by_id(self.db, record.user_id)
        if not user.is_verified:
            user.is_verified = True
            self.emails.send_welcome_email(user.email, user.first_name)
        self.db.flush()
        return user

    def resend_verification(self, email: str) -> None:
        user = user_service.get_by_email(self.db, email)
        if user is None or user.is_verified or not user.is_active:
            return
        token = token_service.create_email_verification_token(self.db, user)
        self.emails.send_verification_email(user.email, user.first_name, token)

    # -- login / refresh / logout ---------------------------------------
    def authenticate(self, payload: LoginRequest) -> User:
        user = user_service.get_by_email(self.db, payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise AuthenticationError(GENERIC_CREDENTIALS_ERROR)
        if not user.is_active:
            raise PermissionDeniedError("This account has been deactivated")
        if password_needs_rehash(user.password_hash):
            user.password_hash = hash_password(payload.password)
        user_service.mark_logged_in(self.db, user)
        return user

    def issue_tokens(
        self,
        user: User,
        remember_me: bool = False,
        user_agent: str | None = None,
        ip_address: str | None = None,
    ) -> tuple[str, int, str]:
        """Return (access_token, expires_in_seconds, refresh_token)."""
        access_token, _expires_at = create_access_token(str(user.id), user.role.value)
        refresh_token, _record = token_service.issue_refresh_token(
            self.db, user, remember_me=remember_me, user_agent=user_agent, ip_address=ip_address
        )
        return access_token, settings.access_token_expire_minutes * 60, refresh_token

    def refresh(
        self, refresh_token: str, user_agent: str | None = None, ip_address: str | None = None
    ) -> tuple[User, str, int, str, bool]:
        """Rotate a refresh token, returning (user, access, expires_in, refresh, remember_me)."""
        record = token_service.get_refresh_token(self.db, refresh_token)
        if record is None:
            raise AuthenticationError("Invalid or expired session")
        if not record.is_usable:
            # Replay of a rotated/revoked token: assume theft and kill every session.
            token_service.revoke_refresh_family(self.db, record.user_id)
            self.db.commit()
            raise AuthenticationError("Invalid or expired session")

        user = user_service.require_by_id(self.db, record.user_id)
        if not user.is_active:
            token_service.revoke_all_refresh_tokens(self.db, user.id)
            self.db.commit()
            raise PermissionDeniedError("This account has been deactivated")

        new_refresh, new_record = token_service.rotate_refresh_token(
            self.db, record, user, user_agent=user_agent, ip_address=ip_address
        )
        access_token, _expires_at = create_access_token(str(user.id), user.role.value)
        return (
            user,
            access_token,
            settings.access_token_expire_minutes * 60,
            new_refresh,
            new_record.remember_me,
        )

    def logout(self, refresh_token: str | None, user: User | None, all_devices: bool = False) -> None:
        if all_devices and user is not None:
            token_service.revoke_all_refresh_tokens(self.db, user.id)
            return
        if refresh_token:
            token_service.revoke_refresh_token(self.db, refresh_token)

    # -- password management --------------------------------------------
    def forgot_password(self, email: str) -> None:
        user = user_service.get_by_email(self.db, email)
        if user is None or not user.is_active:
            return
        token = token_service.create_password_reset_token(self.db, user)
        self.emails.send_password_reset_email(user.email, user.first_name, token)

    def reset_password(self, payload: ResetPasswordRequest) -> User:
        record = token_service.get_password_reset_token(self.db, payload.token)
        if record is None or not record.is_usable:
            raise AuthenticationError(GENERIC_TOKEN_ERROR)
        record.consume()
        user = user_service.require_by_id(self.db, record.user_id)
        user_service.set_password(self.db, user, payload.new_password)
        token_service.revoke_all_refresh_tokens(self.db, user.id)
        self.emails.send_password_changed_email(user.email, user.first_name)
        return user

    def change_password(self, user: User, payload: ChangePasswordRequest) -> None:
        if not verify_password(payload.current_password, user.password_hash):
            raise AuthenticationError("Current password is incorrect")
        user_service.set_password(self.db, user, payload.new_password)
        token_service.revoke_all_refresh_tokens(self.db, user.id)
        self.emails.send_password_changed_email(user.email, user.first_name)

    def delete_account(self, user: User) -> None:
        email, first_name = user.email, user.first_name
        token_service.revoke_all_refresh_tokens(self.db, user.id)
        user_service.delete_user(self.db, user)
        self.emails.send_account_deleted_email(email, first_name)
