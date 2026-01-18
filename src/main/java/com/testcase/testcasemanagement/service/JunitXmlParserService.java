// src/main/java/com/testcase/testcasemanagement/service/JunitXmlParserService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.*;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * ICT-203: JUnit XML 파일 파싱 서비스
 * JUnit XML 파일을 파싱하여 데이터베이스 엔티티로 변환
 */
@Service
public class JunitXmlParserService {

    private static final Logger logger = LoggerFactory.getLogger(JunitXmlParserService.class);

    /**
     * 진행률 콜백 인터페이스
     */
    @FunctionalInterface
    public interface ProgressCallback {
        void onProgress(int current, int total, String message);
    }

    /**
     * InputStream으로부터 JUnit XML을 파싱하여 JunitTestResult 객체로 변환
     * 
     * @param inputStream XML 파일의 InputStream
     * @param fileName    원본 파일명
     * @param projectId   프로젝트 ID
     * @param uploadedBy  업로드한 사용자
     * @return 파싱된 JunitTestResult 객체
     * @throws JunitXmlParsingException 파싱 중 오류 발생 시
     */
    public JunitTestResult parseJunitXml(InputStream inputStream, String fileName,
            String projectId, User uploadedBy) throws JunitXmlParsingException {
        return parseJunitXmlWithProgress(inputStream, fileName, projectId, uploadedBy, null);
    }

    /**
     * 진행률 콜백과 함께 JUnit XML 파싱 (대용량 파일 처리용)
     * 
     * @param inputStream      XML 파일의 InputStream
     * @param fileName         원본 파일명
     * @param projectId        프로젝트 ID
     * @param uploadedBy       업로드한 사용자
     * @param progressCallback 진행률 콜백
     * @return 파싱된 JunitTestResult 객체
     * @throws JunitXmlParsingException 파싱 중 오류 발생 시
     */
    public JunitTestResult parseJunitXmlWithProgress(InputStream inputStream, String fileName,
            String projectId, User uploadedBy,
            ProgressCallback progressCallback) throws JunitXmlParsingException {
        try {
            logger.info("JUnit XML 파싱 시작 - 파일: {}, 프로젝트: {}", fileName, projectId);

            // DOM 파서 설정
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(inputStream);

            // 루트 엘리먼트 확인
            Element rootElement = document.getDocumentElement();
            if (!"testsuites".equals(rootElement.getNodeName()) && !"testsuite".equals(rootElement.getNodeName())) {
                throw new JunitXmlParsingException(
                        "Invalid JUnit XML: Root element must be 'testsuites' or 'testsuite'");
            }

            // JunitTestResult 객체 생성
            JunitTestResult testResult = new JunitTestResult();
            testResult.setFileName(fileName);
            testResult.setProjectId(projectId);
            testResult.setUploadedBy(uploadedBy);
            testResult.setStatus(JunitProcessStatus.PARSING);

            // 메인 파싱 로직 (진행률 콜백과 함께)
            if ("testsuites".equals(rootElement.getNodeName())) {
                parseTestSuites(rootElement, testResult, progressCallback);
            } else {
                // 단일 testsuite인 경우
                parseSingleTestSuite(rootElement, testResult, progressCallback);
            }

            // 통계 계산
            calculateStatistics(testResult);

            // 기본 실행 이름 설정
            if (testResult.getTestExecutionName() == null || testResult.getTestExecutionName().isEmpty()) {
                testResult.setTestExecutionName(generateDefaultExecutionName(fileName));
            }

            testResult.setStatus(JunitProcessStatus.COMPLETED);
            testResult.setParsedAt(LocalDateTime.now());

            logger.info("JUnit XML 파싱 완료 - 총 테스트: {}, 실패: {}, 에러: {}",
                    testResult.getTotalTests(), testResult.getFailures(), testResult.getErrors());

            return testResult;

        } catch (ParserConfigurationException | SAXException | IOException e) {
            logger.error("JUnit XML 파싱 중 오류 발생: {}", e.getMessage(), e);
            throw new JunitXmlParsingException("Failed to parse JUnit XML: " + e.getMessage(), e);
        }
    }

