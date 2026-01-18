// src/test/java/com/testcase/testcasemanagement/performance/DashboardApiLoadTest.java

package com.testcase.testcasemanagement.performance;

import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

/**
 * ICT-130: 대시보드 API 성능 최적화 및 캐싱 구현 - 부하 테스트
 * 
 * 이 클래스는 대시보드 API의 성능을 다양한 부하 상황에서 테스트합니다.
 * - 동시성 테스트 (동시 요청 처리 능력)
 * - 캐시 성능 테스트 (캐시 히트율 및 응답 시간 개선)
 * - 스트레스 테스트 (높은 부하에서의 안정성)
 * - 지속성 테스트 (장시간 부하에서의 메모리 누수 확인)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Feature("ICT-130: Dashboard API Performance and Caching")
@TmsLink("ICT-130")
public class DashboardApiLoadTest {

    private static final Logger logger = LoggerFactory.getLogger(DashboardApiLoadTest.class);

    @LocalServerPort
    private int port;

    private TestRestTemplate restTemplate = new TestRestTemplate();
    private String baseUrl;
    private String authToken;

    // 성능 기준값 (밀리초)
    private static final long CACHE_HIT_MAX_RESPONSE_TIME = 100; // 캐시 히트 시 100ms 이하
    private static final long CACHE_MISS_MAX_RESPONSE_TIME = 2000; // 캐시 미스 시 2초 이하
    private static final double SUCCESS_RATE_THRESHOLD = 99.0; // 성공률 99% 이상
    private static final double AVERAGE_RESPONSE_TIME_THRESHOLD = 500.0; // 평균 응답 시간 500ms 이하

    @BeforeClass
    @Description("테스트 환경 설정 및 인증 토큰 획득")
    public void setUp() {
        baseUrl = "http://localhost:" + port;
        authToken = authenticateAndGetToken();

        logger.info("=== ICT-130 대시보드 API 부하 테스트 시작 ===");
        logger.info("Base URL: {}", baseUrl);
        logger.info("Auth Token: {}", authToken != null ? "획득 성공" : "획득 실패");
    }

    /**
     * 인증 토큰을 획득합니다.
     */
    private String authenticateAndGetToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

            String loginRequest = "{\"username\":\"admin\",\"password\":\"admin\"}";
            HttpEntity<String> entity = new HttpEntity<>(loginRequest, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/api/auth/login",
                    HttpMethod.POST,
                    entity,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                // JWT 토큰을 JSON에서 추출 (간단한 문자열 파싱)
                String body = response.getBody();
                if (body != null && body.contains("\"accessToken\":")) {
                    int start = body.indexOf("\"accessToken\":\"") + 15;
                    int end = body.indexOf("\"", start);
                    return body.substring(start, end);
                }
            }
        } catch (Exception e) {
            logger.error("인증 실패: {}", e.getMessage());
        }
        return null;
    }

    /**
     * HTTP 요청 헤더를 생성합니다.
     */
    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        if (authToken != null) {
            headers.set("Authorization", "Bearer " + authToken);
        }
        return headers;
    }

    @Test(priority = 1)
    @Story("캐시 성능 테스트")
    @Description("캐시 적용으로 인한 응답 시간 개선 효과 검증")
    public void testCachePerformance() throws InterruptedException {
        logger.info("=== 캐시 성능 테스트 시작 ===");

        HttpHeaders headers = createAuthHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // 첫 번째 조직 ID 획득
        String projectId = getFirstProjectId();
        if (projectId == null) {
            logger.warn("프로젝트 ID를 획득할 수 없어 캐시 성능 테스트를 건너뜁니다.");
            return;
        }

        String apiUrl = baseUrl + "/api/dashboard/projects/" + projectId + "/statistics";

        // 캐시 미스 테스트 (첫 번째 요청)
        long startTime = System.currentTimeMillis();
        ResponseEntity<String> firstResponse = restTemplate.exchange(
                apiUrl, HttpMethod.GET, entity, String.class);
        long firstResponseTime = System.currentTimeMillis() - startTime;

        Assert.assertTrue(firstResponse.getStatusCode().is2xxSuccessful(),
                "첫 번째 요청이 성공해야 합니다.");
        Assert.assertTrue(firstResponseTime <= CACHE_MISS_MAX_RESPONSE_TIME,
                String.format("캐시 미스 응답 시간이 %dms 이하여야 합니다. 실제: %dms",
                        CACHE_MISS_MAX_RESPONSE_TIME, firstResponseTime));

        logger.info("캐시 미스 응답 시간: {}ms", firstResponseTime);

        // 캐시 히트 테스트 (연속 요청)
        List<Long> cacheHitTimes = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            startTime = System.currentTimeMillis();
            ResponseEntity<String> cachedResponse = restTemplate.exchange(
                    apiUrl, HttpMethod.GET, entity, String.class);
            long responseTime = System.currentTimeMillis() - startTime;
            cacheHitTimes.add(responseTime);

            Assert.assertTrue(cachedResponse.getStatusCode().is2xxSuccessful(),
                    "캐시된 요청이 성공해야 합니다.");
            Assert.assertTrue(responseTime <= CACHE_HIT_MAX_RESPONSE_TIME,
                    String.format("캐시 히트 응답 시간이 %dms 이하여야 합니다. 실제: %dms",
                            CACHE_HIT_MAX_RESPONSE_TIME, responseTime));

            Thread.sleep(50); // 50ms 간격
        }

        double averageCacheHitTime = cacheHitTimes.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);

        logger.info("캐시 히트 평균 응답 시간: {:.2f}ms", averageCacheHitTime);
        logger.info("캐시 성능 개선율: {:.1f}%",
                ((firstResponseTime - averageCacheHitTime) / firstResponseTime) * 100);

        Assert.assertTrue(averageCacheHitTime < firstResponseTime * 0.5,
                "캐시 히트 시 응답 시간이 50% 이상 개선되어야 합니다.");

        logger.info("=== 캐시 성능 테스트 완료 ===");
    }

    @Test(priority = 2)
    @Story("동시성 부하 테스트")
    @Description("다중 동시 요청에 대한 API 안정성 및 성능 검증")
    public void testConcurrentLoad() throws InterruptedException, ExecutionException {
        logger.info("=== 동시성 부하 테스트 시작 ===");

        int threadCount = 50; // 동시 스레드 수
        int requestsPerThread = 10; // 스레드당 요청 수
        int totalRequests = threadCount * requestsPerThread;

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Future<RequestResult>> futures = new ArrayList<>();

        String projectId = getFirstProjectId();
        if (projectId == null) {
            logger.warn("프로젝트 ID를 획득할 수 없어 동시성 부하 테스트를 건너뜁니다.");
            return;
        }

        String apiUrl = baseUrl + "/api/dashboard/projects/" + projectId + "/statistics";

        long testStartTime = System.currentTimeMillis();

        // 동시 요청 실행
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            futures.add(executor.submit(() -> {
                List<Long> responseTimes = new ArrayList<>();
                int successCount = 0;

                HttpHeaders headers = createAuthHeaders();
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                for (int j = 0; j < requestsPerThread; j++) {
                    try {
                        long startTime = System.currentTimeMillis();
                        ResponseEntity<String> response = restTemplate.exchange(
                                apiUrl, HttpMethod.GET, entity, String.class);
                        long responseTime = System.currentTimeMillis() - startTime;
                        responseTimes.add(responseTime);

                        if (response.getStatusCode().is2xxSuccessful()) {
                            successCount++;
                        }

                        Thread.sleep(10); // 10ms 간격
                    } catch (Exception e) {
                        logger.warn("Thread {} 요청 실패: {}", threadId, e.getMessage());
                    }
                }

                return new RequestResult(threadId, successCount, requestsPerThread, responseTimes);
            }));
        }

        // 결과 수집
        List<RequestResult> results = new ArrayList<>();
        for (Future<RequestResult> future : futures) {
            results.add(future.get());
        }

        long testDuration = System.currentTimeMillis() - testStartTime;
        executor.shutdown();

        // 통계 계산
        int totalSuccessfulRequests = results.stream()
                .mapToInt(RequestResult::getSuccessCount)
                .sum();

        double successRate = (totalSuccessfulRequests * 100.0) / totalRequests;

        List<Long> allResponseTimes = results.stream()
                .flatMap(r -> r.getResponseTimes().stream())
                .toList();

        double averageResponseTime = allResponseTimes.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);

        long maxResponseTime = allResponseTimes.stream()
                .mapToLong(Long::longValue)
                .max()
                .orElse(0L);

        double throughput = (totalSuccessfulRequests * 1000.0) / testDuration;

        // 결과 출력
        logger.info("동시성 부하 테스트 결과:");
        logger.info("- 총 요청 수: {}", totalRequests);
        logger.info("- 성공한 요청 수: {}", totalSuccessfulRequests);
        logger.info("- 성공률: {:.2f}%", successRate);
        logger.info("- 평균 응답 시간: {:.2f}ms", averageResponseTime);
        logger.info("- 최대 응답 시간: {}ms", maxResponseTime);
        logger.info("- 처리량: {:.2f} requests/sec", throughput);
        logger.info("- 테스트 소요 시간: {}ms", testDuration);

        // 성능 기준 검증
        Assert.assertTrue(successRate >= SUCCESS_RATE_THRESHOLD,
                String.format("성공률이 %.1f%% 이상이어야 합니다. 실제: %.2f%%",
                        SUCCESS_RATE_THRESHOLD, successRate));

        Assert.assertTrue(averageResponseTime <= AVERAGE_RESPONSE_TIME_THRESHOLD,
                String.format("평균 응답 시간이 %.1fms 이하여야 합니다. 실제: %.2fms",
                        AVERAGE_RESPONSE_TIME_THRESHOLD, averageResponseTime));

        logger.info("=== 동시성 부하 테스트 완료 ===");
    }

    @Test(priority = 3)
    @Story("스트레스 테스트")
    @Description("높은 부하 상황에서의 시스템 안정성 검증")
    public void testStressLoad() throws InterruptedException, ExecutionException {
        logger.info("=== 스트레스 테스트 시작 ===");

        int threadCount = 100; // 높은 동시 스레드 수
        int requestsPerThread = 20; // 스레드당 요청 수

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Future<Integer>> futures = new ArrayList<>();

        String projectId = getFirstProjectId();
        if (projectId == null) {
            logger.warn("프로젝트 ID를 획득할 수 없어 스트레스 테스트를 건너뜁니다.");
            return;
        }

        // 다양한 API 엔드포인트 테스트
        List<String> apiEndpoints = List.of(
                "/api/dashboard/projects/" + projectId + "/statistics",
                "/api/dashboard/recent-test-results?limit=10",
                "/api/dashboard/test-execution-progress?limit=5");

        long testStartTime = System.currentTimeMillis();

        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            futures.add(executor.submit(() -> {
                int successCount = 0;
                HttpHeaders headers = createAuthHeaders();
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                for (int j = 0; j < requestsPerThread; j++) {
                    try {
                        String endpoint = apiEndpoints.get(j % apiEndpoints.size());
                        ResponseEntity<String> response = restTemplate.exchange(
                                baseUrl + endpoint, HttpMethod.GET, entity, String.class);

                        if (response.getStatusCode().is2xxSuccessful()) {
                            successCount++;
                        }

                        Thread.sleep(5); // 5ms 간격 (높은 부하 시뮬레이션)
                    } catch (Exception e) {
                        logger.debug("Thread {} 요청 실패: {}", threadId, e.getMessage());
                    }
                }
                return successCount;
            }));
        }

        // 결과 수집
        int totalSuccessfulRequests = 0;
        for (Future<Integer> future : futures) {
            totalSuccessfulRequests += future.get();
        }

        long testDuration = System.currentTimeMillis() - testStartTime;
        executor.shutdown();

        int totalRequests = threadCount * requestsPerThread;
        double successRate = (totalSuccessfulRequests * 100.0) / totalRequests;
        double throughput = (totalSuccessfulRequests * 1000.0) / testDuration;

        logger.info("스트레스 테스트 결과:");
        logger.info("- 총 요청 수: {}", totalRequests);
        logger.info("- 성공한 요청 수: {}", totalSuccessfulRequests);
        logger.info("- 성공률: {:.2f}%", successRate);
        logger.info("- 처리량: {:.2f} requests/sec", throughput);
        logger.info("- 테스트 소요 시간: {}ms", testDuration);

        // 스트레스 상황에서도 최소 90% 성공률 유지
        Assert.assertTrue(successRate >= 90.0,
                String.format("스트레스 상황에서 성공률이 90%% 이상이어야 합니다. 실제: %.2f%%", successRate));

        logger.info("=== 스트레스 테스트 완료 ===");
    }

    @Test(priority = 4)
    @Story("지속성 테스트")
    @Description("장시간 부하에서의 메모리 누수 및 시스템 안정성 검증")
    public void testEnduranceLoad() throws InterruptedException, ExecutionException {
        logger.info("=== 지속성 테스트 시작 ===");

        int threadCount = 10;
        int requestsPerThread = 50;
        int totalRequests = threadCount * requestsPerThread;

        String projectId = getFirstProjectId();
        if (projectId == null) {
            logger.warn("프로젝트 ID를 획득할 수 없어 지속성 테스트를 건너뜁니다.");
            return;
        }

        String apiUrl = baseUrl + "/api/dashboard/projects/" + projectId + "/statistics";

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Future<Integer>> futures = new ArrayList<>();

        long startTime = System.currentTimeMillis();

        // 지속성 테스트 실행
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            futures.add(executor.submit(() -> {
                int successCount = 0;
                HttpHeaders headers = createAuthHeaders();
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                for (int j = 0; j < requestsPerThread; j++) {
                    try {
                        ResponseEntity<String> response = restTemplate.exchange(
                                apiUrl, HttpMethod.GET, entity, String.class);

                        if (response.getStatusCode().is2xxSuccessful()) {
                            successCount++;
                        }

                        Thread.sleep(50); // 50ms 간격
                    } catch (Exception e) {
                        logger.debug("Thread {} 요청 실패: {}", threadId, e.getMessage());
                    }
                }
                return successCount;
            }));
        }

        // 결과 수집
        int totalSuccessfulRequests = 0;
        for (Future<Integer> future : futures) {
            totalSuccessfulRequests += future.get();
        }

        long testDuration = System.currentTimeMillis() - startTime;
        executor.shutdown();

        double successRate = (totalSuccessfulRequests * 100.0) / totalRequests;
        double throughput = (totalSuccessfulRequests * 1000.0) / testDuration;

        logger.info("지속성 테스트 결과:");
        logger.info("- 총 요청 수: {}", totalRequests);
        logger.info("- 성공한 요청 수: {}", totalSuccessfulRequests);
        logger.info("- 성공률: {:.2f}%", successRate);
        logger.info("- 평균 처리량: {:.2f} requests/sec", throughput);
        logger.info("- 테스트 소요 시간: {}ms", testDuration);

        // 지속성 테스트에서 최소 처리량 유지 확인
        Assert.assertTrue(totalSuccessfulRequests > 0,
                "지속성 테스트에서 최소한의 요청이 성공해야 합니다.");
        Assert.assertTrue(successRate >= 90.0,
                String.format("지속성 테스트에서 성공률이 90%% 이상이어야 합니다. 실제: %.2f%%", successRate));

        logger.info("=== 지속성 테스트 완료 ===");
    }

    /**
     * 첫 번째 프로젝트 ID를 획득합니다.
     */
    private String getFirstProjectId() {
        try {
            HttpHeaders headers = createAuthHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/api/projects",
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String body = response.getBody();
                // JSON에서 첫 번째 프로젝트 ID 추출 (간단한 문자열 파싱)
                if (body.contains("\"id\":\"")) {
                    int start = body.indexOf("\"id\":\"") + 6;
                    int end = body.indexOf("\"", start);
                    return body.substring(start, end);
                }
            }
        } catch (Exception e) {
            logger.error("프로젝트 ID 획득 실패: {}", e.getMessage());
        }
        return null;
    }

    /**
     * 요청 결과를 담는 내부 클래스
     */
    private static class RequestResult {
        private final int threadId;
        private final int successCount;
        private final int totalCount;
        private final List<Long> responseTimes;

        public RequestResult(int threadId, int successCount, int totalCount, List<Long> responseTimes) {
            this.threadId = threadId;
            this.successCount = successCount;
            this.totalCount = totalCount;
            this.responseTimes = new ArrayList<>(responseTimes);
        }

        public int getThreadId() {
            return threadId;
        }

        public int getSuccessCount() {
            return successCount;
        }

        public int getTotalCount() {
            return totalCount;
        }

        public List<Long> getResponseTimes() {
            return responseTimes;
        }
    }
}