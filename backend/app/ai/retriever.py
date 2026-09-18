from typing import List
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from app.ai.embeddings import get_embedding_model
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

def build_vector_store(docs: List[Document], model_name: str = None) -> FAISS:
    """
    Builds an in-memory FAISS vector store from document chunks.
    """
    embeddings = get_embedding_model(model_name)
    logger.info(f"Building FAISS vector store for {len(docs)} document chunks...")
    vector_store = FAISS.from_documents(docs, embeddings)
    return vector_store

def retrieve_context(vector_store: FAISS, query: str, top_k: int = None) -> str:
    """
    Retrieves the top-K relevant resume chunks matching the job query and returns concatenated context string.
    """
    k = top_k or settings.TOP_K
    logger.info(f"Retrieving top-K = {k} relevant document chunks...")
    retriever = vector_store.as_retriever(search_kwargs={"k": k})
    retrieved_docs = retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in retrieved_docs])
    logger.info(f"Retrieved {len(retrieved_docs)} relevant context chunks.")
    return context
