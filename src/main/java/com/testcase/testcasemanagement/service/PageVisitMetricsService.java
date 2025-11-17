// src/main/java/com/testcase/testcasemanagement/service/PageVisitMetricsService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.PageVisitMetricsDto;
import com.testcase.testcasemanagement.model.PageVisitMetric;
import com.testcase.testcasemanagement.model.DailyVisitSummary;
import com.testcase.testcasemanagement.repository.PageVisitMetricRepository;
import com.testcase.testcasemanagement.repository.DailyVisitSummaryRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

/**
 * 페이지 방문 메트릭 수집 및 요약 서비스.
 * Spring Actuator의 MeterRegistry와 연동하여 대시보드 지표로 활용됩니다.
 *
 * 성능 최적화:
 * - 메모리 기반 카운터로 빠른 읽기/쓰기 성능 유지
 * - 주기적으로 데이터베이스에 동기화 (매 10분)
 * - 서버 재시작 시 최근 7일 데이터 자동 복원
 */
@Service
public class PageVisitMetricsService {

    private static final Logger log = LoggerFactory.getLogger(PageVisitMetricsService.class);

    private final PageVisitMetricRepository pageVisitMetricRepository;
    private final DailyVisitSummaryRepository dailyVisitSummaryRepository;

    private static final Duration ACTIVE_VISITOR_WINDOW = Duration.ofMinutes(10);
    private static final int MAX_HISTORY_DAYS = 7;

    private final MeterRegistry meterRegistry;
    private final ConcurrentMap<String, Counter> totalCounters = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, AtomicLong> dailyCounters = new ConcurrentHashMap<>();
    private final ConcurrentMap<LocalDate, Map<String, Long>> dailyHistory = new ConcurrentHashMap<>();
    private final ConcurrentMap<LocalDate, Long> dailyUniqueHistory = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Instant> activeVisitors = new ConcurrentHashMap<>();
    private final AtomicReference<LocalDate> currentDateRef = new AtomicReference<>(LocalDate.now());
    private final AtomicLong totalDailyVisits = new AtomicLong(0);
    private final Set<String> currentDayVisitors = ConcurrentHashMap.newKeySet();
    private final ConcurrentMap<String, String> lastRecordedPageByVisitor = new ConcurrentHashMap<>();
    private static final List<String> EXCLUDED_PREFIXES = List.of(
            "/actuator",
            "/api",
            "/api/",
            "/css",
            "/js",
            "/static",
            "/assets",
            "/images",
            "/fonts",
            "/favicon",
            "/webjars"
    );
    private static final List<String> EXCLUDED_SUFFIXES = List.of(
            ".css",
            ".js",
            ".map",
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".svg",
            ".ico",
            ".woff",
            ".woff2",
            ".ttf",
            ".eot",
            ".json"
    );
    private static final List<String> TRACKED_PREFIXES = List.of(
            "/dashboard",
            "/organizations",
            "/projects",
            "/users",
            "/mail-settings",
            "/translation-management",
            "/llm-config",
            "/projectdashboard"
    );

    public PageVisitMetricsService(MeterRegistry meterRegistry,
                                    PageVisitMetricRepository pageVisitMetricRepository,
                                    DailyVisitSummaryRepository dailyVisitSummaryRepository) {
        this.meterRegistry = meterRegistry;
        this.pageVisitMetricRepository = pageVisitMetricRepository;
        this.dailyVisitSummaryRepository = dailyVisitSummaryRepository;

        Gauge.builder("page.visits.daily.total", totalDailyVisits, AtomicLong::get)
                .description("Total page visits for the current day")
                .register(meterRegistry);

        Gauge.builder("page.visitors.unique.daily", currentDayVisitors, visitors -> visitors.size())
                .description("Unique visitors counted for the current day")
                .register(meterRegistry);

        Gauge.builder("page.visitors.active", this, service -> service.getActiveVisitorsCount())
                .description("Visitors active within the last window")
                .register(meterRegistry);
    }

