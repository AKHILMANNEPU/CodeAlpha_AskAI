import os
import json
import glob

DATA_DIR = "dataset/multiwoz-master/data/MultiWOZ_2.2/train/"
FAQ_FILE = "faqs.json"
MAX_PAIRS = 4000

def parse_multiwoz():
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
    
    json_files = glob.glob(os.path.join(DATA_DIR, "*.json"))
    
    extracted_count = 0
    seen_questions = set([f['question'].lower() for f in all_faqs])
    
    for file_path in json_files:
        if extracted_count >= MAX_PAIRS:
            break
            
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        for dialogue in data:
            if extracted_count >= MAX_PAIRS:
                break
                
            turns = dialogue.get("turns", [])
            # We want to extract the first USER utterance and the first SYSTEM response
            # Typically turn 0 is USER, turn 1 is SYSTEM
            if len(turns) >= 2:
                turn0 = turns[0]
                turn1 = turns[1]
                
                if turn0.get("speaker") == "USER" and turn1.get("speaker") == "SYSTEM":
                    question = turn0.get("utterance", "").strip()
                    answer = turn1.get("utterance", "").strip()
                    
                    if question and answer and question.lower() not in seen_questions:
                        all_faqs.append({
                            "question": question,
                            "answer": answer
                        })
                        seen_questions.add(question.lower())
                        extracted_count += 1

    with open(FAQ_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_faqs, f, indent=2)
        
    print(f"Successfully extracted {extracted_count} new FAQ pairs.")
    print(f"Total FAQs in database: {len(all_faqs)}")

if __name__ == "__main__":
    parse_multiwoz()
