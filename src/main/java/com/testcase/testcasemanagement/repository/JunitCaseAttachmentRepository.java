package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.JunitCaseAttachment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JunitCaseAttachmentRepository extends JpaRepository<JunitCaseAttachment, String> {

  /** 한 케이스에 붙은 살아 있는 첨부를 올린 순서대로 */
  @Query(
      "SELECT a FROM JunitCaseAttachment a "
          + "WHERE a.junitTestCase.id = :caseId AND a.status = "
          + "com.testcase.testcasemanagement.model.JunitCaseAttachment$AttachmentStatus.ACTIVE "
          + "ORDER BY a.createdAt ASC")
  List<JunitCaseAttachment> findActiveByCaseId(@Param("caseId") String caseId);

  @Query(
      "SELECT a FROM JunitCaseAttachment a "
          + "WHERE a.id = :id AND a.status = "
          + "com.testcase.testcasemanagement.model.JunitCaseAttachment$AttachmentStatus.ACTIVE")
  Optional<JunitCaseAttachment> findActiveById(@Param("id") String id);

  /** 첨부가 속한 프로젝트. 권한 판정이 이 값을 쓴다 */
  @Query(
      "SELECT a.junitTestCase.junitTestSuite.junitTestResult.projectId "
          + "FROM JunitCaseAttachment a WHERE a.id = :id")
  Optional<String> findProjectIdByAttachmentId(@Param("id") String id);

  /** 같은 케이스에 같은 이름이 이미 있나. 다시 올려도 쌓이지 않게 한다 */
  @Query(
      "SELECT a FROM JunitCaseAttachment a "
          + "WHERE a.junitTestCase.id = :caseId AND a.originalFileName = :name AND a.status = "
          + "com.testcase.testcasemanagement.model.JunitCaseAttachment$AttachmentStatus.ACTIVE")
  Optional<JunitCaseAttachment> findActiveByCaseIdAndName(
      @Param("caseId") String caseId, @Param("name") String name);

  long countByJunitTestCaseId(String junitTestCaseId);
}
