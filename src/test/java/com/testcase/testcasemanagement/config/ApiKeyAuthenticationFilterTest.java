package com.testcase.testcasemanagement.config;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.model.ServiceApiKey;
import com.testcase.testcasemanagement.repository.ServiceApiKeyRepository;
import com.testcase.testcasemanagement.util.ApiKeyHasher;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.util.Optional;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.context.SecurityContextHolder;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ApiKeyAuthenticationFilter 단위 테스트 — dev-code-review P0(API 키 평문 저장) 수정 검증.
 *
 * <p>핵심: 필터가 들어온 원본 키를 <b>해시</b>해서 조회하는지(평문 조회 아님), 유효/무효/만료 경로가 올바른지 확인한다.
 */
public class ApiKeyAuthenticationFilterTest {

  @Mock private ServiceApiKeyRepository repository;
  @Mock private HttpServletRequest request;
  @Mock private HttpServletResponse response;
  @Mock private FilterChain filterChain;

  private ApiKeyAuthenticationFilter filter;
  private AutoCloseable mocks;

  private static final String RAW_KEY = "Ab-Cd_1234567890ABCDEFghijklmnopqrstuvwxyz12";
  private static final String HASHED_KEY = ApiKeyHasher.sha256Hex(RAW_KEY);

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
    filter = new ApiKeyAuthenticationFilter(repository);
    SecurityContextHolder.clearContext();
  }

  @AfterMethod
  public void tearDown() throws Exception {
    SecurityContextHolder.clearContext();
    mocks.close();
  }

  @Test
  public void validKey_authenticatesWithTesterRole_andLooksUpByHashNotRaw() throws Exception {
    when(request.getHeader("X-API-KEY")).thenReturn(RAW_KEY);
    ServiceApiKey key =
        ServiceApiKey.builder()
            .name("Forge")
            .apiKey(HASHED_KEY)
            .expiresAt(LocalDateTime.now().plusDays(1))
            .isActive(true)
            .build();
    when(repository.findByApiKeyAndIsActiveTrue(HASHED_KEY)).thenReturn(Optional.of(key));

    filter.doFilter(request, response, filterChain);

    // 원본이 아니라 해시로 조회해야 한다
    verify(repository).findByApiKeyAndIsActiveTrue(eq(HASHED_KEY));
    verify(repository, never()).findByApiKeyAndIsActiveTrue(eq(RAW_KEY));
    // 인증 컨텍스트에 ROLE_TESTER 부여 + 체인 진행
    assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    assertTrue(
        SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_TESTER")));
    verify(filterChain).doFilter(request, response);
  }

  @Test
  public void invalidKey_returns401_andDoesNotProceed() throws Exception {
    when(request.getHeader("X-API-KEY")).thenReturn("wrong-key");
    when(repository.findByApiKeyAndIsActiveTrue(ApiKeyHasher.sha256Hex("wrong-key")))
        .thenReturn(Optional.empty());

    filter.doFilter(request, response, filterChain);

    verify(response)
        .sendError(
            eq(HttpServletResponse.SC_UNAUTHORIZED), org.mockito.ArgumentMatchers.anyString());
    verify(filterChain, never()).doFilter(request, response);
    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  @Test
  public void expiredKey_returns401() throws Exception {
    when(request.getHeader("X-API-KEY")).thenReturn(RAW_KEY);
    ServiceApiKey expired =
        ServiceApiKey.builder()
            .name("Expired")
            .apiKey(HASHED_KEY)
            .expiresAt(LocalDateTime.now().minusMinutes(1))
            .isActive(true)
            .build();
    when(repository.findByApiKeyAndIsActiveTrue(HASHED_KEY)).thenReturn(Optional.of(expired));

    filter.doFilter(request, response, filterChain);

    verify(response)
        .sendError(
            eq(HttpServletResponse.SC_UNAUTHORIZED), org.mockito.ArgumentMatchers.anyString());
    verify(filterChain, never()).doFilter(request, response);
  }

  @Test
  public void noHeader_passesThroughWithoutAuth() throws Exception {
    when(request.getHeader("X-API-KEY")).thenReturn(null);

    filter.doFilter(request, response, filterChain);

    assertNull(SecurityContextHolder.getContext().getAuthentication());
    verify(filterChain).doFilter(request, response);
    verify(repository, never())
        .findByApiKeyAndIsActiveTrue(org.mockito.ArgumentMatchers.anyString());
  }
}
