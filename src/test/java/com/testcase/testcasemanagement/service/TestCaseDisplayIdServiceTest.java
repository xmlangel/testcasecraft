package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ICT-341: TestCaseDisplayIdService 단위 테스트
 * 
 * 프로젝트코드-넘버 형식의 Display ID 생성 기능을 테스트합니다.
 */
public class TestCaseDisplayIdServiceTest {

    private TestCaseDisplayIdService displayIdService;
    
    @BeforeMethod
    public void setUp() {
        displayIdService = new TestCaseDisplayIdService();
    }
    
    /**
     * 프로젝트에 code 필드가 있는 경우 Display ID 생성 테스트
     */
    @Test
    public void testGenerateDisplayId_WithProjectCode() {
        // Given
        Project project = new Project();
        project.setId("project-1");
        project.setName("테스트 프로젝트");
        project.setCode("TEST"); // 프로젝트 코드 설정
        
        TestCase testCase = new TestCase();
        testCase.setId("testcase-1");
        testCase.setProject(project);
        testCase.setSequentialId(1);
        
        // When
        String displayId = displayIdService.generateDisplayId(testCase);
        
        // Then
        Assert.assertEquals(displayId, "TEST-001", "프로젝트 코드를 사용한 Display ID 생성");
    }
    
    /**
     * 프로젝트에 code 필드가 없고 name으로부터 코드를 추출하는 경우 테스트
     */
    @Test
    public void testGenerateDisplayId_WithoutProjectCode() {
        // Given
        Project project = new Project();
        project.setId("project-2");
        project.setName("WebApp Project");
        project.setCode(null); // 프로젝트 코드 없음
        
        TestCase testCase = new TestCase();
        testCase.setId("testcase-2");
        testCase.setProject(project);
        testCase.setSequentialId(42);
        
        // When
        String displayId = displayIdService.generateDisplayId(testCase);
        
        // Then
        Assert.assertEquals(displayId, "WEBA-042", "프로젝트 이름에서 추출한 코드로 Display ID 생성");
    }
    
    /**
     * 프로젝트 이름에서 특수문자를 제거하고 코드를 추출하는 테스트
     */
    @Test
    public void testGenerateDisplayId_WithSpecialCharactersInName() {
        // Given
        Project project = new Project();
        project.setId("project-3");
        project.setName("Test-App 2024 #1");
        project.setCode(null);
        
        TestCase testCase = new TestCase();
        testCase.setId("testcase-3");
        testCase.setProject(project);
        testCase.setSequentialId(123);
        
        // When
        String displayId = displayIdService.generateDisplayId(testCase);
        
        // Then
        Assert.assertEquals(displayId, "TEST-123", "특수문자가 포함된 프로젝트 이름에서 코드 추출");
    }
    
    /**
     * 프로젝트 이름이 4글자보다 짧은 경우 테스트
     */
    @Test
    public void testGenerateDisplayId_WithShortProjectName() {
        // Given
        Project project = new Project();
        project.setId("project-4");
        project.setName("App");
        project.setCode(null);
        
        TestCase testCase = new TestCase();
        testCase.setId("testcase-4");
        testCase.setProject(project);
        testCase.setSequentialId(5);
        
        // When
        String displayId = displayIdService.generateDisplayId(testCase);
        
        // Then
        Assert.assertEquals(displayId, "APP-005", "짧은 프로젝트 이름으로 Display ID 생성");
    }
    
    /**
     * 프로젝트가 null인 경우 테스트
     */
    @Test
    public void testGenerateDisplayId_NullProject() {
        // Given
        TestCase testCase = new TestCase();
        testCase.setId("testcase-5");
        testCase.setProject(null);
        testCase.setSequentialId(10);
        
        // When
        String displayId = displayIdService.generateDisplayId(testCase);
        
        // Then
        Assert.assertNull(displayId, "프로젝트가 null인 경우 null 반환");
    }
    
    /**
     * sequentialId가 null인 경우 테스트
     */
    @Test
    public void testGenerateDisplayId_NullSequentialId() {
        // Given
        Project project = new Project();
        project.setId("project-6");
        project.setName("Test Project");
        project.setCode("TEST");
        
        TestCase testCase = new TestCase();
        testCase.setId("testcase-6");
        testCase.setProject(project);
        testCase.setSequentialId(null);
        
        // When
        String displayId = displayIdService.generateDisplayId(testCase);
        
        // Then
        Assert.assertNull(displayId, "sequentialId가 null인 경우 null 반환");
    }
    
