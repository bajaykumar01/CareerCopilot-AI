import json
from typing import Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from app.config import settings
from app.utils.logging import get_logger
from app.ai.retriever import build_vector_store, retrieve_context
from app.ai.llm import get_llm_provider
from app.ai.prompts import ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_TEMPLATE
from app.schemas.analysis import StructuredAnalysisOutput

logger = get_logger(__name__)

def clean_json_response(text: str) -> str:
    """
    Cleans markdown code fences (e.g. ```json ... ```) from LLM output.
    """
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def analyze_resume_rag(
    resume_text: str, 
    job_description: str, 
    api_key: str,
    chunk_size: int = None,
    chunk_overlap: int = None,
    top_k: int = None
) -> Dict[str, Any]:
    """
    Executes the modular RAG pipeline:
    1. Text Chunking via RecursiveCharacterTextSplitter
    2. Embedding Indexing via SentenceTransformers & FAISS
    3. Top-K Semantic Context Retrieval
    4. Prompt Construction & LLM Generation
    5. Strict Pydantic Structured Output Validation
    """
    c_size = chunk_size or settings.CHUNK_SIZE
    c_overlap = chunk_overlap or settings.CHUNK_OVERLAP
    k_val = top_k or settings.TOP_K

    logger.info(f"Starting RAG pipeline (chunk_size={c_size}, chunk_overlap={c_overlap}, top_k={k_val})...")

    # 1. Text Chunking
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=c_size, chunk_overlap=c_overlap)
    docs = [Document(page_content=chunk) for chunk in text_splitter.split_text(resume_text)]
    logger.info(f"Generated {len(docs)} text chunks from resume.")

    # 2. Embedding Indexing & Vector Store Construction
    vector_store = build_vector_store(docs)

    # 3. Semantic Context Retrieval
    retrieved_context = retrieve_context(vector_store, job_description, top_k=k_val)

    # 4. Prompt Construction & LLM Execution
    user_content = ANALYSIS_USER_TEMPLATE.format(
        job_description=job_description,
        retrieved_context=retrieved_context
    )
    messages = [
        ("system", ANALYSIS_SYSTEM_PROMPT),
        ("user", user_content)
    ]

    llm_provider = get_llm_provider("gemini", api_key=api_key)
    raw_response = llm_provider.generate(messages)
    cleaned_json_str = clean_json_response(raw_response)

    # 5. Pydantic Structured Output Validation
    try:
        parsed_data = json.loads(cleaned_json_str)
        validated_output = StructuredAnalysisOutput(**parsed_data)
        logger.info("Structured LLM analysis output successfully validated with Pydantic schema.")
        return validated_output.model_dump()
    except json.JSONDecodeError as je:
        logger.error(f"LLM JSON Decode Failure: {str(je)}. Raw Output:\n{raw_response}")
        raise ValueError(f"LLM failed to output valid JSON format: {str(je)}")
    except Exception as ve:
        logger.error(f"Pydantic Validation Failure: {str(ve)}. Parsed JSON:\n{cleaned_json_str}")
        raise ValueError(f"LLM structured output validation failed: {str(ve)}")
