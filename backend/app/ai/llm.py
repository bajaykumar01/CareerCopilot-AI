from abc import ABC, abstractmethod
from typing import List, Tuple
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

class LLMProvider(ABC):
    """
    Abstract interface for LLM providers.
    Decouples application pipeline logic from specific model vendors.
    """
    @abstractmethod
    def generate(self, messages: List[Tuple[str, str]]) -> str:
        pass

class GeminiProvider(LLMProvider):
    """
    Google Gemini LLM provider implementation via LangChain.
    """
    def __init__(self, api_key: str, model_name: str = None, temperature: float = 0.1):
        self.model_name = model_name or settings.GEMINI_MODEL
        self.api_key = api_key
        self.temperature = temperature
        self.client = ChatGoogleGenerativeAI(
            model=self.model_name,
            google_api_key=self.api_key,
            temperature=self.temperature
        )

    def generate(self, messages: List[Tuple[str, str]]) -> str:
        logger.info(f"Invoking Gemini LLM (model: {self.model_name}, temp: {self.temperature})...")
        response = self.client.invoke(messages)
        return response.content

class BedrockProvider(LLMProvider):
    """
    Amazon Bedrock LLM provider implementation (Placeholder for Phase 9).
    """
    def __init__(self, region: str = "us-east-1", model_id: str = "anthropic.claude-v2"):
        self.region = region
        self.model_id = model_id

    def generate(self, messages: List[Tuple[str, str]]) -> str:
        raise NotImplementedError("BedrockProvider will be implemented in Phase 9 AWS integration.")

def get_llm_provider(provider_name: str = "gemini", api_key: str = "", model_name: str = None) -> LLMProvider:
    """
    Factory function to instantiate the selected LLM provider.
    """
    if provider_name.lower() == "gemini":
        return GeminiProvider(api_key=api_key, model_name=model_name)
    elif provider_name.lower() == "bedrock":
        return BedrockProvider()
    else:
        raise ValueError(f"Unsupported LLM provider: '{provider_name}'")
