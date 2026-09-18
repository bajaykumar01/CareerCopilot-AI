from langchain_community.embeddings import HuggingFaceEmbeddings
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

def get_embedding_model(model_name: str = None) -> HuggingFaceEmbeddings:
    """
    Instantiates and returns the embedding model provider.
    Uses sentence-transformers/all-MiniLM-L6-v2 by default.
    """
    selected_model = model_name or settings.EMBEDDING_MODEL_NAME
    logger.info(f"Initializing embedding model: {selected_model}")
    return HuggingFaceEmbeddings(model_name=selected_model)
