from tests.conftest import VALID_PASSWORD

REGISTER_PAYLOAD = {
    "first_name": "Ada",
    "last_name": "Obolo",
    "email": "ada@example.com",
    "password": VALID_PASSWORD,
    "phone": "+2348012345678",
}


def test_register_creates_unverified_user_and_sends_verification_email(client, emails):
    response = client.post("/api/auth/register", json=REGISTER_PAYLOAD)

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["email"] == "ada@example.com"
    assert body["role"] == "user"
    assert body["is_verified"] is False
    assert "password" not in body and "password_hash" not in body
    assert emails.sent[0]["to"] == "ada@example.com"
    assert "Verify" in emails.sent[0]["subject"]


def test_register_rejects_duplicate_email(client):
    client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    response = client.post("/api/auth/register", json={**REGISTER_PAYLOAD, "email": "ADA@example.com"})

    assert response.status_code == 409
    assert response.json()["detail"] == "An account with this email already exists"


def test_register_rejects_weak_password(client):
    response = client.post("/api/auth/register", json={**REGISTER_PAYLOAD, "password": "weakpass"})

    assert response.status_code == 422
    assert response.json()["detail"] == "Validation failed"
    assert any(error["field"] == "password" for error in response.json()["errors"])


def test_register_rejects_invalid_email_and_phone(client):
    response = client.post(
        "/api/auth/register", json={**REGISTER_PAYLOAD, "email": "not-an-email", "phone": "abc"}
    )

    assert response.status_code == 422
    fields = {error["field"] for error in response.json()["errors"]}
    assert {"email", "phone"} <= fields


def test_login_returns_tokens_and_sets_cookies(client, user_factory):
    user = user_factory()

    response = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] > 0
    assert body["user"]["email"] == user.email
    assert "refresh_token" in client.cookies
    assert "csrf_token" in client.cookies


def test_login_email_is_case_insensitive(client, user_factory):
    user = user_factory(email="Mixed.Case@Example.com")

    response = client.post(
        "/api/auth/login", json={"email": "MIXED.CASE@example.com", "password": VALID_PASSWORD}
    )

    assert response.status_code == 200
    assert response.json()["user"]["id"] == str(user.id)


def test_login_with_wrong_password_returns_generic_error(client, user_factory):
    user = user_factory()

    response = client.post("/api/auth/login", json={"email": user.email, "password": "Wrong1!aa"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_unknown_email_returns_same_generic_error(client):
    response = client.post(
        "/api/auth/login", json={"email": "nobody@example.com", "password": VALID_PASSWORD}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_deactivated_account_is_rejected(client, user_factory):
    user = user_factory(is_active=False)

    response = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "This account has been deactivated"


def test_login_updates_last_login(client, user_factory):
    user = user_factory()
    assert user.last_login is None

    body = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    ).json()

    assert body["user"]["last_login"] is not None


def test_refresh_with_cookie_rotates_token_and_requires_csrf(client, user_factory):
    user = user_factory()
    client.post("/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD})
    original_refresh = client.cookies["refresh_token"]
    csrf = client.cookies["csrf_token"]

    missing_csrf = client.post("/api/auth/refresh", json={})
    assert missing_csrf.status_code == 403

    response = client.post("/api/auth/refresh", json={}, headers={"X-CSRF-Token": csrf})
    assert response.status_code == 200, response.text
    assert response.json()["refresh_token"] != original_refresh


def test_refresh_with_body_token_works_for_non_browser_clients(client, user_factory):
    user = user_factory()
    tokens = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    ).json()
    client.cookies.clear()

    response = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})

    assert response.status_code == 200, response.text
    assert response.json()["access_token"]


def test_reused_refresh_token_revokes_the_whole_family(client, user_factory):
    user = user_factory()
    tokens = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    ).json()
    client.cookies.clear()
    first = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    rotated = first.json()["refresh_token"]

    replay = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert replay.status_code == 401

    after_theft = client.post("/api/auth/refresh", json={"refresh_token": rotated})
    assert after_theft.status_code == 401


def test_refresh_with_garbage_token_is_rejected(client):
    response = client.post("/api/auth/refresh", json={"refresh_token": "not-a-real-token"})

    assert response.status_code == 401


