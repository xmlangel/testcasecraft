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
}

export default new TestCaseService();