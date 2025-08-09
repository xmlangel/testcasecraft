# ICT-130: Redis Docker 환경 설정 가이드

## 🚀 Redis 환경 구성

### 1. Docker Compose로 Redis 시작

```bash
# Redis 컨테이너 시작 (백그라운드 실행)
docker-compose up -d

# 로그 확인
docker-compose logs -f redis

# 컨테이너 상태 확인
docker-compose ps
```

### 2. Redis 연결 테스트

```bash
# Redis CLI를 통한 직접 연결 테스트
docker-compose exec redis redis-cli -a testcase123

# 연결 확인 명령어
127.0.0.1:6379> ping
PONG

# 테스트 키 설정/조회
127.0.0.1:6379> set test "Hello Redis"
OK
127.0.0.1:6379> get test
"Hello Redis"

# 종료
127.0.0.1:6379> exit
```

### 3. 관리 도구 접속

#### Redis Commander (간단한 웹 인터페이스)
- URL: http://localhost:8081
- 사용자명: admin
- 비밀번호: admin123

#### Redis Insight (고급 관리 도구)
- URL: http://localhost:8002
- 초기 설정 시 Redis 연결 정보:
  - Host: redis (또는 localhost)
  - Port: 6379
  - Password: testcase123

### 4. Spring Boot 애플리케이션 연동

기존 `application.yml` 설정이 올바르게 되어 있습니다:

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: testcase123  # 추가 필요
      timeout: 2000ms
      jedis:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
```

### 5. 애플리케이션 실행 순서

```bash
# 1. Redis 시작
docker-compose up -d

# 2. Redis 상태 확인
docker-compose ps

# 3. Spring Boot 애플리케이션 시작 (Java 21 환경 설정)
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

### 6. 캐시 동작 확인

애플리케이션 실행 후 다음 API를 호출하여 캐시 동작을 확인할 수 있습니다:

```bash
# 로그인하여 토큰 획득
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

# 첫 번째 조직 ID 확인
ORG_ID=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/organizations \
  -s | jq -r '.[0].id')

# 첫 번째 프로젝트 ID 확인  
PROJECT_ID=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/projects \
  -s | jq -r '.[0].id')

# ICT-130 대시보드 통계 API 호출 (캐시 미스 - 느림)
echo "=== 첫 번째 호출 (캐시 미스) ==="
time curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/dashboard/projects/$PROJECT_ID/statistics" \
  -s | jq '.calculatedAt'

# 동일 API 재호출 (캐시 히트 - 빠름)
echo "=== 두 번째 호출 (캐시 히트) ==="
time curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/dashboard/projects/$PROJECT_ID/statistics" \
  -s | jq '.calculatedAt'
```

### 7. 캐시 모니터링

#### Redis CLI로 캐시 확인:
```bash
docker-compose exec redis redis-cli -a testcase123

# 캐시된 키 목록 조회
127.0.0.1:6379> keys *

# 특정 캐시 내용 조회
127.0.0.1:6379> get "projectStatistics::project_[PROJECT_ID]"

# 캐시 통계 조회
127.0.0.1:6379> info stats
```

#### 애플리케이션 메트릭 조회:
```bash
# Actuator를 통한 캐시 통계 조회
curl http://localhost:8080/actuator/caches -s | jq '.'

# 프로메테우스 메트릭 조회
curl http://localhost:8080/actuator/prometheus -s | grep -i cache
```

### 8. 부하 테스트 실행

```bash
# ICT-130 부하 테스트 실행 (Redis 환경 필요)
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
./gradlew loadTest

# 성능 테스트 결과는 build/allure-results-load/ 에 저장됨
```

### 9. 환경 정리

```bash
# Redis 컨테이너 중지 및 제거
docker-compose down

# 볼륨까지 제거 (데이터 완전 삭제)
docker-compose down -v

# 이미지 제거
docker-compose down --rmi all -v
```

## 🔧 문제 해결

### Redis 연결 실패 시:
1. 컨테이너가 실행 중인지 확인: `docker-compose ps`
2. 포트가 사용 중인지 확인: `lsof -i :6379`
3. 로그 확인: `docker-compose logs redis`

### 캐시가 동작하지 않을 때:
1. Redis 연결 설정 확인
2. `@EnableCaching` 어노테이션 확인
3. 캐시 설정 클래스 확인: `CacheConfig.java`
4. 로그 레벨을 DEBUG로 설정하여 캐시 동작 확인

### 성능이 개선되지 않을 때:
1. 캐시 키가 올바르게 생성되는지 확인
2. 캐시 만료 시간(TTL) 설정 확인
3. 데이터베이스 인덱스 적용 여부 확인
4. 애플리케이션 메트릭을 통한 성능 분석

## 📊 예상 성능 개선 효과

ICT-130 최적화 구현 후 예상되는 성능 개선:

- **캐시 히트 시 응답 시간**: 2000ms → 100ms (95% 개선)
- **데이터베이스 쿼리 부하**: 70% 감소
- **동시 사용자 처리 능력**: 50users → 200users (4배 개선)
- **시스템 리소스 사용률**: 30% 감소