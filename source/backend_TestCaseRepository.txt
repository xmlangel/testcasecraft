// src/main/java/com/testcase/testcasemanagement/repository/TestCaseRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, String> {
    @Query("SELECT t FROM TestCase t WHERE t.parentId = :parentId ORDER BY t.displayOrder ASC")
    List<TestCase> findByParentIdOrderByDisplayOrder(@Param("parentId") String parentId);

    @Modifying
    @Query("UPDATE TestCase t SET t.displayOrder = t.displayOrder + 1 " +
            "WHERE t.parentId = :parentId AND t.displayOrder >= :startOrder")
    void incrementDisplayOrders(@Param("parentId") String parentId,
                                @Param("startOrder") Integer startOrder);

    @Query("SELECT t FROM TestCase t WHERE t.parentId = :parentId")
    List<TestCase> findByParentId(@Param("parentId") String parentId);

    @Query("SELECT t FROM TestCase t WHERE t.project.id = :projectId ORDER BY t.parentId NULLS FIRST, t.displayOrder")
    List<TestCase> findAllByProjectIdWithHierarchy(@Param("projectId") String projectId);


}