    /**
     * testsuites 요소 파싱 (여러 testsuite 포함)
     */
    private void parseTestSuites(Element testSuitesElement, JunitTestResult testResult,
            ProgressCallback progressCallback) {
        // testsuites 레벨 속성 읽기
        String name = getAttribute(testSuitesElement, "name");
        if (name != null && !name.isEmpty()) {
            testResult.setTestExecutionName(name);
        }

        // 전체 통계 (testsuites 레벨에서 읽을 수 있는 경우)
        String testsAttr = getAttribute(testSuitesElement, "tests");
        String failuresAttr = getAttribute(testSuitesElement, "failures");
        String errorsAttr = getAttribute(testSuitesElement, "errors");
        String timeAttr = getAttribute(testSuitesElement, "time");

        List<JunitTestSuite> testSuites = new ArrayList<>();

        // 각 testsuite 요소 파싱 (진행률 추적)
        NodeList testSuiteNodes = testSuitesElement.getElementsByTagName("testsuite");
        int totalSuites = testSuiteNodes.getLength();

        for (int i = 0; i < totalSuites; i++) {
            Element testSuiteElement = (Element) testSuiteNodes.item(i);

            // 진행률 콜백 호출
            if (progressCallback != null) {
                progressCallback.onProgress(i + 1, totalSuites,
                        String.format("테스트 스위트 파싱 중... (%d/%d)", i + 1, totalSuites));
            }

            JunitTestSuite testSuite = parseTestSuite(testSuiteElement, testResult);
            testSuites.add(testSuite);
        }

        testResult.setTestSuites(testSuites);
    }

    /**
     * 단일 testsuite 요소 파싱
     */
    private void parseSingleTestSuite(Element testSuiteElement, JunitTestResult testResult,
            ProgressCallback progressCallback) {
        // 진행률 콜백 호출
        if (progressCallback != null) {
            progressCallback.onProgress(1, 1, "단일 테스트 스위트 파싱 중...");
        }

        List<JunitTestSuite> testSuites = new ArrayList<>();
        JunitTestSuite testSuite = parseTestSuite(testSuiteElement, testResult);
        testSuites.add(testSuite);
        testResult.setTestSuites(testSuites);

        // 단일 스위트인 경우 스위트 이름을 실행 이름으로 사용
        if (testResult.getTestExecutionName() == null || testResult.getTestExecutionName().isEmpty()) {
            testResult.setTestExecutionName(testSuite.getName());
        }
    }

    /**
     * 개별 testsuite 요소 파싱
     */
    private JunitTestSuite parseTestSuite(Element testSuiteElement, JunitTestResult testResult) {
        JunitTestSuite testSuite = new JunitTestSuite();
        testSuite.setJunitTestResult(testResult);

        // 기본 속성
        testSuite.setName(getAttribute(testSuiteElement, "name", "Unknown Suite"));
        testSuite.setPackageName(getAttribute(testSuiteElement, "package"));
        testSuite.setTests(getIntAttribute(testSuiteElement, "tests", 0));
        testSuite.setFailures(getIntAttribute(testSuiteElement, "failures", 0));
        testSuite.setErrors(getIntAttribute(testSuiteElement, "errors", 0));
        testSuite.setSkipped(getIntAttribute(testSuiteElement, "skipped", 0));
        testSuite.setTime(getDoubleAttribute(testSuiteElement, "time", 0.0));
        testSuite.setHostname(getAttribute(testSuiteElement, "hostname"));

        // 타임스탬프 파싱
        String timestampAttr = getAttribute(testSuiteElement, "timestamp");
        if (timestampAttr != null) {
            testSuite.setTimestamp(parseTimestamp(timestampAttr));
        }

        // system-out, system-err 파싱
        testSuite.setSystemOut(getChildElementText(testSuiteElement, "system-out"));
        testSuite.setSystemErr(getChildElementText(testSuiteElement, "system-err"));

        // 테스트 케이스들 파싱
        List<JunitTestCase> testCases = new ArrayList<>();
        NodeList testCaseNodes = testSuiteElement.getElementsByTagName("testcase");
        for (int i = 0; i < testCaseNodes.getLength(); i++) {
            Element testCaseElement = (Element) testCaseNodes.item(i);
            JunitTestCase testCase = parseTestCase(testCaseElement, testSuite);
            testCases.add(testCase);
        }
        testSuite.setTestCases(testCases);

        return testSuite;
    }

