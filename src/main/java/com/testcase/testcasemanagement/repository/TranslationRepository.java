// src/main/java/com/testcase/testcasemanagement/repository/TranslationRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.model.Language;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, String> {

    // 키와 언어로 번역 조회
    Optional<Translation> findByTranslationKeyAndLanguage(TranslationKey translationKey, Language language);

    // 키 이름과 언어 코드로 번역 조회
    @Query("SELECT t FROM Translation t " +
           "WHERE t.translationKey.keyName = :keyName AND t.language.code = :languageCode AND t.isActive = true")
    Optional<Translation> findByKeyNameAndLanguageCode(@Param("keyName") String keyName,
                                                      @Param("languageCode") String languageCode);

    // 특정 언어의 모든 번역 조회
    @Query("SELECT t FROM Translation t WHERE t.language.code = :languageCode AND t.isActive = true")
    List<Translation> findByLanguageCode(@Param("languageCode") String languageCode);

    // 특정 언어의 모든 번역 조회 (활성 상태 무관)
    List<Translation> findByLanguage(Language language);

    // 특정 키의 모든 번역 조회
    @Query("SELECT t FROM Translation t WHERE t.translationKey.keyName = :keyName AND t.isActive = true")
    List<Translation> findByKeyName(@Param("keyName") String keyName);

    // 여러 키의 모든 번역 조회 (N+1 쿼리 방지용)
    // JOIN FETCH로 translationKey와 language를 함께 로딩하여 LAZY loading 문제 해결
    @Query("SELECT DISTINCT t FROM Translation t " +
           "JOIN FETCH t.translationKey tk " +
           "JOIN FETCH t.language l " +
           "WHERE tk.keyName IN :keyNames AND t.isActive = true")
    List<Translation> findByKeyNameIn(@Param("keyNames") List<String> keyNames);

    // 특정 언어와 카테고리의 번역들 조회
    @Query("SELECT t FROM Translation t " +
           "WHERE t.language.code = :languageCode AND t.translationKey.category = :category AND t.isActive = true")
    List<Translation> findByLanguageCodeAndCategory(@Param("languageCode") String languageCode,
                                                   @Param("category") String category);

    // 특정 언어의 번역을 키-값 맵으로 조회 (프론트엔드용)
    @Query("SELECT new map(t.translationKey.keyName as key, t.value as value) FROM Translation t " +
           "WHERE t.language.code = :languageCode AND t.isActive = true")
    List<Map<String, String>> findTranslationMapByLanguageCode(@Param("languageCode") String languageCode);

    // 키워드로 번역 검색 (키 이름, 번역값에서 검색)
    @Query("SELECT t FROM Translation t WHERE " +
           "(LOWER(t.translationKey.keyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.value) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND t.isActive = true")
    List<Translation> searchByKeyword(@Param("keyword") String keyword);

    // 언어별 번역 완성도 조회 (번역된 키 개수 / 전체 키 개수)
    @Query("SELECT l.code, l.name, " +
           "COUNT(DISTINCT t.translationKey.id) as translatedCount, " +
           "(SELECT COUNT(tk) FROM TranslationKey tk WHERE tk.isActive = true) as totalCount " +
           "FROM Language l " +
           "LEFT JOIN Translation t ON t.language.id = l.id AND t.isActive = true " +
           "WHERE l.isActive = true " +
           "GROUP BY l.id, l.code, l.name")
    List<Object[]> getTranslationCompletionStats();

    // 특정 언어의 누락된 번역 키들 조회
    @Query("SELECT tk FROM TranslationKey tk " +
           "WHERE tk.isActive = true AND tk.id NOT IN " +
           "(SELECT t.translationKey.id FROM Translation t " +
           "WHERE t.language.code = :languageCode AND t.isActive = true)")
    List<TranslationKey> findMissingTranslationKeys(@Param("languageCode") String languageCode);

    // 카테고리별 번역 개수 조회
    @Query("SELECT tk.category, COUNT(t) FROM Translation t " +
           "JOIN t.translationKey tk " +
           "WHERE t.language.code = :languageCode AND t.isActive = true " +
           "GROUP BY tk.category")
    List<Object[]> getTranslationCountByCategory(@Param("languageCode") String languageCode);

    // 특정 사용자가 생성/수정한 번역 조회
    List<Translation> findByCreatedBy(String createdBy);
    List<Translation> findByUpdatedBy(String updatedBy);

    // 중복 번역 검증 (같은 키, 언어에 대한 활성 번역이 있는지)
    @Query("SELECT COUNT(t) > 0 FROM Translation t " +
           "WHERE t.translationKey.keyName = :keyName AND t.language.code = :languageCode " +
           "AND t.isActive = true AND (:excludeId IS NULL OR t.id != :excludeId)")
    boolean existsDuplicateTranslation(@Param("keyName") String keyName,
                                      @Param("languageCode") String languageCode,
                                      @Param("excludeId") String excludeId);

    // 최근 수정된 번역 조회
    @Query("SELECT t FROM Translation t WHERE t.isActive = true ORDER BY t.updatedAt DESC")
    List<Translation> findRecentlyUpdatedTranslations(org.springframework.data.domain.Pageable pageable);

    // 카테고리별 언어별 번역 완성도 통계
    @Query("SELECT tk.category, l.code, l.name, " +
           "COUNT(DISTINCT tk.id) as totalKeys, " +
           "COUNT(DISTINCT t.translationKey.id) as translatedKeys " +
           "FROM TranslationKey tk " +
           "CROSS JOIN Language l " +
           "LEFT JOIN Translation t ON t.translationKey.id = tk.id AND t.language.id = l.id AND t.isActive = true " +
           "WHERE tk.isActive = true AND l.isActive = true " +
           "GROUP BY tk.category, l.id, l.code, l.name " +
           "ORDER BY tk.category, l.code")
    List<Object[]> getCategoryTranslationCompletionStats();

    // 특정 언어의 카테고리별 번역 완성도 통계
    @Query("SELECT tk.category, " +
           "COUNT(DISTINCT tk.id) as totalKeys, " +
           "COUNT(DISTINCT t.translationKey.id) as translatedKeys " +
           "FROM TranslationKey tk " +
           "LEFT JOIN Translation t ON t.translationKey.id = tk.id AND t.language.code = :languageCode AND t.isActive = true " +
           "WHERE tk.isActive = true " +
           "GROUP BY tk.category " +
           "ORDER BY tk.category")
    List<Object[]> getCategoryCompletionStatsByLanguage(@Param("languageCode") String languageCode);

    // 특정 카테고리의 언어별 번역 완성도 통계
    @Query("SELECT l.code, l.name, " +
           "COUNT(DISTINCT tk.id) as totalKeys, " +
           "COUNT(DISTINCT t.translationKey.id) as translatedKeys " +
           "FROM TranslationKey tk " +
           "CROSS JOIN Language l " +
           "LEFT JOIN Translation t ON t.translationKey.id = tk.id AND t.language.id = l.id AND t.isActive = true " +
           "WHERE tk.isActive = true AND l.isActive = true AND tk.category = :category " +
           "GROUP BY l.id, l.code, l.name " +
           "ORDER BY l.code")
    List<Object[]> getLanguageCompletionStatsByCategory(@Param("category") String category);

    // ==================== Pagination 지원 메서드들 ====================

    // 페이지네이션을 지원하는 번역 검색 (필터링 포함)
    @Query("SELECT t FROM Translation t " +
           "WHERE (:languageCode IS NULL OR t.language.code = :languageCode) " +
           "AND (:keyName IS NULL OR :keyName = '' OR LOWER(t.translationKey.keyName) LIKE LOWER(CONCAT('%', :keyName, '%'))) " +
           "AND (:isActive IS NULL OR t.isActive = :isActive) " +
           "ORDER BY t.translationKey.keyName ASC, t.language.code ASC")
    Page<Translation> searchTranslationsWithPagination(@Param("languageCode") String languageCode,
                                                       @Param("keyName") String keyName,
                                                       @Param("isActive") Boolean isActive,
                                                       Pageable pageable);

    // 특정 언어의 번역 목록 (페이지네이션)
    @Query("SELECT t FROM Translation t WHERE t.language.code = :languageCode AND t.isActive = true ORDER BY t.translationKey.keyName ASC")
    Page<Translation> findByLanguageCodeWithPagination(@Param("languageCode") String languageCode, Pageable pageable);

    // 키워드로 번역 검색 (페이지네이션)
    @Query("SELECT t FROM Translation t WHERE " +
           "(LOWER(t.translationKey.keyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.value) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND t.isActive = true " +
           "ORDER BY t.translationKey.keyName ASC")
    Page<Translation> searchByKeywordWithPagination(@Param("keyword") String keyword, Pageable pageable);

    // 모든 번역 목록 (페이지네이션)
    @Query("SELECT t FROM Translation t WHERE t.isActive = true ORDER BY t.translationKey.keyName ASC, t.language.code ASC")
    Page<Translation> findAllActiveWithPagination(Pageable pageable);
}