// src/hooks/useProjects.js
/**
 * 프로젝트 관련 React Query 훅들
 */

import { projectService } from '../services';
import { useQueryWithDefaults, useMutationWithDefaults, queryKeys, useInvalidateQueries } from './useReactQuery.js';

/**
 * 모든 프로젝트 조회
 */
export function useProjects() {
  return useQueryWithDefaults(
    queryKeys.projects,
    projectService.getProjects
  );
}

/**
 * 특정 프로젝트 조회
 */
export function useProject(projectId) {
  return useQueryWithDefaults(
    queryKeys.project(projectId),
    () => projectService.getProject(projectId),
    {
      enabled: !!projectId,
    }
  );
}

/**
 * 프로젝트 생성
 */
export function useCreateProject() {
  const { invalidateProjects } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    projectService.createProject,
    {
      onSuccess: () => {
        invalidateProjects();
      },
    }
  );
}

/**
 * 프로젝트 수정
 */
export function useUpdateProject() {
  const { invalidateProjects, invalidateProject } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    ({ projectId, ...data }) => projectService.updateProject(projectId, data),
    {
      onSuccess: (data, variables) => {
        invalidateProjects();
        invalidateProject(variables.projectId);
      },
    }
  );
}

/**
 * 프로젝트 삭제
 */
export function useDeleteProject() {
  const { invalidateProjects } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    ({ projectId, force = false }) => projectService.deleteProject(projectId, force),
    {
      onSuccess: () => {
        invalidateProjects();
      },
    }
  );
}