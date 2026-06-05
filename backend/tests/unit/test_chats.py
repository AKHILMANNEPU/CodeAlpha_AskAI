import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_supabase(mocker):
    # Mock the supabase module where it is imported in chats
    mock_sb = mocker.patch("app.routes.chats.supabase")
    return mock_sb

def test_get_chats_success(mock_supabase):
    mock_execute = MagicMock()
    mock_execute.data = [{"id": "1", "title": "Test Chat"}]
    
    # Setup chain: table().select().order().order().execute()
    mock_supabase.table.return_value.select.return_value.order.return_value.order.return_value.execute.return_value = mock_execute
    
    response = client.get("/chats")
    assert response.status_code == 200
    assert response.json() == [{"id": "1", "title": "Test Chat"}]

def test_delete_chat(mock_supabase):
    mock_execute = MagicMock()
    mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value = mock_execute
    
    response = client.delete("/chats/123")
    assert response.status_code == 200
    assert response.json() == {"success": True}

def test_update_chat(mock_supabase):
    mock_execute = MagicMock()
    mock_execute.data = [{"id": "123", "title": "Updated", "is_pinned": True}]
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_execute
    
    response = client.patch("/chats/123", json={"title": "Updated", "is_pinned": True})
    assert response.status_code == 200
    assert response.json() == {"id": "123", "title": "Updated", "is_pinned": True}

def test_get_chat_messages(mock_supabase):
    mock_execute = MagicMock()
    mock_execute.data = [{"id": "msg1", "role": "user", "content": "hello"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_execute
    
    response = client.get("/chats/123")
    assert response.status_code == 200
    assert response.json() == [{"id": "msg1", "role": "user", "content": "hello"}]
