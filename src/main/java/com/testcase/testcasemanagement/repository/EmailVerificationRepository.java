// src/main/java/com/testcase/testcasemanagement/repository/EmailVerificationRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerificationToken, String> {

    /**
     * 토큰으로 검색
     */
    Optional<EmailVerificationToken> findByToken(String token);

    /**
     * 사용자 ID와 이메일로 검색
     */
    List<EmailVerificationToken> findByUserIdAndEmail(String userId, String email);

    /**
     * 사용자의 모든 토큰 삭제 (이메일 변경 시)
     */
    void deleteByUserId(String userId);

    /**
     * 사용자의 이메일에 대한 미사용 토큰 조회
     */
    Optional<EmailVerificationToken> findByUserIdAndEmailAndIsUsedFalse(String userId, String email);
}
