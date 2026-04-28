# JIRA 이슈 생성 가이드 - 이메일 인증 시스템 구현

## 이슈 개요

**요약 (Summary)**: 1회성 이메일 인증 시스템 구현
**이슈 타입**: Story 또는 Feature
**우선순위**: Medium

## 설명 (Description)

### 목적

사용자 이메일 주소를 인증할 수 있는 1회성 토큰 기반 이메일 인증 시스템을 구축합니다.

### 주요 기능

- 이메일 인증 토큰 생성 및 발송
- 1회성 토큰 검증 (한 번 사용 후 재사용 불가)
- 24시간 자동 만료
- 사용자 친화적인 인증 페이지

### 구현 범위

#### Backend

- ✅ `EmailVerificationToken` 엔티티 생성
- ✅ `EmailVerificationRepository` 생성
- ✅ `EmailVerificationService` 구현
- ✅ `EmailVerificationController` REST API 구현
- ✅ `EmailVerificationDto` 생성
- ✅ HTML 이메일 템플릿 구현

#### Frontend

- ✅ `EmailVerification.jsx` 컴포넌트 생성
- ✅ App.jsx 라우팅 추가 (`/verify-email`)
- ✅ Material-UI 기반 UI/UX 구현

## API 엔드포인트

1. **POST** `/api/email-verification/send` - 인증 이메일 발송
2. **GET** `/api/email-verification/verify?token={token}` - 토큰 검증
3. **POST** `/api/email-verification/resend` - 인증 이메일 재발송

## 데이터베이스 스키마

**테이블명**: `email_verification_tokens`

| 컬럼       | 타입         | 설명                      |
| ---------- | ------------ | ------------------------- |
| id         | UUID         | 기본 키                   |
| token      | VARCHAR(100) | 인증 토큰 (UUID, UNIQUE)  |
| user_id    | UUID         | 사용자 ID (FK)            |
| email      | VARCHAR(100) | 인증 대상 이메일          |
| is_used    | BOOLEAN      | 사용 여부 (기본값: false) |
| expires_at | TIMESTAMP    | 만료 시간                 |
| used_at    | TIMESTAMP    | 사용 시간 (nullable)      |
| created_at | TIMESTAMP    | 생성 시간                 |

**인덱스**:

- `idx_token` on `token`
- `idx_user_id` on `user_id`

## 검증 계획

### 필수 테스트

1. ✅ 이메일 발송 테스트
2. ✅ 토큰 검증 성공 케이스
3. ✅ 토큰 재사용 방지 (1회성 검증)
4. ⚠️ 토큰 만료 테스트
5. ⚠️ 유효하지 않은 토큰 테스트
6. ⚠️ 재발송 테스트

### 환경 설정 필요사항

- SMTP 서버 설정 (`application-dev.yml` 또는 환경 변수)
- 프론트엔드 URL 설정: `app.frontend.url` (기본값: http://localhost:8080)

## 구현 파일 목록

### Backend

- `src/main/java/com/testcase/testcasemanagement/model/EmailVerificationToken.java`
- `src/main/java/com/testcase/testcasemanagement/repository/EmailVerificationRepository.java`
- `src/main/java/com/testcase/testcasemanagement/service/EmailVerificationService.java`
- `src/main/java/com/testcase/testcasemanagement/controller/EmailVerificationController.java`
- `src/main/java/com/testcase/testcasemanagement/dto/EmailVerificationDto.java`

### Frontend

- `src/main/frontend/src/components/EmailVerification.jsx`
- `src/main/frontend/src/App.jsx` (라우팅 추가)

## 완료 조건 (Acceptance Criteria)

- [x] 백엔드 API가 정상적으로 동작
- [x] 프론트엔드 인증 페이지가 구현됨
- [x] 토큰은 한 번만 사용 가능
- [x] 토큰은 24시간 후 자동 만료
- [ ] 이메일이 정상적으로 발송됨 (SMTP 설정 필요)
- [ ] 모든 테스트 케이스 통과
- [ ] Swagger UI에서 API 문서 확인 가능

## 기술 스택

- **Backend**: Spring Boot 3.2.4, Java 21, PostgreSQL, JPA
- **Frontend**: React 18, Material-UI, React Router
- **Email**: JavaMailSender, HTML 템플릿

## 참고 자료

- 구현 계획: `implementation_plan.md`
- 관련 파일: `MailService.java`, `User.java`

---

## JIRA 이슈 생성 방법

1. JIRA 프로젝트로 이동
2. "Create" 버튼 클릭
3. 위 내용을 복사하여 Description 필드에 붙여넣기
4. Summary: "1회성 이메일 인증 시스템 구현"
5. Issue Type: "Story" 또는 "Feature"
6. Priority: "Medium"
7. Assignee: 담당자 지정
8. Sprint: 현재 스프린트 선택
9. "Create" 클릭
