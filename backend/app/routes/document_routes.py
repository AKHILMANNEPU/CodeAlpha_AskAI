from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid

from app.services.document_service import DocumentService
from app.services.vector_service import vector_service

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate unique ID for the document
        doc_id = str(uuid.uuid4())
        _, ext = os.path.splitext(file.filename.lower())
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}{ext}")
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract and Chunk
        text = DocumentService.extract_text(file_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Document contains no extractable text.")
            
        chunks = DocumentService.chunk_text(text, chunk_size=500)
        
        # Embed and Add to FAISS Index
        vector_service.add_document(doc_id, chunks)
        
        return {
            "message": "File uploaded and indexed successfully",
            "document_id": doc_id,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
