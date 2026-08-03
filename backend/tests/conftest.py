import os
import uuid
from collections.abc import Iterator
from typing import Annotated

import pytest

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault(
    "DATABASE_URL", "postgresql+psycopg://showroom:showroom@localhost:5432/showroom_test"
)
os.environ.setdefault("RATE_LIMIT_REQUESTS", "10000")
os.environ.setdefault("AUTH_RATE_LIMIT_REQUESTS", "10000")

from fastapi import Depends  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, text  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.database.base import Base  # noqa: E402
from app.database.session import get_db  # noqa: E402
from app.dependencies.auth import get_auth_service  # noqa: E402
from app.main import create_app  # noqa: E402
from app.services.auth_service import AuthService  # noqa: E402
from app.models import User, UserRole  # noqa: E402
from app.services import token_service, user_service  # noqa: E402
from app.services.email_service import EmailService  # noqa: E402
from app.schemas.user import UserCreate  # noqa: E402

engine = create_engine(settings.database_url, future=True)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class RecordingEmailService(EmailService):
    """Captures outgoing email instead of sending it."""

    def __init__(self) -> None:
        super().__init__()
        self.sent: list[dict[str, str]] = []

    def send(self, to: str, subject: str, html_body: str, text_body: str) -> None:
        self.sent.append({"to": to, "subject": subject, "html": html_body, "text": text_body})

    def last_link(self, needle: str) -> str:
        for message in reversed(self.sent):
            if needle in message["text"]:
                for chunk in message["text"].split():
                    if needle in chunk:
                        return chunk.split("token=")[-1]
        raise AssertionError(f"No email containing {needle!r} was sent")


@pytest.fixture(scope="session", autouse=True)
def _create_schema() -> Iterator[None]:
    Base.metadata.drop_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(text("DROP TYPE IF EXISTS user_role"))
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def _clean_tables() -> Iterator[None]:
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE users CASCADE"))
    yield


@pytest.fixture
def db() -> Iterator[Session]:
    session = TestingSessionLocal()
    try:
        yield session
        session.commit()
    finally:
        session.close()


@pytest.fixture
def emails() -> RecordingEmailService:
    return RecordingEmailService()


@pytest.fixture
def client(emails: RecordingEmailService) -> Iterator[TestClient]:
    app = create_app()

    def override_get_db() -> Iterator[Session]:
        session = TestingSessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def build_auth_service(session: Annotated[Session, Depends(get_db)]) -> AuthService:
        return AuthService(session, emails=emails)

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_auth_service] = build_auth_service

    with TestClient(app) as test_client:
        yield test_client


def _unique_email(prefix: str = "user") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}@example.com"


VALID_PASSWORD = "StrongPass1!"


@pytest.fixture
def user_factory(db: Session):
    def factory(
        email: str | None = None,
        password: str = VALID_PASSWORD,
        role: UserRole = UserRole.USER,
        is_verified: bool = True,
        is_active: bool = True,
    ) -> User:
        user = user_service.create_user(
            db,
            UserCreate(
                first_name="Test",
                last_name="Driver",
                email=email or _unique_email(),
                password=password,
            ),
            role=role,
        )
        user.is_verified = is_verified
        user.is_active = is_active
        db.commit()
        db.refresh(user)
        return user

    return factory


@pytest.fixture
def login(client: TestClient):
    def do_login(email: str, password: str = VALID_PASSWORD, remember_me: bool = False) -> dict:
        response = client.post(
            "/api/auth/login",
            json={"email": email, "password": password, "remember_me": remember_me},
        )
        assert response.status_code == 200, response.text
        return response.json()

    return do_login


@pytest.fixture
def auth_headers(login):
    def build(email: str, password: str = VALID_PASSWORD) -> dict[str, str]:
        tokens = login(email, password)
        return {"Authorization": f"Bearer {tokens['access_token']}"}

    return build


@pytest.fixture
def verification_token(db: Session):
    def build(user: User) -> str:
        token = token_service.create_email_verification_token(db, user)
        db.commit()
        return token

    return build
