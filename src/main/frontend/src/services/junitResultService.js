// src/services/junitResultService.js

/**
 * ICT-200: JUnit 테스트 결과 API 서비스
 * Allure 스타일 대시보드를 위한 JUnit 결과 관리
 */

import { buildUrl, API_ENDPOINTS, getDynamicApiUrl } from '../utils/apiConstants.js';

class JunitResultService {
  constructor() {
    this.baseUrl = null;
    this.pendingRequests = new Map();
  }

  async getBaseUrl() {
    if (!this.baseUrl) {
      const apiUrl = await getDynamicApiUrl();
      this.baseUrl = `${apiUrl}/api/junit-results`;
    }
    return this.baseUrl;
  }

  /**
   * JWT 토큰이 포함된 헤더 생성
   */
  getAuthHeaders() {
    // AppContext에서 accessToken으로 저장하므로 accessToken을 먼저 확인
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * 멀티파트 폼 데이터용 헤더 (Content-Type 제외)
   */
  getMultipartHeaders() {
    // AppContext에서 accessToken으로 저장하므로 accessToken을 먼저 확인
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * JUnit XML 파일 업로드
   */
  async uploadJunitXml(file, projectId, executionName, description = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('executionName', executionName);
      if (description) {
        formData.append('description', description);
      }

      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        headers: this.getMultipartHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`업로드 실패: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('JUnit XML 업로드 오류:', error);
      throw error;
    }
  }

  /**
   * 프로젝트별 JUnit 결과 목록 조회
   */
  async getJunitResultsByProject(projectId, page = 0, size = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/projects/${projectId}?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`JUnit 결과 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('JUnit 결과 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * JUnit 결과 상세 조회 (테스트 스위트 포함)
   */
  async getJunitResultDetail(resultId) {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/${resultId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`JUnit 결과 상세 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('JUnit 결과 상세 조회 오류:', error);
      throw error;
    }
  }

  /**
   * JUnit 결과 통계 조회 (대시보드용)
   */
  async getJunitStatistics(projectId, timeRange = '7d') {
    const cacheKey = `statistics-${projectId}-${timeRange}`;

    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const request = (async () => {
      try {
        const params = new URLSearchParams();
        if (projectId) {
          params.append('projectId', projectId);
        }
        params.append('timeRange', timeRange);

        const response = await fetch(`${await this.getBaseUrl()}/statistics?${params}`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`JUnit 통계 조회 실패: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('JUnit 통계 조회 오류:', error);
        throw error;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, request);
    return request;
  }

  /**
   * 테스트 케이스별 상세 결과 조회
   */
  async getTestCaseDetails(resultId, suiteId, caseId) {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/${resultId}/suites/${suiteId}/cases/${caseId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`테스트 케이스 상세 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('테스트 케이스 상세 조회 오류:', error);
      throw error;
    }
  }

  /**
   * JUnit 결과 삭제
   */
  async deleteJunitResult(resultId) {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/${resultId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`JUnit 결과 삭제 실패: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('JUnit 결과 삭제 오류:', error);
      throw error;
    }
  }

  /**
   * 실행 중인 업로드 상태 조회
   */
  async getUploadStatus(resultId) {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/${resultId}/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`업로드 상태 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('업로드 상태 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 테스트 결과 트렌드 분석 (시간별)
   */
  async getTestResultTrend(projectId, period = '30d') {
    try {
      const params = new URLSearchParams({
        projectId,
        period,
      });

      const response = await fetch(`${await this.getBaseUrl()}/trend?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`테스트 결과 트렌드 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('테스트 결과 트렌드 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 최다 실패 테스트 조회
   */
  async getTopFailingTests(projectId, limit = 10) {
    try {
      const params = new URLSearchParams({
        projectId,
        limit: limit.toString(),
      });

      const response = await fetch(`${await this.getBaseUrl()}/top-failing?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`최다 실패 테스트 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('최다 실패 테스트 조회 오류:', error);
      throw error;
    }
  }

  /**
   * JUnit 결과 검색 및 필터링
   */
  async searchJunitResults(filters) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await fetch(`${await this.getBaseUrl()}/search?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`JUnit 결과 검색 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('JUnit 결과 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 업로드 유효성 검사
   */
  validateUploadFile(file) {
    const errors = [];

    // 파일 존재 확인
    if (!file) {
      errors.push('파일을 선택해주세요');
      return { isValid: false, errors };
    }

    // 파일 타입 확인
    if (!file.name.toLowerCase().endsWith('.xml')) {
      errors.push('XML 파일만 업로드 가능합니다');
    }

    // 파일 크기 확인 (100MB 제한)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      errors.push('파일 크기는 100MB를 초과할 수 없습니다');
    }

    // 빈 파일 확인
    if (file.size === 0) {
      errors.push('빈 파일은 업로드할 수 없습니다');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 파일 크기를 사람이 읽기 쉬운 형태로 변환
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 테스트 상태별 색상 정보
   */
  getTestStatusInfo(status, t = null) {
    const statusMap = {
      'PASSED': {
        label: t ? t('junit.stats.passed') : 'PASSED',
        translationKey: 'junit.stats.passed',
        color: 'success',
        icon: '✅',
        bgColor: '#e8f5e8'
      },
      'FAILED': {
        label: t ? t('junit.stats.failed') : 'FAILED',
        translationKey: 'junit.stats.failed',
        color: 'error',
        icon: '❌',
        bgColor: '#ffebee'
      },
      'ERROR': {
        label: t ? t('junit.stats.error') : 'ERROR',
        translationKey: 'junit.stats.error',
        color: 'warning',
        icon: '⚠️',
        bgColor: '#fff3e0'
      },
      'SKIPPED': {
        label: t ? t('junit.stats.skipped') : 'SKIPPED',
        translationKey: 'junit.stats.skipped',
        color: 'default',
        icon: '⏭️',
        bgColor: '#f5f5f5'
      },
      'UPLOADING': {
        label: t ? t('junit.status.uploading') : 'UPLOADING',
        translationKey: 'junit.status.uploading',
        color: 'info',
        icon: '⏳',
        bgColor: '#e3f2fd'
      },
      'PARSING': {
        label: t ? t('junit.status.parsing') : 'PARSING',
        translationKey: 'junit.status.parsing',
        color: 'info',
        icon: '🔄',
        bgColor: '#e3f2fd'
      },
      'COMPLETED': {
        label: t ? t('junit.status.completed') : 'COMPLETED',
        translationKey: 'junit.status.completed',
        color: 'success',
        icon: '✅',
        bgColor: '#e8f5e8'
      }
    };

    return statusMap[status] || {
      label: t ? t('junit.status.unknown') : 'UNKNOWN',
      translationKey: 'junit.status.unknown',
      color: 'default',
      icon: '❓',
      bgColor: '#f5f5f5'
    };
  }

  /**
   * 성공률에 따른 색상 결정
   */
  getSuccessRateColor(successRate) {
    if (successRate >= 95) return 'success';
    if (successRate >= 80) return 'warning';
    return 'error';
  }

  /**
   * 대용량 파일 처리 진행률 조회
   */
  async getProcessingProgress(testResultId) {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/${testResultId}/processing-progress`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`처리 진행률 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('처리 진행률 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 현재 활성화된 모든 처리 작업 조회
   */
  async getActiveProcessing() {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/active-processing`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`활성 처리 작업 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('활성 처리 작업 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 파일 크기 기반으로 대용량 파일 여부 판단
   */
  isLargeFile(file) {
    const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB
    return file.size > LARGE_FILE_THRESHOLD;
  }

  /**
   * 파일 처리 예상 시간 계산
   */
  estimateProcessingTime(fileSize) {
    const fileSizeMB = fileSize / (1024 * 1024);
    const estimatedSeconds = fileSizeMB * 3; // 1MB당 평균 3초

    if (estimatedSeconds < 60) {
      return `약 ${Math.ceil(estimatedSeconds)}초`;
    } else if (estimatedSeconds < 3600) {
      const minutes = Math.ceil(estimatedSeconds / 60);
      return `약 ${minutes}분`;
    } else {
      const hours = Math.floor(estimatedSeconds / 3600);
      const minutes = Math.ceil((estimatedSeconds % 3600) / 60);
      return `약 ${hours}시간 ${minutes}분`;
    }
  }

  /**
   * JUnit 테스트 케이스 편집
   */
  async updateTestCase(testCaseId, userTitle, userDescription, userNotes, userStatus, tags, priority, userId) {
    try {
      const requestBody = {
        userTitle,
        userDescription,
        userNotes,
        userStatus,
        tags,
        priority,
        userId
      };

      const response = await fetch(`${await this.getBaseUrl()}/cases/${testCaseId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `테스트 케이스 편집 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('테스트 케이스 편집 오류:', error);
      throw error;
    }
  }

  /**
   * 테스트 스위트별 케이스 목록 조회
   */
  async getTestCasesBySuite(testSuiteId, page = 0, size = 50) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const response = await fetch(`${await this.getBaseUrl()}/suites/${testSuiteId}/cases?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`테스트 케이스 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('테스트 케이스 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 실패한 테스트 케이스만 조회
   */
  async getFailedTestCases(testResultId) {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/${testResultId}/failed-cases`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`실패한 테스트 케이스 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('실패한 테스트 케이스 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 가장 느린 테스트 케이스 조회
   */
  async getSlowestTestCases(testResultId, limit = 10) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await fetch(`${await this.getBaseUrl()}/${testResultId}/slowest-cases?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`가장 느린 테스트 케이스 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('가장 느린 테스트 케이스 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 테스트 스위트 목록 조회
   */
  async getTestSuitesByResult(testResultId) {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/${testResultId}/suites`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`테스트 스위트 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('테스트 스위트 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 프로젝트별 JUnit 요약 통계 조회 (ICT-211)
   */
  async getProjectJunitSummary(projectId) {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/projects/${projectId}/summary`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // 프로젝트에 JUnit 결과가 없는 경우
          return {
            success: true,
            summary: {
              hasResults: false,
              totalResults: 0,
              latestSuccessRate: 0.0,
              averageSuccessRate: 0.0,
              lastExecutedAt: null,
              qualityGrade: 'NONE'
            }
          };
        }
        throw new Error(`프로젝트 JUnit 요약 통계 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('프로젝트 JUnit 요약 통계 조회 오류:', error);
      // 오류 발생 시 기본값 반환
      return {
        success: false,
        summary: {
          hasResults: false,
          totalResults: 0,
          latestSuccessRate: 0.0,
          averageSuccessRate: 0.0,
          lastExecutedAt: null,
          qualityGrade: 'UNKNOWN'
        }
      };
    }
  }

  /**
   * 여러 프로젝트의 JUnit 요약 통계 배치 조회 (ICT-211)
   */
  async getBatchProjectJunitSummary(projectIds) {
    try {
      const response = await fetch(`${await this.getBaseUrl()}/projects/batch-summary`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectIds),
      });

      if (!response.ok) {
        throw new Error(`배치 JUnit 요약 통계 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('배치 JUnit 요약 통계 조회 오류:', error);
      // 오류 발생 시 빈 결과 반환
      const defaultSummaries = {};
      projectIds.forEach(projectId => {
        defaultSummaries[projectId] = {
          hasResults: false,
          totalResults: 0,
          latestSuccessRate: 0.0,
          averageSuccessRate: 0.0,
          lastExecutedAt: null,
          qualityGrade: 'UNKNOWN'
        };
      });

      return {
        success: false,
        summaries: defaultSummaries,
        count: projectIds.length
      };
    }
  }

  /**
   * JUnit 품질 등급별 색상 및 라벨 정보 (ICT-211)
   */
  getQualityGradeInfo(qualityGrade) {
    switch (qualityGrade) {
      case 'EXCELLENT':
        return {
          color: 'success',
          bgColor: '#e8f5e8',
          textColor: '#2e7d32',
          label: '우수',
          description: '성공률 90% 이상'
        };
      case 'GOOD':
        return {
          color: 'warning',
          bgColor: '#fff8e1',
          textColor: '#f57c00',
          label: '양호',
          description: '성공률 70-90%'
        };
      case 'POOR':
        return {
          color: 'error',
          bgColor: '#ffebee',
          textColor: '#d32f2f',
          label: '개선필요',
          description: '성공률 70% 미만'
        };
      case 'NONE':
        return {
          color: 'default',
          bgColor: '#f5f5f5',
          textColor: '#757575',
          label: '결과없음',
          description: 'JUnit 결과 없음'
        };
      case 'UNKNOWN':
      default:
        return {
          color: 'default',
          bgColor: '#f5f5f5',
          textColor: '#757575',
          label: '미확인',
          description: '상태 확인 불가'
        };
    }
  }

  /**
   * 파일 크기 포맷팅 유틸리티
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const junitResultService = new JunitResultService();
export default junitResultService;