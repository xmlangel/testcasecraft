// src/main/java/com/testcase/testcasemanagement/service/JunitXmlParserService.java

package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.*;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.*;
import org.xml.sax.SAXException;

/** ICT-203: JUnit XML 파일 파싱 서비스 JUnit XML 파일을 파싱하여 데이터베이스 엔티티로 변환 */
@Service
public class JunitXmlParserService {

  private static final Logger logger = LoggerFactory.getLogger(JunitXmlParserService.class);
  private final ObjectMapper objectMapper = new ObjectMapper();

  /** 진행률 콜백 인터페이스 */
  @FunctionalInterface
  public interface ProgressCallback {
    void onProgress(int current, int total, String message);
  }

  /**
   * InputStream으로부터 JUnit XML을 파싱하여 JunitTestResult 객체로 변환
   *
   * @param inputStream XML 파일의 InputStream
   * @param fileName 원본 파일명
   * @param projectId 프로젝트 ID
   * @param uploadedBy 업로드한 사용자
   * @return 파싱된 JunitTestResult 객체
   * @throws JunitXmlParsingException 파싱 중 오류 발생 시
   */
  public JunitTestResult parseJunitXml(
      InputStream inputStream, String fileName, String projectId, User uploadedBy)
      throws JunitXmlParsingException {
    return parseJunitXmlWithProgress(inputStream, fileName, projectId, uploadedBy, null);
  }

  /**
   * 진행률 콜백과 함께 JUnit XML 파싱 (대용량 파일 처리용)
   *
   * @param inputStream XML 파일의 InputStream
   * @param fileName 원본 파일명
   * @param projectId 프로젝트 ID
   * @param uploadedBy 업로드한 사용자
   * @param progressCallback 진행률 콜백
   * @return 파싱된 JunitTestResult 객체
   * @throws JunitXmlParsingException 파싱 중 오류 발생 시
   */
  public JunitTestResult parseJunitXmlWithProgress(
      InputStream inputStream,
      String fileName,
      String projectId,
      User uploadedBy,
      ProgressCallback progressCallback)
      throws JunitXmlParsingException {
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
      if (!"testsuites".equals(rootElement.getNodeName())
          && !"testsuite".equals(rootElement.getNodeName())) {
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
      if (testResult.getTestExecutionName() == null
          || testResult.getTestExecutionName().isEmpty()) {
        testResult.setTestExecutionName(generateDefaultExecutionName(fileName));
      }

      testResult.setStatus(JunitProcessStatus.COMPLETED);
      testResult.setParsedAt(LocalDateTime.now());

      logger.info(
          "JUnit XML 파싱 완료 - 총 테스트: {}, 실패: {}, 에러: {}",
          testResult.getTotalTests(),
          testResult.getFailures(),
          testResult.getErrors());

      return testResult;

    } catch (ParserConfigurationException | SAXException | IOException e) {
      logger.error("JUnit XML 파싱 중 오류 발생: {}", e.getMessage(), e);
      throw new JunitXmlParsingException("Failed to parse JUnit XML: " + e.getMessage(), e);
    }
  }

  /** testsuites 요소 파싱 (여러 testsuite 포함) */
  private void parseTestSuites(
      Element testSuitesElement, JunitTestResult testResult, ProgressCallback progressCallback) {
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
        progressCallback.onProgress(
            i + 1, totalSuites, String.format("테스트 스위트 파싱 중... (%d/%d)", i + 1, totalSuites));
      }

