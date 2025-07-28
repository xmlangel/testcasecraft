// src/services/testExecutionService.js
/**
 * 테스트 실행 관련 API 서비스
 */

import apiService from './apiService.js';

class TestExecutionService {
  /**
   * 프로젝트의 테스트 실행 목록 조회
   */
  async getTestExecutionsByProject(projectId) {
    const response = await apiService.get(`/api/test-executions/by-project/${projectId}`);
    return response.json();
  }

  /**
   * 테스트 케이스별 실행 이력 조회
   */
  async getTestExecutionsByTestCase(testCaseId) {
    const response = await apiService.get(`/api/test-executions/by-testcase/${testCaseId}`);
    return response.json();
  }

  /**
   * 특정 테스트 실행 조회
   */
  async getTestExecution(executionId) {
    const response = await apiService.get(`/api/test-executions/${executionId}`);
    return response.json();
  }

  /**
   * 테스트 실행 생성
   */
  async createTestExecution(executionData) {
    const response = await apiService.post('/api/test-executions', executionData);
    return response.json();
  }

  /**
   * 테스트 실행 수정
   */
  async updateTestExecution(executionId, executionData) {
    const response = await apiService.put(`/api/test-executions/${executionId}`, executionData);
    return response.json();
  }

  /**
   * 테스트 실행 삭제
   */
  async deleteTestExecution(executionId) {
    const response = await apiService.delete(`/api/test-executions/${executionId}`);
    return response.ok;
  }

  /**
   * 테스트 실행 시작
   */
  async startTestExecution(executionId) {
    const response = await apiService.post(`/api/test-executions/${executionId}/start`);
    return response.json();
  }

  /**
   * 테스트 실행 완료
   */
  async completeTestExecution(executionId) {
    const response = await apiService.post(`/api/test-executions/${executionId}/complete`);
    return response.json();
  }

  /**
   * 테스트 결과 업데이트
   */
  async updateTestResult(executionId, testCaseId, result, notes) {
    const response = await apiService.patch(`/api/test-executions/${executionId}/result`, {
      testCaseId,
      result,
      notes
    });
    return response.json();
  }
}

export default new TestExecutionService();