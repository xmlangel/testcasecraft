// src/models/demoOrganizationData.js
// 조직 관리 시스템을 위한 더미 데이터

export const demoOrganizationsData = {
  organizations: [
    {
      id: 'ORG001',
      name: 'QA팀',
      description: '품질 보증 및 테스트 전담 조직',
      memberCount: 12,
      projectCount: 5,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01'),
      ownerId: 'user1',
      members: [
        {
          id: 'user1',
          name: '김테스터',
          email: 'kim.tester@company.com',
          role: 'OWNER',
          avatar: 'K',
          joinedAt: new Date('2024-01-15')
        },
        {
          id: 'user2',
          name: '이매니저',
          email: 'lee.manager@company.com',
          role: 'ADMIN',
          avatar: 'L',
          joinedAt: new Date('2024-02-01')
        },
        {
          id: 'user3',
          name: '박개발',
          email: 'park.developer@company.com',
          role: 'MEMBER',
          avatar: 'P',
          joinedAt: new Date('2024-03-10')
        },
        {
          id: 'user4',
          name: '최분석가',
          email: 'choi.analyst@company.com',
          role: 'MEMBER',
          avatar: 'C',
          joinedAt: new Date('2024-04-15')
        }
      ],
      groups: [
        {
          id: 'group1',
          name: '모바일 테스트팀',
          description: '모바일 앱 테스트 전담 그룹',
          memberCount: 4,
          members: ['user1', 'user3']
        },
        {
          id: 'group2',
          name: '웹 테스트팀',
          description: '웹 애플리케이션 테스트 전담 그룹',
          memberCount: 3,
          members: ['user2', 'user4']
        }
      ]
    },
    {
      id: 'ORG002',
      name: '개발팀',
      description: '제품 개발 및 기술 혁신을 담당하는 조직',
      memberCount: 25,
      projectCount: 8,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-11-28'),
      ownerId: 'user5',
      members: [
        {
          id: 'user5',
          name: '정아키텍트',
          email: 'jung.architect@company.com',
          role: 'OWNER',
          avatar: 'J',
          joinedAt: new Date('2024-01-10')
        },
        {
          id: 'user6',
          name: '홍리더',
          email: 'hong.leader@company.com',
          role: 'ADMIN',
          avatar: 'H',
          joinedAt: new Date('2024-01-20')
        },
        {
          id: 'user7',
          name: '강개발',
          email: 'kang.developer@company.com',
          role: 'MEMBER',
          avatar: 'K',
          joinedAt: new Date('2024-02-15')
        }
      ],
      groups: [
        {
          id: 'group3',
          name: '프론트엔드팀',
          description: '사용자 인터페이스 개발 그룹',
          memberCount: 8,
          members: ['user6', 'user7']
        },
        {
          id: 'group4',
          name: '백엔드팀',
          description: '서버 및 API 개발 그룹',
          memberCount: 10,
          members: ['user5']
        }
      ]
    },
    {
      id: 'ORG003',
      name: '데브옵스팀',
      description: 'CI/CD 및 인프라 운영 전담 조직',
      memberCount: 8,
      projectCount: 3,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-12-05'),
      ownerId: 'user8',
      members: [
        {
          id: 'user8',
          name: '윤옵스',
          email: 'yoon.ops@company.com',
          role: 'OWNER',
          avatar: 'Y',
          joinedAt: new Date('2024-02-01')
        },
        {
          id: 'user9',
          name: '임인프라',
          email: 'lim.infra@company.com',
          role: 'ADMIN',
          avatar: 'I',
          joinedAt: new Date('2024-02-10')
        }
      ],
      groups: [
        {
          id: 'group5',
          name: 'CI/CD팀',
          description: '지속적 통합 및 배포 그룹',
          memberCount: 4,
          members: ['user8', 'user9']
        }
      ]
    }
  ],

  // 조직 프로젝트 관계 데이터
  organizationProjects: {
    'ORG001': [
      {
        id: 'PROJ001',
        name: '모바일 앱 테스트 프로젝트',
        code: 'MOBILE-TEST',
        description: 'iOS/Android 앱 테스트케이스 관리',
        testCaseCount: 156,
        memberCount: 4,
        status: 'ACTIVE',
        organizationId: 'ORG001'
      },
      {
        id: 'PROJ002',
        name: '웹 사이트 테스트',
        code: 'WEB-TEST',
        description: '반응형 웹사이트 테스트 프로젝트',
        testCaseCount: 89,
        memberCount: 3,
        status: 'ACTIVE',
        organizationId: 'ORG001'
      }
    ],
    'ORG002': [
      {
        id: 'PROJ003',
        name: 'API 서버 개발',
        code: 'API-DEV',
        description: 'RESTful API 서버 개발 프로젝트',
        testCaseCount: 234,
        memberCount: 8,
        status: 'ACTIVE',
        organizationId: 'ORG002'
      },
      {
        id: 'PROJ004',
        name: '프론트엔드 리뉴얼',
        code: 'FRONTEND-V2',
        description: 'React 기반 프론트엔드 전면 개편',
        testCaseCount: 178,
        memberCount: 6,
        status: 'ACTIVE',
        organizationId: 'ORG002'
      }
    ],
    'ORG003': [
      {
        id: 'PROJ005',
        name: '인프라 자동화',
        code: 'INFRA-AUTO',
        description: 'Docker/Kubernetes 기반 인프라 자동화',
        testCaseCount: 67,
        memberCount: 4,
        status: 'ACTIVE',
        organizationId: 'ORG003'
      }
    ]
  },

  // 독립 프로젝트 (조직에 속하지 않음)
  independentProjects: [
    {
      id: 'PROJ006',
      name: '개인 포트폴리오',
      code: 'PORTFOLIO',
      description: '개인 개발자 포트폴리오 사이트',
      testCaseCount: 23,
      memberCount: 1,
      status: 'ACTIVE',
      organizationId: null
    },
    {
      id: 'PROJ007',
      name: '오픈소스 라이브러리',
      code: 'OPENSOURCE',
      description: 'JavaScript 유틸리티 라이브러리',
      testCaseCount: 45,
      memberCount: 2,
      status: 'ACTIVE',
      organizationId: null
    }
  ],

  // 조직별 활동 통계
  organizationStats: {
    'ORG001': {
      totalTestCases: 245,
      completedTests: 198,
      failedTests: 32,
      blockedTests: 15,
      monthlyActivity: [
        { month: '1월', tests: 45, projects: 2 },
        { month: '2월', tests: 67, projects: 2 },
        { month: '3월', tests: 89, projects: 2 },
        { month: '4월', tests: 123, projects: 2 },
        { month: '5월', tests: 145, projects: 2 },
        { month: '6월', tests: 167, projects: 2 }
      ]
    },
    'ORG002': {
      totalTestCases: 412,
      completedTests: 356,
      failedTests: 43,
      blockedTests: 13,
      monthlyActivity: [
        { month: '1월', tests: 78, projects: 3 },
        { month: '2월', tests: 112, projects: 3 },
        { month: '3월', tests: 145, projects: 3 },
        { month: '4월', tests: 189, projects: 4 },
        { month: '5월', tests: 234, projects: 4 },
        { month: '6월', tests: 267, projects: 4 }
      ]
    },
    'ORG003': {
      totalTestCases: 67,
      completedTests: 58,
      failedTests: 6,
      blockedTests: 3,
      monthlyActivity: [
        { month: '1월', tests: 12, projects: 1 },
        { month: '2월', tests: 23, projects: 1 },
        { month: '3월', tests: 34, projects: 1 },
        { month: '4월', tests: 45, projects: 2 },
        { month: '5월', tests: 56, projects: 2 },
        { month: '6월', tests: 67, projects: 3 }
      ]
    }
  },

  // 최근 활동 로그 - 제거됨 (실제 API 연동 없음)

  // 멤버 활동도 순위
  memberActivityRanking: [
    {
      userId: 'user1',
      name: '김테스터',
      avatar: 'K',
      organizationName: 'QA팀',
      testsCompleted: 89,
      projectsInvolved: 3,
      lastActivity: new Date(Date.now() - 1000 * 60 * 15),
      score: 95
    },
    {
      userId: 'user5',
      name: '정아키텍트',
      avatar: 'J',
      organizationName: '개발팀',
      testsCompleted: 67,
      projectsInvolved: 5,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
      score: 87
    },
    {
      userId: 'user2',
      name: '이매니저',
      avatar: 'L',
      organizationName: 'QA팀',
      testsCompleted: 56,
      projectsInvolved: 4,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 4),
      score: 78
    },
    {
      userId: 'user6',
      name: '홍리더',
      avatar: 'H',
      organizationName: '개발팀',
      testsCompleted: 45,
      projectsInvolved: 3,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6),
      score: 72
    },
    {
      userId: 'user8',
      name: '윤옵스',
      avatar: 'Y',
      organizationName: '데브옵스팀',
      testsCompleted: 34,
      projectsInvolved: 2,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 12),
      score: 65
    }
  ]
};

