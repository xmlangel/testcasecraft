package com.testcase.testcasemanagement.config;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
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
import java.util.List;
import java.util.Optional;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
  @Mock private UserDetailsService userDetailsService;

  private ApiKeyAuthenticationFilter filter;
  private AutoCloseable mocks;

  private static final String RAW_KEY = "Ab-Cd_1234567890ABCDEFghijklmnopqrstuvwxyz12";
  private static final String HASHED_KEY = ApiKeyHasher.sha256Hex(RAW_KEY);

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
    filter = new ApiKeyAuthenticationFilter(repository, userDetailsService);
    SecurityContextHolder.clearContext();
  }

  @AfterMethod
  public void tearDown() throws Exception {
    SecurityContextHolder.clearContext();
    mocks.close();
  }

  private ServiceApiKey activeKey(String issuer) {
    return ServiceApiKey.builder()
        .name("Forge")
        .apiKey(HASHED_KEY)
        .createdBy(issuer)
        .expiresAt(LocalDateTime.now().plusDays(1))
        .isActive(true)
        .build();
  }

  private UserDetails user(String username, String role) {
    return new User(username, "pw", List.of(new SimpleGrantedAuthority(role)));
  }

  @Test
  public void validKey_authenticatesAsIssuer_andLooksUpByHashNotRaw() throws Exception {
    when(request.getHeader("X-API-KEY")).thenReturn(RAW_KEY);
    when(repository.findByApiKeyAndIsActiveTrue(HASHED_KEY))
        .thenReturn(Optional.of(activeKey("dicky")));
    when(userDetailsService.loadUserByUsername("dicky")).thenReturn(user("dicky", "ROLE_USER"));

    filter.doFilter(request, response, filterChain);

    // 원본이 아니라 해시로 조회해야 한다
    verify(repository).findByApiKeyAndIsActiveTrue(eq(HASHED_KEY));
    verify(repository, never()).findByApiKeyAndIsActiveTrue(eq(RAW_KEY));
    // ICT-440: 가상 계정 service-account 가 아니라 발급자로, 발급자의 역할로 인증한다
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    assertNotNull(auth);
    assertEquals(auth.getName(), "dicky");
    assertTrue(auth.getPrincipal() instanceof UserDetails);
    assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    assertFalse(
        auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_TESTER")));
    verify(filterChain).doFilter(request, response);
  }

  @Test
  public void adminIssuedKey_getsAdminRole() throws Exception {
    when(request.getHeader("X-API-KEY")).thenReturn(RAW_KEY);
    when(repository.findByApiKeyAndIsActiveTrue(HASHED_KEY))
        .thenReturn(Optional.of(activeKey("admin")));
    when(userDetailsService.loadUserByUsername("admin")).thenReturn(user("admin", "ROLE_ADMIN"));

    filter.doFilter(request, response, filterChain);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    assertEquals(auth.getName(), "admin");
    assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
  }

  @Test
  public void keyWithoutIssuer_returns401() throws Exception {
    when(request.getHeader("X-API-KEY")).thenReturn(RAW_KEY);
    when(repository.findByApiKeyAndIsActiveTrue(HASHED_KEY))
        .thenReturn(Optional.of(activeKey(null)));

    filter.doFilter(request, response, filterChain);

    verify(response)
        .sendError(
            eq(HttpServletResponse.SC_UNAUTHORIZED), org.mockito.ArgumentMatchers.anyString());
    verify(filterChain, never()).doFilter(request, response);
    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  @Test
  public void deletedIssuer_returns401() throws Exception {
    when(request.getHeader("X-API-KEY")).thenReturn(RAW_KEY);
    when(repository.findByApiKeyAndIsActiveTrue(HASHED_KEY))
        .thenReturn(Optional.of(activeKey("gone")));
    when(userDetailsService.loadUserByUsername("gone"))
        .thenThrow(new UsernameNotFoundException("User not found: gone"));

    filter.doFilter(request, response, filterChain);

    verify(response)
        .sendError(
            eq(HttpServletResponse.SC_UNAUTHORIZED), org.mockito.ArgumentMatchers.anyString());
    verify(filterChain, never()).doFilter(request, response);
    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  @Test
  public void inactiveIssuer_returns401() throws Exception {
    when(request.getHeader("X-API-KEY")).thenReturn(RAW_KEY);
    when(repository.findByApiKeyAndIsActiveTrue(HASHED_KEY))
        .thenReturn(Optional.of(activeKey("off")));
    when(userDetailsService.loadUserByUsername("off"))
        .thenThrow(new DisabledException("User account is disabled: off"));

    filter.doFilter(request, response, filterChain);

    verify(filterChain, never()).doFilter(request, response);
    assertNull(SecurityContextHolder.getContext().getAuthentication());
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
