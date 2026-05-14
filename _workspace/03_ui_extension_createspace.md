# UI Extension Report: createspace

## 입력 파라미터
- **slug**: createspace
- **displayName**: CreateSpace
- **description.ko**: 다채로운 색상과 글래스모피즘이 어우러진 크리에이티브 디자인
- **description.en**: Colorful, expressive design with glassmorphism panels
- **makeDefault**: true

## 수정된 파일

| # | 파일 경로 | 변경 내용 |
|---|---|---|
| 1 | `src/main/frontend/src/components/UserProfileDialog.jsx` | CreateSpace Card를 RadioGroup 최상단에 추가 + 기존 glass Card의 "(현재)" 라벨 fallback 제거 |
| 2 | `src/main/java/com/testcase/testcasemanagement/config/i18n/keys/UserManagementKeysInitializer.java` | i18n 키 2개 추가 |
| 3 | `src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanOrganizationAndUserManagementTranslations.java` | 한국어 번역 2개 추가 |
| 4 | `src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishOrganizationAndUserManagementTranslations.java` | 영어 번역 2개 추가 |

신규 클래스 생성 없음 → `TranslationKeyDataInitializer.java` 수정 불필요.

## 추가된 i18n 키 (총 4개 등록 = 키 2 + 번역 4)

| 키 | 한국어 | 영어 |
|---|---|---|
| `profile.theme.createspace.title` | CreateSpace | CreateSpace |
| `profile.theme.createspace.desc` | 다채로운 색상과 글래스모피즘이 어우러진 크리에이티브 디자인 | Colorful, expressive design with glassmorphism panels |

## 라디오 카드 위치

- **위치**: top (RadioGroup 최상단)
- **순서**: createspace → glass → material3
- **"(현재)" 라벨**: createspace Card의 fallback에만 표시 (`"CreateSpace (현재)"`)
- **기존 glass Card fallback 변경**: `"Modern Glass (현재)"` → `"Modern Glass"`
- **i18n 키 자체는 변경되지 않음** (기존 `profile.theme.glass.title` 그대로 유지)

## 검증용 셀렉터

```jsx
// CreateSpace Card 식별자
designSystem === "createspace"          // 4회 사용 (borderColor, bgcolor)
onClick={() => setDesignSystem("createspace")}
<FormControlLabel value="createspace" ... />
t("profile.theme.createspace.title", "CreateSpace (현재)")
t("profile.theme.createspace.desc", "다채로운 색상과 글래스모피즘이 어우러진 크리에이티브 디자인")
```

## 자체 검증 체크리스트

- [x] 추가한 Card의 모든 `designSystem === "..."` 비교가 `createspace`로 일치
- [x] `value`, `onClick`, i18n key 모두 `createspace` slug로 일치
- [x] RadioGroup 구조 유지 — createspace/glass/material3 3개 Card가 동일 `<RadioGroup>` 내부에 위치
- [x] 기존 glass / material3 Card 모두 보존
- [x] 기존 Modern Glass의 "(현재)" fallback 텍스트 제거 확인
- [x] i18n 키 백엔드 등록 4개(Keys 2 + Korean 2 + English 2) 완료
- [x] 신규 클래스 미생성 → `TranslationKeyDataInitializer.java` 미수정 (정상)

## design-system-qa 인계 사항

검증 대상 라디오 옵션:
1. **createspace** (신규, 기본) — 클릭 시 `setDesignSystem("createspace")` 호출, ThemeContext 반영 확인
2. **glass** (기존) — fallback 라벨에서 "(현재)" 제거 확인, 동작은 동일
3. **material3** (기존) — 변경 없음

추가 확인:
- 백엔드 재기동 후 `profile.theme.createspace.title` / `profile.theme.createspace.desc`가 `/api/translations` 응답에 포함되는지
- 한국어/영어 언어 전환 시 두 키 모두 정상 번역 표시되는지
