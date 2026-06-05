from sentence_transformers import SentenceTransformer
import spacy
import sys
import subprocess

print("Downloading SpaCy model...")
try:
    spacy.load("en_core_web_sm")
    print("SpaCy model already exists.")
except OSError:
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])

print("Downloading SentenceTransformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model downloaded successfully!")
