import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, declared_attr, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserOwnedTokenMixin(UUIDPrimaryKeyMixin, TimestampMixin):
    """Shared columns and helpers for the token tables owned by a user."""

    @declared_attr
    def user_id(cls) -> Mapped[uuid.UUID]:
        return mapped_column(
            PGUUID(as_uuid=True),
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )

    @declared_attr
    def token_hash(cls) -> Mapped[str]:
        return mapped_column(String(128), unique=True, index=True, nullable=False)

    @declared_attr
    def expires_at(cls) -> Mapped[datetime]:
        return mapped_column(DateTime(timezone=True), nullable=False)

    @property
    def is_expired(self) -> bool:
        return self.expires_at <= datetime.now(timezone.utc)


class RefreshToken(UserOwnedTokenMixin, Base):
    __tablename__ = "refresh_tokens"

    remember_me: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    replaced_by: Mapped[str | None] = mapped_column(String(128), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="refresh_tokens")

    @property
    def is_usable(self) -> bool:
        return self.revoked_at is None and not self.is_expired

    def revoke(self, replaced_by: str | None = None) -> None:
        if self.revoked_at is None:
            self.revoked_at = datetime.now(timezone.utc)
        if replaced_by is not None:
            self.replaced_by = replaced_by


class SingleUseTokenMixin(UserOwnedTokenMixin):
    @declared_attr
    def used_at(cls) -> Mapped[datetime | None]:
        return mapped_column(DateTime(timezone=True), nullable=True)

    @property
    def is_usable(self) -> bool:
        return self.used_at is None and not self.is_expired

    def consume(self) -> None:
        self.used_at = datetime.now(timezone.utc)


class PasswordResetToken(SingleUseTokenMixin, Base):
    __tablename__ = "password_reset_tokens"

    user = relationship("User", back_populates="password_reset_tokens")


class EmailVerificationToken(SingleUseTokenMixin, Base):
    __tablename__ = "email_verification_tokens"

    user = relationship("User", back_populates="email_verification_tokens")
