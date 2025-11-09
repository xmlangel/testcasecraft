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

      console.log('[parseJSON] 파싱된 객체 타입:', Array.isArray(parsed) ? 'Array' : typeof parsed);
      console.log('[parseJSON] 파싱된 객체 키:', Object.keys(parsed || {}));

      // 배열인 경우
      if (Array.isArray(parsed)) {
        testCases.push(...parsed.filter(tc => isValidTestCase(tc)));
      }
      // testCases 래퍼 객체인 경우 (예: {testCases: [...]})
      else if (parsed && typeof parsed === 'object') {
        // testCases, test_cases, testcase, test-cases 등 다양한 키 지원
        const tcArray = parsed.testCases || parsed.test_cases || parsed.testcase || parsed['test-cases'] || parsed.cases;

        if (Array.isArray(tcArray)) {
          console.log('[parseJSON] testCases 래퍼 발견, 배열 크기:', tcArray.length);
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

  console.log('[parseJSON] 최종 파싱된 테스트케이스:', testCases.length, '개');
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

  console.log('[parseMarkdownTable] 테이블 검색 시작');
  let matchCount = 0;

  while ((match = tableRegex.exec(content)) !== null) {
    matchCount++;
    console.log('[parseMarkdownTable] 테이블 발견:', matchCount, '번째, 매칭된 내용:', match[0].substring(0, 200));
    try {
      const tableBody = match[1];
      const testCase = parseTableToTestCase(tableBody);

      console.log('[parseMarkdownTable] 파싱된 테스트케이스:', testCase);

      if (isValidTestCase(testCase)) {
        testCases.push(testCase);
        console.log('[parseMarkdownTable] 유효한 테스트케이스로 추가됨');
      } else {
        console.log('[parseMarkdownTable] 유효하지 않은 테스트케이스 (name 없음)');
      }
    } catch (error) {
      console.warn('[parseMarkdownTable] 테이블 파싱 실패:', error);
    }
  }

  console.log('[parseMarkdownTable] 총', matchCount, '개 테이블 발견,', testCases.length, '개 파싱 성공');

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

    // 필드 매핑
    if (normalizedField.includes('tcid') || normalizedField.includes('testcaseid')) {
      // TC-ID는 선택사항 (무시 또는 나중에 추가 가능)
      continue;
    }
    else if (normalizedField.includes('제목') || normalizedField.includes('title') || normalizedField.includes('테스트케이스제목')) {
      testCase.name = fieldValue;
    }
    else if (normalizedField.includes('설명') || normalizedField.includes('description') || normalizedField.includes('테스트목적') || normalizedField.includes('목적')) {
      testCase.description = fieldValue;
    }
    else if (normalizedField.includes('우선순위') || normalizedField.includes('priority')) {
      // "P1 (가장 중요한..." 형태에서 P1 추출 또는 HIGH/MEDIUM/LOW 추출
      const priorityMatch = fieldValue.match(/P(\d+)|HIGH|MEDIUM|LOW/i);
      if (priorityMatch) {
        if (priorityMatch[1]) {
          // P1 → HIGH, P2 → MEDIUM, P3+ → LOW
          const pNum = parseInt(priorityMatch[1], 10);
          testCase.priority = pNum === 1 ? 'HIGH' : pNum === 2 ? 'MEDIUM' : 'LOW';
        } else {
          testCase.priority = priorityMatch[0].toUpperCase();
        }
      }
    }
    else if (normalizedField.includes('태그') || normalizedField.includes('tags')) {
      // 대괄호 안의 태그 추출: ["태그1", "태그2"]
      const tagsMatch = fieldValue.match(/\[([^\]]+)\]/);
      if (tagsMatch) {
        testCase.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
      }
    }
    else if (normalizedField.includes('전제조건') || normalizedField.includes('precondition') || normalizedField.includes('사전조건')) {
      testCase.preCondition = fieldValue;
    }
    else if (normalizedField.includes('테스트입력') || normalizedField.includes('teststeps') || normalizedField.includes('inputdata') || normalizedField.includes('스텝')) {
      testStepsContent = fieldValue;
    }
    else if (normalizedField.includes('예상결과') || normalizedField.includes('expectedresult') || normalizedField.includes('예상된결과')) {
      expectedResultsContent = fieldValue;
    }
    else if (normalizedField.includes('사후조건') || normalizedField.includes('postcondition')) {
      // 사후 조건은 전체 예상 결과에 추가 (선택사항)
      if (!testCase.expectedResults) {
        testCase.expectedResults = fieldValue;
      }
    }
  }

  // 테스트 스텝 파싱 (번호로 시작하는 항목들)
  if (testStepsContent) {
    const steps = parseNumberedList(testStepsContent);
    const expectedSteps = expectedResultsContent ? parseNumberedList(expectedResultsContent) : [];

    testCase.steps = steps.map((step, index) => ({
      stepNumber: index + 1,
      action: step,
      expected: expectedSteps[index] || '',
    }));
  }

  // 전체 예상 결과가 없으면 예상 결과 내용 전체를 사용
  if (!testCase.expectedResults && expectedResultsContent) {
    testCase.expectedResults = expectedResultsContent;
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
    console.log('[testCaseParser] content가 없거나 문자열이 아님');
    return [];
  }

  console.log('[testCaseParser] 파싱 시작, content 길이:', content.length);
  console.log('[testCaseParser] AI 응답 내용 (처음 1000자):', content.substring(0, 1000));
  let testCases = [];

  // 1. JSON 형식 파싱 시도
  const jsonTestCases = parseTestCasesFromJSON(content);
  console.log('[testCaseParser] JSON 파싱 결과:', jsonTestCases.length, '개');
  testCases.push(...jsonTestCases);

  // 2. 마커 형식 파싱 시도
  const markerTestCases = parseTestCasesFromMarkers(content);
  console.log('[testCaseParser] 마커 파싱 결과:', markerTestCases.length, '개');
  testCases.push(...markerTestCases);

  // 3. 마크다운 테이블 파싱 시도
  const tableTestCases = parseTestCasesFromMarkdownTable(content);
  console.log('[testCaseParser] 테이블 파싱 결과:', tableTestCases.length, '개', tableTestCases);
  testCases.push(...tableTestCases);

  console.log('[testCaseParser] 총 파싱된 테스트케이스:', testCases.length, '개');

  // 중복 제거 (name 기준)
  const uniqueTestCases = [];
  const seenNames = new Set();

  for (const tc of testCases) {
    if (!seenNames.has(tc.name)) {
      seenNames.add(tc.name);
      uniqueTestCases.push(tc);
    }
  }

  console.log('[testCaseParser] 중복 제거 후 최종 결과:', uniqueTestCases.length, '개', uniqueTestCases);
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

**2. 마크다운 테이블 형식**:
| 필드 | 내용 |
|------|------|
| **제목** | 테스트케이스 제목 |
| **설명** | 테스트케이스 설명 |
| **우선순위** | HIGH, MEDIUM, LOW 또는 P1, P2, P3 |
| **태그** | [태그1, 태그2] |
| **전제 조건** | 사전 조건 설명 |
| **테스트 입력** | 1. 첫 번째 스텝<br>2. 두 번째 스텝<br>3. 세 번째 스텝 |
| **예상 결과** | 1. 첫 번째 예상결과<br>2. 두 번째 예상결과<br>3. 세 번째 예상결과 |

**3. 마커 형식**:
=== TESTCASE START ===
name: 테스트케이스 이름
description: 테스트케이스 설명
priority: HIGH
...
=== TESTCASE END ===
`;

export default {
  extractTestCasesFromAIResponse,
  TEST_CASE_GENERATION_PROMPT_EXAMPLE,
};
