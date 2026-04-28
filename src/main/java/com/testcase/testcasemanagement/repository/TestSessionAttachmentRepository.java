package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestSessionAttachment;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TestSessionAttachmentRepository
    extends JpaRepository<TestSessionAttachment, String> {

  @Query(
      "SELECT a FROM TestSessionAttachment a WHERE a.session.id = :sessionId AND a.status ="
          + " 'ACTIVE' ORDER BY a.createdAt DESC")
  List<TestSessionAttachment> findActiveBySessionId(@Param("sessionId") String sessionId);

  @Query(
      "SELECT a FROM TestSessionAttachment a WHERE a.uploadedBy.id = :userId AND a.status ="
          + " 'ACTIVE' ORDER BY a.createdAt DESC")
  List<TestSessionAttachment> findActiveByUploadedById(@Param("userId") String userId);

  Optional<TestSessionAttachment> findByIdAndPublicAccessToken(String id, String publicAccessToken);

  @Query(
      "SELECT a FROM TestSessionAttachment a WHERE a.fileSize >= :minSize AND a.status = 'ACTIVE'")
  List<TestSessionAttachment> findLargeFiles(@Param("minSize") Long minSize);

  @Query(
      "SELECT a FROM TestSessionAttachment a WHERE a.status = 'ACTIVE' AND (a.isUsedInContent IS"
          + " NULL OR a.isUsedInContent = false) AND a.createdAt < :cutoffDate")
  List<TestSessionAttachment> findUnusedFilesBeforeDate(
      @Param("cutoffDate") LocalDateTime cutoffDate);
}
