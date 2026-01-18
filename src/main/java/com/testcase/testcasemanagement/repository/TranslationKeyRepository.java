// src/main/java/com/testcase/testcasemanagement/repository/TranslationKeyRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TranslationKey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationKeyRepository extends JpaRepository<TranslationKey, String> {

    // 키 이름으로 조회
    Optional<TranslationKey> findByKeyName(String keyName);

    // 키 이름 존재 여부 확인
    boolean existsByKeyName(String keyName);

    // 카테고리별 키 조회
    List<TranslationKey> findByCategory(String category);

    // 활성화된 키들만 조회
    List<TranslationKey> findByIsActiveTrue();

    // 활성 상태별 키 조회
    List<TranslationKey> findByIsActive(Boolean isActive);

    // 카테고리와 활성 상태로 키 조회
    List<TranslationKey> findByCategoryAndIsActive(String category, Boolean isActive);

    // 키 이름에 키워드 포함 (대소문자 무시)
    List<TranslationKey> findByKeyNameContainingIgnoreCase(String keyword);

    // 키 이름에 키워드 포함하며 활성 상태로 필터링
    List<TranslationKey> findByKeyNameContainingIgnoreCaseAndIsActive(String keyword, Boolean isActive);

    // 키 이름에 키워드 포함하며 카테고리로 필터링
    List<TranslationKey> findByKeyNameContainingIgnoreCaseAndCategory(String keyword, String category);

    // 키 이름에 키워드 포함하며 카테고리와 활성 상태로 필터링
    List<TranslationKey> findByKeyNameContainingIgnoreCaseAndCategoryAndIsActive(String keyword, String category, Boolean isActive);

    // 카테고리별 활성화된 키들 조회
    @Query("SELECT tk FROM TranslationKey tk WHERE tk.category = :category AND tk.isActive = true")
    List<TranslationKey> findActiveByCateogory(@Param("category") String category);

    // 키 이름 패턴으로 검색
    @Query("SELECT tk FROM TranslationKey tk WHERE tk.keyName LIKE :pattern AND tk.isActive = true")
    List<TranslationKey> findByKeyNamePattern(@Param("pattern") String pattern);

    // 키워드로 검색 (키 이름, 설명, 기본값에서 검색)
    @Query("SELECT tk FROM TranslationKey tk WHERE " +
           "LOWER(tk.keyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(tk.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(tk.defaultValue) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<TranslationKey> searchByKeyword(@Param("keyword") String keyword);

    // 키워드와 카테고리로 검색
    // PostgreSQL 타입 추론 문제 해결: :keyword = '' 조건 추가로 String 타입 명시
    @Query("SELECT tk FROM TranslationKey tk WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(tk.keyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(tk.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(tk.defaultValue) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:category IS NULL OR tk.category = :category) " +
           "AND (:isActive IS NULL OR tk.isActive = :isActive)")
    List<TranslationKey> searchByKeywordAndFilters(@Param("keyword") String keyword,
                                                  @Param("category") String category,
                                                  @Param("isActive") Boolean isActive);

    // 모든 카테고리 목록 조회
    @Query("SELECT DISTINCT tk.category FROM TranslationKey tk WHERE tk.category IS NOT NULL AND tk.isActive = true")
    List<String> findAllCategories();

    // 특정 언어에 번역이 없는 키들 조회
    @Query("SELECT tk FROM TranslationKey tk WHERE tk.isActive = true AND tk.id NOT IN " +
           "(SELECT DISTINCT t.translationKey.id FROM Translation t WHERE t.language.code = :languageCode AND t.isActive = true)")
    List<TranslationKey> findKeysWithoutTranslation(@Param("languageCode") String languageCode);

    // 특정 언어에 번역이 있는 키들 조회
    @Query("SELECT tk FROM TranslationKey tk WHERE tk.isActive = true AND tk.id IN " +
           "(SELECT DISTINCT t.translationKey.id FROM Translation t WHERE t.language.code = :languageCode AND t.isActive = true)")
    List<TranslationKey> findKeysWithTranslation(@Param("languageCode") String languageCode);

    // 카테고리별 키 개수 조회
    @Query("SELECT tk.category, COUNT(tk) FROM TranslationKey tk WHERE tk.isActive = true GROUP BY tk.category")
    List<Object[]> getKeyCountByCategory();

    // ==================== 페이지네이션 메서드 ====================

    // 키워드와 필터로 검색 (페이지네이션)
    // PostgreSQL 타입 추론 문제 해결: :keyword = '' 조건 추가로 String 타입 명시
    @Query("SELECT tk FROM TranslationKey tk WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(tk.keyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(tk.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(tk.defaultValue) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:category IS NULL OR tk.category = :category) " +
           "AND (:isActive IS NULL OR tk.isActive = :isActive)")
    Page<TranslationKey> searchByKeywordAndFilters(@Param("keyword") String keyword,
                                                  @Param("category") String category,
                                                  @Param("isActive") Boolean isActive,
                                                  Pageable pageable);

    // 카테고리별 페이지네이션
    Page<TranslationKey> findByCategory(String category, Pageable pageable);

    // 활성 상태별 페이지네이션
    Page<TranslationKey> findByIsActive(Boolean isActive, Pageable pageable);

    // 카테고리와 활성 상태별 페이지네이션
    Page<TranslationKey> findByCategoryAndIsActive(String category, Boolean isActive, Pageable pageable);
}