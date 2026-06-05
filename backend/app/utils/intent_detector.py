intents = {
    "restaurant": "restaurant_search",
    "food": "restaurant_search",
    "eat": "restaurant_search",
    "hotel": "hotel_booking",
    "stay": "hotel_booking",
    "train": "train_booking",
    "ticket": "train_booking",
    "price": "pricing_query",
    "cost": "pricing_query",
    "hi": "greeting",
    "hello": "greeting",
    "hey": "greeting",
}

def detect_intent(text: str) -> str:
    """
    Detects the user intent based on keyword mapping.
    """
    text_lower = text.lower()
    for keyword, intent in intents.items():
        # Check for whole word match to avoid substring false positives
        if f" {keyword} " in f" {text_lower} ":
            return intent
    return "general_query"
