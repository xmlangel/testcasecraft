package com.testcase.testcasemanagement.dto.llm;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

/**
 * 가용성 확인 작업의 상태.
 *
 * <p>확인은 최악의 경우 몇 분이 걸린다(OpenRouter 2분 30초, NVIDIA 6분). 결과를 기다려 돌려주면 리버스 프록시 타임아웃에 먼저 걸려 응답을 아예
 * 받지 못하고, 그동안 확인은 서버에서 계속 도는데 결과가 버려진다. 그래서 작업으로 만들고 화면이 진행 상황을 물어보게 한다.
 */
@Data
@Builder
@Schema(description = "가용성 확인 작업 상태")
public class LlmModelProbeJob {

  /** 작업 상태. */
  public enum Status {
    /** 확인 중. 화면은 진행률을 보여 준다. */
    RUNNING,
    /** 끝났다. {@code result} 에 결과가 있다. */
    DONE,
    /** 실패했다. {@code errorMessage} 에 사유가 있다. */
    FAILED
  }

  @Schema(description = "작업 ID. 진행 상황을 물어볼 때 쓴다")
  private String jobId;

  @Schema(description = "작업 상태")
  private Status status;

  @Schema(description = "확인 대상 개수")
  private int total;

  @Schema(description = "지금까지 끝난 개수. 건너뛴 것도 센다")
  private int done;

  @Schema(description = "끝났을 때의 결과. 진행 중이면 비어 있다")
  private LlmModelProbeResponse result;

  @Schema(description = "실패 사유. 실패하지 않았으면 비어 있다")
  private String errorMessage;
}
