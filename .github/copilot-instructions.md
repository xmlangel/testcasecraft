# Copilot Instructions — testcasecraft

테스트케이스 관리 도구. Spring Boot 3.4(Java 21) 백엔드 + React 18(JSX) / MUI v7 / Vite 프런트엔드 모놀리식 구조.

## 리뷰 공통 규칙

- 리뷰 코멘트는 **한국어**로 작성한다.
- 칭찬보다 실질적 결함(버그·보안·데이터 정합성) 위주로 코멘트한다. 사소한 스타일 지적은 생략한다.
- 제안 시 가능하면 수정 코드 예시(suggested change)를 포함한다.

## 프런트엔드 (src/main/frontend, JSX)

- **자동저장/디바운스 로직**(`useAutoSave` 등) 변경 시 최우선 확인: 사용자가 수정하지 않았는데 저장(PUT/POST)이 발생할 수 있는 경로가 없는지 — 특히 마운트 직후 초기 상태 스냅샷, StrictMode 이중 마운트, 언마운트 저장, 케이스 전환(props/state 혼합) 경합.
- 사용자에게 보이는 문자열은 하드코딩하지 않고 `t("key", "한국어 fallback")` (I18nContext) 를 사용하는지 확인한다.
- `VIEWER` 권한 사용자는 읽기 전용이다 — 입력/저장 UI와 API 호출이 `isViewer` 가드를 우회하지 않는지 확인한다.
- MUI는 **v7 API** 기준이다 (예: Grid의 `size={{ xs, md }}` 형식). 구버전 API(`item xs={...}`) 사용을 지적한다.
- `useEffect` 의존성 배열 누락/과잉으로 인한 무한 루프·stale closure를 확인한다.
- 상태는 불변 업데이트(spread)로 다루고, props/상태 직접 변이를 지적한다.

## 백엔드 (src/main/java)

- 신규/변경 엔드포인트에 인가 검증(`@PreAuthorize`/`@Secured` 또는 SecurityConfig 규칙)이 빠지지 않았는지 확인한다.
- 요청 DTO 입력 검증(null/빈 값/길이)과 일관된 에러 응답 형식을 확인한다.
- JPA: N+1 쿼리, LazyInitializationException 위험, 트랜잭션 경계(`@Transactional`) 누락을 확인한다.
- 엔티티/스키마 변경 시 기존 데이터와의 호환성(레거시 값 — 예: `NOTRUN` vs `NOT_RUN`)을 고려했는지 확인한다.
- 로그에 토큰·비밀번호·개인정보가 출력되지 않는지 확인한다. `System.out.println` 대신 로거 사용을 권장한다.

## 데이터 정합성 (핵심 도메인 규칙)

- 테스트 결과는 **사용자가 명시적으로 수정/저장한 경우에만** 생성·갱신되어야 한다. 조회만으로 빈 NOT_RUN 레코드가 생기거나 기존 결과가 덮어써지는 변경은 차단한다.
- 결과 통계(성공/실패/차단/미실행 집계)는 백엔드 기준(`MAX(executed_at)` latest)과 프런트 표시(`getLatestResults`)가 일치해야 한다 — 한쪽만 바꾸는 변경을 지적한다.

## 테스트·커밋

- 버그 수정 PR에는 해당 시나리오의 회귀 테스트(또는 검증 근거)가 포함되는 것이 바람직하다.
- 커밋/PR 제목은 conventional commits(`feat:`, `fix:`, `chore:` 등) 형식을 따른다.
