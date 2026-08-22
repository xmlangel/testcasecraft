package com.testcase.testcasemanagement.dto.llm;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 가용성 확인 결과
 *
 * <p>모델별 판정과 함께 계정 한도 상태를 담는다. 한도 개념이 없는 제공자(NVIDIA)에서는 {@code accountLimit} 이 항상 null 이다. 한도 상태를 별도 필드로 두는 이유는, 판정 사유 문자열에 묻어 두면 화면이 그것을 문자열로 뒤져야 하고 그 방식은
 * 문구를 고칠 때마다 깨지기 때문이다.
 *
 * <p>계정의 무료 일일 잔량은 <b>미리 알 수 없다</b>(실측). 정상 응답 헤더에는 한도 정보가 없고 {@code /api/v1/key} 는 달러 크레딧만 알려 준다.
 * 429 응답 헤더에만 들어 있으므로, 한 번 걸린 뒤에야 잔량과 초기화 시각을 알 수 있다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "모델 가용성 확인 결과")
public class LlmModelProbeResponse {

  @Schema(description = "모델별 판정. 슬러그 순으로 정렬된다")
  private List<LlmModelDTO> models;

  @Schema(description = "계정 무료 일일 한도 상태. 이번 확인에서 한도에 걸리지 않았으면 null")
  private AccountLimit accountLimit;

  @Schema(description = "이번 확인에서 실제로 보낸 요청 수. 재사용으로 건너뛴 것은 세지 않는다")
  private Integer requestsSent;

  /**
   * 한 회차 확인 상한 때문에 목록에서 빠진 모델 수.
   *
   * <p>이 값이 없으면 요청한 모델이 결과에서 조용히 사라진다. 45개를 확인 요청했는데 상한이 40이면 5개가 결과에 없고, 화면은 전부 확인된 것으로 보인다.
   * 확인되지 않은 모델을 나중에 골라 채팅하면 실패하고 원인을 되짚기 어렵다.
   */
  @Schema(description = "한 회차 상한 때문에 확인하지 못한 모델 수. 상한에 걸리지 않았으면 0")
  private Integer skippedByLimit;

  @Schema(description = "한 회차 확인 상한. 화면이 남은 개수를 안내할 때 쓴다")
  private Integer probeLimit;

  /** 계정 무료 일일 한도 상태. 429 응답 헤더에서 얻는다. */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @Schema(description = "계정 무료 일일 한도 상태")
  public static class AccountLimit {

    @Schema(description = "일일 한도 요청 수", example = "50")
    private Integer limit;

    @Schema(description = "남은 요청 수", example = "0")
    private Integer remaining;

    @Schema(description = "한도가 초기화되는 시각 (KST)", example = "2026-08-23 09:00 KST")
    private String resetAt;
  }
}
