// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/GraphKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 그래프 뷰 / 그래프 테스트 케이스 편집기 번역 키 초기화 (AgensGraph 기능, v1.1.1). */
@Slf4j
@Component
@RequiredArgsConstructor
public class GraphKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    // 진입점/공통
    createKey("graph.nav", "그래프 뷰 진입 아이콘 툴팁", "그래프 뷰");
    createKey("graph.title", "그래프 뷰 페이지 제목", "그래프 뷰");
    createKey("graph.selectProject", "프로젝트 미선택 안내", "그래프를 보려면 먼저 프로젝트를 선택하세요.");
    createKey("graph.dbUnavailable", "그래프 DB 연결 불가 경고", "그래프 데이터베이스에 연결할 수 없습니다. 관리자에게 문의하세요.");
    createKey("graph.empty", "그래프 데이터 없음 안내", "표시할 그래프 데이터가 없습니다. 동기화가 아직 실행되지 않았을 수 있습니다.");
    createKey("graph.refresh", "조회 버튼", "조회");

    // 탭
    createKey("graph.tab.structure", "구조 그래프 탭", "구조 그래프");
    createKey("graph.tab.failures", "오류 클러스터 탭", "오류 클러스터");
    createKey("graph.tab.neighborhood", "케이스 이웃 탭", "케이스 이웃");

    // 레이아웃/조회 조건
    createKey("graph.layout.force", "포스 레이아웃 토글", "포스");
    createKey("graph.layout.hierarchy", "계층 레이아웃 토글", "계층");
    createKey("graph.caseIdLabel", "케이스 ID 입력 라벨", "테스트케이스 ID");
    createKey("graph.depth", "이웃 탐색 깊이 라벨", "깊이");

    // 상세 패널
    createKey("graph.detail.empty", "노드 미선택 안내", "노드를 클릭하면 상세 정보가 표시됩니다.");

    // 그래프 TC 편집기
    createKey("graph.editor.title", "그래프 TC 편집기 제목", "그래프 테스트 케이스 편집");
    createKey("graph.editor.hint", "편집기 SSOT 안내", "저장하면 그래프가 원본이 되고, 기존 스텝 표는 읽기 전용 미러로 자동 갱신됩니다.");
    createKey("graph.editor.noProject", "projectId 누락 오류", "projectId 파라미터가 필요합니다.");
    createKey("graph.editor.action", "수행 절차 입력 라벨", "수행 절차");
    createKey("graph.editor.expected", "기대 결과 입력 라벨", "기대 결과");
    createKey("graph.editor.addStep", "스텝 추가 버튼", "스텝 추가");
    createKey("graph.editor.save", "저장 버튼", "저장");
    createKey("graph.editor.saved", "저장 완료 표시", "저장됨");

    // 프로젝트 탭 편입 (UX 통합) + 빈 상태 동기화 버튼
    createKey("projectHeader.tabs.graph", "프로젝트 그래프 탭", "그래프");
    createKey("graph.syncNow", "빈 상태 동기화 버튼", "지금 동기화");
    createKey("graph.syncing", "동기화 진행 표시", "동기화 중…");

    // 필터 바 + 레이아웃 확장
    createKey("graph.layout.label", "레이아웃 셀렉트 라벨", "레이아웃");
    createKey("graph.layout.concentric", "동심원 레이아웃", "동심원 (허브 중심)");
    createKey("graph.layout.circle", "원형 레이아웃", "원형");
    createKey("graph.layout.grid", "격자 레이아웃", "격자");
    createKey("graph.filter.folder", "유형 필터: 폴더", "폴더");
    createKey("graph.filter.case", "유형 필터: 케이스", "케이스");
    createKey("graph.filter.plan", "유형 필터: 플랜", "플랜");
    createKey("graph.filter.execution", "유형 필터: 실행", "실행");
    createKey("graph.filter.result", "유형 필터: 결과", "결과");
    createKey("graph.filter.scope", "플랜/실행 스코프 셀렉트", "플랜/실행 선택");
    createKey("graph.filter.all", "스코프 전체", "전체");
    createKey("graph.filter.planPrefix", "스코프 플랜 접두", "[플랜] ");
    createKey("graph.filter.executionPrefix", "스코프 실행 접두", "[실행] ");

    // 관계 편집 + 분기 편집 (v1.1.1)
    createKey("graph.relation.start", "관계 시작 버튼", "이 케이스에서 관계 시작");
    createKey("graph.relation.pickTarget", "대상 선택 안내", "대상 케이스 노드를 클릭하세요");
    createKey("graph.relation.cancel", "관계 추가 취소", "관계 추가 취소");
    createKey("graph.relation.typeTitle", "관계 유형 다이얼로그 제목", "관계 유형 선택");
    createKey("graph.relation.type", "관계 유형 라벨", "유형");
    createKey("graph.relation.dependsOn", "DEPENDS_ON 설명", "선행 필요");
    createKey("graph.relation.relatesTo", "RELATES_TO 설명", "연관");
    createKey("graph.relation.blocks", "BLOCKS 설명", "차단함");
    createKey("graph.relation.save", "관계 생성 버튼", "관계 생성");
    createKey("graph.relation.cancelBtn", "다이얼로그 취소", "취소");
    createKey("graph.relation.delete", "관계 삭제 버튼", "이 관계 삭제");
    createKey("graph.relation.autoEdge", "자동 간선 안내", "동기화로 생성된 관계는 삭제할 수 없습니다.");
    createKey("graph.editor.addBranch", "분기 추가 버튼", "분기 추가");
    createKey("graph.editor.branchOf", "분기 소속 표기", "스텝");
    createKey("graph.editor.branches", "분기 목록 제목", "분기");
    createKey("graph.editor.branchLabel", "분기 조건 라벨", "조건 라벨");
    createKey("graph.editor.branchTo", "분기 대상 라벨", "이동할 스텝");
    createKey("graph.editor.stepN", "스텝 번호 표기", "스텝");
  }

  private void createKey(String keyName, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      translationKeyRepository.save(
          new TranslationKey(keyName, "graph", description, defaultValue));
      log.debug("번역 키 생성: {}", keyName);
    }
  }
}
