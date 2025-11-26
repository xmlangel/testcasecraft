# Flyway Database Migration Setup

이 문서는 TestCase Management 애플리케이션의 Flyway 데이터베이스 마이그레이션 설정에 대한 가이드입니다.

## 📋 개요

Flyway는 데이터베이스 스키마 변경을 버전 관리하고 자동으로 적용하는 마이그레이션 도구입니다.

### 주요 변경사항

- Hibernate `ddl-auto`를 `update`에서 `validate`로 변경
- Flyway 활성화 및 초기 마이그레이션 스크립트 생성
- 기존 데이터베이스에 대한 Baseline 설정

## 📁 마이그레이션 파일 구조

```
src/main/resources/db/migration/
├── V1__Initial_schema.sql       # 초기 스키마 (모든 테이블)
└── V2__Add_email_verified_column.sql  # email_verified 컬럼 추가
```

### 명명 규칙

Flyway 마이그레이션 파일은 다음 형식을 따릅니다:

```
V{버전}__{설명}.sql
```

- **V**: 버전을 나타내는 접두사 (필수)
- **버전**: 숫자 (1, 2, 3, ... 또는 1.0, 1.1, 2.0 등)
- **__**: 언더스코어 2개 (필수)
- **설명**: 영어로 작성, 언더스코어로 단어 구분

예시:
- `V1__Initial_schema.sql`
- `V2__Add_email_verified_column.sql`
- `V3__Add_user_preferences_table.sql`

## 🔧 설정 파일

### application.yml

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true  # 기존 DB에 Flyway 적용
    baseline-version: 0        # 기존 스키마를 버전 0으로 간주
    validate-on-migrate: true
```

### application-dev.yml

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # Flyway가 스키마 관리, Hibernate는 검증만
```

### docker-compose-dev.yml

```yaml
environment:
  - SPRING_JPA_HIBERNATE_DDL_AUTO=validate
```

## 🚀 사용 방법

### 1. 기존 데이터베이스에 Flyway 적용 (최초 1회)

기존 데이터베이스가 있는 경우:

```bash
# Docker Compose로 실행 중이라면
cd docker-compose-dev-spring

# 1. 애플리케이션 중지
docker-compose -f docker-compose-dev.yml down app

# 2. 데이터베이스는 유지하고 애플리케이션만 재빌드
docker-compose -f docker-compose-dev.yml build --no-cache app

# 3. 애플리케이션 시작 (Flyway가 자동으로 baseline 생성)
docker-compose -f docker-compose-dev.yml up -d app

# 4. 로그 확인
docker-compose -f docker-compose-dev.yml logs -f app
```

Flyway는 다음 단계를 자동으로 수행합니다:
1. `flyway_schema_history` 테이블 생성
2. 기존 스키마를 버전 0으로 baseline 설정
3. V1, V2 마이그레이션이 이미 적용된 것으로 표시 (baseline 이후 버전이므로)

### 2. 새로운 마이그레이션 추가

새로운 스키마 변경이 필요한 경우:

1. **마이그레이션 파일 생성**:
```bash
# 예: 사용자 프로필 이미지 추가
touch src/main/resources/db/migration/V3__Add_user_profile_image.sql
```

2. **SQL 작성**:
```sql
-- V3__Add_user_profile_image.sql
ALTER TABLE users 
ADD COLUMN profile_image_url VARCHAR(500);

CREATE INDEX idx_users_profile_image ON users(profile_image_url);
```

3. **애플리케이션 재시작**:
```bash
cd docker-compose-dev-spring
docker-compose -f docker-compose-dev.yml restart app
```

Flyway가 자동으로:
- 새로운 마이그레이션 감지
- V3 스크립트 실행
- `flyway_schema_history`에 기록

### 3. 마이그레이션 상태 확인

데이터베이스에서 마이그레이션 이력 확인:

```sql
-- PostgreSQL 컨테이너 접속
docker exec -it testcasecraft_postgres_spring psql -U testcase_user -d testcase_management

-- Flyway 이력 조회
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

출력 예시:
```
 installed_rank | version | description              | type     | script                           | checksum   | installed_by    | installed_on         | execution_time | success 
----------------+---------+--------------------------+----------+----------------------------------+------------+-----------------+----------------------+----------------+---------
              1 | 0       | << Flyway Baseline >>    | BASELINE | << Flyway Baseline >>            |            | testcase_user   | 2025-11-26 15:00:00  | 0              | t
              2 | 1       | Initial schema           | SQL      | V1__Initial_schema.sql           | 1234567890 | testcase_user   | 2025-11-26 15:00:01  | 150            | t
              3 | 2       | Add email verified col   | SQL      | V2__Add_email_verified_column... | 987654321  | testcase_user   | 2025-11-26 15:00:01  | 50             | t
```

## ⚠️ 주의사항

### DO's ✅

- **순차적 버전 번호 사용**: V1, V2, V3... 순서대로
- **마이그레이션 파일은 절대 수정하지 않기**: 실행된 파일은 checksum으로 검증됨
- **롤백 스크립트 작성**: 필요시 `U{버전}__{설명}.sql` 형식의 undo 스크립트
- **테스트 환경에서 먼저 검증**: 프로덕션 적용 전 개발/스테이징에서 테스트

### DON'Ts ❌

- **이미 실행된 마이그레이션 파일 수정 금지**: Checksum 불일치 오류 발생
- **버전 번호 건너뛰기 금지**: V1, V3 (V2 누락) - 순서 보장 필요
- **동일 버전 번호 재사용 금지**: V2를 두 번 사용하면 충돌
- **DDL과 DML 혼합 지양**: 가능한 분리하여 관리

## 🔄 마이그레이션 실패 시 복구

마이그레이션 실패 시:

```sql
-- 1. 실패한 마이그레이션 확인
SELECT * FROM flyway_schema_history WHERE success = false;

-- 2. 실패한 마이그레이션 삭제
DELETE FROM flyway_schema_history WHERE version = '{실패한_버전}';

-- 3. 수동으로 스키마 롤백 (필요시)
-- 실패한 마이그레이션이 부분 적용된 경우 수동 정리 필요

-- 4. 마이그레이션 파일 수정 후 애플리케이션 재시작
```

## 📊 마이그레이션 체크리스트

새로운 마이그레이션 추가 시 확인사항:

- [ ] 버전 번호가 순차적인가?
- [ ] 파일명이 명명 규칙을 따르는가?
- [ ] SQL 구문이 PostgreSQL 호환인가?
- [ ] 인덱스가 필요한 컬럼에 추가되었는가?
- [ ] NOT NULL 제약조건 추가 시 DEFAULT 값이 있는가?
- [ ] 외래 키 제약조건이 올바른가?
- [ ] 롤백 계획이 있는가?
- [ ] 테스트 환경에서 검증했는가?

## 📝 현재 마이그레이션 목록

### V1: Initial Schema
- 모든 기본 테이블 생성 (users, projects, test_cases 등)
- 인덱스 및 외래 키 제약조건
- 초기 스키마 복원용

### V2: Add Email Verified Column
- `users.email_verified` 컬럼 추가
- Boolean type, NOT NULL, DEFAULT FALSE
- 인덱스 추가로 검색 성능 향상

## 🔗 참고 문서

- [Flyway 공식 문서](https://flywaydb.org/documentation/)
- [Flyway with Spring Boot](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.flyway)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl.html)
