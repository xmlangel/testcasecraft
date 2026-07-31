// src/main/java/com/testcase/testcasemanagement/repository/TestCaseRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCase;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TestCaseRepository extends JpaRepository<TestCase, String> {

  // parentId가 같은 테스트케이스를 displayOrder 오름차순으로 조회
  @Query("SELECT t FROM TestCase t WHERE t.parentId = :parentId ORDER BY t.displayOrder ASC")
  List<TestCase> findByParentIdOrderByDisplayOrder(@Param("parentId") String parentId);

  // 프로젝트 + 부모(널=루트) 스코프 형제를 displayOrder 오름차순으로 조회.
  // parentId=null(루트)은 모든 프로젝트의 루트 노드를 가로지르므로, 트리 이동/정렬 시 반드시
  // projectId 로 한정해야 한다. 또 JPQL 의 `t.parentId = :parentId` 는 :parentId 가 null 이면
  // UNKNOWN 이 되어 0건을 반환하므로 (:parentId IS NULL AND t.parentId IS NULL) 분기를 명시한다.
  @Query(
      "SELECT t FROM TestCase t WHERE t.project.id = :projectId "
          + "AND ((:parentId IS NULL AND t.parentId IS NULL) OR t.parentId = :parentId) "
          + "ORDER BY t.displayOrder ASC")
  List<TestCase> findByProjectIdAndParentIdOrderByDisplayOrder(
      @Param("projectId") String projectId, @Param("parentId") String parentId);

  // parentId가 같고 displayOrder가 startOrder 이상인 항목의 displayOrder를 +1 (정렬/삽입시 사용)
  @Modifying
  @Query(
      "UPDATE TestCase t SET t.displayOrder = t.displayOrder + 1 "
          + "WHERE t.parentId = :parentId AND t.displayOrder >= :startOrder")
  void incrementDisplayOrders(
      @Param("parentId") String parentId, @Param("startOrder") Integer startOrder);

  // parentId가 같은 모든 테스트케이스 조회 (정렬 없이)
  @Query("SELECT t FROM TestCase t WHERE t.parentId = :parentId")
  List<TestCase> findByParentId(@Param("parentId") String parentId);

  // 특정 프로젝트의 모든 테스트케이스를 계층/정렬 포함 조회
  @Query(
      "SELECT t FROM TestCase t WHERE t.project.id = :projectId ORDER BY t.parentId NULLS FIRST,"
          + " t.displayOrder")
  List<TestCase> findAllByProjectIdWithHierarchy(@Param("projectId") String projectId);

  // 모든 테스트케이스를 steps와 함께 조회 (중복 제거)
  @Query("SELECT DISTINCT t FROM TestCase t LEFT JOIN FETCH t.steps")
  List<TestCase> findAllWithSteps();

  // parentId가 같은 테스트케이스 중 가장 큰 displayOrder 반환 (자동 할당용)
  @Query("SELECT MAX(t.displayOrder) FROM TestCase t WHERE t.parentId = :parentId")
  Integer findMaxDisplayOrderByParentId(@Param("parentId") String parentId);

  @Query(
      "SELECT t FROM TestCase t LEFT JOIN FETCH t.project LEFT JOIN FETCH t.steps WHERE t.id = :id")
  Optional<TestCase> findByIdWithSteps(@Param("id") String id);

  @Query(
      "SELECT DISTINCT t FROM TestCase t LEFT JOIN FETCH t.project LEFT JOIN FETCH t.steps WHERE"
          + " t.project.id = :projectId ORDER BY t.parentId NULLS FIRST, t.displayOrder")
  List<TestCase> findAllByProjectIdWithSteps(@Param("projectId") String projectId);

  long countByProjectId(String projectId);

  @Query(
      "SELECT t.project.id, COUNT(t) FROM TestCase t WHERE t.project.id IN :projectIds GROUP BY"
          + " t.project.id")
  List<Object[]> countByProjectIds(@Param("projectIds") List<String> projectIds);

  // 특정 프로젝트의 모든 테스트케이스 조회 (태그 목록 조회용)
  @Query("SELECT t FROM TestCase t WHERE t.project.id = :projectId")
  List<TestCase> findByProjectId(@Param("projectId") String projectId);

  /** 테스트케이스가 속한 프로젝트 ID (객체수준 인가용). */
  @Query("SELECT t.project.id FROM TestCase t WHERE t.id = :testCaseId")
  Optional<String> findProjectIdById(@Param("testCaseId") String testCaseId);

  @Query("SELECT t FROM TestCase t WHERE t.project.id = :projectId AND t.type = :type")
  List<TestCase> findByProjectIdAndType(String projectId, String type);

  Optional<TestCase> findByParentIdAndDisplayOrder(String parentId, Integer displayOrder);

  @Modifying
  @Query("DELETE FROM TestCase t WHERE t.project.id = :projectId")
  void deleteByProjectId(@Param("projectId") String projectId);

  //  프로젝트별 최대 순차 ID 조회 (자동 생성용)
  @Query("SELECT MAX(t.sequentialId) FROM TestCase t WHERE t.project.id = :projectId")
  Integer findMaxSequentialIdByProjectId(@Param("projectId") String projectId);

  //  Display ID 마이그레이션을 위한 메소드들
  List<TestCase> findByDisplayIdIsNull();

  List<TestCase> findByProjectIdAndDisplayIdIsNull(String projectId);

  long countByDisplayIdIsNull();

  // 중복 이름 검증: 같은 프로젝트, 같은 부모폴더에서 같은 이름과 타입이 존재하는지 확인 (자기 자신 제외)
  // parentId가 정확히 일치하는 경우만 중복으로 판단 (다른 폴더의 같은 이름은 허용)
  @Query(
      value =
          "SELECT COUNT(*) "
              + "FROM testcases t WHERE t.project_id = :projectId "
              + "AND TRIM(LOWER(t.name)) = TRIM(LOWER(:name)) "
              + "AND (t.parent_id = :parentId OR (t.parent_id IS NULL AND :parentId IS NULL)) "
              + "AND t.type = :type AND t.id <> :excludeId",
      nativeQuery = true)
  Long countByProjectIdAndNameAndParentIdAndTypeAndIdNot(
      @Param("projectId") String projectId,
      @Param("name") String name,
      @Param("parentId") String parentId,
      @Param("type") String type,
      @Param("excludeId") String excludeId);

  // 버전이 없는 레코드 초기화 (네이티브 쿼리 사용)
  @Modifying
  @Query(
      value = "UPDATE testcases SET version = 0 WHERE id = :id AND version IS NULL",
      nativeQuery = true)
  int initializeVersion(@Param("id") String id);

  // DisplayID로 테스트 케이스 조회 (리다이렉트 기능에 사용)
  @Query("SELECT t FROM TestCase t WHERE t.project.id = :projectId AND t.displayId = :displayId")
  Optional<TestCase> findByProjectIdAndDisplayId(
      @Param("projectId") String projectId, @Param("displayId") String displayId);

  // 키워드 검색 메서드 추가 (이름 및 설명 검색)
  @Query(
      "SELECT t FROM TestCase t WHERE t.project.id = :projectId "
          + "AND (LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
          + "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
  List<TestCase> searchByKeyword(
      @Param("projectId") String projectId, @Param("keyword") String keyword);
}
