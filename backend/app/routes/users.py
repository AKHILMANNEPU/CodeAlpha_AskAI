from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database.supabase_client import supabase, supabase_admin

router = APIRouter()

class DeleteUserRequest(BaseModel):
    user_id: str

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Supabase Admin client not configured. Missing SUPABASE_SERVICE_ROLE_KEY.")
    
    try:
        # Delete the user from Supabase Auth
        res = supabase_admin.auth.admin.delete_user(user_id)
        
        # The chats and messages associated with the user should ideally be deleted via ON DELETE CASCADE in the database.
        # Otherwise, they can be manually deleted here:
        # supabase_admin.table('chats').delete().eq('user_id', user_id).execute()
        
        return {"success": True, "message": "User deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
