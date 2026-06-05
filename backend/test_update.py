import os
import asyncio
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from app.database.supabase_client import supabase

def test_update():
    print("Testing Supabase Update...")
    # Fetch a chat ID first
    res = supabase.table("chats").select("id, title, is_pinned").limit(1).execute()
    if not res.data:
        print("No chats found")
        return
    
    chat_id = res.data[0]['id']
    old_pin = res.data[0].get('is_pinned', False)
    print(f"Target Chat: {chat_id}, Current Pin: {old_pin}")
    
    # Try to update
    update_res = supabase.table("chats").update({"is_pinned": not old_pin}).eq("id", chat_id).execute()
    print("Update Result:", update_res)

if __name__ == "__main__":
    test_update()
