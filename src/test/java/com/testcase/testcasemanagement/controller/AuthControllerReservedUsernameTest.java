package com.testcase.testcasemanagement.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.CustomUserDetailsService;
import com.testcase.testcasemanagement.service.EmailVerificationService;
import com.testcase.testcasemanagement.service.RefreshTokenService;
import com.testcase.testcasemanagement.service.UserManagementService;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import java.util.Map;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * ICT-441: 회원가입이 예약 사용자명(service-account 로 시작)을 거부하는지 확인한다.
 *
 * <p>예전 API 키 인증은 가상 계정 service-account 로, 지라 연동 토큰 교환은 service-account:키이름 으로 인증했다. 같은 이름으로 가입할 수
 * 있으면 다른 사람이 발급한 키 호출이 가입자 계정으로 실행된다.
 */
public class AuthControllerReservedUsernameTest {

  @Mock private AuthenticationManager authenticationManager;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private CustomUserDetailsService userDetailsService;
  @Mock private UserRepository userRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private RefreshTokenService refreshTokenService;
  @Mock private UserManagementService userManagementService;
  @Mock private EmailVerificationService emailVerificationService;

  private AuthController controller;
  private AutoCloseable mocks;

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
    controller =
        new AuthController(
            authenticationManager,
            jwtTokenUtil,
            userDetailsService,
            userRepository,
            passwordEncoder,
            refreshTokenService,
            userManagementService,
            emailVerificationService,
            new ObjectMapper());
  }

  @AfterMethod
  public void tearDown() throws Exception {
    mocks.close();
  }

  private static User registerRequest(String username) {
    User user = new User();
    user.setUsername(username);
    user.setPassword("Test1234!");
    user.setName("Reserved Name Test");
    user.setEmail("reserved@example.com");
    return user;
  }

  @DataProvider(name = "reservedUsernames")
  public Object[][] reservedUsernames() {
    return new Object[][] {
      {"service-account"},
      {"service-account:My API Key"},
      {"SERVICE-ACCOUNT"},
      {"Service-Account:Forge"},
      {"  service-account"},
      {"service-account-backup"},
    };
  }

  @Test(dataProvider = "reservedUsernames")
  @SuppressWarnings("unchecked")
  public void registerRejectsReservedUsername(String username) {
    ResponseEntity<?> response = controller.registerUser(registerRequest(username));

    assertEquals(response.getStatusCode(), HttpStatus.BAD_REQUEST);
    Map<String, Object> body = (Map<String, Object>) response.getBody();
    assertEquals(body.get("field"), "username");
    assertEquals(body.get("message"), "This username is reserved and cannot be used.");
    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  public void registerAcceptsOrdinaryUsername() {
    when(userRepository.existsByUsername(anyString())).thenReturn(false);
    when(userRepository.existsByEmail(anyString())).thenReturn(false);
    when(passwordEncoder.encode(anyString())).thenReturn("encoded");

    ResponseEntity<?> response = controller.registerUser(registerRequest("my-service-account"));

    assertEquals(response.getStatusCode(), HttpStatus.OK);
    verify(userRepository).save(any(User.class));
  }

  @Test
  public void isReservedUsernameMatchesOnlyPrefix() {
    assertTrue(AuthController.isReservedUsername("service-account"));
    assertTrue(AuthController.isReservedUsername("Service-Account:key"));
    assertFalse(AuthController.isReservedUsername("my-service-account"));
    assertFalse(AuthController.isReservedUsername("service_account"));
    assertFalse(AuthController.isReservedUsername("serviceaccount"));
    assertFalse(AuthController.isReservedUsername(null));
  }
}
