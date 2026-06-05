import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.routes.chatbot import router as chatbot_router
from app.routes.chats import router as chats_router
from app.routes.analytics import router as analytics_router
from app.routes.document_routes import router as document_router
from app.routes.users import router as users_router

app = FastAPI(title="Scalable AI FAQ Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chatbot_router)
app.include_router(chats_router)
app.include_router(analytics_router)
app.include_router(document_router)
app.include_router(users_router)

@app.get("/")
def read_root():
    return {"message": "Chatbot Backend is running modularly!"}
