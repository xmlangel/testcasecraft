package com.testcase.testcasemanagement.service;

import io.minio.*;
import io.minio.errors.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * MinIO Object Storage 서비스
 *
 * TestCase 첨부파일을 MinIO에 업로드/다운로드/삭제하는 기능을 제공합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MinIOService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucketName;

    @Value("${minio.enabled:true}")
    private boolean enabled;

    /**
     * 초기화 시 버킷 존재 확인 및 생성
     */
    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("MinIO service is disabled. Skipping initialization.");
            return;
        }
        ensureBucketExists();
    }

    /**
     * 버킷 존재 확인 및 생성
     */
    private void ensureBucketExists() {
        try {
            boolean bucketExists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build());

            if (!bucketExists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Created MinIO bucket: {}", bucketName);
            } else {
                log.info("MinIO bucket already exists: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("Error ensuring bucket exists: {}", e.getMessage(), e);
            throw new RuntimeException("MinIO bucket error: " + e.getMessage(), e);
        }
    }

    /**
     * 파일 업로드
     *
     * @param file      MultipartFile 객체
     * @param objectKey 객체 키 (파일명)
     * @return 업로드 메타데이터
     * @throws IOException 파일 읽기 오류
     */
    public Map<String, Object> uploadFile(MultipartFile file, String objectKey) throws IOException {
        try {
            String contentType = file.getContentType();
            if (contentType == null || contentType.isEmpty()) {
                contentType = "application/octet-stream";
            }

            // MinIO에 파일 업로드
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(contentType)
                            .build());

            log.info("Uploaded file to MinIO: {} ({} bytes)", objectKey, file.getSize());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("bucket", bucketName);
            metadata.put("objectKey", objectKey);
            metadata.put("fileSize", file.getSize());
            metadata.put("contentType", contentType);

            return metadata;

        } catch (ErrorResponseException | InsufficientDataException | InternalException | InvalidKeyException
                | InvalidResponseException | NoSuchAlgorithmException | ServerException | XmlParserException e) {
            log.error("MinIO upload error: {}", e.getMessage(), e);
            throw new IOException("File upload failed: " + e.getMessage(), e);
        }
    }

    /**
     * 파일 다운로드
     *
     * @param objectKey 객체 키 (파일명)
     * @return 파일 InputStream
     * @throws IOException 파일 다운로드 오류
     */
    public InputStream downloadFile(String objectKey) throws IOException {
        try {
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build());

            log.info("Downloaded file from MinIO: {}", objectKey);
            return stream;

        } catch (ErrorResponseException e) {
            if (e.errorResponse().code().equals("NoSuchKey")) {
                log.error("File not found in MinIO: {}", objectKey);
                throw new IOException("File not found in storage: " + objectKey);
            }
            log.error("MinIO download error for {}: {}", objectKey, e.getMessage(), e);
            throw new IOException("File download failed: " + e.getMessage(), e);

        } catch (InsufficientDataException | InternalException | InvalidKeyException | InvalidResponseException
                | NoSuchAlgorithmException | ServerException | XmlParserException e) {
            log.error("Unexpected error during download: {}", e.getMessage(), e);
            throw new IOException("Download error: " + e.getMessage(), e);
        }
    }

    /**
     * 파일 삭제
     *
     * @param objectKey 객체 키 (파일명)
     * @return 삭제 성공 여부
     */
    public boolean deleteFile(String objectKey) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build());

            log.info("Deleted file from MinIO: {}", objectKey);
            return true;

        } catch (ErrorResponseException e) {
            if (e.errorResponse().code().equals("NoSuchKey")) {
                log.warn("File not found in MinIO, skipping deletion: {}", objectKey);
                return true;
            }
            log.error("MinIO delete error for {}: {}", objectKey, e.getMessage(), e);
            throw new RuntimeException("File deletion failed: " + e.getMessage(), e);

        } catch (Exception e) {
            log.error("Unexpected error during deletion: {}", e.getMessage(), e);
            throw new RuntimeException("Deletion error: " + e.getMessage(), e);
        }
    }

    /**
     * 파일 메타데이터 조회
     *
     * @param objectKey 객체 키 (파일명)
     * @return 파일 메타데이터
     * @throws IOException 메타데이터 조회 오류
     */
    public Map<String, Object> getFileMetadata(String objectKey) throws IOException {
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("bucket", bucketName);
            metadata.put("objectKey", objectKey);
            metadata.put("size", stat.size());
            metadata.put("contentType", stat.contentType());
            metadata.put("etag", stat.etag());
            metadata.put("lastModified", stat.lastModified());

            return metadata;

        } catch (ErrorResponseException e) {
            if (e.errorResponse().code().equals("NoSuchKey")) {
                log.error("File not found in MinIO: {}", objectKey);
                throw new IOException("File not found in storage: " + objectKey);
            }
            log.error("MinIO stat error for {}: {}", objectKey, e.getMessage(), e);
            throw new IOException("Failed to get file metadata: " + e.getMessage(), e);

        } catch (Exception e) {
            log.error("Unexpected error getting metadata: {}", e.getMessage(), e);
            throw new IOException("Metadata error: " + e.getMessage(), e);
        }
    }

    /**
     * Presigned URL 생성 (임시 다운로드 링크)
     *
     * @param objectKey     객체 키 (파일명)
     * @param expiryMinutes 만료 시간 (분)
     * @return Presigned URL
     * @throws IOException URL 생성 오류
     */
    public String generatePresignedUrl(String objectKey, int expiryMinutes) throws IOException {
        try {
            String url = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectKey)
                            .expiry(expiryMinutes, TimeUnit.MINUTES)
                            .build());

            log.info("Generated presigned URL for: {}", objectKey);
            return url;

        } catch (Exception e) {
            log.error("MinIO presigned URL error for {}: {}", objectKey, e.getMessage(), e);
            throw new IOException("Failed to generate download URL: " + e.getMessage(), e);
        }
    }

    /**
     * 객체 태그 설정
     *
     * @param objectKey 객체 키 (파일명)
     * @param tags      태그 맵
     * @throws IOException 태그 설정 오류
     */
    public void setObjectTags(String objectKey, Map<String, String> tags) throws IOException {
        try {
            minioClient.setObjectTags(
                    SetObjectTagsArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .tags(tags)
                            .build());

            log.info("Set tags for object {}: {}", objectKey, tags);

        } catch (Exception e) {
            log.error("MinIO set tags error for {}: {}", objectKey, e.getMessage(), e);
            throw new IOException("Failed to set object tags: " + e.getMessage(), e);
        }
    }
}
