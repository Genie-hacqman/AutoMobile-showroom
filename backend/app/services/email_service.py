import smtplib
import ssl
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path

from app.core.config import settings
from app.emails.templates import (
    account_deleted_email,
    password_changed_email,
    reset_password_email,
    verify_email,
    welcome_email,
)


class EmailService:
    """Sends transactional email through SMTP, falling back to an on-disk outbox."""

    def __init__(self, outbox_dir: Path | None = None) -> None:
        self.outbox_dir = outbox_dir or settings.email_outbox_dir

    def send(self, to: str, subject: str, html_body: str, text_body: str) -> None:
        message = EmailMessage()
        message["From"] = f"{settings.email_from_name} <{settings.email_from}>"
        message["To"] = to
        message["Subject"] = subject
        message.set_content(text_body)
        message.add_alternative(html_body, subtype="html")

        if not settings.smtp_host:
            self._write_to_outbox(to, subject, message)
            return

        if settings.smtp_use_tls:
            context = ssl.create_default_context()
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
                server.starttls(context=context)
                if settings.smtp_username:
                    server.login(settings.smtp_username, settings.smtp_password)
                server.send_message(message)
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
                if settings.smtp_username:
                    server.login(settings.smtp_username, settings.smtp_password)
                server.send_message(message)

    def _write_to_outbox(self, to: str, subject: str, message: EmailMessage) -> None:
        self.outbox_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f")
        safe_to = to.replace("@", "_at_").replace("/", "_")
        target = self.outbox_dir / f"{stamp}-{safe_to}.eml"
        target.write_text(message.as_string(), encoding="utf-8")

    def send_verification_email(self, to: str, first_name: str, token: str) -> None:
        url = settings.verify_email_url(token)
        html_body, text_body = verify_email(first_name, url)
        self.send(to, "Verify your Obolo Motors account", html_body, text_body)

    def send_welcome_email(self, to: str, first_name: str) -> None:
        html_body, text_body = welcome_email(first_name)
        self.send(to, "Welcome to Obolo Motors", html_body, text_body)

    def send_password_reset_email(self, to: str, first_name: str, token: str) -> None:
        url = settings.reset_password_url(token)
        html_body, text_body = reset_password_email(first_name, url)
        self.send(to, "Reset your Obolo Motors password", html_body, text_body)

    def send_password_changed_email(self, to: str, first_name: str) -> None:
        html_body, text_body = password_changed_email(first_name)
        self.send(to, "Your Obolo Motors password was changed", html_body, text_body)

    def send_account_deleted_email(self, to: str, first_name: str) -> None:
        html_body, text_body = account_deleted_email(first_name)
        self.send(to, "Your Obolo Motors account was deleted", html_body, text_body)


email_service = EmailService()
