package com.testcase.testcasemanagement.dto.llm;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

/**
 * OpenRouter 무료 모델 조회·가용성 확인 요청
 *
 * <p>API Key 를 얻는 경로가 둘이다. 새로 만드는 설정은 화면에서 입력한 {@code apiKey} 를 그대로 보내고, 이미 저장된 설정은 키를 다시 타이핑하지 않도록
 * {@code configId} 만 보내면 서버가 저장된 키를 복호화해 쓴다. 둘 다 오면 {@code apiKey} 를 우선한다.
 */
@Data
@Schema(description = "OpenRouter 모델 조회 요청")
public class OpenRouterModelQueryRequest {

  @Schema(description = "OpenRouter API Key. 저장 전 설정에서 사용", example = "sk-or-v1-…")
  private String apiKey;

  @Schema(description = "이미 저장된 LLM 설정 ID. 저장된 키를 재사용할 때 사용")
  private String configId;

  @Schema(
      description = "가용성 확인 대상 모델 슬러그. 확인 요청에서만 쓰고, 비우면 무료 모델 전체를 확인한다",
      example = "[\"nvidia/nemotron-3-nano-30b-a3b:free\"]")
  private List<String> modelIds;

  @Schema(
      description =
          """
          이미 판정한 모델 슬러그. 이 목록에 있는 모델은 확인하지 않고 건너뛴다.
          확인 한 번이 무료 일일 한도를 그만큼 쓰므로, 버튼을 다시 눌렀을 때 같은 모델을
          또 두드리지 않게 하려는 것이다.
          """)
  private List<String> alreadyChecked;
}
