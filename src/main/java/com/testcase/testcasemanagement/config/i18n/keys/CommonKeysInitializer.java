// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/CommonKeysInitializer.java
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
public class CommonKeysInitializer {

        private final TranslationKeyRepository translationKeyRepository;

        public void initialize() {
                // 버튼 공통 키들
                createTranslationKeyIfNotExists("button.save", "button", "저장 버튼", "저장");
                createTranslationKeyIfNotExists("button.cancel", "button", "취소 버튼", "취소");
                createTranslationKeyIfNotExists("button.delete", "button", "삭제 버튼", "삭제");
                createTranslationKeyIfNotExists("button.edit", "button", "편집 버튼", "편집");
                createTranslationKeyIfNotExists("button.add", "button", "추가 버튼", "추가");
                createTranslationKeyIfNotExists("button.close", "button", "닫기 버튼", "닫기");
                createTranslationKeyIfNotExists("button.confirm", "button", "확인 버튼", "확인");

                // 메시지 키들
                createTranslationKeyIfNotExists("message.success", "message", "성공 메시지", "성공적으로 처리되었습니다.");
                createTranslationKeyIfNotExists("message.error", "message", "오류 메시지", "오류가 발생했습니다.");
                createTranslationKeyIfNotExists("message.loading", "message", "로딩 메시지", "로딩 중...");
                createTranslationKeyIfNotExists("message.confirm_delete", "message", "삭제 확인 메시지", "정말로 삭제하시겠습니까?");

                // 검증 메시지 키들
                createTranslationKeyIfNotExists("validation.required", "validation", "필수 입력 검증", "필수 입력 항목입니다.");
                createTranslationKeyIfNotExists("validation.email", "validation", "이메일 형식 검증", "올바른 이메일 형식을 입력하세요.");
                createTranslationKeyIfNotExists("validation.min_length", "validation", "최소 길이 검증",
                                "최소 {0}글자 이상 입력하세요.");
                createTranslationKeyIfNotExists("validation.max_length", "validation", "최대 길이 검증",
                                "최대 {0}글자까지 입력 가능합니다.");
                createTranslationKeyIfNotExists("validation.required.all", "validation", "모든 필드 필수 입력",
                                "모든 필드를 입력해주세요.");
                createTranslationKeyIfNotExists("validation.password.mismatch", "validation", "비밀번호 불일치",
                                "비밀번호가 일치하지 않습니다.");

                // 언어 선택 키들
                createTranslationKeyIfNotExists("language.select", "language", "언어 선택 라벨", "언어 선택");
                createTranslationKeyIfNotExists("language.korean", "language", "한국어", "한국어");
                createTranslationKeyIfNotExists("language.english", "language", "영어", "English");
                createTranslationKeyIfNotExists("language.japanese", "language", "일본어", "日本語");
                createTranslationKeyIfNotExists("language.chinese", "language", "중국어", "中文");
                createTranslationKeyIfNotExists("language.settings.title", "language", "언어 설정 제목", "언어 설정");
                createTranslationKeyIfNotExists("language.settings.description", "language", "언어 설정 설명",
                                "선호하는 언어를 선택하면 전체 애플리케이션에서 해당 언어로 표시됩니다.");
                createTranslationKeyIfNotExists("language.interface", "language", "인터페이스 언어 라벨", "인터페이스 언어");
                createTranslationKeyIfNotExists("language.helperText", "language", "언어 변경 도움말",
                                "변경된 언어는 즉시 적용되며 자동으로 저장됩니다.");
                createTranslationKeyIfNotExists("language.current", "language", "현재 언어", "현재 언어:");

                // Header Navigation 전용 키들
                createTranslationKeyIfNotExists("header.nav.dashboard", "header", "대시보드 네비게이션", "대시보드");
                createTranslationKeyIfNotExists("header.nav.organizationManagement", "header", "조직 관리 네비게이션", "조직 관리");
                createTranslationKeyIfNotExists("header.nav.userManagement", "header", "사용자 관리 네비게이션", "사용자 관리");
                createTranslationKeyIfNotExists("header.nav.mailSettings", "header", "메일 설정 네비게이션", "메일 설정");
                createTranslationKeyIfNotExists("header.nav.translationManagement", "header", "번역 관리 네비게이션", "번역 관리");
                createTranslationKeyIfNotExists("header.nav.llmConfig", "header", "LLM 설정 네비게이션", "LLM 설정");
                createTranslationKeyIfNotExists("header.nav.schedulerManagement", "header", "스케줄러 관리 네비게이션", "스케줄러 관리");
                createTranslationKeyIfNotExists("header.nav.projectSelection", "header", "프로젝트 선택 네비게이션", "프로젝트 선택");

                // User Menu 관련
                createTranslationKeyIfNotExists("header.userMenu.profile", "header", "사용자 프로필 메뉴", "프로필");
                createTranslationKeyIfNotExists("header.userMenu.logout", "header", "로그아웃 메뉴", "로그아웃");

                // 공통 메시지들
                createTranslationKeyIfNotExists("common.loading", "common", "로딩 메시지", "로딩 중...");
                createTranslationKeyIfNotExists("common.unauthorized.title", "common", "인증 실패 제목", "접근 권한이 없습니다");
                createTranslationKeyIfNotExists("common.unauthorized.description", "common", "인증 실패 설명",
                                "이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.");
                createTranslationKeyIfNotExists("common.unauthorized.loginButton", "common", "로그인 버튼", "로그인하기");
                createTranslationKeyIfNotExists("common.changeLanguage", "common", "언어 변경 툴팁", "언어 변경");
                createTranslationKeyIfNotExists("common.buttons.delete", "common", "공통 삭제 버튼", "삭제");
                createTranslationKeyIfNotExists("common.buttons.cancel", "common", "공통 취소 버튼", "취소");
                createTranslationKeyIfNotExists("common.buttons.save", "common", "공통 저장 버튼", "저장");
                createTranslationKeyIfNotExists("common.buttons.create", "common", "공통 생성 버튼", "생성");
                createTranslationKeyIfNotExists("common.buttons.edit", "common", "공통 수정 버튼", "수정");
                createTranslationKeyIfNotExists("common.buttons.update", "common", "공통 업데이트 버튼", "수정");

                // 추가 공통 키들
                createTranslationKeyIfNotExists("common.close", "common", "닫기", "닫기");
                createTranslationKeyIfNotExists("common.select", "common", "선택", "선택");
                createTranslationKeyIfNotExists("common.list", "common", "목록", "목록");
                createTranslationKeyIfNotExists("common.save", "common", "공통 저장 버튼", "저장");
                createTranslationKeyIfNotExists("common.create", "common", "공통 생성 버튼", "생성");
                createTranslationKeyIfNotExists("common.edit", "common", "공통 수정 버튼", "수정");
                createTranslationKeyIfNotExists("common.delete", "common", "공통 삭제 버튼", "삭제");

                // 추가 누락된 common 키들
                createTranslationKeyIfNotExists("common.unauthorized.redirecting", "common", "인증 실패 리다이렉트 메시지",
                                "로그인 페이지로 이동합니다");
                createTranslationKeyIfNotExists("common.loading.text", "common", "로딩 텍스트", "로딩 중");
                createTranslationKeyIfNotExists("common.error.networkError", "common", "네트워크 오류", "네트워크 오류가 발생했습니다");
                createTranslationKeyIfNotExists("common.error.serverError", "common", "서버 오류", "서버 오류가 발생했습니다");
                createTranslationKeyIfNotExists("common.error.unknownError", "common", "알 수 없는 오류",
                                "알 수 없는 오류가 발생했습니다");
                createTranslationKeyIfNotExists("common.success.saved", "common", "저장 성공", "성공적으로 저장되었습니다");
                createTranslationKeyIfNotExists("common.success.deleted", "common", "삭제 성공", "성공적으로 삭제되었습니다");
                createTranslationKeyIfNotExists("common.confirm.delete", "common", "삭제 확인", "삭제하시겠습니까?");
                createTranslationKeyIfNotExists("common.unauthorized.backToProjects", "common", "프로젝트 목록으로 돌아가기",
                                "프로젝트 목록으로");
                createTranslationKeyIfNotExists("common.status.loading", "common", "로딩 상태", "로딩 중");
                createTranslationKeyIfNotExists("common.status.error", "common", "오류 상태", "오류");
                createTranslationKeyIfNotExists("common.actions.view", "common", "보기 액션", "보기");
                createTranslationKeyIfNotExists("common.actions.download", "common", "다운로드 액션", "다운로드");
                createTranslationKeyIfNotExists("common.validation.required", "common", "필수 입력 검증", "필수 입력 항목입니다");
                createTranslationKeyIfNotExists("common.expand", "common", "펼치기", "펼치기");
                createTranslationKeyIfNotExists("common.collapse", "common", "접기", "접기");

                // 설정 관련 키
                createTranslationKeyIfNotExists("config.database.title", "config", "데이터베이스 설정", "데이터베이스 설정");
                createTranslationKeyIfNotExists("config.api.title", "config", "API 설정", "API 설정");
                createTranslationKeyIfNotExists("config.integration.title", "config", "통합 설정", "통합 설정");

                // 승인 워크플로 관련 키
                createTranslationKeyIfNotExists("approval.request.title", "approval", "승인 요청", "승인 요청");
                createTranslationKeyIfNotExists("approval.pending.list", "approval", "대기 중인 승인 목록", "대기 중인 승인");
                createTranslationKeyIfNotExists("approval.approved.list", "approval", "승인된 목록", "승인됨");
                createTranslationKeyIfNotExists("approval.rejected.list", "approval", "거부된 목록", "거부됨");

                // 작업 관리 관련 키
                createTranslationKeyIfNotExists("task.assignment.title", "task", "작업 할당", "작업 할당");
                createTranslationKeyIfNotExists("task.deadline.title", "task", "마감일 설정", "마감일");

                // 감사 및 로깅 관련 키
                createTranslationKeyIfNotExists("audit.log.title", "audit", "감사 로그", "감사 로그");
                createTranslationKeyIfNotExists("audit.trail.title", "audit", "감사 추적", "감사 추적");
                createTranslationKeyIfNotExists("log.system.title", "log", "시스템 로그", "시스템 로그");
                createTranslationKeyIfNotExists("log.user.activity", "log", "사용자 활동 로그", "사용자 활동");
                createTranslationKeyIfNotExists("log.error.title", "log", "오류 로그", "오류 로그");
                createTranslationKeyIfNotExists("log.access.title", "log", "접근 로그", "접근 로그");

                // 이력 관리 관련 키
                createTranslationKeyIfNotExists("history.change.title", "history", "변경 이력", "변경 이력");
                createTranslationKeyIfNotExists("history.version.title", "history", "버전 이력", "버전 이력");
                createTranslationKeyIfNotExists("history.backup.title", "history", "백업 이력", "백업 이력");

                // 모니터링 관련
                createTranslationKeyIfNotExists("monitoring.status.title", "monitoring", "시스템 모니터링 상태", "모니터링 상태");
                createTranslationKeyIfNotExists("calendar.view.title", "calendar", "캘린더 보기", "캘린더 보기");

                // LLM 설정 관리 키들
                createTranslationKeyIfNotExists("admin.llmConfig.title", "admin", "LLM 설정 관리 제목", "LLM 설정 관리");
                createTranslationKeyIfNotExists("admin.llmConfig.addConfig", "admin", "LLM 설정 추가 버튼", "LLM 설정 추가");
                createTranslationKeyIfNotExists("admin.llmConfig.editConfig", "admin", "LLM 설정 수정", "LLM 설정 수정");
                createTranslationKeyIfNotExists("admin.llmConfig.createConfig", "admin", "LLM 설정 생성", "LLM 설정 생성");
                createTranslationKeyIfNotExists("admin.llmConfig.name", "admin", "이름", "이름");
                createTranslationKeyIfNotExists("admin.llmConfig.provider", "admin", "제공자", "제공자");
                createTranslationKeyIfNotExists("admin.llmConfig.model", "admin", "모델", "모델");
                createTranslationKeyIfNotExists("admin.llmConfig.apiUrl", "admin", "API URL", "API URL");
                createTranslationKeyIfNotExists("admin.llmConfig.apiKey", "admin", "API Key", "API Key");
                createTranslationKeyIfNotExists("admin.llmConfig.status", "admin", "상태", "상태");
                createTranslationKeyIfNotExists("admin.llmConfig.default", "admin", "기본", "기본");
                createTranslationKeyIfNotExists("admin.llmConfig.actions", "admin", "작업", "작업");
                createTranslationKeyIfNotExists("admin.llmConfig.active", "admin", "활성", "활성");
                createTranslationKeyIfNotExists("admin.llmConfig.inactive", "admin", "비활성", "비활성");
                createTranslationKeyIfNotExists("admin.llmConfig.activate", "admin", "활성화", "활성화");
                createTranslationKeyIfNotExists("admin.llmConfig.deactivate", "admin", "비활성화", "비활성화");
                createTranslationKeyIfNotExists("admin.llmConfig.testConnection", "admin", "연결 테스트", "연결 테스트");
                createTranslationKeyIfNotExists("admin.llmConfig.setAsDefault", "admin", "기본 설정으로 지정", "기본 설정으로 지정");
                createTranslationKeyIfNotExists("admin.llmConfig.noConfigs", "admin", "LLM 설정이 없습니다", "LLM 설정이 없습니다");

                // LLM 설정 메시지
                createTranslationKeyIfNotExists("admin.llmConfig.message.allFieldsRequired", "admin", "모든 필수 필드 입력",
                                "모든 필수 필드를 입력해주세요");
                createTranslationKeyIfNotExists("admin.llmConfig.message.connectionSuccess", "admin", "연결 성공",
                                "연결 테스트 성공!");
                createTranslationKeyIfNotExists("admin.llmConfig.message.connectionFailed", "admin", "연결 실패",
                                "연결 테스트 실패");
                createTranslationKeyIfNotExists("admin.llmConfig.message.invalidJson", "admin", "유효하지 않은 JSON",
                                "템플릿이 유효한 JSON 형식이 아닙니다");
                createTranslationKeyIfNotExists("admin.llmConfig.message.confirmDelete", "admin", "삭제 확인",
                                "정말 이 LLM 설정을 삭제하시겠습니까?");
                createTranslationKeyIfNotExists("admin.llmConfig.message.deleted", "admin", "삭제 완료", "LLM 설정이 삭제되었습니다");
                createTranslationKeyIfNotExists("admin.llmConfig.message.updated", "admin", "수정 완료", "LLM 설정이 수정되었습니다");
                createTranslationKeyIfNotExists("admin.llmConfig.message.created", "admin", "생성 완료", "LLM 설정이 생성되었습니다");
                createTranslationKeyIfNotExists("admin.llmConfig.message.defaultChanged", "admin", "기본 설정 변경",
                                "기본 LLM 설정이 변경되었습니다");
                createTranslationKeyIfNotExists("admin.llmConfig.message.activeChanged", "admin", "활성 상태 변경",
                                "LLM 설정 활성 상태가 변경되었습니다");

                // LLM 탭 및 섹션
                createTranslationKeyIfNotExists("admin.llmConfig.tab.configList", "admin", "LLM 설정 목록 탭", "LLM 설정 목록");
                createTranslationKeyIfNotExists("admin.llmConfig.tab.template", "admin", "기본 템플릿 탭", "기본 템플릿");
                createTranslationKeyIfNotExists("admin.llmConfig.template.title", "admin", "템플릿 제목",
                                "테스트 케이스 생성 기본 템플릿");
                createTranslationKeyIfNotExists("admin.llmConfig.template.description1", "admin", "템플릿 설명1",
                                "이 템플릿은 새로운 LLM 설정 생성 시 자동으로 설정되며, AI에게 테스트 케이스 생성을 요청할 때 참고 형식으로 사용됩니다.");
                createTranslationKeyIfNotExists("admin.llmConfig.template.description2", "admin", "템플릿 설명2",
                                "각 LLM 설정별로 이 템플릿을 수정하여 사용할 수 있습니다.");
                createTranslationKeyIfNotExists("admin.llmConfig.template.label", "admin", "기본 템플릿 JSON 라벨",
                                "기본 템플릿 JSON:");
                createTranslationKeyIfNotExists("admin.llmConfig.template.download", "admin", "템플릿 다운로드", "다운로드");
                createTranslationKeyIfNotExists("admin.llmConfig.template.reset", "admin", "템플릿 초기화", "초기화");
                createTranslationKeyIfNotExists("admin.llmConfig.template.downloadJson", "admin", "JSON 다운로드",
                                "JSON 다운로드");
                createTranslationKeyIfNotExists("admin.llmConfig.template.usageTitle", "admin", "사용 방법 제목", "사용 방법:");
                createTranslationKeyIfNotExists("admin.llmConfig.template.usage1", "admin", "사용 방법 1",
                                "1. LLM 설정 생성 시 이 템플릿이 자동으로 적용됩니다.");
                createTranslationKeyIfNotExists("admin.llmConfig.template.usage2", "admin", "사용 방법 2",
                                "2. 각 LLM 설정에서 개별적으로 템플릿을 수정할 수 있습니다.");
                createTranslationKeyIfNotExists("admin.llmConfig.template.usage3", "admin", "사용 방법 3",
                                "3. RAG 채팅에서 \"테스트 케이스\"를 포함한 요청 시 자동으로 템플릿을 참고합니다.");

                // 공통 문서 등록 요청 키들
                createTranslationKeyIfNotExists("admin.globalDoc.requests.title", "admin", "공통 문서 등록 요청 제목",
                                "📨 공통 문서 등록 요청");
                createTranslationKeyIfNotExists("admin.globalDoc.requests.empty", "admin", "요청 없음 메시지",
                                "대기 중인 요청이 없습니다.");
                createTranslationKeyIfNotExists("admin.globalDoc.requests.requestedBy", "admin", "요청자 컬럼", "요청자");
                createTranslationKeyIfNotExists("admin.globalDoc.requests.message", "admin", "요청 메모 컬럼", "요청 메모");
                createTranslationKeyIfNotExists("admin.globalDoc.requests.requestedAt", "admin", "요청 일시 컬럼", "요청 일시");
                createTranslationKeyIfNotExists("admin.globalDoc.requests.approve", "admin", "승인 버튼", "승인");
                createTranslationKeyIfNotExists("admin.globalDoc.requests.reject", "admin", "거절 버튼", "거절");

                // 공통 RAG 문서 관리
                createTranslationKeyIfNotExists("admin.globalDoc.title", "admin", "공통 RAG 문서 관리", "공통 RAG 문서 관리");
                createTranslationKeyIfNotExists("admin.globalDoc.description", "admin", "공통 문서 설명",
                                "모든 프로젝트에서 자동으로 참조되는 글로벌 지식 베이스를 관리합니다. (관리자 전용)");
                createTranslationKeyIfNotExists("admin.globalDoc.uploadFile", "admin", "파일 업로드", "파일 업로드");
                createTranslationKeyIfNotExists("admin.globalDoc.fileName", "admin", "파일명", "파일명");
                createTranslationKeyIfNotExists("admin.globalDoc.fileSize", "admin", "파일 크기", "파일 크기");
                createTranslationKeyIfNotExists("admin.globalDoc.analysisStatus", "admin", "분석 상태", "분석 상태");
                createTranslationKeyIfNotExists("admin.globalDoc.parser", "admin", "파서", "파서");
                createTranslationKeyIfNotExists("admin.globalDoc.embeddingStatus", "admin", "임베딩 상태", "임베딩 상태");
                createTranslationKeyIfNotExists("admin.globalDoc.chunkCount", "admin", "청크 수", "청크 수");
                createTranslationKeyIfNotExists("admin.globalDoc.uploader", "admin", "업로더", "업로더");
                createTranslationKeyIfNotExists("admin.globalDoc.uploadDate", "admin", "업로드 날짜", "업로드 날짜");
                createTranslationKeyIfNotExists("admin.globalDoc.noDocuments", "admin", "문서 없음",
                                "아직 공통 문서가 없습니다. 첫 번째 문서를 업로드해보세요!");
                createTranslationKeyIfNotExists("admin.globalDoc.parserUnknown", "admin", "파서 알 수 없음", "알 수 없음");
                createTranslationKeyIfNotExists("admin.globalDoc.parserAuto", "admin", "파서 자동", "자동 선택");

                // 공통 문서 정보 섹션
                createTranslationKeyIfNotExists("admin.globalDoc.info.whatIsTitle", "admin", "공통 문서란 제목", "📚 공통 문서란?");
                createTranslationKeyIfNotExists("admin.globalDoc.info.whatIsDescription", "admin", "공통 문서 설명",
                                "모든 프로젝트에서 자동으로 참조되는 글로벌 지식 베이스입니다. 특수 프로젝트 ID({0})로 관리됩니다.");
                createTranslationKeyIfNotExists("admin.globalDoc.info.examplesTitle", "admin", "활용 예시 제목", "💡 활용 예시:");
                createTranslationKeyIfNotExists("admin.globalDoc.info.example1", "admin", "활용 예시 1",
                                "회사 공통 코딩 컨벤션 및 개발 가이드라인");
                createTranslationKeyIfNotExists("admin.globalDoc.info.example2", "admin", "활용 예시 2",
                                "테스트 작성 표준 및 품질 관리 문서");
                createTranslationKeyIfNotExists("admin.globalDoc.info.example3", "admin", "활용 예시 3",
                                "프로젝트 공통 참조 문서 (API 명세, 아키텍처 가이드 등)");
                createTranslationKeyIfNotExists("admin.globalDoc.info.example4", "admin", "활용 예시 4",
                                "조직 전체의 모범 사례 및 학습 자료");
                createTranslationKeyIfNotExists("admin.globalDoc.info.techSpecsTitle", "admin", "기술 사양 제목",
                                "⚙️ 기술 사양:");
                createTranslationKeyIfNotExists("admin.globalDoc.info.supportedFormats", "admin", "지원 형식",
                                "지원 형식: PDF, DOCX, DOC, TXT (최대 50MB)");
                createTranslationKeyIfNotExists("admin.globalDoc.info.autoSearch", "admin", "자동 검색",
                                "모든 프로젝트의 RAG Q&A에서 자동 검색됨");
                createTranslationKeyIfNotExists("admin.globalDoc.info.adminOnly", "admin", "관리자 전용",
                                "관리자만 업로드/삭제 가능 (ADMIN 권한 필요)");

                // 문서 상태
                createTranslationKeyIfNotExists("admin.globalDoc.status.completed", "admin", "완료", "완료");
                createTranslationKeyIfNotExists("admin.globalDoc.status.pending", "admin", "대기", "대기");
                createTranslationKeyIfNotExists("admin.globalDoc.status.failed", "admin", "실패", "실패");

                // 문서 작업 버튼
                createTranslationKeyIfNotExists("admin.globalDoc.action.preview", "admin", "PDF 미리보기", "PDF 미리보기");
                createTranslationKeyIfNotExists("admin.globalDoc.action.viewChunks", "admin", "청크 보기", "청크 보기");
                createTranslationKeyIfNotExists("admin.globalDoc.action.download", "admin", "다운로드", "다운로드");
                createTranslationKeyIfNotExists("admin.globalDoc.action.analyze", "admin", "문서 분석", "문서 분석");
                createTranslationKeyIfNotExists("admin.globalDoc.action.generateEmbedding", "admin", "임베딩 생성",
                                "임베딩 생성");
                createTranslationKeyIfNotExists("admin.globalDoc.action.generateEmbeddings", "admin", "임베딩 생성",
                                "임베딩 생성");

                // 문서 메시지
                createTranslationKeyIfNotExists("admin.globalDoc.message.uploadSuccess", "admin", "업로드 성공",
                                "공통 문서 \"{0}\"이 업로드되었습니다");
                createTranslationKeyIfNotExists("admin.globalDoc.message.uploadFailed", "admin", "업로드 실패",
                                "공통 문서 업로드 실패");
                createTranslationKeyIfNotExists("admin.globalDoc.message.deleteSuccess", "admin", "삭제 성공",
                                "공통 문서 \"{0}\"이 삭제되었습니다");
                createTranslationKeyIfNotExists("admin.globalDoc.message.deleteFailed", "admin", "삭제 실패",
                                "공통 문서 삭제 실패");
                createTranslationKeyIfNotExists("admin.globalDoc.message.confirmDelete", "admin", "삭제 확인",
                                "공통 문서 \"{0}\"을 삭제하시겠습니까?");
                createTranslationKeyIfNotExists("admin.globalDoc.message.confirmAnalyze", "admin", "분석 확인",
                                "문서 \"{0}\"을 분석하시겠습니까?");
                createTranslationKeyIfNotExists("admin.globalDoc.message.confirmEmbeddings", "admin", "임베딩 확인",
                                "문서 \"{0}\"의 임베딩을 생성하시겠습니까?");
                createTranslationKeyIfNotExists("admin.globalDoc.message.analyzeStarted", "admin", "분석 시작",
                                "문서 \"{0}\" 분석 시작됨");
                createTranslationKeyIfNotExists("admin.globalDoc.message.embeddingsStarted", "admin", "임베딩 시작",
                                "문서 \"{0}\" 임베딩 생성 시작됨");
                createTranslationKeyIfNotExists("admin.globalDoc.message.analyzeFailed", "admin", "분석 실패", "분석 시작 실패");
                createTranslationKeyIfNotExists("admin.globalDoc.message.embeddingsFailed", "admin", "임베딩 실패",
                                "임베딩 생성 실패");
                createTranslationKeyIfNotExists("admin.globalDoc.message.downloadSuccess", "admin", "다운로드 성공",
                                "문서 \"{0}\" 다운로드 완료");
                createTranslationKeyIfNotExists("admin.globalDoc.message.downloadFailed", "admin", "다운로드 실패",
                                "다운로드 실패");
                createTranslationKeyIfNotExists("admin.globalDoc.message.viewChunksFailed", "admin", "청크 조회 실패",
                                "청크 조회 실패");
                createTranslationKeyIfNotExists("admin.globalDoc.message.previewFailed", "admin", "미리보기 실패", "미리보기 실패");
                createTranslationKeyIfNotExists("admin.globalDoc.message.pdfOnly", "admin", "PDF만 가능",
                                "PDF 파일만 미리보기가 가능합니다.");
                createTranslationKeyIfNotExists("admin.globalDoc.message.supportedFormats", "admin", "지원 형식",
                                "지원되는 파일 형식: PDF, DOCX, DOC, TXT");
                createTranslationKeyIfNotExists("admin.globalDoc.message.fileSizeLimit", "admin", "파일 크기 제한",
                                "파일 크기는 50MB를 초과할 수 없습니다");
                createTranslationKeyIfNotExists("admin.globalDoc.message.unknownError", "admin", "알 수 없는 오류",
                                "알 수 없는 오류");

                // 청크 다이얼로그
                createTranslationKeyIfNotExists("admin.globalDoc.chunks.title", "admin", "문서 청크 제목", "문서 청크");
                createTranslationKeyIfNotExists("admin.globalDoc.chunks.chunkNumber", "admin", "청크 번호", "청크 #{0}");
                createTranslationKeyIfNotExists("admin.globalDoc.noChunks", "admin", "청크 없음", "청크가 없습니다.");

                // PDF 미리보기 다이얼로그
                createTranslationKeyIfNotExists("admin.globalDoc.preview.title", "admin", "PDF 미리보기 제목", "PDF 미리보기");
                createTranslationKeyIfNotExists("admin.globalDoc.preview.loading", "admin", "미리보기 로딩",
                                "미리보기를 불러올 수 없습니다.");
        }

        private void createTranslationKeyIfNotExists(String keyName, String category, String description,
                        String defaultValue) {
                Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
                if (existingKey.isEmpty()) {
                        TranslationKey translationKey = new TranslationKey(keyName, category, description,
                                        defaultValue);
                        translationKeyRepository.save(translationKey);
                        log.debug("번역 키 생성: {}", keyName);
                } else {
                        log.debug("번역 키 이미 존재: {}", keyName);
                }
        }
}
