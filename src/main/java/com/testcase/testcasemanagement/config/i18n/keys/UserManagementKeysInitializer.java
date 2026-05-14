// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/UserManagementKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserManagementKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    // 사용자 목록 관리 관련
    createTranslationKeyIfNotExists("userList.title", "userList", "사용자 관리 제목", "사용자 관리");
    createTranslationKeyIfNotExists(
        "userList.loading", "userList", "사용자 목록 로딩", "사용자 목록을 불러오는 중...");
    createTranslationKeyIfNotExists(
        "userList.search.placeholder", "userList", "검색 플레이스홀더", "이름, 사용자명, 이메일 검색...");
    createTranslationKeyIfNotExists("userList.filter.role", "userList", "역할 필터", "역할");
    createTranslationKeyIfNotExists("userList.filter.status", "userList", "상태 필터", "상태");
    createTranslationKeyIfNotExists("userList.filter.all", "userList", "전체 필터", "전체");
    createTranslationKeyIfNotExists("userList.filter.active", "userList", "활성 필터", "활성");
    createTranslationKeyIfNotExists("userList.filter.inactive", "userList", "비활성 필터", "비활성");
    createTranslationKeyIfNotExists("userList.button.refresh", "userList", "새로고침 버튼", "새로고침");
    createTranslationKeyIfNotExists(
        "userList.button.export", "userList", "데이터 내보내기 버튼", "데이터 내보내기");
    createTranslationKeyIfNotExists("userList.button.reset", "userList", "초기화 버튼", "초기화");

    // 통계 카드 관련
    createTranslationKeyIfNotExists("userList.stats.totalUsers", "userList", "전체 사용자", "전체 사용자");
    createTranslationKeyIfNotExists("userList.stats.activeUsers", "userList", "활성 사용자", "활성 사용자");
    createTranslationKeyIfNotExists(
        "userList.stats.inactiveUsers", "userList", "비활성 사용자", "비활성 사용자");
    createTranslationKeyIfNotExists(
        "userList.stats.recentRegistrations", "userList", "최근 가입", "최근 가입");

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
    createTranslationKeyIfNotExists(
        "userList.action.moreActions", "userList", "더 많은 작업", "더 많은 작업");
    createTranslationKeyIfNotExists("userList.action.activate", "userList", "활성화 액션", "활성화");
    createTranslationKeyIfNotExists("userList.action.deactivate", "userList", "비활성화 액션", "비활성화");

    // 빈 상태 및 메시지
    createTranslationKeyIfNotExists(
        "userList.empty.message", "userList", "빈 목록 메시지", "검색 조건에 맞는 사용자가 없습니다.");
    createTranslationKeyIfNotExists(
        "userList.empty.resetButton", "userList", "검색 조건 초기화", "검색 조건 초기화");

    // 페이지네이션 관련
    createTranslationKeyIfNotExists(
        "userList.pagination.rowsPerPage", "userList", "페이지당 행 수", "페이지당 행 수:");
    createTranslationKeyIfNotExists(
        "userList.pagination.displayedRows", "userList", "표시된 행", "{from}-{to} / {count} 중");

    // UserDetailDialog 관련
    createTranslationKeyIfNotExists(
        "userDetail.loading", "userDetail", "사용자 정보 로딩", "사용자 정보를 불러오는 중...");
    createTranslationKeyIfNotExists("userDetail.title", "userDetail", "사용자 정보 제목", "사용자 정보");
    createTranslationKeyIfNotExists(
        "userDetail.notFound", "userDetail", "사용자 없음", "사용자 정보를 찾을 수 없습니다.");
    createTranslationKeyIfNotExists(
        "userDetail.editCancel.title", "userDetail", "편집 취소 제목", "편집 취소");
    createTranslationKeyIfNotExists(
        "userDetail.editCancel.message",
        "userDetail",
        "편집 취소 메시지",
        "편집 중인 내용이 있습니다. 저장하지 않고 닫으시겠습니까?");

    // 검증 메시지
    createTranslationKeyIfNotExists(
        "userDetail.validation.required", "userDetail", "필수 입력 검증", "이름과 이메일은 필수 입력 항목입니다.");
    createTranslationKeyIfNotExists(
        "userDetail.validation.emailFormat", "userDetail", "이메일 형식 검증", "올바른 이메일 형식을 입력해주세요.");
    createTranslationKeyIfNotExists(
        "userDetail.error.saveError", "userDetail", "저장 오류", "저장 중 오류가 발생했습니다.");

    // 기본 정보 섹션
    createTranslationKeyIfNotExists(
        "userDetail.section.basicInfo", "userDetail", "기본 정보 섹션", "기본 정보");
    createTranslationKeyIfNotExists("userDetail.form.name", "userDetail", "이름 필드", "이름");
    createTranslationKeyIfNotExists("userDetail.form.email", "userDetail", "이메일 필드", "이메일");
    createTranslationKeyIfNotExists("userDetail.form.role", "userDetail", "역할 필드", "역할");
    createTranslationKeyIfNotExists(
        "userDetail.form.accountActive", "userDetail", "계정 활성화", "계정 활성화");

    // 상태 정보 섹션
    createTranslationKeyIfNotExists(
        "userDetail.section.statusInfo", "userDetail", "상태 정보 섹션", "상태 정보");
    createTranslationKeyIfNotExists("userDetail.status.role", "userDetail", "역할 상태", "역할");
    createTranslationKeyIfNotExists("userDetail.status.account", "userDetail", "계정 상태", "계정 상태");
    createTranslationKeyIfNotExists("userDetail.status.active", "userDetail", "활성 상태", "활성");
    createTranslationKeyIfNotExists("userDetail.status.inactive", "userDetail", "비활성 상태", "비활성");
    createTranslationKeyIfNotExists("userDetail.status.activity", "userDetail", "활동 상태", "활동 상태");

    // 시간 정보 섹션
    createTranslationKeyIfNotExists(
        "userDetail.section.timeInfo", "userDetail", "시간 정보 섹션", "시간 정보");
    createTranslationKeyIfNotExists("userDetail.time.createdAt", "userDetail", "가입일", "가입일");
    createTranslationKeyIfNotExists("userDetail.time.updatedAt", "userDetail", "최종 수정일", "최종 수정일");
    createTranslationKeyIfNotExists("userDetail.time.lastLogin", "userDetail", "최종 로그인", "최종 로그인");
    createTranslationKeyIfNotExists(
        "userDetail.time.daysSinceLogin", "userDetail", "미접속 일수", "미접속 일수");
    createTranslationKeyIfNotExists("userDetail.time.days", "userDetail", "일", "일");
    createTranslationKeyIfNotExists("userDetail.time.none", "userDetail", "없음", "없음");

    // 버튼 및 액션
    createTranslationKeyIfNotExists("userDetail.button.close", "userDetail", "닫기 버튼", "닫기");
    createTranslationKeyIfNotExists("userDetail.button.save", "userDetail", "저장 버튼", "저장");
    createTranslationKeyIfNotExists("userDetail.tooltip.save", "userDetail", "저장 툴팁", "저장");
    createTranslationKeyIfNotExists("userDetail.tooltip.cancel", "userDetail", "취소 툴팁", "취소");
    createTranslationKeyIfNotExists("userDetail.tooltip.edit", "userDetail", "편집 툴팁", "편집");
    createTranslationKeyIfNotExists(
        "userDetail.tooltip.passwordChange", "userDetail", "비밀번호 변경 툴팁", "비밀번호 변경");
    createTranslationKeyIfNotExists(
        "userDetail.success.passwordChanged", "userDetail", "비밀번호 변경 완료", "비밀번호 변경 완료");

    // 역할 및 상태 관련 키
    createTranslationKeyIfNotExists("user.role.admin", "user", "관리자 역할", "시스템 관리자");
    createTranslationKeyIfNotExists("user.role.manager", "user", "매니저 역할", "프로젝트 관리자");
    createTranslationKeyIfNotExists("user.role.tester", "user", "테스터 역할", "테스터");
    createTranslationKeyIfNotExists("user.role.user", "user", "일반 사용자 역할", "일반 사용자");

    createTranslationKeyIfNotExists(
        "user.role.admin.description", "user", "관리자 역할 설명", "모든 시스템 기능 접근 가능");
    createTranslationKeyIfNotExists(
        "user.role.manager.description", "user", "매니저 역할 설명", "프로젝트 관리 및 팀 리더십");
    createTranslationKeyIfNotExists(
        "user.role.tester.description", "user", "테스터 역할 설명", "테스트 케이스 작성 및 실행");
    createTranslationKeyIfNotExists(
        "user.role.user.description", "user", "일반 사용자 역할 설명", "기본적인 시스템 사용");

    createTranslationKeyIfNotExists("user.status.active", "user", "활성 상태", "활성");
    createTranslationKeyIfNotExists("user.status.inactive", "user", "비활성 상태", "비활성");

    // 비밀번호 변경 다이얼로그 관련
    createTranslationKeyIfNotExists(
        "userDetail.password.title", "userDetail", "비밀번호 변경 제목", "비밀번호 변경 (관리자)");
    createTranslationKeyIfNotExists(
        "userDetail.password.targetUser", "userDetail", "대상 사용자 라벨", "대상 사용자:");
    createTranslationKeyIfNotExists(
        "userDetail.password.skipCurrent",
        "userDetail",
        "현재 비밀번호 생략 체크박스",
        "현재 비밀번호 확인 생략 (관리자 권한으로 변경)");
    createTranslationKeyIfNotExists(
        "userDetail.password.current", "userDetail", "현재 비밀번호 필드", "현재 비밀번호");
    createTranslationKeyIfNotExists("userDetail.password.new", "userDetail", "새 비밀번호 필드", "새 비밀번호");
    createTranslationKeyIfNotExists(
        "userDetail.password.confirm", "userDetail", "새 비밀번호 확인 필드", "새 비밀번호 확인");
    createTranslationKeyIfNotExists(
        "userDetail.password.requirements.title", "userDetail", "비밀번호 요구사항 제목", "비밀번호 요구사항:");
    createTranslationKeyIfNotExists(
        "userDetail.password.requirements.length", "userDetail", "비밀번호 길이 요구사항", "8-100자 길이");
    createTranslationKeyIfNotExists(
        "userDetail.password.requirements.complexity",
        "userDetail",
        "비밀번호 복잡도 요구사항",
        "영문, 숫자, 특수문자 중 최소 2가지 포함");
    createTranslationKeyIfNotExists(
        "userDetail.password.button.cancel", "userDetail", "비밀번호 변경 취소 버튼", "취소");
    createTranslationKeyIfNotExists(
        "userDetail.password.button.changing", "userDetail", "비밀번호 변경 중 버튼", "변경 중...");
    createTranslationKeyIfNotExists(
        "userDetail.password.button.change", "userDetail", "비밀번호 변경 버튼", "비밀번호 변경");
    createTranslationKeyIfNotExists(
        "userDetail.password.validation.minLength",
        "userDetail",
        "비밀번호 최소 길이 검증",
        "최소 8자 이상이어야 합니다");
    createTranslationKeyIfNotExists(
        "userDetail.password.validation.maxLength",
        "userDetail",
        "비밀번호 최대 길이 검증",
        "최대 100자까지 입력 가능합니다");
    createTranslationKeyIfNotExists(
        "userDetail.password.validation.complexity",
        "userDetail",
        "비밀번호 복잡도 검증",
        "영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다");
    createTranslationKeyIfNotExists(
        "userDetail.password.validation.mismatch",
        "userDetail",
        "비밀번호 불일치 검증",
        "새 비밀번호와 일치하지 않습니다");
    createTranslationKeyIfNotExists(
        "userDetail.password.validation.currentRequired",
        "userDetail",
        "현재 비밀번호 필수 검증",
        "현재 비밀번호를 입력해주세요");
    createTranslationKeyIfNotExists(
        "userDetail.password.validation.newRequired",
        "userDetail",
        "새 비밀번호 필수 검증",
        "새 비밀번호를 입력해주세요");
    createTranslationKeyIfNotExists(
        "userDetail.password.validation.confirmRequired",
        "userDetail",
        "비밀번호 확인 필수 검증",
        "비밀번호 확인을 입력해주세요");
    createTranslationKeyIfNotExists(
        "userDetail.password.success",
        "userDetail",
        "비밀번호 변경 성공 메시지",
        "{userName}님의 비밀번호가 성공적으로 변경되었습니다.");
    createTranslationKeyIfNotExists(
        "userDetail.password.error", "userDetail", "비밀번호 변경 실패 메시지", "비밀번호 변경 중 오류가 발생했습니다.");

    // 사용자 활동 상태 관련
    createTranslationKeyIfNotExists(
        "userDetail.activity.active", "userDetail", "최근 활동 상태", "최근 활동");
    createTranslationKeyIfNotExists(
        "userDetail.activity.recent", "userDetail", "일주일 내 활동 상태", "일주일 내 활동");
    createTranslationKeyIfNotExists(
        "userDetail.activity.moderate", "userDetail", "한 달 내 활동 상태", "한 달 내 활동");
    createTranslationKeyIfNotExists(
        "userDetail.activity.inactive", "userDetail", "장기 미접속 상태", "장기 미접속");
    createTranslationKeyIfNotExists(
        "userDetail.activity.unknown", "userDetail", "알 수 없는 활동 상태", "알 수 없음");

    // 사용자 프로필 - JIRA 설정 관련
    createTranslationKeyIfNotExists(
        "profile.jira.settings.title", "profile", "JIRA 통합 설정 제목", "JIRA 통합 설정");
    createTranslationKeyIfNotExists(
        "profile.jira.settings.description",
        "profile",
        "JIRA 통합 설정 설명",
        "JIRA와 연동하여 테스트 결과를 자동으로 이슈에 코멘트로 추가할 수 있습니다.");
    createTranslationKeyIfNotExists(
        "profile.jira.button.configure", "profile", "JIRA 설정 수정 버튼", "설정 수정");
    createTranslationKeyIfNotExists(
        "profile.jira.button.delete", "profile", "JIRA 설정 삭제 버튼", "설정 삭제");
    createTranslationKeyIfNotExists(
        "profile.jira.confirm.delete", "profile", "JIRA 설정 삭제 확인", "JIRA 설정을 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "profile.jira.success.saved", "profile", "JIRA 설정 저장 성공", "JIRA 설정이 저장되었습니다.");
    createTranslationKeyIfNotExists(
        "profile.jira.success.deleted", "profile", "JIRA 설정 삭제 성공", "JIRA 설정이 삭제되었습니다.");
    createTranslationKeyIfNotExists(
        "profile.jira.error.saveFailed", "profile", "JIRA 설정 저장 실패", "JIRA 설정 저장에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "profile.jira.error.deleteFailed", "profile", "JIRA 설정 삭제 실패", "JIRA 설정 삭제 실패");
    createTranslationKeyIfNotExists(
        "profile.jira.error.network", "profile", "JIRA 네트워크 오류", "네트워크 연결을 확인해주세요.");
    createTranslationKeyIfNotExists(
        "profile.jira.error.authentication", "profile", "JIRA 인증 오류", "로그인이 만료되었습니다. 다시 로그인해주세요.");
    createTranslationKeyIfNotExists(
        "profile.jira.error.encryption", "profile", "JIRA 암호화 오류", "서버 설정에 문제가 있습니다. 관리자에게 문의하세요.");

    // 사용자 프로필 - 비밀번호 변경 관련
    createTranslationKeyIfNotExists("password.change.title", "password", "비밀번호 변경 제목", "비밀번호 변경");
    createTranslationKeyIfNotExists(
        "password.change.description", "password", "비밀번호 변경 설명", "보안을 위해 정기적으로 비밀번호를 변경해주세요.");
    createTranslationKeyIfNotExists("password.form.current", "password", "현재 비밀번호 레이블", "현재 비밀번호");
    createTranslationKeyIfNotExists("password.form.new", "password", "새 비밀번호 레이블", "새 비밀번호");
    createTranslationKeyIfNotExists(
        "password.form.confirm", "password", "비밀번호 확인 레이블", "새 비밀번호 확인");
    createTranslationKeyIfNotExists(
        "password.placeholder.current", "password", "현재 비밀번호 플레이스홀더", "현재 사용 중인 비밀번호를 입력하세요");
    createTranslationKeyIfNotExists(
        "password.placeholder.new", "password", "새 비밀번호 플레이스홀더", "새로운 비밀번호를 입력하세요 (8자 이상)");
    createTranslationKeyIfNotExists(
        "password.placeholder.confirm", "password", "비밀번호 확인 플레이스홀더", "새 비밀번호를 다시 입력하세요");
    createTranslationKeyIfNotExists("password.button.change", "password", "비밀번호 변경 버튼", "비밀번호 변경");
    createTranslationKeyIfNotExists(
        "password.button.changing", "password", "비밀번호 변경 중 버튼", "변경 중...");
    createTranslationKeyIfNotExists(
        "password.requirements.title", "password", "비밀번호 요구사항 제목", "비밀번호 요구사항:");
    createTranslationKeyIfNotExists(
        "password.requirements.length", "password", "비밀번호 길이 요구사항", "8-100자 길이");
    createTranslationKeyIfNotExists(
        "password.requirements.letter", "password", "영문 포함 요구사항", "영문 포함");
    createTranslationKeyIfNotExists(
        "password.requirements.digit", "password", "숫자 포함 요구사항", "숫자 포함");
    createTranslationKeyIfNotExists(
        "password.requirements.special", "password", "특수문자 포함 요구사항", "특수문자 포함");
    createTranslationKeyIfNotExists(
        "password.requirements.combination", "password", "2가지 이상 조합 요구사항", "2가지 이상 조합");
    createTranslationKeyIfNotExists(
        "password.validation.minLength", "password", "최소 길이 검증", "최소 8자 이상이어야 합니다");
    createTranslationKeyIfNotExists(
        "password.validation.maxLength", "password", "최대 길이 검증", "최대 100자까지 입력 가능합니다");
    createTranslationKeyIfNotExists(
        "password.validation.complexity", "password", "복잡도 검증", "영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다");
    createTranslationKeyIfNotExists(
        "password.validation.mismatch", "password", "비밀번호 불일치 검증", "새 비밀번호와 일치하지 않습니다");
    createTranslationKeyIfNotExists(
        "password.validation.currentRequired", "password", "현재 비밀번호 필수 검증", "현재 비밀번호를 입력해주세요");
    createTranslationKeyIfNotExists(
        "password.validation.newRequired", "password", "새 비밀번호 필수 검증", "새 비밀번호를 입력해주세요");
    createTranslationKeyIfNotExists(
        "password.validation.confirmRequired", "password", "비밀번호 확인 필수 검증", "비밀번호 확인을 입력해주세요");
    createTranslationKeyIfNotExists(
        "password.validation.sameAsCurrent",
        "password",
        "현재 비밀번호와 동일 검증",
        "새 비밀번호는 현재 비밀번호와 달라야 합니다");
    createTranslationKeyIfNotExists(
        "password.success.changed", "password", "비밀번호 변경 성공", "비밀번호가 성공적으로 변경되었습니다.");
    createTranslationKeyIfNotExists(
        "password.error.changeFailed", "password", "비밀번호 변경 실패", "비밀번호 변경 중 오류가 발생했습니다.");

    // 사용자 프로필 다이얼로그 관련
    createTranslationKeyIfNotExists("profile.title", "profile", "프로필 제목", "사용자 프로필");
    createTranslationKeyIfNotExists("profile.tabs.basicInfo", "profile", "기본 정보 탭", "기본 정보");
    createTranslationKeyIfNotExists("profile.tabs.password", "profile", "비밀번호 탭", "비밀번호");
    createTranslationKeyIfNotExists("profile.tabs.language", "profile", "언어 설정 탭", "언어 설정");
    createTranslationKeyIfNotExists(
        "profile.tabs.googleConfig", "profile", "구글 시트 설정 탭", "Google Sheets 설정");
    createTranslationKeyIfNotExists("profile.tabs.appearance", "profile", "화면 설정 탭", "화면 설정");
    createTranslationKeyIfNotExists("profile.tabs.jira", "profile", "JIRA 설정 탭", "JIRA 설정");
    createTranslationKeyIfNotExists("profile.tabs.apiToken", "profile", "API 토큰 탭", "API 토큰");
    createTranslationKeyIfNotExists("profile.form.username", "profile", "사용자명 필드", "사용자명");
    createTranslationKeyIfNotExists(
        "profile.form.usernameHelper", "profile", "사용자명 도움말", "사용자명은 변경할 수 없습니다.");
    createTranslationKeyIfNotExists("profile.form.name", "profile", "이름 필드", "이름");
    createTranslationKeyIfNotExists("profile.form.email", "profile", "이메일 필드", "이메일");
    createTranslationKeyIfNotExists("profile.form.role", "profile", "역할 필드", "역할");

    // 사용자 프로필 편집 관련
    createTranslationKeyIfNotExists("userProfile.edit.title", "profile", "사용자 프로필 편집 제목", "프로필 편집");
    createTranslationKeyIfNotExists(
        "userProfile.edit.description", "profile", "사용자 프로필 편집 설명", "사용자 프로필 정보를 수정할 수 있습니다");

    // 역할 종류
    createTranslationKeyIfNotExists("role.admin", "role", "시스템 관리자 역할", "시스템 관리자");
    createTranslationKeyIfNotExists("role.manager", "role", "관리자 역할", "관리자");
    createTranslationKeyIfNotExists("role.tester", "role", "테스터 역할", "테스터");
    createTranslationKeyIfNotExists("role.user", "role", "일반 사용자 역할", "일반 사용자");

    createTranslationKeyIfNotExists(
        "profile.success.updated", "profile", "정보 변경 성공", "정보가 성공적으로 변경되었습니다.");
    createTranslationKeyIfNotExists(
        "profile.error.updateFailed", "profile", "정보 변경 실패", "정보 변경에 실패했습니다.");

    // 사용자 프로필 - 화면 설정 관련
    createTranslationKeyIfNotExists("profile.appearance.title", "profile", "화면 설정 제목", "화면 설정");
    createTranslationKeyIfNotExists(
        "profile.appearance.description", "profile", "화면 설정 설명", "애플리케이션의 화면 테마를 변경할 수 있습니다.");
    createTranslationKeyIfNotExists(
        "profile.appearance.lightMode", "profile", "라이트 모드 제목", "라이트 모드");
    createTranslationKeyIfNotExists("profile.appearance.darkMode", "profile", "다크 모드 제목", "다크 모드");
    createTranslationKeyIfNotExists(
        "profile.appearance.lightMode.description", "profile", "라이트 모드 설명", "밝은 배경의 깔끔한 화면");
    createTranslationKeyIfNotExists(
        "profile.appearance.darkMode.description", "profile", "다크 모드 설명", "어두운 배경의 편안한 화면");
    createTranslationKeyIfNotExists(
        "profile.appearance.switch.dark", "profile", "다크 모드 스위치 라벨", "다크");
    createTranslationKeyIfNotExists(
        "profile.appearance.switch.light", "profile", "라이트 모드 스위치 라벨", "라이트");
    createTranslationKeyIfNotExists(
        "profile.appearance.info", "profile", "테마 변경 안내", "테마 변경은 즉시 적용되며 브라우저에 자동으로 저장됩니다.");

    // 사용자 프로필 - 디자인 시스템(CreateSpace) 관련
    createTranslationKeyIfNotExists(
        "profile.theme.createspace.title", "profile", "CreateSpace 디자인 시스템 제목", "CreateSpace");
    createTranslationKeyIfNotExists(
        "profile.theme.createspace.desc",
        "profile",
        "CreateSpace 디자인 시스템 설명",
        "다채로운 색상과 글래스모피즘이 어우러진 크리에이티브 디자인");

    // 공통 버튼
    createTranslationKeyIfNotExists("button.close", "common", "닫기 버튼", "닫기");
    createTranslationKeyIfNotExists("button.save", "common", "저장 버튼", "저장");

    // 시간대 관련 번역 키
    createTranslationKeyIfNotExists("timezone.settings.title", "timezone", "시간대 설정 제목", "시간대 설정");
    createTranslationKeyIfNotExists(
        "timezone.settings.description",
        "timezone",
        "시간대 설정 설명",
        "시간대를 설정하면 모든 시간이 선택한 시간대로 표시됩니다.");
    createTranslationKeyIfNotExists("timezone.label", "timezone", "시간대 레이블", "시간대");
    createTranslationKeyIfNotExists(
        "timezone.helperText", "timezone", "시간대 도움말", "기본 시간대는 UTC입니다. 변경 사항은 저장 버튼을 눌러야 적용됩니다.");
    createTranslationKeyIfNotExists("timezone.current", "timezone", "현재 시간대", "현재 시간대");
    createTranslationKeyIfNotExists("timezone.utc", "timezone", "UTC 시간대", "UTC (UTC+0)");
    createTranslationKeyIfNotExists("timezone.seoul", "timezone", "서울 시간대", "Seoul (UTC+9)");
    createTranslationKeyIfNotExists(
        "timezone.newYork", "timezone", "뉴욕 시간대", "New York (UTC-5/-4)");
    createTranslationKeyIfNotExists(
        "timezone.losAngeles", "timezone", "로스앤젤레스 시간대", "Los Angeles (UTC-8/-7)");
    createTranslationKeyIfNotExists("timezone.london", "timezone", "런던 시간대", "London (UTC+0/+1)");
    createTranslationKeyIfNotExists("timezone.paris", "timezone", "파리 시간대", "Paris (UTC+1/+2)");
    createTranslationKeyIfNotExists("timezone.tokyo", "timezone", "도쿄 시간대", "Tokyo (UTC+9)");
    createTranslationKeyIfNotExists("timezone.shanghai", "timezone", "상하이 시간대", "Shanghai (UTC+8)");
    createTranslationKeyIfNotExists(
        "timezone.singapore", "timezone", "싱가포르 시간대", "Singapore (UTC+8)");
    createTranslationKeyIfNotExists("timezone.hongKong", "timezone", "홍콩 시간대", "Hong Kong (UTC+8)");
    createTranslationKeyIfNotExists(
        "timezone.sydney", "timezone", "시드니 시간대", "Sydney (UTC+10/+11)");

    // 사용자 프로필 - 버전 정보 표시
    createTranslationKeyIfNotExists("profile.version.title", "profile", "버전 정보 제목", "버전 정보");
    createTranslationKeyIfNotExists("profile.version.backend", "profile", "백엔드 버전 레이블", "백엔드");
    createTranslationKeyIfNotExists("profile.version.frontend", "profile", "프론트엔드 버전 레이블", "프론트엔드");
    createTranslationKeyIfNotExists("profile.version.rag", "profile", "RAG 서비스 버전 레이블", "RAG 서비스");
    createTranslationKeyIfNotExists(
        "profile.version.loading", "profile", "버전 정보 로딩", "버전 정보 로딩 중...");
    createTranslationKeyIfNotExists(
        "profile.version.error", "profile", "버전 정보 로드 실패", "버전 정보를 불러올 수 없습니다.");

    // 사용자 프로필 - 서비스 API 토큰 관련
    createTranslationKeyIfNotExists(
        "profile.apiToken.title", "profile", "서비스 API 토큰 제목", "서비스 API 토큰");
    createTranslationKeyIfNotExists(
        "profile.apiToken.description1",
        "profile",
        "서비스 API 토큰 설명 1",
        "서비스 API 토큰은 외부 시스템(예: Jira Forge 앱)에서 이 서비스에 접근할 때 사용합니다.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.description2",
        "profile",
        "서비스 API 토큰 설명 2",
        "토큰은 발급 시 한 번만 표시되므로 안전한 곳에 보관하세요.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.description3", "profile", "서비스 API 토큰 설명 3", "사용자당 최대 10개까지 발급 가능합니다.");

    createTranslationKeyIfNotExists(
        "profile.apiToken.new.title", "profile", "새 API 토큰 발급 제목", "새 API 토큰 발급");
    createTranslationKeyIfNotExists("profile.apiToken.new.label", "profile", "토큰 이름 레이블", "토큰 이름");
    createTranslationKeyIfNotExists(
        "profile.apiToken.new.placeholder",
        "profile",
        "토큰 이름 플레이스홀더",
        "예: Jira Integration, CI/CD Pipeline");
    createTranslationKeyIfNotExists("profile.apiToken.new.button", "profile", "발급 버튼", "발급");

    createTranslationKeyIfNotExists(
        "profile.apiToken.list.title", "profile", "내 API 토큰 목록 제목", "내 API 토큰 목록");
    createTranslationKeyIfNotExists(
        "profile.apiToken.list.refresh", "profile", "목록 새로고침 툴팁", "목록 새로고침");
    createTranslationKeyIfNotExists(
        "profile.apiToken.list.empty", "profile", "토큰 없음 메시지", "발급된 API 토큰이 없습니다.");

    createTranslationKeyIfNotExists("profile.apiToken.table.name", "profile", "테이블 이름 헤더", "이름");
    createTranslationKeyIfNotExists("profile.apiToken.table.key", "profile", "테이블 키 헤더", "키 (마스킹)");
    createTranslationKeyIfNotExists("profile.apiToken.table.status", "profile", "테이블 상태 헤더", "상태");
    createTranslationKeyIfNotExists(
        "profile.apiToken.table.expiry", "profile", "테이블 만료일 헤더", "만료일");
    createTranslationKeyIfNotExists(
        "profile.apiToken.table.created", "profile", "테이블 생성일 헤더", "생성일");
    createTranslationKeyIfNotExists("profile.apiToken.table.actions", "profile", "테이블 관리 헤더", "관리");

    createTranslationKeyIfNotExists("profile.apiToken.status.active", "profile", "활성 상태", "활성");
    createTranslationKeyIfNotExists("profile.apiToken.status.inactive", "profile", "비활성 상태", "비활성");
    createTranslationKeyIfNotExists("profile.apiToken.status.expired", "profile", "만료됨 상태", "만료됨");
    createTranslationKeyIfNotExists(
        "profile.apiToken.tooltip.delete", "profile", "삭제 툴팁", "삭제(비활성화)");

    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.title", "profile", "발급 완료 다이얼로그 제목", "API 토큰 발급 완료");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.warning",
        "profile",
        "발급 주의사항",
        "이 토큰은 지금만 확인할 수 있습니다. 창을 닫으면 토큰 전체를 다시 볼 수 없으니 안전한 곳에 저장해 주세요.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.name", "profile", "토큰 이름 표시", "토큰 이름: {name}");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.expiry", "profile", "만료일 표시", "만료일: {date}");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.tokenLabel", "profile", "발급된 토큰 레이블", "발급된 토큰:");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.copyTooltip", "profile", "복사 툴팁", "클립보드에 복사");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.copiedTooltip", "profile", "복사됨 툴팁", "복사됨!");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.copyButton", "profile", "전체 복사 버튼", "토큰 전체 복사");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.copySuccess", "profile", "복사 완료 메시지", "복사 완료!");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.revealed.close", "profile", "다이얼로그 닫기 버튼", "확인 (닫기)");

    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.delete.title", "profile", "토큰 삭제 제목", "API 토큰 삭제");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.delete.warning", "profile", "삭제 경고", "삭제한 토큰은 즉시 사용이 중단됩니다.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.delete.confirm", "profile", "삭제 확인 질문", "{name} 토큰을 비활성화하시겠습니까?");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.delete.button", "profile", "삭제 버튼", "삭제");

    createTranslationKeyIfNotExists(
        "profile.apiToken.message.loadFailed", "profile", "로드 실패 메시지", "API 키 목록을 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.message.nameRequired", "profile", "이름 필수 메시지", "키 이름을 입력하세요.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.message.generateFailed", "profile", "발급 실패 메시지", "API 키 발급에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.message.generateError", "profile", "발급 오류 메시지", "API 키 발급 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.message.deleteSuccess", "profile", "삭제 성공 메시지", "API 키가 비활성화되었습니다.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.message.deleteFailed", "profile", "삭제 실패 메시지", "삭제에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.message.deleteError", "profile", "삭제 오류 메시지", "API 키 삭제 중 오류가 발생했습니다.");

    // 이메일 인증 관련
    createTranslationKeyIfNotExists(
        "profile.form.emailVerification", "profile", "이메일 인증 상태 레이블", "이메일 인증 상태");
    createTranslationKeyIfNotExists("profile.email.verified", "profile", "이메일 인증 완료 상태", "인증 완료");
    createTranslationKeyIfNotExists("profile.email.notVerified", "profile", "이메일 미인증 상태", "미인증");
    createTranslationKeyIfNotExists(
        "profile.email.sendButton", "profile", "인증 이메일 발송 버튼", "인증 이메일 발송");
    createTranslationKeyIfNotExists(
        "profile.email.sent", "profile", "이메일 발송 성공 메시지", "인증 이메일이 발송되었습니다. 이메일을 확인하세요.");
    createTranslationKeyIfNotExists(
        "profile.email.failed", "profile", "이메일 발송 실패 메시지", "이메일 발송에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "profile.email.error", "profile", "이메일 발송 오류 메시지", "이메일 발송 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "profile.email.helper",
        "profile",
        "이메일 인증 안내 도움말",
        "이메일을 인증하면 알림 및 비밀번호 재설정 기능을 사용할 수 있습니다.");

    // 사용자 정보 새로고침 관련
    createTranslationKeyIfNotExists("profile.refresh.button", "profile", "상태 새로고침 버튼", "상태 새로고침");
    createTranslationKeyIfNotExists(
        "profile.refresh.success", "profile", "새로고침 성공 메시지", "사용자 정보를 새로고침했습니다.");
    createTranslationKeyIfNotExists(
        "profile.refresh.error", "profile", "새로고침 실패 메시지", "사용자 정보 새로고침에 실패했습니다.");
  }

  private void createTranslationKeyIfNotExists(
      String keyName, String category, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      TranslationKey translationKey =
          new TranslationKey(keyName, category, description, defaultValue);
      translationKeyRepository.save(translationKey);
      log.debug("번역 키 생성: {}", keyName);
    } else {
      log.debug("번역 키 이미 존재: {}", keyName);
    }
  }
}
