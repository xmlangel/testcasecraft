// src/services/testCaseService.js
/**
 * 테스트 케이스 관련 API 서비스
 */

import apiService from './apiService.js';

class TestCaseService {
  /**
   * 프로젝트의 테스트 케이스 목록 조회
   */
  async getTestCasesByProject(projectId) {
    const response = await apiService.get(`/api/testcases/project/${projectId}`);
    return response.json();
  }

  /**
   * 특정 테스트 케이스 조회
   */
  async getTestCase(testCaseId) {
    const response = await apiService.get(`/api/testcases/${testCaseId}`);
    return response.json();
  }

  /**
   * 테스트 케이스 생성
   */
  async createTestCase(testCaseData) {
    const response = await apiService.post('/api/testcases', testCaseData);
    return response.json();
  }

  /**
   * 테스트 케이스 수정
   */
  async updateTestCase(testCaseId, testCaseData) {
    const response = await apiService.put(`/api/testcases/${testCaseId}`, testCaseData);
    return response.json();
  }

  /**
   * 테스트 케이스 삭제
   */
  async deleteTestCase(testCaseId) {
    const response = await apiService.delete(`/api/testcases/${testCaseId}`);
    return response.ok;
  }

  /**
   * 배치 저장 메서드
   * ICT-373: 스프레드시트 일괄 저장 배치 처리 최적화
   *
   * @param {Array} testCases - 저장할 테스트케이스 배열
   * @returns {Promise<Object>} - BatchSaveResult 객체
   */
  async batchSaveTestCases(testCases) {
    const response = await apiService.post('/api/testcases/batch', testCases);
    const result = await response.json();
    return result;
  }

  /**
   * 테스트 케이스 일괄 삭제
   * @param {Array<string>} ids - 삭제할 테스트케이스 ID 배열
   * @returns {Promise<Object>} - TestCaseBulkOperationDto 객체
   */
  async batchDeleteTestCases(ids) {
    const response = await apiService.post('/api/testcases/batch/delete', ids);
    return response.json();
  }
}

export default new TestCaseService();