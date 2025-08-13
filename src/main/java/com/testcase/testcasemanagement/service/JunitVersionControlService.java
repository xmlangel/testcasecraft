// src/main/java/com/testcase/testcasemanagement/service/JunitVersionControlService.java

package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

/**
 * ICT-204: 원본 파일 관리 및 버전 제어 시스템
 * 
 * 고급 파일 버전 관리, 백업, 복구 기능 제공
 */
@Service
public class JunitVersionControlService {
    
    private static final Logger logger = LoggerFactory.getLogger(JunitVersionControlService.class);
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Value("${junit.version.storage.dir:versions}")
    private String versionStorageDir;
    
    @Value("${junit.backup.storage.dir:backups}")
    private String backupStorageDir;
    
    @Value("${junit.version.max-versions:10}")
    private int maxVersionsPerFile;
    
    @Value("${junit.backup.auto-backup:true}")
    private boolean autoBackupEnabled;
    
    @Value("${junit.compression.enabled:true}")
    private boolean compressionEnabled;
    
    // 버전 관리 캐시
    private final Map<String, FileVersionHistory> versionCache = new ConcurrentHashMap<>();
    
    /**
     * 파일 버전 생성 및 저장
     * 
     * @param testResultId 테스트 결과 ID
     * @param originalFilePath 원본 파일 경로
     * @param editDescription 편집 설명
     * @param editorUsername 편집자
     * @return 버전 정보
     */
    public FileVersion createVersion(String testResultId, String originalFilePath, 
                                   String editDescription, String editorUsername) throws VersionControlException {
        try {
            // 버전 저장 디렉터리 생성
            Path versionDir = createVersionDirectory(testResultId);
            
            // 버전 번호 생성
            int versionNumber = getNextVersionNumber(testResultId);
            String versionId = generateVersionId(testResultId, versionNumber);
            
            // 원본 파일 읽기 및 압축 저장
            Path originalFile = Paths.get(originalFilePath);
            if (!Files.exists(originalFile)) {
                throw new VersionControlException("Original file not found: " + originalFilePath);
            }
            
            Path versionFile = versionDir.resolve(versionId + (compressionEnabled ? ".gz" : ".xml"));
            
            // 파일 복사 (압축 옵션)
            if (compressionEnabled) {
                compressAndCopyFile(originalFile, versionFile);
            } else {
                Files.copy(originalFile, versionFile, StandardCopyOption.REPLACE_EXISTING);
            }
            
            // 파일 체크섬 계산
            String checksum = calculateFileChecksum(originalFile);
            
            // 버전 메타데이터 생성
            FileVersion version = new FileVersion();
            version.setVersionId(versionId);
            version.setTestResultId(testResultId);
            version.setVersionNumber(versionNumber);
            version.setOriginalFilePath(originalFilePath);
            version.setVersionFilePath(versionFile.toString());
            version.setChecksum(checksum);
            version.setFileSize(Files.size(originalFile));
            version.setCompressed(compressionEnabled);
            version.setCreatedAt(LocalDateTime.now());
            version.setCreatedBy(editorUsername);
            version.setDescription(editDescription);
            
            // 버전 히스토리 업데이트
            updateVersionHistory(testResultId, version);
            
            // 자동 백업
            if (autoBackupEnabled) {
                createBackup(testResultId, version);
            }
            
            // 오래된 버전 정리
            cleanupOldVersions(testResultId);
            
            logger.info("파일 버전 생성 완료 - 테스트 ID: {}, 버전: {}, 편집자: {}", 
                       testResultId, versionNumber, editorUsername);
            
            return version;
            
        } catch (IOException e) {
            logger.error("파일 버전 생성 실패: {}", e.getMessage(), e);
            throw new VersionControlException("Failed to create version: " + e.getMessage(), e);
        }
    }
    
