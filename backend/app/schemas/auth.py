from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.schemas.user import UserRead
from app.utils.validators import normalize_email, validate_password_strength


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    remember_me: bool = False

    _normalize_email = field_validator("email")(normalize_email)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: str | None = None
    user: UserRead | None = None


class RefreshRequest(BaseModel):
    refresh_token: str | None = None


class LogoutRequest(RefreshRequest):
    all_devices: bool = False


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    _normalize_email = field_validator("email")(normalize_email)


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10)
    new_password: str = Field(min_length=8, max_length=128)

    _validate_password = field_validator("new_password")(validate_password_strength)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

    _validate_password = field_validator("new_password")(validate_password_strength)


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=10)


class ResendVerificationRequest(BaseModel):
    email: EmailStr

    _normalize_email = field_validator("email")(normalize_email)


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message: str
