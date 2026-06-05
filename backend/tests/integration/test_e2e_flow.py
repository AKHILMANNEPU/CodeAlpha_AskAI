import pytest
from fastapi.testclient import TestClient
from app.main import app

# Don't mock out open router here; the guide asks for an integration test to OpenRouter.
# But since this is a background automated test, we'll hit it with a tiny payload to avoid huge costs/latency.
client = TestClient(app)

def test_full_chat_flow():
    # Phase 3.1: Full chat flow E2E simulation via API
    payload = {
        "messages": [{"role": "user", "content": "Say hello world and nothing else."}],
        "model": "google/gemma-2-9b-it:free", # test model switching Phase 3.2
        "chat_id": "test-chat-123"
    }
    
    with client.stream("POST", "/chat/stream", json=payload) as response:
        assert response.status_code == 200
        
        # Verify streaming text
        streamed_chunks = list(response.iter_lines())
        
        # Usually it sends data: {...} then data: [DONE]
        # Just ensure we get at least one data chunk
        assert len(streamed_chunks) > 0
        assert b"data:" in streamed_chunks[0]

def test_model_switching():
    # Phase 3.2: Model Switching test
    # By passing a different model string, the backend should route it to that model.
    # We verify the backend accepts it.
    payload = {
        "messages": [{"role": "user", "content": "Testing model switch"}],
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "chat_id": "test-chat-456"
    }
    
    with client.stream("POST", "/chat/stream", json=payload) as response:
        assert response.status_code == 200
        streamed_chunks = list(response.iter_lines())
        assert len(streamed_chunks) > 0
