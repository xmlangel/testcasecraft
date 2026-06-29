---
name: testcasecraft-i18n-audit
description: testcasecraft 프런트엔드의 한/영 전환 무결성을 전수 감사하고 누락 번역을 보강하는 절차. ①코드 t() 키 ↔ DB 번역 대조 ②t() 밖 하드코딩 한국어 검출(scripts/i18n_scan.py) ③누락분 t() 래핑(병렬 에이전트) ④시드 클래스 생성 + 실행 DB 푸시 ⑤Playwright 양방향 E2E 검증까지 한 사이클. 트리거 — "한/영 전환 확인", "영어 모드에 한국어가 보여", "번역 누락 검사", "i18n 감사", "i18n 전수검사", "번역 보강", "다국어 깨짐", "영어로 안 바뀌는 문구", "i18n 다시 검사", "번역 추가해줘", "하드코딩 한국어 찾아줘". 새 UI 문구 1~2개 추가는 본 스킬 없이 t() + 시드 직접 추가. 번역 관리 화면 사용법은 매뉴얼 §17-8.
---

# testcasecraft-i18n-audit

testcasecraft 의 i18n 은 **DB 기반**이다 — 프런트 `t(key, koFallback, params)` 가 `/api/i18n/translations/{lang}` 에서 로드한 값을 쓰고, 없으면 한국어 fallback 을 그대로 노출한다. 따라서 "영어 모드에 한국어가 보인다"는 증상의 원인은 정확히 두 가지뿐이다:

| 원인 | 검출 방법 | 보강 방법 |
|------|----------|----------|
| A. t() 키는 있는데 **EN 번역이 DB에 없음** | 코드 키 추출 ↔ EN DB 대조 | 시드 클래스 + DB 푸시 |
| B. 문자열이 **t() 밖에 하드코딩**됨 | `scripts/i18n_scan.py` | t() 래핑 + 신규 키 시드 |

2026-06-06 전수 보강(1,196건, 커밋 d2a62bd3)에서 이 절차 전체가 검증됐다.

## 1단계 — 감사 (정량화 먼저)

```bash
# A. 코드 t() 키 vs DB (서버 가동 필요)
curl -s http://localhost:8080/api/i18n/translations/en > /tmp/en.json
curl -s http://localhost:8080/api/i18n/translations/ko > /tmp/ko.json
# 코드에서 t("key") 전수 추출 후 en.json 에 없는 키 목록화 (정규식: \bt\(\s*["'`]([A-Za-z0-9_.\-]+))

