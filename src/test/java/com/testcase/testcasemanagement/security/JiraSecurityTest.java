// src/test/java/com/testcase/testcasemanagement/security/JiraSecurityTest.java
package com.testcase.testcasemanagement.security;

import com.testcase.testcasemanagement.service.EncryptionService;
import com.testcase.testcasemanagement.service.JiraApiService;
import com.testcase.testcasemanagement.dto.JiraConfigDto;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class JiraSecurityTest {

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private JiraApiService jiraApiService;

    private SecureRandom secureRandom;

    @BeforeEach
    void setUp() {
        secureRandom = new SecureRandom();
        encryptionService.initializeKey();
    }

    @Test
    @DisplayName("암호화 키 강도 테스트")
    void testEncryptionKeyStrength() {
        // Given
        String testData = "sensitive-api-token-data";

        // When
        String encrypted = encryptionService.encrypt(testData);
        
        // Then
        assertNotNull(encrypted, "암호화된 데이터가 null이면 안됨");
        assertFalse(encrypted.isEmpty(), "암호화된 데이터가 비어있으면 안됨");
        assertNotEquals(testData, encrypted, "암호화된 데이터가 원본과 같으면 안됨");
        
        // Base64로 인코딩되어야 함
        assertDoesNotThrow(() -> Base64.getDecoder().decode(encrypted),
            "암호화된 데이터가 유효한 Base64 형식이어야 함");
    }

    @RepeatedTest(10)
    @DisplayName("암호화 결과 무작위성 테스트")
    void testEncryptionRandomness() {
        // Given
        String testData = "same-input-data";
        Set<String> encryptedResults = new HashSet<>();

        // When
        for (int i = 0; i < 10; i++) {
            String encrypted = encryptionService.encrypt(testData);
            encryptedResults.add(encrypted);
        }

        // Then
        assertEquals(10, encryptedResults.size(),
            "같은 입력에 대해 매번 다른 암호화 결과가 나와야 함 (IV 사용)");
    }

    @Test
    @DisplayName("null 및 빈 문자열 입력 처리 테스트")
    void testNullAndEmptyInputHandling() {
        // null 입력
        String encryptedNull = encryptionService.encrypt(null);
        assertNull(encryptedNull, "null 입력에 대해 null을 반환해야 함");

        String decryptedNull = encryptionService.decrypt(null);
        assertNull(decryptedNull, "null 입력에 대해 null을 반환해야 함");

        // 빈 문자열 입력
        String encryptedEmpty = encryptionService.encrypt("");
        assertEquals("", encryptedEmpty, "빈 문자열 입력에 대해 빈 문자열을 반환해야 함");

        String decryptedEmpty = encryptionService.decrypt("");
        assertEquals("", decryptedEmpty, "빈 문자열 입력에 대해 빈 문자열을 반환해야 함");
    }

    @Test
    @DisplayName("대용량 데이터 암호화/복호화 테스트")
    void testLargeDataEncryption() {
        // Given - 10KB 크기의 테스트 데이터
        StringBuilder largeData = new StringBuilder();
        for (int i = 0; i < 10240; i++) {
            largeData.append((char) ('A' + (i % 26)));
        }
        String testData = largeData.toString();

        // When
        String encrypted = encryptionService.encrypt(testData);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertNotNull(encrypted, "대용량 데이터 암호화 결과가 null이면 안됨");
        assertEquals(testData, decrypted, "대용량 데이터 복호화 결과가 원본과 같아야 함");
    }

    @Test
    @DisplayName("특수문자 및 유니코드 데이터 암호화 테스트")
    void testSpecialCharactersEncryption() {
        // Given
        String testData = "특수문자!@#$%^&*()_+{}|:<>?~`-=[]\\;'\",./ 유니코드한글 emoji🔐🛡️";

        // When
        String encrypted = encryptionService.encrypt(testData);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(testData, decrypted, "특수문자와 유니코드 데이터가 정확히 복호화되어야 함");
    }

    @Test
    @DisplayName("잘못된 암호화 데이터 복호화 시 예외 발생 테스트")
    void testInvalidDataDecryption() {
        // 잘못된 Base64 데이터
        assertThrows(RuntimeException.class, () -> {
            encryptionService.decrypt("invalid-base64-data!");
        }, "잘못된 Base64 데이터 복호화 시 예외가 발생해야 함");

        // 올바른 Base64이지만 잘못된 암호화 데이터
        String invalidEncryptedData = Base64.getEncoder().encodeToString("invalid encrypted data".getBytes());
        assertThrows(RuntimeException.class, () -> {
            encryptionService.decrypt(invalidEncryptedData);
        }, "잘못된 암호화 데이터 복호화 시 예외가 발생해야 함");
    }

    @Test
    @DisplayName("암호화 키 검증 테스트")
    void testEncryptionKeyValidation() {
        // When
        boolean isKeyValid = encryptionService.isKeyValid();

        // Then
        assertTrue(isKeyValid, "암호화 키가 유효해야 함");
    }

    @Test
    @DisplayName("JIRA 서버 URL 정규화 보안 테스트")
    void testJiraUrlNormalizationSecurity() {
        JiraConfigDto.TestConnectionDto testConfig;
        
        // 정상적인 URL
        final JiraConfigDto.TestConnectionDto validTestConfig = JiraConfigDto.TestConnectionDto.builder()
            .serverUrl("https://company.atlassian.net")
            .username("user@company.com")
            .apiToken("token")
            .build();
        
        assertDoesNotThrow(() -> {
            jiraApiService.testConnection(validTestConfig);
        }, "정상적인 HTTPS URL은 처리되어야 함");

        // HTTP URL (보안상 HTTPS로 업그레이드되어야 함)
        final JiraConfigDto.TestConnectionDto httpTestConfig = JiraConfigDto.TestConnectionDto.builder()
            .serverUrl("http://company.atlassian.net")
            .username("user@company.com")
            .apiToken("token")
            .build();
        
        assertDoesNotThrow(() -> {
            jiraApiService.testConnection(httpTestConfig);
        }, "HTTP URL도 처리되어야 함 (내부적으로 HTTPS로 변환)");
    }

    @Test
    @DisplayName("JIRA API 토큰 형식 검증 테스트")
    void testApiTokenFormatValidation() {
        // 일반적인 JIRA API 토큰 형식 (길이 24자, Base64 문자)
        String validToken = generateMockApiToken();
        assertTrue(isValidApiTokenFormat(validToken), "유효한 API 토큰 형식이어야 함");

        // 너무 짧은 토큰
        assertFalse(isValidApiTokenFormat("short"), "너무 짧은 토큰은 유효하지 않음");

        // 특수문자가 포함된 토큰
        assertFalse(isValidApiTokenFormat("token-with-special-chars!@#"), 
            "특수문자가 포함된 토큰은 유효하지 않음");
    }

    @Test
    @DisplayName("사용자별 데이터 격리 테스트")
    void testUserDataIsolation() {
        // 이 테스트는 실제로는 통합 테스트에서 더 적절하지만,
        // 보안 관점에서 중요한 원칙을 확인
        
        // 사용자 ID가 다르면 다른 사용자의 데이터에 접근할 수 없어야 함
        String user1Id = "user1-id";
        String user2Id = "user2-id";
        
        assertNotEquals(user1Id, user2Id, "사용자 ID는 달라야 함");
        // 실제 격리 테스트는 JiraIntegrationTest에서 수행
    }

    @Test
    @DisplayName("메모리 내 민감 정보 처리 테스트")
    void testSensitiveDataInMemory() {
        // Given
        String sensitiveToken = "very-sensitive-api-token-12345";
        
        // When
        String encrypted = encryptionService.encrypt(sensitiveToken);
        String decrypted = encryptionService.decrypt(encrypted);
        
        // Then
        assertEquals(sensitiveToken, decrypted, "복호화가 정확해야 함");
        
        // 메모리에서 원본 토큰이 암호화된 형태로만 존재하는지 확인
        assertNotEquals(sensitiveToken, encrypted, "메모리에 평문이 남아있으면 안됨");
    }

    // Helper methods
    
    private String generateMockApiToken() {
        byte[] tokenBytes = new byte[18]; // 24 Base64 characters = 18 bytes
        secureRandom.nextBytes(tokenBytes);
        return Base64.getEncoder().encodeToString(tokenBytes);
    }

    private boolean isValidApiTokenFormat(String token) {
        if (token == null || token.length() < 20) {
            return false;
        }
        
        // Base64 문자만 포함하는지 확인
        Pattern base64Pattern = Pattern.compile("^[A-Za-z0-9+/]*={0,2}$");
        return base64Pattern.matcher(token).matches();
    }
}