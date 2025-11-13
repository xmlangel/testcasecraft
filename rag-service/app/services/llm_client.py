"""LLM Client Service for multiple providers"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import asyncio
import logging

logger = logging.getLogger(__name__)


class BaseLlmClient(ABC):
    """LLM 클라이언트 기본 클래스"""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """LLM에게 질의하고 응답 반환

        Args:
            prompt: 프롬프트 텍스트
            max_tokens: 최대 응답 토큰 수
            temperature: LLM 온도

        Returns:
            Dict[str, Any]: {
                "text": 응답 텍스트,
                "tokens_used": 사용된 토큰 수,
                "model": 모델명
            }
        """
        pass


class OpenAIClient(BaseLlmClient):
    """OpenAI API 클라이언트"""

    def __init__(self, api_key: str, model: str = "gpt-4", base_url: Optional[str] = None):
        """
        Args:
            api_key: OpenAI API 키
            model: 모델명 (예: gpt-4, gpt-3.5-turbo)
            base_url: 커스텀 API 엔드포인트 (선택)
        """
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise ImportError("openai 패키지가 설치되지 않았습니다. 'pip install openai'를 실행하세요.")

        self.model = model
        if base_url:
            self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        else:
            self.client = AsyncOpenAI(api_key=api_key)

    async def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """OpenAI API로 텍스트 생성

        Args:
            prompt: 프롬프트 텍스트
            max_tokens: 최대 응답 토큰 수
            temperature: LLM 온도

        Returns:
            Dict[str, Any]: 응답 정보

        Raises:
            Exception: API 호출 실패 시
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature
            )

            return {
                "text": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens,
                "model": self.model,
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens
            }

        except Exception as e:
            logger.error(f"OpenAI API 호출 실패: {e}")
            raise Exception(f"OpenAI API 호출 실패: {str(e)}")


class AnthropicClient(BaseLlmClient):
    """Anthropic (Claude) API 클라이언트"""

    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229", base_url: Optional[str] = None):
        """
        Args:
            api_key: Anthropic API 키
            model: 모델명 (예: claude-3-sonnet-20240229)
            base_url: 커스텀 API 엔드포인트 (선택)
        """
        try:
            from anthropic import AsyncAnthropic
        except ImportError:
            raise ImportError("anthropic 패키지가 설치되지 않았습니다. 'pip install anthropic'를 실행하세요.")

        self.model = model
        if base_url:
            self.client = AsyncAnthropic(api_key=api_key, base_url=base_url)
        else:
            self.client = AsyncAnthropic(api_key=api_key)

    async def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Anthropic API로 텍스트 생성

        Args:
            prompt: 프롬프트 텍스트
            max_tokens: 최대 응답 토큰 수
            temperature: LLM 온도

        Returns:
            Dict[str, Any]: 응답 정보

        Raises:
            Exception: API 호출 실패 시
        """
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )

            return {
                "text": response.content[0].text,
                "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
                "model": self.model,
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens
            }

        except Exception as e:
            logger.error(f"Anthropic API 호출 실패: {e}")
            raise Exception(f"Anthropic API 호출 실패: {str(e)}")


class OllamaClient(BaseLlmClient):
    """Ollama 로컬 LLM 클라이언트"""

    def __init__(self, model: str = "llama2", base_url: str = "http://localhost:11434"):
        """
        Args:
            model: 모델명 (예: llama2, mistral)
            base_url: Ollama 서버 URL
        """
        self.model = model
        self.base_url = base_url.rstrip('/')

    async def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Ollama API로 텍스트 생성

        Args:
            prompt: 프롬프트 텍스트
            max_tokens: 최대 응답 토큰 수 (Ollama에서는 근사값)
            temperature: LLM 온도

        Returns:
            Dict[str, Any]: 응답 정보

        Raises:
            Exception: API 호출 실패 시
        """
        try:
            import httpx

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens
                        }
                    }
                )
                response.raise_for_status()
                data = response.json()

                # Ollama는 정확한 토큰 수를 제공하지 않으므로 근사값 계산
                response_text = data.get("response", "")
                estimated_tokens = len(prompt) // 4 + len(response_text) // 4

                return {
                    "text": response_text,
                    "tokens_used": estimated_tokens,
                    "model": self.model,
                    "input_tokens": len(prompt) // 4,
                    "output_tokens": len(response_text) // 4
                }

        except Exception as e:
            logger.error(f"Ollama API 호출 실패: {e}")
            raise Exception(f"Ollama API 호출 실패: {str(e)}")


class LlmClientFactory:
    """LLM 클라이언트 팩토리"""

    @staticmethod
    def create_client(
        provider: str,
        api_key: Optional[str],
        model: str,
        base_url: Optional[str] = None
    ) -> BaseLlmClient:
        """LLM 클라이언트 생성

        Args:
            provider: LLM 제공자 (openai, anthropic, ollama)
            api_key: API 키 (ollama는 불필요)
            model: 모델명
            base_url: 커스텀 엔드포인트 URL (선택)

        Returns:
            BaseLlmClient: LLM 클라이언트 인스턴스

        Raises:
            ValueError: 지원하지 않는 제공자인 경우
            ValueError: API 키가 필요한데 제공되지 않은 경우
        """
        provider_lower = provider.lower()

        # OpenAI 호환 provider들: openai, openwebui, openrouter, perplexity
        openai_compatible = ["openai", "openwebui", "openrouter", "perplexity"]

        if provider_lower in openai_compatible:
            if not api_key:
                raise ValueError(f"{provider} requires an API key")

            # OpenWebUI는 /api/chat/completions 경로 사용
            # OpenAI SDK는 base_url + /chat/completions를 호출하므로
            # base_url에 /api를 추가해야 함
            adjusted_base_url = base_url
            if provider_lower == "openwebui" and base_url:
                if not base_url.endswith("/api"):
                    adjusted_base_url = f"{base_url.rstrip('/')}/api"
                    logger.info(f"OpenWebUI base_url adjusted: {base_url} → {adjusted_base_url}")

            return OpenAIClient(api_key=api_key, model=model, base_url=adjusted_base_url)

        elif provider_lower == "anthropic":
            if not api_key:
                raise ValueError("Anthropic requires an API key")
            return AnthropicClient(api_key=api_key, model=model, base_url=base_url)

        elif provider_lower == "ollama":
            # Ollama는 API 키 불필요
            ollama_url = base_url or "http://localhost:11434"
            return OllamaClient(model=model, base_url=ollama_url)

        else:
            raise ValueError(
                f"Unsupported LLM provider: {provider}. "
                f"Supported providers: openai, anthropic, ollama, openwebui, openrouter, perplexity"
            )


# 재시도 헬퍼 함수
async def retry_with_exponential_backoff(
    func,
    max_retries: int = 3,
    initial_delay: float = 1.0,
    max_delay: float = 60.0
):
    """지수 백오프로 함수 재시도

    Args:
        func: 재시도할 async 함수
        max_retries: 최대 재시도 횟수
        initial_delay: 초기 지연 시간 (초)
        max_delay: 최대 지연 시간 (초)

    Returns:
        함수 실행 결과

    Raises:
        Exception: 모든 재시도 실패 시
    """
    delay = initial_delay

    for attempt in range(max_retries + 1):
        try:
            return await func()
        except Exception as e:
            if attempt == max_retries:
                logger.error(f"All retry attempts failed: {e}")
                raise

            logger.warning(
                f"Attempt {attempt + 1} failed: {e}. "
                f"Retrying in {delay} seconds..."
            )
            await asyncio.sleep(delay)
            delay = min(delay * 2, max_delay)
