// src/utils/testCaseParser.js
/**
 * AI 응답에서 테스트케이스 데이터를 파싱하는 유틸리티 함수
 */

/**
 * JSON 코드 블록에서 테스트케이스 추출
 * @param {string} content - AI 응답 내용
 * @returns {Array<Object>} - 파싱된 테스트케이스 배열
 */
function parseTestCasesFromJSON(content) {
  const testCases = [];

  // JSON 코드 블록 찾기 (```json ... ``` 또는 ```testcase ... ```)
  const jsonBlockRegex = /```(?:json|testcase)\s*\n([\s\S]*?)\n```/gi;
  let match;

  while ((match = jsonBlockRegex.exec(content)) !== null) {
    try {
      const jsonContent = match[1].trim();
      const parsed = JSON.parse(jsonContent);

      // 배열인 경우
      if (Array.isArray(parsed)) {
        testCases.push(...parsed.filter(tc => isValidTestCase(tc)));
      }
      // testCases 래퍼 객체인 경우 (예: {testCases: [...]})
      else if (parsed && typeof parsed === 'object') {
        // testCases, test_cases, testcase, test-cases 등 다양한 키 지원
        const tcArray = parsed.testCases || parsed.test_cases || parsed.testcase || parsed['test-cases'] || parsed.cases;

        if (Array.isArray(tcArray)) {
          testCases.push(...tcArray.filter(tc => isValidTestCase(tc)));
        }
        // 단일 객체인 경우
        else if (isValidTestCase(parsed)) {
          testCases.push(parsed);
        }
      }
    } catch (error) {
      console.warn('[parseJSON] JSON 파싱 실패:', error);
    }
  }

  return testCases;
}

/**
 * 테스트케이스 객체 유효성 검사
 * @param {Object} tc - 테스트케이스 객체
 * @returns {boolean}
 */
function isValidTestCase(tc) {
  return tc && typeof tc === 'object' && tc.name && typeof tc.name === 'string';
}

/**
 * 마크다운 테이블에서 테스트케이스 추출
 * @param {string} content - AI 응답 내용
 * @returns {Array<Object>} - 파싱된 테스트케이스 배열
 */
function parseTestCasesFromMarkdownTable(content) {
  const testCases = [];

  // 마크다운 테이블 감지 (| 필드 | 내용 | 형태)
  // 테이블 헤더와 본문을 찾기
  const tableRegex = /\|[^\n]+\|\s*\n\s*\|[-:\s|]+\|\s*\n((?:\|[^\n]+\|\s*\n?)+)/g;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    try {
      const tableBody = match[1];
      const testCase = parseTableToTestCase(tableBody);

      if (isValidTestCase(testCase)) {
        testCases.push(testCase);
      }
    } catch (error) {
      console.warn('[parseMarkdownTable] 테이블 파싱 실패:', error);
    }
  }

  return testCases;
}

/**
 * 테이블 본문을 테스트케이스 객체로 변환
 * @param {string} tableBody - 테이블 본문
 * @returns {Object} - 테스트케이스 객체
 */
