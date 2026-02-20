# Docker 멀티 플랫폼 빌드 가이드

## 개요

이 가이드는 TestCaseCraft 애플리케이션을 Docker Hub에 멀티 플랫폼 이미지로 빌드하고 푸시하는 방법을 설명합니다.

🚀 사용 방법

  방법 1: 전체 빌드 (권장)

  cd docker-compose-dev-spring
  ./build-and-push-multiplatform.sh

  실행 과정:
  1. ✅ Docker 및 Buildx 확인
  2. ✅ Docker Hub 로그인 확인
  3. ✅ Buildx 빌더 설정
  4. ✅ Gradle로 JAR 빌드
  5. ✅ 메인 앱 이미지 빌드 & 푸시 (amd64 + arm64)
  6. ✅ RAG 서비스 이미지 빌드 & 푸시 (amd64 + arm64)
  7. ✅ 이미지 검증
  8. ✅ 정리

  방법 2: 개별 빌드

  # 메인 애플리케이션만
  ./build-app-only.sh

  # RAG 서비스만
  ./build-rag-only.sh

  📋 사전 준비사항

  1. Docker Hub 로그인
  docker login
  # Username: xmlangel
  # Password: [your-password]

  2. Docker Desktop 실행 확인
  - Docker Desktop이 실행 중이어야 합니다

  🎯 빌드되는 이미지

  메인 애플리케이션

  - xmlangel/testcasecraft:1.0.0
  - xmlangel/testcasecraft:latest
  - 플랫폼: linux/amd64, linux/arm64

  RAG 서비스

  - xmlangel/testcasecraft-rag-service:1.0.0
  - xmlangel/testcasecraft-rag-service:latest
  - 플랫폼: linux/amd64, linux/arm64

  ⏱️ 예상 소요 시간

  - 전체 빌드: 약 10-15분
    - JAR 빌드: 2-3분
    - 메인 앱 이미지: 3-7분
    - RAG 이미지: 3-5분

  🔧 주요 기능

  자동화된 기능

  - ✅ Docker/Buildx 사전 확인
  - ✅ Docker Hub 로그인 확인 및 안내
  - ✅ Buildx 빌더 자동 생성/설정
  - ✅ Gradle 빌드 자동 실행
  - ✅ 멀티 플랫폼 빌드 (amd64 + arm64)
  - ✅ Docker Hub 자동 푸시
  - ✅ 이미지 검증
  - ✅ 임시 파일 자동 정리
  - ✅ 컬러 출력으로 진행 상황 표시

  에러 처리

  - 각 단계마다 검증
  - 실패 시 명확한 에러 메시지
  - 자동 롤백 및 정리


## 빌드되는 이미지

1. **메인 애플리케이션**: `xmlangel/testcasecraft:1.0.0`
   - Spring Boot 애플리케이션
   - 프론트엔드 포함

2. **RAG 서비스**: `xmlangel/testcasecraft-rag-service:1.0.0`
   - FastAPI 기반 RAG 서비스
   - 문서 파싱 및 벡터 검색

## 지원 플랫폼

- `linux/amd64` - Intel/AMD 64비트 프로세서
- `linux/arm64` - ARM 64비트 프로세서 (Mac M1/M2, Raspberry Pi 등)

## 사전 요구사항

### 1. Docker 설치
- Docker Desktop 최신 버전 설치
- Docker Buildx 플러그인 포함되어 있어야 함

### 2. Docker Hub 계정
- Docker Hub 계정 필요
- 로그인 명령어:
  ```bash
  docker login
  ```

### 3. 개발 환경
- Java 21 이상
- Gradle

## 사용 방법

### 전체 빌드 및 푸시 (권장)

모든 이미지를 한 번에 빌드하고 푸시하는 방법:

```bash
cd docker-compose-dev-spring
./build-and-push-multiplatform.sh
```

### 스크립트 실행 과정

1. **사전 확인** (STEP 1)
   - Docker 설치 확인
   - Docker Buildx 확인
   - Docker Hub 로그인 확인

2. **Buildx 빌더 설정** (STEP 2)
   - 멀티 플랫폼 빌더 생성
   - 빌더 활성화

3. **JAR 파일 빌드** (STEP 3)
   - Gradle로 애플리케이션 빌드
   - JAR 파일 생성

4. **메인 애플리케이션 이미지 빌드** (STEP 4)
   - 멀티 플랫폼 빌드
   - Docker Hub에 푸시

5. **RAG 서비스 이미지 빌드** (STEP 5)
   - 멀티 플랫폼 빌드
   - Docker Hub에 푸시

6. **검증** (STEP 6)
   - 이미지 pull 테스트
   - 정상 업로드 확인

7. **정리** (STEP 7)
   - 임시 파일 삭제

## 개별 이미지 빌드

### 메인 애플리케이션만 빌드

```bash
# 1. JAR 파일 빌드
cd ..
./gradlew clean build -x test

# 2. JAR 파일 복사
cp build/libs/*.jar docker-compose-dev-spring/app.jar

# 3. Docker 이미지 빌드 및 푸시
cd docker-compose-dev-spring
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag xmlangel/testcasecraft:1.0.0 \
  --tag xmlangel/testcasecraft:latest \
  --push \
  .
```

