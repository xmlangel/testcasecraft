package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.RequirementSpec;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequirementSpecRepository extends JpaRepository<RequirementSpec, String> {

  List<RequirementSpec> findByProjectIdOrderByDisplayOrderAscDocIdAsc(String projectId);

  List<RequirementSpec> findByParentId(String parentId);

  boolean existsByProjectIdAndDocId(String projectId, String docId);
}