function parseTableToTestCase(tableBody) {
  const testCase = {};
  const rows = tableBody.trim().split('\n');
  let testStepsContent = '';
  let expectedResultsContent = '';
  const steps = [];

  for (const row of rows) {
    // | 필드 | 내용 | 형태에서 필드와 내용 추출
    const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);

    if (cells.length < 2) continue;

    const fieldName = cells[0].replace(/\*\*/g, '').trim(); // ** 제거
    const fieldValue = cells[1].trim();

    // 필드명을 소문자로 변환하여 매핑
    const normalizedField = fieldName.toLowerCase()
      .replace(/[‑-]/g, '') // 하이픈 제거
      .replace(/\s+/g, ''); // 공백 제거

    // Step 행 감지 (Step 1, Step 2, 스텝 1 등)
    const stepMatch = fieldName.match(/(?:step|스텝)\s*(\d+)/i);
    if (stepMatch) {
      const stepNumber = parseInt(stepMatch[1]);

      // 설명과 예상 결과 추출
      let stepDescription = '';
      let stepExpectedResult = '';

      // "**설명**: 내용 <br>**예상 결과**: 내용" 형식 파싱
      const descMatch = fieldValue.match(/\*\*설명\*\*[：:]\s*(.+?)(?:\s*<br\s*\/?>|\s*\*\*예상)/i);
      const expectedMatch = fieldValue.match(/\*\*예상\s*결과\*\*[：:]\s*(.+)/i);

      if (descMatch) {
        stepDescription = descMatch[1].trim();
      } else if (fieldValue.includes('설명:') || fieldValue.includes('설명：')) {
        const parts = fieldValue.split(/예상\s*결과/i);
        stepDescription = parts[0].replace(/.*설명[：:]/i, '').trim();
      } else {
        stepDescription = fieldValue;
      }

      if (expectedMatch) {
        stepExpectedResult = expectedMatch[1].trim();
      } else if (fieldValue.includes('예상 결과:') || fieldValue.includes('예상 결과：')) {
        stepExpectedResult = fieldValue.split(/예상\s*결과[：:]/i)[1]?.trim() || '';
      }

      steps.push({
        stepNumber: stepNumber,
        description: stepDescription,  // TestCaseForm 필드명
        expectedResult: stepExpectedResult,  // TestCaseForm 필드명
      });
      continue;
    }

    // 필드 매핑
    if (normalizedField.includes('tcid') || normalizedField.includes('testcaseid')) {
      // TC-ID는 선택사항 (무시 또는 나중에 추가 가능)
      continue;
    }
    else if (normalizedField === 'name' || normalizedField.includes('제목') || normalizedField.includes('title') || normalizedField.includes('테스트케이스제목')) {
      testCase.name = fieldValue;
    }
    else if (normalizedField === 'description' || normalizedField.includes('설명') || normalizedField.includes('테스트목적') || normalizedField.includes('목적')) {
      testCase.description = fieldValue;
    }
    else if (normalizedField.includes('우선순위') || normalizedField === 'priority') {
      // "P1 (가장 중요한..." 형태에서 P1 추출 또는 HIGH/MEDIUM/LOW 추출
      const priorityMatch = fieldValue.match(/P(\d+)|HIGH|MEDIUM|LOW|High|Medium|Low/i);
      if (priorityMatch) {
        if (priorityMatch[1]) {
          // P1 → High, P2 → Medium, P3+ → Low
          const pNum = parseInt(priorityMatch[1], 10);
          testCase.priority = pNum === 1 ? 'High' : pNum === 2 ? 'Medium' : 'Low';
        } else {
          // HIGH → High, MEDIUM → Medium, LOW → Low
          const priority = priorityMatch[0];
          testCase.priority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
        }
      } else {
        testCase.priority = fieldValue;
      }
    }
    else if (normalizedField === 'tags' || normalizedField.includes('태그')) {
      // 대괄호 안의 태그 추출: ["태그1", "태그2"]
      const tagsMatch = fieldValue.match(/\[([^\]]+)\]/);
      if (tagsMatch) {
        testCase.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
      } else {
        // 쉼표로 구분된 태그
        testCase.tags = fieldValue.split(',').map(t => t.trim()).filter(t => t);
      }
    }
    else if (normalizedField === 'precondition' || normalizedField === 'preconditions' || normalizedField.includes('전제조건') || normalizedField.includes('사전조건')) {
      // 여러 줄 처리: "1. ... <br> 2. ..." 형식
      testCase.preCondition = fieldValue.replace(/<br\s*\/?>/gi, '\n');
    }
    else if (normalizedField === 'steps' || normalizedField.includes('테스트입력') || normalizedField.includes('teststeps') || normalizedField.includes('inputdata') || normalizedField.includes('스텝')) {
      testStepsContent = fieldValue;
    }
    else if (normalizedField === 'expectedresults' || normalizedField.includes('예상결과') || normalizedField.includes('예상된결과') || normalizedField.includes('기대결과')) {
      testCase.expectedResults = fieldValue;
    }
    else if (normalizedField.includes('사후조건') || normalizedField.includes('postcondition')) {
      testCase.postCondition = fieldValue.replace(/<br\s*\/?>/gi, '\n');
    }
    else if (normalizedField.includes('자동화여부') || normalizedField.includes('isautomated') || normalizedField.includes('automationflag')) {
      const lowerValue = fieldValue.trim().toLowerCase();
      if (['y', 'yes', 'true', '1', '자동', '자동화'].some(token => lowerValue.includes(token))) {
        testCase.isAutomated = true;
      } else if (['n', 'no', 'false', '0', '수동'].some(token => lowerValue.includes(token))) {
        testCase.isAutomated = false;
      }
    }
    else if (normalizedField.includes('manualautomation') || normalizedField.includes('executiontype') || normalizedField.includes('실행유형') || normalizedField.includes('실행방식')) {
      testCase.executionType = fieldValue;
    }
    else if (normalizedField.includes('테스트기법') || normalizedField.includes('testtechnique') || normalizedField.includes('technique')) {
      testCase.testTechnique = fieldValue;
    }
  }

  // Step이 별도 행으로 파싱되었으면 사용
  if (steps.length > 0) {
    testCase.steps = steps;
  }
  // 그렇지 않고 testStepsContent가 있으면 번호 리스트로 파싱
  else if (testStepsContent) {
    const stepsList = parseNumberedList(testStepsContent);
    const expectedStepsList = expectedResultsContent ? parseNumberedList(expectedResultsContent) : [];

    testCase.steps = stepsList.map((step, index) => ({
      stepNumber: index + 1,
      description: step,  // TestCaseForm 필드명
      expectedResult: expectedStepsList[index] || '',  // TestCaseForm 필드명
    }));
  }

  if (typeof testCase.isAutomated === 'boolean') {
    if (!testCase.executionType || !testCase.executionType.trim()) {
      testCase.executionType = testCase.isAutomated ? 'Automation' : 'Manual';
    }
  }

  if (testCase.executionType && typeof testCase.executionType === 'string') {
    const normalized = testCase.executionType.trim().toLowerCase();
    if (['automation', 'auto', 'a', '자동화'].includes(normalized)) {
      testCase.executionType = 'Automation';
      if (typeof testCase.isAutomated !== 'boolean') {
        testCase.isAutomated = true;
      }
    } else if (['manual', 'm', '수동'].includes(normalized)) {
      testCase.executionType = 'Manual';
      if (typeof testCase.isAutomated !== 'boolean') {
        testCase.isAutomated = false;
      }
    } else if (['hybrid', 'mixed', '혼합', '복합'].includes(normalized)) {
      testCase.executionType = 'Hybrid';
    }
  }

  if (typeof testCase.isAutomated !== 'boolean') {
    testCase.isAutomated = false;
  }

  return testCase;
}