# B. 하드코딩 한국어 (console 줄 제외, t() 스팬 제외)
# 항상 리포 루트(/Users/dicky/kmdata/git/testcase/testcasecraft)에서 실행
python3 scripts/i18n_scan.py --all          # 전체 요약
python3 scripts/i18n_scan.py <파일경로...>   # 파일별 상세 (종료코드로 CI 가능)
```

스캐너 잔여 수치를 그대로 믿지 말 것 — `debugLog("한국어")` 같은 **멀티라인 로깅 래퍼 내부**는 래핑 비대상인데 스캐너가 잡는다. 진짜 UI 잔여만 추리려면 t/console/debugLog/logger 호출 스팬을 모두 제거한 후 측정한다 (2026-06-06 사례: 명목 305 → 진짜 190).

## 2단계 — 하드코딩 래핑 (대량이면 병렬 에이전트)

규칙:
- 사용자 노출 문자열(라벨·버튼·placeholder·tooltip·스낵바·alert/confirm·다이얼로그·빈상태·차트 포맷) → `t("키", "한국어원문")`. 보간 `${x}` → `t("키", "...{x}...", { x })`.
- 래핑 금지: 주석, console.*, data-testid, 로직 비교/저장/서버 전송 값, 정규식, 데모 데이터. **단, `setError`/`setSnackbar` 에 들어가는 메시지는 UI 노출이므로 래핑 대상** — "에러라서 스킵"으로 오분류하기 쉽다.
- 키 네이밍: 파일의 기존 t() prefix 재사용. 마지막 세그먼트는 영어 camelCase.
- Context 파일(TestContext 등)·비컴포넌트 유틸은 t 를 직접 못 쓴다 — 무리한 구조 변경 금지, skipped 사유 기록 (백로그: 에러코드 체계).
- **ko 원문을 영어 리터럴로 바꿔치기 금지** — 한국어 사용자에게 영어가 노출되는 회귀다 (RAGContext 사례).

대량(50건+) 래핑은 파일 단위로 배치를 나눠 general-purpose 에이전트를 병렬 투입한다. 에이전트 프롬프트에 반드시 포함: ①"모든 담당 파일을 끝까지 처리, JSON 보고만 금지" ②자가 검증 `python3 scripts/i18n_scan.py <파일>` 잔여 0 또는 정당 스킵 ③구문 검증 `npx esbuild --loader:.jsx=jsx src/<파일> --outfile=/dev/null` ④산출 JSON `{"entries":[{key,ko,en}],"skipped":[...]}`. 에이전트는 일부만 하고 끝내는 경향이 있으므로 **완료 후 스캐너로 객관 재측정 → 잔여분 후속 웨이브**가 필수다.

## 3단계 — 검증 병합 (고아 차단)

에이전트 entries 를 그대로 시드하지 말 것. **코드에 실제 존재하는 t() 키만** 시드한다 — 파일을 안 고치고 JSON 만 만든 에이전트의 고아 엔트리를 걸러낸다 (2026-06-06 사례: 262건 차단). 참조 구현: `.workspace/i18n-audit/merge_entries.py`. 코드에 있는데 entries 에 없는 키는 미번역 목록으로 뽑아 직접 번역한다.

## 4단계 — 시드 + 반영

영구 시드(신규 설치용)와 실행 중 DB(즉시 확인용) 둘 다 반영해야 한다.

1. **시드 클래스 쌍** 생성/확장 — 패턴은 기존 파일 참조:
   - 키: `config/i18n/keys/I18nGapKeysInitializer.java` (createTranslationKeyIfNotExists)
   - 값: `config/i18n/translations/Korean*/English*Translations.java` (setter 패턴 helper)
   - 두 애그리게이터(`TranslationKeyDataInitializer`, `TranslationDataInitializer`)에 등록
   - `./gradlew compileJava` 통과 확인. 앱 시작 시 멱등 시드됨.
2. **실행 DB 푸시** (재시작 없이): admin 토큰으로
   `POST /api/admin/translations/keys` → `POST /api/admin/translations`(ko/en) → `POST /api/i18n/cache/clear`

## 5단계 — E2E 양방향 검증

Playwright 로 주요 라우트(14개: projects/dashboard/testcases/testplans/executions/results/automation/rag/admin 6종)를 EN·KO 모두 순회한다.

- **EN 검증**: body innerText 의 한글 잔존 0 (시드 데이터 — 플랜명·사용자명·아바타 이니셜 — 는 prefix 필터로 제외)
- **KO 검증**: 주요 한국어 라벨 존재 (영어 회귀 방지)
- ⚠️ **로그인 레이스**: 로그인 클릭 직후 navigate 하면 토큰 저장 전에 이동해 **로그인 화면을 측정하는 가짜 통과/실패**가 난다. `page.wait_for_function("() => !!localStorage.getItem('accessToken')")` 대기 + 각 페이지에서 로그인 폼 부재 단언이 필수.
- 언어 전환은 localStorage `preferred-language` + `user.preferredLanguage` 갱신 + `i18n-cache-*` 삭제 후 reload.

## 알려진 백로그 (이 스킬 범위 밖)

- 서비스 레이어(.js) `throw Error("한국어")` ~800건 — 에러코드 체계 필요
- Context 메시지 (TestContext 17·ProjectContext 4·RAGContext 5)
- 백엔드 데이터 한국어 (스케줄러 잡 이름), 날짜 포맷 ko-KR 고정 (EN 모드 '오전' 노출)

## 종료 보고

수치로 보고한다: 감사(키 N / 하드코딩 M) → 래핑 X건 / 정당 스킵 Y건 → 시드 Z건 → E2E EN 한글 잔존 0 · KO 정상. 미해결은 백로그 목록에 추가.
