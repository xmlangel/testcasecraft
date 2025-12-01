package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.RefreshToken;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.RefreshTokenRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final int MAX_TOKENS_PER_USER = 5; // 사용자당 최대 토큰 개수

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            JwtTokenUtil jwtTokenUtil,
            CustomUserDetailsService userDetailsService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * 새로운 Refresh Token 생성
     */
    @Transactional
    public RefreshToken createRefreshToken(String userId) {
        try {
            // 기존 토큰들 정리 (사용자당 최대 토큰 개수 제한)
            cleanupUserTokens(userId);

            // 사용자 확인
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("사용자를 찾을 수 없습니다: " + userId);
            }

            User user = userOpt.get();

            // 토큰 중복 방지를 위해 고유 식별자 추가하여 JWT 토큰 생성
            String uniqueId = UUID.randomUUID().toString();
            String tokenValue = jwtTokenUtil.generateRefreshTokenWithId(user.getUsername(), uniqueId);

            // 토큰 중복 확인 및 재시도 (최대 3회)
            int retryCount = 0;
            while (retryCount < 3 && refreshTokenRepository.findByToken(tokenValue).isPresent()) {
                uniqueId = UUID.randomUUID().toString();
                tokenValue = jwtTokenUtil.generateRefreshTokenWithId(user.getUsername(), uniqueId);
                retryCount++;
                logger.warn("토큰 중복 발견, 재생성 시도: {} - 사용자: {}", retryCount, user.getUsername());
            }

            // 여전히 중복이면 에러
            if (refreshTokenRepository.findByToken(tokenValue).isPresent()) {
                throw new RuntimeException("고유한 토큰 생성에 실패했습니다");
            }

            // 만료 시간 계산 (밀리초를 LocalDateTime으로 변환)
            LocalDateTime expiryDate = LocalDateTime.now()
                    .plusSeconds(jwtTokenUtil.getRefreshTokenExpirationTime() / 1000);

            // RefreshToken 엔티티 생성
            RefreshToken refreshToken = new RefreshToken(tokenValue, userId, expiryDate);

            // 저장
            RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
            logger.info("새로운 Refresh Token 생성됨 - 사용자: {}, 만료일: {}", user.getUsername(), expiryDate);

            return savedToken;

        } catch (Exception e) {
            logger.error("Refresh Token 생성 실패 - 사용자: {}, 오류: {}", userId, e.getMessage());
            throw new RuntimeException("Refresh Token 생성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * Refresh Token으로 새로운 Access Token 생성
     */
    @Transactional
    public Optional<String> refreshAccessToken(String refreshTokenValue) {
        try {
            // Refresh Token 검증
            if (!jwtTokenUtil.validateRefreshToken(refreshTokenValue)) {
                logger.warn("유효하지 않은 Refresh Token 사용 시도");
                return Optional.empty();
            }

            // DB에서 토큰 확인
            Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(refreshTokenValue);
            if (tokenOpt.isEmpty()) {
                logger.warn("DB에서 찾을 수 없는 Refresh Token 사용 시도");
                return Optional.empty();
            }

            RefreshToken refreshToken = tokenOpt.get();

            // 토큰 상태 확인
            if (refreshToken.isRevoked() || refreshToken.isExpired()) {
                logger.warn("만료되었거나 무효화된 Refresh Token 사용 시도 - 사용자: {}", refreshToken.getUserId());
                return Optional.empty();
            }

            // 사용자 정보 조회
            Optional<User> userOpt = userRepository.findById(refreshToken.getUserId());
            if (userOpt.isEmpty()) {
                logger.error("Refresh Token에 연결된 사용자를 찾을 수 없음: {}", refreshToken.getUserId());
                return Optional.empty();
            }

            User user = userOpt.get();

            // 새로운 Access Token 생성 (CustomUserDetailsService를 통해 UserDetails 생성)
            org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService
                    .loadUserByUsername(user.getUsername());
            String newAccessToken = jwtTokenUtil.generateAccessToken(userDetails);

            logger.info("Access Token 갱신됨 - 사용자: {}", user.getUsername());
            return Optional.of(newAccessToken);

        } catch (Exception e) {
            logger.error("Access Token 갱신 실패: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Refresh Token 검증
     */
    public boolean validateRefreshToken(String token) {
        try {
            // JWT 자체 검증
            if (!jwtTokenUtil.validateRefreshToken(token)) {
                return false;
            }

            // DB에서 토큰 확인
            Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(token);
            if (tokenOpt.isEmpty()) {
                return false;
            }

            RefreshToken refreshToken = tokenOpt.get();
            return !refreshToken.isRevoked() && !refreshToken.isExpired();

        } catch (Exception e) {
            logger.error("Refresh Token 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Refresh Token 무효화
     */
    @Transactional
    public void revokeToken(String token) {
        try {
            refreshTokenRepository.revokeByToken(token, LocalDateTime.now());
            logger.info("Refresh Token 무효화됨");
        } catch (Exception e) {
            logger.error("Refresh Token 무효화 실패: {}", e.getMessage());
        }
    }

    /**
     * 사용자의 모든 Refresh Token 무효화
     */
    @Transactional
    public void revokeAllUserTokens(String userId) {
        try {
            refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now());
            logger.info("사용자의 모든 Refresh Token 무효화됨 - 사용자: {}", userId);
        } catch (Exception e) {
            logger.error("사용자 토큰 무효화 실패 - 사용자: {}, 오류: {}", userId, e.getMessage());
        }
    }

    /**
     * 사용자별 토큰 개수 제한 관리
     */
    @Transactional
    protected void cleanupUserTokens(String userId) {
        try {
            long activeTokenCount = refreshTokenRepository.countValidTokensByUserId(userId, LocalDateTime.now());

            if (activeTokenCount >= MAX_TOKENS_PER_USER) {
                // 가장 오래된 토큰들 무효화
                logger.info("사용자 토큰 개수 제한 초과 - 사용자: {}, 개수: {}", userId, activeTokenCount);
                // 여기서는 간단히 모든 토큰을 무효화하고 새로 생성
                revokeAllUserTokens(userId);
            }
        } catch (Exception e) {
            logger.error("사용자 토큰 정리 실패 - 사용자: {}", userId);
        }
    }

    /**
     * 정기적으로 만료된 토큰들 정리 (매일 새벽 2시)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            long expiredCount = refreshTokenRepository.countExpiredAndRevokedTokens(LocalDateTime.now());

            if (expiredCount > 0) {
                refreshTokenRepository.deleteExpiredAndRevokedTokens(LocalDateTime.now());
                logger.info("만료된 Refresh Token 정리 완료 - 삭제된 개수: {}", expiredCount);
            }
        } catch (Exception e) {
            logger.error("만료된 토큰 정리 실패: {}", e.getMessage());
        }
    }

    /**
     * 사용자별 활성 토큰 개수 조회
     */
    public long getActiveTokenCount(String userId) {
        return refreshTokenRepository.countValidTokensByUserId(userId, LocalDateTime.now());
    }

    /**
     * 토큰으로부터 사용자 ID 추출
     */
    public Optional<String> getUserIdFromToken(String token) {
        try {
            Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(token);
            return tokenOpt.map(RefreshToken::getUserId);
        } catch (Exception e) {
            logger.error("토큰에서 사용자 ID 추출 실패: {}", e.getMessage());
            return Optional.empty();
        }
    }
}