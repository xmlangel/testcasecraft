// src/services/testPlanService.js
/**
 * 테스트 플랜 관련 API 서비스
 */

import apiService from './apiService.js';

class TestPlanService {
  /**
   * 프로젝트의 테스트 플랜 목록 조회
   */
  async getTestPlansByProject(projectId) {
    const response = await apiService.get(`/api/test-plans/project/${projectId}`);
    return response.json();
  }

  /**
   * 특정 테스트 플랜 조회
   */
  async getTestPlan(testPlanId) {
    const response = await apiService.get(`/api/test-plans/${testPlanId}`);
    return response.json();
  }

  /**
   * 테스트 플랜 생성
   */
  async createTestPlan(testPlanData) {
    const response = await apiService.post('/api/test-plans', testPlanData);
    return response.json();
  }

  /**
   * 테스트 플랜 수정
   */
  async updateTestPlan(testPlanId, testPlanData) {
    const response = await apiService.put(`/api/test-plans/${testPlanId}`, testPlanData);
    return response.json();
  }

  /**
   * 테스트 플랜 삭제
   */
  async deleteTestPlan(testPlanId) {
    const response = await apiService.delete(`/api/test-plans/${testPlanId}`);
    return response.ok;
  }
}

export default new TestPlanService();