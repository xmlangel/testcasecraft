# GitHub Actions 가이드

최종 갱신: 2026-08-23 21:40 KST

이 저장소에는 워크플로가 셋 있습니다.

| 파일 | 이름 | 트리거 | 하는 일 |
| :--- | :--- | :--- | :--- |
| `docker-build.yml` | Docker Build, Release and Push | 태그 `v*` push, `workflow_dispatch` | Docker 이미지 빌드·Docker Hub 푸시·GitHub Release 생성 |
| `release-notes.yml` | Release Notes | 태그 `v*` push | 릴리즈 노트 파일을 GitHub Release 본문으로 발행 |
| `frontend-tests.yml` | Frontend Checks | `src/main/frontend/**` 변경 PR·master push, `workflow_dispatch` | Prettier 포맷 검사 + Vitest 단위 테스트 |

## ⚠️ 태그를 밀면 워크플로 둘이 함께 뜬다

`docker-build.yml` 과 `release-notes.yml` 이 **같은 트리거(`push.tags: v*`)를 갖고, 둘 다 `softprops/action-gh-release@v3` 로 Release 를 만듭니다.** 태그 하나에 두 잡이 같은 Release 를 두고 경쟁하므로 최종 본문이 어느 쪽 것인지 실행 순서에 달립니다.

두 잡의 릴리즈 노트 생성 규칙도 다릅니다.

| | `docker-build.yml` | `release-notes.yml` |
| :--- | :--- | :--- |
| 버전 추출 | 태그에서 접미(`-app`·`-rag`)를 떼어 냄 | `refs/tags/v` 만 제거 (접미가 그대로 남음) |
| 노트 파일 | KO·EN 을 **둘 다 이어 붙임** | KO 하나만 |
| 파일이 없을 때 | 이전 태그부터의 git log | `Standard release for version X` 한 줄 |

그래서 `v1.2.3-app` 을 밀면 `release-notes.yml` 은 `RELEASE_NOTE_1.2.3-app_KO.md` 를 찾고, 그런 파일은 없으므로 한 줄짜리 본문을 만듭니다. **Release 본문을 확인하려면 태그 push 직후 두 잡의 결과를 함께 봅니다.**

---

## 1. Docker 빌드·릴리즈 (`docker-build.yml`)

### 핵심 입력값 (`workflow_dispatch`)

| 입력 | 값 | 기본값 |
| :--- | :--- | :--- |
| `phase` | `build_release` · `push_only` | `build_release` |
| `target` | `all` · `app` · `rag` | `app` |
| `version` | `X.Y.Z` 또는 `X.Y.Z-PRERELEASE` (예: `1.0.120`, `1.0.42-dev`) | 없음 (필수) |

### 권장 운영 절차 (2단계)

**1) `build_release` 실행**

- 목적: Docker 빌드 검증 + GitHub Release 생성
- Docker Hub 푸시는 하지 않습니다 (`--build-only`)

**2) `push_only` 실행**

- 목적: 최종 Docker Hub 푸시
- Release 는 만들지 않습니다

## 2. 태그 푸시 시 동작

태그를 밀면 `PHASE=build_release` 로 처리됩니다. 푸시 여부는 태그 형태로 갈립니다.

| 태그 | VERSION | TARGET | Docker Hub 푸시 | Release |
| :--- | :--- | :--- | :--- | :--- |
| `v1.2.3` | `1.2.3` | `app` | **함** | 생성 |
| `v1.2.3-dev` | `1.2.3-dev` | `app` | 안 함 | 생성 |
| `v1.2.3-app` | `1.2.3` | `app` | 안 함 | 생성 |
| `v1.2.3-rag` | `1.2.3` | `rag` | 안 함 | 생성 |
| `v1.2.3-dev-app` | `1.2.3-dev` | `app` | 안 함 | 생성 |
| `v1.2.3-all` | — | — | — | **잡이 실패로 종료** |

**푸시까지 되는 것은 접미가 전혀 없는 안정 태그(`vX.Y.Z`)뿐입니다.** 프리릴리즈나 컴포넌트 접미가 붙으면 빌드와 Release 까지만 갑니다.

`-all` 태그 push 는 의도적으로 막혀 있습니다. `all` 빌드는 `workflow_dispatch` 에서 `target=all` 로만 실행합니다.

## 3. 수동 실행 방법 (`workflow_dispatch`)

GitHub → Actions → `Docker Build, Release and Push` → `Run workflow`

### 3.1 빌드·릴리즈 먼저

- `phase`: `build_release`
- `target`: `app` (처음에는 `app` 을 권장)
- `version`: `X.Y.Z` 또는 `X.Y.Z-PRERELEASE`
- `Use workflow from`: 검증할 브랜치

`build_release` 는 **태그가 없어도 실행됩니다.** 태그 검증을 건너뛰고, Release 를 만들 때 현재 커밋 기준으로 태그를 생성합니다.

### 3.2 최종 푸시

- `phase`: `push_only`
- `target`: 빌드 단계와 **같은 값**
- `version`: 빌드 단계와 **같은 값**

`push_only` 는 태그 존재를 **반드시 검증**합니다. `vX.Y.Z[-PRERELEASE]` 또는 그것에 `-app`·`-rag`·`-all` 이 붙은 태그가 없으면 실패합니다. 검증을 통과하면 그 태그를 체크아웃한 뒤 빌드·푸시합니다.

