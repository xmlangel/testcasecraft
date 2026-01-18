// src/main/java/com/testcase/testcasemanagement/util/JwtTokenUtil.java
package com.testcase.testcasemanagement.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        validateKeyLength(keyBytes);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private void validateKeyLength(byte[] keyBytes) {
        if (keyBytes.length * 8 < 512) {
            throw new IllegalArgumentException(
                    "HS512 알고리즘은 512비트(64바이트) 이상의 키가 필요합니다. 현재 키 길이: " +
                            (keyBytes.length * 8) + "비트"
            );
        }
    }

    /**
     * Access Token 생성 (기존 메서드 유지)
     */
    public String generateToken(UserDetails userDetails) {
        return generateAccessToken(userDetails);
    }

    /**
     * Access Token 생성
     */
    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities());
        claims.put("type", "access");
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Refresh Token 생성
     */
    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * 고유 ID를 포함한 Refresh Token 생성 (중복 방지)
     */
    public String generateRefreshTokenWithId(String username, String uniqueId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        claims.put("uid", uniqueId); // 고유 식별자 추가
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername())
                    && !isTokenExpired(token)
                    && isSignatureValid(token));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isSignatureValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        try {
            return extractClaim(token, Claims::getExpiration);
        } catch (ExpiredJwtException e) {
            return e.getClaims().getExpiration();
        }
    }

    public Boolean isTokenExpired(String token) {
        try {
            final Date expiration = extractExpiration(token);
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            final Claims claims = extractAllClaims(token);
            return claimsResolver.apply(claims);
        } catch (JwtException e) {
            throw new JwtException("토큰 파싱 실패: " + e.getMessage());
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 토큰 타입 추출 (access 또는 refresh)
     */
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    /**
     * Refresh Token 검증
     */
    public Boolean validateRefreshToken(String token) {
        try {
            return !isTokenExpired(token) 
                    && isSignatureValid(token) 
                    && "refresh".equals(extractTokenType(token));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Access Token 검증
     */
    public Boolean validateAccessToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername())
                    && !isTokenExpired(token)
                    && isSignatureValid(token)
                    && "access".equals(extractTokenType(token)));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Access Token 만료 시간 반환
     */
    public Long getAccessTokenExpirationTime() {
        return accessTokenExpiration;
    }

    /**
     * Refresh Token 만료 시간 반환
     */
    public Long getRefreshTokenExpirationTime() {
        return refreshTokenExpiration;
    }

    /**
     * 기존 호환성을 위한 메서드 (deprecated)
     */
    @Deprecated
    public Long getExpirationTime() {
        return accessTokenExpiration;
    }
}