    /**
     * Display ID 형식 유효성 검증 테스트
     */
    @Test
    public void testIsValidDisplayId() {
        // 유효한 Display ID들
        Assert.assertTrue(displayIdService.isValidDisplayId("TEST-001"));
        Assert.assertTrue(displayIdService.isValidDisplayId("PROJ-999"));
        Assert.assertTrue(displayIdService.isValidDisplayId("WEB-042"));
        Assert.assertTrue(displayIdService.isValidDisplayId("A-123"));
        
        // 유효하지 않은 Display ID들
        Assert.assertFalse(displayIdService.isValidDisplayId(null));
        Assert.assertFalse(displayIdService.isValidDisplayId(""));
        Assert.assertFalse(displayIdService.isValidDisplayId("TEST-1")); // 3자리가 아님
        Assert.assertFalse(displayIdService.isValidDisplayId("TEST001")); // 하이픈 없음
        Assert.assertFalse(displayIdService.isValidDisplayId("test-001")); // 소문자
        Assert.assertFalse(displayIdService.isValidDisplayId("TEST-ABC")); // 숫자가 아님
        Assert.assertFalse(displayIdService.isValidDisplayId("TEST-1234")); // 4자리 숫자
    }
    
    /**
     * Display ID에서 프로젝트 코드 추출 테스트
     */
    @Test
    public void testExtractProjectCodeFromDisplayId() {
        Assert.assertEquals(displayIdService.extractProjectCodeFromDisplayId("TEST-001"), "TEST");
        Assert.assertEquals(displayIdService.extractProjectCodeFromDisplayId("PROJ-999"), "PROJ");
        Assert.assertEquals(displayIdService.extractProjectCodeFromDisplayId("A-123"), "A");
        
        // 유효하지 않은 경우
        Assert.assertNull(displayIdService.extractProjectCodeFromDisplayId(null));
        Assert.assertNull(displayIdService.extractProjectCodeFromDisplayId(""));
        Assert.assertNull(displayIdService.extractProjectCodeFromDisplayId("INVALID"));
    }
    
    /**
     * Display ID에서 시퀀스 번호 추출 테스트
     */
    @Test
    public void testExtractSequenceFromDisplayId() {
        Assert.assertEquals(displayIdService.extractSequenceFromDisplayId("TEST-001"), Integer.valueOf(1));
        Assert.assertEquals(displayIdService.extractSequenceFromDisplayId("PROJ-999"), Integer.valueOf(999));
        Assert.assertEquals(displayIdService.extractSequenceFromDisplayId("WEB-042"), Integer.valueOf(42));
        
        // 유효하지 않은 경우
        Assert.assertNull(displayIdService.extractSequenceFromDisplayId(null));
        Assert.assertNull(displayIdService.extractSequenceFromDisplayId(""));
        Assert.assertNull(displayIdService.extractSequenceFromDisplayId("INVALID"));
    }
    
    /**
     * updateDisplayId 메소드 테스트
     */
    @Test
    public void testUpdateDisplayId() {
        // Given
        Project project = new Project();
        project.setId("project-7");
        project.setName("Update Test");
        project.setCode("UPD");
        
        TestCase testCase = new TestCase();
        testCase.setId("testcase-7");
        testCase.setProject(project);
        testCase.setSequentialId(25);
        testCase.setDisplayId("OLD-999"); // 기존 Display ID
        
        // When
        displayIdService.updateDisplayId(testCase);
        
        // Then
        Assert.assertEquals(testCase.getDisplayId(), "UPD-025", "Display ID가 업데이트됨");
    }
    
    /**
     * 기본 프로젝트 코드 적용 테스트 (이름이 비어있는 경우)
     */
    @Test
    public void testGenerateDisplayId_DefaultProjectCode() {
        // Given
        Project project = new Project();
        project.setId("project-8");
        project.setName("");
        project.setCode(null);
        
        TestCase testCase = new TestCase();
        testCase.setId("testcase-8");
        testCase.setProject(project);
        testCase.setSequentialId(77);
        
        // When
        String displayId = displayIdService.generateDisplayId(testCase);
        
        // Then
        Assert.assertEquals(displayId, "TEST-077", "프로젝트 이름이 비어있는 경우 기본값 'TEST' 사용");
    }
    
    /**
     * 한글 프로젝트 이름 처리 테스트
     */
    @Test
    public void testGenerateDisplayId_KoreanProjectName() {
        // Given
        Project project = new Project();
        project.setId("project-9");
        project.setName("테스트관리시스템");
        project.setCode(null);
        
        TestCase testCase = new TestCase();
        testCase.setId("testcase-9");
        testCase.setProject(project);
        testCase.setSequentialId(15);
        
        // When
        String displayId = displayIdService.generateDisplayId(testCase);
        
        // Then
        Assert.assertEquals(displayId, "테스트관-015", "한글 프로젝트 이름에서 4글자 추출");
    }
}