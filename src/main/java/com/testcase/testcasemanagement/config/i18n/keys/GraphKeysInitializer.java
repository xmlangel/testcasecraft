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