/**
 * 번호로 시작하는 리스트를 배열로 파싱
 * 예: "1. 첫번째<br>2. 두번째" → ["첫번째", "두번째"]
 * @param {string} content - 번호 리스트 텍스트
 * @returns {Array<string>} - 파싱된 항목 배열
 */
function parseNumberedList(content) {
  const items = [];

  // HTML <br> 태그를 개행으로 변환
  const normalized = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li)>/gi, '\n');

  // 번호로 시작하는 패턴 찾기: "1. ", "2. " 등
  const lines = normalized.split('\n');
  let currentItem = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      // 이전 항목이 있으면 저장
      if (currentItem) {
        items.push(currentItem.trim());
      }
      // 새 항목 시작
      currentItem = numberedMatch[2];
    } else {
      // 번호 없이 이어지는 내용은 현재 항목에 추가
      currentItem += ' ' + trimmed;
    }
  }

  // 마지막 항목 저장
  if (currentItem) {
    items.push(currentItem.trim());
  }

  return items;
}

/**
 * TESTCASE 마커를 사용한 구조화된 형식에서 파싱
 * 예시:
 * === TESTCASE START ===
 * name: 로그인 테스트
 * description: 사용자 로그인 기능 테스트
 * ...
 * === TESTCASE END ===
 */
function parseTestCasesFromMarkers(content) {
  const testCases = [];
  const markerRegex = /===\s*TESTCASE\s+START\s*===([\s\S]*?)===\s*TESTCASE\s+END\s*===/gi;
  let match;

  while ((match = markerRegex.exec(content)) !== null) {
    try {
      const tcContent = match[1].trim();
      const testCase = parseStructuredTestCase(tcContent);

      if (isValidTestCase(testCase)) {
        testCases.push(testCase);
      }
    } catch (error) {
      console.warn('마커 형식 파싱 실패:', error);
    }
  }

  return testCases;
}

/**
 * 구조화된 텍스트에서 테스트케이스 파싱
 */
