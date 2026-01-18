// src/main/java/com/testcase/testcasemanagement/repository/TestCaseAttachmentRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCaseAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ICT-386: 테스트케이스 첨부파일 Repository
 */
@Repository
public interface TestCaseAttachmentRepository extends JpaRepository<TestCaseAttachment, String> {

    /**
     * 테스트케이스에 연결된 활성 첨부파일 목록 조회
     */
    @Query("SELECT a FROM TestCaseAttachment a WHERE a.testCase.id = :testCaseId AND a.status = 'ACTIVE' ORDER BY a.createdAt ASC")
    List<TestCaseAttachment> findActiveByTestCaseId(@Param("testCaseId") String testCaseId);

    /**
     * 테스트케이스에 연결된 모든 첨부파일 목록 조회 (상태 무관)
     */
    List<TestCaseAttachment> findByTestCase_Id(String testCaseId);

    /**
     * 저장된 파일명으로 첨부파일 조회
     */
    Optional<TestCaseAttachment> findByStoredFileNameAndStatus(String storedFileName,
            TestCaseAttachment.AttachmentStatus status);

    /**
     * 테스트케이스별 첨부파일 개수 조회
     */
    @Query("SELECT COUNT(a) FROM TestCaseAttachment a WHERE a.testCase.id = :testCaseId AND a.status = 'ACTIVE'")
    long countActiveByTestCaseId(@Param("testCaseId") String testCaseId);

    /**
     * 사용자가 업로드한 첨부파일 목록 조회
     */
    @Query("SELECT a FROM TestCaseAttachment a WHERE a.uploadedBy.id = :userId AND a.status = 'ACTIVE' ORDER BY a.createdAt DESC")
    List<TestCaseAttachment> findActiveByUploadedById(@Param("userId") String userId);

    /**
     * 파일 크기가 큰 첨부파일 목록 조회 (정리용)
     */
    @Query("SELECT a FROM TestCaseAttachment a WHERE a.fileSize > :minSize AND a.status = 'ACTIVE' ORDER BY a.fileSize DESC")
    List<TestCaseAttachment> findLargeFiles(@Param("minSize") Long minSize);

    /**
     * 특정 기간 이전의 첨부파일 목록 조회 (정리용)
     */
    @Query("SELECT a FROM TestCaseAttachment a WHERE a.createdAt < :beforeDate AND a.status = 'ACTIVE'")
    List<TestCaseAttachment> findOldFiles(@Param("beforeDate") java.time.LocalDateTime beforeDate);

    /**
     * 공개 토큰으로 첨부파일 조회
     */
    Optional<TestCaseAttachment> findByIdAndPublicAccessToken(String id, String publicAccessToken);

    /**
     * 미사용 첨부파일 목록 조회 (생성일 기준)
     * - isUsedInContent가 false 또는 null
     * - 생성일이 지정 날짜 이전
     * - 상태가 ACTIVE
     */
    @Query("SELECT a FROM TestCaseAttachment a WHERE " +
            "(a.isUsedInContent = false OR a.isUsedInContent IS NULL) " +
            "AND a.createdAt < :beforeDate " +
            "AND a.status = 'ACTIVE' " +
            "ORDER BY a.createdAt ASC")
    List<TestCaseAttachment> findUnusedFilesBeforeDate(@Param("beforeDate") java.time.LocalDateTime beforeDate);
}
