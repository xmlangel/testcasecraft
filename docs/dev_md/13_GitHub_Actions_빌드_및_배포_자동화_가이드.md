# GitHub Actions 빌드 및 배포 자동화 가이드

이 문서는 GitHub Actions를 사용하여 프로젝트의 Docker 이미지를 자동으로 빌드하고 배포하는 프로세스에 대해 설명합니다.

## 1. 개요

프로젝트는 GitHub Actions를 통해 Docker Hub로 멀티 플랫폼 이미지를 빌드 및 푸시하고, 새로운 버전 태그 푸시 시 자동으로 GitHub Release를 생성하는 워크플로우를 갖추고 있습니다.

## 2. 워크플로우 구성

- **경로**: `.github/workflows/docker-build.yml`
- **트리거**: `v*` 형태의 태그가 저장소로 푸시될 때 실행됩니다.
- **주요 기능**:
  - 태그 이름 파싱을 통한 빌드 대상 및 버전 추출
  - Java (JDK 21) 빌드 및 JAR 파일 생성 (내부적으로 `./gradlew build` 수행)
  - Docker Buildx를 이용한 멀티 플랫폼(linux/amd64, linux/arm64) 빌드
  - Docker Hub 이미지 푸시
  - `docs/release_note/`의 파일을 활용한 릴리스 노트 및 GitHub Release 생성

> [!CAUTION] > **데이터 정합성 (Data Consistency)**: GitHub Action은 푸시된 태그 시점의 소스 코드를 사용합니다. `./gradlew incrementVersion` 후 로컬에서 빌드를 수행하여 `package-lock.json` 등의 파일을 최신 상태로 커밋한 뒤 태그를 푸시해야 빌드 결과물과 소스 코드 간의 버전 정보가 완벽히 일치합니다. 상세 절차는 [14*릴리즈*절차*및*방법\_가이드.md](file:///Users/dicky/kmdata/git/testcase/testcasecraft-private/docs/dev_md/14_릴리즈_절차_및_방법_가이드.md)를 참조하세요.

## 3. 태그 규칙 (Tagging Rules)

태그 이름에 따라 빌드 대상이 결정됩니다.

| 태그 예시     | 버전   | 빌드 대상                   | 설명                        |
| :------------ | :----- | :-------------------------- | :-------------------------- |
| `v1.0.35-app` | 1.0.35 | `testcasecraft`             | 메인 애플리케이션만 빌드    |
| `v1.0.35-rag` | 1.0.35 | `testcasecraft-rag-service` | RAG 서비스만 빌드           |
| `v1.0.35-all` | 1.0.35 | Both                        | 두 이미지 모두 빌드 및 푸시 |
| `v1.0.35`     | 1.0.35 | Both                        | 기본값(all)으로 동작        |

## 4. 자동 릴리스 노트 (Release Notes)

버전 태그 푸시 시 `docs/release_note/` 디렉토리에서 해당 버전의 문서를 찾아 GitHub Release 본문으로 사용합니다.

- **한국어**: `docs/release_note/RELEASE_NOTE_{VERSION}_KO.md`
- **영어**: `docs/release_note/RELEASE_NOTE_{VERSION}_EN.md`

두 파일이 모두 존재할 경우 상단에는 한국어, 하단에는 영어 내용이 배치됩니다. 파일이 존재하지 않을 경우 최신 태그 버전 이후의 `git log` 내용을 폴백으로 사용합니다.

> **예시 (v1.0.35 기준)**:
> `docs/release_note/RELEASE_NOTE_1.0.35_KO.md`의 내용을 참조하여 릴리스가 생성됩니다.

## 5. 필수 설정 (Secrets)

GitHub 저장소의 **Settings > Secrets and variables > Actions**에 아래 항목이 반드시 설정되어 있어야 합니다.

- `DOCKER_USERNAME`: Docker Hub 계정 아이디 (예: `xmlangel`)
- `DOCKER_PASSWORD`: Docker Hub 비밀번호 또는 Personal Access Token

## 6. 사용 방법 (예시)

로컬 터미널에서 아래 명령을 통해 전체 서비스를 배포할 수 있습니다.

```bash
# 1. 버전 태그 생성
git tag v1.0.35-all

# 2. 태그 푸시
git push origin v1.0.35-all
```

푸시 후 GitHub 저장소의 **Actions** 탭에서 실시간 빌드 로그를 확인할 수 있으며, 완료 후 **Releases** 메뉴에서 자동으로 생성된 릴리스 노트를 확인할 수 있습니다.
