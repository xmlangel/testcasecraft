// src/main/java/com/testcase/testcasemanagement/repository/TestResultAttachmentRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestResultAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ICT-361: 테스트 결과 첨부파일 Repository
 */
@Repository
public interface TestResultAttachmentRepository extends JpaRepository<TestResultAttachment, String> {

    /**
     * 테스트 결과에 연결된 활성 첨부파일 목록 조회
     */
    @Query("SELECT a FROM TestResultAttachment a WHERE a.testResult.id = :testResultId AND a.status = 'ACTIVE' ORDER BY a.createdAt ASC")
    List<TestResultAttachment> findActiveByTestResultId(@Param("testResultId") String testResultId);

    /**
     * 저장된 파일명으로 첨부파일 조회
     */
    Optional<TestResultAttachment> findByStoredFileNameAndStatus(String storedFileName, TestResultAttachment.AttachmentStatus status);

    /**
     * 테스트 결과별 첨부파일 개수 조회
     */
    @Query("SELECT COUNT(a) FROM TestResultAttachment a WHERE a.testResult.id = :testResultId AND a.status = 'ACTIVE'")
    long countActiveByTestResultId(@Param("testResultId") String testResultId);

    /**
     * 사용자가 업로드한 첨부파일 목록 조회
     */
    @Query("SELECT a FROM TestResultAttachment a WHERE a.uploadedBy.id = :userId AND a.status = 'ACTIVE' ORDER BY a.createdAt DESC")
    List<TestResultAttachment> findActiveByUploadedById(@Param("userId") String userId);

    /**
     * 파일 크기가 큰 첨부파일 목록 조회 (정리용)
     */
    @Query("SELECT a FROM TestResultAttachment a WHERE a.fileSize > :minSize AND a.status = 'ACTIVE' ORDER BY a.fileSize DESC")
    List<TestResultAttachment> findLargeFiles(@Param("minSize") Long minSize);

    /**
     * 특정 기간 이전의 첨부파일 목록 조회 (정리용)
     */
    @Query("SELECT a FROM TestResultAttachment a WHERE a.createdAt < :beforeDate AND a.status = 'ACTIVE'")
    List<TestResultAttachment> findOldFiles(@Param("beforeDate") java.time.LocalDateTime beforeDate);
}