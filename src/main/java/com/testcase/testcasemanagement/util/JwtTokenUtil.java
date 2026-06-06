// src/main/java/com/testcase/testcasemanagement/util/JwtTokenUtil.java
package com.testcase.testcasemanagement.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenUtil {

  @Value("${jwt.secret}")
  private String secret;

  @Value("${jwt.access-token-expiration}")
  private Long accessTokenExpiration;

  @Value("${jwt.refresh-token-expiration}")
  private Long refreshTokenExpiration;

  /**
   * 앱 시작 시 JWT_SECRET 을 즉시 검증한다.
   *
   * <p>시크릿이 잘못되면(비 Base64 문자 포함, 길이 부족) 기존에는 첫 로그인 시점에야 "Illegal base64
   * character" 같은 모호한 에러로 실패해 원인 파악이 어려웠다. 시작 시점에 명확한 메시지로 즉시 실패시켜 배포
   * 설정 오류를 바로 드러낸다.
   */
  @PostConstruct
  void validateSecretOnStartup() {
    final String hint =
        " JWT_SECRET 은 Base64 문자열(A-Z a-z 0-9 + / =)이어야 하며, 디코딩 후 64바이트(512비트) 이상이어야 합니다."
            + " / JWT_SECRET must be a Base64 string (A-Z a-z 0-9 + / =) that decodes to at least"
            + " 64 bytes (512 bits)."
            + " 생성 예 (How to generate): openssl rand -base64 64 | tr -d '\\n'";
    try {
      getSigningKey();
    } catch (DecodingException e) {
      throw new IllegalStateException(
          "JWT_SECRET 이 유효한 Base64 문자열이 아닙니다 (하이픈/언더스코어 등 사용 불가)."
              + " / JWT_SECRET is not a valid Base64 string (characters like '-' or '_' are not"
              + " allowed)."
              + hint
              + " — 원인 (Cause): "
              + e.getMessage(),
          e);
    } catch (IllegalArgumentException e) {
      throw new IllegalStateException(
          "JWT_SECRET 길이가 부족합니다. / JWT_SECRET is too short."
              + hint
              + " — 원인 (Cause): "
              + e.getMessage(),
          e);
    }
  }

  private Key getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secret);
    validateKeyLength(keyBytes);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  private void validateKeyLength(byte[] keyBytes) {
    if (keyBytes.length * 8 < 512) {
      throw new IllegalArgumentException(
          "HS512 알고리즘은 512비트(64바이트) 이상의 키가 필요합니다. / HS512 requires a key of at least 512 bits"
              + " (64 bytes). 현재 키 길이 (Current key length): "
              + (keyBytes.length * 8)
              + "비트 (bits)");
    }
  }

  /** Access Token 생성 (기존 메서드 유지) */
  public String generateToken(UserDetails userDetails) {
    return generateAccessToken(userDetails);
  }

  /** Access Token 생성 */
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

  /** Refresh Token 생성 */
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

  /** 고유 ID를 포함한 Refresh Token 생성 (중복 방지) */
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
      Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
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

  /** 토큰 타입 추출 (access 또는 refresh) */
  public String extractTokenType(String token) {
    return extractClaim(token, claims -> claims.get("type", String.class));
  }

  /** Refresh Token 검증 */
  public Boolean validateRefreshToken(String token) {
    try {
      return !isTokenExpired(token)
          && isSignatureValid(token)
          && "refresh".equals(extractTokenType(token));
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  /** Access Token 검증 */
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

  /** Access Token 만료 시간 반환 */
  public Long getAccessTokenExpirationTime() {
    return accessTokenExpiration;
  }

  /** Refresh Token 만료 시간 반환 */
  public Long getRefreshTokenExpirationTime() {
    return refreshTokenExpiration;
  }

  /** 기존 호환성을 위한 메서드 (deprecated) */
  @Deprecated
  public Long getExpirationTime() {
    return accessTokenExpiration;
  }
}
