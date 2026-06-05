from deep_translator import GoogleTranslator
from langdetect import detect_langs

def detect_language(text: str, explicit_lang: str = None) -> str:
    """Detects the language of the input text, trusting explicit_lang if provided."""
    if explicit_lang and explicit_lang != 'en':
        return explicit_lang
        
    try:
        langs = detect_langs(text)
        best_lang = langs[0]
        if len(text.strip()) < 15 and best_lang.prob < 0.9:
            return 'en'
        return best_lang.lang
    except Exception:
        return 'en'

def translate_to_english(text: str, source_lang: str) -> str:
    """Translates text to English if it is not already."""
    if source_lang == 'en':
        return text
    try:
        return GoogleTranslator(source='auto', target='en').translate(text)
    except Exception as e:
        print("Translation to EN Error:", e)
        return text

def translate_to_target(text: str, target_lang: str) -> str:
    """Translates text to the target language."""
    if target_lang == 'en':
        return text
    try:
        return GoogleTranslator(source='en', target=target_lang).translate(text)
    except Exception as e:
        print("Translation to Target Error:", e)
        return text
