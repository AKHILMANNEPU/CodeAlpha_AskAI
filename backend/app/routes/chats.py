from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.database.supabase_client import supabase

router = APIRouter()

class ChatUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None

@router.get("/chats")
async def get_chats(user_id: str = None, project_id: str = None):
    if not supabase:
        return []
    
    # We want to order by is_pinned descending, then created_at descending.
    # Supabase allows multiple order by clauses.
    query = supabase.table("chats").select("*").order("is_pinned", desc=True, nullsfirst=False).order("created_at", desc=True)
    if user_id:
        query = query.eq("user_id", user_id)
    if project_id:
        query = query.eq("project_id", project_id)
        
    res = query.execute()
    return res.data

@router.get("/chats/{chat_id}")
async def get_chat_messages(chat_id: str):
    if not supabase:
        return []
    
    # Fetch messages associated with this chat_id, ordered by created_at ascending
    res = supabase.table("messages").select("*").eq("chat_id", chat_id).order("created_at", desc=False).execute()
    
    # We map the database schema back to what the frontend expects
    messages = []
    for row in res.data:
        messages.append({
            "id": row.get("id"),
            "role": row.get("role"),
            "content": row.get("content")
        })
    return messages

@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str):
    if not supabase:
        return {"success": False}
    supabase.table("chats").delete().eq("id", chat_id).execute()
    return {"success": True}

@router.patch("/chats/{chat_id}")
async def update_chat(chat_id: str, payload: ChatUpdate):
    if not supabase:
        return {"success": False}
    
    update_data = {}
    if payload.title is not None:
        update_data["title"] = payload.title
    if payload.is_pinned is not None:
        update_data["is_pinned"] = payload.is_pinned
        
    if not update_data:
        return {"success": True}
        
    res = supabase.table("chats").update(update_data).eq("id", chat_id).execute()
    return res.data[0] if res.data else {"success": False}
