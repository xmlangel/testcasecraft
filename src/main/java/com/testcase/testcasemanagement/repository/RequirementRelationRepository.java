package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.RequirementRelation;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RequirementRelationRepository extends JpaRepository<RequirementRelation, String> {

  @Query("SELECT r FROM RequirementRelation r WHERE r.sourceId = :id OR r.targetId = :id")
  List<RequirementRelation> findInvolving(@Param("id") String requirementId);

  List<RequirementRelation> findBySourceIdAndType(String sourceId, RequirementRelation.Type type);

  boolean existsBySourceIdAndTargetIdAndType(
      String sourceId, String targetId, RequirementRelation.Type type);

  @Modifying
  @Query("DELETE FROM RequirementRelation r " + "WHERE r.sourceId IN :ids OR r.targetId IN :ids")
  int deleteInvolving(@Param("ids") Collection<String> requirementIds);
}
