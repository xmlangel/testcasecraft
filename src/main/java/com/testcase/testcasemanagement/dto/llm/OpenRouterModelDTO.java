package com.testcase.testcasemanagement.dto.llm;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** OpenRouter 무료 모델 한 건. 관리자 화면의 모델 선택 목록에 그대로 실린다. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "OpenRouter 무료 모델 정보")
public class OpenRouterModelDTO {

  @Schema(description = "모델 슬러그", example = "nvidia/nemotron-3-nano-30b-a3b:free")
  private String id;

  @Schema(description = "표시 이름", example = "NVIDIA: Nemotron 3 Nano 30B A3B (free)")
  private String name;

  @Schema(description = "컨텍스트 길이(토큰)", example = "256000")
  private Integer contextLength;

  @Schema(description = "무료 제공 만료일. 없으면 null", example = "2026-08-24")
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