`push_only` 는 실제로 Docker Hub 에 올라갑니다. 마지막 단계 확인용으로만 실행합니다.

### 3.3 태그로 완전 분리해 시험하려면

```bash
git tag v9.9.99-app
git push origin v9.9.99-app
```

태그 push 로 자동 실행되고 Release 도 생깁니다. 정리는 이렇게 합니다.

```bash
git push origin :refs/tags/v9.9.99-app
git tag -d v9.9.99-app
```

GitHub Release 는 UI 에서 지웁니다.

## 4. 태그 규칙

허용하는 태그 형태는 다음 다섯 가지입니다.

- `vX.Y.Z`
- `vX.Y.Z-PRERELEASE`
- `vX.Y.Z-app` · `vX.Y.Z-rag`
- `vX.Y.Z-PRERELEASE-app` · `vX.Y.Z-PRERELEASE-rag`

`-all` 접미 태그 push 는 허용하지 않습니다. `version` 입력값은 `X.Y.Z` 또는 `X.Y.Z-PRERELEASE` 여야 하며, 어긋나면 `Validate Inputs` 단계에서 멈춥니다.

## 5. Release Notes 생성 규칙

`docker-build.yml` 은 `SHOULD_CREATE_RELEASE` 가 참일 때(= `build_release`) 본문을 만듭니다. **우선순위가 아니라 이어 붙이기입니다.**

1. `docs/release_note/RELEASE_NOTE_{VERSION}_KO.md` 가 있으면 `## Changes (한국어)` 아래에 붙입니다.
2. `docs/release_note/RELEASE_NOTE_{VERSION}_EN.md` 가 있으면 `## Changes (English)` 아래에 붙입니다.
3. **둘 다 없을 때만** 이전 태그부터 현재 태그까지의 git log 로 채웁니다.

`{VERSION}` 은 접미를 떼어 낸 값입니다. `v1.2.3-app` 이면 `RELEASE_NOTE_1.2.3_KO.md` 를 찾습니다.

릴리즈 전에는 KO·EN 두 파일을 함께 만들어 둡니다. KO 만 있으면 Release 본문이 한국어로만 나갑니다.

## 6. 버전 올리기

Gradle 태스크가 버전 문자열을 여러 파일에 한 번에 반영합니다.

```bash
# 앱 버전 (build.gradle · package.json · docker 빌드 스크립트 · docker-compose.yml)
./gradlew incrementVersion

# RAG 서비스 버전 (rag-service/app/core/config.py · rag-service 이미지 태그)
./gradlew incrementVersion -PtargetComponent=rag
```

`targetComponent` 를 지정하지 않으면 `all` 로 동작하지만, RAG 이미지 태그와 `config.py` 는 `rag` 를 명시할 때만 갱신됩니다. 두 컴포넌트 버전이 독립적으로 올라가는 구조입니다.

## 7. 프론트엔드 검사 (`frontend-tests.yml`)

`src/main/frontend/**` 를 건드린 PR 과 master push 에서 자동으로 돕니다. Node 24, `npm ci`.

| 잡 | 명령 | 막히는 조건 |
| :--- | :--- | :--- |
| `format` | `npm run format:check` | Prettier 정렬이 어긋남 |
| `vitest` | `npm test` | 단위 테스트 실패 |

정렬이 어긋나면 병합 전에 막힙니다. 커밋 전에 `npm run format` 을 돌립니다.

**백엔드 테스트는 CI 에 게이트가 없습니다.** 도커 빌드 워크플로는 태그 push 전용이라 PR 시점에 `./gradlew test` 가 돌지 않습니다. 백엔드를 바꾸면 로컬에서 테스트를 돌려 확인합니다.

## 8. 필요한 Secrets

| 시크릿 | 용도 |
| :--- | :--- |
| `DOCKER_USERNAME` | Docker Hub 로그인 (`push_only`, 안정 태그 push) |
| `DOCKER_PASSWORD` | Docker Hub 로그인 |
| `GITHUB_TOKEN` | GitHub Release 생성 (기본 제공) |

`docker-build.yml` 은 `permissions: contents: write` 를, `frontend-tests.yml` 은 `contents: read` 를 명시합니다. 새 워크플로를 만들 때도 필요한 최소 권한을 명시합니다. 블록이 없으면 저장소 기본값이 적용되어 쓰기 권한까지 딸려올 수 있습니다.

## 9. 운영 체크리스트

- [ ] 태그 형태가 규칙에 맞는가 (푸시까지 원하면 접미 없는 `vX.Y.Z`)
- [ ] `RELEASE_NOTE_{VERSION}_KO.md`·`_EN.md` 를 둘 다 만들었는가
- [ ] `build_release` 성공 후 Release 본문을 확인했는가 (워크플로 둘이 함께 뜨므로 최종 본문 확인)
- [ ] 문제 없으면 같은 `version`·`target` 으로 `push_only` 를 실행했는가
- [ ] Docker Hub 에 의도한 태그로 올라갔는가

---

## 📚 관련 문서

- **[개발 가이드](./DEVELOPMENT_GUIDE.md)** - 개발 환경 및 워크플로우
- **[API 가이드](./API_GUIDE.md)** - API 개발 가이드라인
- **[E2E 테스트 가이드](./E2E_TESTING_GUIDE.md)** - E2E 테스트 작성 및 실행
- **[보안 가이드](./SECURITY_GUIDE.md)** - 배포 전 보안 확인
