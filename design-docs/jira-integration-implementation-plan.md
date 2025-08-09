# JIRA 통합 시스템 구현 계획서

## 🎯 **프로젝트 개요**

### **목표**
개인별 JIRA API 키 관리를 통한 테스트 결과-JIRA 이슈 연동 시스템 구현

### **핵심 기능**
1. 사용자별 JIRA 설정 관리 (API 키 암호화 저장)
2. 테스트 실패 시 JIRA 이슈 자동/수동 코멘트 추가  
3. 실시간 JIRA 연결 상태 모니터링
4. 테스트 결과와 JIRA 이슈 양방향 연동

---

## 📊 **생성된 JIRA 이슈**

### **Epic**
- **ICT-160**: JIRA 통합 시스템 구현 - 개인별 API 키 관리 및 테스트 결과 연동

### **Stories** 
1. **ICT-161**: 사용자별 JIRA 설정 관리 시스템 구현 (8 SP)
2. **ICT-162**: JIRA API 클라이언트 및 연동 서비스 구현 (13 SP)  
3. **ICT-163**: 프론트엔드 JIRA 설정 관리 UI 구현 (8 SP)
4. **ICT-164**: 테스트 결과 JIRA 이슈 연동 UI 구현 (8 SP)
5. **ICT-165**: JIRA 통합 시스템 보안 강화 및 최적화 (5 SP)
6. **ICT-166**: JIRA 통합 시스템 테스트 및 문서화 (5 SP)

**총 스토리 포인트**: 47 SP (약 6-8주 소요 예상)

---

## 🚀 **구현 우선순위**

### **Phase 1: 기초 인프라 (우선순위: 높음)**
**목표**: 기본적인 JIRA 연동 인프라 구축

#### **ICT-161: 사용자별 JIRA 설정 관리 시스템 구현** 
- **소요시간**: 1-2주
- **핵심 작업**:
  - 데이터베이스 스키마 설계 및 생성
  - UserJiraConfig 엔티티 및 Repository 구현
  - 암호화 서비스 (EncryptionService) 구현
  - JIRA 설정 CRUD API 엔드포인트 구현
  - 연결 테스트 기능 구현

#### **ICT-162: JIRA API 클라이언트 및 연동 서비스 구현**
- **소요시간**: 2-3주  
- **핵심 작업**:
  - JiraApiClient 컴포넌트 구현 (Basic Auth)
  - JIRA 연결 테스트, 서버 정보 조회, 프로젝트 목록 조회
  - 이슈 검색 및 코멘트 추가 기능
  - JiraIntegrationService 구현
  - TestResult 엔티티 JIRA 필드 확장

### **Phase 2: 사용자 인터페이스 (우선순위: 높음)**
**목표**: 사용자가 JIRA 설정을 관리할 수 있는 UI 구현

#### **ICT-163: 프론트엔드 JIRA 설정 관리 UI 구현**
- **소요시간**: 1-2주
- **핵심 작업**:
  - JiraConfigDialog 컴포넌트 구현
  - JiraStatusIndicator 상태 표시 컴포넌트
  - 사용자 프로필 페이지 JIRA 설정 섹션 추가
  - 실시간 연결 테스트 UI 구현

#### **ICT-164: 테스트 결과 JIRA 이슈 연동 UI 구현**
- **소요시간**: 1-2주
- **핵심 작업**:
  - JiraIssueLinker 컴포넌트 구현
  - JiraCommentDialog 구현  
  - 테스트 결과 입력 페이지 JIRA 섹션 통합
  - 자동 코멘트 생성 및 추가 기능

### **Phase 3: 보안 및 최적화 (우선순위: 중간)**
**목표**: 시스템 보안 강화 및 성능 최적화

#### **ICT-165: JIRA 통합 시스템 보안 강화 및 최적화**  
- **소요시간**: 1주
- **핵심 작업**:
  - API 키 AES-256 암호화 구현
  - 환경변수 기반 보안 설정
  - JIRA API 호출 캐싱 전략
  - 성능 최적화 및 모니터링

### **Phase 4: 테스트 및 문서화 (우선순위: 중간)**
**목표**: 품질 보증 및 사용자 가이드 제공

#### **ICT-166: JIRA 통합 시스템 테스트 및 문서화**
- **소요시간**: 1주  
- **핵심 작업**:
  - 단위 테스트 및 통합 테스트 구현
  - E2E 테스트 시나리오 작성
  - 사용자 가이드 및 관리자 매뉴얼 작성
  - 성능 벤치마크 및 보안 테스트

