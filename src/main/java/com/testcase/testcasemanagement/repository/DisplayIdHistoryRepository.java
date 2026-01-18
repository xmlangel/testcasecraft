// src/main/java/com/testcase/testcasemanagement/repository/DisplayIdHistoryRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.DisplayIdHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * DisplayID 변경 이력 Repository
 */
public interface DisplayIdHistoryRepository extends JpaRepository<DisplayIdHistory, String> {

    /**
     * 이전 DisplayID로 최신 매핑 조회
     * 프로젝트 코드가 여러 번 변경된 경우를 고려하여 가장 최신 이력을 반환
     * 
     * @param oldDisplayId 이전 DisplayID
     * @return 최신 DisplayID 히스토리 (Optional)
     */
    @Query("SELECT h FROM DisplayIdHistory h WHERE h.oldDisplayId = :oldDisplayId " +
            "ORDER BY h.changedAt DESC LIMIT 1")
    Optional<DisplayIdHistory> findLatestByOldDisplayId(@Param("oldDisplayId") String oldDisplayId);

    /**
     * 특정 테스트 케이스의 모든 DisplayID 히스토리 조회
     * 
     * @param testCaseId 테스트 케이스 ID
     * @return DisplayID 변경 이력 목록 (최신순)
     */
    @Query("SELECT h FROM DisplayIdHistory h WHERE h.testCase.id = :testCaseId " +
            "ORDER BY h.changedAt DESC")
    List<DisplayIdHistory> findByTestCaseId(@Param("testCaseId") String testCaseId);
}
