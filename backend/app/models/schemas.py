from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    chat_id: Optional[str] = None
    messages: List[Message]
    model: str = "default"
    project_id: Optional[str] = None
    user_id: Optional[str] = None
    language: Optional[str] = "en-US"
    input_type: Optional[str] = "text"
    document_id: Optional[str] = None
