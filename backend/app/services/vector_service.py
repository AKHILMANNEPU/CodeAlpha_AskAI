import json
import os
import hashlib
import numpy as np
import faiss

from app.services.embedding_service import get_embedding_model
from app.utils.preprocessing import preprocess_text

class VectorService:
    def __init__(self, json_path: str = "faqs.json"):
        self.faqs = []
        self.index = None
        self.json_path = json_path
        self.cache_path = "faq_faiss.index"
        self.hash_path = "faq_hash.txt"
        
        # RAG specific indices
        self.rag_indices = {}  # doc_id -> index
        self.rag_chunks = {}   # doc_id -> list of chunks
        
        self.load_faqs()

    # --- FAQ Search ---
    def calculate_file_hash(self):
        if not os.path.exists(self.json_path):
            return ""
        with open(self.json_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()

    def load_faqs(self):
        if not os.path.exists(self.json_path):
            print(f"VectorService warning: {self.json_path} not found.")
            return
            
        try:
            with open(self.json_path, 'r', encoding='utf-8') as f:
                self.faqs = json.load(f)
                
            if not self.faqs:
                return

            current_hash = self.calculate_file_hash()
            
            if os.path.exists(self.cache_path) and os.path.exists(self.hash_path):
                with open(self.hash_path, 'r') as f:
                    saved_hash = f.read().strip()
                if saved_hash == current_hash:
                    self.index = faiss.read_index(self.cache_path)
                    return
            
            print(f"Computing embeddings for {len(self.faqs)} FAQs and building FAISS index...")
            model = get_embedding_model()
            preprocessed_questions = [preprocess_text(faq['question']) for faq in self.faqs]
            faq_embeddings = model.encode(preprocessed_questions)
            faq_embeddings = np.array(faq_embeddings).astype('float32')
            
            dimension = faq_embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dimension)
            self.index.add(faq_embeddings)
            
            faiss.write_index(self.index, self.cache_path)
            with open(self.hash_path, 'w') as f:
                f.write(current_hash)
                
        except Exception as e:
            print(f"VectorService error loading FAQs: {e}")

    def search_faqs(self, processed_query: str, threshold_distance: float = 0.65):
        if not self.faqs or self.index is None or not processed_query.strip():
            return None

        model = get_embedding_model()
        query_vector = model.encode([processed_query])
        query_vector = np.array(query_vector).astype('float32')

        k = 1
        distances, indices = self.index.search(query_vector, k)

        best_distance = distances[0][0]
        best_match_idx = indices[0][0]

        if best_distance <= threshold_distance:
            return self.faqs[best_match_idx]['answer']
        
        return None

    # --- RAG Search ---
    def add_document(self, doc_id: str, chunks: list[str]):
        """Adds a document's chunks to a temporary FAISS index."""
        if not chunks:
            return
            
        model = get_embedding_model()
        print(f"Computing embeddings for document {doc_id} with {len(chunks)} chunks...")
        chunk_embeddings = model.encode(chunks)
        chunk_embeddings = np.array(chunk_embeddings).astype('float32')
        
        dimension = chunk_embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(chunk_embeddings)
        
        self.rag_indices[doc_id] = index
        self.rag_chunks[doc_id] = chunks
        print(f"Document {doc_id} indexed successfully.")

    def search_document(self, doc_id: str, processed_query: str, top_k: int = 3) -> list[str]:
        """Searches the document index for relevant chunks."""
        if doc_id not in self.rag_indices or not processed_query.strip():
            return []
            
        model = get_embedding_model()
        query_vector = model.encode([processed_query])
        query_vector = np.array(query_vector).astype('float32')
        
        index = self.rag_indices[doc_id]
        chunks = self.rag_chunks[doc_id]
        
        distances, indices = index.search(query_vector, min(top_k, len(chunks)))
        
        retrieved_chunks = []
        for idx in indices[0]:
            if idx >= 0 and idx < len(chunks):
                retrieved_chunks.append(chunks[idx])
                
        return retrieved_chunks

# Singleton instance
vector_service = VectorService(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "faqs.json"))
