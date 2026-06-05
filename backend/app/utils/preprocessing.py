import spacy

nlp = None

def load_spacy_model():
    global nlp
    if not nlp:
        try:
            nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spacy model...")
            import subprocess
            import sys
            subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
            nlp = spacy.load("en_core_web_sm")

def preprocess_text(text: str) -> str:
    """
    Uses SpaCy to tokenize, remove stopwords, and lemmatize text.
    """
    if not nlp:
        load_spacy_model()
    
    doc = nlp(text.lower())
    cleaned_tokens = [
        token.lemma_ for token in doc 
        if not token.is_stop and token.is_alpha
    ]
    return " ".join(cleaned_tokens)
