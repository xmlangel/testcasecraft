// src/services/requirementService.js
/**
 * 요구사항 관리 API 서비스 (요구사항 문서·요구사항·TC 연결·커버리지·리포트)
 */

import apiService from "./apiService.js";

class RequirementService {
  async getSpecs(projectId) {
    const response = await apiService.get(
      `/api/projects/${projectId}/requirement-specs`,
    );
    return response.json();
  }

  async getNextSpecDocId(projectId) {
    const response = await apiService.get(
      `/api/projects/${projectId}/requirement-specs/next-doc-id`,
    );
    return (await response.json()).docId;
  }

  async createSpec(spec) {
    const response = await apiService.post("/api/requirement-specs", spec);
    return response.json();
  }

  async updateSpec(specId, spec) {
    const response = await apiService.put(
      `/api/requirement-specs/${specId}`,
      spec,
    );
    return response.json();
  }

  async deleteSpec(specId) {
    const response = await apiService.delete(
      `/api/requirement-specs/${specId}`,
    );
    return response.ok;
  }

  async getRequirements(projectId) {
    const response = await apiService.get(
      `/api/projects/${projectId}/requirements`,
    );
    return response.json();
  }

  async getNextRequirementDocId(specId) {
    const response = await apiService.get(
      `/api/requirement-specs/${specId}/next-requirement-doc-id`,
    );
    return (await response.json()).docId;
  }

  async createRequirement(requirement) {
    const response = await apiService.post("/api/requirements", requirement);
    return response.json();
  }

  async updateRequirement(requirementId, requirement) {
    const response = await apiService.put(
      `/api/requirements/${requirementId}`,
      requirement,
    );
    return response.json();
  }

  async deleteRequirement(requirementId) {
    const response = await apiService.delete(
      `/api/requirements/${requirementId}`,
    );
    return response.ok;
  }

  async addTestCases(requirementId, testCaseIds) {
    const response = await apiService.post(
      `/api/requirements/${requirementId}/test-cases`,
      { ids: testCaseIds },
    );
    return response.json();
  }

  async removeTestCase(requirementId, testCaseId) {
    const response = await apiService.delete(
      `/api/requirements/${requirementId}/test-cases/${testCaseId}`,
    );
    return response.json();
  }

  async getRequirementsForTestCase(testCaseId) {
    const response = await apiService.get(
      `/api/requirements/by-test-case/${testCaseId}`,
    );
    return response.json();
  }

  async replaceRequirementsForTestCase(testCaseId, requirementIds) {
    const response = await apiService.put(
      `/api/requirements/by-test-case/${testCaseId}`,
      { ids: requirementIds },
    );
    return response.json();
  }

  async getProjectRelations(projectId) {
    const response = await apiService.get(
      `/api/projects/${projectId}/requirement-relations`,
    );
    return response.json();
  }

  async getRelations(requirementId) {
    const response = await apiService.get(
      `/api/requirements/${requirementId}/relations`,
    );
    return response.json();
  }

  async addRelation(sourceId, targetId, type) {
    const response = await apiService.post(
      `/api/requirements/${sourceId}/relations`,
      { targetId, type },
    );
    return response.json();
  }

  async deleteRelation(relationId) {
    const response = await apiService.delete(
      `/api/requirement-relations/${relationId}`,
    );
    return response.ok;
  }

  async getCoverage(projectId) {
    const response = await apiService.get(
      `/api/projects/${projectId}/requirements/coverage`,
    );
    return response.json();
  }

  async getReport(projectId, { testPlanId, executionId } = {}) {
    const params = new URLSearchParams();
    if (testPlanId) params.set("testPlanId", testPlanId);
    if (executionId) params.set("executionId", executionId);
    const response = await apiService.get(
      `/api/projects/${projectId}/requirements/report?${params.toString()}`,
    );
    return response.json();
  }
}

export default new RequirementService();
