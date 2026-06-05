import os, glob

files = glob.glob('app/**/*.tsx', recursive=True)
count = 0
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'http://localhost:8000' in content:
        new_content = content.replace('http://localhost:8000', 'https://codealphaaskai-production.up.railway.app')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
print(f"Replaced in {count} files.")
