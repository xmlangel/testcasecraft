// src/main/java/com/testcase/testcasemanagement/repository/LanguageRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LanguageRepository extends JpaRepository<Language, String> {

    // 언어 코드로 조회
    Optional<Language> findByCode(String code);

    // 언어 코드 존재 여부 확인
    boolean existsByCode(String code);

    // 활성화된 언어들만 조회
    List<Language> findByIsActiveTrue();

    // 활성화된 언어들을 정렬 순서대로 조회
    @Query("SELECT l FROM Language l WHERE l.isActive = true ORDER BY l.sortOrder ASC, l.name ASC")
    List<Language> findActiveLanguagesOrderBySortOrder();

    // 활성화된 언어들을 정렬 순서대로 조회 (메서드명 변경)
    List<Language> findByIsActiveTrueOrderBySortOrderAsc();

    // 기본 언어 조회
    Optional<Language> findByIsDefaultTrue();

    // 언어명으로 검색
    @Query("SELECT l FROM Language l WHERE " +
           "LOWER(l.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(l.nativeName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(l.code) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Language> searchByKeyword(@Param("keyword") String keyword);

    // 활성 상태와 키워드로 검색
    @Query("SELECT l FROM Language l WHERE " +
           "(LOWER(l.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(l.nativeName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(l.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:isActive IS NULL OR l.isActive = :isActive)")
    List<Language> searchByKeywordAndActiveStatus(@Param("keyword") String keyword,
                                                 @Param("isActive") Boolean isActive);

    // 정렬 순서 범위 내 언어들 조회
    @Query("SELECT l FROM Language l WHERE l.sortOrder BETWEEN :minOrder AND :maxOrder ORDER BY l.sortOrder ASC")
    List<Language> findBySortOrderBetween(@Param("minOrder") Integer minOrder,
                                         @Param("maxOrder") Integer maxOrder);

    // 최대 정렬 순서값 조회
    @Query("SELECT COALESCE(MAX(l.sortOrder), 0) FROM Language l")
    Integer findMaxSortOrder();
}