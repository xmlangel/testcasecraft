// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanCommonAndExtendedUITranslationsPart3.java
package com.testcase.testcasemanagement.config.i18n.translations;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 한국어 번역 - 조직 관리 및 사용자 관리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanOrganizationAndUserManagementTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "ko";
                String createdBy = "system";

                createTranslationIfNotExists("password.requirements.digit", languageCode, "숫자 포함", createdBy);
                createTranslationIfNotExists("password.requirements.special", languageCode, "특수문자 포함", createdBy);
                createTranslationIfNotExists("password.requirements.combination", languageCode, "2가지 이상 조합", createdBy);
                createTranslationIfNotExists("password.success.changed", languageCode, "비밀번호가 성공적으로 변경되었습니다.",
                                createdBy);
                createTranslationIfNotExists("password.error.changeFailed", languageCode, "비밀번호 변경 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("password.validation.newRequired", languageCode, "새 비밀번호를 입력해주세요",
                                createdBy);
                createTranslationIfNotExists("password.validation.confirmRequired", languageCode, "비밀번호 확인을 입력해주세요",
                                createdBy);
                createTranslationIfNotExists("password.validation.sameAsCurrent", languageCode,
                                "새 비밀번호는 현재 비밀번호와 달라야 합니다",
                                createdBy);
                createTranslationIfNotExists("button.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("button.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("organization.management.title", languageCode, "조직 관리", createdBy);
                createTranslationIfNotExists("organization.buttons.createNew", languageCode, "새 조직 생성", createdBy);
                createTranslationIfNotExists("organization.buttons.view", languageCode, "조직 보기", createdBy);
                createTranslationIfNotExists("organization.buttons.edit", languageCode, "조직 수정", createdBy);
                createTranslationIfNotExists("organization.buttons.invite", languageCode, "멤버 초대", createdBy);
                createTranslationIfNotExists("organization.buttons.createProject", languageCode, "프로젝트 생성", createdBy);
                createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode, "첫 번째 조직 생성",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.firstProject", languageCode, "첫 번째 프로젝트 생성",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.back", languageCode, "조직 목록으로", createdBy);
                createTranslationIfNotExists("organization.buttons.inviteMember", languageCode, "멤버 초대", createdBy);
                createTranslationIfNotExists("organization.buttons.removeMember", languageCode, "멤버 제거", createdBy);
                createTranslationIfNotExists("organization.buttons.backToList", languageCode, "조직 목록으로", createdBy);
                createTranslationIfNotExists("organization.buttons.transferOwnership", languageCode, "소유권 이전",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.transfer", languageCode, "이전", createdBy);
                createTranslationIfNotExists("organization.messages.noOrganizations", languageCode, "조직이 없습니다",
                                createdBy);
                createTranslationIfNotExists("organization.messages.noProjects", languageCode, "이 조직에는 아직 프로젝트가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("organization.messages.createHint", languageCode,
                                "새 조직을 생성하여 프로젝트와 팀을 관리해보세요.",
                                createdBy);
                createTranslationIfNotExists("organization.messages.joinHint", languageCode,
                                "조직에 참가하려면 시스템 관리자에게 문의하세요.",
                                createdBy);
                createTranslationIfNotExists("organization.messages.accessDenied", languageCode,
                                "현재 사용자는 어떤 조직에도 속해있지 않습니다. 시스템 관리자에게 문의하여 조직 멤버로 추가되거나 새 조직을 생성하세요.", createdBy);
                createTranslationIfNotExists("organization.messages.canCreateNew", languageCode,
                                "기존 조직에 접근할 수 없지만, 새로운 조직을 생성할 수 있습니다.", createdBy);
                createTranslationIfNotExists("organization.messages.noAccessContact", languageCode,
                                "현재 참가 가능한 조직이 없습니다. 시스템 관리자에게 문의하세요.", createdBy);
                createTranslationIfNotExists("organization.messages.notFound", languageCode, "조직을 찾을 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("organization.form.name", languageCode, "조직 이름", createdBy);
                createTranslationIfNotExists("organization.form.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode,
                                "조직에 대한 설명을 입력하세요...",
                                createdBy);
                createTranslationIfNotExists("organization.form.nameRequired", languageCode, "조직 이름을 입력해주세요.",
                                createdBy);
                createTranslationIfNotExists("organization.form.codeRequired", languageCode, "프로젝트 코드를 입력해주세요.",
                                createdBy);
                createTranslationIfNotExists("organization.form.projectNameRequired", languageCode, "프로젝트 이름을 입력해주세요.",
                                createdBy);
                createTranslationIfNotExists("organization.form.usernameRequired", languageCode, "사용자명을 입력해주세요.",
                                createdBy);
                createTranslationIfNotExists("organization.form.username", languageCode, "사용자명", createdBy);
                createTranslationIfNotExists("organization.form.role", languageCode, "역할", createdBy);
                createTranslationIfNotExists("organization.form.projectCode", languageCode, "프로젝트 코드", createdBy);
                createTranslationIfNotExists("organization.form.projectName", languageCode, "프로젝트 이름", createdBy);
                createTranslationIfNotExists("organization.form.projectDescription", languageCode, "프로젝트 설명",
                                createdBy);
                createTranslationIfNotExists("organization.form.projectCodePlaceholder", languageCode,
                                "예: WEB_APP_TEST",
                                createdBy);
                createTranslationIfNotExists("organization.form.projectNamePlaceholder", languageCode,
                                "예: 웹 애플리케이션 테스트",
                                createdBy);
                createTranslationIfNotExists("organization.form.projectDescriptionPlaceholder", languageCode,
                                "프로젝트에 대한 간단한 설명을 입력하세요...", createdBy);
                createTranslationIfNotExists("organization.form.projectCodeHelp", languageCode,
                                "영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능", createdBy);
                createTranslationIfNotExists("organization.form.namePlaceholder", languageCode, "조직 이름을 입력하세요...",
                                createdBy);
                createTranslationIfNotExists("organization.form.projectCodeRequired", languageCode, "프로젝트 코드를 입력해주세요.",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.create.title", languageCode, "새 조직 생성", createdBy);
                createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "조직 수정", createdBy);
                createTranslationIfNotExists("organization.dialog.delete.title", languageCode, "조직 삭제 확인", createdBy);
                createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "멤버 초대", createdBy);
                createTranslationIfNotExists("organization.dialog.project.title", languageCode, "조직별 프로젝트 생성",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.editInfo.title", languageCode, "조직 정보 수정", createdBy);
                createTranslationIfNotExists("organization.dialog.createProject.title", languageCode, "프로젝트 생성",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.createProject.info", languageCode,
                                "'{organizationName}' 조직에 새 프로젝트가 생성됩니다.", createdBy);
                createTranslationIfNotExists("organization.dialog.transferOwnership.title", languageCode, "소유권 이전",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.transferOwnership.warning", languageCode,
                                "조직의 소유권을 {name}님에게 이전하시겠습니까? 이 작업은 되돌릴 수 없으며, 귀하는 관리자 권한으로 변경됩니다.", createdBy);
                createTranslationIfNotExists("organization.dialog.transferOwnership.newOwner", languageCode, "새로운 소유자",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.delete.message", languageCode, "조직을 정말 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.delete.warning", languageCode,
                                "이 작업은 되돌릴 수 없습니다. 조직에 속한 모든 프로젝트와 데이터도 함께 삭제됩니다.", createdBy);
                createTranslationIfNotExists("organization.detail.members", languageCode, "멤버", createdBy);
                createTranslationIfNotExists("organization.detail.projects", languageCode, "프로젝트", createdBy);
                createTranslationIfNotExists("organization.detail.organizationMembers", languageCode, "조직 멤버",
                                createdBy);
                createTranslationIfNotExists("organization.detail.organizationProjects", languageCode, "조직 프로젝트",
                                createdBy);
                createTranslationIfNotExists("organization.table.user", languageCode, "사용자", createdBy);
                createTranslationIfNotExists("organization.table.role", languageCode, "역할", createdBy);
                createTranslationIfNotExists("organization.table.joinDate", languageCode, "가입일", createdBy);
                createTranslationIfNotExists("organization.table.actions", languageCode, "작업", createdBy);
                createTranslationIfNotExists("organization.member.remove", languageCode, "멤버 제거", createdBy);
                createTranslationIfNotExists("organization.member.username", languageCode, "사용자명", createdBy);
                createTranslationIfNotExists("organization.member.role", languageCode, "역할", createdBy);
                createTranslationIfNotExists("organization.project.code", languageCode, "프로젝트 코드", createdBy);
                createTranslationIfNotExists("organization.project.name", languageCode, "프로젝트 이름", createdBy);
                createTranslationIfNotExists("organization.project.description", languageCode, "프로젝트 설명", createdBy);
                createTranslationIfNotExists("organization.project.codePlaceholder", languageCode, "예: WEB_APP_TEST",
                                createdBy);
                createTranslationIfNotExists("organization.project.namePlaceholder", languageCode, "예: 웹 애플리케이션 테스트",
                                createdBy);
                createTranslationIfNotExists("organization.project.descriptionPlaceholder", languageCode,
                                "프로젝트에 대한 간단한 설명을 입력하세요...", createdBy);
                createTranslationIfNotExists("organization.project.codeHelperText", languageCode,
                                "영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능", createdBy);
                createTranslationIfNotExists("organization.project.belongsTo", languageCode, "이 프로젝트는 조직에 속하게 됩니다.",
                                createdBy);
                createTranslationIfNotExists("organization.project.noDescription", languageCode, "설명 없음", createdBy);
                createTranslationIfNotExists("organization.project.organizationLabel", languageCode, "소속 조직",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode,
                                "프로젝트",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode,
                                "멤버",
                                createdBy);
                createTranslationIfNotExists("organization.tabs.members", languageCode, "멤버", createdBy);
                createTranslationIfNotExists("organization.tabs.projects", languageCode, "프로젝트", createdBy);
                createTranslationIfNotExists("organization.role.member", languageCode, "멤버", createdBy);
                createTranslationIfNotExists("organization.role.admin", languageCode, "관리자", createdBy);
                createTranslationIfNotExists("organization.role.owner", languageCode, "소유자", createdBy);
                createTranslationIfNotExists("organization.error.notFound", languageCode, "조직을 찾을 수 없습니다.", createdBy);
                createTranslationIfNotExists("organization.error.idNotProvided", languageCode, "조직 ID가 제공되지 않았습니다.",
                                createdBy);
                createTranslationIfNotExists("organization.error.dataLoadFailed", languageCode, "조직 데이터를 불러오는데 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("organization.error.infoLoadFailed", languageCode, "조직 정보를 불러오는데 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("organization.error.editDialogFailed", languageCode,
                                "수정 다이얼로그를 여는데 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("organization.error.selectMember", languageCode, "이전할 멤버를 선택해주세요.",
                                createdBy);
                createTranslationIfNotExists("organization.error.accessDenied", languageCode, "조직 접근 권한 없음", createdBy);
                createTranslationIfNotExists("organization.error.authRequired", languageCode, "인증 필요", createdBy);
                createTranslationIfNotExists("organization.error.resourceNotFound", languageCode, "리소스 없음", createdBy);
                createTranslationIfNotExists("organization.error.general", languageCode, "오류 발생", createdBy);
                createTranslationIfNotExists("organization.error.authDescription", languageCode,
                                "로그인이 필요합니다. 다시 로그인해주세요.",
                                createdBy);
                createTranslationIfNotExists("organization.error.notFoundDescription", languageCode,
                                "요청한 리소스를 찾을 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("organization.error.generalDescription", languageCode,
                                "문제가 지속되면 시스템 관리자에게 문의하세요.",
                                createdBy);
                createTranslationIfNotExists("organization.error.problemOccurred", languageCode, "문제가 발생했습니다",
                                createdBy);
                createTranslationIfNotExists("organization.error.occurredAt", languageCode, "발생 시간: {date}", createdBy);
                createTranslationIfNotExists("user.role.admin", languageCode, "시스템 관리자", createdBy);
                createTranslationIfNotExists("user.role.manager", languageCode, "프로젝트 관리자", createdBy);
                createTranslationIfNotExists("user.role.tester", languageCode, "테스터", createdBy);
                createTranslationIfNotExists("user.role.user", languageCode, "일반 사용자", createdBy);
                createTranslationIfNotExists("user.role.admin.description", languageCode, "모든 시스템 기능 접근 가능", createdBy);
                createTranslationIfNotExists("user.role.manager.description", languageCode, "프로젝트 관리 및 팀 리더십",
                                createdBy);
                createTranslationIfNotExists("user.role.tester.description", languageCode, "테스트 케이스 작성 및 실행",
                                createdBy);
                createTranslationIfNotExists("user.role.user.description", languageCode, "기본적인 시스템 사용", createdBy);
                createTranslationIfNotExists("mail.manager.title", languageCode, "메일 설정 관리", createdBy);
                createTranslationIfNotExists("mail.manager.currentSettings", languageCode, "현재 메일 설정", createdBy);
                createTranslationIfNotExists("mail.manager.subheader", languageCode, "시스템 이메일 발송 설정 상태", createdBy);
                createTranslationIfNotExists("mail.manager.notConfigured", languageCode,
                                "메일 설정이 구성되지 않았습니다. 새 설정을 추가해주세요.",
                                createdBy);
                createTranslationIfNotExists("mail.status.enabled", languageCode, "메일 기능", createdBy);
                createTranslationIfNotExists("mail.status.active", languageCode, "활성", createdBy);
                createTranslationIfNotExists("mail.status.inactive", languageCode, "비활성", createdBy);
                createTranslationIfNotExists("mail.status.activatedStatus", languageCode, "활성화됨", createdBy);
                createTranslationIfNotExists("mail.status.deactivatedStatus", languageCode, "비활성화됨", createdBy);
                createTranslationIfNotExists("mail.smtp.server", languageCode, "SMTP 서버", createdBy);
                createTranslationIfNotExists("password.validation.minLength", languageCode, "최소 8자 이상이어야 합니다",
                                createdBy);
                createTranslationIfNotExists("password.validation.maxLength", languageCode, "최대 100자까지 입력 가능합니다",
                                createdBy);
                createTranslationIfNotExists("password.validation.complexity", languageCode,
                                "영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다",
                                createdBy);
                createTranslationIfNotExists("password.validation.mismatch", languageCode, "새 비밀번호와 일치하지 않습니다",
                                createdBy);
                createTranslationIfNotExists("password.validation.currentRequired", languageCode, "현재 비밀번호를 입력해주세요",
                                createdBy);
                createTranslationIfNotExists("password.change.title", languageCode, "비밀번호 변경", createdBy);
                createTranslationIfNotExists("password.change.description", languageCode, "보안을 위해 정기적으로 비밀번호를 변경해주세요.",
                                createdBy);
                createTranslationIfNotExists("password.form.current", languageCode, "현재 비밀번호", createdBy);
                createTranslationIfNotExists("password.form.new", languageCode, "새 비밀번호", createdBy);
                createTranslationIfNotExists("password.form.confirm", languageCode, "새 비밀번호 확인", createdBy);
                createTranslationIfNotExists("password.placeholder.current", languageCode, "현재 사용 중인 비밀번호를 입력하세요",
                                createdBy);
                createTranslationIfNotExists("password.placeholder.new", languageCode, "새로운 비밀번호를 입력하세요 (8자 이상)",
                                createdBy);
                createTranslationIfNotExists("password.placeholder.confirm", languageCode, "새 비밀번호를 다시 입력하세요",
                                createdBy);
                createTranslationIfNotExists("password.button.change", languageCode, "비밀번호 변경", createdBy);
                createTranslationIfNotExists("password.button.changing", languageCode, "변경 중...", createdBy);
                createTranslationIfNotExists("profile.title", languageCode, "사용자 프로필", createdBy);
                createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "기본 정보", createdBy);
                createTranslationIfNotExists("profile.tabs.password", languageCode, "비밀번호", createdBy);
                createTranslationIfNotExists("profile.tabs.language", languageCode, "언어 설정", createdBy);
                createTranslationIfNotExists("profile.tabs.appearance", languageCode, "화면 설정", createdBy);
                createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA 설정", createdBy);
                createTranslationIfNotExists("profile.form.username", languageCode, "사용자명", createdBy);
                createTranslationIfNotExists("profile.form.usernameHelper", languageCode, "사용자명은 변경할 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("profile.form.name", languageCode, "이름", createdBy);
                createTranslationIfNotExists("profile.form.email", languageCode, "이메일", createdBy);
                createTranslationIfNotExists("profile.form.role", languageCode, "역할", createdBy);

                // 역할 종류 한글 번역
                createTranslationIfNotExists("role.admin", languageCode, "시스템 관리자", createdBy);
                createTranslationIfNotExists("role.manager", languageCode, "관리자", createdBy);
                createTranslationIfNotExists("role.tester", languageCode, "테스터", createdBy);
                createTranslationIfNotExists("role.user", languageCode, "일반 사용자", createdBy);

                createTranslationIfNotExists("profile.success.updated", languageCode, "정보가 성공적으로 변경되었습니다.", createdBy);
                createTranslationIfNotExists("profile.error.updateFailed", languageCode, "정보 변경에 실패했습니다.", createdBy);
                createTranslationIfNotExists("profile.appearance.title", languageCode, "화면 설정", createdBy);
                createTranslationIfNotExists("profile.appearance.description", languageCode,
                                "애플리케이션의 화면 테마를 변경할 수 있습니다.",
                                createdBy);
                createTranslationIfNotExists("profile.appearance.lightMode", languageCode, "라이트 모드", createdBy);
                createTranslationIfNotExists("profile.appearance.darkMode", languageCode, "다크 모드", createdBy);
                createTranslationIfNotExists("profile.appearance.lightMode.description", languageCode, "밝은 배경의 깔끔한 화면",
                                createdBy);
                createTranslationIfNotExists("profile.appearance.darkMode.description", languageCode, "어두운 배경의 편안한 화면",
                                createdBy);
                createTranslationIfNotExists("profile.appearance.switch.dark", languageCode, "다크", createdBy);
                createTranslationIfNotExists("profile.appearance.switch.light", languageCode, "라이트", createdBy);
                createTranslationIfNotExists("profile.appearance.info", languageCode,
                                "테마 변경은 즉시 적용되며 브라우저에 자동으로 저장됩니다.",
                                createdBy);
                createTranslationIfNotExists("button.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("button.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("profile.validation.allRequired", languageCode, "이름과 이메일을 모두 입력해주세요.",
                                createdBy);
                createTranslationIfNotExists("userProfile.edit.title", languageCode, "프로필 편집", createdBy);
                createTranslationIfNotExists("userProfile.edit.description", languageCode, "프로필 정보를 수정할 수 있습니다.",
                                createdBy);
                createTranslationIfNotExists("userDetail.loading", languageCode, "사용자 정보를 불러오는 중...", createdBy);
                createTranslationIfNotExists("userDetail.title", languageCode, "사용자 정보", createdBy);
                createTranslationIfNotExists("userDetail.notFound", languageCode, "사용자 정보를 찾을 수 없습니다.", createdBy);
                createTranslationIfNotExists("userDetail.editCancel.title", languageCode, "편집 취소", createdBy);
                createTranslationIfNotExists("userDetail.editCancel.message", languageCode,
                                "편집 중인 내용이 있습니다. 저장하지 않고 닫으시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("userDetail.validation.required", languageCode, "이름과 이메일은 필수 입력 항목입니다.",
                                createdBy);
                createTranslationIfNotExists("userDetail.validation.emailFormat", languageCode, "올바른 이메일 형식을 입력해주세요.",
                                createdBy);
                createTranslationIfNotExists("userDetail.error.saveError", languageCode, "저장 중 오류가 발생했습니다.", createdBy);
                createTranslationIfNotExists("userDetail.section.basicInfo", languageCode, "기본 정보", createdBy);
                createTranslationIfNotExists("userDetail.button.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("common.unauthorized.title", languageCode, "로그인이 필요합니다", createdBy);
                createTranslationIfNotExists("common.unauthorized.message", languageCode, "이 페이지에 접근하려면 로그인이 필요합니다.",
                                createdBy);
                createTranslationIfNotExists("common.unauthorized.redirecting", languageCode, "로그인 페이지로 이동 중...",
                                createdBy);
                createTranslationIfNotExists("common.loading.text", languageCode, "로딩 중...", createdBy);
                createTranslationIfNotExists("common.error.networkError", languageCode, "네트워크 오류가 발생했습니다.", createdBy);
                createTranslationIfNotExists("common.error.serverError", languageCode, "서버 오류가 발생했습니다.", createdBy);
                createTranslationIfNotExists("common.error.unknownError", languageCode, "알 수 없는 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("common.success.saved", languageCode, "성공적으로 저장되었습니다.", createdBy);
                createTranslationIfNotExists("common.success.deleted", languageCode, "성공적으로 삭제되었습니다.", createdBy);
                createTranslationIfNotExists("common.confirm.delete", languageCode, "정말로 삭제하시겠습니까?", createdBy);
                createTranslationIfNotExists("project.messages.noParticipatingProjects", languageCode,
                                "참여 중인 프로젝트가 없습니다",
                                createdBy);
                createTranslationIfNotExists("project.messages.needInvitation", languageCode, "프로젝트에 참여하려면 초대가 필요합니다.",
                                createdBy);
                createTranslationIfNotExists("project.messages.requestInvitation", languageCode,
                                "프로젝트 관리자에게 초대를 요청하세요.",
                                createdBy);
                createTranslationIfNotExists("common.unauthorized.backToProjects", languageCode, "프로젝트 선택으로 돌아가기",
                                createdBy);
                createTranslationIfNotExists("common.buttons.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("common.status.loading", languageCode, "로딩 중...", createdBy);
                createTranslationIfNotExists("common.status.error", languageCode, "오류 발생", createdBy);
                createTranslationIfNotExists("common.actions.view", languageCode, "보기", createdBy);
                createTranslationIfNotExists("common.actions.download", languageCode, "다운로드", createdBy);
                createTranslationIfNotExists("common.validation.required", languageCode, "필수 입력 항목입니다", createdBy);
                createTranslationIfNotExists("userDetail.status.active", languageCode, "활성", createdBy);
                createTranslationIfNotExists("userDetail.status.inactive", languageCode, "비활성", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.edit", languageCode, "편집", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.passwordChange", languageCode, "비밀번호 변경", createdBy);
                createTranslationIfNotExists("userDetail.form.name", languageCode, "이름", createdBy);
                createTranslationIfNotExists("userDetail.form.email", languageCode, "이메일", createdBy);
                createTranslationIfNotExists("userDetail.form.role", languageCode, "역할", createdBy);
                createTranslationIfNotExists("userDetail.form.accountActive", languageCode, "계정 활성화", createdBy);
                createTranslationIfNotExists("project.dialog.transferTitle", languageCode, "프로젝트 조직 이전", createdBy);
                createTranslationIfNotExists("project.dialog.transferDescription", languageCode,
                                "'<strong>{projectName}</strong>' 프로젝트를 다른 조직으로 이전하거나 독립 프로젝트로 만들 수 있습니다.", createdBy);
                createTranslationIfNotExists("project.dialog.forceDeleteTitle", languageCode, "프로젝트 강제 삭제 확인",
                                createdBy);
                createTranslationIfNotExists("project.dialog.forceDeleteConfirm", languageCode,
                                "'<strong>{projectName}</strong>' 프로젝트를 정말 강제 삭제하시겠습니까?", createdBy);
                createTranslationIfNotExists("project.dialog.forceDeleteWarningTitle", languageCode, "⚠️ 강제 삭제 경고",
                                createdBy);
                createTranslationIfNotExists("project.dialog.forceDeleteWarningMessage", languageCode,
                                "연결된 모든 테스트 플랜, 테스트 케이스, 실행 이력이 함께 삭제됩니다! 이 작업은 되돌릴 수 없습니다.", createdBy);
                createTranslationIfNotExists("project.dialog.deleteConfirm", languageCode,
                                "'<strong>{projectName}</strong>' 프로젝트를 정말 삭제하시겠습니까?", createdBy);
                createTranslationIfNotExists("project.dialog.deleteWarningMessage", languageCode,
                                "이 작업은 되돌릴 수 없습니다. 프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.", createdBy);
                createTranslationIfNotExists("mail.guide.dialog.title", languageCode, "Gmail 앱 비밀번호 설정 가이드", createdBy);
                createTranslationIfNotExists("mail.guide.requirements.header", languageCode, "📋 필수 요구사항", createdBy);
                createTranslationIfNotExists("mail.guide.sections.stepGuide", languageCode, "🔧 단계별 설정 방법", createdBy);
                createTranslationIfNotExists("mail.guide.sections.troubleshooting", languageCode, "🔍 문제 해결",
                                createdBy);
                createTranslationIfNotExists("mail.guide.sections.security", languageCode, "🔒 보안 주의사항", createdBy);
                createTranslationIfNotExists("attachments.button.download", languageCode, "다운로드", createdBy);
                createTranslationIfNotExists("attachments.button.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "리프레시", createdBy);
                createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "순서 저장", createdBy);
                createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "순서 편집", createdBy);
                createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "테스트케이스 수", createdBy);
                createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "멤버 수", createdBy);
                createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode, "자동화 테스트 결과 수",
                                createdBy);
                createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "자동화 테스트 상태", createdBy);
                createTranslationIfNotExists("testcase.validation.stepRequired", languageCode, "Step을 입력하세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
                createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
                createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step 설명", createdBy);
                createTranslationIfNotExists("recentResults.button.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("userList.button.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("userList.button.export", languageCode, "데이터 내보내기", createdBy);
                createTranslationIfNotExists("userList.button.reset", languageCode, "초기화", createdBy);
                createTranslationIfNotExists("junit.dashboard.uploadResult", languageCode, "결과 업로드", createdBy);
                createTranslationIfNotExists("junit.table.uploadTime", languageCode, "업로드 시간", createdBy);
                createTranslationIfNotExists("junit.dashboard.uploading", languageCode, "업로드 중...", createdBy);
                createTranslationIfNotExists("junit.dashboard.upload", languageCode, "업로드", createdBy);
                createTranslationIfNotExists("common.button.retry", languageCode, "다시 시도", createdBy);
                createTranslationIfNotExists("common.button.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("common.button.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("common.button.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode,
                                "조직에 대한 설명을 입력하세요",
                                createdBy);
                createTranslationIfNotExists("junit.placeholder.executionName", languageCode, "실행 이름을 입력하세요",
                                createdBy);
                createTranslationIfNotExists("junit.editor.userDescriptionPlaceholder", languageCode,
                                "이 테스트 케이스에 대한 상세한 설명을 입력하세요...", createdBy);
                createTranslationIfNotExists("testcase.advancedFilter.searchPlaceholder", languageCode,
                                "테스트케이스 이름, 설명, 단계 내용 검색...", createdBy);
                createTranslationIfNotExists("preset.name.placeholder", languageCode, "예: 내 테스트 케이스", createdBy);
                createTranslationIfNotExists("common.unauthorized.title", languageCode, "권한 없음", createdBy);
                createTranslationIfNotExists("common.unauthorized.message", languageCode, "이 페이지에 접근할 권한이 없습니다",
                                createdBy);
                createTranslationIfNotExists("common.loading", languageCode, "로딩 중...", createdBy);
                createTranslationIfNotExists("common.all", languageCode, "전체", createdBy);
                createTranslationIfNotExists("common.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("organization.dashboard.title", languageCode, "조직 대시보드", createdBy);
                createTranslationIfNotExists("organization.management.title", languageCode, "조직 관리", createdBy);
                createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "조직 수정", createdBy);
                createTranslationIfNotExists("organization.dialog.create.title", languageCode, "조직 생성", createdBy);
                createTranslationIfNotExists("organization.form.name", languageCode, "조직명", createdBy);
                createTranslationIfNotExists("organization.dialog.delete.title", languageCode, "조직 삭제", createdBy);
                createTranslationIfNotExists("organization.dialog.delete.message", languageCode, "조직을 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "멤버 초대", createdBy);
                createTranslationIfNotExists("organization.dialog.createProject.title", languageCode, "프로젝트 생성",
                                createdBy);
                createTranslationIfNotExists("junit.dashboard.title", languageCode, "JUnit 대시보드", createdBy);
                createTranslationIfNotExists("junit.table.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("junit.upload.dialog.title", languageCode, "JUnit 결과 업로드", createdBy);
                createTranslationIfNotExists("testCaseResult.page.title", languageCode, "테스트 케이스 결과", createdBy);
                createTranslationIfNotExists("dashboard.title", languageCode, "대시보드", createdBy);
                createTranslationIfNotExists("dashboard.noData.message", languageCode, "표시할 데이터가 없습니다", createdBy);
                createTranslationIfNotExists("junit.error.loadFailed", languageCode, "JUnit 결과 로드 실패", createdBy);
                createTranslationIfNotExists("dashboard.error.retry", languageCode, "다시 시도", createdBy);
                createTranslationIfNotExists("dashboard.error.goToLogin", languageCode, "로그인으로 이동", createdBy);
                createTranslationIfNotExists("dashboard.error.details", languageCode, "상세 정보", createdBy);
                createTranslationIfNotExists("junit.stats.error", languageCode, "에러", createdBy);
                createTranslationIfNotExists("junit.stats.errorTests", languageCode, "에러 테스트", createdBy);
                createTranslationIfNotExists("junit.stats.successRate", languageCode, "성공률", createdBy);
                createTranslationIfNotExists("junit.stats.failed", languageCode, "실패", createdBy);
                createTranslationIfNotExists("organization.form.nameRequired", languageCode, "조직명은 필수입니다", createdBy);
                createTranslationIfNotExists("organization.buttons.createNew", languageCode, "새 조직 만들기", createdBy);
                createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode, "첫 번째 조직 만들기",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.view", languageCode, "보기", createdBy);
                createTranslationIfNotExists("common.buttons.edit", languageCode, "수정", createdBy);
                createTranslationIfNotExists("common.buttons.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("common.buttons.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("common.buttons.create", languageCode, "생성", createdBy);
                createTranslationIfNotExists("organization.dialog.delete.warning", languageCode, "이 작업은 되돌릴 수 없습니다",
                                createdBy);
                createTranslationIfNotExists("organization.form.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("organization.detail.members", languageCode, "멤버", createdBy);
                createTranslationIfNotExists("organization.detail.projects", languageCode, "프로젝트", createdBy);
                createTranslationIfNotExists("organization.detail.settings", languageCode, "설정", createdBy);
                createTranslationIfNotExists("organization.member.role.admin", languageCode, "관리자", createdBy);
                createTranslationIfNotExists("organization.member.role.member", languageCode, "멤버", createdBy);
                createTranslationIfNotExists("organization.member.role.viewer", languageCode, "뷰어", createdBy);
                createTranslationIfNotExists("organization.project.status.active", languageCode, "활성", createdBy);
                createTranslationIfNotExists("organization.project.status.inactive", languageCode, "비활성", createdBy);
                createTranslationIfNotExists("organization.project.status.archived", languageCode, "보관됨", createdBy);
                createTranslationIfNotExists("project.form.name", languageCode, "프로젝트명", createdBy);
                createTranslationIfNotExists("project.form.description", languageCode, "프로젝트 설명", createdBy);
                createTranslationIfNotExists("project.form.startDate", languageCode, "시작일", createdBy);
                createTranslationIfNotExists("project.form.endDate", languageCode, "종료일", createdBy);
                createTranslationIfNotExists("project.status.planning", languageCode, "계획", createdBy);
                createTranslationIfNotExists("project.status.inProgress", languageCode, "진행중", createdBy);
                createTranslationIfNotExists("project.status.completed", languageCode, "완료", createdBy);
                createTranslationIfNotExists("project.status.onHold", languageCode, "보류", createdBy);
                createTranslationIfNotExists("testCase.form.name", languageCode, "테스트 케이스명", createdBy);
                createTranslationIfNotExists("testCase.form.priority", languageCode, "우선순위", createdBy);
                createTranslationIfNotExists("testCase.priority.high", languageCode, "높음", createdBy);
                createTranslationIfNotExists("testCase.priority.medium", languageCode, "보통", createdBy);
                createTranslationIfNotExists("testCase.priority.low", languageCode, "낮음", createdBy);
                createTranslationIfNotExists("testCase.status.draft", languageCode, "초안", createdBy);
                createTranslationIfNotExists("testCase.status.review", languageCode, "검토중", createdBy);
                createTranslationIfNotExists("testCase.status.approved", languageCode, "승인됨", createdBy);
                createTranslationIfNotExists("testCase.status.deprecated", languageCode, "사용중지", createdBy);

                // 시간대 관련 한글 번역
                createTranslationIfNotExists("timezone.settings.title", languageCode, "시간대 설정", createdBy);
                createTranslationIfNotExists("timezone.settings.description", languageCode,
                                "시간대를 설정하면 모든 시간이 선택한 시간대로 표시됩니다.",
                                createdBy);
                createTranslationIfNotExists("timezone.label", languageCode, "시간대", createdBy);
                createTranslationIfNotExists("timezone.helperText", languageCode,
                                "기본 시간대는 UTC입니다. 변경 사항은 저장 버튼을 눌러야 적용됩니다.",
                                createdBy);
                createTranslationIfNotExists("timezone.current", languageCode, "현재 시간대", createdBy);
                createTranslationIfNotExists("timezone.utc", languageCode, "UTC (UTC+0)", createdBy);
                createTranslationIfNotExists("timezone.seoul", languageCode, "서울 (UTC+9)", createdBy);
                createTranslationIfNotExists("timezone.newYork", languageCode, "뉴욕 (UTC-5/-4)", createdBy);
                createTranslationIfNotExists("timezone.losAngeles", languageCode, "로스앤젤레스 (UTC-8/-7)", createdBy);
                createTranslationIfNotExists("timezone.london", languageCode, "런던 (UTC+0/+1)", createdBy);
                createTranslationIfNotExists("timezone.paris", languageCode, "파리 (UTC+1/+2)", createdBy);
                createTranslationIfNotExists("timezone.tokyo", languageCode, "도쿄 (UTC+9)", createdBy);
                createTranslationIfNotExists("timezone.shanghai", languageCode, "상하이 (UTC+8)", createdBy);
                createTranslationIfNotExists("timezone.singapore", languageCode, "싱가포르 (UTC+8)", createdBy);
                createTranslationIfNotExists("timezone.hongKong", languageCode, "홍콩 (UTC+8)", createdBy);
                createTranslationIfNotExists("timezone.sydney", languageCode, "시드니 (UTC+10/+11)", createdBy);

                // 조직 대시보드 - 성능 메트릭 탭
                createTranslationIfNotExists("organization.dashboard.tabs.performanceMetrics", languageCode, "성능 메트릭",
                                createdBy);

                // 성능 메트릭 관련 한글 번역
                createTranslationIfNotExists("performance.title", languageCode, "시스템 성능 메트릭", createdBy);
                createTranslationIfNotExists("performance.lastUpdated", languageCode, "최근 업데이트: {time}", createdBy);
                createTranslationIfNotExists("performance.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("performance.systemResources", languageCode, "시스템 리소스", createdBy);
                createTranslationIfNotExists("performance.cpu", languageCode, "CPU 사용률", createdBy);
                createTranslationIfNotExists("performance.memory", languageCode, "메모리 사용률", createdBy);
                createTranslationIfNotExists("performance.disk", languageCode, "디스크 사용률", createdBy);
                createTranslationIfNotExists("performance.cache", languageCode, "캐시 성능", createdBy);
                createTranslationIfNotExists("performance.cache.project", languageCode, "프로젝트 캐시", createdBy);
                createTranslationIfNotExists("performance.cache.testcase", languageCode, "테스트케이스 캐시", createdBy);
                createTranslationIfNotExists("performance.cache.hitRate", languageCode, "적중률", createdBy);
                createTranslationIfNotExists("performance.cache.hit", languageCode, "적중", createdBy);
                createTranslationIfNotExists("performance.cache.miss", languageCode, "누락", createdBy);
                createTranslationIfNotExists("performance.application", languageCode, "애플리케이션 성능", createdBy);
                createTranslationIfNotExists("performance.avgResponseTime", languageCode, "평균 응답 시간", createdBy);
                createTranslationIfNotExists("performance.requestsPerSecond", languageCode, "초당 요청 수", createdBy);
                createTranslationIfNotExists("performance.activeConnections", languageCode, "활성 연결", createdBy);
                createTranslationIfNotExists("performance.usage", languageCode, "사용량 요약", createdBy);
                createTranslationIfNotExists("performance.usage.todayVisits", languageCode, "오늘 방문", createdBy);
                createTranslationIfNotExists("performance.usage.uniqueVisitors", languageCode, "오늘 고유 방문자", createdBy);
                createTranslationIfNotExists("performance.usage.activeSessions", languageCode, "활성 세션", createdBy);
                createTranslationIfNotExists("performance.usage.recentMinutes", languageCode, "최근 {minutes}분 기준",
                                createdBy);
                createTranslationIfNotExists("performance.usage.topPages", languageCode, "상위 페이지", createdBy);
                createTranslationIfNotExists("performance.usage.totalAccumulated", languageCode, "누적 {total}",
                                createdBy);
                createTranslationIfNotExists("performance.usage.dailySummary", languageCode, "일별 방문 요약", createdBy);
                createTranslationIfNotExists("performance.usage.uniqueCount", languageCode, "고유 {count}", createdBy);
                createTranslationIfNotExists("performance.error.loadFailed", languageCode, "성능 메트릭을 불러오는데 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("performance.button.retry", languageCode, "다시 시도", createdBy);

                // 사용자 프로필 - 버전 정보 표시
                createTranslationIfNotExists("profile.version.title", languageCode, "버전 정보", createdBy);
                createTranslationIfNotExists("profile.version.backend", languageCode, "백엔드", createdBy);
                createTranslationIfNotExists("profile.version.frontend", languageCode, "프론트엔드", createdBy);
                createTranslationIfNotExists("profile.version.rag", languageCode, "RAG 서비스", createdBy);
                createTranslationIfNotExists("profile.version.loading", languageCode, "버전 정보 로딩 중...", createdBy);
                createTranslationIfNotExists("profile.version.error", languageCode, "버전 정보를 불러올 수 없습니다.", createdBy);
        }

        private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
                Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
                if (translationKeyOpt.isPresent()) {
                        TranslationKey translationKey = translationKeyOpt.get();
                        Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
                        if (languageOpt.isPresent()) {
                                Language language = languageOpt.get();
                                Optional<Translation> existingTranslationOpt = translationRepository
                                                .findByTranslationKeyAndLanguage(translationKey, language);
                                if (existingTranslationOpt.isEmpty()) {
                                        Translation translation = new Translation();
                                        translation.setTranslationKey(translationKey);
                                        translation.setLanguage(language);
                                        translation.setValue(value);
                                        translation.setCreatedBy(createdBy);
                                        translation.setUpdatedBy(createdBy);
                                        translation.setIsActive(true);
                                        translationRepository.save(translation);
                                        log.debug("번역 생성: {} - {}", keyName, languageCode);
                                } else {
                                        Translation existingTranslation = existingTranslationOpt.get();
                                        if (!existingTranslation.getValue().equals(value)) {
                                                existingTranslation.setValue(value);
                                                existingTranslation.setUpdatedBy(createdBy);
                                                translationRepository.save(existingTranslation);
                                                log.debug("번역 업데이트: {} - {}", keyName, languageCode);
                                        } else {
                                                log.debug("번역 이미 존재하며 동일함: {} - {}", keyName, languageCode);
                                        }
                                }
                        }
                } else {
                        log.warn("번역 키를 찾을 수 없음: {}", keyName);
                }
        }
}
