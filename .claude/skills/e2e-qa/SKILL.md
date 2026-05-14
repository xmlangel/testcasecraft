---
name: e2e-qa
description: 작성된 Playwright E2E 테스트의 fixture-Spec-PageObject 3자 매칭, 셀렉터 안정성, assertion 품질, 회귀, 정적 구문을 검증한다. 자동 수정 가능 항목은 직접 Edit. e2e-spec-writing 다음 단계.
---

# E2E QA

E2E 테스트 추가의 **경계면 정합성**을 검증한다.

## 워크플로우

### 1. 산출물 읽기

- `_workspace/e2e_01_scenario_{feature}.json`
- `_workspace/e2e_02_page_object_{feature}.md`
- `_workspace/e2e_03_spec_{feature}.md`

### 2. fixture-Spec-PO 3자 매칭

```bash
# Spec이 사용하는 fixture (destructuring)
grep -oP "async \(\{[^}]+\}" src/test/e2e/{module}/{feature}-test.js | \
  grep -oP "\b\w+(?=[,}])"

# fixture 정의 확인
grep -oP "^\s+(\w+):\s*async" src/test/e2e/fixtures/test-fixtures.js

# Spec이 호출하는 메서드
grep -oP "{feature}Page\.\w+\(" src/test/e2e/{module}/{feature}-test.js | \
  sort -u

# Page Object 메서드 정의
grep -E "^\s+async\s+\w+\(" src/test/e2e/pages/{Feature}Page.js
```

3자가 모두 매칭되어야 Pass. 누락 시 자동 수정 시도.

### 3. 셀렉터 안정성 평가

```bash
# Page Object의 모든 셀렉터 추출
grep -oP "page\.locator\(['\"][^'\"]+['\"]" src/test/e2e/pages/{Feature}Page.js

# data-testid 사용 비율 계산
```

기준:
- data-testid 비율 ≥ 70% → ✅
- 70% 미만 → ⚠️ (frontend 수정 권장)
- 50% 미만 → ❌ (보고서 ❌ 섹션)

### 4. assertion 품질

```bash
# expect 호출 패턴 추출
grep -oP "expect\([^)]+\)\.\w+" src/test/e2e/{module}/{feature}-test.js | \
  awk -F'.' '{print $NF}' | sort | uniq -c
```

기준:
- `toBeVisible` 비율 ≤ 60% → ✅
- 60~80% → ⚠️ (assertion 다양화 권장)
- 80%+ → ❌ (시나리오 보강 필요)

### 5. 정적 구문 체크

```bash
node -c src/test/e2e/pages/{Feature}Page.js && \
node -c src/test/e2e/{module}/{feature}-test.js
```

문법 오류 시 즉시 보고. 가능하면 자동 수정.

### 6. 회귀 검증

```bash
# 기존 파일 수정 여부
git diff --name-only src/test/e2e/pages/
git diff --name-only src/test/e2e/fixtures/

# 수정된 기존 파일 내용 검증 (신규 라인만 있는지)
git diff src/test/e2e/fixtures/test-fixtures.js
```

신규 라인만 있고 기존 코드 변경 없어야 함.

### 7. 자동 수정

| 이슈 | 자동 수정 |
|------|----------|
| Spec의 fixture 이름 오타 | PO에 등록된 정확한 이름으로 수정 |
| PO에 메서드 누락(Spec에서 호출) | 스텁 메서드 + TODO 주석 추가 |
| fixture 미등록 | fixtures/test-fixtures.js에 import + 객체 항목 추가 |
| 누락된 require | 적절한 import 추가 |

자동 수정 후 같은 grep 재실행으로 통과 확인.

### 8. 보고서 작성

`_workspace/e2e_04_qa_report_{feature}.md`에 작성. 형식은 agents/e2e-qa.md 참조.

검증 통계 포함:
- 시나리오 수, test 블록 수
- fixture 사용 개수
- data-testid 비율, 셀렉터 점수
- assertion 다양성 분포
- 자동 수정 수, 수동 필요 수

## 실행 명령 (사용자 위임)

QA는 직접 실행하지 않는다. 보고서에 명령만 명시:

```
1. cd src/test/e2e && npm install   (의존성 변경 시)
2. ./gradlew bootRun                 (백엔드 8080 가동)
3. npx playwright test {module}/{feature}-test.js
4. (선택) npx playwright show-report
```

## 자동 수정 후 재검증

자동 수정한 항목은 보고서 ⚠️ 섹션에 기록하되, 수정 후 다시 grep으로 통과 확인. 통과 안 되면 ❌로 격하.

## 원칙

- **존재 검사 ≠ 정합성 검사:** 3자 매칭이 진짜 검증
- **빌드/실행 직접 금지:** AGENTS.md 1.1, 명령만 보고
- **회귀 우선:** 새 테스트 추가보다 기존 테스트가 깨지지 않는 것이 중요
- **자동 수정 후 재검증:** 수정 → grep → 통과 확인 → 보고

## 후속 작업 지원

수동 조치 항목을 사용자가 처리한 후 "재검증"을 요청하면:
- 같은 feature slug로 다시 실행
- 보고서 덮어쓰기
