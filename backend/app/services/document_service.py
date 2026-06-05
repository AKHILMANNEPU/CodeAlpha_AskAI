import PyPDF2
from docx import Document
import os

class DocumentService:
    @staticmethod
    def extract_text(file_path: str) -> str:
        _, ext = os.path.splitext(file_path.lower())
        if ext == ".pdf":
            return DocumentService.extract_pdf_text(file_path)
        elif ext == ".docx":
            return DocumentService.extract_docx_text(file_path)
        elif ext == ".txt":
            return DocumentService.extract_txt_text(file_path)
        return ""

    @staticmethod
    def extract_pdf_text(file_path: str) -> str:
        text = ""
        try:
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            print(f"Error reading PDF: {e}")
        return text

    @staticmethod
    def extract_docx_text(file_path: str) -> str:
        text = ""
        try:
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"Error reading DOCX: {e}")
        return text

    @staticmethod
    def extract_txt_text(file_path: str) -> str:
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        except Exception as e:
            print(f"Error reading TXT: {e}")
        return ""

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
        chunks = []
        # Basic chunking: could be improved by splitting on sentences
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size]
            chunks.append(chunk)
        return chunks
