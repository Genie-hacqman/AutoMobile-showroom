# Obolo Motors backend

FastAPI + SQLAlchemy 2 + PostgreSQL authentication service for the Obolo Motors showroom frontend
(`../my-web`).

## Quick start

```bash
cd backend
python3.13 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env            # then set JWT_SECRET_KEY and DATABASE_URL
createdb showroom               # or use an existing PostgreSQL database
alembic upgrade head            # creates users + token tables

# optional: bootstrap an administrator (uses FIRST_ADMIN_* from .env)
python -m app.utils.seed

python main.py                  # http://localhost:8000 - docs at /docs
```

Point the frontend at the API with `my-web/.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Tests

```bash
createdb showroom_test
pytest
```

The suite talks to a real PostgreSQL database (`showroom_test` by default) and stubs SMTP delivery.

## Layout

| Path | Purpose |
| --- | --- |
| `app/api/router.py` | Aggregates all routers under `/api` and exposes `/api/health` |
| `app/auth/cookies.py` | HTTP-only refresh cookie + CSRF double-submit helpers |
| `app/core/` | Settings, JWT/Argon2 primitives, centralized exception handling |
| `app/database/` | Declarative base, UUID/timestamp mixins, session dependency |
| `app/dependencies/auth.py` | `get_current_user`, verified-user and admin guards |
| `app/emails/templates.py` | HTML + text bodies for transactional email |
| `app/middleware/` | Security headers, rate limiting, request id/logging |
| `app/models/` | `User`, `RefreshToken`, `PasswordResetToken`, `EmailVerificationToken` |
| `app/routers/` | `auth`, `users`, `admin` endpoints |
| `app/schemas/` | Pydantic request/response models with validation |
| `app/services/` | Business logic (auth, users, tokens, email) |
| `app/static/emails/` | Fallback outbox used when `SMTP_HOST` is empty |
| `app/utils/` | Validators, sanitizers, admin seed script |

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | Creates an unverified account, emails a verification link |
| POST | `/api/auth/login` | Returns an access token; sets refresh + CSRF cookies |
| POST | `/api/auth/refresh` | Rotates the refresh token (cookie or body) |
| POST | `/api/auth/logout` | Revokes the current session, or all sessions with `all_devices` |
| POST | `/api/auth/verify-email` | Consumes a single-use verification token |
| POST | `/api/auth/resend-verification` | Generic response, never leaks account existence |
| POST | `/api/auth/forgot-password` | Emails a reset link, generic response |
| POST | `/api/auth/reset-password` | Consumes the reset token, revokes every session |
| POST | `/api/auth/change-password` | Requires the current password (authenticated) |
| GET/PUT/DELETE | `/api/users/me` | Read, update or delete the signed in account |
| GET | `/api/admin/users` | Paginated, searchable user list (admin only) |
| GET/PATCH/DELETE | `/api/admin/users/{id}` | Inspect, activate/deactivate, change role, delete |

## Security model

* Argon2id password hashing with automatic rehash on login when parameters change.
* 15 minute access tokens (`Authorization: Bearer`), 7 day refresh tokens (30 days with
  "remember me"), stored hashed (SHA-256) and rotated on every refresh.
* Reuse of a rotated refresh token revokes every session for that user (theft detection).
* Refresh cookie is `HttpOnly`; state changing cookie-authenticated calls require the
  `X-CSRF-Token` header to match the readable `csrf_token` cookie.
* Per-IP sliding window rate limiting, stricter on authentication endpoints.
* Helmet-equivalent headers (CSP, HSTS when `COOKIE_SECURE`, `nosniff`, `DENY`, referrer policy).
* Generic authentication errors, e-mail enumeration protection, ORM-only queries, URL scheme
  validation on user supplied image links.

## Environment variables

See `.env.example` for the full list with defaults. The required ones in production are
`DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, `FRONTEND_BASE_URL`, `COOKIE_SECURE=true`
and the `SMTP_*` credentials.