    /**
     * 특정 버전으로 복원
     * 
     * @param testResultId 테스트 결과 ID
     * @param versionNumber 복원할 버전 번호
     * @param targetPath 복원 대상 경로
     * @return 복원된 파일 정보
     */
    public FileRestoreResult restoreVersion(String testResultId, int versionNumber, String targetPath) 
            throws VersionControlException {
        try {
            FileVersionHistory history = getVersionHistory(testResultId);
            
            FileVersion targetVersion = history.getVersions().stream()
                .filter(v -> v.getVersionNumber() == versionNumber)
                .findFirst()
                .orElseThrow(() -> new VersionControlException(
                    "Version not found: " + versionNumber + " for test result: " + testResultId));
            
            Path versionFile = Paths.get(targetVersion.getVersionFilePath());
            Path targetFile = Paths.get(targetPath);
            
            // 압축 해제 또는 직접 복사
            if (targetVersion.isCompressed()) {
                decompressAndCopyFile(versionFile, targetFile);
            } else {
                Files.copy(versionFile, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
            
            // 체크섬 검증
            String restoredChecksum = calculateFileChecksum(targetFile);
            if (!targetVersion.getChecksum().equals(restoredChecksum)) {
                logger.warn("복원된 파일의 체크섬이 일치하지 않음 - 원본: {}, 복원: {}", 
                           targetVersion.getChecksum(), restoredChecksum);
            }
            
            FileRestoreResult result = new FileRestoreResult();
            result.setRestoredVersion(targetVersion);
            result.setTargetPath(targetPath);
            result.setRestoredAt(LocalDateTime.now());
            result.setChecksumValid(targetVersion.getChecksum().equals(restoredChecksum));
            
            logger.info("파일 버전 복원 완료 - 테스트 ID: {}, 버전: {} → {}", 
                       testResultId, versionNumber, targetPath);
            
            return result;
            
        } catch (IOException e) {
            logger.error("파일 버전 복원 실패: {}", e.getMessage(), e);
            throw new VersionControlException("Failed to restore version: " + e.getMessage(), e);
        }
    }
    
    /**
     * 버전 히스토리 조회
     */
    public FileVersionHistory getVersionHistory(String testResultId) throws VersionControlException {
        // 캐시에서 조회
        FileVersionHistory cached = versionCache.get(testResultId);
        if (cached != null) {
            return cached;
        }
        
        try {
            Path versionDir = Paths.get(versionStorageDir, testResultId);
            Path historyFile = versionDir.resolve("history.json");
            
            FileVersionHistory history;
            if (Files.exists(historyFile)) {
                history = objectMapper.readValue(historyFile.toFile(), FileVersionHistory.class);
            } else {
                history = new FileVersionHistory();
                history.setTestResultId(testResultId);
                history.setVersions(new ArrayList<>());
                history.setCreatedAt(LocalDateTime.now());
            }
            
            // 캐시 저장
            versionCache.put(testResultId, history);
            
            return history;
            
        } catch (IOException e) {
            logger.error("버전 히스토리 조회 실패: {}", e.getMessage(), e);
            throw new VersionControlException("Failed to load version history: " + e.getMessage(), e);
        }
    }
    
    /**
     * 버전 간 차이점 분석
     */
    public VersionDiff compareVersions(String testResultId, int version1, int version2) 
            throws VersionControlException {
        try {
            FileVersionHistory history = getVersionHistory(testResultId);
            
            FileVersion v1 = findVersion(history, version1);
            FileVersion v2 = findVersion(history, version2);
            
            if (v1 == null || v2 == null) {
                throw new VersionControlException("One or both versions not found");
            }
            
            // 기본 메타데이터 차이
            VersionDiff diff = new VersionDiff();
            diff.setTestResultId(testResultId);
            diff.setVersion1(v1);
            diff.setVersion2(v2);
            diff.setSizeDifference(v2.getFileSize() - v1.getFileSize());
            diff.setTimeDifference(calculateTimeDifference(v1.getCreatedAt(), v2.getCreatedAt()));
            diff.setChecksumChanged(!v1.getChecksum().equals(v2.getChecksum()));
            
            // 더 상세한 차이점은 필요시 구현 (XML diff 등)
            diff.setSummary(String.format("Version %d → %d: %s bytes, %s", 
                                         version1, version2, 
                                         (diff.getSizeDifference() > 0 ? "+" : "") + diff.getSizeDifference(),
                                         diff.isChecksumChanged() ? "content changed" : "no content change"));
            
            return diff;
            
        } catch (Exception e) {
            logger.error("버전 비교 실패: {}", e.getMessage(), e);
            throw new VersionControlException("Failed to compare versions: " + e.getMessage(), e);
        }
    }
    
    /**
     * 백업 생성
     */
    public BackupResult createBackup(String testResultId, FileVersion version) throws VersionControlException {
        try {
            Path backupDir = createBackupDirectory();
            String backupId = generateBackupId(testResultId);
            Path backupFile = backupDir.resolve(backupId + ".backup");
            
            // 백업 메타데이터와 함께 압축 저장
            BackupData backupData = new BackupData();
            backupData.setTestResultId(testResultId);
            backupData.setVersion(version);
            backupData.setBackupId(backupId);
            backupData.setCreatedAt(LocalDateTime.now());
            
            // 원본 파일 내용 포함
            Path originalFile = Paths.get(version.getOriginalFilePath());
            if (Files.exists(originalFile)) {
                backupData.setFileContent(Files.readAllBytes(originalFile));
            }
            
            // JSON 직렬화 후 압축 저장
            try (FileOutputStream fos = new FileOutputStream(backupFile.toFile());
                 GZIPOutputStream gzos = new GZIPOutputStream(fos);
                 ObjectOutputStream oos = new ObjectOutputStream(gzos)) {
                
                oos.writeObject(backupData);
            }
            
            BackupResult result = new BackupResult();
            result.setBackupId(backupId);
            result.setBackupFilePath(backupFile.toString());
            result.setBackupSize(Files.size(backupFile));
            result.setCreatedAt(LocalDateTime.now());
            
            logger.info("백업 생성 완료 - 테스트 ID: {}, 백업 ID: {}", testResultId, backupId);
            
            return result;
            
        } catch (IOException e) {
            logger.error("백업 생성 실패: {}", e.getMessage(), e);
            throw new VersionControlException("Failed to create backup: " + e.getMessage(), e);
        }
    }
    
    /**
     * 스토리지 통계 정보
     */
    public StorageStatistics getStorageStatistics() {
        StorageStatistics stats = new StorageStatistics();
        
        try {
            // 버전 스토리지 통계
            Path versionPath = Paths.get(versionStorageDir);
            if (Files.exists(versionPath)) {
                try (Stream<Path> paths = Files.walk(versionPath)) {
                    stats.setVersionFileCount(paths.filter(Files::isRegularFile).count());
                    stats.setVersionStorageSize(calculateDirectorySize(versionPath));
                }
            }
            
            // 백업 스토리지 통계
            Path backupPath = Paths.get(backupStorageDir);
            if (Files.exists(backupPath)) {
                try (Stream<Path> paths = Files.walk(backupPath)) {
                    stats.setBackupFileCount(paths.filter(Files::isRegularFile).count());
                    stats.setBackupStorageSize(calculateDirectorySize(backupPath));
                }
            }
            
            stats.setTotalStorageSize(stats.getVersionStorageSize() + stats.getBackupStorageSize());
            stats.setCompressionEnabled(compressionEnabled);
            stats.setAutoBackupEnabled(autoBackupEnabled);
            
        } catch (IOException e) {
            logger.error("스토리지 통계 조회 실패: {}", e.getMessage(), e);
        }
        
        return stats;
    }
    
    // 유틸리티 메서드들
    
    private Path createVersionDirectory(String testResultId) throws IOException {
        Path versionPath = Paths.get(versionStorageDir, testResultId);
        if (!Files.exists(versionPath)) {
            Files.createDirectories(versionPath);
        }
        return versionPath;
    }
    
    private Path createBackupDirectory() throws IOException {
        Path backupPath = Paths.get(backupStorageDir);
        if (!Files.exists(backupPath)) {
            Files.createDirectories(backupPath);
        }
        return backupPath;
    }
    
    private int getNextVersionNumber(String testResultId) throws VersionControlException {
        FileVersionHistory history = getVersionHistory(testResultId);
        return history.getVersions().size() + 1;
    }
    
    private String generateVersionId(String testResultId, int versionNumber) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return String.format("%s_v%d_%s", testResultId, versionNumber, timestamp);
    }
    
    private String generateBackupId(String testResultId) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS"));
        return String.format("backup_%s_%s", testResultId, timestamp);
    }
    
