package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.LlmTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * LLM 템플릿 Repository
 */
@Repository
public interface LlmTemplateRepository extends JpaRepository<LlmTemplate, String> {
}
