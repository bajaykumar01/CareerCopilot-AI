import json
import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import (
    GoogleGenerativeAIEmbeddings,
    ChatGoogleGenerativeAI,
)
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from app.ai.prompts import (
    ANALYSIS_SYSTEM_PROMPT,
    ANALYSIS_USER_TEMPLATE,
    INTERVIEW_SYSTEM_PROMPT,
    INTERVIEW_USER_TEMPLATE,
    EVALUATION_SYSTEM_PROMPT,
    EVALUATION_USER_TEMPLATE,
)

logger = logging.getLogger(__name__)

def clean_json_response(text: str) -> str:
    """
    Cleans markdown formatting codeblocks (e.g. ```json ... ```) from LLM output.
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

def analyze_resume_rag(resume_text: str, job_description: str, api_key: str) -> dict:
    """
    Core RAG Pipeline:
    Resume Text -> Splitter -> Embedding -> FAISS -> Retriever -> Prompt -> LLM -> JSON
    """
    try:
        # 1. Text Splitter
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=60)
        docs = [Document(page_content=chunk) for chunk in text_splitter.split_text(resume_text)]
        
        # 2. Embedding Model (Google GenAI text-embedding-004)
        embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
        vector_store = FAISS.from_documents(docs, embeddings)
        
        # 4. Retriever
        # Retrieve the top 5 chunks relevant to the job requirements
        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        retrieved_docs = retriever.invoke(job_description)
        context = "\n\n".join([doc.page_content for doc in retrieved_docs])
        
        # 5. Gemini LLM Call
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.1
        )
        
        messages = [
            ("system", ANALYSIS_SYSTEM_PROMPT),
            ("user", ANALYSIS_USER_TEMPLATE.format(job_description=job_description, retrieved_context=context))
        ]
        
        response = llm.invoke(messages)
        cleaned_res = clean_json_response(response.content)
        
        return json.loads(cleaned_res)
    except Exception as e:
        logger.error(f"Error executing RAG Analysis pipeline: {str(e)}")
        # Graceful fallback response structure
        return {
            "ats_score": 0,
            "ats_explanation": f"Failed to execute RAG analysis: {str(e)}",
            "strengths": [],
            "weaknesses": [],
            "matching_skills": [],
            "missing_skills": [],
            "skill_gap_analysis": {"high_priority_skills": [], "recommended_skills_to_learn": []},
            "company_recommendations": {"learning_roadmap": [], "technologies_to_learn": [], "important_concepts": [], "interview_focus_areas": []},
            "resume_suggestions": {"bullet_point_improvements": [], "action_verbs": [], "missing_keywords": [], "quantified_achievements_tips": [], "formatting_improvements": []},
            "certification_recommendations": [],
            "project_recommendations": []
        }

def generate_interview_questions(resume_text: str, job_description: str, api_key: str) -> list:
    """
    Generates structured interview questions categorized into HR, Technical, Project, Behavioral, and Scenario.
    """
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.7
        )
        
        messages = [
            ("system", INTERVIEW_SYSTEM_PROMPT),
            ("user", INTERVIEW_USER_TEMPLATE.format(resume_text=resume_text, job_description=job_description))
        ]
        
        response = llm.invoke(messages)
        cleaned_res = clean_json_response(response.content)
        return json.loads(cleaned_res)
    except Exception as e:
        logger.error(f"Error generating interview questions: {str(e)}")
        # Return fallback mock questions
        return [
            {"id": 1, "question": "Walk me through your background and why you are interested in this position.", "category": "HR"},
            {"id": 2, "question": "How do you handle technical debt in a fast-paced agile development cycle?", "category": "Technical"},
            {"id": 3, "question": "Can you describe a challenging project listed on your resume and how you overcame technical hurdles?", "category": "Project-based"},
            {"id": 4, "question": "Tell me about a time you had a conflict with a teammate. How did you resolve it?", "category": "Behavioral"},
            {"id": 5, "question": "If our database system fails during a major traffic peak, what immediate debugging steps do you take?", "category": "Scenario-based"}
        ]

def evaluate_interview_answer(question: str, answer: str, context: str, api_key: str) -> dict:
    """
    Evaluates a candidate's response to an interview question using the job context and resume.
    """
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.3
        )
        
        messages = [
            ("system", EVALUATION_SYSTEM_PROMPT),
            ("user", EVALUATION_USER_TEMPLATE.format(question=question, answer=answer, context=context))
        ]
        
        response = llm.invoke(messages)
        cleaned_res = clean_json_response(response.content)
        return json.loads(cleaned_res)
    except Exception as e:
        logger.error(f"Error evaluating candidate answer: {str(e)}")
        return {
            "strengths": "Answer recorded successfully.",
            "weaknesses": "Evaluation feedback generation failed due to a system error.",
            "communication_feedback": "Not evaluated.",
            "technical_accuracy": "Not evaluated.",
            "confidence_score": 0,
            "suggested_improvements": f"System Error: {str(e)}"
        }