---

## 🔧 **기술 스택 및 아키텍처**

### **백엔드**
- **Framework**: Spring Boot 3.2.4, Java 21
- **Database**: PostgreSQL (기존 DB 확장)
- **Security**: AES-256 암호화, JWT 인증
- **External API**: JIRA REST API v3

### **프론트엔드**  
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **State Management**: Context API
- **HTTP Client**: Fetch API

### **보안**
- **API 키 암호화**: AES-256-GCM
- **통신 보안**: HTTPS 강제, JWT 토큰 기반 인증
- **데이터 보안**: API 키 응답 제외, 암호화된 저장

---

## 📊 **데이터베이스 변경사항**

### **신규 테이블**
```sql
-- 사용자별 JIRA 설정
CREATE TABLE user_jira_configs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    jira_server_url VARCHAR(500) NOT NULL,
    jira_username VARCHAR(255) NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    jira_project_key VARCHAR(50),
    is_enabled BOOLEAN DEFAULT true,
    connection_status VARCHAR(20) DEFAULT 'UNKNOWN',
    last_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **기존 테이블 확장**
```sql  
-- test_results 테이블에 JIRA 연동 필드 추가
ALTER TABLE test_results ADD COLUMN jira_issue_key VARCHAR(50) NULL;
ALTER TABLE test_results ADD COLUMN jira_issue_url VARCHAR(500) NULL;  
ALTER TABLE test_results ADD COLUMN jira_comment_id VARCHAR(50) NULL;
ALTER TABLE test_results ADD COLUMN jira_synced_at TIMESTAMP NULL;
ALTER TABLE test_results ADD COLUMN jira_sync_status VARCHAR(20) DEFAULT 'NOT_SYNCED';
```

---

## 🎯 **성공 지표**

### **기능적 지표**
- [ ] 사용자별 JIRA 설정 저장/조회 성공률 100%
- [ ] JIRA 연결 테스트 성공률 95% 이상  
- [ ] 테스트 실패 시 JIRA 코멘트 자동 추가 성공률 95% 이상
- [ ] UI 반응 시간 2초 이내

### **보안 지표**
- [ ] API 키 AES-256 암호화 적용 100%
- [ ] 보안 취약점 스캔 통과
- [ ] HTTPS 통신 강제 적용

### **사용성 지표** 
- [ ] JIRA 설정 완료 시간 5분 이내
- [ ] 사용자 매뉴얼 완독률 80% 이상
- [ ] 사용자 만족도 4.0/5.0 이상

---

## 🚨 **위험 요소 및 대응 방안**

### **기술적 위험**
1. **JIRA API 변경**: API 버전 호환성 문제 → 버전 체크 및 대응 로직 구현
2. **암호화 키 관리**: 키 분실 시 복구 불가 → 백업 키 관리 체계 구축  
3. **성능 저하**: 대량 API 호출 시 응답 지연 → 캐싱 및 배치 처리 구현

### **사용자 경험 위험**
1. **설정 복잡도**: JIRA API 토큰 생성의 복잡성 → 상세한 가이드 제공
2. **연결 실패**: 잘못된 설정으로 인한 연결 실패 → 단계별 검증 및 피드백 제공

### **보안 위험** 
1. **API 키 노출**: 로그나 응답에 API 키 노출 → 철저한 마스킹 처리
2. **중간자 공격**: HTTP 통신 시 데이터 탈취 → HTTPS 강제 적용

---

## 📅 **구현 일정표**

| Phase | 기간 | 이슈 | 핵심 마일스톤 |
|-------|------|------|---------------|
| Phase 1 | 3-4주 | ICT-161, ICT-162 | JIRA 연동 인프라 완성 |
| Phase 2 | 2-3주 | ICT-163, ICT-164 | 사용자 인터페이스 완성 |  
| Phase 3 | 1주 | ICT-165 | 보안 및 성능 최적화 |
| Phase 4 | 1주 | ICT-166 | 테스트 및 문서화 완료 |

**총 예상 기간**: 7-9주

---

## ✅ **다음 단계**

1. **ICT-161 착수**: 데이터베이스 스키마 생성 및 백엔드 엔티티 구현
2. **개발 환경 설정**: 암호화 키 환경변수 설정  
3. **테스트 JIRA 인스턴스**: 개발/테스트용 JIRA 환경 준비
4. **보안 검토**: 암호화 방식 및 키 관리 전략 최종 검토

**Epic URL**: https://kwangmyung.atlassian.net/browse/ICT-160