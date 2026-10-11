package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.RequirementTestCaseLink;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RequirementTestCaseLinkRepository
    extends JpaRepository<RequirementTestCaseLink, String> {

  List<RequirementTestCaseLink> findByRequirementIdIn(Collection<String> requirementIds);

  List<RequirementTestCaseLink> findByTestCaseId(String testCaseId);

  boolean existsByRequirementIdAndTestCaseId(String requirementId, String testCaseId);

  @Modifying
  @Query(
      "DELETE FROM RequirementTestCaseLink l "
          + "WHERE l.requirementId = :requirementId AND l.testCaseId = :testCaseId")
  int deleteByRequirementIdAndTestCaseId(
      @Param("requirementId") String requirementId, @Param("testCaseId") String testCaseId);

  @Modifying
  @Query("DELETE FROM RequirementTestCaseLink l WHERE l.requirementId IN :requirementIds")
  int deleteByRequirementIdIn(@Param("requirementIds") Collection<String> requirementIds);
}
