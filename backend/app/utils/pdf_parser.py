from pypdf import PdfReader
import io

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text page-by-page from a local PDF file.
    """
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to parse PDF file: {str(e)}")

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extracts text page-by-page from PDF bytes.
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to parse PDF bytes: {str(e)}")
