// 진행률 계산 유틸 함수
// execution: { results: [{ testCaseId, result, ... }] }
// testPlan: { testCaseIds: [id1, id2, ...] }
export function calculateExecutionProgress(execution, testPlan, testCases) {
  if (!execution || !testPlan || !Array.isArray(testPlan.testCaseIds) || !Array.isArray(testCases)) return 0;

  // 테스트케이스만 필터링
  const caseIds = testPlan.testCaseIds.filter(id => {
    const tc = testCases.find(tc => tc.id === id);
    return tc && tc.type === 'testcase';
  });

  if (caseIds.length === 0) return 0;

  // 완료로 간주하는 상태: PASS, FAIL, BLOCKED
  const completed = caseIds.filter(id => {
    const resultObj = execution.results?.find(r => r.testCaseId === id);
    return resultObj && resultObj.result && resultObj.result !== 'NOTRUN';
  }).length;

  return Math.round((completed / caseIds.length) * 100);
}
