// src/models/demoProjectData.js
// 프로젝트 관리를 위한 더미 데이터

export const demoProjectsData = [
  // 조직 프로젝트들
  {
    id: 'PROJ001',
    name: '모바일 앱 테스트 프로젝트',
    code: 'MOBILE-TEST',
    description: 'iOS/Android 앱 테스트케이스 관리',
    testCaseCount: 156,
    memberCount: 4,
    displayOrder: 1,
    organization: {
      id: 'ORG001',
      name: 'QA팀'
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'PROJ002',
    name: '웹 사이트 테스트',
    code: 'WEB-TEST',
    description: '반응형 웹사이트 테스트 프로젝트',
    testCaseCount: 89,
    memberCount: 3,
    displayOrder: 2,
    organization: {
      id: 'ORG001',
      name: 'QA팀'
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },
  {
    id: 'PROJ003',
    name: 'API 서버 개발',
    code: 'API-DEV',
    description: 'RESTful API 서버 개발 프로젝트',
    testCaseCount: 234,
    memberCount: 8,
    displayOrder: 1,
    organization: {
      id: 'ORG002',
      name: '개발팀'
    },
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-12-05T00:00:00Z'
  },
  {
    id: 'PROJ004',
    name: '프론트엔드 리뉴얼',
    code: 'FRONTEND-V2',
    description: 'React 기반 프론트엔드 전면 개편',
    testCaseCount: 178,
    memberCount: 6,
    displayOrder: 2,
    organization: {
      id: 'ORG002',
      name: '개발팀'
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-12-10T00:00:00Z'
  },
  {
    id: 'PROJ005',
    name: '인프라 자동화',
    code: 'INFRA-AUTO',
    description: 'Docker/Kubernetes 기반 인프라 자동화',
    testCaseCount: 67,
    memberCount: 4,
    displayOrder: 1,
    organization: {
      id: 'ORG003',
      name: '데브옵스팀'
    },
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-11-30T00:00:00Z'
  },
  
  // 독립 프로젝트들 (조직에 속하지 않음)
  {
    id: 'PROJ006',
    name: '개인 포트폴리오',
    code: 'PORTFOLIO',
    description: '개인 개발자 포트폴리오 사이트',
    testCaseCount: 23,
    memberCount: 1,
    displayOrder: 1,
    organization: null,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'PROJ007',
    name: '오픈소스 라이브러리',
    code: 'OPENSOURCE',
    description: 'JavaScript 유틸리티 라이브러리',
    testCaseCount: 45,
    memberCount: 2,
    displayOrder: 2,
    organization: null,
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-12-05T00:00:00Z'
  },
  {
    id: 'PROJ008',
    name: '실험적 프로젝트',
    code: 'EXPERIMENT',
    description: '새로운 기술 스택 실험 프로젝트',
    testCaseCount: 12,
    memberCount: 1,
    displayOrder: 3,
    organization: null,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-11-25T00:00:00Z'
  }
];

// 프로젝트 조회 헬퍼 함수들
export const projectHelpers = {
  // 모든 프로젝트 조회
  getAllProjects: () => {
    return demoProjectsData;
  },

  // 프로젝트 ID로 조회
  getProjectById: (projectId) => {
    return demoProjectsData.find(project => project.id === projectId);
  },

  // 조직별 프로젝트 조회
  getProjectsByOrganization: (organizationId) => {
    if (!organizationId) {
      return demoProjectsData.filter(project => !project.organization);
    }
    return demoProjectsData.filter(project => project.organization?.id === organizationId);
  },

  // 독립 프로젝트 조회
  getIndependentProjects: () => {
    return demoProjectsData.filter(project => !project.organization);
  },

  // 프로젝트 통계
  getProjectStats: () => {
    const total = demoProjectsData.length;
    const withOrganization = demoProjectsData.filter(p => p.organization).length;
    const independent = total - withOrganization;
    const totalTestCases = demoProjectsData.reduce((sum, p) => sum + p.testCaseCount, 0);
    const totalMembers = demoProjectsData.reduce((sum, p) => sum + p.memberCount, 0);

    return {
      total,
      withOrganization,
      independent,
      totalTestCases,
      totalMembers
    };
  }
};

export default demoProjectsData;