// src/test/java/com/testcase/testcasemanagement/service/JunitXmlParserServiceTest.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.*;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.InputStream;

/**
 * ICT-203: JUnit XML 파서 서비스 테스트
 */
public class JunitXmlParserServiceTest {
    
    private JunitXmlParserService parserService;
    private User testUser;
    
    @BeforeMethod
    public void setUp() {
        parserService = new JunitXmlParserService();
        
        // 테스트용 사용자 생성
        testUser = new User();
        testUser.setId("test-user");
        testUser.setUsername("testuser");
    }
    
    @Test
    public void testParseValidJunitXml() throws Exception {
        // Given
        InputStream xmlStream = getClass().getClassLoader().getResourceAsStream("sample-junit.xml");
        Assert.assertNotNull(xmlStream, "Sample JUnit XML file should exist");
        
        // When
        JunitTestResult result = parserService.parseJunitXml(
            xmlStream, "sample-junit.xml", "test-project", testUser);
        
        // Then
        Assert.assertNotNull(result);
        Assert.assertEquals(result.getFileName(), "sample-junit.xml");
        Assert.assertEquals(result.getProjectId(), "test-project");
        Assert.assertEquals(result.getUploadedBy(), testUser);
        Assert.assertEquals(result.getStatus(), JunitProcessStatus.COMPLETED);
        
        // 통계 검증
        Assert.assertEquals(result.getTotalTests(), Integer.valueOf(6));
        Assert.assertEquals(result.getFailures(), Integer.valueOf(2));
        Assert.assertEquals(result.getErrors(), Integer.valueOf(1));
        Assert.assertEquals(result.getSkipped(), Integer.valueOf(1));
        Assert.assertTrue(result.getTotalTime() > 0);
        
        // 성공률 검증
        Double expectedSuccessRate = (6.0 - 2 - 1) / 6.0 * 100; // 50%
        Assert.assertEquals(result.getSuccessRate(), expectedSuccessRate, 0.01);
        
        // 테스트 스위트 검증
        Assert.assertNotNull(result.getTestSuites());
        Assert.assertEquals(result.getTestSuites().size(), 2);
        
        JunitTestSuite firstSuite = result.getTestSuites().get(0);
        Assert.assertEquals(firstSuite.getName(), "com.example.CalculatorTest");
        Assert.assertEquals(firstSuite.getTests(), Integer.valueOf(4));
        Assert.assertEquals(firstSuite.getFailures(), Integer.valueOf(1));
        Assert.assertEquals(firstSuite.getErrors(), Integer.valueOf(1));
        
        // 테스트 케이스 검증
        Assert.assertNotNull(firstSuite.getTestCases());
        Assert.assertEquals(firstSuite.getTestCases().size(), 4);
        
        // 첫 번째 성공 케이스
        JunitTestCase successCase = firstSuite.getTestCases().get(0);
        Assert.assertEquals(successCase.getName(), "testAdd");
        Assert.assertEquals(successCase.getClassName(), "com.example.CalculatorTest");
        Assert.assertEquals(successCase.getStatus(), JunitTestStatus.PASSED);
        Assert.assertTrue(successCase.getTime() > 0);
        
        // 실패 케이스 찾기
        JunitTestCase failureCase = firstSuite.getTestCases().stream()
            .filter(tc -> tc.getName().equals("testMultiply"))
            .findFirst()
            .orElse(null);
        
        Assert.assertNotNull(failureCase);
        Assert.assertEquals(failureCase.getStatus(), JunitTestStatus.FAILED);
        Assert.assertEquals(failureCase.getFailureMessage(), "Expected 6 but was 5");
        Assert.assertEquals(failureCase.getFailureType(), "AssertionError");
        Assert.assertNotNull(failureCase.getStackTrace());
        
        // 에러 케이스 찾기
        JunitTestCase errorCase = firstSuite.getTestCases().stream()
            .filter(tc -> tc.getName().equals("testDivide"))
            .findFirst()
            .orElse(null);
        
        Assert.assertNotNull(errorCase);
        Assert.assertEquals(errorCase.getStatus(), JunitTestStatus.ERROR);
        Assert.assertEquals(errorCase.getFailureMessage(), "Division by zero");
        Assert.assertEquals(errorCase.getFailureType(), "ArithmeticException");
        
        xmlStream.close();
    }
    
    @Test
    public void testParseInvalidXml() {
        // Given
        String invalidXml = "<?xml version=\"1.0\"?><invalid>not a junit xml</invalid>";
        InputStream xmlStream = new java.io.ByteArrayInputStream(invalidXml.getBytes());
        
        // When & Then
        try {
            parserService.parseJunitXml(xmlStream, "invalid.xml", "test-project", testUser);
            Assert.fail("Should throw JunitXmlParsingException for invalid XML");
        } catch (JunitXmlParserService.JunitXmlParsingException e) {
            Assert.assertTrue(e.getMessage().contains("Root element must be"));
        }
    }
    
    @Test
    public void testParseEmptyTestSuites() throws Exception {
        // Given
        String emptyXml = "<?xml version=\"1.0\"?><testsuites tests=\"0\" failures=\"0\" errors=\"0\"></testsuites>";
        InputStream xmlStream = new java.io.ByteArrayInputStream(emptyXml.getBytes());
        
        // When
        JunitTestResult result = parserService.parseJunitXml(
            xmlStream, "empty.xml", "test-project", testUser);
        
        // Then
        Assert.assertNotNull(result);
        Assert.assertEquals(result.getTotalTests(), Integer.valueOf(0));
        Assert.assertEquals(result.getFailures(), Integer.valueOf(0));
        Assert.assertEquals(result.getErrors(), Integer.valueOf(0));
        Assert.assertEquals(result.getSkipped(), Integer.valueOf(0));
        Assert.assertTrue(result.getTestSuites().isEmpty());
    }
    
    @Test
    public void testDefaultExecutionNameGeneration() throws Exception {
        // Given
        String simpleXml = "<?xml version=\"1.0\"?><testsuite name=\"SimpleTest\" tests=\"1\" failures=\"0\" errors=\"0\"><testcase name=\"test1\" classname=\"Test\" time=\"0.1\"/></testsuite>";
        InputStream xmlStream = new java.io.ByteArrayInputStream(simpleXml.getBytes());
        
        // When
        JunitTestResult result = parserService.parseJunitXml(
            xmlStream, "my-test-file.xml", "test-project", testUser);
        
        // Then
        Assert.assertNotNull(result.getTestExecutionName());
        Assert.assertTrue(result.getTestExecutionName().contains("my-test-file") || 
                         result.getTestExecutionName().contains("SimpleTest"));
    }
}