# JUnit XML 결과 보고서 가이드

이 문서는 본 시스템에서 지원하는 JUnit XML 테스트 결과 파일의 형식과 업로드 방법, 그리고 시각화 기능에 대해 설명합니다.

---

## 1. JUnit XML 개요

JUnit XML은 소프트웨어 테스트 결과를 기계가 읽을 수 있는 XML 형식으로 표현한 업계 표준 포맷입니다. 대부분의 테스트 프레임워크(JUnit, TestNG, Pytest, Playwright 등)에서 이 형식을 지원합니다.

본 시스템은 이 표준 형식을 파싱하여 대시보드 통계 및 개별 테스트 케이스의 상세 로그(TraceLog)를 생성하며, 특히 **상세 실행 단계(Steps)**를 시각화하는 강력한 기능을 제공합니다.

---

## 2. 지원하는 XML 구조

### 2.1. 표준 JUnit 형식 (General)

일반적인 테스트 성공/실패 정보를 포함하는 구조입니다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="TestSuiteName" tests="3" failures="1" errors="0" skipped="1" time="1.5">
    <testcase name="testSuccess" classname="com.example.TestClass" time="0.5" />
    <testcase name="testFailure" classname="com.example.TestClass" time="0.8">
      <failure message="Assertion failed" type="java.lang.AssertionError">
        at com.example.TestClass.testFailure(TestClass.java:25)
      </failure>
    </testcase>
  </testsuite>
</testsuites>
```

### 2.2. 상세 단계 확장 형식 (Structured Steps)

테스트를 여러 단계로 나누어 각 단계의 이름, 기대값, 실제값을 구조적으로 표현할 수 있습니다. 시스템은 개발자가 정의한 임의의 태그 이름(한글 포함)을 자동으로 인식하여 화면에 표시합니다.

```xml
<testcase name="api_validation" classname="api.test.v1" time="1.2">
  <failure message="Validation failed" type="Error">
    <steps>
      <step index="1">
        <단계명>인증 세션 초기화</단계명>
        <기대결과>세션 토큰 생성</기대결과>
        <실제결과>만료된 토큰 반환</실제결과>
        <에러코드>AUTH_401</에러코드>
      </step>
    </steps>
  </failure>
</testcase>
```

---

## 3. 화면 표시 방식

업로드된 JUnit XML 결과는 시스템에서 다음과 같이 표시됩니다.

### 3.1. 대시보드 및 리스트

- 전체 테스트 수, 성공률(%), 실패/에러/스킵 수 집계.

### 3.2. 상세 내역 (TestCaseDetailPanel)

- **TraceLog 및 Test Body 탭**:
  - 상세 단계 정보(`steps`)가 있는 경우, **최상단**에 "Detailed Test steps" 섹션이 나타납니다.
  - XML에 정의된 태그 이름(예: `<단계명>`, `<상태>`)이 레이블로 변환되어 가독성 있게 표시됩니다.
  - 데이터는 자동으로 격자 형태로 배치되며, 화면 크기에 맞게 조절됩니다.

### 3.3. 전체 화면 보기

- 우측 상단의 **전체 화면 버튼**을 눌러 복잡한 단계 내역과 로그를 큰 화면에서 분석할 수 있습니다.

---

## 4. 사용 방법 (Workflow)

1. **테스트 실행**: 테스트 수행 후 `.xml` 결과 파일을 생성합니다.
2. **파일 업로드**: 'JUnit 결과 관리' 메뉴에서 프로젝트를 선택하고 파일을 업로드합니다.
3. **결과 분석**: 실패한 테스트를 클릭하여 최상단의 상세 단계를 통해 어떤 지점에서 문제가 발생했는지 확인합니다.

---

## 5. 다국어 지원 및 샘플 파일

본 시스템은 한국어, 영어, 일본어 등 다국어 내용을 완벽하게 지원하며, 태그 이름 자체를 한국어로 구성해도 정상적으로 인식합니다.

### 샘플 파일 다운로드/참조

- [한국어 태그 및 내용 샘플](file:///Users/dicky/kmdata/git/testcase/testcasecraft-private/docs/manual/sample_api_kr.xml): `<기대결과>`, `<실제결과>` 등 한글 태그 활용 예시
- [일본어 내용 샘플](file:///Users/dicky/kmdata/git/testcase/testcasecraft-private/docs/manual/sample_ui_jp.xml): 일본어로 된 테스트 단계 및 결과 예시
- [다국어 혼합 샘플](file:///Users/dicky/kmdata/git/testcase/testcasecraft-private/docs/manual/sample_mobile_multi.xml): 한/영/일 언어가 혼합된 모바일 테스트 예시
- [워크플로우 추적 샘플](file:///Users/dicky/kmdata/git/testcase/testcasecraft-private/docs/manual/sample_workflow_kr.xml): 일반적인 업무 프로세스 단계 추적 예시
- [기본 범용 샘플](file:///Users/dicky/kmdata/git/testcase/testcasecraft-private/docs/manual/generic_sample.xml): 가장 표준적인 범용 API 테스트 예시

---

## 6. 팁 및 주의사항

- **인코딩**: XML 파일은 반드시 **UTF-8** 인코딩이어야 다국어가 올바르게 표시됩니다.
- **태그 자유도**: `<step>` 내부에는 어떠한 이름의 태그라도 넣을 수 있습니다. 시스템이 자동으로 화면에 레이블과 값을 매핑합니다.
- **필드 생략**: 모든 단계 필드는 선택 사항입니다. 정보가 있는 필드만 화면에 나타납니다.
