package com.testcase.testcasemanagement.dto.llm;

import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 모델 목록을 내주는 제공자 정보.
 *
 * <p>화면이 어느 제공자에서 목록 선택기를 띄울지, 그리고 전수 확인을 기본으로 권할지 정하는 데 쓴다. 제공자 목록을 화면에 박아 두면 제공자를 더할 때마다 화면도
 * 고쳐야 하므로 서버가 알려 준다.
 *
 * @param provider 제공자
 * @param displayName 화면 표시 이름
 * @param probeRecommendedByDefault 전수 확인을 기본으로 권하는지. NVIDIA 처럼 목록의 상당수가 계정에 없어 확인이 필수인 제공자는 true,
 *     OpenRouter 처럼 확인이 한도를 태우는 제공자는 false
 */
@Schema(description = "모델 목록을 내주는 제공자 정보")
public record LlmModelCatalogInfo(
    @Schema(description = "제공자") LlmProvider provider,
    @Schema(description = "표시 이름", example = "NVIDIA") String displayName,
    @Schema(description = "전수 확인을 기본으로 권하는지") boolean probeRecommendedByDefault) {}
