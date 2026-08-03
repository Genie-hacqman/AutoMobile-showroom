import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_refresh_token,
    generate_url_safe_token,
    hash_opaque_token,
)
from app.models.token import EmailVerificationToken, PasswordResetToken, RefreshToken
from app.models.user import User


def issue_refresh_token(
    db: Session,
    user: User,
    remember_me: bool = False,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> tuple[str, RefreshToken]:
    token, _jti, expires_at = create_refresh_token(str(user.id), remember_me=remember_me)
    record = RefreshToken(
        user_id=user.id,
        token_hash=hash_opaque_token(token),
        expires_at=expires_at,
        remember_me=remember_me,
        user_agent=(user_agent or "")[:255] or None,
        ip_address=(ip_address or "")[:64] or None,
    )
    db.add(record)
    db.flush()
    return token, record


def get_refresh_token(db: Session, token: str) -> RefreshToken | None:
    return db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_opaque_token(token)))


def rotate_refresh_token(
    db: Session,
    current: RefreshToken,
    user: User,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> tuple[str, RefreshToken]:
    new_token, record = issue_refresh_token(
        db,
        user,
        remember_me=current.remember_me,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    current.revoke(replaced_by=record.token_hash)
    db.flush()
    return new_token, record


def revoke_refresh_token(db: Session, token: str) -> bool:
    record = get_refresh_token(db, token)
    if record is None:
        return False
    record.revoke()
    db.flush()
    return True


def revoke_all_refresh_tokens(db: Session, user_id: uuid.UUID) -> None:
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )
    db.flush()


def revoke_refresh_family(db: Session, user_id: uuid.UUID) -> None:
    """Called when a revoked refresh token is replayed: drop every session for the user."""
    revoke_all_refresh_tokens(db, user_id)


def create_email_verification_token(db: Session, user: User) -> str:
    token = generate_url_safe_token()
    record = EmailVerificationToken(
        user_id=user.id,
        token_hash=hash_opaque_token(token),
        expires_at=datetime.now(timezone.utc)
        + timedelta(hours=settings.email_verification_token_expire_hours),
    )
    db.add(record)
    db.flush()
    return token


def get_email_verification_token(db: Session, token: str) -> EmailVerificationToken | None:
    return db.scalar(
        select(EmailVerificationToken).where(
            EmailVerificationToken.token_hash == hash_opaque_token(token)
        )
    )


def create_password_reset_token(db: Session, user: User) -> str:
    token = generate_url_safe_token()
    record = PasswordResetToken(
        user_id=user.id,
        token_hash=hash_opaque_token(token),
        expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=settings.password_reset_token_expire_minutes),
    )
    db.add(record)
    db.flush()
    return token


def get_password_reset_token(db: Session, token: str) -> PasswordResetToken | None:
    return db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == hash_opaque_token(token))
    )