### RAG 서비스만 빌드

```bash
cd docker-compose-dev-spring

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag xmlangel/testcasecraft-rag-service:1.0.0 \
  --tag xmlangel/testcasecraft-rag-service:latest \
  --push \
  --file ../rag-service/Dockerfile \
  ../rag-service
```

## 빌드 시간

- **메인 애플리케이션**: 약 5-10분
  - JAR 빌드: 2-3분
  - Docker 이미지 빌드: 3-7분

- **RAG 서비스**: 약 3-5분
  - Python 의존성 설치 시간 포함

- **전체 프로세스**: 약 10-15분

## 문제 해결

### Docker Buildx가 없는 경우

```bash
# Docker Desktop 업데이트
# 또는 Buildx 플러그인 설치
docker buildx version
```

### Docker Hub 로그인 실패

```bash
# 로그인 재시도
docker logout
docker login
```

### 빌드 실패 시

```bash
# Builder 제거 후 재생성
docker buildx rm testcasecraft-multiplatform
docker buildx create --name testcasecraft-multiplatform --use

# 다시 빌드 시도
./build-and-push-multiplatform.sh
```

### 메모리 부족 오류

Docker Desktop 설정에서 메모리 할당량 증가:
- Settings → Resources → Memory
- 최소 4GB 이상 권장

## 이미지 사용

### Docker Compose로 사용

```yaml
services:
  app:
    image: xmlangel/testcasecraft:1.0.0
    # ... 기타 설정

  rag-service:
    image: xmlangel/testcasecraft-rag-service:1.0.0
    # ... 기타 설정
```

### 직접 실행

```bash
# 메인 애플리케이션
docker run -p 8080:8080 xmlangel/testcasecraft:1.0.0

# RAG 서비스
docker run -p 8001:8000 xmlangel/testcasecraft-rag-service:1.0.0
```

## 버전 관리

새 버전을 빌드하려면:

1. `build-and-push-multiplatform.sh`에서 `VERSION` 변경
2. 스크립트 실행

```bash
# 스크립트 내부
VERSION="1.1.0"  # 버전 변경
```

## 주의사항

1. **Docker Hub 저장소 용량**
   - 무료 계정은 저장 용량 제한이 있을 수 있음
   - 필요 없는 오래된 태그는 삭제 권장

2. **빌드 시간**
   - 멀티 플랫폼 빌드는 시간이 오래 걸림
   - 안정적인 인터넷 연결 필요

3. **보안**
   - Docker Hub에 푸시하기 전에 민감한 정보가 포함되지 않았는지 확인
   - `.dockerignore` 파일 활용

## Docker 이미지 오프라인 복사 및 이동 (save/load)

네트워크가 제한된 환경이나 Docker Hub를 거치지 않고 직접 이미지를 다른 PC로 옮겨야 할 때 유용한 방법입니다. `docker save`와 `docker load` 명령어를 사용합니다.

### 1단계: 원본 PC에서 이미지 저장하기

`docker images`로 이미지 ID 또는 이름을 확인한 후, `.tar` 압축 파일로 저장합니다.

```bash
# 로컬에 있는 도커 이미지 목록 확인
docker images

# 이미지를 .tar 파일로 저장 (예: image_backup.tar)
# docker save [이미지ID_또는_이름:태그] -o [저장할_파일명.tar]
docker save b7ac12a9ff5c -o my_image.tar

# 만약 이름과 태그를 알고 있다면, 그것을 사용하는 것이 더 명확합니다.
# docker save xmlangel/testcasecraft:1.0.0 -o testcasecraft_1.0.0.tar
```

### 2단계: 파일 전송하기

생성된 `.tar` 파일을 USB, 외부 저장 장치, 또는 네트워크 파일 전송 프로토콜(`scp`, `sftp` 등)을 사용하여 대상 PC로 복사합니다.

```bash
# scp를 사용한 네트워크 전송 예시
scp my_image.tar user@destination_ip:/path/to/destination/
```

### 3단계: 대상 PC에서 이미지 불러오기

`.tar` 파일이 위치한 디렉토리에서 아래 명령어를 실행하여 이미지를 로드합니다.

```bash
# .tar 파일로부터 도커 이미지를 불러오기
docker load -i my_image.tar
```

### 4단계: 이미지 이름 및 태그 재지정 (필요시)

이미지 ID로 직접 저장하고 불러온 경우, 이미지의 이름(Repository)과 태그(Tag)가 `<none>`으로 표시될 수 있습니다. 이 경우, `docker tag` 명령어로 다시 지정해줍니다.

```bash
# 로드된 이미지 확인 (ID 확인)
docker images

# 이미지에 새로운 태그 부여
# docker tag [기존_이미지ID] [새로운_이미지_이름]:[태그]
docker tag b7ac12a9ff5c my-new-app:latest
```

## 참고 자료

- [Docker Buildx 문서](https://docs.docker.com/buildx/working-with-buildx/)
- [Docker Hub](https://hub.docker.com/u/xmlangel)
- [Multi-platform 이미지 가이드](https://docs.docker.com/build/building/multi-platform/)