def test_logout_revokes_the_session_and_clears_cookies(client, user_factory):
    user = user_factory()
    tokens = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    ).json()

    response = client.post(
        "/api/auth/logout",
        json={},
        headers={"X-CSRF-Token": client.cookies.get("csrf_token", "")},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Signed out"
    assert not client.cookies.get("refresh_token")
    replay = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert replay.status_code == 401


def test_logout_all_devices_revokes_every_session(client, user_factory):
    user = user_factory()
    session_one = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    ).json()
    client.cookies.clear()
    session_two = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    ).json()
    client.cookies.clear()

    response = client.post(
        "/api/auth/logout",
        json={"refresh_token": session_two["refresh_token"], "all_devices": True},
        headers={"Authorization": f"Bearer {session_two['access_token']}"},
    )

    assert response.status_code == 200
    for session in (session_one, session_two):
        assert (
            client.post("/api/auth/refresh", json={"refresh_token": session["refresh_token"]}).status_code
            == 401
        )


def test_remember_me_extends_the_refresh_cookie_lifetime(client, user_factory):
    user = user_factory()

    short = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    )
    short_cookie = short.headers["set-cookie"]
    client.cookies.clear()
    long = client.post(
        "/api/auth/login",
        json={"email": user.email, "password": VALID_PASSWORD, "remember_me": True},
    )

    assert "Max-Age=604800" in short_cookie
    assert "Max-Age=2592000" in long.headers["set-cookie"]


def test_verify_email_flow(client, emails):
    client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    token = emails.last_link("verify-email")

    response = client.post("/api/auth/verify-email", json={"token": token})

    assert response.status_code == 200
    assert response.json()["message"].startswith("Email verified")
    login = client.post(
        "/api/auth/login", json={"email": REGISTER_PAYLOAD["email"], "password": VALID_PASSWORD}
    )
    assert login.json()["user"]["is_verified"] is True
    assert any("Welcome" in message["subject"] for message in emails.sent)


def test_verify_email_token_cannot_be_reused(client, emails):
    client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    token = emails.last_link("verify-email")
    client.post("/api/auth/verify-email", json={"token": token})

    response = client.post("/api/auth/verify-email", json={"token": token})

    assert response.status_code == 401
    assert response.json()["detail"] == "This link is invalid or has expired"


def test_forgot_password_hides_whether_the_account_exists(client, emails):
    known = client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    assert known.status_code == 201
    emails.sent.clear()

    for email in (REGISTER_PAYLOAD["email"], "ghost@example.com"):
        response = client.post("/api/auth/forgot-password", json={"email": email})
        assert response.status_code == 200
        assert response.json()["message"].startswith("If an account matches")

    assert [message["to"] for message in emails.sent] == [REGISTER_PAYLOAD["email"]]


def test_reset_password_updates_credentials_and_kills_sessions(client, emails, user_factory):
    user = user_factory()
    tokens = client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    ).json()
    client.cookies.clear()
    client.post("/api/auth/forgot-password", json={"email": user.email})
    token = emails.last_link("reset-password")

    response = client.post(
        "/api/auth/reset-password", json={"token": token, "new_password": "BrandNew1!"}
    )

    assert response.status_code == 200
    assert client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    ).status_code == 401
    assert client.post(
        "/api/auth/login", json={"email": user.email, "password": "BrandNew1!"}
    ).status_code == 200
    assert client.post(
        "/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    ).status_code == 401


def test_reset_password_rejects_weak_and_reused_tokens(client, emails, user_factory):
    user = user_factory()
    client.post("/api/auth/forgot-password", json={"email": user.email})
    token = emails.last_link("reset-password")

    weak = client.post("/api/auth/reset-password", json={"token": token, "new_password": "abc"})
    assert weak.status_code == 422

    assert client.post(
        "/api/auth/reset-password", json={"token": token, "new_password": "BrandNew1!"}
    ).status_code == 200
    assert client.post(
        "/api/auth/reset-password", json={"token": token, "new_password": "Another1!"}
    ).status_code == 401


def test_change_password_requires_the_current_password(client, user_factory, auth_headers):
    user = user_factory()
    headers = auth_headers(user.email)

    wrong = client.post(
        "/api/auth/change-password",
        json={"current_password": "Nope1234!", "new_password": "BrandNew1!"},
        headers=headers,
    )
    assert wrong.status_code == 401

    ok = client.post(
        "/api/auth/change-password",
        json={"current_password": VALID_PASSWORD, "new_password": "BrandNew1!"},
        headers=headers,
    )
    assert ok.status_code == 200
    assert client.post(
        "/api/auth/login", json={"email": user.email, "password": "BrandNew1!"}
    ).status_code == 200


def test_resend_verification_is_silent_for_verified_accounts(client, emails, user_factory):
    verified = user_factory()
    emails.sent.clear()

    response = client.post("/api/auth/resend-verification", json={"email": verified.email})

    assert response.status_code == 200
    assert emails.sent == []


def test_security_headers_and_docs_are_available(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "Content-Security-Policy" in response.headers
    assert client.get("/api/openapi.json").status_code == 200
