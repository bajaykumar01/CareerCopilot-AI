# CareerCopilot AI v2 — Production-Ready LLM-Powered Resume & Job Match Analyzer

CareerCopilot AI is a full-stack web application designed to evaluate a candidate's resume against any job description, identifying skill gaps, suggesting improvements, generating study roadmaps, and hosting interactive mock interviews. It uses a Retrieval-Augmented Generation (RAG) pipeline to fetch relevant resume information, matching it with target role demands using vector similarity.

---

## 🏗️ System Architecture

The following diagram illustrates the flow of data through the CareerCopilot RAG matching pipeline:

```
[Candidate PDF Resume]
         │
         ▼
 ┌───────────────┐
 │  PDF Parser   │ (Extracts text page-by-page using pypdf)
 └───────┬───────┘
         │ (Extracted Text)
         ▼
 ┌───────────────┐
 │ Text Splitter │ (Chunks text using RecursiveCharacterTextSplitter)
 └───────┬───────┘
         │ (Document Chunks)
         ▼
 ┌───────────────┐
 │  Embeddings   │ (Converts text chunks into numerical vectors)
 │     Model     │ [Google text-embedding-004]
 └───────┬───────┘
         │ (Vectors)
         ▼
 ┌───────────────┐
 │ Vector Store  │ (Indexes vectors for quick similarity searches)
 │    [FAISS]    │
 └───────┬───────┘
         │
         ├──────────────────────◄ [Query: Job Description Requirements]
         ▼
 ┌───────────────┐
 │   Retriever   │ (Finds top-K chunks semantically matching job requirements)
 └───────┬───────┘
         │ (Retrieved Resume Context)
         ▼
 ┌───────────────┐
 │Prompt Template│ (Combines retrieved context, raw job text, & system output schema)
 └───────┬───────┘
         │ (Formulated Prompt)
         ▼
 ┌───────────────┐
 │  Gemini LLM   │ (Generates matching metrics & structured career plans)
 │[gemini-1.5-fl]│
 └───────┬───────┘
         │
         ▼
 ┌───────────────┐
 │Structured JSON│ (Validates response and saves details in MySQL database)
 └───────────────┘
```

---

## 🧠 Core AI Stack Explanations & Interview Prep

Technical interviewers frequently probe candidate applications to test their deep conceptual understanding. Below is an explanation of every major AI component in this codebase, including why it was chosen and common interview questions.

### 1. Retrieval-Augmented Generation (RAG)
* **What is it?** RAG is a pattern where an LLM is provided with query-relevant external data (context) retrieved from a database before generating its response.
* **Why do we need it?** 
  1. **Prevents Hallucinations:** Grounding the model's response in actual resume sentences ensures the ATS scoring and skill gap analyses are factually correct.
  2. **Token Efficiency:** Instead of dumping an entire multi-page resume (which might clutter the prompt context), we only feed the parts semantically relevant to the job requirements.
* **Interview Questions:**
  * **Q:** *Why use RAG instead of fine-tuning the model?*  
    **A:** Fine-tuning is expensive, takes time, and updates the model's weights but doesn't guarantee factual grounding. RAG allows us to supply dynamic, user-specific files in real-time without retraining.

### 2. Embeddings (Vector Representations)
* **What are they?** High-dimensional mathematical vectors (arrays of floats) representing the semantic meaning of a word, sentence, or chunk of text.
* **Why do we need it?** Computers cannot understand language directly. By converting text into vectors using Google's `text-embedding-004` model, we can mathematically calculate "closeness" or "similarity" between different pieces of text.
* **Interview Questions:**
  * **Q:** *What is Cosine Similarity and how does it relate to embeddings?*  
    **A:** Cosine Similarity measures the cosine of the angle between two multi-dimensional vectors. An angle of $0$ (cosine $1$) means the texts are semantically identical. We use this metric to retrieve the resume sections that closest match the job requirements.

