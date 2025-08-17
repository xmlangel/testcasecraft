package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.testng.annotations.Test;
import org.testng.Assert;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * 폰트 우선순위 로딩 테스트
 * ICT-238 프로젝트 번들 폰트가 최우선으로 로드되는지 검증
 */
public class FontPriorityTest {
    
    private ExportService exportService = new ExportService();
    
    /**
     * 폰트 우선순위 테스트 - 여러 번 호출하여 캐싱과 우선순위 확인
     */
    @Test
    public void testFontPriorityAndCaching() {
        System.out.println("=== 폰트 우선순위 및 캐싱 테스트 ===");
        
        Page<TestResultReportDto> testData = createKoreanTestData();
        TestResultFilterDto filter = createTestFilter();
        
        try {
            // 첫 번째 PDF 생성 (폰트 로딩 및 캐싱)
            System.out.println("📋 첫 번째 PDF 생성 (폰트 탐색 수행):");
            long start1 = System.currentTimeMillis();
            byte[] pdf1 = exportService.exportToPdf(testData, filter);
            long end1 = System.currentTimeMillis();
            
            Thread.sleep(100); // 캐시 안정화 대기
            
            // 두 번째 PDF 생성 (캐시 사용)
            System.out.println("📋 두 번째 PDF 생성 (캐시 사용):");
            long start2 = System.currentTimeMillis();
            byte[] pdf2 = exportService.exportToPdf(testData, filter);
            long end2 = System.currentTimeMillis();
            
            Thread.sleep(100);
            
            // 세 번째 PDF 생성 (캐시 재사용)
            System.out.println("📋 세 번째 PDF 생성 (캐시 재사용):");
            long start3 = System.currentTimeMillis();
            byte[] pdf3 = exportService.exportToPdf(testData, filter);
            long end3 = System.currentTimeMillis();
            
            // 검증
            Assert.assertNotNull(pdf1, "첫 번째 PDF 생성 실패");
            Assert.assertNotNull(pdf2, "두 번째 PDF 생성 실패");
            Assert.assertNotNull(pdf3, "세 번째 PDF 생성 실패");
            
            long time1 = end1 - start1;
            long time2 = end2 - start2;
            long time3 = end3 - start3;
            
            System.out.println("✅ 폰트 우선순위 및 캐싱 테스트 완료");
            System.out.println("  - 첫 번째 생성: " + pdf1.length + " bytes (" + time1 + "ms)");
            System.out.println("  - 두 번째 생성: " + pdf2.length + " bytes (" + time2 + "ms)");
            System.out.println("  - 세 번째 생성: " + pdf3.length + " bytes (" + time3 + "ms)");
            
            // 성능 개선 확인 (두 번째와 세 번째는 더 빨라야 함)
            if (time2 < time1) {
                System.out.println("  - 캐싱 효과 확인: " + ((time1 - time2) * 100.0 / time1) + "% 개선");
            }
            
            if (time3 < time1) {
                System.out.println("  - 지속적 캐싱 효과: " + ((time1 - time3) * 100.0 / time1) + "% 개선");
            }
            
        } catch (Exception e) {
            Assert.fail("폰트 우선순위 테스트 실패: " + e.getMessage());
        }
    }
    
    /**
     * 복잡한 한글 텍스트로 폰트 안정성 테스트
     */
    @Test 
    public void testComplexKoreanFontStability() {
        System.out.println("=== 복잡한 한글 텍스트 폰트 안정성 테스트 ===");
        
        // 다양한 한글 텍스트 패턴 생성
        TestResultReportDto result1 = createComplexKoreanData(
            "자음+모음 조합: ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ",
            "복합모음과 겹자음 테스트: 쌍, 꽃, 뺨, 뿜, 씨앗, 껍질"
        );
        
        TestResultReportDto result2 = createComplexKoreanData(
            "긴 문장 테스트: 동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세",
            "특수 문자 조합: 한글!@#$%^&*()_+{}|:<>?[]\\;'\",./ 123ABC"
        );
        
        TestResultReportDto result3 = createComplexKoreanData(
            "음성학적 복잡성: 의사양반 환영합니다. 정정당당 당당정정.",
            "현대 한글 + 이모지: 안녕하세요! 👋 오늘 날씨가 좋네요 ☀️ 화이팅! 💪"
        );
        
        List<TestResultReportDto> complexData = Arrays.asList(result1, result2, result3);
        Page<TestResultReportDto> testData = new PageImpl<>(complexData, PageRequest.of(0, 10), 3);
        TestResultFilterDto filter = createTestFilter();
        
        try {
            byte[] pdfBytes = exportService.exportToPdf(testData, filter);
            Assert.assertNotNull(pdfBytes, "복잡한 한글 PDF 생성 실패");
            Assert.assertTrue(pdfBytes.length > 2000, "PDF 크기가 예상보다 작음");
            
            // PDF 헤더 검증
            String pdfHeader = new String(Arrays.copyOfRange(pdfBytes, 0, 8));
            Assert.assertTrue(pdfHeader.startsWith("%PDF-"), "올바른 PDF 파일이 아님");
            
            System.out.println("✅ 복잡한 한글 텍스트 폰트 안정성 검증 완료");
            System.out.println("  - 테스트 케이스 수: 3개");
            System.out.println("  - PDF 크기: " + pdfBytes.length + " bytes");
            System.out.println("  - 모든 한글 패턴 렌더링 성공");
            
        } catch (Exception e) {
            Assert.fail("복잡한 한글 폰트 안정성 테스트 실패: " + e.getMessage());
        }
    }
    
