// src/main/java/com/testcase/testcasemanagement/repository/TestCaseRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TestCaseRepository extends JpaRepository<TestCase, String> {

    // parentId가 같은 테스트케이스를 displayOrder 오름차순으로 조회
    @Query("SELECT t FROM TestCase t WHERE t.parentId = :parentId ORDER BY t.displayOrder ASC")
    List<TestCase> findByParentIdOrderByDisplayOrder(@Param("parentId") String parentId);

    // parentId가 같고 displayOrder가 startOrder 이상인 항목의 displayOrder를 +1 (정렬/삽입시 사용)
    @Modifying
    @Query("UPDATE TestCase t SET t.displayOrder = t.displayOrder + 1 " +
            "WHERE t.parentId = :parentId AND t.displayOrder >= :startOrder")
    void incrementDisplayOrders(@Param("parentId") String parentId,
                                @Param("startOrder") Integer startOrder);

    // parentId가 같은 모든 테스트케이스 조회 (정렬 없이)
    @Query("SELECT t FROM TestCase t WHERE t.parentId = :parentId")
    List<TestCase> findByParentId(@Param("parentId") String parentId);

    // 특정 프로젝트의 모든 테스트케이스를 계층/정렬 포함 조회
    @Query("SELECT t FROM TestCase t WHERE t.project.id = :projectId ORDER BY t.parentId NULLS FIRST, t.displayOrder")
    List<TestCase> findAllByProjectIdWithHierarchy(@Param("projectId") String projectId);

    // 모든 테스트케이스를 steps와 함께 조회 (중복 제거)
    @Query("SELECT DISTINCT t FROM TestCase t LEFT JOIN FETCH t.steps")
    List<TestCase> findAllWithSteps();

    // parentId가 같은 테스트케이스 중 가장 큰 displayOrder 반환 (자동 할당용)
    @Query("SELECT MAX(t.displayOrder) FROM TestCase t WHERE t.parentId = :parentId")
    Integer findMaxDisplayOrderByParentId(@Param("parentId") String parentId);

    @Query("SELECT t FROM TestCase t LEFT JOIN FETCH t.steps WHERE t.id = :id")
    Optional<TestCase> findByIdWithSteps(@Param("id") String id);

    @Query("SELECT DISTINCT t FROM TestCase t LEFT JOIN FETCH t.steps WHERE t.project.id = :projectId ORDER BY t.parentId NULLS FIRST, t.displayOrder")
    List<TestCase> findAllByProjectIdWithSteps(@Param("projectId") String projectId);

    long countByProjectId(String projectId);

    @Query("SELECT t FROM TestCase t WHERE t.project.id = :projectId AND t.type = :type")
    List<TestCase> findByProjectIdAndType(String projectId, String type);

    Optional<TestCase> findByParentIdAndDisplayOrder(String parentId, Integer displayOrder);
}
