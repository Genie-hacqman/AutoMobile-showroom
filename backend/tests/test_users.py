from app.models.user import UserRole
from tests.conftest import VALID_PASSWORD


def test_me_requires_authentication(client):
    response = client.get("/api/users/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_me_rejects_an_invalid_token(client):
    response = client.get("/api/users/me", headers={"Authorization": "Bearer garbage.token.value"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token"


def test_me_returns_the_current_profile(client, user_factory, auth_headers):
    user = user_factory()

    response = client.get("/api/users/me", headers=auth_headers(user.email))

    assert response.status_code == 200
    assert response.json()["email"] == user.email
    assert "password_hash" not in response.json()


def test_update_profile(client, user_factory, auth_headers):
    user = user_factory()

    response = client.put(
        "/api/users/me",
        json={
            "first_name": "Updated",
            "last_name": "Name",
            "phone": "+2348090000000",
            "profile_image": "https://cdn.example.com/avatar.png",
        },
        headers=auth_headers(user.email),
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["first_name"] == "Updated"
    assert body["profile_image"] == "https://cdn.example.com/avatar.png"


def test_update_profile_blocks_javascript_image_urls(client, user_factory, auth_headers):
    user = user_factory()

    response = client.put(
        "/api/users/me",
        json={"profile_image": "javascript:alert('xss')"},
        headers=auth_headers(user.email),
    )

    assert response.status_code == 422
    assert any(error["field"] == "profile_image" for error in response.json()["errors"])


def test_update_profile_cannot_escalate_role(client, user_factory, auth_headers):
    user = user_factory()

    response = client.put(
        "/api/users/me", json={"role": "admin"}, headers=auth_headers(user.email)
    )

    assert response.status_code == 200
    assert response.json()["role"] == UserRole.USER.value


def test_delete_account_removes_access(client, user_factory, login):
    user = user_factory()
    tokens = login(user.email)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    response = client.delete("/api/users/me", headers=headers)

    assert response.status_code == 200
    assert response.json()["message"] == "Your account has been deleted"
    assert client.get("/api/users/me", headers=headers).status_code == 401
    assert client.post(
        "/api/auth/login", json={"email": user.email, "password": VALID_PASSWORD}
    ).status_code == 401
