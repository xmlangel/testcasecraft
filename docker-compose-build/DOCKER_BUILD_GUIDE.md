# Docker 멀티 플랫폼 빌드 가이드

## 개요

이 가이드는 TestCaseCraft 애플리케이션을 Docker Hub에 멀티 플랫폼 이미지로 빌드하고 푸시하는 방법을 설명합니다.

🚀 사용 방법

  방법 1: 전체 빌드 (권장)

  cd docker-compose-build
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

## 참고 자료

- [Docker Buildx 문서](https://docs.docker.com/buildx/working-with-buildx/)
- [Docker Hub](https://hub.docker.com/u/xmlangel)
- [Multi-platform 이미지 가이드](https://docs.docker.com/build/building/multi-platform/)
