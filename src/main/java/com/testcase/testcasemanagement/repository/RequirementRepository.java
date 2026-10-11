package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Requirement;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequirementRepository extends JpaRepository<Requirement, String> {

  List<Requirement> findByProjectIdOrderByDisplayOrderAscDocIdAsc(String projectId);

  List<Requirement> findBySpecIdIn(Collection<String> specIds);

  boolean existsByProjectIdAndDocId(String projectId, String docId);
}
