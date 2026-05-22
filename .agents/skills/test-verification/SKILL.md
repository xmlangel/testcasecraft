---
name: test-verification
description: "Use when writing or running TestNG backend unit tests, Playwright E2E UI tests, or performing cross-boundary QA verification."
---

# 종합 테스트 및 검증(QA) 스킬

`testcasecraft` 프로젝트의 단위 테스트와 E2E 테스트 검증 시 이 스킬을 지침으로 사용하십시오. `docs/code-guide-line/TEST_ARCHITECTURE_GUIDE.md`를 최상위 원칙으로 삼습니다.

## 1. 백엔드 검증 (TestNG)

이 프로젝트는 **JUnit 대신 TestNG**를 메인 테스팅 프레임워크로 사용합니다.

- 테스트 코드 어노테이션은 `@Test(groups = "unit")` 또는 `@Test` (org.testng.annotations.Test)를 사용합니다.
- 특정 테스트 클래스 실행: `./gradlew test --tests "*ControllerTest*"`
- 검증 로직에는 확실한 `Assert`문을 포함하여 경계값 테스트(Boundary testing)를 수행하십시오.

## 2. 프론트엔드 E2E 검증 (Playwright)

실제 사용자 뷰포트와 시나리오 기반의 E2E 테스트는 Playwright를 사용합니다.

- 경로: `src/test/e2e/` 하위 모듈.
- 실행 방식: `npm run test:{issue-number} --prefix src/test/e2e` (서버가 8080에 구동 중이어야 함).
- 특정 요소(버튼, 모달)가 화면에 정확히 렌더링되었는지 검증할 때 `page.locator()`를 견고하게 지정하십시오.

## 3. 경계면 교차 비교 (Cross-Boundary Verification)

QA 에이전트는 항상 다음을 교차 확인해야 합니다:

- 백엔드 DTO 설계도와 프론트엔드 Axios Response Type이 일치하는가?
- 데이터 필드명 오타(camelCase vs snake_case)로 인한 렌더링 누락이 발생하지 않았는가?
