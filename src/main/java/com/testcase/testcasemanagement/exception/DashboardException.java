// src/main/java/com/testcase/testcasemanagement/exception/DashboardException.java

package com.testcase.testcasemanagement.exception;

/**
 * ICT-134: 대시보드 API 특화 예외 클래스
 * 대시보드 관련 비즈니스 로직 예외를 처리합니다.
 */
public class DashboardException extends RuntimeException {
    
    private final String errorCode;
    private final String component;
    
    public DashboardException(String errorCode, String message, String component) {
        super(message);
        this.errorCode = errorCode;
        this.component = component;
    }
    
    public DashboardException(String errorCode, String message, String component, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.component = component;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public String getComponent() {
        return component;
    }
    
    // 대시보드 특화 예외 타입들
    public static class DataRetrievalException extends DashboardException {
        public DataRetrievalException(String message, String component) {
            super("DASHBOARD_DATA_RETRIEVAL_ERROR", message, component);
        }
        
        public DataRetrievalException(String message, String component, Throwable cause) {
            super("DASHBOARD_DATA_RETRIEVAL_ERROR", message, component, cause);
        }
    }
    
    public static class CacheException extends DashboardException {
        public CacheException(String message, String component) {
            super("DASHBOARD_CACHE_ERROR", message, component);
        }
        
        public CacheException(String message, String component, Throwable cause) {
            super("DASHBOARD_CACHE_ERROR", message, component, cause);
        }
    }
    
    public static class StatisticsException extends DashboardException {
        public StatisticsException(String message, String component) {
            super("DASHBOARD_STATISTICS_ERROR", message, component);
        }
        
        public StatisticsException(String message, String component, Throwable cause) {
            super("DASHBOARD_STATISTICS_ERROR", message, component, cause);
        }
    }
    
    public static class QueryPerformanceException extends DashboardException {
        public QueryPerformanceException(String message, String component) {
            super("DASHBOARD_QUERY_PERFORMANCE_ERROR", message, component);
        }
        
        public QueryPerformanceException(String message, String component, Throwable cause) {
            super("DASHBOARD_QUERY_PERFORMANCE_ERROR", message, component, cause);
        }
    }
}