// src/services/automationTestService.js

/**
 * ICT-217: 자동화 테스트 결과 관리 서비스 (새로운 API 경로)
 * 기존 junitResultService와 동일한 기능을 새로운 API 경로로 제공
 */

import { getDynamicApiUrl } from '../utils/apiConstants.js';

let API_BASE_URL = null;

const getApiBaseUrl = async () => {
  if (!API_BASE_URL) {
    const baseUrl = await getDynamicApiUrl();
    API_BASE_URL = `${baseUrl}/api/automation-tests`;
  }
  return API_BASE_URL;
};

class AutomationTestService {
  constructor() {
    this.baseUrl = null;
  }

  async getBaseUrl() {
    if (!this.baseUrl) {
      this.baseUrl = await getApiBaseUrl();
    }
    return this.baseUrl;
  }

  /**
   * 자동화 테스트 결과 XML 파일 업로드
   */
  async uploadTestResult(file, projectId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  /**
   * 프로젝트별 자동화 테스트 결과 목록 조회
   */
  async getTestResultsByProject(projectId, page = 0, size = 20) {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/projects/${projectId}?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch test results');
    }

    return response.json();
  }

  /**
   * 자동화 테스트 결과 상세 조회
   */
  async getTestResult(testResultId) {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/${testResultId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch test result');
    }

    return response.json();
  }

  /**
   * 자동화 테스트 결과 삭제
   */
  async deleteTestResult(testResultId) {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/${testResultId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete test result');
    }

    return response.json();
  }

  /**
   * 프로젝트별 자동화 테스트 통계 조회
   */
  async getTestStatistics(projectId, timeRange = '30d') {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/statistics?projectId=${projectId}&timeRange=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch test statistics');
    }

    return response.json();
  }

  /**
   * 프로젝트별 자동화 테스트 요약 정보 조회
   */
  async getTestSummary(projectId) {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/projects/${projectId}/summary`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch test summary');
    }

    return response.json();
  }

  /**
   * 배치 프로젝트 자동화 테스트 요약 조회
   */
  async getBatchProjectTestSummary(projectIds) {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/batch-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ projectIds })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch batch test summary');
    }

    return response.json();
  }

  // 호환성을 위한 기존 메서드명 유지 (deprecated)
  async uploadJunitXml(file, projectId) {
    console.warn('uploadJunitXml is deprecated. Use uploadTestResult instead.');
    return this.uploadTestResult(file, projectId);
  }

  async getJunitResultsByProject(projectId, page, size) {
    console.warn('getJunitResultsByProject is deprecated. Use getTestResultsByProject instead.');
    return this.getTestResultsByProject(projectId, page, size);
  }

  async getJunitStatistics(projectId, timeRange) {
    console.warn('getJunitStatistics is deprecated. Use getTestStatistics instead.');
    return this.getTestStatistics(projectId, timeRange);
  }

  async getBatchProjectJunitSummary(projectIds) {
    console.warn('getBatchProjectJunitSummary is deprecated. Use getBatchProjectTestSummary instead.');
    return this.getBatchProjectTestSummary(projectIds);
  }

  // 기존 junitResultService와의 호환성을 위한 헬퍼 메서드들
  getTestStatusInfo(status) {
    const statusMap = {
      'PROCESSING': { label: '처리중', color: 'warning', icon: 'schedule' },
      'COMPLETED': { label: '완료', color: 'success', icon: 'check_circle' },
      'FAILED': { label: '실패', color: 'error', icon: 'error' },
      'PARSING_ERROR': { label: '파싱 오류', color: 'error', icon: 'error' }
    };
    return statusMap[status] || { label: '알 수 없음', color: 'default', icon: 'help' };
  }

  getSuccessRateColor(successRate) {
    if (successRate >= 90) return 'success';
    if (successRate >= 70) return 'warning';
    return 'error';
  }
}

const automationTestService = new AutomationTestService();
export default automationTestService;