      JunitTestSuite testSuite = parseTestSuite(testSuiteElement, testResult);
      testSuites.add(testSuite);
    }

    testResult.setTestSuites(testSuites);
  }

  /** 단일 testsuite 요소 파싱 */
  private void parseSingleTestSuite(
      Element testSuiteElement, JunitTestResult testResult, ProgressCallback progressCallback) {
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

  /** 개별 testsuite 요소 파싱 */
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

    // ICT-337: 스위트 레벨 system-out에서 메타데이터 추출 및 일치하는 테스트 케이스에 적용
    if (testSuite.getSystemOut() != null && !testSuite.getSystemOut().isEmpty()) {
      parseMetadataFromSystemOut(testSuite.getSystemOut(), testCases);
    }

    return testSuite;
  }

  /** 개별 testcase 요소 파싱 */
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

      // 상세 단계 파싱 (PostgreSQL Regression Tests 형식)
      parseDetailedSteps(failureElement, testCase);

      // 기존 스택 트레이스도 유지 (전체 텍스트 내용)
      testCase.setStackTrace(failureElement.getTextContent());
    } else if (errorNodes.getLength() > 0) {
      Element errorElement = (Element) errorNodes.item(0);
      testCase.setStatus(JunitTestStatus.ERROR);
      testCase.setFailureMessage(getAttribute(errorElement, "message"));
      testCase.setFailureType(getAttribute(errorElement, "type"));
      parseDetailedSteps(errorElement, testCase);
      testCase.setStackTrace(errorElement.getTextContent());
    } else if (skippedNodes.getLength() > 0) {
      Element skippedElement = (Element) skippedNodes.item(0);
      testCase.setStatus(JunitTestStatus.SKIPPED);
      testCase.setSkipMessage(getAttribute(skippedElement, "message"));
      if (testCase.getSkipMessage() == null) {
        testCase.setSkipMessage(skippedElement.getTextContent());
      }
      parseDetailedSteps(skippedElement, testCase);
    }

    // ICT-337: 모든 테스트 케이스에 대해 상세 단계 파싱 시도 (성공한 케이스 포함)
    parseDetailedSteps(testCaseElement, testCase);

    // system-out, system-err
    testCase.setSystemOut(getChildElementText(testCaseElement, "system-out"));
    testCase.setSystemErr(getChildElementText(testCaseElement, "system-err"));

    // ICT-337: 테스트 케이스 로그에서 메타데이터 및 레거시 단계 추출
    parseMetadataFromLogs(testCase);

    // properties 파싱 (ICT-337: 추가 속성 정보)
    parseTestCaseProperties(testCaseElement, testCase);

    return testCase;
  }

  /** testcase 레벨의 properties 파싱 */
  private void parseTestCaseProperties(Element testCaseElement, JunitTestCase testCase) {
    NodeList propertiesNodes = testCaseElement.getElementsByTagName("properties");
    if (propertiesNodes.getLength() == 0) return;

    Element propertiesElement = (Element) propertiesNodes.item(0);

    // ICT-337: 모든 자식 노드 순회 (표준 property 태그와 커스텀 태그 모두 처리)
    // NodeList propertyNodes = propertiesElement.getElementsByTagName("property");
    // -> 기존 로직 대신 전체 자식 순회
    org.w3c.dom.NodeList children = propertiesElement.getChildNodes();
    Map<String, String> propertyMap = new java.util.HashMap<>();

    for (int i = 0; i < children.getLength(); i++) {
      org.w3c.dom.Node node = children.item(i);
      if (node.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE) {
        Element element = (Element) node;
        String name = null;
        String value = null;

        if ("property".equals(element.getTagName())) {
          name = getAttribute(element, "name");
          value = getAttribute(element, "value");
          if (value == null) {
            value = element.getTextContent();
          }
        } else {
          // 커스텀 태그 자체를 속성으로 간주 (예: <step>...</step>, <description>...</description>)
          name = element.getTagName();
          value = element.getTextContent();
        }

        if (name != null) {
          name = name.trim();
          value = (value != null) ? value.trim() : "";
          propertyMap.put(name, value);

          // 특정 필드 매핑
          if (("ExpectedResult".equalsIgnoreCase(name) || "expected".equalsIgnoreCase(name))
              && testCase.getExpectedResult() == null) {
            testCase.setExpectedResult(value);
          } else if (("ActualResult".equalsIgnoreCase(name) || "actual".equalsIgnoreCase(name))
              && testCase.getActualResult() == null) {
            testCase.setActualResult(value);
          } else if (("Description".equalsIgnoreCase(name) || "description".equalsIgnoreCase(name))
              && testCase.getUserTitle() == null) {
            testCase.setUserTitle(value);
          } else if (("Step".equalsIgnoreCase(name) || "step".equalsIgnoreCase(name))
              && testCase.getTestSteps() == null) {
            // ICT-337: 'Step' 속성이 있으면 파이프(|) 기준으로 분리하여 testSteps 데이터 구성
            String[] steps = value.split("\\s*\\|\\s*");
            List<Map<String, Object>> stepsList = new java.util.ArrayList<>();
            for (int j = 0; j < steps.length; j++) {
              String stepText = steps[j].trim();
              if (!stepText.isEmpty()) {
                Map<String, Object> stepMap = new java.util.HashMap<>();
                stepMap.put("index", String.valueOf(j + 1));
                stepMap.put("content", stepText);
                stepsList.add(stepMap);
              }
            }
            try {
              if (!stepsList.isEmpty()) {
                testCase.setTestSteps(objectMapper.writeValueAsString(stepsList));
              }
            } catch (JsonProcessingException e) {
              logger.warn(
                  "Failed to serialize 'Step' attribute to testSteps JSON: {}", e.getMessage());
            }
          }
        }
      }
    }

    try {
      if (!propertyMap.isEmpty()) {
        testCase.setProperties(objectMapper.writeValueAsString(propertyMap));
      }
    } catch (JsonProcessingException e) {
      logger.error("Error serializing testcase properties to JSON", e);
    }
  }

  /** 상세 테스트 정보 파싱 (<expected>, <actual>, <steps> 등) */
  private void parseDetailedSteps(Element element, JunitTestCase testCase) {
    if (element == null) return;

    // 상위 수준 기대 결과/실제 결과
    if (testCase.getExpectedResult() == null || testCase.getExpectedResult().isEmpty()) {
      String expected = getChildElementText(element, "expected");
      if (expected != null && !expected.isEmpty()) {
        testCase.setExpectedResult(expected);
      }
    }
    if (testCase.getActualResult() == null || testCase.getActualResult().isEmpty()) {
      String actual = getChildElementText(element, "actual");
      if (actual != null && !actual.isEmpty()) {
        testCase.setActualResult(actual);
      }
    }

    // 단계들 파싱
    List<Map<String, Object>> stepsList = new ArrayList<>();

    // 기존에 이미 파싱된 단계가 있다면 가져옴
    if (testCase.getTestSteps() != null && !testCase.getTestSteps().isEmpty()) {
      try {
        stepsList =
            objectMapper.readValue(
                testCase.getTestSteps(),
                new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
      } catch (IOException e) {
        logger.warn("Failed to parse existing test steps: {}", e.getMessage());
      }
    }

    // 1. <steps><step>...</step></steps> 형식 처리
    NodeList stepsNodes = element.getElementsByTagName("steps");
    if (stepsNodes.getLength() > 0) {
      Element stepsElement = (Element) stepsNodes.item(0);
      NodeList stepNodes = stepsElement.getElementsByTagName("step");
      for (int i = 0; i < stepNodes.getLength(); i++) {
        addStepToList(stepsList, parseSingleStepElement((Element) stepNodes.item(i)));
      }
    }

    // 2. <failure> 또는 <testcase> 내부에 직접 <step>이 있는 경우 (래퍼 없음) 추가 처리
    org.w3c.dom.NodeList children = element.getChildNodes();
    for (int i = 0; i < children.getLength(); i++) {
      org.w3c.dom.Node node = children.item(i);
      if (node.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE
          && "step".equals(node.getNodeName())) {
        addStepToList(stepsList, parseSingleStepElement((Element) node));
      }
    }

    try {
      if (!stepsList.isEmpty()) {
        testCase.setTestSteps(objectMapper.writeValueAsString(stepsList));
      }
    } catch (JsonProcessingException e) {
      logger.error("Error serializing test steps to JSON", e);
    }
  }

  /** 리스트에 단계 추가 (내용 또는 인덱스 기준 중복 방지) */
  private void addStepToList(List<Map<String, Object>> list, Map<String, Object> step) {
    boolean exists = list.stream().anyMatch(s -> s.equals(step));
    if (!exists) {
      list.add(step);
    }
  }

  /** 개별 <step> 엘리먼트 파싱 헬퍼 */
  private Map<String, Object> parseSingleStepElement(Element stepElement) {
    Map<String, Object> stepMap = new java.util.HashMap<>();

    // 속성 파싱 (index 등)
    org.w3c.dom.NamedNodeMap attributes = stepElement.getAttributes();
    for (int j = 0; j < attributes.getLength(); j++) {
      org.w3c.dom.Node attr = attributes.item(j);
      stepMap.put(attr.getNodeName(), attr.getNodeValue());
    }

    // 모든 자식 요소 파싱 (sql, expected, actual 및 기타 범용 태그)
    org.w3c.dom.NodeList childNodes = stepElement.getChildNodes();
    for (int j = 0; j < childNodes.getLength(); j++) {
      org.w3c.dom.Node childNode = childNodes.item(j);
      if (childNode.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE) {
        stepMap.put(childNode.getNodeName(), childNode.getTextContent());
      }
    }

    // 자식 요소가 없고 텍스트만 있는 경우도 처리
    if (stepMap.isEmpty() || (stepMap.size() == attributes.getLength())) {
      String textContent = stepElement.getTextContent().trim();
      if (!textContent.isEmpty()) {
        stepMap.put("content", textContent);
      }
    }

    return stepMap;
  }

  /** system-out 및 system-err 로그에서 메타데이터와 레거시 단계를 추출하여 적용 */
  private void parseMetadataFromLogs(JunitTestCase testCase) {
    String systemOut = testCase.getSystemOut();
    String systemErr = testCase.getSystemErr();

    logger.info(
        "메타데이터 파싱 시작 - 테스트: {}, System-Out 길이: {}, System-Err 길이: {}",
        testCase.getName(),
        systemOut != null ? systemOut.length() : 0,
        systemErr != null ? systemErr.length() : 0);

    // 1. system-out 처리
    if (systemOut != null && !systemOut.isEmpty()) {
      extractMetadataFromText(systemOut, testCase);
      parseLegacyStepsBlock(systemOut, testCase);
    }

    // 2. system-err 처리 (성공한 케이스의 상세 정보가 여기 포함되는 경우가 많음)
    if (systemErr != null && !systemErr.isEmpty()) {
      extractMetadataFromText(systemErr, testCase);
      parseLegacyStepsBlock(systemErr, testCase);
    }
  }

  /** 로그 텍스트에서 [METADATA:...] 패턴 추출 */
  private void extractMetadataFromText(String text, JunitTestCase testCase) {
    if (text == null || text.isEmpty()) return;

    // 패턴 1: [METADATA:테스트명:키=값] (특정 테스트 타겟팅)
    java.util.regex.Pattern p1 =
        java.util.regex.Pattern.compile("\\[METADATA:([^:]+):([^=]+)=(.*?)\\]");
    java.util.regex.Matcher m1 = p1.matcher(text);
    while (m1.find()) {
      String targetTestName = m1.group(1).trim();
      String key = m1.group(2).trim();
      String value = m1.group(3).trim();
      if (testCase.getName().equals(targetTestName)) {
        applyMetadataToTestCase(testCase, key, value);
      }
    }

    // 패턴 2: [METADATA:키=값] (현재 테스트에 직접 적용)
    java.util.regex.Pattern p2 = java.util.regex.Pattern.compile("\\[METADATA:([^=]+)=(.*?)\\]");
    java.util.regex.Matcher m2 = p2.matcher(text);
    while (m2.find()) {
      String key = m2.group(1).trim();
      String value = m2.group(2).trim();
      applyMetadataToTestCase(testCase, key, value);
    }
  }

  /** 로그 텍스트에서 [STEPS] 블록(레거시 형식)을 찾아 구조화된 단계로 변환 */
  private void parseLegacyStepsBlock(String text, JunitTestCase testCase) {
    if (text == null || !text.contains("[STEPS]")) {
      return;
    }

    logger.info("[STEPS] 블록 발견 - 테스트: {}", testCase.getName());

    int startIndex = text.indexOf("[STEPS]");
    String stepsPart = text.substring(startIndex);

    // 단계 리스트 초기화
    List<Map<String, Object>> stepsList = new java.util.ArrayList<>();

    // 기존 단계가 있으면 로드
    if (testCase.getTestSteps() != null && !testCase.getTestSteps().isEmpty()) {
      try {
        stepsList =
            objectMapper.readValue(
                testCase.getTestSteps(),
                new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
      } catch (IOException e) {
        // 무시하고 새로 생성
      }
    }

    // 정규식으로 STEP X:, EXPECTED:, ACTUAL: 패턴 추출
    // 구분선(---)을 기준으로 나누거나 키워드 기준으로 스캔
    String[] lines = stepsPart.split("\\r?\\n");
    Map<String, Object> currentStep = null;
    StringBuilder currentContent = new StringBuilder();
    String currentField = null;

    for (String line : lines) {
      line = line.trim();
      if (line.equals("[STEPS]")) continue;

      // 새로운 단계 시작 (예: STEP 1:)
      if (line.startsWith("STEP ") && line.contains(":")) {
        if (currentStep != null) {
          finalizeStepField(currentStep, currentField, currentContent);
          addStepToList(stepsList, currentStep);
        }
        currentStep = new java.util.HashMap<>();
        String stepIndex = line.substring(5, line.indexOf(":")).trim();
        currentStep.put("index", stepIndex);
        currentContent = new StringBuilder();
        currentField = "sql"; // 기본으로 SQL/Content 필드 시작
        continue;
      }

      // 필드 전환 (EXPECTED:, ACTUAL:)
      if (line.equals("EXPECTED:")) {
        finalizeStepField(currentStep, currentField, currentContent);
        currentField = "expected";
        currentContent = new StringBuilder();
        continue;
      } else if (line.equals("ACTUAL:")) {
        finalizeStepField(currentStep, currentField, currentContent);
        currentField = "actual";
        currentContent = new StringBuilder();
        continue;
      }

      // 단계 종료 구분선
      if (line.startsWith("-----------")) {
        if (currentStep != null) {
          finalizeStepField(currentStep, currentField, currentContent);
          addStepToList(stepsList, currentStep);
          currentStep = null;
          currentField = null;
        }
        continue;
      }

      // 내용 추가
      if (currentField != null && currentStep != null) {
        if (currentContent.length() > 0) currentContent.append("\n");
        currentContent.append(line);
      }
    }

    // 마지막 단계 처리
    if (currentStep != null) {
      finalizeStepField(currentStep, currentField, currentContent);
      addStepToList(stepsList, currentStep);
    }

    try {
      if (!stepsList.isEmpty()) {
        String json = objectMapper.writeValueAsString(stepsList);
        testCase.setTestSteps(json);
        logger.info("레거시 단계 파싱 성공! - 테스트: {}, 단계 수: {}", testCase.getName(), stepsList.size());
      }
    } catch (JsonProcessingException e) {
      logger.error("Error serializing legacy steps to JSON", e);
    }
  }

  private void finalizeStepField(Map<String, Object> step, String field, StringBuilder content) {
    if (step != null && field != null && content.length() > 0) {
      step.put(field, content.toString().trim());
    }
  }

  /**
   * system-out 로그에서 [METADATA:testName:key=value] 패턴을 찾아 메타데이터 추출 및 적용
   *
   * @deprecated Use extractMetadataFromText instead
   */
  @Deprecated
  private void parseMetadataFromSystemOut(String systemOut, List<JunitTestCase> testCases) {
    if (systemOut == null || systemOut.isEmpty() || testCases == null || testCases.isEmpty()) {
      return;
    }

    for (JunitTestCase testCase : testCases) {
      extractMetadataFromText(systemOut, testCase);
    }
  }

  /** 추출된 메타데이터를 테스트 케이스 필드에 반영 */
  private void applyMetadataToTestCase(JunitTestCase testCase, String key, String value) {
    if (key == null || value == null) return;

    // 1. 특정 필드 매핑
    if ("description".equalsIgnoreCase(key)) {
      if (testCase.getUserTitle() == null || testCase.getUserTitle().isEmpty()) {
        testCase.setUserTitle(value);
      }
    } else if ("expected_result".equalsIgnoreCase(key) || "expected".equalsIgnoreCase(key)) {
      if (testCase.getExpectedResult() == null || testCase.getExpectedResult().isEmpty()) {
        testCase.setExpectedResult(value);
      }
    } else if ("actual_result".equalsIgnoreCase(key) || "actual".equalsIgnoreCase(key)) {
      if (testCase.getActualResult() == null || testCase.getActualResult().isEmpty()) {
        testCase.setActualResult(value);
      }
    } else if ("step".equalsIgnoreCase(key)) {
      if (testCase.getTestSteps() == null || testCase.getTestSteps().isEmpty()) {
        String[] steps = value.split("\\s*\\|\\s*");
        List<Map<String, Object>> stepsList = new java.util.ArrayList<>();
        for (int i = 0; i < steps.length; i++) {
          String stepText = steps[i].trim();
          if (!stepText.isEmpty()) {
            Map<String, Object> stepMap = new java.util.HashMap<>();
            stepMap.put("index", String.valueOf(i + 1));
            stepMap.put("content", stepText);
            stepsList.add(stepMap);
          }
        }
        try {
          if (!stepsList.isEmpty()) {
            testCase.setTestSteps(objectMapper.writeValueAsString(stepsList));
          }
        } catch (JsonProcessingException e) {
          logger.warn("Failed to serialize 'step' metadata to testSteps JSON: {}", e.getMessage());
        }
      }
    }

    // 2. properties JSON에 추가
    try {
      Map<String, String> propertyMap = new java.util.HashMap<>();
      if (testCase.getProperties() != null && !testCase.getProperties().isEmpty()) {
        propertyMap =
            objectMapper.readValue(
                testCase.getProperties(),
                new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
      }

      // 기존에 없는 경우에만 추가하거나 업데이트 (여기서는 로그 정보로 업데이트 허용)
      propertyMap.put(key, value);
      testCase.setProperties(objectMapper.writeValueAsString(propertyMap));

    } catch (IOException e) {
      logger.error("Error updating testcase properties from metadata", e);
    }
  }

  /** 전체 통계 계산 */
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

  /** 기본 실행 이름 생성 */
  private String generateDefaultExecutionName(String fileName) {
    if (fileName == null) return "JUnit Test Execution";

    // 확장자 제거
    String baseName = fileName;
    int lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex > 0) {
      baseName = fileName.substring(0, lastDotIndex);
    }

    return "Test Execution - " + baseName;
  }

  /** XML 속성 값 안전하게 가져오기 */
  private String getAttribute(Element element, String attributeName) {
    return element.hasAttribute(attributeName) ? element.getAttribute(attributeName) : null;
  }

  private String getAttribute(Element element, String attributeName, String defaultValue) {
    String value = getAttribute(element, attributeName);
    return value != null ? value : defaultValue;
  }

  private int getIntAttribute(Element element, String attributeName, int defaultValue) {
    String value = getAttribute(element, attributeName);
    if (value == null || value.trim().isEmpty()) return defaultValue;
    try {
      return Integer.parseInt(value.trim());
    } catch (NumberFormatException e) {
      logger.warn("Invalid integer attribute '{}': {}", attributeName, value);
      return defaultValue;
    }
  }

  private double getDoubleAttribute(Element element, String attributeName, double defaultValue) {
    String value = getAttribute(element, attributeName);
    if (value == null || value.trim().isEmpty()) return defaultValue;
    try {
      return Double.parseDouble(value.trim());
    } catch (NumberFormatException e) {
      logger.warn("Invalid double attribute '{}': {}", attributeName, value);
      return defaultValue;
    }
  }

  /** 자식 요소의 텍스트 내용 가져오기 */
  private String getChildElementText(Element parentElement, String childTagName) {
    NodeList childNodes = parentElement.getElementsByTagName(childTagName);
    if (childNodes.getLength() > 0) {
      return childNodes.item(0).getTextContent();
    }
    return null;
  }

  /** 타임스탬프 문자열 파싱 */
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

  /** XML 파싱 예외 클래스 */
  public static class JunitXmlParsingException extends Exception {
    private static final long serialVersionUID = 1L;

    public JunitXmlParsingException(String message) {
      super(message);
    }

    public JunitXmlParsingException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}
