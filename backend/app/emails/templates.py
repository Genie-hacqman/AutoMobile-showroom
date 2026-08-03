import html

from app.core.config import settings

_LAYOUT = """<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <h1 style="font-size:20px;margin:0 0 8px;">{title}</h1>
      <p style="font-size:14px;line-height:22px;color:#334155;">{body}</p>
      {action}
      <p style="font-size:12px;color:#64748b;margin-top:32px;">{footer}</p>
    </div>
  </body>
</html>
"""

_BUTTON = (
    '<p style="margin:24px 0;">'
    '<a href="{url}" style="background:#0f172a;color:#ffffff;border-radius:999px;'
    'padding:12px 24px;text-decoration:none;font-size:14px;display:inline-block;">{label}</a>'
    "</p>"
    '<p style="font-size:12px;color:#64748b;">Or paste this link into your browser:<br />{url}</p>'
)


def _render(title: str, body: str, url: str | None = None, label: str | None = None) -> tuple[str, str]:
    footer = f"{settings.email_from_name} &middot; This is an automated message."
    action = _BUTTON.format(url=html.escape(url, quote=True), label=html.escape(label or "Continue")) if url else ""
    html_body = _LAYOUT.format(title=html.escape(title), body=html.escape(body), action=action, footer=footer)
    text_body = f"{title}\n\n{body}\n"
    if url:
        text_body += f"\n{label}: {url}\n"
    return html_body, text_body


def verify_email(first_name: str, url: str) -> tuple[str, str]:
    return _render(
        "Verify your email address",
        f"Hi {first_name}, confirm your email address to activate your Obolo Motors account. "
        f"This link expires in {settings.email_verification_token_expire_hours} hours.",
        url,
        "Verify email",
    )


def welcome_email(first_name: str) -> tuple[str, str]:
    return _render(
        "Welcome to Obolo Motors",
        f"Hi {first_name}, your email is verified and your garage is ready. "
        "Sign in to browse the inventory and save your favourite vehicles.",
        settings.frontend_base_url,
        "Open Obolo Motors",
    )


def reset_password_email(first_name: str, url: str) -> tuple[str, str]:
    return _render(
        "Reset your password",
        f"Hi {first_name}, we received a request to reset your password. "
        f"This link expires in {settings.password_reset_token_expire_minutes} minutes. "
        "If you did not request it you can safely ignore this email.",
        url,
        "Reset password",
    )


def password_changed_email(first_name: str) -> tuple[str, str]:
    return _render(
        "Your password was changed",
        f"Hi {first_name}, your Obolo Motors password was just changed and all other sessions were signed out. "
        "If this was not you, reset your password immediately.",
    )


def account_deleted_email(first_name: str) -> tuple[str, str]:
    return _render(
        "Your account was deleted",
        f"Hi {first_name}, your Obolo Motors account and personal data have been removed. "
        "We are sorry to see you go.",
    )
