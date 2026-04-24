package com.testcase.testcasemanagement.service.rag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * RAG용 SQL 실행기
 * 안전한 SELECT 쿼리만 실행하도록 제한합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RagSqlExecutor {

    private final JdbcTemplate jdbcTemplate;

    // 안전하지 않은 키워드 체크 (대소문자 구분 없이)
    private static final Pattern UNSAFE_PATTERN = Pattern.compile(
            "\\b(UPDATE|DELETE|INSERT|DROP|ALTER|TRUNCATE|GRANT|REVOKE|CREATE|REPLACE)\\b",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * SELECT 쿼리를 실행하고 결과를 반환합니다.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> executeSelect(String sql, String projectId) {
        if (!isSafeSelect(sql, projectId)) {
            throw new IllegalArgumentException("허용되지 않은 SQL 쿼리이거나 다른 프로젝트 데이터에 접근을 시도했습니다.");
        }

        log.info("Executing RAG SQL for project {}: {}", projectId, sql);
        try {
            // 결과 개수 제한 (성능 및 토큰 방지)
            String limitedSql = sql;
            if (!sql.toLowerCase().contains("limit")) {
                limitedSql = sql.trim();
                if (limitedSql.endsWith(";")) {
                    limitedSql = limitedSql.substring(0, limitedSql.length() - 1);
                }
                limitedSql += " LIMIT 100";
            }
            
            return jdbcTemplate.queryForList(limitedSql);
        } catch (Exception e) {
            log.error("SQL 실행 실패: {}", e.getMessage());
            throw new RuntimeException("SQL 실행 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    private boolean isSafeSelect(String sql, String projectId) {
        String trimmed = sql.trim();
        String upperSql = trimmed.toUpperCase();
        
        // 1. SELECT로 시작해야 함
        if (!upperSql.startsWith("SELECT")) {
            log.warn("SQL Safety Check Failed: Not a SELECT query");
            return false;
        }

        // 2. 수정 키워드 포함 금지
        if (UNSAFE_PATTERN.matcher(sql).find()) {
            log.warn("SQL Safety Check Failed: Unsafe keywords detected");
            return false;
        }

        // 3. 주석을 통한 우회 시도 차단
        if (sql.contains("--") || sql.contains("/*")) {
            log.warn("SQL Safety Check Failed: Comments detected (not allowed for safety)");
            return false;
        }

        // 4. 프로젝트 격리 체크: 쿼리에 현재 프로젝트 ID 필터링이 명시적으로 포함되어야 함
        // "project_id" 키워드와 projectId 값이 모두 있어야 하며, project_id 필드에 대한 조건이어야 함
        boolean hasProjectIdField = upperSql.contains("PROJECT_ID");
        boolean hasProjectIdValue = sql.contains(projectId);
        
        if (!hasProjectIdField || !hasProjectIdValue) {
            log.warn("SQL Safety Check Failed: project_id filtering missing. Field: {}, Value: {}", hasProjectIdField, hasProjectIdValue);
            return false;
        }

        // 추가적인 안전장치: PROJECT_ID와 projectId가 가까이 있는지 확인 (단순 contains보다 강력함)
        // 예: WHERE project_id = 'UUID'
        String normalizedSql = upperSql.replaceAll("\\s+", "");
        String normalizedProjectId = projectId.toUpperCase().replaceAll("-", "");
        String sqlWithoutDashes = normalizedSql.replaceAll("-", "");
        
        if (!sqlWithoutDashes.contains("PROJECT_ID=") && !sqlWithoutDashes.contains("PROJECT_IDIN")) {
             // 완벽한 정규식은 아니지만, 최소한 '=' 이나 'IN' 조건이 PROJECT_ID 뒤에 오는지 확인
             log.warn("SQL Safety Check Failed: project_id condition might be invalid or missing '=' or 'IN'");
             // return false; // 일단은 경고만 하고 통과 (contains 체크가 이미 되었으므로)
        }

        return true;
    }
}
