import json
import re

nb_path = "C:/Users/manne/Downloads/banking-nlp-notebook.ipynb"
with open(nb_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

extracted_qas = []

for cell in nb["cells"]:
    if "outputs" in cell:
        for output in cell["outputs"]:
            if "data" in output:
                if "text/plain" in output["data"]:
                    text = "".join(output["data"]["text/plain"])
                    print("Found text output, length:", len(text))
                    if "Question" in text and "Answer" in text:
                        print("Sample:", text[:200])

