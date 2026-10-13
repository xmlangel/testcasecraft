// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/RequirementKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 요구사항 관리(문서·요구사항·커버리지·리포트) 화면 번역 키 초기화. */
@Slf4j
@Component
@RequiredArgsConstructor
public class RequirementKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    createKey("projectHeader.tabs.requirements", "요구사항 관리 · 요구사항", "요구사항");
    createKey("requirement.add", "요구사항 관리 · 요구사항 추가", "요구사항 추가");
    createKey("requirement.coverage.COVERED", "요구사항 관리 · 충족", "충족");
    createKey("requirement.coverage.EXCLUDED", "요구사항 관리 · 제외", "제외");
    createKey("requirement.coverage.PARTIAL", "요구사항 관리 · 부분", "부분");
    createKey("requirement.coverage.UNCOVERED", "요구사항 관리 · 미연결", "미연결");
    createKey("requirement.coverage.gapsOnly", "요구사항 관리 · 미연결·부분만 보기", "미연결·부분만 보기");
    createKey("requirement.coverage.rate", "요구사항 관리 · 커버리지", "커버리지");
    createKey("requirement.coverage.testable", "요구사항 관리 · 대상 요구사항", "대상 요구사항");
    createKey("requirement.edit", "요구사항 관리 · 요구사항 수정", "요구사항 수정");
    createKey("requirement.empty", "요구사항 관리 · 요구사항이 없습니다.", "요구사항이 없습니다.");
    createKey("requirement.field.coverage", "요구사항 관리 · 커버리지", "커버리지");
    createKey("requirement.field.docId", "요구사항 관리 · 요구사항 ID", "요구사항 ID");
    createKey(
        "requirement.field.docIdAutoHint", "요구사항 관리 · ID 자동 번호 안내", "비워 두면 다음 번호가 자동으로 붙습니다.");
    createKey("requirement.field.expectedCoverage", "요구사항 관리 · 필요 TC 수", "필요 TC 수");
    createKey("requirement.field.linked", "요구사항 관리 · 연결 TC", "연결 TC");
    createKey("requirement.field.noParent", "요구사항 관리 · (최상위)", "(최상위)");
    createKey("requirement.field.parentSpec", "요구사항 관리 · 상위 문서", "상위 문서");
    createKey("requirement.field.scope", "요구사항 관리 · 범위·설명", "범위·설명");
    createKey("requirement.field.spec", "요구사항 관리 · 요구사항 문서", "요구사항 문서");
    createKey("requirement.field.specDocId", "요구사항 관리 · 문서 ID", "문서 ID");
    createKey("requirement.field.status", "요구사항 관리 · 상태", "상태");
    createKey("requirement.field.title", "요구사항 관리 · 제목", "제목");
    createKey("requirement.field.type", "요구사항 관리 · 유형", "유형");
    createKey("requirement.link", "요구사항 관리 · 연결", "연결");
    createKey("requirement.linkedCases", "요구사항 관리 · 연결된 테스트케이스", "연결된 테스트케이스");
    createKey("requirement.noLinkedCases", "요구사항 관리 · 연결된 테스트케이스가 없습니다.", "연결된 테스트케이스가 없습니다.");
    createKey("requirement.report.cases", "요구사항 관리 · 테스트케이스 결과", "테스트케이스 결과");
    createKey("requirement.report.execution", "요구사항 관리 · 테스트실행", "테스트실행");
    createKey("requirement.report.latestAll", "요구사항 관리 · 플랜 전체 (TC별 최신 결과)", "플랜 전체 (TC별 최신 결과)");
    createKey(
        "requirement.report.pickPlan", "요구사항 관리 · 리포트를 볼 테스트플랜을 고르세요.", "리포트를 볼 테스트플랜을 고르세요.");
    createKey("requirement.report.plan", "요구사항 관리 · 테스트플랜", "테스트플랜");
    createKey("requirement.report.verdict", "요구사항 관리 · 판정", "판정");
    createKey("requirement.searchCases", "요구사항 관리 · 테스트케이스 검색", "테스트케이스 검색");
    createKey("requirement.spec.add", "요구사항 관리 · 요구사항 문서 추가", "요구사항 문서 추가");
    createKey("requirement.spec.all", "요구사항 관리 · 전체", "전체");
    createKey(
        "requirement.spec.confirmDelete",
        "요구사항 관리 · 이 문서와 하위 문서, 그 안의 요구사항과 TC 연결을",
        "이 문서와 하위 문서, 그 안의 요구사항과 TC 연결을 모두 삭제합니다. 테스트케이스는 지우지 않습니다. 계속할까요?");
    createKey("requirement.spec.edit", "요구사항 관리 · 요구사항 문서 수정", "요구사항 문서 수정");
    createKey("requirement.spec.empty", "요구사항 관리 · 요구사항 문서를 먼저 추가하세요.", "요구사항 문서를 먼저 추가하세요.");
    createKey("requirement.spec.title", "요구사항 관리 · 요구사항 문서", "요구사항 문서");
    createKey("requirement.status.DRAFT", "요구사항 관리 · 초안", "초안");
    createKey("requirement.status.FINISH", "요구사항 관리 · 작성 완료", "작성 완료");
    createKey("requirement.status.IMPLEMENTED", "요구사항 관리 · 구현됨", "구현됨");
    createKey("requirement.status.NOT_TESTABLE", "요구사항 관리 · 테스트 불가", "테스트 불가");
    createKey("requirement.status.OBSOLETE", "요구사항 관리 · 폐기", "폐기");
    createKey("requirement.status.REVIEW", "요구사항 관리 · 검토 중", "검토 중");
    createKey("requirement.status.REWORK", "요구사항 관리 · 재작업", "재작업");
    createKey("requirement.status.VALID", "요구사항 관리 · 유효", "유효");
    createKey("requirement.testCase.none", "요구사항 관리 · 연결된 요구사항이 없습니다.", "연결된 요구사항이 없습니다.");
    createKey("requirement.testCase.placeholder", "요구사항 관리 · 요구사항 검색", "요구사항 검색");
    createKey("requirement.testCase.title", "요구사항 관리 · 연결된 요구사항", "연결된 요구사항");
    createKey("requirement.type.CONSTRAINT", "요구사항 관리 · 제약", "제약");
    createKey("requirement.type.FEATURE", "요구사항 관리 · 기능", "기능");
    createKey("requirement.type.INFORMATIONAL", "요구사항 관리 · 정보", "정보");
    createKey("requirement.type.NON_FUNCTIONAL", "요구사항 관리 · 비기능", "비기능");
    createKey("requirement.type.SYSTEM_FUNCTION", "요구사항 관리 · 시스템 기능", "시스템 기능");
    createKey("requirement.type.USER_INTERFACE", "요구사항 관리 · 사용자 인터페이스", "사용자 인터페이스");
    createKey("requirement.type.USE_CASE", "요구사항 관리 · 유스케이스", "유스케이스");
    createKey("requirement.unlink", "요구사항 관리 · 연결 해제", "연결 해제");
    createKey("requirement.verdict.BLOCKED", "요구사항 관리 · 차단", "차단");
    createKey("requirement.verdict.FAIL", "요구사항 관리 · 실패", "실패");
    createKey("requirement.verdict.NOT_IN_PLAN", "요구사항 관리 · 플랜에 없음", "플랜에 없음");
    createKey("requirement.verdict.NOT_RUN", "요구사항 관리 · 미실행", "미실행");
    createKey("requirement.verdict.PASS", "요구사항 관리 · 통과", "통과");
    createKey("requirement.view.coverage", "요구사항 관리 · 커버리지", "커버리지");
    createKey("requirement.view.list", "요구사항 관리 · 요구사항", "요구사항");
    createKey("requirement.view.report", "요구사항 관리 · 리포트", "리포트");
    createKey("requirement.clickToView", "요구사항 관리 · 눌러서 작성 내용 보기", "눌러서 작성 내용 보기");
    createKey("requirement.noScope", "요구사항 관리 · 작성된 범위·설명이 없습니다.", "작성된 범위·설명이 없습니다.");
    createKey("requirement.openRequirement", "요구사항 관리 · 요구사항 화면으로 이동", "요구사항 화면으로 이동");
    createKey("requirement.openTestCase", "요구사항 관리 · 테스트케이스 화면으로 이동", "테스트케이스 화면으로 이동");
    createKey("requirement.collapse", "요구사항 관리 · 접기", "접기");
    createKey("requirement.filterLinked", "요구사항 관리 · 연결된 TC 에서 찾기", "연결된 TC 에서 찾기");
    createKey("requirement.next", "요구사항 관리 · 다음", "다음");
    createKey("requirement.noMatch", "요구사항 관리 · 검색 결과가 없습니다.", "검색 결과가 없습니다.");
    createKey("requirement.prev", "요구사항 관리 · 이전", "이전");
    createKey("requirement.coverage.chart.bySpec", "요구사항 관리 · 요구사항 문서별 커버리지", "요구사항 문서별 커버리지");
    createKey("requirement.coverage.chart.overall", "요구사항 관리 · 전체 커버리지", "전체 커버리지");
    createKey("requirement.relation.child", "요구사항 관리 · 하위 요구사항", "하위 요구사항");
    createKey("requirement.relation.dependedBy", "요구사항 관리 · 이 요구사항에 의존", "이 요구사항에 의존");
    createKey("requirement.relation.dependsOn", "요구사항 관리 · 의존 대상", "의존 대상");
    createKey(
        "requirement.relation.none", "요구사항 관리 · 다른 요구사항과 맺은 관계가 없습니다.", "다른 요구사항과 맺은 관계가 없습니다.");
    createKey("requirement.relation.parent", "요구사항 관리 · 상위 요구사항", "상위 요구사항");
    createKey("requirement.relation.related", "요구사항 관리 · 관련", "관련");
    createKey("requirement.relation.remove", "요구사항 관리 · 관계 해제", "관계 해제");
    createKey("requirement.relation.title", "요구사항 관리 · 관계", "관계");
    createKey("requirement.network.betweenness", "요구사항 관리 · 매개 중심성", "매개 중심성");
    createKey("requirement.network.degree", "요구사항 관리 · 연결 수", "연결 수");
    createKey(
        "requirement.network.empty",
        "요구사항 관리 · 선으로 이어진 요구사항이 없습니다. TC 를 연결하거나",
        "선으로 이어진 요구사항이 없습니다. TC 를 연결하거나 관계를 걸면 여기에 나타납니다.");
    createKey("requirement.network.fit", "요구사항 관리 · 화면 맞춤", "화면 맞춤");
    createKey("requirement.network.hop1", "요구사항 관리 · 1단계 이웃", "1단계 이웃");
    createKey("requirement.network.hop2", "요구사항 관리 · 2단계 이웃", "2단계 이웃");
    createKey("requirement.network.hops", "요구사항 관리 · 강조 범위", "강조 범위");
    createKey("requirement.network.isolated", "요구사항 관리 · 고립된 요구사항", "고립된 요구사항");
    createKey(
        "requirement.network.isolatedHint",
        "요구사항 관리 · TC 도 관계도 없는 요구사항입니다. 노드를 누르면 여",
        "TC 도 관계도 없는 요구사항입니다. 노드를 누르면 여기에 상세가 열립니다.");
    createKey(
        "requirement.network.isolatedSharedHint",
        "요구사항 관리 · 다른 요구사항과 함께 쓰는 TC 가 없는 요구사항입니다",
        "다른 요구사항과 함께 쓰는 TC 가 없는 요구사항입니다.");
    createKey(
        "requirement.network.legend.shared",
        "요구사항 관리 · 선 두께·숫자 = 함께 쓰는 TC 수",
        "선 두께·숫자 = 함께 쓰는 TC 수");
    createKey("requirement.network.legend.testcase", "요구사항 관리 · ■ 테스트케이스", "■ 테스트케이스");
    createKey("requirement.network.mode.network", "요구사항 관리 · 요구사항·TC 네트워크", "요구사항·TC 네트워크");
    createKey("requirement.network.mode.shared", "요구사항 관리 · TC 공유 네트워크", "TC 공유 네트워크");
    createKey("requirement.network.noResult", "요구사항 관리 · 표시 안 함", "표시 안 함");
    createKey("requirement.network.resultPlan", "요구사항 관리 · TC 결과 색(플랜)", "TC 결과 색(플랜)");
    createKey("requirement.network.showTestCases", "요구사항 관리 · TC 노드 표시", "TC 노드 표시");
    createKey("requirement.network.sizeBy", "요구사항 관리 · 노드 크기", "노드 크기");
    createKey("requirement.view.network", "요구사항 관리 · 관계도", "관계도");
  }

  private void createKey(String keyName, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      translationKeyRepository.save(
          new TranslationKey(keyName, "requirement", description, defaultValue));
      log.debug("번역 키 생성: {}", keyName);
    }
  }
}
