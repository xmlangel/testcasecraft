---
title: RAG 채팅 API 인증 오류 예외 처리 고도화 한글 릴리즈 노트 v1.0.77
date: 2026-05-22
tags:
  - "project/testcasecraft"
  - "topic/rag/chat"
  - "topic/api/auth"
  - "type/release_note"
  - "level/stable"
source: "docs/obsidian/2026-05-22-2342-rag-chat-auth-fix/"
---

# 🚀 Test Case Craft - Release Notes v1.0.77

* **배포 버전:** `v1.0.77`
* **배포 일자:** 2026-05-22
* **핵심 주제:** RAG 채팅 API 외부 연동 인증(401/403) 오류 예외 핸들링 정밀 고도화 및 명확한 한국어 사용자 가이드 표출

---

## 📝 릴리즈 개요 (Release Overview)

본 릴리즈(`v1.0.77`)에서는 RAG(검색 증강 생성) 기반 채팅 시 외부 LLM API(OpenWebUI, OpenAI, OpenRouter, Perplexity, Ollama)와의 통신 과정에서 발생할 수 있는 인증 오류(`401 Unauthorized` 또는 `403 Forbidden`)를 정밀하게 분석하고 가로채도록 예외 핸들러를 전면 개선하였습니다.

기존의 모호한 내부 500 에러("Failed to call API") 대신, 사용자가 화면에서 즉각 인지하고 관리자가 조치할 수 있도록 직관적이고 친절한 한국어 가이드 메시지를 표출합니다.

---

## 🛠️ 주요 변경 사항 (Key Improvements)

### 1. 외부 LLM 클라이언트 계층 예외 정교화
* `WebClientResponseException`을 Catch 블록 전면에 배치하여 HTTP 응답 코드를 조기에 분기 처리합니다.
* 401/403 상태 코드를 만났을 때 전용 사용자 친화적인 한국어 안내 예외(`LlmClientException`)를 빌드하여 던집니다.

| 대상 컴파일 파일 | 개선 및 변경 사항 |
| :--- | :--- |
| **OpenWebUIClient.java** | 만료/잘못된 API Key로 인한 401 에러 감지 시 한글 안내 및 복호화 예외 로깅 강화 |
| **OpenAIClient.java** | 비스트리밍(`chat`) 및 스트리밍(`chatStream`) 연동 전송에 정교한 API 오류 격리 적용 |
| **OpenRouterClient.java** | OpenRouter 엔드포인트 응답 지연 및 비정상 API Key 예외 상황 캐치 추가 |
| **PerplexityClient.java** | Perplexity AI 연동 규격에 맞춰 HTTP 응답 예외 바인딩 고도화 |
| **OllamaClient.java** | Ollama API의 인증 요구 상황 시 적합한 한국어 가이드 메시지 반환 핸들러 추가 |

---

## 🛡️ 안정성 및 품질 검증 (Verification & QA Results)

### 가. Gradle 컴파일 및 테스트 완전 패스
릴리즈 직전 백엔드 품질 신뢰성을 극대화하기 위해 전체 Java 소스 코드 컴파일 및 컨트롤러/서비스/리포지토리 전 영역에 걸친 통합 테스트 슈트를 완벽히 가동하였습니다.

* **검증 명령어:** `./gradlew test`
* **빌드 결과:** `BUILD SUCCESSFUL in 7m 37s` (11 actionable tasks)
* **품질 지표:** 
  - 신규 예외 처리 로직으로 인한 기존 API 규격 회귀 에러 발생율 **0%**
  - 서비스 기동 및 컨트롤러 스키마 매핑 적합성 테스트 완전 패스
  - 리포지토리 쿼리 및 성능 인덱스 테스트 전체 통과

---

## 💡 관리자 및 사용자 조치 가이드

RAG 채팅 기능을 활용하는 도중 아래와 같은 팝업이나 토스트 에러가 표출되는 경우의 직관적인 해결 방안입니다.

> **💡 에러 발생 시 예시 화면 메시지:**
> *"API 인증에 실패했습니다 (401/403). 등록된 API Key가 올바르고 만료되지 않았는지 확인해 주세요."*

1. **원인:** 데이터베이스 혹은 설정에 등록된 해당 LLM 제공자용 API Key가 만료되었거나, 토큰 값이 잘못 유입되었습니다.
2. **조치 방법:**
   - 시스템 관리자 콘솔 또는 LLM 연동 설정 메뉴로 이동합니다.
   - 연동하려는 외부 서비스(예: OpenAI, OpenWebUI) 웹사이트에서 유효한 신규 API Key를 발급받습니다.
   - 설정 입력창에 해당 API Key를 교체 등록한 후 저장하면, 시스템 재시작 없이 실시간으로 RAG 채팅 기능이 정상 복구됩니다.
