// src/main/java/com/testcase/testcasemanagement/service/EncryptionService.java
package com.testcase.testcasemanagement.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.IvParameterSpec;
import java.security.SecureRandom;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class EncryptionService {
    
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";
    private static final int IV_LENGTH = 16; // 128-bit IV for AES
    private static final int KEY_LENGTH = 256; // 256-bit key for AES-256
    
    @Value("${app.encryption.secret-key:#{null}}")
    private String configuredSecretKey;
    
    private SecretKey secretKey;
    
    /**
     * 서비스 초기화 시 암호화 키 설정
     */
    @PostConstruct
    public void initializeKey() {
        try {
            if (configuredSecretKey != null && !configuredSecretKey.isEmpty()) {
                // 설정된 키 사용
                byte[] keyBytes = Base64.getDecoder().decode(configuredSecretKey);
                this.secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
                log.info("암호화 서비스 초기화: 설정된 키 사용");
            } else {
                // 새로운 키 생성
                KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
                keyGenerator.init(KEY_LENGTH);
                this.secretKey = keyGenerator.generateKey();
                
                // 생성된 키를 Base64로 인코딩하여 로그에 출력 (실제 운영환경에서는 보안상 제거 필요)
                String encodedKey = Base64.getEncoder().encodeToString(this.secretKey.getEncoded());
                log.warn("새로운 암호화 키 생성: {}", encodedKey);
                log.warn("운영환경에서는 app.encryption.secret-key 설정 필요");
            }
        } catch (Exception e) {
            log.error("암호화 서비스 초기화 실패", e);
            throw new RuntimeException("암호화 서비스 초기화 실패", e);
        }
    }
    
    /**
     * 문자열 암호화
     * @param plainText 암호화할 평문
     * @return Base64로 인코딩된 암호화 문자열 (IV + 암호문)
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        
        try {
            if (secretKey == null) {
                initializeKey();
            }
            
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            
            // 랜덤 IV 생성
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            
            // IV와 암호문을 결합
            byte[] encryptedWithIv = new byte[IV_LENGTH + encryptedBytes.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, IV_LENGTH);
            System.arraycopy(encryptedBytes, 0, encryptedWithIv, IV_LENGTH, encryptedBytes.length);
            
            return Base64.getEncoder().encodeToString(encryptedWithIv);
            
        } catch (Exception e) {
            log.error("암호화 실패", e);
            throw new RuntimeException("암호화 실패", e);
        }
    }
    
    /**
     * 문자열 복호화
     * @param encryptedText Base64로 인코딩된 암호화 문자열 (IV + 암호문)
     * @return 복호화된 평문
     */
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }
        
        try {
            if (secretKey == null) {
                initializeKey();
            }
            
            byte[] encryptedWithIv = Base64.getDecoder().decode(encryptedText);
            
            // IV 추출
            byte[] iv = new byte[IV_LENGTH];
            System.arraycopy(encryptedWithIv, 0, iv, 0, IV_LENGTH);
            
            // 암호문 추출
            byte[] encryptedBytes = new byte[encryptedWithIv.length - IV_LENGTH];
            System.arraycopy(encryptedWithIv, IV_LENGTH, encryptedBytes, 0, encryptedBytes.length);
            
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
            
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            log.error("복호화 실패", e);
            throw new RuntimeException("복호화 실패", e);
        }
    }
    
    /**
     * 암호화 키 검증
     * @return 키가 정상적으로 설정되어 있는지 여부
     */
    public boolean isKeyValid() {
        try {
            if (secretKey == null) {
                initializeKey();
            }
            
            // 테스트 암호화/복호화 수행
            String testText = "test";
            String encrypted = encrypt(testText);
            String decrypted = decrypt(encrypted);
            
            return testText.equals(decrypted);
        } catch (Exception e) {
            log.error("암호화 키 검증 실패", e);
            return false;
        }
    }
    
    /**
     * 새로운 암호화 키 생성 (관리자 전용)
     * @return Base64로 인코딩된 새로운 키
     */
    public String generateNewKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
            keyGenerator.init(KEY_LENGTH);
            SecretKey newKey = keyGenerator.generateKey();
            
            return Base64.getEncoder().encodeToString(newKey.getEncoded());
        } catch (Exception e) {
            log.error("새 암호화 키 생성 실패", e);
            throw new RuntimeException("새 암호화 키 생성 실패", e);
        }
    }
}