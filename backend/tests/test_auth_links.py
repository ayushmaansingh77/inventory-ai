import pytest

from app.services.auth_service import _frontend_base_url


@pytest.fixture(autouse=True)
def _env(monkeypatch):
    monkeypatch.setenv("FRONTEND_URL", "https://stockmind.example.app/")
    monkeypatch.delenv("ALLOWED_FRONTEND_ORIGINS", raising=False)
    monkeypatch.setenv("FLASK_ENV", "production")


def test_defaults_to_configured_frontend_url():
    assert _frontend_base_url() == "https://stockmind.example.app"


def test_honours_configured_origin():
    assert _frontend_base_url("https://stockmind.example.app") == "https://stockmind.example.app"


def test_rejects_unknown_origin():
    assert _frontend_base_url("https://evil.example.com") == "https://stockmind.example.app"


def test_localhost_rejected_in_production():
    assert _frontend_base_url("http://localhost:5173") == "https://stockmind.example.app"


def test_extra_allowed_origin(monkeypatch):
    monkeypatch.setenv("ALLOWED_FRONTEND_ORIGINS", "https://preview.example.app, https://other.example.app")
    assert _frontend_base_url("https://preview.example.app/") == "https://preview.example.app"


def test_localhost_and_lan_allowed_in_development(monkeypatch):
    monkeypatch.setenv("FLASK_ENV", "development")
    assert _frontend_base_url("http://localhost:5173") == "http://localhost:5173"
    assert _frontend_base_url("http://192.168.1.20:5173") == "http://192.168.1.20:5173"
    assert _frontend_base_url("http://evil.example.com:5173") == "https://stockmind.example.app"
