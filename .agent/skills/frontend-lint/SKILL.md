---
name: frontend-lint
description: 프론트엔드 코드의 린트 체크를 수행하고 품질을 관리하는 스킬입니다.
---

# frontend-lint 스킬

이 스킬은 프론트엔드 React 프로젝트에서 ESLint를 사용하여 코드 품질을 체크하는 데 도움을 줍니다. 프로젝트 설정이 완벽하지 않은 환경에서도 기본적인 린트 체크를 수행할 수 있도록 설계되었습니다.

## 주요 기능

- 특정 파일 또는 디렉토리에 대한 린트 체크 수행
- 기본 제공되는 ESLint 설정(eslintrc_basic.json) 활용
- `npx`를 이용한 무설치 실행 지원

## 사용법

### 1. 특정 파일 체크

```bash
bash .agent/skills/frontend-lint/scripts/lint.sh src/App.jsx
```

### 2. 특정 디렉토리 전체 체크

```bash
bash .agent/skills/frontend-lint/scripts/lint.sh src/components/
```

### 3. 전체 소스 체크 (기본값)

```bash
bash .agent/skills/frontend-lint/scripts/lint.sh
```

## 파일 구조

- `SKILL.md`: 스킬 설명 및 가이드
- `scripts/lint.sh`: 실행 가능한 린트 스크립트
- `resources/eslintrc_basic.json`: 기본 ESLint 규칙 설정 파일

## 참고 사항

- 이 스킬은 내부적으로 `eslint@8.57.1` 버전을 사용합니다.
- `--no-eslintrc` 옵션을 사용하여 프로젝트 루트의 복잡한 설정을 무시하고 기본 규칙만 적용합니다.
