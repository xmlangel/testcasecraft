---
name: i18n-qa
description: 추가된 i18n 키들의 4-way 일관성(Frontend t() 호출 ↔ KeysInitializer ↔ Korean Translations ↔ English Translations)을 교차 검증한다. 누락된 번역, 미등록 신규 KeysInitializer, placeholder 불일치를 찾아내고 자동 수정 가능한 항목은 직접 Edit. i18n-writing 다음 단계.
---

# i18n QA

i18n 키 추가의 **경계면 정합성**을 검증한다. 4곳 모두에서 동일한 키 세트가 매칭되는지 확인.

## 워크플로우

### 1. 산출물 읽기

- `_workspace/i18n_01_classification_{task}.json`
- `_workspace/i18n_02_writing_{task}.md`

처리 대상 키 목록 + 분류된 파일 정보 확보.

### 2. 4-way grep 매칭

각 키에 대해 4번 grep 실행하여 매칭 횟수 확인:

```bash
# (a) Keys 등록 확인
grep -c '"{keyName}"' {classification.keysFile}

# (b) Korean 번역 확인
grep -c '"{keyName}"' {classification.koreanFile}

# (c) English 번역 확인
grep -c '"{keyName}"' {classification.englishFile}

# (d) Frontend 호출 확인 (선택)
grep -rln 't("{keyName}"' src/main/frontend/src
```

기대 매칭:
- (a), (b), (c) 각 1회 매칭 → Pass
- (d) 0회면 미사용 키(경고), 1회 이상이면 정상

### 3. placeholder 일관성 검사

Korean 번역값과 English 번역값에서 `{변수}` 패턴을 정규식으로 추출하여 set 비교:

```python
import re
ko_vars = set(re.findall(r'\{(\w+)\}', ko_value))
en_vars = set(re.findall(r'\{(\w+)\}', en_value))
if ko_vars != en_vars:
    warn(f"{keyName}: placeholder 불일치 (ko={ko_vars}, en={en_vars})")
```

### 4. TranslationKeyDataInitializer 등록 검증

writer가 신규 KeysInitializer를 생성한 경우만:

```bash
grep -n '{NewClassName}' src/main/java/.../i18n/TranslationKeyDataInitializer.java
```

기대: 2회 매칭 (private final 필드 + initialize() 호출). 누락 시 자동 수정.

### 5. 회귀 확인

Writer가 수정한 파일들에서 기존 키 값이 우연히 바뀌지 않았는지:

```bash
git diff src/main/java/.../i18n -- ':!*backup*'
```

기대: 추가 라인만 있고, 기존 라인 변경 없음. 변경 있으면 ❌ Issue.

### 6. 자동 수정 적용

누락 항목 중 다음은 직접 Edit으로 수정:
- Korean 번역 누락 → Korean*Translations에 추가 (classifier 결과의 `ko` 값 사용)
- English 번역 누락 → English*Translations에 추가
- Keys 등록 누락 → KeysInitializer에 추가
- TranslationKeyDataInitializer 등록 누락 → field + call 두 줄 추가

자동 수정 후 같은 grep을 다시 실행해 통과 확인.

### 7. 보고서 작성

`_workspace/i18n_03_qa_report_{task}.md`에 결과 기록 (형식은 agents/i18n-qa.md 참조).

검증 통계 포함:
- 처리 키 수
- 4-way 통과 수
- 자동 수정 수
- 수동 조치 필요 수

## 검증 규칙

### 자동 수정 가능

| 이슈 유형 | 수정 방법 |
|----------|----------|
| Korean 번역 누락 | classifier의 `ko` 값으로 추가 |
| English 번역 누락 | classifier의 `en` 값으로 추가 |
| Keys 등록 누락 | classifier 정보로 추가 |
| TranslationKeyDataInitializer 등록 누락 | field + initialize() call 추가 |

### 수동 조치 필요 (보고만)

| 이슈 유형 | 사유 |
|----------|------|
| Frontend 호출 있지만 분류에 없음 | classifier 매핑 누락 가능성, 사용자 확인 필요 |
| 같은 키가 2개 이상 파일에 존재 | 중복, 한 곳에서 제거해야 함 |
| placeholder 불일치 | 의미 차이 가능성 |
| 기존 키 값 변경 (회귀) | 의도된 수정인지 사용자 확인 |

## 빌드 검증 (사용자 위임)

QA는 빌드/실행 명령을 직접 실행하지 않는다. 보고서에 명령만 명시:

```
1. ./gradlew compileJava  (컴파일 통과 확인)
2. (재시작) ./gradlew bootRun
3. 한/영 전환 후 UI 확인
4. (선택) DB에서 SELECT * FROM translations WHERE translation_key_id IN (...) 확인
```

## 원칙

- **존재 검사가 아닌 정합성 검사:** 4-way 모두 매칭되어야 Pass
- **자동 수정 후 재검증:** 수정한 항목은 다시 grep해 통과 확인
- **회귀 우선:** 새 키 추가보다 기존 키가 깨지지 않는 것이 중요
- **빌드 위임:** 직접 빌드 실행 금지 (AGENTS.md 1.1)

## 후속 작업 지원

QA가 발견한 수동 조치 항목을 사용자가 처리한 후 "재검증"을 요청하면:
- 같은 task slug로 다시 실행
- 보고서 덮어쓰기
