package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.ServiceApiKey;
import java.time.LocalDateTime;

/** 서비스 API 키 조회 응답 DTO. 키 값(해시 포함)은 담지 않는다 — 원본 키는 발급 시 1회만 노출되고, 이후에는 메타데이터만 조회 가능하다. */
public record ServiceApiKeyResponse(
    String id,
    String name,
    String createdBy,
    LocalDateTime createdAt,
    LocalDateTime expiresAt,
    boolean active) {

  public static ServiceApiKeyResponse from(ServiceApiKey key) {
    return new ServiceApiKeyResponse(
        key.getId(),
        key.getName(),
        key.getCreatedBy(),
        key.getCreatedAt(),
        key.getExpiresAt(),
        key.isActive());
  }
}
