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
      // 단일 객체인 경우
      else if (isValidTestCase(parsed)) {
        testCases.push(parsed);
      }
    } catch (error) {
      console.warn('JSON 파싱 실패:', error);
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
  // 마크다운 테이블 형식 감지 및 파싱은 복잡하므로
  // 현재는 구조화된 데이터 형식(JSON)을 권장
  return [];
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
          action: stepMatch[2].trim(),
          expected: stepMatch[3].trim(),
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

  // 3. 마크다운 테이블 파싱 시도 (향후 확장 가능)
  // const tableTestCases = parseTestCasesFromMarkdownTable(content);
  // testCases.push(...tableTestCases);

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
테스트케이스를 생성해주세요. 다음 JSON 형식을 사용해주세요:

\`\`\`json
{
  "name": "테스트케이스 이름",
  "description": "테스트케이스 설명",
  "priority": "HIGH|MEDIUM|LOW",
  "tags": ["태그1", "태그2"],
  "preCondition": "전제조건",
  "steps": [
    {
      "stepNumber": 1,
      "action": "수행할 동작",
      "expected": "예상 결과"
    }
  ],
  "expectedResults": "전체 예상 결과"
}
\`\`\`

또는 여러 개를 배열로:

\`\`\`json
[
  { "name": "테스트케이스 1", ... },
  { "name": "테스트케이스 2", ... }
]
\`\`\`
`;

export default {
  extractTestCasesFromAIResponse,
  TEST_CASE_GENERATION_PROMPT_EXAMPLE,
};
