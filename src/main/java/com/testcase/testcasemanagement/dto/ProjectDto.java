// src/main/java/com/testcase/testcasemanagement/dto/ProjectDto.java

package com.testcase.testcasemanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
    description = """
    **📁 프로젝트 데이터 전송 객체**
    
    테스트 케이스 관리 시스템의 핵심 엔티티인 프로젝트 정보를 전송하기 위한 DTO 클래스입니다.
    새 프로젝트 생성, 기존 프로젝트 수정, 프로젝트 정보 조회 등 모든 프로젝트 관련 API에서 사용됩니다.
    
    • **주요 특징**: Bean Validation, 자동 유효성 검증, 조직 연동 지원
    • **사용 영역**: 프로젝트 CRUD API, 프로젝트 관리 인터페이스
    • **데이터 무결성**: 코드 중복 방지, 올바른 조직 연결
    """,
    example = """
    {
        "id": "proj-mobile-app-2025",
        "code": "MOBILE_TEST_2025",
        "name": "2025 모바일 앱 테스트",
        "description": "iOS와 Android 모바일 애플리케이션 전범위 테스트 수행",
        "organizationId": "org-mobile-development",
        "displayOrder": 1,
        "createdAt": "2025-01-01T09:00:00",
        "updatedAt": "2025-01-15T14:30:00"
    }
    """
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    @Schema(
        description = """
        **🆔 프로젝트 고유 식별 코드**
        
        프로젝트를 구별하기 위한 고유한 코드로, 사람이 읽기 쉬운 형태의 식별자입니다.
        
        **✨ 주요 특징:**
        • **중복 불가**: 전체 시스템에서 유일한 값
        • **사람이 읽기 편함**: 의미 있는 단어 조합 권장
        • **URL Safe**: 웹 URL 및 API 경로에서 안전하게 사용 가능
        • **생성 후 불변**: 한 번 생성되면 수정 불가
        
        **📋 사용 예시:**
        • "MOBILE_APP_2025" - 연도별 모바일 앱 테스트
        • "WEB_API_V2" - 웹 API 버전 2 테스트
        • "PAYMENT_SYSTEM" - 결제 시스템 테스트
        • "USER_AUTH" - 사용자 인증 테스트
        
        **⚠️ 입력 규칙:**
        • 영문 대문자, 숫자, 언더스코어(_), 대시(-) 만 허용
        • 공백 및 특수문자 사용 금지
        • 숫자로 시작 불가
        • 대소문자 구분 (대문자 권장)
        """,
        example = "MOBILE_APP_2025",
        requiredMode = Schema.RequiredMode.REQUIRED,
        maxLength = 30,
        pattern = "^[A-Z][A-Z0-9_-]*$"
    )
    @NotBlank(message = "코드는 필수 항목입니다")
    @Size(max = 30, message = "코드는 30자 이내로 입력해주세요")
    private String code; // ✅ 필수 필드

    @Schema(
        description = """
        **🆔 프로젝트 고유 식별자 (UUID)**
        
        시스템에서 자동으로 생성하는 프로젝트의 고유 식별자입니다.
        
        **✨ 주요 특징:**
        • **시스템 생성**: 프로젝트 생성 시 자동 발급
        • **전역 고유**: 모든 시스템에서 중복되지 않는 고유값
        • **영구 불변**: 생성 후 변경 또는 재사용 불가
        • **데이터베이스 기본키**: 모든 연결 테이블에서 참조
        
        **📋 사용 예시:**
        • API 경로: /api/projects/{id}
        • 데이터베이스 외래키: project_id
        • 로그 및 감사: 프로젝트 식별자
        • 캐시 키: project:cache:{id}
        
        **⚠️ 주의사항:**
        • 사용자가 직접 지정할 수 없음 (시스템 자동 생성)
        • 생성 요청 시 null 또는 빈 문자열로 전송
        • 응답에서만 제공되는 읽기 전용 필드
        """,
        example = "proj-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        accessMode = Schema.AccessMode.READ_ONLY,
        maxLength = 36
    )
    @Size(max = 36, message = "ID는 36자 이내로 입력해주세요")
    private String id;

    @Schema(
        description = """
        **📝 프로젝트 명**
        
        사용자에게 표시되는 프로젝트의 명칭으로, 직관적이고 의미 있는 이름이어야 합니다.
        
        **✨ 주요 특징:**
        • **사용자 친화적**: 이해하기 쉬운 한글 또는 영문 명칭
        • **수정 가능**: 비즈니스 요구에 따라 언제든 변경 가능
        • **검색 연동**: 프로젝트 검색 및 필터링에 사용
        • **UI 표시**: 모든 사용자 인터페이스에서 표시
        
        **📋 사용 예시:**
        • "2025 모바일 앱 테스트" - 연도와 플랫폼 포함
        • "웹 API v2.0 테스트" - 버전 정보 포함
        • "전자상거래 결제 시스템" - 비즈니스 도메인 명시
        • "사용자 인증 및 권한 관리" - 기능 영역 설명
        
        **⚠️ 입력 규칙:**
        • 특수문자 제한적 허용 (., -, _, 공백)
        • 위험한 HTML 태그 또는 스크립트 사용 금지
        • 너무 일반적이거나 모호한 이름 피하기
        • 공백만 있는 이름 사용 금지
        """,
        example = "2025 모바일 앱 테스트",
        requiredMode = Schema.RequiredMode.REQUIRED,
        maxLength = 100
    )
    @NotBlank(message = "이름은 필수 항목입니다")
    @Size(max = 100, message = "이름은 100자 이내로 입력해주세요")
    private String name; // ✅ 필수 필드

    @Schema(
        description = """
        **📄 프로젝트 상세 설명**
        
        프로젝트의 목적, 범위, 주요 기능, 테스트 계획 등을 상세히 설명하는 필드입니다.
        
        **✨ 주요 특징:**
        • **선택적 입력**: 필수 필드가 아니지만 권장되는 정보
        • **마크다운 지원**: 간단한 서식 및 링크 사용 가능
        • **검색 인덱스**: 프로젝트 검색 시 설명 내용도 검색 대상
        • **보고서 연동**: 테스트 보고서에 자동 포함
        
        **📋 사용 예시:**
        • 프로젝트 목적 및 주요 기능 설명
        • 테스트 범위 및 제외 사항 명시
        • 사용된 기술 스택 및 환경 정보
        • 특별한 주의사항 또는 알려진 이슈
        • 관련 문서 또는 리소스 링크
        
        **⚠️ 입력 규칙:**
        • HTML 태그 사용 금지 (보안 상 이유)
        • 스크립트 코드 삽입 금지
        • 과도한 특수문자 사용 자제
        • 개인정보나 민감 데이터 포함 금지
        """,
        example = "iOS와 Android 모바일 애플리케이션의 전범위 테스트를 수행합니다. \n\n**테스트 범위:** \n- 사용자 인증 및 로그인 \n- 주요 기능 UI/UX \n- API 연동 및 데이터 동기화 \n- 오프라인 모드 및 성능",
        maxLength = 1000
    )
    @Size(max = 1000, message = "설명은 1000자 이내로 입력해주세요")
    private String description;

    @Schema(
        description = """
        **🔢 표시 순서**
        
        사용자 인터페이스에서 프로젝트 목록을 정렬할 때 사용되는 순서 값입니다.
        
        **✨ 주요 특징:**
        • **선택적 입력**: null인 경우 시스템에서 자동 설정
        • **오름차순 정렬**: 숫자가 작을수록 먼저 표시
        • **동적 조정**: 언제든 순서 변경 가능
        • **그룹 정렬**: 조직별, 카테고리별 그룹 정렬 지원
        
        **📋 사용 예시:**
        • **1, 2, 3, ...**: 우선순위에 따른 숫자 배정
        • **10, 20, 30, ...**: 사이에 삽입 여지를 위한 10단위 간격
        • **100, 200, 300, ...**: 대분류 배치를 위한 100단위 간격
        • **null**: 자동 설정 (생성 순서 또는 이름 순)
        
        **⚠️ 입력 규칙:**
        • 양수만 허용 (0 및 음수 금지)
        • 중복된 순서 번호 허용 (동일 순서 내에서 이름순 정렬)
        • 대용량 순서 번호 권장하지 않음 (1~1000 선에서 사용)
        """,
        example = "1",
        minimum = "1",
        maximum = "1000"
    )
    private Integer displayOrder;

    @Schema(
        description = """
        **📅 프로젝트 생성 일시**
        
        프로젝트가 시스템에 최초 등록된 시간을 나타내는 필드입니다.
        
        **✨ 주요 특징:**
        • **시스템 자동 생성**: 프로젝트 생성 시 자동 기록
        • **불변 값**: 한 번 설정되면 수정 불가
        • **감사 로그**: 프로젝트 생성 이력 추적에 활용
        • **정렬 기준**: 최신 또는 오래된 순서 정렬에 사용
        
        **📋 사용 예시:**
        • 프로젝트 목록에서 생성일 기준 정렬
        • 대시보드에서 최근 생성된 프로젝트 표시
        • 리포트에서 프로젝트 생성 날짜 참조
        • 데이터 백업 및 복구 시 참조 시점
        
        **⚠️ 주의사항:**
        • 사용자가 직접 수정할 수 없는 시스템 관리 필드
        • 생성 요청 시 null 또는 빈 문자열로 전송
        • ISO 8601 형식의 UTC 시간으로 제공
        • 시간대 변환은 클라이언트에서 처리
        """,
        example = "2025-01-01T09:00:00",
        accessMode = Schema.AccessMode.READ_ONLY,
        format = "date-time"
    )
    @Size(max = 30, message = "생성일시는 30자 이내로 입력해주세요")
    private String createdAt;

    @Schema(
        description = """
        **🔄 프로젝트 최종 수정 일시**
        
        프로젝트 정보가 마지막으로 수정된 시간을 나타내는 필드입니다.
        
        **✨ 주요 특징:**
        • **자동 갱신**: 프로젝트 정보 수정 시 자동으로 갱신
        • **수정 이력**: 프로젝트의 최근 변경 사항 추적
        • **동기화 표시**: 데이터 동기화 상태 확인
        • **버전 관리**: 암시적 버전 관리에 활용
        
        **📋 사용 예시:**
        • 프로젝트 목록에서 최근 수정된 순서 정렬
        • 대시보드에서 최근 활동 프로젝트 표시
        • 데이터 동기화 상태 캐시 무효화 기준
        • 감사 로그와 비교하여 변경 사항 추적
        
        **⚠️ 주의사항:**
        • 사용자가 직접 수정할 수 없는 시스템 관리 필드
        • 생성 시에는 createdAt과 동일한 값으로 설정
        • 모든 수정 작업에서 자동 갱신
        • 클라이언트에서 필요에 따라 시간대 변환 처리
        """,
        example = "2025-01-15T14:30:00",
        accessMode = Schema.AccessMode.READ_ONLY,
        format = "date-time"
    )
    @Size(max = 30, message = "수정일시는 30자 이내로 입력해주세요")
    private String updatedAt;

    @Schema(
        description = """
        **🏢 소속 조직 식별자**
        
        프로젝트가 속한 조직의 고유 식별자로, null인 경우 독립 프로젝트를 의미합니다.
        
        **✨ 주요 특징:**
        • **선택적 연결**: null인 경우 조직에 속하지 않는 독립 프로젝트
        • **권한 상속**: 조직 멤버는 자동으로 프로젝트 접근 권한 획득
        • **조직 이전**: 별도 API를 통해 다른 조직으로 이전 가능
        • **고아 삭제**: 조직 삭제 시 프로젝트는 독립 프로젝트로 전환
        
        **📋 사용 예시:**
        • **null**: 독립 프로젝트 (개인 또는 공용 프로젝트)
        • **"org-mobile-team"**: 모바일 개발팀 소속 프로젝트
        • **"org-qa-dept"**: QA 부서 소속 프로젝트
        • **"org-external-clients"**: 외부 고객사 공용 프로젝트
        
        **🔗 연결 효과:**
        • 조직 멤버는 자동으로 프로젝트 접근 권한 획득
        • 조직 관리자는 프로젝트 관리 권한 획득
        • 조직 설정이 프로젝트에 상속 적용
        • 조직별 리포트 및 대시보드에 포함
        
        **⚠️ 주의사항:**
        • 유효한 조직 ID여야 함 (존재하지 않는 조직 연결 시 오류)
        • 조직 연결 후 변경은 별도 이전 API 사용 필요
        • 빈 문자열(\"\") 사용 금지 (null과 구분)
        """,
        example = "org-mobile-development-team",
        maxLength = 36,
        nullable = true
    )
    // 조직 ID (조직에 속한 프로젝트인 경우)
    @Size(max = 36, message = "조직 ID는 36자 이내로 입력해주세요")
    private String organizationId;
}
