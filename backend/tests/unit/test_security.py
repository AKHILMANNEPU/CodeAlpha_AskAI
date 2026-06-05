import pytest
from fastapi.testclient import TestClient
from app.main import app

# Ensure we aren't calling openrouter
app.dependency_overrides = {}
client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_external_services(mocker):
    # Mock get_ai_client
    mock_get_client = mocker.patch("app.routes.chatbot.get_ai_client")
    mock_client = mocker.MagicMock()
    mock_stream = mocker.MagicMock()
    mock_chunk = mocker.MagicMock()
    mock_chunk.choices = [mocker.MagicMock()]
    mock_chunk.choices[0].delta.content = "mock content"
    mock_stream.__iter__.return_value = [mock_chunk]
    mock_client.chat.completions.create.return_value = mock_stream
    mock_get_client.return_value = (mock_client, "mock-model")
    
    # Mock supabase
    mocker.patch("app.routes.chatbot.supabase")

def test_oversized_input():
    # Simulate a massive payload (e.g. 50,000 A's)
    massive_text = "A" * 50000
    payload = {
        "messages": [{"role": "user", "content": massive_text}],
        "model": "default"
    }
    response = client.post("/chat/stream", json=payload)
    # Fast api validation / pydantic should either accept it (if no length constraint is set) or reject with 422
    assert response.status_code in [200, 422, 400]

def test_xss_injection():
    # Standard XSS payload
    payload = {
        "messages": [{"role": "user", "content": "<script>alert('xss')</script>"}],
        "model": "default"
    }
    response = client.post("/chat/stream", json=payload)
    assert response.status_code == 200

def test_sql_injection_string():
    payload = {
        "messages": [{"role": "user", "content": "'; DROP TABLE messages; --"}],
        "model": "default"
    }
    response = client.post("/chat/stream", json=payload)
    assert response.status_code == 200
