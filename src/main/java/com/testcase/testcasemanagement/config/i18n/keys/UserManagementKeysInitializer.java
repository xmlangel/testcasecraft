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
