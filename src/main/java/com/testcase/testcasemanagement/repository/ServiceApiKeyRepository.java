package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.ServiceApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceApiKeyRepository extends JpaRepository<ServiceApiKey, String> {
    Optional<ServiceApiKey> findByApiKeyAndIsActiveTrue(String apiKey);

    List<ServiceApiKey> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    Optional<ServiceApiKey> findByIdAndCreatedBy(String id, String createdBy);
}
