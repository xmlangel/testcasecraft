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
        String trimmed = sql.trim().toUpperCase();
        
        // SELECT로 시작해야 함
        if (!trimmed.startsWith("SELECT")) {
            return false;
        }

        // 수정 키워드 포함 금지
        if (UNSAFE_PATTERN.matcher(sql).find()) {
            return false;
        }

        // 프로젝트 격리 체크: 쿼리에 현재 프로젝트 ID가 포함되어야 함 (최소한의 안전장치)
        // 실제 운영 환경에서는 SQL 파서를 사용하여 WHERE 절을 분석하는 것이 더 좋습니다.
        return sql.contains(projectId);
    }
}
