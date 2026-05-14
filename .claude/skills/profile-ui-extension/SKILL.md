---
name: profile-ui-extension
description: UserProfileDialog의 테마 설정 탭에 새 디자인 시스템 라디오 옵션을 추가하고 백엔드 i18n 키(한국어/영어)를 등록한다. theme-integration 다음 단계로 사용.
---

# Profile UI Extension

`UserProfileDialog.jsx`의 RadioGroup에 새 디자인 시스템 카드를 추가하고 i18n 번역 키를 백엔드에 등록한다.

## 워크플로우

### 1. UserProfileDialog.jsx 수정

#### 추가 위치
`tabValue === 6` (테마 설정 탭) 안의 `<RadioGroup>` 내부, 기존 Card 컴포넌트들과 같은 위치.

#### Card 추가 템플릿
기존 glass/material3 카드를 100% 복제하여 slug만 교체:

```jsx
<Card
  variant="outlined"
  sx={{
    mb: 2,
    borderColor:
      designSystem === "{slug}" ? "primary.main" : "divider",
    bgcolor:
      designSystem === "{slug}"
        ? "action.hover"
        : "background.paper",
    cursor: "pointer",
  }}
  onClick={() => setDesignSystem("{slug}")}
>
  <CardContent sx={{ py: "12px !important" }}>
    <FormControlLabel
      value="{slug}"
      control={<Radio />}
      label={
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("profile.theme.{slug}.title", "{displayName} (현재)")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("profile.theme.{slug}.desc", "{description.ko}")}
          </Typography>
        </Box>
      }
      sx={{ m: 0, width: "100%" }}
    />
  </CardContent>
</Card>
```

#### makeDefault에 따른 위치/라벨
- `makeDefault=true`: RadioGroup 최상단에 추가, 라벨에 "(현재)" 표시
- `makeDefault=false`: 기존 카드 뒤에 추가, 라벨에 "(현재)" 없음
- 기존 카드 중 "(현재)" 라벨이 있으면 제거 (fallback 텍스트만 수정, i18n 키는 그대로)

### 2. 백엔드 i18n 키 등록

#### KeysInitializer 찾기
```bash
find src/main/java/com/testcase/testcasemanagement/config/i18n/keys -name "*.java" | xargs grep -l "profile.theme"
```

찾은 파일(예: `ProfileKeysInitializer.java`)에 키 추가:
```java
keyList.add(new TranslationKey("profile.theme.{slug}.title", ...));
keyList.add(new TranslationKey("profile.theme.{slug}.desc", ...));
```

찾지 못하면 가장 관련 있는 Initializer(`UserKeysInitializer`, `SettingsKeysInitializer` 등)에 추가.

#### 한국어 번역 추가
```bash
find src/main/java/com/testcase/testcasemanagement/config/i18n/translations -name "Korean*.java" | xargs grep -l "profile.theme"
```

찾은 파일에 추가:
```java
map.put("profile.theme.{slug}.title", "{displayName}");
map.put("profile.theme.{slug}.desc", "{description.ko}");
```

#### 영어 번역 추가
한국어와 동일 패턴, `English*.java`.

#### 신규 Initializer 클래스가 필요한가?
**대부분의 경우 NO.** 기존 Initializer에 키만 추가하면 된다.
새 클래스를 만든 경우에만 `TranslationKeyDataInitializer.java`에 등록.

### 3. 보고서 작성

`_workspace/03_ui_extension_{slug}.md`:
```markdown
# UI Extension Report: {slug}

## 수정된 파일
- src/main/frontend/src/components/UserProfileDialog.jsx (Card 추가)
- src/main/java/.../keys/{XxxKeysInitializer}.java (키 2개 추가)
- src/main/java/.../translations/Korean{Xxx}Translations.java (번역 추가)
- src/main/java/.../translations/English{Xxx}Translations.java (번역 추가)

## 추가된 i18n 키
- profile.theme.{slug}.title
- profile.theme.{slug}.desc

## 라디오 카드 위치
- {top|after-material3}

## 검증용 셀렉터
- onClick → setDesignSystem("{slug}")
- value="{slug}"
```

## 원칙

- **기존 카드 구조 100% 복제.** 신규 변형 디자인 금지 — 일관성이 우선.
- **fallback 텍스트 필수.** `t("...title", "{displayName}")` 형태로 i18n 실패해도 영문/한글 표시.
- **i18n 키 네이밍 일관성.** `profile.theme.{slug}.title`, `profile.theme.{slug}.desc` — 다른 패턴 금지.
- **백엔드 변경 최소화.** 신규 클래스 생성보다 기존 클래스에 키 추가 우선.

## 검증 체크 (자체)

- [ ] 추가한 Card의 모든 `designSystem === "..."` 비교가 동일 slug
- [ ] `value`, `onClick`, `i18n key` 모두 동일 slug
- [ ] RadioGroup 닫는 태그 위치가 정확 (다른 컴포넌트 안에 들어가지 않음)
- [ ] i18n 키 4개(한/영 각 2개)가 모두 등록됨