    /**
     * 개별 testcase 요소 파싱
     */
    private JunitTestCase parseTestCase(Element testCaseElement, JunitTestSuite testSuite) {
        JunitTestCase testCase = new JunitTestCase();
        testCase.setJunitTestSuite(testSuite);

        // 기본 속성
        testCase.setName(getAttribute(testCaseElement, "name", "Unknown Test"));
        testCase.setClassName(getAttribute(testCaseElement, "classname", ""));
        testCase.setTime(getDoubleAttribute(testCaseElement, "time", 0.0));

        // 초기 상태는 성공으로 설정
        testCase.setStatus(JunitTestStatus.PASSED);

        // failure, error, skipped 요소 확인
        NodeList failureNodes = testCaseElement.getElementsByTagName("failure");
        NodeList errorNodes = testCaseElement.getElementsByTagName("error");
        NodeList skippedNodes = testCaseElement.getElementsByTagName("skipped");

        if (failureNodes.getLength() > 0) {
            Element failureElement = (Element) failureNodes.item(0);
            testCase.setStatus(JunitTestStatus.FAILED);
            testCase.setFailureMessage(getAttribute(failureElement, "message"));
            testCase.setFailureType(getAttribute(failureElement, "type"));
            testCase.setStackTrace(failureElement.getTextContent());
        } else if (errorNodes.getLength() > 0) {
            Element errorElement = (Element) errorNodes.item(0);
            testCase.setStatus(JunitTestStatus.ERROR);
            testCase.setFailureMessage(getAttribute(errorElement, "message"));
            testCase.setFailureType(getAttribute(errorElement, "type"));
            testCase.setStackTrace(errorElement.getTextContent());
        } else if (skippedNodes.getLength() > 0) {
            Element skippedElement = (Element) skippedNodes.item(0);
            testCase.setStatus(JunitTestStatus.SKIPPED);
            testCase.setSkipMessage(getAttribute(skippedElement, "message"));
            if (testCase.getSkipMessage() == null) {
                testCase.setSkipMessage(skippedElement.getTextContent());
            }
        }

        // system-out, system-err
        testCase.setSystemOut(getChildElementText(testCaseElement, "system-out"));
        testCase.setSystemErr(getChildElementText(testCaseElement, "system-err"));

        return testCase;
    }

    /**
     * 전체 통계 계산
     */
    private void calculateStatistics(JunitTestResult testResult) {
        int totalTests = 0;
        int totalFailures = 0;
        int totalErrors = 0;
        int totalSkipped = 0;
        double totalTime = 0.0;

        if (testResult.getTestSuites() != null) {
            for (JunitTestSuite suite : testResult.getTestSuites()) {
                totalTests += suite.getTests();
                totalFailures += suite.getFailures();
                totalErrors += suite.getErrors();
                totalSkipped += suite.getSkipped();
                totalTime += suite.getTime();
            }
        }

        testResult.setTotalTests(totalTests);
        testResult.setFailures(totalFailures);
        testResult.setErrors(totalErrors);
        testResult.setSkipped(totalSkipped);
        testResult.setTotalTime(totalTime);
    }

    /**
     * 기본 실행 이름 생성
     */
    private String generateDefaultExecutionName(String fileName) {
        if (fileName == null)
            return "JUnit Test Execution";

        // 확장자 제거
        String baseName = fileName;
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            baseName = fileName.substring(0, lastDotIndex);
        }

        return "Test Execution - " + baseName;
    }

    /**
     * XML 속성 값 안전하게 가져오기
     */
    private String getAttribute(Element element, String attributeName) {
        return element.hasAttribute(attributeName) ? element.getAttribute(attributeName) : null;
    }

    private String getAttribute(Element element, String attributeName, String defaultValue) {
        String value = getAttribute(element, attributeName);
        return value != null ? value : defaultValue;
    }

    private int getIntAttribute(Element element, String attributeName, int defaultValue) {
        String value = getAttribute(element, attributeName);
        if (value == null || value.trim().isEmpty())
            return defaultValue;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            logger.warn("Invalid integer attribute '{}': {}", attributeName, value);
            return defaultValue;
        }
    }

    private double getDoubleAttribute(Element element, String attributeName, double defaultValue) {
        String value = getAttribute(element, attributeName);
        if (value == null || value.trim().isEmpty())
            return defaultValue;
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            logger.warn("Invalid double attribute '{}': {}", attributeName, value);
            return defaultValue;
        }
    }

    /**
     * 자식 요소의 텍스트 내용 가져오기
     */
    private String getChildElementText(Element parentElement, String childTagName) {
        NodeList childNodes = parentElement.getElementsByTagName(childTagName);
        if (childNodes.getLength() > 0) {
            return childNodes.item(0).getTextContent();
        }
        return null;
    }

    /**
     * 타임스탬프 문자열 파싱
     */
    private LocalDateTime parseTimestamp(String timestampStr) {
        if (timestampStr == null || timestampStr.trim().isEmpty()) {
            return null;
        }

        // 다양한 타임스탬프 형식 지원
        String[] patterns = {
                "yyyy-MM-dd'T'HH:mm:ss",
                "yyyy-MM-dd'T'HH:mm:ss.SSS",
                "yyyy-MM-dd'T'HH:mm:ss'Z'",
                "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                "yyyy-MM-dd HH:mm:ss",
                "yyyy-MM-dd HH:mm:ss.SSS"
        };

        for (String pattern : patterns) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
                return LocalDateTime.parse(timestampStr.trim(), formatter);
            } catch (DateTimeParseException e) {
                // 다음 패턴 시도
            }
        }

        logger.warn("Unable to parse timestamp: {}", timestampStr);
        return null;
    }

    /**
     * XML 파싱 예외 클래스
     */
    public static class JunitXmlParsingException extends Exception {
        public JunitXmlParsingException(String message) {
            super(message);
        }

        public JunitXmlParsingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}