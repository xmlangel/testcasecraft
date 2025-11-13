"""Cost Estimator Service for LLM API usage"""
from typing import Dict, List
from sqlalchemy.orm import Session
from ..models.rag_embedding import RAGEmbedding
from ..schemas.llm_analysis import CostEstimateResponse, CostBreakdown, ModelPricing
from uuid import UUID


class CostEstimator:
    """LLM API 비용 추정 서비스"""

    # LLM 가격표 (USD per 1K tokens) - 2025년 1월 기준
    PRICING = {
        "openai": {
            "gpt-4": {"input": 0.01, "output": 0.06},
            "gpt-4-turbo": {"input": 0.01, "output": 0.03},
            "gpt-4-turbo-preview": {"input": 0.01, "output": 0.03},
            "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
            "gpt-3.5-turbo-16k": {"input": 0.001, "output": 0.002},
        },
        "anthropic": {
            "claude-3-opus": {"input": 0.015, "output": 0.075},
            "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
            "claude-3-sonnet": {"input": 0.003, "output": 0.015},
            "claude-3-sonnet-20240229": {"input": 0.003, "output": 0.015},
            "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
            "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
        },
        "ollama": {
            # 로컬 모델은 비용 없음
            "*": {"input": 0, "output": 0}
        }
    }

    def __init__(self, db: Session):
        self.db = db

    def estimate_analysis_cost(
        self,
        document_id: UUID,
        llm_provider: str,
        llm_model: str,
        prompt_template: str,
        max_tokens: int
    ) -> CostEstimateResponse:
        """분석 비용 추정

        Args:
            document_id: 문서 ID
            llm_provider: LLM 제공자 (openai, anthropic, ollama, openwebui, openrouter, perplexity 등)
            llm_model: LLM 모델명
            prompt_template: 프롬프트 템플릿 ({chunk_text} 포함)
            max_tokens: 최대 응답 토큰 수

        Returns:
            CostEstimateResponse: 비용 추정 결과
        """

        # 1. 청크 조회
        chunks = self.db.query(RAGEmbedding)\
            .filter(RAGEmbedding.document_id == document_id)\
            .all()

        total_chunks = len(chunks)

        if total_chunks == 0:
            # 청크가 없는 경우
            return self._create_empty_response(document_id, llm_provider, llm_model)

        # 2. 평균 청크 크기 계산 (토큰 추정)
        total_chunk_length = sum(len(chunk.chunk_text) for chunk in chunks)
        avg_chunk_length = total_chunk_length / total_chunks

        # 토큰 추정: 1 token ≈ 4 characters (영어 기준)
        # 한글은 1 token ≈ 1-2 characters 정도
        # 보수적으로 2.5 characters per token 사용
        avg_chunk_tokens = int(avg_chunk_length / 2.5)

        # 3. 프롬프트 오버헤드 추정
        prompt_overhead_text = prompt_template.replace("{chunk_text}", "")
        prompt_overhead_tokens = int(len(prompt_overhead_text) / 2.5)

        # 4. 총 입력/출력 토큰 추정
        estimated_input_tokens_per_chunk = avg_chunk_tokens + prompt_overhead_tokens
        estimated_output_tokens_per_chunk = max_tokens

        total_input_tokens = estimated_input_tokens_per_chunk * total_chunks
        total_output_tokens = estimated_output_tokens_per_chunk * total_chunks
        total_tokens = total_input_tokens + total_output_tokens

        # 5. 비용 계산
        pricing = self._get_pricing(llm_provider, llm_model)

        input_cost = (total_input_tokens / 1000) * pricing["input"]
        output_cost = (total_output_tokens / 1000) * pricing["output"]
        total_cost = input_cost + output_cost

        cost_per_chunk = total_cost / total_chunks if total_chunks > 0 else 0

        # 6. 경고 메시지 생성
        warnings = self._generate_warnings(
            total_cost, total_chunks, llm_provider, avg_chunk_length
        )

        # 7. 응답 생성
        return CostEstimateResponse(
            document_id=document_id,
            total_chunks=total_chunks,
            estimated_input_tokens=total_input_tokens,
            estimated_output_tokens=total_output_tokens,
            estimated_total_tokens=total_tokens,
            cost_breakdown=CostBreakdown(
                input_cost_usd=round(input_cost, 4),
                output_cost_usd=round(output_cost, 4),
                total_cost_usd=round(total_cost, 4)
            ),
            cost_per_chunk_usd=round(cost_per_chunk, 4),
            model_pricing=ModelPricing(
                provider=llm_provider,
                model=llm_model,
                input_price_per_1k=pricing["input"],
                output_price_per_1k=pricing["output"]
            ),
            warnings=warnings
        )

    def _get_pricing(self, provider: str, model: str) -> Dict[str, float]:
        """모델 가격 조회

        Args:
            provider: LLM 제공자
            model: 모델명

        Returns:
            Dict[str, float]: {"input": 입력 가격, "output": 출력 가격}
        """
        provider_lower = provider.lower()
        model_lower = model.lower()

        if provider_lower not in self.PRICING:
            # 알 수 없는 제공자: 기본값 반환
            return {"input": 0.01, "output": 0.03}

        provider_pricing = self.PRICING[provider_lower]

        # 정확한 모델명 매칭
        if model_lower in provider_pricing:
            return provider_pricing[model_lower]

        # 와일드카드 매칭 (Ollama 등)
        if "*" in provider_pricing:
            return provider_pricing["*"]

        # 부분 매칭 시도 (gpt-4-1106-preview → gpt-4)
        for key in provider_pricing.keys():
            if model_lower.startswith(key):
                return provider_pricing[key]

        # 기본값 반환
        return {"input": 0.01, "output": 0.03}

    def _generate_warnings(
        self,
        total_cost: float,
        total_chunks: int,
        provider: str,
        avg_chunk_length: float
    ) -> List[str]:
        """경고 메시지 생성

        Args:
            total_cost: 총 예상 비용 (USD)
            total_chunks: 전체 청크 수
            provider: LLM 제공자
            avg_chunk_length: 평균 청크 길이

        Returns:
            List[str]: 경고 메시지 목록
        """
        warnings = []

        # 비용 경고
        if provider.lower() == "ollama":
            warnings.append("✅ 로컬 모델을 사용하므로 API 비용이 발생하지 않습니다.")
        else:
            if total_cost > 20:
                warnings.append(
                    f"⚠️ 매우 높은 비용 경고: 이 작업은 약 ${total_cost:.2f}의 비용이 발생할 수 있습니다."
                )
            elif total_cost > 10:
                warnings.append(
                    f"⚠️ 높은 비용 경고: 이 작업은 약 ${total_cost:.2f}의 비용이 발생할 수 있습니다."
                )
            elif total_cost > 1:
                warnings.append(
                    f"💵 이 작업은 약 ${total_cost:.2f}의 비용이 발생할 수 있습니다."
                )
            else:
                warnings.append(f"💵 예상 비용: 약 ${total_cost:.2f}")

        # 청크 정보
        warnings.append(f"📄 총 {total_chunks}개 청크를 처리합니다.")

        # 청크 크기 경고
        if avg_chunk_length > 3000:
            warnings.append(
                f"⚠️ 청크 크기가 큽니다 (평균 {int(avg_chunk_length)}자). "
                "실제 토큰 사용량이 추정보다 높을 수 있습니다."
            )

        # 일반 주의사항
        warnings.append(
            "ℹ️ 실제 비용은 청크 크기, LLM 응답 길이, API 가격 변동에 따라 달라질 수 있습니다."
        )
        warnings.append(
            "💡 배치 확인 기능(10개 단위)을 사용하여 중간에 비용을 확인하고 중단할 수 있습니다."
        )

        return warnings

    def _create_empty_response(
        self,
        document_id: UUID,
        llm_provider: str,
        llm_model: str
    ) -> CostEstimateResponse:
        """청크가 없는 경우의 빈 응답 생성

        Args:
            document_id: 문서 ID
            llm_provider: LLM 제공자
            llm_model: 모델명

        Returns:
            CostEstimateResponse: 빈 비용 추정 결과
        """
        pricing = self._get_pricing(llm_provider, llm_model)

        return CostEstimateResponse(
            document_id=document_id,
            total_chunks=0,
            estimated_input_tokens=0,
            estimated_output_tokens=0,
            estimated_total_tokens=0,
            cost_breakdown=CostBreakdown(
                input_cost_usd=0.0,
                output_cost_usd=0.0,
                total_cost_usd=0.0
            ),
            cost_per_chunk_usd=0.0,
            model_pricing=ModelPricing(
                provider=llm_provider,
                model=llm_model,
                input_price_per_1k=pricing["input"],
                output_price_per_1k=pricing["output"]
            ),
            warnings=[
                "⚠️ 이 문서에는 분석된 청크가 없습니다.",
                "문서를 먼저 업로드하고 임베딩을 생성하세요."
            ]
        )