    /**
     * 애플리케이션 시작 시 데이터베이스에서 최근 데이터를 복원합니다.
     */
    @PostConstruct
    public void loadFromDatabase() {
        try {
            log.info("서버 시작: 데이터베이스에서 페이지 방문 메트릭 복원 시작...");

            LocalDate today = LocalDate.now();
            LocalDate weekAgo = today.minusDays(MAX_HISTORY_DAYS);

            // 최근 7일간의 페이지별 메트릭 복원
            List<PageVisitMetric> recentMetrics = pageVisitMetricRepository.findByVisitDateBetween(weekAgo, today.minusDays(1));

            for (PageVisitMetric metric : recentMetrics) {
                LocalDate date = metric.getVisitDate();
                String pagePath = metric.getPagePath();

                // 과거 날짜의 히스토리에 저장
                dailyHistory.computeIfAbsent(date, k -> new ConcurrentHashMap<>())
                    .put(pagePath, metric.getDailyCount());

                // 총 카운터 복원
                Counter totalCounter = totalCounters.computeIfAbsent(pagePath, key ->
                    Counter.builder("page.visits.total")
                        .description("Total page visit count")
                        .tag("page", key)
                        .register(meterRegistry)
                );
                // 기존 카운트를 더해줌 (누적)
                double currentCount = totalCounter.count();
                if (currentCount < metric.getTotalCount()) {
                    totalCounter.increment(metric.getTotalCount() - currentCount);
                }
            }

            // 일별 요약 데이터 복원
            List<DailyVisitSummary> recentSummaries = dailyVisitSummaryRepository.findByVisitDateBetween(weekAgo, today.minusDays(1));

            for (DailyVisitSummary summary : recentSummaries) {
                dailyUniqueHistory.put(summary.getVisitDate(), summary.getUniqueVisitors());
            }

            log.info("데이터베이스 복원 완료 - 페이지 메트릭: {}개, 일별 요약: {}개",
                recentMetrics.size(), recentSummaries.size());

        } catch (Exception e) {
            log.error("데이터베이스에서 메트릭 복원 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 주기적으로 메모리의 메트릭을 데이터베이스에 동기화합니다.
     * 매 10분마다 실행됩니다.
     */
    @Scheduled(cron = "0 */10 * * * *") // 매 10분마다 실행
    @Transactional
    public void syncToDatabase() {
        try {
            log.debug("데이터베이스 동기화 시작...");

            LocalDate currentDate = currentDateRef.get();

            // 1. 현재 날짜의 페이지별 메트릭 저장
            for (Map.Entry<String, AtomicLong> entry : dailyCounters.entrySet()) {
                String pagePath = entry.getKey();
                Long dailyCount = entry.getValue().get();

                Counter totalCounter = totalCounters.get(pagePath);
                Long totalCount = totalCounter != null ? Math.round(totalCounter.count()) : 0L;

                // DB에서 기존 레코드 찾기 또는 새로 생성
                PageVisitMetric metric = pageVisitMetricRepository
                    .findByVisitDateAndPagePath(currentDate, pagePath)
                    .orElse(new PageVisitMetric(currentDate, pagePath, 0L, 0L));

                metric.setDailyCount(dailyCount);
                metric.setTotalCount(totalCount);

                pageVisitMetricRepository.save(metric);
            }

            // 2. 일별 요약 저장
            DailyVisitSummary summary = dailyVisitSummaryRepository
                .findByVisitDate(currentDate)
                .orElse(new DailyVisitSummary(currentDate, 0L, 0L));

            summary.setTotalVisits(totalDailyVisits.get());
            summary.setUniqueVisitors((long) currentDayVisitors.size());

            dailyVisitSummaryRepository.save(summary);

            log.debug("데이터베이스 동기화 완료 - 날짜: {}, 페이지 수: {}, 총 방문: {}, 고유 방문자: {}",
                currentDate, dailyCounters.size(), totalDailyVisits.get(), currentDayVisitors.size());

        } catch (Exception e) {
            log.error("데이터베이스 동기화 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 오래된 메트릭 데이터를 정리합니다.
     * 매일 자정에 30일 이전 데이터 삭제
     */
    @Scheduled(cron = "0 0 0 * * *") // 매일 자정
    @Transactional
    public void cleanupOldMetrics() {
        try {
            LocalDate cutoffDate = LocalDate.now().minusDays(30);

            pageVisitMetricRepository.deleteByVisitDateBefore(cutoffDate);
            dailyVisitSummaryRepository.deleteByVisitDateBefore(cutoffDate);

            log.info("오래된 메트릭 데이터 정리 완료 - 기준 날짜: {}", cutoffDate);

        } catch (Exception e) {
            log.error("오래된 메트릭 데이터 정리 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 페이지 방문을 기록합니다.
     *
     * @param pagePath  방문한 페이지 경로
     * @param visitorId 방문자를 식별할 수 있는 ID (없을 경우 null)
     * @param clientIp  방문자의 클라이언트 IP (세션 추정용)
     */
    public boolean recordVisit(String pagePath, String visitorId, String clientIp) {
        LocalDate today = LocalDate.now();
        ensureCurrentDate(today);

        String normalizedPagePath = normalizePagePath(pagePath);
        if (!isTrackablePage(normalizedPagePath)) {
            if (log.isTraceEnabled()) {
                log.trace("Skipping page visit tracking for path: {}", normalizedPagePath);
            }
            return false;
        }
        String effectiveVisitorId = determineVisitorId(visitorId, clientIp);
        currentDayVisitors.add(effectiveVisitorId);
        if (StringUtils.hasText(effectiveVisitorId)) {
            activeVisitors.put(effectiveVisitorId, Instant.now());
        }

        String lastPage = lastRecordedPageByVisitor.get(effectiveVisitorId);
        if (normalizedPagePath.equals(lastPage)) {
            if (log.isTraceEnabled()) {
                log.trace("Skipping duplicate visit for visitor {} on page {}", effectiveVisitorId, normalizedPagePath);
            }
            cleanupInactiveVisitors();
            return false;
        }

        Counter totalCounter = totalCounters.computeIfAbsent(normalizedPagePath, key ->
                Counter.builder("page.visits.total")
                        .description("Total page visit count")
                        .tag("page", key)
                        .register(meterRegistry)
        );
        totalCounter.increment();

        AtomicLong dailyCounter = dailyCounters.computeIfAbsent(normalizedPagePath, key -> {
            AtomicLong counter = new AtomicLong(0);
            Gauge.builder("page.visits.daily", counter, AtomicLong::get)
                    .description("Daily page visit count")
                    .tag("page", key)
                    .register(meterRegistry);
            return counter;
        });
        dailyCounter.incrementAndGet();
        totalDailyVisits.incrementAndGet();

        if (log.isTraceEnabled()) {
            log.trace("Recorded page visit - page: {}, visitor: {}", normalizedPagePath, effectiveVisitorId);
        }

        lastRecordedPageByVisitor.put(effectiveVisitorId, normalizedPagePath);
        cleanupInactiveVisitors();
        return true;
    }

    /**
     * 현재 수집된 페이지 방문 메트릭 스냅샷을 반환합니다.
     */
    public PageVisitMetricsDto getCurrentMetrics() {
        LocalDate today = LocalDate.now();
        ensureCurrentDate(today);
        cleanupInactiveVisitors();

        List<PageVisitMetricsDto.PageVisitCountDto> pageCounts = dailyCounters.entrySet().stream()
                .map(entry -> {
                    Counter totalCounter = totalCounters.get(entry.getKey());
                    long totalCount = totalCounter != null ? Math.round(totalCounter.count()) : 0L;

                    return PageVisitMetricsDto.PageVisitCountDto.builder()
                            .pagePath(entry.getKey())
                            .dailyCount(entry.getValue().get())
                            .totalCount(totalCount)
                            .build();
                })
                .sorted(Comparator.comparingLong(PageVisitMetricsDto.PageVisitCountDto::getDailyCount).reversed())
                .collect(Collectors.toList());

        List<PageVisitMetricsDto.DailyVisitSummaryDto> dailySummaries = new ArrayList<>();
        dailyHistory.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    long totalVisits = entry.getValue().values().stream()
                            .mapToLong(Long::longValue)
                            .sum();
                    long uniqueVisitors = dailyUniqueHistory.getOrDefault(entry.getKey(), 0L);
                    dailySummaries.add(PageVisitMetricsDto.DailyVisitSummaryDto.builder()
                            .date(entry.getKey())
                            .totalVisits(totalVisits)
                            .uniqueVisitors(uniqueVisitors)
                            .build());
                });

        dailySummaries.add(PageVisitMetricsDto.DailyVisitSummaryDto.builder()
                .date(currentDateRef.get())
                .totalVisits(totalDailyVisits.get())
                .uniqueVisitors(currentDayVisitors.size())
                .build());

        return PageVisitMetricsDto.builder()
                .currentDate(currentDateRef.get())
                .generatedAt(Instant.now())
                .totalDailyVisits(totalDailyVisits.get())
                .totalUniqueVisitors(currentDayVisitors.size())
                .activeVisitors(getActiveVisitorsCount())
                .rollingDayWindowMinutes(ACTIVE_VISITOR_WINDOW.toMinutes())
                .pages(pageCounts)
                .dailySummaries(dailySummaries)
                .build();
    }

    /**
     * 현재 활성 방문자 수를 반환합니다.
     */
    public long getActiveVisitorsCount() {
        cleanupInactiveVisitors();
        return activeVisitors.size();
    }

    private void ensureCurrentDate(LocalDate today) {
        LocalDate currentDate = currentDateRef.get();
        if (currentDate.equals(today)) {
            return;
        }

        synchronized (this) {
            currentDate = currentDateRef.get();
            if (!currentDate.equals(today)) {
                snapshotDay(currentDate);
                resetDailyState(today);
            }
        }
    }

    private void snapshotDay(LocalDate dateToSnapshot) {
        if (dateToSnapshot == null) {
            return;
        }

        Map<String, Long> snapshot = dailyCounters.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().get()));

        dailyHistory.put(dateToSnapshot, snapshot);
        dailyUniqueHistory.put(dateToSnapshot, (long) currentDayVisitors.size());
        trimHistory();
    }

    private void resetDailyState(LocalDate newDate) {
        currentDateRef.set(newDate);
        totalDailyVisits.set(0);
        currentDayVisitors.clear();
        dailyCounters.values().forEach(counter -> counter.set(0));
        lastRecordedPageByVisitor.clear();
    }

    private void trimHistory() {
        if (dailyHistory.size() <= MAX_HISTORY_DAYS) {
            return;
        }

        List<LocalDate> sortedDates = new ArrayList<>(dailyHistory.keySet());
        Collections.sort(sortedDates);

        while (sortedDates.size() > MAX_HISTORY_DAYS) {
            LocalDate oldest = sortedDates.remove(0);
            dailyHistory.remove(oldest);
            dailyUniqueHistory.remove(oldest);
        }
    }

    private void cleanupInactiveVisitors() {
        Instant cutoff = Instant.now().minus(ACTIVE_VISITOR_WINDOW);
        activeVisitors.entrySet().removeIf(entry -> {
            if (entry.getValue().isBefore(cutoff)) {
                lastRecordedPageByVisitor.remove(entry.getKey());
                return true;
            }
            return false;
        });
    }

    private String normalizePagePath(String pagePath) {
        if (!StringUtils.hasText(pagePath)) {
            return "/unknown";
        }

        String normalized = pagePath.trim();
        int queryIndex = normalized.indexOf('?');
        if (queryIndex >= 0) {
            normalized = normalized.substring(0, queryIndex);
        }

        if (!normalized.startsWith("/")) {
            normalized = "/" + normalized;
        }

        if (normalized.length() > 120) {
            normalized = normalized.substring(0, 120);
        }

        return normalized;
    }

    private String determineVisitorId(String visitorId, String clientIp) {
        if (StringUtils.hasText(visitorId)) {
            return visitorId.trim();
        }

        if (StringUtils.hasText(clientIp)) {
            return "ip:" + clientIp.trim();
        }

        return "anonymous";
    }

    private boolean isTrackablePage(String pagePath) {
        if (!StringUtils.hasText(pagePath)) {
            return false;
        }

        String normalized = pagePath.trim();
        if (!normalized.startsWith("/")) {
            normalized = "/" + normalized;
        }

        String lowerPath = normalized.toLowerCase(Locale.ROOT);

        if (EXCLUDED_PREFIXES.stream().anyMatch(lowerPath::startsWith)) {
            return false;
        }

        if (EXCLUDED_SUFFIXES.stream().anyMatch(lowerPath::endsWith)) {
            return false;
        }

        return TRACKED_PREFIXES.stream().anyMatch(lowerPath::startsWith);
    }
}
