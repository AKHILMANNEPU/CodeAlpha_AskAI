from sentence_transformers import SentenceTransformer
import os

# Disable parallel tokenization warning
os.environ["TOKENIZERS_PARALLELISM"] = "false"

model = None

def get_embedding_model():
    global model
    if model is None:
        print("Loading SentenceTransformer model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
    return model
