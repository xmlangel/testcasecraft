package com.testcase.testcasemanagement.service;

import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.PdfEncodings;
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
 * ICT-238: 프로젝트 번들 한글 폰트 추가 검증 테스트
 * 환경 독립적인 PDF 생성을 위한 번들 폰트 기능 검증
 */
public class ProjectBundleFontTest {
    
    private ExportService exportService = new ExportService();
    
    /**
     * ICT-238: 프로젝트 번들 폰트 리소스 존재 검증
     */
    @Test
    public void testProjectBundleFontResourcesExist() {
        System.out.println("=== ICT-238: 프로젝트 번들 폰트 리소스 검증 ===");
        
        String[] bundledFontPaths = {
            "/fonts/NanumGothicCoding.ttf",
            "/fonts/NanumGothicCoding-Bold.ttf"
        };
        
        for (String fontPath : bundledFontPaths) {
            try (java.io.InputStream fontStream = this.getClass().getResourceAsStream(fontPath)) {
                Assert.assertNotNull(fontStream, "번들 폰트 리소스가 존재하지 않음: " + fontPath);
                
                // 폰트 크기 확인
                byte[] fontBytes = fontStream.readAllBytes();
                Assert.assertTrue(fontBytes.length > 0, "번들 폰트 파일이 비어있음: " + fontPath);
                System.out.println("✅ 번들 폰트 리소스 확인: " + fontPath + " (" + fontBytes.length + " bytes)");
                
                // iText로 폰트 로드 가능한지 검증
                PdfFont font = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H);
                Assert.assertNotNull(font, "번들 폰트로 PdfFont 생성 실패: " + fontPath);
                System.out.println("✅ 번들 폰트 iText 로드 성공: " + fontPath);
                
            } catch (Exception e) {
                Assert.fail("번들 폰트 검증 실패: " + fontPath + " - " + e.getMessage());
            }
        }
    }
    
    /**
     * ICT-238: 환경 독립적 PDF 생성 검증
     */
    @Test
    public void testEnvironmentIndependentPdfGeneration() {
        System.out.println("=== ICT-238: 환경 독립적 PDF 생성 검증 ===");
        
        // 테스트 데이터 생성
        Page<TestResultReportDto> testData = createTestReportData();
        TestResultFilterDto filter = createTestFilter();
        
        try {
            // PDF 생성
            byte[] pdfBytes = exportService.exportToPdf(testData, filter);
            Assert.assertNotNull(pdfBytes, "PDF 생성 실패");
            Assert.assertTrue(pdfBytes.length > 0, "PDF 파일이 비어있음");
            
            // PDF 헤더 검증
            String pdfHeader = new String(Arrays.copyOfRange(pdfBytes, 0, Math.min(8, pdfBytes.length)));
            Assert.assertTrue(pdfHeader.startsWith("%PDF-"), "올바른 PDF 파일이 아님: " + pdfHeader);
            
            System.out.println("✅ ICT-238: 환경 독립적 PDF 생성 성공");
            System.out.println("  - PDF 크기: " + pdfBytes.length + " bytes");
            System.out.println("  - PDF 헤더: " + pdfHeader);
            
        } catch (Exception e) {
            Assert.fail("환경 독립적 PDF 생성 실패: " + e.getMessage());
        }
    }
    
    /**
     * ICT-238: 한글 텍스트 렌더링 검증
     */
    @Test
    public void testKoreanTextRenderingWithBundledFont() {
        System.out.println("=== ICT-238: 번들 폰트로 한글 텍스트 렌더링 검증 ===");
        
        // 한글 텍스트가 포함된 테스트 데이터 생성
        TestResultReportDto koreanTestResult = new TestResultReportDto();
        koreanTestResult.setTestCaseName("한글 테스트케이스명 검증");
        koreanTestResult.setResult("PASS");
        koreanTestResult.setExecutedAt(LocalDateTime.now());
        koreanTestResult.setExecutorName("테스터");
        koreanTestResult.setNotes("한글 비고 내용 테스트");
        koreanTestResult.setFolderPath("테스트/폴더/경로");
        
        List<TestResultReportDto> resultList = Arrays.asList(koreanTestResult);
        Page<TestResultReportDto> testData = new PageImpl<>(resultList, PageRequest.of(0, 10), 1);
        TestResultFilterDto filter = createTestFilter();
        
        try {
            // PDF 생성
            byte[] pdfBytes = exportService.exportToPdf(testData, filter);
            Assert.assertNotNull(pdfBytes, "한글 PDF 생성 실패");
            Assert.assertTrue(pdfBytes.length > 0, "한글 PDF 파일이 비어있음");
            
            System.out.println("✅ ICT-238: 번들 폰트로 한글 텍스트 PDF 생성 성공");
            System.out.println("  - 테스트 케이스: " + koreanTestResult.getTestCaseName());
            System.out.println("  - 폴더 경로: " + koreanTestResult.getFolderPath());
            System.out.println("  - 비고: " + koreanTestResult.getNotes());
            System.out.println("  - PDF 크기: " + pdfBytes.length + " bytes");
            
        } catch (Exception e) {
            Assert.fail("한글 텍스트 PDF 생성 실패: " + e.getMessage());
        }
    }
    
    /**
     * ICT-238: 여러 환경에서 동일한 결과 검증 (시뮬레이션)
     */
    @Test
    public void testConsistentOutputAcrossEnvironments() {
        System.out.println("=== ICT-238: 환경별 일관된 출력 검증 ===");
        
        Page<TestResultReportDto> testData = createTestReportData();
        TestResultFilterDto filter = createTestFilter();
        
        try {
            // 첫 번째 PDF 생성
            byte[] pdf1 = exportService.exportToPdf(testData, filter);
            Thread.sleep(10); // 미세한 시간 차이
            
            // 두 번째 PDF 생성 (같은 데이터)
            byte[] pdf2 = exportService.exportToPdf(testData, filter);
            
            Assert.assertNotNull(pdf1, "첫 번째 PDF 생성 실패");
            Assert.assertNotNull(pdf2, "두 번째 PDF 생성 실패");
            
            // 크기가 비슷한지 확인 (완전히 같지 않을 수 있음 - 생성시간 등)
            double sizeDiff = Math.abs(pdf1.length - pdf2.length) / (double) Math.max(pdf1.length, pdf2.length);
            Assert.assertTrue(sizeDiff < 0.05, "PDF 크기 차이가 너무 큼: " + sizeDiff); // 5% 이내
            
            System.out.println("✅ ICT-238: 일관된 PDF 출력 확인");
            System.out.println("  - PDF1 크기: " + pdf1.length + " bytes");
            System.out.println("  - PDF2 크기: " + pdf2.length + " bytes");
            System.out.println("  - 크기 차이: " + String.format("%.2f%%", sizeDiff * 100));
            
        } catch (Exception e) {
            Assert.fail("일관된 출력 검증 실패: " + e.getMessage());
        }
    }
    
    /**
     * 테스트용 리포트 데이터 생성
     */
    private Page<TestResultReportDto> createTestReportData() {
        TestResultReportDto result1 = new TestResultReportDto();
        result1.setTestCaseName("로그인 기능 테스트");
        result1.setResult("PASS");
        result1.setExecutedAt(LocalDateTime.now());
        result1.setExecutorName("테스터");
        result1.setNotes("정상 동작 확인");
        result1.setFolderPath("인증/로그인");
        
        TestResultReportDto result2 = new TestResultReportDto();
        result2.setTestCaseName("데이터 저장 테스트");
        result2.setResult("FAIL");
        result2.setExecutedAt(LocalDateTime.now());
        result2.setExecutorName("개발자");
        result2.setNotes("저장 실패 - 권한 오류");
        result2.setFolderPath("데이터/저장");
        
        List<TestResultReportDto> resultList = Arrays.asList(result1, result2);
        return new PageImpl<>(resultList, PageRequest.of(0, 10), 2);
    }
    
    /**
     * 테스트용 필터 생성
     */
    private TestResultFilterDto createTestFilter() {
        TestResultFilterDto filter = new TestResultFilterDto();
        filter.setDisplayColumns(Arrays.asList("folderPath", "testCaseName", "result", "executedAt", "executorName", "notes"));
        return filter;
    }
}