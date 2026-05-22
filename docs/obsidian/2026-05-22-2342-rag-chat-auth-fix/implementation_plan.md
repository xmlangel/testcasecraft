---
title: RAG 채팅 401 Unauthorized 오류 예외 핸들링 강화 구현 계획서
date: 2026-05-22
tags:
  - "project/testcasecraft"
  - "topic/rag/chat"
  - "type/plan"
  - "level/stable"
source: "docs/obsidian/2026-05-22-2342-rag-chat-auth-fix/"
---

# RAG 채팅 401 Unauthorized 오류 예외 핸들링 강화 구현 계획서

RAG 채팅 시 발생하는 외부 LLM API(OpenWebUI) 인증 실패(`401 Unauthorized`) 오류를 보다 세밀하게 감지하고, 사용자와 관리자에게 명확한 조치 가이드를 제공하기 위한 개선 계획입니다.

## User Review Required

> [!IMPORTANT]
> 1. 이번 변경은 백엔드 소스코드 내의 예외 처리(Exception Handling)를 고도화하는 외과수술식 수정입니다.
> 2. 실제 데이터베이스 내에 저장된 만료되거나 유효하지 않은 API 키 자체는 웹 UI 관리자 설정 창에서 사용자가 직접 올바른 키로 재등록해야 합니다. 본 변경을 통해 401 에러가 발생했을 때 **"API Key 인증에 실패했습니다 (401 Unauthorized). 등록된 API Key의 유효성을 확인하고 다시 등록해 주세요."** 라는 구체적인 가이드 메시지를 화면에 노출하게 됩니다.

## Open Questions

* 본 작업에서는 C++ 소스 파일은 일절 수정하지 않으며, Java LLM Client 소스 코드만 정밀 수정합니다.
* 추가적으로, 복호화 키(`JIRA_ENCRYPTION_KEY`)의 설정 에러 등이 의심되는 상황을 대비해 복호화 실패 시에도 구체적인 원인 로깅을 강화합니다.

## Proposed Changes

### LLM API Client Layer

외부 LLM 서비스들과 통신하는 WebClient의 호출 예외 중 `WebClientResponseException`을 세분화하여 처리합니다. 특히 `401 Unauthorized` 또는 `403 Forbidden` 상태 코드가 수신되는 경우 명시적인 비즈니스 안내 메시지를 예외에 포함합니다.

---

#### [MODIFY] [OpenWebUIClient.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/service/llm/OpenWebUIClient.java)
- `chat` 및 `chatStream` 메소드 내 `catch (Exception e)` 블록 이전에 `WebClientResponseException`을 잡는 구문을 추가합니다.
- `401` 혹은 `403` 상태 코드를 만났을 때, 한글 안내 메시지를 `LlmClientException`에 담아 던집니다.
- 복호화 에러(`RuntimeException`)가 발생했을 때도 상세 내용을 한글로 로깅 및 래핑합니다.

#### [MODIFY] [OpenAIClient.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/service/llm/OpenAIClient.java)
- `OpenWebUIClient.java`와 마찬가지로 `chat` 및 `chatStream` 내에 `WebClientResponseException` 처리를 강화합니다.

#### [MODIFY] [OpenRouterClient.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/service/llm/OpenRouterClient.java)
- OpenRouter API 인증 오류 시 명확한 메시지를 제공합니다.

#### [MODIFY] [PerplexityClient.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/service/llm/PerplexityClient.java)
- Perplexity API 인증 오류 핸들링을 적용합니다.

#### [MODIFY] [OllamaClient.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/service/llm/OllamaClient.java)
- Ollama API 인증(또는 네트워크 연결 거부) 시 핸들링을 정교화합니다.

---

### 상세 구현 예시 (OpenWebUIClient.java)

```java
    } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
      log.error("❌ OpenWebUI API 응답 에러 (상태코드: {})", e.getStatusCode(), e);
      if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
        throw new LlmClientException("OpenWebUI API 인증에 실패했습니다 (401/403). 등록된 API Key가 올바르고 만료되지 않았는지 확인해 주세요.", e);
      }
      throw new LlmClientException("OpenWebUI API 호출 실패 (상태코드: " + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
    } catch (Exception e) {
      log.error("❌ OpenWebUI API 호출 실패", e);
      throw new LlmClientException("Failed to call OpenWebUI API: " + e.getMessage(), e);
    }
```

## Verification Plan

## Automated Tests
- Gradle 테스트 컴파일이 정상 통과하는지 확인합니다.
```bash
./gradlew compileJava compileTestJava
```

## Manual Verification
1. 수정한 소스코드가 빌드 및 실행에 지장이 없는지 확인합니다.
2. 예외 처리 로직이 성공적으로 삽입되었는지 코드를 재검증합니다.
