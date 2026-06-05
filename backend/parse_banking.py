import os
import csv
import json

CSV_FILE = "dataset/banking/banking_knowledge_base_1000.csv"
FAQ_FILE = "faqs.json"

def parse_banking():
    all_faqs = []
    
    # Load existing FAQs
    if os.path.exists(FAQ_FILE):
        try:
            with open(FAQ_FILE, 'r', encoding='utf-8') as f:
                all_faqs = json.load(f)
        except Exception as e:
            print("Error loading faqs.json:", e)
            all_faqs = []
            
    existing_count = len(all_faqs)
    print(f"Loaded {existing_count} existing FAQs.")
    
    extracted_count = 0
    seen_questions = set([f['question'].lower().strip() for f in all_faqs])
    
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            question = row.get("Question", "").strip()
            answer = row.get("Answer", "").strip()
            
            if question and answer and question.lower() not in seen_questions:
                all_faqs.append({
                    "question": question,
                    "answer": answer
                })
                seen_questions.add(question.lower())
                extracted_count += 1

    with open(FAQ_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_faqs, f, indent=2)
        
    print(f"Successfully extracted {extracted_count} new banking FAQ pairs.")
    print(f"Total FAQs in database: {len(all_faqs)}")

if __name__ == "__main__":
    parse_banking()
