package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.RequirementSpec;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RequirementSpecRepository extends JpaRepository<RequirementSpec, String> {

  List<RequirementSpec> findByProjectIdOrderByDisplayOrderAscDocIdAsc(String projectId);

  List<RequirementSpec> findByParentId(String parentId);

  boolean existsByProjectIdAndDocId(String projectId, String docId);

  /** 프로젝트 안에서 {@code prefix} 로 시작하는 문서 ID. 자동 번호의 다음 값을 구할 때 쓴다. */
  @Query(
      "select e.docId from RequirementSpec e where e.project.id = :projectId and e.docId like"
          + " concat(:prefix, '%')")
  List<String> findDocIdsByPrefix(
      @Param("projectId") String projectId, @Param("prefix") String prefix);
}
