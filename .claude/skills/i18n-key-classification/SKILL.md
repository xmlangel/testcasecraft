---
name: i18n-key-classification
description: 추가할 i18n 키들의 prefix를 분석해 어느 KeysInitializer/Korean/English Translations 파일에 들어가야 할지 자동 분류한다. 키별로 keysFile, koreanFile, englishFile 경로를 결정하여 _workspace/i18n_01_classification_{task}.json으로 저장. i18n 키 추가 워크플로우의 첫 단계.
---

# i18n Key Classification

새 i18n 키들을 백엔드 어느 KeysInitializer / Translations 파일에 넣을지 결정한다.

## 워크플로우

### 1. 입력 수집

사용자/오케스트레이터로부터 다음 형식의 키 목록을 받는다:

```json
[
  { "keyName": "userList.button.refresh", "ko": "새로고침", "en": "Refresh", "description": "새로고침 버튼" },
  { "keyName": "profile.theme.foo.title", "ko": "Foo 테마", "en": "Foo Theme" }
]
```

`description`이 없으면 ko 값을 기반으로 4~12자 한국어 설명을 자동 생성.

### 2. prefix 추출 및 매핑

각 키의 첫 단어(`.` 기준)로 prefix를 뽑는다:
- `userList.button.refresh` → prefix=`userList`
- `profile.theme.foo.title` → prefix=`profile`

도메인 매핑 표(아래 § 매핑표)를 참조하여 (keysFile, koreanFile, englishFile)을 결정한다.

prefix가 표에 없으면:
1. `grep -r "{prefix}" src/main/java/.../i18n/keys` 실행
2. 가장 자주 등장하는 파일을 선택
3. 그래도 안 나오면 `ExtendedUIKeysInitializer` + `*AdvancedFeaturesAndCommonUITranslations`로 fallback
4. `confidence: "low"` 표시

### 3. 중복 검사

각 키가 이미 등록되어 있는지 확인:
```bash
grep -rn '"{keyName}"' src/main/java/.../i18n/keys/
```
매칭이 있으면 `existing: true` 표시. writer는 이 항목을 건너뛴다.

### 4. category 결정

`createTranslationKeyIfNotExists`의 두 번째 인자(category)는 첫 단어를 그대로 사용:
- `userList.button.refresh` → category=`"userList"`
- `profile.theme.foo.title` → category=`"profile"`

### 5. 분류 결과 작성

`_workspace/i18n_01_classification_{task}.json`에 저장:

```json
{
  "task": "{slug}",
  "generatedAt": "ISO timestamp",
  "classifications": [
    {
      "keyName": "userList.button.refresh",
      "category": "userList",
      "description": "새로고침 버튼",
      "ko": "새로고침",
      "en": "Refresh",
      "keysFile": "src/main/java/.../keys/UserManagementKeysInitializer.java",
      "koreanFile": "src/main/java/.../translations/KoreanOrganizationAndUserManagementTranslations.java",
      "englishFile": "src/main/java/.../translations/EnglishOrganizationAndUserManagementTranslations.java",
      "confidence": "high",
      "existing": false
    }
  ],
  "newInitializersNeeded": [],
  "warnings": []
}
```

## 매핑표

| prefix | KeysInitializer | Korean/English Translations |
|--------|-----------------|----------------------------|
| `auth`, `login` | `AuthKeysInitializer` | `*LoginDashboardAndProjectTranslations` |
| `dashboard` | `DashboardKeysInitializer` | `*LoginDashboardAndProjectTranslations` |
| `project` | `ProjectKeysInitializer` | `*LoginDashboardAndProjectTranslations` |
| `organization` | `OrganizationKeysInitializer` | `*OrganizationAndUserManagementTranslations` |
| `userList`, `user`, `profile`, `password` | `UserManagementKeysInitializer` | `*OrganizationAndUserManagementTranslations` |
| `testCase`, `automation` | `TestCaseKeysInitializer` | `*TestCaseAndAutomationTranslations` |
| `testPlan` | `TestPlanKeysInitializer` | `*TestCaseAndAutomationTranslations` |
| `testExecution` | `TestExecutionKeysInitializer` | `*TestExecutionTranslations` |
| `testResult` | `TestResultKeysInitializer` | `*TestResultTranslations` |
| `jira` | `JiraIntegrationKeysInitializer` | `*JiraIntegrationTranslations` |
| `translation`, `translationManagement` | `TranslationManagementKeysInitializer` | `*TranslationManagementTranslations` |
| `mail`, `email` (시스템) | `MailKeysInitializer` | `*AdvancedFeaturesAndCommonUITranslations` |
| `rag` | `RAGKeysInitializer` | `*AdvancedFeaturesAndCommonUITranslations` |
| `attachment` | `AttachmentKeysInitializer` | `*AdvancedFeaturesAndCommonUITranslations` |
| `scheduler` | `SchedulerKeysInitializer` | `*AdvancedFeaturesAndCommonUITranslations` |
| `exploratory`, `exploratorySession` | `ExploratorySessionKeysInitializer` | `*AdvancedFeaturesAndCommonUITranslations` |
| `google` | `GoogleKeysInitializer` | `*AdvancedFeaturesAndCommonUITranslations` |
| `common`, `button`, `dialog`, `error` | `CommonKeysInitializer` | `*AdvancedFeaturesAndCommonUITranslations` |
| 매핑 없음 | `ExtendedUIKeysInitializer` | `*AdvancedFeaturesAndCommonUITranslations` |

위 표는 2026-05-14 기준. 신규 KeysInitializer 추가 시 갱신 필요.

## 신규 KeysInitializer 신설 기준

다음 조건을 **모두** 만족할 때만 제안:
1. 같은 prefix의 키가 30개 이상 예상됨
2. 기존 매핑 어느 곳에도 의미상 맞지 않음
3. 향후 지속적으로 키 추가 예정 (1회성 아님)

제안 시 `newInitializersNeeded` 배열에 다음 형식으로 기록:
```json
{
  "proposedClass": "NotificationKeysInitializer",
  "reason": "notification.* 키가 50개 이상 예상되며 기존 도메인과 다름",
  "fallback": "ExtendedUIKeysInitializer로 임시 분류 가능"
}
```

오케스트레이터가 사용자 확인 후 신설 여부 결정.

## 원칙

- **prefix 첫 단어가 우선:** `profile.theme.foo` → prefix=`profile`이지 `profile.theme`이 아니다
- **표 기반 결정론적:** 매핑 표에 있으면 무조건 표 따름, 자유 추론 금지
- **모호하면 fallback:** ExtendedUIKeysInitializer는 안전한 default. 확신 없을 때 사용
- **신규 클래스는 최후의 수단:** 30개 기준 미달 시 기존 클래스에 묶음
