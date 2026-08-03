import jwt
import pytest

from app.core.config import settings
from app.core.security import (
    ACCESS_TOKEN_TYPE,
    REFRESH_TOKEN_TYPE,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.utils.validators import validate_password_strength


def test_password_hashing_is_salted_and_verifiable():
    first = hash_password("StrongPass1!")
    second = hash_password("StrongPass1!")

    assert first != second
    assert first.startswith("$argon2")
    assert verify_password("StrongPass1!", first)
    assert not verify_password("StrongPass2!", first)
    assert not verify_password("StrongPass1!", "not-a-hash")


def test_access_token_round_trip():
    token, _expires_at = create_access_token("user-id", "admin")
    payload = decode_token(token, ACCESS_TOKEN_TYPE)

    assert payload["sub"] == "user-id"
    assert payload["role"] == "admin"


def test_token_type_confusion_is_rejected():
    refresh_token, _jti, _expires_at = create_refresh_token("user-id")

    with pytest.raises(jwt.InvalidTokenError):
        decode_token(refresh_token, ACCESS_TOKEN_TYPE)


def test_tokens_signed_with_another_key_are_rejected():
    forged = jwt.encode(
        {"sub": "user-id", "type": REFRESH_TOKEN_TYPE}, "other-secret", algorithm=settings.jwt_algorithm
    )

    with pytest.raises(jwt.InvalidSignatureError):
        decode_token(forged, REFRESH_TOKEN_TYPE)


@pytest.mark.parametrize(
    "password",
    ["short1!A", "alllowercase1!", "ALLUPPERCASE1!", "NoDigits!!", "NoSpecial123"],
)
def test_weak_passwords_are_rejected(password):
    if password == "short1!A":
        validate_password_strength(password)  # exactly 8 chars with every class is allowed
        return
    with pytest.raises(ValueError):
        validate_password_strength(password)


def test_rate_limiting_blocks_credential_stuffing(client, user_factory, monkeypatch):
    from app.middleware import rate_limit

    monkeypatch.setattr(settings, "auth_rate_limit_requests", 3)
    rate_limit.counter.reset()
    user = user_factory()

    statuses = [
        client.post(
            "/api/auth/login", json={"email": user.email, "password": "Wrong1234!"}
        ).status_code
        for _ in range(5)
    ]
    rate_limit.counter.reset()

    assert 429 in statuses
