package com.testcase.testcasemanagement.dto;

/**
 * 조직 소유권 이전 요청 DTO
 */
public class TransferOwnershipRequest {
    private String newOwnerUserId;

    // 기본 생성자
    public TransferOwnershipRequest() {}

    // 생성자
    public TransferOwnershipRequest(String newOwnerUserId) {
        this.newOwnerUserId = newOwnerUserId;
    }

    // Getter and Setter
    public String getNewOwnerUserId() {
        return newOwnerUserId;
    }

    public void setNewOwnerUserId(String newOwnerUserId) {
        this.newOwnerUserId = newOwnerUserId;
    }
}