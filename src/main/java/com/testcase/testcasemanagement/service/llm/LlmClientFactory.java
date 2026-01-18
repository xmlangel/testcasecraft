package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.model.LlmConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * LLM 클라이언트 팩토리
 *
 * LlmConfig의 provider에 따라 적절한 LlmClient 구현체를 반환
 */
@Component
@RequiredArgsConstructor
public class LlmClientFactory {

    private final List<LlmClient> llmClients;
    private Map<LlmConfig.LlmProvider, LlmClient> clientMap;

    /**
     * LlmConfig에 맞는 LlmClient 반환
     *
     * @param config LLM 설정
     * @return LlmClient 구현체
     * @throws IllegalArgumentException 지원하지 않는 provider인 경우
     */
    public LlmClient getClient(LlmConfig config) {
        if (clientMap == null) {
            // 지연 초기화: 모든 LlmClient 빈들을 provider별로 매핑
            clientMap = llmClients.stream()
                    .collect(Collectors.toMap(
                            LlmClient::getSupportedProvider,
                            Function.identity()
                    ));
        }

        LlmClient client = clientMap.get(config.getProvider());
        if (client == null) {
            throw new IllegalArgumentException(
                    "Unsupported LLM provider: " + config.getProvider()
            );
        }

        return client;
    }
}