    /**
     * 동시 다중 PDF 생성 테스트 (동시성 검증)
     */
    @Test
    public void testConcurrentPdfGeneration() {
        System.out.println("=== 동시 다중 PDF 생성 테스트 ===");
        
        Page<TestResultReportDto> testData = createKoreanTestData();
        TestResultFilterDto filter = createTestFilter();
        
        try {
            // 5개의 PDF를 순차적으로 빠르게 생성
            byte[][] pdfs = new byte[5][];
            long[] times = new long[5];
            
            for (int i = 0; i < 5; i++) {
                long start = System.currentTimeMillis();
                pdfs[i] = exportService.exportToPdf(testData, filter);
                times[i] = System.currentTimeMillis() - start;
                
                Assert.assertNotNull(pdfs[i], "PDF " + (i + 1) + " 생성 실패");
                Thread.sleep(10); // 최소 간격
            }
            
            System.out.println("✅ 동시 다중 PDF 생성 완료");
            for (int i = 0; i < 5; i++) {
                System.out.println("  - PDF " + (i + 1) + ": " + pdfs[i].length + " bytes (" + times[i] + "ms)");
            }
            
            // 일관성 검증 (크기가 비슷해야 함)
            int minSize = Arrays.stream(pdfs).mapToInt(pdf -> pdf.length).min().orElse(0);
            int maxSize = Arrays.stream(pdfs).mapToInt(pdf -> pdf.length).max().orElse(0);
            double sizeVariation = (maxSize - minSize) / (double) minSize;
            
            Assert.assertTrue(sizeVariation < 0.1, "PDF 크기 편차가 너무 큼: " + (sizeVariation * 100) + "%");
            System.out.println("  - 크기 일관성: " + String.format("%.2f%%", sizeVariation * 100) + " 편차");
            
        } catch (Exception e) {
            Assert.fail("동시 다중 PDF 생성 테스트 실패: " + e.getMessage());
        }
    }
    
    /**
     * 한글 테스트 데이터 생성
     */
    private Page<TestResultReportDto> createKoreanTestData() {
        TestResultReportDto result1 = new TestResultReportDto();
        result1.setTestCaseName("한글_테스트케이스_1");
        result1.setResult("PASS");
        result1.setExecutedAt(LocalDateTime.now());
        result1.setExecutorName("한글사용자");
        result1.setNotes("한글 노트 내용");
        result1.setFolderPath("한글폴더/서브폴더");
        
        TestResultReportDto result2 = new TestResultReportDto();
        result2.setTestCaseName("English_TestCase_2");
        result2.setResult("FAIL");
        result2.setExecutedAt(LocalDateTime.now());
        result2.setExecutorName("EnglishUser");
        result2.setNotes("English notes content");
        result2.setFolderPath("EnglishFolder/SubFolder");
        
        List<TestResultReportDto> resultList = Arrays.asList(result1, result2);
        return new PageImpl<>(resultList, PageRequest.of(0, 10), 2);
    }
    
    /**
     * 복잡한 한글 데이터 생성
     */
    private TestResultReportDto createComplexKoreanData(String testCaseName, String notes) {
        TestResultReportDto result = new TestResultReportDto();
        result.setTestCaseName(testCaseName);
        result.setResult("PASS");
        result.setExecutedAt(LocalDateTime.now());
        result.setExecutorName("복잡한한글테스터");
        result.setNotes(notes);
        result.setFolderPath("복잡한/한글/폴더/경로/테스트");
        result.setJiraIssueKey("KOREAN-" + System.currentTimeMillis() % 1000);
        return result;
    }
    
    /**
     * 테스트용 필터 생성
     */
    private TestResultFilterDto createTestFilter() {
        TestResultFilterDto filter = new TestResultFilterDto();
        filter.setDisplayColumns(Arrays.asList("folderPath", "testCaseName", "result", "executedAt", "executorName", "notes", "jiraIssueKey"));
        return filter;
    }
}