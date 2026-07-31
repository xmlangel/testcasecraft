package com.testcase.testcasemanagement.util;

import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import java.util.Optional;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(BOLA #userId==authentication.name) 수정의 핵심 헬퍼 검증.
 *
 * <p>isCurrentUser 는 현재 사용자의 <b>실제 UUID</b> 와 비교해야 한다 — username 과 비교하면 공격자가 피해자 UUID 를 username 으로
 * 가입해 우회할 수 있다.
 */
public class SecurityContextUtilIsCurrentUserTest {

  @Mock private UserRepository userRepository;
  @InjectMocks private SecurityContextUtil securityContextUtil;

  private AutoCloseable mocks;

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
  }

  @AfterMethod
  public void tearDown() throws Exception {
    SecurityContextHolder.clearContext();
    mocks.close();
  }

  private void authenticateAs(String username) {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(username, "pw", java.util.List.of()));
  }

  @Test
  public void isCurrentUser_matchesRealUserId_notUsername() {
    User current = new User();
    current.setId("uuid-123");
    current.setUsername("alice");
    when(userRepository.findByUsername("alice")).thenReturn(Optional.of(current));
    authenticateAs("alice");

    // 실제 UUID 로 비교해야 참
    assertTrue(securityContextUtil.isCurrentUser("uuid-123"));
    // username 으로는 거짓 (BOLA 방지 핵심)
    assertFalse(securityContextUtil.isCurrentUser("alice"));
    // 타인 UUID 거짓
    assertFalse(securityContextUtil.isCurrentUser("uuid-999"));
  }

  @Test
  public void isCurrentUser_whenUsernameEqualsVictimUuid_butNotResolvableUser_returnsFalse() {
    // 공격자: username 을 피해자 UUID 문자열로 가입했으나 DB에 없음 → getCurrentUserId="system"
    when(userRepository.findByUsername("victim-uuid")).thenReturn(Optional.empty());
    authenticateAs("victim-uuid");

    // 과거 코드(#userId == authentication.name)라면 참이 됐을 등식이 이제 거짓
    assertFalse(securityContextUtil.isCurrentUser("victim-uuid"));
  }

  @Test
  public void isCurrentUser_whenAttackerRegisteredVictimUuidAsUsername_stillComparesById() {
    // 공격자 계정: username="victim-uuid", 자신의 실제 id="attacker-uuid"
    User attacker = new User();
    attacker.setId("attacker-uuid");
    attacker.setUsername("victim-uuid");
    when(userRepository.findByUsername("victim-uuid")).thenReturn(Optional.of(attacker));
    authenticateAs("victim-uuid");

    // 피해자 UUID(=자신의 username)로 접근 시도 → 실제 비교는 attacker-uuid 이므로 거짓
    assertFalse(securityContextUtil.isCurrentUser("victim-uuid"));
    // 자신의 실제 id 로는 참
    assertTrue(securityContextUtil.isCurrentUser("attacker-uuid"));
  }
}
