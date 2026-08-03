import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole
from app.utils.sanitize import clean_image_url, clean_text
from app.utils.validators import normalize_email, normalize_phone, validate_password_strength


class UserBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=32)

    _normalize_email = field_validator("email")(normalize_email)
    _normalize_phone = field_validator("phone")(normalize_phone)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

    _validate_password = field_validator("password")(validate_password_strength)


class UserUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str | None = Field(default=None, min_length=1, max_length=80)
    phone: str | None = Field(default=None, max_length=32)
    profile_image: str | None = Field(default=None, max_length=512)

    _normalize_phone = field_validator("phone")(normalize_phone)
    _clean_names = field_validator("first_name", "last_name")(clean_text)
    _clean_image = field_validator("profile_image")(clean_image_url)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None
    profile_image: str | None
    role: UserRole
    is_verified: bool
    is_active: bool
    last_login: datetime | None
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    items: list[UserRead]
    total: int
    page: int
    page_size: int


class AdminUserUpdate(BaseModel):
    is_active: bool | None = None
    is_verified: bool | None = None
    role: UserRole | None = None
