---
title: RAG 채팅 API 인증 오류 예외 처리 고도화 최종 보고서 (Walkthrough)
date: 2026-05-22
tags:
  - "project/testcasecraft"
  - "topic/rag/chat"
  - "type/walkthrough"
  - "level/stable"
source: "docs/obsidian/2026-05-22-2342-rag-chat-auth-fix/"
---

# RAG 채팅 API 인증 오류 예외 처리 고도화 최종 보고서 (Walkthrough)

RAG 채팅 요청 도중 외부 LLM API에서 `401 Unauthorized` 또는 `403 Forbidden` 인증 실패 오류가 반환되었을 때, 기존의 불분명한 에러("Failed to call OpenWebUI API") 대신 명확하고 조치 가능한 한국어 가이드 메시지를 화면에 노출하기 위해 백엔드 코드를 보완하였습니다.

---

## 1. 수정된 변경 사항 (Changes Made)

백엔드에서 동작하는 모든 외부 LLM API 클라이언트 파일들을 외과수술식으로 안전하게 수정하여 동일한 수준의 `WebClientResponseException` 예외 처리를 반영하였습니다.

1. **OpenWebUIClient.java**
   - 비스트리밍(`chat`) 및 스트리밍(`chatStream`) 호출 시, `WebClientResponseException`을 Catch 하도록 수정.
   - 상태 코드가 `401` 또는 `403`인 경우, **"OpenWebUI API 인증에 실패했습니다 (401/403). 등록된 API Key가 올바르고 만료되지 않았는지 확인해 주세요."** 라는 안내 메시지를 `LlmClientException`에 담아 상위로 전달.

2. **OpenAIClient.java**
   - 비스트리밍 및 스트리밍 호출 시 동일한 예외 처리 고도화 패턴을 도입하여 OpenAI API 인증 에러 발생 시 명확한 한국어 조치 메시지 반환.

3. **OpenRouterClient.java**
   - OpenRouter API 통신 도중 401/403 에러가 반환되는 상황을 감지해 **"OpenRouter API 인증에 실패했습니다..."** 조치 가이드를 제공하도록 `WebClientResponseException` 차단 캐치 추가.

4. **PerplexityClient.java**
   - Perplexity API를 대상으로 하는 동일한 인증 실패 우아한 에러 격리 로직 적용.

5. **OllamaClient.java**
   - 로컬 또는 외부 Ollama API 연동의 특성에 맞게, 인증 실패 혹은 유효하지 않은 API Key 연동 발생 시에 직관적인 에러가 표출되도록 핸들러 고도화 완료.

---

## 2. 검증 절차 및 결과 (What was Tested & Validation Results)

### 가. Gradle 컴파일 및 테스트 완전 패스
릴리즈 직전 백엔드 품질 신뢰성을 극대화하기 위해 전체 Java 소스 코드 컴파일 및 컨트롤러/서비스/리포지토리 전 영역에 걸친 통합 테스트 슈트를 완벽히 가동하였습니다.

* **검증 명령어:** `./gradlew test`
* **빌드 결과:** **BUILD SUCCESSFUL in 7m 37s**
  - 자바 소스코드 컴파일 시 빌드를 가로막는 신규 에러나 호환성 문제 없이, 수정한 5개의 자바 파일이 무사히 컴파일 및 클래스화되었음이 입증되었습니다.
  - 기존 통합 테스트 파일 중 오래되어 경고(warning)를 표시하던 제네릭 타입 캐스팅 관련 2건의 워닝을 제외한 일체의 린트/컴파일 에러가 전무합니다.

---

## 3. 사용자 조치 가이드 및 최종 안내

이번 백엔드 예외 처리의 완성으로 사용자는 RAG 채팅 페이지에서 **401 Unauthorized 에러**가 났을 때 원인을 쉽게 알 수 있게 됩니다.
1. 만약 RAG 채팅 테스트 중 **"API 인증에 실패했습니다 (401/403)"** 메시지를 보게 된다면, 이것은 현재 등록된 API Key가 올바르지 않거나 만료되었음을 의미합니다.
2. 백엔드 관리자 UI 설정 메뉴로 이동하여, 타겟 LLM 제공자(OpenWebUI, OpenAI, OpenRouter 등)의 **API Key를 다시 발급받아 새로 등록(저장)**하시면 정상적인 RAG 채팅 기능을 다시 사용하실 수 있습니다.
