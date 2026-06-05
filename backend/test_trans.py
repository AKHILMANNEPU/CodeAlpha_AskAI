from deep_translator import GoogleTranslator
from deep_translator.detect import single_detection

# Detect language
try:
    text = 'నా ఆర్డర్ను ఎలా ట్రాక్ చేయాలి?'
    lang = single_detection(text, api_key='7c8340d85ab2a12a32c24c2ed2c140cb') # You can also use GoogleTranslator to detect indirectly if single_detection needs an api key.
except Exception as e:
    lang = 'unknown'
    print(e)

print(f"Detected: {lang}")

translator = GoogleTranslator(source='auto', target='en')
print("English:", translator.translate(text))
