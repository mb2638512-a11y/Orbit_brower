import os
from fastapi.testclient import TestClient
import main

client = TestClient(main.app)

def test_health_does_not_expose_secrets():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert "AI_API_KEY" not in str(body)

def test_search_requires_backend(monkeypatch):
    monkeypatch.delenv("SEARXNG_URL", raising=False)
    response = client.get("/api/search", params={"q": "orbit browser"})
    assert response.status_code == 503

def test_chat_requires_server_side_credentials(monkeypatch):
    for key in ("AI_BASE_URL", "AI_API_KEY", "AI_MODEL"):
        monkeypatch.delenv(key, raising=False)
    response = client.post("/api/ai/chat", json={"messages": [{"role": "user", "content": "hello"}]})
    assert response.status_code == 503

def test_chat_rejects_invalid_role():
    response = client.post("/api/ai/chat", json={"messages": [{"role": "tool", "content": "hello"}]})
    assert response.status_code == 422


def test_research_requires_search_backend(monkeypatch):
    monkeypatch.delenv("SEARXNG_URL", raising=False)
    response = client.post("/api/ai/research", json={"messages": [{"role": "user", "content": "latest browser engines"}]})
    assert response.status_code == 503