function parseStructuredTestCase(content) {
  const testCase = {};
  const lines = content.split('\n');
  let currentSection = null;
  let stepsData = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    // 스텝 섹션 시작
    if (trimmedLine.toLowerCase().includes('steps:') || trimmedLine.toLowerCase().includes('테스트 스텝:')) {
      currentSection = 'steps';
      continue;
    }

    // 스텝 데이터 (번호. 동작 | 예상결과 형식)
    if (currentSection === 'steps') {
      const stepMatch = trimmedLine.match(/^(\d+)\.\s*(.+?)\s*\|\s*(.+)$/);
      if (stepMatch) {
        stepsData.push({
          stepNumber: parseInt(stepMatch[1], 10),
          description: stepMatch[2].trim(),  // TestCaseForm 필드명
          expectedResult: stepMatch[3].trim(),  // TestCaseForm 필드명
        });
        continue;
      }
    }

    // 키:값 형식 파싱
    const kvMatch = trimmedLine.match(/^([^:]+):\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim().toLowerCase();
      const value = kvMatch[2].trim();

      switch (key) {
        case 'name':
        case '이름':
        case 'testcase name':
          testCase.name = value;
          break;
        case 'description':
        case '설명':
          testCase.description = value;
          break;
        case 'priority':
        case '우선순위':
          testCase.priority = value.toUpperCase();
          break;
        case 'tags':
        case '태그':
          testCase.tags = value.split(',').map(t => t.trim());
          break;
        case 'precondition':
        case 'preconditions':
        case '전제조건':
          testCase.preCondition = value;
          break;
        case 'expectedresults':
        case 'expected results':
        case '예상 결과':
          testCase.expectedResults = value;
          break;
      }
    }
  }

  if (stepsData.length > 0) {
    testCase.steps = stepsData;
  }

  return testCase;
}

/**
 * AI 응답에서 테스트케이스 추출 (메인 함수)
 * @param {string} content - AI 응답 내용
 * @returns {Array<Object>} - 파싱된 테스트케이스 배열
 */
export function extractTestCasesFromAIResponse(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  let testCases = [];

  // 1. JSON 형식 파싱 시도
  const jsonTestCases = parseTestCasesFromJSON(content);
  testCases.push(...jsonTestCases);

  // 2. 마커 형식 파싱 시도
  const markerTestCases = parseTestCasesFromMarkers(content);
  testCases.push(...markerTestCases);

  // 3. 마크다운 테이블 파싱 시도
  const tableTestCases = parseTestCasesFromMarkdownTable(content);
  testCases.push(...tableTestCases);

  // 중복 제거 (name 기준)
  const uniqueTestCases = [];
  const seenNames = new Set();

  for (const tc of testCases) {
    if (!seenNames.has(tc.name)) {
      seenNames.add(tc.name);
      uniqueTestCases.push(tc);
    }
  }

  return uniqueTestCases;
}

/**
 * AI에게 테스트케이스 생성을 요청하는 프롬프트 예시
 */
export const TEST_CASE_GENERATION_PROMPT_EXAMPLE = `
테스트케이스를 생성해주세요. 다음 형식 중 하나를 사용해주세요:

**1. JSON 형식** (권장):
\`\`\`json
{
  "name": "테스트케이스 이름",
  "description": "테스트케이스 설명",
  "priority": "High|Medium|Low",
  "tags": ["태그1", "태그2"],
  "preCondition": "전제조건",
  "steps": [
    {
      "stepNumber": 1,
      "description": "수행할 동작",
      "expectedResult": "예상 결과"
    }
  ],
  "expectedResults": "전체 예상 결과"
}
\`\`\`

**2. 마크다운 테이블 형식**:
| 필드 | 내용 |
|------|------|
| **name** | 테스트케이스 이름 |
| **description** | 테스트케이스 설명 |
| **priority** | High, Medium, Low 또는 P1, P2, P3 |
| **tags** | ["태그1", "태그2"] |
| **preCondition** | 사전 조건 설명 |
| **Step 1** | **설명**: 첫 번째 스텝 <br>**예상 결과**: 첫 번째 예상결과 |
| **Step 2** | **설명**: 두 번째 스텝 <br>**예상 결과**: 두 번째 예상결과 |
| **expectedResults** | 전체 예상 결과 |

**3. 마커 형식**:
=== TESTCASE START ===
name: 테스트케이스 이름
description: 테스트케이스 설명
priority: High
...
=== TESTCASE END ===
`;

export default {
  extractTestCasesFromAIResponse,
  TEST_CASE_GENERATION_PROMPT_EXAMPLE,
};
