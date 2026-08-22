package com.testcase.testcasemanagement.dto.llm;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 고를 수 있는 모델 한 건. 관리자 화면과 대화 화면의 선택 목록에 그대로 실린다.
 *
 * <p>제공자마다 채울 수 있는 항목이 다르다. OpenRouter 는 컨텍스트 길이·만료일·도구 지원까지 알려 주는데, NVIDIA 는 모델 목록에 이름만 있어
 * {@code id} 와 {@code name} 만 채워진다. 비어 있는 항목은 그 제공자가 알려 주지 않는다는 뜻이고 오류가 아니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "고를 수 있는 모델 정보")
public class LlmModelDTO {

  @Schema(description = "모델 슬러그", example = "nvidia/nemotron-3-nano-30b-a3b:free")
  private String id;

  @Schema(description = "표시 이름", example = "NVIDIA: Nemotron 3 Nano 30B A3B (free)")
  private String name;

  @Schema(description = "컨텍스트 길이(토큰). 제공자가 알려 주지 않으면 null", example = "256000")
  private Integer contextLength;

  @Schema(description = "무료 제공 만료일. 제공자가 알려 주지 않으면 null", example = "2026-08-24")
  private String expirationDate;

  @Schema(description = "도구 호출(tools) 지원 여부")
  private Boolean supportsTools;

  @Schema(
      description =
          """
          가용성. 목록 조회만 한 상태에서는 UNKNOWN 이고, 가용성 확인을 돌린 뒤에만 값이 채워진다.

          - AVAILABLE: 최소 요청이 정상 응답
          - RATE_LIMITED: 이 모델의 무료 공용 풀이 붐빔 (429). 잠시 뒤 풀릴 수 있다
          - ACCOUNT_LIMIT: 계정의 일일 무료 요청 한도 소진 (429). 모델 탓이 아니므로
            다른 모델로 바꿔도 해결되지 않는다. 선택 자체는 막지 않는다
          - UNAVAILABLE: 이 경로로는 쓸 수 없음 (403·404·502 등)
          - UNKNOWN: 아직 확인하지 않음
          """)
  private Availability availability;

  @Schema(description = "가용성 판정 사유. 화면 안내 문구로 쓴다")
  private String availabilityMessage;

  /** 무료 모델 가용성 상태 */
  public enum Availability {
    AVAILABLE,
    RATE_LIMITED,
    ACCOUNT_LIMIT,
    UNAVAILABLE,
    UNKNOWN
  }
}
