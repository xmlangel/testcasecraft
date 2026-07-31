package com.testcase.testcasemanagement.config;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;

import com.testcase.testcasemanagement.model.ServiceApiKey;
import com.testcase.testcasemanagement.repository.ServiceApiKeyRepository;
import com.testcase.testcasemanagement.util.ApiKeyHasher;
import java.time.LocalDateTime;
import java.util.List;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** ApiKeyHashMigrationRunner 단위 테스트 — 평문 키 백필의 멱등성 검증. */
public class ApiKeyHashMigrationRunnerTest {

  @Mock private ServiceApiKeyRepository repository;
  private ApiKeyHashMigrationRunner runner;
  private AutoCloseable mocks;

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
    runner = new ApiKeyHashMigrationRunner(repository);
  }

  @AfterMethod
  public void tearDown() throws Exception {
    mocks.close();
  }

  private ServiceApiKey key(String id, String storedApiKey) {
    return ServiceApiKey.builder()
        .id(id)
        .name(id)
        .apiKey(storedApiKey)
        .expiresAt(LocalDateTime.now().plusDays(1))
        .isActive(true)
        .build();
  }

  @Test
  public void backfillsOnlyPlaintextRows_andPreservesLookupEquivalence() {
    String rawKey = "Ab-Cd_1234567890ABCDEFghijklmnopqrstuvwxyz12";
    ServiceApiKey plaintextRow = key("plain", rawKey);
    ServiceApiKey alreadyHashedRow = key("hashed", ApiKeyHasher.sha256Hex("other-key"));
    when(repository.findAll()).thenReturn(List.of(plaintextRow, alreadyHashedRow));

    runner.run();

    // 평문 행만 1회 저장(해시로 치환)되고, 이미 해시된 행은 건드리지 않는다
    ArgumentCaptor<ServiceApiKey> saved = ArgumentCaptor.forClass(ServiceApiKey.class);
    verify(repository, times(1)).save(saved.capture());
    assertEquals(saved.getValue().getId(), "plain");
    // 저장된 값 = 원본 키의 해시 → 클라이언트의 원본 키 조회가 그대로 유효
    assertEquals(saved.getValue().getApiKey(), ApiKeyHasher.sha256Hex(rawKey));
  }

  @Test
  public void isIdempotent_secondRunSavesNothing() {
    ServiceApiKey hashedRow = key("hashed", ApiKeyHasher.sha256Hex("k"));
    when(repository.findAll()).thenReturn(List.of(hashedRow));

    runner.run();

    verify(repository, never()).save(any());
  }
}
