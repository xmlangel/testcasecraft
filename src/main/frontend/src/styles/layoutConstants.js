// src/styles/layoutConstants.js
// ICT-272: 전체 애플리케이션 표준 레이아웃 패턴

/**
 * 표준 컨테이너 maxWidth 설정
 * ICT-180에서 검증된 최적의 화면 활용도를 기반으로 정의
 */
export const STANDARD_MAX_WIDTH = {
  xs: "100%",
  sm: "100%",
  md: "1600px",
  lg: "1900px",
  xl: "98vw"
};

/**
 * 페이지별 컨테이너 스타일 템플릿
 */
export const PAGE_CONTAINER_SX = {
  // 메인 페이지 컨테이너 (Dashboard, ProjectManager 등)
  main: {
    maxWidth: STANDARD_MAX_WIDTH,
    mx: "auto",
    p: 2,
    bgcolor: "background.default",
    minHeight: "calc(100vh - 64px)" // AppBar 높이 제외
  },

  // 폼 페이지 컨테이너 (TestExecutionForm, TestPlanForm 등)
  form: {
    maxWidth: STANDARD_MAX_WIDTH,
    mx: "auto",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 1,
    p: 3,
    mt: 2,
    mb: 2
  },

  // 다이얼로그 내부 컨테이너
  dialog: {
    maxWidth: "100%",
    p: 2
  },

  // 카드/Paper 컨테이너
  card: {
    maxWidth: "100%",
    p: 2,
    borderRadius: 2,
    elevation: 1
  }
};

/**
 * 표준 Grid 설정
 */
export const GRID_SETTINGS = {
  // 메인 콘텐츠 영역
  mainContent: {
    container: true,
    spacing: 3,
    sx: { mt: 1 }
  },

  // 폼 영역  
  formContent: {
    container: true,
    spacing: 2
  },

  // 대시보드 카드 그리드
  dashboardCards: {
    container: true,
    spacing: 3,
    sx: { mt: 2 }
  }
};

/**
 * 반응형 브레이크포인트별 설정
 * MUI Grid v2: size={{ xs: ..., md: ... }} 구문 사용
 */
export const RESPONSIVE_SETTINGS = {
  // 사이드바가 있는 레이아웃
  withSidebar: {
    size: {
      xs: 12,
      md: 8,
      lg: 9,
      xl: 10
    }
  },

  // 전체 폭 사용하는 레이아웃  
  fullWidth: {
    size: {
      xs: 12
    }
  },

  // 절반 폭 사용하는 레이아웃
  halfWidth: {
    size: {
      xs: 12,
      md: 6
    }
  },

  // 1/3 폭 사용하는 레이아웃
  thirdWidth: {
    size: {
      xs: 12,
      sm: 6,
      md: 4
    }
  }
};

/**
 * 공통 스타일 유틸리티
 */
export const LAYOUT_UTILS = {
  // 중앙 정렬 컨테이너
  centerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px"
  },

  // 플렉스 헤더 (제목 + 액션 버튼)
  flexHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2
  },

  // 스크롤 가능한 콘텐츠
  scrollableContent: {
    maxHeight: "70vh",
    overflowY: "auto",
    overflowX: "hidden"
  }
};