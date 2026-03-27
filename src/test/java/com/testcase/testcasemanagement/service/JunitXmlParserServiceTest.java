// src/test/java/com/testcase/testcasemanagement/service/JunitXmlParserServiceTest.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.*;
import java.io.InputStream;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** ICT-203: JUnit XML 파서 서비스 테스트 */
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
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "sample-junit.xml", "test-project", testUser);

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

    // 성공률 검증 (성공수 = 전체 - 실패 - 에러 - 스킵)
    Double expectedSuccessRate = (6.0 - 2 - 1 - 1) / 6.0 * 100; // 33.33%
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
    JunitTestCase failureCase =
        firstSuite.getTestCases().stream()
            .filter(tc -> tc.getName().equals("testMultiply"))
            .findFirst()
            .orElse(null);

    Assert.assertNotNull(failureCase);
    Assert.assertEquals(failureCase.getStatus(), JunitTestStatus.FAILED);
    Assert.assertEquals(failureCase.getFailureMessage(), "Expected 6 but was 5");
    Assert.assertEquals(failureCase.getFailureType(), "AssertionError");
    Assert.assertNotNull(failureCase.getStackTrace());

    // 에러 케이스 찾기
    JunitTestCase errorCase =
        firstSuite.getTestCases().stream()
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
    String emptyXml =
        "<?xml version=\"1.0\"?><testsuites tests=\"0\" failures=\"0\" errors=\"0\"></testsuites>";
    InputStream xmlStream = new java.io.ByteArrayInputStream(emptyXml.getBytes());

    // When
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "empty.xml", "test-project", testUser);

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
    String simpleXml =
        "<?xml version=\"1.0\"?><testsuite name=\"SimpleTest\" tests=\"1\" failures=\"0\""
            + " errors=\"0\"><testcase name=\"test1\" classname=\"Test\""
            + " time=\"0.1\"/></testsuite>";
    InputStream xmlStream = new java.io.ByteArrayInputStream(simpleXml.getBytes());

    // When
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "my-test-file.xml", "test-project", testUser);

    // Then
    Assert.assertNotNull(result.getTestExecutionName());
    Assert.assertTrue(
        result.getTestExecutionName().contains("my-test-file")
            || result.getTestExecutionName().contains("SimpleTest"));
  }

  @Test
  public void testParseStructuredJunitXml() throws Exception {
    // Given
    String structuredXml =
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<testsuites>\n"
            + "  <testsuite name=\"PostgreSQL Regression Tests\" tests=\"2\" failures=\"1\""
            + " errors=\"0\" skipped=\"0\">\n"
            + "    <testcase name=\"plisql\" classname=\"parallel group (2 tests)\""
            + " time=\"0.12\">\n"
            + "      <failure message=\"Test failed\" type=\"Failure\">\n"
            + "[FAIL] plisql\n"
            + "        <steps>\n"
            + "          <step index=\"1\">\n"
            + "            <sql>SELECT * FROM score;</sql>\n"
            + "            <expected>\n"
            + " stu_id | chinese_s | math_s |   test_d   \n"
            + "--------+-----------+--------+------------\n"
            + "      1 |        85 |     75 | 05-23-2020\n"
            + "            </expected>\n"
            + "            <actual>\n"
            + " stu_id | chinese_s | math_s |          test_d          \n"
            + "--------+-----------+--------+--------------------------\n"
            + "      1 |        85 |     75 | Sat May 23 00:00:00 2020\n"
            + "            </actual>\n"
            + "          </step>\n"
            + "        </steps>\n"
            + "        <expected>\n"
            + " stu_id | chinese_s | math_s |   test_d   \n"
            + "--------+-----------+--------+------------\n"
            + "      1 |        85 |     75 | 05-23-2020\n"
            + "        </expected>\n"
            + "        <actual>\n"
            + " stu_id | chinese_s | math_s |          test_d          \n"
            + "--------+-----------+--------+--------------------------\n"
            + "      1 |        85 |     75 | Sat May 23 00:00:00 2020\n"
            + "        </actual>\n"
            + "      </failure>\n"
            + "    </testcase>\n"
            + "  </testsuite>\n"
            + "</testsuites>";

    InputStream xmlStream = new java.io.ByteArrayInputStream(structuredXml.getBytes());

    // When
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "structured.xml", "test-project", testUser);

    // Then
    Assert.assertNotNull(result);
    JunitTestCase testCase = result.getTestSuites().get(0).getTestCases().get(0);

    Assert.assertEquals(testCase.getName(), "plisql");
    Assert.assertEquals(testCase.getStatus(), JunitTestStatus.FAILED);

    // 상위 기대/실제 결과 검증
    Assert.assertNotNull(testCase.getExpectedResult());
    Assert.assertTrue(testCase.getExpectedResult().contains("05-23-2020"));
    Assert.assertNotNull(testCase.getActualResult());
    Assert.assertTrue(testCase.getActualResult().contains("Sat May 23 00:00:00 2020"));

    // 상세 단계 검증
    Assert.assertNotNull(testCase.getTestSteps());
    Assert.assertTrue(testCase.getTestSteps().contains("SELECT * FROM score;"));
    Assert.assertTrue(testCase.getTestSteps().contains("\"index\":\"1\""));
  }

  @Test
  public void testParseStepAttributeJunitXml() throws Exception {
    // Given: 'Step' 속성이 파이프(|)로 구분된 XML
    String stepXml =
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<testsuite name=\"StepTest\" tests=\"1\" failures=\"0\" errors=\"0\">\n"
            + "  <testcase name=\"test_step\" classname=\"StepClass\" time=\"0.1\">\n"
            + "    <properties>\n"
            + "      <property name=\"Step\" value=\"1. Step One | 2. Step Two | 3. Step Three\""
            + " />\n"
            + "    </properties>\n"
            + "  </testcase>\n"
            + "</testsuite>";

    InputStream xmlStream = new java.io.ByteArrayInputStream(stepXml.getBytes());

    // When
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "step.xml", "test-project", testUser);

    // Then
    Assert.assertNotNull(result);
    JunitTestCase testCase = result.getTestSuites().get(0).getTestCases().get(0);

    // testSteps JSON 검증
    Assert.assertNotNull(testCase.getTestSteps());
    Assert.assertTrue(testCase.getTestSteps().contains("Step One"));
    Assert.assertTrue(testCase.getTestSteps().contains("Step Two"));
    Assert.assertTrue(testCase.getTestSteps().contains("Step Three"));
    Assert.assertTrue(testCase.getTestSteps().contains("\"index\":\"1\""));
    Assert.assertTrue(testCase.getTestSteps().contains("\"index\":\"3\""));
  }

  @Test
  public void testParseRobustJunitXml() throws Exception {
    // Given: 태그 방식 속성, 직접 나열된 step, Description 속성이 있는 XML
    String robustXml =
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<testsuite name=\"RobustTest\" tests=\"1\" failures=\"1\" errors=\"0\">\n"
            + "  <testcase name=\"test_001\" classname=\"RobustClass\" time=\"0.5\">\n"
            + "    <properties>\n"
            + "      <description>사용자 정의 테스트 제목</description>\n"
            + "      <property name=\"CustomProp\" value=\"Value1\" />\n"
            + "      <tag>TagValue</tag>\n"
            + "    </properties>\n"
            + "    <failure message=\"Assertion failed\">\n"
            + "      <expected>Expected String</expected>\n"
            + "      <actual>Actual String</actual>\n"
            + "      <step index=\"1\">Step 1 description</step>\n"
            + "      <step index=\"2\">\n"
            + "        <sql>SELECT 1</sql>\n"
            + "        <expected>1</expected>\n"
            + "      </step>\n"
            + "    </failure>\n"
            + "  </testcase>\n"
            + "</testsuite>";

    InputStream xmlStream = new java.io.ByteArrayInputStream(robustXml.getBytes());

    // When
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "robust.xml", "test-project", testUser);

    // Then
    Assert.assertNotNull(result);
    JunitTestCase testCase = result.getTestSuites().get(0).getTestCases().get(0);

    // 1. Description 태그가 userTitle로 매핑되었는지 확인
    Assert.assertEquals(testCase.getUserTitle(), "사용자 정의 테스트 제목");

    // 2. properties JSON에 모든 속성이 포함되었는지 확인
    Assert.assertNotNull(testCase.getProperties());
    Assert.assertTrue(testCase.getProperties().contains("description"));
    Assert.assertTrue(testCase.getProperties().contains("CustomProp"));
    Assert.assertTrue(testCase.getProperties().contains("tag"));

    // 3. 래퍼 태그 없는 <step>이 파싱되었는지 확인
    Assert.assertNotNull(testCase.getTestSteps());
    Assert.assertTrue(testCase.getTestSteps().contains("Step 1 description"));
    Assert.assertTrue(testCase.getTestSteps().contains("SELECT 1"));

    // 4. expected/actual 매핑 확인
    Assert.assertEquals(testCase.getExpectedResult(), "Expected String");
    Assert.assertEquals(testCase.getActualResult(), "Actual String");
  }

  @Test
  public void testParsePropertiesJunitXml() throws Exception {
    // Given
    String propertiesXml =
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<testsuite name=\"PropertyTest\" tests=\"1\" failures=\"0\" errors=\"0\">\n"
            + "  <testcase name=\"testProp\" classname=\"PropertyClass\" time=\"0.1\">\n"
            + "    <properties>\n"
            + "      <property name=\"Description\" value=\"BTC 급등 필터 계산 결과 일치 검증\" />\n"
            + "      <property name=\"Step\" value=\"1. BTC 15m 캔들 스냅샷을 고정한다 | 2. btc_up 및"
            + " block_new_entry를 계산한다\" />\n"
            + "      <property name=\"ExpectedResult\" value=\"block_new_entry가 bool이며 계산 흐름이 정상"
            + " 동작한다\" />\n"
            + "      <property name=\"ActualResult\" value=\"btc_up=0.6013, block_new_entry=True\""
            + " />\n"
            + "    </properties>\n"
            + "  </testcase>\n"
            + "</testsuite>";

    InputStream xmlStream = new java.io.ByteArrayInputStream(propertiesXml.getBytes());

    // When
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "properties.xml", "test-project", testUser);

    // Then
    Assert.assertNotNull(result);
    JunitTestCase testCase = result.getTestSuites().get(0).getTestCases().get(0);

    Assert.assertEquals(testCase.getName(), "testProp");

    // properties JSON 검증
    Assert.assertNotNull(testCase.getProperties());
    Assert.assertTrue(testCase.getProperties().contains("BTC 급등 필터"));
    Assert.assertTrue(testCase.getProperties().contains("block_new_entry"));

    // 매핑 검증
    Assert.assertEquals(testCase.getExpectedResult(), "block_new_entry가 bool이며 계산 흐름이 정상 동작한다");
    Assert.assertEquals(testCase.getActualResult(), "btc_up=0.6013, block_new_entry=True");
  }

  @Test
  public void testParseMetadataFromSystemOut() throws Exception {
    // Given: system-out에 [METADATA:...] 형식이 포함된 XML
    String metadataXml =
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<testsuite name=\"MetadataTest\" tests=\"1\" failures=\"1\">\n"
            + "  <testcase name=\"initialize returns true when drive helper initializes"
            + " successfully\" classname=\"uk.xmlangel.googledrivesync.sync.SyncManagerTest\""
            + " time=\"4.1\">\n"
            + "    <system-out>\n"
            + "[METADATA:initialize returns true when drive helper initializes"
            + " successfully:description=서비스 초기화 검증]\n"
            + "[METADATA:initialize returns true when drive helper initializes successfully:step=1."
            + " DriveServiceHelper 목킹 | 2. initialize() 호출 | 3. 반환값 확인]\n"
            + "[METADATA:initialize returns true when drive helper initializes"
            + " successfully:expected_result=DriveServiceHelper가 성공하면 true를 반환한다]\n"
            + "[METADATA:initialize returns true when drive helper initializes"
            + " successfully:actual_result=FAIL: FORCED FAILURE FOR VERIFICATION]\n"
            + "    </system-out>\n"
            + "  </testcase>\n"
            + "</testsuite>";

    InputStream xmlStream = new java.io.ByteArrayInputStream(metadataXml.getBytes());

    // When
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "metadata.xml", "test-project", testUser);

    // Then
    Assert.assertNotNull(result);
    JunitTestCase testCase = result.getTestSuites().get(0).getTestCases().get(0);

    // 1. 이름 기반 매핑 검증
    Assert.assertEquals(testCase.getUserTitle(), "서비스 초기화 검증");
    Assert.assertEquals(testCase.getExpectedResult(), "DriveServiceHelper가 성공하면 true를 반환한다");
    Assert.assertEquals(testCase.getActualResult(), "FAIL: FORCED FAILURE FOR VERIFICATION");

    // 2. 단계별 데이터 검증
    Assert.assertNotNull(testCase.getTestSteps());
    Assert.assertTrue(testCase.getTestSteps().contains("DriveServiceHelper 목킹"));
    Assert.assertTrue(testCase.getTestSteps().contains("\"index\":\"1\""));
    Assert.assertTrue(testCase.getTestSteps().contains("\"index\":\"3\""));

    // 3. properties JSON 검증
    Assert.assertNotNull(testCase.getProperties());
    Assert.assertTrue(testCase.getProperties().contains("\"description\":\"서비스 초기화 검증\""));
  }

  @Test
  public void testParseSuccessStepsJunitXml() throws Exception {
    // Given: 성공한 테스트이지만 expected, actual, step 태그가 포함된 XML
    String successXml =
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<testsuite name=\"SuccessStepTest\" tests=\"1\" failures=\"0\">\n"
            + "  <testcase name=\"test_success_with_steps\" classname=\"SuccessClass\""
            + " time=\"0.2\">\n"
            + "    <expected>Standard Expected Result</expected>\n"
            + "    <actual>Standard Actual Result</actual>\n"
            + "    <steps>\n"
            + "      <step index=\"1\">\n"
            + "        <sql>SELECT 'SUCCESS'</sql>\n"
            + "        <expected>SUCCESS</expected>\n"
            + "        <actual>SUCCESS</actual>\n"
            + "      </step>\n"
            + "    </steps>\n"
            + "  </testcase>\n"
            + "</testsuite>";

    InputStream xmlStream = new java.io.ByteArrayInputStream(successXml.getBytes());

    // When
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "success_steps.xml", "test-project", testUser);

    // Then
    Assert.assertNotNull(result);
    JunitTestCase testCase = result.getTestSuites().get(0).getTestCases().get(0);

    // 1. 상태 확인 (PASSED)
    Assert.assertEquals(testCase.getStatus(), JunitTestStatus.PASSED);

    // 2. 상위 수준 기대/실제 결과 추출 확인
    Assert.assertEquals(testCase.getExpectedResult(), "Standard Expected Result");
    Assert.assertEquals(testCase.getActualResult(), "Standard Actual Result");

    // 3. 상세 단계 추출 확인
    Assert.assertNotNull(testCase.getTestSteps());
    Assert.assertTrue(testCase.getTestSteps().contains("SELECT 'SUCCESS'"));
    Assert.assertTrue(testCase.getTestSteps().contains("\"expected\":\"SUCCESS\""));
    Assert.assertTrue(testCase.getTestSteps().contains("\"actual\":\"SUCCESS\""));
    Assert.assertTrue(testCase.getTestSteps().contains("\"index\":\"1\""));
  }

  @Test
  public void testParseLegacyStepsFormat() throws Exception {
    // Given: system-err에 [STEPS] 레거시 형식이 포함된 XML
    String legacyXml =
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<testsuite name=\"LegacyStepTest\" tests=\"1\" failures=\"0\">\n"
            + "  <testcase name=\"test_setup\" classname=\"Default Group\" time=\"0.1\">\n"
            + "    <system-err>\n"
            + "[STEPS]\n"
            + "STEP 1:\n"
            + "SELECT * FROM users;\n"
            + "EXPECTED:\n"
            + "Rows returned\n"
            + "ACTUAL:\n"
            + "Rows returned\n"
            + "----------------------------------------\n"
            + "STEP 2:\n"
            + "DROP TABLE temp;\n"
            + "EXPECTED:\n"
            + "Table dropped\n"
            + "ACTUAL:\n"
            + "Table dropped\n"
            + "    </system-err>\n"
            + "  </testcase>\n"
            + "</testsuite>";

    InputStream xmlStream = new java.io.ByteArrayInputStream(legacyXml.getBytes());

    // When
    JunitTestResult result =
        parserService.parseJunitXml(xmlStream, "legacy_steps.xml", "test-project", testUser);

    // Then
    Assert.assertNotNull(result);
    JunitTestCase testCase = result.getTestSuites().get(0).getTestCases().get(0);

    // 상세 단계 추출 확인
    Assert.assertNotNull(testCase.getTestSteps());

    // 상세 내용 검증
    Assert.assertTrue(testCase.getTestSteps().contains("SELECT * FROM users;"));
    Assert.assertTrue(testCase.getTestSteps().contains("\"expected\":\"Rows returned\""));
    Assert.assertTrue(testCase.getTestSteps().contains("\"actual\":\"Rows returned\""));
    Assert.assertTrue(testCase.getTestSteps().contains("\"index\":\"1\""));

    Assert.assertTrue(testCase.getTestSteps().contains("DROP TABLE temp;"));
    Assert.assertTrue(testCase.getTestSteps().contains("\"expected\":\"Table dropped\""));
    Assert.assertTrue(testCase.getTestSteps().contains("\"index\":\"2\""));
  }
}
