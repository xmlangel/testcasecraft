package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    
    /**
     * 토큰으로 RefreshToken 조회
     */
    Optional<RefreshToken> findByToken(String token);
    
    /**
     * 사용자 ID로 활성화된 RefreshToken 조회
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.userId = :userId AND rt.isRevoked = false AND rt.expiryDate > :now")
    Optional<RefreshToken> findValidTokenByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);
    
    /**
     * 사용자 ID로 모든 RefreshToken 조회
     */
    List<RefreshToken> findByUserId(String userId);
    
    /**
     * 사용자의 모든 RefreshToken 삭제
     */
    @Modifying
    @Transactional
    void deleteByUserId(String userId);
    
    /**
     * 사용자의 모든 RefreshToken 무효화
     */
    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true, rt.updatedAt = :now WHERE rt.userId = :userId")
    void revokeAllByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);
    
    /**
     * 만료된 토큰들 삭제
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now OR rt.isRevoked = true")
    void deleteExpiredAndRevokedTokens(@Param("now") LocalDateTime now);
    
    /**
     * 특정 토큰 무효화
     */
    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true, rt.updatedAt = :now WHERE rt.token = :token")
    void revokeByToken(@Param("token") String token, @Param("now") LocalDateTime now);
    
    /**
     * 사용자의 활성 토큰 개수 조회
     */
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.userId = :userId AND rt.isRevoked = false AND rt.expiryDate > :now")
    long countValidTokensByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);
    
    /**
     * 만료된 토큰 개수 조회
     */
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.expiryDate < :now OR rt.isRevoked = true")
    long countExpiredAndRevokedTokens(@Param("now") LocalDateTime now);
}