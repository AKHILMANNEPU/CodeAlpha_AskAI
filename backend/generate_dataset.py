import os
import json
import time
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

CATEGORIES = [
    "Artificial Intelligence",
    "Current Sports News",
    "Political News",
    "Colleges and Universities",
    "Jobs and Careers",
    "Laptops and Computers",
    "Vehicles and Cars"
]

BATCH_SIZE = 20
NUM_BATCHES = 5  # 5 batches of 20 = 100 per category

async def fetch_faqs(category, batch_num):
    prompt = f"""Generate exactly {BATCH_SIZE} unique and realistic Frequently Asked Questions (FAQs) and their answers about '{category}'.
    This is batch {batch_num}/{NUM_BATCHES}. Ensure these are different from typical common questions, be highly specific to the topic. 
    Return ONLY a valid JSON array of objects, where each object has a 'question' and an 'answer' string. Do not include markdown code blocks or any other text.
    Example format:
    [
      {{"question": "What is AI?", "answer": "AI stands for..."}}
    ]
    """
    
    max_retries = 8
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            response = await client.chat.completions.create(
                model="meta-llama/llama-3.3-70b-instruct:free",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8
            )
            
            content = response.choices[0].message.content.strip()
            # Clean up potential markdown formatting
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
                
            data = json.loads(content)
            print(f"[SUCCESS] Successfully generated batch {batch_num} for {category} ({len(data)} items)")
            return data
        except Exception as e:
            print(f"[ERROR] Error on batch {batch_num} for {category} (Attempt {attempt+1}/{max_retries}): {e}")
            if "429" in str(e):
                print(f"[WAIT] Rate limited. Waiting {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
                retry_delay *= 2 # Exponential backoff
            else:
                await asyncio.sleep(2)
                
    print(f"[FAILED] Failed to generate batch {batch_num} for {category} after {max_retries} attempts.")
    return []

async def main():
    all_faqs = []
    
    # Load existing FAQs
    if os.path.exists("faqs.json"):
        with open("faqs.json", "r", encoding="utf-8") as f:
            try:
                all_faqs = json.load(f)
            except:
                pass
            
    for category in CATEGORIES:
        print(f"\n[STARTING] Generation for: {category}")
        for i in range(1, NUM_BATCHES + 1):
            batch = await fetch_faqs(category, i)
            if batch:
                all_faqs.extend(batch)
                
                # Save progress incrementally so we don't lose data if script crashes
                with open("faqs.json", "w", encoding="utf-8") as f:
                    json.dump(all_faqs, f, indent=2)
                    
            # Sleep to respect rate limits between successful requests
            await asyncio.sleep(3)

    print("\n[DONE] All done! Total FAQs in file:", len(all_faqs))

if __name__ == "__main__":
    asyncio.run(main())
