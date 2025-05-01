// src/main/java/com/testcase/testcasemanagement/repository/ProjectRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, String> {
}