// 조직 데이터 조회 헬퍼 함수들
export const organizationHelpers = {
  // 조직 ID로 조직 정보 조회
  getOrganizationById: (organizationId) => {
    return demoOrganizationsData.organizations.find(org => org.id === organizationId);
  },

  // 조직에 속한 프로젝트 목록 조회
  getProjectsByOrganization: (organizationId) => {
    return demoOrganizationsData.organizationProjects[organizationId] || [];
  },

  // 독립 프로젝트 목록 조회
  getIndependentProjects: () => {
    return demoOrganizationsData.independentProjects;
  },

  // 전체 프로젝트 목록 조회 (조직 + 독립)
  getAllProjects: () => {
    const orgProjects = Object.values(demoOrganizationsData.organizationProjects).flat();
    const independentProjects = demoOrganizationsData.independentProjects;
    return [...orgProjects, ...independentProjects];
  },

  // 조직별 통계 조회
  getOrganizationStats: (organizationId) => {
    return demoOrganizationsData.organizationStats[organizationId];
  },

  // 최근 활동 조회 - 제거됨 (실제 API 연동 없음)
  getRecentActivities: (organizationId = null, limit = 10) => {
    return []; // 빈 배열 반환
  },

  // 멤버 활동도 순위 조회
  getMemberActivityRanking: (organizationId = null, limit = 5) => {
    let ranking = demoOrganizationsData.memberActivityRanking;
    
    if (organizationId) {
      const org = demoOrganizationsData.organizations.find(o => o.id === organizationId);
      if (org) {
        const memberIds = org.members.map(m => m.id);
        ranking = ranking.filter(member => memberIds.includes(member.userId));
      }
    }
    
    return ranking
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // 전체 통계 요약
  getOverallStats: () => {
    const organizations = demoOrganizationsData.organizations;
    const allProjects = organizationHelpers.getAllProjects();
    
    const totalMembers = organizations.reduce((sum, org) => sum + org.memberCount, 0);
    const totalTestCases = allProjects.reduce((sum, proj) => sum + proj.testCaseCount, 0);
    
    // 조직별 테스트 결과 통계 집계
    const allStats = Object.values(demoOrganizationsData.organizationStats);
    const totalCompleted = allStats.reduce((sum, stat) => sum + stat.completedTests, 0);
    const totalFailed = allStats.reduce((sum, stat) => sum + stat.failedTests, 0);
    const totalBlocked = allStats.reduce((sum, stat) => sum + stat.blockedTests, 0);
    const totalNotRun = totalTestCases - totalCompleted - totalFailed - totalBlocked;
    
    return {
      totalOrganizations: organizations.length,
      totalProjects: allProjects.length,
      totalMembers,
      totalTestCases,
      testResults: {
        completed: totalCompleted,
        failed: totalFailed,
        blocked: totalBlocked,
        notRun: Math.max(0, totalNotRun)
      }
    };
  }
};

export default demoOrganizationsData;