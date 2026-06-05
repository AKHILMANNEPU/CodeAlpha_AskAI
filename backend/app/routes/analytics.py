from fastapi import APIRouter
from app.database.supabase_client import supabase

router = APIRouter()

@router.get("/analytics")
async def get_analytics():
    if not supabase:
        return []
    res = supabase.table("chat_logs").select("*").order("created_at", desc=True).execute()
    return res.data