    private void updateVersionHistory(String testResultId, FileVersion version) throws IOException, VersionControlException {
        FileVersionHistory history = getVersionHistory(testResultId);
        history.getVersions().add(version);
        history.setLastUpdated(LocalDateTime.now());
        
        Path versionDir = Paths.get(versionStorageDir, testResultId);
        Path historyFile = versionDir.resolve("history.json");
        
        objectMapper.writeValue(historyFile.toFile(), history);
        
        // 캐시 업데이트
        versionCache.put(testResultId, history);
    }
    
    private void cleanupOldVersions(String testResultId) throws VersionControlException {
        FileVersionHistory history = getVersionHistory(testResultId);
        List<FileVersion> versions = history.getVersions();
        
        if (versions.size() > maxVersionsPerFile) {
            List<FileVersion> toRemove = versions.subList(0, versions.size() - maxVersionsPerFile);
            
            for (FileVersion version : toRemove) {
                try {
                    Path versionFile = Paths.get(version.getVersionFilePath());
                    Files.deleteIfExists(versionFile);
                    logger.info("오래된 버전 파일 삭제: {}", version.getVersionFilePath());
                } catch (IOException e) {
                    logger.warn("버전 파일 삭제 실패: {}", version.getVersionFilePath(), e);
                }
            }
            
            // 히스토리에서 제거
            versions.removeAll(toRemove);
            
            try {
                updateVersionHistory(testResultId, null);
            } catch (IOException | VersionControlException e) {
                logger.error("버전 히스토리 업데이트 실패", e);
            }
        }
    }
    
