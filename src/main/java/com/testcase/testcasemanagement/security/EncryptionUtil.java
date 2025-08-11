package com.testcase.testcasemanagement.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.IvParameterSpec;
import java.security.SecureRandom;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

/**
 * AES-256 암호화/복호화 유틸리티 클래스
 * JIRA API 키 및 민감한 데이터 암호화용
 */
@Component
public class EncryptionUtil {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";
    private static final int KEY_LENGTH = 256;
    private static final int IV_LENGTH = 16;

    @Value("${jira.security.encryption.key:#{null}}")
    private String encryptionKeyBase64;

    @Value("${jira.security.encryption.enabled:true}")
    private boolean encryptionEnabled;

    private SecretKey getEncryptionKey() {
        if (encryptionKeyBase64 == null || encryptionKeyBase64.trim().isEmpty()) {
            throw new IllegalStateException("암호화 키가 설정되지 않았습니다. jira.security.encryption.key 환경변수를 설정하세요.");
        }
        
        try {
            byte[] decodedKey = Base64.getDecoder().decode(encryptionKeyBase64);
            return new SecretKeySpec(decodedKey, ALGORITHM);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("암호화 키 형식이 올바르지 않습니다.", e);
        }
    }

    /**
     * AES-256 키 생성 (초기 설정용)
     */
    public static String generateEncryptionKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
            keyGenerator.init(KEY_LENGTH);
            SecretKey secretKey = keyGenerator.generateKey();
            return Base64.getEncoder().encodeToString(secretKey.getEncoded());
        } catch (Exception e) {
            throw new RuntimeException("암호화 키 생성 실패", e);
        }
    }

    /**
     * 문자열 암호화
     * @param plainText 암호화할 평문
     * @return Base64로 인코딩된 암호문 (IV + 암호문)
     */
    public String encrypt(String plainText) {
        if (!encryptionEnabled) {
            return plainText;
        }

        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }

        try {
            SecretKey key = getEncryptionKey();
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);

            // 랜덤 IV 생성
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            // IV와 암호문을 결합
            byte[] encryptedWithIv = new byte[IV_LENGTH + encrypted.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, IV_LENGTH);
            System.arraycopy(encrypted, 0, encryptedWithIv, IV_LENGTH, encrypted.length);

            return Base64.getEncoder().encodeToString(encryptedWithIv);
        } catch (Exception e) {
            throw new RuntimeException("암호화 실패", e);
        }
    }

    /**
     * 문자열 복호화
     * @param encryptedText Base64로 인코딩된 암호문 (IV + 암호문)
     * @return 복호화된 평문
     */
    public String decrypt(String encryptedText) {
        if (!encryptionEnabled) {
            return encryptedText;
        }

        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }

        try {
            SecretKey key = getEncryptionKey();
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);

            // Base64 디코딩
            byte[] encryptedWithIv = Base64.getDecoder().decode(encryptedText);

            // IV와 암호문 분리
            byte[] iv = new byte[IV_LENGTH];
            byte[] encrypted = new byte[encryptedWithIv.length - IV_LENGTH];
            System.arraycopy(encryptedWithIv, 0, iv, 0, IV_LENGTH);
            System.arraycopy(encryptedWithIv, IV_LENGTH, encrypted, 0, encrypted.length);

            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.DECRYPT_MODE, key, ivSpec);

            byte[] decrypted = cipher.doFinal(encrypted);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("복호화 실패", e);
        }
    }

    /**
     * 암호화 활성화 여부 확인
     */
    public boolean isEncryptionEnabled() {
        return encryptionEnabled;
    }

    /**
     * 암호화 키 설정 확인
     */
    public boolean isEncryptionKeyConfigured() {
        return encryptionKeyBase64 != null && !encryptionKeyBase64.trim().isEmpty();
    }

    /**
     * 암호화 시스템 상태 확인
     */
    public SecurityStatus getSecurityStatus() {
        return SecurityStatus.builder()
                .encryptionEnabled(encryptionEnabled)
                .keyConfigured(isEncryptionKeyConfigured())
                .algorithm(ALGORITHM)
                .keyLength(KEY_LENGTH)
                .transformation(TRANSFORMATION)
                .build();
    }

    /**
     * 보안 상태 정보
     */
    public static class SecurityStatus {
        private boolean encryptionEnabled;
        private boolean keyConfigured;
        private String algorithm;
        private int keyLength;
        private String transformation;

        public static SecurityStatusBuilder builder() {
            return new SecurityStatusBuilder();
        }

        // Getters
        public boolean isEncryptionEnabled() { return encryptionEnabled; }
        public boolean isKeyConfigured() { return keyConfigured; }
        public String getAlgorithm() { return algorithm; }
        public int getKeyLength() { return keyLength; }
        public String getTransformation() { return transformation; }

        public static class SecurityStatusBuilder {
            private SecurityStatus status = new SecurityStatus();

            public SecurityStatusBuilder encryptionEnabled(boolean enabled) {
                status.encryptionEnabled = enabled;
                return this;
            }

            public SecurityStatusBuilder keyConfigured(boolean configured) {
                status.keyConfigured = configured;
                return this;
            }

            public SecurityStatusBuilder algorithm(String algorithm) {
                status.algorithm = algorithm;
                return this;
            }

            public SecurityStatusBuilder keyLength(int keyLength) {
                status.keyLength = keyLength;
                return this;
            }

            public SecurityStatusBuilder transformation(String transformation) {
                status.transformation = transformation;
                return this;
            }

            public SecurityStatus build() {
                return status;
            }
        }
    }
}