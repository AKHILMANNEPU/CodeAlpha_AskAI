import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_supabase_admin(mocker):
    return mocker.patch("app.routes.users.supabase_admin")

def test_delete_user_success(mock_supabase_admin):
    # Setup mock
    mock_supabase_admin.auth.admin.delete_user.return_value = True

    response = client.delete("/users/test-user-123")
    
    assert response.status_code == 200
    assert response.json() == {"success": True, "message": "User deleted successfully."}
    mock_supabase_admin.auth.admin.delete_user.assert_called_once_with("test-user-123")

def test_delete_user_failure(mock_supabase_admin):
    # Setup mock to raise an exception
    mock_supabase_admin.auth.admin.delete_user.side_effect = Exception("User not found")

    response = client.delete("/users/invalid-user")
    
    assert response.status_code == 400
    assert response.json() == {"detail": "User not found"}
