# GitHub Actions 배포 가이드

이 문서는 `.github/workflows/docker-build.yml` 기준의 Docker 이미지 빌드/릴리즈/푸시 절차를 설명합니다.

## 1. 워크플로 개요

워크플로 이름: `Docker Build, Release and Push`

트리거:
- `push.tags: v*`
- `workflow_dispatch` (수동 실행)

핵심 입력값 (`workflow_dispatch`):
- `phase`: `build_release` | `push_only`
- `target`: `all` | `app` | `rag`
- `version`: `X.Y.Z` 형식 (예: `1.0.35`)

## 2. 권장 운영 절차 (2단계)

1. `build_release` 단계 실행
- 목적: Docker 빌드 검증 + GitHub Release 생성
- Docker Hub 푸시는 하지 않음 (`--build-only`)

2. `push_only` 단계 실행
- 목적: 최종 Docker Hub 푸시
- Release 생성은 하지 않음

## 3. 태그 푸시 시 동작

태그를 푸시하면 자동으로 `build_release`가 실행됩니다.
- 예: `v1.2.3`, `v1.2.3-app`, `v1.2.3-rag`, `v1.2.3-all`
- 동작: 빌드 + Release 생성 (Docker Hub 푸시 없음)

## 4. 수동 실행 방법 (`workflow_dispatch`)

GitHub > Actions > `Docker Build, Release and Push` > `Run workflow`

```
1. build_release만 먼저 테스트

  - GitHub Actions 탭 → Docker Build, Release and Push 선택
  - Run workflow 클릭
  - Use workflow from: PR 브랜치 선택
  - 입력값:
      - phase: build_release
      - target: app (처음엔 app 추천)
      - version: 이미 존재하는 태그 버전 (X.Y.Z)

  2. 왜 “이미 존재하는 태그 버전”이 필요한가

  - 현재 워크플로는 workflow_dispatch에서도 태그 존재 여부를 검증합니다.
  - 해당 버전 태그(vX.Y.Z 또는 vX.Y.Z-app|rag|all)가 없으면 실패합니다.

  3. 완전 분리 테스트가 필요하면

  - 테스트용 태그를 하나 만든 뒤 실행:

  git tag v9.9.99-app
  git push origin v9.9.99-app

  - 이 경우 태그 푸시로 자동 실행되고, Release도 생성됩니다.
  - 테스트 후 정리:

  git push origin :refs/tags/v9.9.99-app
  git tag -d v9.9.99-app

  - GitHub Release는 UI에서 수동 삭제.

  4. push_only 테스트 시 주의

  - 실제 Docker Hub에 푸시됩니다.
  - 마지막 단계 검증으로만 실행하세요.

```

### 4.1 빌드/릴리즈
- `phase`: `build_release`
- `target`: `all` (또는 `app`, `rag`)
- `version`: 예) `1.0.35`

### 4.2 최종 푸시
- `phase`: `push_only`
- `target`: `all` (또는 `app`, `rag`)
- `version`: 빌드/릴리즈 때와 동일 버전

## 5. 태그 규칙

허용 태그:
- `vX.Y.Z`
- `vX.Y.Z-app`
- `vX.Y.Z-rag`
- `vX.Y.Z-all`

`version` 입력값은 반드시 `X.Y.Z` 형식이어야 합니다.

## 6. Release Notes 생성 규칙

`build_release`에서만 생성됩니다.

우선순위:
1. `docs/release_note/RELEASE_NOTE_{VERSION}_KO.md`
2. `docs/release_note/RELEASE_NOTE_{VERSION}_EN.md`
3. 둘 다 없으면 Git 로그 기반 자동 생성

## 7. 필요한 Secrets

Docker Hub 푸시(`push_only`)를 위해 아래 시크릿이 필요합니다.
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

GitHub Release 생성을 위해 기본 `GITHUB_TOKEN`을 사용합니다.

## 8. 운영 체크리스트

- 태그 형식이 규칙에 맞는지 확인
- `build_release` 성공 후 Release 내용 확인
- 문제 없으면 동일 버전으로 `push_only` 실행
- `target`을 빌드 단계와 동일하게 유지

