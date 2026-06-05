import json

ECOMMERCE_FILE = "dataset/archive1/Ecommerce_FAQ_Chatbot_dataset.json"
FAQ_FILE = "faqs.json"

def parse_ecommerce():
    with open(FAQ_FILE, 'r', encoding='utf-8') as f:
        all_faqs = json.load(f)
        
    seen_questions = set([f['question'].lower().strip() for f in all_faqs])
    
    with open(ECOMMERCE_FILE, 'r', encoding='utf-8') as f:
        ecommerce_data = json.load(f)
        
    extracted_count = 0
    for item in ecommerce_data.get("questions", []):
        question = item.get("question", "").strip()
        answer = item.get("answer", "").strip()
        
        if question and answer and question.lower() not in seen_questions:
            all_faqs.append({
                "question": question,
                "answer": answer
            })
            seen_questions.add(question.lower())
            extracted_count += 1
            
    with open(FAQ_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_faqs, f, indent=2)
        
    print(f"Successfully extracted {extracted_count} e-commerce FAQs.")
    print(f"Total FAQs in database: {len(all_faqs)}")

if __name__ == "__main__":
    parse_ecommerce()