### 3. Vector Database (FAISS)
* **What is it?** **FAISS** (Facebook AI Similarity Search) is an open-source library optimized for fast clustering and similarity searches in high-dimensional vector spaces.
* **Why do we need it?** Standard databases like MySQL retrieve data via exact keyword matches. FAISS uses index trees to retrieve documents based on conceptual similarity, returning relevant parts of the resume even if the phrasing differs from the job description.
* **Interview Questions:**
  * **Q:** *What is the difference between keyword search and vector similarity search?*  
    **A:** Keyword search matches characters (e.g., searching "SQL" only returns documents containing "SQL"). Vector search matches semantics (e.g., searching "data management" returns "SQL", "databases", and "PostgreSQL" because their vectors occupy a similar area of the embedding space).

### 4. LangChain
* **What is it?** LangChain is an orchestration framework designed to simplify the development of applications powered by Large Language Models.
* **Why do we need it?** It provides clean, modular abstractions (like `RecursiveCharacterTextSplitter`, `FAISS`, `ChatGoogleGenerativeAI`) that allow us to chain document loaders, splitters, indices, and prompts together with minimal glue-code.
* **Interview Questions:**
  * **Q:** *What are LangChain runnables and how does the LangChain Expression Language (LCEL) help?*  
    **A:** LCEL allows developers to compose modular chains using the pipe operator (`|`). It automatically supports batch, async, and streaming executions out-of-the-box.

---

## 📁 Project Folder Structure

```
CareerCopilot/
├── backend/
│   ├── app/
│   │   ├── ai/               # Prompt templates & RAG execution module
│   │   ├── models/           # SQLAlchemy DB Models (MySQL)
│   │   ├── routes/           # FastAPI router endpoints
│   │   ├── schemas/          # Pydantic input/output schemas
│   │   ├── services/         # Business logic (database ops & LLM triggers)
│   │   ├── utils/            # JWT security & PDF parser utility
│   │   ├── config.py         # Environment configurations
│   │   ├── database.py       # DB Session & engine configuration
│   │   └── main.py           # FastAPI entry point
│   ├── .env.example          # Sample environment variables
│   ├── init_db.py            # Script to auto-create schema in MySQL
│   ├── requirements.txt      # Python backend packages
│   └── run.py                # Development uvicorn runner
└── frontend/
    ├── src/
    │   ├── components/       # Common UI elements (Layout, Metrics, Upload)
    │   ├── context/          # JWT global state provider
    │   ├── pages/            # Login, Dashboard, Recommendations, Mock Interview
    │   ├── services/         # Axios api connections
    │   ├── App.jsx           # React routes configuration
    │   └── index.css         # Styling base with Tailwind directives
    ├── tailwind.config.js    # Tailwind layout customizations
    └── vite.config.js        # Vite compilation configuration
```

---

## ⚙️ Setup & Execution Instructions

Follow these steps to set up the project on your local machine:

### 1. Database Creation
Make sure MySQL is running on your machine.
Create a blank database called `career_copilot` using MySQL Command Line or Workbench:
```sql
CREATE DATABASE career_copilot;
```

### 2. Backend Setup
1. Open a terminal in the `backend/` directory.
2. Initialize and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your settings:
   * Define your `DATABASE_URL` (usually `mysql+pymysql://root:password@localhost:3306/career_copilot`).
   * Add your Google Gemini API Key (`GEMINI_API_KEY`).
5. Run the database initialization script:
   ```bash
   python init_db.py
   ```
6. Start the backend:
   ```bash
   python run.py
   ```

### 3. Frontend Setup
1. Open a new terminal in the `frontend/` directory.
2. Install frontend packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔌 API Documentation Summary

All endpoints are prefix-nested under `/api`:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Register a new user | No |
| **POST** | `/auth/login` | Log in and return JWT token | No |
| **GET** | `/auth/me` | Fetch active user profile details | Yes (JWT) |
| **POST** | `/resumes/upload` | Upload PDF resume and extract text | Yes (JWT) |
| **GET** | `/resumes/history` | List user's resume uploads | Yes (JWT) |
| **POST** | `/jobs/create` | Save target job description text | Yes (JWT) |
| **POST** | `/analysis/run` | Execute the RAG matching pipeline | Yes (JWT) |
| **GET** | `/analysis/history` | Retrieve user's past match reports | Yes (JWT) |
| **POST** | `/interviews/sessions/create` | Start mock interview question gen | Yes (JWT) |
| **POST** | `/interviews/sessions/{id}/submit`| Submit answer response for grading | Yes (JWT) |
