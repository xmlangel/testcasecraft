// src/main/java/com/testcase/testcasemanagement/service/JunitFileStorageService.java

package com.testcase.testcasemanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

/**
 * ICT-203: JUnit XML 파일 저장 및 관리 서비스
 * 원본 파일 보존 및 파일 시스템 관리
 */
@Service
public class JunitFileStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(JunitFileStorageService.class);
    
    // 허용되는 파일 확장자
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".xml", ".XML");
    
    // 최대 파일 크기 (100MB)
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024L;
    
    @Value("${junit.file.upload.dir:uploads/junit}")
    private String uploadDir;
    
    @Value("${junit.file.max-size:104857600}") // 100MB
    private long maxFileSize;
    
    /**
     * JUnit XML 파일 업로드 및 저장
     * 
     * @param file 업로드된 파일
     * @param projectId 프로젝트 ID
     * @return 저장된 파일 정보
     * @throws FileStorageException 파일 저장 중 오류 발생 시
     */
    public FileStorageResult storeFile(MultipartFile file, String projectId) throws FileStorageException {
        validateFile(file);
        
        try {
            // 저장 디렉터리 생성
            Path projectUploadPath = createProjectDirectory(projectId);
            
            // 파일명 정규화 및 중복 방지
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String storedFileName = generateUniqueFileName(originalFileName);
            Path targetLocation = projectUploadPath.resolve(storedFileName);
            
            // 파일 저장
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            
            // 체크섬 계산
            String checksum = calculateFileChecksum(targetLocation);
            
            // 결과 객체 생성
            FileStorageResult result = new FileStorageResult();
            result.setOriginalFileName(originalFileName);
            result.setStoredFileName(storedFileName);
            result.setFilePath(targetLocation.toString());
            result.setFileSize(file.getSize());
            result.setChecksum(checksum);
            result.setContentType(file.getContentType());
            
            logger.info("JUnit XML 파일 저장 완료 - 파일: {}, 경로: {}, 크기: {}bytes", 
                       originalFileName, targetLocation, file.getSize());
            
            return result;
            
        } catch (IOException e) {
            logger.error("파일 저장 중 오류 발생: {}", e.getMessage(), e);
            throw new FileStorageException("Failed to store file: " + e.getMessage(), e);
        }
    }
    
    /**
     * 저장된 파일 읽기
     * 
     * @param filePath 파일 경로
     * @return 파일의 InputStream
     * @throws FileStorageException 파일 읽기 중 오류 발생 시
     */
    public InputStream loadFileAsInputStream(String filePath) throws FileStorageException {
        try {
            Path file = Paths.get(filePath);
            if (!Files.exists(file) || !Files.isReadable(file)) {
                throw new FileStorageException("File not found or not readable: " + filePath);
            }
            
            return Files.newInputStream(file);
            
        } catch (IOException e) {
            logger.error("파일 읽기 중 오류 발생: {}", e.getMessage(), e);
            throw new FileStorageException("Failed to load file: " + e.getMessage(), e);
        }
    }
    
    /**
     * 파일 삭제
     * 
     * @param filePath 삭제할 파일 경로
     * @return 삭제 성공 여부
     */
    public boolean deleteFile(String filePath) {
        try {
            Path file = Paths.get(filePath);
            boolean deleted = Files.deleteIfExists(file);
            
            if (deleted) {
                logger.info("파일 삭제 완료: {}", filePath);
            } else {
                logger.warn("삭제할 파일이 존재하지 않음: {}", filePath);
            }
            
            return deleted;
            
        } catch (IOException e) {
            logger.error("파일 삭제 중 오류 발생: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * 파일 유효성 검증
     */
    private void validateFile(MultipartFile file) throws FileStorageException {
        // 파일 존재 여부 확인
        if (file.isEmpty()) {
            throw new FileStorageException("Cannot store empty file");
        }
        
        // 파일명 확인
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new FileStorageException("File name cannot be empty");
        }
        
        // 파일 확장자 확인
        if (!isValidFileExtension(fileName)) {
            throw new FileStorageException("Invalid file type. Only XML files are allowed");
        }
        
        // 파일 크기 확인
        if (file.getSize() > maxFileSize) {
            throw new FileStorageException(
                String.format("File size (%d bytes) exceeds maximum allowed size (%d bytes)", 
                             file.getSize(), maxFileSize));
        }
        
        // 위험한 경로 문자 확인
        if (fileName.contains("..")) {
            throw new FileStorageException("Filename contains invalid path sequence: " + fileName);
        }
    }
    
    /**
     * 파일 확장자 유효성 확인
     */
    private boolean isValidFileExtension(String fileName) {
        return ALLOWED_EXTENSIONS.stream()
                .anyMatch(ext -> fileName.toLowerCase().endsWith(ext.toLowerCase()));
    }
    
    /**
     * 프로젝트별 디렉터리 생성
     */
    private Path createProjectDirectory(String projectId) throws IOException {
        Path projectPath = Paths.get(uploadDir, projectId);
        
        if (!Files.exists(projectPath)) {
            Files.createDirectories(projectPath);
            logger.info("프로젝트 업로드 디렉터리 생성: {}", projectPath);
        }
        
        return projectPath;
    }
    
    /**
     * 중복되지 않는 파일명 생성
     */
    private String generateUniqueFileName(String originalFileName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        
        // 파일명과 확장자 분리
        int lastDotIndex = originalFileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            String baseName = originalFileName.substring(0, lastDotIndex);
            String extension = originalFileName.substring(lastDotIndex);
            return String.format("%s_%s%s", baseName, timestamp, extension);
        } else {
            return String.format("%s_%s", originalFileName, timestamp);
        }
    }
    
    /**
     * 파일 체크섬 계산 (SHA-256)
     */
    private String calculateFileChecksum(Path filePath) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            
            try (InputStream inputStream = Files.newInputStream(filePath)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    digest.update(buffer, 0, bytesRead);
                }
            }
            
            byte[] hashBytes = digest.digest();
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                hexString.append(String.format("%02x", b));
            }
            
            return hexString.toString();
            
        } catch (NoSuchAlgorithmException e) {
            logger.error("SHA-256 알고리즘을 찾을 수 없음", e);
            return null;
        }
    }
    
    /**
     * 파일 저장 결과 클래스
     */
    public static class FileStorageResult {
        private String originalFileName;
        private String storedFileName;
        private String filePath;
        private long fileSize;
        private String checksum;
        private String contentType;
        
        // Getters and Setters
        public String getOriginalFileName() { return originalFileName; }
        public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
        
        public String getStoredFileName() { return storedFileName; }
        public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }
        
        public String getFilePath() { return filePath; }
        public void setFilePath(String filePath) { this.filePath = filePath; }
        
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
        
        public String getChecksum() { return checksum; }
        public void setChecksum(String checksum) { this.checksum = checksum; }
        
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
    }
    
    /**
     * 파일 저장 예외 클래스
     */
    public static class FileStorageException extends Exception {
        public FileStorageException(String message) {
            super(message);
        }
        
        public FileStorageException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}