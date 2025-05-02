// src/main/java/com/testcase/testcasemanagement/repository/ProjectRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, String> {
    boolean existsByCode(String code);
    Optional<Project> findByCode(String code);
}
