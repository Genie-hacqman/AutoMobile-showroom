from app.models.user import UserRole
from tests.conftest import VALID_PASSWORD


def test_admin_users_requires_authentication(client):
    assert client.get("/api/admin/users").status_code == 401


def test_regular_user_cannot_list_users(client, user_factory, auth_headers):
    user = user_factory()

    response = client.get("/api/admin/users", headers=auth_headers(user.email))

    assert response.status_code == 403
    assert response.json()["detail"] == "Administrator access required"


def test_admin_can_list_and_filter_users(client, user_factory, auth_headers):
    admin = user_factory(email="admin@example.com", role=UserRole.ADMIN)
    user_factory(email="driver@example.com")

    response = client.get(
        "/api/admin/users", params={"search": "driver@"}, headers=auth_headers(admin.email)
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["email"] == "driver@example.com"


def test_admin_can_deactivate_a_user_and_kill_their_sessions(
    client, user_factory, auth_headers, login
):
    admin = user_factory(email="admin@example.com", role=UserRole.ADMIN)
    victim = user_factory(email="victim@example.com")
    victim_tokens = login(victim.email)
    client.cookies.clear()

    response = client.patch(
        f"/api/admin/users/{victim.id}",
        json={"is_active": False},
        headers=auth_headers(admin.email),
    )

    assert response.status_code == 200, response.text
    assert response.json()["is_active"] is False
    # Deactivation revokes the stored refresh tokens, so the rotation is rejected outright.
    assert client.post(
        "/api/auth/refresh", json={"refresh_token": victim_tokens["refresh_token"]}
    ).status_code == 401
    assert client.post(
        "/api/auth/login", json={"email": victim.email, "password": VALID_PASSWORD}
    ).status_code == 403


def test_admin_can_promote_and_delete_users(client, user_factory, auth_headers):
    admin = user_factory(email="admin@example.com", role=UserRole.ADMIN)
    user = user_factory(email="promote@example.com")
    headers = auth_headers(admin.email)

    promoted = client.patch(
        f"/api/admin/users/{user.id}", json={"role": "admin"}, headers=headers
    )
    assert promoted.status_code == 200
    assert promoted.json()["role"] == "admin"

    deleted = client.delete(f"/api/admin/users/{user.id}", headers=headers)
    assert deleted.status_code == 200
    assert client.get(f"/api/admin/users/{user.id}", headers=headers).status_code == 404


def test_admin_cannot_deactivate_themselves(client, user_factory, auth_headers):
    admin = user_factory(email="admin@example.com", role=UserRole.ADMIN)

    response = client.patch(
        f"/api/admin/users/{admin.id}",
        json={"is_active": False},
        headers=auth_headers(admin.email),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Administrators cannot demote or deactivate themselves"


def test_deactivated_user_cannot_use_an_existing_access_token(client, user_factory, auth_headers):
    admin = user_factory(email="admin@example.com", role=UserRole.ADMIN)
    victim = user_factory(email="victim@example.com")
    victim_headers = auth_headers(victim.email)

    client.patch(
        f"/api/admin/users/{victim.id}",
        json={"is_active": False},
        headers=auth_headers(admin.email),
    )

    response = client.get("/api/users/me", headers=victim_headers)
    assert response.status_code == 403
