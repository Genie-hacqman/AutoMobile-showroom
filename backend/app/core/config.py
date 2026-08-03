from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Obolo Motors API"
    environment: str = "development"
    debug: bool = True
    api_prefix: str = "/api"

    database_url: str = "postgresql+psycopg://showroom:showroom@localhost:5432/showroom"

    jwt_secret_key: str = "change-me-to-a-long-random-string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    refresh_token_remember_me_expire_days: int = 30
    email_verification_token_expire_hours: int = 48
    password_reset_token_expire_minutes: int = 60

    cookie_secure: bool = False
    cookie_domain: str | None = None
    cookie_samesite: str = "lax"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60
    auth_rate_limit_requests: int = 10
    auth_rate_limit_window_seconds: int = 60

    frontend_base_url: str = "http://localhost:5173"
    frontend_verify_email_path: str = "/verify-email"
    frontend_reset_password_path: str = "/reset-password"

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    email_from: str = "no-reply@obolomotors.test"
    email_from_name: str = "Obolo Motors"

    first_admin_email: str = ""
    first_admin_password: str = ""

    @field_validator("cookie_domain", mode="before")
    @classmethod
    def empty_domain_is_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def email_outbox_dir(self) -> Path:
        return BACKEND_DIR / "app" / "static" / "emails"

    def verify_email_url(self, token: str) -> str:
        return f"{self.frontend_base_url.rstrip('/')}{self.frontend_verify_email_path}?token={token}"

    def reset_password_url(self, token: str) -> str:
        return f"{self.frontend_base_url.rstrip('/')}{self.frontend_reset_password_path}?token={token}"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
