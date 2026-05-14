---
name: i18n-writing
description: 분류된 i18n 키 목록을 KeysInitializer + Korean/English Translations 파일에 실제로 추가한다. createTranslationKeyIfNotExists 호출과 createTranslationIfNotExists 호출을 3개 파일에 동시 삽입. 필요 시 신규 KeysInitializer 클래스를 생성하고 TranslationKeyDataInitializer에 등록. i18n-key-classification 다음 단계.
---

# i18n Writing

분류 결과를 받아 실제 Java 파일에 키와 번역을 추가한다.

## 워크플로우

### 1. 분류 결과 읽기

`_workspace/i18n_01_classification_{task}.json`을 읽어 `classifications` 배열을 확인.

`newInitializersNeeded`가 있으면 오케스트레이터에게 우선 확인. 사용자 승인 없이 신규 클래스 생성 금지.

### 2. 파일별로 그룹핑

같은 `keysFile`/`koreanFile`/`englishFile`에 들어가는 키들끼리 묶는다. 같은 파일을 여러 번 열지 않도록.

### 3. 각 파일에 삽입

#### 3.1. KeysInitializer.java

`initialize()` 메서드의 마지막 `createTranslationKeyIfNotExists` 호출 뒤에 새 키들을 추가.

같은 prefix 키가 이미 있으면 그 묶음 근처에 삽입(코드 가독성). 없으면 메서드 끝에 새 묶음으로 추가하고 `// {prefix} 관련` 주석을 한 줄 위에 둔다(기존 패턴 따름).

삽입 형식:
```java
createTranslationKeyIfNotExists("keyName", "category", "description", "defaultValue");
```

길이 초과 시 줄바꿈(google-java-format 결과 형식):
```java
createTranslationKeyIfNotExists(
    "keyName", "category", "description", "defaultValue");
```

또는 더 긴 경우:
```java
createTranslationKeyIfNotExists(
    "keyName",
    "category",
    "description",
    "defaultValue");
```

#### 3.2. Korean*Translations.java

`initialize()` 메서드의 키 그룹 끝에 추가:
```java
createTranslationIfNotExists("keyName", languageCode, "한국어 값", createdBy);
```

`languageCode`와 `createdBy`는 메서드 상단의 지역 변수 (`String languageCode = "ko"; String createdBy = "system";`). 이 변수가 없는 파일은 거의 없지만 만약 없으면 리터럴로 대체.

#### 3.3. English*Translations.java

위와 동일하지만 `languageCode = "en"` 컨텍스트.

### 4. 이스케이프 및 placeholder 처리

번역값에 다음 문자가 있으면 이스케이프:
- `"` → `\"`
- 줄바꿈은 가급적 회피, 필요 시 `\n` (하지만 i18n 메시지는 한 줄이 권장)
- placeholder `{변수}`는 그대로 보존, 한/영 모두 동일하게 유지

### 5. 신규 KeysInitializer 생성 (필요 시)

오케스트레이터로부터 사용자 승인을 받은 경우만:

1. 기존 클래스(예: `MailKeysInitializer.java`)를 템플릿으로 복제
2. 패키지 선언, 클래스명, `initialize()` 메서드 내용 교체
3. `TranslationKeyDataInitializer.java` 수정:
   - `private final {NewClass} {camelName};` 필드 추가
   - `initialize()` 메서드 내 `{camelName}.initialize();` 호출 추가
   - 두 곳 모두 적절한 그룹(예: "// 리팩토링된 번역 키 초기화 클래스들") 안에 삽입

### 6. 보고서 작성

`_workspace/i18n_02_writing_{task}.md`에 결과 기록:
- 수정한 파일 + 추가된 키 수
- 스킵된 항목(existing=true) + 사유
- 신규 클래스 생성 결과
- 자체 검증 결과(다음 § 자체 검증)

### 7. 자체 검증

각 파일 수정 후 `grep`으로 추가된 키가 실제로 들어갔는지 즉시 확인:
```bash
grep -c '"{keyName}"' {file}
```
3개 파일 모두 1회 이상 매칭되어야 정상. 누락 시 즉시 재시도.

## 코드 포맷팅 (선택)

작업 후 google-java-format 적용 가능:
```bash
java -jar google-java-format.jar --replace {modified files...}
```

실패해도 작업 완료. ESLint와 달리 빌드 차단되지 않음.

## 원칙

- **기존 패턴 보존:** Keys와 Translations 파일의 기존 코드 스타일을 100% 그대로 따른다
- **추가만, 수정 금지:** 기존 키의 값을 절대 수정하지 않는다 (덮어쓰기 = 회귀)
- **중복 키 스킵:** 같은 키가 이미 있으면 추가하지 않고 보고서에 명시
- **신규 클래스는 신중하게:** 사용자 승인 없이 신설 금지

## 검증 체크 (자체)

작업 완료 전 다음을 확인:
- [ ] 각 키가 3개 파일(Keys, Korean, English)에 정확히 1회 추가됨
- [ ] 새 KeysInitializer를 만들었으면 TranslationKeyDataInitializer에 두 곳(field + initialize call) 등록됨
- [ ] 이스케이프 누락 없음 (`"` 포함된 번역값 확인)
- [ ] placeholder가 한/영 모두 동일

## 에러 핸들링

| 상황 | 대응 |
|------|------|
| 분류된 파일 경로가 실제로 없음 | 해당 키 건너뜀, 보고서에 명시 |
| 같은 키가 이미 존재 (existing=false인데 grep 매칭됨) | 동시 작업 또는 분류 오류, 건너뛰고 경고 |
| `initialize()` 메서드를 못 찾음 | 보고서에 명시, 해당 파일 건너뜀 |
| 신규 클래스 생성 + TranslationKeyDataInitializer 등록 실패 | 클래스 파일 삭제 후 보고 |
