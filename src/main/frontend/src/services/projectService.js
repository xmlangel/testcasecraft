// src/services/projectService.js
/**
 * 프로젝트 관련 API 서비스
 */

import apiService from './apiService.js';

class ProjectService {
  /**
   * 모든 프로젝트 조회
   */
  async getProjects() {
    const response = await apiService.get('/api/projects');
    return response.json();
  }

  /**
   * 특정 프로젝트 조회
   */
  async getProject(projectId) {
    const response = await apiService.get(`/api/projects/${projectId}`);
    return response.json();
  }

  /**
   * 프로젝트 생성
   */
  async createProject(projectData) {
    const response = await apiService.post('/api/projects', projectData);
    return response.json();
  }

  /**
   * 프로젝트 수정
   */
  async updateProject(projectId, projectData) {
    const response = await apiService.put(`/api/projects/${projectId}`, projectData);
    return response.json();
  }

  /**
   * 프로젝트 삭제
   */
  async deleteProject(projectId, force = false) {
    const endpoint = force 
      ? `/api/projects/${projectId}?force=true`
      : `/api/projects/${projectId}`;
    
    const response = await apiService.delete(endpoint);
    return response.ok;
  }
}

export default new ProjectService();