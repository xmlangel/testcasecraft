// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/UserManagementKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserManagementKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // 사용자 목록 관리 관련
        createTranslationKeyIfNotExists("userList.title", "userList", "사용자 관리 제목", "사용자 관리");
        createTranslationKeyIfNotExists("userList.loading", "userList", "사용자 목록 로딩", "사용자 목록을 불러오는 중...");
        createTranslationKeyIfNotExists("userList.search.placeholder", "userList", "검색 플레이스홀더", "이름, 사용자명, 이메일 검색...");
        createTranslationKeyIfNotExists("userList.filter.role", "userList", "역할 필터", "역할");
        createTranslationKeyIfNotExists("userList.filter.status", "userList", "상태 필터", "상태");
        createTranslationKeyIfNotExists("userList.filter.all", "userList", "전체 필터", "전체");
        createTranslationKeyIfNotExists("userList.filter.active", "userList", "활성 필터", "활성");
        createTranslationKeyIfNotExists("userList.filter.inactive", "userList", "비활성 필터", "비활성");
        createTranslationKeyIfNotExists("userList.button.refresh", "userList", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("userList.button.export", "userList", "데이터 내보내기 버튼", "데이터 내보내기");
        createTranslationKeyIfNotExists("userList.button.reset", "userList", "초기화 버튼", "초기화");

        // 통계 카드 관련
        createTranslationKeyIfNotExists("userList.stats.totalUsers", "userList", "전체 사용자", "전체 사용자");
        createTranslationKeyIfNotExists("userList.stats.activeUsers", "userList", "활성 사용자", "활성 사용자");
        createTranslationKeyIfNotExists("userList.stats.inactiveUsers", "userList", "비활성 사용자", "비활성 사용자");
        createTranslationKeyIfNotExists("userList.stats.recentRegistrations", "userList", "최근 가입", "최근 가입");

        // 테이블 헤더 관련
        createTranslationKeyIfNotExists("userList.table.username", "userList", "사용자명 헤더", "사용자명");
        createTranslationKeyIfNotExists("userList.table.name", "userList", "이름 헤더", "이름");
        createTranslationKeyIfNotExists("userList.table.email", "userList", "이메일 헤더", "이메일");
        createTranslationKeyIfNotExists("userList.table.role", "userList", "역할 헤더", "역할");
        createTranslationKeyIfNotExists("userList.table.status", "userList", "상태 헤더", "상태");
        createTranslationKeyIfNotExists("userList.table.createdAt", "userList", "가입일 헤더", "가입일");
        createTranslationKeyIfNotExists("userList.table.lastLogin", "userList", "최종 로그인 헤더", "최종 로그인");
        createTranslationKeyIfNotExists("userList.table.actions", "userList", "작업 헤더", "작업");

        // 상태 및 액션 관련
        createTranslationKeyIfNotExists("userList.status.none", "userList", "없음 상태", "없음");
        createTranslationKeyIfNotExists("userList.action.view", "userList", "상세 보기 액션", "상세 보기");
        createTranslationKeyIfNotExists("userList.action.moreActions", "userList", "더 많은 작업", "더 많은 작업");
        createTranslationKeyIfNotExists("userList.action.activate", "userList", "활성화 액션", "활성화");
        createTranslationKeyIfNotExists("userList.action.deactivate", "userList", "비활성화 액션", "비활성화");

        // 빈 상태 및 메시지
        createTranslationKeyIfNotExists("userList.empty.message", "userList", "빈 목록 메시지", "검색 조건에 맞는 사용자가 없습니다.");
        createTranslationKeyIfNotExists("userList.empty.resetButton", "userList", "검색 조건 초기화", "검색 조건 초기화");

        // 페이지네이션 관련
        createTranslationKeyIfNotExists("userList.pagination.rowsPerPage", "userList", "페이지당 행 수", "페이지당 행 수:");
        createTranslationKeyIfNotExists("userList.pagination.displayedRows", "userList", "표시된 행", "{from}-{to} / {count} 중");

        // UserDetailDialog 관련
        createTranslationKeyIfNotExists("userDetail.loading", "userDetail", "사용자 정보 로딩", "사용자 정보를 불러오는 중...");
        createTranslationKeyIfNotExists("userDetail.title", "userDetail", "사용자 정보 제목", "사용자 정보");
        createTranslationKeyIfNotExists("userDetail.notFound", "userDetail", "사용자 없음", "사용자 정보를 찾을 수 없습니다.");
        createTranslationKeyIfNotExists("userDetail.editCancel.title", "userDetail", "편집 취소 제목", "편집 취소");
        createTranslationKeyIfNotExists("userDetail.editCancel.message", "userDetail", "편집 취소 메시지", "편집 중인 내용이 있습니다. 저장하지 않고 닫으시겠습니까?");

        // 검증 메시지
        createTranslationKeyIfNotExists("userDetail.validation.required", "userDetail", "필수 입력 검증", "이름과 이메일은 필수 입력 항목입니다.");
        createTranslationKeyIfNotExists("userDetail.validation.emailFormat", "userDetail", "이메일 형식 검증", "올바른 이메일 형식을 입력해주세요.");
        createTranslationKeyIfNotExists("userDetail.error.saveError", "userDetail", "저장 오류", "저장 중 오류가 발생했습니다.");

        // 기본 정보 섹션
        createTranslationKeyIfNotExists("userDetail.section.basicInfo", "userDetail", "기본 정보 섹션", "기본 정보");
        createTranslationKeyIfNotExists("userDetail.form.name", "userDetail", "이름 필드", "이름");
        createTranslationKeyIfNotExists("userDetail.form.email", "userDetail", "이메일 필드", "이메일");
        createTranslationKeyIfNotExists("userDetail.form.role", "userDetail", "역할 필드", "역할");
        createTranslationKeyIfNotExists("userDetail.form.accountActive", "userDetail", "계정 활성화", "계정 활성화");

        // 상태 정보 섹션
        createTranslationKeyIfNotExists("userDetail.section.statusInfo", "userDetail", "상태 정보 섹션", "상태 정보");
        createTranslationKeyIfNotExists("userDetail.status.role", "userDetail", "역할 상태", "역할");
        createTranslationKeyIfNotExists("userDetail.status.account", "userDetail", "계정 상태", "계정 상태");
        createTranslationKeyIfNotExists("userDetail.status.active", "userDetail", "활성 상태", "활성");
        createTranslationKeyIfNotExists("userDetail.status.inactive", "userDetail", "비활성 상태", "비활성");
        createTranslationKeyIfNotExists("userDetail.status.activity", "userDetail", "활동 상태", "활동 상태");

        // 시간 정보 섹션
        createTranslationKeyIfNotExists("userDetail.section.timeInfo", "userDetail", "시간 정보 섹션", "시간 정보");
        createTranslationKeyIfNotExists("userDetail.time.createdAt", "userDetail", "가입일", "가입일");
        createTranslationKeyIfNotExists("userDetail.time.updatedAt", "userDetail", "최종 수정일", "최종 수정일");
        createTranslationKeyIfNotExists("userDetail.time.lastLogin", "userDetail", "최종 로그인", "최종 로그인");
        createTranslationKeyIfNotExists("userDetail.time.daysSinceLogin", "userDetail", "미접속 일수", "미접속 일수");
        createTranslationKeyIfNotExists("userDetail.time.days", "userDetail", "일", "일");
        createTranslationKeyIfNotExists("userDetail.time.none", "userDetail", "없음", "없음");

        // 버튼 및 액션
        createTranslationKeyIfNotExists("userDetail.button.close", "userDetail", "닫기 버튼", "닫기");
        createTranslationKeyIfNotExists("userDetail.button.save", "userDetail", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("userDetail.tooltip.save", "userDetail", "저장 툴팁", "저장");
        createTranslationKeyIfNotExists("userDetail.tooltip.cancel", "userDetail", "취소 툴팁", "취소");
        createTranslationKeyIfNotExists("userDetail.tooltip.edit", "userDetail", "편집 툴팁", "편집");
        createTranslationKeyIfNotExists("userDetail.tooltip.passwordChange", "userDetail", "비밀번호 변경 툴팁", "비밀번호 변경");
        createTranslationKeyIfNotExists("userDetail.success.passwordChanged", "userDetail", "비밀번호 변경 완료", "비밀번호 변경 완료");

        // 역할 및 상태 관련 키
        createTranslationKeyIfNotExists("user.role.admin", "user", "관리자 역할", "시스템 관리자");
        createTranslationKeyIfNotExists("user.role.manager", "user", "매니저 역할", "프로젝트 관리자");
        createTranslationKeyIfNotExists("user.role.tester", "user", "테스터 역할", "테스터");
        createTranslationKeyIfNotExists("user.role.user", "user", "일반 사용자 역할", "일반 사용자");

        createTranslationKeyIfNotExists("user.role.admin.description", "user", "관리자 역할 설명", "모든 시스템 기능 접근 가능");
        createTranslationKeyIfNotExists("user.role.manager.description", "user", "매니저 역할 설명", "프로젝트 관리 및 팀 리더십");
        createTranslationKeyIfNotExists("user.role.tester.description", "user", "테스터 역할 설명", "테스트 케이스 작성 및 실행");
        createTranslationKeyIfNotExists("user.role.user.description", "user", "일반 사용자 역할 설명", "기본적인 시스템 사용");

        createTranslationKeyIfNotExists("user.status.active", "user", "활성 상태", "활성");
        createTranslationKeyIfNotExists("user.status.inactive", "user", "비활성 상태", "비활성");

        // 비밀번호 변경 다이얼로그 관련
        createTranslationKeyIfNotExists("userDetail.password.title", "userDetail", "비밀번호 변경 제목", "비밀번호 변경 (관리자)");
        createTranslationKeyIfNotExists("userDetail.password.targetUser", "userDetail", "대상 사용자 라벨", "대상 사용자:");
        createTranslationKeyIfNotExists("userDetail.password.skipCurrent", "userDetail", "현재 비밀번호 생략 체크박스", "현재 비밀번호 확인 생략 (관리자 권한으로 변경)");
        createTranslationKeyIfNotExists("userDetail.password.current", "userDetail", "현재 비밀번호 필드", "현재 비밀번호");
        createTranslationKeyIfNotExists("userDetail.password.new", "userDetail", "새 비밀번호 필드", "새 비밀번호");
        createTranslationKeyIfNotExists("userDetail.password.confirm", "userDetail", "새 비밀번호 확인 필드", "새 비밀번호 확인");
        createTranslationKeyIfNotExists("userDetail.password.requirements.title", "userDetail", "비밀번호 요구사항 제목", "비밀번호 요구사항:");
        createTranslationKeyIfNotExists("userDetail.password.requirements.length", "userDetail", "비밀번호 길이 요구사항", "8-100자 길이");
        createTranslationKeyIfNotExists("userDetail.password.requirements.complexity", "userDetail", "비밀번호 복잡도 요구사항", "영문, 숫자, 특수문자 중 최소 2가지 포함");
        createTranslationKeyIfNotExists("userDetail.password.button.cancel", "userDetail", "비밀번호 변경 취소 버튼", "취소");
        createTranslationKeyIfNotExists("userDetail.password.button.changing", "userDetail", "비밀번호 변경 중 버튼", "변경 중...");
        createTranslationKeyIfNotExists("userDetail.password.button.change", "userDetail", "비밀번호 변경 버튼", "비밀번호 변경");
        createTranslationKeyIfNotExists("userDetail.password.validation.minLength", "userDetail", "비밀번호 최소 길이 검증", "최소 8자 이상이어야 합니다");
        createTranslationKeyIfNotExists("userDetail.password.validation.maxLength", "userDetail", "비밀번호 최대 길이 검증", "최대 100자까지 입력 가능합니다");
        createTranslationKeyIfNotExists("userDetail.password.validation.complexity", "userDetail", "비밀번호 복잡도 검증", "영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다");
        createTranslationKeyIfNotExists("userDetail.password.validation.mismatch", "userDetail", "비밀번호 불일치 검증", "새 비밀번호와 일치하지 않습니다");
        createTranslationKeyIfNotExists("userDetail.password.validation.currentRequired", "userDetail", "현재 비밀번호 필수 검증", "현재 비밀번호를 입력해주세요");
        createTranslationKeyIfNotExists("userDetail.password.validation.newRequired", "userDetail", "새 비밀번호 필수 검증", "새 비밀번호를 입력해주세요");
        createTranslationKeyIfNotExists("userDetail.password.validation.confirmRequired", "userDetail", "비밀번호 확인 필수 검증", "비밀번호 확인을 입력해주세요");
        createTranslationKeyIfNotExists("userDetail.password.success", "userDetail", "비밀번호 변경 성공 메시지", "{userName}님의 비밀번호가 성공적으로 변경되었습니다.");
        createTranslationKeyIfNotExists("userDetail.password.error", "userDetail", "비밀번호 변경 실패 메시지", "비밀번호 변경 중 오류가 발생했습니다.");

        // 사용자 활동 상태 관련
        createTranslationKeyIfNotExists("userDetail.activity.active", "userDetail", "최근 활동 상태", "최근 활동");
        createTranslationKeyIfNotExists("userDetail.activity.recent", "userDetail", "일주일 내 활동 상태", "일주일 내 활동");
        createTranslationKeyIfNotExists("userDetail.activity.moderate", "userDetail", "한 달 내 활동 상태", "한 달 내 활동");
        createTranslationKeyIfNotExists("userDetail.activity.inactive", "userDetail", "장기 미접속 상태", "장기 미접속");
        createTranslationKeyIfNotExists("userDetail.activity.unknown", "userDetail", "알 수 없는 활동 상태", "알 수 없음");
    }

    private void createTranslationKeyIfNotExists(String keyName, String category, String description, String defaultValue) {
        Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
        if (existingKey.isEmpty()) {
            TranslationKey translationKey = new TranslationKey(keyName, category, description, defaultValue);
            translationKeyRepository.save(translationKey);
            log.debug("번역 키 생성: {}", keyName);
        } else {
            log.debug("번역 키 이미 존재: {}", keyName);
        }
    }
}