    private void compressAndCopyFile(Path source, Path target) throws IOException {
        try (InputStream is = Files.newInputStream(source);
             FileOutputStream fos = new FileOutputStream(target.toFile());
             GZIPOutputStream gzos = new GZIPOutputStream(fos)) {
            
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                gzos.write(buffer, 0, bytesRead);
            }
        }
    }
    
    private void decompressAndCopyFile(Path source, Path target) throws IOException {
        try (FileInputStream fis = new FileInputStream(source.toFile());
             GZIPInputStream gzis = new GZIPInputStream(fis);
             OutputStream os = Files.newOutputStream(target)) {
            
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = gzis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
        }
    }
    
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
            return "checksum_error";
        }
    }
    
    private FileVersion findVersion(FileVersionHistory history, int versionNumber) {
        return history.getVersions().stream()
                .filter(v -> v.getVersionNumber() == versionNumber)
                .findFirst()
                .orElse(null);
    }
    
    private long calculateTimeDifference(LocalDateTime time1, LocalDateTime time2) {
        return java.time.Duration.between(time1, time2).toMinutes();
    }
    
    private long calculateDirectorySize(Path directory) throws IOException {
        try (Stream<Path> paths = Files.walk(directory)) {
            return paths.filter(Files::isRegularFile)
                        .mapToLong(path -> {
                            try {
                                return Files.size(path);
                            } catch (IOException e) {
                                return 0L;
                            }
                        })
                        .sum();
        }
    }
    
    // 내부 클래스들
    
    public static class FileVersion implements Serializable {
        private String versionId;
        private String testResultId;
        private int versionNumber;
        private String originalFilePath;
        private String versionFilePath;
        private String checksum;
        private long fileSize;
        private boolean compressed;
        private LocalDateTime createdAt;
        private String createdBy;
        private String description;
        
        // Getters and Setters
        public String getVersionId() { return versionId; }
        public void setVersionId(String versionId) { this.versionId = versionId; }
        
        public String getTestResultId() { return testResultId; }
        public void setTestResultId(String testResultId) { this.testResultId = testResultId; }
        
        public int getVersionNumber() { return versionNumber; }
        public void setVersionNumber(int versionNumber) { this.versionNumber = versionNumber; }
        
        public String getOriginalFilePath() { return originalFilePath; }
        public void setOriginalFilePath(String originalFilePath) { this.originalFilePath = originalFilePath; }
        
        public String getVersionFilePath() { return versionFilePath; }
        public void setVersionFilePath(String versionFilePath) { this.versionFilePath = versionFilePath; }
        
        public String getChecksum() { return checksum; }
        public void setChecksum(String checksum) { this.checksum = checksum; }
        
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
        
        public boolean isCompressed() { return compressed; }
        public void setCompressed(boolean compressed) { this.compressed = compressed; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class FileVersionHistory implements Serializable {
        private String testResultId;
        private List<FileVersion> versions;
        private LocalDateTime createdAt;
        private LocalDateTime lastUpdated;
        
        // Getters and Setters
        public String getTestResultId() { return testResultId; }
        public void setTestResultId(String testResultId) { this.testResultId = testResultId; }
        
        public List<FileVersion> getVersions() { return versions; }
        public void setVersions(List<FileVersion> versions) { this.versions = versions; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    }
    
    public static class FileRestoreResult {
        private FileVersion restoredVersion;
        private String targetPath;
        private LocalDateTime restoredAt;
        private boolean checksumValid;
        
        // Getters and Setters
        public FileVersion getRestoredVersion() { return restoredVersion; }
        public void setRestoredVersion(FileVersion restoredVersion) { this.restoredVersion = restoredVersion; }
        
        public String getTargetPath() { return targetPath; }
        public void setTargetPath(String targetPath) { this.targetPath = targetPath; }
        
        public LocalDateTime getRestoredAt() { return restoredAt; }
        public void setRestoredAt(LocalDateTime restoredAt) { this.restoredAt = restoredAt; }
        
        public boolean isChecksumValid() { return checksumValid; }
        public void setChecksumValid(boolean checksumValid) { this.checksumValid = checksumValid; }
    }
    
    public static class VersionDiff {
        private String testResultId;
        private FileVersion version1;
        private FileVersion version2;
        private long sizeDifference;
        private long timeDifference;
        private boolean checksumChanged;
        private String summary;
        
        // Getters and Setters
        public String getTestResultId() { return testResultId; }
        public void setTestResultId(String testResultId) { this.testResultId = testResultId; }
        
        public FileVersion getVersion1() { return version1; }
        public void setVersion1(FileVersion version1) { this.version1 = version1; }
        
        public FileVersion getVersion2() { return version2; }
        public void setVersion2(FileVersion version2) { this.version2 = version2; }
        
        public long getSizeDifference() { return sizeDifference; }
        public void setSizeDifference(long sizeDifference) { this.sizeDifference = sizeDifference; }
        
        public long getTimeDifference() { return timeDifference; }
        public void setTimeDifference(long timeDifference) { this.timeDifference = timeDifference; }
        
        public boolean isChecksumChanged() { return checksumChanged; }
        public void setChecksumChanged(boolean checksumChanged) { this.checksumChanged = checksumChanged; }
        
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }
    
    public static class BackupData implements Serializable {
        private String testResultId;
        private FileVersion version;
        private String backupId;
        private LocalDateTime createdAt;
        private byte[] fileContent;
        
        // Getters and Setters
        public String getTestResultId() { return testResultId; }
        public void setTestResultId(String testResultId) { this.testResultId = testResultId; }
        
        public FileVersion getVersion() { return version; }
        public void setVersion(FileVersion version) { this.version = version; }
        
        public String getBackupId() { return backupId; }
        public void setBackupId(String backupId) { this.backupId = backupId; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public byte[] getFileContent() { return fileContent; }
        public void setFileContent(byte[] fileContent) { this.fileContent = fileContent; }
    }
    
    public static class BackupResult {
        private String backupId;
        private String backupFilePath;
        private long backupSize;
        private LocalDateTime createdAt;
        
        // Getters and Setters
        public String getBackupId() { return backupId; }
        public void setBackupId(String backupId) { this.backupId = backupId; }
        
        public String getBackupFilePath() { return backupFilePath; }
        public void setBackupFilePath(String backupFilePath) { this.backupFilePath = backupFilePath; }
        
        public long getBackupSize() { return backupSize; }
        public void setBackupSize(long backupSize) { this.backupSize = backupSize; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
    
    public static class StorageStatistics {
        private long versionFileCount;
        private long backupFileCount;
        private long versionStorageSize;
        private long backupStorageSize;
        private long totalStorageSize;
        private boolean compressionEnabled;
        private boolean autoBackupEnabled;
        
        // Getters and Setters
        public long getVersionFileCount() { return versionFileCount; }
        public void setVersionFileCount(long versionFileCount) { this.versionFileCount = versionFileCount; }
        
        public long getBackupFileCount() { return backupFileCount; }
        public void setBackupFileCount(long backupFileCount) { this.backupFileCount = backupFileCount; }
        
        public long getVersionStorageSize() { return versionStorageSize; }
        public void setVersionStorageSize(long versionStorageSize) { this.versionStorageSize = versionStorageSize; }
        
        public long getBackupStorageSize() { return backupStorageSize; }
        public void setBackupStorageSize(long backupStorageSize) { this.backupStorageSize = backupStorageSize; }
        
        public long getTotalStorageSize() { return totalStorageSize; }
        public void setTotalStorageSize(long totalStorageSize) { this.totalStorageSize = totalStorageSize; }
        
        public boolean isCompressionEnabled() { return compressionEnabled; }
        public void setCompressionEnabled(boolean compressionEnabled) { this.compressionEnabled = compressionEnabled; }
        
        public boolean isAutoBackupEnabled() { return autoBackupEnabled; }
        public void setAutoBackupEnabled(boolean autoBackupEnabled) { this.autoBackupEnabled = autoBackupEnabled; }
    }
    
    /**
     * 버전 제어 예외 클래스
     */
    public static class VersionControlException extends Exception {
        public VersionControlException(String message) {
            super(message);
        }
        
        public VersionControlException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}