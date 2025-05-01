package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByParentId(String parentId); // ✅ String 타입
    List<TestCase> findByType(String type);
    @Query("SELECT t FROM TestCase t WHERE t.parentId = :parentId ORDER BY t.displayOrder ASC")
    List<TestCase> findByParentIdOrderByDisplayOrder(String parentId);

    @Modifying
    @Query("UPDATE TestCase t SET t.displayOrder = t.displayOrder + 1 " +
            "WHERE t.parentId = :parentId AND t.displayOrder >= :startOrder")
    void incrementDisplayOrders(@Param("parentId") String parentId,
                                @Param("startOrder") Integer startOrder);
}
