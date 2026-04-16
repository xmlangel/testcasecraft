// src/test/java/com/testcase/testcasemanagement/service/GoogleConfigServiceTest.java
package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.GoogleConfig;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.GoogleConfigRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import java.util.Optional;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class GoogleConfigServiceTest {

  @Mock private GoogleConfigRepository googleConfigRepository;
  @Mock private UserRepository userRepository;
  @Mock private EncryptionUtil encryptionUtil;
  private ObjectMapper objectMapper;

  @InjectMocks private GoogleConfigService googleConfigService;

  @BeforeMethod
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    this.objectMapper = new ObjectMapper();
    this.googleConfigService =
        new GoogleConfigService(
            googleConfigRepository, userRepository, encryptionUtil, objectMapper);
  }

  @Test
  public void testSaveConfigSuccess() throws Exception {
    String username = "admin";
    String uuid = "309f9b19-870b-44ee-8025-627351404b88";
    String validJson =
        "{\"client_email\":\"test@email.com\",\"project_id\":\"test-123\",\"private_key\":\"ABCDE\"}";

    User mockUser = new User();
    mockUser.setId(uuid);
    mockUser.setUsername(username);

    when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));
    when(encryptionUtil.encrypt(any())).thenReturn("ENCRYPTED_TEXT");
    when(googleConfigRepository.findByUser(any(User.class))).thenReturn(Optional.empty());
    when(googleConfigRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

    GoogleConfig result = googleConfigService.saveConfig(username, validJson);

    assertNotNull(result);
    assertEquals(result.getUser().getId(), uuid);
    assertEquals(result.getClientEmail(), "test@email.com");
    verify(googleConfigRepository).save(any());
  }

  @Test
  public void testGetConfigByUserId() {
    String username = "admin";
    User mockUser = new User();
    mockUser.setId("uuid-123");
    mockUser.setUsername(username);

    GoogleConfig mockConfig = new GoogleConfig();
    mockConfig.setUser(mockUser);
    mockConfig.setClientEmail("test@email.com");

    when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));
    when(googleConfigRepository.findByUser(mockUser)).thenReturn(Optional.of(mockConfig));

    Optional<GoogleConfig> result = googleConfigService.getConfigByUserId(username);

    assertTrue(result.isPresent());
    assertEquals(result.get().getClientEmail(), "test@email.com");
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testSaveConfigInvalidJson() throws Exception {
    String username = "admin";
    String invalidJson = "{ invalid content }";

    User mockUser = new User();
    mockUser.setUsername(username);
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));

    googleConfigService.saveConfig(username, invalidJson);
  }
}
