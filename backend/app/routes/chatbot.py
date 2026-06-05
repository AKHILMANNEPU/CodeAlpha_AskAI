import json
import os
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest
from app.database.supabase_client import supabase_admin as supabase
from app.utils.preprocessing import preprocess_text
from app.utils.intent_detector import detect_intent
from app.services.translation_service import detect_language, translate_to_english, translate_to_target
from app.services.vector_service import vector_service

router = APIRouter()

def get_ai_client():
    if os.getenv("OPENROUTER_API_KEY"):
        from openai import OpenAI
        return OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        ), "meta-llama/llama-3.3-70b-instruct:free"
    else:
        from together import Together
        return Together(api_key=os.getenv("TOGETHER_API_KEY")), "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

import time

@router.post("/chat/stream")
def chat_stream(request: ChatRequest):
    client, default_model = get_ai_client()
    model_to_use = request.model if request.model and request.model != "default" else default_model

    def generate():
        try:
            if not request.messages:
                yield "data: [DONE]\n\n"
                return

            user_message = request.messages[-1].content
            chat_id = request.chat_id

            # Database creation logic
            if not chat_id and supabase:
                title = user_message[:30] + "..." if len(user_message) > 30 else user_message
                chat_insert = supabase.table("chats").insert({
                    "title": title,
                    "project_id": request.project_id,
                    "user_id": request.user_id
                }).execute()
                chat_id = chat_insert.data[0]["id"]
                yield f"data: {json.dumps({'chat_id': chat_id})}\n\n"

            if supabase and chat_id:
                # TODO: CRITICAL BEFORE DEPLOYMENT
                # We are using supabase_admin (Service Role) here to bypass RLS.
                # Before deploying to production, ensure proper RLS policies are set up
                # and consider passing the user's JWT token to authenticate requests natively.
                try:
                    supabase.table("messages").insert({
                        "chat_id": chat_id,
                        "role": "user",
                        "content": user_message
                    }).execute()
                except Exception as e:
                    print(f"Non-fatal error logging user message: {e}")

            # ==== NLP PIPELINE ====
            # 1. Language Detection
            explicit_lang = request.language.split('-')[0] if request.language else None
            user_language = detect_language(user_message, explicit_lang=explicit_lang)
            
            # 2. Translation to English
            translated_query = translate_to_english(user_message, source_lang=user_language)
            
            # 3. Preprocessing
            processed_query = preprocess_text(translated_query)
            
            # 4. Intent Detection
            intent = detect_intent(processed_query)
            # (We could branch logic here based on intent, but for now we proceed to search)
            
            # 5 & 6. Embedding & FAISS Vector Search
            faq_match_en = vector_service.search_faqs(processed_query)
            
            if faq_match_en:
                # 7. Translation to Target Language
                faq_match = translate_to_target(faq_match_en, target_lang=user_language)
                
                # Stream the FAQ answer back to look natural
                words = faq_match.split()
                for i in range(0, len(words), 3):
                    chunk = " ".join(words[i:i+3]) + " "
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                    time.sleep(0.05)

                if supabase and chat_id:
                    try:
                        supabase.table("messages").insert({
                            "chat_id": chat_id,
                            "role": "assistant",
                            "content": faq_match
                        }).execute()
                    except Exception as e:
                        print(f"Non-fatal error logging assistant message: {e}")
                    
                # Analytics Log
                if supabase:
                    try:
                        supabase.table("chat_logs").insert({
                            "question": user_message,
                            "answer": faq_match,
                            "language": request.language,
                            "input_type": request.input_type
                        }).execute()
                    except Exception as e:
                        print(f"Non-fatal error logging analytics: {e}")
                
                yield "data: [DONE]\n\n"
                return

            # ==== GENERATIVE AI FALLBACK / RAG ====
            system_prompt = (
                "You are an intelligent, helpful AI assistant built for this application. "
                "You provide clear, concise, and accurate answers."
            )
            
            # Inject RAG Context if document_id is provided
            if request.document_id:
                retrieved_chunks = vector_service.search_document(request.document_id, processed_query, top_k=3)
                if retrieved_chunks:
                    context = "\n\n".join(retrieved_chunks)
                    system_prompt += (
                        "\n\nYou have been provided with the following document context to help answer the user's question. "
                        "Base your answer ONLY on this context if it is relevant. If the answer is not in the context, say so.\n\n"
                        f"--- DOCUMENT CONTEXT ---\n{context}\n------------------------"
                    )
            
            api_messages = [{"role": "system", "content": system_prompt}]
            for msg in request.messages:
                api_messages.append({"role": msg.role, "content": msg.content})

            # OpenRouter Automatic Fallback Routing
            extra_params = {}
            if os.getenv("OPENROUTER_API_KEY"):
                extra_params["extra_body"] = {
                    "models": [
                        model_to_use,
                        "google/gemma-2-9b-it:free",
                        "meta-llama/llama-3.1-8b-instruct:free"
                    ]
                }

            stream = client.chat.completions.create(
                model=model_to_use,
                messages=api_messages,
                stream=True,
                timeout=15,
                **extra_params
            )

            full_assistant_message = ""
            for chunk in stream:
                if getattr(chunk.choices[0].delta, 'content', None):
                    content = chunk.choices[0].delta.content
                    full_assistant_message += content
                    yield f"data: {json.dumps({'content': content})}\n\n"

            if supabase and chat_id:
                try:
                    supabase.table("messages").insert({
                        "chat_id": chat_id,
                        "role": "assistant",
                        "content": full_assistant_message
                    }).execute()
                except Exception as e:
                    print(f"Non-fatal error logging final message: {e}")

            # Analytics Log
            if supabase:
                try:
                    supabase.table("chat_logs").insert({
                        "question": user_message,
                        "answer": full_assistant_message,
                        "language": request.language,
                        "input_type": request.input_type
                    }).execute()
                except Exception as e:
                    print(f"Non-fatal error logging analytics final: {e}")

            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
