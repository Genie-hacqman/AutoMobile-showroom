"""Create the bootstrap administrator account.

Usage: ``python -m app.utils.seed`` with FIRST_ADMIN_EMAIL / FIRST_ADMIN_PASSWORD set.
"""

from app.core.config import settings
from app.database.session import SessionLocal
from app.models.user import UserRole
from app.schemas.user import UserCreate
from app.services import user_service


def create_first_admin() -> str:
    if not settings.first_admin_email or not settings.first_admin_password:
        return "FIRST_ADMIN_EMAIL and FIRST_ADMIN_PASSWORD must be set"

    with SessionLocal() as db:
        existing = user_service.get_by_email(db, settings.first_admin_email)
        if existing is not None:
            if existing.role != UserRole.ADMIN:
                existing.role = UserRole.ADMIN
                db.commit()
                return f"Promoted {existing.email} to admin"
            return f"Admin {existing.email} already exists"

        user = user_service.create_user(
            db,
            UserCreate(
                first_name="Site",
                last_name="Administrator",
                email=settings.first_admin_email,
                password=settings.first_admin_password,
            ),
            role=UserRole.ADMIN,
        )
        user.is_verified = True
        db.commit()
        return f"Created admin {user.email}"


if __name__ == "__main__":
    print(create_first_admin())
